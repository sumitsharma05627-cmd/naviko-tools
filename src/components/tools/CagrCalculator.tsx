import React, { useState, useMemo } from 'react';
import { TrendingUp, Copy, Check, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const CagrCalculator: React.FC = () => {
  const [initialValue, setInitialValue] = useState<number>(100000);
  const [finalValue, setFinalValue] = useState<number>(250000);
  const [years, setYears] = useState<number>(5);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (initialValue <= 0 || finalValue <= 0 || years <= 0) {
      return { cagr: '0.00', absoluteReturn: '0.00', multiplier: '1.00', totalGain: 0 };
    }
    // CAGR formula: ((Final / Initial) ^ (1 / years)) - 1
    const cagrVal = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
    const absoluteReturn = ((finalValue - initialValue) / initialValue) * 100;
    const multiplier = finalValue / initialValue;
    const totalGain = finalValue - initialValue;

    return {
      cagr: cagrVal.toFixed(2),
      absoluteReturn: absoluteReturn.toFixed(2),
      multiplier: multiplier.toFixed(2),
      totalGain: Math.round(totalGain),
    };
  }, [initialValue, finalValue, years]);

  const handleCopy = () => {
    const text = `📊 NAVIKO CAGR Investment Returns Analysis
--------------------------------------------
Initial Investment: ${formatCurrency(initialValue, currency)}
Final Value: ${formatCurrency(finalValue, currency)}
Duration: ${years} Years
Compound Annual Growth Rate (CAGR): ${result.cagr}% p.a.
Total Absolute Return: ${result.absoluteReturn}% (${result.multiplier}x Multiplier)
Net Profit: ${formatCurrency(result.totalGain, currency)}
Calculated on: https://naviko.in/tools/cagr-calculator`;

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
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            CAGR (Compound Annual Growth Rate) Calculator
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
        {/* Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Initial Investment Value (Start)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  min="100"
                  value={initialValue}
                  onChange={(e) => setInitialValue(Math.max(0, Number(e.target.value)))}
                  className="w-40 pl-8 pr-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max="2000000"
              step="5000"
              value={initialValue}
              onChange={(e) => setInitialValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Final Investment Value (End)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  min="100"
                  value={finalValue}
                  onChange={(e) => setFinalValue(Math.max(0, Number(e.target.value)))}
                  className="w-40 pl-8 pr-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max="5000000"
              step="5000"
              value={finalValue}
              onChange={(e) => setFinalValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Time Duration (Years)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.5"
                  value={years}
                  onChange={(e) => setYears(Math.max(0.1, Number(e.target.value)))}
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
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl border border-indigo-800/50 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Compound Annual Growth Rate
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {result.multiplier}x Multiplier
              </span>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono">
                {result.cagr}%
                <span className="text-sm text-slate-400 font-sans font-normal ml-1.5">CAGR p.a.</span>
              </div>
              <div className="text-xs text-indigo-200/80 font-medium mt-1">
                Total Absolute Growth: +{result.absoluteReturn}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-indigo-800/60">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-medium text-slate-300">Net Profit</div>
                <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">
                  +{formatCurrency(result.totalGain, currency)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-medium text-slate-300">Growth Multiple</div>
                <div className="text-base font-bold text-indigo-200 font-mono mt-0.5">
                  {result.multiplier}x Initial
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy CAGR Analysis'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
