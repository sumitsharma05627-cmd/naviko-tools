import React, { useRef, useEffect } from 'react';
import { Palette, Check, Sun, Moon, Laptop, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeId, QuickThemeMode } from '../config/themes';

interface ThemePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  align?: 'left' | 'right';
}

export const ThemePopover: React.FC<ThemePopoverProps> = ({
  isOpen,
  onClose,
  className = '',
  align = 'right',
}) => {
  const {
    theme,
    quickMode,
    setTheme,
    setQuickMode,
    availableThemes,
  } = useTheme();

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      aria-label="Theme selector"
      className={`fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-16px)] sm:w-88 max-w-sm rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl border transition-all ${className}`}
      style={{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
              Interface Theme
            </h4>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              Personalize NAVIKO's look &amp; feel
            </p>
          </div>
        </div>
      </div>

      {/* Quick Mode Bar (Light / Dark / System) */}
      <div className="mb-3.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5 px-1">
          Quick Appearance
        </span>
        <div className="grid grid-cols-3 gap-1 bg-[var(--muted)] p-1 rounded-2xl">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = quickMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setQuickMode(mode.id as QuickThemeMode)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
                aria-pressed={isSelected}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complete Multi-Theme Catalog */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">
            Selectable Themes ({availableThemes.length})
          </span>
          <span className="text-[10px] font-semibold text-[var(--primary)] capitalize">
            {theme}
          </span>
        </div>

        <div className="space-y-1 max-h-68 overflow-y-auto pr-0.5 scrollbar-thin">
          {availableThemes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as ThemeId)}
                aria-pressed={isSelected}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group border ${
                  isSelected
                    ? 'bg-[var(--secondary)] border-[var(--primary)] shadow-2xs'
                    : 'bg-transparent border-transparent hover:bg-[var(--muted)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Miniature Visual Color Preview Swatch */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center p-1 border shadow-2xs shrink-0 relative overflow-hidden transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: t.previewColors.bg,
                      borderColor: t.previewColors.border,
                    }}
                  >
                    {/* Mini Card Representation */}
                    <div
                      className="w-5 h-5 rounded-md shadow-2xs flex items-center justify-center border"
                      style={{
                        backgroundColor: t.previewColors.card,
                        borderColor: t.previewColors.border,
                      }}
                    >
                      <div
                        className="w-2.5 h-1 rounded-xs"
                        style={{ backgroundColor: t.previewColors.primary }}
                      />
                    </div>
                    {/* Mini Accent Dot */}
                    <div
                      className="w-1.5 h-1.5 rounded-full absolute bottom-1 right-1 shadow-2xs"
                      style={{ backgroundColor: t.previewColors.accent }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {t.name}
                      </span>
                      {t.isDark ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] font-semibold border border-[var(--border)]">
                          Dark
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] font-semibold border border-[var(--border)]">
                          Light
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-1">
                      {t.tagline}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isSelected ? (
                    <div
                      className="w-5 h-5 rounded-full text-white flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[var(--border)] group-hover:border-[var(--primary)]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[var(--primary)]" />
          <span>Instant sync &amp; auto-saved</span>
        </span>
        <button
          onClick={() => {
            setTheme('default');
            setQuickMode('system');
          }}
          className="text-[var(--primary)] hover:underline font-bold cursor-pointer"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};
