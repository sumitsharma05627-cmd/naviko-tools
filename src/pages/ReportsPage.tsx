import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sun,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { generateKundli } from '../services/astrology/calculationEngine';
import { evaluateVastu } from '../services/astrology/vastuEngine';

interface ReportsPageProps {
  onNavigate: (path: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { plan } = useSubscription();
  const [downloading, setDownloading] = useState<string | null>(null);

  const sampleKundli = generateKundli({
    name: user?.name || 'Aarav Sharma',
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
  });

  const sampleVastu = evaluateVastu('home', 'E', [
    { id: '1', name: 'Main Entrance', type: 'entrance', direction: 'NE' },
    { id: '2', name: 'Kitchen', type: 'kitchen', direction: 'SE' },
    { id: '3', name: 'Master Bed', type: 'master_bedroom', direction: 'SW' },
    { id: '4', name: 'Pooja Room', type: 'pooja', direction: 'NE' },
  ]);

  const handlePrintDossier = (type: string) => {
    setDownloading(type);
    setTimeout(() => {
      window.print();
      setDownloading(null);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-950">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <span className="hover:underline cursor-pointer" onClick={() => onNavigate('/')}>NAVIKO 3.0</span>
              <span>/</span>
              <span className="text-white">Dossiers &amp; Reports</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>PDF Kundli &amp; Vastu Reports</span>
            </h1>
          </div>
          <div className="text-xs text-slate-400">
            Certified calculation timestamp: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Available Dossiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Complete Vedic Kundli Dossier */}
          <div className="p-6 rounded-3xl bg-[#0d1326] border border-amber-500/40 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                  Vedic Horoscope
                </span>
                <span className="text-xs text-emerald-400 font-bold">Free &amp; Pro Access</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Comprehensive Vedic Kundli Report (D1 &amp; D9)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Includes full birth chart, planetary degrees, Nakshatra Padas, Bhavas analysis, 120-year Vimshottari Mahadasha timeline, Gaja Kesari &amp; Budhaditya Yogas, and Manglik Dosha evaluation.
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>North Indian and South Indian chart diagrams</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Accurate Lahiri (Chitrapaksha) sidereal ephemeris</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Vimshottari Dasha periods &amp; transitions</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => handlePrintDossier('kundli')}
                disabled={downloading !== null}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>{downloading === 'kundli' ? 'Preparing Print...' : 'Download / Print Kundli PDF'}</span>
              </button>
            </div>
          </div>

          {/* 2. Interactive Vastu Diagnostic Dossier */}
          <div className="p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/60 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase">
                  Spatial Science
                </span>
                <span className="text-xs text-amber-400 font-bold">Interactive Floor Report</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Vastu Shastra Floor-Plan Analysis Report
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Includes 8-directional Vastu Purusha Mandala mapping, elemental score (Water, Fire, Earth, Air, Space), 10 functional room evaluations, and non-destructive remedies.
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Directional grid score (0-100 Compatibility)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Entrance, Kitchen &amp; Master Bed diagnostics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Practical remedies without structural demolition</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => handlePrintDossier('vastu')}
                disabled={downloading !== null}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-600"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>{downloading === 'vastu' ? 'Preparing Print...' : 'Download / Print Vastu PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Section (Hidden from screen view, visible during window.print) */}
        <div className="hidden print:block bg-white text-black p-8 rounded-none font-serif space-y-6">
          <div className="border-b-2 border-black pb-4 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-widest">NAVIKO 3.0 — Vedic Dossier</h1>
            <p className="text-xs text-gray-700">Official Vedic Ephemeris &amp; Vastu Spatial Analysis • naviko.in</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border border-gray-400 p-4">
            <div>
              <strong>Name:</strong> {sampleKundli.birthDetails.name || 'Aarav Sharma'}
            </div>
            <div>
              <strong>Birth Date &amp; Time:</strong> {sampleKundli.birthDetails.day}/{sampleKundli.birthDetails.month}/{sampleKundli.birthDetails.year} at {sampleKundli.birthDetails.hour}:{sampleKundli.birthDetails.minute}
            </div>
            <div>
              <strong>Location:</strong> {sampleKundli.birthDetails.city}, {sampleKundli.birthDetails.country}
            </div>
            <div>
              <strong>Ayanamsha:</strong> Lahiri ({sampleKundli.ayanamshaValue}°)
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold border-b border-gray-400 pb-1">Key Planetary Placements (D1)</h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border border-gray-300">Graha</th>
                  <th className="p-2 border border-gray-300">Rashi</th>
                  <th className="p-2 border border-gray-300">Longitude</th>
                  <th className="p-2 border border-gray-300">House</th>
                  <th className="p-2 border border-gray-300">Nakshatra</th>
                </tr>
              </thead>
              <tbody>
                {sampleKundli.planets.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 border border-gray-300 font-bold">{p.name}</td>
                    <td className="p-2 border border-gray-300">{p.rashiName}</td>
                    <td className="p-2 border border-gray-300 font-mono">{p.formattedDegree}</td>
                    <td className="p-2 border border-gray-300">House {p.house}</td>
                    <td className="p-2 border border-gray-300">{p.nakshatraName} ({p.pada})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 text-xs">
            <h3 className="text-sm font-bold border-b border-gray-400 pb-1">Vimshottari Dasha Current Phase</h3>
            <p>Active Mahadasha: <strong>{sampleKundli.vimshottariDasha.currentMahadasha}</strong></p>
            <p>Birth Balance: {sampleKundli.vimshottariDasha.balanceAtBirth}</p>
          </div>

          <div className="text-[10px] text-gray-500 pt-6 border-t border-gray-300 text-center">
            This document is generated by NAVIKO 3.0 based on classical Vedic methodologies. It provides reflective wisdom and ethical guidance.
          </div>
        </div>
      </div>
    </div>
  );
};
