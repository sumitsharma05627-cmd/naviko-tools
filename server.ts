import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import fs from 'fs';
import { PRICING_CONFIG, CurrencyCode, PlanType, BillingInterval } from './src/config/pricing';

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON with raw body capture for webhook signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true }));
 
// Global CORS, content-type and preflight handling for /api routes
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }
  next();
});

// --- Subscription Data Types & Storage ---
export type SubscriptionStatusState =
  | 'FREE'
  | 'PAYMENT_PENDING'
  | 'TRIAL_ACTIVE'
  | 'ACTIVE'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface ServerSubscriptionRecord {
  userId: string;
  status: SubscriptionStatusState;
  plan: PlanType;
  pendingTier?: PlanType;
  pendingInterval?: BillingInterval;
  billingInterval?: BillingInterval;
  currency?: string;
  amount?: number;
  startDate?: string;
  renewalDate?: string;
  trialStartAt?: string;
  trialEndsAt?: string;
  trialUsed?: boolean;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  customerEmail?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json');
const PROCESSED_EVENTS_FILE = path.join(DATA_DIR, 'processed_events.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  recentTools?: string[];
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    currency?: string;
    emailNotifications?: boolean;
  };
}

export interface UserSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  rememberMe?: boolean;
  userAgent?: string;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// In-memory caches backed by file persistence
let subscriptionsCache: Record<string, ServerSubscriptionRecord> = {};
let processedEventsCache: Set<string> = new Set();
let usersCache: Record<string, UserAccount> = {};
let sessionsCache: Record<string, UserSession> = {};

function syncUsersFromDisk(): Record<string, UserAccount> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        usersCache = { ...usersCache, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Could not read users file from disk:', err);
  }
  return usersCache;
}

function syncSessionsFromDisk(): Record<string, UserSession> {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        sessionsCache = { ...sessionsCache, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Could not read sessions file from disk:', err);
  }
  return sessionsCache;
}

function loadPersistedData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}

  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
      subscriptionsCache = JSON.parse(data);
    }
  } catch (err) {
    console.warn('Could not load subscriptions file, starting with fresh cache:', err);
    subscriptionsCache = {};
  }

  try {
    if (fs.existsSync(PROCESSED_EVENTS_FILE)) {
      const data = fs.readFileSync(PROCESSED_EVENTS_FILE, 'utf8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        processedEventsCache = new Set(list);
      }
    }
  } catch (err) {
    console.warn('Could not load processed events file:', err);
    processedEventsCache = new Set();
  }

  syncUsersFromDisk();
  syncSessionsFromDisk();
}

function saveSubscriptions() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptionsCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save subscriptions:', err);
  }
}

function saveProcessedEvents() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(
      PROCESSED_EVENTS_FILE,
      JSON.stringify(Array.from(processedEventsCache), null, 2),
      'utf8'
    );
  } catch (err) {
    console.error('Failed to save processed events:', err);
  }
}

function saveUsers() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

function saveSessions() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

// Load initial data
loadPersistedData();

// --- Crypto & Password Helpers ---
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    if (!password || !salt || !expectedHash) return false;

    // Check scrypt (128 hex chars = 64 bytes)
    if (expectedHash.length === 128) {
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      const hashBuf = Buffer.from(hash, 'hex');
      const expectedBuf = Buffer.from(expectedHash, 'hex');
      if (hashBuf.length === expectedBuf.length && crypto.timingSafeEqual(hashBuf, expectedBuf)) {
        return true;
      }
      if (hash.toLowerCase() === expectedHash.trim().toLowerCase()) {
        return true;
      }
    }

    // Check SHA-256 fallbacks
    const shaFormats = [
      `${salt}:${password}`,
      salt + password,
      password + salt,
      password,
    ];
    for (const fmt of shaFormats) {
      const shaHash = crypto.createHash('sha256').update(fmt).digest('hex');
      if (shaHash.toLowerCase() === expectedHash.trim().toLowerCase()) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function sanitizeUser(user: UserAccount) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    recentTools: user.recentTools || [],
    preferences: user.preferences || {
      theme: 'system' as const,
      currency: 'INR',
      emailNotifications: true,
    },
  };
}

function getAuthenticatedUser(req: express.Request): UserAccount | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token) return null;

  syncSessionsFromDisk();
  const session = sessionsCache[token];
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    delete sessionsCache[token];
    saveSessions();
    return null;
  }

  syncUsersFromDisk();
  const user = usersCache[session.userId];
  return user || null;
}

// Helper: Get user subscription with email cross-linking
function getUserSubscription(userId: string): ServerSubscriptionRecord | null {
  if (!userId) return null;
  const direct = subscriptionsCache[userId];
  if (direct && (direct.status === 'ACTIVE' || direct.status === 'TRIAL_ACTIVE')) {
    return direct;
  }

  // If direct record is not active, check if user's registered email has an active subscription record
  const user = usersCache[userId];
  if (user && user.email) {
    const userEmail = user.email.toLowerCase();
    const activeMatch = Object.values(subscriptionsCache).find(
      (sub) =>
        sub.customerEmail &&
        sub.customerEmail.toLowerCase() === userEmail &&
        (sub.status === 'ACTIVE' || sub.status === 'TRIAL_ACTIVE')
    );
    if (activeMatch) {
      subscriptionsCache[userId] = {
        ...activeMatch,
        userId: user.id,
        updatedAt: new Date().toISOString(),
      };
      saveSubscriptions();
      return subscriptionsCache[userId];
    }
  }

  return direct || null;
}

// Helper: Authoritative active check
function hasActiveSubscription(userId: string): boolean {
  if (!userId) return false;
  const sub = getUserSubscription(userId);
  if (!sub) return false;

  const nowTime = Date.now();

  // If in trial mode, check if trial is still within 7 days
  if (sub.status === 'TRIAL_ACTIVE') {
    if (sub.trialEndsAt) {
      const expiry = new Date(sub.trialEndsAt).getTime();
      if (expiry <= nowTime) {
        sub.status = 'EXPIRED';
        sub.plan = 'free';
        sub.updatedAt = new Date().toISOString();
        saveSubscriptions();
        console.log(`[TRIAL EXPIRED] User ${userId} trial period ended at ${sub.trialEndsAt}`);
        return false;
      }
    }
    return true;
  }

  if (sub.status !== 'ACTIVE') return false;

  // Check expiration if renewalDate is specified
  if (sub.renewalDate) {
    const expiry = new Date(sub.renewalDate).getTime();
    if (expiry <= nowTime) {
      sub.status = 'EXPIRED';
      sub.plan = 'free';
      sub.updatedAt = new Date().toISOString();
      saveSubscriptions();
      return false;
    }
  }

  return sub.plan === 'plus' || sub.plan === 'pro' || sub.plan === 'trial';
}

// Helper: Lazy initialization for Razorpay SDK
let razorpayClient: Razorpay | null = null;
function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayClient;
}

// Helper: Calculate renewal date ISO string
function calculateRenewalDate(interval: BillingInterval, fromDate: Date = new Date()): string {
  const d = new Date(fromDate);
  if (interval === 'yearly') {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString();
}

// Helper: Calculate amount in currency subunits
function getSubunitAmount(amount: number, currency: string): number {
  if (currency.toUpperCase() === 'JPY') {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

// ==========================================
// API ROUTES (Mounted FIRST before Vite)
// ==========================================

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  });
});

// Cloudflare KV worker test & demonstration route
app.all(['/api/kv', '/kv'], async (_req, res) => {
  const simulatedStore = new Map<string, string>();
  // write a key-value pair
  simulatedStore.set('KEY', 'VALUE');
  // read a key-value pair
  const value = simulatedStore.get('KEY');
  // list all key-value pairs
  const allKeys = {
    keys: Array.from(simulatedStore.keys()).map((k) => ({ name: k })),
    list_complete: true,
  };
  // delete a key-value pair
  simulatedStore.delete('KEY');

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json({
    value: value,
    allKeys: allKeys,
  });
});

// 2. Public configuration (Only public Key ID is exposed, NEVER secrets)
app.get('/api/subscription/config', (_req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  res.json({
    keyId,
    isConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    isTestKey: keyId.startsWith('rzp_test_'),
  });
});

// ==========================================
// AUTHENTICATION & USER ENDPOINTS
// ==========================================

// Auth: Handler for Registration (both /api/auth/signup and /api/auth/register)
const handleSignup = (req: express.Request, res: express.Response) => {
  try {
    const { name, email, password, anonymousUserId } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Full name must be at least 2 characters.' });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }

    // Ensure latest users from persistent disk storage
    syncUsersFromDisk();

    // Check if user already exists
    const existing = Object.values(usersCache).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // Hash password with cryptographically random salt
    const { salt, hash } = hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const newUser: UserAccount = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      salt,
      passwordHash: hash,
      createdAt: now,
      updatedAt: now,
      recentTools: [],
      preferences: {
        theme: 'system',
        currency: 'INR',
        emailNotifications: true,
      },
    };

    usersCache[userId] = newUser;
    saveUsers();

    // Generate secure session token (valid 30 days)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    sessionsCache[token] = {
      token,
      userId,
      createdAt: now,
      expiresAt,
      rememberMe: true,
      userAgent: (req.headers['user-agent'] as string) || 'browser',
    };
    saveSessions();

    // Migrate anonymous subscription / trial if present
    if (anonymousUserId && subscriptionsCache[anonymousUserId]) {
      const anonSub = subscriptionsCache[anonymousUserId];
      subscriptionsCache[userId] = {
        ...anonSub,
        userId,
        customerEmail: normalizedEmail,
        updatedAt: now,
      };
      saveSubscriptions();
    }

    console.log(`[AUTH] New user registered: ${normalizedEmail} (${userId})`);

    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(newUser),
      subscription: getUserSubscription(userId),
    });
  } catch (err: any) {
    console.error('Error during user registration:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
};

app.post('/api/auth/signup', handleSignup);
app.post('/api/auth/register', handleSignup);

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, rememberMe, anonymousUserId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Ensure latest users from persistent disk storage
    syncUsersFromDisk();

    const user = Object.values(usersCache).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
    }

    const isMatch = verifyPassword(password, user.salt, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
    }

    // Generate session token (30 days if rememberMe, otherwise 7 days)
    const token = crypto.randomBytes(32).toString('hex');
    const daysValid = rememberMe ? 30 : 7;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();

    sessionsCache[token] = {
      token,
      userId: user.id,
      createdAt: now,
      expiresAt,
      rememberMe: !!rememberMe,
      userAgent: (req.headers['user-agent'] as string) || 'browser',
    };
    saveSessions();

    // Link any anonymous subscription if found
    if (anonymousUserId && subscriptionsCache[anonymousUserId]) {
      const anonSub = subscriptionsCache[anonymousUserId];
      if (!subscriptionsCache[user.id] || subscriptionsCache[user.id].status === 'FREE') {
        subscriptionsCache[user.id] = {
          ...anonSub,
          userId: user.id,
          customerEmail: user.email,
          updatedAt: now,
        };
        saveSubscriptions();
      }
    }

    console.log(`[AUTH] User logged in: ${user.email} (${user.id})`);

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
      subscription: getUserSubscription(user.id),
    });
  } catch (err: any) {
    console.error('Error during login:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
});

// Auth: Current User Profile (Me)
app.get('/api/auth/me', (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Not authenticated or session expired.', sessionExpired: true });
    }

    const sub = getUserSubscription(user.id);
    return res.json({
      success: true,
      user: sanitizeUser(user),
      subscription: sub,
    });
  } catch (err: any) {
    console.error('Error fetching current user:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve user profile.' });
  }
});

// Auth: Logout current session
app.post('/api/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (sessionsCache[token]) {
        delete sessionsCache[token];
        saveSessions();
      }
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    console.error('Error during logout:', err);
    return res.status(500).json({ success: false, error: 'Failed to log out.' });
  }
});

// Auth: Logout from ALL devices / sessions
app.post('/api/auth/logout-all', (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    // Revoke all sessions for this user ID
    for (const [token, sess] of Object.entries(sessionsCache)) {
      if (sess.userId === user.id) {
        delete sessionsCache[token];
      }
    }
    saveSessions();

    return res.json({ success: true, message: 'Successfully logged out of all devices and active sessions.' });
  } catch (err: any) {
    console.error('Error logging out of all sessions:', err);
    return res.status(500).json({ success: false, error: 'Failed to revoke sessions.' });
  }
});

// Auth: Forgot Password (generates reset token)
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = Object.values(usersCache).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      // Standard security practice: Don't leak whether email exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been created.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    user.updatedAt = new Date().toISOString();
    saveUsers();

    console.log(`[PASSWORD RESET] Token generated for ${user.email}: /reset-password?token=${resetToken}`);

    return res.json({
      success: true,
      message: 'Password reset link prepared. In this environment, you can use the direct link below.',
      resetToken,
      resetLink: `/reset-password?token=${resetToken}`,
    });
  } catch (err: any) {
    console.error('Error during forgot password:', err);
    return res.status(500).json({ success: false, error: 'Failed to process password reset request.' });
  }
});

// Auth: Reset Password with Token
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Reset token is required.' });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
    }

    const user = Object.values(usersCache).find(
      (u) => u.resetPasswordToken === token
    );

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset link.' });
    }

    if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'This password reset link has expired. Please request a new one.',
      });
    }

    // Hash new password
    const { salt, hash } = hashPassword(newPassword);
    user.salt = salt;
    user.passwordHash = hash;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    user.updatedAt = new Date().toISOString();
    saveUsers();

    // Revoke previous sessions for security
    for (const [sToken, sess] of Object.entries(sessionsCache)) {
      if (sess.userId === user.id) {
        delete sessionsCache[sToken];
      }
    }

    // Issue a fresh new session token
    const freshToken = crypto.randomBytes(32).toString('hex');
    sessionsCache[freshToken] = {
      token: freshToken,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rememberMe: true,
      userAgent: (req.headers['user-agent'] as string) || 'browser',
    };
    saveSessions();

    console.log(`[PASSWORD RESET] Successfully reset password for ${user.email}`);

    return res.json({
      success: true,
      message: 'Your password has been successfully updated.',
      token: freshToken,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

// Auth: Update Profile
app.put('/api/auth/profile', (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const { name, preferences } = req.body;
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      user.name = name.trim();
    }

    if (preferences && typeof preferences === 'object') {
      user.preferences = {
        ...(user.preferences || {}),
        ...preferences,
      };
    }

    user.updatedAt = new Date().toISOString();
    saveUsers();

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// Auth: Change Password
app.put('/api/auth/change-password', (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Both current and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
    }

    const isMatch = verifyPassword(currentPassword, user.salt, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    }

    const { salt, hash } = hashPassword(newPassword);
    user.salt = salt;
    user.passwordHash = hash;
    user.updatedAt = new Date().toISOString();
    saveUsers();

    return res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err: any) {
    console.error('Error changing password:', err);
    return res.status(500).json({ success: false, error: 'Failed to change password.' });
  }
});

// User: Record Recent Tool Usage
app.post('/api/user/recent-tools', (req, res) => {
  try {
    const { toolId } = req.body;
    if (!toolId || typeof toolId !== 'string') {
      return res.status(400).json({ success: false, error: 'Tool ID is required.' });
    }

    const user = getAuthenticatedUser(req);
    if (user) {
      const current = (user.recentTools || []).filter((id) => id !== toolId);
      user.recentTools = [toolId, ...current].slice(0, 15);
      user.updatedAt = new Date().toISOString();
      saveUsers();
      return res.json({ success: true, recentTools: user.recentTools });
    }

    return res.json({ success: true, recentTools: [toolId] });
  } catch (err: any) {
    console.error('Error recording recent tool:', err);
    return res.status(500).json({ success: false, error: 'Failed to record tool usage.' });
  }
});

// User: Get Recent Tools
app.get('/api/user/recent-tools', (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (user) {
      return res.json({ success: true, recentTools: user.recentTools || [] });
    }
    return res.json({ success: true, recentTools: [] });
  } catch (err: any) {
    console.error('Error fetching recent tools:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch recent tools.' });
  }
});

// 3. Subscription status check (Authoritative backend verification)
app.all('/api/subscription/status', (req, res) => {
  const authUser = getAuthenticatedUser(req);

  // Unauthenticated visitors strictly have FREE status.
  // Authoritative identity: only verified session users have persistent accounts/subscriptions.
  if (!authUser) {
    return res.json({
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
  const sub = getUserSubscription(userId);
  const isActive = hasActiveSubscription(userId);

  const nowTime = Date.now();
  let remainingTrialDays = 0;
  let remainingTrialHours = 0;
  const isTrial = sub?.status === 'TRIAL_ACTIVE';

  if (isTrial && sub?.trialEndsAt) {
    const remainingMs = Math.max(0, new Date(sub.trialEndsAt).getTime() - nowTime);
    remainingTrialHours = Math.ceil(remainingMs / (1000 * 60 * 60));
    remainingTrialDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  }

  if (isActive && sub) {
    return res.json({
      status: sub.status,
      plan: sub.plan,
      hasActiveSubscription: true,
      isTrial,
      trialUsed: !!sub.trialUsed,
      trialStartAt: sub.trialStartAt || null,
      trialEndsAt: sub.trialEndsAt || null,
      remainingTrialDays,
      remainingTrialHours,
      startDate: sub.startDate || null,
      renewalDate: sub.renewalDate || null,
      billingInterval: sub.billingInterval || 'yearly',
      currency: sub.currency || 'INR',
    });
  }

  return res.json({
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
});

// 3b. Create Razorpay Trial Order (₹1 = 100 paise)
app.post('/api/subscription/create-trial-order', async (req, res) => {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in or create an account before starting a trial.',
      });
    }

    const { customerName } = req.body;
    const userId = authUser.id;
    const customerEmail = authUser.email;

    // Backend enforcement 1: Check if this user ID already claimed trial
    const existing = getUserSubscription(userId);
    if (existing?.trialUsed || existing?.status === 'TRIAL_ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Your ₹1 trial has already been used.',
        trialUsed: true,
      });
    }

    // Backend enforcement 2: Check if this email has already claimed trial across all records
    if (customerEmail && typeof customerEmail === 'string') {
      const normalizedEmail = customerEmail.trim().toLowerCase();
      const existingByEmail = Object.values(subscriptionsCache).find(
        (sub) =>
          sub.customerEmail &&
          sub.customerEmail.toLowerCase() === normalizedEmail &&
          (sub.trialUsed || sub.status === 'TRIAL_ACTIVE')
      );
      if (existingByEmail) {
        return res.status(400).json({
          success: false,
          error: 'The ₹1 trial has already been claimed for this email address.',
          trialUsed: true,
        });
      }
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(503).json({
        success: false,
        error:
          'Razorpay credentials are not configured on the server. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server environment variables.',
      });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ success: false, error: 'Failed to initialize Razorpay payment client.' });
    }

    // Exactly ₹1 = 100 paise
    const subunitAmount = 100;
    const receiptId = `trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const order = await razorpay.orders.create({
      amount: subunitAmount,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId,
        isTrial: 'true',
        customerEmail: customerEmail || '',
        customerName: customerName || '',
      },
    });

    // Save pending state on server. Note: trialUsed remains false until payment is cryptographically verified!
    subscriptionsCache[userId] = {
      userId,
      status: 'PAYMENT_PENDING',
      plan: existing?.plan || 'free',
      currency: 'INR',
      amount: 1,
      razorpayOrderId: order.id,
      customerEmail: customerEmail || existing?.customerEmail,
      trialUsed: false,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSubscriptions();

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      isTrial: true,
    });
  } catch (err: any) {
    console.error('Error creating Razorpay trial order:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to create trial order on Razorpay server.',
    });
  }
});

// 3c. Verify Razorpay Trial Payment
app.post('/api/subscription/verify-trial-payment', async (req, res) => {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required to verify trial payment.',
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = authUser.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters (order_id, payment_id, or signature).',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        error: 'Server error: RAZORPAY_KEY_SECRET is not configured on the server.',
      });
    }

    // Backend enforce: Check if user already claimed trial
    const existing = subscriptionsCache[userId];
    if (existing?.trialUsed && existing?.status === 'TRIAL_ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Your ₹1 trial has already been used.',
        trialUsed: true,
      });
    }

    // Security check: Verify order matches pending trial order for this user
    if (existing && existing.razorpayOrderId && existing.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        error: 'Order mismatch: This trial payment does not match the active pending order for this account.',
      });
    }

    // Step 1: Cryptographic HMAC SHA256 verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn(`[SECURITY] Invalid Razorpay signature for trial attempt userId ${userId}`);
      if (subscriptionsCache[userId]) {
        subscriptionsCache[userId].status = 'PAYMENT_FAILED';
        subscriptionsCache[userId].failureReason = 'Signature mismatch';
        subscriptionsCache[userId].updatedAt = new Date().toISOString();
        saveSubscriptions();
      }
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Invalid signature. Trial access will not be activated.',
      });
    }

    // Step 2: Fetch payment from Razorpay API to check capture status and amount
    const razorpay = getRazorpay();
    if (razorpay) {
      try {
        const paymentDetails = (await razorpay.payments.fetch(razorpay_payment_id)) as any;
        if (paymentDetails && paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
          return res.status(400).json({
            success: false,
            error: `Payment is in ${paymentDetails.status} state. Only captured payments can activate trial.`,
          });
        }
        if (paymentDetails && paymentDetails.amount !== 100) {
          return res.status(400).json({
            success: false,
            error: 'Invalid trial payment amount. Expected ₹1 (100 paise).',
          });
        }
      } catch (fetchErr) {
        console.warn('Razorpay trial payment fetch check skipped or returned error:', fetchErr);
      }
    }

    // Step 3: Only after successful server verification:
    // - Mark status as TRIAL_ACTIVE
    // - Set plan = trial
    // - Set trialStartAt = now
    // - Set trialEndsAt = now + 7 days
    // - Set permanent trialUsed = true
    const now = new Date();
    const trialStartAt = now.toISOString();
    const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    subscriptionsCache[userId] = {
      userId,
      status: 'TRIAL_ACTIVE',
      plan: 'trial',
      currency: 'INR',
      amount: 1,
      startDate: trialStartAt,
      renewalDate: trialEndsAt,
      trialStartAt,
      trialEndsAt,
      trialUsed: true, // Permanent server-side flag!
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      customerEmail: subscriptionsCache[userId]?.customerEmail,
      createdAt: subscriptionsCache[userId]?.createdAt || trialStartAt,
      updatedAt: trialStartAt,
    };
    saveSubscriptions();

    console.log(`[TRIAL] User ${userId} activated 7-day ₹1 trial until ${trialEndsAt}`);

    return res.json({
      success: true,
      status: 'TRIAL_ACTIVE',
      plan: 'trial',
      trialStartAt,
      trialEndsAt,
      trialUsed: true,
      message: '₹1 trial payment verified! 7 days of NAVIKO Premium access has been activated.',
    });
  } catch (err: any) {
    console.error('Error verifying Razorpay trial payment:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error during trial payment verification.',
    });
  }
});

// 4. Create Razorpay Order
app.post('/api/subscription/create-order', async (req, res) => {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in or create an account before purchasing a plan.',
      });
    }

    const { tier, interval, currency } = req.body;
    const userId = authUser.id;
    const customerEmail = authUser.email;

    if (tier !== 'plus' && tier !== 'pro') {
      return res.status(400).json({ success: false, error: 'Invalid plan tier requested. Must be "plus" or "pro".' });
    }

    if (interval !== 'monthly' && interval !== 'yearly') {
      return res.status(400).json({ success: false, error: 'Invalid billing interval requested.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(503).json({
        success: false,
        error:
          'Razorpay credentials are not configured on the server. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server environment variables.',
      });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ success: false, error: 'Failed to initialize Razorpay payment client.' });
    }

    const currencyKey = (currency || 'INR') as CurrencyCode;
    const currencyPricing = PRICING_CONFIG[currencyKey] || PRICING_CONFIG.INR;
    const tierConfig = currencyPricing[tier];
    const amountInUnits = tierConfig[interval as BillingInterval];
    const subunitAmount = getSubunitAmount(amountInUnits, currencyPricing.code);

    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create real Razorpay order on server
    const order = await razorpay.orders.create({
      amount: subunitAmount,
      currency: currencyPricing.code,
      receipt: receiptId,
      notes: {
        userId,
        tier,
        interval,
        customerEmail: customerEmail || '',
      },
    });

    // Save pending state on server with authoritative pendingTier & pendingInterval
    const existing = subscriptionsCache[userId];
    subscriptionsCache[userId] = {
      userId,
      status: 'PAYMENT_PENDING',
      plan: existing?.plan || 'free', // Remain existing or free until verified
      pendingTier: tier,
      pendingInterval: interval,
      billingInterval: interval,
      currency: currencyPricing.code,
      amount: amountInUnits,
      razorpayOrderId: order.id,
      customerEmail: customerEmail || existing?.customerEmail,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSubscriptions();

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      tier,
      interval,
    });
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to create payment order on Razorpay server.',
    });
  }
});

// 5. Verify Razorpay Payment (Cryptographic HMAC SHA256 Signature Verification)
app.post('/api/subscription/verify-payment', async (req, res) => {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required to verify payment.',
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tier,
      interval,
    } = req.body;
    const userId = authUser.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters (order_id, payment_id, or signature).',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        error: 'Server error: RAZORPAY_KEY_SECRET is not configured on the server.',
      });
    }

    // Security check: Verify order belongs to active pending record for this user
    const existing = subscriptionsCache[userId];
    if (existing && existing.razorpayOrderId && existing.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        error: 'Order mismatch: Payment does not match the active pending order for this account.',
      });
    }

    // Step 1: Cryptographic HMAC SHA256 verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn(`[SECURITY] Invalid Razorpay signature attempt for userId ${userId}`);
      if (subscriptionsCache[userId]) {
        subscriptionsCache[userId].status = 'PAYMENT_FAILED';
        subscriptionsCache[userId].failureReason = 'Signature mismatch';
        subscriptionsCache[userId].updatedAt = new Date().toISOString();
        saveSubscriptions();
      }
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Invalid signature. Payment will not be activated.',
      });
    }

    // Step 2: Query Razorpay API to double check payment capture status
    const razorpay = getRazorpay();
    if (razorpay) {
      try {
        const paymentDetails = (await razorpay.payments.fetch(razorpay_payment_id)) as any;
        if (paymentDetails && paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
          console.warn(`[SECURITY] Payment ${razorpay_payment_id} status is ${paymentDetails.status}`);
          return res.status(400).json({
            success: false,
            error: `Payment is in ${paymentDetails.status} state. Only captured payments can activate subscriptions.`,
          });
        }
      } catch (fetchErr) {
        console.warn('Razorpay payment fetch check skipped or returned error:', fetchErr);
      }
    }

    // Step 3: Enforce verified tier & interval from authoritative pending state
    // Prevents client payload manipulation from upgrading Plus payment to Pro tier!
    const verifiedTier: PlanType =
      existing?.pendingTier === 'pro'
        ? 'pro'
        : existing?.pendingTier === 'plus'
        ? 'plus'
        : tier === 'pro'
        ? 'pro'
        : 'plus';

    const verifiedInterval: BillingInterval =
      existing?.pendingInterval === 'yearly'
        ? 'yearly'
        : existing?.pendingInterval === 'monthly'
        ? 'monthly'
        : interval === 'yearly'
        ? 'yearly'
        : 'monthly';

    const now = new Date();
    const startDate = now.toISOString();
    const renewalDate = calculateRenewalDate(verifiedInterval, now);

    subscriptionsCache[userId] = {
      userId,
      status: 'ACTIVE',
      plan: verifiedTier,
      billingInterval: verifiedInterval,
      startDate,
      renewalDate,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      customerEmail: subscriptionsCache[userId]?.customerEmail,
      createdAt: subscriptionsCache[userId]?.createdAt || startDate,
      updatedAt: startDate,
    };
    saveSubscriptions();

    console.log(`[SUBSCRIPTION] User ${userId} upgraded to ${verifiedTier.toUpperCase()} (${verifiedInterval})`);

    return res.json({
      success: true,
      status: 'ACTIVE',
      plan: verifiedTier,
      startDate,
      renewalDate,
      message: `Payment verified successfully! NAVIKO ${verifiedTier.toUpperCase()} is now active.`,
    });
  } catch (err: any) {
    console.error('Error verifying Razorpay payment:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error during payment verification.',
    });
  }
});

// 6. Cancel Subscription (Protected with IDOR validation)
app.post('/api/subscription/cancel', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  const { userId: clientUserId } = req.body;
  const userId = authUser ? authUser.id : clientUserId;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'User identifier is required.' });
  }

  // IDOR Protection: If userId belongs to a registered account, caller must be authenticated as that user!
  if (usersCache[userId]) {
    if (!authUser || authUser.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You must be authenticated as the account owner to cancel this subscription.',
      });
    }
  }

  if (!subscriptionsCache[userId]) {
    return res.status(400).json({ success: false, error: 'Subscription not found for this user.' });
  }

  const sub = subscriptionsCache[userId];
  sub.status = 'CANCELLED';
  sub.plan = 'free';
  sub.updatedAt = new Date().toISOString();
  saveSubscriptions();

  return res.json({
    success: true,
    status: 'CANCELLED',
    plan: 'free',
    message: 'Subscription has been cancelled.',
  });
});

// 7. Authorize feature execution (Server-side authorization guard with authentication support)
app.post('/api/subscription/authorize-feature', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  const { userId: clientUserId, requiredTier } = req.body;
  const effectiveUserId = authUser ? authUser.id : clientUserId;

  // If user passed a registered user's ID without valid authentication, reject
  if (!authUser && clientUserId && usersCache[clientUserId]) {
    return res.status(401).json({
      authorized: false,
      plan: 'free',
      message: 'Authentication required to authorize features for this account.',
    });
  }

  if (!effectiveUserId) {
    return res.status(400).json({
      authorized: false,
      plan: 'free',
      message: 'User identifier is required.',
    });
  }

  const isAuthorized = hasActiveSubscription(effectiveUserId);
  const sub = getUserSubscription(effectiveUserId);

  if (!isAuthorized) {
    return res.status(403).json({
      authorized: false,
      plan: 'free',
      message: 'Active Premium subscription or 7-day trial required to access this resource.',
    });
  }

  // Active trial grants full feature access
  if (sub?.status === 'TRIAL_ACTIVE' || sub?.plan === 'trial') {
    return res.json({
      authorized: true,
      plan: 'trial',
      isTrial: true,
      trialEndsAt: sub.trialEndsAt,
    });
  }

  if (requiredTier === 'pro' && sub?.plan !== 'pro') {
    return res.status(403).json({
      authorized: false,
      plan: sub?.plan || 'plus',
      message: 'NAVIKO Pro subscription required for this feature.',
    });
  }

  return res.json({
    authorized: true,
    plan: sub?.plan || 'free',
  });
});

// 8. Razorpay Webhook Endpoint (Idempotent with signature verification)
// Supports both /api/subscription/webhook and /api/razorpay/webhook routes
app.post(['/api/subscription/webhook', '/api/razorpay/webhook'], (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const webhookSignature = req.headers['x-razorpay-signature'] as string;

  if (webhookSecret && webhookSignature) {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.warn('[SECURITY] Invalid Razorpay webhook signature');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  }

  const event = req.body;
  const eventId = event?.id || event?.event_id;

  // Idempotency: Check if already processed
  if (eventId && processedEventsCache.has(eventId)) {
    return res.json({ status: 'ignored_duplicate', eventId });
  }

  const eventType = event?.event;
  console.log(`[WEBHOOK] Received Razorpay event: ${eventType}`);

  try {
    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const payment = event?.payload?.payment?.entity;
      const notes = payment?.notes || event?.payload?.order?.entity?.notes;
      const userId = notes?.userId;
      const isTrial = notes?.isTrial === 'true' || notes?.isTrial === true;
      const tier = notes?.tier === 'pro' ? 'pro' : 'plus';
      const interval = notes?.interval === 'monthly' ? 'monthly' : 'yearly';

      if (userId) {
        const now = new Date();
        const existing = subscriptionsCache[userId];

        if (isTrial) {
          // Idempotent trial activation
          if (existing?.status !== 'TRIAL_ACTIVE' && !existing?.trialUsed) {
            const trialStartAt = now.toISOString();
            const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            subscriptionsCache[userId] = {
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
              customerEmail: payment?.email || notes?.customerEmail,
              createdAt: existing?.createdAt || trialStartAt,
              updatedAt: trialStartAt,
            };
            saveSubscriptions();
            console.log(`[WEBHOOK] Activated ₹1 trial for user ${userId} via webhook`);
          }
        } else {
          subscriptionsCache[userId] = {
            userId,
            status: 'ACTIVE',
            plan: tier,
            billingInterval: interval,
            startDate: now.toISOString(),
            renewalDate: calculateRenewalDate(interval, now),
            razorpayOrderId: payment?.order_id,
            razorpayPaymentId: payment?.id,
            customerEmail: payment?.email || notes?.customerEmail,
            createdAt: existing?.createdAt || now.toISOString(),
            updatedAt: now.toISOString(),
          };
          saveSubscriptions();
          console.log(`[WEBHOOK] Activated subscription for user ${userId} via webhook`);
        }
      }
    } else if (eventType === 'payment.failed') {
      const payment = event?.payload?.payment?.entity;
      const notes = payment?.notes;
      const userId = notes?.userId;
      if (userId && subscriptionsCache[userId]) {
        subscriptionsCache[userId].status = 'PAYMENT_FAILED';
        subscriptionsCache[userId].failureReason = payment?.error_description || 'Payment failed';
        subscriptionsCache[userId].updatedAt = new Date().toISOString();
        saveSubscriptions();
      }
    } else if (eventType === 'subscription.cancelled') {
      const subscription = event?.payload?.subscription?.entity;
      const notes = subscription?.notes;
      const userId = notes?.userId;
      if (userId && subscriptionsCache[userId]) {
        subscriptionsCache[userId].status = 'CANCELLED';
        subscriptionsCache[userId].plan = 'free';
        subscriptionsCache[userId].updatedAt = new Date().toISOString();
        saveSubscriptions();
      }
    }

    if (eventId) {
      processedEventsCache.add(eventId);
      saveProcessedEvents();
    }

    return res.json({ status: 'ok', received: true });
  } catch (webhookErr) {
    console.error('Error processing Razorpay webhook:', webhookErr);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Explicit 404 handler for API routes (prevent HTML fallback on missing endpoints)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global API error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API ERROR]', err);
  res.status(err?.status || 500).json({
    success: false,
    error: err?.message || 'Internal server error',
  });
});

// ==========================================
// STATIC ASSETS & VITE MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NAVIKO Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
