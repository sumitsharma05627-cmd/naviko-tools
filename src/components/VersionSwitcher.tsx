import React, { useState, useRef, useEffect } from 'react';
import { useVersion, NavikoVersion } from '../context/VersionContext';
import { Sparkles, Leaf, Layers, ChevronDown, Check } from 'lucide-react';

interface VersionSwitcherProps {
  onNavigate?: (path: string) => void;
  className?: string;
  mode?: 'auto' | 'segmented' | 'dropdown';
}

export const VersionSwitcher: React.FC<VersionSwitcherProps> = ({
  onNavigate,
  className = '',
  mode = 'auto'
}) => {
  const { version, switchVersion } = useVersion();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (v: NavikoVersion) => {
    if (v !== version) {
      switchVersion(v, onNavigate);
    }
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleSelect('v2');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleSelect('v1');
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen, version]);

  // Segmented Control renderer
  const renderSegmented = (wrapperClass = '') => (
    <div
      role="radiogroup"
      aria-label="NAVIKO Website Version Switcher"
      className={`inline-flex items-center p-1 rounded-2xl border transition-all ${
        version === 'v2'
          ? 'bg-[#F2ECE4] dark:bg-[#13221A] border-[#E8E2D9] dark:border-[#22382C]'
          : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
      } ${wrapperClass}`}
    >
      {/* Option 1: NAVIKO 1.0 — Original */}
      <button
        type="button"
        role="radio"
        aria-checked={version === 'v1'}
        tabIndex={version === 'v1' ? 0 : -1}
        onClick={() => handleSelect('v1')}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            handleSelect('v2');
          }
        }}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-left transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
          version === 'v1'
            ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium'
        }`}
        title="NAVIKO 1.0 — Original: 46+ tools, calculators, finance & utilities"
      >
        <Layers className={`w-3.5 h-3.5 shrink-0 ${version === 'v1' ? 'text-indigo-400 dark:text-white' : 'text-slate-400'}`} />
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] sm:text-xs font-black tracking-tight whitespace-nowrap">
            NAVIKO 1.0
          </span>
          <span className={`text-[9px] font-semibold whitespace-nowrap ${version === 'v1' ? 'text-slate-300 dark:text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
            Original
          </span>
        </div>
      </button>

      {/* Option 2: NAVIKO 2.0 — Nutrition & Ayurveda */}
      <button
        type="button"
        role="radio"
        aria-checked={version === 'v2'}
        tabIndex={version === 'v2' ? 0 : -1}
        onClick={() => handleSelect('v2')}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            handleSelect('v1');
          }
        }}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-left transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
          version === 'v2'
            ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white shadow-xs font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium'
        }`}
        title="NAVIKO 2.0 — Nutrition & Ayurveda: Food explorer, recipes, meal planner & habits"
      >
        <Leaf className={`w-3.5 h-3.5 shrink-0 ${version === 'v2' ? 'text-emerald-300' : 'text-emerald-600/70'}`} />
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] sm:text-xs font-black tracking-tight whitespace-nowrap">
            NAVIKO 2.0
          </span>
          <span className={`text-[9px] font-semibold whitespace-nowrap ${version === 'v2' ? 'text-emerald-100' : 'text-[#4D6156] dark:text-[#9FB7A9]'}`}>
            Nutrition &amp; Ayurveda
          </span>
        </div>
      </button>
    </div>
  );

  // Compact Dropdown renderer (ideal for narrow mobile screens)
  const renderDropdown = (wrapperClass = '') => (
    <div ref={dropdownRef} className={`relative inline-block ${wrapperClass}`}>
      <button
        ref={buttonRef}
        type="button"
        id="version-switcher-btn"
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        aria-label="Switch NAVIKO Version: NAVIKO 1.0 — Original or NAVIKO 2.0 — Nutrition & Ayurveda"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 ${
          version === 'v1'
            ? 'bg-slate-900 text-white border-slate-800 dark:bg-indigo-600 dark:border-indigo-500 focus:ring-indigo-400'
            : 'bg-[#1B4332] text-white border-[#153427] dark:bg-[#2D6A4F] dark:border-[#245741] focus:ring-emerald-400'
        }`}
      >
        {version === 'v1' ? (
          <Layers className="w-3 h-3 text-indigo-400 dark:text-indigo-200 shrink-0" />
        ) : (
          <Leaf className="w-3 h-3 text-emerald-300 shrink-0" />
        )}
        <span className="text-[11px] font-black tracking-tight">
          {version === 'v1' ? 'v1.0' : 'v2.0'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 opacity-70 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div
          role="listbox"
          aria-labelledby="version-switcher-btn"
          className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Select NAVIKO Version
            </span>
          </div>

          {/* Version 1.0 Option */}
          <button
            type="button"
            role="option"
            aria-selected={version === 'v1'}
            onClick={() => handleSelect('v1')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
              version === 'v1'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                version === 'v1' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                <Layers className="w-3.5 h-3.5" />
              </span>
              <div>
                <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
                  <span>NAVIKO 1.0</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Original
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Original 46+ tools, calculators, finance &amp; utilities
                </p>
              </div>
            </div>
            {version === 'v1' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1" />}
          </button>

          {/* Version 2.0 Option */}
          <button
            type="button"
            role="option"
            aria-selected={version === 'v2'}
            onClick={() => handleSelect('v2')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer mt-1 ${
              version === 'v2'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                version === 'v2' ? 'bg-[#1B4332] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              </span>
              <div>
                <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
                  <span>NAVIKO 2.0</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Nutrition &amp; Ayurveda
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Indian food explorer, meal planner, herbs &amp; habits
                </p>
              </div>
            </div>
            {version === 'v2' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />}
          </button>
        </div>
      )}
    </div>
  );

  if (mode === 'segmented') {
    return renderSegmented(className);
  }

  if (mode === 'dropdown') {
    return renderDropdown(className);
  }

  // Auto mode: compact dropdown on small mobile screens (<640px), segmented control on sm and up (>=640px)
  return (
    <div className={`inline-flex items-center ${className}`}>
      {renderDropdown('sm:hidden')}
      {renderSegmented('hidden sm:inline-flex')}
    </div>
  );
};
