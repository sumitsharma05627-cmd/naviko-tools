import React from 'react';
import { useVersion } from '../../context/VersionContext';

export interface UnifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const { version } = useVersion();

  // Unified size map adhering to spatial math: horizontal ~= 2x vertical, touch target >= 40px
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl min-h-[36px]',
    md: 'px-4 py-2 text-xs sm:text-sm font-bold rounded-xl min-h-[42px]',
    lg: 'px-6 py-2.5 text-sm sm:text-base font-bold rounded-2xl min-h-[48px]',
  }[size];

  // Dynamic theme accent based on active NAVIKO product version:
  // v1: Indigo / Modern technology
  // v2: Emerald / Wellness & Nutrition
  // v3: Amber-Gold / Celestial Midnight
  const getPrimaryClass = () => {
    switch (version) {
      case 'v1':
        return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20 active:scale-[0.98]';
      case 'v2':
        return 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-700/20 active:scale-[0.98]';
      case 'v3':
      default:
        return 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/20 active:scale-[0.98]';
    }
  };

  const getSecondaryClass = () => {
    switch (version) {
      case 'v1':
        return 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60';
      case 'v2':
        return 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60';
      case 'v3':
      default:
        return 'bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60';
    }
  };

  let variantClass = '';
  switch (variant) {
    case 'primary':
      variantClass = getPrimaryClass();
      break;
    case 'secondary':
      variantClass = getSecondaryClass();
      break;
    case 'outline':
      variantClass =
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 active:scale-[0.98]';
      break;
    case 'ghost':
      variantClass =
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white';
      break;
    case 'danger':
      variantClass = 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20 active:scale-[0.98]';
      break;
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
