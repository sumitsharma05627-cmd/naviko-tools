import React from 'react';

export interface ToolPolicyBadgeProps {
  policyType?: 'unlimited' | 'quota-based' | 'metered';
  limit?: number;
  userTier?: string;
  className?: string;
  showTooltip?: boolean;
}

export const ToolPolicyBadge: React.FC<ToolPolicyBadgeProps> = ({
  policyType = 'unlimited',
  limit,
  userTier = 'free',
  className = '',
  showTooltip = true,
}) => {
  if (policyType === 'unlimited') {
    return (
      <span
        title={
          showTooltip
            ? 'Unlimited: Runs client-side in your browser with zero artificial quotas or caps.'
            : undefined
        }
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Unlimited Free Use
      </span>
    );
  }

  return (
    <span
      title={
        showTooltip
          ? `Fair-use quota of ${limit ? `${limit}/day` : 'standard quota'} to prevent server overload.`
          : undefined
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      {limit ? `Fair Use: ${limit}/day` : 'Fair-Use Quota'}
    </span>
  );
};

export default ToolPolicyBadge;
