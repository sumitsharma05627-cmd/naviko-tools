import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowRight, Sparkles, ShieldCheck, Zap, Lock, 
  ChevronRight, Star, TrendingUp, Flame, Landmark,
  Briefcase, HeartPulse, Scale, Apple, BookOpen, Utensils,
  Droplets, Leaf, CheckCircle2, Award, Activity, Calculator
} from 'lucide-react';
import { TOOLS_DATA, CATEGORIES_META } from '../data/toolsData';
import { DynamicIcon } from '../components/DynamicIcon';
import { AdSenseDisplayAd } from '../components/AdSenseDisplayAd';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/seo';
import { Hero3DVisual } from '../components/3d/Hero3DVisual';
import { Hero3DScene } from '../components/3d/Hero3DScene';
import { Interactive3DCard } from '../components/3d/Interactive3DCard';
import { useSubscription } from '../context/SubscriptionContext';

interface HomePageV2Props {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const HomePageV2: React.FC<HomePageV2Props> = ({ onNavigate, onOpenSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const { currency } = useSubscription();

  useSEO({
    title: 'NAVIKO 2.0 — Science Meets Tradition | Nutrition Science & Ayurveda',
    description: 'NAVIKO 2.0 unites evidence-informed Indian nutrition science (ICMR-NIN IFCT), authentic Ayurvedic wisdom (Dravyaguna & Dinacharya), smart meal planning, and daily wellness tools.',
    canonical: '/v2',
    robots: 'index, follow',
    ogType: 'website'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  // Interactive mini-calculator state on hero
  const [heroTab, setHeroTab] = useState<'wellness' | '3d' | 'sip'>('wellness');
  
  // Quick Asian BMI state
  const [quickBmiWeight, setQuickBmiWeight] = useState(68);
  const [quickBmiHeight, setQuickBmiHeight] = useState(170);
  const qHeightM = quickBmiHeight / 100;
  const quickBmiScore = qHeightM > 0 ? Math.round((quickBmiWeight / (qHeightM * qHeightM)) * 10) / 10 : 0;
  const isHealthyAsianBmi = quickBmiScore >= 18.5 && quickBmiScore < 23.0;

  // SIP Calculator State
  const [quickSip, setQuickSip] = useState(5000);
  const [quickYears, setQuickYears] = useState(10);
  const quickReturn = 12; // 12% p.a.
  const quickMonths = quickYears * 12;
  const quickR = quickReturn / 12 / 100;
  const quickMaturity = Math.round(
    quickSip * ((Math.pow(1 + quickR, quickMonths) - 1) / quickR) * (1 + quickR)
  );
  const quickInvested = quickSip * quickMonths;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/food-explorer?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onOpenSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] transition-colors">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-[#122B20] via-[#1B4332] to-[#0E1F18] text-white border-b border-emerald-900/60">
        {/* Subtle botanical glow */}
        <div className="absolute top-10 left-1/4 w-96 h-96 [background:radial-gradient(circle,_rgba(45,106,79,0.25)_0%,_transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 [background:radial-gradient(circle,_rgba(194,99,71,0.18)_0%,_transparent_70%)] rounded-full pointer-events-none" />

        <Hero3DScene onNavigate={onNavigate} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold shadow-inner">
                <Leaf className="w-3.5 h-3.5 text-emerald-300" />
                <span>NAVIKO 2.0 · Nutrition Science &amp; Ayurveda</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
                Understand Your Nutrition. <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
                  Discover Ayurveda. Build Habits.
                </span>
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
                Explore verified Indian food nutrients (ICMR-NIN), evidence-reviewed Ayurvedic herbs, personalized meal plans, and 46+ privacy-first utility tools. 100% free and client-side private.
              </p>

              {/* Search Box in Hero */}
              <div className="max-w-xl mx-auto lg:mx-0">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/20 transition-all p-1.5">
                  <Search className="w-5 h-5 text-emerald-200 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search foods, herbs, recipes... (Moong Dal, Turmeric, BMI, Sattu, Besan)"
                    className="w-full px-3 py-3 text-sm sm:text-base text-white placeholder-emerald-200/60 bg-transparent outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-xs">
                <span className="text-emerald-300/80 font-semibold uppercase tracking-wider mr-1 text-[11px]">
                  Pillars:
                </span>
                <button
                  onClick={() => onNavigate('/food-explorer')}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  🥗 <span>Food Explorer</span>
                </button>
                <button
                  onClick={() => onNavigate('/food-compare')}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  ⚖️ <span>Compare Foods</span>
                </button>
                <button
                  onClick={() => onNavigate('/recipes')}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  🍲 <span>Healthy Recipes</span>
                </button>
                <button
                  onClick={() => onNavigate('/label-analyzer')}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  🔍 <span>Label &amp; INS Decoder</span>
                </button>
                <button
                  onClick={() => onNavigate('/ayurveda')}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  🌿 <span>Ayurveda Hub</span>
                </button>
                <button
                  onClick={() => onNavigate('/habit-tracker')}
                  className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  💧 <span>Habit Tracker</span>
                </button>
                <button
                  onClick={() => onNavigate('/tools/sip-calculator')}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer font-medium"
                >
                  📈 <span>SIP Calc</span>
                </button>
              </div>
            </div>

            {/* Right Hero: Interactive Quick Widget & 3D Visualizer */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* Segmented Switcher */}
              <div className="flex p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 w-full max-w-sm mx-auto lg:mx-0 shadow-lg">
                <button
                  type="button"
                  onClick={() => setHeroTab('wellness')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    heroTab === 'wellness'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Asian BMI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroTab('sip')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    heroTab === 'sip'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>SIP Calc</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroTab('3d')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    heroTab === '3d'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D Hub</span>
                </button>
              </div>

              {/* Tab 1: Asian Indian BMI Quick Check */}
              {heroTab === 'wellness' && (
                <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Scale className="w-4 h-4" /> Asian Indian BMI Check
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold">
                      ICMR/WHO Standard
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-emerald-100 mb-1">
                      <span>Weight (kg):</span>
                      <span className="font-bold text-white">{quickBmiWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min={35}
                      max={140}
                      value={quickBmiWeight}
                      onChange={(e) => setQuickBmiWeight(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-emerald-100 mb-1">
                      <span>Height (cm):</span>
                      <span className="font-bold text-white">{quickBmiHeight} cm</span>
                    </div>
                    <input
                      type="range"
                      min={120}
                      max={210}
                      value={quickBmiHeight}
                      onChange={(e) => setQuickBmiHeight(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-emerald-200/80">Calculated BMI Score:</div>
                      <div className="text-2xl font-serif font-bold text-white">
                        {quickBmiScore}{' '}
                        <span className="text-xs font-sans font-medium text-emerald-300">kg/m²</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      isHealthyAsianBmi
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                        : quickBmiScore < 18.5
                        ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                        : 'bg-rose-500/20 border-rose-400/40 text-rose-200'
                    }`}>
                      {isHealthyAsianBmi ? 'Normal (18.5–22.9)' : quickBmiScore < 18.5 ? 'Underweight (<18.5)' : 'Overweight (≥23)'}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('/wellness-calculators')}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Full Body Metrics &amp; TDEE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Tab 2: SIP Quick Calculator */}
              {heroTab === 'sip' && (
                <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> Mutual Fund SIP
                    </span>
                    <span className="text-xs text-emerald-200">12% Expected Return</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-emerald-100 mb-1">
                      <span>Monthly Investment:</span>
                      <span className="font-bold text-white">₹{quickSip.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={50000}
                      step={500}
                      value={quickSip}
                      onChange={(e) => setQuickSip(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-emerald-100 mb-1">
                      <span>Tenure:</span>
                      <span className="font-bold text-white">{quickYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={quickYears}
                      onChange={(e) => setQuickYears(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-1">
                    <div className="text-[11px] text-emerald-200/80">Estimated Maturity Value:</div>
                    <div className="text-2xl font-serif font-bold text-emerald-300 font-mono">
                      ₹{quickMaturity.toLocaleString('en-IN')}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                      <div>
                        <span className="text-emerald-200/70">Invested: </span>
                        <span className="font-bold text-white">₹{quickInvested.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-emerald-200/70">Wealth Gain: </span>
                        <span className="font-bold text-emerald-300">+₹{(quickMaturity - quickInvested).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('/tools/sip-calculator')}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Full SIP Calculator &amp; Charts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Tab 3: 3D Visual */}
              {heroTab === '3d' && (
                <div className="p-4 sm:p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col items-center">
                  <Hero3DVisual onNavigate={onNavigate} />
                  <div className="w-full mt-3 p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-emerald-200">Interactive 3D Orbital Scene</span>
                    <button
                      type="button"
                      onClick={() => setHeroTab('wellness')}
                      className="text-xs font-bold text-emerald-400 hover:underline"
                    >
                      Back to Calculator →
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 5 CORE PILLARS SHOWCASE (NAVIKO 2.0 Wellness Architecture) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            NAVIKO 2.0 Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Evidence-Based Nutrition Meets Classical Ayurveda
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
            Five integrated pillars built with validated Indian food science, classical Sanskrit Dravyaguna compendiums, and zero-bullshit daily habits.
          </p>
        </div>

        {/* 5-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Food Explorer */}
          <Interactive3DCard className="h-full" elevation={6} maxTilt={5}>
            <div
              onClick={() => onNavigate('/food-explorer')}
              className="p-6 h-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-emerald-600/60 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Apple className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    ICMR-NIN &amp; USDA Database
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 transition-colors">
                    Indian Food Nutrition Explorer
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    Search 36+ verified Indian staples (Roti, Moong Khichdi, Sambar, Paneer, Chana, Makhana). Detailed micronutrients, portion size multipliers, and 1-click logging to daily tracker.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span>Explore Indian Foods</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Interactive3DCard>

          {/* Card 2: Smart Meal Planner */}
          <Interactive3DCard className="h-full" elevation={6} maxTilt={5}>
            <div
              onClick={() => onNavigate('/meal-planner')}
              className="p-6 h-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-emerald-600/60 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                    Personalized Planning
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 transition-colors">
                    Smart Indian Meal Planner
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    Generate balanced daily schedules for Vegetarian, Vegan, Egg, Non-Veg, and Jain preferences. Complete with allergen exclusions, 1-click meal swaps, and printable grocery lists.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>Plan Your Week</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Interactive3DCard>

          {/* Card 3: Ayurveda Knowledge Hub */}
          <Interactive3DCard className="h-full" elevation={6} maxTilt={5}>
            <div
              onClick={() => onNavigate('/ayurveda')}
              className="p-6 h-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-emerald-600/60 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    Dravyaguna &amp; Dinacharya
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 transition-colors">
                    Ayurveda &amp; Science Hub
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    12+ authentic botanical monographs with active phytochemicals, PubMed clinical reviews, herb-drug warnings, myth debunking, and circadian Dinacharya rituals.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                <span>Explore Herb Profiles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Interactive3DCard>

          {/* Card 4: Daily Wellness & Habit Tracker */}
          <Interactive3DCard className="h-full" elevation={6} maxTilt={5}>
            <div
              onClick={() => onNavigate('/habit-tracker')}
              className="p-6 h-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-sky-600/60 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-1">
                    Daily Mindfulness &amp; Ushapan
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-sky-700 transition-colors">
                    Wellness &amp; Habit Tracker
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    Interactive water intake counter (+250ml glass buttons), today's food calorie and macronutrient log, and classical Dinacharya habit checklist. Zero server tracking.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-sky-400">
                <span>Open Daily Tracker</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Interactive3DCard>

          {/* Card 5: Evidence-Based Wellness Calculators */}
          <Interactive3DCard className="h-full" elevation={6} maxTilt={5}>
            <div
              onClick={() => onNavigate('/wellness-calculators')}
              className="p-6 h-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-emerald-600/60 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    Scientific Equations
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 transition-colors">
                    Wellness Calculators
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    Asian Indian BMI benchmarks (WHO/ICMR threshold: normal 18.5-22.9), Mifflin-St Jeor TDEE calorie requirements, tropical climate hydration formula, and ICMR RDA protein ranges.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span>Run Diagnostics</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Interactive3DCard>

          {/* Card 6: Complete 46+ Tools Suite */}
          <Interactive3DCard className="h-full" elevation={6} maxTilt={5}>
            <div
              onClick={() => onNavigate('/tools')}
              className="p-6 h-full rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1">
                    All-in-One Utility Suite
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                    46+ Utility Tools
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    High-speed client-side tools: SIP calculator, loan EMI, 50/30/20 budget, ATS resume builder, PDF mergers, image compressors, and student exam readiness tools.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs font-semibold text-stone-800 dark:text-stone-200">
                <span>Browse Full Directory</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Interactive3DCard>

        </div>
      </section>

      {/* SCIENTIFIC INTEGRITY & ETHICAL POLICY */}
      <section className="py-12 bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-[#FBF9F5] dark:bg-[#0C1612]">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
                Authentic Citations Only
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                All nutritional values reference ICMR-NIN Indian Food Composition Tables (IFCT) &amp; USDA. Botanical profiles cite classical compendiums (Charaka Samhita) alongside peer-reviewed clinical trials.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-[#FBF9F5] dark:bg-[#0C1612]">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
                Responsible Health Stance
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                We never make miraculous cure claims or prescribe medicinal dosages. Traditional herbs are explored for culinary and supportive wellness, with clear contraindications and medication interactions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-[#FBF9F5] dark:bg-[#0C1612]">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
                100% Client-Side Privacy
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Your water tracking, food logs, and personal habits remain securely in your device's browser localStorage. No third-party data tracking or selling.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* POPULAR UTILITY TOOLS SPOTLIGHT (46+ Tools Preserved) */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Preserved Utilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Popular Calculators &amp; Student Tools
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              High-speed, browser-native calculation tools with zero lag and total data privacy.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/tools')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition"
          >
            <span>View All 46+ Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'SIP Calculator', path: '/tools/sip-calculator', desc: 'Mutual funds compounding with inflation', icon: TrendingUp },
            { name: '50/30/20 Budget Planner', path: '/tools/budget-calculator', desc: 'Needs, wants & savings allocation', icon: TrendingUp },
            { name: 'In-Hand Salary Calculator', path: '/tools/salary-calculator', desc: 'New vs Old Tax take-home pay', icon: Briefcase },
            { name: 'Loan EMI Calculator', path: '/tools/emi-calculator', desc: 'Home & car loan amortization schedule', icon: Landmark },
            { name: 'ATS Resume Builder', path: '/tools/resume-builder', desc: 'Clean, printable ATS-friendly resume creator', icon: Briefcase },
            { name: 'Scientific Calculator', path: '/tools/scientific-calculator', desc: 'Trigonometry, logs & advanced powers', icon: Calculator },
            { name: 'PDF Merge & Compress', path: '/pdf-tools', desc: 'Client-side PDF management in RAM', icon: Lock },
            { name: 'CGPA & GPA Calculator', path: '/tools/cgpa-calculator', desc: 'Semester credit-to-percentage conversion', icon: Award },
          ].map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(tool.path)}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 transition-colors">
                      {tool.name}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Google AdSense Display Banner */}
      <AdSenseDisplayAd />

    </div>
  );
};
