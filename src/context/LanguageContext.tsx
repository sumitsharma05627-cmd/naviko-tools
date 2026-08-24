import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageCode, LanguageInfo } from '../locales';

export type { LanguageCode };
export type LanguageMeta = LanguageInfo;
export const LANGUAGES = SUPPORTED_LANGUAGES;
export { TRANSLATIONS };

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
  languages: LanguageMeta[];
  activeMeta: LanguageMeta;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currencyCode?: string, compact?: boolean) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('naviko_language') as LanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    if (TRANSLATIONS[lang]) {
      setCurrentLanguageState(lang);
      try {
        localStorage.setItem('naviko_language', lang);
      } catch {
        // ignore
      }
      const meta = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
      if (meta) {
        document.documentElement.dir = meta.dir || 'ltr';
        document.documentElement.lang = meta.code;
      }
    }
  };

  useEffect(() => {
    const meta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
    if (meta) {
      document.documentElement.dir = meta.dir || 'ltr';
      document.documentElement.lang = meta.code;
    }
  }, [currentLanguage]);

  const t = (key: string, defaultText?: string): string => {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    if (dict && dict[key]) return dict[key];
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return defaultText !== undefined ? defaultText : key;
  };

  const activeMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
    if (isNaN(value)) return '0';
    try {
      const locale = currentLanguage === 'hi' ? 'en-IN' : currentLanguage;
      return new Intl.NumberFormat(locale, options).format(value);
    } catch {
      return value.toLocaleString();
    }
  };

  const formatCurrency = (amount: number, currencyCode: string = 'INR', compact: boolean = false): string => {
    if (isNaN(amount)) return '₹0';
    try {
      const locale = currentLanguage === 'hi' ? 'en-IN' : currentLanguage === 'en' ? 'en-IN' : currentLanguage;
      const opts: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2,
        notation: compact ? 'compact' : 'standard',
      };
      return new Intl.NumberFormat(locale, opts).format(amount);
    } catch {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      return new Intl.DateTimeFormat(currentLanguage, options || { dateStyle: 'medium' }).format(d);
    } catch {
      return String(date);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        activeMeta,
        formatNumber,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
