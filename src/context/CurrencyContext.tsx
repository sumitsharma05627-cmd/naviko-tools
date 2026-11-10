import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  CURRENCIES_REGISTRY,
  SUPPORTED_CURRENCY_CODES,
  CurrencyMetadata,
  detectVisitorCurrency,
} from '../config/pricingEngine';

interface CurrencyContextType {
  currentCurrency: CurrencyCode;
  currencyMeta: CurrencyMetadata;
  setCurrency: (code: CurrencyCode) => void;
  detectedCountry: string;
  suggestedCurrency: CurrencyCode | null;
  dismissSuggestion: () => void;
  acceptSuggestedCurrency: () => void;
  formatPriceString: (amount: number, code?: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCurrency, setCurrentCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naviko_global_currency') as CurrencyCode;
      if (saved && CURRENCIES_REGISTRY[saved]) {
        return saved;
      }
    }
    return detectVisitorCurrency().detectedCurrency;
  });

  const [suggestedCurrency, setSuggestedCurrency] = useState<CurrencyCode | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string>('India');

  useEffect(() => {
    const { detectedCurrency, detectedCountry: country } = detectVisitorCurrency();
    setDetectedCountry(country);

    const saved = localStorage.getItem('naviko_global_currency') as CurrencyCode;
    const dismissed = localStorage.getItem('naviko_currency_suggestion_dismissed');

    if (!saved && !dismissed && detectedCurrency !== 'INR') {
      setSuggestedCurrency(detectedCurrency);
    }
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (CURRENCIES_REGISTRY[code]) {
      setCurrentCurrencyState(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('naviko_global_currency', code);
        localStorage.setItem('naviko_currency', code); // backward compatibility
      }
    }
  }, []);

  const dismissSuggestion = useCallback(() => {
    setSuggestedCurrency(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_currency_suggestion_dismissed', 'true');
    }
  }, []);

  const acceptSuggestedCurrency = useCallback(() => {
    if (suggestedCurrency) {
      setCurrency(suggestedCurrency);
      dismissSuggestion();
    }
  }, [suggestedCurrency, setCurrency, dismissSuggestion]);

  const currencyMeta = CURRENCIES_REGISTRY[currentCurrency] || CURRENCIES_REGISTRY.INR;

  const formatPriceString = useCallback(
    (amount: number, code?: CurrencyCode) => {
      const targetMeta = CURRENCIES_REGISTRY[code || currentCurrency] || currencyMeta;
      const formattedNum = targetMeta.isZeroDecimal
        ? Math.round(amount).toLocaleString()
        : amount.toFixed(2);
      return targetMeta.formatPattern.replace('{price}', formattedNum);
    },
    [currentCurrency, currencyMeta]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencyMeta,
        setCurrency,
        detectedCountry,
        suggestedCurrency,
        dismissSuggestion,
        acceptSuggestedCurrency,
        formatPriceString,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
