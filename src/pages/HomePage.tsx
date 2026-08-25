import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowRight, Sparkles, ShieldCheck, Zap, Lock, 
  ChevronRight, Star, TrendingUp, Flame, Landmark,
  Briefcase
} from 'lucide-react';
import { TOOLS_DATA, CATEGORIES_META } from '../data/toolsData';
import { DynamicIcon } from '../components/DynamicIcon';
import { InFeedAd } from '../components/InFeedAd';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    document.title = 'NAVIKO — Free Online Tools | Smart Tools. Simple Solutions.';
  }, []);
  
  // Interactive mini-calculator state on hero for instant Gen Z engagement!
  const [quickSip, setQuickSip] = useState(5000);
  const [quickYears, setQuickYears] = useState(10);
  const quickReturn = 12; // 12% p.a.
  const quickMonths = quickYears * 12;
  const quickR = quickReturn / 12 / 100;
  const quickMaturity = Math.round(
    quickSip * ((Math.pow(1 + quickR, quickMonths) - 1) / quickR) * (1 + quickR)
  );
  const quickInvested = quickSip * quickMonths;

  const popularTools = TOOLS_DATA.filter((t) => t.popular);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onOpenSearch();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
        {/* Glow decorative spheres */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('hero.badge', 'Next-Gen Productivity Suite • Free & Private')}</span>
              </div>

              {/* Brand Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {t('hero.title', 'Smart Tools for')} <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300">
                  {t('hero.highlight', 'Career, Wealth & Study.')}
                </span>
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {t('hero.subtitle', 'High-speed client-side calculators, SIP compounding, in-hand salary tax breakdowns, ATS resumes, and image processing tools. Zero ads clutter, 100% private.')}
              </p>

              {/* Search Box in Hero */}
              <div className="max-w-xl mx-auto lg:mx-0">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/20 transition-all p-1.5">
                  <Search className="w-5 h-5 text-slate-300 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hero.searchPlaceholder', 'Search tools... (SIP, Salary, EMI, CGPA, Resume, Age)')}
                    className="w-full px-3 py-3 text-sm sm:text-base text-white placeholder-slate-400 bg-transparent outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('hero.exploreBtn', 'Explore')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Quick Category Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
                  {t('nav.trending', 'Trending')}:
                </span>
                <button
                  onClick={() => onNavigate('/tools/budget-calculator')}
                  className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-xs font-bold text-indigo-300 border border-indigo-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>💼 {t('nav.budget', '50/30/20 Budget')}</span>
                </button>
                <button
                  onClick={() => onNavigate('/tools/debt-clock')}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold text-rose-300 border border-rose-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>🇮🇳 {t('nav.debtClock', 'Live Debt Clock')}</span>
                </button>
                <button
                  onClick={() => onNavigate('/tools/scientific-calculator')}
                  className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-xs font-bold text-indigo-300 border border-indigo-400/30 transition-colors cursor-pointer"
                >
                  📐 {t('nav.scientific', 'Scientific Calc')}
                </button>
                <button
                  onClick={() => onNavigate('/tools/sip-calculator')}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-300 border border-white/10 transition-colors cursor-pointer"
                >
                  📈 SIP Calc
                </button>
                <button
                  onClick={() => onNavigate('/tools/salary-calculator')}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-teal-300 border border-white/10 transition-colors cursor-pointer"
                >
                  💼 In-Hand Salary
                </button>
              </div>
            </div>

            {/* Right Hero: Live Interactive SIP Mini Widget */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-7 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl space-y-5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      {t('hero.quickSipTitle', 'Live Compound SIP Estimator')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    12% CAGR
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                      <span>{t('hero.monthlyInvest', 'Monthly Investment')}</span>
                      <span className="font-bold text-white font-mono">₹{quickSip.toLocaleString('en-IN')}/mo</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="1000"
                      value={quickSip}
                      onChange={(e) => setQuickSip(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                      <span>{t('hero.timeHorizon', 'Time Horizon')}</span>
                      <span className="font-bold text-white font-mono">{quickYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={quickYears}
                      onChange={(e) => setQuickYears(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>
                </div>

                {/* Wealth Result Box */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-xs text-slate-400">{t('hero.estValue', 'Estimated Maturity Value')}:</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    ₹{quickMaturity.toLocaleString('en-IN')}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                    <div>
                      <span className="text-slate-400">{t('hero.invested', 'Total Invested')}: </span>
                      <span className="font-bold text-slate-200">₹{quickInvested.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{t('hero.wealthGain', 'Est. Wealth Gain')}: </span>
                      <span className="font-bold text-emerald-400">+₹{(quickMaturity - quickInvested).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('/tools/sip-calculator')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('hero.openFullCalc', 'Open Full SIP Calculator & Charts')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Guarantee Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('privacy.feat1Title', '100% Client-Side Engine')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('privacy.feat1Desc', 'Calculations and file processing happen locally in real-time with zero latency.')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('privacy.feat2Title', 'Zero Data Collection')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('privacy.feat2Desc', 'No tracking cookies, no accounts required, no telemetry, and no storage of personal inputs.')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('privacy.feat3Title', 'Instant & Offline-Ready')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('privacy.feat3Desc', 'Ultra-lightweight architecture with immediate response times on mobile and desktop.')}
            </p>
          </div>
        </div>
      </section>

      {/* Spotlight: Finance & Wealth Suite */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
                <Flame className="w-3.5 h-3.5" />
                <span>Featured Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t('nav.finance', 'Finance & Wealth')} Engine
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                Plan mutual funds compounding, calculate monthly loan EMIs with prepayment simulations, and decode your exact New vs Old Tax Regime in-hand pay.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/finance-tools')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
            >
              <span>{t('tools.exploreAllCount', 'Explore All 10 Finance Tools')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Finance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 relative z-10">
            {[
              {
                title: '50/30/20 Budget Planner',
                desc: 'Needs, wants & savings breakdown',
                path: '/tools/budget-calculator',
                icon: TrendingUp,
                color: 'text-indigo-400',
              },
              {
                title: 'SIP Compounding',
                desc: 'Step-up SIP, inflation adjustment & charts',
                path: '/tools/sip-calculator',
                icon: TrendingUp,
                color: 'text-emerald-400',
              },
              {
                title: 'Salary & Tax',
                desc: 'CTC to in-hand monthly pay (New vs Old Tax)',
                path: '/tools/salary-calculator',
                icon: Briefcase,
                color: 'text-teal-400',
              },
              {
                title: 'EMI & Loan Prepayment',
                desc: 'Home, car, & personal loan amortization',
                path: '/tools/emi-calculator',
                icon: Landmark,
                color: 'text-sky-400',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <button
                  key={i}
                  onClick={() => onNavigate(f.path)}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group cursor-pointer"
                >
                  <Icon className={`w-6 h-6 ${f.color} mb-2 group-hover:scale-110 transition-transform`} />
                  <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {f.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 leading-snug">
                    {f.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Google AdSense In-Feed Ad Placement */}
      <InFeedAd />

      {/* Tool Categories */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> {t('cat.sectionBadge', 'All Categories')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('cat.sectionTitle', 'Browse by Category')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/tools')}
              className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>{t('nav.exploreAll', 'View all tools')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES_META.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate(cat.path)}
                className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 text-left group transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                    <DynamicIcon name={cat.icon} className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.title}
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {cat.toolsCount} {t('cat.toolsCount', 'tools')}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700">
                  <span>{t('cat.exploreCategory', 'Explore Category')}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools Directory */}
      <section className="py-16 bg-slate-50/60 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                <Star className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400" /> {t('tools.featuredBadge', 'Featured Collection')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('tools.featuredTitle', 'Most Popular Utilities')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/tools')}
              className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>{t('tools.exploreAllCount', 'Explore all tools')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.map((tool) => (
              <div
                key={tool.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-4">
                    <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onNavigate(tool.path)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('tools.useTool', 'Use Tool')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
