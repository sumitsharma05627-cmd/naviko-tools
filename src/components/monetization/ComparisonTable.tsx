import React, { useState } from 'react';
import { Check, Minus, Sparkles, Crown, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { COMPARISON_FEATURES, PlanType, BillingInterval } from '../../config/pricing';

interface ComparisonTableProps {
  onSelectPlan?: (tier: 'plus' | 'pro', interval?: BillingInterval) => void;
  plusPriceFormatted?: string;
  proPriceFormatted?: string;
  currentPlan?: PlanType;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  onSelectPlan,
  plusPriceFormatted = '₹99/mo',
  proPriceFormatted = '₹199/mo',
  currentPlan = 'free',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Features' },
    { id: 'limits', label: 'Daily Limits & Speed' },
    { id: 'core', label: 'Core Tools' },
    { id: 'health', label: 'Health & Nutrition' },
    { id: 'student', label: 'Student Analytics' },
    { id: 'productivity', label: 'Workspaces & Exports' },
    { id: 'experience', label: 'Platform & Ads' },
  ];

  const filteredFeatures = selectedCategory === 'all'
    ? COMPARISON_FEATURES
    : COMPARISON_FEATURES.filter((f) => f.category === selectedCategory);

  const activeCategories = selectedCategory === 'all'
    ? categories.filter(c => c.id !== 'all')
    : categories.filter(c => c.id === selectedCategory);

  return (
    <div className="w-full space-y-6">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[760px]">
            {/* Table Header with Plan Cards & Quick Action CTA */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850">
                <th className="py-5 px-6 font-black text-slate-900 dark:text-white w-2/5 align-bottom">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Compare All Tiers</span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Features &amp; Value Matrix
                    </h3>
                  </div>
                </th>

                {/* Free Header */}
                <th className="py-5 px-4 font-bold text-center w-1/5 align-bottom">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      FREE
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      ₹0
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Forever Free</span>
                    {currentPlan === 'free' ? (
                      <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Current
                      </span>
                    ) : null}
                  </div>
                </th>

                {/* Plus Header */}
                <th className="py-5 px-4 font-extrabold text-center w-1/5 align-bottom bg-indigo-500/5 dark:bg-indigo-500/5">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-500/40 dark:border-indigo-500/40 flex flex-col items-center relative shadow-xs">
                    <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                      Popular
                    </span>
                    <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>PLUS</span>
                    </div>
                    <span className="text-base sm:text-lg font-black text-indigo-950 dark:text-white mt-0.5">
                      {plusPriceFormatted}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Students &amp; Health</span>

                    {onSelectPlan && (
                      <button
                        onClick={() => onSelectPlan('plus')}
                        className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Choose Plus</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>

                {/* Pro Header */}
                <th className="py-5 px-4 font-extrabold text-center w-1/5 align-bottom bg-purple-500/5 dark:bg-purple-500/5">
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border-2 border-purple-500/40 dark:border-purple-500/40 flex flex-col items-center relative shadow-xs">
                    <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                      Ultimate
                    </span>
                    <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 mt-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>PRO</span>
                    </div>
                    <span className="text-base sm:text-lg font-black text-purple-950 dark:text-white mt-0.5">
                      {proPriceFormatted}
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Power Users</span>

                    {onSelectPlan && (
                      <button
                        onClick={() => onSelectPlan('pro')}
                        className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Choose Pro</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body Groups */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {activeCategories.map((category) => {
                const items = filteredFeatures.filter((f) => f.category === category.id);
                if (items.length === 0) return null;

                return (
                  <React.Fragment key={category.id}>
                    {/* Category Divider Header Row */}
                    <tr className="bg-slate-100/60 dark:bg-slate-800/40">
                      <td
                        colSpan={4}
                        className="py-2.5 px-6 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300"
                      >
                        {category.label}
                      </td>
                    </tr>

                    {/* Feature Rows */}
                    {items.map((feat, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Feature Description */}
                        <td className="py-3.5 px-6 font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <span>{feat.text}</span>
                          </div>
                        </td>

                        {/* Free Value */}
                        <td className="py-3.5 px-4 text-center text-xs">
                          {typeof feat.free === 'boolean' ? (
                            feat.free ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <Minus className="w-3.5 h-3.5" />
                              </span>
                            )
                          ) : (
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              {feat.free}
                            </span>
                          )}
                        </td>

                        {/* Plus Value */}
                        <td className="py-3.5 px-4 text-center text-xs bg-indigo-500/5 dark:bg-indigo-500/5">
                          {typeof feat.plus === 'boolean' ? (
                            feat.plus ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <Minus className="w-3.5 h-3.5" />
                              </span>
                            )
                          ) : (
                            <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
                              {feat.plus}
                            </span>
                          )}
                        </td>

                        {/* Pro Value */}
                        <td className="py-3.5 px-4 text-center text-xs bg-purple-500/5 dark:bg-purple-500/5">
                          {typeof feat.pro === 'boolean' ? (
                            feat.pro ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <Minus className="w-3.5 h-3.5" />
                              </span>
                            )
                          ) : (
                            <span className="font-extrabold text-purple-700 dark:text-purple-300">
                              {feat.pro}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Guarantee Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Core calculators are permanently free forever with zero sign-up requirement.</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Fair use daily quotas reset automatically at midnight UTC.</span>
          </div>
        </div>
      </div>
    </div>
  );
};


