import React, { useState, useEffect } from 'react';
import {
  Search, ArrowRight, Sparkles, ShieldCheck, Zap, Lock,
  ChevronRight, Star, TrendingUp, Flame, Landmark,
  Briefcase, HeartPulse, Scale, GraduationCap, Calculator,
  Layers, FileText, Image, RefreshCw, BarChart3, CheckCircle2,
  DollarSign, Clock, HelpCircle, Award
} from 'lucide-react';
import { TOOLS_DATA, CATEGORIES_META } from '../data/toolsData';
import { DynamicIcon } from '../components/DynamicIcon';
import { AdSenseDisplayAd } from '../components/AdSenseDisplayAd';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/seo';
import { Hero3DVisual } from '../components/3d/Hero3DVisual';
import { Finance3DDashboardVisual } from '../components/3d/Finance3DDashboardVisual';
import { AiNodes3DVisual } from '../components/3d/AiNodes3DVisual';
import { Interactive3DCard } from '../components/3d/Interactive3DCard';
import { useSubscription } from '../context/SubscriptionContext';

interface HomePageV1Props {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const HomePageV1: React.FC<HomePageV1Props> = ({ onNavigate, onOpenSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [heroWidgetTab, setHeroWidgetTab] = useState<'3d' | 'sip' | 'calc'>('3d');
  const { t } = useLanguage();

  useSEO({
    title: 'NAVIKO 1.0 — Free Online Calculators, Finance & Productivity Tools',
    description: 'Explore 46+ high-precision online calculators, national debt clock, 50/30/20 budget planner, ATS resume builder, image compressors, PDF tools, and student planners. 100% client-side private.',
    canonical: '/v1',
    robots: 'index, follow',
    ogType: 'website'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Quick SIP calculator state in Hero
  const [sipAmount, setSipAmount] = useState<number>(5000);
  const [sipYears, setSipYears] = useState<number>(10);
  const sipRate = 12; // 12% p.a.
  const totalMonths = sipYears * 12;
  const monthlyRate = sipRate / 12 / 100;
  const sipMaturity = Math.round(
    sipAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  );
  const sipInvested = sipAmount * totalMonths;

  // Quick Number Calculator state in Hero
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  const handleCalcNum = (num: string) => {
    setCalcDisplay((prev) => (prev === '0' ? num : prev + num));
  };

  const handleCalcOp = (op: string) => {
    setCalcPrev(parseFloat(calcDisplay));
    setCalcOp(op);
    setCalcDisplay('0');
  };

  const handleCalcEqual = () => {
    if (calcPrev === null || !calcOp) return;
    const current = parseFloat(calcDisplay);
    let result = 0;
    if (calcOp === '+') result = calcPrev + current;
    else if (calcOp === '-') result = calcPrev - current;
    else if (calcOp === '×') result = calcPrev * current;
    else if (calcOp === '÷') result = current !== 0 ? calcPrev / current : 0;

    setCalcDisplay(String(Math.round(result * 1000) / 1000));
    setCalcPrev(null);
    setCalcOp(null);
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onOpenSearch();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Original NAVIKO 1.0 Slate/Indigo/Cyan Architecture) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border-b border-slate-800">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-10 left-1/4 w-96 h-96 [background:radial-gradient(circle,_rgba(99,102,241,0.25)_0%,_transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 [background:radial-gradient(circle,_rgba(16,185,129,0.18)_0%,_transparent_70%)] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>NAVIKO 1.0 Original Suite · 46+ Client-Side Tools</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                High-Speed Tools for <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-emerald-300">
                  Work, Finance &amp; Study.
                </span>
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                46+ high-precision online calculators, national debt clock, 50/30/20 budget planner, ATS resume builder, image compressors, PDF merge/split, and student planners. 100% free, zero server uploads, client-side private.
              </p>

              {/* Instant Search Bar */}
              <div className="max-w-xl mx-auto lg:mx-0">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center shadow-2xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all p-1.5"
                >
                  <Search className="w-5 h-5 text-indigo-200 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any tool (e.g. SIP, Scientific Calculator, Resume, Debt Clock, PDF)..."
                    className="w-full px-3 py-3 text-sm sm:text-base text-white placeholder-slate-400 bg-transparent outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider mr-1 text-[11px]">
                  Popular:
                </span>
                {[
                  { label: 'SIP Calculator', path: '/tools/sip-calculator', icon: '📈' },
                  { label: 'Debt Clock', path: '/tools/debt-clock', icon: '🏛️' },
                  { label: 'ATS Resume', path: '/tools/resume-builder', icon: '💼' },
                  { label: 'Scientific Calc', path: '/tools/scientific-calculator', icon: '🧮' },
                  { label: '50/30/20 Budget', path: '/tools/budget-calculator', icon: '💳' },
                  { label: 'PDF Merge', path: '/tools/pdf-merge', icon: '📑' },
                  { label: 'Attendance Planner', path: '/tools/attendance-calculator', icon: '🎓' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(item.path)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Hero: Interactive 3D Visualizer & Widget */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* Segmented Switcher */}
              <div className="flex p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 w-full max-w-sm mx-auto lg:mx-0 shadow-lg">
                <button
                  type="button"
                  onClick={() => setHeroWidgetTab('3d')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    heroWidgetTab === '3d'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D Hub</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroWidgetTab('sip')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    heroWidgetTab === 'sip'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>SIP Quick Calc</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroWidgetTab('calc')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    heroWidgetTab === 'calc'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Quick Pad</span>
                </button>
              </div>

              {/* Tab 1: Interactive 3D Orbital Scene */}
              {heroWidgetTab === '3d' && (
                <div className="p-4 sm:p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col items-center">
                  <Hero3DVisual onNavigate={onNavigate} />
                  <div className="w-full mt-3 p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-indigo-300 font-semibold">Interactive 3D Orbital Directory</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('/tools')}
                      className="text-xs font-bold text-indigo-400 hover:underline"
                    >
                      Browse All 46+ Tools →
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: SIP Quick Calculator */}
              {heroWidgetTab === 'sip' && (
                <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> SIP Compounding
                    </span>
                    <span className="text-xs text-slate-300">12% Expected Return</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-200 mb-1">
                      <span>Monthly Investment:</span>
                      <span className="font-bold text-white">₹{sipAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={50000}
                      step={500}
                      value={sipAmount}
                      onChange={(e) => setSipAmount(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-200 mb-1">
                      <span>Investment Period:</span>
                      <span className="font-bold text-white">{sipYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={sipYears}
                      onChange={(e) => setSipYears(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1">
                    <div className="text-[11px] text-slate-400">Estimated Maturity Value:</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      ₹{sipMaturity.toLocaleString('en-IN')}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                      <div>
                        <span className="text-slate-400">Invested: </span>
                        <span className="font-bold text-white">₹{sipInvested.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Returns: </span>
                        <span className="font-bold text-emerald-400">+₹{(sipMaturity - sipInvested).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('/tools/sip-calculator')}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Full SIP Calculator &amp; Charts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Tab 3: Quick Keypad */}
              {heroWidgetTab === 'calc' && (
                <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4" /> Standard Arithmetic
                    </span>
                    <button
                      onClick={handleCalcClear}
                      className="text-xs text-rose-300 hover:text-white font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-right font-mono text-2xl font-black text-white truncate">
                    {calcDisplay}
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-sm font-bold">
                    {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                      <button
                        key={btn}
                        onClick={() => {
                          if (btn === '=') handleCalcEqual();
                          else if (['+', '-', '×', '÷'].includes(btn)) handleCalcOp(btn);
                          else handleCalcNum(btn);
                        }}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                          btn === '='
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white col-span-1 shadow-md'
                            : ['+', '-', '×', '÷'].includes(btn)
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onNavigate('/tools/scientific-calculator')}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Open Scientific Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE CATEGORIES & UTILITY HUBS (Original 6 Pillar Directory) */}
      {/* ========================================================================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            NAVIKO 1.0 Platform
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Complete Client-Side Online Tool Suite
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Every tool runs 100% inside your browser's local memory. Zero uploads to cloud servers, no account required to calculate, and lightning-fast execution.
          </p>
        </div>

        {/* 6 Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Hub 1: Calculators */}
          <div
            onClick={() => onNavigate('/calculators')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Numerical &amp; Scientific
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5">
                  Calculators &amp; Math
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Scientific calculator with trigonometry, log, powers, tape history, percentage, exact age in days, discount math, and unit conversions.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Explore Calculators (7 Tools)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Hub 2: Finance & Wealth */}
          <div
            onClick={() => onNavigate('/finance-tools')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Taxes, Loans &amp; Wealth
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-0.5">
                  Finance &amp; Wealth Hub
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  National Debt Clock 🇮🇳, 50/30/20 budget planner, SIP compounding with inflation adjustment, loan EMI schedules, and in-hand salary calculations.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Explore Finance (12 Tools)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Hub 3: Student Tools */}
          <div
            onClick={() => onNavigate('/student-tools')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Exams &amp; Timetables
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mt-0.5">
                  Student Decision &amp; Prep
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Study decision trade-off matrix, backlog recovery schedules, syllabus completion projections, 75% college attendance buffers, and mock score diagnostics.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>Explore Student Tools (11 Tools)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Hub 4: PDF Utilities */}
          <div
            onClick={() => onNavigate('/pdf-tools')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  100% In-Browser Privacy
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mt-0.5">
                  PDF Tools
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Merge multiple PDF documents, compress file sizes, split custom page ranges, convert JPGs into PDF, and extract high-resolution image pages without uploading files.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Explore PDF Suite (5 Tools)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Hub 5: Image & Visual Tools */}
          <div
            onClick={() => onNavigate('/image-tools')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  No Cloud Uploads
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mt-0.5">
                  Image Tools
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Instant browser-native image compression (KB/MB reduction), aspect ratio crop, dimension resizing, background cutout remover, and JPG/PNG format converters.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>Explore Image Tools (6 Tools)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Hub 6: Career & Productivity */}
          <div
            onClick={() => onNavigate('/career-tools')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Workplace &amp; Job Prep
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5">
                  Career &amp; Productivity
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Clean ATS-friendly resume creator with one-click print/PDF export, typing speed WPM test, custom QR code generator, and word/character counters.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Explore Career Tools</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ORIGINAL 3D INTERACTIVE VISUALIZERS (Finance Dashboard & AI Nodes) */}
      {/* ========================================================================= */}
      <section className="py-12 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Interactive 3D Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Visual Intelligence in 3D Space
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Hover and tilt to explore real-time financial compounding graphs and local AI decision nodes.
            </p>
          </div>

          <Finance3DDashboardVisual onNavigate={onNavigate} />
          <AiNodes3DVisual onNavigate={onNavigate} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PRIVACY & ARCHITECTURE GUARANTEE */}
      {/* ========================================================================= */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              100% Client-Side Privacy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your numbers, tax figures, PDF files, and resume text never leave your device. All operations execute strictly in your local browser sandbox.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Instant Zero-Lag Performance
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculations evaluate in sub-millisecond real-time with zero network latency, cold starts, or cloud roundtrips.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Completely Free &amp; Open
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All 46+ core utility tools are unrestricted and free to use forever without forced registrations or paywalls.
            </p>
          </div>
        </div>
      </section>

      {/* AdSense Display */}
      <AdSenseDisplayAd />
    </div>
  );
};
