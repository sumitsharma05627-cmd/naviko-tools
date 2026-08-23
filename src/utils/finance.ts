export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  isIndianNotation: boolean;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', isIndianNotation: true },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)', isIndianNotation: false },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)', isIndianNotation: false },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)', isIndianNotation: false },
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  compact: boolean = false
): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';

  const symbol = CURRENCIES[currency]?.symbol || '₹';
  const isIndian = CURRENCIES[currency]?.isIndianNotation;

  if (compact) {
    if (isIndian) {
      if (Math.abs(amount) >= 10000000) {
        return `${symbol}${(amount / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(amount) >= 100000) {
        return `${symbol}${(amount / 100000).toFixed(2)} L`;
      }
      if (Math.abs(amount) >= 1000) {
        return `${symbol}${(amount / 1000).toFixed(1)}k`;
      }
    } else {
      if (Math.abs(amount) >= 1000000000) {
        return `${symbol}${(amount / 1000000000).toFixed(2)}B`;
      }
      if (Math.abs(amount) >= 1000000) {
        return `${symbol}${(amount / 1000000).toFixed(2)}M`;
      }
      if (Math.abs(amount) >= 1000) {
        return `${symbol}${(amount / 1000).toFixed(1)}k`;
      }
    }
  }

  const rounded = Math.round(amount);
  if (isIndian) {
    return `${symbol}${rounded.toLocaleString('en-IN')}`;
  }
  return `${symbol}${rounded.toLocaleString('en-US')}`;
}

export function formatNumberWords(num: number, currency: CurrencyCode = 'INR'): string {
  if (num <= 0) return '';
  if (currency === 'INR') {
    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(2);
      return `${cr} Crores`;
    }
    if (num >= 100000) {
      const lakh = (num / 100000).toFixed(2);
      return `${lakh} Lakhs`;
    }
    if (num >= 1000) {
      const k = (num / 1000).toFixed(1);
      return `${k} Thousand`;
    }
  } else {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)} Billion`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} Million`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)} Thousand`;
    }
  }
  return '';
}
