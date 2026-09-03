import React, { useEffect, useRef } from 'react';
import { useSubscription } from '../context/SubscriptionContext';

interface AdSenseDisplayAdProps {
  className?: string;
}

export const AdSenseDisplayAd: React.FC<AdSenseDisplayAdProps> = ({ className = '' }) => {
  const { plan, subscriptionStatus } = useSubscription();
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushed = useRef(false);

  const isAdFree =
    (plan === 'plus' || plan === 'pro' || plan === 'trial') &&
    (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL_ACTIVE');

  useEffect(() => {
    // If user has subscription, do not push ads
    if (isAdFree) return;

    // Prevent duplicate push calls during React 18 Strict Mode or re-renders
    if (isPushed.current) return;

    const tryPush = () => {
      if (isPushed.current) return;
      const el = adRef.current;
      if (!el || el.getAttribute('data-adsbygoogle-status')) return;

      // AdSense throws 'No slot size for availableWidth=0' if container width is 0
      if (el.offsetWidth > 0) {
        try {
          if (typeof window !== 'undefined') {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            isPushed.current = true;
          }
        } catch (e) {
          // Gracefully handle ad blocker or initialization errors
          console.warn('AdSense Display Ad initialization note:', e);
        }
      }
    };

    // Attempt immediate push if already sized
    tryPush();

    // If still not pushed because width was 0, observe container until layout finishes
    if (!isPushed.current && adRef.current && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            tryPush();
            if (isPushed.current) {
              observer.disconnect();
            }
          }
        }
      });
      observer.observe(adRef.current);
      return () => observer.disconnect();
    }
  }, [isAdFree]);

  if (isAdFree) {
    return null; // Ad-free experience for NAVIKO Plus and Pro members
  }

  return (
    <section
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 transition-all ${className}`}
      aria-label="Advertisement"
    >
      <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-2xs transition-colors">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span>Advertisement</span>
          <span>Sponsored</span>
        </div>
        <div className="w-full overflow-hidden min-h-[90px] flex items-center justify-center">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-4353645659036465"
            data-ad-slot="5557042993"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </section>
  );
};
