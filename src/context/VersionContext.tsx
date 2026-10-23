import React, { createContext, useContext, useState, useEffect } from 'react';

export type NavikoVersion = 'v1' | 'v2';

interface VersionContextType {
  version: NavikoVersion;
  setVersion: (version: NavikoVersion) => void;
  switchVersion: (version: NavikoVersion, navigate?: (path: string) => void) => void;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

const V2_EXCLUSIVE_PATHS = [
  '/food-explorer',
  '/nutrition-explorer',
  '/foods',
  '/food-compare',
  '/compare-foods',
  '/label-analyzer',
  '/ins-decoder',
  '/recipes',
  '/healthy-recipes',
  '/indian-recipes',
  '/ayurveda',
  '/ayurveda-hub',
  '/herbs',
  '/sources',
  '/editorial-standards',
  '/v2'
];

export const VersionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [version, setVersionState] = useState<NavikoVersion>(() => {
    // 1. Check current URL path first (highest priority)
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/v1' || path.startsWith('/v1/')) {
        return 'v1';
      }
      if (path === '/v2' || path.startsWith('/v2/')) {
        return 'v2';
      }
      // If path is a v2-exclusive route, default to v2
      if (V2_EXCLUSIVE_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) {
        return 'v2';
      }
      // 2. Read stored preference from localStorage
      try {
        const saved = localStorage.getItem('naviko_site_version');
        if (saved === 'v1' || saved === 'v2') {
          return saved;
        }
      } catch {
        // ignore
      }
    }
    // Default to v1 if user specifically requested original restoration, or default to stored
    return 'v1';
  });

  // Sync state whenever URL changes (e.g. popstate or pushState)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/v1' || path.startsWith('/v1/')) {
        setVersionState('v1');
      } else if (path === '/v2' || path.startsWith('/v2/')) {
        setVersionState('v2');
      } else if (V2_EXCLUSIVE_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) {
        setVersionState('v2');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('naviko_version_sync', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('naviko_version_sync', handleLocationChange);
    };
  }, []);

  const setVersion = (v: NavikoVersion) => {
    setVersionState(v);
    try {
      localStorage.setItem('naviko_site_version', v);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('naviko_version_changed', { detail: { version: v } }));
  };

  const switchVersion = (newVersion: NavikoVersion, navigate?: (path: string) => void) => {
    setVersion(newVersion);

    if (navigate) {
      const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';

      if (newVersion === 'v1') {
        // If user is switching to v1 and currently on v2 homepage or v2 exclusive route:
        if (
          currentPath === '/v2' ||
          currentPath === '/' ||
          V2_EXCLUSIVE_PATHS.some((p) => currentPath === p || currentPath.startsWith(`${p}/`))
        ) {
          navigate('/v1');
        } else {
          // Stay on current common tool page (e.g. /tools/sip-calculator)
          window.dispatchEvent(new Event('naviko_version_sync'));
        }
      } else {
        // Switching to v2:
        if (currentPath === '/v1' || currentPath === '/') {
          navigate('/v2');
        } else {
          window.dispatchEvent(new Event('naviko_version_sync'));
        }
      }
    }
  };

  return (
    <VersionContext.Provider value={{ version, setVersion, switchVersion }}>
      {children}
    </VersionContext.Provider>
  );
};

export const useVersion = (): VersionContextType => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
};
