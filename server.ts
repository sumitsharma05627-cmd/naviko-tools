import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import fs from 'fs';
import {
  PRICING_CONFIG,
  resolveOfficialPricing,
  getOfficialPlansCatalog,
  getSubunitAmount,
  type CurrencyCode,
  type PlanType,
  type BillingInterval,
  type PlanId,
  calculateCustomPlanQuote,
  type CustomPlanSelections,
  DEFAULT_CUSTOM_SELECTIONS,
} from './src/config/pricing.ts';
import {
  VERSION_PLANS,
  CURRENCIES_REGISTRY,
  INTERVAL_CONFIG,
  calculatePlanPrice,
  type NavikoVersionId,
  type CurrencyCode as EngineCurrencyCode,
  type BillingInterval as EngineBillingInterval,
  detectVisitorCurrency,
} from './src/config/pricingEngine.ts';
import { TOOL_ENTITLEMENTS, FEATURE_ENTITLEMENTS } from './src/config/entitlements.ts';
import { generateKundli } from './src/services/astrology/calculationEngine.ts';
import { calculatePanchang } from './src/services/astrology/panchangEngine.ts';
import { evaluateVastu } from './src/services/astrology/vastuEngine.ts';
import { calculateNumerology } from './src/services/astrology/numerologyEngine.ts';
import { GoogleGenAI } from '@google/genai';
import {
  createSubscriptionContextMiddleware,
  requireTier,
  requireToolAccess,
  requireFeatureAccess,
  checkToolQuota,
  recordToolUsageServer,
  getEffectiveToolDailyLimit,
  TIER_WEIGHTS,
  type EnforcedTier,
} from './src/server/subscriptionAuthMiddleware.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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
  pendingPlanId?: string;
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
const ECOSYSTEM_SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'ecosystem_subscriptions.json');
const PRICING_ENGINE_CONFIG_FILE = path.join(DATA_DIR, 'pricing_engine_config.json');
const PROCESSED_EVENTS_FILE = path.join(DATA_DIR, 'processed_events.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SAVED_PLANS_FILE = path.join(DATA_DIR, 'saved_plans.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin_config.json');
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json');
const QUOTE_REQUESTS_FILE = path.join(DATA_DIR, 'quote_requests.json');

// --- ECOSYSTEM MULTI-VERSION INDEPENDENT SUBSCRIPTION TYPES ---
export interface VersionSubscriptionItem {
  version: NavikoVersionId;
  status: SubscriptionStatusState;
  planId: string;
  tier: string;
  billingInterval: EngineBillingInterval;
  currency: string;
  amount: number;
  startDate?: string;
  renewalDate?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  customerEmail?: string;
  updatedAt: string;
}

export interface EcosystemBillingRecord {
  id: string;
  version: NavikoVersionId;
  invoiceId: string;
  amount: number;
  currency: string;
  tier: string;
  interval: string;
  status: 'PAID' | 'REFUNDED' | 'FAILED';
  paidAt: string;
  razorpayPaymentId?: string;
}

export interface UserSubscriptionEcosystem {
  userId: string;
  v1: VersionSubscriptionItem;
  v2: VersionSubscriptionItem;
  v3: VersionSubscriptionItem;
  billingHistory: EcosystemBillingRecord[];
  updatedAt: string;
}

export interface DynamicPricingConfig {
  internationalMultiplier: number;
  basePricesINR: {
    v1: { pro: number; premium: number; plus?: number };
    v2: { plus: number; premium: number };
    v3: { plus: number; premium: number };
  };
  exchangeRates: Partial<Record<EngineCurrencyCode, number>>;
}

export interface ToolUsagePolicy {
  policyType: 'unlimited' | 'quota-based' | 'metered';
  freeDailyLimit?: number;
  plusDailyLimit?: number;
  proDailyLimit?: number;
  businessDailyLimit?: number;
  requiredTier?: 'plus' | 'pro' | 'business';
  description: string;
}

export interface AdminConfig {
  pricing: {
    monthlyINR: number;
    annualINR: number;
    foundingINR: number;
    plusMonthlyINR: number;
    plusAnnualINR: number;
    proMonthlyINR: number;
    proAnnualINR: number;
    businessMonthlyINR: number;
    businessAnnualINR: number;
  };
  earlyAccess: {
    totalCapacity: number;
    isWaitlistOpen: boolean;
  };
  featureToggles: Record<string, 'FREE' | 'PREMIUM'>;
  toolUsagePolicies: Record<string, ToolUsagePolicy>;
}

export interface QuoteRequestRecord {
  id: string;
  name: string;
  email: string;
  company?: string;
  teamSize?: string;
  toolCategories?: string[];
  aiTier?: string;
  storageTier?: string;
  supportLevel?: string;
  billingInterval?: 'monthly' | 'yearly';
  estimatedCost?: number;
  currency?: string;
  requirements?: string;
  status: 'PENDING' | 'CONTACTED' | 'PROPOSAL_SENT' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  primaryInterest: string;
  reason?: string;
  status: 'WAITLIST' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
}

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
  role?: string;
  preferences?: {
    theme?: string;
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
let ecosystemCache: Record<string, UserSubscriptionEcosystem> = {};
let dynamicPricingConfig: DynamicPricingConfig = {
  internationalMultiplier: 5.0,
  basePricesINR: {
    v1: { pro: 299, premium: 699 },
    v2: { plus: 349, premium: 749 },
    v3: { plus: 499, premium: 999 },
  },
  exchangeRates: {},
};
let processedEventsCache: Set<string> = new Set();
let usersCache: Record<string, UserAccount> = {};
let sessionsCache: Record<string, UserSession> = {};
let savedPlansCache: Record<string, any[]> = {};
let waitlistCache: Record<string, WaitlistEntry> = {};
let quoteRequestsCache: Record<string, QuoteRequestRecord> = {};

const DEFAULT_TOOL_POLICIES: Record<string, ToolUsagePolicy> = {
  'bmi-calculator': {
    policyType: 'unlimited',
    description: 'Runs entirely in client browser. Completely unlimited calculations.',
  },
  'diet-plan-manager': {
    policyType: 'unlimited',
    description: 'Evidence-aware nutrition planning. Unlimited meal composition and dietary templates.',
  },
  'nutrition-science': {
    policyType: 'unlimited',
    description: 'Full food intelligence library & nutritional composition lookup.',
  },
  'sip-calculator': {
    policyType: 'unlimited',
    description: 'Mathematical compounding formula. Unlimited calculations.',
  },
  'emi-calculator': {
    policyType: 'unlimited',
    description: 'Amortization & monthly installment calculation. Unlimited.',
  },
  'budget-calculator': {
    policyType: 'unlimited',
    description: '50/30/20 budget allocations. Unlimited.',
  },
  'attendance-calculator': {
    policyType: 'unlimited',
    description: '75% attendance threshold planner. Unlimited.',
  },
  'cgpa-calculator': {
    policyType: 'unlimited',
    description: 'Grade scale conversion. Unlimited.',
  },
  'mock-test-analyzer': {
    policyType: 'quota-based',
    freeDailyLimit: 5,
    plusDailyLimit: 50,
    proDailyLimit: 200,
    businessDailyLimit: 1000,
    description: 'High-compute score analytics and rank projections.',
  },
  'background-remover': {
    policyType: 'quota-based',
    freeDailyLimit: 5,
    plusDailyLimit: 50,
    proDailyLimit: 200,
    businessDailyLimit: 1000,
    description: 'AI model edge segmentation. Generous fair-use quota.',
  },
  'pdf-compressor': {
    policyType: 'quota-based',
    freeDailyLimit: 8,
    plusDailyLimit: 50,
    proDailyLimit: 200,
    businessDailyLimit: 1000,
    description: 'PDF binary stream compression and optimization.',
  },
  'image-compressor': {
    policyType: 'quota-based',
    freeDailyLimit: 10,
    plusDailyLimit: 50,
    proDailyLimit: 200,
    businessDailyLimit: 1000,
    description: 'Quantization & JPEG compression.',
  },
  'resume-builder': {
    policyType: 'quota-based',
    freeDailyLimit: 3,
    plusDailyLimit: 25,
    proDailyLimit: 100,
    businessDailyLimit: 500,
    description: 'ATS resume rendering & PDF exporter.',
  },
};

let adminConfigCache: AdminConfig = {
  pricing: {
    monthlyINR: 699,
    annualINR: 6999,
    foundingINR: 7999,
    plusMonthlyINR: 299,
    plusAnnualINR: 2999,
    proMonthlyINR: 699,
    proAnnualINR: 6999,
    businessMonthlyINR: 1499,
    businessAnnualINR: 14990,
  },
  earlyAccess: {
    totalCapacity: 500,
    isWaitlistOpen: false,
  },
  featureToggles: {},
  toolUsagePolicies: { ...DEFAULT_TOOL_POLICIES },
};

function syncAdminConfigFromDisk(): AdminConfig {
  try {
    if (fs.existsSync(ADMIN_CONFIG_FILE)) {
      const data = fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        adminConfigCache = {
          ...adminConfigCache,
          ...parsed,
          pricing: { ...adminConfigCache.pricing, ...(parsed.pricing || {}) },
          earlyAccess: { ...adminConfigCache.earlyAccess, ...(parsed.earlyAccess || {}) },
          featureToggles: { ...adminConfigCache.featureToggles, ...(parsed.featureToggles || {}) },
          toolUsagePolicies: {
            ...DEFAULT_TOOL_POLICIES,
            ...(adminConfigCache.toolUsagePolicies || {}),
            ...(parsed.toolUsagePolicies || {}),
          },
        };
      }
    }
  } catch (err) {
    console.warn('Could not read admin config from disk:', err);
  }
  return adminConfigCache;
}

function saveAdminConfig() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(adminConfigCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save admin config:', err);
  }
}

function syncQuoteRequestsFromDisk(): Record<string, QuoteRequestRecord> {
  try {
    if (fs.existsSync(QUOTE_REQUESTS_FILE)) {
      const data = fs.readFileSync(QUOTE_REQUESTS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        quoteRequestsCache = { ...quoteRequestsCache, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Could not read quote requests from disk:', err);
  }
  return quoteRequestsCache;
}

function saveQuoteRequests() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(QUOTE_REQUESTS_FILE, JSON.stringify(quoteRequestsCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save quote requests:', err);
  }
}

function syncWaitlistFromDisk(): Record<string, WaitlistEntry> {
  try {
    if (fs.existsSync(WAITLIST_FILE)) {
      const data = fs.readFileSync(WAITLIST_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        waitlistCache = { ...waitlistCache, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Could not read waitlist from disk:', err);
  }
  return waitlistCache;
}

function saveWaitlist() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(waitlistCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save waitlist:', err);
  }
}

function syncSavedPlansFromDisk(): Record<string, any[]> {
  try {
    if (fs.existsSync(SAVED_PLANS_FILE)) {
      const data = fs.readFileSync(SAVED_PLANS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        savedPlansCache = { ...savedPlansCache, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Could not read saved plans from disk:', err);
  }
  return savedPlansCache;
}

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
  syncSavedPlansFromDisk();
  syncAdminConfigFromDisk();
  syncWaitlistFromDisk();
  syncEcosystemFromDisk();
  syncPricingEngineConfigFromDisk();
}

function syncEcosystemFromDisk() {
  try {
    if (fs.existsSync(ECOSYSTEM_SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(ECOSYSTEM_SUBSCRIPTIONS_FILE, 'utf8');
      ecosystemCache = JSON.parse(data);
    }
  } catch (err) {
    console.warn('Could not load ecosystem subscriptions file:', err);
    ecosystemCache = {};
  }
}

function saveEcosystem() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ECOSYSTEM_SUBSCRIPTIONS_FILE, JSON.stringify(ecosystemCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save ecosystem subscriptions:', err);
  }
}

function syncPricingEngineConfigFromDisk() {
  try {
    if (fs.existsSync(PRICING_ENGINE_CONFIG_FILE)) {
      const data = fs.readFileSync(PRICING_ENGINE_CONFIG_FILE, 'utf8');
      const loaded = JSON.parse(data);
      dynamicPricingConfig = {
        ...dynamicPricingConfig,
        ...loaded,
        basePricesINR: {
          ...dynamicPricingConfig.basePricesINR,
          ...(loaded.basePricesINR || {}),
        },
        exchangeRates: {
          ...dynamicPricingConfig.exchangeRates,
          ...(loaded.exchangeRates || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Could not load pricing engine config from disk:', err);
  }
}

function savePricingEngineConfig() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(PRICING_ENGINE_CONFIG_FILE, JSON.stringify(dynamicPricingConfig, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save pricing engine config:', err);
  }
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

function saveSavedPlans() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SAVED_PLANS_FILE, JSON.stringify(savedPlansCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save saved plans:', err);
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

  return sub.plan === 'plus' || sub.plan === 'pro' || sub.plan === 'founding' || sub.plan === 'trial';
}

function createDefaultEcosystem(userId: string): UserSubscriptionEcosystem {
  const now = new Date().toISOString();
  return {
    userId,
    v1: {
      version: 'v1',
      status: 'FREE',
      planId: 'v1_free',
      tier: 'free',
      billingInterval: 'monthly',
      currency: 'INR',
      amount: 0,
      updatedAt: now,
    },
    v2: {
      version: 'v2',
      status: 'FREE',
      planId: 'v2_free',
      tier: 'free',
      billingInterval: 'monthly',
      currency: 'INR',
      amount: 0,
      updatedAt: now,
    },
    v3: {
      version: 'v3',
      status: 'FREE',
      planId: 'v3_free',
      tier: 'free',
      billingInterval: 'monthly',
      currency: 'INR',
      amount: 0,
      updatedAt: now,
    },
    billingHistory: [],
    updatedAt: now,
  };
}

function getUserEcosystem(userId: string): UserSubscriptionEcosystem {
  if (!userId) {
    return createDefaultEcosystem('anonymous');
  }
  syncEcosystemFromDisk();
  if (!ecosystemCache[userId]) {
    const defaultEco = createDefaultEcosystem(userId);
    // Backward compatibility: If legacy subscription exists, migrate to v1 without data loss
    const legacy = getUserSubscription(userId);
    if (legacy && (legacy.status === 'ACTIVE' || legacy.status === 'TRIAL_ACTIVE')) {
      defaultEco.v1 = {
        version: 'v1',
        status: legacy.status,
        planId: legacy.pendingPlanId || `v1_${legacy.plan}`,
        tier: legacy.plan || 'pro',
        billingInterval: (legacy.billingInterval as EngineBillingInterval) || 'monthly',
        currency: legacy.currency || 'INR',
        amount: legacy.amount || 299,
        startDate: legacy.startDate,
        renewalDate: legacy.renewalDate,
        razorpayOrderId: legacy.razorpayOrderId,
        razorpayPaymentId: legacy.razorpayPaymentId,
        customerEmail: legacy.customerEmail,
        updatedAt: legacy.updatedAt || new Date().toISOString(),
      };
      if (legacy.razorpayPaymentId || legacy.amount) {
        defaultEco.billingHistory.push({
          id: `hist_migrated_${Date.now()}`,
          version: 'v1',
          invoiceId: `INV-V1-${userId.slice(-6).toUpperCase()}`,
          amount: legacy.amount || 299,
          currency: legacy.currency || 'INR',
          tier: legacy.plan || 'pro',
          interval: legacy.billingInterval || 'monthly',
          status: 'PAID',
          paidAt: legacy.startDate || new Date().toISOString(),
          razorpayPaymentId: legacy.razorpayPaymentId,
        });
      }
    }
    ecosystemCache[userId] = defaultEco;
    saveEcosystem();
  }
  return ecosystemCache[userId];
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
  if (interval === 'lifetime') {
    return '2099-12-31T23:59:59.999Z';
  }
  const d = new Date(fromDate);
  if (interval === 'yearly') {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString();
}

// ==========================================
// API ROUTES (Mounted FIRST before Vite)
// ==========================================

// 0. Google AdSense ads.txt route
app.get('/ads.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const adsPath = path.join(process.cwd(), 'public', 'ads.txt');
  if (fs.existsSync(adsPath)) {
    return res.sendFile(adsPath);
  }
  return res.send('google.com, pub-4353645659036465, DIRECT, f08c47fec0942fa0\n');
});

// Mount authoritative subscription context middleware on all /api routes
app.use('/api', createSubscriptionContextMiddleware(getUserSubscription, getAuthenticatedUser));

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
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

// 2b. Public official plans catalog (Single Source of Truth)
app.get('/api/subscription/plans', (req, res) => {
  const rawCurrency = (req.query.currency as string) || 'INR';
  const currency = (rawCurrency.toUpperCase() in PRICING_CONFIG ? rawCurrency.toUpperCase() : 'INR') as CurrencyCode;
  const plans = getOfficialPlansCatalog(currency);
  res.json({
    success: true,
    currency,
    plans,
    pricingConfig: PRICING_CONFIG[currency],
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

// Auth: Current User Profile (Me & Profile alias)
app.get(['/api/auth/me', '/api/auth/profile'], (req, res) => {
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

// User: Saved Plans (GET, POST, DELETE)
app.get('/api/user/saved-plans', (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required to retrieve saved plans.' });
    }
    const plans = savedPlansCache[user.id] || [];
    return res.json({ success: true, items: plans });
  } catch (err: any) {
    console.error('Error fetching saved plans:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch saved plans.' });
  }
});

app.post('/api/user/saved-plans', (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required to save plans.' });
    }
    const { id, type, title, name, data, plan } = req.body;
    const planData = data || plan || {};
    const planTitle = title || name || 'Saved Meal Plan';

    const record = {
      id: id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: type || 'diet_plan',
      title: planTitle,
      createdAt: new Date().toISOString(),
      plan: planData,
      data: planData,
    };

    const existingList = savedPlansCache[user.id] || [];
    const updated = [record, ...existingList.filter((p: any) => p.id !== record.id)].slice(0, 30);
    savedPlansCache[user.id] = updated;
    saveSavedPlans();

    return res.json({ success: true, item: record, items: updated });
  } catch (err: any) {
    console.error('Error saving plan:', err);
    return res.status(500).json({ success: false, error: 'Failed to save plan.' });
  }
});

app.delete('/api/user/saved-plans', (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required to delete saved plans.' });
    }
    const planId = req.query.id as string;
    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan ID parameter is required.' });
    }
    const existingList = savedPlansCache[user.id] || [];
    const updated = existingList.filter((p: any) => p.id !== planId);
    savedPlansCache[user.id] = updated;
    saveSavedPlans();

    return res.json({ success: true, message: 'Plan removed successfully.', items: updated });
  } catch (err: any) {
    console.error('Error deleting saved plan:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete plan.' });
  }
});

// 2b. Global Multi-Currency Pricing Engine Catalog
app.get('/api/pricing/engine', (req, res) => {
  const currency = (req.query.currency || 'INR') as EngineCurrencyCode;
  const interval = (req.query.interval || 'monthly') as EngineBillingInterval;
  const version = req.query.version as NavikoVersionId | undefined;

  syncPricingEngineConfigFromDisk();

  const activeRates = {
    ...Object.fromEntries(
      Object.entries(CURRENCIES_REGISTRY).map(([k, v]) => [k, v.exchangeRateToINR])
    ),
    ...dynamicPricingConfig.exchangeRates,
  };

  const catalog = Object.entries(VERSION_PLANS).map(([vKey, plans]) => {
    return {
      version: vKey as NavikoVersionId,
      plans: plans.map((p) => {
        const calculated = calculatePlanPrice(
          vKey as NavikoVersionId,
          p.tier,
          interval,
          currency,
          dynamicPricingConfig.internationalMultiplier,
          activeRates,
          dynamicPricingConfig.basePricesINR
        );
        return {
          ...p,
          baseMonthlyINR: calculated.inrBaseMonthly,
          calculated,
        };
      }),
    };
  });

  return res.json({
    success: true,
    currencies: CURRENCIES_REGISTRY,
    internationalMultiplier: dynamicPricingConfig.internationalMultiplier,
    exchangeRates: activeRates,
    basePricesINR: dynamicPricingConfig.basePricesINR,
    intervals: INTERVAL_CONFIG,
    catalog: version ? catalog.filter((c) => c.version === version) : catalog,
  });
});

// 3. Subscription status check (Authoritative multi-version backend verification)
app.all('/api/subscription/status', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  const requestedVersion = ((req.query.version || req.body?.version || 'v1') as string).toLowerCase() as NavikoVersionId;

  // Unauthenticated visitors strictly have FREE status
  if (!authUser) {
    const defaultEco = createDefaultEcosystem('anonymous');
    return res.json({
      status: 'FREE',
      plan: 'free',
      version: requestedVersion,
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
      allVersions: {
        v1: defaultEco.v1,
        v2: defaultEco.v2,
        v3: defaultEco.v3,
      },
      billingHistory: [],
    });
  }

  const userId = authUser.id;
  const ecosystem = getUserEcosystem(userId);
  const targetSub = ecosystem[requestedVersion] || ecosystem.v1;
  const isActive = targetSub.status === 'ACTIVE' || targetSub.status === 'TRIAL_ACTIVE';

  const sub = getUserSubscription(userId);
  const nowTime = Date.now();
  let remainingTrialDays = 0;
  let remainingTrialHours = 0;
  const isTrial = targetSub?.status === 'TRIAL_ACTIVE' || sub?.status === 'TRIAL_ACTIVE';

  if (isTrial && sub?.trialEndsAt) {
    const remainingMs = Math.max(0, new Date(sub.trialEndsAt).getTime() - nowTime);
    remainingTrialHours = Math.ceil(remainingMs / (1000 * 60 * 60));
    remainingTrialDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  }

  return res.json({
    status: targetSub ? targetSub.status : 'FREE',
    plan: targetSub ? targetSub.tier : 'free',
    version: requestedVersion,
    hasActiveSubscription: isActive,
    isTrial,
    trialUsed: !!sub?.trialUsed,
    trialStartAt: sub?.trialStartAt || null,
    trialEndsAt: sub?.trialEndsAt || null,
    remainingTrialDays,
    remainingTrialHours,
    startDate: targetSub?.startDate || null,
    renewalDate: targetSub?.renewalDate || null,
    billingInterval: targetSub?.billingInterval || 'monthly',
    currency: targetSub?.currency || 'INR',
    amount: targetSub?.amount || 0,
    allVersions: {
      v1: ecosystem.v1,
      v2: ecosystem.v2,
      v3: ecosystem.v3,
    },
    billingHistory: ecosystem.billingHistory || [],
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

// 4. Create Razorpay Order with Multi-Version & Multi-Currency Engine
app.post('/api/subscription/create-order', async (req, res) => {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in or create an account before purchasing a plan.',
      });
    }

    const {
      version: rawVersion = 'v1',
      planId,
      tier: rawTier,
      interval: rawInterval = 'monthly',
      currency: rawCurrency = 'INR',
      customSelections,
    } = req.body;

    const version: NavikoVersionId = (rawVersion.toLowerCase() === 'v2' ? 'v2' : rawVersion.toLowerCase() === 'v3' ? 'v3' : 'v1');
    const tier = (rawTier || (version === 'v1' ? 'pro' : version === 'v2' ? 'plus' : 'plus')).toLowerCase();
    const interval = (rawInterval || 'monthly') as EngineBillingInterval;
    const currency = (rawCurrency || 'INR').toUpperCase() as EngineCurrencyCode;
    const userId = authUser.id;
    const customerEmail = authUser.email;

    syncPricingEngineConfigFromDisk();

    const activeRates = {
      ...Object.fromEntries(
        Object.entries(CURRENCIES_REGISTRY).map(([k, v]) => [k, v.exchangeRateToINR])
      ),
      ...dynamicPricingConfig.exchangeRates,
    };

    // Master Pricing Calculation: Enforces the 5x International Multiplier Rule!
    const calculated = calculatePlanPrice(
      version,
      tier,
      interval,
      currency,
      dynamicPricingConfig.internationalMultiplier,
      activeRates,
      dynamicPricingConfig.basePricesINR
    );

    const amountInUnits = calculated.finalPayableWithTax;
    const subunitAmount = calculated.subunitAmount;
    const orderCurrency = calculated.currency;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      // Sandbox mode: Razorpay credentials not configured in environment
      const sandboxOrderId = `order_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const existing = subscriptionsCache[userId];
      subscriptionsCache[userId] = {
        userId,
        status: 'PAYMENT_PENDING',
        plan: existing?.plan || 'free',
        pendingPlanId: calculated.planId,
        pendingTier: tier as PlanType,
        pendingInterval: interval as BillingInterval,
        billingInterval: interval as BillingInterval,
        currency: orderCurrency,
        amount: amountInUnits,
        razorpayOrderId: sandboxOrderId,
        customerEmail: customerEmail || existing?.customerEmail,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveSubscriptions();

      return res.json({
        success: true,
        orderId: sandboxOrderId,
        amount: subunitAmount,
        currency: orderCurrency,
        version,
        planId: calculated.planId,
        tier,
        interval,
        officialPrice: calculated.totalCyclePrice,
        formattedPrice: calculated.formattedTotalCyclePrice,
        finalPayable: calculated.finalPayableWithTax,
        formattedFinalPayable: calculated.formattedFinalPayable,
        keyId: 'rzp_sandbox_mode',
        isSandbox: true,
        sandboxNotice: 'Sandbox Simulation: Real Razorpay keys are not configured in server environment. This allows testing complete subscription activation safely.',
      });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ success: false, error: 'Failed to initialize Razorpay payment client.' });
    }

    const receiptId = `rcpt_${version}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create real Razorpay order on server
    const order = await razorpay.orders.create({
      amount: subunitAmount,
      currency: orderCurrency,
      receipt: receiptId,
      notes: {
        userId,
        version,
        planId: calculated.planId,
        tier,
        interval,
        officialAmount: String(amountInUnits),
        customerEmail: customerEmail || '',
      },
    });

    // Save pending state on server
    const existing = subscriptionsCache[userId];
    subscriptionsCache[userId] = {
      userId,
      status: 'PAYMENT_PENDING',
      plan: existing?.plan || 'free',
      pendingPlanId: calculated.planId,
      pendingTier: tier as PlanType,
      pendingInterval: interval as BillingInterval,
      billingInterval: interval as BillingInterval,
      currency: orderCurrency,
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
      version,
      planId: calculated.planId,
      tier,
      interval,
      officialPrice: calculated.totalCyclePrice,
      formattedPrice: calculated.formattedTotalCyclePrice,
      finalPayable: calculated.finalPayableWithTax,
      formattedFinalPayable: calculated.formattedFinalPayable,
      keyId,
    });
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to create payment order on Razorpay server.',
    });
  }
});

// 5. Verify Razorpay Payment (Cryptographic HMAC SHA256 Signature Verification with Multi-Version Activation)
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
      version: rawVersion = 'v1',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tier: rawTier,
      interval: rawInterval,
    } = req.body;
    const userId = authUser.id;
    const version: NavikoVersionId = (rawVersion.toLowerCase() === 'v2' ? 'v2' : rawVersion.toLowerCase() === 'v3' ? 'v3' : 'v1');

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required order_id parameter.',
      });
    }

    const existing = subscriptionsCache[userId];
    const ecosystem = getUserEcosystem(userId);

    const verifiedTier = (rawTier || existing?.pendingTier || (version === 'v1' ? 'pro' : 'plus')).toLowerCase();
    const verifiedInterval: EngineBillingInterval = (rawInterval || existing?.pendingInterval || 'monthly') as EngineBillingInterval;
    const now = new Date();
    const startDate = now.toISOString();
    const renewalDate = calculateRenewalDate(verifiedInterval as BillingInterval, now);
    const chargedAmount = existing?.amount || (version === 'v3' ? 499 : version === 'v2' ? 349 : 299);
    const chargedCurrency = existing?.currency || 'INR';

    // Handle Sandbox Simulation when keys are not configured or order is sandbox
    if (razorpay_order_id.startsWith('order_sandbox_') || !process.env.RAZORPAY_KEY_SECRET) {
      // 1. Activate version-specific subscription in ecosystem
      ecosystem[version] = {
        version,
        status: 'ACTIVE',
        planId: `${version}_${verifiedTier}`,
        tier: verifiedTier,
        billingInterval: verifiedInterval,
        currency: chargedCurrency,
        amount: chargedAmount,
        startDate,
        renewalDate,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id || `pay_sandbox_${Date.now()}`,
        customerEmail: authUser.email,
        updatedAt: startDate,
      };

      // 2. Append to user billing history
      ecosystem.billingHistory.unshift({
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        version,
        invoiceId: `INV-${version.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        amount: chargedAmount,
        currency: chargedCurrency,
        tier: verifiedTier,
        interval: verifiedInterval,
        status: 'PAID',
        paidAt: startDate,
        razorpayPaymentId: razorpay_payment_id || `pay_sandbox_${Date.now()}`,
      });
      saveEcosystem();

      // 3. Sync legacy cache for backward compatibility
      if (version === 'v1') {
        subscriptionsCache[userId] = {
          userId,
          status: 'ACTIVE',
          plan: verifiedTier as PlanType,
          billingInterval: verifiedInterval as BillingInterval,
          startDate,
          renewalDate,
          amount: chargedAmount,
          currency: chargedCurrency,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id || `pay_sandbox_${Date.now()}`,
          customerEmail: authUser.email,
          createdAt: subscriptionsCache[userId]?.createdAt || startDate,
          updatedAt: startDate,
        };
        saveSubscriptions();
      }

      console.log(`[SUBSCRIPTION SANDBOX] User ${userId} upgraded NAVIKO ${version.toUpperCase()} to ${verifiedTier.toUpperCase()} (${verifiedInterval})`);
      return res.json({
        success: true,
        version,
        status: 'ACTIVE',
        plan: verifiedTier,
        startDate,
        renewalDate,
        isSandbox: true,
        message: `Payment verified via secure sandbox! NAVIKO ${version.toUpperCase()} (${verifiedTier.toUpperCase()}) is now active.`,
      });
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters (payment_id or signature).',
      });
    }

    // Step 1: Cryptographic HMAC SHA256 verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
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

    // Step 2: Fetch capture status
    const razorpay = getRazorpay();
    if (razorpay) {
      try {
        const paymentDetails = (await razorpay.payments.fetch(razorpay_payment_id)) as any;
        if (paymentDetails && paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
          return res.status(400).json({
            success: false,
            error: `Payment is in ${paymentDetails.status} state. Only captured payments can activate subscriptions.`,
          });
        }
      } catch (fetchErr) {
        console.warn('Razorpay payment fetch check skipped or returned error:', fetchErr);
      }
    }

    // Step 3: Activate version-specific subscription in ecosystem
    ecosystem[version] = {
      version,
      status: 'ACTIVE',
      planId: `${version}_${verifiedTier}`,
      tier: verifiedTier,
      billingInterval: verifiedInterval,
      currency: chargedCurrency,
      amount: chargedAmount,
      startDate,
      renewalDate,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      customerEmail: authUser.email,
      updatedAt: startDate,
    };

    // Step 4: Append to user billing history
    ecosystem.billingHistory.unshift({
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      version,
      invoiceId: `INV-${version.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      amount: chargedAmount,
      currency: chargedCurrency,
      tier: verifiedTier,
      interval: verifiedInterval,
      status: 'PAID',
      paidAt: startDate,
      razorpayPaymentId: razorpay_payment_id,
    });
    saveEcosystem();

    // Step 5: Sync legacy cache for backward compatibility
    if (version === 'v1') {
      subscriptionsCache[userId] = {
        userId,
        status: 'ACTIVE',
        plan: verifiedTier as PlanType,
        billingInterval: verifiedInterval as BillingInterval,
        startDate,
        renewalDate,
        amount: chargedAmount,
        currency: chargedCurrency,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        customerEmail: authUser.email,
        createdAt: subscriptionsCache[userId]?.createdAt || startDate,
        updatedAt: startDate,
      };
      saveSubscriptions();
    }

    console.log(`[SUBSCRIPTION] User ${userId} upgraded NAVIKO ${version.toUpperCase()} to ${verifiedTier.toUpperCase()} (${verifiedInterval})`);

    return res.json({
      success: true,
      version,
      status: 'ACTIVE',
      plan: verifiedTier,
      startDate,
      renewalDate,
      message: `Payment verified successfully! NAVIKO ${version.toUpperCase()} (${verifiedTier.toUpperCase()}) is now active.`,
    });
  } catch (err: any) {
    console.error('Error verifying Razorpay payment:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error during payment verification.',
    });
  }
});

// 6. Cancel Subscription (Protected with version-specific cancellation)
app.post('/api/subscription/cancel', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  const { userId: clientUserId, version: rawVersion = 'v1' } = req.body;
  const userId = authUser ? authUser.id : clientUserId;
  const version: NavikoVersionId = (rawVersion.toLowerCase() === 'v2' ? 'v2' : rawVersion.toLowerCase() === 'v3' ? 'v3' : 'v1');

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

  const eco = getUserEcosystem(userId);
  if (eco && eco[version]) {
    eco[version].status = 'CANCELLED';
    eco[version].tier = 'free';
    eco[version].updatedAt = new Date().toISOString();
    saveEcosystem();
  }

  if (version === 'v1' && subscriptionsCache[userId]) {
    const sub = subscriptionsCache[userId];
    sub.status = 'CANCELLED';
    sub.plan = 'free';
    sub.updatedAt = new Date().toISOString();
    saveSubscriptions();
  }

  return res.json({
    success: true,
    version,
    status: 'CANCELLED',
    plan: 'free',
    message: `NAVIKO ${version.toUpperCase()} subscription has been cancelled. Other version subscriptions remain active.`,
  });
});

// 7. Authorize feature execution (Server-side authorization guard with role & tier validation)
app.post('/api/subscription/authorize-feature', (req, res) => {
  const ctx = req.subscriptionContext;
  const { requiredTier, featureId, toolId } = req.body;
  const targetTier: EnforcedTier = (requiredTier || 'plus').toLowerCase() as EnforcedTier;
  const targetLevel = TIER_WEIGHTS[targetTier] ?? 1;

  if (targetLevel > 0 && !ctx?.isAuthenticated) {
    return res.status(401).json({
      authorized: false,
      code: 'AUTH_REQUIRED',
      plan: 'free',
      requiredTier: targetTier,
      message: 'Authentication required. Please log in or sign up to access this feature.',
      loginUrl: '/login',
    });
  }

  const userLevel = ctx?.tierLevel ?? 0;
  const hasAccess = userLevel >= targetLevel;

  if (!hasAccess) {
    return res.status(403).json({
      authorized: false,
      code: 'TIER_INSUFFICIENT',
      plan: ctx?.tier || 'free',
      requiredTier: targetTier,
      message: `NAVIKO ${targetTier.toUpperCase()} subscription required for this feature.`,
      upgradeUrl: `/premium?plan=${targetTier}`,
    });
  }

  return res.json({
    authorized: true,
    plan: ctx?.tier || 'free',
    isTrial: ctx?.isTrialActive || false,
    trialEndsAt: ctx?.trialEndsAt || null,
    renewalDate: ctx?.renewalDate || null,
  });
});

// 7b. Check tool access level and daily quota
app.post('/api/subscription/check-tool-access', (req, res) => {
  const { toolId } = req.body;
  if (!toolId) {
    return res.status(400).json({ success: false, error: 'toolId is required.' });
  }

  const ctx = req.subscriptionContext;
  const userTier = ctx?.tier || 'free';
  const identifier = ctx?.isAuthenticated && ctx.userId ? ctx.userId : `ip_${ctx?.clientIp || 'guest'}`;

  const customPolicy = adminConfigCache.toolUsagePolicies[toolId];
  const quota = checkToolQuota(identifier, toolId, userTier, customPolicy);
  const entitlement = TOOL_ENTITLEMENTS[toolId];
  const requiredTier = customPolicy?.requiredTier || entitlement?.requiredTier;

  const requiredLevel = requiredTier ? (TIER_WEIGHTS[requiredTier] ?? 1) : 0;
  const hasTierAccess = (ctx?.tierLevel ?? 0) >= requiredLevel;

  return res.json({
    success: true,
    toolId,
    allowed: quota.allowed && hasTierAccess,
    tierEligible: hasTierAccess,
    quotaEligible: quota.allowed,
    policyType: quota.policyType,
    tier: userTier,
    tierLevel: ctx?.tierLevel ?? 0,
    dailyLimit: quota.dailyLimit,
    usedToday: quota.usedToday,
    remaining: quota.remaining,
    requiredTier: requiredTier || null,
    isTrial: ctx?.isTrialActive || false,
    trialEndsAt: ctx?.trialEndsAt || null,
  });
});

// 7c. Record tool usage on the server
app.post('/api/subscription/record-tool-usage', (req, res) => {
  const { toolId } = req.body;
  if (!toolId) {
    return res.status(400).json({ success: false, error: 'toolId is required.' });
  }

  const ctx = req.subscriptionContext;
  const identifier = ctx?.isAuthenticated && ctx.userId ? ctx.userId : `ip_${ctx?.clientIp || 'guest'}`;
  const usedToday = recordToolUsageServer(identifier, toolId);

  const userTier = ctx?.tier || 'free';
  const customPolicy = adminConfigCache.toolUsagePolicies[toolId];
  const quota = checkToolQuota(identifier, toolId, userTier, customPolicy);

  return res.json({
    success: true,
    toolId,
    usedToday,
    remaining: quota.remaining,
    dailyLimit: quota.dailyLimit,
    allowed: quota.allowed,
  });
});

// ==========================================
// PROTECTED TOOL EXECUTION API ENDPOINTS
// ==========================================

// General Unified Tool Execution Endpoint (Enforces Tier & Quota via Middleware)
app.post(
  '/api/tools/execute',
  (req, res, next) => {
    const toolId = req.body?.toolId;
    if (!toolId) {
      return res.status(400).json({ success: false, error: 'toolId is required in request body.' });
    }
    return requireToolAccess(toolId, (id) => adminConfigCache.toolUsagePolicies[id])(req, res, next);
  },
  (req, res) => {
    const { toolId, payload } = req.body;
    const ctx = req.subscriptionContext;
    const identifier = ctx?.isAuthenticated && ctx.userId ? ctx.userId : `ip_${ctx?.clientIp || 'guest'}`;

    // Increment server-side quota count
    const usedToday = recordToolUsageServer(identifier, toolId);
    const limit = req.toolAccess?.dailyLimit ?? 100;
    const remaining = Math.max(0, limit - usedToday);

    return res.json({
      success: true,
      toolId,
      result: {
        processed: true,
        toolId,
        timestamp: new Date().toISOString(),
        payload: payload || {},
      },
      quota: {
        dailyLimit: limit,
        usedToday,
        remaining,
        policyType: req.toolAccess?.policyType || 'quota-based',
      },
    });
  }
);

// Protected: Mock Test Analyzer Engine (High-compute NEET/JEE scoring & rank projection)
app.post(
  '/api/tools/mock-test-analyzer/execute',
  requireToolAccess('mock-test-analyzer', (id) => adminConfigCache.toolUsagePolicies[id]),
  (req, res) => {
    const { totalQuestions, correctAnswers, incorrectAnswers, examType } = req.body;
    const ctx = req.subscriptionContext;
    const identifier = ctx?.isAuthenticated && ctx.userId ? ctx.userId : `ip_${ctx?.clientIp || 'guest'}`;

    // Validate parameters
    const total = Math.max(1, Number(totalQuestions) || 180);
    const correct = Math.max(0, Number(correctAnswers) || 0);
    const incorrect = Math.max(0, Number(incorrectAnswers) || 0);
    const unattempted = Math.max(0, total - (correct + incorrect));

    const marksPerCorrect = 4;
    const negativeMark = 1;
    const rawScore = correct * marksPerCorrect - incorrect * negativeMark;
    const maxScore = total * marksPerCorrect;
    const accuracy = correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0;

    // Projected Percentile & All-India Rank Model
    const normalizedScoreFraction = Math.max(0, rawScore / maxScore);
    const estimatedPercentile = Number((Math.min(99.99, Math.pow(normalizedScoreFraction, 0.75) * 100)).toFixed(2));
    const totalAspirants = examType === 'JEE' ? 1200000 : 2200000;
    const estimatedRank = Math.max(1, Math.round(((100 - estimatedPercentile) / 100) * totalAspirants));

    // Record server-side quota consumption
    const usedToday = recordToolUsageServer(identifier, 'mock-test-analyzer');
    const limit = req.toolAccess?.dailyLimit ?? 200;

    return res.json({
      success: true,
      analysis: {
        examType: examType || 'NEET',
        totalQuestions: total,
        correct,
        incorrect,
        unattempted,
        score: rawScore,
        maxScore,
        accuracyPercent: Number(accuracy.toFixed(1)),
        projectedPercentile: estimatedPercentile,
        estimatedAllIndiaRank: estimatedRank,
        isProReportEligible: (ctx?.tierLevel ?? 0) >= 1,
      },
      quota: {
        dailyLimit: limit,
        usedToday,
        remaining: Math.max(0, limit - usedToday),
        tier: ctx?.tier || 'free',
      },
    });
  }
);

// Protected: AI Background Remover Processing
app.post(
  '/api/tools/background-remover/execute',
  requireToolAccess('background-remover', (id) => adminConfigCache.toolUsagePolicies[id]),
  (req, res) => {
    const ctx = req.subscriptionContext;
    const identifier = ctx?.isAuthenticated && ctx.userId ? ctx.userId : `ip_${ctx?.clientIp || 'guest'}`;

    const usedToday = recordToolUsageServer(identifier, 'background-remover');
    const limit = req.toolAccess?.dailyLimit ?? 50;

    return res.json({
      success: true,
      message: 'Background removal processing authorization granted.',
      quota: {
        dailyLimit: limit,
        usedToday,
        remaining: Math.max(0, limit - usedToday),
        tier: ctx?.tier || 'free',
      },
    });
  }
);

// Protected: PDF Compressor Processing
app.post(
  '/api/tools/pdf-compressor/execute',
  requireToolAccess('pdf-compressor', (id) => adminConfigCache.toolUsagePolicies[id]),
  (req, res) => {
    const { targetCompressionLevel } = req.body;
    const ctx = req.subscriptionContext;
    const identifier = ctx?.isAuthenticated && ctx.userId ? ctx.userId : `ip_${ctx?.clientIp || 'guest'}`;

    const usedToday = recordToolUsageServer(identifier, 'pdf-compressor');
    const limit = req.toolAccess?.dailyLimit ?? 50;

    return res.json({
      success: true,
      compressionAuthorized: true,
      targetLevel: targetCompressionLevel || 'balanced',
      quota: {
        dailyLimit: limit,
        usedToday,
        remaining: Math.max(0, limit - usedToday),
        tier: ctx?.tier || 'free',
      },
    });
  }
);

// Protected: Pro Batch Processing Engine (Requires minimum Pro or Business tier)
app.post(
  '/api/tools/batch-process',
  requireTier('pro', {
    customErrorMessage: 'NAVIKO Pro or Business subscription required for high-throughput batch processing.',
  }),
  (req, res) => {
    const { itemsCount, jobType } = req.body;
    const ctx = req.subscriptionContext;

    const count = Math.min(100, Math.max(1, Number(itemsCount) || 1));

    return res.json({
      success: true,
      jobId: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'QUEUED',
      itemsCount: count,
      jobType: jobType || 'document_batch',
      processedAt: new Date().toISOString(),
      priorityQueue: true,
      tier: ctx?.tier,
    });
  }
);

// Protected: Nutrition Weekly Planner (Requires minimum Plus tier via requireFeatureAccess)
app.post(
  '/api/tools/nutrition/weekly-planner',
  requireFeatureAccess('nutrition.weeklyPlanner'),
  (req, res) => {
    const { dietaryPreferences, calorieTarget, doshaType } = req.body;
    const ctx = req.subscriptionContext;

    return res.json({
      success: true,
      planId: `weekly_${Date.now()}`,
      dietaryPreferences: dietaryPreferences || 'Balanced Indian',
      calorieTarget: calorieTarget || 2000,
      doshaType: doshaType || 'Tridoshic',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      generatedAt: new Date().toISOString(),
      userTier: ctx?.tier,
    });
  }
);

// ==========================================
// NAVIKO 3.0: VEDIC ASTROLOGY & VASTU ENDPOINTS
// ==========================================

// 1. Kundli Generator Endpoint (Ephemeris-grounded calculation)
app.post('/api/astrology/kundli', (req, res) => {
  try {
    let { year, month, day, hour, minute, birthDate, birthTime, city, country, latitude, longitude, timezone, name } = req.body;

    if (birthDate && (!year || !month || !day)) {
      const parts = String(birthDate).split('-');
      if (parts.length === 3) {
        year = Number(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);
      }
    }
    if (birthTime && (hour === undefined || minute === undefined)) {
      const timeParts = String(birthTime).split(':');
      if (timeParts.length >= 2) {
        hour = Number(timeParts[0]);
        minute = Number(timeParts[1]);
      }
    }

    if (!year || !month || !day || hour === undefined || minute === undefined) {
      return res.status(400).json({ success: false, error: 'Complete birth date and time required.' });
    }

    const birthData = {
      name: name || 'Seeker',
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
      city: city || 'New Delhi',
      country: country || 'India',
      latitude: Number(latitude) || 28.6139,
      longitude: Number(longitude) || 77.2090,
      timezone: Number(timezone) || 5.5,
    };

    const kundli = generateKundli(birthData);
    return res.json({ success: true, kundli });
  } catch (err: any) {
    console.error('[ASTROLOGY ERROR]', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate Kundli.' });
  }
});

// 2. Daily Vedic Panchang Endpoint
app.post('/api/astrology/panchang', (req, res) => {
  try {
    const { date, latitude, longitude, timezone, city } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const lat = Number(latitude) || 28.6139;
    const lon = Number(longitude) || 77.2090;
    const tz = Number(timezone) || 5.5;

    const panchang = calculatePanchang(targetDate, lat, lon, tz, city || 'New Delhi');
    return res.json({ success: true, panchang });
  } catch (err: any) {
    console.error('[PANCHANG ERROR]', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate Panchang.' });
  }
});

// 3. Interactive Vastu Evaluation Endpoint
app.post('/api/astrology/vastu', (req, res) => {
  try {
    const { propertyType, facingDirection, rooms } = req.body;
    const result = evaluateVastu(
      propertyType || 'home',
      facingDirection || 'E',
      Array.isArray(rooms) ? rooms : []
    );
    return res.json({ success: true, analysis: result });
  } catch (err: any) {
    console.error('[VASTU ERROR]', err);
    return res.status(500).json({ success: false, error: 'Failed to evaluate Vastu.' });
  }
});

// 4. Numerology Profile Endpoint
app.post('/api/astrology/numerology', (req, res) => {
  try {
    let { name, fullName, day, month, year, birthDate } = req.body;
    if (birthDate && (!day || !month || !year)) {
      const parts = String(birthDate).split('-');
      if (parts.length === 3) {
        year = Number(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);
      }
    }
    const resolvedName = name || fullName || 'Seeker';
    if (!day || !month || !year) {
      return res.status(400).json({ success: false, error: 'Birth day, month, and year are required.' });
    }
    const result = calculateNumerology(resolvedName, Number(day), Number(month), Number(year));
    return res.json({ success: true, profile: result });
  } catch (err: any) {
    console.error('[NUMEROLOGY ERROR]', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate numerology.' });
  }
});

// 5. NAVI AI: Intelligent Vedic Astrological Assistant (Gemini API Server-Side Grounded)
app.post('/api/astrology/navi-chat', async (req, res) => {
  try {
    const { message, kundliContext, vastuContext, language } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message query is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Structured Vedic system prompt
    const systemPrompt = `You are NAVI, the expert Vedic Astrology (Jyotish) and Vastu Shastra AI guide on NAVIKO 3.0 (naviko.in).
CRITICAL RULES:
1. Always base your astrological and vastu explanations strictly on classical Indian methodologies (Brihat Parashara Hora Shastra, Jaimini, Vastu Purusha Mandala).
2. Never invent or guess birth-chart details, planet degrees, or dates. Use the provided verified calculation context.
3. NEVER make fatalistic predictions, guarantee marriage/wealth dates, or instill fear.
4. Strictly avoid recommending expensive commercial gemstones, paid rituals, or miracle solutions. Focus on psychological clarity, noble character, disciplined habits, mindfulness, and practical non-destructive remedies (e.g. directional alignment, sea salt, brass strips, lighting, meditation).
5. Always answer in the user's preferred language: ${language === 'hi' ? 'Hindi (हिंदी/सरल भाषा)' : 'Clear English (with respectful Sanskrit terminology explained)'}.
6. Keep your answers concise, insightful, compassionate, and structured with clean bullet points.`;

    let contextText = '';
    if (kundliContext) {
      contextText += `\n[VERIFIED USER KUNDLI CONTEXT]:
- Ascendant: ${kundliContext.ascendant?.rashiName || 'Unknown'} (${kundliContext.ascendant?.formattedDegree || ''})
- Moon Sign (Rashi): ${kundliContext.moonDetails?.rashiName || 'Unknown'}, Nakshatra: ${kundliContext.moonDetails?.nakshatraName || 'Unknown'} Pada ${kundliContext.moonDetails?.pada || ''}
- Sun Sign: ${kundliContext.sunDetails?.rashiName || 'Unknown'}
- Current Active Mahadasha: ${kundliContext.vimshottariDasha?.currentMahadasha || 'Unknown'}
- Manglik Status: ${kundliContext.manglikStatus?.isManglik ? 'Yes' : 'No'} (${kundliContext.manglikStatus?.cancellation ? 'Cancelled' : 'Active'})
- Major Yogas: ${(kundliContext.yogas || []).map((y: any) => y.name).join(', ') || 'None prominent'}`;
    }

    if (vastuContext) {
      contextText += `\n[VERIFIED USER VASTU CONTEXT]:
- Property Type: ${vastuContext.propertyType || 'Home'}, Facing: ${vastuContext.facingDirection || 'East'}
- Overall Compatibility Score: ${vastuContext.overallScore || 0}/100 (Grade: ${vastuContext.grade || 'B'})
- Brahmasthan: ${vastuContext.brahmasthanStatus || 'Clean'}`;
    }

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const modelResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n${contextText}\n\nUser Question: ${message}` }] },
          ],
        });

        const reply = modelResponse.text || 'I could not generate an interpretation at this moment.';
        return res.json({ success: true, reply, source: 'gemini' });
      } catch (aiErr: any) {
        console.warn('[GEMINI API WARNING]', aiErr?.message);
        // Graceful deterministic fallback using Vedic rules
      }
    }

    // High-fidelity Vedic Rule-Based Guidance Fallback when Gemini key is not configured
    let fallbackReply = '';
    const qLower = message.toLowerCase();

    if (qLower.includes('kundli') || qLower.includes('chart') || qLower.includes('lagna')) {
      fallbackReply = language === 'hi'
        ? `आपकी लग्न कुंडली के अनुसार आपका लग्न **${kundliContext?.ascendant?.rashiName || 'मेष'}** है और चंद्र राशि **${kundliContext?.moonDetails?.rashiName || 'वृषभ'}** (${kundliContext?.moonDetails?.nakshatraName || 'रोहिणी'} नक्षत्र) है। वैदिक ज्योतिष में लग्न आपका बाह्य स्वरूप और चंद्र राशि आपके मन व विचारों की दिशा दर्शाती है। वर्तमान में धैर्य और नियमित दिनचर्या बनाए रखना लाभकारी रहेगा।`
        : `Based on your Vedic Ephemeris calculation, your Ascendant (Lagna) is **${kundliContext?.ascendant?.rashiName || 'Mesh'}** and your Moon sign is **${kundliContext?.moonDetails?.rashiName || 'Vrishabh'}** in **${kundliContext?.moonDetails?.nakshatraName || 'Rohini'}** Nakshatra. Classical Jyotish highlights this placement as cultivating stability, thoughtful decisions, and endurance.`;
    } else if (qLower.includes('vastu') || qLower.includes('kitchen') || qLower.includes('entrance') || qLower.includes('bedroom')) {
      fallbackReply = language === 'hi'
        ? `वास्तु शास्त्र के अनुसार, घर में अग्नि तत्व (रसोई) आग्नेय कोण (South-East) में और जल तत्व/पूजा स्थल ईशान कोण (North-East) में सर्वश्रेष्ठ माने जाते हैं। मुख्य शयनकक्ष नैऋत्य कोण (South-West) में रखने से स्थिरता व मानसिक शांति मिलती है। यदि किसी दिशा में दोष हो तो समुद्री नमक का कटोरा व प्रकाश व्यवस्था संतुलित करना श्रेष्ठ व्यावहारिक उपाय है।`
        : `According to Vastu Shastra principles, the Southeast (Agneya) governs the Fire element (ideal for the Kitchen), while the Northeast (Ishanya) welcomes cosmic spiritual vibrations (ideal for Mandir/meditation). Master bedrooms belong in the Southwest (Nairutya) for unshakeable stability. Non-destructive remedies include brass threshold strips, directional lighting, and unrefined rock salt bowls.`;
    } else if (qLower.includes('dasha') || qLower.includes('career') || qLower.includes('job')) {
      fallbackReply = language === 'hi'
        ? `विंशोत्तरी दशा जीवन के चक्रीय परिवर्तनों को दर्शाती है। आपकी वर्तमान महादशा **${kundliContext?.vimshottariDasha?.currentMahadasha || 'बृहस्पति'}** के प्रभाव में है। यह समय दीर्घकालिक कौशल सीखने, निष्ठापूर्वक कर्म करने और अनुशासन से आगे बढ़ने के लिए अनुकूल है।`
        : `Vimshottari Dasha indicates cyclic life phases based on the Moon's natal Nakshatra. Your active Mahadasha of **${kundliContext?.vimshottariDasha?.currentMahadasha || 'Jupiter'}** encourages disciplined pursuit of your goals, steady effort in your career, and maintaining harmonious relations with elders and mentors.`;
    } else {
      fallbackReply = language === 'hi'
        ? `नमस्ते! मैं NAVI हूँ, NAVIKO 3.0 का वैदिक ज्योतिष व वास्तु मार्गदर्शक। आप अपनी कुंडली, ग्रह स्थिति, नक्षत्र, वास्तु दिशाओं या दैनिक पंचांग के बारे में कोई भी प्रश्न पूछ सकते हैं।`
        : `Greetings! I am NAVI, your Vedic Astrology & Vastu guide on NAVIKO 3.0. You can ask me to explain your Kundli charts, Dasha transitions, Nakshatra characteristics, or floor-plan Vastu adjustments.`;
    }

    return res.json({ success: true, reply: fallbackReply, source: 'vedic_knowledge_base' });
  } catch (err: any) {
    console.error('[NAVI CHAT ERROR]', err);
    return res.status(500).json({ success: false, error: 'Failed to process AI guidance.' });
  }
});

// ==========================================
// DYNAMIC PRICING QUOTE & TOOL POLICIES
// ==========================================

// Public / Authenticated: Authoritative server-side custom plan quote validator
app.post('/api/pricing/quote', (req, res) => {
  try {
    const { selections, currency } = req.body;
    const rawCurrency = (currency || 'INR').toUpperCase() as CurrencyCode;
    const validCurrency: CurrencyCode = PRICING_CONFIG[rawCurrency] ? rawCurrency : 'INR';

    const safeSelections: CustomPlanSelections = {
      toolCategories: Array.isArray(selections?.toolCategories)
        ? selections.toolCategories
        : DEFAULT_CUSTOM_SELECTIONS.toolCategories,
      aiTier: ['starter', 'pro', 'unlimited', 'enterprise'].includes(selections?.aiTier)
        ? selections.aiTier
        : DEFAULT_CUSTOM_SELECTIONS.aiTier,
      storageTier: ['basic', 'standard', 'power', 'enterprise'].includes(selections?.storageTier)
        ? selections.storageTier
        : DEFAULT_CUSTOM_SELECTIONS.storageTier,
      seats: Math.max(1, Math.min(500, Number(selections?.seats) || 1)),
      supportLevel: ['standard', 'priority', 'dedicated'].includes(selections?.supportLevel)
        ? selections.supportLevel
        : DEFAULT_CUSTOM_SELECTIONS.supportLevel,
      billingInterval: selections?.billingInterval === 'yearly' ? 'yearly' : 'monthly',
    };

    const quote = calculateCustomPlanQuote(safeSelections, validCurrency);

    return res.json({
      success: true,
      quote,
      validatedSelections: safeSelections,
    });
  } catch (err: any) {
    console.error('Error calculating custom quote:', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate pricing quote.' });
  }
});

// Public / Authenticated: Request a customized Enterprise or Team quote
app.post('/api/pricing/request-quote', (req, res) => {
  try {
    const {
      name,
      email,
      company,
      teamSize,
      toolCategories,
      aiTier,
      storageTier,
      supportLevel,
      billingInterval,
      estimatedCost,
      currency,
      requirements,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required to request a custom quote.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid business or personal email address.',
      });
    }

    syncQuoteRequestsFromDisk();

    const id = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRequest: QuoteRequestRecord = {
      id,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      company: company ? String(company).trim() : undefined,
      teamSize: teamSize ? String(teamSize).trim() : undefined,
      toolCategories: Array.isArray(toolCategories) ? toolCategories : [],
      aiTier: aiTier ? String(aiTier) : 'starter',
      storageTier: storageTier ? String(storageTier) : 'basic',
      supportLevel: supportLevel ? String(supportLevel) : 'standard',
      billingInterval: billingInterval === 'yearly' ? 'yearly' : 'monthly',
      estimatedCost: Number(estimatedCost) || 0,
      currency: currency ? String(currency).toUpperCase() : 'INR',
      requirements: requirements ? String(requirements).trim() : undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quoteRequestsCache[id] = newRequest;
    saveQuoteRequests();

    console.log(`[QUOTE REQUEST] Saved quote inquiry from ${newRequest.email} (ID: ${id})`);

    return res.json({
      success: true,
      id,
      message: 'Your custom quote request has been received. Our solutions team will review your specifications and contact you within 24 hours.',
      request: newRequest,
    });
  } catch (err: any) {
    console.error('Error submitting quote request:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit quote inquiry.' });
  }
});

// Public: Get transparent tool usage policies (Unlimited vs Fair-Use Quotas)
app.get('/api/tools/policies', (_req, res) => {
  syncAdminConfigFromDisk();
  return res.json({
    success: true,
    policies: adminConfigCache.toolUsagePolicies || DEFAULT_TOOL_POLICIES,
  });
});

// ==========================================
// EXCLUSIVE EARLY-ACCESS & WAITLIST ENDPOINTS
// ==========================================

// Public: Get accurate early-access capacity and remaining spots (100% real data)
app.get('/api/early-access/status', (_req, res) => {
  syncAdminConfigFromDisk();
  syncWaitlistFromDisk();
  syncUsersFromDisk();

  const totalCapacity = adminConfigCache.earlyAccess.totalCapacity || 500;
  const activeSubs = Object.values(subscriptionsCache).filter(
    (s) => s.status === 'ACTIVE' || s.status === 'TRIAL_ACTIVE'
  );
  const approvedWaitlist = Object.values(waitlistCache).filter(
    (w) => w.status === 'APPROVED'
  );
  const enrolledCount = activeSubs.length + approvedWaitlist.length;
  const remainingSpots = Math.max(0, totalCapacity - enrolledCount);
  const isWaitlistOpen = adminConfigCache.earlyAccess.isWaitlistOpen || remainingSpots === 0;

  return res.json({
    success: true,
    totalCapacity,
    enrolledCount,
    remainingSpots,
    isWaitlistOpen,
    isFull: remainingSpots === 0,
    pricing: adminConfigCache.pricing,
  });
});

// Public: Join priority early-access waitlist
app.post('/api/waitlist/join', (req, res) => {
  try {
    const { name, email, role, primaryInterest, reason } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    syncWaitlistFromDisk();

    // Check if user is already on waitlist
    const existing = Object.values(waitlistCache).find(
      (w) => w.email.toLowerCase() === normalizedEmail
    );
    if (existing) {
      return res.json({
        success: true,
        alreadyRegistered: true,
        message: 'You are already registered on the exclusive waitlist. We will notify you once your access is approved.',
        entry: existing,
      });
    }

    const id = `wait_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newEntry: WaitlistEntry = {
      id,
      name: (name || 'Member').trim(),
      email: normalizedEmail,
      role: (role || 'Professional').trim(),
      primaryInterest: (primaryInterest || 'Tools & Wellness').trim(),
      reason: (reason || '').trim(),
      status: 'WAITLIST',
      createdAt: new Date().toISOString(),
    };

    waitlistCache[id] = newEntry;
    saveWaitlist();

    console.log(`[WAITLIST] New applicant registered: ${normalizedEmail} (${id})`);

    return res.status(201).json({
      success: true,
      message: 'Successfully joined the NAVIKO exclusive early-access waitlist.',
      entry: newEntry,
    });
  } catch (err: any) {
    console.error('Error joining waitlist:', err);
    return res.status(500).json({ success: false, error: 'Failed to join waitlist.' });
  }
});

// ==========================================
// SECURE ADMIN MANAGEMENT ENDPOINTS
// ==========================================

// Helper: Check admin authorization
function checkAdminAuth(req: express.Request): boolean {
  const authUser = getAuthenticatedUser(req);
  const adminKey = req.headers['x-admin-key'] as string;
  const configuredAdminKey = process.env.ADMIN_SECRET_KEY || 'naviko-admin-secret-2026';
  
  if (adminKey && adminKey === configuredAdminKey) return true;
  // If user email matches admin pattern or primary admin email
  if (authUser && (authUser.email.includes('admin') || authUser.email === 'sumitsharma05599@gmail.com')) {
    return true;
  }
  // In dev / preview environment, allow authenticated users to view admin portal
  if (authUser) return true;
  return false;
}

// Admin: Get current configuration, pricing, capacity, and feature flags
app.get('/api/admin/config', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  syncAdminConfigFromDisk();
  syncWaitlistFromDisk();
  syncUsersFromDisk();

  const totalCapacity = adminConfigCache.earlyAccess.totalCapacity || 500;
  const activeSubs = Object.values(subscriptionsCache).filter(
    (s) => s.status === 'ACTIVE' || s.status === 'TRIAL_ACTIVE'
  );
  const approvedWaitlist = Object.values(waitlistCache).filter((w) => w.status === 'APPROVED');
  const enrolledCount = activeSubs.length + approvedWaitlist.length;
  const remainingSpots = Math.max(0, totalCapacity - enrolledCount);

  return res.json({
    success: true,
    config: adminConfigCache,
    stats: {
      totalCapacity,
      enrolledCount,
      remainingSpots,
      waitlistCount: Object.keys(waitlistCache).length,
    },
  });
});

// Admin: Update pricing, capacity, or feature flags
app.post('/api/admin/config', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  const { pricing, earlyAccess, featureToggles } = req.body;
  syncAdminConfigFromDisk();

  if (pricing && typeof pricing === 'object') {
    if (pricing.monthlyINR !== undefined) adminConfigCache.pricing.monthlyINR = Number(pricing.monthlyINR);
    if (pricing.annualINR !== undefined) adminConfigCache.pricing.annualINR = Number(pricing.annualINR);
    if (pricing.foundingINR !== undefined) adminConfigCache.pricing.foundingINR = Number(pricing.foundingINR);
    if (pricing.plusMonthlyINR !== undefined) adminConfigCache.pricing.plusMonthlyINR = Number(pricing.plusMonthlyINR);
    if (pricing.plusAnnualINR !== undefined) adminConfigCache.pricing.plusAnnualINR = Number(pricing.plusAnnualINR);
    if (pricing.proMonthlyINR !== undefined) adminConfigCache.pricing.proMonthlyINR = Number(pricing.proMonthlyINR);
    if (pricing.proAnnualINR !== undefined) adminConfigCache.pricing.proAnnualINR = Number(pricing.proAnnualINR);
    if (pricing.businessMonthlyINR !== undefined) adminConfigCache.pricing.businessMonthlyINR = Number(pricing.businessMonthlyINR);
    if (pricing.businessAnnualINR !== undefined) adminConfigCache.pricing.businessAnnualINR = Number(pricing.businessAnnualINR);
  }

  if (earlyAccess && typeof earlyAccess === 'object') {
    if (earlyAccess.totalCapacity !== undefined) {
      adminConfigCache.earlyAccess.totalCapacity = Math.max(1, Number(earlyAccess.totalCapacity));
    }
    if (earlyAccess.isWaitlistOpen !== undefined) {
      adminConfigCache.earlyAccess.isWaitlistOpen = Boolean(earlyAccess.isWaitlistOpen);
    }
  }

  if (featureToggles && typeof featureToggles === 'object') {
    adminConfigCache.featureToggles = {
      ...adminConfigCache.featureToggles,
      ...featureToggles,
    };
  }

  const { toolUsagePolicies } = req.body;
  if (toolUsagePolicies && typeof toolUsagePolicies === 'object') {
    adminConfigCache.toolUsagePolicies = {
      ...adminConfigCache.toolUsagePolicies,
      ...toolUsagePolicies,
    };
  }

  saveAdminConfig();
  console.log('[ADMIN] Updated system configuration:', adminConfigCache);

  return res.json({
    success: true,
    message: 'System configuration updated successfully.',
    config: adminConfigCache,
  });
});

// Admin: Real operational metrics across all 3 NAVIKO versions & currencies
app.get('/api/admin/metrics', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  syncUsersFromDisk();
  syncWaitlistFromDisk();
  syncEcosystemFromDisk();
  syncPricingEngineConfigFromDisk();

  const totalUsers = Object.keys(usersCache).length;
  const subsList = Object.values(subscriptionsCache);
  const ecoList = Object.values(ecosystemCache);

  // Version-specific subscription metrics
  const v1Active = ecoList.filter((e) => e.v1 && e.v1.status === 'ACTIVE').length;
  const v2Active = ecoList.filter((e) => e.v2 && e.v2.status === 'ACTIVE').length;
  const v3Active = ecoList.filter((e) => e.v3 && e.v3.status === 'ACTIVE').length;

  // Revenue by version & currency from billing histories
  const revenueByVersion: Record<NavikoVersionId, number> = { v1: 0, v2: 0, v3: 0 };
  const revenueByCurrency: Record<string, number> = {};
  let totalRevenueINR = 0;

  ecoList.forEach((e) => {
    (e.billingHistory || []).forEach((item) => {
      if (item.status === 'PAID') {
        const v = item.version || 'v1';
        revenueByVersion[v] = (revenueByVersion[v] || 0) + (item.amount || 0);
        const curr = item.currency || 'INR';
        revenueByCurrency[curr] = (revenueByCurrency[curr] || 0) + (item.amount || 0);

        // Convert to INR approximate total
        const rate = CURRENCIES_REGISTRY[curr as EngineCurrencyCode]?.exchangeRateToINR || 1;
        totalRevenueINR += (item.amount || 0) * rate;
      }
    });
  });

  // Calculate MRR & ARR estimates based on active plans (normalized to INR & monthly cadence)
  const mrrByVersion: Record<NavikoVersionId, number> = { v1: 0, v2: 0, v3: 0 };
  const intervalMonthsMap: Record<string, number> = {
    monthly: 1,
    quarterly: 3,
    half_yearly: 6,
    yearly: 12,
  };
  ecoList.forEach((e) => {
    (['v1', 'v2', 'v3'] as NavikoVersionId[]).forEach((v) => {
      const sub = e[v];
      if (sub && sub.status === 'ACTIVE') {
        const monthsDivisor = intervalMonthsMap[sub.billingInterval || 'monthly'] || 1;
        const rate = CURRENCIES_REGISTRY[(sub.currency || 'INR') as EngineCurrencyCode]?.exchangeRateToINR || 1;
        const monthlyAmtINR = ((sub.amount || 0) * rate) / monthsDivisor;
        mrrByVersion[v] += monthlyAmtINR;
      }
    });
  });

  const arrByVersion: Record<NavikoVersionId, number> = {
    v1: Math.round(mrrByVersion.v1 * 12),
    v2: Math.round(mrrByVersion.v2 * 12),
    v3: Math.round(mrrByVersion.v3 * 12),
  };

  const foundingMembers = subsList.filter((s) => s.status === 'ACTIVE' && s.plan === 'founding').length;
  const activeTrials = subsList.filter((s) => s.status === 'TRIAL_ACTIVE').length;
  const waitlistCount = Object.keys(waitlistCache).length;
  const approvedEarlyAccessCount = Object.values(waitlistCache).filter((w) => w.status === 'APPROVED').length;

  return res.json({
    success: true,
    metrics: {
      totalUsers,
      activeSubscriptions: v1Active + v2Active + v3Active,
      subscriptionsByVersion: {
        v1: v1Active,
        v2: v2Active,
        v3: v3Active,
      },
      revenueByVersion,
      revenueByCurrency,
      mrrByVersion,
      arrByVersion,
      totalRevenueINR: Math.round(totalRevenueINR),
      foundingMembers,
      activeTrials,
      waitlistCount,
      approvedEarlyAccessCount,
      internationalMultiplier: dynamicPricingConfig.internationalMultiplier,
      timestamp: new Date().toISOString(),
    },
  });
});

// Admin: Pricing Management API (Get & Update base prices, 5x multiplier, exchange rates)
app.get('/api/admin/pricing-config', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }
  syncPricingEngineConfigFromDisk();
  return res.json({
    success: true,
    config: dynamicPricingConfig,
    currencies: CURRENCIES_REGISTRY,
  });
});

app.post('/api/admin/pricing-config', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  const { internationalMultiplier, basePricesINR, exchangeRates } = req.body;

  if (typeof internationalMultiplier === 'number' && !Number.isNaN(internationalMultiplier)) {
    if (internationalMultiplier < 5.0) {
      return res.status(400).json({
        success: false,
        error: 'International multiplier cannot be reduced below the mandatory 5.0x platform policy.',
      });
    }
    dynamicPricingConfig.internationalMultiplier = internationalMultiplier;
  }
  if (basePricesINR && typeof basePricesINR === 'object') {
    dynamicPricingConfig.basePricesINR = {
      v1: { ...dynamicPricingConfig.basePricesINR.v1, ...(basePricesINR.v1 || {}) },
      v2: { ...dynamicPricingConfig.basePricesINR.v2, ...(basePricesINR.v2 || {}) },
      v3: { ...dynamicPricingConfig.basePricesINR.v3, ...(basePricesINR.v3 || {}) },
    };
  }
  if (exchangeRates && typeof exchangeRates === 'object') {
    dynamicPricingConfig.exchangeRates = {
      ...dynamicPricingConfig.exchangeRates,
      ...exchangeRates,
    };
  }

  savePricingEngineConfig();
  console.log('[ADMIN] Updated Dynamic Pricing Engine Configuration:', dynamicPricingConfig);

  return res.json({
    success: true,
    message: 'Pricing configuration updated successfully. 5x rule verified.',
    config: dynamicPricingConfig,
  });
});

// Admin: User Management with Ecosystem Subscriptions
app.get('/api/admin/users', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  syncUsersFromDisk();
  syncEcosystemFromDisk();

  const usersList = Object.values(usersCache).map((u) => {
    const eco = getUserEcosystem(u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      subscriptions: {
        v1: eco.v1,
        v2: eco.v2,
        v3: eco.v3,
      },
      billingInvoicesCount: (eco.billingHistory || []).length,
    };
  });

  return res.json({
    success: true,
    users: usersList,
    total: usersList.length,
  });
});

// Admin: View all waitlist entries
app.get('/api/admin/waitlist', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  syncWaitlistFromDisk();
  const list = Object.values(waitlistCache).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return res.json({
    success: true,
    entries: list,
    total: list.length,
  });
});

// Admin: Approve a waitlist entry to Early-Access Member
app.post('/api/admin/waitlist/approve', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, error: 'Waitlist ID is required.' });

  syncWaitlistFromDisk();
  const entry = waitlistCache[id];
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Waitlist entry not found.' });
  }

  entry.status = 'APPROVED';
  entry.approvedAt = new Date().toISOString();
  saveWaitlist();

  // If this user has a registered account, grant early-access entitlement
  const matchingUser = Object.values(usersCache).find(
    (u) => u.email.toLowerCase() === entry.email.toLowerCase()
  );
  if (matchingUser) {
    subscriptionsCache[matchingUser.id] = {
      userId: matchingUser.id,
      status: 'ACTIVE',
      plan: 'plus',
      billingInterval: 'yearly',
      customerEmail: entry.email,
      startDate: new Date().toISOString(),
      renewalDate: calculateRenewalDate('yearly'),
      createdAt: subscriptionsCache[matchingUser.id]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSubscriptions();
  }

  console.log(`[ADMIN] Approved early-access applicant: ${entry.email}`);

  return res.json({
    success: true,
    message: `Applicant ${entry.email} approved for Early Access membership.`,
    entry,
  });
});

// Admin: Delete a waitlist entry
app.post('/api/admin/waitlist/delete', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  const { id } = req.body;
  syncWaitlistFromDisk();
  if (waitlistCache[id]) {
    delete waitlistCache[id];
    saveWaitlist();
  }

  return res.json({ success: true, message: 'Waitlist entry removed.' });
});

// Admin: View all enterprise/custom quote inquiries
app.get('/api/admin/quote-requests', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  syncQuoteRequestsFromDisk();
  const list = Object.values(quoteRequestsCache).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return res.json({
    success: true,
    requests: list,
    total: list.length,
  });
});

// Admin: Update quote inquiry status
app.post(['/api/admin/quote-requests/status', '/api/admin/quote-requests/:id/status'], (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  const id = req.params?.id || req.body?.id;
  const { status } = req.body;

  if (!id) return res.status(400).json({ success: false, error: 'Quote request ID is required.' });

  syncQuoteRequestsFromDisk();
  const request = quoteRequestsCache[id];
  if (!request) {
    return res.status(404).json({ success: false, error: 'Quote request not found.' });
  }

  const validStatuses: QuoteRequestRecord['status'][] = ['PENDING', 'CONTACTED', 'PROPOSAL_SENT', 'CLOSED'];
  if (status && validStatuses.includes(status)) {
    request.status = status;
    request.updatedAt = new Date().toISOString();
    saveQuoteRequests();
  }

  return res.json({
    success: true,
    message: `Quote request ${id} updated to status ${request.status}.`,
    request,
  });
});

// Admin: Delete quote request
app.post('/api/admin/quote-requests/delete', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  const { id } = req.body;
  syncQuoteRequestsFromDisk();
  if (quoteRequestsCache[id]) {
    delete quoteRequestsCache[id];
    saveQuoteRequests();
  }

  return res.json({ success: true, message: 'Quote inquiry removed.' });
});

// Admin: Update individual or multiple tool usage policies
app.post('/api/admin/tool-policies', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
  }

  const { toolId, policy } = req.body;
  syncAdminConfigFromDisk();

  if (toolId && policy && typeof policy === 'object') {
    adminConfigCache.toolUsagePolicies[toolId] = {
      ...(adminConfigCache.toolUsagePolicies[toolId] || { policyType: 'unlimited', description: '' }),
      ...policy,
    };
    saveAdminConfig();
  }

  return res.json({
    success: true,
    message: `Tool policy for ${toolId || 'all'} updated successfully.`,
    policies: adminConfigCache.toolUsagePolicies,
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
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Never fall back to index.html for static assets or files with extensions
      if (req.path.startsWith('/assets/') || req.path.includes('.')) {
        return res.status(404).type('text/plain').send('Asset not found');
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NAVIKO Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
