import React from 'react';

interface AdSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'responsive';
  className?: string;
  label?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ 
  format = 'responsive',
  className = '',
  label = 'Advertisement'
}) => {
  return (
    <div 
      className={`my-6 mx-auto w-full max-w-4xl rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3 text-center transition-all ${className}`}
      aria-label="Advertisement Placeholder"
    >
      <div className="flex flex-col items-center justify-center min-h-[90px] text-xs text-slate-400">
        <span className="font-mono text-[10px] tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-400 mb-1">
          {label}
        </span>
        <span className="text-[11px] text-slate-400">
          Clean, non-intrusive sponsor space reserved for verified partners
        </span>
      </div>
    </div>
  );
};

export const DesktopAdSlot: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`hidden md:block ${className}`}>
    <AdSlot format="horizontal" />
  </div>
);

export const MobileAdSlot: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`block md:hidden ${className}`}>
    <AdSlot format="rectangle" />
  </div>
);
