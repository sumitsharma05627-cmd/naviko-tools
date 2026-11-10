import React, { useState, useEffect } from 'react';
import {
  CurrencyCode,
  CustomPlanSelections,
  CustomPlanQuote,
  DEFAULT_CUSTOM_SELECTIONS,
  calculateCustomPlanQuote,
} from '../../config/pricing';

interface CustomPlanBuilderProps {
  currency: CurrencyCode;
  onProceedToCheckout?: (selections: CustomPlanSelections, quote: CustomPlanQuote) => void;
}

const CATEGORY_OPTIONS = [
  {
    id: 'nutrition',
    label: 'Nutrition & Ayurveda Intelligence',
    desc: 'Nutrient plate builder, 7-day meal schedules, Ayurvedic diet engine & grocery generator',
    icon: '🥗',
  },
  {
    id: 'student',
    label: 'Student & Academic Productivity',
    desc: 'Mock test diagnostic analyzer, NEET/JEE rank projector, attendance threshold planner',
    icon: '🎓',
  },
  {
    id: 'finance',
    label: 'Finance & Wealth Analytics',
    desc: 'SIP compounding wealth forecaster, EMI loan amortization, 50/30/20 budget planner',
    icon: '📈',
  },
  {
    id: 'pdf',
    label: 'PDF & Document Engineering',
    desc: 'High-ratio PDF compression, document restructuring, batch export pipeline',
    icon: '📄',
  },
  {
    id: 'image',
    label: 'Image & Creative Studio',
    desc: 'AI background remover, precise KB compressor, automated resolution optimizer',
    icon: '🖼️',
  },
  {
    id: 'career',
    label: 'Career & Professional Suite',
    desc: 'ATS resume builder, cover letter formatting, professional export profiles',
    icon: '💼',
  },
];

const AI_TIERS = [
  { id: 'starter', label: 'Starter', ops: '50 ops/day', priceINR: 'Included' },
  { id: 'pro', label: 'Pro Scale', ops: '150 ops/day', priceINR: '+₹150/mo' },
  { id: 'unlimited', label: 'High Burst', ops: '500 ops/day', priceINR: '+₹450/mo' },
  { id: 'enterprise', label: 'Enterprise', ops: '2,000 ops/day', priceINR: '+₹1,200/mo' },
];

const STORAGE_TIERS = [
  { id: 'basic', label: 'Basic', size: '500 MB', priceINR: 'Included' },
  { id: 'standard', label: 'Standard', size: '5 GB', priceINR: '+₹100/mo' },
  { id: 'power', label: 'Power', size: '25 GB', priceINR: '+₹300/mo' },
  { id: 'enterprise', label: 'Enterprise', size: '100 GB', priceINR: '+₹750/mo' },
];

const SUPPORT_TIERS = [
  { id: 'standard', label: 'Standard Community', desc: 'Documentation & community forum', priceINR: 'Included' },
  { id: 'priority', label: 'Priority SLA (4h)', desc: 'Fast response ticket queue', priceINR: '+₹250/mo' },
  { id: 'dedicated', label: 'Dedicated Specialist', desc: '1-on-1 account onboarding & direct support', priceINR: '+₹999/mo' },
];

export const CustomPlanBuilder: React.FC<CustomPlanBuilderProps> = ({
  currency,
  onProceedToCheckout,
}) => {
  const [selections, setSelections] = useState<CustomPlanSelections>(DEFAULT_CUSTOM_SELECTIONS);
  const [quote, setQuote] = useState<CustomPlanQuote>(() =>
    calculateCustomPlanQuote(DEFAULT_CUSTOM_SELECTIONS, currency)
  );
  const [isCalculating, setIsCalculating] = useState(false);

  // Quote Request Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '5-20',
    requirements: '',
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);
  const [quoteErrorMsg, setQuoteErrorMsg] = useState<string | null>(null);

  // Fetch server-authoritative quote whenever selections or currency change
  useEffect(() => {
    let isCancelled = false;
    const fetchServerQuote = async () => {
      setIsCalculating(true);
      try {
        const res = await fetch('/api/pricing/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selections, currency }),
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.success && data.quote) {
            setQuote(data.quote);
            setIsCalculating(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Server quote calculation fallback to local pricing rules:', err);
      }
      if (!isCancelled) {
        setQuote(calculateCustomPlanQuote(selections, currency));
        setIsCalculating(false);
      }
    };

    fetchServerQuote();
    return () => {
      isCancelled = true;
    };
  }, [selections, currency]);

  const toggleCategory = (catId: string) => {
    setSelections((prev) => {
      const exists = prev.toolCategories.includes(catId);
      const updated = exists
        ? prev.toolCategories.filter((c) => c !== catId)
        : [...prev.toolCategories, catId];
      // Ensure at least one category is always selected
      return {
        ...prev,
        toolCategories: updated.length > 0 ? updated : [catId],
      };
    });
  };

  const handleCheckout = () => {
    // Store authoritative custom plan selections in sessionStorage for checkout retrieval
    try {
      sessionStorage.setItem('naviko_custom_selections', JSON.stringify(selections));
      sessionStorage.setItem('naviko_custom_quote', JSON.stringify(quote));
    } catch (e) {
      console.warn('Could not cache custom selections:', e);
    }

    if (onProceedToCheckout) {
      onProceedToCheckout(selections, quote);
    } else {
      window.history.pushState({}, '', '/checkout?plan=custom_plan');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitting(true);
    setQuoteErrorMsg(null);
    setQuoteSuccessMsg(null);

    try {
      const res = await fetch('/api/pricing/request-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quoteForm,
          toolCategories: selections.toolCategories,
          aiTier: selections.aiTier,
          storageTier: selections.storageTier,
          supportLevel: selections.supportLevel,
          billingInterval: selections.billingInterval,
          estimatedCost: quote.finalPayable,
          currency,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setQuoteSuccessMsg(data.message || 'Custom quote requested successfully! Our team will contact you shortly.');
        setQuoteForm({ name: '', email: '', company: '', teamSize: '5-20', requirements: '' });
      } else {
        setQuoteErrorMsg(data.error || 'Failed to submit quote request. Please try again.');
      }
    } catch (err: any) {
      setQuoteErrorMsg(err?.message || 'Network error while submitting quote inquiry.');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
          <span>🛠️ Fully Customizable Plan</span>
          <span className="w-1 h-1 rounded-full bg-indigo-400" />
          <span>Pay Only For What You Use</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Design Your Ideal NAVIKO Subscription
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
          Configure tool access, AI capacity, storage limits, and team seats. Pricing updates in real time with guaranteed server-side validation.
        </p>

        {/* Interval Selector */}
        <div className="mt-6 inline-flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setSelections((s) => ({ ...s, billingInterval: 'monthly' }))}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
              selections.billingInterval === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setSelections((s) => ({ ...s, billingInterval: 'yearly' }))}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
              selections.billingInterval === 'yearly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customization Controls */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Tool Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>1. Select Included Tool Suites</span>
                <span className="text-xs font-normal text-slate-500">
                  ({selections.toolCategories.length} selected)
                </span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelections((s) => ({
                    ...s,
                    toolCategories:
                      s.toolCategories.length === CATEGORY_OPTIONS.length
                        ? ['nutrition']
                        : CATEGORY_OPTIONS.map((c) => c.id),
                  }))
                }
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {selections.toolCategories.length === CATEGORY_OPTIONS.length
                  ? 'Deselect Extra'
                  : 'Select All Suites'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = selections.toolCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {cat.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. AI Usage Tier */}
          <div>
            <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between mb-3">
              <span>2. Daily AI Intelligence & Edge Processing</span>
              <span className="text-xs font-normal text-slate-500">Per user</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AI_TIERS.map((tier) => {
                const isSelected = selections.aiTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() =>
                      setSelections((s) => ({
                        ...s,
                        aiTier: tier.id as CustomPlanSelections['aiTier'],
                      }))
                    }
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{tier.label}</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                      {tier.ops}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{tier.priceINR}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Storage Tier */}
          <div>
            <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between mb-3">
              <span>3. Cloud Storage & Workspace Vault</span>
              <span className="text-xs font-normal text-slate-500">Persistent sync</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STORAGE_TIERS.map((tier) => {
                const isSelected = selections.storageTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() =>
                      setSelections((s) => ({
                        ...s,
                        storageTier: tier.id as CustomPlanSelections['storageTier'],
                      }))
                    }
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{tier.label}</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                      {tier.size}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{tier.priceINR}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Team Seats Slider */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="team-seats-slider" className="text-sm font-bold text-slate-900 dark:text-white">
                4. Team Member Seats
              </label>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                {selections.seats} {selections.seats === 1 ? 'User' : 'Users'}
              </span>
            </div>
            <input
              id="team-seats-slider"
              type="range"
              min="1"
              max="25"
              step="1"
              value={selections.seats}
              onChange={(e) =>
                setSelections((s) => ({ ...s, seats: Math.max(1, Number(e.target.value)) }))
              }
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Individual (1)</span>
              <span>Small Team (5)</span>
              <span>Agency (15)</span>
              <span>Enterprise (25+)</span>
            </div>
          </div>

          {/* 5. Support Level */}
          <div>
            <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between mb-3">
              <span>5. Support Tier & Service SLA</span>
            </label>
            <div className="space-y-2">
              {SUPPORT_TIERS.map((tier) => {
                const isSelected = selections.supportLevel === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() =>
                      setSelections((s) => ({
                        ...s,
                        supportLevel: tier.id as CustomPlanSelections['supportLevel'],
                      }))
                    }
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {tier.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{tier.desc}</div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      {tier.priceINR}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Server-Side Quote Breakdown Card */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-7 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Dynamic Quote
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Custom Plan Summary
                </h3>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Validated
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex justify-between">
                <span>Base Platform Access</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currency === 'INR' ? `₹${quote.baseMonthly}/mo` : `$${quote.baseMonthly}/mo`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tool Suites ({selections.toolCategories.length})</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  +{currency === 'INR' ? `₹${quote.categoryAddon}/mo` : `$${quote.categoryAddon}/mo`}
                </span>
              </div>
              {quote.aiAddon > 0 && (
                <div className="flex justify-between">
                  <span>AI Processing Tier ({selections.aiTier})</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    +{currency === 'INR' ? `₹${quote.aiAddon}/mo` : `$${quote.aiAddon}/mo`}
                  </span>
                </div>
              )}
              {quote.storageAddon > 0 && (
                <div className="flex justify-between">
                  <span>Cloud Storage ({selections.storageTier})</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    +{currency === 'INR' ? `₹${quote.storageAddon}/mo` : `$${quote.storageAddon}/mo`}
                  </span>
                </div>
              )}
              {quote.seatCost > 0 && (
                <div className="flex justify-between">
                  <span>Additional Seats ({selections.seats - 1})</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    +{currency === 'INR' ? `₹${quote.seatCost}/mo` : `$${quote.seatCost}/mo`}
                  </span>
                </div>
              )}
              {quote.supportAddon > 0 && (
                <div className="flex justify-between">
                  <span>Support SLA ({selections.supportLevel})</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    +{currency === 'INR' ? `₹${quote.supportAddon}/mo` : `$${quote.supportAddon}/mo`}
                  </span>
                </div>
              )}
            </div>

            {/* Subtotals & Taxes */}
            <div className="py-3 space-y-2 text-sm border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>
                  {selections.billingInterval === 'yearly' ? 'Annual Subtotal (12 mo)' : 'Monthly Subtotal'}
                </span>
                <span className="font-medium">{quote.formattedSubtotal}</span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Annual Commitment Discount (20%)</span>
                  <span>-{quote.formattedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Applicable GST (18%)</span>
                <span>+{quote.formattedTax}</span>
              </div>
            </div>

            {/* Total Payable */}
            <div className="pt-4 pb-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-slate-500">Total Payable</div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {quote.formattedFinalPayable}
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {selections.billingInterval === 'yearly' ? 'Billed annually' : 'Billed monthly'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Taxes itemized. Guaranteed server price locks upon checkout.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={isCalculating}
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all text-center"
              >
                Request Custom Team / Enterprise Quote
              </button>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <span>🔒</span> 256-Bit SSL Encrypted • Instant Activation • Cancel Anytime
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Request-A-Quote Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold p-1"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Enterprise & Custom Procurement
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Request a Custom Quote
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tell us about your organization's needs for custom invoicing, dedicated SLA, or consolidated team billing.
              </p>
            </div>

            {quoteSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-sm">
                <p className="font-bold">✓ Request Received!</p>
                <p className="mt-1 text-xs">{quoteSuccessMsg}</p>
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                {quoteErrorMsg && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                    {quoteErrorMsg}
                  </div>
                )}

                <div>
                  <label htmlFor="quote-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    id="quote-name"
                    type="text"
                    required
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    placeholder="Aditi Sharma"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="quote-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email *
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    required
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    placeholder="aditi@organization.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="quote-company" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Organization
                    </label>
                    <input
                      id="quote-company"
                      type="text"
                      value={quoteForm.company}
                      onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })}
                      placeholder="Acme Clinic / School"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-team-size" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Team Size
                    </label>
                    <select
                      id="quote-team-size"
                      value={quoteForm.teamSize}
                      onChange={(e) => setQuoteForm({ ...quoteForm, teamSize: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1-5">1-5 members</option>
                      <option value="5-20">5-20 members</option>
                      <option value="20-50">20-50 members</option>
                      <option value="50+">50+ enterprise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="quote-requirements" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Special Requirements or Notes
                  </label>
                  <textarea
                    id="quote-requirements"
                    rows={3}
                    value={quoteForm.requirements}
                    onChange={(e) => setQuoteForm({ ...quoteForm, requirements: e.target.value })}
                    placeholder="Custom API integration, GST invoicing with purchase order, training sessions..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={quoteSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                  >
                    {quoteSubmitting ? 'Submitting Request...' : 'Submit Custom Quote Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPlanBuilder;
