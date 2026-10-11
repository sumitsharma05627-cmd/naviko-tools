import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';

interface CookieConsentBannerProps {
  onNavigate?: (path: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or dismissed
    try {
      const saved = localStorage.getItem('naviko_cookie_consent');
      if (!saved) {
        // Small delay to prevent layout pop on initial render
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      } else if (saved === 'essential_only') {
        // Enforce non-personalized ads for essential-only users
        if (typeof window !== 'undefined') {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).requestNonPersonalizedAds = 1;
        }
      }
    } catch {
      // Ignore private browsing storage errors
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('naviko_cookie_consent', 'all');
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).requestNonPersonalizedAds = 0;
      }
    } catch {}
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('naviko_cookie_consent', 'essential_only');
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).requestNonPersonalizedAds = 1;
      }
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie & Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-2xl transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Privacy &amp; Cookie Notice</span>
              </h3>
              <button
                onClick={handleEssentialOnly}
                aria-label="Close"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              NAVIKO processes all calculations 100% locally in your browser. We use local storage for your theme and drafts, and privacy-compliant cookies for site reliability and non-intrusive sponsor ads.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Accept All
              </button>

              <button
                onClick={handleEssentialOnly}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Essential Only
              </button>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('/privacy-policy')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-auto cursor-pointer"
                >
                  Privacy Policy →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
