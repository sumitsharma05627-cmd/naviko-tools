import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { SUPPORTED_CURRENCY_CODES, CURRENCIES_REGISTRY, CurrencyCode } from '../../config/pricingEngine';

interface CurrencySelectorProps {
  variant?: 'compact' | 'full' | 'inline';
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { currentCurrency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCurrency = CURRENCIES_REGISTRY[currentCurrency] || CURRENCIES_REGISTRY.INR;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer font-medium text-xs ${
          isOpen
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600'
            : 'bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 shadow-2xs'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Select billing currency"
      >
        <span className="text-sm leading-none">{activeCurrency.flag}</span>
        <span className="font-bold">{activeCurrency.code}</span>
        <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">({activeCurrency.symbol.trim()})</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          role="listbox"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Select Currency (10+)</span>
            <Globe className="w-3 h-3 text-slate-400" />
          </div>

          <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
            {SUPPORTED_CURRENCY_CODES.map((code) => {
              const item = CURRENCIES_REGISTRY[code];
              const isSelected = code === currentCurrency;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setCurrency(code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-sm shrink-0">{item.flag}</span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{item.code}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-normal text-[11px]">
                          ({item.symbol.trim()})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {item.name}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 dark:text-slate-500 leading-tight">
            Fair international exchange rates applied with automated country detection.
          </div>
        </div>
      )}
    </div>
  );
};
