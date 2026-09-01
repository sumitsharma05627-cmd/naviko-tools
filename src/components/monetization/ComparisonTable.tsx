import React from 'react';
import { Check, Minus, Sparkles, Crown } from 'lucide-react';
import { COMPARISON_FEATURES } from '../../config/pricing';

export const ComparisonTable: React.FC = () => {
  const categories = [
    { id: 'core', label: 'Core Tools & Calculators' },
    { id: 'limits', label: 'Daily Limits & Processing Power' },
    { id: 'health', label: 'Health & Nutrition Science' },
    { id: 'student', label: 'Student Productivity & Analytics' },
    { id: 'productivity', label: 'Workspaces & Customization' },
    { id: 'experience', label: 'Platform & Experience' },
  ];

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
              <th className="py-4 px-6 font-bold text-slate-900 dark:text-white w-2/5">
                Features &amp; Capabilities
              </th>
              <th className="py-4 px-5 font-bold text-slate-700 dark:text-slate-300 text-center w-1/5">
                <div className="inline-flex items-center gap-1">
                  <span>FREE</span>
                </div>
              </th>
              <th className="py-4 px-5 font-extrabold text-indigo-700 dark:text-indigo-300 text-center w-1/5 bg-indigo-500/10 dark:bg-indigo-500/10">
                <div className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>PLUS</span>
                </div>
              </th>
              <th className="py-4 px-5 font-extrabold text-purple-700 dark:text-purple-300 text-center w-1/5 bg-purple-500/10 dark:bg-purple-500/10">
                <div className="inline-flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>PRO</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {categories.map((category) => {
              const items = COMPARISON_FEATURES.filter((f) => f.category === category.id);
              if (items.length === 0) return null;

              return (
                <React.Fragment key={category.id}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-100/50 dark:bg-slate-800/30">
                    <td
                      colSpan={4}
                      className="py-2.5 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      {category.label}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {items.map((feat, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-6 font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                        {feat.text}
                      </td>

                      {/* Free Col */}
                      <td className="py-3.5 px-5 text-center text-xs">
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

                      {/* Plus Col */}
                      <td className="py-3.5 px-5 text-center text-xs bg-indigo-500/5 dark:bg-indigo-500/5">
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

                      {/* Pro Col */}
                      <td className="py-3.5 px-5 text-center text-xs bg-purple-500/5 dark:bg-purple-500/5">
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
    </div>
  );
};

