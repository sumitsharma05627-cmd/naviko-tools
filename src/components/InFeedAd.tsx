import React, { useEffect, useRef, useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { shouldShowAds, hasActivePaidSubscription } from '../config/adPolicy';

interface InFeedAdProps {
  className?: string;
  currentPath?: string;
}

export const InFeedAd: React.FC<InFeedAdProps> = ({ className = '', currentPath }) => {
  const { plan, subscriptionStatus } = useSubscription();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushed = useRef(false);
  const [isRenderable, setIsRenderable] = useState(false);

  const subscriptionObj = { plan, subscriptionStatus };
  const isAdFree = hasActivePaidSubscription(subscriptionObj);

  const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');

  const allowed = shouldShowAds(user, subscriptionObj, {
    path
  });

  useEffect(() => {
    if (!allowed || isAdFree) {
      setIsRenderable(false);
      return;
    }
    setIsRenderable(true);
  }, [allowed, isAdFree, path]);


  useEffect(() => {
    if (!isRenderable || isAdFree || isPushed.current) return;

    const tryPush = () => {
      if (isPushed.current) return;
      const el = adRef.current;
      const container = containerRef.current;
      if (!el || !container) return;
      if (el.getAttribute('data-adsbygoogle-status')) return;

      const width = container.offsetWidth || el.offsetWidth;
      if (width > 120) {
        try {
          if (typeof window !== 'undefined') {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            isPushed.current = true;
          }
        } catch (e) {
          console.warn('AdSense In-feed initialization note:', e);
        }
      }
    };

    const timer = setTimeout(tryPush, 100);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 120 && !isPushed.current) {
            tryPush();
            if (isPushed.current && observer) {
              observer.disconnect();
            }
          }
        }
      });
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [isRenderable, isAdFree]);

  if (!isRenderable || !allowed || isAdFree) {
    return null;
  }

  return (
    <section
      aria-label="Advertisement"
      className={`w-full max-w-6xl mx-auto px-4 sm:px-6 my-8 transition-all ${className}`}
    >
      <div
        ref={containerRef}
        className="w-full rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-5 shadow-2xs transition-colors"
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pointer-events-none select-none">
          <span>Advertisement</span>
          <span>Sponsored</span>
        </div>
        <div className="w-full overflow-hidden min-h-[90px] flex items-center justify-center">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '90px', width: '100%' }}
            data-ad-format="fluid"
            data-ad-layout-key="-fb+5w+4e-db+86"
            data-ad-client="ca-pub-4353645659036465"
            data-ad-slot="7047157982"
          />
        </div>
      </div>
    </section>
  );
};
