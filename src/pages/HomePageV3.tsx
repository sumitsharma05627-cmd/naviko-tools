import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  Calendar,
  Hash,
  Bot,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon,
  Home,
  Crown
} from 'lucide-react';
import { useVersion } from '../context/VersionContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { VersionSwitcher } from '../components/VersionSwitcher';
import { useSEO } from '../utils/seo';

interface HomePageV3Props {
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const HomePageV3: React.FC<HomePageV3Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { plan } = useSubscription();
  const [activeTab, setActiveTab] = useState<'all' | 'astrology' | 'vastu' | 'panchang' | 'numerology'>('all');

  useSEO({
    title: 'NAVIKO 3.0 — Vedic Astrology, Kundli & Vastu Shastra',
    description:
      'Generate authentic Vedic Kundli charts with true Lahiri Ayanamsha, analyze floor-plans via interactive Vastu Shastra, consult live Panchang timings, and converse with NAVI AI.',
    canonical: '/v3',
  });

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* 1. Celestial Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#0d1630] via-[#1a1c3d] to-[#0d1630] border-b border-amber-500/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            NAVIKO 3.0 Live
          </span>
          <span className="text-slate-300">
            Vedic Ephemeris calculations (Chitrapaksha / Lahiri Ayanamsha) + AI-guided classical explanations.
          </span>
          <button
            onClick={() => onNavigate('/kundli')}
            className="text-amber-400 hover:text-amber-300 font-extrabold underline underline-offset-4 cursor-pointer inline-flex items-center gap-1"
          >
            Generate Your Kundli Free <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Hero Section: Midnight Navy & Subtle Gold */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-indigo-950/80">
        {/* Subtle Celestial Star Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-500/10 via-indigo-600/15 to-purple-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wide shadow-lg shadow-amber-500/5">
            <span className="text-amber-400">🕉️</span>
            <span>VEDIC JYOTISH &amp; VASTU INTELLIGENCE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-400 font-normal">Authentic Indian Wisdom</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Ancient Vedic Wisdom.{' '}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Precision Modern Tech.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
            Generate authentic Vedic Kundli charts with true Lahiri Ayanamsha, analyze your home or office floor-plan via interactive Vastu, consult live Panchang timings, and converse with <strong>NAVI AI</strong>.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('/kundli')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Create Your Kundli Free</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('/vastu')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Interactive Vastu Analysis</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Ephemeris Verified Calculations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Zero Astrological Guesswork
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-purple-400" />
              North &amp; South Indian Chart Layouts
            </span>
          </div>
        </div>
      </section>

      {/* 3. Core Modules Grid (The 5 Pillars of NAVIKO 3.0) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-indigo-950 gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
              NAVIKO 3.0 Modules
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Dedicated Vedic &amp; Spatial Sciences
            </h2>
          </div>
          <div className="text-xs text-slate-400 max-w-md">
            Strictly focused on Jyotish, Vastu, Panchang, and Numerology. Productivity and nutrition tools remain preserved in NAVIKO 1.0 &amp; 2.0.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Kundli Generator */}
          <div
            onClick={() => onNavigate('/kundli')}
            className="group p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/40 hover:border-amber-500/50 shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Sun className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Vedic Astrology (Jyotish)
              </div>
              <h3 className="text-xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                Birth Chart &amp; Kundli Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Generate detailed Lagna (D1) and Navamsa (D9) charts. Full planetary degrees, Retrograde status, Nakshatra Padas, and Vimshottari Mahadasha.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-amber-400">
              <span>North &amp; South Indian styles</span>
              <span className="group-hover:translate-x-1 transition-transform">Open Generator →</span>
            </div>
          </div>

          {/* Card 2: Interactive Vastu */}
          <div
            onClick={() => onNavigate('/vastu')}
            className="group p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/40 hover:border-amber-500/50 shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Vastu Shastra
              </div>
              <h3 className="text-xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                Interactive Vastu Analyzer
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Upload floor plans, select North, place 10 key functional zones (Entrance, Kitchen, Master Bed, Mandir, Bath) and receive a 100-point Vastu score with non-destructive remedies.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-indigo-400">
              <span>8 &amp; 16 Directional Grid</span>
              <span className="group-hover:translate-x-1 transition-transform">Analyze Layout →</span>
            </div>
          </div>

          {/* Card 3: Panchang & Muhurat */}
          <div
            onClick={() => onNavigate('/panchang')}
            className="group p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/40 hover:border-amber-500/50 shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Daily Ephemeris
              </div>
              <h3 className="text-xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                Panchang &amp; Shubh Muhurat
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Live daily Tithi, Vara, Nakshatra, Yoga, and Karana for your exact city coordinates. View Rahu Kaal, Abhijit Muhurat, and Day/Night Choghadiya.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-emerald-400">
              <span>City-based precision</span>
              <span className="group-hover:translate-x-1 transition-transform">View Today's Panchang →</span>
            </div>
          </div>

          {/* Card 4: Numerology Engine */}
          <div
            onClick={() => onNavigate('/numerology')}
            className="group p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/40 hover:border-amber-500/50 shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Hash className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Vedic &amp; Chaldean
              </div>
              <h3 className="text-xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                Numerology Matrix
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Discover your Life Path Number, Destiny Number, Soul Urge, Personal Year cycle, and ruling planetary vibrations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-purple-400">
              <span>Chaldean &amp; Pythagorean</span>
              <span className="group-hover:translate-x-1 transition-transform">Calculate Numbers →</span>
            </div>
          </div>

          {/* Card 5: NAVI AI Assistant */}
          <div
            onClick={() => onNavigate('/navi-ai')}
            className="group p-6 rounded-3xl bg-gradient-to-b from-[#141b36] to-[#0d1326] border-2 border-amber-500/40 hover:border-amber-400 shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase rounded-bl-xl shadow-xs">
              AI-POWERED
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-5 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Intelligent Guide
              </div>
              <h3 className="text-xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                NAVI AI Astrology &amp; Vastu
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Conversational assistant grounded in your calculated Kundli and Vastu coordinates. Explains Dasha transitions, Nakshatras, and remedial guidance in English and Hindi.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-500/20 flex items-center justify-between text-xs font-extrabold text-amber-300">
              <span>Hindi &amp; English bilingual</span>
              <span className="group-hover:translate-x-1 transition-transform">Ask NAVI AI →</span>
            </div>
          </div>

          {/* Card 6: Comprehensive Reports & Export */}
          <div
            onClick={() => onNavigate('/reports')}
            className="group p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/40 hover:border-amber-500/50 shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Full Life Dossiers
              </div>
              <h3 className="text-xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                PDF Kundli &amp; Vastu Reports
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Download beautifully formatted printable Vedic birth dossiers including charts, planetary tables, Yogas, and directional floor-plan evaluations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-rose-400">
              <span>Export Dossiers</span>
              <span className="group-hover:translate-x-1 transition-transform">Explore Reports →</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ecosystem Banner: Remind user of NAVIKO 1.0 & 2.0 availability */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c1429] via-[#161a38] to-[#0c1429] border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Layers className="w-3.5 h-3.5" />
              <span>THE NAVIKO MULTI-VERSION PLATFORM</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Looking for Calculators or Nutrition Science?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Switch seamlessly using the top version control: <strong>NAVIKO 1.0</strong> for 46+ productivity utilities and <strong>NAVIKO 2.0</strong> for Indian nutrition &amp; Ayurveda.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/v1')}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all"
            >
              Go to NAVIKO 1.0 (Tools)
            </button>
            <button
              onClick={() => onNavigate('/v2')}
              className="px-5 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold text-xs cursor-pointer transition-all"
            >
              Go to NAVIKO 2.0 (Nutrition)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
