import React from 'react';
import { useVersion } from '../../context/VersionContext';

export interface UnifiedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  padded?: boolean;
  borderAccent?: boolean;
}

export const UnifiedCard: React.FC<UnifiedCardProps> = ({
  children,
  hoverEffect = false,
  padded = true,
  borderAccent = false,
  className = '',
  ...props
}) => {
  const { version } = useVersion();

  const getBorderColor = () => {
    if (!borderAccent) return 'border-slate-200/80 dark:border-slate-800/80';
    switch (version) {
      case 'v1':
        return 'border-indigo-300 dark:border-indigo-800/60 shadow-indigo-500/5';
      case 'v2':
        return 'border-emerald-300 dark:border-emerald-800/60 shadow-emerald-500/5';
      case 'v3':
      default:
        return 'border-amber-300/80 dark:border-amber-700/60 shadow-amber-500/5';
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900/90 rounded-2xl border ${getBorderColor()} shadow-xs transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md hover:-translate-y-0.5' : ''
      } ${padded ? 'p-5 sm:p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
