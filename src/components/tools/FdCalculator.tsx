import React, { useState, useMemo } from 'react';
import { Landmark, Copy, Check, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

type DepositType = 'fd' | 'rd';
type CompoundingFreq = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';

export const FdCalculator: React.FC = () => {
  const [depositType, setDepositType] = useState<DepositType>('fd');
  const [amount, setAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(7.25);
  const [tenureYears, setTenureYears] = useState<number>(3);
  const [compounding, setCompounding] = useState<CompoundingFreq>('quarterly');
  const [isSeniorCitizen, setIsSeniorCitizen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [copied, setCopied] = useState(false);

  const effectiveRate = isSeniorCitizen ? interestRate + 0.5 : interestRate;

  const calculation = useMemo(() => {
    let maturity = 0;
    let totalInvested = 0;
    const r = effectiveRate / 100;

    let n = 4; // quarterly standard
    if (compounding === 'monthly') n = 12;
    if (compounding === 'half_yearly') n = 2;
    if (compounding === 'yearly') n = 1;

    if (depositType === 'fd') {
      totalInvested = amount;
      // FD Compounding formula: A = P * (1 + r/n)^(n * t)
      maturity = amount * Math.pow(1 + r / n, n * tenureYears);
    } else {
      // RD Monthly Deposit Formula
      const totalMonths = tenureYears * 12;
      totalInvested = amount * totalMonths;
      const i = effectiveRate / 100 / 12; // monthly rate
      // RD Maturity formula: M = P * [ (1+i)^n - 1 ] / (1 - (1+i)^(-1/3)) roughly or standard series
      let rdMaturity = 0;
      for (let m = 1; m <= totalMonths; m++) {
        rdMaturity += amount * Math.pow(1 + r / 4, (4 * (totalMonths - m + 1)) / 12);
      }
      maturity = rdMaturity;
    }

    const finalMaturity = Math.round(maturity);
    const totalInterest = Math.round(Math.max(0, finalMaturity - totalInvested));

    return {
      totalInvested: Math.round(totalInvested),
      totalInterest,
      finalMaturity,
    };
  }, [depositType, amount, effectiveRate, tenureYears, compounding]);

  const handleCopy = () => {
    const text = `🏛️ NAVIKO ${depositType.toUpperCase()} Deposit Calculation
-------------------------------------------
Deposit Mode: ${depositType === 'fd' ? 'Fixed Deposit (Lump sum)' : 'Recurring Deposit (Monthly)'}
Principal Amount: ${formatCurrency(amount, currency)} ${depositType === 'rd' ? '/month' : ''}
Interest Rate: ${effectiveRate}% p.a. ${isSeniorCitizen ? '(Senior Citizen +0.5%)' : ''}
Tenure: ${tenureYears} Years
Total Amount Invested: ${formatCurrency(calculation.totalInvested, currency)}
Total Interest Earned: ${formatCurrency(calculation.totalInterest, currency)}
Total Maturity Value: ${formatCurrency(calculation.finalMaturity, currency)}
Calculated on: https://naviko.in/tools/fd-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const pieData = [
    { name: 'Total Invested', value: calculation.totalInvested, color: '#6366f1' },
    { name: 'Interest Earned', value: calculation.totalInterest, color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDepositType('fd')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              depositType === 'fd' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            Fixed Deposit (FD)
          </button>
          <button
            onClick={() => setDepositType('rd')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              depositType === 'rd' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            Recurring Deposit (RD)
          </button>
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
              <label className="text-sm font-bold text-slate-800">
                {depositType === 'fd' ? 'Total Deposit Amount' : 'Monthly RD Deposit'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  min="500"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-40 pl-8 pr-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min={depositType === 'fd' ? 5000 : 500}
              max={depositType === 'fd' ? 2000000 : 100000}
              step={depositType === 'fd' ? 5000 : 500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-[11px] text-slate-500 font-medium">
              In words: <span className="font-semibold text-slate-700">{formatNumberWords(amount, currency)}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Interest Rate (% p.a.)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="15"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">%</span>
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.05"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isSeniorCitizen}
                onChange={(e) => setIsSeniorCitizen(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span>Senior Citizen Special Rate (+0.50% Extra = <strong>{effectiveRate}%</strong>)</span>
            </label>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Tenure (Years)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="w-24 px-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">Yr</span>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 7, 10].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setTenureYears(yr)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                    tenureYears === yr ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-800/50 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Maturity Amount
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {effectiveRate}% p.a.
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {formatCurrency(calculation.finalMaturity, currency)}
              </div>
              <div className="text-xs text-indigo-200/80 font-medium mt-1">
                ≈ {formatNumberWords(calculation.finalMaturity, currency)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-indigo-800/60">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-medium text-slate-300">Total Invested</div>
                <div className="text-base font-bold text-indigo-200 font-mono mt-0.5">
                  {formatCurrency(calculation.totalInvested, currency)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[11px] font-medium text-emerald-300">Interest Earned</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  +{formatCurrency(calculation.totalInterest, currency)}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Maturity Summary'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Deposit Ratio
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-600 shrink-0"></span>
                <span className="text-slate-600">Principal: </span>
                <span className="font-bold text-slate-900">
                  {((calculation.totalInvested / calculation.finalMaturity) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-600">Interest: </span>
                <span className="font-bold text-emerald-600">
                  {((calculation.totalInterest / calculation.finalMaturity) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="w-20 h-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={20} outerRadius={35} dataKey="value">
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
