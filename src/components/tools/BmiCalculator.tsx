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
  HelpCircle
} from 'lucide-react';

type UnitSystem = 'metric' | 'imperial';

export const BmiCalculator: React.FC = () => {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [age, setAge] = useState<string>('26');
  const [sex, setSex] = useState<'male' | 'female' | 'unspecified'>('unspecified');

  // Metric inputs
  const [heightCm, setHeightCm] = useState<string>('172');
  const [weightKg, setWeightKg] = useState<string>('68');

  // Imperial inputs
  const [heightFt, setHeightFt] = useState<string>('5');
  const [heightIn, setHeightIn] = useState<string>('8');
  const [weightLbs, setWeightLbs] = useState<string>('150');

  const [copied, setCopied] = useState<boolean>(false);
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
  if (totalHeightMeters > 0.5 && totalWeightKg > 10) {
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
        guidance: 'Consider consulting a healthcare professional or nutritionist for nutrient-dense meal strategies.'
      };
    } else if (val < 25.0) {
      return {
        label: 'Healthy Weight',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        description: 'Within standard healthy reference range for height.',
        guidance: 'Maintain balanced nutrition, regular physical activity, and restorative sleep.'
      };
    } else if (val < 30.0) {
      return {
        label: 'Overweight',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        description: 'Above standard reference range for height.',
        guidance: 'Focus on whole foods, dietary fiber, hydration, and enjoyable daily movement.'
      };
    } else {
      return {
        label: 'Obesity Class',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        description: 'Significantly elevated mass relative to stature.',
        guidance: 'A doctor or registered dietitian can provide holistic, personalized metabolic guidance.'
      };
    }
  };

  const category = bmiValue !== null ? getBmiCategory(bmiValue) : null;

  // Healthy weight range for this height (18.5 to 24.9 BMI)
  const minHealthyKg = totalHeightMeters > 0 ? 18.5 * totalHeightMeters * totalHeightMeters : 0;
  const maxHealthyKg = totalHeightMeters > 0 ? 24.9 * totalHeightMeters * totalHeightMeters : 0;
  const minHealthyLbs = minHealthyKg * 2.20462;
  const maxHealthyLbs = maxHealthyKg * 2.20462;

  const handleReset = () => {
    setUnit('metric');
    setAge('26');
    setSex('unspecified');
    setHeightCm('172');
    setWeightKg('68');
    setHeightFt('5');
    setHeightIn('8');
    setWeightLbs('150');
  };

  const handleCopy = () => {
    if (!bmiValue) return;
    const text = isUnder18
      ? `BMI Calculation: ${bmiValue.toFixed(1)} (Age: ${age}). Note: For users under 18, BMI is interpreted with pediatric growth percentiles.`
      : `My BMI is ${bmiValue.toFixed(1)} (${category?.label}) based on height ${(totalHeightMeters * 100).toFixed(0)}cm and weight ${totalWeightKg.toFixed(1)}kg. Healthy range: ${minHealthyKg.toFixed(1)}–${maxHealthyKg.toFixed(1)} kg. Calculated on NAVIKO.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
              <Scale className="w-3.5 h-3.5" /> Interactive Body Metric Calculator
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Calculate Your Body Mass Index
            </h2>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center self-start sm:self-auto bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => switchUnit('metric')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unit === 'metric'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Metric (cm, kg)
            </button>
            <button
              onClick={() => switchUnit('imperial')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unit === 'imperial'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Imperial (ft, in, lbs)
            </button>
          </div>
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Age Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Age (Years)
            </label>
            <input
              type="number"
              min="2"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 26"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-base"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {numAge < 18 && numAge > 0
                ? 'Under 18: Pediatric reference active'
                : 'Adult reference standards (18+)'}
            </span>
          </div>

          {/* Height Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Height {unit === 'metric' ? '(cm)' : '(Feet & Inches)'}
            </label>
            {unit === 'metric' ? (
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="250"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="172"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-base pr-12"
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
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-base pr-8"
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
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="8"
                    className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-base pr-8"
                  />
                  <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">
                    in
                  </span>
                </div>
              </div>
            )}
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {totalHeightMeters > 0 && (
                <>Equivalent to {totalHeightMeters.toFixed(2)} meters ({((totalHeightMeters * 39.3701) / 12).toFixed(1)} ft)</>
              )}
            </span>
          </div>

          {/* Weight Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
            </label>
            <div className="relative">
              {unit === 'metric' ? (
                <input
                  type="number"
                  min="10"
                  max="350"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="68"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-base pr-12"
                />
              ) : (
                <input
                  type="number"
                  min="20"
                  max="800"
                  step="0.5"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  placeholder="150"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-base pr-12"
                />
              )}
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                {unit === 'metric' ? 'kg' : 'lbs'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {totalWeightKg > 0 && (
                <>Equivalent to {totalWeightKg.toFixed(1)} kg ({(totalWeightKg * 2.20462).toFixed(1)} lbs)</>
              )}
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults
          </button>
          {bmiValue && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Summary Copied!' : 'Copy Summary'}
            </button>
          )}
        </div>

        {/* 2. RESULTS DISPLAY */}
        {bmiValue !== null && (
          <div className="mt-8 pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
            {/* UNDER 18 SAFETY BANNER (MANDATORY REQUIREMENT) */}
            {isUnder18 ? (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-amber-900 dark:text-amber-200">
                      Pediatric Notice (Age {age}): Age-Specific Growth Percentiles Apply
                    </h3>
                    <p className="text-sm text-amber-800/90 dark:text-amber-300 mt-1 leading-relaxed">
                      For children and teenagers, BMI is interpreted using <strong>age- and sex-specific growth references</strong> (such as WHO or CDC growth percentiles). <strong>Adult BMI categories should not be used for this age group.</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-amber-500/20 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Calculated Ratio:</span>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{bmiValue.toFixed(1)} kg/m²</span>
                  </div>
                  <p className="leading-relaxed">
                    A qualified healthcare provider or pediatrician evaluates this number in relation to growth curves over time rather than static adult thresholds. Adolescents require supportive nutrition for bone development, cognitive stamina, and hormonal health.
                  </p>
                </div>
              </div>
            ) : (
              /* ADULT RESULTS */
              <div className="space-y-6">
                {/* Result Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Big Number Tile */}
                  <div className="md:col-span-5 bg-gradient-to-br from-indigo-500/5 via-slate-50 to-emerald-500/5 dark:from-slate-800/60 dark:to-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center">
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
                        <span className="text-slate-500 dark:text-slate-400 block font-medium">Health Guidance:</span>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-normal">
                          {category?.guidance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation breakdown step-by-step */}
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    How this was calculated:
                  </div>
                  <p className="font-mono text-slate-600 dark:text-slate-400">
                    BMI = Weight (kg) ÷ [Height (m)]² = {totalWeightKg.toFixed(1)} kg ÷ ({totalHeightMeters.toFixed(2)}m × {totalHeightMeters.toFixed(2)}m) = <span className="font-bold text-slate-900 dark:text-white">{bmiValue.toFixed(1)} kg/m²</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. REFERENCE RANGES TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors space-y-5">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Standard Adult BMI Classifications (WHO)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Standard BMI Range (kg/m²)</th>
                <th className="py-3 px-4">Asian Population Reference (WHO)</th>
                <th className="py-3 px-4">Health Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-bold text-sky-600 dark:text-sky-400">Underweight</td>
                <td className="py-3.5 px-4 font-semibold">&lt; 18.5</td>
                <td className="py-3.5 px-4 font-semibold">&lt; 18.5</td>
                <td className="py-3.5 px-4 text-slate-500">May indicate reduced nutrient reserves or lean mass deficiency</td>
              </tr>
              <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">Healthy Weight</td>
                <td className="py-3.5 px-4 font-semibold">18.5 – 24.9</td>
                <td className="py-3.5 px-4 font-semibold">18.5 – 22.9</td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">Associated with optimal statistical longevity and lowest chronic risk</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">Overweight</td>
                <td className="py-3.5 px-4 font-semibold">25.0 – 29.9</td>
                <td className="py-3.5 px-4 font-semibold">23.0 – 24.9</td>
                <td className="py-3.5 px-4 text-slate-500">Moderate statistical association with elevated blood pressure and glucose</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400">Obesity (Class I–III)</td>
                <td className="py-3.5 px-4 font-semibold">≥ 30.0</td>
                <td className="py-3.5 px-4 font-semibold">≥ 25.0</td>
                <td className="py-3.5 px-4 text-slate-500">Higher risk profile; comprehensive lifestyle and medical review recommended</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. EDUCATIONAL KNOWLEDGE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: What is BMI & How it works */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            What is Body Mass Index (BMI)?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Body Mass Index (BMI) was created in the 1830s by Belgian statistician Adolphe Quetelet. It is a straightforward mathematical ratio designed to assess whether an individual’s mass is proportionate to their skeletal height.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            It is universally used by public health organizations because it is instant, non-invasive, and mathematically consistent across large epidemiological populations.
          </p>
        </div>

        {/* Card 2: What BMI Does NOT Tell You (Limitations) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            The Important Limitations of BMI
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
              <span><strong>Muscle vs. Fat:</strong> Muscle tissue is ~18% denser than fat. Athletic individuals may register a high BMI despite minimal body fat.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
              <span><strong>Fat Distribution:</strong> It cannot distinguish harmful visceral (abdominal organ) fat from harmless subcutaneous fat.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
              <span><strong>Age Variations:</strong> Older adults naturally experience muscle atrophy (sarcopenia) that BMI numbers do not reflect.</span>
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
          Modern preventive health science pairs BMI with several practical, at-home measurements:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              1. Waist-to-Height Ratio (WHtR)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Keep your waist circumference to less than half your height (WHtR &lt; 0.5) to maintain healthy visceral fat levels.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              2. Resting Heart Rate &amp; BP
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Resting heart rate (60–100 bpm) and blood pressure (&lt; 120/80 mmHg) offer direct insights into cardiovascular health.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              3. Functional Mobility
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Daily stamina, aerobic endurance, grip strength, and restful sleep are vital indicators of everyday vitality.
            </p>
          </div>
        </div>
      </div>

      {/* 6. FAQ SECTION (ACCORDION) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
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
          This BMI calculator is provided strictly for educational and informational purposes. It is not a substitute for clinical medical evaluation, diagnosis, or personalized medical advice. If you have questions about your weight, pediatric growth, or nutrition, consult a licensed healthcare practitioner or registered dietitian.
        </div>
      </div>
    </div>
  );
};
