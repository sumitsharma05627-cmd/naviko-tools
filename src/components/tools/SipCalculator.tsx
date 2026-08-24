import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Copy, Check, Sparkles, PieChart as PieIcon, 
  Table as TableIcon, Zap, DollarSign, RefreshCw, Info, Calendar 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import confetti from 'canvas-confetti';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const SipCalculator: React.FC = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [expectedRate, setExpectedRate] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  const [investmentTiming, setInvestmentTiming] = useState<'end' | 'beginning'>('end');
  const [stepUpPercent, setStepUpPercent] = useState<number>(0);
  const [adjustInflation, setAdjustInflation] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');
  const [copied, setCopied] = useState(false);

  // Quick preset amounts
  const presets = [
    { label: '₹1k/mo (Beginner)', value: 1000 },
    { label: '₹5k/mo (Popular)', value: 5000 },
    { label: '₹10k/mo (Pro)', value: 10000 },
    { label: '₹25k/mo (Aggressive)', value: 25000 },
    { label: '₹50k/mo (Wealth)', value: 50000 },
  ];

  // SIP Calculation
  const calculation = useMemo(() => {
    let totalInvested = 0;
    let maturityValue = 0;
    const yearlyBreakdown: {
      year: number;
      investedThisYear: number;
      totalInvested: number;
      wealthGain: number;
      futureValue: number;
      realValue: number;
    }[] = [];

    const monthlyRate = expectedRate / 12 / 100;
    let currentMonthlySIP = monthlyInvestment;

    for (let y = 1; y <= years; y++) {
      const yearInvestment = currentMonthlySIP * 12;
      totalInvested += yearInvestment;

      // Compound calculation month by month for accuracy with optional step-up
      // Ordinary annuity (End of month): balance compounds, then deposit added
      // Annuity due (Beginning of month): deposit added first, then whole balance compounds
      for (let m = 1; m <= 12; m++) {
        if (investmentTiming === 'beginning') {
          maturityValue = (maturityValue + currentMonthlySIP) * (1 + monthlyRate);
        } else {
          maturityValue = maturityValue * (1 + monthlyRate) + currentMonthlySIP;
        }
      }

      // Inflation adjustment
      const realValue = maturityValue / Math.pow(1 + inflationRate / 100, y);

      const roundedInvested = Math.round(totalInvested);
      const roundedFuture = Math.round(adjustInflation ? realValue : maturityValue);
      const roundedGain = Math.max(0, roundedFuture - roundedInvested);

      yearlyBreakdown.push({
        year: y,
        investedThisYear: Math.round(yearInvestment),
        totalInvested: roundedInvested,
        wealthGain: roundedGain,
        futureValue: roundedFuture,
        realValue: Math.round(realValue),
      });

      // Apply annual step-up if enabled
      if (stepUpPercent > 0) {
        currentMonthlySIP = currentMonthlySIP * (1 + stepUpPercent / 100);
      }
    }

    const lastRow = yearlyBreakdown[yearlyBreakdown.length - 1];
    const finalInvested = lastRow ? lastRow.totalInvested : Math.round(totalInvested);
    const finalMaturity = lastRow ? lastRow.futureValue : Math.round(maturityValue);
    const estReturns = lastRow ? lastRow.wealthGain : Math.max(0, finalMaturity - finalInvested);
    const returnsPercentage = finalInvested > 0 ? ((estReturns / finalInvested) * 100).toFixed(1) : '0';

    return {
      totalInvested: finalInvested,
      estReturns,
      maturityValue: finalMaturity,
      returnsPercentage,
      yearlyBreakdown,
    };
  }, [monthlyInvestment, expectedRate, years, investmentTiming, stepUpPercent, adjustInflation, inflationRate]);

  // Trigger celebration on high milestones
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6']
    });
  };

  const handleCopySummary = () => {
    const text = `💰 NAVIKO SIP Investment Summary
--------------------------------
Monthly SIP: ${formatCurrency(monthlyInvestment, currency)}
Expected Return Rate: ${expectedRate}% p.a.
Duration: ${years} Years ${stepUpPercent > 0 ? `(Step-up: ${stepUpPercent}%/yr)` : ''}
Investment Timing: ${investmentTiming === 'end' ? 'End of month (Standard)' : 'Beginning of month'}
Total Invested: ${formatCurrency(calculation.totalInvested, currency)}
Est. Wealth Gained: ${formatCurrency(calculation.estReturns, currency)} (+${calculation.returnsPercentage}%)
Total Future Value: ${formatCurrency(calculation.maturityValue, currency)}
${adjustInflation ? `(Adjusted for ${inflationRate}% annual inflation)` : ''}

Calculation method: Monthly SIP with monthly compounding. SIP contributions are assumed to be made at the ${investmentTiming === 'end' ? 'end' : 'beginning'} of each month. Returns shown are estimates and actual investment returns may vary.
Illustration only. This calculator does not guarantee investment returns.
Calculated on: https://naviko.in/tools/sip-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerConfetti();
    setTimeout(() => setCopied(false), 2500);
  };

  const pieData = [
    { name: 'Total Invested', value: calculation.totalInvested, color: '#6366f1' },
    { name: 'Estimated Returns', value: calculation.estReturns, color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Bar: Currency & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-900 text-white rounded-2xl shadow-sm border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Smart SIP Compounding Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Currency:</span>
          <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currency === c
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {CURRENCIES[c].symbol} {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs + Output Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Monthly Investment */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>Monthly Investment</span>
                <span className="text-xs font-normal text-slate-500">({CURRENCIES[currency].symbol}/month)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  min="100"
                  max="1000000"
                  step="500"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Math.max(0, Number(e.target.value)))}
                  className="w-36 pl-8 pr-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setMonthlyInvestment(p.value)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                    monthlyInvestment === p.value
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              In words: <span className="font-semibold text-slate-700">{formatNumberWords(monthlyInvestment, currency) || 'Zero'} per month</span>
            </div>
          </div>

          {/* Expected Return Rate (% p.a.) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>Expected Annual Return Rate</span>
                <span className="text-xs font-normal text-slate-500">(CAGR %)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="40"
                  step="0.5"
                  value={expectedRate}
                  onChange={(e) => setExpectedRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                  %
                </span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedRate}
              onChange={(e) => setExpectedRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Conservative (8-10% Debt/Hybrid)</span>
              <span className="font-bold text-emerald-600">Nifty/Index (~12-14%)</span>
              <span>Mid/Small Cap (15-18%+)</span>
            </div>
          </div>

          {/* Investment Time Period (Years) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>Investment Horizon</span>
                <span className="text-xs font-normal text-slate-500">(Years)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Math.min(50, Number(e.target.value))))}
                  className="w-24 px-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                  Yr
                </span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <div className="flex gap-2">
              {[3, 5, 10, 15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setYears(yr)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                    years === yr
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {yr}Y
                </button>
              ))}
            </div>
          </div>

          {/* Investment Timing Setting */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Investment timing</span>
              </label>
              <span className="text-xs text-slate-500 font-medium">
                {investmentTiming === 'end' ? 'Ordinary Annuity' : 'Annuity Due'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInvestmentTiming('end')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-0.5 cursor-pointer ${
                  investmentTiming === 'end'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs ring-1 ring-indigo-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span>End of month</span>
                  {investmentTiming === 'end' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </span>
                <span className="text-[11px] font-normal text-slate-500">(Standard)</span>
              </button>
              <button
                type="button"
                onClick={() => setInvestmentTiming('beginning')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-0.5 cursor-pointer ${
                  investmentTiming === 'beginning'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs ring-1 ring-indigo-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span>Beginning of month</span>
                  {investmentTiming === 'beginning' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </span>
                <span className="text-[11px] font-normal text-slate-500">(Compounded)</span>
              </button>
            </div>
          </div>

          {/* Advanced Options: Step-Up SIP & Inflation Adjust */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Gen Z Wealth Boosters (Pro Features)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Step Up SIP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Annual Step-Up (%/yr)</span>
                  <span className="text-xs font-mono font-bold text-amber-400">+{stepUpPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="5"
                  value={stepUpPercent}
                  onChange={(e) => setStepUpPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <p className="text-[10px] text-slate-400 leading-tight">
                  Automatically increases SIP amount as your career salary grows.
                </p>
              </div>

              {/* Inflation Adjustment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adjustInflation}
                      onChange={(e) => setAdjustInflation(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Adjust for Inflation</span>
                  </label>
                  {adjustInflation && (
                    <span className="text-xs font-mono font-bold text-indigo-300">{inflationRate}%</span>
                  )}
                </div>
                {adjustInflation && (
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="0.5"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                )}
                <p className="text-[10px] text-slate-400 leading-tight">
                  Shows the real purchasing power value of your future wealth.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Results & Visual Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Big Future Value Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Total Future Maturity Value
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  +{calculation.returnsPercentage}% Gain
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-mono">
                  {formatCurrency(calculation.maturityValue, currency)}
                </div>
                <div className="text-xs text-indigo-200/80 font-medium mt-1">
                  ≈ {formatNumberWords(calculation.maturityValue, currency)} in {years} years
                </div>
              </div>

              {/* Split Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-indigo-800/60">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[11px] font-medium text-slate-300">Total Invested</div>
                  <div className="text-lg font-bold text-indigo-200 font-mono mt-0.5">
                    {formatCurrency(calculation.totalInvested, currency)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[11px] font-medium text-emerald-300">Wealth Gained</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    +{formatCurrency(calculation.estReturns, currency)}
                  </div>
                </div>
              </div>

              {/* Copy & Share Action */}
              <button
                onClick={handleCopySummary}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Summary Copied to Clipboard!' : 'Copy Investment Summary'}</span>
              </button>
            </div>
          </div>

          {/* Donut Ratio Mini Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Capital vs Wealth Split
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 shrink-0"></span>
                  <span className="text-slate-600">Invested: </span>
                  <span className="font-bold text-slate-900">
                    {((calculation.totalInvested / calculation.maturityValue) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-600">Gains: </span>
                  <span className="font-bold text-emerald-600">
                    {((calculation.estReturns / calculation.maturityValue) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="w-24 h-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calculation Method Note & Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-600 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px] sm:text-xs">
                <strong>Calculation method:</strong> Monthly SIP with monthly compounding. SIP contributions are assumed to be made at the {investmentTiming === 'end' ? 'end' : 'beginning'} of each month. Returns shown are estimates and actual investment returns may vary.
              </p>
            </div>
            <p className="text-[10.5px] text-slate-500 italic pl-6.5">
              Illustration only. This calculator does not guarantee investment returns.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Growth Chart & Year-wise Schedule */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Wealth Growth Trajectory</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Watch exponential compounding turn regular monthly savings into substantial wealth.
            </p>
          </div>

          {/* Toggle View */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveView('chart')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'chart'
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Growth Chart</span>
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'table'
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Year-by-Year Schedule</span>
            </button>
          </div>
        </div>

        {/* Chart View */}
        {activeView === 'chart' ? (
          <div className="h-72 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calculation.yearlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMaturity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="year" 
                  tickFormatter={(val) => `Yr ${val}`}
                  stroke="#94a3b8" 
                  fontSize={11} 
                />
                <YAxis 
                  tickFormatter={(val) => formatCurrency(val, currency, true)}
                  stroke="#94a3b8" 
                  fontSize={11}
                  width={65}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value), currency), '']}
                  labelFormatter={(label) => `Year ${label}`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: '1px solid #334155',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="futureValue" 
                  name="Total Future Value" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorMaturity)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="totalInvested" 
                  name="Invested Amount" 
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorInvested)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold sticky top-0">
                <tr>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Invested (Annual)</th>
                  <th className="py-3 px-4">Total Invested</th>
                  <th className="py-3 px-4">Est. Returns</th>
                  <th className="py-3 px-4 text-right">Closing Wealth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                {calculation.yearlyBreakdown.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900 font-sans">Year {row.year}</td>
                    <td className="py-2.5 px-4">{formatCurrency(row.investedThisYear, currency)}</td>
                    <td className="py-2.5 px-4 font-semibold text-indigo-700">{formatCurrency(row.totalInvested, currency)}</td>
                    <td className="py-2.5 px-4 text-emerald-600 font-semibold">+{formatCurrency(row.wealthGain, currency)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatCurrency(row.futureValue, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
