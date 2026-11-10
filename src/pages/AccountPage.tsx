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
  Wrench,
  Activity,
  Compass,
  FileText,
  ExternalLink,
  Receipt,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useCurrency } from '../context/CurrencyContext';
import { NavikoVersionId, CURRENCIES_REGISTRY } from '../config/pricingEngine';
import { CurrencySelector } from '../components/ui/CurrencySelector';
import { PremiumBadge } from '../components/monetization/PremiumBadge';
import { PLAN_CAPABILITIES } from '../config/entitlements';
import { UnifiedButton } from '../components/ui/UnifiedButton';
import { UnifiedBadge } from '../components/ui/UnifiedBadge';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const {
    plan,
    billingInterval,
    subscriptionStatus,
    customerEmail,
    isTrial,
    trialUsed,
    remainingTrialDays,
    remainingTrialHours,
    trialEndsAt,
    versionSubscriptions,
    cancelVersion,
    billingHistory,
    savedItems,
    deleteUserItem,
    resetTodayUsage,
    totalDailyUsage,
    dailyAiLimit,
  } = useSubscription();

  const { currentCurrency } = useCurrency();
  const [confirmCancelVersion, setConfirmCancelVersion] = useState<NavikoVersionId | null>(null);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'saved' | 'usage'>('subscriptions');
  const [isCancelling, setIsCancelling] = useState(false);

  const currencySymbol = CURRENCIES_REGISTRY[currentCurrency]?.symbol || '₹';

  const handleCancelVersion = async (v: NavikoVersionId) => {
    setIsCancelling(true);
    try {
      await cancelVersion(v);
      setConfirmCancelVersion(null);
    } catch (err) {
      console.error('Error cancelling subscription:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const versionConfig: Record<NavikoVersionId, {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    pricingPath: string;
  }> = {
    v1: {
      title: 'NAVIKO 1.0 — General Tools Suite',
      subtitle: '46+ Calculators, PDF Utilities, Student & Finance Tools',
      icon: <Wrench className="w-5 h-5 text-indigo-500" />,
      color: 'indigo',
      pricingPath: '/pricing?version=v1',
    },
    v2: {
      title: 'NAVIKO 2.0 — Nutrition & Ayurveda',
      subtitle: 'Indian Food Intelligence, Macro Calculator, Ayurveda Hub',
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
      color: 'emerald',
      pricingPath: '/pricing?version=v2',
    },
    v3: {
      title: 'NAVIKO 3.0 — Vedic Astrology & Vastu',
      subtitle: 'Chitrapaksha Kundli, 16-Zone Vastu Purusha, NAVI AI Astrologer',
      icon: <Compass className="w-5 h-5 text-amber-500" />,
      color: 'amber',
      pricingPath: '/pricing?version=v3',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-20 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                My NAVIKO Account &amp; Subscriptions
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage your independent version subscriptions, billing history, and daily quotas across the ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CurrencySelector />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 mb-8 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'subscriptions'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Crown className="w-4 h-4 text-indigo-500" />
            <span>Version Subscriptions (3 Independent)</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'invoices'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4 text-indigo-500" />
            <span>Invoices &amp; Billing History ({(billingHistory || []).length})</span>
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
            <span>Saved Workspaces ({savedItems.length})</span>
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
            <span>Daily Quotas</span>
          </button>
        </div>

        {/* TAB 1: 3 INDEPENDENT VERSION SUBSCRIPTION CARDS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['v1', 'v2', 'v3'] as NavikoVersionId[]).map((v) => {
                const sub = versionSubscriptions[v];
                const meta = versionConfig[v];
                const isActive = sub?.isActive;
                const isPendingCancel = confirmCancelVersion === v;

                return (
                  <div
                    key={v}
                    className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all bg-white dark:bg-slate-900 border ${
                      isActive
                        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                          {meta.icon}
                        </div>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active Plan</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            Free Tier
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {meta.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                        {meta.subtitle}
                      </p>

                      {/* Subscription Details */}
                      <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span>Current Tier:</span>
                          <span className="font-extrabold uppercase text-slate-900 dark:text-white">
                            {sub?.tier || 'Free'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span>Status:</span>
                          <span className={`font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                            {sub?.status || 'FREE'}
                          </span>
                        </div>
                        {isActive && sub?.renewalDate && (
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Renewal Date:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {new Date(sub.renewalDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {isActive && sub?.billingInterval && (
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Billing Cycle:</span>
                            <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                              {sub.billingInterval}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <button
                        onClick={() => onNavigate(meta.pricingPath)}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{isActive ? 'Change Plan' : 'Upgrade Version'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {isActive && (
                        <div>
                          {isPendingCancel ? (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                              <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                                Cancel {v.toUpperCase()} subscription? You will return to the free tier at renewal.
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCancelVersion(v)}
                                  disabled={isCancelling}
                                  className="flex-1 py-1 px-2 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                                >
                                  {isCancelling ? 'Cancelling...' : 'Confirm'}
                                </button>
                                <button
                                  onClick={() => setConfirmCancelVersion(null)}
                                  className="flex-1 py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  Keep
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmCancelVersion(v)}
                              className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              Cancel {v.toUpperCase()} Subscription
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ecosystem Security Callout */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Strict Independence Guarantee:</strong> Cancelling or changing one version never impacts your active subscriptions or saved data in other versions.
                </span>
              </div>
              <button
                onClick={() => onNavigate('/pricing')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                View Full Pricing Hub
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: INVOICES & BILLING HISTORY */}
        {activeTab === 'invoices' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Billing History &amp; Official Invoices
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Download receipts and audit complete transaction records across all 3 NAVIKO versions.
                </p>
              </div>
            </div>

            {(!billingHistory || billingHistory.length === 0) ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No billing history recorded yet
                </div>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  When you purchase a subscription on NAVIKO 1.0, 2.0, or 3.0, verified cryptographic receipts will appear here.
                </p>
                <button
                  onClick={() => onNavigate('/pricing')}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Explore Pricing Plans
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                      <th className="pb-3 font-bold">Invoice ID</th>
                      <th className="pb-3 font-bold">Product Version</th>
                      <th className="pb-3 font-bold">Plan &amp; Interval</th>
                      <th className="pb-3 font-bold">Date</th>
                      <th className="pb-3 font-bold">Amount</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {billingHistory.map((inv: any, idx: number) => {
                      const v = inv.version || 'v1';
                      return (
                        <tr key={inv.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {inv.invoiceId || inv.invoiceNumber || `INV-${String(idx + 1).padStart(4, '0')}`}
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                              v === 'v3'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : v === 'v2'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}>
                              {v.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-700 dark:text-slate-300 capitalize font-medium">
                            {inv.tier} • {inv.interval}
                          </td>
                          <td className="py-3.5 text-slate-500">
                            {new Date(inv.paidAt || inv.date || Date.now()).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                            {inv.currency || 'INR'} {inv.amount}
                          </td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {inv.status || 'PAID'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => {
                                alert(`NAVIKO Official Receipt\nInvoice: ${inv.invoiceId}\nVersion: ${v.toUpperCase()}\nAmount: ${inv.currency} ${inv.amount}\nStatus: PAID\nPayment ID: ${inv.razorpayPaymentId || 'Verified'}`);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED WORKSPACES */}
        {activeTab === 'saved' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your Saved Workspaces &amp; Charts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Saved Kundli charts, nutrition meal plates, and calculation dossiers.
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
                  Save a Kundli in NAVIKO 3.0 or a meal plate in Nutrition Science to see them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteUserItem(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DAILY USAGE & QUOTAS */}
        {activeTab === 'usage' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Daily Usage &amp; Fair-Use Limits
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  High-compute AI reasoning tokens and daily server calculations reset every midnight UTC.
                </p>
              </div>
              <button
                onClick={resetTodayUsage}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset Daily Counter
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              NAVIKO 1.0, 2.0, and 3.0 calculate real mathematical ephemeris and data formulas. Quotas are monitored on the server to prevent automated bot exploitation and ensure 100% platform availability.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
