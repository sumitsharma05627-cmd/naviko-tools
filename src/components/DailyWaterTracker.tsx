import React, { useState, useEffect } from 'react';
import { 
  Droplets, Plus, Minus, RotateCcw, Target, Sparkles, 
  CheckCircle2, ArrowRight, Settings2, Info, ChevronRight
} from 'lucide-react';

interface DailyWaterTrackerProps {
  onNavigate?: (path: string) => void;
  className?: string;
  compact?: boolean;
}

export const DailyWaterTracker: React.FC<DailyWaterTrackerProps> = ({
  onNavigate,
  className = '',
  compact = false,
}) => {
  const getTodayKey = () => new Date().toISOString().split('T')[0];
  const todayKey = getTodayKey();

  // Glass Target (default 10 glasses = 2500ml)
  const [targetGlasses, setTargetGlasses] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('naviko_water_target');
      return saved ? Math.max(4, Math.min(20, parseInt(saved, 10))) : 10;
    } catch {
      return 10;
    }
  });

  // Current Logged Glasses
  const [glasses, setGlasses] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`naviko_water_${todayKey}`);
      return saved ? Math.max(0, parseInt(saved, 10)) : 0;
    } catch {
      return 0;
    }
  });

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(`naviko_water_${todayKey}`, glasses.toString());
    window.dispatchEvent(new CustomEvent('naviko_water_updated', { detail: { glasses, todayKey } }));
  }, [glasses, todayKey]);

  useEffect(() => {
    localStorage.setItem('naviko_water_target', targetGlasses.toString());
  }, [targetGlasses]);

  // Listen for external updates (e.g. from HabitTrackerPage or other tabs)
  useEffect(() => {
    const handleWaterEvent = (e: any) => {
      if (e.detail?.todayKey === todayKey && typeof e.detail?.glasses === 'number') {
        setGlasses(e.detail.glasses);
      }
    };

    window.addEventListener('naviko_water_updated', handleWaterEvent);
    return () => window.removeEventListener('naviko_water_updated', handleWaterEvent);
  }, [todayKey]);

  const updateGlasses = (newCount: number) => {
    const clamped = Math.max(0, Math.min(30, newCount));
    setGlasses(clamped);

    if (clamped >= targetGlasses && glasses < targetGlasses) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset today\'s logged water to 0 glasses?')) {
      updateGlasses(0);
    }
  };

  const currentMl = glasses * 250;
  const targetMl = targetGlasses * 250;
  const percentage = Math.min(100, Math.round((glasses / Math.max(1, targetGlasses)) * 100));

  // Motivational & Ayurvedic context label
  const getStatusText = () => {
    if (glasses === 0) return 'Start your day with warm Ushapan water.';
    if (glasses < targetGlasses * 0.5) return 'Good start! Sip water steadily throughout your day.';
    if (glasses < targetGlasses) return 'Almost at your target! Keep hydrating consciously.';
    if (glasses === targetGlasses) return 'Daily hydration goal achieved! Well hydrated.';
    return 'Exceeded daily target! Excellent hydration.';
  };

  return (
    <div
      className={`p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Daily Water Intake</span>
              {glasses >= targetGlasses && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Met
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              1 glass ≈ 250 ml · Target: {targetGlasses} glasses ({targetMl} ml)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className={`p-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
              isEditingTarget
                ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
            }`}
            title="Set custom daily water goal"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Target</span>
          </button>

          {glasses > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="Reset today's water count"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Target Customizer Drawer (Visible when isEditingTarget is open) */}
      {isEditingTarget && (
        <div className="mb-6 p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Adjust Daily Water Target
            </span>
            <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300">
              {targetGlasses} glasses ({targetGlasses * 250} ml)
            </span>
          </div>

          <input
            type="range"
            min="4"
            max="18"
            step="1"
            value={targetGlasses}
            onChange={(e) => setTargetGlasses(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-sky-200 dark:bg-sky-800 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-sky-900/70 dark:text-sky-300/70 mr-1">Presets:</span>
            {[
              { g: 8, ml: '2.0L' },
              { g: 10, ml: '2.5L (Std)' },
              { g: 12, ml: '3.0L' },
              { g: 14, ml: '3.5L (Tropical)' },
            ].map((preset) => (
              <button
                key={preset.g}
                type="button"
                onClick={() => setTargetGlasses(preset.g)}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition cursor-pointer border ${
                  targetGlasses === preset.g
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50'
                }`}
              >
                {preset.g} gl ({preset.ml})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Hydration Progress Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Score & Big Numbers (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-serif text-slate-900 dark:text-white tracking-tight">
              {currentMl}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              / {targetMl} ml
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {percentage}% Complete
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {glasses} of {targetGlasses} glasses
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-teal-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {getStatusText()}
          </p>
        </div>

        {/* Right: Interactive Stepper Controls & Quick Actions (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          {/* Action Button Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => updateGlasses(glasses - 1)}
              disabled={glasses === 0}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              title="Remove 1 glass"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>-1 Glass</span>
            </button>

            <button
              type="button"
              onClick={() => updateGlasses(glasses + 1)}
              className="flex-1 py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="Log 1 glass of water (250 ml)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1 Glass (250 ml)</span>
            </button>

            <button
              type="button"
              onClick={() => updateGlasses(glasses + 2)}
              className="py-2 px-3 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
              title="Log a 500ml water bottle (2 glasses)"
            >
              <Plus className="w-3 h-3" />
              <span>Bottle (500 ml)</span>
            </button>
          </div>

          {/* Interactive Glass Icons Grid (Up to Target) */}
          <div className="pt-2">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {Array.from({ length: Math.max(targetGlasses, Math.min(20, glasses)) }).map((_, i) => {
                const isFilled = i < glasses;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => updateGlasses(i + 1 === glasses ? i : i + 1)}
                    className={`h-11 rounded-lg flex flex-col items-center justify-center transition border cursor-pointer ${
                      isFilled
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-800 text-sky-600 dark:text-sky-400 shadow-2xs scale-102'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 hover:border-slate-300'
                    }`}
                    title={`Glass ${i + 1} (250 ml) - Click to toggle`}
                  >
                    <Droplets
                      className={`w-3.5 h-3.5 transition-transform ${
                        isFilled ? 'fill-sky-500 text-sky-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                    <span className="text-[9px] font-mono mt-0.5 leading-none">{i + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Notification */}
      {showCelebration && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Target reached! You drank {targetGlasses * 250} ml of water today. Outstanding consistency!</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCelebration(false)}
            className="text-emerald-600 hover:text-emerald-800 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Footer Links & Ayurvedic Note */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span>Ayurvedic Ushapan: 1-2 warm glasses upon waking gently awakens digestion (Agni).</span>
        </span>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/wellness-calculators')}
            className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>Need a custom hydration estimate?</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
