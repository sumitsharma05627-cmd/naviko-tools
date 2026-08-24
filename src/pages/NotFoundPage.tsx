import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  ArrowLeft,
  Home,
  Layers,
  Sparkles,
  TrendingUp,
  GraduationCap,
  FileSpreadsheet,
  Calculator,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { TOOLS_DATA, CATEGORIES_META } from '../data/toolsData';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
  requestedPath?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigate,
  onOpenSearch,
  requestedPath
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'Page Not Found (404) — NAVIKO';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const filteredTools = query.trim()
    ? TOOLS_DATA.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.categoryName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const popularTools = [
    { name: 'National Debt Clock', path: '/tools/debt-clock', tag: 'Live' },
    { name: '50/30/20 Budget Planner', path: '/tools/budget-calculator', tag: 'Popular' },
    { name: 'SIP & Step-Up Calculator', path: '/tools/sip-calculator', tag: 'Finance' },
    { name: 'Image Compressor (KB)', path: '/tools/image-compressor', tag: 'Image' },
    { name: 'CGPA to Percentage', path: '/tools/cgpa-calculator', tag: 'CBSE' },
    { name: 'ATS Resume Builder', path: '/tools/resume-builder', tag: 'Career' },
    { name: 'Loan EMI Calculator', path: '/tools/emi-calculator', tag: 'Finance' },
    { name: 'PDF Merge & Combine', path: '/tools/pdf-merge', tag: 'PDF' },
    { name: 'Attendance 75% Calculator', path: '/tools/attendance-calculator', tag: 'Student' },
    { name: 'Scientific Calculator', path: '/tools/scientific-calculator', tag: 'Math' },
  ];

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full mx-auto relative z-10 text-center space-y-8">
        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-indigo-400 text-xs font-black tracking-widest uppercase shadow-xs">
          <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
          <span>Error 404 • Destination Not Found</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            We couldn’t find that page.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            {requestedPath ? (
              <>
                The path <code className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">{requestedPath}</code> may have been moved, renamed, or is temporarily unavailable.
              </>
            ) : (
              'The link you followed may be broken, or the page may have been moved to a new home.'
            )}
          </p>
        </div>

        {/* In-page Interactive Tool Search */}
        <div className="max-w-xl mx-auto bg-slate-800/90 p-2 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all 40+ NAVIKO tools..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900/90 text-white placeholder:text-slate-500 rounded-xl text-sm border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Real-time search dropdown results */}
          {query.trim() && (
            <div className="mt-2 text-left divide-y divide-slate-700/50 border-t border-slate-700/60 pt-2">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => onNavigate(tool.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-700/60 transition-colors text-left group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {tool.name}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{tool.shortDescription}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  No matching tools found for "{query}". Try browsing our categories below.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </button>

          <button
            onClick={() => onNavigate('/tools')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Browse All 40+ Tools</span>
          </button>
        </div>

        {/* Category Fast Navigation */}
        <div className="pt-6 border-t border-slate-800/80 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-4">
            Or Jump Directly to a Tool Hub
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => onNavigate('/student-tools')}
              className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-sky-300">Student Tools</div>
              <div className="text-[10px] text-slate-400">Timetable, CGPA &amp; Syllabus</div>
            </button>

            <button
              onClick={() => onNavigate('/finance-tools')}
              className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300">Finance &amp; Tax</div>
              <div className="text-[10px] text-slate-400">Debt Clock, SIP &amp; Budget</div>
            </button>

            <button
              onClick={() => onNavigate('/pdf-tools')}
              className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-rose-300">PDF Suite</div>
              <div className="text-[10px] text-slate-400">Merge, Split &amp; Compress</div>
            </button>

            <button
              onClick={() => onNavigate('/calculators')}
              className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300">Calculators</div>
              <div className="text-[10px] text-slate-400">Scientific, % &amp; Age</div>
            </button>
          </div>
        </div>

        {/* Popular Tool Quick Chips */}
        <div className="pt-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Frequently Visited Tools
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {popularTools.map((tool) => (
              <button
                key={tool.path}
                onClick={() => onNavigate(tool.path)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/70 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer hover:border-indigo-500/40"
              >
                <span>{tool.name}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-indigo-300 border border-slate-700">
                  {tool.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="pt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>NAVIKO Smart Productivity Suite — 100% Client-Side Privacy Guaranteed</span>
        </div>
      </div>
    </div>
  );
};
