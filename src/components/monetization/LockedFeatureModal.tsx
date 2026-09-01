import React from 'react';
import { Sparkles, Crown, Lock, ArrowRight, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { PRICING_CONFIG, PlanType, formatCurrencyPrice } from '../../config/pricing';

interface LockedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle: string;
  featureDescription: string;
  requiredTier?: 'plus' | 'pro';
  benefits?: string[];
  onNavigate?: (path: string) => void;
}

export const LockedFeatureModal: React.FC<LockedFeatureModalProps> = ({
  isOpen,
  onClose,
  featureTitle,
  featureDescription,
  requiredTier = 'plus',
  benefits,
  onNavigate,
}) => {
  const { currency, billingInterval } = useSubscription();

  if (!isOpen) return null;

  const isPro = requiredTier === 'pro';
  const pricing = PRICING_CONFIG[currency] || PRICING_CONFIG.INR;
  const tierConfig = isPro ? pricing.pro : pricing.plus;
  const currentPriceFormatted = formatCurrencyPrice(
    billingInterval === 'yearly' ? tierConfig.yearly : tierConfig.monthly,
    currency
  );
  const intervalLabel = billingInterval === 'yearly' ? '/year' : '/month';

  const defaultBenefits = isPro
    ? [
        'Maximum 200 daily operations across AI and smart tools',
        'Batch document and high-resolution image processing',
        'Advanced predictive score analytics & complete study reports',
        '100% Ad-free distractionless workspace',
      ]
    : [
        '50 daily operations across all smart utilities',
        'Saved meal plans, mock test history, and custom dashboards',
        'Weekly meal planner with automatic grocery list generator',
        'Reduced advertising and early access to new tools',
      ];

  const displayBenefits = benefits || defaultBenefits;

  const handleUpgrade = () => {
    onClose();
    if (onNavigate) {
      onNavigate('/pricing');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/pricing';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-left transition-colors overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className={`absolute -top-16 -right-16 w-40 h-40 ${isPro ? 'bg-purple-500/15' : 'bg-indigo-500/15'} rounded-full blur-2xl pointer-events-none`} />
        <div className={`absolute -top-16 -left-16 w-40 h-40 ${isPro ? 'bg-amber-500/15' : 'bg-emerald-500/15'} rounded-full blur-2xl pointer-events-none`} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl ${isPro ? 'bg-gradient-to-br from-purple-500/20 to-amber-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30' : 'bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'} flex items-center justify-center`}>
            {isPro ? <Crown className="w-6 h-6 text-amber-500" /> : <Sparkles className="w-6 h-6 text-indigo-500" />}
          </div>
          <div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider ${isPro ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800'} px-2 py-0.5 rounded-full border`}>
              <Lock className="w-2.5 h-2.5" /> {isPro ? 'Included with Pro' : 'Included with Plus'}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {featureTitle}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {featureDescription}
        </p>

        {/* Benefits List */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">
            What you get with NAVIKO {isPro ? 'Pro' : 'Plus'}:
          </div>
          <ul className="space-y-2">
            {displayBenefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <CheckCircle2 className={`w-4 h-4 ${isPro ? 'text-purple-500' : 'text-emerald-500'} shrink-0 mt-0.5`} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price callout & CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {isPro ? 'Pro plan from' : 'Plus plan from'}
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {currentPriceFormatted} <span className="text-xs font-normal text-slate-500">{intervalLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl ${isPro ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-indigo-500/20'} font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
            >
              <span>{isPro ? 'Upgrade to Pro' : 'Upgrade to Plus'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Trust Notice */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Cancel anytime. Core tools will always remain 100% free forever.</span>
        </div>
      </div>
    </div>
  );
};

