import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sliders,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  Trash2,
  Download,
  Search,
  Lock,
  Crown,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Globe,
  Compass,
  Activity,
  Wrench,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Clock,
} from 'lucide-react';
import { safeApiFetch } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  NavikoVersionId,
  CURRENCIES_REGISTRY,
  calculatePlanPrice,
  CurrencyCode,
  INTERNATIONAL_MINIMUM_MULTIPLIER,
} from '../config/pricingEngine';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'pricing' | 'products' | 'subscriptions' | 'users' | 'waitlist' | 'quotes'
  >('analytics');

  const [metrics, setMetrics] = useState<any>(null);
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [toolPolicies, setToolPolicies] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [versionFilter, setVersionFilter] = useState<'all' | 'v1' | 'v2' | 'v3'>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic Pricing Editor State
  const [multiplierInput, setMultiplierInput] = useState<number>(5.0);
  const [basePrices, setBasePrices] = useState({
    v1: { plus: 299, pro: 699 },
    v2: { plus: 349, premium: 749 },
    v3: { plus: 499, premium: 999 },
  });
  const [testProofTier, setTestProofTier] = useState<{ version: NavikoVersionId; tier: string }>({
    version: 'v3',
    tier: 'plus',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, pricingRes, usersRes, waitlistRes, quotesRes, policiesRes] = await Promise.all([
        safeApiFetch<any>('/api/admin/metrics'),
        safeApiFetch<any>('/api/admin/pricing-config'),
        safeApiFetch<any>('/api/admin/users'),
        safeApiFetch<any>('/api/admin/waitlist'),
        safeApiFetch<any>('/api/admin/quote-requests'),
        safeApiFetch<any>('/api/tools/policies'),
      ]);

      if (metricsRes.ok && metricsRes.data?.success) {
        setMetrics(metricsRes.data.metrics);
      }
      if (pricingRes.ok && pricingRes.data?.success) {
        setPricingConfig(pricingRes.data.config);
        if (pricingRes.data.config?.internationalMultiplier) {
          setMultiplierInput(pricingRes.data.config.internationalMultiplier);
        }
        if (pricingRes.data.config?.basePricesINR) {
          setBasePrices(pricingRes.data.config.basePricesINR);
        }
      }
      if (usersRes.ok && usersRes.data?.success) {
        setUsersList(usersRes.data.users || []);
      }
      if (waitlistRes.ok && waitlistRes.data?.success) {
        setWaitlist(waitlistRes.data.entries || []);
      }
      if (quotesRes.ok && quotesRes.data?.success) {
        setQuoteRequests(quotesRes.data.requests || []);
      }
      if (policiesRes.ok && policiesRes.data?.success) {
        setToolPolicies(policiesRes.data.policies || {});
      }
    } catch (err: any) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePricingConfig = async () => {
    try {
      const res = await safeApiFetch<any>('/api/admin/pricing-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internationalMultiplier: Number(multiplierInput) || 5.0,
          basePricesINR: basePrices,
        }),
      });

      if (res.ok && res.data?.success) {
        setStatusMessage({ type: 'success', text: 'Dynamic pricing engine and 5x rules saved successfully!' });
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: res.data?.error || 'Failed to update pricing rules.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error saving pricing configuration.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                NAVIKO Operations &amp; Monetization Control Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Ecosystem-wide management across NAVIKO 1.0, 2.0, and 3.0. 100% real server-backed analytics and controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="font-bold underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'analytics', label: '1. Financial Analytics', icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
            { id: 'pricing', label: '2. Pricing & 5x Engine', icon: <DollarSign className="w-4 h-4 text-indigo-500" /> },
            { id: 'products', label: '3. Product & Tool Toggles', icon: <Layers className="w-4 h-4 text-violet-500" /> },
            { id: 'subscriptions', label: '4. Subscriptions Audit', icon: <Crown className="w-4 h-4 text-amber-500" /> },
            { id: 'users', label: `5. Users (${usersList.length})`, icon: <Users className="w-4 h-4 text-blue-500" /> },
            { id: 'quotes', label: `Custom Quotes (${quoteRequests.length})`, icon: <Sliders className="w-4 h-4 text-slate-400" /> },
            { id: 'waitlist', label: `Waitlist (${waitlist.length})`, icon: <Clock className="w-4 h-4 text-slate-400" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: FINANCIAL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform Revenue</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  ₹{(metrics?.totalRevenueINR || 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">Converted INR value across all transactions</div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Ecosystem Subs</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {metrics?.activeSubscriptions || 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  V1: {metrics?.subscriptionsByVersion?.v1 || 0} • V2: {metrics?.subscriptionsByVersion?.v2 || 0} • V3: {metrics?.subscriptionsByVersion?.v3 || 0}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring (MRR)</span>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  ₹{Math.round((metrics?.mrrByVersion?.v1 || 0) + (metrics?.mrrByVersion?.v2 || 0) + (metrics?.mrrByVersion?.v3 || 0)).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">Sum of normalized active monthly billing</div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {metrics?.totalUsers || 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">{metrics?.activeTrials || 0} currently in ₹1 7-day trial</div>
              </div>
            </div>

            {/* Version Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* V1 Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">NAVIKO 1.0 — Tools Suite</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Active Subscriptions:</span>
                    <strong className="text-slate-900 dark:text-white">{metrics?.subscriptionsByVersion?.v1 || 0}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Estimated MRR:</span>
                    <strong className="text-slate-900 dark:text-white">₹{Math.round(metrics?.mrrByVersion?.v1 || 0)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Estimated ARR:</span>
                    <strong className="text-slate-900 dark:text-white">₹{Math.round(metrics?.arrByVersion?.v1 || 0)}</strong>
                  </div>
                </div>
              </div>

              {/* V2 Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">NAVIKO 2.0 — Nutrition</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Active Subscriptions:</span>
                    <strong className="text-slate-900 dark:text-white">{metrics?.subscriptionsByVersion?.v2 || 0}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Estimated MRR:</span>
                    <strong className="text-slate-900 dark:text-white">₹{Math.round(metrics?.mrrByVersion?.v2 || 0)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Estimated ARR:</span>
                    <strong className="text-slate-900 dark:text-white">₹{Math.round(metrics?.arrByVersion?.v2 || 0)}</strong>
                  </div>
                </div>
              </div>

              {/* V3 Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">NAVIKO 3.0 — Astrology</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Active Subscriptions:</span>
                    <strong className="text-slate-900 dark:text-white">{metrics?.subscriptionsByVersion?.v3 || 0}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Estimated MRR:</span>
                    <strong className="text-slate-900 dark:text-white">₹{Math.round(metrics?.mrrByVersion?.v3 || 0)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Estimated ARR:</span>
                    <strong className="text-slate-900 dark:text-white">₹{Math.round(metrics?.arrByVersion?.v3 || 0)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Currency Breakdown */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
                Revenue Captured by Currency
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(CURRENCIES_REGISTRY).map(([code, meta]) => {
                  const amt = metrics?.revenueByCurrency?.[code] || 0;
                  return (
                    <div key={code} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>{meta.flag}</span>
                        <span>{code}</span>
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                        {meta.symbol}{amt.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING MANAGEMENT & 5X PROOF TABLE */}
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Master Pricing Engine Configuration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure base INR prices and enforce the mandatory 5x international multiplier rule.
                  </p>
                </div>
                <button
                  onClick={handleSavePricingConfig}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Pricing Config</span>
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                  <label className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-200 block mb-1">
                    International Multiplier
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">Must be at least 5.0x per platform policy.</p>
                  <input
                    type="number"
                    step="0.1"
                    min="5.0"
                    value={multiplierInput}
                    onChange={(e) => setMultiplierInput(parseFloat(e.target.value) || 5.0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                    NAVIKO 1.0 Base (INR)
                  </label>
                  <div className="space-y-2 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Pro Monthly:</span>
                      <input
                        type="number"
                        value={basePrices.v1.pro}
                        onChange={(e) => setBasePrices({ ...basePrices, v1: { ...basePrices.v1, pro: parseInt(e.target.value) || 0 } })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                    NAVIKO 2.0 Base (INR)
                  </label>
                  <div className="space-y-2 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Plus Monthly:</span>
                      <input
                        type="number"
                        value={basePrices.v2.plus}
                        onChange={(e) => setBasePrices({ ...basePrices, v2: { ...basePrices.v2, plus: parseInt(e.target.value) || 0 } })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                    NAVIKO 3.0 Base (INR)
                  </label>
                  <div className="space-y-2 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Plus Monthly:</span>
                      <input
                        type="number"
                        value={basePrices.v3.plus}
                        onChange={(e) => setBasePrices({ ...basePrices, v3: { ...basePrices.v3, plus: parseInt(e.target.value) || 0 } })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE 5X PROOF & VERIFICATION TABLE */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Live 5x Multiplier Verification Table across all 11 Currencies</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Proves mathematically that no foreign currency plan sells below: (INR Base × {multiplierInput}) ÷ Exchange Rate.
                    </p>
                  </div>

                  {/* Selector for test preview */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Test Plan:</span>
                    <select
                      value={`${testProofTier.version}_${testProofTier.tier}`}
                      onChange={(e) => {
                        const [v, t] = e.target.value.split('_');
                        setTestProofTier({ version: v as NavikoVersionId, tier: t });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
                    >
                      <option value="v1_pro">NAVIKO 1.0 (Pro • ₹{basePrices.v1.pro})</option>
                      <option value="v2_plus">NAVIKO 2.0 (Wellness Plus • ₹{basePrices.v2.plus})</option>
                      <option value="v3_plus">NAVIKO 3.0 (Astrology Plus • ₹{basePrices.v3.plus})</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 font-bold">Currency</th>
                        <th className="py-2.5 px-3 font-bold">Exchange Rate (INR/unit)</th>
                        <th className="py-2.5 px-3 font-bold">Raw Formula Minimum (5x)</th>
                        <th className="py-2.5 px-3 font-bold">Charged Monthly (.99)</th>
                        <th className="py-2.5 px-3 font-bold">Annual Cycle Price</th>
                        <th className="py-2.5 px-3 font-bold text-center">5x Compliant?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {Object.keys(CURRENCIES_REGISTRY).map((cKey) => {
                        const code = cKey as CurrencyCode;
                        const meta = CURRENCIES_REGISTRY[code];
                        const calculatedMonthly = calculatePlanPrice(
                          testProofTier.version,
                          testProofTier.tier,
                          'monthly',
                          code,
                          multiplierInput
                        );
                        const calculatedYearly = calculatePlanPrice(
                          testProofTier.version,
                          testProofTier.tier,
                          'yearly',
                          code,
                          multiplierInput
                        );

                        const inrBase = calculatedMonthly.inrBaseMonthly;
                        const rawMathMin = code === 'INR' ? inrBase : (inrBase * multiplierInput) / meta.exchangeRateToINR;
                        const isStrictlyCompliant = calculatedMonthly.effectiveMonthlyPrice >= rawMathMin - 0.05;

                        return (
                          <tr key={code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span>{meta.flag}</span>
                              <span>{code}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono">
                              1 {code} = ₹{meta.exchangeRateToINR}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                              {meta.symbol}{rawMathMin.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white font-mono">
                              {calculatedMonthly.formattedMonthlyPrice}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono">
                              {calculatedYearly.formattedTotalCyclePrice}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isStrictlyCompliant ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  <Check className="w-3 h-3" />
                                  <span>VERIFIED ≥ 5x</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  BELOW 5X
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT & TOOL TOGGLES */}
        {activeTab === 'products' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Product Features &amp; Tool Usage Policies
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Designate tools as Unlimited, Quota-Based, or Metered. Enforce tier requirements dynamically.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(toolPolicies).map(([id, policy]: [string, any]) => (
                <div key={id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white capitalize">
                      {id.replace(/-/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {policy.policyType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {policy.description}
                  </p>
                  <div className="mt-3 text-[10px] text-slate-400">
                    Tier: {policy.requiredTier || 'Free'} • Daily Limit: {policy.freeDailyLimit || 'Unlimited'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION AUDIT */}
        {activeTab === 'subscriptions' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Active Subscription Audit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  View and filter active subscriber records across all 3 independent product versions.
                </p>
              </div>

              {/* Version Filter buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(['all', 'v1', 'v2', 'v3'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVersionFilter(v)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      versionFilter === v
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-bold">User</th>
                    <th className="py-2.5 px-3 font-bold">NAVIKO 1.0</th>
                    <th className="py-2.5 px-3 font-bold">NAVIKO 2.0</th>
                    <th className="py-2.5 px-3 font-bold">NAVIKO 3.0</th>
                    <th className="py-2.5 px-3 font-bold">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {usersList.map((u) => {
                    const v1 = u.subscriptions?.v1;
                    const v2 = u.subscriptions?.v2;
                    const v3 = u.subscriptions?.v3;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{u.name || 'Anonymous User'}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v1?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                            {v1?.tier?.toUpperCase() || 'FREE'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v2?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                            {v2?.tier?.toUpperCase() || 'FREE'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v3?.status === 'ACTIVE' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                            {v3?.tier?.toUpperCase() || 'FREE'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Platform Users Directory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Authenticated users with verified session IDs, roles, and ecosystem billing records.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-bold">User</th>
                    <th className="py-2.5 px-3 font-bold">Role</th>
                    <th className="py-2.5 px-3 font-bold">Active Subscriptions</th>
                    <th className="py-2.5 px-3 font-bold">Invoices Count</th>
                    <th className="py-2.5 px-3 font-bold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {usersList
                    .filter((u) => !searchTerm || u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((u) => {
                      const activeCount = [u.subscriptions?.v1, u.subscriptions?.v2, u.subscriptions?.v3].filter((s) => s?.status === 'ACTIVE').length;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 uppercase">
                              {u.role || 'USER'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                              {activeCount} Active Plans
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                            {u.billingInvoicesCount || 0} Invoices
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOM QUOTES */}
        {activeTab === 'quotes' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Custom Enterprise Quote Requests</h3>
            {quoteRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No custom quote requests received yet.</p>
            ) : (
              <div className="space-y-3">
                {quoteRequests.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-slate-900 dark:text-white">{q.name} ({q.email})</strong>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">{q.status}</span>
                    </div>
                    <div className="text-slate-500">Company: {q.company || 'N/A'} • Team: {q.teamSize || '1-5'} • Estimated: ₹{q.quoteAmountINR || 'Custom'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: WAITLIST */}
        {activeTab === 'waitlist' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Early Access Priority Waitlist</h3>
            {waitlist.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No waitlist entries currently recorded.</p>
            ) : (
              <div className="space-y-3">
                {waitlist.map((w) => (
                  <div key={w.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-slate-900 dark:text-white">{w.name} ({w.email})</strong>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">{w.status}</span>
                    </div>
                    <div className="text-slate-500">Interest: {w.primaryInterest || 'General Tools'} • Submitted: {new Date(w.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
