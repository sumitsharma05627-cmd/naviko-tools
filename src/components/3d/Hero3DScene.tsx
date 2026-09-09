import React, { useState, useRef } from 'react';
import {
  Brain,
  TrendingUp,
  Wrench,
  Sparkles,
  Calculator,
  ArrowUpRight,
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export { useReducedMotion, useMediaQuery };

interface Hero3DSceneProps {
  onNavigate?: (path: string) => void;
  className?: string;
}

/**
 * 1. AI 3D Child Component
 * Absolute-positioned, glass-like Tailwind style, CSS 3D transform facets, animate-float-3d-ai
 */
interface ObjectProps {
  onNavigate?: (path: string) => void;
  reducedMotion?: boolean;
}

export const Ai3DObject: React.FC<ObjectProps> = ({ onNavigate, reducedMotion = false }) => {
  return (
    <div
      className={`absolute top-6 sm:top-10 lg:top-14 right-4 sm:right-10 lg:right-24 ${
        reducedMotion ? '' : 'animate-float-3d-ai'
      } transform-style-3d pointer-events-auto group cursor-pointer`}
      style={{ transform: 'translateZ(30px)' }}
      onClick={() => onNavigate?.('/tools')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onNavigate?.('/tools');
      }}
      title="Explore AI Tools"
      id="hero-3d-ai-object"
    >
      <div className="relative flex flex-col items-center">
        {/* Abstract 3D Geometric Prism Box with Glass-like Tailwind Styles */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center transform-style-3d"
        >
          {/* Orbital Gyroscope Ring in 3D */}
          <div
            className={`absolute inset-0 rounded-full border border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.3)] ${
              reducedMotion ? '' : 'animate-gyro-a'
            } pointer-events-none`}
            style={{ transform: 'rotateX(65deg) translateZ(0px)' }}
          />

          {/* 3D Polyhedral Glass Cube Faces */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 relative ${
              reducedMotion ? '' : 'animate-spin-3d-slow'
            } transform-style-3d`}
          >
            {/* Front Face */}
            <div
              className="absolute inset-0 rounded-xl bg-purple-900/30 dark:bg-purple-950/40 backdrop-blur-md border border-purple-400/50 shadow-lg flex items-center justify-center"
              style={{ transform: 'translateZ(26px)' }}
            >
              <Brain className="w-6 h-6 text-purple-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </div>
            {/* Back Face */}
            <div
              className="absolute inset-0 rounded-xl bg-purple-950/50 backdrop-blur-md border border-purple-500/30 flex items-center justify-center"
              style={{ transform: 'rotateY(180deg) translateZ(26px)' }}
            >
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            {/* Right Face */}
            <div
              className="absolute inset-0 rounded-xl bg-indigo-900/20 backdrop-blur-md border border-purple-400/30"
              style={{ transform: 'rotateY(90deg) translateZ(26px)' }}
            />
            {/* Left Face */}
            <div
              className="absolute inset-0 rounded-xl bg-purple-900/20 backdrop-blur-md border border-purple-400/30"
              style={{ transform: 'rotateY(-90deg) translateZ(26px)' }}
            />
            {/* Top Face */}
            <div
              className="absolute inset-0 rounded-xl bg-purple-600/20 backdrop-blur-md border border-purple-300/40"
              style={{ transform: 'rotateX(90deg) translateZ(26px)' }}
            />
            {/* Bottom Face */}
            <div
              className="absolute inset-0 rounded-xl bg-purple-950/40 backdrop-blur-md border border-purple-600/30"
              style={{ transform: 'rotateX(-90deg) translateZ(26px)' }}
            />

            {/* Glowing Inner Energy Core */}
            <div
              className={`absolute inset-2 rounded-full bg-purple-400/30 blur-sm ${
                reducedMotion ? '' : 'animate-pulse-soft'
              }`}
              style={{ transform: 'translateZ(0px)' }}
            />
          </div>
        </div>

        {/* Glass-like Floating Label Badge */}
        <div
          className="mt-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-purple-500/40 shadow-xl flex items-center gap-1.5 transition-all group-hover:scale-105 group-hover:border-purple-300"
          style={{ transform: 'translateZ(35px)' }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full bg-purple-400 ${
              reducedMotion ? '' : 'animate-ping'
            }`}
          />
          <span className="text-[11px] font-bold text-purple-200 tracking-wide">
            AI Intelligence
          </span>
          <ArrowUpRight className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};

/**
 * 2. Finance 3D Child Component
 * Absolute-positioned, glass-like Tailwind style, CSS 3D transform facets, animate-float-3d-finance
 */
export const Finance3DObject: React.FC<ObjectProps> = ({ onNavigate, reducedMotion = false }) => {
  return (
    <div
      className={`absolute bottom-8 sm:bottom-12 lg:bottom-16 right-6 sm:right-14 lg:right-28 ${
        reducedMotion ? '' : 'animate-float-3d-finance'
      } transform-style-3d pointer-events-auto group cursor-pointer`}
      style={{ transform: 'translateZ(40px)' }}
      onClick={() => onNavigate?.('/finance-tools')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onNavigate?.('/finance-tools');
      }}
      title="Explore Finance & SIP Calculators"
      id="hero-3d-finance-object"
    >
      <div className="relative flex flex-col items-center">
        {/* Abstract 3D Layered Compounding Wealth Cylinder with Glass-like Tailwind Styles */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center transform-style-3d"
        >
          {/* Orbital Wealth Aura Ring */}
          <div
            className={`absolute inset-0 rounded-full border border-dashed border-emerald-400/40 shadow-[0_0_20px_rgba(168,85,247,0.3)] ${
              reducedMotion ? '' : 'animate-orbit-ring'
            } pointer-events-none`}
            style={{ transform: 'rotateX(55deg) translateZ(0px)' }}
          />

          {/* 3D Compounding Disc Stack */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 relative transform-style-3d"
            style={{
              transform: 'rotateX(42deg) rotateZ(-18deg)',
            }}
          >
            {/* Bottom Base Disc (Glass-like with Emerald Sheen) */}
            <div
              className="absolute inset-0 rounded-full bg-emerald-950/70 backdrop-blur-md border border-emerald-500/40 shadow-xl"
              style={{ transform: 'translateZ(-12px)' }}
            />
            {/* Middle Disc Layer */}
            <div
              className="absolute inset-0 rounded-full bg-teal-800/40 backdrop-blur-md border border-emerald-400/30"
              style={{ transform: 'translateZ(0px)' }}
            />
            {/* Top Glowing Currency Disc */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/80 via-teal-500/70 to-amber-300/80 backdrop-blur-md border border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center"
              style={{ transform: 'translateZ(14px)' }}
            >
              <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
          </div>

          {/* Floating Compounding Tag */}
          <div
            className="absolute -top-1 -right-2 px-1.5 py-0.5 rounded bg-amber-400/90 text-slate-950 text-[9px] font-black tracking-tight shadow-md border border-amber-200"
            style={{ transform: 'translateZ(25px)' }}
          >
            +14% CAGR
          </div>
        </div>

        {/* Glass-like Floating Label Badge */}
        <div
          className="mt-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 shadow-xl flex items-center gap-1.5 transition-all group-hover:scale-105 group-hover:border-emerald-300"
          style={{ transform: 'translateZ(35px)' }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${
              reducedMotion ? '' : 'animate-pulse'
            }`}
          />
          <span className="text-[11px] font-bold text-emerald-300 tracking-wide">
            Finance &amp; SIP
          </span>
          <ArrowUpRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Tools 3D Child Component
 * Absolute-positioned, glass-like Tailwind style, CSS 3D transform facets, animate-float-3d-tools
 */
export const Tools3DObject: React.FC<ObjectProps> = ({ onNavigate, reducedMotion = false }) => {
  return (
    <div
      className={`absolute top-8 sm:top-12 lg:top-16 left-4 sm:left-10 lg:left-24 ${
        reducedMotion ? '' : 'animate-float-3d-tools'
      } transform-style-3d pointer-events-auto group cursor-pointer`}
      style={{ transform: 'translateZ(30px)' }}
      onClick={() => onNavigate?.('/all-tools')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onNavigate?.('/all-tools');
      }}
      title="Explore 46+ Precision Tools"
      id="hero-3d-tools-object"
    >
      <div className="relative flex flex-col items-center">
        {/* Abstract 3D Precision Utility Cube with Glass-like Tailwind Styles */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center transform-style-3d"
        >
          {/* Caliper Ring in 3D */}
          <div
            className={`absolute inset-0 rounded-full border border-teal-400/40 shadow-[0_0_20px_rgba(45,212,191,0.3)] ${
              reducedMotion ? '' : 'animate-spin-3d-reverse'
            } pointer-events-none`}
            style={{ transform: 'rotateY(60deg) translateZ(0px)' }}
          />

          {/* 3D Wireframe Glass Cube */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 relative ${
              reducedMotion ? '' : 'animate-spin-3d-slow'
            } transform-style-3d`}
          >
            {/* Front Face */}
            <div
              className="absolute inset-0 rounded-xl bg-teal-950/40 backdrop-blur-md border border-teal-300/50 shadow-lg flex items-center justify-center"
              style={{ transform: 'translateZ(26px)' }}
            >
              <Wrench className="w-6 h-6 text-teal-200 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
            </div>
            {/* Back Face */}
            <div
              className="absolute inset-0 rounded-xl bg-slate-900/50 backdrop-blur-md border border-indigo-400/30 flex items-center justify-center"
              style={{ transform: 'rotateY(180deg) translateZ(26px)' }}
            >
              <Calculator className="w-5 h-5 text-teal-300" />
            </div>
            {/* Right Face */}
            <div
              className="absolute inset-0 rounded-xl bg-indigo-900/20 backdrop-blur-md border border-teal-400/30"
              style={{ transform: 'rotateY(90deg) translateZ(26px)' }}
            />
            {/* Left Face */}
            <div
              className="absolute inset-0 rounded-xl bg-teal-900/20 backdrop-blur-md border border-teal-400/30"
              style={{ transform: 'rotateY(-90deg) translateZ(26px)' }}
            />
            {/* Top Face */}
            <div
              className="absolute inset-0 rounded-xl bg-teal-600/20 backdrop-blur-md border border-teal-300/40"
              style={{ transform: 'rotateX(90deg) translateZ(26px)' }}
            />
            {/* Bottom Face */}
            <div
              className="absolute inset-0 rounded-xl bg-slate-950/40 backdrop-blur-md border border-teal-600/30"
              style={{ transform: 'rotateX(-90deg) translateZ(26px)' }}
            />
          </div>
        </div>

        {/* Glass-like Floating Label Badge */}
        <div
          className="mt-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-teal-500/40 shadow-xl flex items-center gap-1.5 transition-all group-hover:scale-105 group-hover:border-teal-300"
          style={{ transform: 'translateZ(35px)' }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full bg-teal-400 ${
              reducedMotion ? '' : 'animate-pulse'
            }`}
          />
          <span className="text-[11px] font-bold text-teal-200 tracking-wide">
            46+ Tools
          </span>
          <ArrowUpRight className="w-3 h-3 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};

/**
 * Main Hero3DScene Component
 * Renders container with 'perspective-1000' and 'transform-style-3d'
 * Contains 3 absolute-positioned child components: AI, Finance, Tools
 * Ensures z-index constraints (z-0) and does not obstruct text/buttons in Hero
 * Uses the 'useReducedMotion' hook to strictly enforce accessibility compliance.
 */
export const Hero3DScene: React.FC<Hero3DSceneProps> = ({
  onNavigate,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rotX, setRotX] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0);

  // Hook check for '(prefers-reduced-motion: reduce)' to preserve site accessibility compliance
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Subtle interactive parallax responding to mouse across Hero (disabled if reduced motion)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const clampedX = Math.max(-6, Math.min(6, (y / (rect.height / 2)) * -6));
    const clampedY = Math.max(-8, Math.min(8, (x / (rect.width / 2)) * 8));

    setRotX(clampedX);
    setRotY(clampedY);
  };

  const handleMouseLeave = () => {
    setRotX(0);
    setRotY(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`absolute inset-0 z-0 pointer-events-none select-none flex items-center justify-center overflow-hidden perspective-1000 transform-style-3d ${className}`}
      aria-hidden="true"
    >
      {/* 3D Scene World with Transform-Style-3D */}
      <div
        className={`w-full h-full max-w-7xl relative flex items-center justify-center transform-style-3d ${
          prefersReducedMotion ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{
          transform: prefersReducedMotion
            ? 'rotateX(0deg) rotateY(0deg)'
            : `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        }}
      >
        {/* Child Component 1: AI (animate-float-3d-ai, disabled when reduced motion) */}
        <Ai3DObject onNavigate={onNavigate} reducedMotion={prefersReducedMotion} />

        {/* Child Component 2: Finance (animate-float-3d-finance, disabled when reduced motion) */}
        <Finance3DObject onNavigate={onNavigate} reducedMotion={prefersReducedMotion} />

        {/* Child Component 3: Tools (animate-float-3d-tools, disabled when reduced motion) */}
        <Tools3DObject onNavigate={onNavigate} reducedMotion={prefersReducedMotion} />

        {/* Subtle Ambient Depth Grid in Background */}
        <div
          className="absolute w-[640px] h-[640px] rounded-full pointer-events-none opacity-20 transform-style-3d"
          style={{
            transform: 'rotateX(75deg) translateZ(-140px)',
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 70%)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
          }}
        />
      </div>
    </div>
  );
};

