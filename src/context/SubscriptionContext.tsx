import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  PlanType,
  BillingInterval,
  detectDefaultCurrency,
} from '../config/pricing';
import { TOOL_ENTITLEMENTS, FEATURE_ENTITLEMENTS, PLAN_CAPABILITIES } from '../config/entitlements';
import { paymentService, SubscriptionState } from '../services/payment';
import { useAuth } from './AuthContext';

export type SubscriptionStatus = SubscriptionState;

export interface UsageQuotaInfo {
  allowed: boolean;
  remaining: number;
  limit: number;
  isUpgradeRequired?: boolean;
  requiredTier?: 'plus' | 'pro';
  resetTime?: string;
}

export interface UserSavedItem {
  id: string;
  category: string;
  title: string;
  createdAt: string;
  data: any;
}

interface SubscriptionContextType {
  plan: PlanType;
  billingInterval: BillingInterval;
  currency: CurrencyCode;
  subscriptionStatus: SubscriptionStatus;
  startDate: string | null;
  renewalDate: string | null;
  customerEmail: string | null;
  userId: string;
  isTestMode: boolean;
  isTrial: boolean;
  trialUsed: boolean;
  trialStartAt: string | null;
  trialEndsAt: string | null;
  remainingTrialDays: number;
  remainingTrialHours: number;
  toggleTestMode: () => void;
  setCurrency: (currency: CurrencyCode) => void;
  setBillingInterval: (interval: BillingInterval) => void;
  canAccess: (id: string) => boolean;
  checkQuota: (id: string) => UsageQuotaInfo;
  recordUsage: (id: string) => boolean;
  upgradeToTier: (
    tier: 'plus' | 'pro',
    interval: BillingInterval,
    email?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  upgradeToPremium: (
    interval: BillingInterval,
    email?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  startTrial: (email?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  setTestPlan: (plan: PlanType) => void;
  cancelSubscription: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  authorizeFeature: (
    requiredTier?: 'plus' | 'pro'
  ) => Promise<{ authorized: boolean; plan: string; isTrial?: boolean; message?: string }>;
  savedItems: UserSavedItem[];
  saveUserItem: (category: string, title: string, data: any) => UserSavedItem;
  deleteUserItem: (id: string) => void;
  getUserItems: (category: string) => UserSavedItem[];
  resetTodayUsage: () => void;
  totalDailyUsage: number;
  dailyAiLimit: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Helper to get today's date key YYYY-MM-DD
function getTodayKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(
    now.getUTCDate()
  ).padStart(2, '0')}`;
}

// Persistent anonymous client device user identifier
function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'usr_server_render';
  try {
    let uid = localStorage.getItem('naviko_uid');
    if (!uid) {
      uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('naviko_uid', uid);
    }
    return uid;
  } catch {
    return `usr_${Date.now()}_temp`;
  }
}

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userId, setUserId] = useState<string>(() => user?.id || getOrCreateUserId());

  // Keep userId and email synced with authenticated user state
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setUserId(user.id);
      setCustomerEmail(user.email);
    } else {
      setUserId(getOrCreateUserId());
    }
  }, [isAuthenticated, user?.id, user?.email]);

  // 1. Currency state
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naviko_currency') as CurrencyCode;
      if (saved) return saved;
    }
    return detectDefaultCurrency();
  });

  // 2. Authoritative Plan state: FREE is the strict default for all users!
  const [plan, setPlan] = useState<PlanType>('free');

  const [billingInterval, setBillingIntervalState] = useState<BillingInterval>('yearly');

  // 3. Subscription Status: strictly FREE by default.
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('FREE');

  const [startDate, setStartDate] = useState<string | null>(null);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);

  const [customerEmail, setCustomerEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('naviko_user_email') || null;
    }
    return null;
  });

  // Test mode flag indicates if backend Razorpay keys are test keys (rzp_test_...)
  const [isTestMode, setIsTestMode] = useState<boolean>(false);

  // Authoritative trial states synced directly from server
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [trialUsed, setTrialUsed] = useState<boolean>(false);
  const [trialStartAt, setTrialStartAt] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [remainingTrialDays, setRemainingTrialDays] = useState<number>(0);
  const [remainingTrialHours, setRemainingTrialHours] = useState<number>(0);

  // 5. Daily Usage state (Stored per UTC date)
  const [dailyUsage, setDailyUsage] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const today = getTodayKey();
        const savedDate = localStorage.getItem('naviko_usage_date');
        if (savedDate !== today) {
          localStorage.setItem('naviko_usage_date', today);
          localStorage.setItem('naviko_usage_counts', JSON.stringify({}));
          return {};
        }
        const raw = localStorage.getItem('naviko_usage_counts');
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  // 6. Saved Items state
  const [savedItems, setSavedItems] = useState<UserSavedItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('naviko_saved_items');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  /**
   * Authoritative backend status synchronizer.
   * Strictly verifies status via user ID.
   * If logged out, immediately resets UI state to FREE.
   */
  const refreshSubscriptionStatus = useCallback(async () => {
    try {
      // If user is not authenticated, state MUST strictly be FREE
      if (!isAuthenticated || !user?.id) {
        setPlan('free');
        setSubscriptionStatus('FREE');
        setIsTrial(false);
        setStartDate(null);
        setRenewalDate(null);
        setTrialUsed(false);
        setTrialStartAt(null);
        setTrialEndsAt(null);
        setRemainingTrialDays(0);
        setRemainingTrialHours(0);

        if (typeof window !== 'undefined') {
          localStorage.removeItem('naviko_subscription_plan');
          localStorage.removeItem('naviko_sub_status');
          localStorage.removeItem('naviko_sub_start_date');
          localStorage.removeItem('naviko_sub_renewal_date');
          localStorage.removeItem('naviko_payment_test_mode');
        }

        const config = await paymentService.getGatewayConfig();
        setIsTestMode(config.isTestKey);
        return;
      }

      const uid = user.id;
      const statusRes = await paymentService.getSubscriptionStatus(uid);

      // Synchronize server trial flags
      setTrialUsed(!!statusRes.trialUsed);
      setTrialStartAt(statusRes.trialStartAt || null);
      setTrialEndsAt(statusRes.trialEndsAt || null);
      setRemainingTrialDays(statusRes.remainingTrialDays || 0);
      setRemainingTrialHours(statusRes.remainingTrialHours || 0);

      if (statusRes && statusRes.hasActiveSubscription) {
        if (statusRes.status === 'TRIAL_ACTIVE') {
          setPlan('trial');
          setSubscriptionStatus('TRIAL_ACTIVE');
          setIsTrial(true);
          setStartDate(statusRes.trialStartAt || null);
          setRenewalDate(statusRes.trialEndsAt || null);
        } else if (statusRes.status === 'ACTIVE') {
          setPlan(statusRes.plan);
          setSubscriptionStatus('ACTIVE');
          setIsTrial(false);
          setStartDate(statusRes.startDate);
          setRenewalDate(statusRes.renewalDate);
          if (statusRes.billingInterval) {
            setBillingIntervalState(statusRes.billingInterval);
          }
        }
      } else {
        // Enforce FREE tier when server does not verify an active subscription
        setPlan('free');
        setSubscriptionStatus(statusRes?.status || 'FREE');
        setIsTrial(false);
        setStartDate(null);
        setRenewalDate(null);

        // Security wipe of any legacy/tampered localStorage keys
        if (typeof window !== 'undefined') {
          localStorage.removeItem('naviko_subscription_plan');
          localStorage.removeItem('naviko_sub_status');
          localStorage.removeItem('naviko_sub_start_date');
          localStorage.removeItem('naviko_sub_renewal_date');
          localStorage.removeItem('naviko_payment_test_mode');
        }
      }

      // Check gateway configuration (is it in Razorpay test mode?)
      const config = await paymentService.getGatewayConfig();
      setIsTestMode(config.isTestKey);
    } catch (err) {
      console.warn('Subscription sync error:', err);
      setPlan('free');
      setSubscriptionStatus('FREE');
      setIsTrial(false);
    }
  }, [isAuthenticated, user?.id]);

  // Initial synchronization and URL tampering protection
  useEffect(() => {
    refreshSubscriptionStatus();

    // Protection against URL bypass (?premium=true, ?plan=pro, etc.)
    if (typeof window !== 'undefined' && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const bypassKeys = ['premium', 'plan', 'tier', 'subscription', 'pro', 'plus'];
      let hasTamperedParam = false;
      bypassKeys.forEach((key) => {
        if (searchParams.has(key)) {
          searchParams.delete(key);
          hasTamperedParam = true;
        }
      });
      if (hasTamperedParam) {
        const cleanUrl =
          window.location.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '') + window.location.hash;
        window.history.replaceState(null, '', cleanUrl);
      }
    }

    // Window focus refresh
    const handleFocus = () => {
      refreshSubscriptionStatus();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshSubscriptionStatus]);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_currency', newCurrency);
    }
  }, []);

  const setBillingInterval = useCallback((newInterval: BillingInterval) => {
    setBillingIntervalState(newInterval);
  }, []);

  const toggleTestMode = useCallback(() => {
    // Deprecated: Test mode is governed solely by whether server uses rzp_test_ keys.
  }, []);

  /**
   * Deprecated direct override.
   * Explicitly prevented from bypassing payment.
   */
  const setTestPlan = useCallback((_newPlan: PlanType) => {
    console.warn(
      '[SECURITY] Direct plan overrides are disabled. Premium subscriptions require verified Razorpay payment.'
    );
  }, []);

  // Check if a tool/feature is accessible by current subscription
  const canAccess = useCallback(
    (id: string): boolean => {
      // ONLY 'ACTIVE' or 'TRIAL_ACTIVE' subscription status unlocks premium features!
      const isSubscriptionActive =
        subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL_ACTIVE';
      const effectivePlan: PlanType = isSubscriptionActive ? plan : 'free';

      if (effectivePlan === 'pro' || effectivePlan === 'trial') return true;

      const tool = TOOL_ENTITLEMENTS[id];
      if (tool) {
        if (tool.accessLevel === 'FREE' || tool.accessLevel === 'FREE_LIMITED') return true;
        if (tool.accessLevel === 'PLUS') return effectivePlan === 'plus';
        if (tool.accessLevel === 'PRO') return false;
        return false;
      }

      const feature = FEATURE_ENTITLEMENTS[id];
      if (feature) {
        if (feature.accessLevel === 'FREE' || feature.accessLevel === 'FREE_LIMITED') return true;
        if (feature.accessLevel === 'PLUS') return effectivePlan === 'plus';
        if (feature.accessLevel === 'PRO') return false;
        return false;
      }

      return true;
    },
    [plan, subscriptionStatus]
  );

  // Check usage quota for limited tools
  const checkQuota = useCallback(
    (id: string): UsageQuotaInfo => {
      const isSubscriptionActive =
        subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL_ACTIVE';
      const effectivePlan: PlanType = isSubscriptionActive ? plan : 'free';
      const entitlement = TOOL_ENTITLEMENTS[id] || FEATURE_ENTITLEMENTS[id];

      if (!entitlement || entitlement.accessLevel === 'FREE') {
        return { allowed: true, remaining: Infinity, limit: Infinity };
      }

      if (entitlement.accessLevel === 'PLUS') {
        if (effectivePlan === 'plus' || effectivePlan === 'pro' || effectivePlan === 'trial') {
          return { allowed: true, remaining: Infinity, limit: Infinity };
        }
        return { allowed: false, remaining: 0, limit: 0, isUpgradeRequired: true, requiredTier: 'plus' };
      }

      if (entitlement.accessLevel === 'PRO') {
        if (effectivePlan === 'pro' || effectivePlan === 'trial') {
          return { allowed: true, remaining: Infinity, limit: Infinity };
        }
        return { allowed: false, remaining: 0, limit: 0, isUpgradeRequired: true, requiredTier: 'pro' };
      }

      let limit = 5;
      if (effectivePlan === 'pro' || effectivePlan === 'trial') {
        limit = (entitlement as any).proDailyLimit ?? PLAN_CAPABILITIES.pro.aiDailyLimit;
      } else if (effectivePlan === 'plus') {
        limit = (entitlement as any).plusDailyLimit ?? PLAN_CAPABILITIES.plus.aiDailyLimit;
      } else {
        limit = (entitlement as any).freeDailyLimit ?? PLAN_CAPABILITIES.free.aiDailyLimit;
      }

      const used = dailyUsage[id] || 0;
      const remaining = Math.max(0, limit - used);

      return {
        allowed: remaining > 0,
        remaining,
        limit,
        isUpgradeRequired: false,
        requiredTier: effectivePlan === 'free' ? 'plus' : 'pro',
        resetTime: 'Midnight UTC',
      };
    },
    [plan, subscriptionStatus, dailyUsage]
  );

  // Record an action / operation
  const recordUsage = useCallback(
    (id: string): boolean => {
      const quota = checkQuota(id);
      if (!quota.allowed) {
        return false;
      }

      setDailyUsage((prev) => {
        const today = getTodayKey();
        const currentCount = prev[id] || 0;
        const next = { ...prev, [id]: currentCount + 1 };
        if (typeof window !== 'undefined') {
          localStorage.setItem('naviko_usage_date', today);
          localStorage.setItem('naviko_usage_counts', JSON.stringify(next));
        }
        return next;
      });

      return true;
    },
    [checkQuota]
  );

  /**
   * Upgrade Flow — Initiates real Razorpay Checkout.
   * The user MUST be authenticated before purchasing any paid plan.
   * Clicking the button NEVER unlocks Premium without backend cryptographic verification.
   */
  const upgradeToTier = useCallback(
    async (
      tier: 'plus' | 'pro',
      interval: BillingInterval,
      email?: string
    ): Promise<{ success: boolean; message?: string; error?: string }> => {
      try {
        if (!isAuthenticated || !user) {
          return {
            success: false,
            error: 'Please log in or create an account to purchase NAVIKO Premium.',
          };
        }

        const uid = user.id;
        const customerEmailAddress = user.email || email;

        // 1. Process payment via Razorpay + Backend verification
        const result = await paymentService.processPlanPayment({
          tier,
          interval,
          currency,
          customerEmail: customerEmailAddress,
          customerName: user.name,
          userId: uid,
        });

        // 2. Only after backend verified the payment:
        if (result.success && result.status === 'ACTIVE') {
          await refreshSubscriptionStatus();
          return {
            success: true,
            message: result.message || `Upgraded to NAVIKO ${tier.toUpperCase()} successfully!`,
          };
        }

        // If cancelled, abandoned, or failed: ensure state stays FREE
        await refreshSubscriptionStatus();
        return {
          success: false,
          error:
            result.error ||
            'Payment was cancelled or could not be completed. Your subscription remains unchanged.',
        };
      } catch (err: any) {
        await refreshSubscriptionStatus();
        return {
          success: false,
          error: err?.message || 'Payment processing error.',
        };
      }
    },
    [isAuthenticated, user, currency, refreshSubscriptionStatus]
  );

  // Legacy alias for upgradeToPremium (maps to 'plus')
  const upgradeToPremium = useCallback(
    async (
      interval: BillingInterval,
      email?: string
    ): Promise<{ success: boolean; message?: string; error?: string }> => {
      return upgradeToTier('plus', interval, email);
    },
    [upgradeToTier]
  );

  /**
   * Start ₹1 7-day Trial Flow via Razorpay Checkout.
   * The user MUST be authenticated before starting the trial.
   * Trial is ONLY granted after server verifies cryptographic HMAC SHA256 signature and captures payment.
   */
  const startTrial = useCallback(
    async (email?: string): Promise<{ success: boolean; message?: string; error?: string }> => {
      try {
        if (!isAuthenticated || !user) {
          return {
            success: false,
            error: 'Please log in or create an account before starting the ₹1 trial.',
          };
        }

        const uid = user.id;
        const customerEmailAddress = user.email || email;

        // Check if trial was already used according to authoritative server state
        if (trialUsed) {
          return {
            success: false,
            error: 'Your ₹1 trial has already been used.',
          };
        }

        const result = await paymentService.processTrialPayment({
          userId: uid,
          customerEmail: customerEmailAddress,
          customerName: user.name,
        });

        // Always sync with authoritative backend
        await refreshSubscriptionStatus();

        if (result.success && result.status === 'TRIAL_ACTIVE') {
          return {
            success: true,
            message: result.message || '₹1 trial activated! Enjoy 7 days of full NAVIKO Premium access.',
          };
        }

        return {
          success: false,
          error:
            result.error ||
            'Payment was cancelled or could not be completed. Your account remains on the Free plan.',
        };
      } catch (err: any) {
        await refreshSubscriptionStatus();
        return {
          success: false,
          error: err?.message || 'Trial payment error.',
        };
      }
    },
    [isAuthenticated, user, trialUsed, refreshSubscriptionStatus]
  );

  // Cancel Subscription
  const cancelSubscription = useCallback(async () => {
    try {
      if (!isAuthenticated || !user?.id) return;
      await paymentService.cancelSubscription(user.id);
      await refreshSubscriptionStatus();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    }
  }, [isAuthenticated, user?.id, refreshSubscriptionStatus]);

  // Authorize Feature via trusted backend
  const authorizeFeature = useCallback(
    async (requiredTier: 'plus' | 'pro' = 'plus') => {
      const uid = user?.id || '';
      return paymentService.authorizeFeature(uid, requiredTier);
    },
    [user?.id]
  );

  // Save User Item
  const saveUserItem = useCallback(
    (category: string, title: string, data: any): UserSavedItem => {
      const newItem: UserSavedItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        category,
        title,
        createdAt: new Date().toISOString(),
        data,
      };

      setSavedItems((prev) => {
        const next = [newItem, ...prev];
        if (typeof window !== 'undefined') {
          localStorage.setItem('naviko_saved_items', JSON.stringify(next));
        }
        return next;
      });

      return newItem;
    },
    []
  );

  // Delete User Item
  const deleteUserItem = useCallback((id: string) => {
    setSavedItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('naviko_saved_items', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // Get Items for a Category
  const getUserItems = useCallback(
    (category: string): UserSavedItem[] => {
      return savedItems.filter((item) => item.category === category);
    },
    [savedItems]
  );

  // Reset Today's Usage
  const resetTodayUsage = useCallback(() => {
    setDailyUsage({});
    if (typeof window !== 'undefined') {
      const today = getTodayKey();
      localStorage.setItem('naviko_usage_date', today);
      localStorage.setItem('naviko_usage_counts', JSON.stringify({}));
    }
  }, []);

  const totalDailyUsage = Object.values(dailyUsage).reduce<number>(
    (sum, count) => sum + (typeof count === 'number' ? count : 0),
    0
  );
  const dailyAiLimit = PLAN_CAPABILITIES[plan]?.aiDailyLimit || 5;

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        billingInterval,
        currency,
        subscriptionStatus,
        startDate,
        renewalDate,
        customerEmail,
        userId,
        isTestMode,
        isTrial,
        trialUsed,
        trialStartAt,
        trialEndsAt,
        remainingTrialDays,
        remainingTrialHours,
        toggleTestMode,
        setCurrency,
        setBillingInterval,
        canAccess,
        checkQuota,
        recordUsage,
        upgradeToTier,
        upgradeToPremium,
        startTrial,
        setTestPlan,
        cancelSubscription,
        refreshSubscriptionStatus,
        authorizeFeature,
        savedItems,
        saveUserItem,
        deleteUserItem,
        getUserItems,
        resetTodayUsage,
        totalDailyUsage,
        dailyAiLimit,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
