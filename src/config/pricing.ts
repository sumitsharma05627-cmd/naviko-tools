import { ToolCategory } from '../types';

export type PlanType = 'free' | 'plus' | 'pro';
export type BillingInterval = 'monthly' | 'yearly';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'SGD' | 'AED' | 'SAR' | 'JPY';

export interface TierPrice {
  monthly: number;
  yearly: number;
}

export interface CurrencyPricing {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  plus: TierPrice;
  pro: TierPrice;
  formatString: string;
  isPopular?: boolean;
}

export interface PlanFeature {
  text: string;
  free: boolean | string;
  plus: boolean | string;
  pro: boolean | string;
  category: 'core' | 'limits' | 'student' | 'health' | 'productivity' | 'experience';
}

/**
 * Centralized Variable Pricing Configuration for NAVIKO
 * All 3 tiers (Free, Plus, Pro) across 10 localized currencies.
 */
export const PRICING_CONFIG: Record<CurrencyCode, CurrencyPricing> = {
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    plus: {
      monthly: 79,
      yearly: 599,
    },
    pro: {
      monthly: 199,
      yearly: 1499,
    },
    formatString: '₹{price}',
    isPopular: true,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    plus: {
      monthly: 0.99,
      yearly: 7.99,
    },
    pro: {
      monthly: 2.49,
      yearly: 19.99,
    },
    formatString: '${price}',
    isPopular: true,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    plus: {
      monthly: 0.99,
      yearly: 7.99,
    },
    pro: {
      monthly: 2.49,
      yearly: 19.99,
    },
    formatString: '€{price}',
    isPopular: true,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    plus: {
      monthly: 0.89,
      yearly: 6.99,
    },
    pro: {
      monthly: 2.19,
      yearly: 17.99,
    },
    formatString: '£{price}',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    plus: {
      monthly: 1.49,
      yearly: 11.99,
    },
    pro: {
      monthly: 3.49,
      yearly: 27.99,
    },
    formatString: 'C${price}',
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    plus: {
      monthly: 1.49,
      yearly: 11.99,
    },
    pro: {
      monthly: 3.49,
      yearly: 27.99,
    },
    formatString: 'A${price}',
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    plus: {
      monthly: 1.49,
      yearly: 11.99,
    },
    pro: {
      monthly: 3.49,
      yearly: 27.99,
    },
    formatString: 'S${price}',
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED ',
    flag: '🇦🇪',
    plus: {
      monthly: 3.99,
      yearly: 29.99,
    },
    pro: {
      monthly: 9.99,
      yearly: 74.99,
    },
    formatString: 'AED {price}',
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR ',
    flag: '🇸🇦',
    plus: {
      monthly: 3.99,
      yearly: 29.99,
    },
    pro: {
      monthly: 9.99,
      yearly: 74.99,
    },
    formatString: 'SAR {price}',
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    plus: {
      monthly: 149,
      yearly: 1199,
    },
    pro: {
      monthly: 399,
      yearly: 2999,
    },
    formatString: '¥{price}',
  },
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'SGD',
  'AED',
  'SAR',
  'JPY',
];

/**
 * Helper to calculate effective monthly price for an annual plan.
 */
export function getEffectiveMonthlyPrice(yearlyPrice: number): number {
  return Number((yearlyPrice / 12).toFixed(2));
}

/**
 * Helper to calculate true mathematical savings percentage for the yearly plan compared to 12 monthly payments.
 */
export function getYearlySavingsPercentage(monthlyPrice: number, yearlyPrice: number): number {
  const fullYearMonthlyCost = monthlyPrice * 12;
  if (fullYearMonthlyCost <= 0) return 0;
  const savings = ((fullYearMonthlyCost - yearlyPrice) / fullYearMonthlyCost) * 100;
  return Math.max(0, Math.round(savings));
}

/**
 * Helper to format price with proper symbol and precision.
 */
export function formatCurrencyPrice(amount: number, currencyCode: CurrencyCode): string {
  const currency = PRICING_CONFIG[currencyCode] || PRICING_CONFIG.INR;
  const isInteger = Number.isInteger(amount);
  const formattedNumber = isInteger ? amount.toLocaleString() : amount.toFixed(2);
  return currency.formatString.replace('{price}', formattedNumber);
}

/**
 * Detect user locale currency candidate.
 */
export function detectDefaultCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'INR';
  try {
    const saved = localStorage.getItem('naviko_currency') as CurrencyCode;
    if (saved && PRICING_CONFIG[saved]) return saved;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) return 'INR';
    if (timeZone.includes('London') || timeZone.includes('Europe/Belfast')) return 'GBP';
    if (timeZone.includes('Europe/Paris') || timeZone.includes('Europe/Berlin') || timeZone.includes('Europe/Rome') || timeZone.includes('Europe/Madrid')) return 'EUR';
    if (timeZone.includes('America/Toronto') || timeZone.includes('America/Vancouver')) return 'CAD';
    if (timeZone.includes('Australia/Sydney') || timeZone.includes('Australia/Melbourne')) return 'AUD';
    if (timeZone.includes('Asia/Singapore')) return 'SGD';
    if (timeZone.includes('Asia/Dubai')) return 'AED';
    if (timeZone.includes('Asia/Riyadh')) return 'SAR';
    if (timeZone.includes('Asia/Tokyo')) return 'JPY';
    if (timeZone.includes('America/New_York') || timeZone.includes('America/Los_Angeles') || timeZone.includes('America/Chicago')) return 'USD';
  } catch {
    // Fallback to INR for NAVIKO default
  }
  return 'INR';
}

/**
 * Features list comparison for Free vs Plus vs Pro plans
 */
export const COMPARISON_FEATURES: PlanFeature[] = [
  // Core & Tool Access
  {
    text: 'Core NAVIKO tools (Calculators, Converters, BMI)',
    free: true,
    plus: true,
    pro: true,
    category: 'core',
  },
  {
    text: 'Basic Financial Calculators (SIP, EMI, Budget, Salary)',
    free: true,
    plus: true,
    pro: true,
    category: 'core',
  },
  {
    text: 'Student Tools (CGPA, Attendance, Timetable)',
    free: 'Basic',
    plus: 'Advanced',
    pro: 'Advanced+',
    category: 'student',
  },
  {
    text: 'PDF & Document Tools',
    free: 'Basic',
    plus: 'Advanced',
    pro: 'Advanced+',
    category: 'core',
  },
  {
    text: 'Image Utilities (Compressor, Resizer, Cropper)',
    free: 'Basic',
    plus: 'Advanced',
    pro: 'Advanced+',
    category: 'core',
  },
  {
    text: 'Career Tools (ATS Resume Builder)',
    free: true,
    plus: true,
    pro: true,
    category: 'core',
  },
  {
    text: 'BMI Calculator & Pediatric Growth Guidelines',
    free: true,
    plus: true,
    pro: true,
    category: 'health',
  },
  {
    text: 'Nutrition Science & Food Composition Explorer',
    free: 'Basic',
    plus: 'Advanced',
    pro: 'Advanced+',
    category: 'health',
  },

  // Daily Limits & AI Processing
  {
    text: 'Daily AI & Server Processing Quota',
    free: '5 ops / day',
    plus: '50 ops / day',
    pro: '200 ops / day',
    category: 'limits',
  },
  {
    text: 'Batch Processing (Multiple documents/images)',
    free: false,
    plus: false,
    pro: true,
    category: 'limits',
  },
  {
    text: 'High-Resolution File & Document Processing',
    free: 'Standard',
    plus: 'Enhanced',
    pro: 'Maximum Quality',
    category: 'limits',
  },

  // Nutrition Science Advanced
  {
    text: 'Saved Custom Meal Plates & Food History',
    free: false,
    plus: true,
    pro: true,
    category: 'health',
  },
  {
    text: 'Weekly 7-Day Meal Planner with Macro Balancing',
    free: false,
    plus: true,
    pro: true,
    category: 'health',
  },
  {
    text: 'Automated Smart Grocery List Generator',
    free: false,
    plus: true,
    pro: true,
    category: 'health',
  },
  {
    text: 'Multi-Food Comparison Matrix',
    free: '2 Foods',
    plus: '3-Way Deep',
    pro: 'Advanced Matrix',
    category: 'health',
  },

  // Student Productivity Advanced
  {
    text: 'Mock Test Score Analysis & Negative Mark Breakdown',
    free: true,
    plus: true,
    pro: true,
    category: 'student',
  },
  {
    text: 'Saved Test History & Long-Term Trend Analytics',
    free: false,
    plus: true,
    pro: true,
    category: 'student',
  },
  {
    text: 'Subject Weak-Spot Diagnosis & Rank Projection',
    free: false,
    plus: true,
    pro: true,
    category: 'student',
  },
  {
    text: 'Study Progress Tracking & Custom Decision Plans',
    free: 'Basic',
    plus: true,
    pro: true,
    category: 'student',
  },

  // Platform & Experience
  {
    text: 'Saved Tool History & Persistent Workspace',
    free: '—',
    plus: true,
    pro: true,
    category: 'productivity',
  },
  {
    text: 'Personalized User Dashboard & Quick Pins',
    free: '—',
    plus: true,
    pro: true,
    category: 'productivity',
  },
  {
    text: 'Custom Export Formats (PDF, CSV, JSON)',
    free: 'Limited',
    plus: 'More Exports',
    pro: 'Advanced Exports',
    category: 'productivity',
  },
  {
    text: 'Priority Access to Newly Released Tools',
    free: 'Standard',
    plus: 'Early Access',
    pro: 'Priority Access',
    category: 'experience',
  },
  {
    text: 'Advertising Experience',
    free: 'Standard Ads',
    plus: 'Reduced Ads',
    pro: 'Ad-Free Experience',
    category: 'experience',
  },
];

