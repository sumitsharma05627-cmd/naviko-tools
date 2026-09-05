import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ArrowRight, ShieldCheck, Zap, DollarSign, 
  Flame, Landmark, Briefcase, Percent, TrendingDown, Star, Sparkles 
} from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
import { DynamicIcon } from '../components/DynamicIcon';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';
import { useSEO } from '../utils/seo';

interface FinanceToolsPageProps {
  onNavigate: (path: string) => void;
}

export const FinanceToolsPage: React.FC<FinanceToolsPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Finance Tools & Wealth Calculators — NAVIKO',
    description: 'Calculate SIP compounding, loan EMI schedules, in-hand salary after tax, FIRE retirement timelines, and 50/30/20 budgets with NAVIKO financial calculators.',
    canonical: '/finance-tools',
    robots: 'index, follow',
    ogType: 'website'
  });

  const financeTools = TOOLS_DATA.filter((t) => t.category === 'finance');

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white pt-14 pb-20 border-b border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gen Z &amp; Working Professional Finance Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
            Smart Finance &amp; Wealth Hub
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
            Plan your investments, calculate monthly SIP compounding, check your exact CTC in-hand salary, and map your path to early financial freedom.
          </p>

          {/* Quick Metrics */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400">Calculators</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">{financeTools.length} Active</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">100% Free &amp; Private</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400">SIP Engine</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">Step-Up</div>
              <div className="text-[11px] text-indigo-300 mt-0.5">Annual Boost &amp; Inflation</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400">Salary Tax</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">2024-26</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">New vs Old Regime</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs text-slate-400">Retirement</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">FIRE Plan</div>
              <div className="text-[11px] text-orange-400 mt-0.5">Lean, Standard &amp; Fat</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Space */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <DesktopAdSlot />
        <MobileAdSlot />
      </div>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              All Financial Calculators
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select any calculator below for instant mathematical breakdowns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeTools.map((tool) => (
            <div
              key={tool.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                  <DynamicIcon name={tool.iconName} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {tool.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tool.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onNavigate(tool.path)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Open Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Compounding Rules Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Essential Money Rules for Gen Z &amp; Early Professionals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">The 50/30/20 Rule</div>
              <h3 className="text-base font-bold text-slate-900">Budgeting Framework</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allocate 50% of your take-home pay to Needs (rent, groceries), 30% to Wants (dining, hobbies), and minimum 20% to automatic monthly SIP investments.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">The Rule of 72</div>
              <h3 className="text-base font-bold text-slate-900">Doubling Timeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Divide 72 by your annual expected return rate to calculate how fast your money doubles. At a 12% equity CAGR, your capital doubles every 6 years!
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-orange-700">The 4% Rule (FIRE)</div>
              <h3 className="text-base font-bold text-slate-900">Financial Freedom Corpus</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multiply your desired annual retirement expenses by 25. Once you achieve this corpus, you can safely withdraw 4% each year indefinitely without running out of funds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
