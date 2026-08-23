import React, { useState, useMemo } from 'react';
import { TrendingUp, Copy, Check, DollarSign, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const LumpSumCalculator: React.FC = () => {
  const [totalInvestment, setTotalInvestment] = useState<number>(100000);
  const [expectedRate, setExpectedRate] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: '₹25,000', value: 25000 },
    { label: '₹50,000', value: 50000 },
    { label: '₹1,00,000', value: 100000 },
    { label: '₹5,00,000', value: 500000 },
    { label: '₹10,00,000', value: 1000000 },
  ];

  const calculation = useMemo(() => {
    const yearlyBreakdown: { year: number; invested: number; futureValue: number; gains: number }[] = [];
    const r = expectedRate / 100;

    for (let y = 1; y <= years; y++) {
      const fv = totalInvestment * Math.pow(1 + r, y);
      yearlyBreakdown.push({
        year: y,
        invested: totalInvestment,
        futureValue: Math.round(fv),
        gains: Math.round(fv - totalInvestment),
      });
    }

    const finalValue = Math.round(totalInvestment * Math.pow(1 + r, years));
    const totalGains = Math.round(finalValue - totalInvestment);
    const multiplier = totalInvestment > 0 ? (finalValue / totalInvestment).toFixed(2) : '1.0';
    const doublingYears = expectedRate > 0 ? (72 / expectedRate).toFixed(1) : 'N/A';

    return {
      finalValue,
      totalGains,
      multiplier,
      doublingYears,
      yearlyBreakdown,
    };
  }, [totalInvestment, expectedRate, years]);

  const handleCopy = () => {
    const text = `💎 NAVIKO Lump Sum Investment Calculation
-------------------------------------------
One-Time Principal: ${formatCurrency(totalInvestment, currency)}
Expected Return: ${expectedRate}% p.a.
Duration: ${years} Years
Total Wealth Gained: ${formatCurrency(calculation.totalGains, currency)}
Final Maturity Value: ${formatCurrency(calculation.finalValue, currency)} (${calculation.multiplier}x Multiplier)
Rule of 72: Money doubles every ~${calculation.doublingYears} years!
Calculated on: https://naviko.in/tools/lump-sum-calculator`;

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
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Lump Sum Compounding Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Currency:</span>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Total One-Time Investment</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  min="1000"
                  max="10000000"
                  step="5000"
                  value={totalInvestment}
                  onChange={(e) => setTotalInvestment(Math.max(0, Number(e.target.value)))}
                  className="w-40 pl-8 pr-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="5000"
              max="2500000"
              step="5000"
              value={totalInvestment}
              onChange={(e) => setTotalInvestment(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setTotalInvestment(p.value)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                    totalInvestment === p.value
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              In words: <span className="font-semibold text-slate-700">{formatNumberWords(totalInvestment, currency)}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Expected Annual Return Rate (p.a.)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="40"
                  step="0.5"
                  value={expectedRate}
                  onChange={(e) => setExpectedRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">%</span>
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
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex gap-2">
              {[3, 5, 10, 15, 20, 25].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setYears(yr)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                    years === yr
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl border border-indigo-800/50 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Future Maturity Value
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {calculation.multiplier}x Multiplier
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {formatCurrency(calculation.finalValue, currency)}
              </div>
              <div className="text-xs text-indigo-200/80 font-medium mt-1">
                ≈ {formatNumberWords(calculation.finalValue, currency)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-indigo-800/60">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-medium text-slate-300">Principal Invested</div>
                <div className="text-base font-bold text-indigo-200 font-mono mt-0.5">
                  {formatCurrency(totalInvestment, currency)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[11px] font-medium text-emerald-300">Total Profit Gained</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  +{formatCurrency(calculation.totalGains, currency)}
                </div>
              </div>
            </div>

            {/* Rule of 72 Insight */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Rule of 72:</strong> At {expectedRate}% CAGR, your money doubles every <strong>{calculation.doublingYears} years</strong>!
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compounding Chart */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>Lump Sum Exponential Growth Curve</span>
        </h3>
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calculation.yearlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLumpFv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} stroke="#94a3b8" fontSize={11} />
              <YAxis tickFormatter={(val) => formatCurrency(val, currency, true)} stroke="#94a3b8" fontSize={11} width={65} />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value), currency), '']}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: '1px solid #334155', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="futureValue" name="Compounded Value" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLumpFv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
