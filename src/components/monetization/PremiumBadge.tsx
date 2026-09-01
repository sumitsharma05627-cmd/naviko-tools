import React from 'react';
import { Sparkles, Crown, Zap } from 'lucide-react';
import { PlanType } from '../../config/pricing';

interface PremiumBadgeProps {
  tier?: PlanType | 'premium';
  size?: 'xs' | 'sm' | 'md';
  variant?: 'amber' | 'indigo' | 'emerald' | 'gradient' | 'pro';
  icon?: boolean;
  className?: string;
  label?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  tier = 'plus',
  size = 'xs',
  variant,
  icon = true,
  className = '',
  label,
}) => {
  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 font-extrabold tracking-wider',
    sm: 'text-[10px] px-2 py-0.5 font-bold tracking-wider',
    md: 'text-xs px-2.5 py-1 font-bold',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  const displayTier = tier === 'premium' ? 'plus' : tier;

  let effectiveVariant = variant;
  if (!effectiveVariant) {
    if (displayTier === 'pro') effectiveVariant = 'pro';
    else if (displayTier === 'plus') effectiveVariant = 'indigo';
    else effectiveVariant = 'amber';
  }

  const variantClasses = {
    amber: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    indigo: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    gradient: 'bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 text-amber-700 dark:text-amber-300 border-amber-300/40 dark:border-amber-600/40',
    pro: 'bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 text-purple-900 dark:text-purple-200 border-purple-300/50 dark:border-purple-600/50',
  };

  const badgeText = label || (displayTier === 'pro' ? 'PRO' : displayTier === 'plus' ? 'PLUS' : 'FREE');

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border uppercase shadow-2xs select-none ${sizeClasses[size]} ${variantClasses[effectiveVariant]} ${className}`}
    >
      {icon && (
        displayTier === 'pro' ? (
          <Crown className={`${iconSizes[size]} text-amber-500 shrink-0`} />
        ) : displayTier === 'plus' ? (
          <Sparkles className={`${iconSizes[size]} text-indigo-500 dark:text-indigo-400 shrink-0`} />
        ) : (
          <Zap className={`${iconSizes[size]} text-emerald-500 shrink-0`} />
        )
      )}
      <span>{badgeText}</span>
    </span>
  );
};

