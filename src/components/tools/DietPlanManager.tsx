import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Leaf,
  Apple,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Check,
  Calendar,
  ShoppingCart,
  Bookmark,
  Crown,
  AlertCircle,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Droplets,
  BookOpen,
  ArrowRight,
  Printer,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  DietaryPreference,
  ActivityLevel,
  HealthGoal,
  MealType,
  MealOption,
  UserDietPreferences,
  GeneratedMealPlan,
  COMMON_ALLERGENS,
  COMMON_DISLIKES,
  FOOD_STYLES,
  MEAL_DATABASE,
  filterCompatibleMeals,
  generateMealPlan,
} from '../../data/dietPlanData';

interface SavedPlanRecord {
  id: string;
  title: string;
  createdAt: string;
  plan: GeneratedMealPlan;
}

export const DietPlanManager: React.FC = () => {
  const { user, isAuthenticated, token } = useAuth();
  const { plan: subscriptionPlan, isTrial, authorizeFeature } = useSubscription();

  const isPremium = subscriptionPlan === 'plus' || subscriptionPlan === 'pro' || isTrial;

  // Form states
  const [age, setAge] = useState<string>('26');
  const [sex, setSex] = useState<'male' | 'female' | 'unspecified'>('unspecified');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('vegetarian');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['pan-indian', 'high-fiber']);
  const [dislikes, setDislikes] = useState<string[]>(['Bitter Gourd (Karela)']);
  const [customDislike, setCustomDislike] = useState<string>('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState<string>('');
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4 | 5>(4);
  const [goal, setGoal] = useState<HealthGoal>('balanced_eating');

  // Active view tab: 'generator' | 'weekly' | 'grocery' | 'science' | 'saved'
  const [activeTab, setActiveTab] = useState<'generator' | 'weekly' | 'grocery' | 'science' | 'saved'>('generator');

  // Generated Plan
  const [currentPlan, setCurrentPlan] = useState<GeneratedMealPlan | null>(null);
  const [replacementCounts, setReplacementCounts] = useState<number>(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<string>('Unlimited Meal Swaps');

  // Saved Plans
  const [savedPlans, setSavedPlans] = useState<SavedPlanRecord[]>([]);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [storageUnavailableNotice, setStorageUnavailableNotice] = useState<string | null>(null);

  // Grocery checked items
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});

  // Minor detection
  const numAge = parseInt(age, 10) || 0;
  const isMinor = numAge > 0 && numAge < 18;

  // Initialize with initial plan
  useEffect(() => {
    handleGeneratePlan();
    loadSavedPlans();
  }, []);

  const loadSavedPlans = async () => {
    // 1. Try local storage
    try {
      const local = localStorage.getItem(`naviko_saved_plans_${user?.id || 'guest'}`);
      if (local) {
        setSavedPlans(JSON.parse(local));
      }
    } catch {}

    // 2. If authenticated, fetch from server API
    if (token) {
      try {
        const res = await fetch('/api/user/saved-plans', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            setSavedPlans(data.items);
          }
        }
      } catch {}
    }
  };

  const handleGeneratePlan = () => {
    const prefs: UserDietPreferences = {
      age: numAge,
      sex,
      activityLevel,
      dietaryPreference,
      foodStyles: selectedStyles,
      dislikes,
      allergies,
      mealsPerDay,
      goal,
    };

    const newPlan = generateMealPlan(prefs);
    setCurrentPlan(newPlan);
    setReplacementCounts(0);
  };

  // Replace single meal
  const handleReplaceMeal = (mealIndex: number, mealType: MealType) => {
    if (!currentPlan) return;

    // Check free quota
    if (!isPremium && replacementCounts >= 2) {
      setUpgradeModalFeature('Unlimited Meal Replacements & Swaps');
      setShowUpgradeModal(true);
      return;
    }

    const currentMealId = currentPlan.meals[mealIndex]?.meal.id;
    const compatible = filterCompatibleMeals(MEAL_DATABASE, currentPlan.userPrefs, mealType);
    const options = compatible.filter((m) => m.id !== currentMealId);

    if (options.length === 0) {
      // If no other alternative matches strict filter, pick any compatible
      return;
    }

    const nextMeal = options[Math.floor(Math.random() * options.length)];
    const updatedMeals = [...currentPlan.meals];
    updatedMeals[mealIndex] = {
      ...updatedMeals[mealIndex],
      meal: nextMeal,
    };

    setCurrentPlan({
      ...currentPlan,
      meals: updatedMeals,
    });

    setReplacementCounts((prev) => prev + 1);
  };

  // Handle Save Plan
  const handleSavePlan = async () => {
    if (!currentPlan) return;

    if (!isAuthenticated) {
      setUpgradeModalFeature('Account Sync & Plan History');
      setShowUpgradeModal(true);
      return;
    }

    const record: SavedPlanRecord = {
      id: currentPlan.id,
      title: currentPlan.title,
      createdAt: new Date().toISOString(),
      plan: currentPlan,
    };

    // Update state & local storage
    const updated = [record, ...savedPlans.filter((p) => p.id !== record.id)].slice(0, 20);
    setSavedPlans(updated);
    try {
      localStorage.setItem(`naviko_saved_plans_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}

    // Persist to server
    if (token) {
      try {
        const res = await fetch('/api/user/saved-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: record.id,
            type: 'diet_plan',
            title: record.title,
            data: record.plan,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 403) {
            setUpgradeModalFeature('Cloud Plan Storage');
            setShowUpgradeModal(true);
            return;
          }
          if (errData.storageUnavailable) {
            setStorageUnavailableNotice('Cloud database persistence is currently unavailable in this deployment environment. Your plan is saved locally in this browser.');
            setTimeout(() => setStorageUnavailableNotice(null), 6000);
            return;
          }
        }
      } catch {
        setStorageUnavailableNotice('Could not reach backend persistence. Your plan has been saved to your local browser storage.');
        setTimeout(() => setStorageUnavailableNotice(null), 6000);
      }
    }

    setSaveSuccessNotice('Meal plan successfully saved to your NAVIKO account!');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleDeleteSavedPlan = async (id: string) => {
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    try {
      localStorage.setItem(`naviko_saved_plans_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}

    if (token) {
      try {
        await fetch(`/api/user/saved-plans?id=${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
  };

  // Toggle allergies
  const toggleAllergy = (id: string) => {
    setAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Add custom allergy
  const handleAddCustomAllergy = () => {
    if (customAllergy.trim()) {
      const clean = customAllergy.trim().toLowerCase();
      if (!allergies.includes(clean)) {
        setAllergies([...allergies, clean]);
      }
      setCustomAllergy('');
    }
  };

  // Toggle dislikes
  const toggleDislike = (item: string) => {
    setDislikes((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  // Add custom dislike
  const handleAddCustomDislike = () => {
    if (customDislike.trim()) {
      const clean = customDislike.trim();
      if (!dislikes.includes(clean)) {
        setDislikes([...dislikes, clean]);
      }
      setCustomDislike('');
    }
  };

  // Compile Grocery Checklist from Current Plan
  const getGroceryList = (): string[] => {
    if (!currentPlan) return [];
    const allIngredients: string[] = currentPlan.meals.flatMap((m) => m.meal.ingredients);
    const unique: string[] = Array.from(new Set(allIngredients));
    return unique;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. TOP TITLE & NAVIGATION TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" /> Clinical &amp; Everyday Nutrition
              </span>
              {isPremium && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Crown className="w-3 h-3" /> Plus Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Diet Plan Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Personalized meal structuring, allergy protection, and balanced plate nutrition.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePlan}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-xs cursor-pointer"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save Plan</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Print or export plan"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Daily Meal Plan
          </button>

          <button
            onClick={() => {
              if (!isPremium) {
                setUpgradeModalFeature('7-Day Weekly Meal Planning');
                setShowUpgradeModal(true);
              } else {
                setActiveTab('weekly');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly 7-Day Plan</span>
            {!isPremium && <Crown className="w-3 h-3 text-amber-500" />}
          </button>

          <button
            onClick={() => {
              if (!isPremium) {
                setUpgradeModalFeature('Auto Grocery & Ingredient Checklist');
                setShowUpgradeModal(true);
              } else {
                setActiveTab('grocery');
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'grocery'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Grocery Checklist</span>
            {!isPremium && <Crown className="w-3 h-3 text-amber-500" />}
          </button>

          <button
            onClick={() => setActiveTab('science')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'science'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Nutrition Science</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Plans ({savedPlans.length})</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {storageUnavailableNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{storageUnavailableNotice}</span>
        </div>
      )}

      {/* 2. TAB: DAILY GENERATOR & PREFERENCES */}
      {activeTab === 'generator' && (
        <div className="space-y-8">
          {/* USER PREFERENCES FORM */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Customize Nutrition &amp; Preferences
              </h2>
              <span className="text-xs text-slate-400">All fields adapt meal generation</span>
            </div>

            {/* Minor Warning Banner if under 18 */}
            {isMinor && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-black text-amber-900 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Youth &amp; Adolescent Growth Guidance (Age {age}):</span>
                </div>
                <p className="leading-relaxed text-amber-800/90 dark:text-amber-200">
                  For users under 18, nutrition focuses on wholesome fueling, energy, bone growth, and cognitive development. <strong>Calorie-restriction, extreme fasting, and weight-loss plans are strictly avoided.</strong> Please discuss individual nutrition with a parent, guardian, or qualified healthcare professional.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Age */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="2"
                  max="115"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Dietary Preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Dietary Preference
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="vegetarian">Vegetarian (Lacto-Veg)</option>
                  <option value="vegan">Vegan (100% Plant-Based)</option>
                  <option value="egg">Egg-Friendly (Eggetarian)</option>
                  <option value="non-vegetarian">Non-Vegetarian (Poultry/Fish)</option>
                  <option value="jain">Jain / Sattvic (No Alliums/Root Veg)</option>
                </select>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="sedentary">Sedentary (Desk job, low movement)</option>
                  <option value="lightly_active">Lightly Active (1–3 walks/wk)</option>
                  <option value="moderately_active">Moderately Active (3–5 days workout)</option>
                  <option value="very_active">Very Active (Heavy sports/manual job)</option>
                </select>
              </div>

              {/* Meals Per Day */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Meals Per Day
                </label>
                <select
                  value={mealsPerDay}
                  onChange={(e) => setMealsPerDay(Number(e.target.value) as 3 | 4 | 5)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={3}>3 Meals (Breakfast, Lunch, Dinner)</option>
                  <option value={4}>4 Meals (+ Evening Snack)</option>
                  <option value={5}>5 Meals (+ Morning &amp; Evening Snack)</option>
                </select>
              </div>
            </div>

            {/* Health Goal (Neutral, non-restrictive options) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                General Health Focus
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'balanced_eating', label: 'Balanced Eating' },
                  { id: 'general_fitness', label: 'General Fitness' },
                  { id: 'meal_organization', label: 'Better Meal Organization' },
                  { id: 'healthy_habits', label: 'Supporting Healthy Habits' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id as HealthGoal)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      goal === g.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* STRICT ALLERGY & INTOLERANCE FILTER (SAFETY CRITICAL) */}
            <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
                    Allergies &amp; Intolerances (Strict Safety Exclusion)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                  {allergies.length} active exclusions
                </span>
              </div>

              <p className="text-xs text-rose-800/90 dark:text-rose-300/80 leading-relaxed">
                Selected allergens will be strictly filtered out of your recommended meals and replacement suggestions.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {COMMON_ALLERGENS.map((allg) => {
                  const isSelected = allergies.includes(allg.id);
                  return (
                    <button
                      key={allg.id}
                      type="button"
                      onClick={() => toggleAllergy(allg.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{allg.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom allergy input */}
              <div className="flex items-center gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAllergy();
                    }
                  }}
                  placeholder="Add other allergy (e.g. kiwi, shrimp)..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAllergy}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
                ⚠️ <strong>Safety Notice:</strong> Commercial and prepared foods may contain hidden trace ingredients or shared facility cross-contact. Always verify ingredient lists on packaged goods. NAVIKO provides software screening and cannot guarantee external commercial food safety.
              </div>
            </div>

            {/* FOODS DISLIKED */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Foods You Dislike (Excluded from Meal Ideas)
              </label>

              <div className="flex flex-wrap gap-2">
                {COMMON_DISLIKES.map((item) => {
                  const isDisliked = dislikes.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDislike(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        isDisliked
                          ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Custom dislike */}
              <div className="flex items-center gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={customDislike}
                  onChange={(e) => setCustomDislike(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomDislike();
                    }
                  }}
                  placeholder="Add another ingredient to dislike..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomDislike}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* RE-GENERATE CTA BUTTON */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Swapping meals: <strong className="text-emerald-600 dark:text-emerald-400">{isPremium ? 'Unlimited' : `${2 - replacementCounts} free swaps left today`}</strong>
              </span>
              <button
                type="button"
                onClick={handleGeneratePlan}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update Meal Plan</span>
              </button>
            </div>
          </div>

          {/* GENERATED MEALS DISPLAY */}
          {currentPlan && (
            <div className="space-y-6">
              {/* Header card for the plan */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    Personalized Daily Nutrition Plan
                  </span>
                  <span className="text-xs font-medium text-emerald-100">
                    {currentPlan.meals.length} Structured Meals
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {currentPlan.title}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-3xl">
                  {currentPlan.nutritionSummary.macroGuidance}
                </p>
              </div>

              {/* Meal Cards */}
              <div className="space-y-4">
                {currentPlan.meals.map((item, idx) => (
                  <div
                    key={`${item.mealType}-${item.meal.id}-${idx}`}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                            {item.label}
                          </span>
                          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {item.meal.name}
                          </h4>
                        </div>
                      </div>

                      {/* Replace Meal Button */}
                      <button
                        type="button"
                        onClick={() => handleReplaceMeal(idx, item.mealType)}
                        className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace Meal</span>
                      </button>
                    </div>

                    {/* Ingredients */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Included Ingredients &amp; Food Options:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.meal.ingredients.map((ing, iIdx) => (
                          <span
                            key={iIdx}
                            className="px-2.5 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Explanation */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-emerald-900 dark:text-emerald-300 font-bold block mb-0.5">
                        💡 Nutritional Science Context:
                      </strong>
                      {item.meal.nutritionExplanation}
                    </div>

                    {/* Alternatives */}
                    {item.meal.easyAlternatives && item.meal.easyAlternatives.length > 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2 pt-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                          Easy Alternatives:
                        </span>
                        <span>{item.meal.easyAlternatives.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Daily Hydration Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Daily Hydration Guidance ({currentPlan.dailyHydration.targetLiters} Liters)
                    </h4>
                    <span className="text-xs text-slate-500">
                      Calculated for your activity profile ({activityLevel.replace('_', ' ')})
                    </span>
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-600 dark:text-slate-400">
                  {currentPlan.dailyHydration.recommendations.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: WEEKLY 7-DAY PLAN (PREMIUM FEATURE) */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
                  <Crown className="w-3.5 h-3.5" /> Premium Weekly Blueprint
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  7-Day Structured Meal Schedule (Monday – Sunday)
                </h3>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Schedule</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Below is a full week of rotational variety designed around your chosen diet preferences ({dietaryPreference}), allergies, and schedule.
            </p>

            {/* Days Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dIdx) => (
                <div
                  key={day}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {day}
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Day {dIdx + 1}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Breakfast</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {dIdx % 2 === 0 ? 'Vegetable Poha with Sprouted Moong' : 'Steamed Ragi & Rice Idlis with Sambar'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Lunch</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {dIdx % 3 === 0
                          ? 'Yellow Toor Dal Tadka, 2 Phulkas & Salad'
                          : dIdx % 3 === 1
                          ? 'Homestyle Rajma Curry with Brown Rice'
                          : 'Methi Paneer/Tofu Bhurji with Rotis'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Evening</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {dIdx % 2 === 0 ? 'Roasted Turmeric Foxnuts (Makhana)' : 'Steamed Moong Sprouts Chaat'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Dinner</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {dIdx % 2 === 0 ? 'Iron-Rich Palak Dal with Phulkas' : 'Light Moong-Lauki Dal & Cucumber'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: GROCERY & SHOPPING CHECKLIST (PREMIUM FEATURE) */}
      {activeTab === 'grocery' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
                  <Crown className="w-3.5 h-3.5" /> Automated Grocery List
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Ingredient &amp; Market Shopping Checklist
                </h3>
              </div>
              <button
                onClick={() => setCheckedGroceries({})}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Clear Checks
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All ingredients required for your generated meal schedule, compiled into a convenient check-off list for supermarket and market visits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {getGroceryList().map((item, idx) => {
                const isChecked = !!checkedGroceries[item];
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60 line-through'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setCheckedGroceries((prev) => ({
                          ...prev,
                          [item]: !prev[item],
                        }))
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: NUTRITION SCIENCE (EDUCATIONAL COMPONENT) */}
      {activeTab === 'science' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                <BookOpen className="w-3.5 h-3.5" /> Evidence-Based Physiology
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Nutrition Science &amp; The Balanced Plate
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Understand the fundamental biological roles of macronutrients and micronutrients without restrictive eating.
              </p>
            </div>

            {/* The Balanced Plate Model */}
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-4">
              <h4 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Apple className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                The Balanced Plate Model (Visual Guide)
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Rather than tracking stressful calorie deficits or eliminating whole food groups, modern nutrition science utilizes the <strong>Balanced Plate method</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                    1/2 Plate: Colorful Fiber &amp; Vegetables
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Leafy greens (palak, methi), carrots, cucumbers, cabbage, tomatoes. Supplies phytonutrients, soluble fibers, and water.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
                    1/4 Plate: Quality Protein
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Lentils, dals, paneer, tofu, eggs, fish, or poultry. Essential for enzyme building, satiety, and muscle tissue repair.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                    1/4 Plate: Complex Carbohydrates
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Whole wheat roti, brown or basmati rice, millets (ragi, jowar, bajra), oats. Sustained glucose release without spikes.
                  </p>
                </div>
              </div>
            </div>

            {/* Nutrients Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Protein */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Protein</span>
                  <span className="text-[10px] font-bold text-slate-400">Amino Acids</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Composed of 20 amino acids (9 essential). Builds antibodies, digestive enzymes, hormones, and skeletal muscle.
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Wholesome Sources:</strong> Dals, chickpeas (chana), rajma, paneer, eggs, fish, chicken breast, seeds.
                </div>
              </div>

              {/* Carbohydrates */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Carbohydrates</span>
                  <span className="text-[10px] font-bold text-slate-400">Primary Energy</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The primary metabolic fuel for neurons and physical exertion. Prioritize intact starches rich in dietary fiber over processed refined flours.
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Wholesome Sources:</strong> Whole grains, millets, sweet potatoes, legumes, fresh seasonal fruits.
                </div>
              </div>

              {/* Healthy Fats */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Healthy Fats (Lipids)</span>
                  <span className="text-[10px] font-bold text-slate-400">Cellular Membranes</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Essential for synthesizing steroid hormones, insulating nerves, and absorbing fat-soluble vitamins (A, D, E, K).
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Wholesome Sources:</strong> Walnuts, almonds, cold-pressed mustard or olive oil, chia seeds, moderate desi ghee.
                </div>
              </div>

              {/* Fiber & Prebiotics */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Dietary Fiber</span>
                  <span className="text-[10px] font-bold text-slate-400">Gut Microbiome</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Passes undigested to colonize beneficial gut bacteria, forming short-chain fatty acids (butyrate) that lower systemic inflammation.
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Wholesome Sources:</strong> Whole beans, oats, green vegetables, psyllium husk, apples with skin.
                </div>
              </div>

              {/* Vitamins & Minerals */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Vitamins &amp; Minerals</span>
                  <span className="text-[10px] font-bold text-slate-400">Micro-Nutrients</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Cofactors in cellular respiration, oxygen transport (iron/hemoglobin), and bone calcification (calcium/vitamin D).
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Wholesome Sources:</strong> Dark leafy greens, citrus fruits, amla, dairy, sunlight exposure for vitamin D.
                </div>
              </div>

              {/* Water & Hydration */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Water &amp; Hydration</span>
                  <span className="text-[10px] font-bold text-slate-400">Fluid Balance</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Maintains blood plasma volume, kidney filtration, joint lubrication, and body thermoregulation.
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Wholesome Sources:</strong> Clean drinking water, coconut water, spiced buttermilk (chaas), herbal infusions.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Want to dive deeper into food items and nutrient profiles?
              </span>
              <a
                href="/tools/nutrition-science"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Full Nutrition Science Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: SAVED PLANS HISTORY */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Your Saved Diet Plans
                </h3>
                <p className="text-xs text-slate-500">
                  Plans saved under your authenticated account
                </p>
              </div>
              <button
                onClick={handleSavePlan}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Current Plan</span>
              </button>
            </div>

            {savedPlans.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">
                  No saved plans yet
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Customize your preferences and click "Save Plan" to store your personalized routines here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {savedPlans.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Created {new Date(item.createdAt).toLocaleDateString()} • {item.plan?.meals?.length || 0} meals
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPlan(item.plan);
                          setActiveTab('generator');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 cursor-pointer"
                      >
                        Load Plan
                      </button>
                      <button
                        onClick={() => handleDeleteSavedPlan(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete saved plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPGRADE / PREMIUM MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Crown className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Unlock {upgradeModalFeature}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upgrade to NAVIKO Plus or Pro to unlock unlimited meal swaps, 7-day weekly schedule generation, automated grocery checklists, and cloud plan sync.
              </p>
            </div>

            <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Unlimited meal replacements with instant alternatives</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Full 7-Day Monday–Sunday meal schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>One-click grocery list with check-off tracker</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sync plans permanently to your NAVIKO account</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="/premium"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs text-center shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Explore Premium Plans
              </a>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
