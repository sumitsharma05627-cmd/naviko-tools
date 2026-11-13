/**
 * NAVIKO ECOSYSTEM — CENTRALIZED MULTI-CURRENCY PRICING ENGINE
 * 
 * Supports all 3 independent versions:
 * - NAVIKO 1.0: General Tools Suite
 * - NAVIKO 2.0: Nutrition Science & Ayurveda
 * - NAVIKO 3.0: Vedic Astrology & Vastu Shastra
 * 
 * Implements the CRITICAL INTERNATIONAL PRICING RULE:
 * International subscription prices must be AT LEAST FIVE TIMES (5x multiplier)
 * the equivalent Indian subscription price after currency conversion.
 * 
 * Formula:
 *   International Minimum Price = Indian Base Price * 5 / Current Exchange Rate (INR per unit)
 */

export type NavikoVersionId = 'v1' | 'v2' | 'v3';

export type CurrencyCode =
  | 'INR'
  | 'USD'
  | 'GBP'
  | 'EUR'
  | 'CAD'
  | 'AUD'
  | 'AED'
  | 'SGD'
  | 'NZD'
  | 'SAR'
  | 'JPY';

export type BillingInterval = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';

export interface CurrencyMetadata {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  exchangeRateToINR: number; // How many INR equal 1 unit of foreign currency (e.g. 1 USD = 86.5 INR)
  formatPattern: string; // e.g. "${price}" or "₹{price}"
  subunitDecimals: number; // 2 for USD/EUR/INR, 0 for JPY
  isZeroDecimal?: boolean;
}

/**
 * Authoritative Currencies Registry with current exchange benchmarks
 */
export const CURRENCIES_REGISTRY: Record<CurrencyCode, CurrencyMetadata> = {
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    exchangeRateToINR: 1.0,
    formatPattern: '₹{price}',
    subunitDecimals: 2,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    exchangeRateToINR: 86.5,
    formatPattern: '${price}',
    subunitDecimals: 2,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    exchangeRateToINR: 110.2,
    formatPattern: '£{price}',
    subunitDecimals: 2,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    exchangeRateToINR: 93.8,
    formatPattern: '€{price}',
    subunitDecimals: 2,
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    exchangeRateToINR: 63.4,
    formatPattern: 'C${price}',
    subunitDecimals: 2,
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    exchangeRateToINR: 56.2,
    formatPattern: 'A${price}',
    subunitDecimals: 2,
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED ',
    flag: '🇦🇪',
    exchangeRateToINR: 23.55,
    formatPattern: 'AED {price}',
    subunitDecimals: 2,
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    exchangeRateToINR: 64.8,
    formatPattern: 'S${price}',
    subunitDecimals: 2,
  },
  NZD: {
    code: 'NZD',
    name: 'New Zealand Dollar',
    symbol: 'NZ$',
    flag: '🇳🇿',
    exchangeRateToINR: 51.5,
    formatPattern: 'NZ${price}',
    subunitDecimals: 2,
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR ',
    flag: '🇸🇦',
    exchangeRateToINR: 23.05,
    formatPattern: 'SAR {price}',
    subunitDecimals: 2,
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    exchangeRateToINR: 0.57,
    formatPattern: '¥{price}',
    subunitDecimals: 0,
    isZeroDecimal: true,
  },
};

export const SUPPORTED_CURRENCY_CODES: CurrencyCode[] = [
  'INR',
  'USD',
  'GBP',
  'EUR',
  'CAD',
  'AUD',
  'AED',
  'SGD',
  'NZD',
  'SAR',
  'JPY',
];

/**
 * Base Plan Definition in INR (The Anchor Currency)
 */
export interface VersionPlanDefinition {
  id: string;
  version: NavikoVersionId;
  tier: string;
  name: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  baseMonthlyINR: number; // Base monthly price in INR (e.g. 299, 699, etc.)
  features: string[];
  limitsDescription: string;
  entitlements: Record<string, string | number | boolean>;
}

/**
 * Official Version-Specific Plan Configurations
 */
export const VERSION_PLANS: Record<NavikoVersionId, VersionPlanDefinition[]> = {
  // NAVIKO 1.0 — General Tools Suite
  v1: [
    {
      id: 'v1_free',
      version: 'v1',
      tier: 'free',
      name: 'Free Starter',
      tagline: 'Standard access to everyday calculators and basic PDF utilities',
      baseMonthlyINR: 0,
      features: [
        'All 15+ Core arithmetic and percentage calculators',
        'Standard loan & SIP calculators (no history)',
        'Basic PDF merge & compress (up to 5MB)',
        'Image resizer & basic cropper',
        'Standard client-side privacy guarantee',
      ],
      limitsDescription: '5 daily high-compute operations',
      entitlements: {
        dailyQuota: 5,
        pdfMaxMB: 5,
        priorityCompute: false,
        adFree: false,
      },
    },
    {
      id: 'v1_pro',
      version: 'v1',
      tier: 'pro',
      name: 'Pro Suite',
      tagline: 'Full power for students, freelancers, and active professionals',
      baseMonthlyINR: 299,
      isPopular: true,
      badge: 'Most Popular',
      features: [
        'Everything in Free',
        'Advanced financial modeling (FIRE, Salary, National Debt)',
        'Student study timetable & 75% attendance matrix',
        'Unlimited PDF conversions & 100MB documents',
        'High-res image background remover & lossless compression',
        'ATS resume builder with unlimited PDF exports',
        'Ad-free experience with persistent workspace save',
      ],
      limitsDescription: '50 daily high-compute operations',
      entitlements: {
        dailyQuota: 50,
        pdfMaxMB: 100,
        priorityCompute: true,
        adFree: true,
      },
    },
    {
      id: 'v1_premium',
      version: 'v1',
      tier: 'premium',
      name: 'Power Premium',
      tagline: 'Uncapped high-volume processing and priority compute queues',
      baseMonthlyINR: 699,
      badge: 'Uncapped',
      features: [
        'Everything in Pro Suite',
        'Batch processing for 50+ files at once',
        'Highest priority background compute servers',
        'Direct CSV, JSON, and raw data export matrices',
        'Dedicated early access to new v1 tools',
        'Priority technical assistance & team support',
      ],
      limitsDescription: '250 daily high-compute operations',
      entitlements: {
        dailyQuota: 250,
        pdfMaxMB: 500,
        priorityCompute: true,
        adFree: true,
      },
    },
  ],

  // NAVIKO 2.0 — Nutrition Science & Ayurveda
  v2: [
    {
      id: 'v2_free',
      version: 'v2',
      tier: 'free',
      name: 'Wellness Basic',
      tagline: 'Explore Indian food nutrition tables and classical herb profiles',
      baseMonthlyINR: 0,
      features: [
        '36+ Indian food nutrition explorer with ICMR-NIN data',
        '2-food comparison matrix (macros & micronutrients)',
        'Basic Asian-Indian BMI & calorie estimation',
        'Classical Ayurvedic herb glossary (12 core herbs)',
        'Daily water intake logger & habit checklist',
      ],
      limitsDescription: 'Daily habit tracking & basic exploration',
      entitlements: {
        dailyLogCount: 5,
        compareLimit: 2,
        mealPlanStorage: 1,
        adFree: false,
      },
    },
    {
      id: 'v2_wellness_plus',
      version: 'v2',
      tier: 'plus',
      name: 'Wellness Plus',
      tagline: 'Deep macro balancing, smart meal planner & Ahara Vidhi guides',
      baseMonthlyINR: 349,
      isPopular: true,
      badge: 'Recommended',
      features: [
        'Everything in Wellness Basic',
        'Multi-food deep comparison matrix (up to 6 foods)',
        'Personalized 7-day meal planner with calorie targets',
        'Packaged food label & INS additive decoder',
        'Circadian Dinacharya routine builder by dosha',
        'Curated healthy Indian recipes with cooking science notes',
        'Automated balanced grocery shopping list generation',
      ],
      limitsDescription: 'Unlimited meal plans & deep nutrition analysis',
      entitlements: {
        dailyLogCount: 100,
        compareLimit: 6,
        mealPlanStorage: 20,
        adFree: true,
      },
    },
    {
      id: 'v2_wellness_premium',
      version: 'v2',
      tier: 'premium',
      name: 'Wellness Pro Holistic',
      tagline: 'Complete clinical nutrition science & Ayurvedic lifestyle mastery',
      baseMonthlyINR: 749,
      badge: 'Holistic Suite',
      features: [
        'Everything in Wellness Plus',
        'Unlimited family meal planner profiles (up to 5 members)',
        'Dravyaguna clinical evidence reviews & botanical monographs',
        'Longitudinal habit & hydration analytics (30-day graphs)',
        'Custom recipe nutrition calculator & macro breakdown',
        'Exportable physician & nutritionist consultation dossiers',
      ],
      limitsDescription: 'Complete 5-member family suite with exportable dossiers',
      entitlements: {
        familyMembers: 5,
        compareLimit: 12,
        mealPlanStorage: 100,
        adFree: true,
      },
    },
  ],

  // NAVIKO 3.0 — Vedic Astrology & Vastu Shastra
  v3: [
    {
      id: 'v3_free',
      version: 'v3',
      tier: 'free',
      name: 'Jyotish Seeker',
      tagline: 'Mathematical Vedic birth chart calculation with Chitrapaksha ephemeris',
      baseMonthlyINR: 0,
      features: [
        'True Lahiri sidereal D1 Lagna chart calculation',
        'North Indian & South Indian SVG chart styles',
        'Planetary degrees, signs & retrograde flags',
        'Basic daily Panchang (Tithi, Nakshatra, Yoga, Karana)',
        'Basic 8-direction Vastu elemental compass check',
        'Life Path & Destiny numerology calculator',
      ],
      limitsDescription: '1 Saved Kundli & daily Panchang',
      entitlements: {
        savedCharts: 1,
        naviAiTokens: 3,
        vastuBlueprints: 1,
        adFree: false,
      },
    },
    {
      id: 'v3_astrology_plus',
      version: 'v3',
      tier: 'plus',
      name: 'Astrology Plus',
      tagline: 'D9 Navamsa, 120-year Vimshottari Mahadasha timeline & Vastu diagnostics',
      baseMonthlyINR: 499,
      isPopular: true,
      badge: 'Best Value',
      features: [
        'Everything in Jyotish Seeker',
        'Full D9 Navamsa divisional chart with sign dignities',
        '120-Year Vimshottari Mahadasha timeline with balance at birth',
        'Classical planetary Yogas (Gaja Kesari, Budhaditya, etc.)',
        'Manglik Dosha analysis with cancellation checks',
        '16-Zone Vastu Purusha Mandala mapping & quantitative score',
        'Daily Day & Night Choghadiya table with planetary hours',
        '15 daily questions with NAVI AI grounded Vedic guide',
      ],
      limitsDescription: 'Up to 10 saved birth charts & deep spatial analysis',
      entitlements: {
        savedCharts: 10,
        naviAiTokens: 15,
        vastuBlueprints: 5,
        adFree: true,
      },
    },
    {
      id: 'v3_astrology_premium',
      version: 'v3',
      tier: 'premium',
      name: 'Astrology Premium Master',
      tagline: 'Professional Kundli dossiers, floor plan blueprint audit & unlimited NAVI',
      baseMonthlyINR: 999,
      badge: 'Master Suite',
      features: [
        'Everything in Astrology Plus',
        'Unlimited birth charts with family archival storage',
        'Architectural blueprint upload & zone-by-zone remedial overlay',
        'Practical non-destructive Vastu remedies (brass, copper, mirrors)',
        'Downloadable & printable high-resolution PDF Kundli dossiers',
        'Complete Chaldean & Pythagorean numerology matrix',
        'Unlimited grounded consultations with NAVI AI in Hindi & English',
        'Muhurat finder for property purchases, ceremonies & milestones',
      ],
      limitsDescription: 'Unlimited charts, architectural audits & master dossiers',
      entitlements: {
        savedCharts: 9999,
        naviAiTokens: 9999,
        vastuBlueprints: 50,
        adFree: true,
      },
    },
  ],
};

/**
 * Interval discount factors compared to monthly rate
 */
export const INTERVAL_CONFIG: Record<
  BillingInterval,
  {
    monthsCount: number;
    discountPercent: number; // Applied to total cycle
    label: string;
    sublabel: string;
    badge?: string;
  }
> = {
  monthly: {
    monthsCount: 1,
    discountPercent: 0,
    label: 'Monthly',
    sublabel: 'Pay month-to-month, cancel anytime',
  },
  quarterly: {
    monthsCount: 3,
    discountPercent: 10,
    label: 'Quarterly',
    sublabel: 'Billed every 3 months (Save 10%)',
    badge: 'Save 10%',
  },
  half_yearly: {
    monthsCount: 6,
    discountPercent: 15,
    label: 'Half-Yearly',
    sublabel: 'Billed every 6 months (Save 15%)',
    badge: 'Save 15%',
  },
  yearly: {
    monthsCount: 12,
    discountPercent: 25,
    label: 'Yearly',
    sublabel: 'Billed annually (Save 25%)',
    badge: 'Best Value • Save 25%',
  },
};

/**
 * Commercial Price Rounding Logic
 * Rounds upward so international prices NEVER fall below the strict mathematical minimum.
 */
function roundCommercialPrice(price: number, currency: CurrencyCode): number {
  if (currency === 'INR') {
    // For INR: keep integer ending in 9 or standard figure
    return Math.round(price);
  }

  if (currency === 'JPY') {
    // For JPY: nearest 100 yen upward
    return Math.ceil(price / 100) * 100;
  }

  if (currency === 'AED' || currency === 'SAR') {
    // For AED / SAR: sensible integer commercial price
    return Math.ceil(price);
  }

  // For USD, GBP, EUR, CAD, AUD, SGD, NZD:
  // Must be strictly >= minimum price, formatted to commercial .99
  const ceilDollar = Math.ceil(price);
  const commercial = ceilDollar - 0.01; // e.g. 29.99 for 29.35
  if (commercial >= price) {
    return Number(commercial.toFixed(2));
  }
  return Number((ceilDollar + 0.99).toFixed(2));
}

export interface CalculatedPricePoint {
  planId: string;
  version: NavikoVersionId;
  tier: string;
  interval: BillingInterval;
  currency: CurrencyCode;
  currencySymbol: string;
  inrBaseMonthly: number;
  internationalMultiplier: number;
  exchangeRate: number;
  monthsCount: number;
  discountPercent: number;
  // Final calculated prices
  effectiveMonthlyPrice: number; // Monthly equivalent
  totalCyclePrice: number; // Total charged at checkout
  formattedMonthlyPrice: string;
  formattedTotalCyclePrice: string;
  subunitAmount: number; // In cents/paise for payment gateway
  taxPercent: number; // 18% GST for INR, 0% export VAT for international
  taxAmount: number;
  finalPayableWithTax: number;
  formattedFinalPayable: string;
  isInternational: boolean;
  savingsVsMonthlyINR: number;
}

export const INTERNATIONAL_MINIMUM_MULTIPLIER = 5;

export interface DynamicBasePricesINR {
  v1?: { pro?: number; plus?: number; premium?: number };
  v2?: { plus?: number; premium?: number };
  v3?: { plus?: number; premium?: number };
}

/**
 * Master Pricing Calculator Function
 * Enforces the 5x International Multiplier Rule!
 * Supports both signatures:
 *  - calculatePlanPrice(plan, currency, interval, multiplier, customRates, customBasePrices)
 *  - calculatePlanPrice(version, tier, interval, currency, multiplier, customRates, customBasePrices)
 */
export function calculatePlanPrice(
  plan: VersionPlanDefinition,
  currency?: CurrencyCode,
  interval?: BillingInterval,
  customMultiplier?: number,
  customRates?: Partial<Record<CurrencyCode, number>>,
  customBasePrices?: DynamicBasePricesINR
): CalculatedPricePoint;
export function calculatePlanPrice(
  version: NavikoVersionId,
  tier: string,
  interval?: BillingInterval,
  currency?: CurrencyCode,
  customMultiplier?: number,
  customRates?: Partial<Record<CurrencyCode, number>>,
  customBasePrices?: DynamicBasePricesINR
): CalculatedPricePoint;
export function calculatePlanPrice(
  planOrVersion: VersionPlanDefinition | NavikoVersionId,
  currencyOrTier: CurrencyCode | string = 'INR',
  intervalArg: BillingInterval = 'monthly',
  currencyOrMultiplierArg: CurrencyCode | number = 'INR',
  customMultiplierArg: number | Partial<Record<CurrencyCode, number>> = 5,
  customRatesOrBasePrices?: Partial<Record<CurrencyCode, number>> | DynamicBasePricesINR,
  customBasePrices?: DynamicBasePricesINR
): CalculatedPricePoint {
  let plan: VersionPlanDefinition;
  let currency: CurrencyCode = 'INR';
  let interval: BillingInterval = 'monthly';
  let customMultiplier: number = 5;
  let resolvedRates: Partial<Record<CurrencyCode, number>> | undefined;

  if (typeof planOrVersion === 'string') {
    // Called as: calculatePlanPrice(version, tier, interval, currency, customMultiplier, customRates, customBasePrices)
    const version = planOrVersion as NavikoVersionId;
    const tier = String(currencyOrTier || 'free').toLowerCase();
    interval = (intervalArg || 'monthly') as BillingInterval;
    currency = (typeof currencyOrMultiplierArg === 'string' ? currencyOrMultiplierArg : 'INR') as CurrencyCode;
    customMultiplier = typeof customMultiplierArg === 'number' ? customMultiplierArg : 5;
    resolvedRates = customRatesOrBasePrices as Partial<Record<CurrencyCode, number>> | undefined;

    const matchedPlan = VERSION_PLANS[version]?.find(
      (p) => p.tier.toLowerCase() === tier || p.id.toLowerCase() === tier
    );
    const basePlan = matchedPlan || {
      id: `${version}_${tier}`,
      version,
      tier,
      name: `${version.toUpperCase()} ${tier.toUpperCase()}`,
      tagline: 'Standard plan',
      baseMonthlyINR: tier === 'pro' || tier === 'premium' ? 699 : tier === 'plus' ? 299 : 0,
      features: ['Full feature access'],
      limitsDescription: 'Standard access',
      entitlements: { adFree: true },
    };
    const overridePrice = (customBasePrices?.[version] as Record<string, number> | undefined)?.[basePlan.tier];
    plan = typeof overridePrice === 'number' && overridePrice >= 0
      ? { ...basePlan, baseMonthlyINR: overridePrice }
      : basePlan;
  } else {
    // Called as: calculatePlanPrice(plan, currency, interval, customMultiplier, customRates, customBasePrices)
    plan = planOrVersion;
    currency = (currencyOrTier || 'INR') as CurrencyCode;
    interval = (intervalArg || 'monthly') as BillingInterval;
    customMultiplier = typeof currencyOrMultiplierArg === 'number' ? currencyOrMultiplierArg : 5;
    if (typeof customMultiplierArg === 'object' && customMultiplierArg !== null) {
      resolvedRates = customMultiplierArg;
    }
    const resolvedBasePrices = (customBasePrices || customRatesOrBasePrices) as DynamicBasePricesINR | undefined;
    const overridePrice = (resolvedBasePrices?.[plan.version] as Record<string, number> | undefined)?.[plan.tier];
    if (typeof overridePrice === 'number' && overridePrice >= 0) {
      plan = { ...plan, baseMonthlyINR: overridePrice };
    }
  }

  const isINR = currency === 'INR';
  const currencyMeta = CURRENCIES_REGISTRY[currency] || CURRENCIES_REGISTRY.INR;
  const intervalMeta = INTERVAL_CONFIG[interval] || INTERVAL_CONFIG.monthly;
  const multiplier = isINR ? 1 : Math.max(5, customMultiplier); // Strict minimum of 5 for international
  const exchangeRate = resolvedRates && resolvedRates[currency] ? resolvedRates[currency]! : currencyMeta.exchangeRateToINR;

  // 1. Base Free Tier check
  if (plan.baseMonthlyINR === 0) {
    return {
      planId: plan.id,
      version: plan.version,
      tier: plan.tier,
      interval,
      currency: currencyMeta.code,
      currencySymbol: currencyMeta.symbol,
      inrBaseMonthly: 0,
      internationalMultiplier: 1,
      exchangeRate,
      monthsCount: intervalMeta.monthsCount,
      discountPercent: 0,
      effectiveMonthlyPrice: 0,
      totalCyclePrice: 0,
      formattedMonthlyPrice: 'Free',
      formattedTotalCyclePrice: 'Free Forever',
      subunitAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      finalPayableWithTax: 0,
      formattedFinalPayable: 'Free',
      isInternational: !isINR,
      savingsVsMonthlyINR: 0,
    };
  }

  // 2. Compute Monthly Base Price in Target Currency
  let computedMonthlyForeign: number;

  if (isINR) {
    computedMonthlyForeign = plan.baseMonthlyINR;
  } else {
    // CRITICAL 5X INTERNATIONAL PRICING RULE:
    // International Minimum Price = Indian Base Price * 5 / Current Exchange Rate
    const rawTargetPrice = (plan.baseMonthlyINR * multiplier) / exchangeRate;
    computedMonthlyForeign = roundCommercialPrice(rawTargetPrice, currency);
  }

  // 3. Compute Total Billing Cycle with Interval Discounts
  const grossCyclePrice = computedMonthlyForeign * intervalMeta.monthsCount;
  const discountFactor = (100 - intervalMeta.discountPercent) / 100;
  const discountedCyclePrice = grossCyclePrice * discountFactor;
  const finalCyclePrice = roundCommercialPrice(discountedCyclePrice, currency);

  const effectiveMonthly = Number(
    (finalCyclePrice / intervalMeta.monthsCount).toFixed(currencyMeta.subunitDecimals)
  );

  // 4. Taxes (18% GST within India, 0% export outside)
  const taxPercent = isINR ? 18 : 0;
  const taxAmount = Number(((finalCyclePrice * taxPercent) / 100).toFixed(currencyMeta.subunitDecimals));
  const finalPayableWithTax = Number((finalCyclePrice + taxAmount).toFixed(currencyMeta.subunitDecimals));

  // 5. Gateway Subunits (paise/cents)
  const subunitMultiplier = currencyMeta.isZeroDecimal ? 1 : Math.pow(10, currencyMeta.subunitDecimals);
  const subunitAmount = Math.round(finalPayableWithTax * subunitMultiplier);

  // Formatting strings
  const formatVal = (amt: number) => {
    const formattedNum = currencyMeta.isZeroDecimal ? Math.round(amt).toLocaleString() : amt.toFixed(2);
    return currencyMeta.formatPattern.replace('{price}', formattedNum);
  };

  return {
    planId: plan.id,
    version: plan.version,
    tier: plan.tier,
    interval,
    currency: currencyMeta.code,
    currencySymbol: currencyMeta.symbol,
    inrBaseMonthly: plan.baseMonthlyINR,
    internationalMultiplier: multiplier,
    exchangeRate,
    monthsCount: intervalMeta.monthsCount,
    discountPercent: intervalMeta.discountPercent,
    effectiveMonthlyPrice: effectiveMonthly,
    totalCyclePrice: finalCyclePrice,
    formattedMonthlyPrice: formatVal(effectiveMonthly),
    formattedTotalCyclePrice: formatVal(finalCyclePrice),
    subunitAmount,
    taxPercent,
    taxAmount,
    finalPayableWithTax,
    formattedFinalPayable: formatVal(finalPayableWithTax),
    isInternational: !isINR,
    savingsVsMonthlyINR: intervalMeta.discountPercent,
  };
}

/**
 * Detect Approximate User Currency from browser locale, time zone, and language
 */
export function detectVisitorCurrency(): { detectedCurrency: CurrencyCode; detectedCountry: string } {
  if (typeof window === 'undefined') {
    return { detectedCurrency: 'INR', detectedCountry: 'India' };
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = navigator.language || '';

    // Direct Time Zone mapping
    if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) {
      return { detectedCurrency: 'INR', detectedCountry: 'India' };
    }
    if (timeZone.includes('London') || timeZone.includes('Belfast')) {
      return { detectedCurrency: 'GBP', detectedCountry: 'United Kingdom' };
    }
    if (
      timeZone.includes('Paris') ||
      timeZone.includes('Berlin') ||
      timeZone.includes('Rome') ||
      timeZone.includes('Madrid') ||
      timeZone.includes('Amsterdam') ||
      timeZone.includes('Brussels') ||
      timeZone.includes('Vienna') ||
      timeZone.includes('Dublin')
    ) {
      return { detectedCurrency: 'EUR', detectedCountry: 'Europe' };
    }
    if (timeZone.includes('Toronto') || timeZone.includes('Vancouver') || timeZone.includes('Montreal')) {
      return { detectedCurrency: 'CAD', detectedCountry: 'Canada' };
    }
    if (timeZone.includes('Sydney') || timeZone.includes('Melbourne') || timeZone.includes('Brisbane') || timeZone.includes('Perth')) {
      return { detectedCurrency: 'AUD', detectedCountry: 'Australia' };
    }
    if (timeZone.includes('Auckland') || timeZone.includes('Wellington')) {
      return { detectedCurrency: 'NZD', detectedCountry: 'New Zealand' };
    }
    if (timeZone.includes('Singapore')) {
      return { detectedCurrency: 'SGD', detectedCountry: 'Singapore' };
    }
    if (timeZone.includes('Dubai')) {
      return { detectedCurrency: 'AED', detectedCountry: 'United Arab Emirates' };
    }
    if (timeZone.includes('Riyadh')) {
      return { detectedCurrency: 'SAR', detectedCountry: 'Saudi Arabia' };
    }
    if (timeZone.includes('Tokyo')) {
      return { detectedCurrency: 'JPY', detectedCountry: 'Japan' };
    }
    if (
      timeZone.includes('New_York') ||
      timeZone.includes('Los_Angeles') ||
      timeZone.includes('Chicago') ||
      timeZone.includes('Denver') ||
      timeZone.includes('Phoenix') ||
      locale.includes('en-US')
    ) {
      return { detectedCurrency: 'USD', detectedCountry: 'United States' };
    }
  } catch (e) {
    // fallback
  }

  return { detectedCurrency: 'INR', detectedCountry: 'India' };
}
