import React from 'react';
import { Crown, Sparkles, ShieldCheck, Zap, Layers } from 'lucide-react';

interface Premium3DVisualProps {
  onUpgrade?: () => void;
}

export const Premium3DVisual: React.FC<Premium3DVisualProps> = ({ onUpgrade }) => {
  return (
    <div
      className="relative w-full max-w-4xl mx-auto my-6 p-1 select-none"
      style={{ perspective: '1200px' }}
      aria-label="3D Premium Showcase"
    >
      <div
        className="relative rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/80 to-slate-950 p-6 sm:p-8 border border-purple-500/40 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Holographic Iridescent Accent Glow */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-30"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, rgba(217, 70, 239, 0.25) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.25) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        {/* Left: 3D Emblem & Title */}
        <div className="flex items-center gap-5 relative z-10">
          {/* Floating 3D Crown Crystal */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 p-[2px] shadow-xl shadow-purple-900/50 flex-shrink-0 group hover:scale-105 transition-transform"
            style={{ transform: 'translateZ(20px)' }}
          >
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-amber-400/20" />
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-float-gentle relative z-10" />
            </div>
          </div>

          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Next-Generation Capability</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              NAVIKO Plus &amp; Pro Power Workspace
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md leading-relaxed">
              Batch processing, 7-day personalized meal matrix, diagnostic score projection, and zero ad distractions.
            </p>
          </div>
        </div>

        {/* Right: Quick Features & Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Zero Lock-in
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-medium">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Instant Active
            </span>
          </div>

          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              Explore All Tiers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
