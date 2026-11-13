import type { ToolCategory } from '../types.ts';

export type PlanType = 'free' | 'plus' | 'pro' | 'business' | 'founding' | 'trial';
export type BillingInterval = 'monthly' | 'yearly' | 'lifetime';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'SGD' | 'AED' | 'SAR' | 'JPY';

export type PlanId =
  | 'trial'
  | 'plus_monthly'
  | 'plus_yearly'
  | 'pro_monthly'
  | 'pro_yearly'
  | 'business_monthly'
  | 'business_yearly'
  | 'premium_monthly'
  | 'premium_yearly'
  | 'founding_member'
  | 'custom_plan';

export interface TierPrice {
  monthly: number;
  yearly: number;
  founding?: number;
}

export interface CurrencyPricing {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  plus: TierPrice;
  pro: TierPrice;
  business: TierPrice;
  formatString: string;
  isPopular?: boolean;
}

export interface PlanFeature {
  text: string;
  free: boolean | string;
  plus: boolean | string;
  pro: boolean | string;
  business?: boolean | string;
  category: 'core' | 'limits' | 'student' | 'health' | 'productivity' | 'experience';
}

/**
 * Centralized Variable Pricing Configuration for NAVIKO
 * Supports Free, Plus (₹299/mo), Pro (₹699/mo), Business (₹1,499/mo), and Founding Member (₹7,999).
 */
export const PRICING_CONFIG: Record<CurrencyCode, CurrencyPricing> = {
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    plus: {
      monthly: 299,
      yearly: 2999,
      founding: 7999,
    },
    pro: {
      monthly: 699,
      yearly: 6999,
      founding: 7999,
    },
    business: {
      monthly: 1499,
      yearly: 14990,
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
      monthly: 3.99,
      yearly: 39.00,
    },
    pro: {
      monthly: 8.99,
      yearly: 89.00,
    },
    business: {
      monthly: 19.99,
      yearly: 199.00,
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
      monthly: 3.99,
      yearly: 39.00,
    },
    pro: {
      monthly: 8.99,
      yearly: 89.00,
    },
    business: {
      monthly: 19.99,
      yearly: 199.00,
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
      monthly: 3.49,
      yearly: 34.00,
    },
    pro: {
      monthly: 7.99,
      yearly: 79.00,
    },
    business: {
      monthly: 17.99,
      yearly: 179.00,
    },
    formatString: '£{price}',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    plus: {
      monthly: 4.99,
      yearly: 49.00,
    },
    pro: {
      monthly: 11.99,
      yearly: 119.00,
    },
    business: {
      monthly: 24.99,
      yearly: 249.00,
    },
    formatString: 'C${price}',
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    plus: {
      monthly: 5.99,
      yearly: 59.00,
    },
    pro: {
      monthly: 12.99,
      yearly: 129.00,
    },
    business: {
      monthly: 27.99,
      yearly: 279.00,
    },
    formatString: 'A${price}',
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    plus: {
      monthly: 4.99,
      yearly: 49.00,
    },
    pro: {
      monthly: 11.99,
      yearly: 119.00,
    },
    business: {
      monthly: 24.99,
      yearly: 249.00,
    },
    formatString: 'S${price}',
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED ',
    flag: '🇦🇪',
    plus: {
      monthly: 14.99,
      yearly: 149.00,
    },
    pro: {
      monthly: 34.99,
      yearly: 349.00,
    },
    business: {
      monthly: 79.99,
      yearly: 799.00,
    },
    formatString: 'AED {price}',
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR ',
    flag: '🇸🇦',
    plus: {
      monthly: 14.99,
      yearly: 149.00,
    },
    pro: {
      monthly: 34.99,
      yearly: 349.00,
    },
    business: {
      monthly: 79.99,
      yearly: 799.00,
    },
    formatString: 'SAR {price}',
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    plus: {
      monthly: 499,
      yearly: 4990,
    },
    pro: {
      monthly: 1199,
      yearly: 11990,
    },
    business: {
      monthly: 2499,
      yearly: 24990,
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
export function getPlanId(tier: 'plus' | 'pro' | 'business' | 'trial', interval: BillingInterval | 'trial' = 'monthly'): PlanId {
  if (tier === 'trial' || interval === 'trial') return 'trial';
  return `${tier}_${interval === 'yearly' ? 'yearly' : 'monthly'}` as PlanId;
}

/**
 * Parses PlanId into tier and interval
 */
export function parsePlanId(planId: string): { tier: 'plus' | 'pro' | 'business' | 'founding' | 'trial'; interval: BillingInterval | 'trial' } {
  const normalized = String(planId || '').toLowerCase().trim();
  if (normalized === 'trial' || normalized === 'pro_trial') {
    return { tier: 'trial', interval: 'trial' };
  }
  if (normalized === 'founding_member' || normalized === 'founding' || normalized === 'lifetime') {
    return { tier: 'founding', interval: 'lifetime' };
  }
  if (normalized === 'business_yearly' || (normalized.startsWith('business') && normalized.includes('year'))) {
    return { tier: 'business', interval: 'yearly' };
  }
  if (normalized === 'business_monthly' || normalized === 'business' || normalized === 'custom_plan') {
    return { tier: 'business', interval: 'monthly' };
  }
  if (normalized === 'premium_yearly' || normalized === 'pro_yearly' || normalized === 'pro_annual') {
    return { tier: 'pro', interval: 'yearly' };
  }
  if (normalized === 'premium_monthly' || normalized === 'pro_monthly' || normalized === 'pro') {
    return { tier: 'pro', interval: 'monthly' };
  }
  if (normalized === 'plus_yearly' || normalized === 'plus_annual') {
    return { tier: 'plus', interval: 'yearly' };
  }
  if (normalized === 'plus_monthly' || normalized === 'plus') {
    return { tier: 'plus', interval: 'monthly' };
  }
  return { tier: 'pro', interval: 'monthly' };
}

export interface CustomPlanSelections {
  toolCategories: string[];
  aiTier: 'starter' | 'pro' | 'unlimited' | 'enterprise';
  storageTier: 'basic' | 'standard' | 'power' | 'enterprise';
  seats: number;
  supportLevel: 'standard' | 'priority' | 'dedicated';
  billingInterval: 'monthly' | 'yearly';
}

export const DEFAULT_CUSTOM_SELECTIONS: CustomPlanSelections = {
  toolCategories: ['nutrition', 'student', 'finance'],
  aiTier: 'pro',
  storageTier: 'standard',
  seats: 1,
  supportLevel: 'standard',
  billingInterval: 'monthly',
};

export interface CustomPlanQuote {
  baseMonthly: number;
  categoryAddon: number;
  aiAddon: number;
  storageAddon: number;
  seatCost: number;
  supportAddon: number;
  monthlySubtotal: number;
  billingInterval: 'monthly' | 'yearly';
  billingCycleSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  taxPercent: number;
  taxAmount: number;
  finalPayable: number;
  currency: CurrencyCode;
  currencySymbol: string;
  formattedFinalPayable: string;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTax: string;
}

export function calculateCustomPlanQuote(
  selections: CustomPlanSelections,
  currency: CurrencyCode = 'INR'
): CustomPlanQuote {
  const isINR = currency === 'INR';
  const baseMonthly = isINR ? 199 : 2.99;

  const premiumCategories = (selections.toolCategories || []).filter(
    (c) => c !== 'calculators' && c !== 'finance'
  );
  const categoryAddonRate = isINR ? 50 : 0.8;
  const categoryAddon = premiumCategories.length * categoryAddonRate;

  const aiRates: Record<string, number> = isINR
    ? { starter: 0, pro: 150, unlimited: 450, enterprise: 1200 }
    : { starter: 0, pro: 2.0, unlimited: 6.0, enterprise: 16.0 };
  const aiAddon = aiRates[selections.aiTier] || 0;

  const storageRates: Record<string, number> = isINR
    ? { basic: 0, standard: 100, power: 300, enterprise: 750 }
    : { basic: 0, standard: 1.5, power: 4.0, enterprise: 10.0 };
  const storageAddon = storageRates[selections.storageTier] || 0;

  const supportRates: Record<string, number> = isINR
    ? { standard: 0, priority: 250, dedicated: 999 }
    : { standard: 0, priority: 3.5, dedicated: 14.0 };
  const supportAddon = supportRates[selections.supportLevel] || 0;

  const seats = Math.max(1, selections.seats || 1);
  const seatAddonPerExtra = isINR ? 180 : 2.5;
  const seatCost = (seats - 1) * seatAddonPerExtra;

  const monthlySubtotal = baseMonthly + categoryAddon + aiAddon + storageAddon + seatCost + supportAddon;

  const isYearly = selections.billingInterval === 'yearly';
  const billingCycleSubtotal = isYearly ? monthlySubtotal * 12 : monthlySubtotal;
  const discountPercent = isYearly ? 20 : 0;
  const discountAmount = isYearly ? Number((billingCycleSubtotal * 0.2).toFixed(2)) : 0;
  const subtotalAfterDiscount = billingCycleSubtotal - discountAmount;

  const taxPercent = isINR ? 18 : 0;
  const taxAmount = Number(((subtotalAfterDiscount * taxPercent) / 100).toFixed(2));
  const finalPayable = Math.round(subtotalAfterDiscount + taxAmount);

  const sym = PRICING_CONFIG[currency]?.symbol || '₹';

  return {
    baseMonthly,
    categoryAddon,
    aiAddon,
    storageAddon,
    seatCost,
    supportAddon,
    monthlySubtotal: Math.round(monthlySubtotal),
    billingInterval: selections.billingInterval,
    billingCycleSubtotal: Math.round(billingCycleSubtotal),
    discountPercent,
    discountAmount: Math.round(discountAmount),
    subtotalAfterDiscount: Math.round(subtotalAfterDiscount),
    taxPercent,
    taxAmount,
    finalPayable,
    currency,
    currencySymbol: sym,
    formattedFinalPayable: formatCurrencyPrice(finalPayable, currency),
    formattedSubtotal: formatCurrencyPrice(Math.round(billingCycleSubtotal), currency),
    formattedDiscount: formatCurrencyPrice(Math.round(discountAmount), currency),
    formattedTax: formatCurrencyPrice(taxAmount, currency),
  };
}

export interface ResolvedPlanPricing {
  planId: PlanId;
  tier: 'plus' | 'pro' | 'business' | 'founding' | 'trial';
  interval: BillingInterval | 'trial';
  currency: CurrencyCode;
  currencySymbol: string;
  name: string;
  amount: number;
  subunitAmount: number;
  formattedPrice: string;
  savingsPercent: number;
  customQuote?: CustomPlanQuote;
}

/**
 * Given a planId or { tier, interval, currency, customSelections }, resolves the authoritative official price
 * and subunit amount (e.g. paise). No client-provided prices are ever used or trusted.
 */
export function resolveOfficialPricing(params: {
  planId?: string;
  tier?: string;
  interval?: string;
  currency?: string;
  customSelections?: CustomPlanSelections;
}): ResolvedPlanPricing {
  const rawCurrency = (params.currency || 'INR').toUpperCase() as CurrencyCode;
  const currencyKey: CurrencyCode = PRICING_CONFIG[rawCurrency] ? rawCurrency : 'INR';
  const currencyConfig = PRICING_CONFIG[currencyKey];

  // Resolve plan identifier
  let planId: PlanId;
  const rawPlanId = params.planId ? String(params.planId).toLowerCase().trim() : '';

  if (rawPlanId === 'custom_plan' || params.customSelections) {
    const quote = calculateCustomPlanQuote(params.customSelections || DEFAULT_CUSTOM_SELECTIONS, currencyKey);
    return {
      planId: 'custom_plan',
      tier: 'business',
      interval: quote.billingInterval,
      currency: currencyConfig.code,
      currencySymbol: currencyConfig.symbol,
      name: `NAVIKO Custom Plan (${quote.billingInterval === 'yearly' ? 'Annual Pass' : 'Monthly Pass'})`,
      amount: quote.finalPayable,
      subunitAmount: getSubunitAmount(quote.finalPayable, currencyConfig.code),
      formattedPrice: quote.formattedFinalPayable,
      savingsPercent: quote.discountPercent,
      customQuote: quote,
    };
  }

  if (rawPlanId === 'trial' || params.tier === 'trial' || params.interval === 'trial') {
    planId = 'trial';
  } else if (rawPlanId === 'founding_member' || rawPlanId === 'founding' || params.tier === 'founding' || params.interval === 'lifetime') {
    planId = 'founding_member';
  } else if (rawPlanId === 'business_yearly' || (params.tier === 'business' && params.interval === 'yearly')) {
    planId = 'business_yearly';
  } else if (rawPlanId === 'business_monthly' || rawPlanId === 'business' || params.tier === 'business') {
    planId = 'business_monthly';
  } else if (rawPlanId === 'premium_yearly' || rawPlanId === 'pro_yearly' || (params.tier === 'pro' && params.interval === 'yearly')) {
    planId = 'premium_yearly';
  } else if (rawPlanId === 'premium_monthly' || rawPlanId === 'pro_monthly' || (params.tier === 'pro' && params.interval === 'monthly')) {
    planId = 'premium_monthly';
  } else if (rawPlanId === 'plus_yearly' || (params.tier === 'plus' && params.interval === 'yearly')) {
    planId = 'plus_yearly';
  } else if (rawPlanId === 'plus_monthly' || (params.tier === 'plus' && params.interval === 'monthly')) {
    planId = 'plus_monthly';
  } else {
    planId = params.interval === 'yearly' ? 'premium_yearly' : 'premium_monthly';
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

  // 2. Founding Member Offer (One-Time Lifetime Access)
  if (planId === 'founding_member') {
    const amount = currencyConfig.pro.founding || (currencyConfig.code === 'INR' ? 7999 : 99);
    const subunitAmount = getSubunitAmount(amount, currencyConfig.code);
    return {
      planId: 'founding_member',
      tier: 'founding',
      interval: 'lifetime',
      currency: currencyConfig.code,
      currencySymbol: currencyConfig.symbol,
      name: 'NAVIKO Founding Member Pass (Lifetime Access)',
      amount,
      subunitAmount,
      formattedPrice: formatCurrencyPrice(amount, currencyConfig.code),
      savingsPercent: 0,
    };
  }

  const { tier, interval } = parsePlanId(planId);
  const tierConfig = tier === 'plus' ? currencyConfig.plus : tier === 'business' ? currencyConfig.business : currencyConfig.pro;
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
    tier: tier as 'plus' | 'pro' | 'business' | 'founding' | 'trial',
    interval: interval as BillingInterval | 'trial',
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
    resolveOfficialPricing({ planId: 'premium_monthly', currency }),
    resolveOfficialPricing({ planId: 'premium_yearly', currency }),
    resolveOfficialPricing({ planId: 'business_monthly', currency }),
    resolveOfficialPricing({ planId: 'business_yearly', currency }),
    resolveOfficialPricing({ planId: 'founding_member', currency }),
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

