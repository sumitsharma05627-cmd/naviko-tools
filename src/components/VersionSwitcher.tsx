import React from 'react';
import { useVersion, NavikoVersion } from '../context/VersionContext';
import { Sparkles, Leaf, Layers } from 'lucide-react';

interface VersionSwitcherProps {
  onNavigate?: (path: string) => void;
  className?: string;
  size?: 'compact' | 'standard';
}

interface VersionItem {
  id: NavikoVersion;
  number: string;
  shortTitle: string;
  compactLabel: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  activeIconColor: string;
}

const VERSIONS: VersionItem[] = [
  {
    id: 'v1',
    number: '1.0',
    shortTitle: 'Tools',
    compactLabel: '1.0 Tools',
    title: 'NAVIKO 1.0 — General Tools Suite & Calculators',
    icon: Layers,
    activeBg: 'bg-indigo-600 dark:bg-indigo-600',
    activeText: 'text-white',
    activeBorder: 'border-indigo-600',
    activeIconColor: 'text-indigo-200',
  },
  {
    id: 'v2',
    number: '2.0',
    shortTitle: 'Health',
    compactLabel: '2.0 Health',
    title: 'NAVIKO 2.0 — Nutrition Science & Ayurveda',
    icon: Leaf,
    activeBg: 'bg-emerald-700 dark:bg-emerald-600',
    activeText: 'text-white',
    activeBorder: 'border-emerald-700 dark:border-emerald-600',
    activeIconColor: 'text-emerald-200',
  },
  {
    id: 'v3',
    number: '3.0',
    shortTitle: 'Jyotish',
    compactLabel: '3.0 Jyotish',
    title: 'NAVIKO 3.0 — Vedic Astrology & Vastu Shastra',
    icon: Sparkles,
    activeBg: 'bg-amber-600 dark:bg-amber-500',
    activeText: 'text-white dark:text-slate-950',
    activeBorder: 'border-amber-600 dark:border-amber-500',
    activeIconColor: 'text-amber-200 dark:text-slate-950',
  },
];

export const VersionSwitcher: React.FC<VersionSwitcherProps> = ({
  onNavigate,
  className = '',
  size = 'compact',
}) => {
  const { version, switchVersion } = useVersion();

  const handleSelect = (v: NavikoVersion) => {
    if (v !== version) {
      switchVersion(v, onNavigate);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="NAVIKO Ecosystem Version Switcher"
      className={`inline-flex items-center p-0.5 rounded-xl border transition-all ${
        version === 'v2'
          ? 'bg-[#EFEAE2] dark:bg-[#15261D] border-[#DDD5C9] dark:border-[#223B2E]'
          : version === 'v3'
          ? 'bg-[#0f172a] dark:bg-[#0b1120] border-amber-500/30 dark:border-amber-500/30'
          : 'bg-slate-100 dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80'
      } ${className}`}
    >
      {VERSIONS.map((vItem) => {
        const isActive = version === vItem.id;
        const Icon = vItem.icon;

        return (
          <button
            key={vItem.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleSelect(vItem.id)}
            title={vItem.title}
            className={`relative flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500/60 ${
              isActive
                ? `${vItem.activeBg} ${vItem.activeText} shadow-xs font-black z-10 scale-[1.02]`
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <Icon
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                isActive ? vItem.activeIconColor : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            
            {/* Version Number & Short Label */}
            <span className="tracking-tight text-[11px] sm:text-xs">
              <span className="font-extrabold">{vItem.number}</span>
              <span className="hidden xs:inline ml-1 font-semibold opacity-90">{vItem.shortTitle}</span>
            </span>

            {/* Active Indicator Dot on tightest viewports */}
            {isActive && (
              <span className="xs:hidden w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-950 shrink-0 ml-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
