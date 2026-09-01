import React, { useState } from 'react';
import {
  Crown,
  ShieldCheck,
  Zap,
  Calendar,
  CreditCard,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Trash2,
  BookOpen,
  ArrowRight,
  User,
  Sliders,
  Clock,
  Layers,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { PRICING_CONFIG, formatCurrencyPrice } from '../config/pricing';
import { CurrencySelector } from '../components/monetization/CurrencySelector';
import { PremiumBadge } from '../components/monetization/PremiumBadge';
import { PLAN_CAPABILITIES } from '../config/entitlements';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const {
    plan,
    billingInterval,
    setBillingInterval,
    currency,
    subscriptionStatus,
    renewalDate,
    startDate,
    customerEmail,
    cancelSubscription,
    upgradeToTier,
    setTestPlan,
    savedItems,
    deleteUserItem,
    resetTodayUsage,
    isTestMode,
    toggleTestMode,
    totalDailyUsage,
    dailyAiLimit,
  } = useSubscription();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscription' | 'saved' | 'usage' | 'settings'>('subscription');

  const activePricing = PRICING_CONFIG[currency] || PRICING_CONFIG.INR;
  const currentPlanPricing = plan === 'pro' ? activePricing.pro : activePricing.plus;
  const currentPrice = billingInterval === 'yearly' ? currentPlanPricing.yearly : currentPlanPricing.monthly;
  const currentPriceFormatted = formatCurrencyPrice(currentPrice, currency);

  const capabilities = PLAN_CAPABILITIES[plan];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-20 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                My NAVIKO Account
              </h1>
              <PremiumBadge plan={plan} size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage your subscription, daily quotas, and saved tools workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CurrencySelector />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 mb-8 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'subscription'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Crown className="w-4 h-4 text-indigo-500" />
            <span>My Subscription</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Saved Items &amp; Workspaces ({savedItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'usage'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Usage &amp; Quotas</span>
          </button>
        </div>

        {/* TAB 1: SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="space-y-8">
            {/* Current Plan Overview Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                    Active Plan
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
                      NAVIKO {plan}
                    </h2>
                    <PremiumBadge plan={plan} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {plan !== 'free'
                      ? `Billed ${billingInterval} at ${currentPriceFormatted} / ${billingInterval === 'yearly' ? 'year' : 'month'}`
                      : 'Free forever. Upgrade anytime to Plus or Pro for higher quotas, meal planning, and advanced analytics.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {plan !== 'free' ? (
                    <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigate('/premium')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Upgrade Plan</span>
                    </button>
                  )}

                  {plan === 'plus' && (
                    <button
                      onClick={() => onNavigate('/premium')}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      <span>Upgrade to Pro</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Plan Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Account ID / Email</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {customerEmail || 'member@naviko.in'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {plan !== 'free' ? 'Next Renewal Date' : 'Account Status'}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {plan !== 'free' && renewalDate
                      ? new Date(renewalDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Free Plan (Active)'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Privacy Status</div>
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> 100% Client-Side Safe
                  </div>
                </div>
              </div>

              {/* Actions & Cancellation */}
              {plan !== 'free' && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Need to change your plan or cancel subscription?
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {confirmCancel ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            cancelSubscription();
                            setConfirmCancel(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                        >
                          Confirm Cancellation
                        </button>
                        <button
                          onClick={() => setConfirmCancel(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Keep Plan
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancel(true)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 transition-colors cursor-pointer"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sandbox Developer Controls */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div>
                <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Sandbox Testing Controls</span>
                </div>
                <p className="text-indigo-700 dark:text-indigo-300 mt-0.5">
                  Switch instantly between Free, Plus, and Pro tiers to test access entitlement rules.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => setTestPlan('free')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${plan === 'free' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}
                >
                  Set Free
                </button>
                <button
                  onClick={() => setTestPlan('plus')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${plan === 'plus' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}
                >
                  Set Plus
                </button>
                <button
                  onClick={() => setTestPlan('pro')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${plan === 'pro' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}
                >
                  Set Pro
                </button>
                <button
                  onClick={resetTodayUsage}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Reset Daily Quotas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAVED ITEMS & WORKSPACES */}
        {activeTab === 'saved' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your Saved Items &amp; Workspaces
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Access your custom meal plans, study test results, and bookmarks stored securely in local storage.
                </p>
              </div>
            </div>

            {savedItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No saved items yet
                </div>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  Save custom meal plates in Nutrition Science or mock test scores in the Student Hub to see them here.
                </p>
                <button
                  onClick={() => onNavigate('/tools/nutrition')}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Explore Nutrition Science
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Saved on {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteUserItem(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USAGE & QUOTAS */}
        {activeTab === 'usage' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Daily Tool Usage &amp; Quotas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Current Plan: <strong className="capitalize">{plan}</strong>. Quotas reset automatically at midnight UTC.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  AI &amp; Heavy Processing Quota
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Daily Limit: <strong>{capabilities.aiDailyLimit} ops / day</strong>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Used Today: {totalDailyUsage} / {dailyAiLimit}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Max File Upload Size
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Max File Size: <strong>{capabilities.maxFileSizeMb} MB</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Saved Custom Items &amp; History
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  History Tracking: <strong>{capabilities.savedHistory ? 'Enabled (Unlimited)' : 'Disabled on Free'}</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Core Calculators &amp; BMI
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Unlimited Free Operations (No Quota)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

