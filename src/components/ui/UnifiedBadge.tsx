import React from 'react';
import { useVersion } from '../../context/VersionContext';

export interface UnifiedBadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'accent' | 'unboxed';
  size?: 'xs' | 'sm';
  className?: string;
}

export const UnifiedBadge: React.FC<UnifiedBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'xs',
  className = '',
}) => {
  const { version } = useVersion();

  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  if (variant === 'unboxed') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400 ${sizeClass} ${className}`}>
        {children}
      </span>
    );
  }

  let colorClasses = '';
  switch (variant) {
    case 'success':
      colorClasses = 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60';
      break;
    case 'warning':
      colorClasses = 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60';
      break;
    case 'accent':
      if (version === 'v1') {
        colorClasses = 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60';
      } else if (version === 'v2') {
        colorClasses = 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60';
      } else {
        colorClasses = 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60';
      }
      break;
    case 'neutral':
    default:
      colorClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-semibold tracking-wide ${sizeClass} ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
};
