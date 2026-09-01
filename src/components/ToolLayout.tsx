import React, { useEffect, useState } from 'react';
import { HelpCircle, BookOpen, Lightbulb, ArrowRight, Sparkles, Lock, Zap } from 'lucide-react';
import { ToolMeta } from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import { DynamicIcon } from './DynamicIcon';
import { DesktopAdSlot, MobileAdSlot } from './AdSlot';
import { BreadcrumbNavigation, getCategoryHierarchy } from './BreadcrumbNavigation';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { TOOL_ENTITLEMENTS } from '../config/entitlements';
import { PremiumBadge } from './monetization/PremiumBadge';
import { LockedFeatureModal } from './monetization/LockedFeatureModal';

interface ToolLayoutProps {
  tool: ToolMeta;
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  examples?: { title: string; explanation: string; value?: string }[];
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  children,
  onNavigate,
  examples = []
}) => {
  const { t } = useLanguage();
  const { plan, subscriptionStatus, canAccess, checkQuota } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPremium = (plan === 'plus' || plan === 'pro') && subscriptionStatus === 'active';
  const entitlement = TOOL_ENTITLEMENTS[tool.id];
  const quota = checkQuota(tool.id);

  const toolName = t(`${tool.id}.title`, tool.name);
  const toolDesc = t(`${tool.id}.subtitle`, tool.description);
  const categoryLabel = t(`cat.${tool.category}`, tool.categoryName);

  useEffect(() => {
    // 1. Title
    const title = tool.seoTitle || `${toolName} — Free Online Tool | NAVIKO`;
    document.title = title;

    // 2. Meta description
    const desc = tool.metaDescription || toolDesc;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);

    // 3. Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://naviko.in${tool.path}`);

    // 4. OpenGraph tags
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('og:title', title);
    setMeta('og:description', desc);
    setMeta('og:url', `https://naviko.in${tool.path}`);

    // 5. JSON-LD Schema
    const scriptId = 'tool-jsonld-schema';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          'name': toolName,
          'url': `https://naviko.in${tool.path}`,
          'description': desc,
          'applicationCategory': 'UtilitiesApplication',
          'operatingSystem': 'All',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          }
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://naviko.in/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': categoryLabel || tool.categoryName,
              'item': `https://naviko.in${getCategoryHierarchy(tool.category).path}`
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': toolName,
              'item': `https://naviko.in${tool.path}`
            }
          ]
        }
      ]
    };

    scriptEl.textContent = JSON.stringify(schemaData);

    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => {
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [tool, toolName, toolDesc, categoryLabel]);

  // Find related tools prioritized by tool.relatedToolPaths
  let relatedTools: ToolMeta[] = [];
  if (tool.relatedToolPaths && tool.relatedToolPaths.length > 0) {
    relatedTools = tool.relatedToolPaths
      .map((p) => TOOLS_DATA.find((t) => t.path === p))
      .filter((t): t is ToolMeta => t !== undefined)
      .slice(0, 4);
  }
  if (relatedTools.length < 3) {
    const fallbacks = TOOLS_DATA.filter(
      (t) => t.id !== tool.id && !relatedTools.some((r) => r.id === t.id) && (t.category === tool.category || t.popular)
    );
    relatedTools = [...relatedTools, ...fallbacks].slice(0, 4);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 transition-colors">
      {/* 1. Dynamic Breadcrumb Navigation */}
      <BreadcrumbNavigation tool={tool} onNavigate={onNavigate} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 2 & 3. Header Title & Description */}
        <div className="mb-6 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <DynamicIcon name={tool.iconName} className="w-3.5 h-3.5" />
              <span>{categoryLabel}</span>
            </div>

            {(entitlement?.accessLevel === 'PLUS' || entitlement?.accessLevel === 'PRO') && (
              <PremiumBadge plan={entitlement?.accessLevel === 'PRO' ? 'pro' : 'plus'} size="xs" />
            )}

            {isPremium && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                <Sparkles className="w-3 h-3 text-amber-500" /> Premium Member
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {toolName}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {toolDesc}
          </p>

          {/* Daily Quota Indicator for FREE_LIMITED tools */}
          {entitlement?.accessLevel === 'FREE_LIMITED' && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {isPremium ? (
                  <strong className="text-amber-600 dark:text-amber-400">Premium Quota: 50 runs/day</strong>
                ) : (
                  <>
                    Daily Free Quota: <strong className="text-slate-900 dark:text-white">{quota.remaining} of {quota.limit} remaining</strong>
                  </>
                )}
              </span>
              {!isPremium && (
                <button
                  onClick={() => onNavigate('/premium')}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline ml-1 cursor-pointer"
                >
                  Get 50/day →
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4 & 5. Working Tool Interface Container OR Locked Feature View */}
        <div className="mb-10">
          {!canAccess(tool.id) ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/50 shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto transition-colors">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>NAVIKO Premium Tool</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Unlock {toolName} with NAVIKO Premium
              </h2>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                {entitlement?.premiumFeatureSummary ||
                  entitlement?.description ||
                  'This advanced utility is part of the NAVIKO Premium Productivity Suite. Upgrade to unlock full access, saved histories, and priority processing.'}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('/premium')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to Premium</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('/tools')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer"
                >
                  Explore 25+ Free Tools
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-6 lg:p-8 transition-colors">
              {children}
            </div>
          )}
        </div>

        {/* Ad Placeholder below tool for Free users */}
        {!isPremium && (
          <>
            <DesktopAdSlot className="mb-10" />
            <MobileAdSlot className="mb-8" />
          </>
        )}

        {/* Informational Sections: How to use, Examples, FAQs, Related */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Left Column: How to Use & Examples */}
          <div className="lg:col-span-2 space-y-8">
            {/* 6. How to Use */}
            {tool.howToUse && tool.howToUse.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('common.howToUse', 'How to Use')} {toolName}
                  </h2>
                </div>
                <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {tool.howToUse.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* 7. Key Features / Examples */}
            {examples.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('layout.examplesTitle', 'Worked Examples & Use Cases')}
                  </h2>
                </div>
                <div className="space-y-4">
                  {examples.map((ex, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 text-sm">
                      <div className="font-semibold text-slate-900 dark:text-white mb-1">{ex.title}</div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{ex.explanation}</p>
                      {ex.value && (
                        <div className="mt-2 font-mono text-xs text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                          {ex.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Frequently Asked Questions */}
            {tool.faqs && tool.faqs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('common.faq', 'Frequently Asked Questions')}
                  </h2>
                </div>
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {tool.faqs.map((faq, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
                        {faq.question}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Key Features List & Related Tools */}
          <div className="space-y-8">
            {/* Features Checklist */}
            {tool.features && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                  {t('common.whyNaviko', 'Why Use NAVIKO?')}
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {tool.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{t('common.clientSidePrivacy', '100% Client-side privacy (no data stored)')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{t('common.zeroLogs', 'No registration, login, or limits required')}</span>
                  </li>
                </ul>
              </div>
            )}

            {/* 9. Related Tools */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                {t('common.relatedTools', 'Related Tools')}
              </h3>
              <div className="space-y-3">
                {relatedTools.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => onNavigate(rel.path)}
                    className="w-full text-left p-3 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 transition-colors">
                        <DynamicIcon name={rel.iconName} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                          {t(`${rel.id}.title`, rel.name)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {t(`${rel.id}.subtitle`, rel.shortDescription)}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

