import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { CurrencyCode, PRICING_CONFIG, SUPPORTED_CURRENCIES } from '../../config/pricing';
import { useSubscription } from '../../context/SubscriptionContext';

interface CurrencySelectorProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { currency, setCurrency } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePricing = PRICING_CONFIG[currency] || PRICING_CONFIG.INR;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
        aria-label="Select Currency"
      >
        <span className="text-sm">{activePricing.flag}</span>
        <span>
          {activePricing.code} ({activePricing.symbol.trim()})
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-thin">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 py-1 flex items-center justify-between">
            <span>Select Currency</span>
            <Globe className="w-3 h-3" />
          </div>

          <div className="space-y-0.5 mt-1">
            {SUPPORTED_CURRENCIES.map((code) => {
              const item = PRICING_CONFIG[code];
              const isSelected = currency === code;

              return (
                <button
                  key={code}
                  onClick={() => {
                    setCurrency(code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.flag}</span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.code} ({item.symbol.trim()})
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.name}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
