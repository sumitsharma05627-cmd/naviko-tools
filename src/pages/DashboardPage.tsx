import React, { useState } from 'react';
import {
  Sparkles,
  Crown,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  Settings,
  User,
  CreditCard,
  LogOut,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { TOOLS_DATA } from '../data/toolsData';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenPricing?: () => void;
  onOpenTool?: (toolId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenPricing,
  onOpenTool,
}) => {
  const { user, isAuthenticated, logout, recentTools } = useAuth();
  const {
    plan,
    subscriptionStatus,
    isTrial,
    remainingTrialDays,
    remainingTrialHours,
    totalDailyUsage,
    dailyAiLimit,
    renewalDate,
    startDate,
  } = useSubscription();

  const remainingDailyRuns = Math.max(0, dailyAiLimit - totalDailyUsage);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If unauthenticated, render redirect prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Authentication Required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please sign in to view your dashboard, saved preferences, and subscription status.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onNavigate('/login?redirect=/dashboard')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    onNavigate('/');
  };

  // Find recent tool details
  const recentToolItems = recentTools
    .map((id) => TOOLS_DATA.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 6);

  const isPremiumActive = plan === 'pro' || plan === 'plus' || plan === 'trial';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Welcome, {user.name}
              </h1>
              {isTrial ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Sparkles className="w-3 h-3" />
                  ₹1 Trial Active ({remainingTrialDays}d left)
                </span>
              ) : isPremiumActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                  <Crown className="w-3 h-3 text-indigo-600" />
                  {plan.toUpperCase()} Member
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Free Tier
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 md:pt-0">
          {!isPremiumActive && onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Upgrade Plan</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('/profile')}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => onNavigate('/billing')}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Billing</span>
          </button>

          <button
            onClick={() => onNavigate('/settings')}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold text-xs cursor-pointer transition-all disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? '...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Metrics & Overview grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Subscription & Access */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Subscription Plan
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white capitalize">
              {plan === 'trial' ? '₹1 Premium Trial' : `${plan} Plan`}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isTrial
                ? `Active for ${remainingTrialDays} more days (${remainingTrialHours}h left). No automatic renewal.`
                : isPremiumActive
                ? renewalDate
                  ? `Renews on ${new Date(renewalDate).toLocaleDateString()}`
                  : 'Active subscription'
                : 'Free tier with standard limits. Upgrade anytime for unlimited access.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/billing')}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>Manage plan & invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Daily Tool Limit */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Usage Limit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {isPremiumActive ? 'Unlimited' : `${remainingDailyRuns} / ${dailyAiLimit} runs`}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isPremiumActive
                ? 'All 50+ developer and productivity tools run with zero restrictions.'
                : `Used ${totalDailyUsage} tool runs today. Resets at midnight UTC.`}
            </p>
          </div>
          {/* Progress bar if free */}
          {!isPremiumActive && (
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((totalDailyUsage / Math.max(1, dailyAiLimit)) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Card 3: Account Security */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Security & Storage
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">Protected</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Session is encrypted. Password protected with random salted scrypt hashes.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/settings')}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>Security settings & password</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Tools section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Recently Used Tools
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Jump straight back into your latest workflows.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/tools')}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>Browse all tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentToolItems.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No recent tools yet
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Explore our collection of utilities including PDF tools, JSON converters, image generators, and calculators.
            </p>
            <button
              onClick={() => onNavigate('/tools')}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-all"
            >
              Explore Tools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentToolItems.map((tool: any) => (
              <div
                key={tool.id}
                onClick={() => {
                  if (onOpenTool) {
                    onOpenTool(tool.id);
                  } else {
                    onNavigate(`/tool/${tool.id}`);
                  }
                }}
                className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/80 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {tool.category || 'Utility'}
                    </span>
                    {tool.isPremium && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trial banner if on trial */}
      {isTrial && (
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 rounded-3xl border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-amber-950 dark:text-amber-200 text-sm sm:text-base">
                Your ₹1 Premium Trial is Active
              </h3>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 max-w-xl">
              You currently have full, unrestricted access to all Premium tools. Trial expires in {remainingTrialDays} days. No recurring charges will be applied.
            </p>
          </div>
          {onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm transition-all"
            >
              Lock in Yearly Plan
            </button>
          )}
        </div>
      )}
    </div>
  );
};
