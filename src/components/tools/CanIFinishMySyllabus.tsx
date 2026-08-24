import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, AlertCircle, Clock, BookOpen, Calendar, 
  RotateCcw, Sparkles, Copy, Check, Share2, ArrowRight,
  TrendingUp, ShieldCheck, Flame, Sliders, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';

export const CanIFinishMySyllabus: React.FC = () => {
  const { t } = useLanguage();
  const [chaptersRemaining, setChaptersRemaining] = useState<number>(40);
  const [hoursPerChapter, setHoursPerChapter] = useState<number>(2);
  const [daysRemaining, setDaysRemaining] = useState<number>(35);
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(7);

  const [copied, setCopied] = useState<boolean>(false);

  // Quick Preset Handlers
  const handleApplyExample = (chapters: number, hours: number, days: number, daily: number, dpw: number) => {
    setChaptersRemaining(chapters);
    setHoursPerChapter(hours);
    setDaysRemaining(days);
    setDailyHours(daily);
    setDaysPerWeek(dpw);
  };

  const handleReset = () => {
    setChaptersRemaining(40);
    setHoursPerChapter(2);
    setDaysRemaining(35);
    setDailyHours(3);
    setDaysPerWeek(7);
  };

  // Math Calculations
  const calculations = useMemo(() => {
    const validChapters = Math.max(0, chaptersRemaining);
    const validHoursPerChap = Math.max(0.1, hoursPerChapter);
    const validDays = Math.max(1, daysRemaining);
    const validDailyHours = Math.max(0, dailyHours);
    const validDaysPerWeek = Math.min(7, Math.max(1, daysPerWeek));

    // Total hours required
    const totalHoursRequired = Math.round(validChapters * validHoursPerChap * 10) / 10;

    // Effective study days accounting for days/week
    const effectiveDays = Math.round(validDays * (validDaysPerWeek / 7) * 10) / 10;

    // Total hours available
    const totalHoursAvailable = Math.round(effectiveDays * validDailyHours * 10) / 10;

    // Extra / buffer hours
    const bufferHours = Math.round((totalHoursAvailable - totalHoursRequired) * 10) / 10;

    // Required rates
    const requiredHoursPerDay = effectiveDays > 0 ? Math.round((totalHoursRequired / effectiveDays) * 10) / 10 : 0;
    const requiredChaptersPerDay = effectiveDays > 0 ? Math.round((validChapters / effectiveDays) * 100) / 100 : 0;
    const requiredChaptersPerWeek = Math.round(requiredChaptersPerDay * validDaysPerWeek * 10) / 10;

    // Capacity percentage
    const capacityRatio = totalHoursRequired > 0 ? (totalHoursAvailable / totalHoursRequired) : 1;
    const capacityPercent = Math.round(capacityRatio * 100);

    // Feasibility Status & Verdict
    let status: 'yes' | 'possible' | 'unlikely' = 'yes';
    let headline = 'YES — You can finish comfortably';
    let summaryText = `You have enough time! With ${validDailyHours}h of daily study, you have approximately ${Math.max(0, bufferHours)} hours of extra buffer time to handle revision and mock tests.`;

    if (bufferHours < 0) {
      status = 'unlikely';
      headline = 'UNLIKELY — Your current available time is insufficient';
      const deficit = Math.abs(bufferHours);
      summaryText = `At your current pace of ${validDailyHours}h/day, you will experience a deficit of approximately ${deficit} hours. Increasing your study time to ${requiredHoursPerDay}h/day or prioritizing high-weightage chapters will bridge this gap.`;
    } else if (bufferHours < 12 || capacityRatio < 1.15) {
      status = 'possible';
      headline = 'POSSIBLE — You need a tighter schedule';
      summaryText = `You have just enough time with approximately ${bufferHours} hours of buffer. To complete on schedule without stress, stick strictly to your daily target of ${requiredChaptersPerDay} chapters per day.`;
    }

    // Adjustment Scenarios (+1h, +2h)
    const plus1HourAvailable = Math.round(effectiveDays * (validDailyHours + 1));
    const plus1Buffer = plus1HourAvailable - totalHoursRequired;

    const plus2HourAvailable = Math.round(effectiveDays * (validDailyHours + 2));
    const plus2Buffer = plus2HourAvailable - totalHoursRequired;

    return {
      totalHoursRequired,
      effectiveDays,
      totalHoursAvailable,
      bufferHours,
      requiredHoursPerDay,
      requiredChaptersPerDay,
      requiredChaptersPerWeek,
      capacityPercent,
      status,
      headline,
      summaryText,
      plus1Buffer,
      plus2Buffer
    };
  }, [chaptersRemaining, hoursPerChapter, daysRemaining, dailyHours, daysPerWeek]);

  // Copy result
  const handleCopyResult = () => {
    const text = `📊 CAN I FINISH MY SYLLABUS? — NAVIKO CALCULATION

• Chapters Remaining: ${chaptersRemaining} (${hoursPerChapter} hrs/chapter)
• Days Remaining: ${daysRemaining} days (${daysPerWeek} days/week study)
• Available Study Time: ${dailyHours} hrs/day

🏁 VERDICT: ${calculations.headline}
• Total Hours Required: ${calculations.totalHoursRequired} hrs
• Total Hours Available: ${calculations.totalHoursAvailable} hrs
• Buffer Time: ${calculations.bufferHours >= 0 ? `+${calculations.bufferHours} hrs buffer` : `${calculations.bufferHours} hrs deficit`}
• Required Pace: ${calculations.requiredChaptersPerDay} chapters/day (${calculations.requiredChaptersPerWeek} ch/week)

Action Plan: ${calculations.summaryText}

Calculated on NAVIKO: https://naviko.in/student-tools/can-i-finish-my-syllabus`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Can I Finish My Syllabus? — NAVIKO',
          text: `Syllabus Feasibility Check: ${calculations.headline}. Required: ${calculations.requiredHoursPerDay} hrs/day across ${daysRemaining} days.`,
          url: window.location.href,
        });
      } catch {
        handleCopyResult();
      }
    } else {
      handleCopyResult();
    }
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Syllabus Feasibility Calculator</span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Find Out If You Have Enough Study Time Before Your Exam
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-2xl">
            Input your remaining chapters and daily study hours to calculate your exact buffer margin and get constructive pace adjustments.
          </p>

          {/* Quick preset chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-indigo-300 font-semibold mr-1">Quick Scenarios:</span>
            <button
              onClick={() => handleApplyExample(40, 2, 35, 3, 7)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 text-xs font-medium cursor-pointer"
            >
              Standard (40 Ch / 35 Days)
            </button>
            <button
              onClick={() => handleApplyExample(25, 3.5, 20, 5, 6)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 text-xs font-medium cursor-pointer"
            >
              Sprint (25 Ch / 20 Days)
            </button>
            <button
              onClick={() => handleApplyExample(60, 2.5, 60, 4, 6)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 text-xs font-medium cursor-pointer"
            >
              Semester Final (60 Ch / 60 Days)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Visual Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Enter Your Syllabus & Time Parameters</span>
            </h3>

            {/* Input 1: Chapters Remaining */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Chapters Remaining</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={chaptersRemaining}
                    onChange={(e) => setChaptersRemaining(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 text-right"
                  />
                  <span className="text-xs font-bold text-indigo-600">Chapters</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="120"
                value={chaptersRemaining}
                onChange={(e) => setChaptersRemaining(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Input 2: Average Hours per Chapter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Average Hours per Chapter</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={hoursPerChapter}
                    onChange={(e) => setHoursPerChapter(Math.max(0.5, Number(e.target.value)))}
                    className="w-16 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 text-right"
                  />
                  <span className="text-xs font-bold text-indigo-600">Hours/ch</span>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={hoursPerChapter}
                onChange={(e) => setHoursPerChapter(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1h (Quick revision)</span>
                <span>2-3h (Standard)</span>
                <span>6h+ (Deep numericals)</span>
              </div>
            </div>

            {/* Input 3: Days Remaining */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Days Remaining Until Exam</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={daysRemaining}
                    onChange={(e) => setDaysRemaining(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 text-right"
                  />
                  <span className="text-xs font-bold text-indigo-600">Days</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="180"
                value={daysRemaining}
                onChange={(e) => setDaysRemaining(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Input 4: Study Hours Per Day */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Study Hours Available Per Day</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.5"
                    max="16"
                    step="0.5"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Math.max(0.5, Number(e.target.value)))}
                    className="w-16 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 text-right"
                  />
                  <span className="text-xs font-bold text-indigo-600">Hours/day</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Input 5: Days Per Week Available */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Available Study Days Per Week</label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 6, 5, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDaysPerWeek(num)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      daysPerWeek === num
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {num === 7 ? '7 Days (All)' : `${num} Days/Wk`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Verdict (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Verdict Card */}
          <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm transition-all relative overflow-hidden ${
            calculations.status === 'yes'
              ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 border-emerald-500/30 text-white'
              : calculations.status === 'possible'
              ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 border-amber-500/30 text-white'
              : 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 border-rose-500/30 text-white'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold backdrop-blur-xs">
                {calculations.status === 'yes' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300">COMFORTABLE PACE</span>
                  </>
                ) : calculations.status === 'possible' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-300">MODERATE PACING</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span className="text-rose-300">SCHEDULE DEFICIT</span>
                  </>
                )}
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-300 block font-medium">Time Capacity</span>
                <span className="text-xl font-black">{calculations.capacityPercent}%</span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {calculations.headline}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              {calculations.summaryText}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-300 block">Total Required</span>
                <span className="text-lg font-black text-white">{calculations.totalHoursRequired}h</span>
                <span className="text-[10px] text-slate-400 block">{chaptersRemaining} ch × {hoursPerChapter}h</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-300 block">Total Available</span>
                <span className="text-lg font-black text-white">{calculations.totalHoursAvailable}h</span>
                <span className="text-[10px] text-slate-400 block">{calculations.effectiveDays}d × {dailyHours}h</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-300 block">Buffer Margin</span>
                <span className={`text-lg font-black ${calculations.bufferHours >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {calculations.bufferHours >= 0 ? `+${calculations.bufferHours}h` : `${calculations.bufferHours}h`}
                </span>
                <span className="text-[10px] text-slate-400 block">{calculations.bufferHours >= 0 ? 'Extra buffer' : 'Deficit'}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyResult}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Result'}</span>
            </button>
            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>

          {/* Detailed Breakdown Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Recommended Daily & Weekly Pace</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Required Chapters / Day</span>
                <span className="text-base font-black text-indigo-600">{calculations.requiredChaptersPerDay}</span>
                <span className="text-[10px] text-slate-400 block">chapters each study day</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Required Chapters / Week</span>
                <span className="text-base font-black text-indigo-600">{calculations.requiredChaptersPerWeek}</span>
                <span className="text-[10px] text-slate-400 block">chapters every 7 days</span>
              </div>
            </div>

            {/* Strategic Adjustment Tips */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Actionable Adjustments & Tips:</span>
              </span>
              <ul className="text-xs text-indigo-900/90 space-y-1.5 pl-4 list-disc">
                <li>
                  If you increase study by <strong>+1 hour/day ({dailyHours + 1}h)</strong>, your buffer becomes{' '}
                  <strong className={calculations.plus1Buffer >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {calculations.plus1Buffer >= 0 ? `+${calculations.plus1Buffer}h` : `${calculations.plus1Buffer}h`}
                  </strong>.
                </li>
                <li>
                  If you study <strong>+2 hours/day ({dailyHours + 2}h)</strong>, your buffer becomes{' '}
                  <strong className={calculations.plus2Buffer >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {calculations.plus2Buffer >= 0 ? `+${calculations.plus2Buffer}h` : `${calculations.plus2Buffer}h`}
                  </strong>.
                </li>
                <li>
                  Allocate at least 15-20% of your total study time to revision and solving previous year questions (PYQs).
                </li>
              </ul>
            </div>
          </div>

          {/* Non-Guarantee Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-500 text-xs">
            <p className="text-[11px] leading-relaxed">
              <strong>Planning note:</strong> This tool calculates mathematical time budgets based on your inputs. It does not predict or guarantee exam outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
