import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, Calendar, Clock, BookOpen, Plus, Trash2, CheckCircle2, 
  Sparkles, Download, Printer, Share2, Award, Zap, 
  RotateCcw, Check, AlertCircle, TrendingUp, Target, BarChart2,
  Layers, ShieldAlert, ArrowRight, Copy, HelpCircle, FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlannerSubject {
  id: string;
  name: string;
  level: 'strong' | 'average' | 'weak';
  chaptersRemaining: number;
  estimatedHours: number;
  currentScore?: number;
}

const EXAM_PRESETS = [
  { name: 'NEET 2026', defaultSubs: [
    { id: '1', name: 'Biology (Botany & Zoology)', level: 'average' as const, chaptersRemaining: 18, estimatedHours: 45, currentScore: 240 },
    { id: '2', name: 'Physics & Mechanics', level: 'weak' as const, chaptersRemaining: 14, estimatedHours: 50, currentScore: 80 },
    { id: '3', name: 'Chemistry (Org, Inorg, Phys)', level: 'average' as const, chaptersRemaining: 16, estimatedHours: 42, currentScore: 110 },
  ]},
  { name: 'JEE Main & Adv', defaultSubs: [
    { id: '1', name: 'Mathematics & Calculus', level: 'weak' as const, chaptersRemaining: 15, estimatedHours: 60, currentScore: 40 },
    { id: '2', name: 'Physics & Electrodynamics', level: 'average' as const, chaptersRemaining: 12, estimatedHours: 45, currentScore: 55 },
    { id: '3', name: 'Chemistry & Physical Chem', level: 'strong' as const, chaptersRemaining: 10, estimatedHours: 30, currentScore: 70 },
  ]},
  { name: 'CBSE Board 12th', defaultSubs: [
    { id: '1', name: 'Core Subject 1', level: 'average' as const, chaptersRemaining: 8, estimatedHours: 24, currentScore: 60 },
    { id: '2', name: 'Core Subject 2', level: 'weak' as const, chaptersRemaining: 10, estimatedHours: 30, currentScore: 50 },
    { id: '3', name: 'Elective Subject', level: 'strong' as const, chaptersRemaining: 6, estimatedHours: 15, currentScore: 75 },
    { id: '4', name: 'Language & English', level: 'strong' as const, chaptersRemaining: 5, estimatedHours: 12, currentScore: 80 },
  ]},
  { name: 'CUET UG', defaultSubs: [
    { id: '1', name: 'Domain Subject 1', level: 'average' as const, chaptersRemaining: 10, estimatedHours: 28, currentScore: 130 },
    { id: '2', name: 'Domain Subject 2', level: 'weak' as const, chaptersRemaining: 12, estimatedHours: 35, currentScore: 110 },
    { id: '3', name: 'General Test & Reasoning', level: 'average' as const, chaptersRemaining: 8, estimatedHours: 20, currentScore: 140 },
    { id: '4', name: 'Language Test', level: 'strong' as const, chaptersRemaining: 6, estimatedHours: 14, currentScore: 160 },
  ]},
  { name: 'College Semester Finals', defaultSubs: [
    { id: '1', name: 'Major Subject A', level: 'weak' as const, chaptersRemaining: 5, estimatedHours: 25, currentScore: 50 },
    { id: '2', name: 'Major Subject B', level: 'average' as const, chaptersRemaining: 4, estimatedHours: 18, currentScore: 65 },
    { id: '3', name: 'Lab / Elective', level: 'strong' as const, chaptersRemaining: 3, estimatedHours: 10, currentScore: 80 },
  ]},
  { name: 'Custom Exam', defaultSubs: [
    { id: '1', name: 'Subject 1', level: 'average' as const, chaptersRemaining: 8, estimatedHours: 24, currentScore: 60 },
    { id: '2', name: 'Subject 2', level: 'weak' as const, chaptersRemaining: 10, estimatedHours: 30, currentScore: 45 },
  ]}
];

export const StudyDecisionPlanner: React.FC = () => {
  const [examName, setExamName] = useState<string>('NEET 2026');
  const [examDate, setExamDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 75); // 75 days from today
    return d.toISOString().split('T')[0];
  });

  const [currentScore, setCurrentScore] = useState<number>(430);
  const [targetScore, setTargetScore] = useState<number>(640);
  const [isScorePercentage, setIsScorePercentage] = useState<boolean>(false);

  const [dailyHours, setDailyHours] = useState<number>(6);
  const [daysOffPerWeek, setDaysOffPerWeek] = useState<number>(1);
  const [sessionLength, setSessionLength] = useState<number>(60); // 30, 45, 60, 90 min

  const [subjects, setSubjects] = useState<PlannerSubject[]>(() => {
    const saved = localStorage.getItem('naviko_decision_subjects');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return EXAM_PRESETS[0].defaultSubs;
  });

  // New subject inputs
  const [newSubName, setNewSubName] = useState('');
  const [newSubLevel, setNewSubLevel] = useState<'strong' | 'average' | 'weak'>('average');
  const [newSubChapters, setNewSubChapters] = useState(8);
  const [newSubHours, setNewSubHours] = useState(24);

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'weekly' | 'subjects'>('overview');

  // Persistence
  useEffect(() => {
    localStorage.setItem('naviko_decision_subjects', JSON.stringify(subjects));
  }, [subjects]);

  // Handle Preset Change
  const handleApplyPreset = (presetName: string) => {
    const found = EXAM_PRESETS.find(p => p.name === presetName);
    if (found) {
      setExamName(found.name);
      setSubjects(found.defaultSubs.map(s => ({ ...s, id: Date.now() + Math.random().toString() })));
    }
  };

  // Add Subject
  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    const sub: PlannerSubject = {
      id: Date.now().toString(),
      name: newSubName.trim(),
      level: newSubLevel,
      chaptersRemaining: Math.max(1, newSubChapters),
      estimatedHours: Math.max(1, newSubHours),
    };
    setSubjects([...subjects, sub]);
    setNewSubName('');
    setNewSubChapters(8);
    setNewSubHours(24);
  };

  // Remove Subject
  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  // Update subject field
  const handleUpdateSubject = (id: string, field: keyof PlannerSubject, value: any) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Reset to default
  const handleReset = () => {
    const defaultPreset = EXAM_PRESETS[0];
    setExamName(defaultPreset.name);
    setSubjects(defaultPreset.defaultSubs);
    const d = new Date();
    d.setDate(d.getDate() + 75);
    setExamDate(d.toISOString().split('T')[0]);
    setCurrentScore(430);
    setTargetScore(640);
    setIsScorePercentage(false);
    setDailyHours(6);
    setDaysOffPerWeek(1);
    setSessionLength(60);
  };

  // Calculations
  const analysis = useMemo(() => {
    // 1. Calendar days remaining
    let daysRemaining = 0;
    if (examDate) {
      const targetTime = new Date(examDate).getTime();
      const todayTime = new Date().setHours(0, 0, 0, 0);
      daysRemaining = Math.max(0, Math.ceil((targetTime - todayTime) / (1000 * 60 * 60 * 24)));
    }

    // 2. Study days accounting for days off
    const effectiveWeeks = daysRemaining / 7;
    const totalDaysOff = Math.round(effectiveWeeks * daysOffPerWeek);
    const effectiveStudyDays = Math.max(1, daysRemaining - totalDaysOff);

    // 3. Available Study Hours
    const totalAvailableHours = effectiveStudyDays * dailyHours;

    // 4. Required Subject Study Hours
    let rawStudyHoursRequired = 0;
    let totalChaptersRemaining = 0;

    subjects.forEach(s => {
      totalChaptersRemaining += (s.chaptersRemaining || 0);
      // Difficulty/level multiplier: Weak = 1.25x, Average = 1.0x, Strong = 0.85x
      const multiplier = s.level === 'weak' ? 1.25 : s.level === 'strong' ? 0.85 : 1.0;
      rawStudyHoursRequired += (s.estimatedHours || (s.chaptersRemaining * 3)) * multiplier;
    });

    // 5. Revision & Mock Test Allocation (20% revision + 10% test practice)
    const revisionHoursRequired = Math.round(rawStudyHoursRequired * 0.18);
    const mockTestHoursRequired = Math.round(rawStudyHoursRequired * 0.10);
    const totalHoursRequired = Math.round(rawStudyHoursRequired + revisionHoursRequired + mockTestHoursRequired);

    // 6. Required hours per day
    const requiredHoursPerDay = effectiveStudyDays > 0 ? (totalHoursRequired / effectiveStudyDays) : 0;

    // 7. Capacity & Buffer
    const bufferHours = totalAvailableHours - totalHoursRequired;
    const capacityRatio = totalHoursRequired > 0 ? (totalAvailableHours / totalHoursRequired) : 1;
    const capacityPercentage = Math.round(capacityRatio * 100);
    const bufferDays = dailyHours > 0 ? Math.round(bufferHours / dailyHours) : 0;

    // 8. Verdict
    let verdict: 'green' | 'yellow' | 'red' = 'green';
    let verdictTitle = 'Your target is realistic';
    let verdictDesc = `You have approximately ${totalAvailableHours} study hours available versus ${totalHoursRequired} hours required (${Math.max(0, bufferHours)} hours buffer). Maintain your daily ${dailyHours}h discipline.`;

    if (capacityRatio < 0.85) {
      verdict = 'red';
      verdictTitle = 'Your current available time may not be enough';
      verdictDesc = `You have a deficit of ${Math.abs(bufferHours)} hours. Consider increasing study time to ${requiredHoursPerDay.toFixed(1)}h/day, prioritizing high-yield chapters, or reducing days off.`;
    } else if (capacityRatio <= 1.08) {
      verdict = 'yellow';
      verdictTitle = 'Your target is possible but requires a tighter schedule';
      verdictDesc = `Your capacity is at ${capacityPercentage}%. You have minimal buffer time (${Math.max(0, bufferHours)}h). Follow the daily targets closely to avoid last-minute rush.`;
    }

    // 9. Subject Priority Ranking (Weak level + high chapters = top priority)
    const prioritizedSubjects = [...subjects].map(s => {
      const weight = s.level === 'weak' ? 3 : s.level === 'average' ? 2 : 1;
      const scoreGap = s.currentScore ? Math.max(0, 100 - s.currentScore) : 50;
      const priorityScore = (s.chaptersRemaining * weight) + (scoreGap * 0.2);
      return {
        ...s,
        priorityScore,
        hoursRequired: Math.round(s.estimatedHours * (s.level === 'weak' ? 1.25 : s.level === 'strong' ? 0.85 : 1.0)),
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);

    // 10. Daily Allocation in hours per subject
    const totalWeight = prioritizedSubjects.reduce((acc, curr) => acc + curr.priorityScore, 0) || 1;
    const subjectAllocations = prioritizedSubjects.map(s => {
      const share = s.priorityScore / totalWeight;
      const dailyTime = (dailyHours * share);
      const weeklyHours = (dailyTime * (7 - daysOffPerWeek));
      const chaptersPerWeek = effectiveWeeks > 0 ? (s.chaptersRemaining / effectiveWeeks).toFixed(1) : '0';
      return {
        ...s,
        dailyHours: dailyTime,
        dailyMinutes: Math.round(dailyTime * 60),
        weeklyHours: Math.round(weeklyHours * 10) / 10,
        chaptersPerWeek,
      };
    });

    // 11. Target improvement
    const scoreDiff = targetScore - currentScore;

    return {
      daysRemaining,
      effectiveStudyDays,
      totalDaysOff,
      totalAvailableHours,
      rawStudyHoursRequired,
      revisionHoursRequired,
      mockTestHoursRequired,
      totalHoursRequired,
      requiredHoursPerDay: Math.round(requiredHoursPerDay * 10) / 10,
      bufferHours,
      bufferDays,
      capacityPercentage,
      verdict,
      verdictTitle,
      verdictDesc,
      prioritizedSubjects,
      subjectAllocations,
      totalChaptersRemaining,
      scoreDiff,
      effectiveWeeks: Math.max(1, Math.round(effectiveWeeks * 10) / 10),
    };
  }, [examDate, dailyHours, daysOffPerWeek, subjects, targetScore, currentScore]);

  // Copy plan to clipboard
  const handleCopyPlan = () => {
    const text = `🎯 STUDY DECISION PLAN — ${examName}
Exam Date: ${examDate} (${analysis.daysRemaining} days remaining)
Target Score: ${targetScore} (Current: ${currentScore}, Gap: +${analysis.scoreDiff})

📊 FEASIBILITY VERDICT:
${analysis.verdict === 'green' ? '🟢' : analysis.verdict === 'yellow' ? '🟡' : '🔴'} ${analysis.verdictTitle}
• Total Hours Required: ${analysis.totalHoursRequired} hrs
• Total Hours Available: ${analysis.totalAvailableHours} hrs
• Buffer Capacity: ${analysis.bufferHours >= 0 ? `+${analysis.bufferHours} hrs buffer` : `${analysis.bufferHours} hrs deficit`}
• Daily Target: ${analysis.requiredHoursPerDay} hrs/day (${dailyHours} hrs scheduled)

📚 SUBJECT PRIORITIES & DAILY TIME ALLOCATION:
${analysis.subjectAllocations.map((s, idx) => `${idx + 1}. ${s.name} [${s.level.toUpperCase()}]
   • Remaining Chapters: ${s.chaptersRemaining}
   • Daily Study Time: ${s.dailyMinutes} mins (${s.weeklyHours} hrs/week)
   • Target Pace: ${s.chaptersPerWeek} chapters/week`).join('\n\n')}

🗓️ SCHEDULE BREAKDOWN:
• Study Days Available: ${analysis.effectiveStudyDays} days (${analysis.totalDaysOff} rest days planned)
• Revision Allocation: ${analysis.revisionHoursRequired} hrs (Periodic active recall)
• Mock Tests Allocation: ${analysis.mockTestHoursRequired} hrs (${Math.max(1, Math.round(analysis.effectiveWeeks * 1.5))} tests recommended)

Generated on NAVIKO: https://naviko.in/student-tools/study-decision-planner`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download plan file
  const handleDownloadPlan = () => {
    const planText = `NAVIKO STUDY DECISION PLAN
Generated: ${new Date().toLocaleDateString()}
Exam: ${examName} | Target Date: ${examDate}
======================================================

1. FEASIBILITY SUMMARY
------------------------------------------------------
Verdict: ${analysis.verdictTitle}
Capacity Ratio: ${analysis.capacityPercentage}%
Days Remaining: ${analysis.daysRemaining} days
Effective Study Days: ${analysis.effectiveStudyDays} days
Available Hours: ${analysis.totalAvailableHours} hrs
Required Hours: ${analysis.totalHoursRequired} hrs (Subjects: ${analysis.rawStudyHoursRequired}h + Revision: ${analysis.revisionHoursRequired}h + Mocks: ${analysis.mockTestHoursRequired}h)
Buffer Time: ${analysis.bufferHours} hrs (~${analysis.bufferDays} buffer days)

2. SUBJECT-WISE BREAKDOWN
------------------------------------------------------
${analysis.subjectAllocations.map(s => `Subject: ${s.name}
  - Level: ${s.level}
  - Chapters: ${s.chaptersRemaining}
  - Daily Allocation: ${s.dailyMinutes} mins/day
  - Weekly Hours: ${s.weeklyHours} hrs/week
  - Weekly Chapter Velocity: ${s.chaptersPerWeek} chapters/week
`).join('\n')}

3. STRATEGIC RECOMMENDATIONS
------------------------------------------------------
- High-Priority Subject: ${analysis.prioritizedSubjects[0]?.name || 'N/A'} (Focus initial morning blocks here)
- Mock Test Frequency: 1-2 full-length tests every week
- Daily Session Length: ${sessionLength} minutes per deep work block
- Buffer Strategy: Reserve the final 7-10 days exclusively for comprehensive mocks and revision.

Disclaimer: Illustration and planning estimate only. This calculator does not guarantee exam results.
https://naviko.in/student-tools/study-decision-planner
`;

    const blob = new Blob([planText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Study_Decision_Plan_${examName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Share result
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Study Decision Plan for ${examName} — NAVIKO`,
          text: `My Study Plan for ${examName}: ${analysis.verdictTitle}. Required: ${analysis.requiredHoursPerDay} hrs/day across ${analysis.daysRemaining} days.`,
          url: window.location.href,
        });
      } catch {
        handleCopyPlan();
      }
    } else {
      handleCopyPlan();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Top Banner with Presets */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Study Decision Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset to default settings"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Plan Your Target Score with Realistic Capacity Math
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-3xl">
            Select your exam preset or configure custom subjects, daily hours, strengths, and exam deadlines to verify feasibility and generate an actionable daily study timetable.
          </p>

          {/* Preset Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-indigo-300 font-semibold mr-1">Quick Presets:</span>
            {EXAM_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  examName === preset.name
                    ? 'bg-indigo-500 text-white shadow-xs ring-2 ring-white/30'
                    : 'bg-white/10 text-indigo-100 hover:bg-white/20'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Inputs | Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Exam & Score Goals */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Exam Details & Target Goals</span>
              </h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Step 1 of 3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Exam Name</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. NEET, JEE, CBSE"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Current Score / Level</label>
                  <span className="text-[11px] text-slate-500">Baseline</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. 450 or 60%"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Score / %</label>
                  <span className="text-[11px] text-indigo-600 font-bold">Goal (+{analysis.scoreDiff > 0 ? analysis.scoreDiff : 0})</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. 650 or 90%"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Study Availability */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Daily Availability & Rest Schedule</span>
              </h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Step 2 of 3
              </span>
            </div>

            {/* Daily Hours Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Available Study Hours / Day</label>
                <span className="text-sm font-extrabold text-indigo-600 bg-indigo-50 px-3 py-0.5 rounded-lg">
                  {dailyHours} Hours / day
                </span>
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
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1h (Light)</span>
                <span>6h (Moderate)</span>
                <span>10h (Intensive)</span>
                <span>14h (Maximum)</span>
              </div>
            </div>

            {/* Days off per week */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Rest Days / Week</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDaysOffPerWeek(days)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        daysOffPerWeek === days
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {days === 0 ? 'No rest' : `${days} day/wk`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Study Session Length</label>
                <select
                  value={sessionLength}
                  onChange={(e) => setSessionLength(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value={45}>45 mins (Pomodoro Focus)</option>
                  <option value={60}>60 mins (Standard Hour)</option>
                  <option value={90}>90 mins (Deep Block)</option>
                  <option value={120}>120 mins (Mock Test Block)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Subjects & Chapters remaining */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Subjects & Remaining Syllabus</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {subjects.length} subjects • {analysis.totalChaptersRemaining} total chapters
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Step 3 of 3
              </span>
            </div>

            {/* List of current subjects */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {subjects.map((sub) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => handleUpdateSubject(sub.id, 'name', e.target.value)}
                      className="font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden px-1 py-0.5 flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={sub.level}
                        onChange={(e) => handleUpdateSubject(sub.id, 'level', e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                          sub.level === 'weak' 
                            ? 'bg-rose-50 border-rose-200 text-rose-700' 
                            : sub.level === 'strong' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        <option value="weak">Weak Area (1.25x time)</option>
                        <option value="average">Average Level (1.0x)</option>
                        <option value="strong">Strong Area (0.85x)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1 font-medium">Chapters Remaining</span>
                      <input
                        type="number"
                        min="1"
                        value={sub.chaptersRemaining}
                        onChange={(e) => handleUpdateSubject(sub.id, 'chaptersRemaining', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1 font-medium">Estimated Hours</span>
                      <input
                        type="number"
                        min="1"
                        value={sub.estimatedHours}
                        onChange={(e) => handleUpdateSubject(sub.id, 'estimatedHours', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Subject Form */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <span className="text-xs font-bold text-indigo-900 block">Add Another Subject</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Subject Name (e.g. Zoology)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="sm:col-span-5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                />
                <select
                  value={newSubLevel}
                  onChange={(e) => setNewSubLevel(e.target.value as any)}
                  className="sm:col-span-3 px-2 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700"
                >
                  <option value="weak">Weak</option>
                  <option value="average">Average</option>
                  <option value="strong">Strong</option>
                </select>
                <div className="sm:col-span-2 flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    placeholder="Chaps"
                    value={newSubChapters}
                    onChange={(e) => setNewSubChapters(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                    title="Chapters remaining"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="sm:col-span-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Plan Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Verdict Card */}
          <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm transition-all relative overflow-hidden ${
            analysis.verdict === 'green'
              ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 border-emerald-500/30 text-white'
              : analysis.verdict === 'yellow'
              ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 border-amber-500/30 text-white'
              : 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 border-rose-500/30 text-white'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold backdrop-blur-xs">
                {analysis.verdict === 'green' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300">FEASIBLE TARGET</span>
                  </>
                ) : analysis.verdict === 'yellow' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-300">TIGHT TIMELINE</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span className="text-rose-300">ACTION REQUIRED</span>
                  </>
                )}
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-300 block font-medium">Study Capacity</span>
                <span className="text-xl font-black">{analysis.capacityPercentage}%</span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {analysis.verdictTitle}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              {analysis.verdictDesc}
            </p>

            {/* Quick Metrics Pills */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-300 block">Days Remaining</span>
                <span className="text-lg font-black text-white">{analysis.daysRemaining}</span>
                <span className="text-[10px] text-slate-400 block">{analysis.effectiveStudyDays} study days</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-300 block">Required / Day</span>
                <span className="text-lg font-black text-white">{analysis.requiredHoursPerDay}h</span>
                <span className="text-[10px] text-slate-400 block">vs {dailyHours}h available</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-300 block">Buffer Time</span>
                <span className={`text-lg font-black ${analysis.bufferHours >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {analysis.bufferHours >= 0 ? `+${analysis.bufferHours}h` : `${analysis.bufferHours}h`}
                </span>
                <span className="text-[10px] text-slate-400 block">{analysis.bufferDays >= 0 ? `~${analysis.bufferDays} days` : 'Deficit'}</span>
              </div>
            </div>
          </div>

          {/* Action Bar (Copy, Print, Download, Share) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyPlan}
              className="flex-1 min-w-[130px] py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Plan'}</span>
            </button>

            <button
              onClick={handleDownloadPlan}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Download text study plan"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Save Plan</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Print study plan"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Share study plan"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>

          {/* Navigation Tabs for Output Views */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview & Buffer
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Allocation
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'weekly'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Targets
            </button>
          </div>

          {/* Tab Content 1: Overview & Buffer */}
          {activeTab === 'overview' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span>Time Budget & Allocation Breakdown</span>
              </h4>

              {/* Progress Bar of Hours */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Hours Required ({analysis.totalHoursRequired}h)</span>
                  <span>Hours Available ({analysis.totalAvailableHours}h)</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, (analysis.rawStudyHoursRequired / (analysis.totalAvailableHours || 1)) * 100)}%` }}
                    className="bg-indigo-600 h-full"
                    title={`Core Chapters: ${analysis.rawStudyHoursRequired}h`}
                  />
                  <div
                    style={{ width: `${Math.min(100, (analysis.revisionHoursRequired / (analysis.totalAvailableHours || 1)) * 100)}%` }}
                    className="bg-amber-500 h-full"
                    title={`Revision: ${analysis.revisionHoursRequired}h`}
                  />
                  <div
                    style={{ width: `${Math.min(100, (analysis.mockTestHoursRequired / (analysis.totalAvailableHours || 1)) * 100)}%` }}
                    className="bg-purple-500 h-full"
                    title={`Mock Tests: ${analysis.mockTestHoursRequired}h`}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Core Study: {analysis.rawStudyHoursRequired}h</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Revision: {analysis.revisionHoursRequired}h</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Mock Tests: {analysis.mockTestHoursRequired}h</span>
                </div>
              </div>

              {/* Key Highlights Table */}
              <div className="divide-y divide-slate-100 text-xs pt-2">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">Exam Date & Timeframe</span>
                  <span className="font-bold text-slate-900">{examDate} ({analysis.daysRemaining} days away)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">Weekly Study Routine</span>
                  <span className="font-bold text-slate-900">{7 - daysOffPerWeek} study days / {daysOffPerWeek} rest day</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">High-Priority Focus Subject</span>
                  <span className="font-bold text-rose-600">{analysis.prioritizedSubjects[0]?.name || 'N/A'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">Recommended Mock Tests</span>
                  <span className="font-bold text-indigo-600">{Math.max(2, Math.round(analysis.effectiveWeeks * 1.5))} Full Length Tests</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Daily Allocation */}
          {activeTab === 'daily' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Recommended Daily Time Allocation</span>
                </h4>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                  {dailyHours}h Total Daily
                </span>
              </div>

              <div className="space-y-3">
                {analysis.subjectAllocations.map((sub, idx) => (
                  <div key={sub.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{sub.name}</h5>
                        <p className="text-[11px] text-slate-500">
                          {sub.chaptersRemaining} chapters remaining • {sub.level}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-indigo-600 block">
                        {sub.dailyMinutes} mins
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({(sub.dailyMinutes / 60).toFixed(1)} hrs/day)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 3: Weekly Targets */}
          {activeTab === 'weekly' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Weekly Pace & Chapter Goals</span>
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  Across {analysis.effectiveWeeks} weeks
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="pb-2">Subject</th>
                      <th className="pb-2 text-center">Remaining</th>
                      <th className="pb-2 text-center">Weekly Target</th>
                      <th className="pb-2 text-right">Weekly Study</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.subjectAllocations.map((sub) => (
                      <tr key={sub.id} className="py-2.5">
                        <td className="py-2.5 font-bold text-slate-800">{sub.name}</td>
                        <td className="py-2.5 text-center text-slate-600">{sub.chaptersRemaining} ch</td>
                        <td className="py-2.5 text-center font-bold text-indigo-600">{sub.chaptersPerWeek} ch/wk</td>
                        <td className="py-2.5 text-right font-semibold text-slate-900">{sub.weeklyHours}h/wk</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Non-Guarantee Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-500 text-xs space-y-1">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>Important Notice:</strong> Illustration and planning estimate only. This planner provides strategic time estimates based on your entered parameters and does not guarantee exam results or test performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
