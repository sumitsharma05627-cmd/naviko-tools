// Cloudflare Pages Functions & Workers Catch-all API Handler
// Native 100% Cloudflare edge backend for NAVIKO (Option A).
// Handles all /api/* routes directly on Cloudflare Edge with zero external servers required.

export interface Env {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  [key: string]: any;
}

// In-memory edge stores for serverless lifecycle
const edgeUsers: Record<string, any> = {};
const edgeSessions: Record<string, any> = {};
const edgeSubscriptions: Record<string, any> = {};
const edgeRecentTools: Record<string, any[]> = {};
const edgeProcessedEvents = new Set<string>();

// Helper: Standard CORS & JSON response
function jsonResponse(data: any, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...extraHeaders,
    },
  });
}

// Helper: Verify HMAC-SHA256 with Web Crypto
async function verifyHmacSha256(secret: string, data: string, expectedHex: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    const hex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hex.toLowerCase() === expectedHex.trim().toLowerCase();
  } catch (err) {
    console.error('HMAC verification error:', err);
    return false;
  }
}

// Helper: Simple password hash with SHA-256 + salt (Web Crypto)
async function hashEdgePassword(password: string, saltHex?: string): Promise<{ salt: string; hash: string }> {
  const enc = new TextEncoder();
  const salt = saltHex || Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  
  const saltedPassword = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  
  return { salt, hash };
}

// Helper: Extract session user from Request
function getEdgeUser(request: Request): any | null {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  const session = edgeSessions[token];
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    delete edgeSessions[token];
    return null;
  }
  return edgeUsers[session.userId] || null;
}

// Pre-seed test user if empty
async function initSeedUsers() {
  if (!edgeUsers['usr_demo_test']) {
    const { salt, hash } = await hashEdgePassword('Password123!', 'demo_salt_naviko_123');
    edgeUsers['usr_demo_test'] = {
      id: 'usr_demo_test',
      name: 'Test Account',
      email: 'test@example.com',
      salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recentTools: [],
    };
  }
}

// Main Request Handler for Cloudflare Pages Functions & Workers
export async function onRequest(context: {
  request: Request;
  env: Env;
  params?: { path?: string | string[] };
  waitUntil?: (promise: Promise<any>) => void;
  next?: () => Promise<Response>;
}): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const rawPath = url.pathname;
  const cleanPath = rawPath.replace(/\/+$/, '') || '/';
  const isPath = (target: string) => cleanPath === target || cleanPath === `${target}/`;

  // 1. Handle CORS Preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 2. Native Cloudflare Edge API Implementation
  await initSeedUsers();

  const keyId = env.RAZORPAY_KEY_ID || (typeof process !== 'undefined' && (process as any)?.env?.RAZORPAY_KEY_ID) || '';
  const keySecret = env.RAZORPAY_KEY_SECRET || (typeof process !== 'undefined' && (process as any)?.env?.RAZORPAY_KEY_SECRET) || '';
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || (typeof process !== 'undefined' && (process as any)?.env?.RAZORPAY_WEBHOOK_SECRET) || '';
  const isConfigured = !!(keyId && keySecret);

  // --- GET /api or GET /api/ ---
  if ((cleanPath === '/api' || cleanPath === '/api/') && method === 'GET') {
    return jsonResponse({
      status: 'ok',
      service: 'NAVIKO Edge API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      razorpayConfigured: isConfigured,
      platform: 'cloudflare-native-edge',
    });
  }

  // --- GET /api/health ---
  if (isPath('/api/health') && method === 'GET') {
    return jsonResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      razorpayConfigured: isConfigured,
      platform: 'cloudflare-native-edge',
    });
  }

  // --- GET /api/subscription/config ---
  if (isPath('/api/subscription/config') && method === 'GET') {
    return jsonResponse({
      keyId,
      isConfigured,
      isTestKey: keyId.startsWith('rzp_test_'),
    });
  }

  // --- GET /api/subscription/status ---
  if (isPath('/api/subscription/status') && method === 'GET') {
    const authUser = getEdgeUser(request);
    const queryUserId = url.searchParams.get('userId') || request.headers.get('x-user-id');
    const userId = authUser ? authUser.id : queryUserId;

    if (!userId) {
      return jsonResponse({
        status: 'FREE',
        plan: 'free',
        hasActiveSubscription: false,
        isTrial: false,
        trialUsed: false,
        trialStartAt: null,
        trialEndsAt: null,
        remainingTrialDays: 0,
        remainingTrialHours: 0,
        startDate: null,
        renewalDate: null,
        billingInterval: 'yearly',
      });
    }

    const sub = edgeSubscriptions[userId];
    const now = new Date();

    if (sub?.status === 'TRIAL_ACTIVE' && sub.trialEndsAt) {
      const trialEnds = new Date(sub.trialEndsAt);
      const diffMs = trialEnds.getTime() - now.getTime();

      if (diffMs > 0) {
        const remainingTrialDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const remainingTrialHours = Math.ceil(diffMs / (1000 * 60 * 60));
        return jsonResponse({
          status: 'TRIAL_ACTIVE',
          plan: 'pro',
          hasActiveSubscription: true,
          isTrial: true,
          trialUsed: true,
          trialStartAt: sub.trialStartAt,
          trialEndsAt: sub.trialEndsAt,
          remainingTrialDays,
          remainingTrialHours,
          startDate: sub.startDate,
          renewalDate: sub.renewalDate,
          billingInterval: 'trial',
        });
      } else {
        sub.status = 'FREE';
        sub.plan = 'free';
        return jsonResponse({
          status: 'FREE',
          plan: 'free',
          hasActiveSubscription: false,
          isTrial: false,
          trialUsed: true,
          trialStartAt: sub.trialStartAt,
          trialEndsAt: sub.trialEndsAt,
          remainingTrialDays: 0,
          remainingTrialHours: 0,
          startDate: sub.startDate,
          renewalDate: sub.renewalDate,
          billingInterval: 'yearly',
        });
      }
    }

    if (sub?.status === 'ACTIVE') {
      return jsonResponse({
        status: 'ACTIVE',
        plan: sub.plan || 'pro',
        hasActiveSubscription: true,
        isTrial: false,
        trialUsed: !!sub.trialUsed,
        trialStartAt: sub.trialStartAt || null,
        trialEndsAt: sub.trialEndsAt || null,
        remainingTrialDays: 0,
        remainingTrialHours: 0,
        startDate: sub.startDate || null,
        renewalDate: sub.renewalDate || null,
        billingInterval: sub.billingInterval || 'yearly',
      });
    }

    return jsonResponse({
      status: sub ? sub.status : 'FREE',
      plan: 'free',
      hasActiveSubscription: false,
      isTrial: false,
      trialUsed: !!sub?.trialUsed,
      trialStartAt: sub?.trialStartAt || null,
      trialEndsAt: sub?.trialEndsAt || null,
      remainingTrialDays: 0,
      remainingTrialHours: 0,
      startDate: null,
      renewalDate: null,
      billingInterval: 'yearly',
    });
  }

  // --- POST /api/subscription/create-trial-order ---
  if (isPath('/api/subscription/create-trial-order') && method === 'POST') {
    try {
      const authUser = getEdgeUser(request);
      const body = await request.json().catch(() => ({}));
      const { customerEmail: clientEmail, customerName, userId: clientUserId } = body;
      const userId = authUser ? authUser.id : clientUserId;
      const customerEmail = authUser ? authUser.email : clientEmail;

      if (!userId || typeof userId !== 'string') {
        return jsonResponse({ success: false, error: 'User identifier (userId) is required.' }, 400);
      }

      const existing = edgeSubscriptions[userId];
      if (existing?.trialUsed || existing?.status === 'TRIAL_ACTIVE') {
        return jsonResponse({
          success: false,
          error: 'Your ₹1 trial has already been used.',
          trialUsed: true,
        }, 400);
      }

      if (!keyId || !keySecret) {
        return jsonResponse({
          success: false,
          error: 'Razorpay credentials are not configured on Cloudflare. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Cloudflare settings.',
        }, 503);
      }

      // Create Razorpay Order for ₹1 (100 paise) via official Razorpay API
      const credentials = btoa(`${keyId}:${keySecret}`);
      const orderPayload = {
        amount: 100, // ₹1 = 100 paise
        currency: 'INR',
        receipt: `trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        notes: {
          userId,
          isTrial: 'true',
          plan: 'pro',
          tier: 'pro',
          customerEmail: customerEmail || 'guest@naviko.in',
          customerName: customerName || 'NAVIKO Member',
        },
      };

      const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!razorpayRes.ok) {
        const errText = await razorpayRes.text();
        console.error('Razorpay trial order creation failed:', errText);
        return jsonResponse({ success: false, error: 'Failed to create trial order with payment gateway.' }, 502);
      }

      const orderData: any = await razorpayRes.json();
      return jsonResponse({
        success: true,
        orderId: orderData.id,
        amount: 100,
        currency: 'INR',
        keyId,
        trialDays: 7,
        isTrial: true,
      });
    } catch (err: any) {
      console.error('Error creating trial order:', err);
      return jsonResponse({ success: false, error: err?.message || 'Failed to create trial order.' }, 500);
    }
  }

  // --- POST /api/subscription/verify-trial-payment ---
  if (isPath('/api/subscription/verify-trial-payment') && method === 'POST') {
    try {
      const authUser = getEdgeUser(request);
      const body = await request.json().catch(() => ({}));
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId: clientUserId,
      } = body;

      const userId = authUser ? authUser.id : clientUserId;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
        return jsonResponse({ success: false, error: 'Missing required payment verification parameters.' }, 400);
      }

      if (!keySecret) {
        return jsonResponse({ success: false, error: 'Server payment secret not configured.' }, 503);
      }

      // Verify HMAC-SHA256 signature
      const signData = `${razorpay_order_id}|${razorpay_payment_id}`;
      const isValid = await verifyHmacSha256(keySecret, signData, razorpay_signature);

      if (!isValid) {
        return jsonResponse({ success: false, error: 'Invalid payment signature. Verification failed.' }, 400);
      }

      const now = new Date();
      const trialStartAt = now.toISOString();
      const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      edgeSubscriptions[userId] = {
        userId,
        status: 'TRIAL_ACTIVE',
        plan: 'pro',
        currency: 'INR',
        amount: 1,
        startDate: trialStartAt,
        renewalDate: trialEndsAt,
        trialStartAt,
        trialEndsAt,
        trialUsed: true,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        updatedAt: trialStartAt,
      };

      return jsonResponse({
        success: true,
        message: 'Your 7-Day NAVIKO Pro Trial has been successfully activated!',
        status: 'TRIAL_ACTIVE',
        plan: 'pro',
        trialEndsAt,
        remainingTrialDays: 7,
      });
    } catch (err: any) {
      console.error('Error verifying trial payment:', err);
      return jsonResponse({ success: false, error: 'Failed to verify trial payment.' }, 500);
    }
  }

  // --- POST /api/subscription/create-order ---
  if (isPath('/api/subscription/create-order') && method === 'POST') {
    try {
      const authUser = getEdgeUser(request);
      const body = await request.json().catch(() => ({}));
      const { tier, interval, customerEmail: clientEmail, customerName, userId: clientUserId } = body;
      const userId = authUser ? authUser.id : clientUserId;
      const customerEmail = authUser ? authUser.email : clientEmail;

      if (!userId) {
        return jsonResponse({ success: false, error: 'User identifier is required.' }, 400);
      }

      if (!keyId || !keySecret) {
        return jsonResponse({
          success: false,
          error: 'Razorpay credentials not configured.',
        }, 503);
      }

      // Pricing amounts in paise: Plus Monthly: ₹199, Pro Monthly: ₹499, Plus Yearly: ₹1990, Pro Yearly: ₹4990
      let amountPaise = 49900;
      if (tier === 'plus') {
        amountPaise = interval === 'yearly' ? 199000 : 19900;
      } else {
        amountPaise = interval === 'yearly' ? 499000 : 49900;
      }

      const credentials = btoa(`${keyId}:${keySecret}`);
      const orderPayload = {
        amount: amountPaise,
        currency: 'INR',
        receipt: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        notes: {
          userId,
          tier: tier || 'pro',
          interval: interval || 'yearly',
          customerEmail: customerEmail || 'guest@naviko.in',
          customerName: customerName || 'NAVIKO Member',
        },
      };

      const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!razorpayRes.ok) {
        const errText = await razorpayRes.text();
        return jsonResponse({ success: false, error: 'Failed to create order with Razorpay.' }, 502);
      }

      const orderData: any = await razorpayRes.json();
      return jsonResponse({
        success: true,
        orderId: orderData.id,
        amount: amountPaise,
        currency: 'INR',
        keyId,
      });
    } catch (err: any) {
      return jsonResponse({ success: false, error: 'Failed to create order.' }, 500);
    }
  }

  // --- POST /api/subscription/verify-payment ---
  if (isPath('/api/subscription/verify-payment') && method === 'POST') {
    try {
      const authUser = getEdgeUser(request);
      const body = await request.json().catch(() => ({}));
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        tier = 'pro',
        interval = 'yearly',
        userId: clientUserId,
      } = body;

      const userId = authUser ? authUser.id : clientUserId;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
        return jsonResponse({ success: false, error: 'Missing required parameters.' }, 400);
      }

      if (!keySecret) {
        return jsonResponse({ success: false, error: 'Server secret missing.' }, 503);
      }

      const signData = `${razorpay_order_id}|${razorpay_payment_id}`;
      const isValid = await verifyHmacSha256(keySecret, signData, razorpay_signature);

      if (!isValid) {
        return jsonResponse({ success: false, error: 'Invalid payment signature.' }, 400);
      }

      const now = new Date();
      const renewalDate = new Date(
        interval === 'monthly'
          ? now.getTime() + 30 * 24 * 60 * 60 * 1000
          : now.getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();

      edgeSubscriptions[userId] = {
        userId,
        status: 'ACTIVE',
        plan: tier,
        billingInterval: interval,
        startDate: now.toISOString(),
        renewalDate,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        updatedAt: now.toISOString(),
      };

      return jsonResponse({
        success: true,
        message: 'Subscription activated successfully.',
        status: 'ACTIVE',
        plan: tier,
        renewalDate,
      });
    } catch (err: any) {
      return jsonResponse({ success: false, error: 'Verification failed.' }, 500);
    }
  }

  // --- POST /api/subscription/cancel ---
  if (isPath('/api/subscription/cancel') && method === 'POST') {
    const authUser = getEdgeUser(request);
    const body = await request.json().catch(() => ({}));
    const userId = authUser ? authUser.id : body.userId;

    if (userId && edgeSubscriptions[userId]) {
      edgeSubscriptions[userId].status = 'CANCELLED';
      edgeSubscriptions[userId].plan = 'free';
      edgeSubscriptions[userId].updatedAt = new Date().toISOString();
    }
    return jsonResponse({ success: true, message: 'Subscription cancelled.' });
  }

  // --- POST /api/subscription/authorize-feature ---
  if (isPath('/api/subscription/authorize-feature') && method === 'POST') {
    const authUser = getEdgeUser(request);
    const body = await request.json().catch(() => ({}));
    const { userId: clientUserId, requiredTier } = body;
    const effectiveUserId = authUser ? authUser.id : clientUserId;

    if (!effectiveUserId) {
      return jsonResponse({
        authorized: false,
        plan: 'free',
        message: 'User identifier is required.',
      }, 400);
    }

    const sub = edgeSubscriptions[effectiveUserId];
    const nowTime = Date.now();
    const isActive =
      sub &&
      ((sub.status === 'ACTIVE' && (!sub.renewalDate || new Date(sub.renewalDate).getTime() > nowTime)) ||
        (sub.status === 'TRIAL_ACTIVE' && sub.trialEndsAt && new Date(sub.trialEndsAt).getTime() > nowTime));

    if (!isActive) {
      return jsonResponse({
        authorized: false,
        plan: 'free',
        message: 'Active Premium subscription or 7-day trial required to access this resource.',
      }, 403);
    }

    if (sub.status === 'TRIAL_ACTIVE' || sub.plan === 'trial') {
      return jsonResponse({
        authorized: true,
        plan: 'trial',
        isTrial: true,
        trialEndsAt: sub.trialEndsAt,
      });
    }

    if (requiredTier === 'pro' && sub.plan !== 'pro') {
      return jsonResponse({
        authorized: false,
        plan: sub.plan || 'plus',
        message: 'NAVIKO Pro subscription required for this feature.',
      }, 403);
    }

    return jsonResponse({
      authorized: true,
      plan: sub.plan || 'free',
    });
  }

  // --- POST /api/subscription/webhook & POST /api/razorpay/webhook ---
  if ((isPath('/api/subscription/webhook') || isPath('/api/razorpay/webhook')) && method === 'POST') {
    const signature = request.headers.get('x-razorpay-signature');
    const rawBody = await request.text();

    if (webhookSecret && signature) {
      const isValid = await verifyHmacSha256(webhookSecret, rawBody, signature);
      if (!isValid) {
        return jsonResponse({ success: false, error: 'Invalid webhook signature.' }, 400);
      }
    }

    try {
      const event = JSON.parse(rawBody);
      const eventId = event?.event_id || event?.id;
      if (eventId && edgeProcessedEvents.has(eventId)) {
        return jsonResponse({ status: 'ignored_duplicate', eventId });
      }
      if (eventId) edgeProcessedEvents.add(eventId);

      const eventType = event?.event;
      if (eventType === 'order.paid' || eventType === 'payment.captured') {
        const payment = event?.payload?.payment?.entity;
        const notes = payment?.notes || event?.payload?.order?.entity?.notes;
        const userId = notes?.userId;
        const isTrial = notes?.isTrial === 'true' || notes?.isTrial === true;
        const tier = notes?.tier === 'pro' ? 'pro' : 'plus';
        const interval = notes?.interval === 'monthly' ? 'monthly' : 'yearly';

        if (userId) {
          const now = new Date();
          if (isTrial) {
            const trialStartAt = now.toISOString();
            const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            edgeSubscriptions[userId] = {
              userId,
              status: 'TRIAL_ACTIVE',
              plan: 'trial',
              currency: 'INR',
              amount: 1,
              startDate: trialStartAt,
              renewalDate: trialEndsAt,
              trialStartAt,
              trialEndsAt,
              trialUsed: true,
              razorpayOrderId: payment?.order_id,
              razorpayPaymentId: payment?.id,
              updatedAt: trialStartAt,
            };
          } else {
            edgeSubscriptions[userId] = {
              userId,
              status: 'ACTIVE',
              plan: tier,
              billingInterval: interval,
              startDate: now.toISOString(),
              renewalDate: new Date(
                interval === 'monthly'
                  ? now.getTime() + 30 * 24 * 60 * 60 * 1000
                  : now.getTime() + 365 * 24 * 60 * 60 * 1000
              ).toISOString(),
              razorpayOrderId: payment?.order_id,
              razorpayPaymentId: payment?.id,
              updatedAt: now.toISOString(),
            };
          }
        }
      } else if (eventType === 'payment.failed') {
        const payment = event?.payload?.payment?.entity;
        const userId = payment?.notes?.userId;
        if (userId && edgeSubscriptions[userId]) {
          edgeSubscriptions[userId].status = 'PAYMENT_FAILED';
          edgeSubscriptions[userId].failureReason = payment?.error_description || 'Payment failed';
        }
      } else if (eventType === 'subscription.cancelled') {
        const subscription = event?.payload?.subscription?.entity;
        const userId = subscription?.notes?.userId;
        if (userId && edgeSubscriptions[userId]) {
          edgeSubscriptions[userId].status = 'CANCELLED';
          edgeSubscriptions[userId].plan = 'free';
        }
      }

      return jsonResponse({ status: 'ok', received: true });
    } catch (webhookErr) {
      console.error('Error processing Razorpay webhook:', webhookErr);
      return jsonResponse({ error: 'Webhook processing failed' }, 500);
    }
  }

  // --- POST /api/auth/signup ---
  if (isPath('/api/auth/signup') && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const { name, email, password } = body;
      if (!name || !email || !password || password.length < 8) {
        return jsonResponse({ success: false, error: 'Name, email, and password (minimum 8 characters) required.' }, 400);
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existing = Object.values(edgeUsers).find((u: any) => u.email === normalizedEmail);
      if (existing) {
        return jsonResponse({ success: false, error: 'An account with this email already exists.' }, 400);
      }

      const { salt, hash } = await hashEdgePassword(password);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();

      const newUser = {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        salt,
        passwordHash: hash,
        createdAt: now,
        updatedAt: now,
        recentTools: [],
      };

      edgeUsers[userId] = newUser;
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      edgeSessions[token] = { token, userId, expiresAt };

      return jsonResponse({
        success: true,
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
        subscription: edgeSubscriptions[userId] || { status: 'FREE', plan: 'free' },
      }, 201);
    } catch (err: any) {
      return jsonResponse({ success: false, error: 'Registration failed.' }, 500);
    }
  }

  // --- POST /api/auth/login ---
  if (isPath('/api/auth/login') && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const { email, password } = body;
      if (!email || !password) {
        return jsonResponse({ success: false, error: 'Email and password are required.' }, 400);
      }
      const normalizedEmail = email.trim().toLowerCase();
      const user = Object.values(edgeUsers).find((u: any) => u.email === normalizedEmail);

      if (!user) {
        return jsonResponse({ success: false, error: 'Invalid email or password.' }, 401);
      }

      const { hash } = await hashEdgePassword(password, user.salt);
      if (hash !== user.passwordHash) {
        return jsonResponse({ success: false, error: 'Invalid email or password.' }, 401);
      }

      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      edgeSessions[token] = { token, userId: user.id, expiresAt };

      return jsonResponse({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
        subscription: edgeSubscriptions[user.id] || { status: 'FREE', plan: 'free' },
      });
    } catch (err: any) {
      return jsonResponse({ success: false, error: 'Login failed.' }, 500);
    }
  }

  // --- GET /api/auth/me ---
  if (isPath('/api/auth/me') && method === 'GET') {
    const user = getEdgeUser(request);
    if (!user) {
      return jsonResponse({ success: false, error: 'Authentication required' }, 401);
    }
    return jsonResponse({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      subscription: edgeSubscriptions[user.id] || { status: 'FREE', plan: 'free' },
    });
  }

  // --- POST /api/auth/logout ---
  if (isPath('/api/auth/logout') && method === 'POST') {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      delete edgeSessions[authHeader.substring(7).trim()];
    }
    return jsonResponse({ success: true, message: 'Logged out successfully.' });
  }

  // --- GET & POST /api/user/recent-tools ---
  if (isPath('/api/user/recent-tools')) {
    const authUser = getEdgeUser(request);
    const userId = authUser ? authUser.id : (url.searchParams.get('userId') || 'anon');

    if (method === 'GET') {
      return jsonResponse({ success: true, tools: edgeRecentTools[userId] || [] });
    }
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const toolId = body.toolId;
      if (toolId) {
        const list = edgeRecentTools[userId] || [];
        edgeRecentTools[userId] = [toolId, ...list.filter((t) => t !== toolId)].slice(0, 10);
      }
      return jsonResponse({ success: true, tools: edgeRecentTools[userId] });
    }
  }

  // Fallback for any other /api/* route: Return JSON 404, NEVER HTML index.html
  return jsonResponse({
    success: false,
    error: `API endpoint ${method} ${cleanPath} not found`,
    path: cleanPath,
    method,
  }, 404);
}

// Module Worker export for Cloudflare Workers & Wrangler CLI with Assets
export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      return onRequest({
        request,
        env,
        params: {},
        waitUntil: ctx?.waitUntil ? ctx.waitUntil.bind(ctx) : () => {},
        next: () => (env.ASSETS ? env.ASSETS.fetch(request) : Promise.resolve(new Response(null))),
      });
    }
    // Static assets fallback if invoked directly via Worker
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response('Not found', { status: 404 });
  },
};
