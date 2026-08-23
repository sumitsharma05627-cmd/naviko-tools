import React, { useState, useMemo } from 'react';
import { TrendingDown, Copy, Check, ShieldAlert, Sparkles, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const InflationCalculator: React.FC = () => {
  const [currentAmount, setCurrentAmount] = useState<number>(100000);
  const [inflationRate, setInflationRate] = useState<number>(6.0);
  const [years, setYears] = useState<number>(10);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const futureCost = currentAmount * Math.pow(1 + inflationRate / 100, years);
    const purchasingPowerToday = currentAmount / Math.pow(1 + inflationRate / 100, years);
    const valueLost = currentAmount - purchasingPowerToday;
    const lossPercentage = ((valueLost / currentAmount) * 100).toFixed(1);

    const yearlyData: { year: number; futureCost: number; purchasingPower: number }[] = [];
    for (let y = 0; y <= years; y++) {
      yearlyData.push({
        year: y,
        futureCost: Math.round(currentAmount * Math.pow(1 + inflationRate / 100, y)),
        purchasingPower: Math.round(currentAmount / Math.pow(1 + inflationRate / 100, y)),
      });
    }

    return {
      futureCost: Math.round(futureCost),
      purchasingPowerToday: Math.round(purchasingPowerToday),
      valueLost: Math.round(valueLost),
      lossPercentage,
      yearlyData,
    };
  }, [currentAmount, inflationRate, years]);

  const handleCopy = () => {
    const text = `📉 NAVIKO Inflation Impact & Purchasing Power Analysis
-------------------------------------------------------
Present Amount: ${formatCurrency(currentAmount, currency)}
Annual Inflation: ${inflationRate}% p.a.
Horizon: ${years} Years

1. What costs ${formatCurrency(currentAmount, currency)} today will cost: ${formatCurrency(stats.futureCost, currency)} in ${years} years!
2. Keeping ${formatCurrency(currentAmount, currency)} in uninvested cash will only have the purchasing power of: ${formatCurrency(stats.purchasingPowerToday, currency)} (${stats.lossPercentage}% value eroded).

Calculated on: https://naviko.in/tools/inflation-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Inflation &amp; Purchasing Power Erosion Calculator
          </span>
        </div>
        <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === c ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
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
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Current Amount / Goal Value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  min="1000"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(Math.max(0, Number(e.target.value)))}
                  className="w-40 pl-8 pr-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="2000000"
              step="5000"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-[11px] text-slate-500 font-medium">
              In words: <span className="font-semibold text-slate-700">{formatNumberWords(currentAmount, currency)}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Average Annual Inflation Rate (% p.a.)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="25"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">%</span>
              </div>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Low (3-4% US/EU)</span>
              <span className="font-bold text-rose-600">India Avg (~6-7%)</span>
              <span>High (8-10%+)</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Time Horizon (Years)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Math.min(50, Number(e.target.value))))}
                  className="w-24 px-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">Yr</span>
              </div>
            </div>
            <div className="flex gap-2">
              {[3, 5, 10, 15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setYears(yr)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                    years === yr ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {yr}Y
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 text-white shadow-xl border border-rose-900/50 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Future Cost of {formatCurrency(currentAmount, currency)}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                In {years} Years
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {formatCurrency(stats.futureCost, currency)}
              </div>
              <div className="text-xs text-rose-200/80 font-medium mt-1">
                You will need {formatCurrency(stats.futureCost, currency)} to buy what costs {formatCurrency(currentAmount, currency)} today.
              </div>
            </div>

            {/* Erosion split */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Purchasing Power in Uninvested Cash:</div>
              <div className="text-xl font-bold text-amber-300 font-mono">
                {formatCurrency(stats.purchasingPowerToday, currency)}
                <span className="text-xs text-slate-400 font-normal font-sans ml-1">(-{stats.lossPercentage}% lost)</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Inflation Insight'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
