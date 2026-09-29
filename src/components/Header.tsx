import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Menu, X, Sparkles, ChevronDown, ChevronRight,
  Calculator, PieChart, Landmark, TrendingUp, Sun, Moon,
  Globe, Check, Zap, Layers, Crown, User, LayoutGrid,
  HeartPulse, GraduationCap, Image as ImageIcon, Briefcase, FileSpreadsheet,
  BookOpen, Palette
} from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { PremiumBadge } from './monetization/PremiumBadge';
import { ThemePopover } from './ThemePopover';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenBot?: () => void;
}

interface ToolItem {
  name: string;
  path: string;
  desc: string;
  badge?: string;
  badgeColor?: string;
}

interface CategoryNav {
  id: string;
  name: string;
  shortName: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  description: string;
  tools: ToolItem[];
}

const CATEGORIES_NAV_CONFIG: CategoryNav[] = [
  {
    id: 'calculators',
    name: 'Calculators',
    shortName: 'Calculators',
    path: '/calculators',
    icon: Calculator,
    description: 'High-precision numerical, scientific, percentage & age calculators.',
    tools: [
      { name: 'Scientific Calculator', path: '/tools/scientific-calculator', desc: 'Trig, Logs, Powers & Deg/Rad', badge: 'Popular', badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
      { name: 'Number Calculator', path: '/tools/number-calculator', desc: 'Standard arithmetic with history tape' },
      { name: 'Percentage Calculator', path: '/tools/percentage-calculator', desc: 'Increase, decrease & fraction math' },
      { name: 'Age & Date Calculator', path: '/tools/age-calculator', desc: 'Exact years, months, days & leap days' },
      { name: 'CGPA & GPA Calculator', path: '/tools/cgpa-calculator', desc: 'Semester credit-to-percentage conversion' },
      { name: 'Discount Calculator', path: '/tools/discount-calculator', desc: 'Sale percentages & checkout price' },
      { name: 'Simple & Compound Interest', path: '/tools/simple-interest-calculator', desc: 'Principal growth & returns' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Wealth',
    shortName: 'Finance',
    path: '/finance-tools',
    icon: TrendingUp,
    badge: 'Hot',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    description: 'National debt, 50/30/20 budget framework, SIP compounding & taxes.',
    tools: [
      { name: 'National Debt Clock 🇮🇳', path: '/tools/debt-clock', desc: 'Live sovereign debt per citizen', badge: 'Live', badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
      { name: '50/30/20 Budget Planner', path: '/tools/budget-calculator', desc: 'Needs, wants & savings allocation', badge: 'Popular', badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
      { name: 'SIP Compounding Calculator', path: '/tools/sip-calculator', desc: 'Mutual fund returns with inflation' },
      { name: 'Loan EMI Calculator', path: '/tools/loan-emi-calculator', desc: 'Home, car & personal loan amortization' },
      { name: 'In-Hand Salary Calculator', path: '/tools/salary-calculator', desc: 'Take-home pay & tax deductions' },
      { name: 'CAGR & Returns Calculator', path: '/tools/cagr-calculator', desc: 'Compound annual growth rate of portfolio' },
    ],
  },
  {
    id: 'student',
    name: 'Student Tools',
    shortName: 'Students',
    path: '/student-tools',
    icon: GraduationCap,
    badge: '11 Tools',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    description: 'Decision matrices, backlog recovery, syllabus & mock test analyzers.',
    tools: [
      { name: 'Study Decision Planner', path: '/tools/study-decision-planner', desc: 'Assignment vs exam trade-off matrix', badge: 'New', badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
      { name: 'Backlog Recovery Planner', path: '/tools/backlog-recovery-planner', desc: 'Step-by-step catchup revision schedule' },
      { name: 'Syllabus Tracker & Calculator', path: '/tools/syllabus-calculator', desc: 'Topic completion & exam readiness' },
      { name: 'Attendance Planner', path: '/tools/attendance-calculator', desc: 'Target 75% requirement buffer calculator' },
      { name: 'Study Timetable Generator', path: '/tools/study-timetable-generator', desc: 'Custom daily revision & focus blocks' },
      { name: 'Mock Test Score Analyzer', path: '/tools/mock-test-analyzer', desc: 'Accuracy, negative marks & percentile' },
    ],
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    shortName: 'PDF',
    path: '/pdf-tools',
    icon: FileSpreadsheet,
    badge: 'Client-Side',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    description: 'Merge, split, convert & compress PDFs with 100% browser privacy.',
    tools: [
      { name: 'Merge PDF', path: '/tools/pdf-merge', desc: 'Combine multiple PDF files into one' },
      { name: 'Compress PDF', path: '/tools/pdf-compressor', desc: 'Reduce file size without quality loss' },
      { name: 'Split PDF', path: '/tools/pdf-split', desc: 'Extract custom page ranges into files' },
      { name: 'JPG to PDF', path: '/tools/jpg-to-pdf', desc: 'Convert multiple photos into a single PDF' },
      { name: 'PDF to JPG', path: '/tools/pdf-to-jpg', desc: 'High-res image extraction from PDF pages' },
    ],
  },
  {
    id: 'image',
    name: 'Image Tools',
    shortName: 'Images',
    path: '/image-tools',
    icon: ImageIcon,
    description: 'Instant compression, resizing, crop & format conversions without upload.',
    tools: [
      { name: 'Image Compressor', path: '/tools/image-compressor', desc: 'Reduce image KB size for uploads & web' },
      { name: 'Image Resizer', path: '/tools/image-resizer', desc: 'Exact pixel dimensions and aspect ratios' },
      { name: 'Image Cropper', path: '/tools/image-cropper', desc: 'Custom aspect ratio framing & cuts' },
      { name: 'Background Remover', path: '/tools/background-remover', desc: 'Instant transparent cutout creator' },
      { name: 'JPG to PNG', path: '/tools/jpg-to-png', desc: 'Convert images to PNG with alpha' },
      { name: 'PNG to JPG', path: '/tools/png-to-jpg', desc: 'Export compact JPEG format' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    shortName: 'Health',
    path: '/health-tools',
    icon: HeartPulse,
    description: 'Meal scheduling, nutrition, daily calories & hydration goals.',
    tools: [
      { name: 'Diet Plan Manager', path: '/tools/diet-plan-manager', desc: 'Personalized meal schedule with dietary filters', badge: 'Popular', badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
      { name: 'Health & BMI Calculator', path: '/tools/health-calculator', desc: 'Body mass index & daily calorie targets' },
      { name: 'Water Intake Tracker', path: '/tools/water-intake-calculator', desc: 'Hydration goal based on weight & activity' },
    ],
  },
  {
    id: 'career',
    name: 'Career & Work',
    shortName: 'Career',
    path: '/career-tools',
    icon: Briefcase,
    description: 'Clean ATS resume builder & typing speed assessments.',
    tools: [
      { name: 'ATS Resume Builder', path: '/tools/resume-builder', desc: 'Clean, printable ATS-friendly resume creator', badge: 'Top Rated', badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
      { name: 'Typing Speed Test', path: '/tools/typing-speed-test', desc: 'Timed WPM and accuracy typing benchmark' },
    ],
  },
];

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  const { currentLanguage, setLanguage, t, activeMeta } = useLanguage();
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  const { plan, subscriptionStatus, isTrial } = useSubscription();
  const { user, isAuthenticated } = useAuth();

  const isPremiumUser =
    (plan === 'plus' || plan === 'pro' || plan === 'trial') &&
    (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL_ACTIVE');

  const navContainerRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setLangMenuOpen(false);
        setThemeMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setActiveMenu(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDropdown = (menuId: string) => {
    setActiveMenu((prev) => (prev === menuId ? null : menuId));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/80 transition-all shadow-xs">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-7">
        <div className="flex items-center justify-between h-16 gap-2 lg:gap-4">
          
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
              aria-label="NAVIKO Smart Suite"
            >
              {/* Emblem */}
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1.5px] shadow-sm shadow-indigo-500/20 group-hover:scale-105 group-hover:shadow-indigo-500/30 transition-all">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 to-emerald-400/20 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                    NAVIKO
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold tracking-wider border border-indigo-200/60 dark:border-indigo-800 uppercase">
                    v2.0
                  </span>
                </div>
                <span className="hidden sm:block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest -mt-0.5">
                  Smart Productivity Suite
                </span>
              </div>
            </button>
          </div>

          {/* 2. Full Menu Display in Navigation Bar */}
          <nav
            ref={navContainerRef}
            className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-1 justify-center px-1 overflow-visible"
            aria-label="Main Navigation"
          >
            {/* Home Link */}
            <button
              onClick={() => handleNav('/')}
              className={`px-2.5 py-1.5 text-xs xl:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                currentPath === '/'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t('nav.home', 'Home')}
            </button>

            {/* FULL MENU MEGA-BUTTON (Opens Complete 4-Column Directory) */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('full-menu')}
                className={`px-3 py-1.5 text-xs xl:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  activeMenu === 'full-menu'
                    ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                    : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/70 dark:border-indigo-800/60'
                }`}
                aria-expanded={activeMenu === 'full-menu'}
                aria-haspopup="dialog"
                title="Open complete directory of all 46+ tools"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Full Menu</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'full-menu' ? 'rotate-180' : ''}`} />
              </button>

              {/* COMPLETE MEGA MENU POPOVER */}
              {activeMenu === 'full-menu' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[880px] xl:w-[980px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
                  {/* Mega Menu Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <span>NAVIKO Full Suite Directory</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold normal-case">
                            46+ Tools
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Instant, privacy-first online tools for students, professionals, and everyday tasks.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveMenu(null);
                          onOpenSearch();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Quick Search (⌘K)</span>
                      </button>
                      <button
                        onClick={() => handleNav('/tools')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                      >
                        <span>View All Tools</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4-Column Category Grid */}
                  <div className="grid grid-cols-4 gap-5">
                    {CATEGORIES_NAV_CONFIG.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <div key={cat.id} className="space-y-2">
                          <button
                            onClick={() => handleNav(cat.path)}
                            className="w-full flex items-center justify-between text-left group p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {cat.name}
                              </span>
                            </span>
                            {cat.badge && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase shrink-0 ${cat.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                {cat.badge}
                              </span>
                            )}
                          </button>

                          {/* Top Tools in this Category */}
                          <div className="space-y-1">
                            {cat.tools.slice(0, 4).map((tool) => (
                              <button
                                key={tool.path}
                                onClick={() => handleNav(tool.path)}
                                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors group cursor-pointer block"
                              >
                                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-between">
                                  <span className="truncate">{tool.name}</span>
                                  {tool.badge && (
                                    <span className="text-[8px] font-bold px-1 rounded-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1">
                                      {tool.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                                  {tool.desc}
                                </div>
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => handleNav(cat.path)}
                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            <span>Browse category</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}

                    {/* 4th Column Extra: Quick Shortcuts & Utilities */}
                    <div className="space-y-2 bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Daily Essentials</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        {[
                          { name: 'QR Code Generator', path: '/tools/qr-code-generator', desc: 'Custom QR with logos' },
                          { name: 'Unit Converter', path: '/tools/unit-converter', desc: 'Length, weight, temp & speed' },
                          { name: 'Word & Text Counter', path: '/tools/word-counter', desc: 'Characters, words & reading time' },
                          { name: '50/30/20 Budget', path: '/tools/budget-calculator', desc: 'Personal finance planner' },
                        ].map((item) => (
                          <button
                            key={item.path}
                            onClick={() => handleNav(item.path)}
                            className="w-full text-left p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors group cursor-pointer block border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          >
                            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                              {item.name}
                            </div>
                            <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                              {item.desc}
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <button
                          onClick={() => handleNav('/premium')}
                          className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider text-center shadow-xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Crown className="w-3 h-3" />
                          <span>Unlock Pro Features</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mega Menu Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>100% Client-Side Privacy: Files &amp; data never leave your browser.</span>
                    </span>
                    <div className="flex items-center gap-4 text-[11px] font-semibold">
                      <button onClick={() => handleNav('/blog')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                        Guides &amp; Blog
                      </button>
                      <button onClick={() => handleNav('/premium')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                        Plans &amp; Pricing
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DIRECT CATEGORY DROPDOWNS ON MENU BAR */}
            {CATEGORIES_NAV_CONFIG.map((category) => {
              const Icon = category.icon;
              const isOpen = activeMenu === category.id;
              const isCurrent = currentPath.startsWith(category.path);

              return (
                <div key={category.id} className="relative">
                  <button
                    onClick={() => toggleDropdown(category.id)}
                    className={`px-2.5 py-1.5 text-xs xl:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                      isCurrent || isOpen
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                    }`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    <span>{category.shortName}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Individual Category Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {category.name}
                          </span>
                        </div>
                        {category.badge && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase ${category.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            {category.badge}
                          </span>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto space-y-0.5 scrollbar-thin">
                        {category.tools.map((tool) => (
                          <button
                            key={tool.path}
                            onClick={() => handleNav(tool.path)}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-indigo-50/80 dark:hover:bg-indigo-950/60 transition-colors group cursor-pointer"
                          >
                            <div className="pr-2">
                              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                                <span>{tool.name}</span>
                                {tool.badge && (
                                  <span className="text-[8px] font-extrabold px-1 py-0.2 rounded-sm bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {tool.desc}
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 mt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleNav(category.path)}
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>View All in {category.name}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct All Tools Link */}
            <button
              onClick={() => handleNav('/tools')}
              className={`px-2.5 py-1.5 text-xs xl:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                currentPath === '/tools'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t('nav.allTools', 'All Tools')}
            </button>

            {/* Blog Link */}
            <button
              onClick={() => handleNav('/blog')}
              className={`px-2.5 py-1.5 text-xs xl:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                currentPath === '/blog'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t('nav.blog', 'Blog')}
            </button>
          </nav>

          {/* 3. Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* NAVIKO Premium / Account Button */}
            {isPremiumUser ? (
              <button
                onClick={() => handleNav('/account')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                title="Manage NAVIKO Premium Account"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">{isTrial ? 'Trial Active' : 'My Premium'}</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('/premium')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 hover:from-amber-500/25 hover:to-rose-500/25 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-600/40 text-xs font-extrabold transition-all cursor-pointer shadow-2xs hover:scale-105"
                title="Explore NAVIKO Premium"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden xs:inline">Premium</span>
              </button>
            )}

            {/* Auth / Dashboard Button */}
            {isAuthenticated && user ? (
              <button
                onClick={() => handleNav('/dashboard')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Open User Dashboard"
              >
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('/login')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Sign in to your account"
              >
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Multi-Language Dropdown Selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
                title={t('lang.select', 'Select Language')}
                aria-label="Language Selector"
              >
                <span className="text-sm">{activeMeta.flag}</span>
                <span className="hidden md:inline font-semibold">{activeMeta.nativeName}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 py-1">
                    {t('lang.language', 'Language')}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-0.5 scrollbar-thin">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                          currentLanguage === lang.code
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </span>
                        {currentLanguage === lang.code && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Selector & 1-Click Fast Toggle */}
            <div className="relative" ref={themeRef}>
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                {/* 1-Click Instant Dark/Light Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-xl hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-xs font-bold active:scale-95"
                  aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
                  )}
                  <span className="hidden sm:inline">
                    {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>

                {/* Divider */}
                <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

                {/* Theme Menu Dropdown Opener */}
                <button
                  type="button"
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className={`p-1.5 rounded-r-xl hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer flex items-center ${
                    themeMenuOpen ? 'bg-slate-200 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                  aria-label="Select theme options"
                  title="Choose theme (Default, Light, Dark, Midnight, Minimal, Glass)"
                  aria-expanded={themeMenuOpen}
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Theme Popover with all 6 themes & color swatches */}
              <ThemePopover
                isOpen={themeMenuOpen}
                onClose={() => setThemeMenuOpen(false)}
                align="right"
              />
            </div>

            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200/60 dark:border-slate-700 focus:outline-none cursor-pointer"
              aria-label="Search tools"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden lg:inline font-medium text-xs text-slate-600 dark:text-slate-300">
                {t('nav.searchShortcut', '⌘K')}
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Drawer Navigation with Full Menu Display */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Mobile Search */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-500" />
                <span>{t('nav.searchPlaceholder', 'Search 46+ smart tools...')}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* User Account / Dashboard in Mobile Menu */}
          <div>
            {isAuthenticated && user ? (
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => handleNav('/dashboard')}
                    className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 text-center border border-indigo-100 dark:border-indigo-900 shadow-2xs cursor-pointer"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNav('/profile')}
                    className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleNav('/billing')}
                    className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
                  >
                    Billing
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs text-center border border-slate-200/80 dark:border-slate-700 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs text-center shadow-xs cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Premium Callout */}
          <div>
            <button
              onClick={() => handleNav(isPremiumUser ? '/account' : '/premium')}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-300/40 dark:border-amber-700/50 flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{isPremiumUser ? 'My Premium Account' : 'NAVIKO Premium'}</span>
                    <PremiumBadge size="xs" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isPremiumUser ? 'Manage subscription & limits' : 'Unlock higher limits & all tools'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </button>
          </div>

          {/* FULL CATEGORY ACCORDION MENU ON MOBILE */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 py-1">
              Explore All Categories (Full Menu)
            </div>

            {CATEGORIES_NAV_CONFIG.map((cat) => {
              const Icon = cat.icon;
              const isExpanded = expandedMobileCategory === cat.id;

              return (
                <div key={cat.id} className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                  <button
                    onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {cat.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase ${cat.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          {cat.badge}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-2 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                      {cat.tools.map((tool) => (
                        <button
                          key={tool.path}
                          onClick={() => handleNav(tool.path)}
                          className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          <span className="truncate pr-2">{tool.name}</span>
                          {tool.badge && (
                            <span className="text-[8px] font-bold px-1 rounded-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                              {tool.badge}
                            </span>
                          )}
                        </button>
                      ))}
                      <button
                        onClick={() => handleNav(cat.path)}
                        className="w-full text-center py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 block cursor-pointer"
                      >
                        View All in {cat.name} →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Links */}
            <div className="pt-2 space-y-1">
              <button
                onClick={() => handleNav('/tools')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/60 flex items-center justify-between cursor-pointer"
              >
                <span>Browse All 46+ Tools Directory</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleNav('/blog')}
                className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>Guides &amp; Blog</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Theme Quick Selector & Footer on Mobile */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Appearance
              </span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-xs cursor-pointer"
              >
                {resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 px-1 pt-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Zap className="w-3.5 h-3.5" /> 100% Client-Side Privacy
              </span>
              <span>NAVIKO Smart Suite</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
