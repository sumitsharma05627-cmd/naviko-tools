import React, { useState } from 'react';
import { Copy, Check, RotateCcw, ArrowRight, Percent, TrendingUp, TrendingDown, Divide } from 'lucide-react';

type Mode = 'percent_of' | 'is_what_percent' | 'percent_increase' | 'percent_decrease' | 'percent_diff';

export const PercentageCalculator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('percent_of');
  const [val1, setVal1] = useState<string>('20');
  const [val2, setVal2] = useState<string>('150');
  const [copied, setCopied] = useState<boolean>(false);

  const num1 = parseFloat(val1);
  const num2 = parseFloat(val2);

  let result: number | null = null;
  let formulaText = '';
  let explanation = '';

  const isValid = !isNaN(num1) && !isNaN(num2);

  if (isValid) {
    switch (mode) {
      case 'percent_of':
        // X% of Y
        result = (num1 / 100) * num2;
        formulaText = `(${num1} / 100) × ${num2}`;
        explanation = `${num1}% of ${num2} is ${result.toLocaleString(undefined, { maximumFractionDigits: 4 })}.`;
        break;
      case 'is_what_percent':
        // X is what % of Y
        if (num2 !== 0) {
          result = (num1 / num2) * 100;
          formulaText = `(${num1} / ${num2}) × 100`;
          explanation = `${num1} is ${result.toLocaleString(undefined, { maximumFractionDigits: 4 })}% of ${num2}.`;
        } else {
          explanation = 'Cannot divide by zero.';
        }
        break;
      case 'percent_increase':
        // % increase from X to Y
        if (num1 !== 0) {
          result = ((num2 - num1) / Math.abs(num1)) * 100;
          formulaText = `((${num2} - ${num1}) / |${num1}|) × 100`;
          explanation = `Increasing from ${num1} to ${num2} is a ${result >= 0 ? '+' : ''}${result.toLocaleString(undefined, { maximumFractionDigits: 4 })}% change.`;
        } else {
          explanation = 'Original value cannot be zero for percent increase.';
        }
        break;
      case 'percent_decrease':
        // % decrease from X to Y
        if (num1 !== 0) {
          result = ((num1 - num2) / Math.abs(num1)) * 100;
          formulaText = `((${num1} - ${num2}) / |${num1}|) × 100`;
          explanation = `Decreasing from ${num1} to ${num2} is a ${result.toLocaleString(undefined, { maximumFractionDigits: 4 })}% reduction.`;
        } else {
          explanation = 'Original value cannot be zero for percent decrease.';
        }
        break;
      case 'percent_diff':
        // % difference between X and Y
        const avg = (num1 + num2) / 2;
        if (avg !== 0) {
          result = (Math.abs(num1 - num2) / Math.abs(avg)) * 100;
          formulaText = `(|${num1} - ${num2}| / |(${num1} + ${num2})/2|) × 100`;
          explanation = `The percentage difference between ${num1} and ${num2} is ${result.toLocaleString(undefined, { maximumFractionDigits: 4 })}%.`;
        } else {
          explanation = 'Average cannot be zero.';
        }
        break;
    }
  }

  const handleCopy = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setVal1('');
    setVal2('');
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 bg-slate-100/90 rounded-xl">
        <button
          onClick={() => { setMode('percent_of'); setVal1('20'); setVal2('150'); }}
          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mode === 'percent_of'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>X% of Y</span>
        </button>

        <button
          onClick={() => { setMode('is_what_percent'); setVal1('30'); setVal2('150'); }}
          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mode === 'is_what_percent'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Divide className="w-3.5 h-3.5" />
          <span>X is what % of Y</span>
        </button>

        <button
          onClick={() => { setMode('percent_increase'); setVal1('100'); setVal2('125'); }}
          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mode === 'percent_increase'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>% Increase</span>
        </button>

        <button
          onClick={() => { setMode('percent_decrease'); setVal1('150'); setVal2('120'); }}
          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mode === 'percent_decrease'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          <span>% Decrease</span>
        </button>

        <button
          onClick={() => { setMode('percent_diff'); setVal1('80'); setVal2('100'); }}
          className={`col-span-2 sm:col-span-1 px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mode === 'percent_diff'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>% Difference</span>
        </button>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-100">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            {mode === 'percent_of' && 'Percentage (X %)'}
            {mode === 'is_what_percent' && 'Part Value (X)'}
            {mode === 'percent_increase' && 'Original Value (From)'}
            {mode === 'percent_decrease' && 'Original Price / Value (From)'}
            {mode === 'percent_diff' && 'First Value (X)'}
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              placeholder="Enter number..."
              className="w-full text-base font-semibold px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-slate-900 shadow-xs"
            />
            {mode === 'percent_of' && (
              <span className="absolute right-4 top-3 text-slate-400 font-bold">%</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            {mode === 'percent_of' && 'Total / Base Number (Y)'}
            {mode === 'is_what_percent' && 'Total / Whole Value (Y)'}
            {mode === 'percent_increase' && 'New Increased Value (To)'}
            {mode === 'percent_decrease' && 'New Discounted Value (To)'}
            {mode === 'percent_diff' && 'Second Value (Y)'}
          </label>
          <input
            type="number"
            step="any"
            value={val2}
            onChange={(e) => setVal2(e.target.value)}
            placeholder="Enter number..."
            className="w-full text-base font-semibold px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-slate-900 shadow-xs"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear Values
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={result === null}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Result'}
          </button>
        </div>
      </div>

      {/* Result Display Box */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-1">
              Calculated Result
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
              {result !== null ? (
                <>
                  <span>{result.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                  {mode !== 'percent_of' && <span className="text-xl text-indigo-300 font-bold">%</span>}
                </>
              ) : (
                <span className="text-slate-400 text-2xl font-normal">Enter valid numbers</span>
              )}
            </div>
            {explanation && (
              <p className="text-xs sm:text-sm text-indigo-100/90 mt-2 font-medium">
                {explanation}
              </p>
            )}
          </div>

          {formulaText && (
            <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/10 text-right sm:text-left self-start sm:self-auto">
              <div className="text-[10px] text-indigo-200 uppercase tracking-wider font-mono">Formula breakdown</div>
              <div className="font-mono text-xs sm:text-sm text-white font-medium mt-0.5">
                {formulaText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
