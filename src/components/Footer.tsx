import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  ArrowUpRight,
  ArrowUp,
  Mail,
  CheckCircle2,
  Lock,
  Zap,
  Calculator,
  TrendingUp,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useLanguage();

  const handleNav = (path: string) => {
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="mt-auto bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Top Banner: Privacy & Architecture Guarantee */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-slate-300 text-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block sm:inline">{t('footer.privacyBadge', '100% Client-Side Privacy Guarantee')}: </span>
              <span className="text-slate-400">
                All numbers, tax estimates, resumes, and images process locally in browser RAM. Zero server uploads.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => handleNav('/privacy-policy')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              Privacy Architecture <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
              title="Back to Top"
              aria-label="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Column 1 & 2: Brand Identity & Newsletter */}
          <div className="lg:col-span-2 space-y-5">
            <button
              onClick={() => handleNav('/')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-[1.5px]">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  NAVIKO
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block -mt-1">
                  Smart Productivity
                </span>
              </div>
            </button>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              NAVIKO is a comprehensive online utility suite built for students, professionals, investors, and creators. Engineered for instantaneous calculation, mathematical precision, and absolute user privacy.
            </p>

            {/* Newsletter / Feature updates */}
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Stay updated with new tools
              </label>
              {subscribed ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>You are on the early access list! No spam ever.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Free Forever
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> No Login Required
              </span>
            </div>
          </div>

          {/* Column 3: Calculators & Math */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3.5 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-indigo-400" /> Calculators
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('/tools/number-calculator')} className="hover:text-white transition-colors cursor-pointer text-indigo-300 font-semibold">
                  ★ Number Calculator
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/scientific-calculator')} className="hover:text-white transition-colors cursor-pointer text-indigo-300 font-semibold">
                  ★ Scientific Calculator
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/percentage-calculator')} className="hover:text-white transition-colors cursor-pointer">
                  Percentage Calculator
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/age-calculator')} className="hover:text-white transition-colors cursor-pointer">
                  Age &amp; DOB Calculator
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/unit-converter')} className="hover:text-white transition-colors cursor-pointer">
                  Unit Converter
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/calculators')} className="hover:text-indigo-400 transition-colors cursor-pointer pt-1 block font-bold text-[11px] text-indigo-400">
                  View All Calculators →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Finance & Wealth */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Finance &amp; Tax
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('/tools/budget-calculator')} className="hover:text-white transition-colors cursor-pointer text-indigo-300 font-semibold">
                  ★ 50/30/20 Budget Planner
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/debt-clock')} className="hover:text-white transition-colors cursor-pointer text-emerald-300 font-semibold">
                  ★ National Debt Clock (India &amp; World)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/sip-calculator')} className="hover:text-white transition-colors cursor-pointer">
                  SIP &amp; Step-Up SIP
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/salary-calculator')} className="hover:text-white transition-colors cursor-pointer">
                  Salary &amp; In-Hand Tax
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/emi-calculator')} className="hover:text-white transition-colors cursor-pointer">
                  Home &amp; Car Loan EMI
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/fire-calculator')} className="hover:text-white transition-colors cursor-pointer">
                  FIRE Early Retirement
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/finance-tools')} className="hover:text-emerald-400 transition-colors cursor-pointer pt-1 block font-bold text-[11px] text-emerald-400">
                  Finance Hub (10 Tools) →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Student, Health & Career */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-sky-400" /> Academic &amp; Health
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('/tools/bmi')} className="hover:text-white transition-colors cursor-pointer text-emerald-300 font-semibold">
                  ★ BMI &amp; Body Metrics
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/diet-plan-manager')} className="hover:text-white transition-colors cursor-pointer text-emerald-300 font-semibold">
                  ★ Diet Plan Manager
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/nutrition')} className="hover:text-white transition-colors cursor-pointer text-emerald-300 font-semibold">
                  ★ Nutrition Science
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/cgpa-calculator')} className="hover:text-white transition-colors cursor-pointer">
                  CGPA to Percentage (CBSE)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/resume-builder')} className="hover:text-white transition-colors cursor-pointer">
                  ATS Resume Builder
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/typing-speed-test')} className="hover:text-white transition-colors cursor-pointer">
                  Typing Speed Assessment
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/tools/image-compressor')} className="hover:text-white transition-colors cursor-pointer">
                  Image Compressor (KB)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 6: Company & Legal */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3.5">
              Account &amp; Trust
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('/dashboard')} className="hover:text-white transition-colors cursor-pointer text-indigo-300 font-semibold">
                  ★ User Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/login')} className="hover:text-white transition-colors cursor-pointer">
                  Sign In / Register
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/premium')} className="hover:text-white transition-colors cursor-pointer text-amber-300 font-medium">
                  NAVIKO Premium Plans
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/about')} className="hover:text-white transition-colors cursor-pointer">
                  About NAVIKO
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/blog')} className="hover:text-white transition-colors cursor-pointer">
                  Guides &amp; Articles
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact &amp; Support
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/privacy-policy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/disclaimer')} className="hover:text-white transition-colors cursor-pointer">
                  Financial Disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2026 NAVIKO Smart Productivity Suite. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" /> Zero-Telemetry Certified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for simplicity
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
