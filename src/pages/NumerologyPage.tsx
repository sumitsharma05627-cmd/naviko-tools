import React, { useState } from 'react';
import {
  Hash,
  Sparkles,
  User,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Star,
  RefreshCw,
  Info
} from 'lucide-react';
import { calculateNumerology, NumerologyProfile } from '../services/astrology/numerologyEngine';

interface NumerologyPageProps {
  onNavigate: (path: string) => void;
}

export const NumerologyPage: React.FC<NumerologyPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('Aarav Sharma');
  const [day, setDay] = useState(15);
  const [month, setMonth] = useState(11);
  const [year, setYear] = useState(1998);

  const [profile, setProfile] = useState<NumerologyProfile>(() =>
    calculateNumerology('Aarav Sharma', 15, 11, 1998)
  );

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(calculateNumerology(name, day, month, year));
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-950">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <span className="hover:underline cursor-pointer" onClick={() => onNavigate('/')}>NAVIKO 3.0</span>
              <span>/</span>
              <span className="text-white">Numerology Matrix</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Vedic &amp; Chaldean Numerology</span>
            </h1>
          </div>

          <button
            onClick={() => onNavigate('/navi-ai')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask NAVI AI About Your Numbers</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Input */}
          <div className="lg:col-span-4 bg-[#0d1326] rounded-3xl border border-indigo-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-amber-400" />
              <span>Enter Identity Details</span>
            </h3>

            <form onSubmit={handleRecalculate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Day</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Month</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Year</label>
                  <input
                    type="number"
                    min={1920}
                    max={2035}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-slate-950" />
                <span>Calculate Numerology</span>
              </button>
            </form>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-amber-500/20 text-[11px] text-slate-400 leading-snug">
              <strong>Methodology:</strong> Uses Pythagorean system for Destiny/Soul Urge and traditional Chaldean values for esoteric name vibration. Interpretations provide belief-based guidance and self-reflection.
            </div>
          </div>

          {/* Right Column: Numbers Matrix & Profiles */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Numbers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-[#0d1326] border-2 border-amber-500/40 text-center space-y-1 relative overflow-hidden">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  Life Path Number
                </span>
                <span className="text-4xl font-black text-amber-300 block my-1">
                  {profile.lifePathNumber}
                </span>
                <span className="text-xs text-slate-300 font-bold block">
                  Soul Archetype
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-[#0d1326] border border-indigo-900/50 text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                  Destiny (Expression)
                </span>
                <span className="text-4xl font-black text-white block my-1">
                  {profile.destinyNumber}
                </span>
                <span className="text-xs text-slate-300 font-bold block">
                  Life Mission
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-[#0d1326] border border-indigo-900/50 text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                  Birth (Psychic) Number
                </span>
                <span className="text-4xl font-black text-white block my-1">
                  {profile.birthDayNumber}
                </span>
                <span className="text-xs text-slate-300 font-bold block">
                  Inner Personality
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-[#0d1326] border border-indigo-900/50 text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                  Soul Urge (Vowels)
                </span>
                <span className="text-4xl font-black text-white block my-1">
                  {profile.soulUrgeNumber}
                </span>
                <span className="text-xs text-slate-300 font-bold block">
                  Inner Longing
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-[#0d1326] border border-indigo-900/50 text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                  Chaldean Name Number
                </span>
                <span className="text-4xl font-black text-white block my-1">
                  {profile.chaldeanNameNumber}
                </span>
                <span className="text-xs text-slate-300 font-bold block">
                  Vocal Vibration
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-[#0d1326] border border-amber-500/30 text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  Personal Year ({new Date().getFullYear()})
                </span>
                <span className="text-4xl font-black text-amber-400 block my-1">
                  {profile.personalYearNumber}
                </span>
                <span className="text-xs text-slate-300 font-bold block">
                  Current Annual Cycle
                </span>
              </div>
            </div>

            {/* In-Depth Profile Breakdown */}
            <div className="p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/60 shadow-xl space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Life Path {profile.lifePathNumber} Resonance Profile</span>
                </h3>
                <span className="text-amber-400 font-bold">Ruler: {profile.rulingPlanet}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="font-black text-amber-300 text-sm block">Core Strengths</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {profile.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="font-black text-rose-300 text-sm block">Growth Challenges</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {profile.challenges.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="font-black text-white text-sm block">Harmonious Colors &amp; Gems</span>
                <div className="flex flex-wrap gap-2">
                  {profile.luckyColors.map((col, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                      Color: {col}
                    </span>
                  ))}
                  {profile.luckyDays.map((d, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30">
                      Day: {d}
                    </span>
                  ))}
                  {profile.luckyGems.map((g, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                      Gemstone: {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-black text-white text-sm block">Relationship Compatibility &amp; Marriage</span>
                <p className="text-slate-300 leading-relaxed">
                  {profile.relationshipsInsight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
