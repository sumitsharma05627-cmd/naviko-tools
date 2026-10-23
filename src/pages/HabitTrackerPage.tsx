import React, { useState, useEffect } from 'react';
import { 
  Droplets, Utensils, CheckCircle2, Circle, Flame, Sparkles, 
  RotateCcw, Plus, Minus, ArrowRight, ShieldCheck, HeartPulse, Clock, Trash2
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { WaterConsumptionChart } from '../components/WaterConsumptionChart';

const Link: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({ to, className, children }) => (
  <a
    href={to}
    className={className}
    onClick={(e) => {
      e.preventDefault();
      window.history.pushState({}, '', to);
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'instant' });
    }}
  >
    {children}
  </a>
);

interface LoggedFoodItem {
  id: string;
  name: string;
  hindiName?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  grams: number;
  timeAdded: string;
}

interface HabitItem {
  id: string;
  title: string;
  tagline: string;
  category: 'dinacharya' | 'nutrition' | 'mindfulness';
  completed: boolean;
  idealTime: string;
}

const DEFAULT_HABITS: HabitItem[] = [
  {
    id: 'h1',
    title: 'Ushapan (Morning Warm Water)',
    tagline: 'Drink 1-2 glasses of warm water upon waking to gently awaken Agni.',
    category: 'dinacharya',
    completed: false,
    idealTime: '06:00 AM'
  },
  {
    id: 'h2',
    title: '30 Minutes Gentle Movement or Yoga',
    tagline: 'Pranayama, brisk walk or Surya Namaskar before breakfast.',
    category: 'dinacharya',
    completed: false,
    idealTime: '07:00 AM'
  },
  {
    id: 'h3',
    title: 'Mindful, Screen-Free Lunch',
    tagline: 'Eat your largest meal calmly between 12:00 PM and 1:30 PM.',
    category: 'nutrition',
    completed: false,
    idealTime: '01:00 PM'
  },
  {
    id: 'h4',
    title: 'Post-Meal 100 Steps (Shatapadi)',
    tagline: 'Gentle stroll after lunch or dinner to assist digestive transit.',
    category: 'dinacharya',
    completed: false,
    idealTime: '02:00 PM'
  },
  {
    id: 'h5',
    title: 'Light, Early Dinner',
    tagline: 'Finished at least 2.5 hours before sleep to support liver & circadian repair.',
    category: 'nutrition',
    completed: false,
    idealTime: '07:30 PM'
  },
  {
    id: 'h6',
    title: 'Screen Wind-down & Golden Milk (Haldi Doodh)',
    tagline: 'Dim blue light 45 min before bed; sip warm milk with turmeric and pinch of black pepper.',
    category: 'mindfulness',
    completed: false,
    idealTime: '10:00 PM'
  }
];

export const HabitTrackerPage: React.FC = () => {
  const getTodayKey = () => new Date().toISOString().split('T')[0];
  const todayKey = getTodayKey();

  // Water Tracker State
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem(`naviko_water_${todayKey}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const waterTarget = 10; // 10 glasses = ~2.5L

  // Meal Log State
  const [loggedMeals, setLoggedMeals] = useState<LoggedFoodItem[]>(() => {
    const saved = localStorage.getItem(`naviko_meal_log_${todayKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Habit Checklist State
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem(`naviko_habits_${todayKey}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_HABITS;
      }
    }
    return DEFAULT_HABITS;
  });

  // Listen for storage / custom events when foods are added from FoodExplorer
  useEffect(() => {
    const handleMealLogUpdate = () => {
      const saved = localStorage.getItem(`naviko_meal_log_${todayKey}`);
      if (saved) {
        try {
          setLoggedMeals(JSON.parse(saved));
        } catch {
          // keep existing
        }
      }
    };

    window.addEventListener('naviko_meal_log_updated', handleMealLogUpdate);
    return () => window.removeEventListener('naviko_meal_log_updated', handleMealLogUpdate);
  }, [todayKey]);

  // Persist Water
  useEffect(() => {
    localStorage.setItem(`naviko_water_${todayKey}`, waterGlasses.toString());
  }, [waterGlasses, todayKey]);

  // Persist Habits
  useEffect(() => {
    localStorage.setItem(`naviko_habits_${todayKey}`, JSON.stringify(habits));
  }, [habits, todayKey]);

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const removeMealItem = (index: number) => {
    const updated = loggedMeals.filter((_, i) => i !== index);
    setLoggedMeals(updated);
    localStorage.setItem(`naviko_meal_log_${todayKey}`, JSON.stringify(updated));
  };

  const clearMealLog = () => {
    setLoggedMeals([]);
    localStorage.removeItem(`naviko_meal_log_${todayKey}`);
  };

  // Nutrition aggregates
  const totalCalories = Math.round(loggedMeals.reduce((acc, m) => acc + m.calories, 0));
  const totalProtein = Math.round(loggedMeals.reduce((acc, m) => acc + m.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(loggedMeals.reduce((acc, m) => acc + m.carbs, 0) * 10) / 10;
  const totalFat = Math.round(loggedMeals.reduce((acc, m) => acc + m.fat, 0) * 10) / 10;
  const totalFiber = Math.round(loggedMeals.reduce((acc, m) => acc + m.fiber, 0) * 10) / 10;

  const habitsDoneCount = habits.filter(h => h.completed).length;
  const habitPercentage = Math.round((habitsDoneCount / habits.length) * 100);
  const waterPercentage = Math.min(100, Math.round((waterGlasses / waterTarget) * 100));

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useSEO({
    title: 'Daily Wellness & Habit Tracker | NAVIKO',
    description: 'Track your daily hydration, Indian food nutrition intake, and classical Dinacharya wellness habits. Privacy-friendly, fast, and synced to your day.',
    canonical: '/habit-tracker',
    robots: 'index, follow',
    ogType: 'website'
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] text-slate-800 dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="border-b border-stone-200 dark:border-stone-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-400 mb-1">
                Personal Sanctuary · Daily Progress
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Daily Wellness & Habit Log
              </h1>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                {formattedDate} · Building conscious habits through science and Ayurvedic rhythm.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/food-explorer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-800 text-white hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" /> Log Foods
              </Link>
              <Link
                to="/meal-planner"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
              >
                Meal Planner
              </Link>
            </div>
          </div>
        </header>

        {/* 3 Overview Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Hydration Score */}
          <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Hydration (Ushapan & Water)</span>
              <Droplets className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">{waterGlasses * 250}</span>
              <span className="text-xs text-stone-500">ml / {waterTarget * 250} ml ({waterGlasses}/{waterTarget} glasses)</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-sky-600 dark:bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${waterPercentage}%` }}
              />
            </div>
          </div>

          {/* Dinacharya Habits Score */}
          <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Daily Dinacharya Habits</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">{habitsDoneCount}</span>
              <span className="text-xs text-stone-500">of {habits.length} rituals completed ({habitPercentage}%)</span>
            </div>
            <div className="mt-3 w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-700 dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${habitPercentage}%` }}
              />
            </div>
          </div>

          {/* Logged Calories Score */}
          <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Today's Nutrition</span>
              <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">{totalCalories}</span>
              <span className="text-xs text-stone-500">kcal logged ({loggedMeals.length} items)</span>
            </div>
            <div className="mt-3 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-3">
              <span>P: <strong className="text-stone-700 dark:text-stone-200">{totalProtein}g</strong></span>
              <span>C: <strong className="text-stone-700 dark:text-stone-200">{totalCarbs}g</strong></span>
              <span>F: <strong className="text-stone-700 dark:text-stone-200">{totalFat}g</strong></span>
              <span>Fiber: <strong className="text-stone-700 dark:text-stone-200">{totalFiber}g</strong></span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Water Tracker & Food Log (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Interactive Hydration Tracker */}
            <section className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-sky-600" /> Hydration & Ushapan Log
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    1 glass ≈ 250ml. In Ayurveda, sip warm water slowly throughout the day rather than chugging iced water during meals.
                  </p>
                </div>
                <button
                  onClick={() => setWaterGlasses(0)}
                  title="Reset counter"
                  className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Glass Visualizer */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: waterTarget }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setWaterGlasses(i + 1 === waterGlasses ? i : i + 1)}
                    className={`h-14 rounded-lg flex flex-col items-center justify-center transition border ${
                      i < waterGlasses
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800 text-stone-400'
                    }`}
                    title={`Glass ${i + 1} (250 ml)`}
                  >
                    <Droplets className={`w-4 h-4 ${i < waterGlasses ? 'fill-sky-500 text-sky-500' : 'text-stone-300 dark:text-stone-600'}`} />
                    <span className="text-[10px] font-mono mt-1">{i + 1}</span>
                  </button>
                ))}
              </div>

              {/* Quick Stepper Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-sm">
                <span className="text-xs text-stone-500">
                  Total logged: <strong className="text-stone-900 dark:text-stone-100">{waterGlasses * 250} ml</strong> ({waterGlasses} of {waterTarget} glasses)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWaterGlasses(prev => Math.max(0, prev - 1))}
                    disabled={waterGlasses === 0}
                    className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-50 dark:hover:bg-stone-800 transition text-stone-700 dark:text-stone-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setWaterGlasses(prev => prev + 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-sky-700 text-white hover:bg-sky-600 transition text-xs font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add Glass (+250ml)
                  </button>
                </div>
              </div>
            </section>

            {/* 7-Day Hydration Trends Chart */}
            <WaterConsumptionChart targetGlasses={waterTarget} />

            {/* Today's Logged Foods */}
            <section className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /> Today's Meal Intake Log
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Items added from the Indian Food Nutrition Explorer.
                  </p>
                </div>
                {loggedMeals.length > 0 && (
                  <button
                    onClick={clearMealLog}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
              </div>

              {loggedMeals.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40">
                  <Utensils className="w-8 h-8 text-stone-400 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300">No foods logged today yet</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                    Explore 36+ verified Indian foods in the explorer and click "Log to Daily Tracker" to count calories, protein, and fiber.
                  </p>
                  <Link
                    to="/food-explorer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-emerald-800 text-white hover:bg-emerald-700 transition"
                  >
                    Open Food Explorer <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {loggedMeals.map((meal, index) => (
                      <div key={`${meal.id}-${index}`} className="py-3 flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <div className="font-medium text-stone-900 dark:text-stone-100 truncate">
                            {meal.name} {meal.hindiName && <span className="text-xs font-normal text-stone-500">({meal.hindiName})</span>}
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5">
                            {meal.grams}g · {meal.calories} kcal · {meal.protein}g P · {meal.carbs}g C · {meal.fat}g F · {meal.fiber}g Fiber
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono text-stone-400 hidden sm:inline">{meal.timeAdded}</span>
                          <button
                            onClick={() => removeMealItem(index)}
                            className="p-1 text-stone-400 hover:text-red-600 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Bar */}
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      Total Daily Totals:
                    </span>
                    <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400">
                      <span><strong>{totalCalories}</strong> kcal</span>
                      <span><strong>{totalProtein}g</strong> Protein</span>
                      <span><strong>{totalCarbs}g</strong> Carbs</span>
                      <span><strong>{totalFat}g</strong> Fat</span>
                      <span><strong>{totalFiber}g</strong> Fiber</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Mindful Dinacharya Habit Checklist (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <section className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-5">
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" /> Daily Dinacharya Habits
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Classical daily rhythms aligned with modern circadian chronobiology.
                </p>
              </div>

              <div className="space-y-3">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      habit.completed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
                        : 'bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <button className="mt-0.5 text-emerald-700 dark:text-emerald-400 shrink-0">
                      {habit.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white dark:fill-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-sm font-medium ${
                          habit.completed ? 'line-through text-stone-500 dark:text-stone-400' : 'text-stone-900 dark:text-stone-100'
                        }`}>
                          {habit.title}
                        </h3>
                        <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" /> {habit.idealTime}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                        {habit.tagline}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Responsible Wellness Footnote */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <HeartPulse className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Gentle Consistency Over Rigid Perfection</div>
                  <p className="leading-relaxed opacity-90">
                    Dinacharya practices are restorative guidelines, not clinical prescriptions. Adjust timings to accommodate your working shifts, personal constitution (Prakriti), and family schedule.
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Link to Ayurveda Guide */}
            <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 space-y-3">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" /> Want to deep dive into Dinacharya?
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Read our in-depth, evidence-reviewed guide on classical morning, afternoon, and nocturnal cycles with Charaka Samhita citations.
              </p>
              <Link
                to="/ayurveda"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
              >
                Visit Nutrition & Ayurveda Knowledge Hub <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
