import React from 'react';
import { Clock, Zap, ArrowRight, X, ShieldCheck, Crown, Sparkles } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { PRICING_CONFIG, formatCurrencyPrice } from '../../config/pricing';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  limit: number;
  onNavigate?: (path: string) => void;
}

export const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
  toolName,
  limit,
  onNavigate,
}) => {
  const { plan, currency, billingInterval } = useSubscription();

  if (!isOpen) return null;

  const isPlusUser = plan === 'plus';
  const targetTier = isPlusUser ? 'pro' : 'plus';
  const isProTarget = targetTier === 'pro';

  const pricing = PRICING_CONFIG[currency] || PRICING_CONFIG.INR;
  const tierConfig = isProTarget ? pricing.pro : pricing.plus;
  const currentPriceFormatted = formatCurrencyPrice(
    billingInterval === 'yearly' ? tierConfig.yearly : tierConfig.monthly,
    currency
  );

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
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-left transition-colors overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl ${isProTarget ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20' : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'} flex items-center justify-center mb-4`}>
          <Clock className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
          You've reached today's limit
        </h3>

        {/* Body */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
          You have used all <span className="font-bold text-slate-900 dark:text-white">{limit} daily operations</span> for <span className="font-semibold text-slate-900 dark:text-white">{toolName}</span>. Your daily quota automatically resets at midnight UTC.
        </p>

        {/* Upgrade Callout */}
        <div className={`my-5 p-4 rounded-2xl ${isProTarget ? 'bg-gradient-to-br from-purple-500/10 via-amber-500/10 to-transparent border border-purple-500/20' : 'bg-gradient-to-br from-indigo-500/10 via-emerald-500/10 to-transparent border border-indigo-500/20'} text-xs`}>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
            {isProTarget ? <Crown className="w-4 h-4 text-amber-500" /> : <Zap className="w-4 h-4 text-indigo-500" />}
            <span>Need higher limits right now?</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            {isProTarget
              ? `Upgrade to NAVIKO Pro for maximum quotas (200 ops/day), batch processing, and ad-free speed starting at ${currentPriceFormatted}.`
              : `Upgrade to NAVIKO Plus for 10x higher limits (50 ops/day), saved history, and student analytics starting at ${currentPriceFormatted}.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
          >
            Continue Later
          </button>
          <button
            onClick={handleUpgrade}
            className={`w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl ${isProTarget ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white'} font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center`}
          >
            <span>{isProTarget ? 'Upgrade to Pro' : 'Upgrade to Plus'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Core calculators and search will always remain 100% free with no limits.</span>
        </div>
      </div>
    </div>
  );
};

