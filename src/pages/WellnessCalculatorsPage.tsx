import React, { useState } from 'react';
import { 
  Calculator, Activity, Droplets, Dumbbell, ShieldAlert, 
  Info, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useSEO } from '../utils/seo';

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

type CalcTab = 'bmi' | 'tdee' | 'water' | 'protein';

export const WellnessCalculatorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalcTab>('bmi');

  // 1. BMI State
  const [bmiWeight, setBmiWeight] = useState<number>(68);
  const [bmiHeight, setBmiHeight] = useState<number>(170); // in cm

  // BMI calculations
  const heightM = bmiHeight / 100;
  const bmiScore = heightM > 0 ? Math.round((bmiWeight / (heightM * heightM)) * 10) / 10 : 0;

  // Asian Indian specific WHO cutoffs
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-600 dark:text-amber-400', desc: 'Below recommended body mass. Focus on nutrient-dense whole foods and strength.' };
    if (bmi < 23.0) return { label: 'Normal / Healthy (Asian Standard)', color: 'text-emerald-700 dark:text-emerald-400', desc: 'Within optimal metabolic risk threshold for Asian Indian populations.' };
    if (bmi < 25.0) return { label: 'Overweight (Asian Cutoff: ≥23.0)', color: 'text-amber-600 dark:text-amber-400', desc: 'Mildly elevated cardiovascular and diabetes risk threshold.' };
    return { label: 'Obese (Asian Cutoff: ≥25.0)', color: 'text-red-600 dark:text-red-400', desc: 'Increased metabolic risk. Recommend gradual lifestyle and physical activity adjustments.' };
  };

  const bmiCategory = getBmiCategory(bmiScore);

  // 2. TDEE / Calorie Needs State (Mifflin-St Jeor)
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(28);
  const [calWeight, setCalWeight] = useState<number>(68);
  const [calHeight, setCalHeight] = useState<number>(170);
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // Light active
  const [goal, setGoal] = useState<'maintain' | 'cut' | 'gain'>('maintain');

  // BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + (male: +5, female: -161)
  const bmr = Math.round(
    10 * calWeight + 6.25 * calHeight - 5 * age + (gender === 'male' ? 5 : -161)
  );
  const tdee = Math.round(bmr * activityLevel);
  const targetCalories = goal === 'cut' ? Math.round(tdee - 350) : goal === 'gain' ? Math.round(tdee + 350) : tdee;

  // 3. Water Intake State
  const [waterWeight, setWaterWeight] = useState<number>(68);
  const [climate, setClimate] = useState<'moderate' | 'hot'>('hot'); // India is mostly tropical
  const [exerciseMins, setExerciseMins] = useState<number>(30);

  // Baseline ~35ml per kg + 250ml per 30m exercise + 500ml for hot climate
  const dailyWaterMl = Math.round(
    waterWeight * 35 + (exerciseMins / 30) * 350 + (climate === 'hot' ? 400 : 0)
  );
  const dailyWaterGlasses = Math.round((dailyWaterMl / 250) * 10) / 10;

  // 4. Daily Protein Target State
  const [proteinWeight, setProteinWeight] = useState<number>(68);
  const [lifestyle, setLifestyle] = useState<'sedentary' | 'moderate' | 'athletic'>('moderate');

  const proteinMultipliers = {
    sedentary: { min: 0.8, max: 1.0, label: 'ICMR General Maintenance (0.8 - 1.0 g/kg)' },
    moderate: { min: 1.2, max: 1.4, label: 'Active / Yoga / Resistance (1.2 - 1.4 g/kg)' },
    athletic: { min: 1.6, max: 2.0, label: 'Hypertrophy / High Training (1.6 - 2.0 g/kg)' },
  };

  const minProtein = Math.round(proteinWeight * proteinMultipliers[lifestyle].min);
  const maxProtein = Math.round(proteinWeight * proteinMultipliers[lifestyle].max);

  useSEO({
    title: 'Evidence-Based Wellness Calculators | NAVIKO',
    description: 'Calculate BMI with Asian Indian cutoffs, daily calorie expenditure (Mifflin-St Jeor TDEE), optimal water intake, and protein targets with transparent formulas.',
    canonical: '/wellness-calculators',
    robots: 'index, follow',
    ogType: 'website'
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="border-b border-stone-200 dark:border-stone-800 pb-6">
          <div className="text-xs font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-400 mb-1">
            Nutritional Diagnostics · Transparent Formulas
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Evidence-Based Wellness Calculators
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Validated scientific equations tailored for Indian body composition benchmarks and climate factors.
          </p>
        </header>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('bmi')}
            className={`pb-3 px-4 text-sm font-medium transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'bmi'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Asian Indian BMI
          </button>
          <button
            onClick={() => setActiveTab('tdee')}
            className={`pb-3 px-4 text-sm font-medium transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'tdee'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Calculator className="w-4 h-4" /> Daily Calories (TDEE)
          </button>
          <button
            onClick={() => setActiveTab('water')}
            className={`pb-3 px-4 text-sm font-medium transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'water'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Droplets className="w-4 h-4" /> Hydration Needs
          </button>
          <button
            onClick={() => setActiveTab('protein')}
            className={`pb-3 px-4 text-sm font-medium transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'protein'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Dumbbell className="w-4 h-4" /> Protein Target
          </button>
        </div>

        {/* 1. BMI TAB */}
        {activeTab === 'bmi' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
              <div className="md:col-span-6 space-y-5">
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  Body Mass Index (BMI)
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Calculates ratio of body mass to height squared. Evaluated against the WHO expert consensus for Asian Indian populations.
                </p>

                {/* Weight slider & input */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    <span>Weight (kg)</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{bmiWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="140"
                    step="0.5"
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(parseFloat(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>

                {/* Height slider & input */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    <span>Height (cm)</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{bmiHeight} cm ({Math.floor(bmiHeight / 30.48)}' {Math.round((bmiHeight % 30.48) / 2.54)}")</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="215"
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-700"
                  />
                </div>
              </div>

              {/* BMI Output Card */}
              <div className="md:col-span-6 flex flex-col justify-between p-5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <div>
                  <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Calculated BMI</span>
                  <div className="text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1 mb-2">
                    {bmiScore} <span className="text-sm font-sans font-normal text-stone-500">kg/m²</span>
                  </div>
                  <div className={`text-sm font-semibold ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    {bmiCategory.desc}
                  </p>
                </div>

                {/* Asian Standard Scale Legend */}
                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                  <div className="font-semibold text-stone-700 dark:text-stone-300">
                    Why Asian Indian Cutoffs Differ:
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    The WHO and Indian Ministry of Health revised BMI cutoffs for South Asians because Indians experience higher visceral adiposity and insulin resistance at lower BMI levels compared to Western populations. Normal is 18.5 – 22.9 (instead of 24.9).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TDEE TAB */}
        {activeTab === 'tdee' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
              <div className="md:col-span-6 space-y-4">
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  Total Daily Energy Expenditure (TDEE)
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Uses the clinical Mifflin-St Jeor equation to estimate resting metabolic rate (BMR), multiplied by physical activity factor.
                </p>

                {/* Gender toggle */}
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-2 rounded-lg font-medium border transition ${
                      gender === 'male'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-2 rounded-lg font-medium border transition ${
                      gender === 'female'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    Female
                  </button>
                </div>

                {/* Age & Weight & Height */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-stone-500">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                      className="w-full mt-1 p-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-500">Weight (kg)</label>
                    <input
                      type="number"
                      value={calWeight}
                      onChange={(e) => setCalWeight(parseFloat(e.target.value) || 50)}
                      className="w-full mt-1 p-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-500">Height (cm)</label>
                    <input
                      type="number"
                      value={calHeight}
                      onChange={(e) => setCalHeight(parseInt(e.target.value) || 160)}
                      className="w-full mt-1 p-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                </div>

                {/* Activity level */}
                <div>
                  <label className="text-[11px] font-medium text-stone-500">Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                    className="w-full mt-1 p-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  >
                    <option value={1.2}>Sedentary (Desk work, little exercise)</option>
                    <option value={1.375}>Lightly Active (1-3 days walking / yoga)</option>
                    <option value={1.55}>Moderately Active (3-5 days gym / sports)</option>
                    <option value={1.725}>Very Active (6-7 days intense training)</option>
                  </select>
                </div>

                {/* Goal */}
                <div>
                  <label className="text-[11px] font-medium text-stone-500">Nutritional Goal</label>
                  <div className="flex gap-2 mt-1 text-xs">
                    <button
                      onClick={() => setGoal('cut')}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium ${
                        goal === 'cut' ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      Fat Loss (-350 kcal)
                    </button>
                    <button
                      onClick={() => setGoal('maintain')}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium ${
                        goal === 'maintain' ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      Maintain Weight
                    </button>
                    <button
                      onClick={() => setGoal('gain')}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium ${
                        goal === 'gain' ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300' : 'border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      Lean Bulk (+350 kcal)
                    </button>
                  </div>
                </div>
              </div>

              {/* TDEE Output */}
              <div className="md:col-span-6 flex flex-col justify-between p-5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <div className="space-y-4">
                  <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Recommended Daily Intake</span>
                  <div className="text-4xl font-serif font-bold text-emerald-800 dark:text-emerald-400">
                    {targetCalories} <span className="text-sm font-sans font-normal text-stone-500">kcal/day</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500">Basal Metabolic Rate (BMR):</span>
                      <strong className="text-stone-800 dark:text-stone-200">{bmr} kcal</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500">Maintenance TDEE:</span>
                      <strong className="text-stone-800 dark:text-stone-200">{tdee} kcal</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Selected Target:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">{targetCalories} kcal</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 text-xs">
                  <Link
                    to="/meal-planner"
                    className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
                  >
                    Build a personalized Indian meal plan for {targetCalories} kcal <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. WATER TAB */}
        {activeTab === 'water' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
              <div className="md:col-span-6 space-y-4">
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  Daily Hydration Calculator
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Accounts for body weight, Indian tropical ambient climate, and exercise perspiration.
                </p>

                <div>
                  <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    <span>Body Weight (kg)</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{waterWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={waterWeight}
                    onChange={(e) => setWaterWeight(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-500">Climate Environment</label>
                  <div className="flex gap-2 mt-1 text-xs">
                    <button
                      onClick={() => setClimate('moderate')}
                      className={`flex-1 py-2 rounded-lg border font-medium ${
                        climate === 'moderate' ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300' : 'border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      Air Conditioned / Mild
                    </button>
                    <button
                      onClick={() => setClimate('hot')}
                      className={`flex-1 py-2 rounded-lg border font-medium ${
                        climate === 'hot' ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300' : 'border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      Warm / Tropical Indian Summer
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    <span>Daily Physical Activity / Sweat</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{exerciseMins} mins</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="15"
                    value={exerciseMins}
                    onChange={(e) => setExerciseMins(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-700"
                  />
                </div>
              </div>

              {/* Water Output */}
              <div className="md:col-span-6 flex flex-col justify-between p-5 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/60">
                <div className="space-y-4">
                  <span className="text-xs font-medium text-sky-800 dark:text-sky-400 uppercase tracking-wider">Estimated Fluid Requirement</span>
                  <div className="text-4xl font-serif font-bold text-sky-900 dark:text-sky-200">
                    {dailyWaterMl} <span className="text-sm font-sans font-normal text-stone-500">ml/day</span>
                  </div>
                  <div className="text-xs text-sky-800 dark:text-sky-300 font-medium">
                    Equivalent to approximately <strong>{dailyWaterGlasses} glasses</strong> of water (250 ml each).
                  </div>

                  <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-sky-100 dark:border-sky-900 text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                    <strong className="text-sky-800 dark:text-sky-400">Ayurvedic Wisdom on Ushapan:</strong> Drink 1-2 glasses of warm or room-temperature water upon waking. Avoid ice-cold beverages during heavy meals as cold suppresses digestive Agni.
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-sky-200 dark:border-sky-900 text-xs">
                  <Link
                    to="/habit-tracker"
                    className="inline-flex items-center gap-1.5 font-semibold text-sky-800 dark:text-sky-400 hover:underline"
                  >
                    Track your daily glasses in Habit Tracker <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. PROTEIN TAB */}
        {activeTab === 'protein' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
              <div className="md:col-span-6 space-y-4">
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  Protein Requirement Calculator
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Based on ICMR-NIN RDA benchmarks and sports nutrition literature for preserving muscle mass and metabolic health.
                </p>

                <div>
                  <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    <span>Body Weight (kg)</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{proteinWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={proteinWeight}
                    onChange={(e) => setProteinWeight(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-500">Activity & Training Profile</label>
                  <div className="space-y-2 mt-1">
                    {(['sedentary', 'moderate', 'athletic'] as const).map((key) => (
                      <div
                        key={key}
                        onClick={() => setLifestyle(key)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                          lifestyle === key
                            ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                            : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span>{proteinMultipliers[key].label}</span>
                        {lifestyle === key && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Protein Output */}
              <div className="md:col-span-6 flex flex-col justify-between p-5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <div className="space-y-4">
                  <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Recommended Daily Protein</span>
                  <div className="text-4xl font-serif font-bold text-emerald-800 dark:text-emerald-400">
                    {minProtein} - {maxProtein} <span className="text-sm font-sans font-normal text-stone-500">g/day</span>
                  </div>

                  <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                    <p className="leading-relaxed">
                      For vegetarian Indian diets, combining complementary sources like <strong>Dal + Rice</strong> (lysine + methionine pairing), Paneer, Soya Chunks, Sattu, Besan, and Curd delivers complete amino acid profiles.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 text-xs">
                  <Link
                    to="/food-explorer"
                    className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
                  >
                    Explore high-protein Indian foods in Food Explorer <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Responsible Disclaimer Box */}
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-stone-800 dark:text-stone-200">
              Responsible Health & Medical Disclaimer
            </div>
            <p className="leading-relaxed text-[11px]">
              These calculators provide informational estimates grounded in population-level formulas (WHO Asian BMI, Mifflin-St Jeor TDEE, ICMR-NIN RDA). They do not constitute clinical diagnosis, personalized medical advice, or renal nutrition therapy. Consult a licensed physician or registered dietitian before undertaking aggressive caloric or dietary modifications.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
