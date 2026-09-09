import React, { useState } from 'react';
import {
  TrendingUp,
  Landmark,
  Percent,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';

interface Finance3DDashboardVisualProps {
  onNavigate: (path: string) => void;
}

export const Finance3DDashboardVisual: React.FC<Finance3DDashboardVisualProps> = ({ onNavigate }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setRotateX(((y - cy) / cy) * -6);
    setRotateY(((x - cx) / cx) * 6);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-5xl mx-auto my-6 p-4 sm:p-6 rounded-3xl transition-transform duration-300 ease-out select-none"
      style={{
        perspective: '1200px',
      }}
      aria-label="3D Finance Dashboard Visual"
    >
      <div
        className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-indigo-950/80 to-slate-950 p-6 sm:p-8 border border-indigo-500/30 shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Subtle Ambient Radial Lighting */}
        <div
          className="absolute -top-10 -right-10 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10b981 0%, #6366f1 70%, transparent)' }}
          aria-hidden="true"
        />

        {/* Header Ribbon with 3D Depth */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white">
                  3D Financial Modeling Workspace
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Visualizing Compounding Dynamics, Amortization, and Net In-Hand Income
              </span>
            </div>
          </div>

          {/* Floating Currency & Metric Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-emerald-300 shadow-sm flex items-center gap-1">
              <span>₹</span>
              <span>INR</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-indigo-300 shadow-sm flex items-center gap-1">
              <span>$</span>
              <span>USD</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Percent className="w-3 h-3" />
              <span>12% Compounding</span>
            </div>
          </div>
        </div>

        {/* Interactive 3D Chart & Metric Cards Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 relative z-10">
          {/* Main Visual: Layered 3D Compounding Curve Canvas */}
          <div
            className="lg:col-span-8 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between"
            style={{ transform: 'translateZ(25px)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-indigo-400" />
                Wealth Compounding Horizon (10-Year Growth Arc)
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                Maturity: 3.2x Invested
              </span>
            </div>

            {/* Visual 3D SVG Graph with Multi-layered Curves */}
            <div className="relative w-full h-36 sm:h-44 flex items-end">
              <svg
                viewBox="0 0 500 150"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                {/* Linear Principal Baseline */}
                <path
                  d="M 0 135 Q 250 110 500 85"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />

                {/* Compounding Exponential Curve Area */}
                <path
                  d="M 0 135 Q 200 120, 320 80 T 500 15 L 500 145 L 0 145 Z"
                  fill="url(#curveGradient)"
                />

                {/* Compounding Exponential Curve Stroke */}
                <path
                  d="M 0 135 Q 200 120, 320 80 T 500 15"
                  fill="none"
                  stroke="url(#strokeGradient)"
                  strokeWidth="3.5"
                />

                {/* Key Node Markers */}
                <circle cx="0" cy="135" r="4" fill="#6366f1" />
                <circle cx="250" cy="105" r="4.5" fill="#38bdf8" />
                <circle cx="500" cy="15" r="5.5" fill="#10b981" />
              </svg>

              {/* Float Marker on Target Apex */}
              <div
                className="absolute right-2 top-0 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 backdrop-blur-md text-[11px] font-mono font-bold text-emerald-300 animate-float-gentle"
                style={{ transform: 'translateZ(30px)' }}
              >
                ₹32.4 Lakhs Peak
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/10 mt-3 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-slate-400 inline-block" /> Linear Invested Principal
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Compounded Growth Curve
              </span>
            </div>
          </div>

          {/* Side 3D Data Cards */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {/* Card 1: Step-Up Boost */}
            <div
              onClick={() => onNavigate('/tools/sip-calculator')}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group"
              style={{ transform: 'translateZ(15px)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Step-Up SIP Accelerator</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-lg font-black text-white font-mono mt-1">+10% Boost</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Adding 10% annual step-up expands final corpus by up to 68%.
              </p>
            </div>

            {/* Card 2: In-Hand Salary Breakdown */}
            <div
              onClick={() => onNavigate('/tools/salary-calculator')}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group"
              style={{ transform: 'translateZ(15px)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Tax Regime Comparison</span>
                <ArrowUpRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-lg font-black text-white font-mono mt-1">New vs Old</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Instant net take-home calculation with Section 87A rebate checks.
              </p>
            </div>

            {/* Card 3: Loan Prepayment Simulator */}
            <div
              onClick={() => onNavigate('/tools/emi-calculator')}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/40 transition-all cursor-pointer group"
              style={{ transform: 'translateZ(15px)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Loan Amortization</span>
                <ArrowUpRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-lg font-black text-white font-mono mt-1">EMI Schedule</div>
              <p className="text-[11px] text-slate-400 mt-1">
                See exact interest shaved off when making 1 extra EMI per year.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
