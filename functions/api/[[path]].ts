// Cloudflare Pages Functions & Workers Catch-all API Handler
// Native 100% Cloudflare edge backend for NAVIKO (Option A).
// Handles all /api/* routes directly on Cloudflare Edge with zero external servers required.

export interface Env {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  NAVIKO_KV?: any;
  KV?: any;
  USERS_KV?: any;
  [key: string]: any;
}

// In-memory edge stores for serverless lifecycle (synchronized with Cloudflare KV)
const edgeUsers: Record<string, any> = {};
const edgeSessions: Record<string, any> = {};
const edgeSubscriptions: Record<string, any> = {};
const edgeRecentTools: Record<string, any[]> = {};
const edgeSavedPlans: Record<string, any[]> = {};
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

// Helper: Robust password hashing with Scrypt (if node:crypto available) or SHA-256 + salt fallback
async function hashEdgePassword(password: string, saltHex?: string): Promise<{ salt: string; hash: string }> {
  try {
    // @ts-ignore
    const nc = await import('node:crypto');
    if (nc && nc.scryptSync && nc.randomBytes) {
      const salt = saltHex || nc.randomBytes(16).toString('hex');
      const hash = nc.scryptSync(password, salt, 64).toString('hex');
      return { salt, hash };
    }
  } catch {}

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

// Helper: Verify password supporting both scrypt (128 hex chars) and SHA-256 (64 hex chars)
async function verifyEdgePassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  if (!password || !salt || !expectedHash) return false;

  // 1. Check SHA-256 fallbacks
  const enc = new TextEncoder();
  const shaFormats = [
    `${salt}:${password}`,
    salt + password,
    password + salt,
    password,
  ];

  for (const fmt of shaFormats) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(fmt));
      const shaHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      if (shaHex.toLowerCase() === expectedHash.trim().toLowerCase()) {
        return true;
      }
    } catch {}
  }

  // 2. Check scrypt (128 hex chars) via node:crypto if available
  if (expectedHash.length === 128) {
    try {
      // @ts-ignore
      const nc = await import('node:crypto');
      if (nc && nc.scryptSync) {
        const scryptHash = nc.scryptSync(password, salt, 64).toString('hex');
        if (scryptHash.toLowerCase() === expectedHash.trim().toLowerCase()) {
          return true;
        }
      }
    } catch {}
  }

  return false;
}

// Helper: Synchronize edge stores with KV (production) and local .data/ files (Node/development)
async function loadEdgeDataFiles(env?: Env) {
  // Cloudflare KV persistence (when NAVIKO_KV / KV / USERS_KV binding is configured)
  const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;
  if (!kv || typeof kv.get !== 'function') {
    console.error('[CRITICAL] NAVIKO_KV binding not found on environment. Ensure NAVIKO_KV is configured in Cloudflare Pages -> Settings -> Functions -> KV namespace bindings.');
    return;
  }
  if (kv && typeof kv.get === 'function') {
    try {
      const [uStr, sStr, sessStr, plansStr] = await Promise.all([
        kv.get('naviko_users'),
        kv.get('naviko_subscriptions'),
        kv.get('naviko_sessions'),
        kv.get('naviko_saved_plans'),
      ]);
      if (uStr) {
        const uParsed = typeof uStr === 'string' ? JSON.parse(uStr) : uStr;
        Object.assign(edgeUsers, uParsed);
      }
      if (sStr) {
        const sParsed = typeof sStr === 'string' ? JSON.parse(sStr) : sStr;
        Object.assign(edgeSubscriptions, sParsed);
      }
      if (sessStr) {
        const sessParsed = typeof sessStr === 'string' ? JSON.parse(sessStr) : sessStr;
        Object.assign(edgeSessions, sessParsed);
      }
      if (plansStr) {
        const pParsed = typeof plansStr === 'string' ? JSON.parse(plansStr) : plansStr;
        Object.assign(edgeSavedPlans, pParsed);
      }
    } catch (kvErr) {
      console.warn('Error reading edge data from KV:', kvErr);
    }
  }
}

async function persistEdgeData(type: 'users' | 'subscriptions' | 'sessions' | 'plans', env?: Env, targetUserId?: string) {
  // Cloudflare KV persistence (via env.NAVIKO_KV)
  const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;
  if (!kv || typeof kv.put !== 'function') {
    console.error(`[CRITICAL] NAVIKO_KV missing. Cannot persist ${type} to KV! Check Cloudflare Pages -> Settings -> Functions -> KV namespace bindings.`);
    return;
  }
  if (kv && typeof kv.put === 'function') {
    try {
      if (type === 'users') {
        await kv.put('naviko_users', JSON.stringify(edgeUsers));
        // Individual O(1) user records for robust Cloudflare KV lookups
        const userPromises: Promise<any>[] = [];
        for (const u of Object.values(edgeUsers)) {
          if (u?.id) {
            userPromises.push(kv.put(`user:${u.id}`, JSON.stringify(u)));
            if (u.email) {
              userPromises.push(kv.put(`user_by_email:${u.email.toLowerCase()}`, u.id));
            }
          }
        }
        await Promise.all(userPromises);
      } else if (type === 'subscriptions') {
        await kv.put('naviko_subscriptions', JSON.stringify(edgeSubscriptions));
        const subPromises = Object.entries(edgeSubscriptions).map(([userId, sub]) =>
          kv.put(`sub:${userId}`, JSON.stringify(sub))
        );
        await Promise.all(subPromises);
      } else if (type === 'sessions') {
        await kv.put('naviko_sessions', JSON.stringify(edgeSessions));
        const sessPromises: Promise<any>[] = [];
        for (const [token, session] of Object.entries(edgeSessions)) {
          if (token && session) {
            const ttlSeconds = session.expiresAt
              ? Math.max(60, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000))
              : undefined;
            if (ttlSeconds && ttlSeconds > 60) {
              sessPromises.push(kv.put(`session:${token}`, JSON.stringify(session), { expirationTtl: ttlSeconds }));
            } else {
              sessPromises.push(kv.put(`session:${token}`, JSON.stringify(session)));
            }
          }
        }
        await Promise.all(sessPromises);
      } else if (type === 'plans') {
        await kv.put('naviko_saved_plans', JSON.stringify(edgeSavedPlans));
        if (targetUserId && edgeSavedPlans[targetUserId]) {
          await kv.put(`plans:${targetUserId}`, JSON.stringify(edgeSavedPlans[targetUserId]));
        }
      }
    } catch (kvErr) {
      console.warn('Error writing edge data to KV:', kvErr);
    }
  }
}

// Helper: Retrieve subscription with cross-linking by user email and Cloudflare KV fallback
async function getEdgeUserSubscription(userId: string, env?: Env): Promise<any> {
  if (!userId) return null;
  const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;

  let direct = edgeSubscriptions[userId];
  if (!direct && kv && typeof kv.get === 'function') {
    try {
      const sVal = await kv.get(`sub:${userId}`);
      if (sVal) {
        direct = typeof sVal === 'string' ? JSON.parse(sVal) : sVal;
        edgeSubscriptions[userId] = direct;
      }
    } catch {}
  }

  if (direct && (direct.status === 'ACTIVE' || direct.status === 'TRIAL_ACTIVE')) {
    return direct;
  }

  let user = edgeUsers[userId];
  if (!user && kv && typeof kv.get === 'function') {
    try {
      const uVal = await kv.get(`user:${userId}`);
      if (uVal) {
        user = typeof uVal === 'string' ? JSON.parse(uVal) : uVal;
        edgeUsers[userId] = user;
      }
    } catch {}
  }

  if (user && user.email) {
    const userEmail = user.email.toLowerCase();
    const activeMatch = Object.values(edgeSubscriptions).find(
      (sub: any) =>
        sub.customerEmail &&
        sub.customerEmail.toLowerCase() === userEmail &&
        (sub.status === 'ACTIVE' || sub.status === 'TRIAL_ACTIVE')
    );
    if (activeMatch) {
      edgeSubscriptions[userId] = {
        ...activeMatch,
        userId: user.id,
        updatedAt: new Date().toISOString(),
      };
      await persistEdgeData('subscriptions', env);
      return edgeSubscriptions[userId];
    }
  }

  return direct || null;
}

// Helper: Extract session user from Request with Cloudflare KV fallback
async function getEdgeUser(request: Request, env?: Env): Promise<any | null> {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  if (!token) return null;

  const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;
  let session = edgeSessions[token];

  // If not found in memory, query KV directly
  if (!session && kv && typeof kv.get === 'function') {
    try {
      const sVal = await kv.get(`session:${token}`);
      if (sVal) {
        session = typeof sVal === 'string' ? JSON.parse(sVal) : sVal;
        edgeSessions[token] = session;
      }
    } catch {}
  }

  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    delete edgeSessions[token];
    if (kv && typeof kv.delete === 'function') {
      try {
        await kv.delete(`session:${token}`);
      } catch {}
    }
    return null;
  }

  let user = edgeUsers[session.userId];
  if (!user && kv && typeof kv.get === 'function') {
    try {
      const uVal = await kv.get(`user:${session.userId}`);
      if (uVal) {
        user = typeof uVal === 'string' ? JSON.parse(uVal) : uVal;
        edgeUsers[session.userId] = user;
      }
    } catch {}
  }

  return user || null;
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
  await loadEdgeDataFiles(env);

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

  // --- GET /api/subscription/status (also accepts POST) ---
  if (isPath('/api/subscription/status') && (method === 'GET' || method === 'POST')) {
    const authUser = await getEdgeUser(request, env);
    if (!authUser) {
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

    const userId = authUser.id;
    const sub = await getEdgeUserSubscription(userId, env);
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
        await persistEdgeData('subscriptions', env);
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
      const authUser = await getEdgeUser(request, env);
      if (!authUser) {
        return jsonResponse({
          success: false,
          error: 'Authentication required. Please log in or create an account before starting a trial.',
        }, 401);
      }

      const body = await request.json().catch(() => ({}));
      const { customerName } = body;
      const userId = authUser.id;
      const customerEmail = authUser.email;

      const existing = await getEdgeUserSubscription(userId, env);
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
      const authUser = await getEdgeUser(request, env);
      if (!authUser) {
        return jsonResponse({
          success: false,
          error: 'Authentication required to verify trial payment.',
        }, 401);
      }

      const body = await request.json().catch(() => ({}));
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = body;
      const userId = authUser.id;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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
        customerEmail: authUser.email,
        updatedAt: trialStartAt,
      };
      await persistEdgeData('subscriptions', env);

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
      const authUser = await getEdgeUser(request, env);
      if (!authUser) {
        return jsonResponse({
          success: false,
          error: 'Authentication required. Please log in or create an account before purchasing a plan.',
        }, 401);
      }

      const body = await request.json().catch(() => ({}));
      const { tier, interval, customerName } = body;
      const userId = authUser.id;
      const customerEmail = authUser.email;

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

  // --- POST /api/subscription/verify-payment or /api/subscription/verify ---
  if ((isPath('/api/subscription/verify-payment') || isPath('/api/subscription/verify')) && method === 'POST') {
    try {
      const authUser = await getEdgeUser(request, env);
      if (!authUser) {
        return jsonResponse({
          success: false,
          error: 'Authentication required to verify payment.',
        }, 401);
      }

      const body = await request.json().catch(() => ({}));
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        tier = 'pro',
        interval = 'yearly',
      } = body;
      const userId = authUser.id;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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
        customerEmail: authUser.email,
        updatedAt: now.toISOString(),
      };
      await persistEdgeData('subscriptions', env);

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
    const authUser = await getEdgeUser(request, env);
    const body = await request.json().catch(() => ({}));
    const userId = authUser ? authUser.id : body.userId;

    if (userId && edgeSubscriptions[userId]) {
      edgeSubscriptions[userId].status = 'CANCELLED';
      edgeSubscriptions[userId].plan = 'free';
      edgeSubscriptions[userId].updatedAt = new Date().toISOString();
      await persistEdgeData('subscriptions', env);
    }
    return jsonResponse({ success: true, message: 'Subscription cancelled.' });
  }

  // --- POST /api/subscription/authorize-feature ---
  if (isPath('/api/subscription/authorize-feature') && method === 'POST') {
    const authUser = await getEdgeUser(request, env);
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

    const sub = await getEdgeUserSubscription(effectiveUserId, env);
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

  // --- POST /api/auth/signup & /api/auth/register ---
  if ((isPath('/api/auth/signup') || isPath('/api/auth/register')) && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const { name, email, password, anonymousUserId } = body;
      if (!name || !email || !password || password.length < 8) {
        return jsonResponse({ success: false, error: 'Name, email, and password (minimum 8 characters) required.' }, 400);
      }
      const normalizedEmail = email.trim().toLowerCase();
      let existing = Object.values(edgeUsers).find((u: any) => u.email?.toLowerCase() === normalizedEmail);
      const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;
      if (!existing && kv && typeof kv.get === 'function') {
        try {
          const userIdFromEmail = await kv.get(`user_by_email:${normalizedEmail}`);
          if (userIdFromEmail) {
            const uVal = await kv.get(`user:${userIdFromEmail}`);
            if (uVal) {
              existing = typeof uVal === 'string' ? JSON.parse(uVal) : uVal;
              if (existing?.id) edgeUsers[existing.id] = existing;
            }
          }
        } catch {}
      }
      if (existing) {
        return jsonResponse({ success: false, error: 'An account with this email already exists. Please log in instead.' }, 400);
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

      if (anonymousUserId && edgeSubscriptions[anonymousUserId]) {
        edgeSubscriptions[userId] = {
          ...edgeSubscriptions[anonymousUserId],
          userId,
          customerEmail: normalizedEmail,
          updatedAt: now,
        };
      }

      await persistEdgeData('users', env);
      await persistEdgeData('sessions', env);
      await persistEdgeData('subscriptions', env);

      return jsonResponse({
        success: true,
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
        subscription: (await getEdgeUserSubscription(userId, env)) || { status: 'FREE', plan: 'free' },
      }, 201);
    } catch (err: any) {
      return jsonResponse({ success: false, error: 'Registration failed.' }, 500);
    }
  }

  // --- POST /api/auth/login ---
  if (isPath('/api/auth/login') && method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const { email, password, rememberMe, anonymousUserId } = body;
      if (!email || !password) {
        return jsonResponse({ success: false, error: 'Email and password are required.' }, 400);
      }
      const normalizedEmail = email.trim().toLowerCase();
      let user = Object.values(edgeUsers).find((u: any) => u.email?.toLowerCase() === normalizedEmail);

      // KV lookup fallback if user not in memory
      const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;
      if (!user && kv && typeof kv.get === 'function') {
        try {
          const userIdFromEmail = await kv.get(`user_by_email:${normalizedEmail}`);
          if (userIdFromEmail) {
            const uVal = await kv.get(`user:${userIdFromEmail}`);
            if (uVal) {
              user = typeof uVal === 'string' ? JSON.parse(uVal) : uVal;
              if (user?.id) edgeUsers[user.id] = user;
            }
          }
        } catch {}
      }

      if (!user) {
        return jsonResponse({ success: false, error: 'Incorrect email or password.' }, 401);
      }

      const isMatch = await verifyEdgePassword(password, user.salt, user.passwordHash);
      if (!isMatch) {
        return jsonResponse({ success: false, error: 'Incorrect email or password.' }, 401);
      }

      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const daysValid = rememberMe ? 30 : 7;
      const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      edgeSessions[token] = { token, userId: user.id, expiresAt };

      if (anonymousUserId && edgeSubscriptions[anonymousUserId]) {
        const anonSub = edgeSubscriptions[anonymousUserId];
        if (!edgeSubscriptions[user.id] || edgeSubscriptions[user.id].status === 'FREE') {
          edgeSubscriptions[user.id] = {
            ...anonSub,
            userId: user.id,
            customerEmail: user.email,
            updatedAt: now,
          };
        }
      }

      await persistEdgeData('sessions', env);
      await persistEdgeData('subscriptions', env);

      return jsonResponse({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
        subscription: (await getEdgeUserSubscription(user.id, env)) || { status: 'FREE', plan: 'free' },
      });
    } catch (err: any) {
      return jsonResponse({ success: false, error: 'Login failed.' }, 500);
    }
  }

  // --- GET /api/auth/me or GET /api/auth/profile ---
  if ((isPath('/api/auth/me') || isPath('/api/auth/profile')) && method === 'GET') {
    const user = await getEdgeUser(request, env);
    if (!user) {
      return jsonResponse({ success: false, error: 'Not authenticated or session expired.', sessionExpired: true }, 401);
    }
    return jsonResponse({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      subscription: (await getEdgeUserSubscription(user.id, env)) || { status: 'FREE', plan: 'free' },
    });
  }

  // --- POST /api/auth/logout ---
  if (isPath('/api/auth/logout') && method === 'POST') {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      delete edgeSessions[token];
      const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;
      if (kv && typeof kv.delete === 'function') {
        try {
          await kv.delete(`session:${token}`);
        } catch {}
      }
      await persistEdgeData('sessions', env);
    }
    return jsonResponse({ success: true, message: 'Logged out successfully.' });
  }

  // --- GET & POST /api/user/recent-tools ---
  if (isPath('/api/user/recent-tools')) {
    const authUser = await getEdgeUser(request, env);
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

  // --- POST /api/auth/logout-all ---
  if (isPath('/api/auth/logout-all') && method === 'POST') {
    const authUser = await getEdgeUser(request, env);
    if (!authUser) {
      return jsonResponse({ success: false, error: 'Authentication required.' }, 401);
    }
    const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;
    const tokensToDelete: string[] = [];
    for (const [token, sess] of Object.entries(edgeSessions)) {
      if (sess.userId === authUser.id) {
        tokensToDelete.push(token);
        delete edgeSessions[token];
      }
    }
    if (kv && typeof kv.delete === 'function') {
      for (const t of tokensToDelete) {
        try { await kv.delete(`session:${t}`); } catch {}
      }
    }
    await persistEdgeData('sessions', env);
    return jsonResponse({ success: true, message: 'Successfully logged out of all devices and active sessions.' });
  }

  // --- POST /api/auth/forgot-password ---
  if (isPath('/api/auth/forgot-password') && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { email } = body;
    if (!email || typeof email !== 'string') {
      return jsonResponse({ success: false, error: 'Please provide a valid email address.' }, 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    let user = Object.values(edgeUsers).find((u: any) => u.email?.toLowerCase() === normalizedEmail);
    const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;
    if (!user && kv && typeof kv.get === 'function') {
      try {
        const uid = await kv.get(`user_by_email:${normalizedEmail}`);
        if (uid) {
          const uVal = await kv.get(`user:${uid}`);
          if (uVal) user = typeof uVal === 'string' ? JSON.parse(uVal) : uVal;
        }
      } catch {}
    }
    if (!user) {
      return jsonResponse({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been created.',
      });
    }
    const resetToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    user.updatedAt = new Date().toISOString();
    edgeUsers[user.id] = user;
    await persistEdgeData('users', env);
    return jsonResponse({
      success: true,
      message: 'Password reset link prepared.',
      resetToken,
      resetLink: `/reset-password?token=${resetToken}`,
    });
  }

  // --- POST /api/auth/reset-password ---
  if (isPath('/api/auth/reset-password') && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { token, newPassword } = body;
    if (!token || typeof token !== 'string') {
      return jsonResponse({ success: false, error: 'Reset token is required.' }, 400);
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return jsonResponse({ success: false, error: 'New password must be at least 8 characters long.' }, 400);
    }
    let user = Object.values(edgeUsers).find((u: any) => u.resetPasswordToken === token);
    if (!user) {
      return jsonResponse({ success: false, error: 'Invalid or expired password reset link.' }, 400);
    }
    if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return jsonResponse({ success: false, error: 'This password reset link has expired. Please request a new one.' }, 400);
    }
    const { salt, hash } = await hashEdgePassword(newPassword);
    user.salt = salt;
    user.passwordHash = hash;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    user.updatedAt = new Date().toISOString();
    edgeUsers[user.id] = user;
    await persistEdgeData('users', env);

    // Revoke previous sessions
    const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;
    for (const [sToken, sess] of Object.entries(edgeSessions)) {
      if (sess.userId === user.id) {
        delete edgeSessions[sToken];
        if (kv && typeof kv.delete === 'function') {
          try { await kv.delete(`session:${sToken}`); } catch {}
        }
      }
    }

    // Issue fresh session
    const freshToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    edgeSessions[freshToken] = { token: freshToken, userId: user.id, expiresAt };
    await persistEdgeData('sessions', env);

    return jsonResponse({
      success: true,
      message: 'Your password has been successfully updated.',
      token: freshToken,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  }

  // --- PUT /api/auth/profile ---
  if (isPath('/api/auth/profile') && method === 'PUT') {
    const authUser = await getEdgeUser(request, env);
    if (!authUser) {
      return jsonResponse({ success: false, error: 'Authentication required.' }, 401);
    }
    const body = await request.json().catch(() => ({}));
    const { name, preferences } = body;
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      authUser.name = name.trim();
    }
    if (preferences && typeof preferences === 'object') {
      authUser.preferences = { ...(authUser.preferences || {}), ...preferences };
    }
    authUser.updatedAt = new Date().toISOString();
    edgeUsers[authUser.id] = authUser;
    await persistEdgeData('users', env);
    return jsonResponse({
      success: true,
      message: 'Profile updated successfully.',
      user: { id: authUser.id, name: authUser.name, email: authUser.email, createdAt: authUser.createdAt },
    });
  }

  // --- PUT /api/auth/change-password ---
  if (isPath('/api/auth/change-password') && method === 'PUT') {
    const authUser = await getEdgeUser(request, env);
    if (!authUser) {
      return jsonResponse({ success: false, error: 'Authentication required.' }, 401);
    }
    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return jsonResponse({ success: false, error: 'Both current and new password are required.' }, 400);
    }
    if (newPassword.length < 8) {
      return jsonResponse({ success: false, error: 'New password must be at least 8 characters long.' }, 400);
    }
    const isMatch = await verifyEdgePassword(currentPassword, authUser.salt, authUser.passwordHash);
    if (!isMatch) {
      return jsonResponse({ success: false, error: 'Current password is incorrect.' }, 400);
    }
    const { salt, hash } = await hashEdgePassword(newPassword);
    authUser.salt = salt;
    authUser.passwordHash = hash;
    authUser.updatedAt = new Date().toISOString();
    edgeUsers[authUser.id] = authUser;
    await persistEdgeData('users', env);
    return jsonResponse({ success: true, message: 'Password updated successfully.' });
  }

  // --- GET, POST, DELETE /api/user/saved-plans (Persistent user plan storage via Cloudflare KV) ---
  if (isPath('/api/user/saved-plans')) {
    const authUser = await getEdgeUser(request, env);
    if (!authUser) {
      return jsonResponse({ success: false, error: 'Authentication required to manage saved plans.' }, 401);
    }
    const userId = authUser.id;
    const kv = env?.NAVIKO_KV || env?.KV || env?.USERS_KV;

    if (method === 'GET') {
      let plans = edgeSavedPlans[userId];
      if (!plans && kv && typeof kv.get === 'function') {
        try {
          const pVal = await kv.get(`plans:${userId}`);
          if (pVal) {
            plans = typeof pVal === 'string' ? JSON.parse(pVal) : pVal;
            edgeSavedPlans[userId] = plans;
          }
        } catch {}
      }
      return jsonResponse({ success: true, items: plans || [] });
    }

    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const planData = body.data || body.plan || {};
      const planTitle = body.title || body.name || 'Saved Meal Plan';
      const record = {
        id: body.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: body.type || 'diet_plan',
        title: planTitle,
        createdAt: new Date().toISOString(),
        plan: planData,
        data: planData,
      };

      const existingList = edgeSavedPlans[userId] || [];
      const updated = [record, ...existingList.filter((p: any) => p.id !== record.id)].slice(0, 30);
      edgeSavedPlans[userId] = updated;

      await persistEdgeData('plans', env, userId);
      return jsonResponse({ success: true, item: record, items: updated });
    }

    if (method === 'DELETE') {
      const planId = url.searchParams.get('id');
      if (!planId) {
        return jsonResponse({ success: false, error: 'Plan ID parameter is required.' }, 400);
      }
      const existingList = edgeSavedPlans[userId] || [];
      const updated = existingList.filter((p: any) => p.id !== planId);
      edgeSavedPlans[userId] = updated;

      await persistEdgeData('plans', env, userId);
      return jsonResponse({ success: true, message: 'Plan removed successfully.', items: updated });
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
