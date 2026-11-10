import express from 'express';
import fs from 'fs';
import path from 'path';
import { TOOL_ENTITLEMENTS, FEATURE_ENTITLEMENTS, PLAN_CAPABILITIES } from '../config/entitlements';
import { PlanType } from '../config/pricing';

export type EnforcedTier = 'free' | 'plus' | 'pro' | 'business';

export interface UserSubscriptionContext {
  userId: string;
  isAuthenticated: boolean;
  userEmail?: string;
  userName?: string;
  tier: 'free' | 'plus' | 'pro' | 'business' | 'founding' | 'trial';
  tierLevel: number; // 0 = free, 1 = plus, 2 = pro / trial, 3 = business / founding
  isPaidActive: boolean;
  isTrialActive: boolean;
  trialEndsAt: string | null;
  renewalDate: string | null;
  clientIp: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      subscriptionContext?: UserSubscriptionContext;
      toolAccess?: {
        toolId: string;
        allowed: boolean;
        policyType: 'unlimited' | 'quota-based' | 'metered';
        dailyLimit: number;
        usedToday: number;
        remaining: number;
        requiredTier?: string;
      };
    }
  }
}

export const TIER_WEIGHTS: Record<string, number> = {
  free: 0,
  plus: 1,
  pro: 2,
  trial: 2, // 7-day trial grants full Pro tier capabilities
  founding: 3, // Founding members receive top-tier privileges
  business: 3,
};

// Daily usage storage
const DATA_DIR = path.join(process.cwd(), '.data');
const USAGE_QUOTAS_FILE = path.join(DATA_DIR, 'usage_quotas.json');

interface DailyUsageRecord {
  date: string; // YYYY-MM-DD
  counts: Record<string, number>; // toolId -> count
}

let usageQuotasCache: Record<string, DailyUsageRecord> = {};

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function syncUsageQuotasFromDisk(): Record<string, DailyUsageRecord> {
  try {
    if (fs.existsSync(USAGE_QUOTAS_FILE)) {
      const raw = fs.readFileSync(USAGE_QUOTAS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        usageQuotasCache = parsed;
      }
    }
  } catch (e) {
    console.warn('[MIDDLEWARE] Could not read usage quotas from disk:', e);
  }
  return usageQuotasCache;
}

export function saveUsageQuotasToDisk(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USAGE_QUOTAS_FILE, JSON.stringify(usageQuotasCache, null, 2), 'utf8');
  } catch (e) {
    console.error('[MIDDLEWARE] Failed to save usage quotas to disk:', e);
  }
}

// Initialize on load
syncUsageQuotasFromDisk();

/**
 * Returns the effective daily limit for a tool given the user's tier and dynamic policy
 */
export function getEffectiveToolDailyLimit(
  toolId: string,
  userTier: string,
  customPolicy?: any
): number {
  const entitlement = TOOL_ENTITLEMENTS[toolId];
  const policy = customPolicy || entitlement;

  if (policy?.policyType === 'unlimited') {
    return Infinity;
  }

  const normalizedTier = userTier.toLowerCase();

  if (normalizedTier === 'business' || normalizedTier === 'founding') {
    return policy?.businessDailyLimit ?? entitlement?.businessDailyLimit ?? 1000;
  }

  if (normalizedTier === 'pro' || normalizedTier === 'trial') {
    return policy?.proDailyLimit ?? entitlement?.proDailyLimit ?? 200;
  }

  if (normalizedTier === 'plus') {
    return policy?.plusDailyLimit ?? entitlement?.plusDailyLimit ?? 50;
  }

  // Free default
  return policy?.freeDailyLimit ?? entitlement?.freeDailyLimit ?? 5;
}

/**
 * Checks usage quota for a user/IP on a given tool
 */
export function checkToolQuota(
  identifier: string,
  toolId: string,
  userTier: string,
  customPolicy?: any
): {
  allowed: boolean;
  policyType: 'unlimited' | 'quota-based' | 'metered';
  dailyLimit: number;
  usedToday: number;
  remaining: number;
} {
  const entitlement = TOOL_ENTITLEMENTS[toolId];
  const policy = customPolicy || entitlement;
  const policyType = policy?.policyType || entitlement?.policyType || 'quota-based';

  if (policyType === 'unlimited') {
    return {
      allowed: true,
      policyType: 'unlimited',
      dailyLimit: Infinity,
      usedToday: 0,
      remaining: Infinity,
    };
  }

  const today = getTodayKey();
  syncUsageQuotasFromDisk();

  const userRecord = usageQuotasCache[identifier];
  let usedToday = 0;

  if (userRecord && userRecord.date === today) {
    usedToday = userRecord.counts[toolId] || 0;
  }

  const limit = getEffectiveToolDailyLimit(toolId, userTier, customPolicy);
  const remaining = Math.max(0, limit - usedToday);
  const allowed = usedToday < limit;

  return {
    allowed,
    policyType,
    dailyLimit: limit,
    usedToday,
    remaining,
  };
}

/**
 * Records tool usage on the server, incrementing daily count
 */
export function recordToolUsageServer(identifier: string, toolId: string): number {
  const today = getTodayKey();
  syncUsageQuotasFromDisk();

  if (!usageQuotasCache[identifier] || usageQuotasCache[identifier].date !== today) {
    usageQuotasCache[identifier] = {
      date: today,
      counts: {},
    };
  }

  const current = usageQuotasCache[identifier].counts[toolId] || 0;
  const updated = current + 1;
  usageQuotasCache[identifier].counts[toolId] = updated;

  saveUsageQuotasToDisk();
  return updated;
}

/**
 * Core Resolver: Extracts user identity and calculates authoritative subscription context
 */
export function resolveSubscriptionContext(
  req: express.Request,
  getUserSubscription: (userId: string) => any,
  getAuthenticatedUser: (req: express.Request) => any
): UserSubscriptionContext {
  const authUser = getAuthenticatedUser(req);
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  if (!authUser) {
    // Unauthenticated guest user
    return {
      userId: `guest_${clientIp.replace(/[^a-zA-Z0-9]/g, '_')}`,
      isAuthenticated: false,
      tier: 'free',
      tierLevel: 0,
      isPaidActive: false,
      isTrialActive: false,
      trialEndsAt: null,
      renewalDate: null,
      clientIp,
    };
  }

  const sub = getUserSubscription(authUser.id);
  const now = Date.now();

  let tier: 'free' | 'plus' | 'pro' | 'business' | 'founding' | 'trial' = 'free';
  let isPaidActive = false;
  let isTrialActive = false;
  let trialEndsAt: string | null = null;
  let renewalDate: string | null = null;

  if (sub) {
    // Check trial status
    if (sub.status === 'TRIAL_ACTIVE' || sub.plan === 'trial') {
      if (sub.trialEndsAt && new Date(sub.trialEndsAt).getTime() > now) {
        isTrialActive = true;
        tier = 'trial';
        trialEndsAt = sub.trialEndsAt;
      }
    } else if (sub.status === 'ACTIVE') {
      // Check active subscription expiration
      if (!sub.renewalDate || new Date(sub.renewalDate).getTime() > now) {
        isPaidActive = true;
        renewalDate = sub.renewalDate || null;
        const validTiers = ['plus', 'pro', 'business', 'founding'];
        tier = validTiers.includes(sub.plan) ? sub.plan : 'pro';
      }
    }
  }

  const tierLevel = TIER_WEIGHTS[tier] ?? 0;

  return {
    userId: authUser.id,
    isAuthenticated: true,
    userEmail: authUser.email,
    userName: authUser.name,
    tier,
    tierLevel,
    isPaidActive,
    isTrialActive,
    trialEndsAt,
    renewalDate,
    clientIp,
  };
}

/**
 * Creates Express middleware that attaches subscription context to every request
 */
export function createSubscriptionContextMiddleware(
  getUserSubscription: (userId: string) => any,
  getAuthenticatedUser: (req: express.Request) => any
) {
  return (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    try {
      req.subscriptionContext = resolveSubscriptionContext(
        req,
        getUserSubscription,
        getAuthenticatedUser
      );
    } catch (err) {
      console.error('[MIDDLEWARE] Error attaching subscription context:', err);
    }
    next();
  };
}

/**
 * Express Middleware: Enforces minimum subscription tier level (Free, Plus, Pro, Business)
 */
export function requireTier(
  minTier: EnforcedTier,
  options?: {
    customErrorMessage?: string;
    requireAuthForFree?: boolean;
  }
) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ctx = req.subscriptionContext;
    const requiredLevel = TIER_WEIGHTS[minTier] ?? 0;

    // If Free is required and requireAuthForFree is false, allow through
    if (requiredLevel === 0 && !options?.requireAuthForFree) {
      return next();
    }

    // If tier > Free and user is not authenticated, require authentication
    if (!ctx?.isAuthenticated) {
      return res.status(401).json({
        success: false,
        authorized: false,
        code: 'AUTH_REQUIRED',
        error:
          options?.customErrorMessage ||
          `Authentication required. Please log in or create an account to access ${minTier.toUpperCase()} features.`,
        requiredTier: minTier,
        loginUrl: '/login',
      });
    }

    // Check if user's tier weight meets the required level
    if ((ctx.tierLevel ?? 0) < requiredLevel) {
      return res.status(403).json({
        success: false,
        authorized: false,
        code: 'TIER_INSUFFICIENT',
        error:
          options?.customErrorMessage ||
          `Access Denied: NAVIKO ${minTier.toUpperCase()} subscription required to access this feature.`,
        requiredTier: minTier,
        currentTier: ctx.tier,
        upgradeUrl: `/premium?plan=${minTier}`,
        suggestedPlans: minTier === 'pro' ? ['pro', 'business', 'founding'] : ['plus', 'pro', 'business'],
      });
    }

    return next();
  };
}

/**
 * Express Middleware: Enforces access to a specific tool by checking:
 * 1. Base required tier (e.g. Plus, Pro)
 * 2. Daily Fair-Use Quota (if quota-based)
 */
export function requireToolAccess(
  toolIdOrResolver: string | ((req: express.Request) => string),
  getDynamicToolPolicy?: (toolId: string) => any
) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const toolId = typeof toolIdOrResolver === 'function' ? toolIdOrResolver(req) : toolIdOrResolver;

    if (!toolId) {
      return res.status(400).json({
        success: false,
        error: 'Tool identifier is required for access verification.',
      });
    }

    const entitlement = TOOL_ENTITLEMENTS[toolId];
    const customPolicy = getDynamicToolPolicy ? getDynamicToolPolicy(toolId) : undefined;
    const policy = customPolicy || entitlement;

    const ctx = req.subscriptionContext;
    const userTier = ctx?.tier || 'free';
    const userLevel = ctx?.tierLevel ?? 0;

    // Check required minimum tier if tool specifies one
    const requiredTier = (policy?.requiredTier || entitlement?.requiredTier) as EnforcedTier | undefined;
    if (requiredTier) {
      const requiredLevel = TIER_WEIGHTS[requiredTier] ?? 1;

      if (!ctx?.isAuthenticated) {
        return res.status(401).json({
          success: false,
          authorized: false,
          code: 'AUTH_REQUIRED',
          error: `Authentication required to access ${toolId}. Please log in or sign up.`,
          requiredTier,
          loginUrl: '/login',
        });
      }

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          authorized: false,
          code: 'TIER_INSUFFICIENT',
          error: `NAVIKO ${requiredTier.toUpperCase()} plan is required to access ${entitlement?.name || toolId}.`,
          toolId,
          requiredTier,
          currentTier: userTier,
          upgradeUrl: `/premium?plan=${requiredTier}`,
        });
      }
    }

    // Check Daily Quotas
    const identifier = ctx?.isAuthenticated && ctx.userId ? ctx.userId : `ip_${ctx?.clientIp || 'guest'}`;
    const quota = checkToolQuota(identifier, toolId, userTier, customPolicy);

    // Attach tool access metadata to request
    req.toolAccess = {
      toolId,
      allowed: quota.allowed,
      policyType: quota.policyType,
      dailyLimit: quota.dailyLimit,
      usedToday: quota.usedToday,
      remaining: quota.remaining,
      requiredTier,
    };

    if (!quota.allowed) {
      const resetTime = new Date();
      resetTime.setUTCHours(24, 0, 0, 0);

      return res.status(429).json({
        success: false,
        authorized: false,
        code: 'QUOTA_EXCEEDED',
        error: `Daily fair-use quota of ${quota.dailyLimit} operations reached for ${entitlement?.name || toolId}.`,
        toolId,
        currentTier: userTier,
        dailyLimit: quota.dailyLimit,
        usedToday: quota.usedToday,
        remaining: 0,
        resetAt: resetTime.toISOString(),
        upgradeUrl: userTier === 'free' ? '/premium?plan=plus' : '/premium?plan=pro',
      });
    }

    return next();
  };
}

/**
 * Express Middleware: Enforces access to a specific feature flag (e.g. nutrition.weeklyPlanner)
 */
export function requireFeatureAccess(featureId: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const feat = FEATURE_ENTITLEMENTS[featureId];
    if (!feat) {
      return next(); // If unlisted feature, allow default routing
    }

    const ctx = req.subscriptionContext;
    const requiredTier = feat.requiredTier as EnforcedTier;
    const requiredLevel = TIER_WEIGHTS[requiredTier] ?? 1;

    if (!ctx?.isAuthenticated) {
      return res.status(401).json({
        success: false,
        authorized: false,
        code: 'AUTH_REQUIRED',
        error: `Please log in to access ${feat.name}.`,
        featureId,
        requiredTier,
        loginUrl: '/login',
      });
    }

    if ((ctx.tierLevel ?? 0) < requiredLevel) {
      return res.status(403).json({
        success: false,
        authorized: false,
        code: 'TIER_INSUFFICIENT',
        error: `NAVIKO ${requiredTier.toUpperCase()} subscription required to unlock ${feat.name}.`,
        featureId,
        featureName: feat.name,
        requiredTier,
        currentTier: ctx.tier,
        upgradeUrl: `/premium?plan=${requiredTier}`,
      });
    }

    return next();
  };
}
