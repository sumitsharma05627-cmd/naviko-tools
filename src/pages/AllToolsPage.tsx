import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Filter, X, Sparkles } from 'lucide-react';
import { TOOLS_DATA, CATEGORIES_META } from '../data/toolsData';
import { ToolCategory } from '../types';
import { DynamicIcon } from '../components/DynamicIcon';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';

interface AllToolsPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: ToolCategory | 'all';
  initialSearch?: string;
}

export const AllToolsPage: React.FC<AllToolsPageProps> = ({
  onNavigate,
  initialCategory = 'all',
  initialSearch = ''
}) => {
  const [search, setSearch] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  useEffect(() => {
    document.title = 'All Free Tools Directory — NAVIKO';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'calculators', label: 'Calculators' },
    { id: 'student', label: 'Student' },
    { id: 'image', label: 'Image Tools' },
    { id: 'career', label: 'Career' },
    { id: 'other', label: 'Other Utilities' },
  ];

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      tool.category === selectedCategory ||
      (selectedCategory === 'student' && tool.studentHub);

    const q = search.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.categoryName.toLowerCase().includes(q) ||
      tool.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Tool Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            All Free Tools &amp; Utilities
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Browse our entire collection of client-side web tools. Fast, free forever, and completely private.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools by name, keyword, or function (e.g. percentage, marks, resize, resume)..."
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 flex items-center justify-center transition-colors">
                      <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {tool.categoryName}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {tool.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onNavigate(tool.path)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 group-hover:border-indigo-600 shadow-2xs"
                  >
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No matching tools found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try searching with another keyword or resetting the category filter.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* AdSlot */}
        <div className="mt-12">
          <DesktopAdSlot />
          <MobileAdSlot />
        </div>
      </div>
    </div>
  );
};
