import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  TrendingUp,
  Calculator,
  Zap,
  Layers,
  Crown,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface Hero3DVisualProps {
  onNavigate: (path: string) => void;
}

interface CategoryOrb {
  id: string;
  name: string;
  shortTag: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
  borderColor: string;
  glowColor: string;
  path: string;
  angleOffset: number; // in degrees for positioning
  radius: number; // orbital radius in px
  delay: string;
}

export const Hero3DVisual: React.FC<Hero3DVisualProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const categoryOrbs: CategoryOrb[] = [
    {
      id: 'ai',
      name: 'AI Intelligence',
      shortTag: 'Neural Core',
      icon: Brain,
      color: 'text-purple-300',
      badgeBg: 'bg-purple-950/80',
      borderColor: 'border-purple-500/50',
      glowColor: 'rgba(168, 85, 247, 0.4)',
      path: '/tools',
      angleOffset: 0,
      radius: 135,
      delay: '0s',
    },
    {
      id: 'finance',
      name: 'Finance & Wealth',
      shortTag: 'SIP & Tax',
      icon: TrendingUp,
      color: 'text-emerald-300',
      badgeBg: 'bg-emerald-950/80',
      borderColor: 'border-emerald-500/50',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      path: '/finance-tools',
      angleOffset: 60,
      radius: 145,
      delay: '1.2s',
    },
    {
      id: 'calculators',
      name: 'Calculators',
      shortTag: 'Math & Sci',
      icon: Calculator,
      color: 'text-indigo-300',
      badgeBg: 'bg-indigo-950/80',
      borderColor: 'border-indigo-500/50',
      glowColor: 'rgba(99, 102, 241, 0.4)',
      path: '/calculators',
      angleOffset: 120,
      radius: 140,
      delay: '2.4s',
    },
    {
      id: 'productivity',
      name: 'Productivity',
      shortTag: 'Student Hub',
      icon: Zap,
      color: 'text-amber-300',
      badgeBg: 'bg-amber-950/80',
      borderColor: 'border-amber-500/50',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      path: '/student-tools',
      angleOffset: 180,
      radius: 135,
      delay: '0.6s',
    },
    {
      id: 'tools',
      name: '46+ Tools',
      shortTag: 'PDF & Images',
      icon: Layers,
      color: 'text-teal-300',
      badgeBg: 'bg-teal-950/80',
      borderColor: 'border-teal-500/50',
      glowColor: 'rgba(20, 184, 166, 0.4)',
      path: '/tools',
      angleOffset: 240,
      radius: 145,
      delay: '1.8s',
    },
    {
      id: 'premium',
      name: 'Premium',
      shortTag: 'Plus & Pro',
      icon: Crown,
      color: 'text-rose-300',
      badgeBg: 'bg-rose-950/80',
      borderColor: 'border-rose-500/50',
      glowColor: 'rgba(244, 63, 94, 0.4)',
      path: '/premium',
      angleOffset: 300,
      radius: 140,
      delay: '3s',
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full py-4 flex flex-col items-center justify-center select-none"
      style={{ perspective: '1200px' }}
      aria-label="Interactive 3D NAVIKO Environment"
    >
      {/* 3D Stage Container */}
      <div
        className="relative w-full max-w-[460px] h-[340px] sm:h-[380px] flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Ambient Depth Glow Disc in Background */}
        <div
          className="absolute w-72 h-72 rounded-full pointer-events-none opacity-40 blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(16,185,129,0.2) 60%, transparent 80%)',
            transform: 'translateZ(-40px)',
          }}
          aria-hidden="true"
        />

        {/* Outer Orbit Holographic Rings */}
        <div
          className="absolute w-[300px] sm:w-[330px] h-[300px] sm:h-[330px] rounded-full border border-indigo-400/20 pointer-events-none animate-orbit-ring"
          style={{ transform: 'translateZ(-10px)' }}
          aria-hidden="true"
        />
        <div
          className="absolute w-[240px] sm:w-[260px] h-[240px] sm:h-[260px] rounded-full border border-dashed border-emerald-400/25 pointer-events-none"
          style={{
            transform: 'translateZ(-5px) rotate(45deg)',
            animation: 'orbit-ring 48s linear infinite reverse',
          }}
          aria-hidden="true"
        />

        {/* Central NAVIKO 3D Core */}
        <div
          onClick={() => onNavigate('/tools')}
          className="relative z-20 group cursor-pointer"
          style={{ transform: 'translateZ(30px)' }}
          title="NAVIKO Core — Explore all tools"
        >
          {/* Pulsing Core Ring */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-indigo-500/30 via-emerald-500/20 to-purple-500/30 blur-md group-hover:blur-lg opacity-80 group-hover:opacity-100 transition-all" />

          {/* 3D Polyhedral Core Container */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-0.5 border border-white/25 shadow-2xl shadow-indigo-950/80 group-hover:scale-105 group-hover:border-emerald-400/70 transition-all flex flex-col items-center justify-center text-center">
            {/* Core Highlight Sheen */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

            {/* Emblem Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-[1.5px] shadow-lg mb-1.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-300 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>

            <span className="text-xs sm:text-sm font-black text-white tracking-wider font-mono">
              NAVIKO
            </span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
              WORKSPACE
            </span>
          </div>
        </div>

        {/* Floating Orbital Category Nodes */}
        {categoryOrbs.map((orb, index) => {
          const Icon = orb.icon;
          const isNodeHovered = hoveredNode === orb.id;

          // Trigonometric positions around the center
          const angleRad = (orb.angleOffset * Math.PI) / 180;
          const adjustedRadius = isMobile ? orb.radius * 0.8 : orb.radius;
          const x = Math.round(Math.cos(angleRad) * adjustedRadius);
          const y = Math.round(Math.sin(angleRad) * (adjustedRadius * 0.72)); // slight perspective compression on Y

          return (
            <div
              key={orb.id}
              onClick={() => onNavigate(orb.path)}
              onMouseEnter={() => setHoveredNode(orb.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute z-30 cursor-pointer group"
              style={{
                transform: `translate(${x}px, ${y}px) translateZ(${isNodeHovered ? 45 : 15}px)`,
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              title={`Explore ${orb.name}`}
            >
              {/* Floating Container */}
              <div
                className={`animate-float-gentle px-3 py-2 rounded-xl backdrop-blur-md border ${orb.borderColor} ${orb.badgeBg} shadow-xl flex items-center gap-2 transition-all duration-200 group-hover:scale-110`}
                style={{
                  animationDelay: orb.delay,
                  boxShadow: isNodeHovered ? `0 10px 25px -5px ${orb.glowColor}` : undefined,
                }}
              >
                <div className={`p-1.5 rounded-lg bg-white/10 ${orb.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-extrabold text-white leading-tight group-hover:text-emerald-300 transition-colors flex items-center gap-0.5">
                    {orb.name}
                    <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">
                    {orb.shortTag}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Micro-hint below 3D centerpiece */}
      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>Interactive 3D Workspace • Click any category node to explore</span>
      </div>
    </div>
  );
};
