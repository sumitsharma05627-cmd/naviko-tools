import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  Target,
  BookOpen
} from 'lucide-react';

interface SubjectEntry {
  id: string;
  name: string;
  attended: number;
  total: number;
}

export const AttendanceCalculator: React.FC = () => {
  // Simple Mode State
  const [totalClasses, setTotalClasses] = useState<number>(45);
  const [attendedClasses, setAttendedClasses] = useState<number>(34);
  const [targetPercentage, setTargetPercentage] = useState<number>(75);
  const [activeTab, setActiveTab] = useState<'single' | 'subjects'>('single');

  // Multi-subject state
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { id: '1', name: 'Mathematics', attended: 28, total: 32 },
    { id: '2', name: 'Physics', attended: 22, total: 30 },
    { id: '3', name: 'Computer Science', attended: 35, total: 36 },
    { id: '4', name: 'Electronics', attended: 18, total: 28 }
  ]);

  // Single Subject Calculations
  const currentPercentage = useMemo(() => {
    if (totalClasses <= 0) return 0;
    return Math.min(100, Math.max(0, (attendedClasses / totalClasses) * 100));
  }, [totalClasses, attendedClasses]);

  // Target Advice Calculations
  const targetAdvice = useMemo(() => {
    if (totalClasses <= 0) return { type: 'neutral', message: 'Enter your classes to calculate status.' };

    const targetRatio = targetPercentage / 100;
    const currentRatio = attendedClasses / totalClasses;

    if (currentRatio >= targetRatio) {
      // How many classes can be safely missed (bunked) without going below target:
      // (attended) / (total + x) >= targetRatio => attended >= targetRatio * total + targetRatio * x
      // x <= (attended - targetRatio * total) / targetRatio
      const safeBunks = Math.floor((attendedClasses - targetRatio * totalClasses) / targetRatio);
      return {
        type: 'safe',
        safeBunks: Math.max(0, safeBunks),
        message:
          safeBunks > 0
            ? `You are on track! You can safely miss up to ${safeBunks} more ${safeBunks === 1 ? 'class' : 'classes'} and still maintain ${targetPercentage}% attendance.`
            : `You are exactly meeting your ${targetPercentage}% attendance goal. Attend your next classes to build a safe buffer!`
      };
    } else {
      // How many consecutive classes need to be attended:
      // (attended + y) / (total + y) >= targetRatio
      // attended + y >= targetRatio * total + targetRatio * y
      // y * (1 - targetRatio) >= targetRatio * total - attended
      // y >= (targetRatio * total - attended) / (1 - targetRatio)
      if (targetRatio >= 1) {
        return {
          type: 'danger',
          neededClasses: 0,
          message: 'It is mathematically impossible to reach 100% attendance if any classes were already missed.'
        };
      }
      const needed = Math.ceil((targetRatio * totalClasses - attendedClasses) / (1 - targetRatio));
      return {
        type: 'shortage',
        neededClasses: needed,
        message: `Attendance shortage! You must attend the next ${needed} consecutive ${needed === 1 ? 'class' : 'classes'} without missing any to reach ${targetPercentage}%.`
      };
    }
  }, [totalClasses, attendedClasses, targetPercentage]);

  // Multi-subject calculations
  const aggregateSubjects = useMemo(() => {
    const totalAttended = subjects.reduce((sum, s) => sum + (s.attended || 0), 0);
    const totalHeld = subjects.reduce((sum, s) => sum + (s.total || 0), 0);
    const overallPct = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;
    return { totalAttended, totalHeld, overallPct };
  }, [subjects]);

  const addSubject = () => {
    const newId = `${Date.now()}`;
    setSubjects((prev) => [
      ...prev,
      { id: newId, name: `Subject ${prev.length + 1}`, attended: 0, total: 0 }
    ]);
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, field: 'name' | 'attended' | 'total', value: string | number) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Quick Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Subject-Wise Tracker
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
              <span>Enter Class Statistics</span>
            </h3>

            {/* Attended Classes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Classes Attended (Present)
              </label>
              <input
                type="number"
                min="0"
                value={attendedClasses}
                onChange={(e) => setAttendedClasses(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Total Classes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Total Classes Conducted (Held)
              </label>
              <input
                type="number"
                min="1"
                value={totalClasses}
                onChange={(e) => setTotalClasses(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Target Percentage */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Required Target Attendance</span>
                </label>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {targetPercentage}%
                </span>
              </div>

              {/* Target Quick Presets */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[65, 75, 80, 85].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetPercentage(preset)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      targetPercentage === preset
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="50"
                max="100"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setAttendedClasses(35);
                  setTotalClasses(45);
                  setTargetPercentage(75);
                }}
                className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset to default
              </button>
            </div>
          </div>

          {/* Results Visual Panel */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Score Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Current Attendance
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    currentPercentage >= targetPercentage
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {currentPercentage >= targetPercentage ? 'Criteria Met' : 'Shortage Alert'}
                </span>
              </div>

              {/* Big Percentage Meter */}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  {currentPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  ({attendedClasses} / {totalClasses} classes)
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentPercentage >= targetPercentage ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, currentPercentage)}%` }}
                  />
                  {/* Target line indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10"
                    style={{ left: `${targetPercentage}%` }}
                    title={`Target: ${targetPercentage}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>0%</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Goal: {targetPercentage}%
                  </span>
                  <span>100%</span>
                </div>
              </div>

              {/* Smart Advice Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  targetAdvice.type === 'safe'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200'
                }`}
              >
                {targetAdvice.type === 'safe' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">
                    {targetAdvice.type === 'safe' ? 'Safe Zone' : 'Attendance Shortage'}
                  </h4>
                  <p className="text-xs leading-relaxed font-medium">
                    {targetAdvice.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Math Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Classes Missed / Absent
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {Math.max(0, totalClasses - attendedClasses)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Difference to Target
                </div>
                <div
                  className={`text-xl font-black mt-1 ${
                    currentPercentage >= targetPercentage
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {currentPercentage >= targetPercentage ? '+' : ''}
                  {(currentPercentage - targetPercentage).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Multi-Subject Tracker */
        <div className="space-y-6">
          {/* Aggregate Overview Banner */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Cumulative Attendance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {aggregateSubjects.overallPct.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({aggregateSubjects.totalAttended} / {aggregateSubjects.totalHeld} total classes across {subjects.length} subjects)
                </span>
              </div>
            </div>

            <button
              onClick={addSubject}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>

          {/* Subjects Table */}
          <div className="space-y-3">
            {subjects.map((sub, idx) => {
              const subPct = sub.total > 0 ? (sub.attended / sub.total) * 100 : 0;
              const isSafe = subPct >= targetPercentage;

              return (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Subject Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                      placeholder="Subject Name"
                      className="font-bold text-xs text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-full"
                    />
                  </div>

                  {/* Attended / Total Inputs */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Attended:</span>
                      <input
                        type="number"
                        min="0"
                        value={sub.attended}
                        onChange={(e) =>
                          updateSubject(sub.id, 'attended', Math.max(0, parseInt(e.target.value, 10) || 0))
                        }
                        className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <span className="text-slate-400">/</span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Total:</span>
                      <input
                        type="number"
                        min="0"
                        value={sub.total}
                        onChange={(e) =>
                          updateSubject(sub.id, 'total', Math.max(0, parseInt(e.target.value, 10) || 0))
                        }
                        className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Percentage & Status */}
                  <div className="flex items-center gap-4 min-w-[140px] justify-between">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {subPct.toFixed(1)}%
                      </div>
                      <div
                        className={`text-[10px] font-bold ${
                          isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isSafe ? 'Eligible' : 'Shortage'}
                      </div>
                    </div>

                    <button
                      onClick={() => removeSubject(sub.id)}
                      disabled={subjects.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
