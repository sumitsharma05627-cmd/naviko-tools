import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  PlanType,
  BillingInterval,
  PRICING_CONFIG,
  detectDefaultCurrency,
  formatCurrencyPrice,
} from '../config/pricing';
import { TOOL_ENTITLEMENTS, FEATURE_ENTITLEMENTS, PLAN_CAPABILITIES } from '../config/entitlements';
import { paymentService, PaymentPlanRequest } from '../services/payment';

export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired';

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
  isTestMode: boolean;
  toggleTestMode: () => void;
  setCurrency: (currency: CurrencyCode) => void;
  setBillingInterval: (interval: BillingInterval) => void;
  canAccess: (id: string) => boolean;
  checkQuota: (id: string) => UsageQuotaInfo;
  recordUsage: (id: string) => boolean;
  upgradeToTier: (tier: 'plus' | 'pro', interval: BillingInterval, email?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  upgradeToPremium: (interval: BillingInterval, email?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  setTestPlan: (plan: PlanType) => void;
  cancelSubscription: () => void;
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
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Currency state
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return detectDefaultCurrency();
  });

  // 2. Plan and billing state
  const [plan, setPlanState] = useState<PlanType>(() => {
    if (typeof window === 'undefined') return 'free';
    const savedPlan = localStorage.getItem('naviko_subscription_plan') as PlanType;
    if (savedPlan === 'plus' || savedPlan === 'pro') return savedPlan;
    // Backwards compatibility: treat legacy 'premium' string as 'plus'
    if ((savedPlan as any) === 'premium') return 'plus';
    return 'free';
  });

  const [billingInterval, setBillingIntervalState] = useState<BillingInterval>(() => {
    if (typeof window === 'undefined') return 'yearly';
    const saved = localStorage.getItem('naviko_billing_interval') as BillingInterval;
    return saved === 'monthly' ? 'monthly' : 'yearly';
  });

  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(() => {
    if (typeof window === 'undefined') return 'inactive';
    const saved = localStorage.getItem('naviko_sub_status') as SubscriptionStatus;
    return saved || (plan !== 'free' ? 'active' : 'inactive');
  });

  const [startDate, setStartDate] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('naviko_sub_start');
  });

  const [renewalDate, setRenewalDate] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('naviko_sub_renewal');
  });

  const [customerEmail, setCustomerEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('naviko_user_email') || 'member@naviko.in';
  });

  // 3. Test Mode Toggle state
  const [isTestMode, setIsTestMode] = useState<boolean>(() => {
    return paymentService.getIsTestMode();
  });

  // 4. Daily Usage state (Stored per UTC date)
  const [dailyUsage, setDailyUsage] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const today = getTodayKey();
      const savedDate = localStorage.getItem('naviko_usage_date');
      if (savedDate !== today) {
        // New day: reset usage
        localStorage.setItem('naviko_usage_date', today);
        localStorage.setItem('naviko_usage_counts', JSON.stringify({}));
        return {};
      }
      const raw = localStorage.getItem('naviko_usage_counts');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // 5. Saved Items state (For nutrition plans, test history, etc.)
  const [savedItems, setSavedItems] = useState<UserSavedItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('naviko_saved_items');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Save changes to localStorage
  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_currency', newCurrency);
    }
  }, []);

  const setBillingInterval = useCallback((newInterval: BillingInterval) => {
    setBillingIntervalState(newInterval);
    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_billing_interval', newInterval);
    }
  }, []);

  const toggleTestMode = useCallback(() => {
    const next = !isTestMode;
    setIsTestMode(next);
    paymentService.setTestMode(next);
  }, [isTestMode]);

  // Set Test Plan for instant Sandbox Testing
  const setTestPlan = useCallback((newPlan: PlanType) => {
    setPlanState(newPlan);
    const newStatus: SubscriptionStatus = newPlan === 'free' ? 'inactive' : 'active';
    setSubscriptionStatus(newStatus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_subscription_plan', newPlan);
      localStorage.setItem('naviko_sub_status', newStatus);
    }
  }, []);

  // Check if a tool/feature is accessible by the current plan tier
  const canAccess = useCallback(
    (id: string): boolean => {
      const isActive = subscriptionStatus === 'active';
      const effectivePlan: PlanType = isActive ? plan : 'free';

      // Pro has access to everything
      if (effectivePlan === 'pro') return true;

      // Check tool entitlements
      const tool = TOOL_ENTITLEMENTS[id];
      if (tool) {
        if (tool.accessLevel === 'FREE' || tool.accessLevel === 'FREE_LIMITED') return true;
        if (tool.accessLevel === 'PLUS') return effectivePlan === 'plus';
        if (tool.accessLevel === 'PRO') return false;
        return false;
      }

      // Check feature entitlements
      const feature = FEATURE_ENTITLEMENTS[id];
      if (feature) {
        if (feature.accessLevel === 'FREE' || feature.accessLevel === 'FREE_LIMITED') return true;
        if (feature.accessLevel === 'PLUS') return effectivePlan === 'plus';
        if (feature.accessLevel === 'PRO') return false;
        return false;
      }

      // Default to allowed for unspecified tools
      return true;
    },
    [plan, subscriptionStatus]
  );

  // Check usage quota for limited tools
  const checkQuota = useCallback(
    (id: string): UsageQuotaInfo => {
      const isActive = subscriptionStatus === 'active';
      const effectivePlan: PlanType = isActive ? plan : 'free';
      const entitlement = TOOL_ENTITLEMENTS[id] || FEATURE_ENTITLEMENTS[id];

      // If no entitlement or completely free tool, no limit
      if (!entitlement || entitlement.accessLevel === 'FREE') {
        return { allowed: true, remaining: Infinity, limit: Infinity };
      }

      // If PLUS feature locked for free users
      if (entitlement.accessLevel === 'PLUS') {
        if (effectivePlan === 'plus' || effectivePlan === 'pro') {
          return { allowed: true, remaining: Infinity, limit: Infinity };
        }
        return { allowed: false, remaining: 0, limit: 0, isUpgradeRequired: true, requiredTier: 'plus' };
      }

      // If PRO feature locked for free or plus users
      if (entitlement.accessLevel === 'PRO') {
        if (effectivePlan === 'pro') {
          return { allowed: true, remaining: Infinity, limit: Infinity };
        }
        return { allowed: false, remaining: 0, limit: 0, isUpgradeRequired: true, requiredTier: 'pro' };
      }

      // If free with tiered limits (FREE_LIMITED)
      let limit = 5;
      if (effectivePlan === 'pro') {
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

  // Upgrade to a specific Tier ('plus' or 'pro')
  const upgradeToTier = useCallback(
    async (
      tier: 'plus' | 'pro',
      interval: BillingInterval,
      email?: string
    ): Promise<{ success: boolean; message?: string; error?: string }> => {
      try {
        const request: PaymentPlanRequest = {
          tier,
          interval,
          currency,
          customerEmail: email || customerEmail || 'user@naviko.in',
        };

        const initResult = await paymentService.initializeCheckout(request);
        if (!initResult.success) {
          return { success: false, error: initResult.error || 'Failed to initialize payment.' };
        }

        const verifyResult = await paymentService.verifyPayment(initResult.orderId || `order_${tier}_demo`, request);
        if (verifyResult.verified) {
          setPlanState(tier);
          setBillingIntervalState(interval);
          setSubscriptionStatus('active');
          setStartDate(verifyResult.startDate);
          setRenewalDate(verifyResult.renewalDate);
          if (email) setCustomerEmail(email);

          if (typeof window !== 'undefined') {
            localStorage.setItem('naviko_subscription_plan', tier);
            localStorage.setItem('naviko_billing_interval', interval);
            localStorage.setItem('naviko_sub_status', 'active');
            localStorage.setItem('naviko_sub_start', verifyResult.startDate);
            localStorage.setItem('naviko_sub_renewal', verifyResult.renewalDate);
            if (email) localStorage.setItem('naviko_user_email', email);
          }

          return {
            success: true,
            message: verifyResult.message || `NAVIKO ${tier.toUpperCase()} successfully activated!`,
          };
        }

        return { success: false, error: 'Payment verification failed.' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'An unexpected error occurred.' };
      }
    },
    [currency, customerEmail]
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

  // Cancel Subscription
  const cancelSubscription = useCallback(() => {
    setPlanState('free');
    setSubscriptionStatus('inactive');
    setRenewalDate(null);

    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_subscription_plan', 'free');
      localStorage.setItem('naviko_sub_status', 'inactive');
      localStorage.removeItem('naviko_sub_renewal');
    }
  }, []);

  // Save User Item (For nutrition plans, study history, etc.)
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

  // Reset Today's Usage (Testing tool)
  const resetTodayUsage = useCallback(() => {
    setDailyUsage({});
    if (typeof window !== 'undefined') {
      const today = getTodayKey();
      localStorage.setItem('naviko_usage_date', today);
      localStorage.setItem('naviko_usage_counts', JSON.stringify({}));
    }
  }, []);

  // Calculate total ops used today
  const totalDailyUsage = Object.values(dailyUsage).reduce<number>((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
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
        isTestMode,
        toggleTestMode,
        setCurrency,
        setBillingInterval,
        canAccess,
        checkQuota,
        recordUsage,
        upgradeToTier,
        upgradeToPremium,
        setTestPlan,
        cancelSubscription,
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

