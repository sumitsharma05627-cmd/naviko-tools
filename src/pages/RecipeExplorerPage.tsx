import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Clock,
  Flame,
  Search,
  Filter,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
  Leaf,
  PlusCircle,
  X,
  Share2,
  DollarSign,
  ChefHat,
  ArrowRight
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { INDIAN_RECIPES_DATABASE, IndianRecipe } from '../data/nutritionData';

interface RecipeExplorerPageProps {
  onNavigate: (path: string) => void;
}

export const RecipeExplorerPage: React.FC<RecipeExplorerPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [maxTime, setMaxTime] = useState<number>(60);
  const [selectedRecipe, setSelectedRecipe] = useState<IndianRecipe | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);
  const [selectedMealForLog, setSelectedMealForLog] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch');
  const [logServings, setLogServings] = useState<number>(1);

  useSEO({
    title: 'Healthy Indian Recipes — Evidence-Backed & Ayurvedic Nutrition | NAVIKO',
    description: 'Explore wholesome, easy-to-cook Indian recipes with precise macronutrients, Ayurvedic digestive qualities (Ahara Vidhi), ingredient substitutions, and 1-click meal logging.',
    canonical: '/recipes',
    robots: 'index, follow',
    ogType: 'website'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    try {
      const stored = localStorage.getItem('naviko_saved_recipes');
      if (stored) {
        setSavedRecipeIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSaveRecipe = (recipeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (savedRecipeIds.includes(recipeId)) {
      updated = savedRecipeIds.filter((id) => id !== recipeId);
    } else {
      updated = [...savedRecipeIds, recipeId];
    }
    setSavedRecipeIds(updated);
    try {
      localStorage.setItem('naviko_saved_recipes', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLogRecipeToMeal = (recipe: IndianRecipe) => {
    const today = new Date().toISOString().split('T')[0];
    const logKey = `naviko_meal_log_${today}`;
    try {
      const existing = localStorage.getItem(logKey);
      const parsed = existing ? JSON.parse(existing) : { breakfast: [], lunch: [], dinner: [], snacks: [] };

      const mealItem = {
        id: `${recipe.id}_${Date.now()}`,
        name: recipe.name,
        hindiName: recipe.hindiName,
        servingDesc: `${logServings} serving(s) (${recipe.name})`,
        servingG: (recipe.nutritionPerServing.calories > 0 ? 150 : 100) * logServings,
        calories: Math.round(recipe.nutritionPerServing.calories * logServings),
        protein: +(recipe.nutritionPerServing.protein * logServings).toFixed(1),
        carbs: +(recipe.nutritionPerServing.carbs * logServings).toFixed(1),
        fat: +(recipe.nutritionPerServing.fat * logServings).toFixed(1),
        fiber: +(recipe.nutritionPerServing.fiber * logServings).toFixed(1),
        loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (!parsed[selectedMealForLog]) {
        parsed[selectedMealForLog] = [];
      }
      parsed[selectedMealForLog].push(mealItem);
      localStorage.setItem(logKey, JSON.stringify(parsed));
      window.dispatchEvent(new Event('naviko_meals_updated'));

      setLoggedNotification(`Added "${recipe.name}" (${logServings} serv) to today's ${selectedMealForLog}!`);
      setTimeout(() => setLoggedNotification(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter recipes
  const filteredRecipes = INDIAN_RECIPES_DATABASE.filter((recipe) => {
    const totalTime = recipe.prepTimeMins + recipe.cookTimeMins;
    const matchesSearch =
      searchQuery.trim() === '' ||
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.hindiName.includes(searchQuery) ||
      recipe.ingredients.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesDiet = selectedDiet === 'all' || recipe.dietType === selectedDiet;
    const matchesTime = totalTime <= maxTime;

    return matchesSearch && matchesCategory && matchesDiet && matchesTime;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] text-[#16231C] dark:text-[#E8F0EC] transition-colors pb-24">
      <BreadcrumbNavigation
        items={[
          { label: 'Home', path: '/' },
          { label: 'Nutrition', path: '/food-explorer' },
          { label: 'Healthy Recipes', path: '/recipes', active: true }
        ]}
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Toast Notification */}
        {loggedNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#2D6A4F] animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Check className="w-5 h-5 text-[#52B788]" />
            <span className="text-xs sm:text-sm font-medium">{loggedNotification}</span>
            <button
              onClick={() => onNavigate('/meal-planner')}
              className="ml-2 underline text-xs font-bold text-[#52B788] hover:text-white cursor-pointer"
            >
              View Log
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="max-w-3xl mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] mb-2">
            <span>Wholesome Indian Kitchen</span>
            <span aria-hidden="true">·</span>
            <span>Science Meets Ayurvedic Agni</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16231C] dark:text-white tracking-tight">
            Evidence-Backed Indian Recipes
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
            Nutritious, authentic Indian meals engineered for high bioavailability, balanced blood sugar, and gut comfort. Complete with verified macro breakdowns, substitutions, and Ayurvedic digestive qualities.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-4 sm:p-6 shadow-xs mb-8 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8E82]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes or ingredients (e.g., Moong Dal, Palak, Besan, Ragi, Sattu, Paneer)..."
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

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#F2ECE4] dark:border-[#1E3326]">
            {/* Meal Category Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All Meals' },
                { id: 'breakfast', label: 'Breakfast' },
                { id: 'lunch', label: 'Lunch' },
                { id: 'dinner', label: 'Dinner' },
                { id: 'snack', label: 'Snacks' },
                { id: 'beverage', label: 'Beverages' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#1B4332] text-white dark:bg-[#2D6A4F]'
                      : 'bg-[#F2ECE4] dark:bg-[#1A2E23] text-[#4D6156] dark:text-[#9FB7A9] hover:bg-[#E8E0D5] dark:hover:bg-[#233B2E]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Diet Type & Max Time */}
            <div className="flex items-center gap-3 text-xs">
              <select
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
                className="py-1.5 px-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#D5CCC0] dark:border-[#2B4637] text-[#16231C] dark:text-white focus:outline-hidden"
              >
                <option value="all">All Dietary Types</option>
                <option value="veg">Vegetarian</option>
                <option value="vegan">100% Vegan</option>
              </select>

              <select
                value={maxTime}
                onChange={(e) => setMaxTime(Number(e.target.value))}
                className="py-1.5 px-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1A2E23] border border-[#D5CCC0] dark:border-[#2B4637] text-[#16231C] dark:text-white focus:outline-hidden"
              >
                <option value={60}>Time: Any duration</option>
                <option value={15}>Under 15 minutes</option>
                <option value={25}>Under 25 minutes</option>
                <option value={35}>Under 35 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const isSaved = savedRecipeIds.includes(recipe.id);
            const totalTime = recipe.prepTimeMins + recipe.cookTimeMins;

            return (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] overflow-hidden hover:border-[#1B4332] dark:hover:border-[#52B788] transition-all flex flex-col justify-between group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="p-6 space-y-4">
                  {/* Top row: tags & save */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                      <span className="px-2 py-0.5 rounded-lg bg-[#E9F1EC] dark:bg-[#1B3326] text-[#1B4332] dark:text-[#52B788] uppercase tracking-wide">
                        {recipe.category}
                      </span>
                      <span className="text-[#7A8E82]">·</span>
                      <span className="text-[#586A60] dark:text-[#8FA799]">
                        {recipe.dietType === 'vegan' ? 'Vegan' : 'Vegetarian'}
                      </span>
                      <span className="text-[#7A8E82]">·</span>
                      <span className="text-[#586A60] dark:text-[#8FA799]">
                        {recipe.regionalCuisine}
                      </span>
                    </div>

                    <button
                      onClick={(e) => toggleSaveRecipe(recipe.id, e)}
                      title={isSaved ? 'Saved to favorites' : 'Save recipe'}
                      className="text-[#7A8E82] hover:text-[#1B4332] dark:hover:text-[#52B788] p-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-5 h-5 text-[#2D6A4F] dark:text-[#52B788] fill-current" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Title & Hindi name */}
                  <div>
                    <h3 className="text-xl font-bold text-[#16231C] dark:text-white group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors leading-snug">
                      {recipe.name}
                    </h3>
                    <div className="text-xs font-medium text-[#586A60] dark:text-[#8FA799] mt-0.5">
                      {recipe.hindiName}
                    </div>
                  </div>

                  {/* Cooking meta */}
                  <div className="flex items-center gap-4 text-xs text-[#586A60] dark:text-[#8FA799]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{totalTime} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#C26347]" />
                      <span>{recipe.nutritionPerServing.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                      <span>{recipe.nutritionPerServing.protein}g protein</span>
                    </div>
                  </div>

                  {/* Ayurvedic digestive badge */}
                  <div className="p-3 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-2xl text-[11px] text-[#4D6156] dark:text-[#9FB7A9] space-y-1">
                    <div className="font-semibold text-[#1B4332] dark:text-[#52B788]">
                      {recipe.ayurvedicDigestiveQuality.guna}
                    </div>
                    <p className="line-clamp-2">
                      {recipe.ayurvedicDigestiveQuality.doshaEffect}
                    </p>
                  </div>

                  {/* Key ingredients preview */}
                  <div className="text-xs text-[#7A8E82] line-clamp-1">
                    <strong>Ingredients: </strong>
                    {recipe.ingredients.map((i) => i.name).join(', ')}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="p-4 bg-[#F8F5EE] dark:bg-[#16281F] border-t border-[#E8E2D9] dark:border-[#22382C] flex items-center justify-between text-xs font-semibold text-[#1B4332] dark:text-[#52B788]">
                  <span>View Recipe &amp; Substitutes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C]">
            <Utensils className="w-12 h-12 text-[#7A8E82] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#16231C] dark:text-white">
              No matching recipes found
            </h3>
            <p className="text-xs text-[#4D6156] dark:text-[#9FB7A9] mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or filters to view other wholesome Indian dishes.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDiet('all');
                setMaxTime(60);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#2D6A4F] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] mb-1">
                    <span>{selectedRecipe.regionalCuisine}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{selectedRecipe.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{selectedRecipe.dietType}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#16231C] dark:text-white">
                    {selectedRecipe.name}
                  </h2>
                  <div className="text-sm font-medium text-[#586A60] dark:text-[#8FA799] mt-0.5">
                    {selectedRecipe.hindiName}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="p-2 rounded-full hover:bg-[#F2ECE4] dark:hover:bg-[#1A2E23] text-[#7A8E82] hover:text-[#16231C] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nutrition Summary Grid */}
              <div className="grid grid-cols-5 gap-2 p-3 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-2xl text-center border border-[#E8E2D9] dark:border-[#2B4637]">
                <div>
                  <div className="text-xs text-[#7A8E82]">Calories</div>
                  <div className="text-sm sm:text-base font-black text-[#16231C] dark:text-white">
                    {selectedRecipe.nutritionPerServing.calories}
                  </div>
                  <div className="text-[10px] text-[#7A8E82]">kcal</div>
                </div>
                <div>
                  <div className="text-xs text-[#7A8E82]">Protein</div>
                  <div className="text-sm sm:text-base font-black text-[#2D6A4F] dark:text-[#52B788]">
                    {selectedRecipe.nutritionPerServing.protein}g
                  </div>
                  <div className="text-[10px] text-[#7A8E82]">per serving</div>
                </div>
                <div>
                  <div className="text-xs text-[#7A8E82]">Carbs</div>
                  <div className="text-sm sm:text-base font-black text-[#16231C] dark:text-white">
                    {selectedRecipe.nutritionPerServing.carbs}g
                  </div>
                  <div className="text-[10px] text-[#7A8E82]">complex</div>
                </div>
                <div>
                  <div className="text-xs text-[#7A8E82]">Fats</div>
                  <div className="text-sm sm:text-base font-black text-[#16231C] dark:text-white">
                    {selectedRecipe.nutritionPerServing.fat}g
                  </div>
                  <div className="text-[10px] text-[#7A8E82]">healthy lipids</div>
                </div>
                <div>
                  <div className="text-xs text-[#7A8E82]">Fiber</div>
                  <div className="text-sm sm:text-base font-black text-[#C26347]">
                    {selectedRecipe.nutritionPerServing.fiber}g
                  </div>
                  <div className="text-[10px] text-[#7A8E82]">dietary fiber</div>
                </div>
              </div>

              {/* 1-Click Add To Meal Log Strip */}
              <div className="p-4 bg-[#E9F1EC] dark:bg-[#16281F] rounded-2xl border border-[#B7D5C4] dark:border-[#223E30] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#1B4332] dark:text-[#52B788]">
                    Log to Tracker:
                  </span>
                  <select
                    value={selectedMealForLog}
                    onChange={(e: any) => setSelectedMealForLog(e.target.value)}
                    className="py-1 px-2.5 rounded-xl bg-white dark:bg-[#1A2E23] text-xs font-semibold text-[#16231C] dark:text-white border border-[#B7D5C4] dark:border-[#2B4637] focus:outline-hidden"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                  </select>

                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[#4D6156] dark:text-[#9FB7A9]">Servings:</span>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={logServings}
                      onChange={(e) => setLogServings(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 py-1 px-2 rounded-xl bg-white dark:bg-[#1A2E23] text-xs font-semibold text-center text-[#16231C] dark:text-white border border-[#B7D5C4] dark:border-[#2B4637]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleLogRecipeToMeal(selectedRecipe)}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log This Meal</span>
                </button>
              </div>

              {/* Ayurvedic Quality */}
              <div className="p-4 rounded-2xl bg-[#F8F5EE] dark:bg-[#1A2E23] border border-[#E8E2D9] dark:border-[#2B4637] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332] dark:text-[#52B788]">
                  <Leaf className="w-4 h-4" />
                  <span>Ayurvedic Digestive Quality (Ahara Vidhi)</span>
                </div>
                <div className="text-xs text-[#4D6156] dark:text-[#9FB7A9] space-y-1">
                  <div>
                    <strong>Guna (Quality): </strong>
                    <span>{selectedRecipe.ayurvedicDigestiveQuality.guna}</span>
                  </div>
                  <div>
                    <strong>Dosha Interaction: </strong>
                    <span>{selectedRecipe.ayurvedicDigestiveQuality.doshaEffect}</span>
                  </div>
                  <div>
                    <strong>Seasonal Advice: </strong>
                    <span>{selectedRecipe.ayurvedicDigestiveQuality.seasonalSuitability}</span>
                  </div>
                </div>
              </div>

              {/* Ingredients & Substitutions */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#16231C] dark:text-white flex items-center gap-2">
                  <span>Ingredients &amp; Substitutions</span>
                  <span className="text-xs font-normal text-[#7A8E82]">
                    ({selectedRecipe.servings} serving{selectedRecipe.servings > 1 ? 's' : ''})
                  </span>
                </h4>
                <div className="divide-y divide-[#F2ECE4] dark:divide-[#22382C] border border-[#E8E2D9] dark:border-[#22382C] rounded-2xl overflow-hidden bg-white dark:bg-[#13221A]">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-start justify-between gap-3">
                      <div>
                        <span className="font-semibold text-[#16231C] dark:text-white">
                          {ing.name}
                        </span>
                        {ing.notes && (
                          <div className="text-[11px] text-[#7A8E82] mt-0.5">{ing.notes}</div>
                        )}
                        {ing.substitute && (
                          <div className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] mt-0.5">
                            <strong>Sub: </strong>
                            {ing.substitute}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 font-medium text-[#4D6156] dark:text-[#9FB7A9] bg-[#FAF7F2] dark:bg-[#1A2E23] px-2 py-1 rounded-lg">
                        {ing.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#16231C] dark:text-white">
                  Step-by-Step Preparation
                </h4>
                <ol className="space-y-2.5">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] text-xs text-[#16231C] dark:text-white leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Nutrition Pro-Tip */}
              {selectedRecipe.tips && (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A2E23] border-l-4 border-[#1B4332] dark:border-[#52B788] text-xs text-[#4D6156] dark:text-[#9FB7A9]">
                  <strong className="text-[#16231C] dark:text-white">Nutrition Science Note: </strong>
                  {selectedRecipe.tips}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F2ECE4] dark:border-[#22382C]">
                <button
                  onClick={() => toggleSaveRecipe(selectedRecipe.id)}
                  className="flex items-center gap-2 text-xs font-bold text-[#4D6156] dark:text-[#9FB7A9] hover:text-[#16231C] dark:hover:text-white cursor-pointer"
                >
                  {savedRecipeIds.includes(selectedRecipe.id) ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] fill-current" />
                      <span>Saved in Favorites</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Save Recipe</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
