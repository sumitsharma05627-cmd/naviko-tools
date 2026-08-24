import React, { useState, useMemo, useEffect } from 'react';
import { 
  RotateCcw, Calendar, Clock, BookOpen, Plus, Trash2, CheckCircle2, 
  Sparkles, Download, Printer, Share2, Award, Zap, 
  Check, AlertCircle, TrendingUp, Target, BarChart2,
  Layers, ArrowRight, Copy, CheckCircle, Clock3, Circle, FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BacklogChapter {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'not_started' | 'in_progress' | 'completed';
}

interface BacklogSubject {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  chapters: BacklogChapter[];
}

const DEFAULT_SUBJECTS: BacklogSubject[] = [
  {
    id: 'sub-1',
    name: 'Physics',
    difficulty: 'hard',
    chapters: [
      { id: 'phy-1', name: 'Rotational Motion & Inertia', difficulty: 'hard', status: 'completed' },
      { id: 'phy-2', name: 'Thermodynamics & Heat Transfer', difficulty: 'medium', status: 'in_progress' },
      { id: 'phy-3', name: 'Electrostatics & Gauss Law', difficulty: 'hard', status: 'not_started' },
      { id: 'phy-4', name: 'Current Electricity & Circuits', difficulty: 'medium', status: 'not_started' },
      { id: 'phy-5', name: 'Ray Optics & Optical Instruments', difficulty: 'medium', status: 'not_started' },
    ]
  },
  {
    id: 'sub-2',
    name: 'Chemistry',
    difficulty: 'medium',
    chapters: [
      { id: 'chem-1', name: 'Chemical Kinetics & Equilibrium', difficulty: 'medium', status: 'completed' },
      { id: 'chem-2', name: 'Aldehydes, Ketones & Carboxylic Acids', difficulty: 'hard', status: 'not_started' },
      { id: 'chem-3', name: 'Coordination Compounds', difficulty: 'medium', status: 'not_started' },
      { id: 'chem-4', name: 'Solutions & Colligative Properties', difficulty: 'easy', status: 'not_started' },
    ]
  },
  {
    id: 'sub-3',
    name: 'Mathematics / Biology',
    difficulty: 'hard',
    chapters: [
      { id: 'bio-1', name: 'Genetics & Evolution / Integrals', difficulty: 'hard', status: 'not_started' },
      { id: 'bio-2', name: 'Biotechnology / Differential Equations', difficulty: 'medium', status: 'not_started' },
      { id: 'bio-3', name: 'Ecology & Environment / Vectors 3D', difficulty: 'easy', status: 'not_started' },
    ]
  }
];

export const BacklogRecoveryPlanner: React.FC = () => {
  const [daysAvailable, setDaysAvailable] = useState<number>(30);
  const [dailyHours, setDailyHours] = useState<number>(5);
  const [revisionMinutesPerDay, setRevisionMinutesPerDay] = useState<number>(30);
  const [testsPerWeek, setTestsPerWeek] = useState<number>(1);
  
  const [subjects, setSubjects] = useState<BacklogSubject[]>(() => {
    const saved = localStorage.getItem('naviko_backlog_subjects');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return DEFAULT_SUBJECTS;
  });

  const [activeTab, setActiveTab] = useState<'schedule' | 'tracker' | 'manage'>('schedule');
  const [copied, setCopied] = useState(false);

  // New subject / chapter entry states
  const [newSubName, setNewSubName] = useState('');
  const [newSubDifficulty, setNewSubDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [activeAddingSubId, setActiveAddingSubId] = useState<string | null>(null);
  const [newChapName, setNewChapName] = useState('');
  const [newChapDifficulty, setNewChapDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Persistence
  useEffect(() => {
    localStorage.setItem('naviko_backlog_subjects', JSON.stringify(subjects));
  }, [subjects]);

  // Total chapters flatten
  const allChapters = useMemo(() => {
    const list: { chapter: BacklogChapter; subjectName: string; subjectId: string }[] = [];
    subjects.forEach(s => {
      s.chapters.forEach(c => {
        list.push({ chapter: c, subjectName: s.name, subjectId: s.id });
      });
    });
    return list;
  }, [subjects]);

  // Completed chapters count
  const completedChaptersCount = useMemo(() => {
    return allChapters.filter(c => c.chapter.status === 'completed').length;
  }, [allChapters]);

  const inProgressChaptersCount = useMemo(() => {
    return allChapters.filter(c => c.chapter.status === 'in_progress').length;
  }, [allChapters]);

  const totalChaptersCount = allChapters.length;
  const remainingChaptersCount = totalChaptersCount - completedChaptersCount;
  const progressPercentage = totalChaptersCount > 0 ? Math.round((completedChaptersCount / totalChaptersCount) * 100) : 0;

  // Toggle chapter status
  const handleUpdateChapterStatus = (subjectId: string, chapterId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    const updated = subjects.map(sub => {
      if (sub.id !== subjectId) return sub;
      return {
        ...sub,
        chapters: sub.chapters.map(ch => ch.id === chapterId ? { ...ch, status } : ch)
      };
    });
    setSubjects(updated);

    if (status === 'completed') {
      confetti({ particleCount: 25, spread: 40, origin: { y: 0.8 } });
    }
  };

  // Add Subject
  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    const newSub: BacklogSubject = {
      id: 'sub-' + Date.now(),
      name: newSubName.trim(),
      difficulty: newSubDifficulty,
      chapters: [
        { id: 'chap-' + Date.now() + '-1', name: 'Chapter 1', difficulty: newSubDifficulty, status: 'not_started' },
        { id: 'chap-' + Date.now() + '-2', name: 'Chapter 2', difficulty: newSubDifficulty, status: 'not_started' }
      ]
    };
    setSubjects([...subjects, newSub]);
    setNewSubName('');
  };

  // Remove Subject
  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  // Add Chapter to Subject
  const handleAddChapter = (subjectId: string) => {
    if (!newChapName.trim()) return;
    setSubjects(subjects.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: [
          ...s.chapters,
          {
            id: 'chap-' + Date.now(),
            name: newChapName.trim(),
            difficulty: newChapDifficulty,
            status: 'not_started'
          }
        ]
      };
    }));
    setNewChapName('');
    setActiveAddingSubId(null);
  };

  // Remove Chapter
  const handleRemoveChapter = (subjectId: string, chapterId: string) => {
    setSubjects(subjects.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: s.chapters.filter(ch => ch.id !== chapterId)
      };
    }));
  };

  // Reset to default
  const handleReset = () => {
    setSubjects(DEFAULT_SUBJECTS);
    setDaysAvailable(30);
    setDailyHours(5);
    setRevisionMinutesPerDay(30);
    setTestsPerWeek(1);
  };

  // Calculations & Schedule Generation
  const analysis = useMemo(() => {
    // 1. Difficulty multipliers (Hours per chapter)
    // Easy: 2.5h, Medium: 3.5h, Hard: 5.0h
    let totalWeightedHoursRequired = 0;

    allChapters.forEach(item => {
      if (item.chapter.status !== 'completed') {
        const mult = item.chapter.difficulty === 'hard' ? 5.0 : item.chapter.difficulty === 'easy' ? 2.5 : 3.5;
        totalWeightedHoursRequired += mult;
      }
    });

    // 2. Revision hours & test hours
    const totalWeeks = Math.max(1, daysAvailable / 7);
    const totalRevisionHours = (daysAvailable * (revisionMinutesPerDay / 60));
    const totalTestHours = (totalWeeks * testsPerWeek * 3); // 3h per mock test

    const grandTotalHours = Math.round((totalWeightedHoursRequired + totalRevisionHours + totalTestHours) * 10) / 10;
    const totalAvailableHours = daysAvailable * dailyHours;

    // 3. Daily and weekly workload rates
    const chaptersPerDay = daysAvailable > 0 ? (remainingChaptersCount / daysAvailable) : 0;
    const chaptersPerWeek = Math.round(chaptersPerDay * 7 * 10) / 10;
    const requiredDailyHours = daysAvailable > 0 ? Math.round((grandTotalHours / daysAvailable) * 10) / 10 : 0;

    // 4. Buffer calculation (Buffer days)
    const bufferHours = totalAvailableHours - grandTotalHours;
    const bufferDays = dailyHours > 0 ? Math.round(bufferHours / dailyHours) : 0;

    // 5. Pace / Velocity status
    let paceStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
    if (progressPercentage > 60 && bufferHours >= 15) {
      paceStatus = 'ahead';
    } else if (bufferHours < -5) {
      paceStatus = 'behind';
    }

    // 6. Generate Day-by-Day Recovery Roadmap
    // We map remaining chapters across the available days
    const dailySchedule: {
      dayNumber: number;
      tasks: { subjectName: string; chapterName: string; difficulty: string; timeMins: number }[];
      revisionNote: string;
      isTestDay: boolean;
    }[] = [];

    const uncompleted = allChapters.filter(c => c.chapter.status !== 'completed');
    let chapIndex = 0;

    for (let day = 1; day <= daysAvailable; day++) {
      const isTestDay = testsPerWeek > 0 && day % Math.max(1, Math.floor(7 / testsPerWeek)) === 0;
      const dayTasks: { subjectName: string; chapterName: string; difficulty: string; timeMins: number }[] = [];

      // If test day, allocate time to mock
      if (isTestDay) {
        dayTasks.push({
          subjectName: 'Weekly Assessment',
          chapterName: 'Full / Part Syllabus Mock Test & Error Analysis',
          difficulty: 'hard',
          timeMins: 180
        });
      }

      // Assign 1 or 2 chapters based on daily target
      const chaptersForToday = Math.max(1, Math.round(chaptersPerDay));
      for (let k = 0; k < chaptersForToday && chapIndex < uncompleted.length; k++) {
        const item = uncompleted[chapIndex];
        const estMins = item.chapter.difficulty === 'hard' ? 180 : item.chapter.difficulty === 'easy' ? 90 : 135;
        dayTasks.push({
          subjectName: item.subjectName,
          chapterName: item.chapter.name,
          difficulty: item.chapter.difficulty,
          timeMins: estMins
        });
        chapIndex++;
      }

      dailySchedule.push({
        dayNumber: day,
        tasks: dayTasks,
        revisionNote: revisionMinutesPerDay > 0 ? `${revisionMinutesPerDay} mins: Active Recall & Formula Sheets` : '',
        isTestDay
      });
    }

    return {
      grandTotalHours,
      totalAvailableHours,
      bufferHours: Math.round(bufferHours * 10) / 10,
      bufferDays,
      chaptersPerDay: Math.round(chaptersPerDay * 10) / 10,
      chaptersPerWeek,
      requiredDailyHours,
      totalWeightedHoursRequired: Math.round(totalWeightedHoursRequired),
      totalRevisionHours: Math.round(totalRevisionHours),
      totalTestHours: Math.round(totalTestHours),
      paceStatus,
      dailySchedule
    };
  }, [allChapters, daysAvailable, dailyHours, revisionMinutesPerDay, testsPerWeek, remainingChaptersCount, progressPercentage]);

  // Copy schedule
  const handleCopySchedule = () => {
    const text = `📋 BACKLOG RECOVERY PLAN — NAVIKO
Available Days: ${daysAvailable} days | Daily Hours: ${dailyHours}h/day
Total Syllabus Chapters: ${totalChaptersCount} (Completed: ${completedChaptersCount}, Remaining: ${remainingChaptersCount})
Progress: ${progressPercentage}% (${analysis.paceStatus.toUpperCase()})

⏱️ WORKLOAD METRICS:
• Chapters Target: ${analysis.chaptersPerDay} ch/day (${analysis.chaptersPerWeek} ch/week)
• Required Study: ${analysis.requiredDailyHours} hrs/day (${analysis.grandTotalHours}h total required)
• Buffer Time: ${analysis.bufferHours >= 0 ? `+${analysis.bufferHours}h (~${analysis.bufferDays} buffer days)` : `${analysis.bufferHours}h deficit`}

📅 SAMPLE 7-DAY RECOVERY SCHEDULE:
${analysis.dailySchedule.slice(0, 7).map(d => `DAY ${d.dayNumber}:
${d.tasks.map(t => `  • ${t.subjectName}: ${t.chapterName} (${t.timeMins} min)`).join('\n')}
${d.revisionNote ? `  • Revision: ${d.revisionNote}` : ''}`).join('\n\n')}

Generated on NAVIKO: https://naviko.in/student-tools/backlog-recovery-planner`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Backlog Elimination System</span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Transform Overwhelming Syllabus Backlogs into Structured Daily Steps
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-3xl">
            Input your unfinished chapters, set your available recovery days and hours, and get a realistic day-by-day roadmap with revision buffers and progress tracking.
          </p>

          {/* Top Progress Meter */}
          <div className="mt-6 p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-indigo-200">Overall Backlog Cleared</span>
              <span className="text-white text-sm">{progressPercentage}% ({completedChaptersCount}/{totalChaptersCount} Chapters)</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-[11px] text-indigo-300">
              <span>{remainingChaptersCount} chapters remaining</span>
              <span>{daysAvailable} days left to target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Config Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Time Parameters */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Recovery Timeline & Capacity</span>
            </h3>

            {/* Days Available */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Days Available for Recovery</label>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                  {daysAvailable} Days
                </span>
              </div>
              <input
                type="range"
                min="7"
                max="90"
                value={daysAvailable}
                onChange={(e) => setDaysAvailable(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 Week (Sprint)</span>
                <span>30 Days (Standard)</span>
                <span>90 Days (Deep)</span>
              </div>
            </div>

            {/* Daily Study Hours */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Available Study Hours / Day</label>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                  {dailyHours} Hours / day
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Revision & Tests */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Daily Revision</label>
                <select
                  value={revisionMinutesPerDay}
                  onChange={(e) => setRevisionMinutesPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value={0}>0 min (Skip)</option>
                  <option value={30}>30 mins / day</option>
                  <option value={45}>45 mins / day</option>
                  <option value={60}>60 mins / day</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Weekly Tests</label>
                <select
                  value={testsPerWeek}
                  onChange={(e) => setTestsPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value={0}>No tests</option>
                  <option value={1}>1 test / week</option>
                  <option value={2}>2 tests / week</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Subject & Chapter Manager */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Manage Backlog Chapters</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {subjects.length} subjects • {totalChaptersCount} chapters
                </span>
              </div>
            </div>

            {/* Subject accordion/list */}
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {subjects.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{sub.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        sub.difficulty === 'hard' ? 'bg-rose-100 text-rose-700' : sub.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {sub.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveAddingSubId(activeAddingSubId === sub.id ? null : sub.id)}
                        className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold"
                      >
                        + Chapter
                      </button>
                      <button
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                        title="Remove Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Add chapter inline form */}
                  {activeAddingSubId === sub.id && (
                    <div className="p-2 rounded-xl bg-white border border-indigo-200 flex gap-2">
                      <input
                        type="text"
                        placeholder="Chapter Name"
                        value={newChapName}
                        onChange={(e) => setNewChapName(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg"
                      />
                      <select
                        value={newChapDifficulty}
                        onChange={(e) => setNewChapDifficulty(e.target.value as any)}
                        className="text-xs px-2 py-1 border border-slate-200 rounded-lg"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Med</option>
                        <option value="hard">Hard</option>
                      </select>
                      <button
                        onClick={() => handleAddChapter(sub.id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {/* Chapter items */}
                  <div className="space-y-1 pl-1">
                    {sub.chapters.map(ch => (
                      <div key={ch.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-slate-100">
                        <span className="truncate max-w-[200px] text-slate-700">{ch.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{ch.difficulty}</span>
                          <button
                            onClick={() => handleRemoveChapter(sub.id, ch.id)}
                            className="text-slate-300 hover:text-rose-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Subject Input */}
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <span className="text-xs font-bold text-indigo-900 block">Add New Subject</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Subject Name (e.g. Botany)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-slate-200"
                />
                <select
                  value={newSubDifficulty}
                  onChange={(e) => setNewSubDifficulty(e.target.value as any)}
                  className="px-2 py-2 text-xs rounded-xl bg-white border border-slate-200"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <button
                  onClick={handleAddSubject}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Schedule & Interactive Tracker (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Workload Summary Metric Banner */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                  Workload & Pace Analysis
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {analysis.chaptersPerDay} Chapters / Day Required
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySchedule}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Plan'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Daily Study Need</span>
                <span className="text-base font-black text-slate-900">{analysis.requiredDailyHours}h / day</span>
                <span className="text-[10px] text-slate-400">vs {dailyHours}h available</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Weekly Target</span>
                <span className="text-base font-black text-indigo-600">{analysis.chaptersPerWeek} Chapters</span>
                <span className="text-[10px] text-slate-400">per 7 days</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Buffer Margin</span>
                <span className={`text-base font-black ${analysis.bufferHours >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {analysis.bufferHours >= 0 ? `+${analysis.bufferHours}h` : `${analysis.bufferHours}h`}
                </span>
                <span className="text-[10px] text-slate-400">{analysis.bufferDays >= 0 ? `~${analysis.bufferDays} days` : 'Deficit'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">Schedule Velocity</span>
                <span className={`text-xs font-extrabold block mt-1 ${
                  analysis.paceStatus === 'ahead' ? 'text-emerald-600' : analysis.paceStatus === 'behind' ? 'text-rose-600' : 'text-indigo-600'
                }`}>
                  {analysis.paceStatus === 'ahead' ? 'Ahead of Pace' : analysis.paceStatus === 'behind' ? 'Action Needed' : 'On Track'}
                </span>
                <span className="text-[10px] text-slate-400">{progressPercentage}% done</span>
              </div>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'schedule' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day-by-Day Schedule
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tracker' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Chapter Tracker
            </button>
          </div>

          {/* Tab 1: Day-by-Day Schedule Output */}
          {activeTab === 'schedule' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Sequential Recovery Timeline</span>
                </h4>
                <span className="text-xs text-slate-500">Showing all {daysAvailable} days</span>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {analysis.dailySchedule.map((day) => (
                  <div key={day.dayNumber} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-extrabold text-xs">
                          DAY {day.dayNumber}
                        </span>
                        {day.isTestDay && (
                          <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 font-bold text-[10px]">
                            Assessment Day
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {day.tasks.reduce((acc, t) => acc + t.timeMins, 0)} mins study planned
                      </span>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-1.5">
                      {day.tasks.length > 0 ? (
                        day.tasks.map((task, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-white border border-slate-100">
                            <div>
                              <span className="font-bold text-slate-800">{task.subjectName}: </span>
                              <span className="text-slate-600">{task.chapterName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{task.timeMins} min</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-500 italic py-1">
                          Buffer Day / Deep Revision & Weak Area Catch-up
                        </div>
                      )}

                      {day.revisionNote && (
                        <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                          ⚡ Revision: {day.revisionNote}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Interactive Chapter Tracker */}
          {activeTab === 'tracker' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Click to Update Chapter Status</span>
                </h4>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle className="w-3 h-3" /> {completedChaptersCount} Done</span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold"><Clock3 className="w-3 h-3" /> {inProgressChaptersCount} Active</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {subjects.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900">{sub.name}</h5>
                      <span className="text-[10px] text-slate-500">
                        {sub.chapters.filter(c => c.status === 'completed').length}/{sub.chapters.length} Completed
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {sub.chapters.map((ch) => (
                        <div
                          key={ch.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            ch.status === 'completed'
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : ch.status === 'in_progress'
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className={`text-xs font-medium truncate max-w-[220px] ${ch.status === 'completed' ? 'line-through opacity-70' : ''}`}>
                            {ch.name}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateChapterStatus(sub.id, ch.id, 'not_started')}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                ch.status === 'not_started' ? 'bg-slate-200 text-slate-800' : 'bg-transparent text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              Not Started
                            </button>
                            <button
                              onClick={() => handleUpdateChapterStatus(sub.id, ch.id, 'in_progress')}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                ch.status === 'in_progress' ? 'bg-amber-500 text-white' : 'bg-transparent text-slate-400 hover:bg-amber-100'
                              }`}
                            >
                              In Progress
                            </button>
                            <button
                              onClick={() => handleUpdateChapterStatus(sub.id, ch.id, 'completed')}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                ch.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-transparent text-slate-400 hover:bg-emerald-100'
                              }`}
                            >
                              Completed
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Non-Guarantee Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-500 text-xs">
            <p className="text-[11px] leading-relaxed">
              <strong>Planning note:</strong> Workload pacing assumes consistent focus blocks. Adjust daily hours as necessary when facing complex multi-concept chapters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
