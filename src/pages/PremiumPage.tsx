import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Clock,
  Crown,
  HeartPulse,
  GraduationCap,
  Calculator,
  Lock,
  Layers,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  Info,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import {
  PRICING_CONFIG,
  PlanType,
  BillingInterval,
  formatCurrencyPrice,
  getEffectiveMonthlyPrice,
  getYearlySavingsPercentage,
} from '../config/pricing';
import { CurrencySelector } from '../components/monetization/CurrencySelector';
import { ComparisonTable } from '../components/monetization/ComparisonTable';
import { PremiumBadge } from '../components/monetization/PremiumBadge';
import { useSEO, CANONICAL_DOMAIN } from '../utils/seo';
import { Premium3DVisual } from '../components/3d/Premium3DVisual';
import { Interactive3DCard } from '../components/3d/Interactive3DCard';

interface PremiumPageProps {
  onNavigate: (path: string) => void;
}

export const PremiumPage: React.FC<PremiumPageProps> = ({ onNavigate }) => {
  const {
    plan,
    billingInterval,
    setBillingInterval,
    currency,
    subscriptionStatus,
    renewalDate,
    upgradeToTier,
    startTrial,
    isTrial,
    trialUsed,
    remainingTrialDays,
    remainingTrialHours,
    trialEndsAt,
    cancelSubscription,
  } = useSubscription();

  const { isAuthenticated, user } = useAuth();

  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'monthly_only' | 'side_by_side'>('all');

  const activePricing = PRICING_CONFIG[currency] || PRICING_CONFIG.INR;
  const isYearly = billingInterval === 'yearly';

  // Plus pricing & savings calculations
  const plusMonthlyPrice = activePricing.plus.monthly;
  const plusYearlyPrice = activePricing.plus.yearly;
  const plusMonthlyFormatted = formatCurrencyPrice(plusMonthlyPrice, currency);
  const plusYearlyFormatted = formatCurrencyPrice(plusYearlyPrice, currency);
  const plusEffectiveMonthly = getEffectiveMonthlyPrice(plusYearlyPrice);
  const plusEffectiveMonthlyFormatted = formatCurrencyPrice(plusEffectiveMonthly, currency);
  const plusAnnualCostIfMonthly = plusMonthlyPrice * 12;
  const plusAnnualSavings = Math.max(0, plusAnnualCostIfMonthly - plusYearlyPrice);
  const plusAnnualSavingsFormatted = formatCurrencyPrice(plusAnnualSavings, currency);
  const plusSavingsPct = getYearlySavingsPercentage(plusMonthlyPrice, plusYearlyPrice);

  // Pro pricing & savings calculations
  const proMonthlyPrice = activePricing.pro.monthly;
  const proYearlyPrice = activePricing.pro.yearly;
  const proMonthlyFormatted = formatCurrencyPrice(proMonthlyPrice, currency);
  const proYearlyFormatted = formatCurrencyPrice(proYearlyPrice, currency);
  const proEffectiveMonthly = getEffectiveMonthlyPrice(proYearlyPrice);
  const proEffectiveMonthlyFormatted = formatCurrencyPrice(proEffectiveMonthly, currency);
  const proAnnualCostIfMonthly = proMonthlyPrice * 12;
  const proAnnualSavings = Math.max(0, proAnnualCostIfMonthly - proYearlyPrice);
  const proAnnualSavingsFormatted = formatCurrencyPrice(proAnnualSavings, currency);
  const proSavingsPct = getYearlySavingsPercentage(proMonthlyPrice, proYearlyPrice);

  const maxSavingsPct = Math.max(plusSavingsPct, proSavingsPct);

  useSEO({
    title: 'NAVIKO Plans & Pricing — Free Forever & Optional Plus & Pro',
    description: 'NAVIKO provides 46+ free online tools with zero forced sign-up and total privacy. Upgrade to Plus or Pro for ad-free browsing, higher daily quotas, and faster exports.',
    canonical: '/premium',
    robots: 'index, follow',
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          'name': 'NAVIKO Membership',
          'description': 'Free online utility suite with optional premium membership for power users.',
          'brand': {
            '@type': 'Brand',
            'name': 'NAVIKO'
          },
          'offers': [
            {
              '@type': 'Offer',
              'name': 'Free Plan',
              'price': '0',
              'priceCurrency': 'INR',
              'availability': 'https://schema.org/InStock',
              'description': 'All 46+ tools accessible free with no account required.'
            },
            {
              '@type': 'Offer',
              'name': 'Plus Plan',
              'price': String(activePricing.plus.monthly),
              'priceCurrency': currency,
              'availability': 'https://schema.org/InStock',
              'description': 'Ad-free experience with enhanced limits and fast processing.'
            },
            {
              '@type': 'Offer',
              'name': 'Pro Plan',
              'price': String(activePricing.pro.monthly),
              'priceCurrency': currency,
              'availability': 'https://schema.org/InStock',
              'description': 'Unlimited premium features, priority support, and advanced exports.'
            }
          ]
        }
      ]
    }
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Restore intended plan selection from query or session
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlInterval = params.get('interval') as BillingInterval | null;
      if (urlInterval === 'monthly' || urlInterval === 'yearly') {
        setBillingInterval(urlInterval);
      } else {
        const savedIntended = sessionStorage.getItem('naviko_intended_plan');
        if (savedIntended) {
          try {
            const parsed = JSON.parse(savedIntended);
            if (parsed.interval === 'monthly' || parsed.interval === 'yearly') {
              setBillingInterval(parsed.interval);
            }
          } catch {}
        }
      }
    }
  }, [setBillingInterval]);

  const handleUpgrade = async (tier: 'plus' | 'pro', overrideInterval?: BillingInterval) => {
    const targetInterval = overrideInterval || billingInterval;

    // Strict requirement: User MUST be authenticated before purchasing any paid plan
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('naviko_intended_plan', JSON.stringify({ tier, interval: targetInterval }));
      }
      setFeedbackMessage({
        type: 'error',
        text: 'Please log in or create an account to purchase NAVIKO Premium.',
      });
      setTimeout(() => {
        onNavigate(`/login?redirect=/premium&plan=${tier}&interval=${targetInterval}`);
      }, 1000);
      return;
    }

    const actionKey = `${tier}_${targetInterval}`;
    setProcessingAction(actionKey);
    setFeedbackMessage(null);
    try {
      const res = await upgradeToTier(tier, targetInterval, user?.email || emailInput || undefined);
      if (res.success) {
        setFeedbackMessage({
          type: 'success',
          text: res.message || `NAVIKO ${tier.toUpperCase()} (${targetInterval}) successfully activated!`,
        });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('naviko_intended_plan');
        }
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res.error || 'Failed to activate subscription.',
        });
      }
    } finally {
      setProcessingAction(null);
    }
  };

  const handleStartTrial = async () => {
    // Strict requirement: User MUST be authenticated before activating the ₹1 trial
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('naviko_intended_plan', JSON.stringify({ tier: 'trial', interval: 'trial' }));
      }
      setFeedbackMessage({
        type: 'error',
        text: 'Please log in or create an account before starting the ₹1 trial.',
      });
      setTimeout(() => {
        onNavigate('/login?redirect=/premium&plan=trial');
      }, 1000);
      return;
    }

    setProcessingAction('trial');
    setFeedbackMessage(null);
    try {
      const res = await startTrial(user?.email || emailInput || undefined);
      if (res.success) {
        setFeedbackMessage({
          type: 'success',
          text: res.message || '₹1 trial successfully activated! You now have 7 days of full NAVIKO Premium access.',
        });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('naviko_intended_plan');
        }
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res.error || 'Trial activation was cancelled or not completed.',
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'Unexpected trial error.',
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const [faqCategory, setFaqCategory] = useState<'all' | 'plans' | 'billing' | 'features'>('all');

  const faqs = [
    {
      category: 'plans',
      q: 'Which plan is right for me: Free, Plus, or Pro?',
      a: 'The Free Plan is permanently free for all 46+ essential tools including standard calculators, age, percentage, unit converters, and basic student utilities with zero account requirement. Choose Plus (50 ops/day) if you need automated meal planning, study timetable generation, and mock test score projections. Choose Pro (200 ops/day) if you need high-volume batch processing, deep predictive analytics, priority queue processing, and a 100% ad-free experience across all tools.',
    },
    {
      category: 'plans',
      q: 'How does the ₹1 7-Day Premium Trial work?',
      a: 'You pay exactly ₹1 (100 paise) via Razorpay to unlock full NAVIKO Premium capabilities for 7 days. The trial does NOT auto-renew, and your card or UPI will NEVER be automatically billed after expiration. Once the 7-day period finishes, your account smoothly reverts to the Free plan unless you consciously choose to purchase an ongoing Plus or Pro membership.',
    },
    {
      category: 'billing',
      q: 'What billing cycles are available, and can I pay monthly?',
      a: `We offer both Monthly (30-day cycle) and Yearly (365-day cycle) options for both Plus and Pro tiers. You can subscribe to standalone monthly plans anytime (${plusMonthlyFormatted}/month for Plus or ${proMonthlyFormatted}/month for Pro) without long-term commitments. Yearly billing bundles full 12-month access at a steep discount, saving you ${plusSavingsPct}% on Plus and ${proSavingsPct}% on Pro compared to 12 separate monthly payments.`,
    },
    {
      category: 'billing',
      q: 'How does payment processing work and what methods are supported?',
      a: 'Payments in India (INR) are securely processed via Razorpay with instant verification. We support UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit & Debit cards (Visa, MasterCard, RuPay), and NetBanking. International transactions (USD, EUR, GBP, etc.) are processed via Stripe supporting credit/debit cards and Apple Pay/Google Pay. The price displayed on our page is exactly the authoritative amount charged with zero hidden fees.',
    },
    {
      category: 'billing',
      q: 'Can I cancel, upgrade, or switch my subscription at any time?',
      a: 'Yes! You have complete control from your Account and Billing dashboard. If you upgrade from Plus to Pro, the new tier activates immediately. If you cancel your recurring subscription, you retain full paid premium benefits until the end of your prepaid billing period, after which no further charges are incurred.',
    },
    {
      category: 'features',
      q: 'How do daily feature quotas and computational limits work?',
      a: 'Everyday standard tools (basic calculators, text tools, converters) feature unlimited usage for all users. Advanced tools requiring heavy background computation, high-resolution conversions, or AI planning (like 7-day diet planners, multi-PDF compression, and mock exam analyzers) are governed by fair-use quotas: 5 operations/day for Free users, 50 operations/day for Plus members, and 200 operations/day for Pro members. Quotas automatically reset each day at midnight UTC.',
    },
    {
      category: 'features',
      q: 'Is NAVIKO 100% ad-free on Premium tiers?',
      a: 'Yes. Both NAVIKO Plus and Pro provide a clean, distraction-free environment with Google AdSense and promotional banners completely removed from all 46+ tools, dashboards, and calculators.',
    },
    {
      category: 'features',
      q: 'Are my uploaded files, student notes, and health data secure?',
      a: 'Yes, privacy is foundational to NAVIKO. File processing (such as image compression, PDF merging, and client-side conversion) runs locally in your browser whenever possible. Your student logs, nutrition science inputs, and financial calculations are never sold to third parties or used for profiling.',
    },
  ];

  const filteredFaqs = faqCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === faqCategory);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-24 transition-colors">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-800 dark:text-indigo-300 text-xs font-bold mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>NAVIKO Subscription System — Free • Plus • Pro</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Transparent Plans for <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">Every User</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Start free with everyday essentials. Upgrade to Plus or Pro when you need higher limits, saved history, and powerful analytics.
        </p>

        {/* Hero CTA Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <a
            href="#pricing-cards"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <span>Compare Plans</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={() => onNavigate('/tools')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
          >
            Explore Free Tools
          </button>
        </div>

        {/* 3D Premium Floating Showcase Visual */}
        <div className="mt-12 max-w-5xl mx-auto">
          <Premium3DVisual onUpgrade={() => { const el = document.getElementById('pricing-cards'); el?.scrollIntoView({ behavior: 'smooth' }); }} />
        </div>

        {/* Razorpay Verified Security Assurance */}
        <div className="mt-8 max-w-2xl mx-auto p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <strong>Secure Billing:</strong> Powered by official 256-bit encrypted Razorpay checkout. Premium access activates immediately upon verified transaction completion.
          </span>
        </div>
      </section>

      {/* 2. PRICING CONTROLS & TOGGLE */}
      <section id="pricing-cards" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Select Your Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Transparent pricing with month-to-month flexibility or annual savings.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
            {/* View Mode Pills */}
            <div className="p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700 flex items-center shadow-inner text-xs">
              <button
                onClick={() => {
                  setActiveViewTab('all');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeViewTab === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Standard (Toggle)
              </button>
              <button
                onClick={() => {
                  setActiveViewTab('monthly_only');
                  setBillingInterval('monthly');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeViewTab === 'monthly_only'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Monthly Plans</span>
              </button>
              <button
                onClick={() => {
                  setActiveViewTab('side_by_side');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeViewTab === 'side_by_side'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Side-by-Side View
              </button>
            </div>

            {/* Currency Selector */}
            <CurrencySelector />

            {/* Monthly / Yearly Billing Toggle (visible when in standard toggle mode) */}
            {activeViewTab === 'all' && (
              <div className="p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 flex items-center shadow-inner">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !isYearly
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>

                <button
                  onClick={() => setBillingInterval('yearly')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isYearly
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase tracking-tight">
                    Save up to {maxSavingsPct}%
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Annual Savings or Monthly Flex Highlight Banner */}
        {activeViewTab === 'monthly_only' ? (
          <div className="max-w-4xl mx-auto mb-8 p-3.5 sm:p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 text-center sm:text-left">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Monthly Flex Mode:</span>{' '}
                Zero annual commitments. Pay month-to-month ({activePricing.name}) and pause or cancel anytime from your account.
              </div>
            </div>
            <button
              onClick={() => {
                setActiveViewTab('all');
                setBillingInterval('yearly');
              }}
              className="shrink-0 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              See Yearly Discounts (Save {maxSavingsPct}%) →
            </button>
          </div>
        ) : isYearly && activeViewTab === 'all' ? (
          <div className="max-w-4xl mx-auto mb-8 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 text-center sm:text-left">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Annual Savings Applied ({activePricing.name}):</span>{' '}
                Save <strong className="text-indigo-600 dark:text-indigo-400">{plusAnnualSavingsFormatted}/year</strong> on Plus ({plusSavingsPct}% off) and <strong className="text-purple-600 dark:text-purple-400">{proAnnualSavingsFormatted}/year</strong> on Pro ({proSavingsPct}% off).
              </div>
            </div>
            <div className="shrink-0 text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 uppercase tracking-wide">
              {currency} Annual Billing
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto mb-8 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Viewing <strong>Monthly Plans</strong>. Want to save up to <strong>{maxSavingsPct}%</strong>? Switch to <strong>Yearly Billing</strong> to unlock up to <strong>{proAnnualSavingsFormatted}</strong> in annual savings.
              </span>
            </div>
            <button
              onClick={() => {
                setActiveViewTab('all');
                setBillingInterval('yearly');
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
            >
              Switch &amp; Save
            </button>
          </div>
        )}

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`max-w-xl mx-auto mb-8 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Unauthenticated Alert Banner */}
        {!isAuthenticated && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 text-center sm:text-left">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Account Required:</strong> Please log in or create an account to purchase NAVIKO Premium or start your ₹1 trial.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('/login?redirect=/premium')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('/signup?redirect=/premium')}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 font-bold text-xs text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ₹1 PREMIUM TRIAL SPOTLIGHT OFFER CARD */}
        {/* ========================================================================= */}
        <div className="max-w-5xl mx-auto mb-10">
          {isTrial ? (
            /* Active 7-Day Trial Banner */
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-500/15 border-2 border-amber-500/60 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>₹1 Trial Active</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Full NAVIKO Premium Access is Active
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                    <strong>{remainingTrialDays} days, {remainingTrialHours} hours remaining.</strong> Your 7-day trial ends on{' '}
                    {trialEndsAt ? new Date(trialEndsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'in 7 days'}.{' '}
                    Your account will automatically return to FREE when the trial ends. No automatic renewal.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => onNavigate('/tools')}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all text-center cursor-pointer shadow-sm"
                  >
                    Use Premium Tools
                  </button>
                  <button
                    onClick={() => handleUpgrade('plus', 'yearly')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all text-center cursor-pointer shadow-md"
                  >
                    Lock in Plus Plan
                  </button>
                </div>
              </div>
            </div>
          ) : trialUsed ? (
            /* Trial Used / Expired Notification */
            <div className="rounded-2xl p-4 sm:p-5 bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>₹1 7-Day Trial Used:</strong> You have already completed your trial period. To continue accessing premium tools and expanded quotas, choose a Plus or Pro plan below.
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-bold px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                1 Trial per Account
              </span>
            </div>
          ) : (
            /* ₹1 Premium Trial Offer Card */
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border-2 border-amber-400/80 dark:border-amber-500/50 shadow-xl shadow-amber-500/5 relative overflow-hidden transition-all">
              {/* Top Accent Ribbon */}
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-slate-950 text-[11px] font-black uppercase tracking-wider py-1 px-5 rounded-bl-2xl shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Special Offer</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-xs font-black uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" />
                    <span>Special Introductory Access</span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      ₹1 Premium Trial
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Pay ₹1 to activate the trial. Experience all NAVIKO Premium features without commitment.
                    </p>
                  </div>

                  {/* Mandatory Requirement: Clearly display: "₹1 trial • 7 days • No automatic renewal." */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-extrabold shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>₹1 trial • 7 days • No automatic renewal.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Pay ₹1 to activate the trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Trial duration: 7 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>50 ops/day AI &amp; analytical quota</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Full Nutrition Science &amp; Meal Planner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Returns to FREE automatically</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Do NOT automatically charge after trial</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-amber-200/80 dark:border-amber-900/50 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    One-Time Activation
                  </div>
                  <div className="flex items-baseline gap-1 mt-1 mb-1">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                      ₹1
                    </span>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      for 7 days
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Pay ₹1 to activate the trial • 7 days
                  </div>

                  <button
                    onClick={handleStartTrial}
                    disabled={processingAction !== null}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] disabled:opacity-50"
                  >
                    {processingAction === 'trial' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Opening Razorpay (₹1)...</span>
                      </>
                    ) : (
                      <>
                        <span>Start ₹1 Trial</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    ₹1 payment is required to start the trial. Your trial does not automatically renew.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. PRICING CARDS DISPLAY (STANDARD & MONTHLY-ONLY MODES) */}
        {activeViewTab !== 'side_by_side' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto items-stretch">
            {/* 1. FREE PLAN CARD */}
            <Interactive3DCard className="h-full" elevation={6} maxTilt={4}>
              <div className="h-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-colors relative">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold tracking-wider uppercase">
                      FREE
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Casual &amp; New Users</span>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                        {formatCurrencyPrice(0, currency)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        forever
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Essential tools, everyday health calculators, and basic utilities.
                    </p>
                  </div>

                  {/* Free Features Checklist */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <div className="font-bold text-slate-900 dark:text-white mb-2">What&apos;s Included:</div>

                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Access to core NAVIKO tools (25+ tools)</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Basic calculators (SIP, EMI, Budget, Salary, Age)</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Basic student tools (CGPA, Attendance, Timetable)</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>BMI &amp; pediatric growth guidance</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Basic Nutrition Science &amp; Food Explorer</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>5 daily operations on AI / heavy utilities</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>100% Client-side privacy (zero data selling)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onNavigate('/tools')}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                  >
                    {plan === 'free' ? 'Current Plan — Continue Free' : 'Switch to Free'}
                  </button>
                </div>
              </div>
            </Interactive3DCard>

            {/* 2. PLUS PLAN CARD */}
            <Interactive3DCard className="h-full" elevation={8} maxTilt={5}>
              <div className="h-full rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-500/80 p-6 sm:p-7 shadow-lg flex flex-col justify-between relative transition-colors">
              {/* Badge */}
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>POPULAR FOR STUDENTS</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-xs font-extrabold tracking-wider uppercase border border-indigo-200 dark:border-indigo-800">
                    NAVIKO PLUS
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {isYearly && activeViewTab !== 'monthly_only' ? 'Annual Pass' : 'Monthly Flex Pass'}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {isYearly && activeViewTab !== 'monthly_only' ? plusYearlyFormatted : plusMonthlyFormatted}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {isYearly && activeViewTab !== 'monthly_only' ? '/ year' : '/ month'}
                    </span>
                  </div>

                  {isYearly && activeViewTab !== 'monthly_only' ? (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <span>Effective: <strong>{plusEffectiveMonthlyFormatted}</strong> / month</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                        <span>Save {plusAnnualSavingsFormatted}/year ({plusSavingsPct}% off)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 space-y-1">
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Monthly 30-Day Pass • Cancel Anytime</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveViewTab('all');
                          setBillingInterval('yearly');
                        }}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Or Yearly: Save {plusAnnualSavingsFormatted}/yr ({plusSavingsPct}%)</span>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Higher limits, saved nutrition plans, and mock test analytics.
                  </p>
                </div>

                {/* Plus Features List */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Everything in Free, plus:</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900 dark:text-white">50 daily operations on AI &amp; smart utilities (10x Free)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Weekly 7-Day Nutrition Planner &amp; Auto Grocery List</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Saved Custom Meal Plates &amp; Meal History</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Mock Test Trend Analytics &amp; Score Projections</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Saved Tool History &amp; Workspace Persistence</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Customizable Tool Dashboard &amp; Quick Pins</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Reduced advertising &amp; early access features</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {plan === 'plus' && subscriptionStatus === 'ACTIVE' ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold text-center">
                    ✓ Current Plan (Plus)
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleUpgrade('plus', activeViewTab === 'monthly_only' ? 'monthly' : billingInterval)}
                      disabled={processingAction !== null}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] disabled:opacity-50"
                    >
                      {processingAction === `plus_${activeViewTab === 'monthly_only' ? 'monthly' : billingInterval}` ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Activating Plus...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            Upgrade to Plus ({activeViewTab === 'monthly_only' || !isYearly ? 'Monthly' : 'Yearly'})
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Quick Direct Alternative Choice */}
                    {isYearly && activeViewTab !== 'monthly_only' && (
                      <button
                        onClick={() => handleUpgrade('plus', 'monthly')}
                        disabled={processingAction !== null}
                        className="w-full py-2 px-3 rounded-lg border border-indigo-200 dark:border-indigo-800/80 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer text-center"
                      >
                        Or Subscribe Monthly ({plusMonthlyFormatted}/mo)
                      </button>
                    )}

                    {!trialUsed && !isTrial && (
                      <button
                        onClick={handleStartTrial}
                        disabled={processingAction !== null}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-700 dark:text-amber-300 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Or Start ₹1 Trial (7 Days)</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            </Interactive3DCard>

            {/* 3. PRO PLAN CARD */}
            <Interactive3DCard className="h-full" elevation={8} maxTilt={5}>
              <div className="h-full rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-2 border-purple-500/80 p-6 sm:p-7 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              {/* Best Value Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1">
                <Crown className="w-3 h-3 text-slate-950" />
                <span>POWER USERS • FULL UNLOCK</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold tracking-wider uppercase border border-purple-500/30">
                    NAVIKO PRO
                  </span>
                  <span className="text-xs text-slate-400">
                    {isYearly && activeViewTab !== 'monthly_only' ? 'Annual Pass' : 'Monthly Flex Pass'}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {isYearly && activeViewTab !== 'monthly_only' ? proYearlyFormatted : proMonthlyFormatted}
                    </span>
                    <span className="text-sm font-semibold text-slate-300">
                      {isYearly && activeViewTab !== 'monthly_only' ? '/ year' : '/ month'}
                    </span>
                  </div>

                  {isYearly && activeViewTab !== 'monthly_only' ? (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                        <span>Effective: <strong>{proEffectiveMonthlyFormatted}</strong> / month</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                        <span>Save {proAnnualSavingsFormatted}/year ({proSavingsPct}% off)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 space-y-1">
                      <div className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Monthly 30-Day Pass • Cancel Anytime</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveViewTab('all');
                          setBillingInterval('yearly');
                        }}
                        className="text-[11px] font-semibold text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Or Yearly: Save {proAnnualSavingsFormatted}/yr ({proSavingsPct}%)</span>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    Highest daily limits, batch document processing, and 100% ad-free focus.
                  </p>
                </div>

                {/* Pro Features List */}
                <div className="space-y-3 pt-4 border-t border-slate-800 text-xs sm:text-sm text-slate-300">
                  <div className="font-bold text-white mb-2 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Everything in Plus, plus:</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-white font-semibold">200 daily operations across AI &amp; smart utilities</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Batch document conversion &amp; High-res PDF compression</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Advanced Predictive Score Analytics &amp; Full Study Reports</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Export reports in PDF, CSV, and JSON formats</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>100% Ad-Free distractionless workspace</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Priority compute queue &amp; customer assistance</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 space-y-2">
                {plan === 'pro' && subscriptionStatus === 'ACTIVE' ? (
                  <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold text-center">
                    ✓ Current Plan (Pro)
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleUpgrade('pro', activeViewTab === 'monthly_only' ? 'monthly' : billingInterval)}
                      disabled={processingAction !== null}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] disabled:opacity-50"
                    >
                      {processingAction === `pro_${activeViewTab === 'monthly_only' ? 'monthly' : billingInterval}` ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Activating Pro...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 text-amber-300" />
                          <span>
                            Upgrade to NAVIKO Pro ({activeViewTab === 'monthly_only' || !isYearly ? 'Monthly' : 'Yearly'})
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Quick Direct Alternative Choice */}
                    {isYearly && activeViewTab !== 'monthly_only' && (
                      <button
                        onClick={() => handleUpgrade('pro', 'monthly')}
                        disabled={processingAction !== null}
                        className="w-full py-2 px-3 rounded-lg border border-purple-500/40 text-[11px] font-semibold text-purple-200 hover:bg-purple-900/40 transition-colors cursor-pointer text-center"
                      >
                        Or Subscribe Monthly ({proMonthlyFormatted}/mo)
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            </Interactive3DCard>
          </div>
        )}

        {/* 4. SIDE-BY-SIDE ALL 4 PAID TIERS (MONTHLY & YEARLY COMBINED) */}
        {activeViewTab === 'side_by_side' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
              {/* Monthly Plus */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/80 p-5 shadow-sm flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-black uppercase">
                      Plus Monthly
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Flex Pass</span>
                  </div>
                  <div className="mb-4">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {plusMonthlyFormatted}
                      <span className="text-xs font-normal text-slate-500"> / mo</span>
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
                      30-day recurring • Cancel anytime
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> 50 daily smart ops</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> 7-Day Meal Planner</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Mock Test Projections</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Saved tool history</li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleUpgrade('plus', 'monthly')}
                    disabled={processingAction !== null}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    {processingAction === 'plus_monthly' ? 'Activating...' : 'Choose Plus Monthly'}
                  </button>
                </div>
              </div>

              {/* Yearly Plus */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-500 p-5 shadow-md flex flex-col justify-between relative">
                <div className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                  Save {plusSavingsPct}%
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase">
                      Plus Yearly
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Best Plus Value</span>
                  </div>
                  <div className="mb-4">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {plusYearlyFormatted}
                      <span className="text-xs font-normal text-slate-500"> / yr</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                      Effective: {plusEffectiveMonthlyFormatted}/mo (Save {plusAnnualSavingsFormatted})
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> 50 daily smart ops</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> 7-Day Meal Planner</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Mock Test Projections</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> 12 full months of access</li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleUpgrade('plus', 'yearly')}
                    disabled={processingAction !== null}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    {processingAction === 'plus_yearly' ? 'Activating...' : 'Choose Plus Yearly'}
                  </button>
                </div>
              </div>

              {/* Monthly Pro */}
              <div className="rounded-3xl bg-slate-900 text-white border-2 border-purple-900/80 p-5 shadow-md flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase">
                      Pro Monthly
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Flex Pass</span>
                  </div>
                  <div className="mb-4">
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {proMonthlyFormatted}
                      <span className="text-xs font-normal text-slate-400"> / mo</span>
                    </div>
                    <div className="text-[11px] text-purple-300 mt-1 font-semibold">
                      30-day recurring • Cancel anytime
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> 200 daily smart ops</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Batch document conversions</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> 100% Ad-Free workspace</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Export PDF/CSV/JSON</li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleUpgrade('pro', 'monthly')}
                    disabled={processingAction !== null}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    {processingAction === 'pro_monthly' ? 'Activating...' : 'Choose Pro Monthly'}
                  </button>
                </div>
              </div>

              {/* Yearly Pro */}
              <div className="rounded-3xl bg-slate-900 text-white border-2 border-purple-500 p-5 shadow-xl flex flex-col justify-between relative">
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-purple-600 to-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                  Save {proSavingsPct}%
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 text-slate-950 text-[10px] font-black uppercase">
                      Pro Yearly
                    </span>
                    <span className="text-[10px] font-bold text-amber-300">Ultimate Power</span>
                  </div>
                  <div className="mb-4">
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {proYearlyFormatted}
                      <span className="text-xs font-normal text-slate-400"> / yr</span>
                    </div>
                    <div className="text-[11px] text-amber-300 mt-1 font-bold">
                      Effective: {proEffectiveMonthlyFormatted}/mo (Save {proAnnualSavingsFormatted})
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> 200 daily smart ops</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Batch document conversions</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> 100% Ad-Free workspace</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Priority queue &amp; reports</li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleUpgrade('pro', 'yearly')}
                    disabled={processingAction !== null}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs transition-all cursor-pointer shadow-xs"
                  >
                    {processingAction === 'pro_yearly' ? 'Activating...' : 'Choose Pro Yearly'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3.5 DEDICATED SEPARATE MONTHLY FLEX PASS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-4">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-purple-900/10 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800/80 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Zero Commitment • Monthly Plans</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Standalone Monthly Subscription Plans
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                Prefer paying month-to-month without long-term commitment? Activate a 30-day rolling pass with instant unlocking and 1-click cancellation anytime from your account settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cancel anytime
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant activation
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dedicated Monthly Plus Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    NAVIKO Plus • Monthly Pass
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                    30-Day Cycle
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  {plusMonthlyFormatted} <span className="text-sm font-normal text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                  Full access to 50 daily heavy operations, 7-day meal planning, grocery list generation, and mock test score projections.
                </p>
              </div>

              <button
                onClick={() => handleUpgrade('plus', 'monthly')}
                disabled={processingAction !== null}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {processingAction === 'plus_monthly' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Activating Plus Monthly...</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe to Monthly Plus ({plusMonthlyFormatted}/mo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Dedicated Monthly Pro Card */}
            <div className="rounded-2xl bg-slate-900 text-white border border-purple-500/50 p-5 sm:p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wide">
                    NAVIKO Pro • Monthly Pass
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-200 font-bold">
                    30-Day Cycle
                  </span>
                </div>
                <div className="text-3xl font-black text-white mb-2">
                  {proMonthlyFormatted} <span className="text-sm font-normal text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  Ultimate capacity with 200 daily operations, batch conversions, predictive analytics, priority queue, and 100% ad-free experience.
                </p>
              </div>

              <button
                onClick={() => handleUpgrade('pro', 'monthly')}
                disabled={processingAction !== null}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {processingAction === 'pro_monthly' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Activating Pro Monthly...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>Subscribe to Monthly Pro ({proMonthlyFormatted}/mo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DETAILED FEATURE COMPARISON TABLE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side Breakdown</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Plan Feature Comparison
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            Review detailed feature allowances, computational limits, and ad-free experience across all three NAVIKO tiers.
          </p>
        </div>

        <ComparisonTable
          onSelectPlan={(tier) => handleUpgrade(tier)}
          plusPriceFormatted={billingInterval === 'yearly' ? `${plusEffectiveMonthlyFormatted}/mo` : `${plusMonthlyFormatted}/mo`}
          proPriceFormatted={billingInterval === 'yearly' ? `${proEffectiveMonthlyFormatted}/mo` : `${proMonthlyFormatted}/mo`}
          currentPlan={plan}
        />
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clear Answers, Zero Jargon</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            Everything you need to know about NAVIKO membership tiers, billing intervals, payment verification, and computational limits.
          </p>
        </div>

        {/* FAQ Category Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'plans', label: 'Subscription Plans' },
            { id: 'billing', label: 'Billing Cycles & Payments' },
            { id: 'features', label: 'Feature Access & Limits' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setFaqCategory(cat.id as any);
                setActiveFaq(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                faqCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm sm:text-base cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <div className={`p-1 rounded-lg shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Contact Link */}
        <div className="mt-10 text-center text-xs text-slate-500 dark:text-slate-400">
          Still have a question or need special student verification?{' '}
          <button
            onClick={() => onNavigate('/contact')}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer ml-1"
          >
            Contact NAVIKO Support
          </button>
        </div>
      </section>
    </div>
  );
};

