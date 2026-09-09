import { useState, useEffect } from 'react';

/**
 * useMediaQuery
 * Custom hook to match CSS media queries like '(prefers-reduced-motion: reduce)'
 * or responsive breakpoints like '(min-width: 768px)'.
 *
 * @param query CSS media query string
 * @returns boolean indicating if the query currently matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    } else {
      // Legacy fallback for older browsers / iOS Safari
      mediaQueryList.addListener(listener);
      return () => mediaQueryList.removeListener(listener);
    }
  }, [query]);

  return matches;
}

export default useMediaQuery;
