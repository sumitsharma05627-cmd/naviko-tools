import React, { useState } from 'react';
import {
  CreditCard,
  Crown,
  Sparkles,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Zap,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

interface BillingPageProps {
  onNavigate: (path: string) => void;
  onOpenPricing?: () => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({ onNavigate, onOpenPricing }) => {
  const { isAuthenticated, user } = useAuth();
  const {
    plan,
    subscriptionStatus,
    isTrial,
    trialUsed,
    remainingTrialDays,
    remainingTrialHours,
    startDate,
    renewalDate,
    billingInterval,
    currency,
    refreshSubscriptionStatus,
  } = useSubscription();

  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-sm text-slate-500">Please sign in to access your billing details.</p>
          <button
            onClick={() => onNavigate('/login?redirect=/billing')}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshSubscriptionStatus();
    setIsRefreshing(false);
  };

  const isPremiumActive = plan === 'pro' || plan === 'plus' || plan === 'trial';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Billing & Plan Status</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Authoritative subscription entitlements verified by NAVIKO secure backend.
            </p>
          </div>

          {onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 cursor-pointer transition-all self-start sm:self-auto"
            >
              <Crown className="w-4 h-4" />
              <span>{isPremiumActive ? 'Change Plan' : 'Upgrade Plan'}</span>
            </button>
          )}
        </div>

        {/* Current Plan Card */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Membership
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white capitalize">
                  {plan === 'trial' ? '₹1 Premium Trial' : `${plan} Plan`}
                </span>
                {isTrial ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    TRIAL ACTIVE
                  </span>
                ) : isPremiumActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    ACTIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    FREE TIER
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Authoritative State</span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {subscriptionStatus}
              </span>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Billing Cadence</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {isTrial ? '7-Day One-Time Trial' : `${billingInterval} billing`}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Start Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {startDate ? new Date(startDate).toLocaleDateString() : '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">
                {isTrial ? 'Trial Expiration' : 'Renewal / Expiry'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {renewalDate ? new Date(renewalDate).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>

          {/* Trial notes */}
          {isTrial && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>₹1 trial • {remainingTrialDays} days remaining ({remainingTrialHours}h) • No automatic renewal</span>
              </p>
              <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300/80 leading-relaxed">
                When this 7-day period concludes, your account will automatically return to the Free plan. No payment method will be auto-debited.
              </p>
            </div>
          )}
        </div>

        {/* Payment Security Assurance */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Bank-Grade Payment Security & Razorpay Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All transactions are securely handled via Razorpay with 256-bit TLS encryption. NAVIKO never stores your credit card numbers or UPI MPINs. Subscription activation is verified with server-side HMAC SHA256 cryptographic signatures.
            </p>
          </div>
        </div>

        {/* Feature Entitlements Comparison */}
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Included in your Plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                {isPremiumActive ? 'Unlimited daily tool executions' : '5 free daily tool executions'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                {isPremiumActive ? 'Access to all 50+ Premium Tools' : 'Standard utility tools access'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                {isPremiumActive ? 'Zero ads and priority processing' : 'Standard processing speed'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                Saved tool preferences & activity history
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
