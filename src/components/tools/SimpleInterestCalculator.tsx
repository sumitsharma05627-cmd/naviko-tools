import React, { useState, useMemo } from 'react';
import { 
  Calculator, Percent, Copy, Check, Sparkles, 
  TrendingUp, Calendar, HelpCircle, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const SimpleInterestCalculator: React.FC = () => {
  const [solveTarget, setSolveTarget] = useState<'interest' | 'principal' | 'rate' | 'time'>('interest');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Input states
  const [principal, setPrincipal] = useState<number>(50000);
  const [rate, setRate] = useState<number>(8.5);
  const [timeValue, setTimeValue] = useState<number>(3);
  const [timeUnit, setTimeUnit] = useState<'years' | 'months' | 'days'>('years');
  const [targetInterest, setTargetInterest] = useState<number>(12750);

  const [copied, setCopied] = useState<boolean>(false);

  // Time normalized in years
  const timeInYears = useMemo(() => {
    if (timeUnit === 'years') return timeValue;
    if (timeUnit === 'months') return timeValue / 12;
    return timeValue / 365;
  }, [timeValue, timeUnit]);

  // Calculations
  const calcResults = useMemo(() => {
    const P = Math.max(0, principal);
    const R = Math.max(0, rate);
    const T = Math.max(0, timeInYears);
    const I = Math.max(0, targetInterest);

    if (solveTarget === 'interest') {
      const calculatedInterest = (P * R * T) / 100;
      const totalAmount = P + calculatedInterest;
      const compoundEquivalent = P * Math.pow(1 + R / 100, T) - P;
      const interestDifference = Math.max(0, compoundEquivalent - calculatedInterest);

      return {
        principal: P,
        rate: R,
        timeInYears: T,
        interest: calculatedInterest,
        totalAmount,
        interestDifference,
        compoundEquivalent
      };
    } else if (solveTarget === 'principal') {
      const calculatedPrincipal = R * T > 0 ? (I * 100) / (R * T) : 0;
      const totalAmount = calculatedPrincipal + I;
      return {
        principal: calculatedPrincipal,
        rate: R,
        timeInYears: T,
        interest: I,
        totalAmount,
        interestDifference: 0,
        compoundEquivalent: 0
      };
    } else if (solveTarget === 'rate') {
      const calculatedRate = P * T > 0 ? (I * 100) / (P * T) : 0;
      const totalAmount = P + I;
      return {
        principal: P,
        rate: calculatedRate,
        timeInYears: T,
        interest: I,
        totalAmount,
        interestDifference: 0,
        compoundEquivalent: 0
      };
    } else {
      const calculatedTime = P * R > 0 ? (I * 100) / (P * R) : 0;
      const totalAmount = P + I;
      return {
        principal: P,
        rate: R,
        timeInYears: calculatedTime,
        interest: I,
        totalAmount,
        interestDifference: 0,
        compoundEquivalent: 0
      };
    }
  }, [solveTarget, principal, rate, timeInYears, targetInterest]);

  // Year-by-Year Growth Table & Chart Data
  const growthSchedule = useMemo(() => {
    const P = calcResults.principal;
    const R = calcResults.rate;
    const duration = Math.min(30, Math.ceil(calcResults.timeInYears || 1));
    const annualInterest = (P * R) / 100;

    const data = [];
    for (let y = 0; y <= duration; y++) {
      const accumulatedInterest = annualInterest * y;
      const total = P + accumulatedInterest;
      data.push({
        year: `Yr ${y}`,
        Principal: Math.round(P),
        Interest: Math.round(accumulatedInterest),
        Total: Math.round(total)
      });
    }
    return data;
  }, [calcResults]);

  const handleCopySummary = () => {
    const text = `📈 Simple Interest Calculation:\n• Principal (P): ${formatCurrency(calcResults.principal, currency)}\n• Annual Rate (R): ${calcResults.rate.toFixed(2)}% p.a.\n• Time Period (T): ${calcResults.timeInYears.toFixed(2)} Years\n• Simple Interest Earned (SI): ${formatCurrency(calcResults.interest, currency)}\n• Total Maturity Value (A): ${formatCurrency(calcResults.totalAmount, currency)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Navigator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setSolveTarget('interest')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              solveTarget === 'interest'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Calculate Interest & Total
          </button>
          <button
            onClick={() => setSolveTarget('principal')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              solveTarget === 'principal'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Find Principal (P)
          </button>
          <button
            onClick={() => setSolveTarget('rate')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              solveTarget === 'rate'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Find Rate (R)
          </button>
          <button
            onClick={() => setSolveTarget('time')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              solveTarget === 'time'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Find Time (T)
          </button>
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
        {/* Input Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
          {/* Target: Principal Input */}
          {solveTarget !== 'principal' && (
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                <span>Principal Amount (P)</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  {formatCurrency(principal, currency)}
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={principal || ''}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                placeholder="e.g. 50000"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                {formatNumberWords(principal, currency)}
              </p>
            </div>
          )}

          {/* Target: Rate Input */}
          {solveTarget !== 'rate' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Annual Interest Rate (R % p.a.)</span>
                <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg font-mono font-bold">
                  {rate}% per year
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={rate || ''}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-lg"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[5, 6.5, 7, 8, 8.5, 9, 10, 12, 15].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      rate === r
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target: Time Period Input */}
          {solveTarget !== 'time' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Time Duration (T)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={timeValue || ''}
                    onChange={(e) => setTimeValue(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-lg"
                  />
                </div>
                <div className="sm:col-span-1">
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value as any)}
                    className="w-full h-full px-3 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                    <option value="days">Days (365)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Target: Desired Interest Input (when solving for P, R, or T) */}
          {solveTarget !== 'interest' && (
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                <span>Target Simple Interest Earned (SI)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {formatCurrency(targetInterest, currency)}
                </span>
              </label>
              <input
                type="number"
                min="0"
                value={targetInterest || ''}
                onChange={(e) => setTargetInterest(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-lg"
              />
            </div>
          )}

          {/* Mathematical Working / Formula Step */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" /> Step-by-Step Formula:
            </h4>
            <div className="font-mono text-slate-700 dark:text-slate-300 space-y-1 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl">
              {solveTarget === 'interest' && (
                <>
                  <div>SI = (P × R × T) / 100</div>
                  <div>SI = ({calcResults.principal} × {calcResults.rate}% × {calcResults.timeInYears.toFixed(2)} yrs) / 100</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                    SI = {formatCurrency(calcResults.interest, currency)}
                  </div>
                </>
              )}
              {solveTarget === 'principal' && (
                <>
                  <div>P = (SI × 100) / (R × T)</div>
                  <div>P = ({targetInterest} × 100) / ({calcResults.rate} × {calcResults.timeInYears.toFixed(2)})</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                    Principal P = {formatCurrency(calcResults.principal, currency)}
                  </div>
                </>
              )}
              {solveTarget === 'rate' && (
                <>
                  <div>R = (SI × 100) / (P × T)</div>
                  <div>R = ({targetInterest} × 100) / ({calcResults.principal} × {calcResults.timeInYears.toFixed(2)})</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                    Rate R = {calcResults.rate.toFixed(2)}% per year
                  </div>
                </>
              )}
              {solveTarget === 'time' && (
                <>
                  <div>T = (SI × 100) / (P × R)</div>
                  <div>T = ({targetInterest} × 100) / ({calcResults.principal} × {calcResults.rate})</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                    Time T = {calcResults.timeInYears.toFixed(2)} Years ({(calcResults.timeInYears * 12).toFixed(1)} Months)
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Output Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Total Maturity Amount
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
                {calcResults.rate.toFixed(1)}% p.a.
              </span>
            </div>

            {/* Total Maturity Value */}
            <div className="space-y-1 mb-6">
              <span className="text-xs text-slate-400 font-medium">Final Value (A = P + SI):</span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                {formatCurrency(calcResults.totalAmount, currency)}
              </div>
              <div className="text-xs text-slate-400 font-mono pt-1">
                {formatNumberWords(calcResults.totalAmount, currency)}
              </div>
            </div>

            {/* Breakdown Card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-300">Principal (Invested/Borrowed):</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(calcResults.principal, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-emerald-300 font-bold">Total Simple Interest (SI):</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{formatCurrency(calcResults.interest, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-white/10">
                <span>Duration in Years:</span>
                <span className="font-mono font-bold text-slate-200">
                  {calcResults.timeInYears.toFixed(2)} Years
                </span>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopySummary}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
              <span>{copied ? 'Copied Calculation!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Simple vs Compound Comparison Note */}
          {solveTarget === 'interest' && calcResults.interestDifference > 0 && (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" /> Comparison with Compound Interest:
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                If compounded annually, you would earn an extra{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(calcResults.interestDifference, currency)}
                </strong>{' '}
                over {calcResults.timeInYears.toFixed(1)} years (Total:{' '}
                {formatCurrency(calcResults.compoundEquivalent + calcResults.principal, currency)}).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Linear Growth Visual Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" /> Linear Growth Schedule
        </h3>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthSchedule}>
              <defs>
                <linearGradient id="siColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
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
              <Area type="monotone" dataKey="Total" stroke="#6366f1" fillOpacity={1} fill="url(#siColor)" />
              <Area type="monotone" dataKey="Principal" stroke="#94a3b8" fill="#e2e8f0" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
