import React, { useEffect } from 'react';
import { GraduationCap, ArrowRight, BookOpen, Clock, Calendar, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
import { DynamicIcon } from '../components/DynamicIcon';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';
import { useSEO } from '../utils/seo';
import { Interactive3DCard } from '../components/3d/Interactive3DCard';
import { PremiumBadge } from '../components/monetization/PremiumBadge';

interface StudentToolsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentToolsPage: React.FC<StudentToolsPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Student Productivity Tools & Academic Hub — NAVIKO',
    description: 'Free student tools: 75% attendance calculator, CBSE CGPA to percentage converter, study timetable generator, backlog recovery planner, and mock test analyzer.',
    canonical: '/student-tools',
    robots: 'index, follow',
    ogType: 'website'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const studentTools = TOOLS_DATA.filter((t) => t.studentHub);

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hub Header */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-bold mb-4">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Productivity Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Essential Tools for Students
            </h1>
            <p className="mt-3 text-sm sm:text-base text-indigo-200 leading-relaxed font-medium">
              Calculate semester CGPA, marks percentages, write essays with character counters, test your typing speed, and convert units without hassle or annoying paywalls.
            </p>
          </div>
        </div>

        {/* Active Tools for Students */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Active Student Utilities
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              {studentTools.length} Available Tools
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentTools.map((tool) => (
              <Interactive3DCard key={tool.id} className="h-full" elevation={5} maxTilt={5}>
                <div
                  className="h-full p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 flex items-center justify-center transition-colors">
                        <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                      </div>
                      {tool.badge && (
                        <PremiumBadge
                          plan={tool.badge === 'PRO' ? 'pro' : 'plus'}
                          label={tool.badge}
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('/premium');
                          }}
                        />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {tool.shortDescription}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onNavigate(tool.path)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <span>Launch Tool</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Interactive3DCard>
            ))}
          </div>
        </div>

        {/* AdSlot */}
        <DesktopAdSlot className="mb-14" />
        <MobileAdSlot className="mb-10" />

        {/* Academic Strategy & Best Practices Guide */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              <BookOpen className="w-3.5 h-3.5" /> Study Strategy &amp; Academic Framework
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Mastering College Metrics: Attendance, CGPA, and Syllabus Pacing
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Academic success isn’t just about working harder—it’s about managing institutional requirements with strategic precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h3 className="text-sm font-bold text-slate-900">The 75% Attendance Rule</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Most colleges require a strict 75% attendance threshold to appear for end-semester exams. Never guess your numbers: calculate exact consecutive classes needed to cross the threshold or determine how many safe leaves you have remaining.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/tools/attendance-calculator')}
                className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch Attendance Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h3 className="text-sm font-bold text-slate-900">CGPA to Percentage Multipliers</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Different universities use distinct conversion multipliers. CBSE and many technical institutions apply the 9.5 factor (Percentage = CGPA × 9.5), whereas others use 10.0 or credit-weighted scales. Ensure you use the exact standard recognized by your university board.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/tools/cgpa-calculator')}
                className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch CGPA Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h3 className="text-sm font-bold text-slate-900">Syllabus Completion &amp; Recovery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Having arrears or backlogs can cause significant anxiety. Divide remaining chapters by days until your exam date, prioritize high-weightage topics, and verify whether your study schedule is mathematically achievable before exam week arrives.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/tools/can-i-finish-my-syllabus')}
                className="mt-4 text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch Syllabus Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
