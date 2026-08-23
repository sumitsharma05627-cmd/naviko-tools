import React, { useState, useMemo } from 'react';
import { Flame, Copy, Check, ShieldCheck, Zap, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const FireCalculator: React.FC = () => {
  const [currentAge, setCurrentAge] = useState<number>(24);
  const [targetRetireAge, setTargetRetireAge] = useState<number>(45);
  const [currentMonthlyExpenses, setCurrentMonthlyExpenses] = useState<number>(40000);
  const [existingSavings, setExistingSavings] = useState<number>(200000);
  const [expectedInflation, setExpectedInflation] = useState<number>(6.0);
  const [preRetireReturn, setPreRetireReturn] = useState<number>(12.0); // Equity SIP return
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(4.0); // 4% rule standard (25x rule)
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [copied, setCopied] = useState(false);

  const yearsToRetire = Math.max(1, targetRetireAge - currentAge);

  const fireStats = useMemo(() => {
    // Annual Expenses today
    const annualExpensesToday = currentMonthlyExpenses * 12;

    // Future Annual Expenses at retirement age (inflated)
    const inflatedAnnualExpenses = annualExpensesToday * Math.pow(1 + expectedInflation / 100, yearsToRetire);
    const inflatedMonthlyExpenses = Math.round(inflatedAnnualExpenses / 12);

    // Standard FIRE Target Corpus: 25x (or 100 / SWR) of inflated annual expenses
    const standardFireMultiplier = 100 / safeWithdrawalRate;
    const standardFireCorpus = Math.round(inflatedAnnualExpenses * standardFireMultiplier);

    // Lean FIRE: 20x (75% expenses)
    const leanFireCorpus = Math.round(standardFireCorpus * 0.75);

    // Fat FIRE: 35x (140% luxury lifestyle)
    const fatFireCorpus = Math.round(standardFireCorpus * 1.40);

    // Future Value of existing savings
    const fvExistingSavings = existingSavings * Math.pow(1 + preRetireReturn / 100, yearsToRetire);

    // Additional Corpus needed
    const additionalCorpusNeeded = Math.max(0, standardFireCorpus - fvExistingSavings);

    // Monthly SIP required to achieve standard FIRE corpus:
    // FV = P * [ ((1+r)^n - 1) / r ] * (1+r)
    const monthlyRate = preRetireReturn / 12 / 100;
    const totalMonths = yearsToRetire * 12;
    const sipFactor = ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    const requiredMonthlySIP = Math.round(additionalCorpusNeeded / (sipFactor || 1));

    return {
      inflatedMonthlyExpenses,
      inflatedAnnualExpenses: Math.round(inflatedAnnualExpenses),
      standardFireCorpus,
      leanFireCorpus,
      fatFireCorpus,
      requiredMonthlySIP,
      fvExistingSavings: Math.round(fvExistingSavings),
      yearsToRetire,
    };
  }, [currentAge, targetRetireAge, currentMonthlyExpenses, existingSavings, expectedInflation, preRetireReturn, safeWithdrawalRate, yearsToRetire]);

  const handleCopy = () => {
    const text = `🔥 NAVIKO FIRE (Financial Independence Retire Early) Blueprint
------------------------------------------------------------
Current Age: ${currentAge} | Target Retirement Age: ${targetRetireAge} (${yearsToRetire} Years to Freedom)
Monthly Expenses Today: ${formatCurrency(currentMonthlyExpenses, currency)}
Monthly Expenses at Age ${targetRetireAge} (with ${expectedInflation}% inflation): ${formatCurrency(fireStats.inflatedMonthlyExpenses, currency)}/mo

🎯 TARGET FIRE CORPUS NUMBERS:
- Standard FIRE (4% Rule): ${formatCurrency(fireStats.standardFireCorpus, currency)}
- Lean FIRE (Minimalist): ${formatCurrency(fireStats.leanFireCorpus, currency)}
- Fat FIRE (Luxury Freedom): ${formatCurrency(fireStats.fatFireCorpus, currency)}

🚀 Monthly SIP Investment Needed: ${formatCurrency(fireStats.requiredMonthlySIP, currency)}/month
Calculated on: https://naviko.in/tools/fire-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-gradient-to-r from-orange-950 via-slate-900 to-slate-900 text-white rounded-2xl border border-orange-900/40">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-orange-300">
            FIRE (Financial Independence Retire Early) Planner
          </span>
        </div>
        <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === c ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {CURRENCIES[c].symbol} {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Age Sliders */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Age &amp; Retirement Horizon
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Current Age</span>
                  <span className="text-indigo-600 font-mono">{currentAge} Years</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Target Freedom Age</span>
                  <span className="text-orange-600 font-mono">{targetRetireAge} Years</span>
                </div>
                <input
                  type="range"
                  min={currentAge + 1}
                  max="70"
                  value={targetRetireAge}
                  onChange={(e) => setTargetRetireAge(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
              </div>
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              ⏱️ You have <strong>{yearsToRetire} years</strong> to build your financial freedom corpus.
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Current Monthly Living Expenses</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  min="5000"
                  value={currentMonthlyExpenses}
                  onChange={(e) => setCurrentMonthlyExpenses(Math.max(0, Number(e.target.value)))}
                  className="w-36 pl-8 pr-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="250000"
              step="5000"
              value={currentMonthlyExpenses}
              onChange={(e) => setCurrentMonthlyExpenses(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-[11px] text-slate-500">
              In words: <span className="font-semibold text-slate-700">{formatNumberWords(currentMonthlyExpenses, currency)} / month</span>
            </div>
          </div>

          {/* Existing Savings & Return Rates */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Existing Net Savings</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    {CURRENCIES[currency].symbol}
                  </span>
                  <input
                    type="number"
                    value={existingSavings}
                    onChange={(e) => setExistingSavings(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-1.5 text-right font-mono font-bold text-sm bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Expected Inflation (%/yr)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={expectedInflation}
                    onChange={(e) => setExpectedInflation(Number(e.target.value))}
                    className="w-full pr-7 pl-3 py-1.5 text-right font-mono font-bold text-sm bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main FIRE Target Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-orange-950 via-slate-900 to-slate-950 text-white shadow-xl border border-orange-900/50 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-300">
                Standard FIRE Target Corpus
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                25x Rule (4% SWR)
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {formatCurrency(fireStats.standardFireCorpus, currency)}
              </div>
              <div className="text-xs text-orange-200/80 font-medium mt-1">
                ≈ {formatNumberWords(fireStats.standardFireCorpus, currency)} at age {targetRetireAge}
              </div>
            </div>

            {/* Monthly SIP Required Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/30 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Monthly SIP Savings Required from Today
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {formatCurrency(fireStats.requiredMonthlySIP, currency)}
                <span className="text-xs text-slate-400 font-sans font-normal ml-1">/month</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Assuming ~{preRetireReturn}% equity returns over {yearsToRetire} years.
              </div>
            </div>

            {/* Tiers Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">Lean FIRE (Frugal)</div>
                <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                  {formatCurrency(fireStats.leanFireCorpus, currency)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-orange-300 font-medium">Fat FIRE (Luxury)</div>
                <div className="text-sm font-bold text-orange-300 font-mono mt-0.5">
                  {formatCurrency(fireStats.fatFireCorpus, currency)}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'FIRE Blueprint Copied!' : 'Copy FIRE Blueprint'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
