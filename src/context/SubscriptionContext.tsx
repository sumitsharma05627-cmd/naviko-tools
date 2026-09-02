import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  PlanType,
  BillingInterval,
  detectDefaultCurrency,
} from '../config/pricing';
import { TOOL_ENTITLEMENTS, FEATURE_ENTITLEMENTS, PLAN_CAPABILITIES } from '../config/entitlements';
import { paymentService } from '../services/payment';

export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due';

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
  upgradeToTier: (
    tier: 'plus' | 'pro',
    interval: BillingInterval,
    email?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  upgradeToPremium: (
    interval: BillingInterval,
    email?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
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
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(
    now.getUTCDate()
  ).padStart(2, '0')}`;
}

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Currency state
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naviko_currency') as CurrencyCode;
      if (saved) return saved;
    }
    return detectDefaultCurrency();
  });

  // 2. Plan state
  const [plan, setPlan] = useState<PlanType>(() => {
    if (typeof window !== 'undefined') {
      const savedPlan = localStorage.getItem('naviko_subscription_plan') as PlanType;
      if (savedPlan && ['free', 'plus', 'pro'].includes(savedPlan)) {
        return savedPlan;
      }
    }
    return 'free';
  });

  const [billingInterval, setBillingIntervalState] = useState<BillingInterval>('yearly');

  // 3. Subscription Status
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naviko_sub_status') as SubscriptionStatus;
      if (saved) return saved;
      const savedPlan = localStorage.getItem('naviko_subscription_plan');
      if (savedPlan === 'plus' || savedPlan === 'pro') return 'active';
    }
    return 'inactive';
  });

  const [startDate, setStartDate] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('naviko_sub_start_date') || null;
    }
    return null;
  });

  const [renewalDate, setRenewalDate] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('naviko_sub_renewal_date') || null;
    }
    return null;
  });

  const [customerEmail, setCustomerEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('naviko_user_email') || null;
    }
    return null;
  });

  // 4. Test Mode state
  const [isTestMode, setIsTestMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naviko_payment_test_mode');
      return saved !== 'false';
    }
    return true;
  });

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
    const next = !isTestMode;
    setIsTestMode(next);
    paymentService.setTestMode(next);
  }, [isTestMode]);

  const setTestPlan = useCallback((newPlan: PlanType) => {
    const newStatus: SubscriptionStatus = newPlan === 'free' ? 'inactive' : 'active';
    setPlan(newPlan);
    setSubscriptionStatus(newStatus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_subscription_plan', newPlan);
      localStorage.setItem('naviko_sub_status', newStatus);
      if (newPlan !== 'free') {
        const now = new Date().toISOString();
        setStartDate(now);
        localStorage.setItem('naviko_sub_start_date', now);
        const ren = new Date();
        ren.setFullYear(ren.getFullYear() + 1);
        setRenewalDate(ren.toISOString());
        localStorage.setItem('naviko_sub_renewal_date', ren.toISOString());
      } else {
        setStartDate(null);
        setRenewalDate(null);
        localStorage.removeItem('naviko_sub_start_date');
        localStorage.removeItem('naviko_sub_renewal_date');
      }
    }
  }, []);

  // Check if a tool/feature is accessible by the current plan tier
  const canAccess = useCallback(
    (id: string): boolean => {
      const effectivePlan: PlanType = subscriptionStatus === 'active' ? plan : 'free';

      if (effectivePlan === 'pro') return true;

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
      const effectivePlan: PlanType = subscriptionStatus === 'active' ? plan : 'free';
      const entitlement = TOOL_ENTITLEMENTS[id] || FEATURE_ENTITLEMENTS[id];

      if (!entitlement || entitlement.accessLevel === 'FREE') {
        return { allowed: true, remaining: Infinity, limit: Infinity };
      }

      if (entitlement.accessLevel === 'PLUS') {
        if (effectivePlan === 'plus' || effectivePlan === 'pro') {
          return { allowed: true, remaining: Infinity, limit: Infinity };
        }
        return { allowed: false, remaining: 0, limit: 0, isUpgradeRequired: true, requiredTier: 'plus' };
      }

      if (entitlement.accessLevel === 'PRO') {
        if (effectivePlan === 'pro') {
          return { allowed: true, remaining: Infinity, limit: Infinity };
        }
        return { allowed: false, remaining: 0, limit: 0, isUpgradeRequired: true, requiredTier: 'pro' };
      }

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
          localStorage.setItem('naviko_usage_counts', JSON.stringify({}));
        }
        return next;
      });

      return true;
    },
    [checkQuota]
  );

  // Upgrade Flow
  const upgradeToTier = useCallback(
    async (
      tier: 'plus' | 'pro',
      interval: BillingInterval,
      email?: string
    ): Promise<{ success: boolean; message?: string; error?: string }> => {
      try {
        const result = await paymentService.processPlanPayment({
          tier,
          interval,
          currency,
          customerEmail: email || customerEmail || undefined,
        });

        if (result.success) {
          setPlan(tier);
          setSubscriptionStatus('active');
          setBillingIntervalState(interval);
          const timestamp = result.transactionDetails?.timestamp || new Date().toISOString();
          setStartDate(timestamp);

          const ren = new Date(timestamp);
          if (interval === 'yearly') {
            ren.setFullYear(ren.getFullYear() + 1);
          } else {
            ren.setMonth(ren.getMonth() + 1);
          }
          const renIso = ren.toISOString();
          setRenewalDate(renIso);

          if (email) {
            setCustomerEmail(email);
            if (typeof window !== 'undefined') {
              localStorage.setItem('naviko_user_email', email);
            }
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('naviko_subscription_plan', tier);
            localStorage.setItem('naviko_sub_status', 'active');
            localStorage.setItem('naviko_sub_start_date', timestamp);
            localStorage.setItem('naviko_sub_renewal_date', renIso);
          }

          return {
            success: true,
            message: result.message || `Upgraded to NAVIKO ${tier.toUpperCase()} successfully!`,
          };
        }

        return {
          success: false,
          error: result.error || 'Payment failed or was cancelled.',
        };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Payment processing error.',
        };
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
    setPlan('free');
    setSubscriptionStatus('inactive');
    setStartDate(null);
    setRenewalDate(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_subscription_plan', 'free');
      localStorage.setItem('naviko_sub_status', 'inactive');
      localStorage.removeItem('naviko_sub_start_date');
      localStorage.removeItem('naviko_sub_renewal_date');
    }
  }, []);

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
