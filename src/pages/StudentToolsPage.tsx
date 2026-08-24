import React, { useEffect } from 'react';
import { GraduationCap, ArrowRight, BookOpen, Clock, Calendar, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
import { DynamicIcon } from '../components/DynamicIcon';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';

interface StudentToolsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentToolsPage: React.FC<StudentToolsPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = 'Student Tools Hub — NAVIKO';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const studentTools = TOOLS_DATA.filter((t) => t.studentHub);

  const upcomingTools = [
    { name: 'Pomodoro Study Timer', desc: 'Focus sessions with structured break intervals to maximize retention.' },
    { name: 'Semester Exam Countdown', desc: 'Custom countdown timers for college finals and board exams.' },
    { name: 'Marks to Percentage Converter', desc: 'Multi-subject exam total and grade rank calculator.' },
    { name: 'Essay Citation Generator', desc: 'Format APA, MLA, and Harvard citations easily.' },
    { name: 'Grade Curve Calculator', desc: 'Standard deviation and percentile-based bell curve calculator.' },
  ];

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
              <div
                key={tool.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 flex items-center justify-center mb-4 transition-colors">
                    <DynamicIcon name={tool.iconName} className="w-5 h-5" />
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
            ))}
          </div>
        </div>

        {/* AdSlot */}
        <DesktopAdSlot className="mb-14" />
        <MobileAdSlot className="mb-10" />

        {/* Upcoming Student Tools Roadmap */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="max-w-2xl mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Roadmap
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Upcoming Tools in Development
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              We are actively developing new study utilities. Have a tool request? Reach out via our contact page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTools.map((up, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900">{up.name}</h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{up.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
