import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Sparkles, Copy, Check, DollarSign, 
  Calendar, Layers, ShieldCheck, Flame, PieChart as PieIcon,
  HelpCircle, Clock
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const CompoundInterestCalculator: React.FC = () => {
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Input states
  const [initialPrincipal, setInitialPrincipal] = useState<number>(100000);
  const [periodicDeposit, setPeriodicDeposit] = useState<number>(10000);
  const [depositFrequency, setDepositFrequency] = useState<'monthly' | 'quarterly' | 'annually' | 'none'>('monthly');
  const [depositTiming, setDepositTiming] = useState<'beginning' | 'end'>('beginning');
  const [annualRate, setAnnualRate] = useState<number>(12);
  const [years, setYears] = useState<number>(15);
  const [compoundFrequency, setCompoundFrequency] = useState<number>(12); // 12 = monthly, 1 = annually, 4 = quarterly, 365 = daily
  
  // Inflation adjustment
  const [adjustInflation, setAdjustInflation] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(6);

  const [copied, setCopied] = useState<boolean>(false);

  // Core Compounding Engine
  const calculation = useMemo(() => {
    const P = Math.max(0, initialPrincipal);
    const r = Math.max(0, annualRate) / 100;
    const n = Math.max(1, compoundFrequency);
    const t = Math.max(1, years);

    // Number of deposits per year
    let depositsPerYear = 0;
    let depositAmount = 0;
    if (depositFrequency === 'monthly') {
      depositsPerYear = 12;
      depositAmount = periodicDeposit;
    } else if (depositFrequency === 'quarterly') {
      depositsPerYear = 4;
      depositAmount = periodicDeposit;
    } else if (depositFrequency === 'annually') {
      depositsPerYear = 1;
      depositAmount = periodicDeposit;
    }

    let currentBalance = P;
    let totalInvestedPrincipal = P;
    const yearlyBreakdown = [];

    // Monthly simulation step with accurate compounding frequency conversion
    const totalMonths = t * 12;
    const effectiveMonthlyRate = n === 12 ? r / 12 : Math.pow(1 + r / n, n / 12) - 1;

    yearlyBreakdown.push({
      year: 'Start',
      yearNum: 0,
      totalBalance: P,
      principalInvested: P,
      interestEarned: 0,
      realValue: P
    });

    let accumulatedDeposits = 0;

    for (let m = 1; m <= totalMonths; m++) {
      // Add deposit if matching frequency
      let addedThisMonth = 0;
      if (depositFrequency === 'monthly') {
        addedThisMonth = depositAmount;
      } else if (depositFrequency === 'quarterly' && m % 3 === 1) {
        addedThisMonth = depositAmount;
      } else if (depositFrequency === 'annually' && m % 12 === 1) {
        addedThisMonth = depositAmount;
      }

      if (depositTiming === 'beginning') {
        currentBalance += addedThisMonth;
      }
      
      // Add interest
      currentBalance += currentBalance * effectiveMonthlyRate;

      if (depositTiming === 'end') {
        currentBalance += addedThisMonth;
      }

      accumulatedDeposits += addedThisMonth;

      // Log at every 12 months (year end)
      if (m % 12 === 0) {
        const y = m / 12;
        const totalInvestedSoFar = P + accumulatedDeposits;
        const interestSoFar = Math.max(0, currentBalance - totalInvestedSoFar);

        // Inflation adjusted purchasing power: PV = FV / (1 + i)^y
        const infl = Math.max(0, inflationRate) / 100;
        const realVal = adjustInflation ? currentBalance / Math.pow(1 + infl, y) : currentBalance;

        yearlyBreakdown.push({
          year: `Yr ${y}`,
          yearNum: y,
          totalBalance: Math.round(currentBalance),
          principalInvested: Math.round(totalInvestedSoFar),
          interestEarned: Math.round(interestSoFar),
          realValue: Math.round(realVal)
        });
      }
    }

    const finalTotal = currentBalance;
    const finalTotalInvested = P + accumulatedDeposits;
    const finalInterest = Math.max(0, finalTotal - finalTotalInvested);
    const inflationAdjustedTotal = adjustInflation ? finalTotal / Math.pow(1 + inflationRate / 100, t) : finalTotal;

    // Rule of 72: Doubling time
    const doublingYears = r > 0 ? (72 / (annualRate)).toFixed(1) : '∞';

    return {
      finalTotal: Math.round(finalTotal),
      finalTotalInvested: Math.round(finalTotalInvested),
      finalInterest: Math.round(finalInterest),
      inflationAdjustedTotal: Math.round(inflationAdjustedTotal),
      doublingYears,
      yearlyBreakdown,
      totalDeposits: accumulatedDeposits
    };
  }, [
    initialPrincipal,
    periodicDeposit,
    depositFrequency,
    depositTiming,
    annualRate,
    years,
    compoundFrequency,
    adjustInflation,
    inflationRate
  ]);

  const pieData = [
    { name: 'Initial Principal', value: initialPrincipal, color: '#6366f1' },
    { name: 'Regular Deposits', value: calculation.totalDeposits, color: '#06b6d4' },
    { name: 'Compound Interest', value: calculation.finalInterest, color: '#10b981' },
  ].filter(item => item.value > 0);

  const handleCopySummary = () => {
    const text = `💰 Compound Interest Wealth Forecast:\n• Horizon: ${years} Years at ${annualRate}% p.a.\n• Total Invested: ${formatCurrency(calculation.finalTotalInvested, currency)}\n• Compound Interest Gained: ${formatCurrency(calculation.finalInterest, currency)}\n• Final Wealth Corpus: ${formatCurrency(calculation.finalTotal, currency)}${adjustInflation ? ` (Real Purchasing Power: ${formatCurrency(calculation.inflationAdjustedTotal, currency)})` : ''}\n• Rule of 72 Doubling Time: ~${calculation.doublingYears} Years`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Exponential Compound Interest Engine
          </h3>
          <p className="text-xs text-slate-500">
            Calculate long-term wealth compounding with systematic periodic contributions & inflation adjustment.
          </p>
        </div>

        {/* Currency Switcher */}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
        >
          {Object.keys(CURRENCIES).map((c) => (
            <option key={c} value={c}>
              {CURRENCIES[c as CurrencyCode].name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
          {/* Initial Principal */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              <span>Initial Principal Investment</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                {formatCurrency(initialPrincipal, currency)}
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              value={initialPrincipal || ''}
              onChange={(e) => setInitialPrincipal(Number(e.target.value))}
              placeholder="e.g. 100000"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-lg"
            />
          </div>

          {/* Periodic Contribution */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Regular Additional Contribution
              </span>
              <div className="flex gap-1">
                {(['monthly', 'quarterly', 'annually', 'none'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setDepositFrequency(freq)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                      depositFrequency === freq
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {depositFrequency !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    Deposit Amount ({CURRENCIES[currency]?.symbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={periodicDeposit || ''}
                    onChange={(e) => setPeriodicDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    Deposit Made At
                  </label>
                  <select
                    value={depositTiming}
                    onChange={(e) => setDepositTiming(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs"
                  >
                    <option value="beginning">Beginning of Period</option>
                    <option value="end">End of Period</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Rate & Horizon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Annual Return (%)</span>
                <span className="font-mono text-emerald-600">{annualRate}% p.a.</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={annualRate || ''}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Investment Horizon</span>
                <span className="font-mono text-indigo-600">{years} Years</span>
              </div>
              <input
                type="number"
                min="1"
                max="50"
                value={years || ''}
                onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          {/* Compounding Frequency & Inflation Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Compounding Frequency
              </label>
              <select
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none cursor-pointer"
              >
                <option value={12}>Monthly (12x/year - Standard SIP)</option>
                <option value={4}>Quarterly (4x/year - Bank FD)</option>
                <option value={2}>Semi-Annually (2x/year)</option>
                <option value={1}>Annually (1x/year)</option>
                <option value={365}>Daily (365x/year)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Adjust for Inflation?
                </span>
                <input
                  type="checkbox"
                  checked={adjustInflation}
                  onChange={(e) => setAdjustInflation(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
              {adjustInflation && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="25"
                    step="0.5"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-20 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-xs text-slate-500 font-bold">% Inflation/year</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl border border-emerald-800/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Projected Maturity Corpus
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
                {years} Yr Wealth
              </span>
            </div>

            {/* Total Corpus */}
            <div className="space-y-1 mb-6">
              <span className="text-xs text-slate-400 font-medium">Future Expected Value:</span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                {formatCurrency(calculation.finalTotal, currency)}
              </div>
              <div className="text-xs text-slate-400 font-mono pt-1">
                {formatNumberWords(calculation.finalTotal, currency)}
              </div>
            </div>

            {/* Breakdown Highlights */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2.5 mb-6 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Invested Capital:</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(calculation.finalTotalInvested, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-300 font-bold">Total Compound Interest Earned:</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{formatCurrency(calculation.finalInterest, currency)}
                </span>
              </div>
              {adjustInflation && (
                <div className="flex justify-between items-center text-xs text-amber-300 pt-2 border-t border-white/10">
                  <span>Inflation Adjusted Power ({inflationRate}%):</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(calculation.inflationAdjustedTotal, currency)}
                  </span>
                </div>
              )}
            </div>

            {/* Rule of 72 Badge */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs mb-4">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" /> Rule of 72 Doubling Time:
              </span>
              <span className="font-bold text-amber-300 font-mono">
                ~{calculation.doublingYears} Years
              </span>
            </div>

            <button
              onClick={handleCopySummary}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
              <span>{copied ? 'Copied Forecast!' : 'Copy Wealth Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Growth Area Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" /> Compound Wealth Trajectory (Invested vs Interest)
        </h3>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calculation.yearlyBreakdown}>
              <defs>
                <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => formatCurrency(v, currency, true)} />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val) || 0, currency)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="totalBalance" name="Total Corpus" stroke="#10b981" fillOpacity={1} fill="url(#interestGrad)" />
              <Area type="monotone" dataKey="principalInvested" name="Invested Capital" stroke="#6366f1" fillOpacity={1} fill="url(#investedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
