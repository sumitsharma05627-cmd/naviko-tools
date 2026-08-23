import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Copy, Check, PieChart as PieIcon, 
  Table as TableIcon, Home, Car, UserCheck, GraduationCap, Zap 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

type LoanType = 'home' | 'car' | 'personal' | 'education';

export const EmiCalculator: React.FC = () => {
  const [loanType, setLoanType] = useState<LoanType>('home');
  const [loanAmount, setLoanAmount] = useState<number>(3000000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [activeTab, setActiveTab] = useState<'summary' | 'amortization'>('summary');
  const [copied, setCopied] = useState(false);

  // Set standard loan presets when clicking loan type tabs
  const handleLoanTypeChange = (type: LoanType) => {
    setLoanType(type);
    if (type === 'home') {
      setLoanAmount(3500000);
      setInterestRate(8.5);
      setTenureYears(20);
    } else if (type === 'car') {
      setLoanAmount(800000);
      setInterestRate(9.0);
      setTenureYears(5);
    } else if (type === 'personal') {
      setLoanAmount(300000);
      setInterestRate(12.5);
      setTenureYears(3);
    } else if (type === 'education') {
      setLoanAmount(1500000);
      setInterestRate(9.5);
      setTenureYears(10);
    }
  };

  // EMI Math Calculation
  const calculation = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    if (principal <= 0 || interestRate <= 0 || tenureYears <= 0) {
      return {
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayment: 0,
        interestRatio: '0',
        yearlySchedule: [],
        prepaymentSavings: null,
      };
    }

    // Standard EMI formula: [P * r * (1+r)^n] / [(1+r)^n - 1]
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const monthlyEmi = Math.round(emi);
    const totalPayment = Math.round(monthlyEmi * totalMonths);
    const totalInterest = Math.round(Math.max(0, totalPayment - principal));
    const interestRatio = ((totalInterest / totalPayment) * 100).toFixed(1);

    // Amortization Schedule
    let remainingBalance = principal;
    const yearlySchedule: {
      year: number;
      principalPaid: number;
      interestPaid: number;
      totalPaid: number;
      closingBalance: number;
    }[] = [];

    for (let y = 1; y <= tenureYears; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;

      for (let m = 1; m <= 12; m++) {
        if (remainingBalance <= 0) break;
        const monthInterest = remainingBalance * monthlyRate;
        const monthPrincipal = Math.min(remainingBalance, emi - monthInterest);
        
        yearInterest += monthInterest;
        yearPrincipal += monthPrincipal;
        remainingBalance -= monthPrincipal;
      }

      yearlySchedule.push({
        year: y,
        principalPaid: Math.round(yearPrincipal),
        interestPaid: Math.round(yearInterest),
        totalPaid: Math.round(yearPrincipal + yearInterest),
        closingBalance: Math.round(Math.max(0, remainingBalance)),
      });
    }

    // Prepayment simulation if user enters extra monthly payment
    let prepaymentSavings = null;
    if (extraMonthlyPayment > 0) {
      let bal = principal;
      let prepayMonths = 0;
      let prepayTotalInterest = 0;
      const totalMonthPayment = emi + extraMonthlyPayment;

      while (bal > 0 && prepayMonths < totalMonths * 2) {
        prepayMonths++;
        const intAmt = bal * monthlyRate;
        const prinAmt = Math.min(bal, totalMonthPayment - intAmt);
        prepayTotalInterest += intAmt;
        bal -= prinAmt;
      }

      const monthsSaved = totalMonths - prepayMonths;
      const interestSaved = Math.max(0, totalInterest - prepayTotalInterest);
      prepaymentSavings = {
        monthsSaved,
        yearsSaved: (monthsSaved / 12).toFixed(1),
        interestSaved: Math.round(interestSaved),
        newTenureMonths: prepayMonths,
      };
    }

    return {
      monthlyEmi,
      totalInterest,
      totalPayment,
      interestRatio,
      yearlySchedule,
      prepaymentSavings,
    };
  }, [loanAmount, interestRate, tenureYears, extraMonthlyPayment]);

  const handleCopy = () => {
    const text = `🏦 NAVIKO Loan EMI Summary
---------------------------
Loan Type: ${loanType.toUpperCase()} Loan
Principal Amount: ${formatCurrency(loanAmount, currency)}
Interest Rate: ${interestRate}% p.a.
Tenure: ${tenureYears} Years (${tenureYears * 12} Months)
Monthly EMI: ${formatCurrency(calculation.monthlyEmi, currency)}/month
Total Interest Payable: ${formatCurrency(calculation.totalInterest, currency)} (${calculation.interestRatio}% of total)
Total Repayment Amount: ${formatCurrency(calculation.totalPayment, currency)}
Calculated on: https://naviko.in/tools/emi-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const pieData = [
    { name: 'Principal Loan Amount', value: loanAmount, color: '#6366f1' },
    { name: 'Total Interest Payable', value: calculation.totalInterest, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Bar: Loan Type Selection & Currency */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800">
        {/* Loan Type Quick Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleLoanTypeChange('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              loanType === 'home' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Home Loan
          </button>
          <button
            onClick={() => handleLoanTypeChange('car')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              loanType === 'car' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" /> Car Loan
          </button>
          <button
            onClick={() => handleLoanTypeChange('personal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              loanType === 'personal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Personal
          </button>
          <button
            onClick={() => handleLoanTypeChange('education')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              loanType === 'education' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Education
          </button>
        </div>

        {/* Currency Switcher */}
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

      {/* Main Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loan Amount */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Principal Loan Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number"
                  min="10000"
                  max="100000000"
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                  className="w-44 pl-8 pr-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="100000"
              max="20000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-[11px] text-slate-500 font-medium">
              In words: <span className="font-semibold text-slate-700">{formatNumberWords(loanAmount, currency)}</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Interest Rate (% p.a.)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Loan Tenure */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Loan Tenure (Years / Months)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="35"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Math.max(1, Math.min(40, Number(e.target.value))))}
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
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex gap-2">
              {[1, 3, 5, 10, 15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setTenureYears(yr)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                    tenureYears === yr
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {yr}Y
                </button>
              ))}
            </div>
          </div>

          {/* Prepayment & Extra EMI Simulator (Pro feature for job professionals) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Prepayment &amp; Interest Saver Simulator
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                +{formatCurrency(extraMonthlyPayment, currency)}/mo
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Pay just a little extra every month to save lakhs of interest and finish loan years earlier!
            </p>

            <input
              type="range"
              min="0"
              max="20000"
              step="1000"
              value={extraMonthlyPayment}
              onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            {calculation.prepaymentSavings && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <div>
                  🎉 <strong>Massive Savings:</strong> You will save <strong>{formatCurrency(calculation.prepaymentSavings.interestSaved, currency)}</strong> in interest!
                </div>
                <div>
                  ⏱️ Loan will close <strong>{calculation.prepaymentSavings.yearsSaved} years earlier</strong> ({calculation.prepaymentSavings.monthsSaved} fewer EMI payments).
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-800/50 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Monthly Loan EMI
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {tenureYears * 12} Months
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono">
                {formatCurrency(calculation.monthlyEmi, currency)}
                <span className="text-sm text-slate-400 font-sans font-normal ml-1">/month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-indigo-800/60">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-medium text-slate-300">Total Interest Payable</div>
                <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
                  {formatCurrency(calculation.totalInterest, currency)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="text-[11px] font-medium text-indigo-300">Total Amount Payable</div>
                <div className="text-base font-bold text-indigo-300 font-mono mt-0.5">
                  {formatCurrency(calculation.totalPayment, currency)}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'EMI Breakdown Copied!' : 'Copy EMI Breakdown'}</span>
            </button>
          </div>

          {/* Donut Chart: Principal vs Interest */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Principal vs Interest Breakdown
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 shrink-0"></span>
                  <span className="text-slate-600">Principal: </span>
                  <span className="font-bold text-slate-900">
                    {((loanAmount / (calculation.totalPayment || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-slate-600">Interest: </span>
                  <span className="font-bold text-rose-600">
                    {calculation.interestRatio}%
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
        </div>
      </div>

      {/* Yearly Amortization Schedule Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TableIcon className="w-5 h-5 text-indigo-600" />
          <span>Yearly Loan Repayment Schedule (Amortization)</span>
        </h3>
        <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold sticky top-0">
              <tr>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Principal Paid</th>
                <th className="py-3 px-4">Interest Paid</th>
                <th className="py-3 px-4">Total Paid (Year)</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
              {calculation.yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-slate-900 font-sans">Year {row.year}</td>
                  <td className="py-2.5 px-4 text-indigo-700 font-semibold">{formatCurrency(row.principalPaid, currency)}</td>
                  <td className="py-2.5 px-4 text-rose-500 font-semibold">{formatCurrency(row.interestPaid, currency)}</td>
                  <td className="py-2.5 px-4">{formatCurrency(row.totalPaid, currency)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatCurrency(row.closingBalance, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
