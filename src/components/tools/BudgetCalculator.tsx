import React, { useState, useMemo } from 'react';
import {
  PieChart,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Share2,
  Sparkles,
  Layers,
  HelpCircle,
  Zap,
  RefreshCw,
  Wallet,
  ShoppingBag,
  PiggyBank,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: 'needs' | 'wants' | 'savings';
}

type CurrencySymbol = '₹' | '$' | '€' | '£' | '¥';

const DEFAULT_EXPENSES: ExpenseItem[] = [
  // Needs (50%)
  { id: '1', name: 'House Rent / Home Loan EMI', amount: 25000, category: 'needs' },
  { id: '2', name: 'Groceries & Daily Essentials', amount: 10000, category: 'needs' },
  { id: '3', name: 'Electricity, Gas & Water Bills', amount: 3500, category: 'needs' },
  { id: '4', name: 'Health & Term Life Insurance', amount: 2500, category: 'needs' },
  { id: '5', name: 'Commute, Fuel & Vehicle Maintenance', amount: 4000, category: 'needs' },

  // Wants (30%)
  { id: '6', name: 'Dining Out, Cafes & Food Delivery', amount: 8000, category: 'wants' },
  { id: '7', name: 'Streaming & Apps (Netflix, Spotify)', amount: 1500, category: 'wants' },
  { id: '8', name: 'Shopping, Fashion & Tech Gadgets', amount: 8000, category: 'wants' },
  { id: '9', name: 'Weekend Trips & Entertainment', amount: 5000, category: 'wants' },

  // Savings & Debt (20%)
  { id: '10', name: 'Monthly SIP in Equity Mutual Funds', amount: 12000, category: 'savings' },
  { id: '11', name: 'Emergency Fund Recurring Deposit', amount: 5000, category: 'savings' },
  { id: '12', name: 'NPS / PPF / Retirement Contribution', amount: 3000, category: 'savings' },
];

export const BudgetCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState<CurrencySymbol>('₹');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(80000);
  const [sideIncome, setSideIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(DEFAULT_EXPENSES);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<string>('');
  const [newItemCat, setNewItemCat] = useState<'needs' | 'wants' | 'savings'>('needs');
  const [copied, setCopied] = useState(false);

  const totalIncome = monthlyIncome + sideIncome;

  // Target 50/30/20 Ideal Allocations
  const targetNeeds = totalIncome * 0.50;
  const targetWants = totalIncome * 0.30;
  const targetSavings = totalIncome * 0.20;

  // Actual Spend sums
  const actualNeeds = useMemo(() => {
    return expenses.filter((e) => e.category === 'needs').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const actualWants = useMemo(() => {
    return expenses.filter((e) => e.category === 'wants').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const actualSavings = useMemo(() => {
    return expenses.filter((e) => e.category === 'savings').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const totalSpent = actualNeeds + actualWants + actualSavings;
  const remainingUnallocated = totalIncome - totalSpent;

  // Actual Percentages
  const pctNeeds = totalIncome > 0 ? (actualNeeds / totalIncome) * 100 : 0;
  const pctWants = totalIncome > 0 ? (actualWants / totalIncome) * 100 : 0;
  const pctSavings = totalIncome > 0 ? (actualSavings / totalIncome) * 100 : 0;

  // Budget Health Status
  const budgetHealth = useMemo(() => {
    if (totalSpent > totalIncome) {
      return {
        status: 'Deficit Overspending',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30',
        message: `You are spending ${currency}${Math.abs(remainingUnallocated).toLocaleString()} more than your monthly income! Immediate budget cutbacks required.`
      };
    }
    if (pctNeeds > 55) {
      return {
        status: 'Needs Heavy',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        message: 'Fixed essential costs exceed the recommended 50% threshold. Look for opportunities to reduce rent, utilities, or refinance loans.'
      };
    }
    if (pctWants > 35) {
      return {
        status: 'Wants Over-Allocated',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        message: 'Discretionary lifestyle spending is higher than 30%. Diverting a portion to investments will accelerate your financial independence.'
      };
    }
    if (pctSavings >= 20 && pctNeeds <= 50) {
      return {
        status: 'Prime Golden Budget',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        message: 'Your monthly cashflow is in pristine health! You are hitting the 20%+ wealth-building milestone while keeping needs disciplined.'
      };
    }
    return {
      status: 'Balanced Budget',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      message: 'Your cash flow is stable with positive savings margin.'
    };
  }, [totalSpent, totalIncome, remainingUnallocated, pctNeeds, pctWants, pctSavings, currency]);

  // 1-Year & 5-Year Projected Wealth Accumulation (assuming 12% equity CAGR on savings)
  const wealthProjection = useMemo(() => {
    const monthlySaving = actualSavings;
    const r = 0.12 / 12; // 12% annualized return monthly

    const futureValue1Yr = monthlySaving > 0 ? monthlySaving * ((Math.pow(1 + r, 12) - 1) / r) * (1 + r) : 0;
    const futureValue5Yr = monthlySaving > 0 ? monthlySaving * ((Math.pow(1 + r, 60) - 1) / r) * (1 + r) : 0;
    const futureValue10Yr = monthlySaving > 0 ? monthlySaving * ((Math.pow(1 + r, 120) - 1) / r) * (1 + r) : 0;

    return {
      yr1: Math.round(futureValue1Yr),
      yr5: Math.round(futureValue5Yr),
      yr10: Math.round(futureValue10Yr),
      saved1YrRaw: monthlySaving * 12,
      saved5YrRaw: monthlySaving * 60,
    };
  }, [actualSavings]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemAmount || Number(newItemAmount) <= 0) return;

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      amount: Number(newItemAmount),
      category: newItemCat
    };

    setExpenses([...expenses, newItem]);
    setNewItemName('');
    setNewItemAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const handleUpdateAmount = (id: string, newAmt: number) => {
    setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, amount: Math.max(0, newAmt) } : e))
    );
  };

  // Presets loader
  const loadPreset = (type: 'student' | 'family' | 'freelancer' | 'tech') => {
    if (type === 'student') {
      setMonthlyIncome(25000);
      setSideIncome(3000);
      setExpenses([
        { id: 's1', name: 'Hostel / Shared Room Rent', amount: 9000, category: 'needs' },
        { id: 's2', name: 'Mess & Food Essentials', amount: 4500, category: 'needs' },
        { id: 's3', name: 'Books, Stationery & Metro', amount: 1500, category: 'needs' },
        { id: 's4', name: 'Hangouts, Canteen & Coffee', amount: 4000, category: 'wants' },
        { id: 's5', name: 'Subscriptions & Mobile Recharge', amount: 800, category: 'wants' },
        { id: 's6', name: 'Index Fund SIP / Skill Learning', amount: 5000, category: 'savings' },
        { id: 's7', name: 'Emergency Rainy Day Pocket', amount: 2000, category: 'savings' },
      ]);
    } else if (type === 'tech') {
      setMonthlyIncome(150000);
      setSideIncome(20000);
      setExpenses([
        { id: 't1', name: 'Luxury Apartment Rent', amount: 45000, category: 'needs' },
        { id: 't2', name: 'Organic Groceries & Meal Prep', amount: 16000, category: 'needs' },
        { id: 't3', name: 'Car EMI & EV Charging', amount: 14000, category: 'needs' },
        { id: 't4', name: 'Fine Dining & Weekend Lounges', amount: 18000, category: 'wants' },
        { id: 't5', name: 'Gadgets, Apple Watch, Travel', amount: 22000, category: 'wants' },
        { id: 't6', name: 'Direct Mutual Fund SIPs', amount: 40000, category: 'savings' },
        { id: 't7', name: 'US Tech Stocks & Crypto', amount: 15000, category: 'savings' },
      ]);
    } else if (type === 'family') {
      setMonthlyIncome(120000);
      setSideIncome(10000);
      setExpenses([
        { id: 'f1', name: 'Home Loan EMI', amount: 42000, category: 'needs' },
        { id: 'f2', name: 'School Fees & Kids Daycare', amount: 15000, category: 'needs' },
        { id: 'f3', name: 'Supermarket Groceries & Milk', amount: 18000, category: 'needs' },
        { id: 'f4', name: 'Term Insurance & Family Mediclaim', amount: 6000, category: 'needs' },
        { id: 'f5', name: 'Family Outings & Movies', amount: 10000, category: 'wants' },
        { id: 'f6', name: 'Kids Higher Education Fund (PPF)', amount: 15000, category: 'savings' },
        { id: 'f7', name: 'Retirement Mutual Funds (NPS)', amount: 15000, category: 'savings' },
      ]);
    } else {
      setMonthlyIncome(90000);
      setSideIncome(30000);
      setExpenses([
        { id: 'fr1', name: 'Studio Workspace / Rent', amount: 30000, category: 'needs' },
        { id: 'fr2', name: 'High-speed Internet & Software Tools', amount: 8000, category: 'needs' },
        { id: 'fr3', name: 'Food & Nutrition', amount: 12000, category: 'needs' },
        { id: 'fr4', name: 'Cafe Work Sessions & Coffee', amount: 6000, category: 'wants' },
        { id: 'fr5', name: 'Upgrading Camera / Laptop Gear', amount: 15000, category: 'wants' },
        { id: 'fr6', name: 'Liquid Buffer Fund (Irregular Income)', amount: 25000, category: 'savings' },
        { id: 'fr7', name: 'Equity SIP', amount: 20000, category: 'savings' },
      ]);
    }
  };

  const copyBudgetSummary = () => {
    const text = `📊 NAVIKO 50/30/20 BUDGET SUMMARY
💰 Monthly Total Income: ${currency}${totalIncome.toLocaleString()}

🟢 50% NEEDS (Essential Survival)
• Actual: ${currency}${actualNeeds.toLocaleString()} (${pctNeeds.toFixed(1)}%) | Target: ${currency}${targetNeeds.toLocaleString()}

🟡 30% WANTS (Lifestyle & Enjoyment)
• Actual: ${currency}${actualWants.toLocaleString()} (${pctWants.toFixed(1)}%) | Target: ${currency}${targetWants.toLocaleString()}

🔵 20% SAVINGS & DEBT FREEDOM
• Actual: ${currency}${actualSavings.toLocaleString()} (${pctSavings.toFixed(1)}%) | Target: ${currency}${targetSavings.toLocaleString()}

📈 5-Year Projected Savings Wealth: ${currency}${wealthProjection.yr5.toLocaleString()} (at 12% CAGR)
Status: ${budgetHealth.status}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-10" id="budget-planner-tool">
      {/* 1. Header & Quick Presets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>50/30/20 Rule Smart Budget Planner</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Scientifically balance your income between Essentials (50%), Lifestyle (30%), and Long-term Wealth (20%).
              </p>
            </div>
          </div>

          {/* Currency Selector & Quick Presets */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              {(['₹', '$', '€', '£', '¥'] as CurrencySymbol[]).map((sym) => (
                <button
                  key={sym}
                  onClick={() => setCurrency(sym)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    currency === sym
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>

            <button
              onClick={copyBudgetSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copied ? 'Copied Summary' : 'Share Budget'}</span>
            </button>
          </div>
        </div>

        {/* Quick Archetype Preset Buttons */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quick Templates:
          </span>
          <button
            onClick={() => loadPreset('student')}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-all shrink-0 cursor-pointer"
          >
            🎓 College Student
          </button>
          <button
            onClick={() => loadPreset('tech')}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-all shrink-0 cursor-pointer"
          >
            💻 Tech Professional
          </button>
          <button
            onClick={() => loadPreset('family')}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-all shrink-0 cursor-pointer"
          >
            👨‍👩‍👧 Family of Four
          </button>
          <button
            onClick={() => loadPreset('freelancer')}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-all shrink-0 cursor-pointer"
          >
            🎨 Freelancer / Creator
          </button>
        </div>
      </div>

      {/* 2. Monthly Inflow Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg transition-colors">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            Monthly Primary Take-Home Salary (In-Hand)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-slate-400">
              {currency}
            </span>
            <input
              type="number"
              min="0"
              step="1000"
              value={monthlyIncome || ''}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="e.g. 80000"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <span>Net salary credited after all PF and tax deductions.</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg transition-colors">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            Side Income / Freelance / Rental Inflow (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-slate-400">
              {currency}
            </span>
            <input
              type="number"
              min="0"
              step="1000"
              value={sideIncome || ''}
              onChange={(e) => setSideIncome(Number(e.target.value))}
              placeholder="e.g. 15000"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Total Monthly Inflow:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {currency} {totalIncome.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Three Master Buckets (50% Needs, 30% Wants, 20% Savings) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* BUCKET 1: NEEDS */}
        <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border-2 border-emerald-500/30 rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-emerald-900 dark:text-emerald-200">50% Needs</span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {pctNeeds.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-1 my-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Actual Spent on Needs:</div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {currency} {actualNeeds.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Recommended Limit (50%):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {currency} {targetNeeds.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-emerald-900/20 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  pctNeeds > 55 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (actualNeeds / (targetNeeds || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-emerald-500/20 pt-3 mt-4">
            Rent, EMIs, Groceries, Electricity, Fuel, Mediclaim, School Fees.
          </div>
        </div>

        {/* BUCKET 2: WANTS */}
        <div className="bg-amber-500/5 dark:bg-amber-950/20 border-2 border-amber-500/30 rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-amber-900 dark:text-amber-200">30% Wants</span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                {pctWants.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-1 my-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Actual Spent on Wants:</div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {currency} {actualWants.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Recommended Limit (30%):</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {currency} {targetWants.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-amber-900/20 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  pctWants > 35 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (actualWants / (targetWants || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-amber-500/20 pt-3 mt-4">
            Dining out, Netflix, Shopping, Vacations, Hobbies, Gadgets.
          </div>
        </div>

        {/* BUCKET 3: SAVINGS */}
        <div className="bg-indigo-500/5 dark:bg-indigo-950/20 border-2 border-indigo-500/30 rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-indigo-900 dark:text-indigo-200">20% Savings</span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                {pctSavings.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-1 my-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Actual Monthly Savings:</div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {currency} {actualSavings.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Recommended Target (20%):</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {currency} {targetSavings.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-indigo-900/20 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (actualSavings / (targetSavings || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-indigo-500/20 pt-3 mt-4">
            Mutual Fund SIPs, Emergency Buffer, PPF, NPS, Extra Loan Prepayment.
          </div>
        </div>
      </div>

      {/* 4. Diagnostic Health Card */}
      <div className={`p-6 rounded-3xl border ${budgetHealth.bg} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/40 dark:bg-slate-900/60 flex items-center justify-center shrink-0">
            {totalSpent > totalIncome ? (
              <AlertCircle className="w-6 h-6 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            )}
          </div>
          <div>
            <div className={`text-base font-black ${budgetHealth.color}`}>
              {budgetHealth.status}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {budgetHealth.message}
            </p>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">Unallocated Buffer Margin</div>
          <div className={`font-mono text-xl font-black ${remainingUnallocated < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {currency} {remainingUnallocated.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 5. Itemized Expense Editor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span>Itemized Expenses &amp; Savings Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Edit individual expense items or add custom entries to dynamically recalculate your budget.
            </p>
          </div>

          <button
            onClick={() => setExpenses(DEFAULT_EXPENSES)}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Default List
          </button>
        </div>

        {/* Add New Line-item Form */}
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="e.g. Gym Membership, Child Tutor..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="sm:col-span-3">
            <input
              type="number"
              min="1"
              placeholder={`Amount (${currency})`}
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="sm:col-span-3">
            <select
              value={newItemCat}
              onChange={(e) => setNewItemCat(e.target.value as 'needs' | 'wants' | 'savings')}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="needs">50% Needs (Essential)</option>
              <option value="wants">30% Wants (Lifestyle)</option>
              <option value="savings">20% Savings (Investment)</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full py-2 sm:py-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              title="Add Line Item"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Expenses List by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Needs List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 pb-2 border-b border-emerald-500/20">
              <span>Needs List ({expenses.filter((e) => e.category === 'needs').length})</span>
              <span>{currency}{actualNeeds.toLocaleString()}</span>
            </div>
            {expenses
              .filter((e) => e.category === 'needs')
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-xs hover:border-emerald-500/40 transition-colors"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleUpdateAmount(item.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right font-mono font-bold text-slate-900 dark:text-white text-xs"
                    />
                    <button
                      onClick={() => handleDeleteExpense(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Wants List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 pb-2 border-b border-amber-500/20">
              <span>Wants List ({expenses.filter((e) => e.category === 'wants').length})</span>
              <span>{currency}{actualWants.toLocaleString()}</span>
            </div>
            {expenses
              .filter((e) => e.category === 'wants')
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-xs hover:border-amber-500/40 transition-colors"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleUpdateAmount(item.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right font-mono font-bold text-slate-900 dark:text-white text-xs"
                    />
                    <button
                      onClick={() => handleDeleteExpense(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Savings List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 pb-2 border-b border-indigo-500/20">
              <span>Savings &amp; Debt ({expenses.filter((e) => e.category === 'savings').length})</span>
              <span>{currency}{actualSavings.toLocaleString()}</span>
            </div>
            {expenses
              .filter((e) => e.category === 'savings')
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-xs hover:border-indigo-500/40 transition-colors"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleUpdateAmount(item.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right font-mono font-bold text-slate-900 dark:text-white text-xs"
                    />
                    <button
                      onClick={() => handleDeleteExpense(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 6. Long-Term Compound Wealth Projections */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-800/40 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-indigo-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Wealth Projection from Your 20% Savings ({currency}{actualSavings.toLocaleString()}/month)
            </h3>
            <p className="text-xs text-slate-400">
              Projected corpus if invested in index funds / diversified mutual funds at 12% annualized return.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">In 1 Year</div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-indigo-400 mt-1">
              {currency} {wealthProjection.yr1.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Principal: {currency}{wealthProjection.saved1YrRaw.toLocaleString()}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 text-center shadow-lg relative">
            <span className="absolute -top-2.5 right-4 px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
              Key Milestone
            </span>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">In 5 Years</div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {currency} {wealthProjection.yr5.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Principal: {currency}{wealthProjection.saved5YrRaw.toLocaleString()} • Gain: +{currency}{(wealthProjection.yr5 - wealthProjection.saved5YrRaw).toLocaleString()}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">In 10 Years</div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              {currency} {wealthProjection.yr10.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Compound interest multiplier: {(wealthProjection.yr10 / (actualSavings * 120 || 1)).toFixed(2)}x
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
