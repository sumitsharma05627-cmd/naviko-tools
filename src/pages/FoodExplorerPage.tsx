import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Check,
  Star,
  Info,
  Apple,
  Sparkles,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Layers,
  Heart,
  X,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { FOODS_DATABASE, FoodItem } from '../data/nutritionData';
import { useSEO, CANONICAL_DOMAIN } from '../utils/seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';

interface FoodExplorerPageProps {
  onNavigate: (path: string) => void;
}

export const FoodExplorerPage: React.FC<FoodExplorerPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('naviko_fav_foods');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [logNotification, setLogNotification] = useState<string | null>(null);

  useSEO({
    title: 'Indian Food Nutrition Explorer — ICMR-NIN Sourced | NAVIKO',
    description: 'Explore calories, protein, carbs, fats, fiber, and micronutrients for authentic Indian staple foods. ICMR-NIN and USDA referenced with serving sizes.',
    canonical: '/food-explorer',
    robots: 'index, follow',
    ogType: 'website'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const toggleFavorite = (foodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(foodId)
      ? favorites.filter((id) => id !== foodId)
      : [...favorites, foodId];
    setFavorites(updated);
    try {
      localStorage.setItem('naviko_fav_foods', JSON.stringify(updated));
    } catch {}
  };

  const handleAddToMealLog = (food: FoodItem, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner', multiplier: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `naviko_meal_log_${today}`;
      const existingRaw = localStorage.getItem(storageKey);
      const log = existingRaw ? JSON.parse(existingRaw) : { breakfast: [], lunch: [], snack: [], dinner: [] };

      const entry = {
        id: `${food.id}-${Date.now()}`,
        foodId: food.id,
        name: food.name,
        servingDesc: multiplier === 1 ? food.servingDesc : `${multiplier}x ${food.servingDesc}`,
        grams: Math.round(food.servingG * multiplier),
        calories: Math.round(food.calories * multiplier),
        protein: +(food.protein * multiplier).toFixed(1),
        carbs: +(food.carbs * multiplier).toFixed(1),
        fat: +(food.fat * multiplier).toFixed(1),
        fiber: +(food.fiber * multiplier).toFixed(1),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (!log[mealType]) log[mealType] = [];
      log[mealType].push(entry);
      localStorage.setItem(storageKey, JSON.stringify(log));

      // Dispatch storage event so HabitTracker updates dynamically
      window.dispatchEvent(new Event('naviko:meal-log-updated'));

      setLogNotification(`Added ${multiplier}x ${food.name} to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}!`);
      setTimeout(() => setLogNotification(null), 3500);
    } catch {
      setLogNotification('Could not save to local log.');
      setTimeout(() => setLogNotification(null), 3500);
    }
  };

  const filteredFoods = useMemo(() => {
    return FOODS_DATABASE.filter((food) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.hindiName && food.hindiName.includes(searchQuery)) ||
        food.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || food.category === selectedCategory;
      const matchesDiet = selectedDiet === 'all' || food.dietaryType === selectedDiet;

      return matchesSearch && matchesCat && matchesDiet;
    });
  }, [searchQuery, selectedCategory, selectedDiet]);

  const categories = [
    { id: 'all', label: 'All Foods' },
    { id: 'grain', label: 'Grains & Rotis' },
    { id: 'protein', label: 'Proteins & Dals' },
    { id: 'dairy', label: 'Dairy & Curd' },
    { id: 'prepared', label: 'Prepared Dishes' },
    { id: 'vegetable', label: 'Vegetables' },
    { id: 'fruit', label: 'Fruits' },
    { id: 'nuts_seeds', label: 'Nuts & Seeds' }
  ];

  const diets = [
    { id: 'all', label: 'All Diets' },
    { id: 'vegan', label: '100% Vegan' },
    { id: 'veg', label: 'Vegetarian' },
    { id: 'non-veg', label: 'Non-Vegetarian' }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] text-[#16231C] dark:text-[#E8F0EC] transition-colors pb-20">
      <BreadcrumbNavigation
        items={[
          { label: 'Home', path: '/' },
          { label: 'Nutrition', path: '/food-explorer', active: true }
        ]}
        onNavigate={onNavigate}
      />

      {/* Floating Notification */}
      {logNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#2D6A4F] animate-fade-in text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{logNotification}</span>
          <button
            onClick={() => onNavigate('/habit-tracker')}
            className="underline font-bold hover:text-emerald-200 ml-2 cursor-pointer"
          >
            View Log →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] mb-2">
            <span>Verified Nutritional Science</span>
            <span aria-hidden="true">·</span>
            <span>ICMR-NIN &amp; USDA Referenced</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16231C] dark:text-white tracking-tight">
            Indian Food Nutrition Explorer
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
            Search verified calories, protein, carbohydrates, dietary fiber, and micronutrients for everyday Indian rotis, lentils, meals, and snacks. Pure client-side search with zero external tracking.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-4 sm:p-6 shadow-xs mb-8 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8E82]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name (e.g., Roti, Moong Dal, Idli, Paneer, Chana, Amla)..."
              className="w-full pl-12 pr-10 py-3.5 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-2xl border border-[#D5CCC0] dark:border-[#2B4637] text-sm text-[#16231C] dark:text-white placeholder-[#7A8E82] focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-[#52B788]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#7A8E82] hover:text-[#16231C] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs (Interactive Segmented Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#1B4332] text-white dark:bg-[#2D6A4F]'
                    : 'bg-[#F2ECE4] dark:bg-[#1A2E23] text-[#4D6156] dark:text-[#9FB7A9] hover:bg-[#E8E0D5] dark:hover:bg-[#233B2E]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Dietary Preferences (Interactive Segmented Buttons) */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#F2ECE4] dark:border-[#22382C] text-xs">
            <span className="text-[#6C8074] dark:text-[#8AA394] font-medium mr-1">Dietary Filter:</span>
            {diets.map((diet) => (
              <button
                key={diet.id}
                onClick={() => setSelectedDiet(diet.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedDiet === diet.id
                    ? 'bg-[#C26347] text-white'
                    : 'bg-transparent text-[#4D6156] dark:text-[#9FB7A9] hover:bg-[#F2ECE4] dark:hover:bg-[#1A2E23]'
                }`}
              >
                {diet.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter & Citation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 text-xs text-[#586A60] dark:text-[#8FA799]">
          <div>
            Showing <strong className="text-[#16231C] dark:text-white">{filteredFoods.length}</strong> authenticated Indian food items
          </div>
          <div className="text-[11px]">
            Reference: ICMR-NIN Indian Food Composition Tables (IFCT) &amp; USDA Standard Database
          </div>
        </div>

        {/* Foods Grid */}
        {filteredFoods.length === 0 ? (
          <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9F1EC] dark:bg-[#1A2E23] text-[#1B4332] dark:text-[#52B788] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#16231C] dark:text-white">
              No matching Indian food found
            </h3>
            <p className="text-xs sm:text-sm text-[#586A60] dark:text-[#8FA799] leading-relaxed">
              We couldn’t find "{searchQuery}". Try searching for staple terms like "roti", "dal", "paneer", "dosa", or clear the active category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDiet('all');
              }}
              className="px-4 py-2 bg-[#1B4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map((food) => {
              const isFav = favorites.includes(food.id);
              return (
                <div
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                    setServingMultiplier(1);
                  }}
                  className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 hover:border-[#1B4332] dark:hover:border-[#52B788] transition-all flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div>
                    {/* Header: Name, Hindi, Favorite */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-base font-bold text-[#16231C] dark:text-white group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors">
                          {food.name}
                        </h3>
                        {food.hindiName && (
                          <div className="text-xs text-[#586A60] dark:text-[#8FA799] mt-0.5 font-medium">
                            {food.hindiName}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => toggleFavorite(food.id, e)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isFav
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-[#9FB7A9] hover:text-[#16231C] dark:hover:text-white'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Metadata line (Clean unboxed text) */}
                    <div className="flex items-center gap-2 text-xs text-[#586A60] dark:text-[#8FA799] mb-4">
                      <span>{food.servingDesc}</span>
                      <span aria-hidden="true">·</span>
                      <span>{food.servingG}g</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{food.dietaryType}</span>
                    </div>

                    {/* Nutritional Summary Grid */}
                    <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] text-center mb-4">
                      <div>
                        <div className="text-[10px] text-[#7A8E82] uppercase tracking-wider font-semibold">Calories</div>
                        <div className="text-sm font-black text-[#16231C] dark:text-white font-mono mt-0.5">
                          {food.calories}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#7A8E82] uppercase tracking-wider font-semibold">Protein</div>
                        <div className="text-sm font-black text-[#1B4332] dark:text-[#52B788] font-mono mt-0.5">
                          {food.protein}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#7A8E82] uppercase tracking-wider font-semibold">Carbs</div>
                        <div className="text-sm font-black text-[#6B5A4E] dark:text-[#C5B3A5] font-mono mt-0.5">
                          {food.carbs}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#7A8E82] uppercase tracking-wider font-semibold">Fats</div>
                        <div className="text-sm font-black text-[#C26347] font-mono mt-0.5">
                          {food.fat}g
                        </div>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <ul className="space-y-1 text-xs text-[#4D6156] dark:text-[#9FB7A9]">
                      {food.highlights.slice(0, 2).map((hl, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#2D6A4F] dark:text-[#52B788] font-bold">✓</span>
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#F2ECE4] dark:border-[#22382C] flex items-center justify-between text-xs font-semibold text-[#1B4332] dark:text-[#52B788]">
                    <span>View Detailed Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Modal Drawer */}
        {selectedFood && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-[#F2ECE4] dark:border-[#22382C] pb-4">
                <div>
                  <div className="text-xs text-[#2D6A4F] dark:text-[#52B788] font-semibold mb-1">
                    Nutritional Factsheet · ICMR-NIN Referenced
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#16231C] dark:text-white">
                    {selectedFood.name}
                  </h2>
                  {selectedFood.hindiName && (
                    <div className="text-sm text-[#586A60] dark:text-[#8FA799]">
                      {selectedFood.hindiName}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedFood(null)}
                  className="p-2 rounded-xl text-[#7A8E82] hover:bg-[#F2ECE4] dark:hover:bg-[#1A2E23] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Serving Size Adjuster */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-semibold block text-[#16231C] dark:text-white">Serving Unit:</span>
                  <span className="text-[#586A60] dark:text-[#8FA799]">
                    {selectedFood.servingDesc} ({selectedFood.servingG * servingMultiplier}g)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7A8E82]">Quantity:</span>
                  <div className="flex items-center gap-1 bg-white dark:bg-[#13221A] p-1 rounded-xl border border-[#D5CCC0] dark:border-[#2B4637]">
                    {[0.5, 1, 2, 3].map((mult) => (
                      <button
                        key={mult}
                        onClick={() => setServingMultiplier(mult)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          servingMultiplier === mult
                            ? 'bg-[#1B4332] text-white'
                            : 'text-[#4D6156] dark:text-[#9FB7A9] hover:bg-[#F2ECE4] dark:hover:bg-[#1A2E23]'
                        }`}
                      >
                        {mult}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Macronutrient Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23]">
                  <div className="text-[11px] text-[#7A8E82] font-semibold">Calories</div>
                  <div className="text-lg font-black text-[#16231C] dark:text-white font-mono mt-0.5">
                    {Math.round(selectedFood.calories * servingMultiplier)} kcal
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23]">
                  <div className="text-[11px] text-[#7A8E82] font-semibold">Protein</div>
                  <div className="text-lg font-black text-[#1B4332] dark:text-[#52B788] font-mono mt-0.5">
                    {(selectedFood.protein * servingMultiplier).toFixed(1)}g
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23]">
                  <div className="text-[11px] text-[#7A8E82] font-semibold">Carbs</div>
                  <div className="text-lg font-black text-[#6B5A4E] dark:text-[#C5B3A5] font-mono mt-0.5">
                    {(selectedFood.carbs * servingMultiplier).toFixed(1)}g
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23]">
                  <div className="text-[11px] text-[#7A8E82] font-semibold">Fats</div>
                  <div className="text-lg font-black text-[#C26347] font-mono mt-0.5">
                    {(selectedFood.fat * servingMultiplier).toFixed(1)}g
                  </div>
                </div>
              </div>

              {/* Micronutrients Breakdown */}
              <div className="border border-[#E8E2D9] dark:border-[#22382C] rounded-2xl p-4 text-xs space-y-2">
                <div className="font-bold text-[#16231C] dark:text-white mb-2">
                  Detailed Micronutrients &amp; Minerals
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[#4D6156] dark:text-[#9FB7A9]">
                  <div>Dietary Fiber: <strong className="text-[#16231C] dark:text-white font-mono">{(selectedFood.fiber * servingMultiplier).toFixed(1)}g</strong></div>
                  <div>Natural Sugar: <strong className="text-[#16231C] dark:text-white font-mono">{(selectedFood.sugar * servingMultiplier).toFixed(1)}g</strong></div>
                  <div>Calcium: <strong className="text-[#16231C] dark:text-white font-mono">{Math.round(selectedFood.calcium * servingMultiplier)} mg</strong></div>
                  <div>Iron: <strong className="text-[#16231C] dark:text-white font-mono">{(selectedFood.iron * servingMultiplier).toFixed(1)} mg</strong></div>
                  <div>Potassium: <strong className="text-[#16231C] dark:text-white font-mono">{Math.round(selectedFood.potassium * servingMultiplier)} mg</strong></div>
                  <div>Vitamin C: <strong className="text-[#16231C] dark:text-white font-mono">{(selectedFood.vitaminC * servingMultiplier).toFixed(1)} mg</strong></div>
                  <div>Sodium: <strong className="text-[#16231C] dark:text-white font-mono">{Math.round(selectedFood.sodium * servingMultiplier)} mg</strong></div>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#16231C] dark:text-white">
                  Nutritional Significance
                </div>
                <ul className="space-y-1.5 text-xs text-[#4D6156] dark:text-[#9FB7A9]">
                  {selectedFood.highlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#2D6A4F] dark:text-[#52B788] font-bold">✓</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add to Daily Meal Log Action */}
              <div className="pt-4 border-t border-[#F2ECE4] dark:border-[#22382C] space-y-3">
                <div className="text-xs font-bold text-[#16231C] dark:text-white">
                  Add to Today's Meal Log:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((mealType) => (
                    <button
                      key={mealType}
                      onClick={() => handleAddToMealLog(selectedFood, mealType, servingMultiplier)}
                      className="py-2.5 px-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="capitalize">{mealType}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
