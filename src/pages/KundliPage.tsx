import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  Layers,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Info,
  Download,
  Share2,
  Printer,
  Compass
} from 'lucide-react';
import {
  BirthDetails,
  KundliResult,
  generateKundli,
  ChartStyle,
  RASHIS,
  NAKSHATRAS
} from '../services/astrology/calculationEngine';

interface KundliPageProps {
  onNavigate: (path: string) => void;
}

const POPULAR_INDIAN_CITIES = [
  { city: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { city: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { city: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { city: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { city: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867, tz: 5.5 },
  { city: 'Varanasi', country: 'India', lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { city: 'Ahmedabad', country: 'India', lat: 23.0225, lon: 72.5714, tz: 5.5 },
  { city: 'Pune', country: 'India', lat: 18.5204, lon: 73.8567, tz: 5.5 },
  { city: 'Jaipur', country: 'India', lat: 26.9124, lon: 75.7873, tz: 5.5 },
];

export const KundliPage: React.FC<KundliPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<BirthDetails>({
    name: 'Aarav Sharma',
    year: 1998,
    month: 11,
    day: 15,
    hour: 14,
    minute: 30,
    city: 'New Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    gender: 'male',
  });

  const [chartStyle, setChartStyle] = useState<ChartStyle>('north');
  const [activeTab, setActiveTab] = useState<'chart' | 'planets' | 'houses' | 'dasha' | 'yogas'>('chart');
  const [activeKundli, setActiveKundli] = useState<KundliResult>(() => generateKundli(formData));
  const [isCalculated, setIsCalculated] = useState(true);

  const handleCityChange = (cityName: string) => {
    const found = POPULAR_INDIAN_CITIES.find((c) => c.city === cityName);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        city: found.city,
        country: found.country,
        latitude: found.lat,
        longitude: found.lon,
        timezone: found.tz,
      }));
    } else {
      setFormData((prev) => ({ ...prev, city: cityName }));
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = generateKundli(formData);
    setActiveKundli(result);
    setIsCalculated(true);
  };

  /**
   * North Indian Diamond Chart Visualizer (SVG)
   */
  const renderNorthIndianChart = (houses: KundliResult['housesD1'], title: string) => {
    // 12 North Indian diamond house mapping (House 1 is top center diamond, 4 is left, 7 is bottom, 10 is right)
    const houseCenters: Record<number, { x: number; y: number; rashiNum: number; planets: string[] }> = {
      1: { x: 200, y: 100, rashiNum: houses[0]?.rashiNumber, planets: houses[0]?.planetsHere.map(p => p.name) },
      2: { x: 100, y: 50, rashiNum: houses[1]?.rashiNumber, planets: houses[1]?.planetsHere.map(p => p.name) },
      3: { x: 50, y: 100, rashiNum: houses[2]?.rashiNumber, planets: houses[2]?.planetsHere.map(p => p.name) },
      4: { x: 100, y: 200, rashiNum: houses[3]?.rashiNumber, planets: houses[3]?.planetsHere.map(p => p.name) },
      5: { x: 50, y: 300, rashiNum: houses[4]?.rashiNumber, planets: houses[4]?.planetsHere.map(p => p.name) },
      6: { x: 100, y: 350, rashiNum: houses[5]?.rashiNumber, planets: houses[5]?.planetsHere.map(p => p.name) },
      7: { x: 200, y: 300, rashiNum: houses[6]?.rashiNumber, planets: houses[6]?.planetsHere.map(p => p.name) },
      8: { x: 300, y: 350, rashiNum: houses[7]?.rashiNumber, planets: houses[7]?.planetsHere.map(p => p.name) },
      9: { x: 350, y: 300, rashiNum: houses[8]?.rashiNumber, planets: houses[8]?.planetsHere.map(p => p.name) },
      10: { x: 300, y: 200, rashiNum: houses[9]?.rashiNumber, planets: houses[9]?.planetsHere.map(p => p.name) },
      11: { x: 350, y: 100, rashiNum: houses[10]?.rashiNumber, planets: houses[10]?.planetsHere.map(p => p.name) },
      12: { x: 300, y: 50, rashiNum: houses[11]?.rashiNumber, planets: houses[11]?.planetsHere.map(p => p.name) },
    };

    return (
      <div className="flex flex-col items-center">
        <h4 className="text-sm font-black text-amber-300 mb-3 flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>{title}</span>
        </h4>
        <div className="relative w-full max-w-[420px] aspect-square bg-[#080d1f] rounded-2xl border-2 border-amber-500/50 p-2 shadow-2xl">
          <svg viewBox="0 0 400 400" className="w-full h-full stroke-amber-500/70 fill-none stroke-[1.5]">
            {/* Outer Box */}
            <rect x="10" y="10" width="380" height="380" className="stroke-amber-500" strokeWidth="2.5" />
            {/* Diagonals */}
            <line x1="10" y1="10" x2="390" y2="390" />
            <line x1="10" y1="390" x2="390" y2="10" />
            {/* Inner Diamond */}
            <polygon points="200,10 390,200 200,390 10,200" className="stroke-amber-400" strokeWidth="2" />
          </svg>

          {/* House Contents Overlay */}
          {Object.entries(houseCenters).map(([hNum, data]) => (
            <div
              key={hNum}
              style={{ left: `${(data.x / 400) * 100}%`, top: `${(data.y / 400) * 100}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-20"
            >
              <span className="text-[10px] font-black text-amber-400/90 block leading-none">
                {data.rashiNum}
              </span>
              <div className="mt-0.5 space-y-0.5">
                {data.planets.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-1 py-0.2 rounded bg-amber-500/20 text-white font-extrabold text-[9px] mx-0.5 border border-amber-500/30"
                  >
                    {p.substring(0, 3)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * South Indian Box Chart Visualizer
   */
  const renderSouthIndianChart = (houses: KundliResult['housesD1'], title: string) => {
    // In South Indian charts, Signs are fixed (Pisces top left-second, Aries top second, etc.)
    const rashiFixedGrid = [
      { rashi: 12, name: 'Pisces', row: 0, col: 0 },
      { rashi: 1, name: 'Aries', row: 0, col: 1 },
      { rashi: 2, name: 'Taurus', row: 0, col: 2 },
      { rashi: 3, name: 'Gemini', row: 0, col: 3 },
      { rashi: 11, name: 'Aquarius', row: 1, col: 0 },
      // Center 2x2 is empty
      { rashi: 4, name: 'Cancer', row: 1, col: 3 },
      { rashi: 10, name: 'Capricorn', row: 2, col: 0 },
      { rashi: 5, name: 'Leo', row: 2, col: 3 },
      { rashi: 9, name: 'Sagittarius', row: 3, col: 0 },
      { rashi: 8, name: 'Scorpio', row: 3, col: 1 },
      { rashi: 7, name: 'Libra', row: 3, col: 2 },
      { rashi: 6, name: 'Virgo', row: 3, col: 3 },
    ];

    return (
      <div className="flex flex-col items-center">
        <h4 className="text-sm font-black text-amber-300 mb-3 flex items-center gap-1.5">
          <Moon className="w-4 h-4 text-amber-400" />
          <span>{title}</span>
        </h4>
        <div className="w-full max-w-[420px] aspect-square grid grid-cols-4 grid-rows-4 bg-[#080d1f] rounded-2xl border-2 border-amber-500/60 p-1 shadow-2xl relative">
          {rashiFixedGrid.map((cell) => {
            const house = houses.find((h) => h.rashiNumber === cell.rashi);
            const isAscendant = activeKundli.ascendant.rashiNumber === cell.rashi;
            return (
              <div
                key={cell.rashi}
                style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
                className={`p-1.5 border border-amber-500/30 flex flex-col justify-between rounded-lg relative overflow-hidden ${
                  isAscendant ? 'bg-amber-500/10 border-amber-400' : 'bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-bold text-amber-400">
                  <span>{cell.name.substring(0, 3)}</span>
                  {isAscendant && (
                    <span className="px-1 rounded bg-amber-500 text-slate-950 font-black text-[8px]">
                      ASC
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {house?.planetsHere.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-1 py-0.2 rounded bg-indigo-500/30 text-white text-[9px] font-black border border-indigo-400/40"
                    >
                      {p.name.substring(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {/* South Indian Center Label */}
          <div className="col-start-2 col-span-2 row-start-2 row-span-2 flex flex-col items-center justify-center border border-amber-500/20 bg-[#0b1226]/80 rounded-xl p-3 text-center">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
              NAVIKO 3.0
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              Lahiri Ephemeris
            </span>
            <span className="text-[9px] font-bold text-amber-500 mt-0.5">
              Lagna: {activeKundli.ascendant.rashiName}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-950">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <span className="hover:underline cursor-pointer" onClick={() => onNavigate('/')}>NAVIKO 3.0</span>
              <span>/</span>
              <span>Vedic Astrology</span>
              <span>/</span>
              <span className="text-white">Kundli Generator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Vedic Kundli Generator</span>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Lahiri Ayanamsha
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Chart Style Switcher */}
            <div className="p-1 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setChartStyle('north')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  chartStyle === 'north'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                North Indian
              </button>
              <button
                type="button"
                onClick={() => setChartStyle('south')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  chartStyle === 'south'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                South Indian
              </button>
            </div>

            <button
              onClick={() => onNavigate('/navi-ai')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask NAVI AI</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Birth Form */}
          <div className="lg:col-span-4 bg-[#0d1326] rounded-3xl border border-indigo-900/60 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Enter Birth Details</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Editable Profile</span>
            </div>

            <form onSubmit={handleCalculate} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-semibold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Date of Birth */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Day</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Month</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Year</label>
                  <input
                    type="number"
                    min={1920}
                    max={2035}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>

              {/* Time of Birth */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hour (24h)</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={formData.hour}
                    onChange={(e) => setFormData({ ...formData, hour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Minute</label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>

              {/* Birth City Dropdown / Input */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Birth City (India &amp; Global)</label>
                <select
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-semibold focus:outline-hidden focus:border-amber-500 mb-2"
                >
                  {POPULAR_INDIAN_CITIES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city}, {c.country} ({c.lat.toFixed(2)}°N, {c.lon.toFixed(2)}°E)
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom city name"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-950" />
                  <span>Calculate Real Kundli</span>
                </button>
              </div>
            </form>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-amber-500/20 text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ephemeris Verification</span>
              </div>
              <p>
                Ayanamsha: <strong>Lahiri (Chitrapaksha)</strong> • Julian Day: {activeKundli.julianDay} • LST: {activeKundli.localSiderealTime}°
              </p>
            </div>
          </div>

          {/* Right Column: Chart Display & Deep Astrology Intelligence */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#0d1326] border border-amber-500/30 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Ascendant (Lagna)
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300 mt-0.5 block">
                  {activeKundli.ascendant.rashiName}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {activeKundli.ascendant.formattedDegree}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d1326] border border-indigo-900/50 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Moon Sign (Rashi)
                </span>
                <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
                  {activeKundli.moonDetails.rashiName}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Lord: {activeKundli.ascendant.rashiLord}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d1326] border border-indigo-900/50 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Nakshatra
                </span>
                <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
                  {activeKundli.moonDetails.nakshatraName}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">
                  Pada {activeKundli.moonDetails.pada} ({activeKundli.moonDetails.nakshatraLord})
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d1326] border border-indigo-900/50 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Current Mahadasha
                </span>
                <span className="text-base sm:text-lg font-black text-amber-400 mt-0.5 block">
                  {activeKundli.vimshottariDasha.currentMahadasha}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {activeKundli.vimshottariDasha.dashaTimeline[0]?.durationYears} yrs at birth
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 text-xs font-bold gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'chart'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                Kundli Charts (D1 &amp; D9)
              </button>
              <button
                onClick={() => setActiveTab('planets')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'planets'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                Planetary Positions
              </button>
              <button
                onClick={() => setActiveTab('houses')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'houses'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                12 Bhavas (Houses)
              </button>
              <button
                onClick={() => setActiveTab('dasha')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'dasha'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                Vimshottari Dasha
              </button>
              <button
                onClick={() => setActiveTab('yogas')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'yogas'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                Yogas &amp; Manglik Status
              </button>
            </div>

            {/* Tab 1: Charts (D1 & D9) */}
            {activeTab === 'chart' && (
              <div className="p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/40 shadow-xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {chartStyle === 'north'
                    ? renderNorthIndianChart(activeKundli.housesD1, 'Lagna Chart (D1)')
                    : renderSouthIndianChart(activeKundli.housesD1, 'Lagna Chart (D1)')}

                  {chartStyle === 'north'
                    ? renderNorthIndianChart(
                        activeKundli.navamsaD9.map((n) => ({
                          houseNumber: n.houseNumber,
                          rashiNumber: n.rashiNumber,
                          rashiName: RASHIS[n.rashiNumber - 1]?.name || '',
                          rashiLord: RASHIS[n.rashiNumber - 1]?.lord || '',
                          degreeSpan: '',
                          planetsHere: n.planetsHere.map((p) => ({ name: p } as any)),
                          significance: '',
                          significanceHindi: '',
                        })),
                        'Navamsa Chart (D9)'
                      )
                    : renderSouthIndianChart(
                        activeKundli.navamsaD9.map((n) => ({
                          houseNumber: n.houseNumber,
                          rashiNumber: n.rashiNumber,
                          rashiName: RASHIS[n.rashiNumber - 1]?.name || '',
                          rashiLord: RASHIS[n.rashiNumber - 1]?.lord || '',
                          degreeSpan: '',
                          planetsHere: n.planetsHere.map((p) => ({ name: p } as any)),
                          significance: '',
                          significanceHindi: '',
                        })),
                        'Navamsa Chart (D9)'
                      )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Astrological Interpretation Rule:</strong> D1 (Lagna Chart) reveals physical manifestation, external vitality, and temporal life circumstances. D9 (Navamsa Chart) acts as the microscopic spiritual inner core, highlighting married life harmony, hidden dharma, and post-maturity soul trajectory.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Planetary Positions Table */}
            {activeTab === 'planets' && (
              <div className="rounded-3xl bg-[#0d1326] border border-indigo-900/40 shadow-xl overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">Nirayana Planetary Positions</h3>
                  <span className="text-xs text-amber-400 font-bold">Lahiri Ephemeris</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Planet (Graha)</th>
                        <th className="py-3 px-4">Rashi (Sign)</th>
                        <th className="py-3 px-4">Longitude</th>
                        <th className="py-3 px-4">House</th>
                        <th className="py-3 px-4">Nakshatra &amp; Pada</th>
                        <th className="py-3 px-4">Dignity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {activeKundli.planets.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4 font-bold flex items-center gap-2">
                            <span className="text-amber-400 font-black">{p.symbol}</span>
                            <span>{p.name}</span>
                            {p.isRetrograde && (
                              <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Retro
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {p.rashiName} ({p.rashiNumber})
                          </td>
                          <td className="py-3 px-4 font-mono text-amber-300">
                            {p.formattedDegree}
                          </td>
                          <td className="py-3 px-4 font-bold">
                            House {p.house}
                          </td>
                          <td className="py-3 px-4">
                            {p.nakshatraName} - Pada {p.pada}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.dignity === 'Exalted' ? 'bg-emerald-500/20 text-emerald-300' :
                              p.dignity === 'Own Sign' ? 'bg-indigo-500/20 text-indigo-300' :
                              p.dignity === 'Debilitated' ? 'bg-rose-500/20 text-rose-300' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {p.dignity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: 12 Houses */}
            {activeTab === 'houses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeKundli.housesD1.map((h) => (
                  <div key={h.houseNumber} className="p-4 rounded-2xl bg-[#0d1326] border border-indigo-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-amber-300">Bhava {h.houseNumber}</span>
                      <span className="text-slate-400">{h.rashiName} (Lord: {h.rashiLord})</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      {h.significance}
                    </p>
                    <div className="text-[11px] text-slate-400">
                      <strong>Occupying Planets: </strong>
                      {h.planetsHere.length > 0
                        ? h.planetsHere.map((p) => p.name).join(', ')
                        : 'None (Ruled externally)'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Vimshottari Dasha */}
            {activeTab === 'dasha' && (
              <div className="rounded-3xl bg-[#0d1326] border border-indigo-900/40 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-black text-white">Vimshottari Mahadasha Timeline</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{activeKundli.vimshottariDasha.balanceAtBirth}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400">120-Year Cycle</span>
                </div>
                <div className="space-y-2 text-xs">
                  {activeKundli.vimshottariDasha.dashaTimeline.map((d, idx) => {
                    const isCurrent = d.planet === activeKundli.vimshottariDasha.currentMahadasha;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-amber-500/15 border-amber-500/40 text-white font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black ${
                            isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-black text-sm">{d.planet} Mahadasha</span>
                            <span className="block text-[10px] text-slate-400">{d.hindiPlanet} • {d.durationYears} Years</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono">{d.startDate} to {d.endDate}</span>
                          {isCurrent && (
                            <span className="block text-[10px] text-amber-400 font-black uppercase">
                              Active Current Phase
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 5: Yogas & Manglik */}
            {activeTab === 'yogas' && (
              <div className="space-y-6">
                {/* Manglik Dosha Box */}
                <div className="p-6 rounded-3xl bg-[#0d1326] border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>Manglik (Kuja) Dosha Analysis</span>
                    </h3>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      activeKundli.manglikStatus.isManglik
                        ? activeKundli.manglikStatus.cancellation
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {activeKundli.manglikStatus.isManglik
                        ? activeKundli.manglikStatus.cancellation
                          ? 'Manglik (Cancelled)'
                          : 'Manglik Active'
                        : 'Non-Manglik'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeKundli.manglikStatus.reason}
                  </p>
                </div>

                {/* Yogas Found */}
                <div className="p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/40 space-y-4">
                  <h3 className="text-base font-black text-white">Prominent Classical Yogas Detected</h3>
                  <div className="space-y-3">
                    {activeKundli.yogas.map((yoga, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-amber-300 text-sm font-black">{yoga.name} ({yoga.hindiName})</span>
                          <span className="text-[10px] text-emerald-400 uppercase font-black">{yoga.type}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {yoga.description}
                        </p>
                        <div className="text-[10px] text-slate-400 pt-1">
                          Planets contributing: {yoga.planetsInvolved.join(' + ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
