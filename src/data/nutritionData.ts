export interface NutrientInfo {
  id: string;
  name: string;
  category: 'macronutrient' | 'vitamin' | 'mineral';
  shortSummary: string;
  whatItIs: string;
  biologicalRole: string;
  topSources: string[];
  whyItMatters: string;
  dailyTarget: string;
  cautions?: string;
  icon: string;
}

export interface FoodItem {
  id: string;
  name: string;
  hindiName?: string;
  category: 'grain' | 'protein' | 'dairy' | 'vegetable' | 'fruit' | 'nuts_seeds' | 'prepared';
  servingDesc: string;
  servingG: number;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber: number; // in grams
  sugar: number; // in grams
  sodium: number; // in mg
  calcium: number; // in mg
  iron: number; // in mg
  potassium: number; // in mg
  vitaminC: number; // in mg
  highlights: string[];
  dietaryType: 'veg' | 'non-veg' | 'vegan';
}

export interface NutritionArticle {
  id: string;
  title: string;
  readTime: string;
  category: string;
  summary: string;
  icon: string;
  sections: {
    heading: string;
    content: string;
    points?: string[];
  }[];
}

// 1. COMPREHENSIVE NUTRIENTS LIST
export const NUTRIENTS_DATA: NutrientInfo[] = [
  // MACRONUTRIENTS
  {
    id: 'protein',
    name: 'Protein',
    category: 'macronutrient',
    shortSummary: 'The essential building block for muscles, enzymes, cellular repair, and immune antibodies.',
    whatItIs: 'Protein is a macronutrient made up of 20 distinct amino acids, 9 of which are "essential" because the human body cannot synthesize them on its own and must obtain them from food.',
    biologicalRole: 'Synthesizes muscle tissue, cellular structures, hormones (e.g. insulin), digestive enzymes, and protective immunoglobulins (antibodies).',
    topSources: ['Lentils & Dals (Moong, Toor, Chana)', 'Paneer & Cottage Cheese', 'Eggs & Egg Whites', 'Chickpeas & Rajma', 'Tofu & Soybeans', 'Greek Yogurt / Hung Curd', 'Fish & Poultry', 'Nuts & Seeds'],
    whyItMatters: 'Adequate protein intake supports post-exercise muscle recovery, maintains lean body mass, preserves bone density, and promotes long-lasting meal satiety.',
    dailyTarget: 'General adult reference: ~0.8g to 1.2g per kg of body weight (higher for active athletes or during recovery).',
    cautions: 'Extremely high protein diets without adequate hydration can place unnecessary stress on kidneys in individuals with pre-existing renal conditions.',
    icon: 'Dumbbell'
  },
  {
    id: 'carbohydrates',
    name: 'Carbohydrates',
    category: 'macronutrient',
    shortSummary: 'The human body and central nervous system’s primary and most efficient source of metabolic energy.',
    whatItIs: 'Carbohydrates are organic biomolecules composed of carbon, hydrogen, and oxygen. They range from simple sugars (glucose, fructose) to complex starches and dietary fibers.',
    biologicalRole: 'Breaks down into glucose to fuel ATP energy production in brain neurons, red blood cells, and working muscles during physical movement.',
    topSources: ['Whole Wheat Roti & Brown Rice', 'Rolled Oats & Millets (Ragi, Jowar, Bajra)', 'Sweet Potatoes & Potatoes', 'Lentils & Legumes', 'Fresh Fruits (Banana, Apple, Berries)', 'Quinoa & Barley'],
    whyItMatters: 'Complex carbohydrates with intact fiber provide steady, sustained bloodstream glucose without drastic energy crashes or sudden insulin spikes.',
    dailyTarget: 'Typically 45%–60% of total daily caloric intake from complex, whole-food sources.',
    cautions: 'Excessive consumption of refined carbohydrates and ultra-processed free sugars can contribute to metabolic fluctuations and dental caries.',
    icon: 'Zap'
  },
  {
    id: 'fat',
    name: 'Dietary Fat',
    category: 'macronutrient',
    shortSummary: 'Vital for hormone production, brain health, cellular membrane integrity, and fat-soluble vitamin absorption.',
    whatItIs: 'Dietary fats (lipids) encompass fatty acids classified into unsaturated (monounsaturated & polyunsaturated like Omega-3/6), saturated, and trans fats.',
    biologicalRole: 'Forms the structural lipid bilayer of all cell membranes, insulates neural axons (myelin sheath), buffers internal organs, and synthesizes steroid hormones.',
    topSources: ['Almonds, Walnuts & Peanuts', 'Mustard, Olive & Sesame Oil', 'Chia Seeds & Flaxseeds', 'Fatty Fish (Salmon, Mackerel)', 'Desi Ghee & Butter (in moderation)', 'Avocados'],
    whyItMatters: 'Essential for absorbing fat-soluble vitamins (A, D, E, K). Unsaturated omega-3 fatty acids support cardiovascular resilience and cognitive clarity.',
    dailyTarget: 'Typically 20%–35% of daily energy intake, prioritizing unsaturated plant and fish lipids.',
    cautions: 'Avoid industrial artificial trans fats. Keep saturated fats to balanced, moderate proportions within overall daily energy needs.',
    icon: 'Heart'
  },
  {
    id: 'fiber',
    name: 'Dietary Fiber',
    category: 'macronutrient',
    shortSummary: 'Non-digestible plant carbohydrate crucial for microbiome diversity, bowel regularity, and cholesterol balance.',
    whatItIs: 'Fiber consists of soluble (water-binding, gel-forming) and insoluble (roughage) plant polysaccharides that pass through the small intestine largely undigested.',
    biologicalRole: 'Ferments in the colon to produce beneficial short-chain fatty acids (SCFAs like butyrate), feeds probiotic gut bacteria, and slows glucose absorption.',
    topSources: ['Whole Grains (Oats, Whole Wheat, Ragi)', 'Beans, Rajma & Chickpeas', 'Chia & Flaxseeds', 'Green Leafy Vegetables (Spinach, Methi)', 'Apples, Guavas & Pears with peel', 'Psyllium Husk (Isabgol)'],
    whyItMatters: 'Lowers LDL cholesterol, prevents constipation, stabilizes post-meal blood sugar levels, and reduces long-term cardiovascular risks.',
    dailyTarget: '25g to 35g per day for adults.',
    cautions: 'Increase fiber intake gradually while drinking plenty of water to prevent temporary bloating or digestive cramping.',
    icon: 'Salad'
  },

  // VITAMINS
  {
    id: 'vit-a',
    name: 'Vitamin A',
    category: 'vitamin',
    shortSummary: 'Essential for retinal photoreception (vision), immune defense, and skin epithelial regeneration.',
    whatItIs: 'Fat-soluble vitamin existing as preformed vitamin A (retinol) in animal foods and provitamin A carotenoids (beta-carotene) in colorful plants.',
    biologicalRole: 'Forms rhodopsin pigment in retina for low-light vision, supports mucous membrane barrier immunity, and guides cellular differentiation.',
    topSources: ['Carrots & Sweet Potatoes', 'Spinach, Methi & Mustard Greens', 'Papaya & Mango', 'Egg Yolks & Fortified Milk', 'Pumpkin & Red Bell Peppers'],
    whyItMatters: 'Prevents night blindness, maintains healthy clear cornea, and fortifies respiratory/gastrointestinal mucosal linings against pathogens.',
    dailyTarget: 'Adults: ~700–900 mcg RAE (Retinol Activity Equivalents) per day.',
    cautions: 'Excessive supplemental preformed retinol can accumulate in the liver; dietary beta-carotene from vegetables is safely self-regulated by the body.',
    icon: 'Eye'
  },
  {
    id: 'vit-b1',
    name: 'Vitamin B1 (Thiamine)',
    category: 'vitamin',
    shortSummary: 'Coenzyme required for carbohydrate metabolism and proper nerve signal transmission.',
    whatItIs: 'Water-soluble B-complex vitamin essential for cellular energy extraction from glucose.',
    biologicalRole: 'Acts as thiamine pyrophosphate (TPP), facilitating pyruvate decarboxylation in the Krebs energy cycle and synthesis of neurotransmitters.',
    topSources: ['Whole Wheat Flour & Brown Rice', 'Sunflower Seeds & Peanuts', 'Lentils & Chickpeas', 'Fortified Cereals', 'Green Peas & Soybeans'],
    whyItMatters: 'Essential for cardiac muscle tone, cognitive alertness, and peripheral nervous system health.',
    dailyTarget: 'Adults: ~1.1–1.2 mg per day.',
    icon: 'Zap'
  },
  {
    id: 'vit-b2',
    name: 'Vitamin B2 (Riboflavin)',
    category: 'vitamin',
    shortSummary: 'Vital for cellular respiration, electron transport, and antioxidant glutathione recycling.',
    whatItIs: 'Water-soluble vitamin that forms key coenzymes FMN and FAD.',
    biologicalRole: 'Participates in mitochondrial ATP production, red blood cell synthesis, and conversion of other B-vitamins into their active forms.',
    topSources: ['Milk, Curd & Paneer', 'Eggs', 'Almonds & Mushrooms', 'Spinach & Green Veggies', 'Fortified Grains'],
    whyItMatters: 'Maintains healthy skin, clear eyesight, and protects cellular lipids from oxidative stress.',
    dailyTarget: 'Adults: ~1.1–1.3 mg per day.',
    icon: 'Sparkles'
  },
  {
    id: 'vit-b3',
    name: 'Vitamin B3 (Niacin)',
    category: 'vitamin',
    shortSummary: 'Core component of NAD/NADP coenzymes powering cellular repair and energy production.',
    whatItIs: 'Water-soluble vitamin encompassing nicotinic acid and nicotinamide.',
    biologicalRole: 'Crucial for over 400 enzymatic reactions, cellular DNA repair via PARP enzymes, and lipid metabolism.',
    topSources: ['Peanuts & Sunflower Seeds', 'Chicken & Tuna / Fish', 'Mushrooms & Green Peas', 'Whole Wheat & Brown Rice', 'Lentils'],
    whyItMatters: 'Promotes healthy skin, optimal nervous system operation, and supports balanced blood lipid profiles.',
    dailyTarget: 'Adults: ~14–16 mg NE (Niacin Equivalents) per day.',
    icon: 'Activity'
  },
  {
    id: 'vit-b5',
    name: 'Vitamin B5 (Pantothenic Acid)',
    category: 'vitamin',
    shortSummary: 'Building block of Coenzyme A (CoA), central to synthesizing fats, proteins, and hormones.',
    whatItIs: 'Widely distributed water-soluble vitamin required by every living cell.',
    biologicalRole: 'Forms Coenzyme A, driving fatty acid synthesis, ketone production, and adrenal hormone creation.',
    topSources: ['Eggs & Dairy', 'Mushrooms & Avocados', 'Sunflower Seeds & Peanuts', 'Whole Grains & Legumes', 'Broccoli & Sweet Potatoes'],
    whyItMatters: 'Supports adrenal gland balance, hemoglobin production, and resilient cellular stamina.',
    dailyTarget: 'Adults: ~5 mg per day.',
    icon: 'ShieldCheck'
  },
  {
    id: 'vit-b6',
    name: 'Vitamin B6 (Pyridoxine)',
    category: 'vitamin',
    shortSummary: 'Master amino acid metabolic coenzyme, crucial for serotonin and dopamine neurotransmitter synthesis.',
    whatItIs: 'Water-soluble B-vitamin existing as pyridoxal 5\'-phosphate (PLP).',
    biologicalRole: 'Catalyzes transamination of amino acids, produces neurotransmitters (serotonin, GABA, dopamine), and aids hemoglobin formation.',
    topSources: ['Chickpeas & Bananas', 'Potatoes & Sweet Potatoes', 'Poultry & Fish', 'Pistachios & Walnuts', 'Spinach & Soybeans'],
    whyItMatters: 'Regulates mood, supports immune response, and helps regulate homocysteine levels in the bloodstream.',
    dailyTarget: 'Adults: ~1.3–1.7 mg per day.',
    icon: 'Brain'
  },
  {
    id: 'vit-b7',
    name: 'Vitamin B7 (Biotin)',
    category: 'vitamin',
    shortSummary: 'Key cofactor for carboxylase enzymes driving keratin synthesis, hair, skin, and fatty acid metabolism.',
    whatItIs: 'Water-soluble B-vitamin synthesized in small amounts by healthy gut microbiota and obtained via diet.',
    biologicalRole: 'Aids gluconeogenesis, branched-chain amino acid breakdown, and gene expression for structural proteins.',
    topSources: ['Egg Yolks (Cooked)', 'Almonds, Walnuts & Peanuts', 'Sweet Potatoes & Spinach', 'Mushrooms & Bananas', 'Oats & Soybeans'],
    whyItMatters: 'Supports keratin structural integrity in hair and nails, plus stable energy conversion.',
    dailyTarget: 'Adults: ~30 mcg per day.',
    icon: 'Sparkles'
  },
  {
    id: 'vit-b9',
    name: 'Vitamin B9 (Folate / Folic Acid)',
    category: 'vitamin',
    shortSummary: 'Essential for DNA/RNA synthesis, cellular division, and healthy fetal neural tube development.',
    whatItIs: 'Water-soluble vitamin naturally occurring as dietary folate (and synthetic folic acid in supplements/fortification).',
    biologicalRole: 'Serves as one-carbon donor for nucleotide synthesis, red blood cell maturation, and methylation pathways.',
    topSources: ['Spinach, Methi & Palak', 'Chickpeas, Lentils & Rajma', 'Fortified Cereals & Wheat', 'Citrus Fruits & Papaya', 'Peanuts & Asparagus'],
    whyItMatters: 'Critical before and during pregnancy to prevent neural tube defects, and needed throughout life to prevent megaloblastic anemia.',
    dailyTarget: 'Adults: ~400 mcg DFE per day (600 mcg during pregnancy).',
    icon: 'HeartPulse'
  },
  {
    id: 'vit-b12',
    name: 'Vitamin B12 (Cobalamin)',
    category: 'vitamin',
    shortSummary: 'Crucial for myelin nerve sheath maintenance, red blood cell formation, and DNA synthesis.',
    whatItIs: 'Cobalt-containing water-soluble vitamin produced almost exclusively by micro-organisms, found naturally in animal-derived foods and fortified products.',
    biologicalRole: 'Works with folate in methionine synthase reaction, prevents neurological demyelination, and ensures proper erythrocyte maturation.',
    topSources: ['Milk, Curd, Paneer & Cheese', 'Fortified Plant Milks & Nutritional Yeast', 'Eggs', 'Fish, Chicken & Mutton', 'Fortified Breakfast Cereals'],
    whyItMatters: 'Prevents pernicious anemia, chronic fatigue, memory fog, and irreversible peripheral neuropathy.',
    dailyTarget: 'Adults: ~2.4 mcg per day.',
    cautions: 'Strict vegetarians and vegans should regularly consume fortified foods or quality B12 supplements, as plant foods do not naturally contain active B12.',
    icon: 'ShieldCheck'
  },
  {
    id: 'vit-c',
    name: 'Vitamin C (Ascorbic Acid)',
    category: 'vitamin',
    shortSummary: 'Potent water-soluble antioxidant, essential for collagen synthesis, immune defense, and non-heme iron absorption.',
    whatItIs: 'Essential water-soluble micronutrient that humans cannot biosynthesize.',
    biologicalRole: 'Co-factor for prolyl and lysyl hydroxylases in collagen cross-linking, neutralizes reactive oxygen species (ROS), and enhances plant-based iron uptake.',
    topSources: ['Amla (Indian Gooseberry)', 'Guava, Oranges & Lemons', 'Papaya & Strawberries', 'Capsicum / Bell Peppers', 'Tomatoes & Green Chillies', 'Broccoli & Cabbage'],
    whyItMatters: 'Accelerates wound healing, strengthens vascular capillary walls, supports immune phagocytes, and brightens skin.',
    dailyTarget: 'Adults: ~65–90 mg per day (Amla and Guava provide huge natural concentrations).',
    cautions: 'Easily destroyed by prolonged heat and open-air boiling; best consumed raw or lightly cooked.',
    icon: 'Apple'
  },
  {
    id: 'vit-d',
    name: 'Vitamin D (Calciferol)',
    category: 'vitamin',
    shortSummary: 'The "sunshine vitamin" hormone, indispensable for calcium absorption, bone mineralization, and immune modulation.',
    whatItIs: 'Secosteroid hormone synthesized endogenously in the epidermis upon exposure to UVB solar radiation, also found in select foods.',
    biologicalRole: 'Regulates expression of calcium-binding transport proteins in intestinal brush borders, maintains serum calcium homeostasis, and regulates T-cell immunity.',
    topSources: ['Direct Sun Exposure (15–30 min midday sun)', 'Fortified Milk & Plant Milks', 'Egg Yolks', 'Mushrooms exposed to UV light', 'Fatty Fish (Salmon, Sardines)'],
    whyItMatters: 'Prevents rickets in children and osteopenia/osteoporosis in adults; supports muscular force production and respiratory resistance.',
    dailyTarget: 'Adults: ~600–800 IU (15–20 mcg) per day.',
    cautions: 'High rates of indoor lifestyle lead to widespread deficiency; periodic screening and supervised supplementation are common.',
    icon: 'Sun'
  },
  {
    id: 'vit-e',
    name: 'Vitamin E (Tocopherol)',
    category: 'vitamin',
    shortSummary: 'Primary lipid-soluble antioxidant guarding cell membranes against lipid peroxidation.',
    whatItIs: 'Family of eight fat-soluble compounds, with alpha-tocopherol being the most biologically active form in humans.',
    biologicalRole: 'Scavenges free radicals in polyunsaturated membrane phospholipids, inhibits platelet aggregation, and supports immune cell communication.',
    topSources: ['Sunflower Seeds & Almonds', 'Peanut Butter & Peanuts', 'Spinach & Mustard Greens', 'Vegetable Oils (Sunflower, Olive)', 'Avocados & Kiwi'],
    whyItMatters: 'Protects vascular endothelial walls, skin lipids, and retards cellular oxidative aging.',
    dailyTarget: 'Adults: ~15 mg (22.4 IU) per day.',
    icon: 'ShieldCheck'
  },
  {
    id: 'vit-k',
    name: 'Vitamin K',
    category: 'vitamin',
    shortSummary: 'Essential cofactor for blood clotting cascade and osteocalcin calcium deposition into bones.',
    whatItIs: 'Fat-soluble vitamin occurring as phylloquinone (K1 in green plants) and menaquinones (K2 in fermented foods and synthesized by gut flora).',
    biologicalRole: 'Activates clotting factors (II, VII, IX, X) via gamma-glutamyl carboxylation and directs calcium away from arterial walls into bone matrix.',
    topSources: ['Spinach, Methi, Sarson & Kale', 'Cabbage & Cauliflower', 'Broccoli & Green Peas', 'Fermented Soy / Natto & Curd', 'Kiwi & Green Beans'],
    whyItMatters: 'Ensures normal blood coagulation following cuts and supports long-term skeletal density.',
    dailyTarget: 'Adults: ~90–120 mcg per day.',
    cautions: 'Individuals on anticoagulant therapies (like Warfarin) should maintain consistent dietary Vitamin K intake and consult their physician.',
    icon: 'Activity'
  },

  // MINERALS
  {
    id: 'calcium',
    name: 'Calcium',
    category: 'mineral',
    shortSummary: 'Most abundant mineral in the body; builds skeletal architecture and mediates neuromuscular contraction.',
    whatItIs: 'Essential alkaline earth metal stored 99% in bones and teeth, with 1% circulating in serum for vital physiological signaling.',
    biologicalRole: 'Provides compressive strength to hydroxyapatite bone crystal lattice, triggers actin-myosin muscle contractions, and enables nerve synapse firing.',
    topSources: ['Milk, Curd, Paneer & Cheese', 'Sesame Seeds (Til) & Chia Seeds', 'Ragi (Finger Millet)', 'Soybeans & Tofu', 'Spinach & Drumstick leaves (Moringa)', 'Almonds'],
    whyItMatters: 'Prevents osteoporosis, sustains rhythmic cardiac contraction, and promotes dental longevity.',
    dailyTarget: 'Adults: ~1000–1200 mg per day.',
    icon: 'Building2'
  },
  {
    id: 'iron',
    name: 'Iron',
    category: 'mineral',
    shortSummary: 'Central atom in hemoglobin and myoglobin, delivering oxygen from lungs to every living cell.',
    whatItIs: 'Essential trace mineral found as heme iron (animal foods, high bioavailability) and non-heme iron (plant foods).',
    biologicalRole: 'Binds molecular O2 in hemoglobin for systemic delivery, supports mitochondrial cytochrome energy transfer, and powers cognitive focus.',
    topSources: ['Lentils, Dals, Rajma & Chickpeas', 'Spinach (Palak), Methi & Moringa', 'Jaggery (Gur) & Dates / Raisins', 'Pumpkin Seeds & Sesame Seeds', 'Poultry, Fish & Eggs', 'Poha (Flattened Rice)'],
    whyItMatters: 'Prevents iron-deficiency anemia, relieves chronic fatigue, and preserves academic and physical stamina.',
    dailyTarget: 'Adult Men: ~8–17 mg; Adult Women: ~18–29 mg (varies by life stage / national guidelines).',
    cautions: 'Pair plant non-heme iron with Vitamin C (e.g. lemon squeeze on dal/poha) to multiply absorption, and avoid tea/coffee immediately with iron-rich meals.',
    icon: 'Zap'
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    category: 'mineral',
    shortSummary: 'Cofactor for over 300 biochemical enzymes; regulates muscle relaxation, nerve calmness, and glucose control.',
    whatItIs: 'Intracellular divalent cation vital for ATP stability and cellular energetics.',
    biologicalRole: 'Stabilizes ATP complexes, regulates NMDA receptor activity for neurological calmness, guides protein synthesis, and controls vascular smooth muscle tone.',
    topSources: ['Pumpkin Seeds, Sunflower Seeds & Almonds', 'Spinach & Leafy Greens', 'Whole Grains (Brown Rice, Oats, Ragi)', 'Dark Chocolate (70%+)', 'Black Beans & Chickpeas', 'Bananas'],
    whyItMatters: 'Reduces muscle cramps, supports restful sleep quality, stabilizes blood pressure, and promotes insulin sensitivity.',
    dailyTarget: 'Adults: ~310–420 mg per day.',
    icon: 'Sparkles'
  },
  {
    id: 'potassium',
    name: 'Potassium',
    category: 'mineral',
    shortSummary: 'Chief intracellular electrolyte balancing cellular fluid, blunting excess sodium, and moderating blood pressure.',
    whatItIs: 'Essential systemic electrolyte maintaining resting membrane potential across all cell walls.',
    biologicalRole: 'Counteracts sodium-induced fluid retention, promotes arterial vasodilation, and prevents cardiac arrhythmias.',
    topSources: ['Coconut Water (Nariyal Pani)', 'Bananas & Papaya', 'Potatoes & Sweet Potatoes with skin', 'Spinach & Tomatoes', 'Lentils & Beans', 'Curd / Dahi'],
    whyItMatters: 'Lowers stroke risk, buffers arterial hypertension, and prevents athletic muscle cramping.',
    dailyTarget: 'Adults: ~2600–3400 mg per day.',
    icon: 'Heart'
  },
  {
    id: 'sodium',
    name: 'Sodium',
    category: 'mineral',
    shortSummary: 'Chief extracellular electrolyte maintaining osmotic blood volume and transmitting neural action potentials.',
    whatItIs: 'Essential mineral and electrolyte commonly consumed as sodium chloride (table salt).',
    biologicalRole: 'Maintains extracellular fluid volume, regulates blood pressure, and powers glucose/amino acid co-transporters across cell membranes.',
    topSources: ['Table Salt / Rock Salt (Sendha Namak)', 'Pickles & Papad (high concentration)', 'Cheese & Bakery items', 'Naturally present in celery, milk, and vegetables'],
    whyItMatters: 'Essential for life and nerve conduction, but balanced intake is key.',
    dailyTarget: 'Recommended limit: < 2000 mg sodium (approx. 5g / 1 teaspoon of table salt) per day.',
    cautions: 'Excessive chronic intake is a leading contributor to hypertension and cardiovascular strain.',
    icon: 'Activity'
  },
  {
    id: 'zinc',
    name: 'Zinc',
    category: 'mineral',
    shortSummary: 'Critical for immune leukocyte activity, DNA transcription, wound healing, and taste perception.',
    whatItIs: 'Essential catalytic trace element involved in hundreds of metalloenzymes.',
    biologicalRole: 'Maintains structural integrity of zinc-finger transcription proteins, activates T-lymphocytes, and facilitates collagen synthesis.',
    topSources: ['Pumpkin Seeds & Watermelon Seeds', 'Chickpeas, Lentils & Rajma', 'Paneer, Milk & Yogurt', 'Cashews & Almonds', 'Eggs & Poultry', 'Whole Grains'],
    whyItMatters: 'Shortens duration of seasonal respiratory infections, promotes clear skin, and supports reproductive hormonal balance.',
    dailyTarget: 'Adults: ~8–11 mg per day.',
    icon: 'ShieldCheck'
  },
  {
    id: 'phosphorus',
    name: 'Phosphorus',
    category: 'mineral',
    shortSummary: 'Works closely with calcium in bone mineralization and forms the high-energy backbone of ATP and DNA.',
    whatItIs: 'Abundant mineral present in bone hydroxyapatite and cellular nucleic acids.',
    biologicalRole: 'Constitutes ATP high-energy phosphate bonds, cell membrane phospholipids, and acid-base blood buffer systems.',
    topSources: ['Dairy (Milk, Paneer, Curd)', 'Eggs, Poultry & Fish', 'Nuts, Seeds & Legumes', 'Whole Grains'],
    whyItMatters: 'Sustains structural bone strength and rapid cellular energy turnover.',
    dailyTarget: 'Adults: ~700 mg per day.',
    icon: 'Building2'
  },
  {
    id: 'iodine',
    name: 'Iodine',
    category: 'mineral',
    shortSummary: 'Indispensable component of thyroid hormones T3 and T4, governing metabolic rate and cognitive development.',
    whatItIs: 'Essential trace halide concentrated almost entirely in the thyroid gland.',
    biologicalRole: 'Incorporates into thyroxine (T4) and triiodothyronine (T3) to regulate basal metabolic rate, body temperature, and fetal brain growth.',
    topSources: ['Iodized Table Salt', 'Dairy Milk & Yogurt', 'Seaweed & Marine Fish', 'Eggs'],
    whyItMatters: 'Prevents goiter, hypothyroidism, sluggish metabolism, and developmental intellectual impairment.',
    dailyTarget: 'Adults: ~150 mcg per day.',
    icon: 'Activity'
  },
  {
    id: 'selenium',
    name: 'Selenium',
    category: 'mineral',
    shortSummary: 'Constituent of selenoproteins like glutathione peroxidase, protecting cells from oxidative destruction.',
    whatItIs: 'Trace mineral essential for antioxidant defense systems and thyroid hormone deiodination.',
    biologicalRole: 'Powers glutathione peroxidase enzymes to reduce toxic peroxides into harmless water, and converts inactive T4 into active T3 hormone.',
    topSources: ['Sunflower Seeds & Brazil Nuts', 'Whole Wheat & Brown Rice', 'Eggs & Poultry', 'Fish & Seafood', 'Mushrooms'],
    whyItMatters: 'Supports thyroid health, heavy-metal detoxification, and robust cellular longevity.',
    dailyTarget: 'Adults: ~55 mcg per day.',
    icon: 'ShieldCheck'
  }
];

// 2. FOOD NUTRITION DATABASE (Standard reference values from ICMR-NIN & USDA FoodData Central)
export const FOODS_DATABASE: FoodItem[] = [
  {
    id: 'roti',
    name: 'Whole Wheat Roti / Chapati',
    hindiName: 'रोटी / चपाती',
    category: 'grain',
    servingDesc: '1 medium roti (no ghee)',
    servingG: 40,
    calories: 110,
    protein: 3.5,
    carbs: 22.0,
    fat: 0.6,
    fiber: 3.2,
    sugar: 0.4,
    sodium: 5,
    calcium: 15,
    iron: 1.4,
    potassium: 110,
    vitaminC: 0,
    highlights: ['Rich in complex carbohydrates & fiber', 'Low fat staple', 'Provides steady energy release'],
    dietaryType: 'vegan'
  },
  {
    id: 'cooked-rice',
    name: 'Cooked White Rice',
    hindiName: 'पका हुआ चावल',
    category: 'grain',
    servingDesc: '1 medium bowl (cooked)',
    servingG: 150,
    calories: 195,
    protein: 4.1,
    carbs: 42.5,
    fat: 0.5,
    fiber: 0.8,
    sugar: 0.1,
    sodium: 2,
    calcium: 16,
    iron: 0.8,
    potassium: 55,
    vitaminC: 0,
    highlights: ['Easily digestible energy source', 'Naturally gluten-free', 'Pairs ideally with lentils for complete protein'],
    dietaryType: 'vegan'
  },
  {
    id: 'brown-rice',
    name: 'Cooked Brown Rice',
    hindiName: 'ब्राउन राइस',
    category: 'grain',
    servingDesc: '1 medium bowl (cooked)',
    servingG: 150,
    calories: 168,
    protein: 3.8,
    carbs: 35.2,
    fat: 1.4,
    fiber: 2.7,
    sugar: 0.3,
    sodium: 4,
    calcium: 20,
    iron: 1.1,
    potassium: 125,
    vitaminC: 0,
    highlights: ['Whole grain with bran & germ intact', 'Higher fiber and magnesium', 'Lower glycemic impact than polished white rice'],
    dietaryType: 'vegan'
  },
  {
    id: 'yellow-moong-dal',
    name: 'Cooked Yellow Moong Dal',
    hindiName: 'मूंग दाल',
    category: 'protein',
    servingDesc: '1 medium katori / bowl',
    servingG: 150,
    calories: 145,
    protein: 9.2,
    carbs: 22.0,
    fat: 1.8,
    fiber: 5.5,
    sugar: 1.2,
    sodium: 120,
    calcium: 45,
    iron: 2.1,
    potassium: 310,
    vitaminC: 2.5,
    highlights: ['Gentle on digestion', 'High plant protein & soluble fiber', 'Rich in folate and potassium'],
    dietaryType: 'vegan'
  },
  {
    id: 'paneer',
    name: 'Fresh Paneer (Cottage Cheese)',
    hindiName: 'पनीर',
    category: 'dairy',
    servingDesc: '100g fresh paneer',
    servingG: 100,
    calories: 265,
    protein: 18.3,
    carbs: 3.5,
    fat: 20.8,
    fiber: 0,
    sugar: 2.6,
    sodium: 40,
    calcium: 480,
    iron: 0.4,
    potassium: 130,
    vitaminC: 0,
    highlights: ['Complete dairy protein with all 9 essential amino acids', 'Exceptional calcium density', 'Sustained satiety'],
    dietaryType: 'veg'
  },
  {
    id: 'curd-dahi',
    name: 'Plain Curd / Dahi (Yogurt)',
    hindiName: 'दही',
    category: 'dairy',
    servingDesc: '1 medium bowl (unsweetened)',
    servingG: 150,
    calories: 92,
    protein: 5.2,
    carbs: 6.8,
    fat: 4.5,
    fiber: 0,
    sugar: 6.2,
    sodium: 65,
    calcium: 180,
    iron: 0.2,
    potassium: 220,
    vitaminC: 1.2,
    highlights: ['Natural probiotics supporting gut flora', 'Highly bioavailable calcium and phosphorus', 'Cooling digestive support'],
    dietaryType: 'veg'
  },
  {
    id: 'cow-milk',
    name: 'Cow Milk (Toned)',
    hindiName: 'दूध',
    category: 'dairy',
    servingDesc: '1 glass (200 ml)',
    servingG: 200,
    calories: 122,
    protein: 6.4,
    carbs: 9.8,
    fat: 6.0,
    fiber: 0,
    sugar: 9.6,
    sodium: 90,
    calcium: 240,
    iron: 0.1,
    potassium: 290,
    vitaminC: 2.0,
    highlights: ['Balanced macro distribution', 'Rich in Vitamin B12 and bioavailable calcium', 'Supports bone mineralization'],
    dietaryType: 'veg'
  },
  {
    id: 'boiled-egg',
    name: 'Whole Boiled Egg',
    hindiName: 'उबला अंडा',
    category: 'protein',
    servingDesc: '1 large egg',
    servingG: 50,
    calories: 74,
    protein: 6.3,
    carbs: 0.4,
    fat: 5.0,
    fiber: 0,
    sugar: 0.2,
    sodium: 62,
    calcium: 28,
    iron: 0.9,
    potassium: 63,
    vitaminC: 0,
    highlights: ['Gold standard biological protein value (BV 100)', 'Contains choline for brain and memory', 'Rich in lutein and Vitamin D'],
    dietaryType: 'non-veg'
  },
  {
    id: 'chickpeas-chana',
    name: 'Boiled Chickpeas (Kabuli Chana)',
    hindiName: 'छोले / चना',
    category: 'protein',
    servingDesc: '1 medium bowl (cooked)',
    servingG: 150,
    calories: 210,
    protein: 11.2,
    carbs: 35.0,
    fat: 3.2,
    fiber: 9.8,
    sugar: 4.8,
    sodium: 15,
    calcium: 65,
    iron: 3.2,
    potassium: 380,
    vitaminC: 1.8,
    highlights: ['High prebiotic fiber for gut microbiome', 'Substantial plant protein and iron', 'Low glycemic index supporting blood sugar balance'],
    dietaryType: 'vegan'
  },
  {
    id: 'rajma-kidney-beans',
    name: 'Cooked Rajma (Kidney Beans)',
    hindiName: 'राजमा',
    category: 'protein',
    servingDesc: '1 medium bowl (cooked)',
    servingG: 150,
    calories: 198,
    protein: 12.0,
    carbs: 34.0,
    fat: 1.2,
    fiber: 9.5,
    sugar: 3.2,
    sodium: 10,
    calcium: 55,
    iron: 3.4,
    potassium: 460,
    vitaminC: 1.5,
    highlights: ['Rich in plant-based iron and potassium', 'Combines with rice to form complete amino acid profile', 'Supports cardiovascular health'],
    dietaryType: 'vegan'
  },
  {
    id: 'poha',
    name: 'Cooked Poha (with Peanuts & Veggies)',
    hindiName: 'पोहा',
    category: 'prepared',
    servingDesc: '1 medium plate',
    servingG: 150,
    calories: 220,
    protein: 5.2,
    carbs: 38.0,
    fat: 5.5,
    fiber: 3.2,
    sugar: 2.1,
    sodium: 210,
    calcium: 35,
    iron: 3.8,
    potassium: 140,
    vitaminC: 12.0,
    highlights: ['Flattened rice is naturally rich in iron from processing rollers', 'Light breakfast with peanuts for crunch and healthy fats', 'Enhanced with lemon juice for iron absorption'],
    dietaryType: 'vegan'
  },
  {
    id: 'idli',
    name: 'Steamed Idli',
    hindiName: 'इडली',
    category: 'prepared',
    servingDesc: '2 medium idlis',
    servingG: 100,
    calories: 130,
    protein: 4.2,
    carbs: 26.5,
    fat: 0.5,
    fiber: 1.8,
    sugar: 0.6,
    sodium: 85,
    calcium: 20,
    iron: 1.0,
    potassium: 80,
    vitaminC: 0,
    highlights: ['Naturally fermented batter creates bioavailable B-vitamins', 'Steamed with zero added oil', 'Gentle on gut digestion'],
    dietaryType: 'vegan'
  },
  {
    id: 'spinach-palak',
    name: 'Cooked Spinach (Palak)',
    hindiName: 'पालक',
    category: 'vegetable',
    servingDesc: '1 cup cooked',
    servingG: 120,
    calories: 32,
    protein: 3.5,
    carbs: 4.8,
    fat: 0.5,
    fiber: 3.0,
    sugar: 0.8,
    sodium: 95,
    calcium: 160,
    iron: 3.6,
    potassium: 420,
    vitaminC: 18.0,
    highlights: ['Loaded with lutein, beta-carotene & Vitamin K', 'Very low calorie nutrient powerhouse', 'High plant iron and magnesium'],
    dietaryType: 'vegan'
  },
  {
    id: 'banana',
    name: 'Fresh Banana',
    hindiName: 'केला',
    category: 'fruit',
    servingDesc: '1 medium banana',
    servingG: 118,
    calories: 105,
    protein: 1.3,
    carbs: 27.0,
    fat: 0.3,
    fiber: 3.1,
    sugar: 14.4,
    sodium: 1,
    calcium: 6,
    iron: 0.3,
    potassium: 422,
    vitaminC: 10.3,
    highlights: ['High potassium for muscle function & electrolyte balance', 'Natural quick pre-workout energy', 'Rich in Vitamin B6'],
    dietaryType: 'vegan'
  },
  {
    id: 'apple',
    name: 'Fresh Apple (with skin)',
    hindiName: 'सेब',
    category: 'fruit',
    servingDesc: '1 medium apple',
    servingG: 182,
    calories: 95,
    protein: 0.5,
    carbs: 25.0,
    fat: 0.3,
    fiber: 4.4,
    sugar: 19.0,
    sodium: 2,
    calcium: 11,
    iron: 0.2,
    potassium: 195,
    vitaminC: 8.4,
    highlights: ['Rich in pectin soluble fiber supporting cholesterol management', 'Contains quercetin antioxidant for immune resilience', 'Crunchy satiety enhancer'],
    dietaryType: 'vegan'
  },
  {
    id: 'rolled-oats',
    name: 'Cooked Rolled Oats',
    hindiName: 'ओट्स',
    category: 'grain',
    servingDesc: '1 bowl cooked in water',
    servingG: 150,
    calories: 140,
    protein: 5.0,
    carbs: 25.0,
    fat: 2.5,
    fiber: 4.0,
    sugar: 0.5,
    sodium: 4,
    calcium: 25,
    iron: 1.8,
    potassium: 130,
    vitaminC: 0,
    highlights: ['Contains beta-glucan fiber proven to help lower LDL cholesterol', 'Slow digestive breakdown prevents sugar spikes', 'Excellent breakfast base for fruits & nuts'],
    dietaryType: 'vegan'
  },
  {
    id: 'almonds',
    name: 'Raw Almonds (Badam)',
    hindiName: 'बादाम',
    category: 'nuts_seeds',
    servingDesc: '1 handful (approx. 20-22 nuts)',
    servingG: 28,
    calories: 164,
    protein: 6.0,
    carbs: 6.1,
    fat: 14.2,
    fiber: 3.5,
    sugar: 1.2,
    sodium: 1,
    calcium: 76,
    iron: 1.0,
    potassium: 205,
    vitaminC: 0,
    highlights: ['Exceptional Vitamin E antioxidant concentration', 'Healthy monounsaturated fats supporting heart health', 'Substantial magnesium and plant protein'],
    dietaryType: 'vegan'
  },
  {
    id: 'chicken-breast',
    name: 'Cooked Chicken Breast (Skinless)',
    hindiName: 'चिकन ब्रेस्ट',
    category: 'protein',
    servingDesc: '100g cooked',
    servingG: 100,
    calories: 165,
    protein: 31.0,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    calcium: 15,
    iron: 1.0,
    potassium: 256,
    vitaminC: 0,
    highlights: ['Extremely lean high-density complete protein', 'Rich in Vitamin B3 (Niacin) and B6', 'Supports targeted muscle recovery and strength'],
    dietaryType: 'non-veg'
  },
  {
    id: 'tomato',
    name: 'Fresh Tomato',
    hindiName: 'टमाटर',
    category: 'vegetable',
    servingDesc: '1 medium tomato',
    servingG: 120,
    calories: 22,
    protein: 1.1,
    carbs: 4.7,
    fat: 0.2,
    fiber: 1.4,
    sugar: 3.1,
    sodium: 6,
    calcium: 12,
    iron: 0.3,
    potassium: 280,
    vitaminC: 16.5,
    highlights: ['Potent source of lycopene antioxidant', 'High water content (94%) assisting hydration', 'Enhances vegetable curries and salads'],
    dietaryType: 'vegan'
  },
  {
    id: 'tofu',
    name: 'Firm Tofu (Soy Paneer)',
    hindiName: 'टोफू / सोया पनीर',
    category: 'protein',
    servingDesc: '100g firm tofu',
    servingG: 100,
    calories: 120,
    protein: 13.5,
    carbs: 2.8,
    fat: 6.5,
    fiber: 1.5,
    sugar: 0.8,
    sodium: 12,
    calcium: 350,
    iron: 2.7,
    potassium: 160,
    vitaminC: 0,
    highlights: ['100% plant-based complete protein with all essential amino acids', 'Calcium-set tofu is extremely rich in calcium', 'Low in saturated fat with zero cholesterol'],
    dietaryType: 'vegan'
  }
];

// 3. MEAL BUILDER OPTIONS
export interface MealBuilderCategory {
  id: string;
  name: string;
  recommendedPortion: string;
  color: string;
  items: {
    id: string;
    name: string;
    serving: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    fiber: number;
  }[];
}

export const MEAL_BUILDER_GROUPS: MealBuilderCategory[] = [
  {
    id: 'protein',
    name: '1. Quality Protein',
    recommendedPortion: '~25% of plate',
    color: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300',
    items: [
      { id: 'dal', name: 'Yellow Moong / Toor Dal (1 katori)', serving: '150g', protein: 9, carbs: 22, fat: 2, calories: 145, fiber: 5.5 },
      { id: 'paneer_m', name: 'Fresh Paneer Cubes (60g)', serving: '60g', protein: 11, carbs: 2, fat: 12, calories: 160, fiber: 0 },
      { id: 'eggs_m', name: '2 Boiled Whole Eggs', serving: '100g', protein: 13, carbs: 1, fat: 10, calories: 148, fiber: 0 },
      { id: 'chana_m', name: 'Boiled Chana / Chickpeas (1 katori)', serving: '150g', protein: 11, carbs: 35, fat: 3, calories: 210, fiber: 10 },
      { id: 'tofu_m', name: 'Steamed Tofu Cubes (100g)', serving: '100g', protein: 14, carbs: 3, fat: 6, calories: 120, fiber: 2 },
      { id: 'chicken_m', name: 'Grilled Chicken Breast (100g)', serving: '100g', protein: 31, carbs: 0, fat: 4, calories: 165, fiber: 0 }
    ]
  },
  {
    id: 'grains',
    name: '2. Complex Grains & Carbohydrates',
    recommendedPortion: '~25% of plate',
    color: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300',
    items: [
      { id: 'roti_2', name: '2 Whole Wheat Rotis', serving: '80g', protein: 7, carbs: 44, fat: 1, calories: 220, fiber: 6.4 },
      { id: 'rice_1', name: '1 Bowl Steamed Rice', serving: '150g', protein: 4, carbs: 42, fat: 0.5, calories: 195, fiber: 1 },
      { id: 'brown_rice_1', name: '1 Bowl Brown Rice', serving: '150g', protein: 4, carbs: 35, fat: 1.5, calories: 168, fiber: 2.7 },
      { id: 'oats_1', name: '1 Bowl Cooked Oats', serving: '150g', protein: 5, carbs: 25, fat: 2.5, calories: 140, fiber: 4 },
      { id: 'millet_roti', name: '1 Ragi / Jowar Roti', serving: '50g', protein: 4, carbs: 30, fat: 1, calories: 145, fiber: 5 }
    ]
  },
  {
    id: 'vegetables',
    name: '3. Vegetables & Greens',
    recommendedPortion: '~35% of plate',
    color: 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300',
    items: [
      { id: 'spinach_sabzi', name: 'Palak / Saag Sabzi (1 katori)', serving: '120g', protein: 3, carbs: 5, fat: 2, calories: 50, fiber: 3.5 },
      { id: 'mixed_veg', name: 'Mixed Veggies (Carrot, Beans, Gobi)', serving: '150g', protein: 3, carbs: 12, fat: 2, calories: 75, fiber: 4.5 },
      { id: 'cucumber_salad', name: 'Cucumber & Tomato Salad (1 bowl)', serving: '150g', protein: 1.5, carbs: 6, fat: 0.5, calories: 35, fiber: 2.5 },
      { id: 'bhindi_sabzi', name: 'Bhindi / Okra Sabzi', serving: '100g', protein: 2, carbs: 7, fat: 3, calories: 60, fiber: 3 }
    ]
  },
  {
    id: 'fruits',
    name: '4. Fresh Fruit / Hydration',
    recommendedPortion: '~15% of plate',
    color: 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300',
    items: [
      { id: 'papaya_m', name: 'Fresh Papaya Slices (1 cup)', serving: '140g', protein: 1, carbs: 15, fat: 0.3, calories: 60, fiber: 2.5 },
      { id: 'apple_m', name: '1 Medium Apple with skin', serving: '180g', protein: 0.5, carbs: 25, fat: 0.3, calories: 95, fiber: 4.4 },
      { id: 'banana_m', name: '1 Medium Banana', serving: '118g', protein: 1.3, carbs: 27, fat: 0.3, calories: 105, fiber: 3.1 },
      { id: 'orange_m', name: '1 Fresh Orange', serving: '130g', protein: 1.2, carbs: 15, fat: 0.2, calories: 62, fiber: 3.1 }
    ]
  },
  {
    id: 'dairy_fats',
    name: '5. Dairy / Healthy Fats (Optional Accent)',
    recommendedPortion: 'Moderate accompaniment',
    color: 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300',
    items: [
      { id: 'curd_bowl', name: 'Fresh Curd / Dahi (1 katori)', serving: '100g', protein: 4, carbs: 5, fat: 3, calories: 65, fiber: 0 },
      { id: 'ghee_spoon', name: '1 tsp Pure Desi Ghee', serving: '5g', protein: 0, carbs: 0, fat: 5, calories: 45, fiber: 0 },
      { id: 'almonds_portion', name: 'Almonds / Walnuts (10 nuts)', serving: '15g', protein: 3, carbs: 3, fat: 8, calories: 90, fiber: 2 }
    ]
  }
];

// 4. LEARN NUTRITION ARTICLES
export const NUTRITION_ARTICLES: NutritionArticle[] = [
  {
    id: 'what-are-macronutrients',
    title: 'What are Macronutrients? The Big Picture',
    readTime: '4 min read',
    category: 'Foundations',
    summary: 'Understand the three foundational energy-yielding dietary pillars: Proteins, Carbohydrates, and Fats, plus the critical role of Dietary Fiber.',
    icon: 'Layers',
    sections: [
      {
        heading: 'Energy & Structure',
        content: 'Macronutrients are the nutrients required by the human body in large quantities ("macro") every single day. Unlike micronutrients (vitamins and minerals) which act as biochemical cofactors without providing direct calories, macronutrients provide the raw energetic fuel measured in kilocalories (kcal) as well as the building blocks for muscles, bones, cell membranes, and enzymes.'
      },
      {
        heading: 'Caloric Breakdown by Macronutrient',
        content: 'Each macronutrient yields a specific energy density per gram:',
        points: [
          'Carbohydrates: 4 calories per gram (primary fast-burning cellular fuel)',
          'Proteins: 4 calories per gram (repair, structural turnover & enzymes)',
          'Fats: 9 calories per gram (dense storage, hormone signaling & vitamin transport)',
          'Dietary Fiber: ~1.5–2 calories per gram (microbiome fermentation into short-chain fatty acids)'
        ]
      },
      {
        heading: 'Why Variety Matters',
        content: 'No single macronutrient is inherently "good" or "bad." A balanced diet harmoniously combines complex starches for sustained physical energy, high-quality protein for cellular repair, and healthy unsaturated lipids for hormonal synthesis and fat-soluble vitamin absorption.'
      }
    ]
  },
  {
    id: 'what-are-micronutrients',
    title: 'Vitamins vs. Minerals: The Biochemical Catalysts',
    readTime: '3 min read',
    category: 'Micronutrients',
    summary: 'Discover the distinction between organic vitamins and inorganic minerals, and why trace amounts drive trillions of daily cellular reactions.',
    icon: 'Sparkles',
    sections: [
      {
        heading: 'Organic Vitamins vs. Inorganic Minerals',
        content: 'Vitamins are organic compounds (made by plants or animals) that can be degraded by air, acid, or heat. Minerals are inorganic chemical elements found in soil and water that enter plants via roots and maintain their exact chemical structure regardless of cooking.'
      },
      {
        heading: 'Water-Soluble vs Fat-Soluble Vitamins',
        content: 'Vitamins are divided into two functional categories:',
        points: [
          'Water-Soluble (Vitamin C & B-Complex): Dissolve in water, are not stored in significant quantities by the body, and excess amounts are routinely excreted in urine.',
          'Fat-Soluble (Vitamins A, D, E, K): Absorbed alongside dietary fats and stored in liver and adipose tissue for gradual release.'
        ]
      },
      {
        heading: 'The Role of Minerals',
        content: 'Major minerals (like Calcium, Potassium, Magnesium, and Sodium) regulate neuromuscular signaling, fluid balance, and bone density, while trace minerals (like Iron, Zinc, Selenium, and Iodine) are needed in microgram quantities to anchor enzyme active sites.'
      }
    ]
  },
  {
    id: 'protein-power',
    title: 'Demystifying Protein: Amino Acids & Complete Proteins',
    readTime: '4 min read',
    category: 'Macronutrients',
    summary: 'How amino acids assemble into tissues, the myth of vegetarian protein deficiency, and combining plant foods for complete nutrition.',
    icon: 'Dumbbell',
    sections: [
      {
        heading: 'The 20 Amino Acids',
        content: 'When you eat protein, your stomach acid and pancreatic enzymes dismantle it into individual amino acids. Out of 20 amino acids, 9 are considered "essential" because human biochemistry cannot synthesize them from scratch.'
      },
      {
        heading: 'Plant Protein Combining (Complementary Proteins)',
        content: 'While animal products (eggs, dairy, fish, chicken) contain all 9 essential amino acids in single foods, plant sources often have varying amino acid proportions. For example, grains like rice or wheat are rich in methionine but lower in lysine, while legumes like dal, rajma, or chickpeas are rich in lysine but lower in methionine.',
        points: [
          'Classic Indian combinations (Dal-Chawal, Khichdi, Roti-Dal, Rajma-Chawal, Idli-Sambar) naturally pair grains and legumes to deliver a 100% complete amino acid profile across the day.',
          'You do not need to combine them in every single mouthful—eating a varied mix of whole grains, pulses, dairy/tofu, and seeds throughout the day fully meets adult amino acid needs.'
        ]
      }
    ]
  },
  {
    id: 'carbs-fiber-glucose',
    title: 'Carbohydrates & Dietary Fiber: Energy Without the Spike',
    readTime: '3 min read',
    category: 'Metabolism',
    summary: 'Why complex whole-food carbs are completely different from refined free sugars, and how fiber protects your microbiome.',
    icon: 'Zap',
    sections: [
      {
        heading: 'Simple vs. Complex Carbohydrates',
        content: 'Simple carbohydrates (table sugar, candy, sugary sodas) consist of short 1- or 2-unit sugar molecules that rush into the bloodstream rapidly. Complex carbohydrates (whole wheat, oats, millets, lentils) consist of long polysaccharide chains wrapped in protective fiber that require gradual enzymatic breakdown.'
      },
      {
        heading: 'The Power of Fiber',
        content: 'Dietary fiber acts as a natural physical brake on digestion. Soluble fiber forms a soothing gel in the stomach that blunts sudden glucose surges, while insoluble fiber adds gentle bulk to stool to prevent constipation and diverticular stress.'
      }
    ]
  },
  {
    id: 'healthy-fats',
    title: 'Dietary Fats: Unsaturated, Saturated, and Essential Lipids',
    readTime: '4 min read',
    category: 'Macronutrients',
    summary: 'Why dietary fat does not equal body fat, how omega-3s reduce inflammation, and finding the right kitchen balance.',
    icon: 'Heart',
    sections: [
      {
        heading: 'Why the Human Body Needs Fat',
        content: 'Dietary fats are necessary for creating steroid hormones (testosterone, estrogen), manufacturing bile acids to digest food, insulating nerves, and transporting vitamins A, D, E, and K into circulation.'
      },
      {
        heading: 'Choosing the Right Fats',
        content: 'Focus on balance and quality:',
        points: [
          'Unsaturated Fats (Nuts, seeds, mustard oil, olive oil, avocados): Support cardiovascular lipid balance and lower systemic arterial inflammation.',
          'Omega-3 Fatty Acids (Flaxseeds, chia seeds, walnuts, fatty fish): Vital for brain membrane flexibility and cardiovascular rhythm.',
          'Saturated Fats (Ghee, butter, whole dairy, coconut): Enjoy in moderate, traditional proportions within overall calorie balance.',
          'Trans Fats (Partially hydrogenated industrial bakery shortenings): Avoid where possible, as they raise LDL and lower beneficial HDL cholesterol.'
        ]
      }
    ]
  },
  {
    id: 'how-to-read-labels',
    title: 'How to Read a Nutrition Label Like a Scientist',
    readTime: '5 min read',
    category: 'Practical Skills',
    summary: 'A step-by-step masterclass on serving sizes, % Daily Value (% DV), spotting added sugars, and decoding ingredient lists.',
    icon: 'BookOpen',
    sections: [
      {
        heading: 'Step 1: Check the Serving Size First',
        content: 'All numbers printed on a package label (calories, fat, sodium, sugar) apply strictly to ONE designated serving size, NOT the entire packet. If a bag of chips lists 150 calories for a 30g serving, but the bag weighs 90g, eating the bag means consuming 3x the numbers shown (450 calories).'
      },
      {
        heading: 'Step 2: Understand the 5 / 20 Rule for % Daily Value (% DV)',
        content: '% Daily Value shows how much a nutrient in a serving contributes to a standard 2,000-calorie daily reference diet:',
        points: [
          '5% DV or less is considered LOW for that nutrient.',
          '20% DV or more is considered HIGH for that nutrient.',
          'Use this guide to aim for higher % DV in Fiber, Calcium, Vitamin D, and Iron, and lower % DV in Sodium and Added Sugars.'
        ]
      },
      {
        heading: 'Step 3: Read Ingredients in Descending Order',
        content: 'Ingredients are listed strictly by weight from highest to lowest. If sugar, palm oil, or refined wheat flour (maida) are in the top 3 ingredients, that food is predominantly composed of those ingredients.'
      }
    ]
  },
  {
    id: 'balanced-plate-model',
    title: 'Building a Balanced Plate: The Visual Model',
    readTime: '3 min read',
    category: 'Daily Living',
    summary: 'How to organize lunch and dinner plates using simple visual proportions without weighing scales or calorie counting.',
    icon: 'Salad',
    sections: [
      {
        heading: 'The 3-Part Plate Proportion',
        content: 'Visualizing your plate creates effortless nutritional balance without restrictive rules:',
        points: [
          '1/2 Plate: Colorful Vegetables & Fresh Salad (Spinach, cucumber, tomatoes, carrots, bhindi, gobi) for micronutrients, fiber, and volume.',
          '1/4 Plate: Quality Protein (Dal, paneer, boiled eggs, tofu, chickpeas, fish, chicken) for cellular repair and satiety.',
          '1/4 Plate: Whole Grains (Roti, brown/white rice, millets, oats) for steady, clean metabolic fuel.',
          'Accent: 1 bowl of Curd or a modest spoon of Ghee / healthy oil dressing for healthy fats and probiotics.'
        ]
      },
      {
        heading: 'Hydration Matters',
        content: 'Drink clean water consistently throughout the day. Dehydration is frequently misinterpreted by the brain as false hunger cravings or afternoon mental fatigue.'
      }
    ]
  },
  {
    id: 'individual-variability',
    title: 'Why Nutritional Needs Differ Between People',
    readTime: '3 min read',
    category: 'Individual Health',
    summary: 'Age, biological sex, activity level, climate, and metabolic health mean no single diet works identically for everyone.',
    icon: 'Activity',
    sections: [
      {
        heading: 'Personalized Factors',
        content: 'Daily nutrient and energy requirements are not static numbers. They vary widely based on:',
        points: [
          'Age & Growth: Growing adolescents and teenagers have higher calcium, iron, and energy requirements per kg of body weight than older adults.',
          'Physical Activity: Athletes and manual workers require significantly higher glycogen replenishment and fluid/electrolyte intake.',
          'Life Stages & Pregnancy: Expectant and lactating mothers need increased dietary folate, iron, and protein to support fetal tissue genesis.',
          'Medical Circumstances: Clinical conditions (like diabetes, celiac disease, thyroid disorders, or kidney disease) require tailored clinical guidance from registered dietitians or medical doctors.'
        ]
      }
    ]
  }
];
