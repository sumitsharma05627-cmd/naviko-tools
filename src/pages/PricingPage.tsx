import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Crown,
  Globe,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  CheckCircle2,
  Lock,
  RefreshCw,
  Star,
  Compass,
  Activity,
  Wrench,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { useVersion } from '../context/VersionContext';
import {
  NavikoVersionId,
  VERSION_PLANS,
  INTERVAL_CONFIG,
  calculatePlanPrice,
  BillingInterval,
  CURRENCIES_REGISTRY,
} from '../config/pricingEngine';
import { CurrencySelector } from '../components/ui/CurrencySelector';
import { UnifiedButton } from '../components/ui/UnifiedButton';
import { UnifiedBadge } from '../components/ui/UnifiedBadge';
import { UnifiedCard } from '../components/ui/UnifiedCard';
import { useSEO, CANONICAL_DOMAIN } from '../utils/seo';

interface PricingPageProps {
  onNavigate: (path: string) => void;
  defaultVersion?: NavikoVersionId;
}

const resolveInitialVersion = (defaultVer?: NavikoVersionId, contextVer?: NavikoVersionId): NavikoVersionId => {
  if (defaultVer) return defaultVer;
  if (typeof window !== 'undefined') {
    const param = new URLSearchParams(window.location.search).get('version')?.toLowerCase();
    if (param === 'v1' || param === 'v2' || param === 'v3') {
      return param;
    }
  }
  return contextVer || 'v3';
};

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, defaultVersion }) => {
  const {
    currentCurrency,
    internationalMultiplier,
    basePricesINR,
    exchangeRates,
  } = useCurrency();
  const {
    versionSubscriptions,
    upgradeVersion,
  } = useSubscription();
  const { isAuthenticated } = useAuth();
  const { version: contextVersion } = useVersion();

  const [activeVersion, setActiveVersion] = useState<NavikoVersionId>(() =>
    resolveInitialVersion(defaultVersion, contextVersion)
  );
  const [activeInterval, setActiveInterval] = useState<BillingInterval>('yearly');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canonicalPath = defaultVersion ? `/${defaultVersion}/pricing` : '/pricing';

  // Currency-aware & Version-aware SEO configuration
  useSEO({
    title: `NAVIKO ${activeVersion.toUpperCase()} Pricing (${currentCurrency}) — Multi-Currency Plans`,
    description: `Transparent ${currentCurrency} subscription plans for NAVIKO 1.0 (General Tools), NAVIKO 2.0 (Nutrition Science), and NAVIKO 3.0 (Vedic Astrology & Vastu). Fair global currency parity with independent version access.`,
    canonical: `${CANONICAL_DOMAIN}${canonicalPath}`,
  });

  useEffect(() => {
    setActiveVersion(resolveInitialVersion(defaultVersion, contextVersion));
  }, [defaultVersion, contextVersion]);

  const currentSub = versionSubscriptions[activeVersion];
  const isVersionActive = currentSub?.isActive;

  const versionMeta: Record<NavikoVersionId, {
    title: string;
    subtitle: string;
    badge: string;
    accentColor: string;
    icon: React.ReactNode;
  }> = {
    v1: {
      title: 'NAVIKO 1.0 — General Tools Suite',
      subtitle: '46+ calculators, PDF converters, financial utilities & student productivity tools.',
      badge: 'Productivity Utilities',
      accentColor: 'indigo',
      icon: <Wrench className="w-5 h-5 text-indigo-500" />,
    },
    v2: {
      title: 'NAVIKO 2.0 — Nutrition & Ayurveda',
      subtitle: 'Evidence-based Indian food intelligence, clinical nutrition & authentic Ayurvedic wisdom.',
      badge: 'Wellness & Health',
      accentColor: 'emerald',
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
    },
    v3: {
      title: 'NAVIKO 3.0 — Vedic Astrology & Vastu',
      subtitle: 'Mathematical Chitrapaksha Kundli, 16-zone Vastu Purusha Mandala & grounded NAVI AI.',
      badge: 'Astrology & Space',
      accentColor: 'amber',
      icon: <Compass className="w-5 h-5 text-amber-500" />,
    },
  };

  const currentPlans = VERSION_PLANS[activeVersion];

  const handleSubscribe = async (tier: string) => {
    if (tier === 'free') return;

    if (!isAuthenticated) {
      onNavigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setProcessingPlanId(`${activeVersion}_${tier}`);
    setStatusMessage(null);

    try {
      const res = await upgradeVersion(activeVersion, tier, activeInterval, currentCurrency);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message || `Successfully activated NAVIKO ${activeVersion.toUpperCase()} ${tier.toUpperCase()}!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Payment was cancelled or could not be completed.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Unexpected payment error occurred. Please try again.',
      });
    } finally {
      setProcessingPlanId(null);
    }
  };

  const currencyData = CURRENCIES_REGISTRY[currentCurrency];
  const isInternational = currentCurrency !== 'INR';

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 transition-colors">
      {/* Hero Header */}
      <div className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-6">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Independent Subscriptions • 11 Global Currencies Supported</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto mb-4">
            Simple, Transparent Pricing Across the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-emerald-600 to-amber-600">
              NAVIKO Ecosystem
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            Each NAVIKO version operates as an independent product with its own dedicated research, specialized calculations, and distinct subscription plans. Choose what you need, with no bundled clutter.
          </p>

          {/* Version Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl max-w-2xl mx-auto border border-slate-200/80 dark:border-slate-700">
            {(['v1', 'v2', 'v3'] as NavikoVersionId[]).map((v) => {
              const meta = versionMeta[v];
              const isSelected = activeVersion === v;
              const sub = versionSubscriptions[v];
              return (
                <button
                  key={v}
                  onClick={() => {
                    setActiveVersion(v);
                    setStatusMessage(null);
                  }}
                  className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {meta.icon}
                  <span>{v === 'v1' ? 'NAVIKO 1.0' : v === 'v2' ? 'NAVIKO 2.0' : 'NAVIKO 3.0'}</span>
                  {sub?.isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Subscription" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Version Information Banner & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/80 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <UnifiedBadge variant="neutral" size="sm">
                {versionMeta[activeVersion].badge}
              </UnifiedBadge>
              {isVersionActive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Subscribed ({currentSub?.tier.toUpperCase()})
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {versionMeta[activeVersion].title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {versionMeta[activeVersion].subtitle}
            </p>
          </div>

          {/* Controls: Currency & Billing Interval */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <CurrencySelector />

            {/* Interval Selector */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              {(['monthly', 'quarterly', 'half_yearly', 'yearly'] as BillingInterval[]).map((intv) => {
                const config = INTERVAL_CONFIG[intv];
                const isSelected = activeInterval === intv;
                return (
                  <button
                    key={intv}
                    onClick={() => setActiveInterval(intv)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {config.label}
                    {config.discountPercent > 0 && (
                      <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                        -{config.discountPercent}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* International 5x Rule Transparency Callout */}
        {isInternational && (
          <div className="mb-8 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3.5">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white">
                Transparent International Pricing Policy:
              </span>{' '}
              To maintain fair global parity while honoring purchasing power differentials, all international subscriptions strictly enforce a minimum 5× Indian base multiplier:
              <code className="mx-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 font-mono text-xs border border-indigo-200 dark:border-indigo-800">
                International Price ≥ (INR Base × 5) ÷ Exchange Rate
              </code>
              Prices are cleanly rounded to commercial price points (.99) with 0% export VAT applied.
            </div>
          </div>
        )}

        {/* Status Message (Success / Error) */}
        {statusMessage && (
          <div
            className={`mb-8 p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {currentPlans.map((plan) => {
            const isFree = plan.tier === 'free';
            const calculated = calculatePlanPrice(
              plan,
              currentCurrency,
              activeInterval,
              internationalMultiplier,
              exchangeRates,
              basePricesINR
            );

            const isCurrentSub = isVersionActive && currentSub?.tier === plan.tier;
            const isPopular = (plan as any).isPopular;
            const isProcessing = processingPlanId === `${activeVersion}_${plan.tier}`;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all ${
                  isPopular
                    ? 'bg-white dark:bg-slate-900 border-2 border-indigo-500 dark:border-indigo-400 shadow-xl shadow-indigo-500/10'
                    : 'bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Popular or Master Badge */}
                {(plan as any).badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm">
                      {(plan as any).badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Pricing Display */}
                  <div className="my-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    {isFree ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">
                          {currencyData.symbol}0
                        </span>
                        <span className="text-xs font-bold text-slate-500">Free forever</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-black text-slate-900 dark:text-white">
                            {calculated.formattedMonthlyPrice}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            / month
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 flex items-center flex-wrap gap-1.5">
                          <span>
                            Cycle subtotal: {calculated.formattedTotalCyclePrice} • Payable:{' '}
                            <strong className="text-slate-700 dark:text-slate-200">
                              {calculated.formattedFinalPayable}
                            </strong>
                          </span>
                          {calculated.discountPercent > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Save {calculated.discountPercent}%
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                          {calculated.taxPercent > 0
                            ? `Includes ${calculated.taxPercent}% Indian GST (${currencyData.symbol}${calculated.taxAmount})`
                            : '0% Export VAT / GST for international billing'}
                        </div>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 mt-2">
                      {plan.limitsDescription}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      What's Included:
                    </span>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call-to-Action Button */}
                <div>
                  {isCurrentSub ? (
                    <div className="w-full py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Current Active Plan</span>
                    </div>
                  ) : isFree ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    >
                      Included by Default
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={isProcessing}
                      className={`w-full py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                        isPopular
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-98'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 active:scale-98'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Preparing Secure Checkout...</span>
                        </>
                      ) : (
                        <>
                          <span>Upgrade to {plan.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Secured by Razorpay • Instant access
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix for Active Version */}
        <div className="mb-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Plan Feature Comparison — {versionMeta[activeVersion].title.split('—')[0].trim()}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Side-by-side breakdown of limits and capabilities across tiers in {currentCurrency}.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-3 pr-4 font-bold">Capability</th>
                  {currentPlans.map((p) => (
                    <th key={p.id} className="py-3 px-4 font-black text-slate-900 dark:text-white text-center">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {(activeVersion === 'v1'
                  ? [
                      { label: 'Daily High-Compute Operations', vals: ['5 / day', '50 / day', '250 / day'] },
                      { label: 'Max PDF File Processing Size', vals: ['5 MB', '100 MB', '500 MB'] },
                      { label: 'Financial Modeling & Debt Clock', vals: ['Core Only', 'Full Suite', 'Full + Batch CSV'] },
                      { label: 'ATS Resume Builder & Export', vals: ['Standard', 'Unlimited PDF', 'Priority Templates'] },
                      { label: 'Ad-Free Workspace', vals: ['Standard Ads', 'Ad-Free', 'Ad-Free'] },
                    ]
                  : activeVersion === 'v2'
                  ? [
                      { label: 'ICMR-NIN Food Explorer & Matrix', vals: ['2 Foods Compare', '6 Foods Compare', '12 Foods Compare'] },
                      { label: 'Saved Custom Meal Plans', vals: ['1 Plan', '20 Plans', '100 Plans + Family'] },
                      { label: 'Packaged Label & INS Decoder', vals: ['Basic', 'Full Database', 'Clinical Export'] },
                      { label: 'Ayurveda Dinacharya & Herbs', vals: ['12 Core Herbs', 'Dosha Builder', 'Full Monographs'] },
                      { label: 'Ad-Free Workspace', vals: ['Standard Ads', 'Ad-Free', 'Ad-Free'] },
                    ]
                  : [
                      { label: 'Saved Kundli Birth Charts', vals: ['1 Chart', '10 Charts', 'Unlimited Family Archive'] },
                      { label: 'Divisional Charts & Dasha', vals: ['D1 Lagna', 'D1 + D9 + 120y Dasha', 'Full Shodashvarga + Yogas'] },
                      { label: 'Vastu Shastra Analyzer', vals: ['8-Direction Check', '16-Zone Mandala', 'Blueprint Upload + Remedies'] },
                      { label: 'NAVI AI Grounded Consultations', vals: ['3 / day', '15 / day', 'Unlimited (EN & HI)'] },
                      { label: 'PDF Kundli & Vastu Dossiers', vals: ['Screen View', 'Printable Basic', 'High-Res Dossiers'] },
                    ]
                ).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-300">{row.label}</td>
                    {row.vals.map((val, cIdx) => (
                      <td key={cIdx} className="py-3 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Version Ecosystem Independence Explanation */}
        <div className="rounded-3xl p-8 mb-16 bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800">
          <div className="max-w-3xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4 inline-block">
              Architecture & Entitlements
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mb-3">
              Why are NAVIKO 1.0, 2.0, and 3.0 separate subscriptions?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              NAVIKO hosts three distinct disciplines under one roof: General Productivity Tools, Nutrition Science & Ayurveda, and Vedic Astrology & Vastu Shastra. Each domain requires specialized ephemeris computation, algorithmic food databases, or PDF generation engines. By keeping subscriptions separate, users only pay for what they use.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-xs font-bold text-indigo-400 mb-1">NAVIKO 1.0</div>
                <div className="text-xs text-slate-300">46+ Utility Tools & Calculators</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-xs font-bold text-emerald-400 mb-1">NAVIKO 2.0</div>
                <div className="text-xs text-slate-300">Nutrition Science & Food Explorer</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-xs font-bold text-amber-400 mb-1">NAVIKO 3.0</div>
                <div className="text-xs text-slate-300">Kundli, Vastu, Panchang & NAVI AI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Common questions regarding our global billing, currencies, and version features.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Can I subscribe to NAVIKO 3.0 without subscribing to 1.0 or 2.0?',
                a: 'Yes, absolutely! Each version operates independently. Subscribing to NAVIKO 3.0 unlocks all Vedic Astrology and Vastu Shastra master features without requiring payment for the general utility or nutrition suites.',
              },
              {
                q: 'How does NAVIKO calculate international pricing in USD, GBP, EUR, or JPY?',
                a: 'All international pricing strictly enforces our transparent formula: International Price ≥ (Indian Base Price × 5) ÷ Current Exchange Rate. We round upward to commercial price points (.99) so international customers pay fair market value while enjoying zero export tax.',
              },
              {
                q: 'Which payment methods are accepted internationally?',
                a: 'We process payments securely via Razorpay, supporting international Visa, MasterCard, American Express, PayPal, Apple Pay, Google Pay, and localized bank rails in all 11 supported currencies.',
              },
              {
                q: 'Can I cancel my subscription at any time?',
                a: 'Yes. You can manage and cancel any version subscription independently directly from your Account Dashboard. Cancelling one version will not impact any other active version subscriptions.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm sm:text-base cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === index ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
