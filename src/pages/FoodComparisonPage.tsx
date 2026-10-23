import React, { useState, useMemo } from 'react';
import { 
  Scale, ArrowRight, Check, Plus, X, Info, Sparkles, 
  Apple, Award, ShieldCheck, ChevronDown, Flame, Utensils
} from 'lucide-react';
import { FOODS_DATABASE, FoodItem } from '../data/nutritionData';
import { useSEO } from '../utils/seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';

interface FoodComparisonPageProps {
  onNavigate: (path: string) => void;
}

export const FoodComparisonPage: React.FC<FoodComparisonPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Indian Food Comparison Tool | Calories, Protein & Nutrients | NAVIKO',
    description: 'Compare two or three Indian foods side-by-side (Roti vs Rice, Moong Dal vs Paneer, Poha vs Idli). Analyze protein, fiber, calories, and micronutrients per 100g or per serving.',
    canonical: '/food-compare',
    robots: 'index, follow',
    ogType: 'website'
  });

  // Selected foods (default: Whole Wheat Roti vs White Basmati Rice)
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([
    'whole-wheat-roti',
    'white-basmati-rice'
  ]);
  const [compareBasis, setCompareBasis] = useState<'per100g' | 'perServing'>('perServing');
  const [selectorOpenSlot, setSelectorOpenSlot] = useState<number | null>(null);
  const [foodSearch, setFoodSearch] = useState('');

  const selectedFoods = useMemo(() => {
    return selectedFoodIds
      .map(id => FOODS_DATABASE.find(f => f.id === id))
      .filter((f): f is FoodItem => Boolean(f));
  }, [selectedFoodIds]);

  const handleSelectFood = (slotIndex: number, foodId: string) => {
    const updated = [...selectedFoodIds];
    updated[slotIndex] = foodId;
    setSelectedFoodIds(updated);
    setSelectorOpenSlot(null);
    setFoodSearch('');
  };

  const handleAddSlot = () => {
    if (selectedFoodIds.length < 3) {
      const remaining = FOODS_DATABASE.find(f => !selectedFoodIds.includes(f.id));
      if (remaining) {
        setSelectedFoodIds([...selectedFoodIds, remaining.id]);
      }
    }
  };

  const handleRemoveSlot = (index: number) => {
    if (selectedFoodIds.length > 2) {
      setSelectedFoodIds(selectedFoodIds.filter((_, i) => i !== index));
    }
  };

  // Pre-configured comparison presets
  const presets = [
    { label: 'Roti vs. Rice', ids: ['whole-wheat-roti', 'white-basmati-rice'] },
    { label: 'Moong Dal vs. Paneer', ids: ['cooked-toor-dal', 'fresh-paneer'] },
    { label: 'Idli vs. Poha', ids: ['steamed-idli', 'cooked-poha'] },
    { label: 'Ragi vs. Wheat Roti', ids: ['ragi-roti', 'whole-wheat-roti'] },
    { label: 'Chaas vs. Desi Cow Milk', ids: ['spiced-buttermilk-chaas', 'cow-milk-boiled'] }
  ];

  // Helper to scale values based on compareBasis
  const getScaledNutrient = (food: FoodItem, key: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sugar' | 'sodium' | 'calcium' | 'iron' | 'potassium' | 'vitaminC') => {
    const val = food[key];
    if (compareBasis === 'perServing') {
      return val;
    }
    // Scale from serving to per 100g
    const multiplier = 100 / Math.max(1, food.servingG);
    return Math.round(val * multiplier * 10) / 10;
  };

  const filteredFoodsForModal = useMemo(() => {
    if (!foodSearch.trim()) return FOODS_DATABASE;
    const q = foodSearch.toLowerCase();
    return FOODS_DATABASE.filter(f => 
      f.name.toLowerCase().includes(q) || 
      (f.hindiName && f.hindiName.toLowerCase().includes(q))
    );
  }, [foodSearch]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <BreadcrumbNavigation
          items={[
            { label: 'Home', path: '/' },
            { label: 'Food Explorer', path: '/food-explorer' },
            { label: 'Food Comparison', path: '/food-compare' }
          ]}
          onNavigate={onNavigate}
        />

        {/* Header */}
        <header className="border-b border-stone-200 dark:border-stone-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-400 mb-1">
                Nutritional Diagnostics · Side-by-Side Analysis
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Indian Food Comparison Tool
              </h1>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
                Compare verified ICMR-NIN nutritional values, protein density, dietary fiber, and micronutrients across traditional staples.
              </p>
            </div>

            {/* Basis Toggle: Per Serving vs Per 100g */}
            <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setCompareBasis('perServing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  compareBasis === 'perServing'
                    ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Typical Serving
              </button>
              <button
                type="button"
                onClick={() => setCompareBasis('per100g')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  compareBasis === 'per100g'
                    ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Per 100g (Standardized)
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs">
            <span className="text-stone-500 font-medium">Popular comparisons:</span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedFoodIds(preset.ids)}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition text-[11px] font-medium"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </header>

        {/* Selected Foods Header Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-${selectedFoods.length} gap-4`}>
          {selectedFoods.map((food, slotIdx) => (
            <div
              key={food.id}
              className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm relative space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                    Food {slotIdx + 1}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                    {food.name}
                  </h3>
                  {food.hindiName && (
                    <span className="text-xs text-stone-500 font-normal">
                      {food.hindiName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectorOpenSlot(slotIdx)}
                    className="p-1.5 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                    title="Change food"
                  >
                    Change
                  </button>
                  {selectedFoods.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slotIdx)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                      title="Remove comparison slot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <span>Serving: <strong className="text-stone-800 dark:text-stone-200">{food.servingDesc} ({food.servingG}g)</strong></span>
                <span>·</span>
                <span className="capitalize">{food.dietaryType}</span>
              </div>
            </div>
          ))}

          {selectedFoods.length < 3 && (
            <button
              type="button"
              onClick={handleAddSlot}
              className="p-5 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-600 bg-stone-50 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:text-emerald-700 flex flex-col items-center justify-center transition gap-1.5 cursor-pointer min-h-[120px]"
            >
              <Plus className="w-5 h-5 text-emerald-700" />
              <span className="text-xs font-semibold">Add 3rd Food to Compare</span>
            </button>
          )}
        </div>

        {/* COMPARISON METRICS TABLE */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
          <div className="p-4 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
            <span>Nutritional Metric</span>
            <span>
              Comparing {compareBasis === 'perServing' ? 'Typical Portions' : 'Per 100 Grams (Raw/Cooked as listed)'}
            </span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
            
            {/* Calories */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition items-center">
              <div className="md:col-span-3 font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" /> Energy (Calories)
              </div>
              <div className="md:col-span-9 grid grid-cols-3 gap-4 font-mono font-bold text-sm">
                {selectedFoods.map(f => (
                  <div key={f.id} className="text-stone-900 dark:text-stone-100">
                    {getScaledNutrient(f, 'calories')} <span className="text-xs font-sans font-normal text-stone-500">kcal</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protein */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition items-center">
              <div className="md:col-span-3 font-semibold text-stone-900 dark:text-stone-100">
                Protein
              </div>
              <div className="md:col-span-9 grid grid-cols-3 gap-4 font-mono font-bold text-sm">
                {selectedFoods.map(f => (
                  <div key={f.id} className="text-emerald-700 dark:text-emerald-400">
                    {getScaledNutrient(f, 'protein')} <span className="text-xs font-sans font-normal text-stone-500">g</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carbohydrates */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition items-center">
              <div className="md:col-span-3 font-semibold text-stone-900 dark:text-stone-100">
                Carbohydrates
              </div>
              <div className="md:col-span-9 grid grid-cols-3 gap-4 font-mono font-bold text-sm">
                {selectedFoods.map(f => (
                  <div key={f.id} className="text-stone-800 dark:text-stone-200">
                    {getScaledNutrient(f, 'carbs')} <span className="text-xs font-sans font-normal text-stone-500">g</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Fiber */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition items-center">
              <div className="md:col-span-3 font-semibold text-stone-900 dark:text-stone-100">
                Dietary Fiber
              </div>
              <div className="md:col-span-9 grid grid-cols-3 gap-4 font-mono font-bold text-sm">
                {selectedFoods.map(f => (
                  <div key={f.id} className="text-stone-800 dark:text-stone-200">
                    {getScaledNutrient(f, 'fiber')} <span className="text-xs font-sans font-normal text-stone-500">g</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Fat */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition items-center">
              <div className="md:col-span-3 font-semibold text-stone-900 dark:text-stone-100">
                Total Fat
              </div>
              <div className="md:col-span-9 grid grid-cols-3 gap-4 font-mono font-bold text-sm">
                {selectedFoods.map(f => (
                  <div key={f.id} className="text-stone-800 dark:text-stone-200">
                    {getScaledNutrient(f, 'fat')} <span className="text-xs font-sans font-normal text-stone-500">g</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calcium */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition items-center">
              <div className="md:col-span-3 text-stone-600 dark:text-stone-300">
                Calcium
              </div>
              <div className="md:col-span-9 grid grid-cols-3 gap-4 font-mono text-xs">
                {selectedFoods.map(f => (
                  <div key={f.id} className="text-stone-700 dark:text-stone-300">
                    {getScaledNutrient(f, 'calcium')} mg
                  </div>
                ))}
              </div>
            </div>

            {/* Iron */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition items-center">
              <div className="md:col-span-3 text-stone-600 dark:text-stone-300">
                Iron
              </div>
              <div className="md:col-span-9 grid grid-cols-3 gap-4 font-mono text-xs">
                {selectedFoods.map(f => (
                  <div key={f.id} className="text-stone-700 dark:text-stone-300">
                    {getScaledNutrient(f, 'iron')} mg
                  </div>
                ))}
              </div>
            </div>

            {/* Potassium */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition items-center">
              <div className="md:col-span-3 text-stone-600 dark:text-stone-300">
                Potassium
              </div>
              <div className="md:col-span-9 grid grid-cols-3 gap-4 font-mono text-xs">
                {selectedFoods.map(f => (
                  <div key={f.id} className="text-stone-700 dark:text-stone-300">
                    {getScaledNutrient(f, 'potassium')} mg
                  </div>
                ))}
              </div>
            </div>

            {/* Key Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-stone-50/60 dark:bg-stone-800/40 items-start">
              <div className="md:col-span-3 font-semibold text-stone-900 dark:text-stone-100">
                Nutritional Highlights
              </div>
              <div className="md:col-span-9 grid grid-cols-3 gap-4 text-xs">
                {selectedFoods.map(f => (
                  <ul key={f.id} className="space-y-1 list-disc list-inside text-stone-600 dark:text-stone-300">
                    {f.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* BALANCED NUTRITIONAL VERDICT & NO-SHAME PRINCIPLE */}
        <section className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Balanced Nutritional Perspective
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            In nutrition science, <strong>no single food is universally "best" or "toxic"</strong>. For instance, while whole wheat roti contains higher dietary fiber and protein than white rice, white rice is significantly easier on sensitive digestion during illness (Laghu digestive quality) and has near-zero anti-nutritional phytic acid. The right choice depends on your personal metabolic activity, digestive strength, and the composition of your overall meal.
          </p>
          <div className="pt-2 text-xs text-stone-500 dark:text-stone-400 flex flex-wrap gap-4 border-t border-stone-100 dark:border-stone-800">
            <span>Source: ICMR-NIN Indian Food Composition Tables (IFCT)</span>
            <span>·</span>
            <span>Values vary with cooking techniques and crop seasons</span>
          </div>
        </section>

      </div>

      {/* FOOD SELECTOR MODAL */}
      {selectorOpenSlot !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Choose Food for Slot {selectorOpenSlot + 1}
              </h3>
              <button
                type="button"
                onClick={() => setSelectorOpenSlot(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              placeholder="Search Indian foods (Roti, Poha, Dal, Paneer)..."
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs outline-none focus:border-emerald-600"
              autoFocus
            />

            <div className="overflow-y-auto space-y-1 flex-1 pr-1">
              {filteredFoodsForModal.map(food => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => handleSelectFood(selectorOpenSlot, food.id)}
                  className="w-full p-2.5 rounded-xl text-left hover:bg-stone-50 dark:hover:bg-stone-800/80 transition flex items-center justify-between border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                >
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {food.name} {food.hindiName && <span className="font-normal text-stone-500">({food.hindiName})</span>}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {food.servingDesc} ({food.servingG}g) · {food.calories} kcal · {food.protein}g protein
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400 -rotate-90" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
