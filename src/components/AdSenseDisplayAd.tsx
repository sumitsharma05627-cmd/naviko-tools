import React, { useEffect, useRef, useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { isAdPlacementAllowed } from '../config/adPolicy';

interface AdSenseDisplayAdProps {
  className?: string;
  currentPath?: string;
  isToolLocked?: boolean;
  hasSubstantialContent?: boolean;
  format?: 'auto' | 'horizontal' | 'rectangle';
  minHeight?: number;
}

export const AdSenseDisplayAd: React.FC<AdSenseDisplayAdProps> = ({
  className = '',
  currentPath,
  isToolLocked = false,
  hasSubstantialContent = true,
  format = 'auto',
  minHeight = 100
}) => {
  const { plan, subscriptionStatus } = useSubscription();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushed = useRef(false);
  const [isRenderable, setIsRenderable] = useState(false);

  const isAdFree =
    (plan === 'plus' || plan === 'pro' || plan === 'trial') &&
    (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL_ACTIVE');

  const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');

  // Verify route & content authorization under Google AdSense policies
  const allowed = isAdPlacementAllowed({
    path,
    isPremium: isAdFree,
    isToolLocked,
    hasSubstantialContent
  });

  useEffect(() => {
    // If ads are prohibited or user is subscribed, do nothing
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

      // AdSense throws 'No slot size for availableWidth=0' if container width is <= 0
      const width = container.offsetWidth || el.offsetWidth;
      if (width > 120) {
        try {
          if (typeof window !== 'undefined') {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            isPushed.current = true;
          }
        } catch (e) {
          // Gracefully log ad blocker or network rejection
          console.warn('AdSense responsive display ad initialization note:', e);
        }
      }
    };

    // Attempt push after paint
    const timer = setTimeout(tryPush, 100);

    // Observe container width until layout is stabilized with non-zero dimensions
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
      className={`w-full max-w-6xl mx-auto px-4 sm:px-6 my-10 transition-all ${className}`}
    >
      {/* Visual isolation boundary: clearly distinguishes sponsor content from tools */}
      <div
        ref={containerRef}
        className="w-full rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-5 shadow-2xs transition-colors"
      >
        {/* Compliance labels: never mistaken for tools or clickable buttons */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pointer-events-none select-none">
          <span>Advertisement</span>
          <span>Sponsored</span>
        </div>

        {/* Ad container with guaranteed minimum dimensions */}
        <div
          className="w-full overflow-hidden flex items-center justify-center text-center"
          style={{ minHeight: `${minHeight}px` }}
        >
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              minHeight: `${minHeight}px`,
              minWidth: '200px'
            }}
            data-ad-client="ca-pub-4353645659036465"
            data-ad-slot="5557042993"
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </section>
  );
};
