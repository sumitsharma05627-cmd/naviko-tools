import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, AlertTriangle, ShieldCheck, CheckCircle2, 
  Sparkles, Info, HelpCircle, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { INS_ADDITIVES_DATABASE, InsAdditive } from '../data/nutritionData';
import { useSEO } from '../utils/seo';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';

interface LabelAnalyzerPageProps {
  onNavigate: (path: string) => void;
}

const COMMON_SUGAR_ALIASES = [
  'sugar', 'sucrose', 'glucose', 'fructose', 'maltose', 'dextrose', 
  'maltodextrin', 'high fructose corn syrup', 'invert sugar', 
  'corn syrup', 'liquid glucose', 'honey', 'molasses', 'fruit juice concentrate'
];

const COMMON_ALLERGENS_LIST = [
  { name: 'Gluten / Wheat', keywords: ['wheat', 'maida', 'atta', 'gluten', 'barley', 'rye', 'semolina', 'suji'] },
  { name: 'Dairy / Milk', keywords: ['milk', 'milk solids', 'whey', 'casein', 'butter', 'ghee', 'cheese', 'lactose'] },
  { name: 'Soy', keywords: ['soy', 'soya', 'soy lecithin', 'soybean', 'hydrolyzed soy'] },
  { name: 'Peanuts & Tree Nuts', keywords: ['peanut', 'almond', 'cashew', 'walnut', 'pistachio', 'hazelnut'] },
  { name: 'Sulphites', keywords: ['sulphite', 'sulfite', 'sulphur dioxide', 'ins 220', 'ins 221', 'ins 222'] }
];

// Sample packaged food labels from Indian supermarkets
const SAMPLE_LABELS = [
  {
    name: 'Packaged "Diet" Digestive Biscuits',
    servingSizeG: 25,
    calories: 120,
    protein: 2.2,
    carbs: 16.5,
    addedSugar: 4.8,
    fiber: 1.8,
    fat: 5.0,
    saturatedFat: 2.2,
    sodium: 140,
    ingredients: 'Refined Wheat Flour (Maida 45%), Whole Wheat Flour (Atta 20%), Palm Oil, Sugar, Invert Sugar Syrup, Maltodextrin, Wheat Bran (4%), Raising Agents (INS 503ii, INS 500ii), Salt, Emulsifier (INS 322 from Soy), Acidity Regulator (INS 330).'
  },
  {
    name: 'Instant Masala Noodles',
    servingSizeG: 70,
    calories: 312,
    protein: 6.8,
    carbs: 43.5,
    addedSugar: 1.5,
    fiber: 2.5,
    fat: 12.0,
    saturatedFat: 6.2,
    sodium: 840,
    ingredients: 'Refined Wheat Flour (Maida), Palm Oil, Salt, Wheat Gluten, Mineral (Calcium Carbonate), Seasoning: Hydrolyzed Groundnut Protein, Mixed Spices (Onion Powder, Coriander, Chili, Turmeric), Flavor Enhancer (INS 621, INS 627, INS 631), Caramel Color (INS 150d), Acidity Regulator (INS 330), Thickener (INS 412).'
  },
  {
    name: '"100% Real" Packaged Fruit Juice',
    servingSizeG: 200,
    calories: 110,
    protein: 0.6,
    carbs: 26.0,
    addedSugar: 14.0,
    fiber: 0.4,
    fat: 0.1,
    saturatedFat: 0.0,
    sodium: 30,
    ingredients: 'Water, Mixed Fruit Juice Concentrate (Apple, Guava, Mango 35%), Sugar, Acidity Regulator (INS 330), Antioxidant (INS 300 - Vitamin C), Preservative (INS 211), Stabilizer (INS 440).'
  }
];

export const LabelAnalyzerPage: React.FC<LabelAnalyzerPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Packaged Food Label & INS Additive Decoder | NAVIKO',
    description: 'Paste any Indian packaged food ingredient list or nutrition table. Automatically detect hidden sugars, decode INS food additives (MSG, preservatives, colors), and uncover marketing claims.',
    canonical: '/label-analyzer',
    robots: 'index, follow',
    ogType: 'website'
  });

  const [ingredientsText, setIngredientsText] = useState(SAMPLE_LABELS[0].ingredients);
  const [servingSize, setServingSize] = useState<number>(SAMPLE_LABELS[0].servingSizeG);
  const [calories, setCalories] = useState<number>(SAMPLE_LABELS[0].calories);
  const [protein, setProtein] = useState<number>(SAMPLE_LABELS[0].protein);
  const [carbs, setCarbs] = useState<number>(SAMPLE_LABELS[0].carbs);
  const [addedSugar, setAddedSugar] = useState<number>(SAMPLE_LABELS[0].addedSugar);
  const [fat, setFat] = useState<number>(SAMPLE_LABELS[0].fat);
  const [saturatedFat, setSaturatedFat] = useState<number>(SAMPLE_LABELS[0].saturatedFat);
  const [sodium, setSodium] = useState<number>(SAMPLE_LABELS[0].sodium);

  const loadSample = (sample: typeof SAMPLE_LABELS[0]) => {
    setIngredientsText(sample.ingredients);
    setServingSize(sample.servingSizeG);
    setCalories(sample.calories);
    setProtein(sample.protein);
    setCarbs(sample.carbs);
    setAddedSugar(sample.addedSugar);
    setFat(sample.fat);
    setSaturatedFat(sample.saturatedFat);
    setSodium(sample.sodium);
  };

  // 1. Matched INS Additives
  const detectedAdditives = useMemo<InsAdditive[]>(() => {
    if (!ingredientsText) return [];
    const textLower = ingredientsText.toLowerCase();
    return INS_ADDITIVES_DATABASE.filter(add => {
      const codeClean = add.insNumber.toLowerCase().replace(/\s+/g, '');
      const codeStandard = add.insNumber.toLowerCase();
      const nameLower = add.commonName.toLowerCase();
      return (
        textLower.includes(codeStandard) ||
        textLower.includes(codeClean) ||
        textLower.includes(nameLower)
      );
    });
  }, [ingredientsText]);

  // 2. Detected Hidden Sugars
  const detectedSugars = useMemo<string[]>(() => {
    if (!ingredientsText) return [];
    const textLower = ingredientsText.toLowerCase();
    return COMMON_SUGAR_ALIASES.filter(sugar => textLower.includes(sugar));
  }, [ingredientsText]);

  // 3. Detected Allergens
  const detectedAllergens = useMemo<string[]>(() => {
    if (!ingredientsText) return [];
    const textLower = ingredientsText.toLowerCase();
    return COMMON_ALLERGENS_LIST.filter(a => 
      a.keywords.some(k => textLower.includes(k))
    ).map(a => a.name);
  }, [ingredientsText]);

  // 4. Marketing Claims Reality Checks
  const realityChecks = useMemo(() => {
    const checks: { claim: string; verdict: 'Good' | 'Caution' | 'Misleading'; explanation: string }[] = [];

    // Sugar reality
    if (addedSugar > 10) {
      checks.push({
        claim: 'Sugar Density Check',
        verdict: 'Caution',
        explanation: `Contains ${addedSugar}g added sugar per small ${servingSize}g serving (~2.5 teaspoons of sugar). This represents over 40% of the recommended daily limit for free sugars in a single portion.`
      });
    }

    // "Diet / Digestive" check
    if (ingredientsText.toLowerCase().includes('maida') && (ingredientsText.toLowerCase().includes('digestive') || ingredientsText.toLowerCase().includes('wheat'))) {
      checks.push({
        claim: '"Digestive" or "Wheat" marketing claim',
        verdict: 'Misleading',
        explanation: 'The first ingredient is Refined Wheat Flour (Maida). Under Indian food regulations, ingredients are listed in order of descending weight. Even though it is marketed as a "Digestive" biscuit, the majority of the flour is refined maida.'
      });
    }

    // High Protein Check
    const proteinCalories = protein * 4;
    const proteinCaloriePct = calories > 0 ? (proteinCalories / calories) * 100 : 0;
    if (proteinCaloriePct >= 20) {
      checks.push({
        claim: 'Protein Source Check',
        verdict: 'Good',
        explanation: `Protein supplies ${Math.round(proteinCaloriePct)}% of total energy in this product, satisfying FSSAI criteria for a "High Protein" claim.`
      });
    } else if (protein > 2 && proteinCaloriePct < 10) {
      checks.push({
        claim: 'Protein Claim Nuance',
        verdict: 'Caution',
        explanation: `While containing ${protein}g protein, it supplies less than 10% of total calories from protein. Do not rely on this product as a primary protein source.`
      });
    }

    // High Sodium Check
    if (sodium > 500) {
      checks.push({
        claim: 'Sodium / Salt Warning',
        verdict: 'Caution',
        explanation: `Contains ${sodium}mg sodium per serving (over 40% of WHO recommended daily 2,000mg sodium threshold). High sodium in instant foods contributes to elevated blood pressure.`
      });
    }

    // Palm oil check
    if (ingredientsText.toLowerCase().includes('palm oil')) {
      checks.push({
        claim: 'Cooking Fat Source',
        verdict: 'Caution',
        explanation: 'Uses commercial palm oil as the primary cooking fat, which is high in saturated palmitic acid and commonly chosen by industrial food manufacturers for shelf stability and low cost.'
      });
    }

    return checks;
  }, [addedSugar, servingSize, ingredientsText, protein, calories, sodium]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C1612] text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <BreadcrumbNavigation
          items={[
            { label: 'Home', path: '/' },
            { label: 'Food Explorer', path: '/food-explorer' },
            { label: 'Ingredient & Label Analyzer', path: '/label-analyzer' }
          ]}
          onNavigate={onNavigate}
        />

        {/* Header */}
        <header className="border-b border-stone-200 dark:border-stone-800 pb-6">
          <div className="text-xs font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-400 mb-1">
            Consumer Transparency · FSSAI Decoder
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Ingredient &amp; Nutrition Label Analyzer
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            Decode E-numbers, uncover hidden sugar aliases, analyze allergen warnings, and see past front-of-pack marketing claims on Indian packaged groceries.
          </p>

          {/* Sample Preset Loaders */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs">
            <span className="text-stone-500 font-medium">Try a supermarket sample:</span>
            {SAMPLE_LABELS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(sample)}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition text-[11px] font-medium"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </header>

        {/* 2-Column Interface: Inputs on Left (5 cols) & Live Intelligence on Right (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Label Input Form */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-4">
              <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" /> 1. Paste Ingredients List
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Copy or type the ingredients text exactly as printed on the package back.
              </p>

              <textarea
                rows={5}
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="e.g. Refined wheat flour (Maida), Palm oil, Sugar, Maltodextrin, INS 621, INS 330, Salt..."
                className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs outline-none focus:border-emerald-600 font-mono leading-relaxed"
              />

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
                  2. Nutrition Facts (Per Serving)
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">Serving Size (g/ml)</label>
                    <input
                      type="number"
                      value={servingSize}
                      onChange={(e) => setServingSize(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">Calories (kcal)</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">Protein (g)</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">Added Sugars (g)</label>
                    <input
                      type="number"
                      value={addedSugar}
                      onChange={(e) => setAddedSugar(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">Total Fat (g)</label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">Sodium (mg)</label>
                    <input
                      type="number"
                      value={sodium}
                      onChange={(e) => setSodium(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Intelligence Analysis Output */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Marketing Claims vs Reality */}
            <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-4">
              <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" /> Marketing Claims vs. Nutrition Reality
              </h2>

              {realityChecks.length === 0 ? (
                <div className="text-xs text-stone-500 italic p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                  Enter nutrition values and ingredient text to view automated claim validation.
                </div>
              ) : (
                <div className="space-y-3">
                  {realityChecks.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        item.verdict === 'Good'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200'
                          : item.verdict === 'Misleading'
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
                          : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{item.claim}</span>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/30">
                          {item.verdict}
                        </span>
                      </div>
                      <p className="leading-relaxed opacity-90">{item.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Decoded INS Additives */}
            <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" /> Decoded Food Additives (INS Numbers)
                </h2>
                <span className="text-xs font-mono text-stone-500">
                  {detectedAdditives.length} detected
                </span>
              </div>

              {detectedAdditives.length === 0 ? (
                <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs text-stone-500 italic">
                  No recognized INS numbers found in the pasted text (e.g., INS 621, INS 330, INS 150d).
                </div>
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {detectedAdditives.map(add => (
                    <div key={add.insNumber} className="py-3 text-xs space-y-1">
                      <div className="flex items-baseline justify-between">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 mr-1.5">{add.insNumber}:</span>
                          {add.commonName}
                        </div>
                        <span className="text-[10px] font-semibold text-stone-500">
                          {add.functionalClass}
                        </span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        {add.description}
                      </p>
                      <div className="text-[11px] text-stone-500 pt-0.5">
                        <strong className="text-stone-700 dark:text-stone-300">Safety &amp; Context:</strong> {add.healthContext}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Hidden Sugars & Allergens Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sugars */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Identified Sugar Aliases ({detectedSugars.length})
                </div>
                {detectedSugars.length === 0 ? (
                  <p className="text-xs text-stone-500">No common sugar synonyms flagged.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {detectedSugars.map(s => (
                      <span key={s} className="px-2 py-0.5 text-xs rounded bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60 capitalize">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Allergens */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Common Allergens Flagged ({detectedAllergens.length})
                </div>
                {detectedAllergens.length === 0 ? (
                  <p className="text-xs text-stone-500">No primary allergen triggers detected.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {detectedAllergens.map(a => (
                      <span key={a} className="px-2 py-0.5 text-xs rounded bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Responsible Disclaimer */}
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-500 dark:text-stone-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            This analyzer provides informational decoding grounded in FSSAI Food Safety Standards regulations. It evaluates declared ingredient texts and does not perform chemical batch spectroscopy. Individuals with acute food allergies or clinical celiac disease must follow manufacturer allergen warnings and consult their medical doctor.
          </p>
        </div>

      </div>
    </div>
  );
};
