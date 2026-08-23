import React, { useState, useMemo } from 'react';
import { 
  Briefcase, Copy, Check, TrendingUp, ShieldCheck, 
  HelpCircle, Zap, DollarSign, ArrowRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, formatNumberWords, CurrencyCode, CURRENCIES } from '../../utils/finance';

export const SalaryCalculator: React.FC = () => {
  const [annualCtc, setAnnualCtc] = useState<number>(1200000); // 12 LPA default
  const [includePf, setIncludePf] = useState<boolean>(true);
  const [includeGratuity, setIncludeGratuity] = useState<boolean>(true);
  const [includeProfTax, setIncludeProfTax] = useState<boolean>(true);
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  // Old regime deductions
  const [section80C, setSection80C] = useState<number>(150000);
  const [section80D, setSection80D] = useState<number>(25000);
  const [hraExemption, setHraExemption] = useState<number>(100000);
  const [nps80CCD, setNps80CCD] = useState<number>(50000);
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: '₹4.5 LPA (Fresher)', value: 450000 },
    { label: '₹8 LPA (Junior)', value: 800000 },
    { label: '₹12 LPA (Mid-Level)', value: 1200000 },
    { label: '₹20 LPA (Senior)', value: 2000000 },
    { label: '₹35 LPA (Lead/Exec)', value: 3500000 },
  ];

  // Salary & Tax Breakdown
  const salaryData = useMemo(() => {
    const ctc = annualCtc;
    const basicAnnual = ctc * 0.40; // 40% Basic standard
    const hraAnnual = ctc * 0.20; // 20% HRA
    const specialAllowance = ctc * 0.35; // 35% Special Allowance

    // Employer + Employee PF (12% of Basic, max/standard)
    const annualPfEmployee = includePf ? Math.min(basicAnnual * 0.12, 1800 * 12 * 2) : 0;
    const annualPfEmployer = includePf ? annualPfEmployee : 0;

    // Gratuity ~ 4.81% of basic
    const annualGratuity = includeGratuity ? Math.round(basicAnnual * 0.0481) : 0;

    // Professional Tax standard ₹2,400/yr in states like MH/KA
    const annualProfTax = includeProfTax ? 2400 : 0;

    // Gross Salary (CTC minus employer PF and Gratuity)
    const grossSalary = Math.max(0, ctc - annualPfEmployer - annualGratuity);

    // --- TAX CALCULATION ---
    // Standard Deduction: ₹75,000 for New Regime (Budget 2024-25/26), ₹50,000 for Old Regime
    const standardDeduction = regime === 'new' ? 75000 : 50000;

    // Taxable Income under New Regime
    let newRegimeTaxable = Math.max(0, grossSalary - 75000);
    let newRegimeTax = 0;

    // New Regime Slabs (Budget 2024/25)
    // 0 - 3L: Nil
    // 3L - 7L: 5%
    // 7L - 10L: 10%
    // 10L - 12L: 15%
    // 12L - 15L: 20%
    // >15L: 30%
    if (newRegimeTaxable <= 300000) {
      newRegimeTax = 0;
    } else if (newRegimeTaxable <= 700000) {
      newRegimeTax = (newRegimeTaxable - 300000) * 0.05;
    } else if (newRegimeTaxable <= 1000000) {
      newRegimeTax = (400000 * 0.05) + (newRegimeTaxable - 700000) * 0.10;
    } else if (newRegimeTaxable <= 1200000) {
      newRegimeTax = (400000 * 0.05) + (300000 * 0.10) + (newRegimeTaxable - 1000000) * 0.15;
    } else if (newRegimeTaxable <= 1500000) {
      newRegimeTax = (400000 * 0.05) + (300000 * 0.10) + (200000 * 0.15) + (newRegimeTaxable - 1200000) * 0.20;
    } else {
      newRegimeTax = (400000 * 0.05) + (300000 * 0.10) + (200000 * 0.15) + (300000 * 0.20) + (newRegimeTaxable - 1500000) * 0.30;
    }

    // Section 87A Rebate: Under New Regime, tax is NIL if taxable income <= 7.0 Lakhs (effective income up to 7.75L with std deduction)
    if (newRegimeTaxable <= 700000) {
      newRegimeTax = 0;
    }

    // Add 4% Health & Education Cess
    newRegimeTax = Math.round(newRegimeTax * 1.04);

    // --- OLD REGIME CALCULATION ---
    const totalOldDeductions = standardDeduction + section80C + section80D + hraExemption + nps80CCD;
    const oldRegimeTaxable = Math.max(0, grossSalary - totalOldDeductions);
    let oldRegimeTax = 0;

    // Old Slabs: 0-2.5L: Nil, 2.5-5L: 5%, 5-10L: 20%, >10L: 30%
    if (oldRegimeTaxable <= 250000) {
      oldRegimeTax = 0;
    } else if (oldRegimeTaxable <= 500000) {
      oldRegimeTax = (oldRegimeTaxable - 250000) * 0.05;
    } else if (oldRegimeTaxable <= 1000000) {
      oldRegimeTax = (250000 * 0.05) + (oldRegimeTaxable - 500000) * 0.20;
    } else {
      oldRegimeTax = (250000 * 0.05) + (500000 * 0.20) + (oldRegimeTaxable - 1000000) * 0.30;
    }

    if (oldRegimeTaxable <= 500000) {
      oldRegimeTax = 0; // 87A rebate for old regime <= 5L
    }
    oldRegimeTax = Math.round(oldRegimeTax * 1.04);

    // Selected tax
    const annualTax = regime === 'new' ? newRegimeTax : oldRegimeTax;
    const annualNetSalary = Math.max(0, grossSalary - annualPfEmployee - annualProfTax - annualTax);
    const monthlyNetSalary = Math.round(annualNetSalary / 12);
    const monthlyGross = Math.round(grossSalary / 12);
    const monthlyTax = Math.round(annualTax / 12);
    const monthlyPf = Math.round(annualPfEmployee / 12);
    const monthlyProfTax = Math.round(annualProfTax / 12);

    return {
      grossSalary: Math.round(grossSalary),
      monthlyGross,
      annualNetSalary: Math.round(annualNetSalary),
      monthlyNetSalary,
      annualTax,
      monthlyTax,
      annualPfEmployee: Math.round(annualPfEmployee),
      monthlyPf,
      annualProfTax,
      monthlyProfTax,
      annualGratuity,
      newRegimeTax,
      oldRegimeTax,
      taxSavedByNew: Math.round(oldRegimeTax - newRegimeTax),
    };
  }, [annualCtc, includePf, includeGratuity, includeProfTax, regime, section80C, section80D, hraExemption, nps80CCD]);

  const handleCopy = () => {
    const text = `💼 NAVIKO Salary & In-Hand Take Home Summary
---------------------------------------------
Annual CTC: ${formatCurrency(annualCtc, 'INR')}
Tax Regime: ${regime.toUpperCase()} Regime
Monthly In-Hand Take Home: ${formatCurrency(salaryData.monthlyNetSalary, 'INR')}/month
Annual In-Hand Take Home: ${formatCurrency(salaryData.annualNetSalary, 'INR')}/year
Monthly Gross: ${formatCurrency(salaryData.monthlyGross, 'INR')}
Monthly EPF Deduction: ${formatCurrency(salaryData.monthlyPf, 'INR')}
Monthly Income Tax (TDS): ${formatCurrency(salaryData.monthlyTax, 'INR')}
Calculated on: https://naviko.in/tools/salary-calculator`;

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
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            CTC to In-Hand Take Home Salary &amp; Tax Estimator
          </span>
        </div>

        {/* Regime Toggle */}
        <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
          <button
            onClick={() => setRegime('new')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              regime === 'new' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            New Regime (Default 2024-26)
          </button>
          <button
            onClick={() => setRegime('old')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              regime === 'old' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Old Regime (With Deductions)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Annual CTC Input */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Annual CTC (Cost to Company)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="100000"
                  max="100000000"
                  step="50000"
                  value={annualCtc}
                  onChange={(e) => setAnnualCtc(Math.max(0, Number(e.target.value)))}
                  className="w-44 pl-8 pr-3 py-1.5 text-right font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="200000"
              max="5000000"
              step="50000"
              value={annualCtc}
              onChange={(e) => setAnnualCtc(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setAnnualCtc(p.value)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                    annualCtc === p.value
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              In words: <span className="font-semibold text-slate-700">{formatNumberWords(annualCtc, 'INR')}</span>
            </div>
          </div>

          {/* Salary Components Toggles */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Salary Structure Deductions
            </h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">Include Employee Provident Fund (EPF)</div>
                  <div className="text-[11px] text-slate-500">12% contribution to retirement PF</div>
                </div>
                <input
                  type="checkbox"
                  checked={includePf}
                  onChange={(e) => setIncludePf(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">Include Gratuity in CTC</div>
                  <div className="text-[11px] text-slate-500">~4.81% of basic salary held by employer</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeGratuity}
                  onChange={(e) => setIncludeGratuity(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">Professional Tax (PT)</div>
                  <div className="text-[11px] text-slate-500">Standard state tax ~₹200/month</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeProfTax}
                  onChange={(e) => setIncludeProfTax(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Old Regime Deductions Box if Old Regime selected */}
          {regime === 'old' && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Old Regime Deductions Claimed
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Section 80C (PPF, ELSS, EPF)</label>
                  <input
                    type="number"
                    max="150000"
                    value={section80C}
                    onChange={(e) => setSection80C(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Section 80D (Health Insurance)</label>
                  <input
                    type="number"
                    max="75000"
                    value={section80D}
                    onChange={(e) => setSection80D(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">HRA Exemption (Rent Paid)</label>
                  <input
                    type="number"
                    value={hraExemption}
                    onChange={(e) => setHraExemption(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Section 80CCD(1B) (NPS)</label>
                  <input
                    type="number"
                    max="50000"
                    value={nps80CCD}
                    onChange={(e) => setNps80CCD(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Monthly In-Hand Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white shadow-xl border border-emerald-800/50 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Monthly In-Hand Take Home
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {regime.toUpperCase()} REGIME
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono">
                {formatCurrency(salaryData.monthlyNetSalary, 'INR')}
                <span className="text-sm text-slate-400 font-sans font-normal ml-1">/month</span>
              </div>
              <div className="text-xs text-emerald-200/80 font-medium mt-1">
                Annual In-Hand: {formatCurrency(salaryData.annualNetSalary, 'INR')}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-emerald-800/50 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Monthly Gross Salary:</span>
                <span className="font-mono font-bold text-white">{formatCurrency(salaryData.monthlyGross, 'INR')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Income Tax (TDS / mo):</span>
                <span className="font-mono font-bold text-rose-400">-{formatCurrency(salaryData.monthlyTax, 'INR')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">EPF Deduction (Employee / mo):</span>
                <span className="font-mono font-bold text-indigo-300">-{formatCurrency(salaryData.monthlyPf, 'INR')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Professional Tax (/ mo):</span>
                <span className="font-mono font-bold text-slate-300">-{formatCurrency(salaryData.monthlyProfTax, 'INR')}</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Salary Breakdown Copied!' : 'Copy In-Hand Breakdown'}</span>
            </button>
          </div>

          {/* Regime Comparison Box */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Tax Comparison: New vs Old Regime</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${regime === 'new' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-slate-500 font-medium">New Regime Tax</div>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {formatCurrency(salaryData.newRegimeTax, 'INR')}
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${regime === 'old' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-slate-500 font-medium">Old Regime Tax</div>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {formatCurrency(salaryData.oldRegimeTax, 'INR')}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-tight">
              {salaryData.newRegimeTax <= salaryData.oldRegimeTax ? (
                <span className="text-emerald-700 font-semibold">
                  💡 <strong>New Regime is better</strong> — you save {formatCurrency(salaryData.oldRegimeTax - salaryData.newRegimeTax, 'INR')} in tax without needing investment proofs!
                </span>
              ) : (
                <span className="text-indigo-700 font-semibold">
                  💡 <strong>Old Regime is better</strong> due to your high 80C &amp; HRA deductions!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
