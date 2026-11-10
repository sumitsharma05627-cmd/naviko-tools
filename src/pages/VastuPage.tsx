import React, { useState } from 'react';
import {
  Compass,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Home,
  Building2,
  MapPin,
  Sparkles
} from 'lucide-react';
import {
  VastuDirection,
  RoomPlacement,
  VastuAnalysisResult,
  evaluateVastu,
  DIRECTION_META
} from '../services/astrology/vastuEngine';

interface VastuPageProps {
  onNavigate: (path: string) => void;
}

const DEFAULT_ROOMS: RoomPlacement[] = [
  { id: '1', name: 'Main Entrance', type: 'entrance', direction: 'NE' },
  { id: '2', name: 'Kitchen', type: 'kitchen', direction: 'SE' },
  { id: '3', name: 'Master Bedroom', type: 'master_bedroom', direction: 'SW' },
  { id: '4', name: 'Mandir / Pooja Room', type: 'pooja', direction: 'NE' },
  { id: '5', name: 'Primary Restroom / Toilet', type: 'bathroom', direction: 'NW' },
  { id: '6', name: 'Living Hall', type: 'living', direction: 'N' },
  { id: '7', name: 'Children Study Room', type: 'study', direction: 'E' },
  { id: '8', name: 'Staircase Ascent', type: 'staircase', direction: 'S' },
];

export const VastuPage: React.FC<VastuPageProps> = ({ onNavigate }) => {
  const [propertyType, setPropertyType] = useState<VastuAnalysisResult['propertyType']>('home');
  const [facing, setFacing] = useState<VastuDirection>('E');
  const [rooms, setRooms] = useState<RoomPlacement[]>(DEFAULT_ROOMS);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VastuAnalysisResult>(() =>
    evaluateVastu('home', 'E', DEFAULT_ROOMS)
  );

  const handleRoomDirectionChange = (id: string, newDir: VastuDirection) => {
    const updated = rooms.map((r) => (r.id === id ? { ...r, direction: newDir } : r));
    setRooms(updated);
    setAnalysis(evaluateVastu(propertyType, facing, updated));
  };

  const handleFacingChange = (newFacing: VastuDirection) => {
    setFacing(newFacing);
    setAnalysis(evaluateVastu(propertyType, newFacing, rooms));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-950">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <span className="hover:underline cursor-pointer" onClick={() => onNavigate('/')}>NAVIKO 3.0</span>
              <span>/</span>
              <span>Vastu Shastra</span>
              <span>/</span>
              <span className="text-white">Interactive Floor-Plan &amp; Spatial Diagnostic</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Interactive Vastu Shastra Platform</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/navi-ai')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask NAVI AI for Remedies</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Controls & Floor-Plan Upload */}
          <div className="lg:col-span-5 space-y-6">
            {/* Property Parameters */}
            <div className="p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/60 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Property Orientation &amp; Type</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setPropertyType(t);
                      setAnalysis(evaluateVastu(t, facing, rooms));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-semibold"
                  >
                    <option value="home">Independent House / Villa</option>
                    <option value="apartment">Apartment / Flat</option>
                    <option value="office">Commercial Office / Clinic</option>
                    <option value="plot">Open Plot / Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Main Facing Direction</label>
                  <select
                    value={facing}
                    onChange={(e) => handleFacingChange(e.target.value as VastuDirection)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-semibold"
                  >
                    {Object.entries(DIRECTION_META).filter(([k]) => k !== 'Center').map(([k, meta]) => (
                      <option key={k} value={k}>
                        {meta.name} ({meta.hindi})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Floor Plan Upload */}
              <div className="pt-2">
                <label className="block text-slate-300 font-bold text-xs mb-1.5 flex items-center justify-between">
                  <span>Upload Floor-Plan Blueprint (Optional)</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-4 text-center transition-colors relative cursor-pointer bg-slate-900/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <img
                        src={uploadedImage}
                        alt="Uploaded Floor Plan"
                        className="max-h-40 mx-auto rounded-xl object-contain border border-slate-700"
                      />
                      <span className="text-[11px] text-emerald-400 font-bold block">
                        ✓ Floor Plan Loaded • Now map zones below
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="text-xs font-bold text-slate-200 block">
                        Click or drag blueprint image here
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Client-side visual reference. Zero server uploads.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Room Placement Mapper */}
            <div className="p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/60 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Map Functional Zones</span>
                </h3>
                <span className="text-[10px] text-slate-400">Select Direction</span>
              </div>

              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-black text-white block">{room.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {room.type.replace('_', ' ')}
                      </span>
                    </div>

                    <select
                      value={room.direction}
                      onChange={(e) => handleRoomDirectionChange(room.id, e.target.value as VastuDirection)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs"
                    >
                      {Object.entries(DIRECTION_META).map(([k, meta]) => (
                        <option key={k} value={k}>
                          {meta.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Directional Mandala & Diagnostic Evaluation */}
          <div className="lg:col-span-7 space-y-6">
            {/* Score Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1630] via-[#1a1f3d] to-[#0d1630] border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Comprehensive Spatial Assessment
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Vastu Compatibility: {analysis.overallScore} / 100
                </h2>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
                  Grade: {analysis.grade}
                </span>
              </div>

              <div className="relative w-24 h-24 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center bg-slate-950 shrink-0 shadow-lg shadow-amber-500/10">
                <span className="text-2xl font-black text-amber-300">{analysis.overallScore}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Score</span>
              </div>
            </div>

            {/* 8-Directional Vastu Purusha Mandala Visualizer */}
            <div className="p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/60 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>8-Directional Spatial Mandala</span>
                </h3>
                <span className="text-[10px] text-amber-400 font-bold">Facing: {facing}</span>
              </div>

              {/* 3x3 Grid Representing the 8 directions and Brahmasthan center */}
              <div className="grid grid-cols-3 gap-2.5 max-w-lg mx-auto p-2">
                {/* Row 1: NW, N, NE */}
                {[
                  { dir: 'NW' as VastuDirection, label: 'North-West (Vayu)', element: 'Air' },
                  { dir: 'N' as VastuDirection, label: 'North (Kuber)', element: 'Water' },
                  { dir: 'NE' as VastuDirection, label: 'North-East (Ishanya)', element: 'Water/Ether' },
                  { dir: 'W' as VastuDirection, label: 'West (Varuna)', element: 'Air' },
                  { dir: 'Center' as VastuDirection, label: 'Brahmasthan', element: 'Ether' },
                  { dir: 'E' as VastuDirection, label: 'East (Indra)', element: 'Fire/Light' },
                  { dir: 'SW' as VastuDirection, label: 'South-West (Earth)', element: 'Earth' },
                  { dir: 'S' as VastuDirection, label: 'South (Yama)', element: 'Earth' },
                  { dir: 'SE' as VastuDirection, label: 'South-East (Agni)', element: 'Fire' },
                ].map((slot) => {
                  const summary = analysis.directionSummaries[slot.dir];
                  const isCenter = slot.dir === 'Center';
                  return (
                    <div
                      key={slot.dir}
                      className={`p-3 rounded-2xl border text-center flex flex-col justify-between min-h-[95px] transition-all ${
                        isCenter
                          ? 'bg-amber-500/10 border-amber-500/50'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-black text-amber-400 block leading-tight">
                          {slot.dir}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold block">
                          {slot.element}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] font-extrabold text-white block truncate">
                          {summary?.currentUsage || 'Open Space'}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">
                          {summary?.balanceScore}% Bal
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Zone Evaluations */}
            <div className="p-6 rounded-3xl bg-[#0d1326] border border-indigo-900/60 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white">Specific Functional Zone Diagnostic</h3>
              <div className="space-y-3">
                {analysis.evaluations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm">{item.name}</span>
                        <span className="text-slate-400 font-bold">in {DIRECTION_META[item.assignedDirection].name}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'Ideal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        item.status === 'Good' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                        item.status === 'Challenging' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {item.status} ({item.score}/10)
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                      {item.impactDescription}
                    </p>

                    <div className="p-2.5 rounded-xl bg-[#070b19] border border-slate-800 text-[11px] text-amber-300/90 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Practical Vedic Remedy:</strong> {item.practicalRemedy}</span>
                    </div>
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
