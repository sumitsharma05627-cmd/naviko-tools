import React from 'react';
import { Globe, X, Check } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { CURRENCIES_REGISTRY } from '../../config/pricingEngine';

export const CurrencyBanner: React.FC = () => {
  const {
    currentCurrency,
    suggestedCurrency,
    detectedCountry,
    dismissSuggestion,
    acceptSuggestedCurrency,
  } = useCurrency();

  if (!suggestedCurrency || suggestedCurrency === currentCurrency) {
    return null;
  }

  const suggestedMeta = CURRENCIES_REGISTRY[suggestedCurrency];
  if (!suggestedMeta) return null;

  return (
    <div className="bg-slate-900 text-slate-100 text-xs border-b border-slate-800 py-2 px-3 sm:px-6 relative z-30 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 truncate">
          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            Visiting from <strong className="text-white">{detectedCountry}</strong>? Prices can be displayed in{' '}
            <strong className="text-amber-300 font-mono">
              {suggestedMeta.code} ({suggestedMeta.symbol.trim()})
            </strong>
            .
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={acceptSuggestedCurrency}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Switch to {suggestedMeta.code}</span>
          </button>
          <button
            type="button"
            onClick={dismissSuggestion}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss currency suggestion"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
