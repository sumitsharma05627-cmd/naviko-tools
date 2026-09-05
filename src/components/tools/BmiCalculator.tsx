import React, { useState } from 'react';
import {
  Scale,
  Activity,
  Heart,
  Info,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Bookmark,
  User,
  Calculator
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';

type UnitSystem = 'metric' | 'imperial';
type SexOption = 'male' | 'female' | 'unspecified';

export const BmiCalculator: React.FC = () => {
  const { user, isAuthenticated, token } = useAuth();
  const { saveUserItem } = useSubscription();

  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [age, setAge] = useState<string>('25');
  const [sex, setSex] = useState<SexOption>('unspecified');

  // Metric inputs
  const [heightCm, setHeightCm] = useState<string>('172');
  const [weightKg, setWeightKg] = useState<string>('68');

  // Imperial inputs
  const [heightFt, setHeightFt] = useState<string>('5');
  const [heightIn, setHeightIn] = useState<string>('8');
  const [weightLbs, setWeightLbs] = useState<string>('150');

  const [hasCalculated, setHasCalculated] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Conversion calculations
  const numAge = parseInt(age, 10) || 0;
  const isUnder18 = numAge > 0 && numAge < 18;

  let totalHeightMeters = 0;
  let totalWeightKg = 0;

  if (unit === 'metric') {
    const cm = parseFloat(heightCm) || 0;
    totalHeightMeters = cm / 100;
    totalWeightKg = parseFloat(weightKg) || 0;
  } else {
    const ft = parseFloat(heightFt) || 0;
    const inch = parseFloat(heightIn) || 0;
    const totalInches = ft * 12 + inch;
    totalHeightMeters = totalInches * 0.0254;
    const lbs = parseFloat(weightLbs) || 0;
    totalWeightKg = lbs * 0.45359237;
  }

  // BMI Calculation
  let bmiValue: number | null = null;
  if (totalHeightMeters > 0.4 && totalWeightKg > 10) {
    bmiValue = totalWeightKg / (totalHeightMeters * totalHeightMeters);
  }

  // Adult Categories
  const getBmiCategory = (val: number) => {
    if (val < 18.5) {
      return {
        label: 'Underweight',
        color: 'text-sky-600 dark:text-sky-400',
        bg: 'bg-sky-500/10 border-sky-500/30',
        badgeBg: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800',
        description: 'Below standard reference weight range for height.',
        guidance: 'Consider consulting a healthcare professional or nutritionist for nutrient-dense, balanced meal strategies.'
      };
    } else if (val < 25.0) {
      return {
        label: 'Healthy Weight',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        description: 'Within standard healthy reference range for height.',
        guidance: 'Maintain balanced nutrition, consistent physical activity, adequate hydration, and restorative sleep.'
      };
    } else if (val < 30.0) {
      return {
        label: 'Overweight',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        description: 'Above standard reference range for height.',
        guidance: 'Focus on wholesome home-cooked meals, dietary fiber, hydration, and regular enjoyable daily movement.'
      };
    } else {
      return {
        label: 'Obesity Class',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        description: 'Significantly elevated mass relative to stature.',
        guidance: 'A licensed doctor or registered dietitian can provide holistic, personalized metabolic and lifestyle guidance.'
      };
    }
  };

  const category = bmiValue !== null ? getBmiCategory(bmiValue) : null;

  // Healthy weight range for this height (18.5 to 24.9 BMI)
  const minHealthyKg = totalHeightMeters > 0 ? 18.5 * totalHeightMeters * totalHeightMeters : 0;
  const maxHealthyKg = totalHeightMeters > 0 ? 24.9 * totalHeightMeters * totalHeightMeters : 0;
  const minHealthyLbs = minHealthyKg * 2.20462;
  const maxHealthyLbs = maxHealthyKg * 2.20462;

  const validateInputs = (): boolean => {
    if (!age || numAge < 2 || numAge > 120) {
      setValidationError('Please enter a valid age between 2 and 120 years.');
      return false;
    }
    if (unit === 'metric') {
      const cm = parseFloat(heightCm);
      const kg = parseFloat(weightKg);
      if (!cm || cm < 50 || cm > 260) {
        setValidationError('Please enter a valid height between 50 cm and 260 cm.');
        return false;
      }
      if (!kg || kg < 10 || kg > 400) {
        setValidationError('Please enter a valid weight between 10 kg and 400 kg.');
        return false;
      }
    } else {
      const ft = parseFloat(heightFt);
      const inch = parseFloat(heightIn);
      const lbs = parseFloat(weightLbs);
      if (!ft || ft < 2 || ft > 8 || inch < 0 || inch > 11.9) {
        setValidationError('Please enter a valid height in feet and inches (2 ft – 8 ft).');
        return false;
      }
      if (!lbs || lbs < 20 || lbs > 800) {
        setValidationError('Please enter a valid weight in pounds (20 lbs – 800 lbs).');
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleCalculate = () => {
    if (validateInputs()) {
      setHasCalculated(true);
      // Smooth scroll to results
      const resultsEl = document.getElementById('bmi-results-section');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleReset = () => {
    setUnit('metric');
    setAge('25');
    setSex('unspecified');
    setHeightCm('172');
    setWeightKg('68');
    setHeightFt('5');
    setHeightIn('8');
    setWeightLbs('150');
    setValidationError(null);
    setHasCalculated(true);
    setSavedSuccess(false);
    setShowSavePrompt(false);
  };

  const handleCopy = () => {
    if (!bmiValue) return;
    const text = isUnder18
      ? `BMI Calculation: ${bmiValue.toFixed(1)} kg/m² (Age: ${age}, Sex: ${sex}). Note: For users under 18, BMI is interpreted using pediatric growth percentiles.`
      : `My BMI is ${bmiValue.toFixed(1)} kg/m² (${category?.label}) based on height ${(totalHeightMeters * 100).toFixed(0)}cm and weight ${totalWeightKg.toFixed(1)}kg. Healthy range for height: ${minHealthyKg.toFixed(1)}–${maxHealthyKg.toFixed(1)} kg. Calculated on NAVIKO.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveResult = async () => {
    if (!bmiValue) return;

    if (!isAuthenticated) {
      setShowSavePrompt(true);
      return;
    }

    const payload = {
      type: 'bmi_result',
      title: `BMI ${bmiValue.toFixed(1)} (${category?.label || 'Screening'})`,
      bmi: parseFloat(bmiValue.toFixed(1)),
      category: category?.label,
      age: numAge,
      sex,
      heightMeters: parseFloat(totalHeightMeters.toFixed(2)),
      weightKg: parseFloat(totalWeightKg.toFixed(1)),
      isMinor: isUnder18,
      healthyRangeKg: `${minHealthyKg.toFixed(1)} – ${maxHealthyKg.toFixed(1)} kg`,
      calculatedAt: new Date().toISOString()
    };

    // Save locally via Subscription context
    saveUserItem('bmi_history', payload.title, payload);

    // Also persist to backend if authenticated
    try {
      if (token) {
        await fetch('/api/user/saved-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // Graceful local persistence fallback
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Switch units and convert values
  const switchUnit = (newUnit: UnitSystem) => {
    if (newUnit === unit) return;
    if (newUnit === 'imperial') {
      const cm = parseFloat(heightCm) || 172;
      const totalInches = cm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inch = Math.round(totalInches % 12);
      const kg = parseFloat(weightKg) || 68;
      const lbs = Math.round(kg * 2.20462);

      setHeightFt(ft.toString());
      setHeightIn(inch.toString());
      setWeightLbs(lbs.toString());
    } else {
      const ft = parseFloat(heightFt) || 5;
      const inch = parseFloat(heightIn) || 8;
      const cm = Math.round((ft * 12 + inch) * 2.54);
      const lbs = parseFloat(weightLbs) || 150;
      const kg = Math.round(lbs / 2.20462);

      setHeightCm(cm.toString());
      setWeightKg(kg.toString());
    }
    setUnit(newUnit);
  };

  // Gauge position percentage (range 14 to 38)
  const getGaugePercentage = (val: number) => {
    const minScale = 14;
    const maxScale = 38;
    const clamped = Math.min(Math.max(val, minScale), maxScale);
    return ((clamped - minScale) / (maxScale - minScale)) * 100;
  };

  const faqs = [
    {
      q: 'Why is BMI considered a screening tool rather than a diagnostic tool?',
      a: 'BMI is an inexpensive, non-invasive calculation that provides a population-level correlation between stature and mass. However, because it only measures total weight divided by height squared, it cannot distinguish between dense muscle mass, bone density, water retention, and actual adipose (fat) tissue.'
    },
    {
      q: 'Why do children and adolescents (under 18) have different BMI interpretations?',
      a: 'Children and teens are in an active stage of physiological growth and hormonal maturation. Their body composition changes rapidly as they develop. Therefore, health professionals do not use fixed adult BMI numbers. Instead, they plot BMI on age-and-sex-specific growth percentile charts (such as WHO or CDC growth charts) to observe continuous development trajectories over time.'
    },
    {
      q: 'What is the difference between Asian and Western BMI thresholds?',
      a: 'The World Health Organization (WHO) and Indian medical councils (ICMR/NIN) have identified that people of South Asian descent often have a higher proportion of visceral abdominal fat and increased metabolic risk at lower BMI levels compared to European populations. Consequently, clinical guidelines in India often consider a BMI of 23.0 to 24.9 as overweight and ≥25.0 as obese for clinical risk assessments.'
    },
    {
      q: 'Can an athlete or bodybuilder have an "overweight" BMI while being healthy?',
      a: 'Yes. Skeletal muscle tissue is denser than adipose tissue. Well-trained athletes, weightlifters, and fitness enthusiasts frequently register BMI numbers in the "overweight" or "obese" categories despite having very low body fat percentages and excellent cardiovascular profiles.'
    },
    {
      q: 'What other metrics can I track alongside BMI?',
      a: 'Healthcare experts recommend complementary measurements such as Waist-to-Height Ratio (aiming for waist circumference less than half your height), resting blood pressure, fasting lipid panels, physical endurance, and functional strength.'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Calculator Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
        {/* Header & Unit Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
              <Scale className="w-3.5 h-3.5" /> Evidence-Based Biometrics
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Body Mass Index (BMI) Calculator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Standard body mass screening with pediatric guidance and healthy reference weight ranges.
            </p>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center self-start sm:self-auto bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => switchUnit('metric')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unit === 'metric'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Metric (cm, kg)
            </button>
            <button
              onClick={() => switchUnit('imperial')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unit === 'imperial'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Imperial (ft, in, lbs)
            </button>
          </div>
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
          {/* Age Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Age (Years) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="2"
              max="120"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setValidationError(null);
              }}
              placeholder="e.g. 25"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-base"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {numAge > 0 && numAge < 18
                ? '👶 Under 18: Pediatric percentile guidelines'
                : 'Adult reference guidelines (18+)'}
            </span>
          </div>

          {/* Sex Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Sex
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSex('male')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  sex === 'male'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setSex('female')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  sex === 'female'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setSex('unspecified')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  sex === 'unspecified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Other
              </button>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Used for growth charts in minors
            </span>
          </div>

          {/* Height Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Height {unit === 'metric' ? '(cm)' : '(ft & in)'} <span className="text-rose-500">*</span>
            </label>
            {unit === 'metric' ? (
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="260"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => {
                    setHeightCm(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="172"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-base pr-12"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                  cm
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={heightFt}
                    onChange={(e) => {
                      setHeightFt(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="5"
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-base pr-8"
                  />
                  <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">
                    ft
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightIn}
                    onChange={(e) => {
                      setHeightIn(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="8"
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-base pr-8"
                  />
                  <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">
                    in
                  </span>
                </div>
              </div>
            )}
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {totalHeightMeters > 0 && (
                <>≈ {totalHeightMeters.toFixed(2)} m ({((totalHeightMeters * 39.3701) / 12).toFixed(1)} ft)</>
              )}
            </span>
          </div>

          {/* Weight Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Weight {unit === 'metric' ? '(kg)' : '(lbs)'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              {unit === 'metric' ? (
                <input
                  type="number"
                  min="10"
                  max="400"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => {
                    setWeightKg(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="68"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-base pr-12"
                />
              ) : (
                <input
                  type="number"
                  min="20"
                  max="800"
                  step="0.5"
                  value={weightLbs}
                  onChange={(e) => {
                    setWeightLbs(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="150"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-base pr-12"
                />
              )}
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                {unit === 'metric' ? 'kg' : 'lbs'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {totalWeightKg > 0 && (
                <>≈ {totalWeightKg.toFixed(1)} kg ({(totalWeightKg * 2.20462).toFixed(1)} lbs)</>
              )}
            </span>
          </div>
        </div>

        {/* Validation error notice if invalid */}
        {validationError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCalculate}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate BMI</span>
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {bmiValue && hasCalculated && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveResult}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer transition-colors"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Result Saved!' : 'Save Result'}</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Not logged in save prompt */}
        {showSavePrompt && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div>
              <strong>Save your calculation history:</strong> Create a free account or log in to store your BMI tracking records permanently across devices.
            </div>
            <a
              href="/login"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 text-center shrink-0 cursor-pointer"
            >
              Log In / Sign Up
            </a>
          </div>
        )}

        {/* 2. RESULTS DISPLAY */}
        {bmiValue !== null && hasCalculated && (
          <div id="bmi-results-section" className="mt-8 pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
            {/* UNDER 18 SAFETY BANNER (STRICT USER SPECIFICATION) */}
            {isUnder18 ? (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-amber-900 dark:text-amber-200">
                      Pediatric Guidance Notice (Age {age}): Age-Specific Growth Percentiles Apply
                    </h3>
                    <p className="text-sm text-amber-800/90 dark:text-amber-300 mt-1 leading-relaxed">
                      For children and adolescents under 18, standard adult BMI categories <strong>do not apply</strong>. Growth and development occur rapidly during youth, and healthcare professionals evaluate body metrics using <strong>age- and sex-specific growth percentiles</strong> over time.
                    </p>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-xl border border-amber-500/20 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Calculated Mass-to-Height Ratio:</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{bmiValue.toFixed(1)} kg/m²</span>
                  </div>
                  <p className="leading-relaxed">
                    This number is an educational screening reference. It is <strong>NOT a medical diagnosis</strong>. Growing individuals should never engage in restrictive dieting, fasting, extreme exercise, or rapid weight loss. Wholesome nutrition is essential for bone mineralization, hormonal balance, brain development, and athletic vitality.
                  </p>
                  <p className="font-semibold text-amber-900 dark:text-amber-300 pt-1">
                    👉 Please discuss your growth, sports development, and nutrition with a parent/guardian and a qualified pediatrician.
                  </p>
                </div>
              </div>
            ) : (
              /* ADULT RESULTS CARD */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Big Number Tile */}
                  <div className="md:col-span-5 bg-gradient-to-br from-emerald-500/5 via-slate-50 to-indigo-500/5 dark:from-slate-800/60 dark:to-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Your Body Mass Index (BMI)
                    </span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                        {bmiValue.toFixed(1)}
                      </span>
                      <span className="text-xs font-bold text-slate-400">kg/m²</span>
                    </div>

                    {category && (
                      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-extrabold border ${category.badgeBg}`}>
                        {category.label}
                      </div>
                    )}
                  </div>

                  {/* Summary & Metrics Detail */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Visual Meter Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <span>Underweight (&lt;18.5)</span>
                        <span className="text-emerald-600 dark:text-emerald-400">Healthy (18.5–24.9)</span>
                        <span className="text-amber-600 dark:text-amber-400">Overweight (25–29.9)</span>
                        <span className="text-rose-600 dark:text-rose-400">Obese (30+)</span>
                      </div>

                      {/* Spectrum Bar */}
                      <div className="relative h-4 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                        <div className="h-full bg-sky-400" style={{ width: '18.75%' }} title="Underweight (<18.5)" />
                        <div className="h-full bg-emerald-500" style={{ width: '26.66%' }} title="Healthy (18.5-24.9)" />
                        <div className="h-full bg-amber-400" style={{ width: '20.83%' }} title="Overweight (25.0-29.9)" />
                        <div className="h-full bg-rose-500" style={{ width: '33.76%' }} title="Obese (≥30.0)" />

                        {/* Indicator Needle */}
                        <div
                          className="absolute top-0 bottom-0 w-2.5 bg-slate-950 dark:bg-white rounded-full border-2 border-white dark:border-slate-950 shadow-md transition-all duration-300"
                          style={{ left: `calc(${getGaugePercentage(bmiValue)}% - 5px)` }}
                        />
                      </div>
                    </div>

                    {/* Healthy Weight Target */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-medium">Standard Reference Range for your height:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {minHealthyKg.toFixed(1)} kg – {maxHealthyKg.toFixed(1)} kg
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          ({minHealthyLbs.toFixed(0)} – {maxHealthyLbs.toFixed(0)} lbs)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-medium">Screening Guidance:</span>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-normal">
                          {category?.guidance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation breakdown step-by-step */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Mathematical Formula Breakdown:
                  </div>
                  <p className="font-mono text-slate-600 dark:text-slate-400">
                    BMI = Weight (kg) ÷ [Height (m)]² = {totalWeightKg.toFixed(1)} kg ÷ ({totalHeightMeters.toFixed(2)}m × {totalHeightMeters.toFixed(2)}m) = <span className="font-bold text-slate-900 dark:text-white">{bmiValue.toFixed(1)} kg/m²</span>
                  </p>
                </div>
              </div>
            )}

            {/* Recalculate CTA */}
            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Edit measurements &amp; recalculate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. REFERENCE RANGES TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors space-y-5">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Standard Adult BMI Classifications (WHO Reference)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Standard BMI Range (kg/m²)</th>
                <th className="py-3 px-4">Asian Population Reference (WHO/ICMR)</th>
                <th className="py-3 px-4">Health Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-bold text-sky-600 dark:text-sky-400">Underweight</td>
                <td className="py-3.5 px-4 font-semibold">&lt; 18.5</td>
                <td className="py-3.5 px-4 font-semibold">&lt; 18.5</td>
                <td className="py-3.5 px-4 text-slate-500">May indicate reduced nutrient reserves or lower lean muscle mass</td>
              </tr>
              <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">Healthy Weight</td>
                <td className="py-3.5 px-4 font-semibold">18.5 – 24.9</td>
                <td className="py-3.5 px-4 font-semibold">18.5 – 22.9</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">Statistically associated with optimal metabolic longevity and lower chronic risk</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">Overweight</td>
                <td className="py-3.5 px-4 font-semibold">25.0 – 29.9</td>
                <td className="py-3.5 px-4 font-semibold">23.0 – 24.9</td>
                <td className="py-3.5 px-4 text-slate-500">Moderate association with elevated blood pressure and glucose markers</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400">Obesity (Class I–III)</td>
                <td className="py-3.5 px-4 font-semibold">≥ 30.0</td>
                <td className="py-3.5 px-4 font-semibold">≥ 25.0</td>
                <td className="py-3.5 px-4 text-slate-500">Elevated risk profile; comprehensive lifestyle and medical review recommended</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. EDUCATIONAL KNOWLEDGE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: What is BMI & How it works */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            What is Body Mass Index (BMI)?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Body Mass Index (BMI) was created by Belgian mathematician Adolphe Quetelet. It is a straightforward mathematical ratio evaluating whether an individual’s mass is proportionate to their stature.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            It is universally used as a population-level screening metric because it is instant, non-invasive, and mathematically consistent across large groups of people.
          </p>
        </div>

        {/* Card 2: What BMI Does NOT Tell You (Limitations) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Important Limitations of BMI
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span><strong>Muscle vs. Fat:</strong> Skeletal muscle tissue is denser than fat. Athletic individuals may register a higher BMI despite having low body fat and strong cardiovascular health.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span><strong>Fat Distribution:</strong> It cannot distinguish deep visceral (abdominal organ) fat from harmless subcutaneous fat.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span><strong>Age &amp; Bone Density:</strong> Older adults naturally experience gradual muscle loss (sarcopenia) that standard BMI ratios do not capture.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 5. COMPLEMENTARY BODY METRICS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Holistic Health: Beyond BMI
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Modern preventive health science pairs BMI screening with several practical, everyday metrics:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              1. Waist-to-Height Ratio (WHtR)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Aim for your waist circumference to be less than half your height (WHtR &lt; 0.5) to keep visceral abdominal fat in a healthy zone.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              2. Resting Heart Rate &amp; BP
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Resting heart rate (60–100 bpm) and regular blood pressure checks (&lt; 120/80 mmHg) provide direct insights into arterial elasticity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              3. Functional Stamina &amp; Sleep
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Daily aerobic stamina, musculoskeletal mobility, grip strength, and 7–8 hours of restful sleep are essential indicators of longevity.
            </p>
          </div>
        </div>
      </div>

      {/* 6. FAQ SECTION (ACCORDION) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2.5 pl-0 pr-4 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. MEDICAL DISCLAIMER FOOTNOTE */}
      <div className="p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3.5 leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">
            General Educational Screening Notice
          </strong>
          This BMI calculator is provided strictly for educational and informational purposes. It is only a screening measure and does not directly measure body fat or overall health. It is not a substitute for clinical medical evaluation, diagnosis, or personalized medical advice. If you have questions regarding your weight, pediatric development, or nutrition, consult a licensed physician or registered dietitian.
        </div>
      </div>
    </div>
  );
};
