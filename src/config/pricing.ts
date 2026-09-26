import { ToolCategory } from '../types';

export type PlanType = 'free' | 'plus' | 'pro' | 'trial';
export type BillingInterval = 'monthly' | 'yearly';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'SGD' | 'AED' | 'SAR' | 'JPY';

export type PlanId =
  | 'trial'
  | 'plus_monthly'
  | 'plus_yearly'
  | 'pro_monthly'
  | 'pro_yearly';

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
      monthly: 99,
      yearly: 799,
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
 * Calculate amount in currency subunits for payment gateways
 * (e.g. paise for INR, cents for USD/EUR, integer for JPY).
 * Razorpay strictly requires smallest currency unit.
 */
export function getSubunitAmount(amount: number, currency: CurrencyCode | string = 'INR'): number {
  if (String(currency).toUpperCase() === 'JPY') {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

/**
 * Maps tier and interval to official PlanId
 */
export function getPlanId(tier: 'plus' | 'pro' | 'trial', interval: BillingInterval | 'trial' = 'monthly'): PlanId {
  if (tier === 'trial' || interval === 'trial') return 'trial';
  return `${tier}_${interval === 'yearly' ? 'yearly' : 'monthly'}` as PlanId;
}

/**
 * Parses PlanId into tier and interval
 */
export function parsePlanId(planId: string): { tier: 'plus' | 'pro' | 'trial'; interval: BillingInterval | 'trial' } {
  const normalized = String(planId || '').toLowerCase().trim();
  if (normalized === 'trial' || normalized === 'pro_trial') {
    return { tier: 'trial', interval: 'trial' };
  }
  if (normalized === 'plus_yearly' || normalized === 'plus_annual') {
    return { tier: 'plus', interval: 'yearly' };
  }
  if (normalized === 'plus_monthly' || normalized === 'plus') {
    return { tier: 'plus', interval: 'monthly' };
  }
  if (normalized === 'pro_yearly' || normalized === 'pro_annual') {
    return { tier: 'pro', interval: 'yearly' };
  }
  if (normalized === 'pro_monthly' || normalized === 'pro') {
    return { tier: 'pro', interval: 'monthly' };
  }
  return { tier: 'plus', interval: 'monthly' };
}

export interface ResolvedPlanPricing {
  planId: PlanId;
  tier: 'plus' | 'pro' | 'trial';
  interval: BillingInterval | 'trial';
  currency: CurrencyCode;
  currencySymbol: string;
  name: string;
  amount: number;
  subunitAmount: number;
  formattedPrice: string;
  savingsPercent: number;
}

/**
 * SINGLE SOURCE OF TRUTH RESOLVER
 * Given a planId or { tier, interval, currency }, resolves the authoritative official price
 * and subunit amount (e.g. paise). No client-provided prices are ever used or trusted.
 */
export function resolveOfficialPricing(params: {
  planId?: string;
  tier?: string;
  interval?: string;
  currency?: string;
}): ResolvedPlanPricing {
  const rawCurrency = (params.currency || 'INR').toUpperCase() as CurrencyCode;
  const currencyKey: CurrencyCode = PRICING_CONFIG[rawCurrency] ? rawCurrency : 'INR';
  const currencyConfig = PRICING_CONFIG[currencyKey];

  // Resolve plan identifier
  let planId: PlanId;
  const rawPlanId = params.planId ? String(params.planId).toLowerCase().trim() : '';

  if (rawPlanId === 'trial' || params.tier === 'trial' || params.interval === 'trial') {
    planId = 'trial';
  } else if (rawPlanId === 'plus_yearly' || (params.tier === 'plus' && params.interval === 'yearly')) {
    planId = 'plus_yearly';
  } else if (rawPlanId === 'plus_monthly' || (params.tier === 'plus' && params.interval === 'monthly')) {
    planId = 'plus_monthly';
  } else if (rawPlanId === 'pro_yearly' || (params.tier === 'pro' && params.interval === 'yearly')) {
    planId = 'pro_yearly';
  } else if (rawPlanId === 'pro_monthly' || (params.tier === 'pro' && params.interval === 'monthly')) {
    planId = 'pro_monthly';
  } else if (params.tier === 'pro') {
    planId = params.interval === 'yearly' ? 'pro_yearly' : 'pro_monthly';
  } else {
    planId = params.interval === 'yearly' ? 'plus_yearly' : 'plus_monthly';
  }

  // 1. ₹1 Trial is always ₹1 (100 paise)
  if (planId === 'trial') {
    return {
      planId: 'trial',
      tier: 'trial',
      interval: 'trial',
      currency: 'INR',
      currencySymbol: '₹',
      name: 'NAVIKO 7-Day Trial',
      amount: 1,
      subunitAmount: 100, // exactly 100 paise
      formattedPrice: '₹1',
      savingsPercent: 0,
    };
  }

  const { tier, interval } = parsePlanId(planId);
  const tierConfig = tier === 'pro' ? currencyConfig.pro : currencyConfig.plus;
  const amount = interval === 'yearly' ? tierConfig.yearly : tierConfig.monthly;
  const subunitAmount = getSubunitAmount(amount, currencyConfig.code);
  const formattedPrice = formatCurrencyPrice(amount, currencyConfig.code);
  const savingsPercent =
    interval === 'yearly'
      ? getYearlySavingsPercentage(tierConfig.monthly, tierConfig.yearly)
      : 0;
  const name = `NAVIKO ${tier.toUpperCase()} (${interval === 'yearly' ? 'Annual Pass' : 'Monthly Pass'})`;

  return {
    planId,
    tier,
    interval,
    currency: currencyConfig.code,
    currencySymbol: currencyConfig.symbol,
    name,
    amount,
    subunitAmount,
    formattedPrice,
    savingsPercent,
  };
}

/**
 * Returns catalog of all available plans for a given currency
 */
export function getOfficialPlansCatalog(currency: CurrencyCode = 'INR'): ResolvedPlanPricing[] {
  return [
    resolveOfficialPricing({ planId: 'plus_monthly', currency }),
    resolveOfficialPricing({ planId: 'plus_yearly', currency }),
    resolveOfficialPricing({ planId: 'pro_monthly', currency }),
    resolveOfficialPricing({ planId: 'pro_yearly', currency }),
    resolveOfficialPricing({ planId: 'trial', currency }),
  ];
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

