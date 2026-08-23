import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, BookOpen, Plus, Trash2, CheckCircle2, 
  Sparkles, Download, Printer, Share2, Award, Zap, 
  RotateCcw, Check, Flame, ChevronRight, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubjectItem {
  id: string;
  name: string;
  difficulty: 'hard' | 'medium' | 'easy';
  priority: number; // 1 to 5
  color: string;
}

interface TimetableSlot {
  id: string;
  day: string; // 'Monday', 'Tuesday', ...
  time: string;
  subjectName: string;
  color: string;
  type: 'study' | 'break' | 'revision';
  isCompleted?: boolean;
}

const DEFAULT_SUBJECTS: SubjectItem[] = [
  { id: '1', name: 'Mathematics & Calculus', difficulty: 'hard', priority: 5, color: '#6366f1' },
  { id: '2', name: 'Physics & Mechanics', difficulty: 'hard', priority: 4, color: '#0ea5e9' },
  { id: '3', name: 'Chemistry / Biology', difficulty: 'medium', priority: 4, color: '#10b981' },
  { id: '4', name: 'Computer Science / Coding', difficulty: 'medium', priority: 3, color: '#f59e0b' },
  { id: '5', name: 'Language & Literature', difficulty: 'easy', priority: 2, color: '#ec4899' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const StudyTimetableGenerator: React.FC = () => {
  const [examName, setExamName] = useState<string>('Final Semester Exams');
  const [examDate, setExamDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [chronotype, setChronotype] = useState<'early' | 'balanced' | 'night'>('early');
  const [weekdayHours, setWeekdayHours] = useState<number>(4);
  const [weekendHours, setWeekendHours] = useState<number>(6);
  const [sessionStyle, setSessionStyle] = useState<'pomodoro' | 'deep' | 'block'>('deep'); // 50/10 vs 25/5 vs 90/15
  
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    const saved = localStorage.getItem('naviko_timetable_subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  const [newSubName, setNewSubName] = useState('');
  const [newSubDiff, setNewSubDiff] = useState<'hard' | 'medium' | 'easy'>('medium');
  const [newSubPrio, setNewSubPrio] = useState(3);

  const [activeView, setActiveView] = useState<'weekly' | 'today' | 'config'>('weekly');
  const [todayCompletedIds, setTodayCompletedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('naviko_today_completed');
    return saved ? JSON.parse(saved) : [];
  });

  // Save subjects to localStorage
  useEffect(() => {
    localStorage.setItem('naviko_timetable_subjects', JSON.stringify(subjects));
  }, [subjects]);

  // Days left to exam countdown
  const daysLeft = useMemo(() => {
    if (!examDate) return 0;
    const target = new Date(examDate).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [examDate]);

  // Generate Timetable Algorithm
  const generatedSchedule: Record<string, TimetableSlot[]> = useMemo(() => {
    const schedule: Record<string, TimetableSlot[]> = {};
    if (subjects.length === 0) return schedule;

    // Time templates based on chronotype
    let startHour = chronotype === 'early' ? 6 : chronotype === 'balanced' ? 9 : 14;

    DAYS.forEach((day, dayIdx) => {
      const isWeekend = day === 'Saturday' || day === 'Sunday';
      const availableHours = isWeekend ? weekendHours : weekdayHours;
      const slots: TimetableSlot[] = [];

      let currentHour = startHour;
      let slotIndex = 0;

      // Rotate subjects prioritized by weight
      const sortedSubs = [...subjects].sort((a, b) => b.priority - a.priority);

      for (let h = 0; h < availableHours; h++) {
        const sub = isWeekend && h >= availableHours - 2 
          ? { name: 'Weekly Revision & Mock Test', color: '#8b5cf6', id: 'rev', difficulty: 'medium' as const, priority: 5 }
          : sortedSubs[(dayIdx * 2 + slotIndex) % sortedSubs.length];

        const timeStr = `${currentHour % 12 || 12}:00 ${currentHour < 12 || currentHour === 24 ? 'AM' : 'PM'} - ${(currentHour + 1) % 12 || 12}:00 ${currentHour + 1 < 12 || currentHour + 1 === 24 ? 'AM' : 'PM'}`;

        slots.push({
          id: `${day}-${slotIndex}`,
          day,
          time: timeStr,
          subjectName: sub.name,
          color: sub.color,
          type: sub.name.includes('Revision') ? 'revision' : 'study'
        });

        // Insert break after every 2 study hours
        if ((h + 1) % 2 === 0 && h + 1 < availableHours) {
          slots.push({
            id: `${day}-break-${slotIndex}`,
            day,
            time: '15 Min Break',
            subjectName: '☕ Rest, Hydrate & Walk',
            color: '#94a3b8',
            type: 'break'
          });
        }

        currentHour++;
        slotIndex++;
      }

      schedule[day] = slots;
    });

    return schedule;
  }, [subjects, chronotype, weekdayHours, weekendHours]);

  // Current Day of Week
  const todayDayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  const todaySlots = generatedSchedule[todayDayName] || [];

  const handleToggleTodaySlot = (id: string) => {
    let updated: string[];
    if (todayCompletedIds.includes(id)) {
      updated = todayCompletedIds.filter((i) => i !== id);
    } else {
      updated = [...todayCompletedIds, id];
      // Celebrate if completing all today
      if (updated.length === todaySlots.filter(s => s.type !== 'break').length) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
    setTodayCompletedIds(updated);
    localStorage.setItem('naviko_today_completed', JSON.stringify(updated));
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];
    const assignedColor = colors[subjects.length % colors.length];

    const newSub: SubjectItem = {
      id: Date.now().toString(),
      name: newSubName.trim(),
      difficulty: newSubDiff,
      priority: newSubPrio,
      color: assignedColor
    };

    setSubjects([...subjects, newSub]);
    setNewSubName('');
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleDownloadIcs = () => {
    // Generate RFC 5545 iCalendar ICS file
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Naviko Smart Study Timetable//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Study Timetable - ' + examName,
    ];

    DAYS.forEach((day, dIdx) => {
      const slots = generatedSchedule[day] || [];
      slots.forEach((slot, sIdx) => {
        if (slot.type === 'break') return;

        const summary = `📚 Study: ${slot.subjectName}`;
        const desc = `Study session for ${examName} (${slot.time})`;

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${Date.now()}-${dIdx}-${sIdx}@naviko.tools`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${desc}`,
          `RRULE:FREQ=WEEKLY;BYDAY=${day.substring(0, 2).toUpperCase()}`,
          'END:VEVENT'
        );
      });
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Study_Timetable_${examName.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Navigator & Exam Countdown Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
              Smart Study Scheduler
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Target: {examName}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {daysLeft > 0 ? (
              <>
                <span className="text-emerald-400 font-mono">{daysLeft} Days</span> until {examName}
              </>
            ) : (
              'Exam Day Today!'
            )}
          </h2>
          <p className="text-xs text-slate-300">
            Intelligent spaced repetition & energy-balanced timetable tailored for peak focus.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            onClick={handleDownloadIcs}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            title="Import directly into Google Calendar, Outlook, or Apple Calendar"
          >
            <Download className="w-4 h-4" /> Download .ICS Calendar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Timetable
          </button>
        </div>
      </div>

      {/* View Switcher & Settings */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors print:hidden">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveView('weekly')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeView === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📅 Weekly Timetable
          </button>
          <button
            onClick={() => setActiveView('today')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeView === 'today'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ✓ Today&apos;s Checklist ({todayDayName})
          </button>
          <button
            onClick={() => setActiveView('config')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeView === 'config'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⚙️ Customize Subjects & Hours
          </button>
        </div>
      </div>

      {/* VIEW 1: Weekly Timetable Grid */}
      {activeView === 'weekly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DAYS.map((day) => {
              const slots = generatedSchedule[day] || [];
              const isToday = day === todayDayName;

              return (
                <div
                  key={day}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 space-y-3 transition-all ${
                    isToday
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {day} {isToday && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-sans">TODAY</span>}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {slots.filter((s) => s.type !== 'break').length} hrs
                    </span>
                  </div>

                  <div className="space-y-2">
                    {slots.map((slot) => {
                      if (slot.type === 'break') {
                        return (
                          <div
                            key={slot.id}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-[11px] text-slate-500 font-semibold"
                          >
                            {slot.subjectName}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={slot.id}
                          style={{ borderLeftColor: slot.color }}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-l-4 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <span>{slot.time}</span>
                            {slot.type === 'revision' && (
                              <span className="text-purple-600 dark:text-purple-400 font-bold">REVISION</span>
                            )}
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {slot.subjectName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Today's Checklist */}
      {activeView === 'today' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Focus Sessions for {todayDayName}
              </h3>
              <p className="text-xs text-slate-500">
                Check off each session as you finish to track real-time study velocity.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500">Today&apos;s Progress:</span>
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {todayCompletedIds.length} / {todaySlots.filter(s => s.type !== 'break').length} Completed
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {todaySlots.map((slot) => {
              if (slot.type === 'break') {
                return (
                  <div
                    key={slot.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-xs text-slate-500 font-medium"
                  >
                    {slot.subjectName}
                  </div>
                );
              }

              const isDone = todayCompletedIds.includes(slot.id);

              return (
                <div
                  key={slot.id}
                  onClick={() => handleToggleTodaySlot(slot.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${isDone ? 'line-through opacity-70' : ''}`}>
                        {slot.subjectName}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{slot.time}</div>
                    </div>
                  </div>

                  <span
                    style={{ backgroundColor: slot.color }}
                    className="w-3 h-3 rounded-full shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Config & Customization */}
      {activeView === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Left */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Daily Target & Study Habits
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Exam Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Study Chronotype
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'early', label: '🌅 Morning (6 AM)' },
                  { id: 'balanced', label: '☀️ Afternoon (9 AM)' },
                  { id: 'night', label: '🌙 Night Owl (2 PM-Late)' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setChronotype(c.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      chronotype === c.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Weekday Hours/Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={weekdayHours}
                  onChange={(e) => setWeekdayHours(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Weekend Hours/Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={weekendHours}
                  onChange={(e) => setWeekendHours(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Subjects Right */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" /> Subjects & Priorities
            </h3>

            {/* Add Subject Form */}
            <form onSubmit={handleAddSubject} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Add new subject (e.g. Organic Chemistry)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Difficulty:</span>
                  <select
                    value={newSubDiff}
                    onChange={(e) => setNewSubDiff(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="hard">Hard (High load)</option>
                    <option value="medium">Medium</option>
                    <option value="easy">Easy</option>
                  </select>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Priority Weight:</span>
                  <select
                    value={newSubPrio}
                    onChange={(e) => setNewSubPrio(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (Top Priority)</option>
                    <option value={4}>⭐⭐⭐⭐ (High)</option>
                    <option value={3}>⭐⭐⭐ (Medium)</option>
                    <option value={2}>⭐⭐ (Low)</option>
                    <option value={1}>⭐ (Minimal)</option>
                  </select>
                </div>
              </div>
            </form>

            {/* Subject List */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: sub.color }}
                      className="w-3 h-3 rounded-full shrink-0"
                    />
                    <span className="font-bold text-slate-900 dark:text-white">{sub.name}</span>
                    <span className="text-slate-400 capitalize">({sub.difficulty})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-mono">{'★'.repeat(sub.priority)}</span>
                    {subjects.length > 1 && (
                      <button
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
