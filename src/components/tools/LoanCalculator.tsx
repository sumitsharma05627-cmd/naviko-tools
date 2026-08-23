import React, { useState, useMemo } from 'react';
import { 
  Building2, Landmark, Check, Copy, ArrowRight, 
  TrendingUp, Sparkles, Scale, DollarSign, PieChart as PieIcon,
  Table as TableIcon, Zap, ShieldAlert, Award
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const LoanCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compare' | 'eligibility' | 'prepay' | 'amortization'>('compare');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [copied, setCopied] = useState<boolean>(false);

  // Loan Comparison State
  const [loanA, setLoanA] = useState({
    name: 'Bank Option A',
    amount: 5000000,
    rate: 8.5,
    tenureYears: 20,
    processingFee: 10000
  });

  const [loanB, setLoanB] = useState({
    name: 'Bank Option B',
    amount: 5000000,
    rate: 8.25,
    tenureYears: 20,
    processingFee: 25000
  });

  // Eligibility State
  const [monthlyIncome, setMonthlyIncome] = useState<number>(120000);
  const [existingEmis, setExistingEmis] = useState<number>(15000);
  const [eligibilityTenure, setEligibilityTenure] = useState<number>(20);
  const [eligibilityRate, setEligibilityRate] = useState<number>(8.5);
  const [foirLimit, setFoirLimit] = useState<number>(50); // 50% max FOIR standard

  // Prepayment Optimizer State
  const [baseLoanAmount, setBaseLoanAmount] = useState<number>(4000000);
  const [baseRate, setBaseRate] = useState<number>(8.75);
  const [baseTenure, setBaseTenure] = useState<number>(20);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(5000);
  const [lumpSumPrepay, setLumpSumPrepay] = useState<number>(100000);
  const [lumpSumYear, setLumpSumYear] = useState<number>(3);

  // Helper EMI Math
  const computeEmi = (p: number, r: number, years: number) => {
    if (p <= 0 || r <= 0 || years <= 0) return { emi: 0, totalPayment: 0, totalInterest: 0 };
    const monthlyRate = r / 12 / 100;
    const months = years * 12;
    const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - p;
    return { emi: Math.round(emi), totalPayment: Math.round(totalPayment), totalInterest: Math.round(totalInterest) };
  };

  // Compare Loan A vs B Calculation
  const comparisonResults = useMemo(() => {
    const resA = computeEmi(loanA.amount, loanA.rate, loanA.tenureYears);
    const totalCostA = resA.totalPayment + loanA.processingFee;

    const resB = computeEmi(loanB.amount, loanB.rate, loanB.tenureYears);
    const totalCostB = resB.totalPayment + loanB.processingFee;

    const diff = Math.abs(totalCostA - totalCostB);
    const winner = totalCostA < totalCostB ? 'loanA' : 'loanB';
    const emiDiff = Math.abs(resA.emi - resB.emi);

    return {
      resA,
      totalCostA,
      resB,
      totalCostB,
      diff,
      winner,
      emiDiff
    };
  }, [loanA, loanB]);

  // Eligibility Calculation
  const eligibilityResult = useMemo(() => {
    const maxAllowableEmiTotal = (monthlyIncome * (foirLimit / 100));
    const availableEmiForNewLoan = Math.max(0, maxAllowableEmiTotal - existingEmis);
    
    // Reverse EMI formula to find max principal:
    // P = EMI * [(1+r)^n - 1] / [r * (1+r)^n]
    const monthlyRate = eligibilityRate / 12 / 100;
    const months = eligibilityTenure * 12;
    let maxLoanAmount = 0;

    if (monthlyRate > 0 && months > 0 && availableEmiForNewLoan > 0) {
      maxLoanAmount = (availableEmiForNewLoan * (Math.pow(1 + monthlyRate, months) - 1)) / 
                      (monthlyRate * Math.pow(1 + monthlyRate, months));
    }

    return {
      maxAllowableEmiTotal: Math.round(maxAllowableEmiTotal),
      availableEmiForNewLoan: Math.round(availableEmiForNewLoan),
      maxLoanAmount: Math.round(maxLoanAmount)
    };
  }, [monthlyIncome, existingEmis, eligibilityTenure, eligibilityRate, foirLimit]);

  // Prepayment Simulation Calculation
  const prepayResult = useMemo(() => {
    const principal = baseLoanAmount;
    const monthlyRate = baseRate / 12 / 100;
    const originalMonths = baseTenure * 12;

    const standard = computeEmi(principal, baseRate, baseTenure);
    const baseEmi = standard.emi;

    let balanceWithExtra = principal;
    let totalInterestWithExtra = 0;
    let actualMonthsWithExtra = 0;

    for (let m = 1; m <= originalMonths; m++) {
      if (balanceWithExtra <= 0) break;
      actualMonthsWithExtra++;

      const interestThisMonth = balanceWithExtra * monthlyRate;
      let principalThisMonth = (baseEmi - interestThisMonth) + extraMonthlyPayment;

      // Add lump sum in specific year (month = year * 12)
      if (m === lumpSumYear * 12 && lumpSumPrepay > 0) {
        principalThisMonth += lumpSumPrepay;
      }

      if (principalThisMonth > balanceWithExtra) {
        principalThisMonth = balanceWithExtra;
      }

      totalInterestWithExtra += interestThisMonth;
      balanceWithExtra -= principalThisMonth;
    }

    const monthsSaved = Math.max(0, originalMonths - actualMonthsWithExtra);
    const yearsSaved = (monthsSaved / 12).toFixed(1);
    const interestSaved = Math.max(0, Math.round(standard.totalInterest - totalInterestWithExtra));

    return {
      standard,
      actualMonthsWithExtra,
      actualYearsWithExtra: (actualMonthsWithExtra / 12).toFixed(1),
      totalInterestWithExtra: Math.round(totalInterestWithExtra),
      interestSaved,
      monthsSaved,
      yearsSaved
    };
  }, [baseLoanAmount, baseRate, baseTenure, extraMonthlyPayment, lumpSumPrepay, lumpSumYear]);

  // Amortization Schedule for base loan
  const amortizationSchedule = useMemo(() => {
    const principal = baseLoanAmount;
    const monthlyRate = baseRate / 12 / 100;
    const totalMonths = baseTenure * 12;
    const emi = computeEmi(principal, baseRate, baseTenure).emi;

    let remaining = principal;
    const yearly = [];

    for (let y = 1; y <= baseTenure; y++) {
      let yPrincipal = 0;
      let yInterest = 0;

      for (let m = 1; m <= 12; m++) {
        if (remaining <= 0) break;
        const interest = remaining * monthlyRate;
        const princ = Math.min(remaining, emi - interest);
        yInterest += interest;
        yPrincipal += princ;
        remaining -= princ;
      }

      yearly.push({
        year: `Yr ${y}`,
        principal: Math.round(yPrincipal),
        interest: Math.round(yInterest),
        balance: Math.max(0, Math.round(remaining))
      });
    }

    return yearly;
  }, [baseLoanAmount, baseRate, baseTenure]);

  const handleCopy = () => {
    let text = '';
    if (activeTab === 'compare') {
      text = `🏦 Loan Comparison:\n• ${loanA.name}: EMI ${formatCurrency(comparisonResults.resA.emi, currency)}, Total Cost: ${formatCurrency(comparisonResults.totalCostA, currency)}\n• ${loanB.name}: EMI ${formatCurrency(comparisonResults.resB.emi, currency)}, Total Cost: ${formatCurrency(comparisonResults.totalCostB, currency)}\n• Recommendation: ${comparisonResults.winner === 'loanA' ? loanA.name : loanB.name} saves ${formatCurrency(comparisonResults.diff, currency)}`;
    } else if (activeTab === 'eligibility') {
      text = `💼 Loan Eligibility Estimate:\n• Monthly Net Income: ${formatCurrency(monthlyIncome, currency)}\n• Maximum Eligible Loan: ${formatCurrency(eligibilityResult.maxLoanAmount, currency)}\n• Max Allowable EMI: ${formatCurrency(eligibilityResult.availableEmiForNewLoan, currency)}/mo`;
    } else {
      text = `⚡ Prepayment Savings:\n• Interest Saved: ${formatCurrency(prepayResult.interestSaved, currency)}\n• Tenure Reduced by: ${prepayResult.yearsSaved} Years (${prepayResult.monthsSaved} Months)`;
    }
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
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⚖️ Compare 2 Loans
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'eligibility'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            💼 Loan Eligibility
          </button>
          <button
            onClick={() => setActiveTab('prepay')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'prepay'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⚡ Prepayment & Payoff
          </button>
          <button
            onClick={() => setActiveTab('amortization')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'amortization'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📊 Amortization Chart
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

      {/* TAB 1: Compare 2 Loans Side-by-Side */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Cheaper Option Recommendation
                </span>
                <h3 className="text-xl sm:text-2xl font-black">
                  {comparisonResults.winner === 'loanA' ? loanA.name : loanB.name} saves you{' '}
                  <span className="underline decoration-white/50">
                    {formatCurrency(comparisonResults.diff, currency)}
                  </span>
                </h3>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-50 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Comparison'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loan A Card */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={loanA.name}
                  onChange={(e) => setLoanA({ ...loanA, name: e.target.value })}
                  className="font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-transparent focus:border-indigo-400 outline-none"
                />
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold font-mono">
                  Option 1
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Loan Principal</label>
                  <input
                    type="number"
                    value={loanA.amount}
                    onChange={(e) => setLoanA({ ...loanA, amount: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={loanA.rate}
                      onChange={(e) => setLoanA({ ...loanA, rate: Number(e.target.value) })}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tenure (Years)</label>
                    <input
                      type="number"
                      value={loanA.tenureYears}
                      onChange={(e) => setLoanA({ ...loanA, tenureYears: Number(e.target.value) })}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Processing Fee</label>
                  <input
                    type="number"
                    value={loanA.processingFee}
                    onChange={(e) => setLoanA({ ...loanA, processingFee: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                  />
                </div>
              </div>

              {/* Loan A Results */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Monthly EMI:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {formatCurrency(comparisonResults.resA.emi, currency)}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Interest:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(comparisonResults.resA.totalInterest, currency)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-indigo-200/60 dark:border-indigo-900/60 font-bold">
                  <span>Total Outflow (with Fee):</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {formatCurrency(comparisonResults.totalCostA, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Loan B Card */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border-2 border-teal-200 dark:border-teal-900/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={loanB.name}
                  onChange={(e) => setLoanB({ ...loanB, name: e.target.value })}
                  className="font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-transparent focus:border-teal-400 outline-none"
                />
                <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-full text-xs font-bold font-mono">
                  Option 2
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Loan Principal</label>
                  <input
                    type="number"
                    value={loanB.amount}
                    onChange={(e) => setLoanB({ ...loanB, amount: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={loanB.rate}
                      onChange={(e) => setLoanB({ ...loanB, rate: Number(e.target.value) })}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tenure (Years)</label>
                    <input
                      type="number"
                      value={loanB.tenureYears}
                      onChange={(e) => setLoanB({ ...loanB, tenureYears: Number(e.target.value) })}
                      className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Processing Fee</label>
                  <input
                    type="number"
                    value={loanB.processingFee}
                    onChange={(e) => setLoanB({ ...loanB, processingFee: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                  />
                </div>
              </div>

              {/* Loan B Results */}
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Monthly EMI:</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">
                    {formatCurrency(comparisonResults.resB.emi, currency)}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Interest:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(comparisonResults.resB.totalInterest, currency)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-teal-200/60 dark:border-teal-900/60 font-bold">
                  <span>Total Outflow (with Fee):</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {formatCurrency(comparisonResults.totalCostB, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Loan Eligibility & Affordability */}
      {activeTab === 'eligibility' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" /> Income & Debt Profile
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Monthly In-Hand Take-Home Salary ({CURRENCIES[currency]?.symbol || '₹'})
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Existing Monthly Loan EMIs (Car/Personal/Credit Card)
              </label>
              <input
                type="number"
                value={existingEmis}
                onChange={(e) => setExistingEmis(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Desired Tenure (Years)
                </label>
                <input
                  type="number"
                  value={eligibilityTenure}
                  onChange={(e) => setEligibilityTenure(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expected Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={eligibilityRate}
                  onChange={(e) => setEligibilityRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Bank FOIR / Debt Limit:</span>
                <span className="font-mono text-emerald-600">{foirLimit}% of Income</span>
              </div>
              <input
                type="range"
                min="30"
                max="65"
                value={foirLimit}
                onChange={(e) => setFoirLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[11px] text-slate-400">
                Most banks cap total monthly debt obligations at 50% of your net monthly salary.
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/60 space-y-6">
            <div>
              <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                Maximum Eligible Loan Amount
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 mt-2">
                {formatCurrency(eligibilityResult.maxLoanAmount, currency)}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {formatNumberWords(eligibilityResult.maxLoanAmount, currency)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Max Total EMI Cap ({foirLimit}%):</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(eligibilityResult.maxAllowableEmiTotal, currency)}/mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Existing Debts Deducted:</span>
                <span className="font-mono text-rose-300">
                  -{formatCurrency(existingEmis, currency)}/mo
                </span>
              </div>
              <div className="flex justify-between text-emerald-300 font-bold pt-2 border-t border-white/10 text-sm">
                <span>Available EMI Capacity:</span>
                <span className="font-mono">
                  {formatCurrency(eligibilityResult.availableEmiForNewLoan, currency)}/mo
                </span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Eligibility Summary'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Prepayment & Payoff Optimizer */}
      {activeTab === 'prepay' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Prepayment Strategies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Loan Amount</label>
                <input
                  type="number"
                  value={baseLoanAmount}
                  onChange={(e) => setBaseLoanAmount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={baseRate}
                  onChange={(e) => setBaseRate(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tenure (Yrs)</label>
                <input
                  type="number"
                  value={baseTenure}
                  onChange={(e) => setBaseTenure(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  Strategy 1: Extra Monthly Prepayment ({CURRENCIES[currency]?.symbol || '₹'})
                </label>
                <input
                  type="number"
                  step="500"
                  value={extraMonthlyPayment}
                  onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                    Strategy 2: Lump Sum Prepayment
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={lumpSumPrepay}
                    onChange={(e) => setLumpSumPrepay(Number(e.target.value))}
                    placeholder="e.g. 100000"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    At Year #
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={baseTenure}
                    value={lumpSumYear}
                    onChange={(e) => setLumpSumYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-800/60 space-y-6">
            <div>
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                Total Interest Saved
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 mt-2">
                {formatCurrency(prepayResult.interestSaved, currency)}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {formatNumberWords(prepayResult.interestSaved, currency)} saved in bank interest.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Original Tenure:</span>
                <span className="font-mono text-slate-400">{baseTenure} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300 font-bold">New Payoff Time:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {prepayResult.actualYearsWithExtra} Years
                </span>
              </div>
              <div className="flex justify-between text-amber-300 font-bold pt-2 border-t border-white/10">
                <span>Time Saved:</span>
                <span className="font-mono">
                  {prepayResult.yearsSaved} Years ({prepayResult.monthsSaved} Months sooner)
                </span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Payoff Plan'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Amortization Schedule */}
      {activeTab === 'amortization' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-sky-500" /> Yearly Loan Amortization Schedule
          </h3>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amortizationSchedule}>
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val) || 0, currency)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="principal" name="Principal Paid" fill="#6366f1" stackId="a" />
                <Bar dataKey="interest" name="Interest Paid" fill="#f43f5e" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold sticky top-0">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Principal (₹)</th>
                  <th className="py-2.5 px-3">Interest (₹)</th>
                  <th className="py-2.5 px-3">Closing Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {amortizationSchedule.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.year}</td>
                    <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400">{formatCurrency(row.principal, currency)}</td>
                    <td className="py-2 px-3 text-rose-500">{formatCurrency(row.interest, currency)}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{formatCurrency(row.balance, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
