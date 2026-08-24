import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Menu, X, Sparkles, ChevronDown, ChevronRight,
  Calculator, PieChart, Landmark, TrendingUp, Sun, Moon, Laptop,
  Globe, Check, Zap, Layers, DollarSign, Shield, FileText, ArrowRight
} from 'lucide-react';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenBot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, onOpenSearch, onOpenBot }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [financeDropdownOpen, setFinanceDropdownOpen] = useState(false);
  const [calcDropdownOpen, setCalcDropdownOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const { currentLanguage, setLanguage, t, activeMeta } = useLanguage();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const financeRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (financeRef.current && !financeRef.current.contains(e.target as Node)) {
        setFinanceDropdownOpen(false);
      }
      if (calcRef.current && !calcRef.current.contains(e.target as Node)) {
        setCalcDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setFinanceDropdownOpen(false);
    setCalcDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.student', 'Student Tools'), path: '/student-tools' },
    { name: t('nav.pdf', 'PDF Tools'), path: '/pdf-tools' },
    { name: t('nav.image', 'Image Tools'), path: '/image-tools' },
    { name: t('nav.career', 'Career Tools'), path: '/career-tools' },
    { name: t('nav.allTools', 'All Tools'), path: '/tools' },
    { name: t('nav.blog', 'Blog'), path: '/blog' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('/')}
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
              aria-label="NAVIKO Smart Suite"
            >
              {/* Premium Emblem */}
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1.5px] shadow-sm shadow-indigo-500/20 group-hover:scale-105 group-hover:shadow-indigo-500/30 transition-all">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 to-emerald-400/20 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <Sparkles className="w-5 h-5 text-indigo-300 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
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

          {/* 2. Desktop Navigation with Mega-Menus */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {/* Home */}
            <button
              onClick={() => handleNav('/')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                currentPath === '/'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t('nav.home', 'Home')}
            </button>

            {/* Finance & Wealth Mega-Dropdown */}
            <div className="relative" ref={financeRef}>
              <button
                onClick={() => {
                  setFinanceDropdownOpen(!financeDropdownOpen);
                  setCalcDropdownOpen(false);
                }}
                className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentPath.includes('finance') || currentPath.includes('budget') || currentPath.includes('debt-clock') || currentPath.includes('sip') || currentPath.includes('emi')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <span>{t('nav.finance', 'Finance & Wealth')}</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Hot
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${financeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {financeDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5">
                    Finance Hub &amp; Wealth Planners
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNav('/tools/budget-calculator')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <PieChart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>50/30/20 Budget Planner</span>
                          <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">NEW</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Expense ledger &amp; savings projections</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('/tools/debt-clock')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-0.5" />
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>National Debt Clock 🇮🇳</span>
                          <span className="px-1 py-0.2 rounded text-[9px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold">LIVE</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">India &amp; World real-time sovereign debt</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('/tools/sip-calculator')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">SIP &amp; Step-Up SIP</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Mutual fund compounding returns</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('/tools/emi-calculator')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Loan EMI Calculator</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Home &amp; personal loan prepayment schedule</div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleNav('/finance-tools')}
                      className="w-full px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Explore all 10 Finance Tools</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calculators Dropdown */}
            <div className="relative" ref={calcRef}>
              <button
                onClick={() => {
                  setCalcDropdownOpen(!calcDropdownOpen);
                  setFinanceDropdownOpen(false);
                }}
                className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentPath.includes('calculator')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <span>{t('nav.calculators', 'Calculators')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${calcDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {calcDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5">
                    Math &amp; General Math
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNav('/tools/scientific-calculator')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Scientific Calculator</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Trig, Logs, Powers &amp; Rad/Deg</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('/tools/number-calculator')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Number Calculator</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Memory keys &amp; calculation tape</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('/tools/percentage-calculator')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black">%</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Percentage Calculator</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Increase, decrease &amp; proportions</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('/tools/age-calculator')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black">📅</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Age &amp; Date Calculator</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Exact years, months, days &amp; leap day</div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleNav('/calculators')}
                      className="w-full px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>View All Calculators</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Other Direct Nav Links */}
            {navLinks.slice(1).map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <span>{link.name}</span>
                </button>
              );
            })}
          </nav>

          {/* 3. Actions: Quick Budget shortcut, Language Selector, Theme Toggle, Search, Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Budget Planner Direct Link in Menu Bar */}
            <button
              onClick={() => handleNav('/tools/budget-calculator')}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-200 dark:border-indigo-800 cursor-pointer shadow-xs"
              title="50/30/20 Budget Planner"
            >
              <PieChart className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t('nav.budget', 'Budget Planner')}</span>
            </button>

            {/* Multi-Language Dropdown Selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
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

            {/* 1-Click Dark/Light Theme Switcher & Dropdown */}
            <div className="relative flex items-center" ref={themeRef}>
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 focus:outline-none cursor-pointer flex items-center justify-center shadow-xs"
                title={`${resolvedTheme === 'dark' ? t('theme.light', 'Switch to Light') : t('theme.dark', 'Switch to Dark')} (${t('theme.toggle', 'Click to toggle')})`}
                aria-label="Theme mode toggle"
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400 transition-transform hover:rotate-12" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
                )}
              </button>
            </div>

            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              aria-label="Search tools"
            >
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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

      {/* 4. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
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
                <Search className="w-4 h-4 text-slate-500" /> {t('nav.searchPlaceholder', 'Search 20+ smart tools...')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Quick Highlight Cards on Mobile */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleNav('/tools/budget-calculator')}
              className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-left cursor-pointer hover:bg-indigo-100 transition-colors"
            >
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                <PieChart className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Budget Planner
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">50/30/20 Rule</div>
            </button>

            <button
              onClick={() => handleNav('/tools/debt-clock')}
              className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-left cursor-pointer hover:bg-rose-100 transition-colors"
            >
              <div className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mr-0.5" /> Debt Clock 🇮🇳
              </div>
              <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Live Sovereign Debt</div>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="pt-2 space-y-1">
            <button
              onClick={() => handleNav('/finance-tools')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>{t('nav.finance', 'Finance & Wealth')}</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  Hot
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('/calculators')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>{t('nav.calculators', 'Calculators')}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                </button>
              );
            })}
          </div>

          {/* Theme & Language Quick Selector on Mobile */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Theme:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    theme === 'light'
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                      : 'text-slate-500'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    theme === 'dark'
                      ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200'
                      : 'text-slate-500'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    theme === 'system'
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  System
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 px-3 pt-2">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Zap className="w-3.5 h-3.5" /> 100% Client-Side
              </span>
              <span>NAVIKO v2.0</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
