import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  CURRENCIES_REGISTRY,
  CurrencyMetadata,
  DynamicBasePricesINR,
  INTERNATIONAL_MINIMUM_MULTIPLIER,
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
  internationalMultiplier: number;
  basePricesINR: DynamicBasePricesINR;
  exchangeRates: Partial<Record<CurrencyCode, number>>;
  refreshPricingConfig: () => Promise<void>;
}

const DEFAULT_BASE_PRICES: DynamicBasePricesINR = {
  v1: { pro: 299, premium: 699 },
  v2: { plus: 349, premium: 749 },
  v3: { plus: 499, premium: 999 },
};

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
  const [internationalMultiplier, setInternationalMultiplier] = useState<number>(
    INTERNATIONAL_MINIMUM_MULTIPLIER
  );
  const [basePricesINR, setBasePricesINR] = useState<DynamicBasePricesINR>(DEFAULT_BASE_PRICES);
  const [exchangeRates, setExchangeRates] = useState<Partial<Record<CurrencyCode, number>>>({});

  const refreshPricingConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/pricing/engine');
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success) {
        if (typeof data.internationalMultiplier === 'number' && data.internationalMultiplier >= 5) {
          setInternationalMultiplier(data.internationalMultiplier);
        }
        if (data.basePricesINR) {
          setBasePricesINR(data.basePricesINR);
        }
        if (data.exchangeRates) {
          setExchangeRates(data.exchangeRates);
        }
      }
    } catch {
      // keep safe defaults
    }
  }, []);

  useEffect(() => {
    const { detectedCurrency, detectedCountry: country } = detectVisitorCurrency();
    setDetectedCountry(country);

    const saved = localStorage.getItem('naviko_global_currency') as CurrencyCode;
    const dismissed = localStorage.getItem('naviko_currency_suggestion_dismissed');

    if (!saved && !dismissed && detectedCurrency !== 'INR') {
      setSuggestedCurrency(detectedCurrency);
    }

    refreshPricingConfig();
  }, [refreshPricingConfig]);

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

  const baseMeta = CURRENCIES_REGISTRY[currentCurrency] || CURRENCIES_REGISTRY.INR;
  const currencyMeta: CurrencyMetadata = {
    ...baseMeta,
    exchangeRateToINR: exchangeRates[currentCurrency] || baseMeta.exchangeRateToINR,
  };

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
        internationalMultiplier,
        basePricesINR,
        exchangeRates,
        refreshPricingConfig,
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
