import React, { useState, useMemo } from 'react';
import {
  Apple,
  Salad,
  Utensils,
  Layers,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Info,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Plus,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  Zap,
  Heart,
  Dumbbell,
  Building2,
  Eye,
  Activity,
  HeartPulse
} from 'lucide-react';
import {
  NUTRIENTS_DATA,
  FOODS_DATABASE,
  MEAL_BUILDER_GROUPS,
  NUTRITION_ARTICLES,
  NutrientInfo,
  FoodItem,
  NutritionArticle
} from '../../data/nutritionData';
import { DynamicIcon } from '../DynamicIcon';

type ActiveTab = 'nutrients' | 'foods' | 'compare' | 'meal-builder' | 'label-guide' | 'articles';

export const NutritionScience: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('nutrients');

  // --- 1. NUTRIENTS TAB STATE ---
  const [nutrientFilter, setNutrientFilter] = useState<'all' | 'macronutrient' | 'vitamin' | 'mineral'>('all');
  const [nutrientSearch, setNutrientSearch] = useState<string>('');
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientInfo | null>(NUTRIENTS_DATA[0]);

  // --- 2. FOODS TAB STATE ---
  const [foodCategory, setFoodCategory] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'vegan' | 'non-veg'>('all');
  const [foodSearch, setFoodSearch] = useState<string>('');
  const [servingMode, setServingMode] = useState<'portion' | '100g'>('portion');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // --- 3. COMPARE FOODS STATE ---
  const [compareId1, setCompareId1] = useState<string>('yellow-moong-dal');
  const [compareId2, setCompareId2] = useState<string>('chickpeas-chana');

  // --- 4. MEAL BUILDER STATE ---
  const [selectedMealItems, setSelectedMealItems] = useState<{
    id: string;
    name: string;
    serving: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    fiber: number;
  }[]>([
    { id: 'dal', name: 'Yellow Moong / Toor Dal (1 katori)', serving: '150g', protein: 9, carbs: 22, fat: 2, calories: 145, fiber: 5.5 },
    { id: 'roti_2', name: '2 Whole Wheat Rotis', serving: '80g', protein: 7, carbs: 44, fat: 1, calories: 220, fiber: 6.4 },
    { id: 'mixed_veg', name: 'Mixed Veggies (Carrot, Beans, Gobi)', serving: '150g', protein: 3, carbs: 12, fat: 2, calories: 75, fiber: 4.5 },
    { id: 'curd_bowl', name: 'Fresh Curd / Dahi (1 katori)', serving: '100g', protein: 4, carbs: 5, fat: 3, calories: 65, fiber: 0 }
  ]);
  const [mealCopied, setMealCopied] = useState<boolean>(false);

  // --- 5. LABEL GUIDE STATE ---
  const [activeLabelSection, setActiveLabelSection] = useState<string>('servings');

  // --- 6. ARTICLES TAB STATE ---
  const [selectedArticleId, setSelectedArticleId] = useState<string>(NUTRITION_ARTICLES[0].id);

  // ================= FILTERED DATA =================
  const filteredNutrients = useMemo(() => {
    return NUTRIENTS_DATA.filter((n) => {
      const matchesCat = nutrientFilter === 'all' || n.category === nutrientFilter;
      const q = nutrientSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        n.name.toLowerCase().includes(q) ||
        n.shortSummary.toLowerCase().includes(q) ||
        n.topSources.some((s) => s.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [nutrientFilter, nutrientSearch]);

  const filteredFoods = useMemo(() => {
    return FOODS_DATABASE.filter((f) => {
      const matchesCat = foodCategory === 'all' || f.category === foodCategory;
      const matchesDiet = dietFilter === 'all' || f.dietaryType === dietFilter;
      const q = foodSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.hindiName && f.hindiName.toLowerCase().includes(q)) ||
        f.highlights.some((h) => h.toLowerCase().includes(q));
      return matchesCat && matchesDiet && matchesSearch;
    });
  }, [foodCategory, dietFilter, foodSearch]);

  // Food comparison pair
  const food1 = FOODS_DATABASE.find((f) => f.id === compareId1) || FOODS_DATABASE[0];
  const food2 = FOODS_DATABASE.find((f) => f.id === compareId2) || FOODS_DATABASE[1];

  // Meal builder totals
  const mealTotals = useMemo(() => {
    return selectedMealItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
        fiber: acc.fiber + item.fiber
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [selectedMealItems]);

  const handleAddMealItem = (item: typeof selectedMealItems[0]) => {
    setSelectedMealItems((prev) => [...prev, item]);
  };

  const handleRemoveMealItem = (index: number) => {
    setSelectedMealItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyMeal = () => {
    const lines = [
      '--- NAVIKO Balanced Meal Plan ---',
      ...selectedMealItems.map((i) => `• ${i.name} (${i.calories} kcal, ${i.protein}g protein)`),
      `Total: ${mealTotals.calories} kcal | ${mealTotals.protein.toFixed(1)}g Protein | ${mealTotals.carbs.toFixed(1)}g Carbs | ${mealTotals.fat.toFixed(1)}g Fat | ${mealTotals.fiber.toFixed(1)}g Fiber`,
      'Crafted with NAVIKO Nutrition Science'
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setMealCopied(true);
    setTimeout(() => setMealCopied(false), 2000);
  };

  const selectedArticle = NUTRITION_ARTICLES.find((a) => a.id === selectedArticleId) || NUTRITION_ARTICLES[0];

  const labelSectionsInfo: Record<string, { title: string; explanation: string; tip: string }> = {
    servings: {
      title: '1. Serving Size & Servings Per Container',
      explanation:
        'All nutritional figures listed on the label are measured strictly for ONE specified serving size, NOT the full box or packet.',
      tip: 'Pro-Tip: If you eat double the serving size, you must multiply all calories, grams of fat, sodium, and sugars by 2.'
    },
    calories: {
      title: '2. Calories (Energy Measurement)',
      explanation:
        'Calories measure the total metabolic chemical energy provided by carbohydrates, proteins, and fats combined.',
      tip: 'A standard reference benchmark is 2,000 calories/day, but individual requirements vary with age, biological sex, and activity level.'
    },
    fat: {
      title: '3. Total Fat, Saturated & Trans Fat',
      explanation:
        'Fats provide 9 calories/gram. Focus on the breakdown rather than just total fat: prioritize unsaturated fatty acids while moderating saturated fat and avoiding industrial trans fats.',
      tip: 'Look for labels with 0g Trans Fat and minimal saturated fats (<5% Daily Value).'
    },
    sodium: {
      title: '4. Sodium (Salt)',
      explanation:
        'Sodium is an essential electrolyte, but packaged processed snacks and ready-to-eat foods often contain hidden high concentrations.',
      tip: 'Keep total daily sodium intake below 2,000 mg (about 1 teaspoon of table salt across all meals).'
    },
    carbs: {
      title: '5. Total Carbohydrates, Fiber & Added Sugars',
      explanation:
        'Pay special attention to the difference between naturally occurring sugars (in fruits/dairy) and "Added Sugars" (syrups, refined cane sugar). Higher Dietary Fiber slows digestion and blunts insulin spikes.',
      tip: 'Aim for foods where Dietary Fiber is high (>20% DV) and Added Sugars are low (<5% DV).'
    },
    protein: {
      title: '6. Protein',
      explanation:
        'The primary macronutrient for cellular regeneration, enzyme formation, skeletal muscle preservation, and long-term satiety.',
      tip: 'Most healthy adults benefit from 20g to 30g of quality protein distributed across main meals.'
    },
    dailyValue: {
      title: '7. % Daily Value (% DV) — The 5/20 Rule',
      explanation:
        'The % DV guide tells you how much a nutrient in a serving contributes to an average daily diet of 2,000 calories.',
      tip: 'Quick Rule: 5% DV or less is LOW. 20% DV or more is HIGH.'
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. TOP NAVIGATION TABS */}
      <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-none transition-colors">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('nutrients')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'nutrients'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Nutrient Explorer
          </button>

          <button
            onClick={() => setActiveTab('foods')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'foods'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Salad className="w-4 h-4" /> Food Database
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Compare Foods
          </button>

          <button
            onClick={() => setActiveTab('meal-builder')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'meal-builder'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" /> Balanced Meal Builder
          </button>

          <button
            onClick={() => setActiveTab('label-guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'label-guide'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" /> Label Reading Guide
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Learn Nutrition
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NUTRIENT EXPLORER */}
      {/* ========================================================================= */}
      {activeTab === 'nutrients' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto max-w-full">
              <button
                onClick={() => setNutrientFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  nutrientFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({NUTRIENTS_DATA.length})
              </button>
              <button
                onClick={() => setNutrientFilter('macronutrient')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  nutrientFilter === 'macronutrient'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Macronutrients (4)
              </button>
              <button
                onClick={() => setNutrientFilter('vitamin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  nutrientFilter === 'vitamin'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Vitamins (13)
              </button>
              <button
                onClick={() => setNutrientFilter('mineral')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  nutrientFilter === 'mineral'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Minerals (8)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={nutrientSearch}
                onChange={(e) => setNutrientSearch(e.target.value)}
                placeholder="Search nutrients or food sources..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Grid Layout: Nutrients List & Selected Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* List / Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[700px] overflow-y-auto pr-1">
              {filteredNutrients.map((nutrient) => {
                const isSelected = selectedNutrient?.id === nutrient.id;
                return (
                  <button
                    key={nutrient.id}
                    onClick={() => setSelectedNutrient(nutrient)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <DynamicIcon name={nutrient.icon} className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {nutrient.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {nutrient.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {nutrient.shortSummary}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Nutrient Deep-Dive Card */}
            <div className="lg:col-span-7 sticky top-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              {selectedNutrient ? (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <DynamicIcon name={selectedNutrient.icon} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          {selectedNutrient.name}
                        </h3>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {selectedNutrient.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 block">Daily Target</span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {selectedNutrient.dailyTarget}
                      </span>
                    </div>
                  </div>

                  {/* Summary & Biological Role */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        What It Is
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {selectedNutrient.whatItIs}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Biological &amp; Physiological Role
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {selectedNutrient.biologicalRole}
                      </p>
                    </div>

                    {/* Top Food Sources */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Top Dietary Sources
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNutrient.topSources.map((src, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Why It Matters */}
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">
                        Why It Matters for Everyday Wellbeing:
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedNutrient.whyItMatters}
                      </p>
                    </div>

                    {/* Cautions if any */}
                    {selectedNutrient.cautions && (
                      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                        <strong className="block font-bold">Important Dietary Note:</strong>
                        <p className="leading-relaxed">{selectedNutrient.cautions}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select a nutrient from the list to view detailed biological science.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FOOD NUTRITION DATABASE */}
      {/* ========================================================================= */}
      {activeTab === 'foods' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto max-w-full">
                {['all', 'grain', 'protein', 'dairy', 'vegetable', 'fruit', 'nuts_seeds', 'prepared'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFoodCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                      foodCategory === cat
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat === 'nuts_seeds' ? 'Nuts & Seeds' : cat}
                  </button>
                ))}
              </div>

              {/* Serving toggle & Search */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0">
                  <button
                    onClick={() => setServingMode('portion')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      servingMode === 'portion' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Per Portion
                  </button>
                  <button
                    onClick={() => setServingMode('100g')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      servingMode === '100g' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Per 100g
                  </button>
                </div>

                <div className="relative w-full md:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    placeholder="Search food (e.g. Roti, Dal)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>
            </div>

            {/* Diet Filter Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-bold">Diet:</span>
              {(['all', 'veg', 'vegan', 'non-veg'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDietFilter(d)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-colors cursor-pointer ${
                    dietFilter === d
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Foods Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => {
              const multiplier = servingMode === '100g' ? 100 / food.servingG : 1;
              const cal = Math.round(food.calories * multiplier);
              const prot = (food.protein * multiplier).toFixed(1);
              const carb = (food.carbs * multiplier).toFixed(1);
              const fat = (food.fat * multiplier).toFixed(1);
              const fib = (food.fiber * multiplier).toFixed(1);

              return (
                <div
                  key={food.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white tracking-tight">
                          {food.name}
                        </h4>
                        {food.hindiName && (
                          <span className="text-[11px] font-semibold text-slate-400">
                            {food.hindiName}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          food.dietaryType === 'veg'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : food.dietaryType === 'vegan'
                            ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {food.dietaryType}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-3 font-medium">
                      {servingMode === '100g' ? 'Per 100 grams' : food.servingDesc}
                    </span>

                    {/* Calories & Macros Row */}
                    <div className="grid grid-cols-4 gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">Energy</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{cal}</span>
                        <span className="text-[9px] text-slate-400 block">kcal</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">Protein</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{prot}</span>
                        <span className="text-[9px] text-slate-400 block">g</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">Carbs</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{carb}</span>
                        <span className="text-[9px] text-slate-400 block">g</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">Fat</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{fat}</span>
                        <span className="text-[9px] text-slate-400 block">g</span>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {food.highlights.slice(0, 2).map((hl, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Micronutrients Footer */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>Fiber: {fib}g</span>
                    <span>Calcium: {Math.round(food.calcium * multiplier)}mg</span>
                    <span>Iron: {(food.iron * multiplier).toFixed(1)}mg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMPARE FOODS */}
      {/* ========================================================================= */}
      {activeTab === 'compare' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">
                Side-by-Side Nutritional Comparison
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compare any two foods to see how their macronutrients, fiber, and micronutrients complement each other.
              </p>
            </div>

            {/* Selectors Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  First Food Item
                </label>
                <select
                  value={compareId1}
                  onChange={(e) => setCompareId1(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FOODS_DATABASE.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.servingDesc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Second Food Item
                </label>
                <select
                  value={compareId2}
                  onChange={(e) => setCompareId2(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FOODS_DATABASE.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.servingDesc})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-3 px-4">Nutrient Metric</th>
                    <th className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-extrabold">{food1.name}</th>
                    <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-extrabold">{food2.name}</th>
                    <th className="py-3 px-4">Nutritional Perspective</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-3 px-4 font-bold">Portion Size</td>
                    <td className="py-3 px-4 font-semibold">{food1.servingDesc}</td>
                    <td className="py-3 px-4 font-semibold">{food2.servingDesc}</td>
                    <td className="py-3 px-4 text-slate-400">Standard culinary serving</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold">Calories (Energy)</td>
                    <td className="py-3 px-4 font-black">{food1.calories} kcal</td>
                    <td className="py-3 px-4 font-black">{food2.calories} kcal</td>
                    <td className="py-3 px-4 text-slate-500">
                      {food1.calories > food2.calories
                        ? `${food1.name} is more energy-dense`
                        : `${food2.name} provides lower calories per portion`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Protein</td>
                    <td className="py-3 px-4 font-black">{food1.protein}g</td>
                    <td className="py-3 px-4 font-black">{food2.protein}g</td>
                    <td className="py-3 px-4 text-slate-500">
                      {food1.protein > food2.protein
                        ? `${food1.name} has ${(food1.protein - food2.protein).toFixed(1)}g more protein`
                        : `${food2.name} has ${(food2.protein - food1.protein).toFixed(1)}g more protein`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">Carbohydrates</td>
                    <td className="py-3 px-4 font-semibold">{food1.carbs}g</td>
                    <td className="py-3 px-4 font-semibold">{food2.carbs}g</td>
                    <td className="py-3 px-4 text-slate-400">Primary glucose source</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-teal-600 dark:text-teal-400">Dietary Fiber</td>
                    <td className="py-3 px-4 font-semibold">{food1.fiber}g</td>
                    <td className="py-3 px-4 font-semibold">{food2.fiber}g</td>
                    <td className="py-3 px-4 text-slate-500">Essential for gut microbiome &amp; satiety</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">Total Fat</td>
                    <td className="py-3 px-4 font-semibold">{food1.fat}g</td>
                    <td className="py-3 px-4 font-semibold">{food2.fat}g</td>
                    <td className="py-3 px-4 text-slate-400">Cellular &amp; hormone synthesis</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Calcium</td>
                    <td className="py-3 px-4 font-semibold">{food1.calcium} mg</td>
                    <td className="py-3 px-4 font-semibold">{food2.calcium} mg</td>
                    <td className="py-3 px-4 text-slate-400">Bone density &amp; muscle contraction</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Iron</td>
                    <td className="py-3 px-4 font-semibold">{food1.iron} mg</td>
                    <td className="py-3 px-4 font-semibold">{food2.iron} mg</td>
                    <td className="py-3 px-4 text-slate-400">Oxygen transportation in blood</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Potassium</td>
                    <td className="py-3 px-4 font-semibold">{food1.potassium} mg</td>
                    <td className="py-3 px-4 font-semibold">{food2.potassium} mg</td>
                    <td className="py-3 px-4 text-slate-400">Cardiovascular &amp; electrolyte balance</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Educational Perspective Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-950 dark:text-indigo-200 block mb-0.5">
                  Educational Takeaway: The Value of Dietary Diversity
                </strong>
                Nutrition is not a contest where one food "defeats" another. Different foods provide distinct amino acid profiles, fiber types, and micronutrients. Combining them (like pairing lentils with whole grains and leafy greens) creates a complete, resilient nutritional foundation.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BALANCED MEAL BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'meal-builder' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Food Groups to add */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Select Meal Components
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tap items to assemble your balanced plate:
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {MEAL_BUILDER_GROUPS.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>{group.name}</span>
                        <span className="text-[11px] text-slate-400">{group.recommendedPortion}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleAddMealItem(item)}
                            className="text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between group transition-all cursor-pointer"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {item.calories} kcal • {item.protein}g protein
                              </span>
                            </div>
                            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-slate-700 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Plate Summary */}
            <div className="lg:col-span-5 sticky top-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                    Your Assembled Plate
                  </h4>
                  <span className="text-xs text-slate-400">
                    {selectedMealItems.length} items selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMealItems([])}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Clear All"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopyMeal}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                    title="Copy Meal Plan"
                  >
                    {mealCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Total Macronutrient Dashboard */}
              <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-indigo-50/60 dark:bg-slate-800 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Calories</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {mealTotals.calories}
                  </span>
                  <span className="text-[9px] text-slate-400 block">kcal</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">Protein</span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                    {mealTotals.protein.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-400 block">g</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">Carbs</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {mealTotals.carbs.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-400 block">g</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 block">Fiber</span>
                  <span className="text-base font-black text-teal-700 dark:text-teal-300">
                    {mealTotals.fiber.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-400 block">g</span>
                </div>
              </div>

              {/* List of items on plate */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {selectedMealItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Your plate is empty. Tap items on the left to build your meal!
                  </div>
                ) : (
                  selectedMealItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.calories} kcal • {item.protein}g protein • {item.fiber}g fiber
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveMealItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Plate Model Educational Feedback */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                <strong className="block font-bold">Plate Balance Assessment:</strong>
                <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-300">
                  {mealTotals.protein >= 20 && mealTotals.fiber >= 8
                    ? '★ Excellent balance! High protein and ample fiber promote sustained satiety and steady energy.'
                    : 'Consider adding a leafy vegetable salad or lentil/paneer portion to increase fiber and micronutrient density.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NUTRITION LABEL GUIDE */}
      {/* ========================================================================= */}
      {activeTab === 'label-guide' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">
              Interactive Nutrition Facts Label Guide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Click any section on the label below to learn how food scientists and nutritionists decode packaged foods.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* The Interactive Nutrition Facts Box */}
              <div className="lg:col-span-6 bg-white text-black p-5 rounded-2xl border-4 border-black font-sans shadow-md">
                <h4 className="text-3xl font-black tracking-tight border-b-8 border-black pb-1">
                  Nutrition Facts
                </h4>

                {/* Servings */}
                <button
                  onClick={() => setActiveLabelSection('servings')}
                  className={`w-full text-left py-2 border-b border-black cursor-pointer transition-colors ${
                    activeLabelSection === 'servings' ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-semibold">8 servings per container</div>
                  <div className="flex justify-between font-black text-sm">
                    <span>Serving size</span>
                    <span>2/3 cup (55g)</span>
                  </div>
                </button>

                {/* Calories */}
                <button
                  onClick={() => setActiveLabelSection('calories')}
                  className={`w-full text-left py-2 border-b-4 border-black cursor-pointer transition-colors ${
                    activeLabelSection === 'calories' ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-black">Amount per serving</div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black">Calories</span>
                    <span className="text-4xl font-black">230</span>
                  </div>
                </button>

                {/* Daily Value Header */}
                <button
                  onClick={() => setActiveLabelSection('dailyValue')}
                  className={`w-full text-right py-1 border-b border-black text-[11px] font-bold cursor-pointer ${
                    activeLabelSection === 'dailyValue' ? 'bg-indigo-100' : 'hover:bg-slate-100'
                  }`}
                >
                  % Daily Value*
                </button>

                {/* Total Fat */}
                <button
                  onClick={() => setActiveLabelSection('fat')}
                  className={`w-full text-left py-1.5 border-b border-black text-xs cursor-pointer ${
                    activeLabelSection === 'fat' ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>Total Fat 8g</span>
                    <span>10%</span>
                  </div>
                  <div className="pl-4 text-[11px] text-slate-700 flex justify-between">
                    <span>Saturated Fat 1g</span>
                    <span>5%</span>
                  </div>
                  <div className="pl-4 text-[11px] text-slate-700">
                    Trans Fat 0g
                  </div>
                </button>

                {/* Sodium */}
                <button
                  onClick={() => setActiveLabelSection('sodium')}
                  className={`w-full text-left py-1.5 border-b border-black text-xs cursor-pointer ${
                    activeLabelSection === 'sodium' ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>Sodium 160mg</span>
                    <span>7%</span>
                  </div>
                </button>

                {/* Carbohydrates */}
                <button
                  onClick={() => setActiveLabelSection('carbs')}
                  className={`w-full text-left py-1.5 border-b border-black text-xs cursor-pointer ${
                    activeLabelSection === 'carbs' ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>Total Carbohydrate 37g</span>
                    <span>13%</span>
                  </div>
                  <div className="pl-4 text-[11px] text-slate-700 flex justify-between font-semibold">
                    <span>Dietary Fiber 4g</span>
                    <span>14%</span>
                  </div>
                  <div className="pl-4 text-[11px] text-slate-700 flex justify-between">
                    <span>Total Sugars 12g</span>
                    <span></span>
                  </div>
                  <div className="pl-8 text-[10px] text-slate-600 flex justify-between">
                    <span>Includes 10g Added Sugars</span>
                    <span>20%</span>
                  </div>
                </button>

                {/* Protein */}
                <button
                  onClick={() => setActiveLabelSection('protein')}
                  className={`w-full text-left py-1.5 border-b-8 border-black text-xs cursor-pointer ${
                    activeLabelSection === 'protein' ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>Protein 3g</span>
                    <span></span>
                  </div>
                </button>

                {/* Micronutrients footnote */}
                <div className="text-[10px] pt-2 space-y-1 text-slate-700">
                  <div className="flex justify-between"><span>Vitamin D 2mcg</span><span>10%</span></div>
                  <div className="flex justify-between"><span>Calcium 260mg</span><span>20%</span></div>
                  <div className="flex justify-between"><span>Iron 8mg</span><span>45%</span></div>
                  <div className="flex justify-between"><span>Potassium 240mg</span><span>6%</span></div>
                </div>
              </div>

              {/* Detail Explanation Panel */}
              <div className="lg:col-span-6 space-y-4">
                {labelSectionsInfo[activeLabelSection] && (
                  <div className="bg-slate-50 dark:bg-slate-800/70 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Label Deep-Dive
                    </span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {labelSectionsInfo[activeLabelSection].title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {labelSectionsInfo[activeLabelSection].explanation}
                    </p>

                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
                      <strong className="block font-bold">Practical Advice:</strong>
                      <p className="leading-relaxed">
                        {labelSectionsInfo[activeLabelSection].tip}
                      </p>
                    </div>
                  </div>
                )}

                {/* 5 / 20 Quick Rule Banner */}
                <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 space-y-2">
                  <span className="font-extrabold flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" /> The Golden 5/20 Rule
                  </span>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-800">
                      <span className="font-bold text-amber-700 dark:text-amber-400 block">5% DV or LESS</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">Aim for low % in Saturated Fat, Sodium &amp; Added Sugar.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-800">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block">20% DV or MORE</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">Aim for high % in Fiber, Calcium, Iron, and Vitamin D.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: LEARN NUTRITION (ARTICLES) */}
      {/* ========================================================================= */}
      {activeTab === 'articles' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sidebar Article List */}
            <div className="lg:col-span-4 space-y-2.5">
              {NUTRITION_ARTICLES.map((art) => {
                const isSelected = selectedArticleId === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 opacity-80">
                      <span>{art.category}</span>
                      <span>{art.readTime}</span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm tracking-tight leading-snug">
                      {art.title}
                    </h4>
                  </button>
                );
              })}
            </div>

            {/* Main Reader View */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                  <span>{selectedArticle.category}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedArticle.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed italic">
                  {selectedArticle.summary}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                {selectedArticle.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {sec.heading}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {sec.content}
                    </p>
                    {sec.points && (
                      <ul className="space-y-1.5 pl-2 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {sec.points.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MEDICAL & EDUCATIONAL DISCLAIMER FOOTNOTE */}
      <div className="p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3.5 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">
            General Educational &amp; Nutritional Notice
          </strong>
          NAVIKO Nutrition Science is designed strictly for nutritional education, dietary literacy, and reference exploration. It does not provide medical diagnosis, therapeutic treatment plans, or individual medical nutrition therapy (MNT). Individuals with medical conditions, diabetes, renal diseases, food allergies, or pregnant/lactating status should consult a registered dietitian (RD) or physician.
        </div>
      </div>
    </div>
  );
};
