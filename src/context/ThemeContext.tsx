import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ThemeId, THEMES, THEME_ORDER, ThemeDefinition } from '../config/themes';
import { authService } from '../services/auth';
import { useAuth } from './AuthContext';

export type ThemeMode = ThemeId;
export type QuickMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: ThemeId;
  activeThemeDef: ThemeDefinition;
  quickMode: QuickMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (id: ThemeId) => void;
  setQuickMode: (mode: QuickMode) => void;
  toggleTheme: () => void;
  availableThemes: ThemeDefinition[];
  isThemeVerified: boolean;
  isThemeVerifying: boolean;
  verifyThemeFromDatabase: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper: Read stored theme from localStorage with legacy fallback
const getStoredThemeFallback = (): ThemeId => {
  if (typeof window !== 'undefined') {
    try {
      const savedTheme = localStorage.getItem('naviko_theme_id') as ThemeId;
      if (savedTheme && THEMES[savedTheme]) {
        return savedTheme;
      }
      // Backward compatibility with legacy 'naviko_theme'
      const legacy = localStorage.getItem('naviko_theme');
      if (legacy === 'dark') return 'dark';
      if (legacy === 'light') return 'light';
    } catch {
      // LocalStorage access restricted / private browsing fallback
    }
  }
  return 'default';
};

// Helper: Read stored quick appearance mode
const getStoredQuickModeFallback = (): QuickMode => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('naviko_quick_theme') as QuickMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {}
  }
  return 'system';
};

// Helper: Accurately resolve whether dark mode applies
export const resolveThemeIsDark = (themeId: ThemeId, qMode: QuickMode): boolean => {
  // 1. Dark-dedicated themes are ALWAYS dark
  if (themeId === 'dark' || themeId === 'midnight') {
    return true;
  }
  // 2. Light-dedicated themes are ALWAYS light
  if (themeId === 'light' || themeId === 'minimal') {
    return false;
  }
  // 3. Adaptive themes ('default' and 'glass'): follow explicit quickMode or system preference
  if (qMode === 'dark') {
    return true;
  }
  if (qMode === 'light') {
    return false;
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, token: authToken } = useAuth();

  // 1. Initial theme selection synchronously from localStorage to prevent flash of default theme
  const [theme, setThemeState] = useState<ThemeId>(getStoredThemeFallback);
  const [quickMode, setQuickModeState] = useState<QuickMode>(getStoredQuickModeFallback);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const t = getStoredThemeFallback();
    const q = getStoredQuickModeFallback();
    return resolveThemeIsDark(t, q) ? 'dark' : 'light';
  });
  const [isThemeVerified, setIsThemeVerified] = useState<boolean>(false);
  const [isThemeVerifying, setIsThemeVerifying] = useState<boolean>(false);

  // Ref to prevent duplicate initial verifications on mount
  const verificationInitiatedRef = useRef<boolean>(false);

  // 2. Apply theme attributes and CSS variables dynamically to the document root
  const applyThemeToDOM = useCallback((themeId: ThemeId, qMode: QuickMode) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const themeDef = THEMES[themeId] || THEMES.default;
    const isDark = resolveThemeIsDark(themeId, qMode);

    setResolvedTheme(isDark ? 'dark' : 'light');

    // Remove old theme-* classes
    THEME_ORDER.forEach((tId) => {
      root.classList.remove(`theme-${tId}`);
    });
    root.classList.add(`theme-${themeId}`);
    root.setAttribute('data-theme', themeId);

    // Dark class for Tailwind's @custom-variant dark
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Set all centralized CSS custom properties on :root
    Object.entries(themeDef.cssVariables).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    const bg = themeDef.cssVariables['--background'] || (isDark ? '#0F172A' : '#F8FAFC');
    const fg = themeDef.cssVariables['--foreground'] || (isDark ? '#F8FAFC' : '#0F172A');

    root.style.backgroundColor = bg;
    root.style.color = fg;

    // Update body background & color inline to guarantee 0ms flash
    if (document.body) {
      document.body.style.backgroundColor = bg;
      document.body.style.color = fg;
    }

    // Update mobile browser address bar / theme color meta tag
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', bg);
    }
  }, []);

  // 3. React to OS system appearance changes if in system mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (quickMode === 'system') {
        applyThemeToDOM(theme, 'system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme, quickMode, applyThemeToDOM]);

  // Initial DOM synchronization
  useEffect(() => {
    applyThemeToDOM(theme, quickMode);
  }, [theme, quickMode, applyThemeToDOM]);

  // 4. Verify current theme settings from the database for authenticated users on app initialization
  //    and ensure fallback to localStorage for unauthenticated users
  const verifyThemeFromDatabase = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const activeToken = localStorage.getItem('naviko_auth_token') || authToken;

    // Unauthenticated user: ensure fallback to localStorage
    if (!activeToken) {
      const localFallback = getStoredThemeFallback();
      setThemeState(localFallback);
      applyThemeToDOM(localFallback, quickMode);
      setIsThemeVerified(true);
      return;
    }

    // Authenticated user: verify current theme settings from the database
    try {
      setIsThemeVerifying(true);
      const res = await authService.getCurrentUser(activeToken);

      if (res.success && res.user) {
        const dbTheme = res.user.preferences?.theme;

        if (dbTheme) {
          if (dbTheme === 'system') {
            setQuickModeState('system');
            localStorage.setItem('naviko_quick_theme', 'system');
            applyThemeToDOM(theme, 'system');
          } else if (THEMES[dbTheme as ThemeId]) {
            const verifiedTheme = dbTheme as ThemeId;
            const targetIsDark = THEMES[verifiedTheme].isDark;
            const targetQuick: QuickMode = targetIsDark ? 'dark' : 'light';
            setThemeState(verifiedTheme);
            setQuickModeState(targetQuick);
            localStorage.setItem('naviko_theme_id', verifiedTheme);
            localStorage.setItem('naviko_theme', targetIsDark ? 'dark' : 'light');
            localStorage.setItem('naviko_quick_theme', targetQuick);
            applyThemeToDOM(verifiedTheme, targetQuick);
          }
        } else {
          // Authenticated in DB, but no preference record exists yet:
          // Fall back to current localStorage theme and persist it to user's DB profile
          const currentLocalTheme = getStoredThemeFallback();
          authService.updateProfile({ preferences: { theme: currentLocalTheme } }, activeToken).catch(() => {});
        }
      } else {
        // Token expired or invalid session: safely fallback to localStorage
        const localFallback = getStoredThemeFallback();
        setThemeState(localFallback);
        applyThemeToDOM(localFallback, quickMode);
      }
    } catch {
      // Network failure / offline: safe fallback to localStorage
      const localFallback = getStoredThemeFallback();
      setThemeState(localFallback);
      applyThemeToDOM(localFallback, quickMode);
    } finally {
      setIsThemeVerifying(false);
      setIsThemeVerified(true);
    }
  }, [authToken, quickMode, theme, applyThemeToDOM]);

  // 5. Run database theme verification on app initialization
  useEffect(() => {
    if (!verificationInitiatedRef.current) {
      verificationInitiatedRef.current = true;
      verifyThemeFromDatabase();
    }
  }, [verifyThemeFromDatabase]);

  // 6. Multi-device sync: If user profile updates in AuthContext (e.g. login, refreshAuth, or account switch)
  useEffect(() => {
    if (isAuthenticated && user?.preferences?.theme) {
      const accountTheme = user.preferences.theme;
      if (accountTheme === 'system') {
        setQuickModeState('system');
        if (typeof window !== 'undefined') {
          localStorage.setItem('naviko_quick_theme', 'system');
        }
        applyThemeToDOM(theme, 'system');
      } else if (THEMES[accountTheme as ThemeId] && accountTheme !== theme) {
        const validatedTheme = accountTheme as ThemeId;
        const targetIsDark = THEMES[validatedTheme].isDark;
        const targetQuick: QuickMode = targetIsDark ? 'dark' : 'light';
        setThemeState(validatedTheme);
        setQuickModeState(targetQuick);
        if (typeof window !== 'undefined') {
          localStorage.setItem('naviko_theme_id', validatedTheme);
          localStorage.setItem('naviko_theme', targetIsDark ? 'dark' : 'light');
          localStorage.setItem('naviko_quick_theme', targetQuick);
        }
        applyThemeToDOM(validatedTheme, targetQuick);
      }
    }
  }, [isAuthenticated, user?.preferences?.theme, theme, applyThemeToDOM]);

  // 7. Cross-tab sync listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'naviko_theme_id' && e.newValue && THEMES[e.newValue as ThemeId]) {
        const newThemeId = e.newValue as ThemeId;
        const targetIsDark = THEMES[newThemeId].isDark;
        const targetQuick: QuickMode = targetIsDark ? 'dark' : 'light';
        setThemeState(newThemeId);
        setQuickModeState(targetQuick);
        applyThemeToDOM(newThemeId, targetQuick);
      }
    };

    const handleCustomSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && THEMES[customEvent.detail as ThemeId]) {
        const newThemeId = customEvent.detail as ThemeId;
        const targetIsDark = THEMES[newThemeId].isDark;
        const targetQuick: QuickMode = targetIsDark ? 'dark' : 'light';
        setThemeState(newThemeId);
        setQuickModeState(targetQuick);
        applyThemeToDOM(newThemeId, targetQuick);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('naviko:theme-sync', handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('naviko:theme-sync', handleCustomSync);
    };
  }, [applyThemeToDOM]);

  // 8. Set theme handler with local & cloud persistence
  const setTheme = useCallback(
    (id: ThemeId) => {
      if (!THEMES[id]) return;
      const targetIsDark = THEMES[id].isDark;
      const targetQuickMode: QuickMode = targetIsDark ? 'dark' : 'light';

      setThemeState(id);
      setQuickModeState(targetQuickMode);
      setResolvedTheme(targetIsDark ? 'dark' : 'light');

      if (typeof window !== 'undefined') {
        localStorage.setItem('naviko_theme_id', id);
        localStorage.setItem('naviko_theme', targetIsDark ? 'dark' : 'light');
        localStorage.setItem('naviko_quick_theme', targetQuickMode);

        // Sync with user account database if authenticated
        const activeToken = localStorage.getItem('naviko_auth_token') || authToken;
        if (activeToken) {
          authService.updateProfile({ preferences: { theme: id } }, activeToken).catch(() => {});
        }
      }

      applyThemeToDOM(id, targetQuickMode);
    },
    [authToken, applyThemeToDOM]
  );

  // 9. Set Quick Mode (Light / Dark / System)
  const setQuickMode = useCallback(
    (mode: QuickMode) => {
      setQuickModeState(mode);

      let targetTheme = theme;
      if (mode === 'dark' && !THEMES[theme].isDark) {
        targetTheme = 'dark';
        setThemeState('dark');
      } else if (mode === 'light' && THEMES[theme].isDark) {
        targetTheme = 'light';
        setThemeState('light');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('naviko_quick_theme', mode);
        localStorage.setItem('naviko_theme_id', targetTheme);
        localStorage.setItem('naviko_theme', mode === 'dark' ? 'dark' : 'light');

        const activeToken = localStorage.getItem('naviko_auth_token') || authToken;
        if (activeToken) {
          authService.updateProfile({ preferences: { theme: targetTheme } }, activeToken).catch(() => {});
        }
      }

      applyThemeToDOM(targetTheme, mode);
    },
    [theme, authToken, applyThemeToDOM]
  );

  // 10. Guaranteed 1-click theme toggle (Light <-> Dark)
  const toggleTheme = useCallback(() => {
    // Check actual DOM state or resolvedTheme to reliably determine next state
    const isCurrentlyDark =
      (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) ||
      resolvedTheme === 'dark';

    const willBeDark = !isCurrentlyDark;
    const nextTheme: ThemeId = willBeDark ? 'dark' : 'default';
    const nextQuickMode: QuickMode = willBeDark ? 'dark' : 'light';

    setThemeState(nextTheme);
    setQuickModeState(nextQuickMode);
    setResolvedTheme(willBeDark ? 'dark' : 'light');

    if (typeof window !== 'undefined') {
      localStorage.setItem('naviko_theme_id', nextTheme);
      localStorage.setItem('naviko_theme', willBeDark ? 'dark' : 'light');
      localStorage.setItem('naviko_quick_theme', nextQuickMode);

      const activeToken = localStorage.getItem('naviko_auth_token') || authToken;
      if (activeToken) {
        authService.updateProfile({ preferences: { theme: nextTheme } }, activeToken).catch(() => {});
      }
    }

    applyThemeToDOM(nextTheme, nextQuickMode);
  }, [resolvedTheme, authToken, applyThemeToDOM]);

  const activeThemeDef = THEMES[theme] || THEMES.default;
  const availableThemes = THEME_ORDER.map((id) => THEMES[id]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        activeThemeDef,
        quickMode,
        resolvedTheme,
        setTheme,
        setQuickMode,
        toggleTheme,
        availableThemes,
        isThemeVerified,
        isThemeVerifying,
        verifyThemeFromDatabase,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
