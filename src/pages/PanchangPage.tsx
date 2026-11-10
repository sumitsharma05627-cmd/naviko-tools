import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { calculatePanchang, PanchangData } from '../services/astrology/panchangEngine';

interface PanchangPageProps {
  onNavigate: (path: string) => void;
}

const POPULAR_CITIES = [
  { city: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { city: 'Varanasi', country: 'India', lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { city: 'Ujjain', country: 'India', lat: 23.1765, lon: 75.7885, tz: 5.5 },
  { city: 'Haridwar', country: 'India', lat: 29.9457, lon: 78.1642, tz: 5.5 },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { city: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { city: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { city: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, tz: 5.5 },
];

export const PanchangPage: React.FC<PanchangPageProps> = ({ onNavigate }) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedCity, setSelectedCity] = useState(POPULAR_CITIES[0]);

  const dateObj = new Date(selectedDate);
  const panchang: PanchangData = calculatePanchang(
    dateObj,
    selectedCity.lat,
    selectedCity.lon,
    selectedCity.tz,
    selectedCity.city
  );

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-950">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <span className="hover:underline cursor-pointer" onClick={() => onNavigate('/')}>NAVIKO 3.0</span>
              <span>/</span>
              <span className="text-white">Daily Vedic Panchang &amp; Shubh Muhurat</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Today's Vedic Panchang</span>
            </h1>
          </div>

          {/* Date & City Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0d1326] px-3 py-2 rounded-xl border border-indigo-900/60 text-xs">
              <Calendar className="w-4 h-4 text-amber-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-hidden cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#0d1326] px-3 py-2 rounded-xl border border-indigo-900/60 text-xs">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedCity.city}
                onChange={(e) => {
                  const c = POPULAR_CITIES.find((p) => p.city === e.target.value) || POPULAR_CITIES[0];
                  setSelectedCity(c);
                }}
                className="bg-transparent text-white font-bold focus:outline-hidden cursor-pointer"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c.city} value={c.city} className="bg-slate-900 text-white">
                    {c.city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 5 Angas (Pillars) of Panchang Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Tithi */}
          <div className="p-5 rounded-3xl bg-[#0d1326] border border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              1. Tithi (Lunar Phase)
            </span>
            <span className="text-lg font-black text-white block">
              {panchang.tithi.name}
            </span>
            <span className="text-xs text-amber-300 font-semibold block">
              {panchang.tithi.hindiName}
            </span>
            <div className="pt-2 text-[10px] text-slate-400">
              {panchang.tithi.percentageElapsed}% elapsed
            </div>
          </div>

          {/* 2. Vara */}
          <div className="p-5 rounded-3xl bg-[#0d1326] border border-indigo-900/50 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
              2. Vara (Solar Day)
            </span>
            <span className="text-lg font-black text-white block">
              {panchang.vara.day}
            </span>
            <span className="text-xs text-indigo-300 font-semibold block">
              {panchang.vara.hindiName}
            </span>
            <div className="pt-2 text-[10px] text-slate-400">
              Lord: {panchang.vara.rulingPlanet}
            </div>
          </div>

          {/* 3. Nakshatra */}
          <div className="p-5 rounded-3xl bg-[#0d1326] border border-emerald-900/50 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
              3. Nakshatra (Lunar Asterism)
            </span>
            <span className="text-lg font-black text-white block">
              {panchang.nakshatra.name}
            </span>
            <span className="text-xs text-emerald-300 font-semibold block">
              Pada {panchang.nakshatra.pada}
            </span>
            <div className="pt-2 text-[10px] text-slate-400">
              Lord: {panchang.nakshatra.lord}
            </div>
          </div>

          {/* 4. Yoga */}
          <div className="p-5 rounded-3xl bg-[#0d1326] border border-purple-900/50 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
              4. Yoga (Sun + Moon)
            </span>
            <span className="text-lg font-black text-white block">
              {panchang.yoga.name}
            </span>
            <span className="text-xs text-purple-300 font-semibold block">
              {panchang.yoga.hindiName}
            </span>
            <div className="pt-2 text-[10px] text-emerald-400 font-bold">
              {panchang.yoga.auspiciousness}
            </div>
          </div>

          {/* 5. Karana */}
          <div className="p-5 rounded-3xl bg-[#0d1326] border border-rose-900/50 text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
              5. Karana (Half-Tithi)
            </span>
            <span className="text-lg font-black text-white block">
              {panchang.karana.name}
            </span>
            <span className="text-xs text-rose-300 font-semibold block">
              {panchang.karana.hindiName}
            </span>
            <div className="pt-2 text-[10px] text-slate-400">
              {panchang.karana.type}
            </div>
          </div>
        </div>

        {/* Sunrise & Timing Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auspicious Timings */}
          <div className="p-6 rounded-3xl bg-[#0d1326] border border-emerald-900/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Shubh Muhurat (Auspicious Windows)</span>
              </h3>
              <span className="text-xs text-emerald-400 font-bold">Highly Recommended</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <span className="font-black text-white text-sm block">Abhijit Muhurat</span>
                  <span className="text-[11px] text-slate-300">{panchang.auspiciousPeriods.abhijitMuhurat.significance}</span>
                </div>
                <span className="font-mono text-emerald-300 font-black text-sm whitespace-nowrap ml-3">
                  {panchang.auspiciousPeriods.abhijitMuhurat.start} - {panchang.auspiciousPeriods.abhijitMuhurat.end}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-between">
                <div>
                  <span className="font-black text-white text-sm block">Brahma Muhurat</span>
                  <span className="text-[11px] text-slate-300">{panchang.auspiciousPeriods.brahmaMuhurat.significance}</span>
                </div>
                <span className="font-mono text-emerald-300 font-black text-sm whitespace-nowrap ml-3">
                  {panchang.auspiciousPeriods.brahmaMuhurat.start} - {panchang.auspiciousPeriods.brahmaMuhurat.end}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-between">
                <div>
                  <span className="font-black text-white text-sm block">Amrit Kaal</span>
                  <span className="text-[11px] text-slate-300">{panchang.auspiciousPeriods.amritKaal.significance}</span>
                </div>
                <span className="font-mono text-emerald-300 font-black text-sm whitespace-nowrap ml-3">
                  {panchang.auspiciousPeriods.amritKaal.start} - {panchang.auspiciousPeriods.amritKaal.end}
                </span>
              </div>
            </div>
          </div>

          {/* Inauspicious Timings (Ashubh) */}
          <div className="p-6 rounded-3xl bg-[#0d1326] border border-rose-900/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Ashubh Kaal (Inauspicious Windows)</span>
              </h3>
              <span className="text-xs text-rose-400 font-bold">Avoid Initiations</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 flex items-center justify-between">
                <div>
                  <span className="font-black text-white text-sm block">Rahu Kaal (Avoid New Tasks)</span>
                  <span className="text-[11px] text-slate-300">{panchang.inauspiciousPeriods.rahuKaal.significance}</span>
                </div>
                <span className="font-mono text-rose-300 font-black text-sm whitespace-nowrap ml-3">
                  {panchang.inauspiciousPeriods.rahuKaal.start} - {panchang.inauspiciousPeriods.rahuKaal.end}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-800/30 flex items-center justify-between">
                <div>
                  <span className="font-black text-white text-sm block">Yamaganda</span>
                  <span className="text-[11px] text-slate-300">{panchang.inauspiciousPeriods.yamaganda.significance}</span>
                </div>
                <span className="font-mono text-rose-300 font-black text-sm whitespace-nowrap ml-3">
                  {panchang.inauspiciousPeriods.yamaganda.start} - {panchang.inauspiciousPeriods.yamaganda.end}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-800/30 flex items-center justify-between">
                <div>
                  <span className="font-black text-white text-sm block">Gulika Kaal</span>
                  <span className="text-[11px] text-slate-300">{panchang.inauspiciousPeriods.gulikaKaal.significance}</span>
                </div>
                <span className="font-mono text-rose-300 font-black text-sm whitespace-nowrap ml-3">
                  {panchang.inauspiciousPeriods.gulikaKaal.start} - {panchang.inauspiciousPeriods.gulikaKaal.end}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Choghadiya Tables (Day & Night) */}
        <div className="p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/60 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-white">Day &amp; Night Choghadiya</h3>
              <p className="text-xs text-slate-400">8 intervals of daytime and 8 intervals of nighttime</p>
            </div>
            <span className="text-xs text-amber-400 font-bold">Amrit, Shubh &amp; Labh are Auspicious</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Daytime Choghadiya */}
            <div>
              <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Day Choghadiya (Sunrise to Sunset)</span>
              </h4>
              <div className="space-y-1.5">
                {panchang.choghadiya.daySlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      slot.isGood
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-black">{slot.name}</span>
                    <span className="font-mono">{slot.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nighttime Choghadiya */}
            <div>
              <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Night Choghadiya (Sunset to Next Sunrise)</span>
              </h4>
              <div className="space-y-1.5">
                {panchang.choghadiya.nightSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      slot.isGood
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-black">{slot.name}</span>
                    <span className="font-mono">{slot.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
