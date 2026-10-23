import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Sparkles,
  RefreshCw,
  Printer,
  Bookmark,
  CheckCircle2,
  Calendar,
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Copy,
  Sliders,
  Check
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import {
  DietaryPreference,
  MealType,
  MealOption,
  COMMON_ALLERGENS,
  COMMON_DISLIKES,
  FOOD_STYLES
} from '../data/dietPlanData';

interface MealPlannerPageProps {
  onNavigate: (path: string) => void;
}

interface PlannedMeal {
  mealType: MealType;
  title: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: string[];
  alternatives: string[];
  tip: string;
}

export const MealPlannerPage: React.FC<MealPlannerPageProps> = ({ onNavigate }) => {
  // Input states
  const [dietaryPref, setDietaryPref] = useState<DietaryPreference>('vegetarian');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [regionalStyle, setRegionalStyle] = useState<string>('pan-indian');
  const [cookingTime, setCookingTime] = useState<'quick' | 'standard' | 'weekend'>('standard');
  const [budgetLevel, setBudgetLevel] = useState<'budget' | 'everyday' | 'high_protein'>('everyday');
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [healthGoal, setHealthGoal] = useState<'balanced' | 'energy' | 'digestion' | 'weight'>('balanced');

  // Generated Plan State
  const [currentPlan, setCurrentPlan] = useState<PlannedMeal[]>([]);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});

  useSEO({
    title: 'Smart Indian Meal Planner — Practical, Affordable & Balanced | NAVIKO',
    description: 'Build customized Indian daily meal plans based on dietary preferences, allergies, regional styles, and budget. Includes grocery checklist and instant substitutions.',
    canonical: '/meal-planner',
    robots: 'index, follow',
    ogType: 'website'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    generatePlan();
  }, []);

  const toggleAllergen = (id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const generatePlan = () => {
    // Generate tailored meals according to dietary preferences
    const hasDairy = !selectedAllergens.includes('dairy') && dietaryPref !== 'vegan';
    const isVegan = dietaryPref === 'vegan';
    const isJain = dietaryPref === 'jain';

    let breakfast: PlannedMeal;
    let lunch: PlannedMeal;
    let snack: PlannedMeal;
    let dinner: PlannedMeal;

    if (regionalStyle === 'south-indian') {
      breakfast = {
        mealType: 'breakfast',
        title: 'Morning Fuel',
        name: isVegan ? 'Steamed Idlis with Coconut Chutney & Vegetable Sambar' : 'Steamed Idlis with Fresh Coconut Chutney & Toor Dal Sambar',
        portion: '3 medium idlis + 1 bowl sambar',
        calories: 280 * peopleCount,
        protein: 9 * peopleCount,
        carbs: 52 * peopleCount,
        fat: 4 * peopleCount,
        fiber: 6 * peopleCount,
        ingredients: ['Idli Rice & Urad Dal Batter', 'Fresh Coconut', 'Toor Dal', 'Curry Leaves', 'Mustard Seeds', 'Drumstick / Pumpkin'],
        alternatives: ['Crispy Plain Dosa with Sambar', 'Vegetable Rava Upma with roasted cashews', 'Moong Dal Pesarattu'],
        tip: 'Fermented idli batter naturally pre-digests starches and enriches B-vitamins for light morning digestion.'
      };
      lunch = {
        mealType: 'lunch',
        title: 'Midday Main Meal',
        name: 'Brown Rice with Kerala Mor Kuzhambu (or Sambar), Poriyal & Beetroot Raita',
        portion: '1.5 cups brown rice + 1 bowl kuzhambu + 1 cup beans poriyal',
        calories: 460 * peopleCount,
        protein: 14 * peopleCount,
        carbs: 82 * peopleCount,
        fat: 8 * peopleCount,
        fiber: 10 * peopleCount,
        ingredients: ['Brown Rice', hasDairy ? 'Curd / Yogurt' : 'Tamarind Water', 'French Beans', 'Grated Coconut', 'Turmeric', 'Cumin'],
        alternatives: ['Bisi Bele Bath with boondi', 'Lemon Rice with Roasted Peanuts and Dal', 'Curd Rice with Pomegranate and Mustard Tadka'],
        tip: 'Consume your heaviest meal between 12:00 PM and 1:30 PM when digestive enzyme secretion (Jatharagni) peaks.'
      };
      snack = {
        mealType: 'evening_snack',
        title: 'Evening Refreshment',
        name: 'Spiced Buttermilk (Neer Mor) & Roasted Peanuts or Sundal',
        portion: '1 tall glass + 2 tbsp boiled chickpea sundal',
        calories: 140 * peopleCount,
        protein: 6 * peopleCount,
        carbs: 16 * peopleCount,
        fat: 5 * peopleCount,
        fiber: 4 * peopleCount,
        ingredients: [hasDairy ? 'Churned Yogurt (Takra)' : 'Coconut Water', 'Mustard Seeds', 'Curry Leaves', 'Ginger', 'Boiled Chana'],
        alternatives: ['Filter Coffee with Roasted Makhana', 'Tender Coconut Water with flesh', 'Fresh Guava slices with rock salt'],
        tip: 'Light digestive fluids in the afternoon clear sluggishness without compromising dinner appetite.'
      };
      dinner = {
        mealType: 'dinner',
        title: 'Gentle Evening Dinner',
        name: 'Moong Dal Khichdi with Steamed Beans & Jeera Ghee Tadka',
        portion: '1 generous bowl with mild cumin tempering',
        calories: 360 * peopleCount,
        protein: 13 * peopleCount,
        carbs: 60 * peopleCount,
        fat: 7 * peopleCount,
        fiber: 7 * peopleCount,
        ingredients: ['Yellow Moong Dal', 'Raw Rice', 'Cumin (Jeera)', hasDairy ? 'Desi Ghee' : 'Mustard Oil', 'Hing (Asafoetida)', 'Turmeric'],
        alternatives: ['Thin Ragi Dosa with Tomato Chutney', 'Vegetable Uttapam with Coconut Dip', 'Millet Pongal with Sambar'],
        tip: 'Finish evening meals at least 2.5 to 3 hours before sleep to support optimal circadian restorative sleep.'
      };
    } else {
      // North / Pan-Indian default
      breakfast = {
        mealType: 'breakfast',
        title: 'Morning Fuel',
        name: isVegan
          ? 'Vegetable Poha with Roasted Peanuts, Curry Leaves & Lemon'
          : hasDairy
          ? 'Besan Chilla with Mint Chutney & Paneer Crumbles'
          : 'Vegetable Poha with Roasted Peanuts & Squeezed Lemon',
        portion: '1.5 cups prepared',
        calories: 310 * peopleCount,
        protein: 11 * peopleCount,
        carbs: 48 * peopleCount,
        fat: 8 * peopleCount,
        fiber: 5 * peopleCount,
        ingredients: ['Gram Flour (Besan) or Flattened Rice (Poha)', 'Onions', 'Peanuts', 'Green Chillies', 'Curry Leaves', 'Lemon Juice'],
        alternatives: ['Whole Wheat Methi Thepla with Curd', 'Rolled Oats Porridge with Walnuts & Apple', 'Sprouted Moong Chaat with Cucumber'],
        tip: 'Pairing plant protein (Besan/Peanuts) with vitamin C (Lemon) triples non-heme iron absorption.'
      };
      lunch = {
        mealType: 'lunch',
        title: 'Midday Main Meal',
        name: hasDairy
          ? '2 Whole Wheat Rotis, Cooked Dal Tadka, Palak Paneer & Cucumber Salad'
          : '2 Whole Wheat Rotis, Yellow Toor Dal, Spiced Bhindi Masala & Tomato Salad',
        portion: '2 rotis + 1 bowl dal + 1 cup sabzi',
        calories: 490 * peopleCount,
        protein: 18 * peopleCount,
        carbs: 72 * peopleCount,
        fat: 12 * peopleCount,
        fiber: 12 * peopleCount,
        ingredients: ['Whole Wheat Atta', 'Toor or Moong Dal', 'Spinach (Palak) or Bhindi', hasDairy ? 'Fresh Paneer' : 'Tofu', 'Cumin', 'Garlic'],
        alternatives: ['Rajma Masala with Steamed Rice & Onion Kachumber', 'Kala Chana Gravy with Jowar Bhakri', 'Chole with Jeera Rice and Mint Chutney'],
        tip: 'Combining wheat rotis with pulse dal forms a complete amino acid profile with all 9 essential amino acids.'
      };
      snack = {
        mealType: 'evening_snack',
        title: 'Evening Refreshment',
        name: 'Roasted Makhana (Foxnuts) & Spiced Chaas (or Ginger Herbal Infusion)',
        portion: '1 bowl makhana (~30g) + 1 glass chaas',
        calories: 160 * peopleCount,
        protein: 6 * peopleCount,
        carbs: 22 * peopleCount,
        fat: 4 * peopleCount,
        fiber: 3 * peopleCount,
        ingredients: ['Makhana (Foxnuts)', hasDairy ? 'Curd / Buttermilk' : 'Fresh Mint Tea', 'Roasted Cumin (Bhuna Jeera)', 'Rock Salt (Sendha Namak)'],
        alternatives: ['Chana Sattu Drink with Rock Salt', 'Handful of Soaked Almonds & Walnuts', 'Fresh Papaya Bowl with Chia Seeds'],
        tip: 'Sendha Namak (rock salt) provides trace electrolyte minerals without excessive sodium spikes.'
      };
      dinner = {
        mealType: 'dinner',
        title: 'Gentle Evening Dinner',
        name: 'Light Yellow Moong Dal Khichdi with Carrot-Peas & Coriander',
        portion: '1 large bowl served warm',
        calories: 380 * peopleCount,
        protein: 13 * peopleCount,
        carbs: 64 * peopleCount,
        fat: 7 * peopleCount,
        fiber: 8 * peopleCount,
        ingredients: ['Moong Dal (Yellow)', 'White or Brown Rice', 'Carrots & Green Peas', hasDairy ? 'Desi Ghee' : 'Sesame Oil', 'Cumin & Hing'],
        alternatives: ['2 Soft Phulkas with Lauki (Bottle Gourd) Sabzi', 'Mixed Vegetable Dalia with Curd', 'Warm Pumpkin Soup with Toasted Seeds'],
        tip: 'Lauki (Bottle gourd) and Moong Dal are celebrated in Ayurveda for calming inflammatory Pitta and facilitating restful sleep.'
      };
    }

    setCurrentPlan([breakfast, lunch, snack, dinner]);
  };

  const handleSwapMeal = (mealIndex: number) => {
    const meal = currentPlan[mealIndex];
    if (!meal || !meal.alternatives || meal.alternatives.length === 0) return;

    const nextAltIndex = 0;
    const currentName = meal.name;
    const newName = meal.alternatives[nextAltIndex];
    const updatedAlternatives = [...meal.alternatives.slice(1), currentName];

    const updatedPlan = [...currentPlan];
    updatedPlan[mealIndex] = {
      ...meal,
      name: newName,
      alternatives: updatedAlternatives
    };
    setCurrentPlan(updatedPlan);
  };

  const handleSavePlan = () => {
    try {
      const planToSave = {
        id: `plan-${Date.now()}`,
        savedAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        dietaryPref,
        regionalStyle,
        peopleCount,
        meals: currentPlan,
        totals: {
          calories: currentPlan.reduce((acc, m) => acc + m.calories, 0),
          protein: currentPlan.reduce((acc, m) => acc + m.protein, 0),
          carbs: currentPlan.reduce((acc, m) => acc + m.carbs, 0),
          fat: currentPlan.reduce((acc, m) => acc + m.fat, 0),
          fiber: currentPlan.reduce((acc, m) => acc + m.fiber, 0)
        }
      };

      const existingRaw = localStorage.getItem('naviko_saved_meal_plans');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(planToSave);
      localStorage.setItem('naviko_saved_meal_plans', JSON.stringify(existing.slice(0, 10)));

      setSavedNotification('Meal plan successfully saved to your wellness dashboard!');
      setTimeout(() => setSavedNotification(null), 4000);
    } catch {
      setSavedNotification('Could not save plan.');
      setTimeout(() => setSavedNotification(null), 4000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Compile unique consolidated grocery items
  const consolidatedGroceries = Array.from(
    new Set(currentPlan.flatMap((m) => m.ingredients))
  );

  const toggleGrocery = (item: string) => {
    setCheckedGroceries((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const totals = {
    calories: currentPlan.reduce((acc, m) => acc + m.calories, 0),
    protein: currentPlan.reduce((acc, m) => acc + m.protein, 0),
    carbs: currentPlan.reduce((acc, m) => acc + m.carbs, 0),
    fat: currentPlan.reduce((acc, m) => acc + m.fat, 0),
    fiber: currentPlan.reduce((acc, m) => acc + m.fiber, 0)
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] text-[#16231C] dark:text-[#E8F0EC] transition-colors pb-24">
      <BreadcrumbNavigation
        items={[
          { label: 'Home', path: '/' },
          { label: 'Meal Planner', path: '/meal-planner', active: true }
        ]}
        onNavigate={onNavigate}
      />

      {savedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#2D6A4F] animate-fade-in text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{savedNotification}</span>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="underline font-bold hover:text-emerald-200 ml-2 cursor-pointer"
          >
            Go to Dashboard →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] mb-2">
            <span>Science Meets Tradition</span>
            <span aria-hidden="true">·</span>
            <span>Balanced Indian Nutrition</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16231C] dark:text-white tracking-tight">
            Smart Indian Meal Planner
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#4D6156] dark:text-[#9FB7A9] leading-relaxed">
            Create practical, culturally authentic Indian daily meal plans tailored to your dietary style, allergies, budget, and cooking schedule. Complete with ingredient swap options and consolidated grocery lists.
          </p>
        </div>

        {/* Configuration Controls Grid */}
        <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-8 shadow-xs mb-10 space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold text-[#16231C] dark:text-white border-b border-[#F2ECE4] dark:border-[#22382C] pb-3">
            <Sliders className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
            <span>Customize Your Plan Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dietary Preference */}
            <div>
              <label className="text-xs font-bold text-[#16231C] dark:text-white block mb-2">
                Dietary Preference
              </label>
              <select
                value={dietaryPref}
                onChange={(e) => setDietaryPref(e.target.value as DietaryPreference)}
                className="w-full py-2.5 px-3 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-xl border border-[#D5CCC0] dark:border-[#2B4637] text-xs font-medium text-[#16231C] dark:text-white focus:outline-hidden"
              >
                <option value="vegetarian">Vegetarian (Lacto-Veg)</option>
                <option value="vegan">100% Vegan (No Dairy/Ghee)</option>
                <option value="egg">Eggitarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="jain">Jain Friendly (No Root Veg)</option>
              </select>
            </div>

            {/* Regional Cuisine Style */}
            <div>
              <label className="text-xs font-bold text-[#16231C] dark:text-white block mb-2">
                Regional Taste
              </label>
              <select
                value={regionalStyle}
                onChange={(e) => setRegionalStyle(e.target.value)}
                className="w-full py-2.5 px-3 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-xl border border-[#D5CCC0] dark:border-[#2B4637] text-xs font-medium text-[#16231C] dark:text-white focus:outline-hidden"
              >
                <option value="pan-indian">Pan-Indian Balanced (Rotis &amp; Dals)</option>
                <option value="south-indian">South Indian (Idli, Sambar, Kuzhambu)</option>
                <option value="quick-tiffin">Quick Office Tiffin (Under 20m)</option>
              </select>
            </div>

            {/* Cooking Time & Budget */}
            <div>
              <label className="text-xs font-bold text-[#16231C] dark:text-white block mb-2">
                Cooking Time &amp; Budget
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value as any)}
                  className="w-full py-2.5 px-2 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-xl border border-[#D5CCC0] dark:border-[#2B4637] text-xs font-medium text-[#16231C] dark:text-white focus:outline-hidden"
                >
                  <option value="quick">&lt;20m Quick</option>
                  <option value="standard">30-45m Normal</option>
                  <option value="weekend">Elaborate</option>
                </select>
                <select
                  value={budgetLevel}
                  onChange={(e) => setBudgetLevel(e.target.value as any)}
                  className="w-full py-2.5 px-2 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-xl border border-[#D5CCC0] dark:border-[#2B4637] text-xs font-medium text-[#16231C] dark:text-white focus:outline-hidden"
                >
                  <option value="budget">Budget-Friendly</option>
                  <option value="everyday">Everyday</option>
                  <option value="high_protein">High Protein</option>
                </select>
              </div>
            </div>

            {/* People Count & Servings */}
            <div>
              <label className="text-xs font-bold text-[#16231C] dark:text-white block mb-2">
                Number of People
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 4].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setPeopleCount(cnt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      peopleCount === cnt
                        ? 'bg-[#1B4332] text-white border-[#1B4332] dark:bg-[#2D6A4F] dark:border-[#2D6A4F]'
                        : 'bg-[#FAF7F2] dark:bg-[#1A2E23] border-[#D5CCC0] dark:border-[#2B4637] text-[#4D6156] dark:text-[#9FB7A9]'
                    }`}
                  >
                    {cnt} {cnt === 1 ? 'Person' : 'People'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Allergen Exclusions Selector */}
          <div>
            <span className="text-xs font-bold text-[#16231C] dark:text-white block mb-2">
              Allergens &amp; Exclusions to Avoid:
            </span>
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGENS.slice(0, 7).map((alg) => {
                const active = selectedAllergens.includes(alg.id);
                return (
                  <button
                    key={alg.id}
                    onClick={() => toggleAllergen(alg.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                      active
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : 'bg-[#FAF7F2] dark:bg-[#1A2E23] text-[#586A60] dark:text-[#9FB7A9] border-[#E8E2D9] dark:border-[#2B4637] hover:border-[#7A8E82]'
                    }`}
                  >
                    {active ? '✕ ' : '+ '}
                    {alg.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={generatePlan}
              className="px-6 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate Meal Plan</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSavePlan}
                className="px-4 py-2.5 bg-white dark:bg-[#1A2E23] border border-[#D5CCC0] dark:border-[#2B4637] hover:border-[#1B4332] text-[#16231C] dark:text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-[#C26347]" />
                <span>Save Plan</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-white dark:bg-[#1A2E23] border border-[#D5CCC0] dark:border-[#2B4637] hover:border-[#1B4332] text-[#16231C] dark:text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#586A60]" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nutritional Summary Banner */}
        <div className="bg-[#E9F1EC] dark:bg-[#15271F] border border-[#B7D5C4] dark:border-[#223E30] rounded-3xl p-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1B4332] dark:text-[#52B788]">
                Daily Nutrient Profile ({peopleCount} {peopleCount === 1 ? 'Person' : 'People'})
              </div>
              <div className="text-sm text-[#4D6156] dark:text-[#9FB7A9] mt-0.5">
                Calculated according to ICMR-NIN average adult Indian dietary reference values.
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3 text-center">
              <div className="bg-white dark:bg-[#13221A] px-3 py-2 rounded-xl border border-[#B7D5C4] dark:border-[#2A4839]">
                <div className="text-[10px] text-[#7A8E82] font-semibold">Calories</div>
                <div className="text-sm font-black text-[#16231C] dark:text-white font-mono">{totals.calories}</div>
              </div>
              <div className="bg-white dark:bg-[#13221A] px-3 py-2 rounded-xl border border-[#B7D5C4] dark:border-[#2A4839]">
                <div className="text-[10px] text-[#7A8E82] font-semibold">Protein</div>
                <div className="text-sm font-black text-[#1B4332] dark:text-[#52B788] font-mono">{totals.protein}g</div>
              </div>
              <div className="bg-white dark:bg-[#13221A] px-3 py-2 rounded-xl border border-[#B7D5C4] dark:border-[#2A4839]">
                <div className="text-[10px] text-[#7A8E82] font-semibold">Carbs</div>
                <div className="text-sm font-black text-[#6B5A4E] dark:text-[#C5B3A5] font-mono">{totals.carbs}g</div>
              </div>
              <div className="bg-white dark:bg-[#13221A] px-3 py-2 rounded-xl border border-[#B7D5C4] dark:border-[#2A4839]">
                <div className="text-[10px] text-[#7A8E82] font-semibold">Fat</div>
                <div className="text-sm font-black text-[#C26347] font-mono">{totals.fat}g</div>
              </div>
              <div className="bg-white dark:bg-[#13221A] px-3 py-2 rounded-xl border border-[#B7D5C4] dark:border-[#2A4839]">
                <div className="text-[10px] text-[#7A8E82] font-semibold">Fiber</div>
                <div className="text-sm font-black text-[#2D6A4F] dark:text-[#52B788] font-mono">{totals.fiber}g</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Daily Meal Cards */}
        <div className="space-y-6 mb-12">
          {currentPlan.map((meal, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-8 shadow-xs hover:border-[#1B4332] dark:hover:border-[#52B788] transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                    <span>{meal.title}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{meal.mealType.replace('_', ' ')}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#16231C] dark:text-white leading-snug">
                    {meal.name}
                  </h3>

                  <div className="text-xs text-[#586A60] dark:text-[#8FA799]">
                    Standard Serving: <strong className="text-[#16231C] dark:text-white">{meal.portion}</strong>
                  </div>

                  {/* Ayurvedic & Digestion Tip */}
                  <div className="p-3 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-2xl text-xs text-[#4D6156] dark:text-[#9FB7A9] border border-[#E8E2D9] dark:border-[#2B4637]">
                    <strong className="text-[#1B4332] dark:text-[#52B788]">Ayurvedic Digestion Note: </strong>
                    {meal.tip}
                  </div>

                  {/* Ingredients Tags */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-[#7A8E82] block mb-1.5">
                      Key Ingredients:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#F2ECE4] dark:bg-[#1A2E23] text-xs text-[#16231C] dark:text-white"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Nutrition pill & Instant Swap button */}
                <div className="flex flex-col justify-between items-start md:items-end gap-4 min-w-[200px]">
                  <div className="grid grid-cols-4 gap-2 text-center w-full p-2.5 bg-[#FAF7F2] dark:bg-[#1A2E23] rounded-2xl">
                    <div>
                      <div className="text-[10px] text-[#7A8E82]">Kcal</div>
                      <div className="text-xs font-bold text-[#16231C] dark:text-white font-mono">{meal.calories}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#7A8E82]">Protein</div>
                      <div className="text-xs font-bold text-[#1B4332] dark:text-[#52B788] font-mono">{meal.protein}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#7A8E82]">Carbs</div>
                      <div className="text-xs font-bold text-[#6B5A4E] dark:text-[#C5B3A5] font-mono">{meal.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#7A8E82]">Fat</div>
                      <div className="text-xs font-bold text-[#C26347] font-mono">{meal.fat}g</div>
                    </div>
                  </div>

                  {meal.alternatives && meal.alternatives.length > 0 && (
                    <button
                      onClick={() => handleSwapMeal(idx)}
                      className="w-full py-2 px-3 bg-white dark:bg-[#13221A] hover:bg-[#FAF7F2] dark:hover:bg-[#1A2E23] border border-[#D5CCC0] dark:border-[#2B4637] rounded-xl text-xs font-semibold text-[#1B4332] dark:text-[#52B788] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Swap for alternative dish"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Swap Alternative</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consolidated Grocery Checklist */}
        <div className="bg-white dark:bg-[#13221A] rounded-3xl border border-[#E8E2D9] dark:border-[#22382C] p-6 sm:p-8 shadow-xs mb-12">
          <div className="flex items-center justify-between border-b border-[#F2ECE4] dark:border-[#22382C] pb-4 mb-6">
            <div>
              <div className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                Interactive Shopping Assistant
              </div>
              <h2 className="text-xl font-bold text-[#16231C] dark:text-white">
                Consolidated Grocery Checklist ({peopleCount} {peopleCount === 1 ? 'Person' : 'People'})
              </h2>
            </div>
            <button
              onClick={() => setCheckedGroceries({})}
              className="text-xs font-semibold text-[#586A60] hover:text-[#16231C] dark:hover:text-white cursor-pointer"
            >
              Reset Checkbox
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {consolidatedGroceries.map((item, i) => {
              const isChecked = checkedGroceries[item] || false;
              return (
                <div
                  key={i}
                  onClick={() => toggleGrocery(item)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isChecked
                      ? 'bg-[#E9F1EC] dark:bg-[#1A2E23] border-[#B7D5C4] dark:border-[#2B4637] text-[#586A60] line-through'
                      : 'bg-[#FAF7F2] dark:bg-[#15271F] border-[#E8E2D9] dark:border-[#22382C] text-[#16231C] dark:text-white hover:border-[#1B4332]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'border-[#D5CCC0] dark:border-[#2B4637] bg-white dark:bg-[#13221A]'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Responsible Nutrition & Medical Disclaimer */}
        <div className="rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-6 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 space-y-1.5 leading-relaxed">
            <h4 className="font-bold text-amber-900 dark:text-amber-100">
              Responsible Health &amp; Non-Medical Disclaimer
            </h4>
            <p>
              NAVIKO Meal Planner recommendations are generated for educational and routine menu organization only. They do not constitute Medical Nutrition Therapy (MNT), individualized clinical meal prescriptions, or a treatment program for diabetes, chronic renal disease, or gastrointestinal pathologies.
            </p>
            <p>
              For therapeutic conditions or pregnancy, always review your dietary modifications with a certified registered dietitian or licensed medical practitioner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
