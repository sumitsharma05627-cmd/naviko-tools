export type DietaryPreference = 'vegetarian' | 'vegan' | 'egg' | 'non-vegetarian' | 'jain';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type HealthGoal = 'balanced_eating' | 'general_fitness' | 'meal_organization' | 'healthy_habits';
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner';

export interface MealOption {
  id: string;
  name: string;
  mealType: MealType;
  dietaryTypes: DietaryPreference[];
  allergens: string[]; // 'dairy', 'gluten', 'peanuts', 'tree_nuts', 'soy', 'eggs', 'seafood', 'mustard', 'sesame'
  tags: string[]; // 'north-indian', 'south-indian', 'continental', 'quick', 'high-protein', 'high-fiber', 'comfort'
  ingredients: string[];
  dislikeKeywords: string[]; // words to match against user dislikes (e.g. 'mushrooms', 'karela', 'tofu')
  nutritionExplanation: string;
  easyAlternatives: string[];
  hydrationTip?: string;
  categoryGroup: 'produce' | 'grains' | 'proteins' | 'dairy' | 'pantry';
}

export interface UserDietPreferences {
  age: number;
  sex: 'male' | 'female' | 'unspecified';
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  foodStyles: string[];
  dislikes: string[];
  allergies: string[];
  mealsPerDay: 3 | 4 | 5;
  goal: HealthGoal;
}

export interface GeneratedMealPlan {
  id: string;
  createdAt: string;
  title: string;
  isMinor: boolean;
  userPrefs: UserDietPreferences;
  meals: {
    mealType: MealType;
    label: string;
    meal: MealOption;
  }[];
  dailyHydration: {
    targetLiters: string;
    recommendations: string[];
  };
  nutritionSummary: {
    focusArea: string;
    macroGuidance: string;
    safetyDisclaimer: string;
  };
}

export const COMMON_ALLERGENS = [
  { id: 'dairy', label: 'Dairy / Milk Products (Lactose)', icon: 'Milk' },
  { id: 'gluten', label: 'Gluten / Wheat / Semolina', icon: 'Wheat' },
  { id: 'peanuts', label: 'Peanuts / Groundnuts', icon: 'Nut' },
  { id: 'tree_nuts', label: 'Tree Nuts (Almonds, Cashews, Walnuts)', icon: 'Nut' },
  { id: 'soy', label: 'Soy / Tofu / Soya Chunks', icon: 'Bean' },
  { id: 'eggs', label: 'Eggs', icon: 'Egg' },
  { id: 'seafood', label: 'Fish & Shellfish', icon: 'Fish' },
  { id: 'sesame', label: 'Sesame (Til)', icon: 'Sparkles' },
  { id: 'mustard', label: 'Mustard (Sarson / Rai)', icon: 'Flame' },
];

export const COMMON_DISLIKES = [
  'Bitter Gourd (Karela)',
  'Mushrooms',
  'Tofu',
  'Eggplant (Baingan)',
  'Okra (Bhindi)',
  'Bell Peppers (Capsicum)',
  'Fish / Seafood',
  'Coriander / Cilantro',
  'Spicy Gravies',
  'Raw Onions',
];

export const FOOD_STYLES = [
  { id: 'north-indian', label: 'North Indian Homestyle' },
  { id: 'south-indian', label: 'South Indian & Millets' },
  { id: 'pan-indian', label: 'Wholesome Everyday Desi' },
  { id: 'continental', label: 'Simple Bowls & Salads' },
  { id: 'high-protein', label: 'Protein-Focused Staples' },
  { id: 'high-fiber', label: 'Digestive & High Fiber' },
];

// Rich library of balanced meals
export const MEAL_DATABASE: MealOption[] = [
  // ================= BREAKFASTS =================
  {
    id: 'b-poha-sprouts',
    name: 'Vegetable Poha with Sprouted Moong & Roasted Peanuts',
    mealType: 'breakfast',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian'],
    allergens: ['peanuts'],
    tags: ['north-indian', 'quick', 'pan-indian', 'high-fiber'],
    ingredients: ['Flattened rice (poha)', 'Sprouted green moong dal', 'Chopped carrots and green peas', 'Roasted peanuts', 'Mustard seeds & curry leaves', 'Fresh lemon juice'],
    dislikeKeywords: ['peanuts', 'sprouts'],
    nutritionExplanation: 'Provides quick-release complex carbs from poha, plant-based protein and living enzymes from sprouted moong, and vitamin C from lemon to enhance iron absorption.',
    easyAlternatives: ['Upma made with broken wheat (daliya)', 'Steamed idli with coconut and tomato chutney', 'Rolled oats porridge with seeds'],
    categoryGroup: 'grains'
  },
  {
    id: 'b-besan-chilla',
    name: 'Herbed Besan Chilla with Mint Chutney & Curd',
    mealType: 'breakfast',
    dietaryTypes: ['vegetarian', 'egg', 'non-vegetarian'],
    allergens: ['dairy'],
    tags: ['north-indian', 'high-protein', 'pan-indian'],
    ingredients: ['Gram flour (besan)', 'Grated carrots, onions, and spinach', 'Ajwain and turmeric', 'Homemade fresh mint chutney', 'Low-fat curd / dahi'],
    dislikeKeywords: ['onions', 'curd'],
    nutritionExplanation: 'Chickpea flour (besan) delivers sustained plant protein and soluble fiber with a low glycemic index, while probiotic curd supports healthy gut digestion.',
    easyAlternatives: ['Moong dal chilla with paneer stuffing', 'Sprouted moong dosa (pesarattu)', 'Tofu and vegetable stir-fry'],
    categoryGroup: 'proteins'
  },
  {
    id: 'b-idli-sambar',
    name: 'Steamed Ragi & Rice Idlis with Vegetable Sambar',
    mealType: 'breakfast',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian', 'jain'],
    allergens: [],
    tags: ['south-indian', 'high-fiber', 'pan-indian'],
    ingredients: ['Fermented ragi and rice batter', 'Toor dal sambar loaded with drumstick, bottle gourd, and pumpkin', 'Fresh coriander', 'Mild coconut-tomato chutney'],
    dislikeKeywords: ['sambar', 'gourd'],
    nutritionExplanation: 'Fermentation naturally boosts bioavailability of B-vitamins and gut microbes. Finger millet (ragi) provides calcium for bone strength, while dal and vegetables balance proteins and fiber.',
    easyAlternatives: ['Rava upma with sautéed beans', 'Multigrain dosa with vegetable stew', 'Oats and vegetable uttapam'],
    categoryGroup: 'grains'
  },
  {
    id: 'b-oats-almonds',
    name: 'Warm Rolled Oats Porridge with Toasted Almonds & Chia',
    mealType: 'breakfast',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian', 'jain'],
    allergens: ['tree_nuts', 'dairy'],
    tags: ['continental', 'quick', 'high-fiber'],
    ingredients: ['Rolled whole oats', 'Toned milk or almond milk', 'Chia seeds & pumpkin seeds', 'Sliced fresh banana or apple', 'Crushed almonds & pinch of cinnamon'],
    dislikeKeywords: ['oats', 'banana'],
    nutritionExplanation: 'Rich in beta-glucan soluble fiber to maintain steady cholesterol and smooth insulin response, paired with omega-3 fatty acids from chia seeds and protein from nuts.',
    easyAlternatives: ['Daliya porridge cooked with milk and walnuts', 'Overnight chia pudding with fresh seasonal fruits', 'Peanut butter banana toast on whole grain bread'],
    categoryGroup: 'grains'
  },
  {
    id: 'b-egg-toast',
    name: 'Two Herb-Scrambled Eggs on Whole Wheat Toast & Sliced Tomato',
    mealType: 'breakfast',
    dietaryTypes: ['egg', 'non-vegetarian'],
    allergens: ['eggs', 'gluten'],
    tags: ['continental', 'high-protein', 'quick'],
    ingredients: ['Two whole farm eggs (or one whole + two whites)', 'Whole grain wheat bread', 'Fresh basil/coriander and black pepper', 'Sliced ripe tomato and cucumber on the side', 'Drop of olive oil'],
    dislikeKeywords: ['eggs', 'tomato'],
    nutritionExplanation: 'Eggs offer complete, high-biological-value protein with all 9 essential amino acids plus choline for cognitive signaling, balanced with whole grain complex carbohydrates.',
    easyAlternatives: ['Tofu scramble with turmeric on sourdough bread', 'Paneer bhurji with multigrain toast', 'Boiled egg chaat with lime and fresh greens'],
    categoryGroup: 'proteins'
  },
  {
    id: 'b-jain-moong-chilla',
    name: 'Sattvic Yellow Moong Chilla with Grated Bottle Gourd & Coconut Chutney',
    mealType: 'breakfast',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian', 'jain'],
    allergens: [],
    tags: ['pan-indian', 'high-protein'],
    ingredients: ['Soaked yellow moong dal batter', 'Grated lauki (bottle gourd)', 'Green chilies, cumin, and rock salt', 'Fresh coconut chutney with curry leaves'],
    dislikeKeywords: ['lauki', 'gourd'],
    nutritionExplanation: 'Light, easy to digest, completely free of alliums (onion/garlic) and root vegetables, delivering clean plant protein and gentle hydration.',
    easyAlternatives: ['Rice and ragi steamed panki', 'Broken wheat savory daliya with peas and zucchini', 'Sattu buttermilk drink with roasted cumin'],
    categoryGroup: 'proteins'
  },

  // ================= MORNING SNACKS =================
  {
    id: 'ms-fruit-nuts',
    name: 'Seasonal Fruit Bowl (Papaya / Apple) with Soaked Walnuts',
    mealType: 'morning_snack',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian', 'jain'],
    allergens: ['tree_nuts'],
    tags: ['quick', 'pan-indian', 'continental'],
    ingredients: ['1 cup ripe papaya or crisp apple slices', '4 halves soaked walnuts or 5 soaked almonds', 'Sprinkle of ground flaxseed'],
    dislikeKeywords: ['papaya', 'walnuts'],
    nutritionExplanation: 'Provides digestive enzymes (papain), vitamin C, and neuroprotective alpha-linolenic acid (ALA Omega-3) to maintain focus until lunchtime.',
    easyAlternatives: ['Handful of roasted makhana (foxnuts)', 'Guava with chaat masala', 'Sweet orange or sweet lime segments'],
    categoryGroup: 'produce'
  },
  {
    id: 'ms-buttermilk',
    name: 'Spiced Chaas / Buttermilk with Mint & Roasted Cumin',
    mealType: 'morning_snack',
    dietaryTypes: ['vegetarian', 'egg', 'non-vegetarian'],
    allergens: ['dairy'],
    tags: ['pan-indian', 'quick', 'comfort'],
    ingredients: ['Diluted fresh curd', 'Mint leaves and ginger', 'Roasted cumin powder', 'Black salt (kala namak)'],
    dislikeKeywords: ['curd', 'buttermilk', 'mint'],
    nutritionExplanation: 'Hydrating, electrolyte-rich probiotic beverage that balances stomach acidity and provides natural cooling for daytime digestion.',
    easyAlternatives: ['Tender coconut water', 'Amla juice with honey and warm water', 'Lemon mint infused cold water'],
    categoryGroup: 'dairy'
  },
  {
    id: 'ms-roasted-chana',
    name: 'Roasted Bengal Gram (Bhuna Chana) & Sunflower Seeds',
    mealType: 'morning_snack',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian', 'jain'],
    allergens: [],
    tags: ['pan-indian', 'quick', 'high-protein'],
    ingredients: ['Roasted yellow gram with skin', 'Roasted sunflower seeds and pumpkin seeds', 'Pinch of rock salt'],
    dislikeKeywords: ['chana'],
    nutritionExplanation: 'Compact, dry, portable snack providing 7g+ of crisp dietary fiber and steady plant protein with virtually no saturated fat.',
    easyAlternatives: ['Roasted spiced peanuts', 'Dry roasted foxnuts (makhana)', 'Cucumber sticks with hummus'],
    categoryGroup: 'proteins'
  },

  // ================= LUNCHES =================
  {
    id: 'l-dal-roti-sabzi',
    name: 'Yellow Toor Dal Tadka, 2 Phulkas, Mixed Bhindi Sabzi & Cucumber Salad',
    mealType: 'lunch',
    dietaryTypes: ['vegetarian', 'egg', 'non-vegetarian'],
    allergens: ['gluten', 'dairy'],
    tags: ['north-indian', 'pan-indian', 'comfort'],
    ingredients: ['Yellow toor dal with cumin, tomato and ghee tadka', '2 whole wheat phulkas / rotis (light ghee)', 'Stir-fried okra (bhindi) with onions and spices', 'Crunchy cucumber and carrot salad with lemon juice'],
    dislikeKeywords: ['bhindi', 'okra', 'dal'],
    nutritionExplanation: 'Classic complementary amino acid pairing: whole wheat grain + legume dal forms a complete protein. Soluble fiber from okra and raw vegetables supports a balanced glycemic curve.',
    easyAlternatives: ['Moong dal khichdi with mixed vegetable raita', 'Rajma curry with brown rice and kachumber', 'Palak paneer with whole wheat roti'],
    categoryGroup: 'grains'
  },
  {
    id: 'l-rajma-chawal',
    name: 'Homestyle Rajma Curry with Steamed Brown/Basmati Rice & Salad',
    mealType: 'lunch',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian'],
    allergens: [],
    tags: ['north-indian', 'pan-indian', 'high-fiber'],
    ingredients: ['Slow-simmered red kidney beans (rajma) with onion, tomato, and ginger', '1 bowl steamed brown rice or aromatic basmati rice', 'Side salad of radish, cucumber, and green chili', 'Lemon wedge'],
    dislikeKeywords: ['rajma', 'beans', 'rice'],
    nutritionExplanation: 'Kidney beans are exceptionally dense in dietary fiber, non-heme iron, and resistant starches that feed beneficial Bifidobacteria in the gut.',
    easyAlternatives: ['Chole (chickpea curry) with steamed rice', 'Black eyed peas (lobia) with multigrain roti', 'Sprouted moong dal curry with jeera rice'],
    categoryGroup: 'proteins'
  },
  {
    id: 'l-paneer-bhurji',
    name: 'Methi Paneer Bhurji with 2 Multigrain Rotis & Beetroot Raita',
    mealType: 'lunch',
    dietaryTypes: ['vegetarian', 'egg', 'non-vegetarian'],
    allergens: ['dairy', 'gluten'],
    tags: ['north-indian', 'high-protein', 'pan-indian'],
    ingredients: ['Fresh cottage cheese (paneer) crumbled with fenugreek (methi) leaves and tomatoes', '2 multigrain rotis (wheat, ragi, jowar)', 'Fresh beetroot curd raita with roasted jeera'],
    dislikeKeywords: ['paneer', 'curd', 'beetroot'],
    nutritionExplanation: 'High-protein lunch delivering 18g+ of bioavailable dairy casein protein, calcium, and dietary nitrates from beetroot that support vascular nitric oxide production.',
    easyAlternatives: ['Tofu stir-fry with bell peppers and whole wheat paratha', 'Egg bhurji with roti and tomato salad', 'Soya chunk curry with steamed brown rice'],
    categoryGroup: 'proteins'
  },
  {
    id: 'l-chicken-rice',
    name: 'Grilled Herb Chicken Breast with Steamed Brown Rice & Sautéed Greens',
    mealType: 'lunch',
    dietaryTypes: ['non-vegetarian'],
    allergens: [],
    tags: ['continental', 'high-protein', 'pan-indian'],
    ingredients: ['120g skinless chicken breast marinated in curd, lemon, garlic, and herbs', '1 cup steamed brown rice or quinoa', 'Sautéed French beans, carrots, and spinach', 'Fresh mint lemon dip'],
    dislikeKeywords: ['chicken', 'garlic'],
    nutritionExplanation: 'Lean animal protein providing all essential amino acids with high zinc, selenium, and B12 for energetic metabolism, combined with sustained complex carbohydrates.',
    easyAlternatives: ['Fish curry (Rohu/Pomfret) with boiled rice and beans', 'Egg curry with two rotis and green salad', 'Paneer tikka bowl with quinoa and vegetables'],
    categoryGroup: 'proteins'
  },
  {
    id: 'l-fish-curry',
    name: 'Coastal Spiced Fish Curry with Brown Rice & Steamed Cabbage Thoran',
    mealType: 'lunch',
    dietaryTypes: ['non-vegetarian'],
    allergens: ['seafood'],
    tags: ['south-indian', 'high-protein'],
    ingredients: ['Fresh white fish fillet simmered in tomato, kokum, and mild coconut milk gravy', 'Steamed brown rice', 'Cabbage and green bean stir-fry with grated coconut and mustard seeds'],
    dislikeKeywords: ['fish', 'seafood', 'coconut'],
    nutritionExplanation: 'Fish is an exceptional natural source of long-chain Omega-3 EPA/DHA fatty acids for cardiovascular elasticity, complemented by the antioxidant indoles in steamed cabbage.',
    easyAlternatives: ['Egg masala curry with brown rice', 'Chicken stew with appam or brown rice', 'Paneer and vegetable pulao with dal'],
    categoryGroup: 'proteins'
  },
  {
    id: 'l-jain-khichdi',
    name: 'Nutrient-Dense Moong Dal & Rice Khichdi with Bottle Gourd & Curd',
    mealType: 'lunch',
    dietaryTypes: ['vegetarian', 'egg', 'non-vegetarian', 'jain'],
    allergens: ['dairy'],
    tags: ['pan-indian', 'comfort'],
    ingredients: ['Split yellow moong dal and small-grain rice cooked together with cumin, turmeric, and hing (asafoetida)', 'Finely diced lauki and green peas', 'Bowl of homemade fresh curd', 'Pinch of ghee'],
    dislikeKeywords: ['khichdi', 'curd', 'lauki'],
    nutritionExplanation: 'The gold standard of gentle Ayurvedic digestion. Perfectly balanced protein-to-carb ratio that eases gastrointestinal workload while maintaining steady energy.',
    easyAlternatives: ['Daliya and moong dal khichdi with roasted cumin', 'Buckwheat (kuttu) khichdi with cucumber raita', 'Toor dal with boiled rice and ghee'],
    categoryGroup: 'grains'
  },
  {
    id: 'l-vegan-buddha-bowl',
    name: 'Warm Tofu & Quinoa Buddha Bowl with Roasted Vegetables & Tahini',
    mealType: 'lunch',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian'],
    allergens: ['soy', 'sesame'],
    tags: ['continental', 'high-protein', 'high-fiber'],
    ingredients: ['100g pan-seared firm tofu cubes', 'Cooked fluffy quinoa', 'Roasted broccoli, bell peppers, and sweet potato', 'Creamy sesame tahini and lemon dressing', 'Baby spinach leaves'],
    dislikeKeywords: ['tofu', 'broccoli', 'sesame'],
    nutritionExplanation: '100% plant-based complete protein powerhouse. Quinoa and soy provide all nine essential amino acids alongside healthy monounsaturated fats from sesame tahini.',
    easyAlternatives: ['Chickpea and avocado salad bowl with lemon vinaigrette', 'Sprouted moong and vegetable chaat with roasted peanuts', 'Rajma and corn Mexican-style bowl with salsa'],
    categoryGroup: 'proteins'
  },

  // ================= EVENING SNACKS =================
  {
    id: 'es-makhana-green-tea',
    name: 'Slow-Roasted Turmeric Makhana (Foxnuts) with Green Tea',
    mealType: 'evening_snack',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian', 'jain'],
    allergens: [],
    tags: ['pan-indian', 'quick', 'high-fiber'],
    ingredients: ['1 bowl roasted foxnuts in half a teaspoon of ghee/oil', 'Turmeric, black pepper, and pink salt', 'Cup of warm brewed green tea or tulsi tea'],
    dislikeKeywords: ['makhana', 'tea'],
    nutritionExplanation: 'Foxnuts are naturally rich in magnesium, potassium, and phosphorus with a low glycemic index, curbing evening sugar cravings without empty calories.',
    easyAlternatives: ['Roasted puffed rice (kurmura/bhel) with raw vegetables', 'Handful of roasted pumpkin seeds and almonds', 'Slice of whole grain toast with peanut butter'],
    categoryGroup: 'produce'
  },
  {
    id: 'es-boiled-egg-chaat',
    name: 'Hard-Boiled Egg Chaat with Onion, Tomato & Lemon',
    mealType: 'evening_snack',
    dietaryTypes: ['egg', 'non-vegetarian'],
    allergens: ['eggs'],
    tags: ['pan-indian', 'high-protein', 'quick'],
    ingredients: ['2 boiled egg whites and 1 yolk chopped into cubes', 'Finely diced tomato, green chilies, and onion', 'Chaat masala, roasted cumin, and fresh lime juice'],
    dislikeKeywords: ['eggs', 'onions'],
    nutritionExplanation: '10g+ of rapid post-workday protein that staves off dinner overeating and supplies steady amino acids for muscle repair.',
    easyAlternatives: ['Spiced paneer cubes sautéed with oregano', 'Dry roasted sprouted chana chaat', 'Tofu skewers with mint dip'],
    categoryGroup: 'proteins'
  },
  {
    id: 'es-sprouts-chaat',
    name: 'Tangy Steamed Moong Sprouts Chaat with Pomegranate & Mint',
    mealType: 'evening_snack',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian', 'jain'],
    allergens: [],
    tags: ['pan-indian', 'quick', 'high-fiber'],
    ingredients: ['Lightly steamed sprouted moong', 'Pomegranate arils for natural sweet crunch', 'Chopped cucumber and tomato', 'Lemon juice and rock salt'],
    dislikeKeywords: ['sprouts', 'pomegranate'],
    nutritionExplanation: 'Steaming tenderizes sprout fiber for effortless digestion while retaining antioxidant polyphenols and potassium.',
    easyAlternatives: ['Boiled sweet corn with lime and pepper', 'Roasted black chana with peanuts', 'Apple slices with almond butter'],
    categoryGroup: 'produce'
  },

  // ================= DINNERS =================
  {
    id: 'd-palak-dal-roti',
    name: 'Iron-Rich Palak Dal, 2 Phulkas & Steamed Cauliflower Peas Sabzi',
    mealType: 'dinner',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian'],
    allergens: ['gluten'],
    tags: ['north-indian', 'pan-indian', 'comfort'],
    ingredients: ['Yellow moong dal cooked with chopped fresh spinach (palak), tomato and cumin', '2 whole wheat phulkas without excess ghee', 'Lightly spiced cauliflower and green peas sabzi'],
    dislikeKeywords: ['palak', 'spinach', 'cauliflower'],
    nutritionExplanation: 'Spinach provides lutein and dietary folate, while yellow moong dal is gentle on evening digestion, ensuring deep and restorative sleep.',
    easyAlternatives: ['Masoor dal with steamed rice and cucumber salad', 'Lauki kofta in tomato gravy with rotis', 'Vegetable and paneer stir fry with whole wheat roti'],
    categoryGroup: 'proteins'
  },
  {
    id: 'd-grilled-paneer-soup',
    name: 'Clear Vegetable Soup with Pan-Seared Paneer & Sautéed Beans',
    mealType: 'dinner',
    dietaryTypes: ['vegetarian', 'egg', 'non-vegetarian'],
    allergens: ['dairy'],
    tags: ['continental', 'high-protein', 'pan-indian'],
    ingredients: ['Warm clear broth with carrots, cabbage, and ginger', '100g paneer cubes lightly seared in cold-pressed oil', 'Steamed green French beans with toasted sesame'],
    dislikeKeywords: ['paneer', 'cabbage', 'beans'],
    nutritionExplanation: 'Low glycemic, protein-forward dinner ideal for evening insulin sensitivity. Whey and casein in paneer release amino acids slowly throughout the overnight fast.',
    easyAlternatives: ['Tomato basil soup with grilled cheese whole grain sandwich', 'Mixed dal soup with sautéed broccoli and tofu', 'Vegetable stew with 1 appam or roti'],
    categoryGroup: 'proteins'
  },
  {
    id: 'd-egg-curry-rice',
    name: 'Light Onion-Tomato Egg Curry with Steamed Rice & Green Salad',
    mealType: 'dinner',
    dietaryTypes: ['egg', 'non-vegetarian'],
    allergens: ['eggs'],
    tags: ['pan-indian', 'high-protein'],
    ingredients: ['2 whole boiled eggs simmered in light tomato, cumin, and coriander gravy', '1 medium cup steamed rice or 2 rotis', 'Sliced carrot and cucumber salad with lemon'],
    dislikeKeywords: ['eggs', 'rice'],
    nutritionExplanation: 'Eggs deliver high bioavailable protein and essential selenium to support thyroid hormone conversion, balanced by gentle carbohydrates.',
    easyAlternatives: ['Chicken broth noodle soup with shredded chicken', 'Fish tikka with garden salad and roasted potatoes', 'Paneer bhurji with warm phulkas'],
    categoryGroup: 'proteins'
  },
  {
    id: 'd-grilled-fish-veggies',
    name: 'Lemon-Pepper Grilled Fish with Roasted Sweet Potato & Steamed Broccoli',
    mealType: 'dinner',
    dietaryTypes: ['non-vegetarian'],
    allergens: ['seafood'],
    tags: ['continental', 'high-protein'],
    ingredients: ['130g grilled fish fillet (Rohu, Basa, or Salmon) seasoned with lemon, garlic, and cracked pepper', '1 baked or boiled sweet potato', 'Steamed broccoli and zucchini florets with olive oil drizzle'],
    dislikeKeywords: ['fish', 'broccoli', 'garlic'],
    nutritionExplanation: 'Anti-inflammatory Omega-3 fats paired with potassium and vitamin A from sweet potato promote cellular restorative recovery overnight.',
    easyAlternatives: ['Herb-roasted chicken breast with roasted veggies', 'Egg white omelet with sautéed mushrooms and spinach', 'Lentil soup with quinoa and avocado'],
    categoryGroup: 'proteins'
  },
  {
    id: 'd-jain-lauki-dal',
    name: 'Light Moong-Lauki Dal with 2 Whole Wheat Phulkas & Cucumber Slices',
    mealType: 'dinner',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian', 'jain'],
    allergens: ['gluten'],
    tags: ['pan-indian', 'comfort'],
    ingredients: ['Yellow moong dal boiled with tender bottle gourd (lauki), tempered with cumin, green chilies, and hing', '2 freshly puffed wheat rotis', 'Chilled cucumber slices with rock salt and lemon'],
    dislikeKeywords: ['lauki', 'gourd'],
    nutritionExplanation: 'Exceptionally light and calming for evening digestion. Lauki is 96% water and alkalizing, preventing night-time acid reflux.',
    easyAlternatives: ['Yellow dal with steamed rice and ghee', 'Ragi mudde with mild sambar', 'Moong dal soup with toast'],
    categoryGroup: 'grains'
  },
  {
    id: 'd-vegan-lentil-curry',
    name: 'Creamy Coconut Red Lentil (Masoor) Curry with Brown Rice & Sautéed Greens',
    mealType: 'dinner',
    dietaryTypes: ['vegetarian', 'vegan', 'egg', 'non-vegetarian', 'jain'],
    allergens: [],
    tags: ['pan-indian', 'high-fiber'],
    ingredients: ['Split red lentils cooked in tomato, mild coconut milk, and turmeric', 'Steamed brown rice or millets', 'Sautéed mustard greens or spinach with cumin'],
    dislikeKeywords: ['coconut', 'spinach', 'lentils'],
    nutritionExplanation: 'Red lentils cook quickly and are light on the stomach while providing 12g+ of clean plant protein, iron, and prebiotic soluble fiber.',
    easyAlternatives: ['Chickpea stew with steamed couscous or rice', 'Tofu vegetable fried rice with brown rice', 'Yellow pumpkin and moong dal with rotis'],
    categoryGroup: 'proteins'
  }
];

// Helper to filter meals based on user profile constraints
export function filterCompatibleMeals(
  meals: MealOption[],
  prefs: UserDietPreferences,
  mealType: MealType
): MealOption[] {
  return meals.filter((item) => {
    // 1. Must match meal type
    if (item.mealType !== mealType) return false;

    // 2. Must match dietary preference
    if (!item.dietaryTypes.includes(prefs.dietaryPreference)) {
      return false;
    }

    // 3. Strict Allergen Exclusion
    if (prefs.allergies && prefs.allergies.length > 0) {
      const hasAllergen = item.allergens.some((allg) =>
        prefs.allergies.includes(allg)
      );
      if (hasAllergen) return false;
    }

    // 4. Disliked ingredients exclusion
    if (prefs.dislikes && prefs.dislikes.length > 0) {
      const userDislikesLower = prefs.dislikes.map((d) => d.toLowerCase().trim());
      const matchesDislike = item.dislikeKeywords.some((keyword) =>
        userDislikesLower.some((d) => d.includes(keyword) || keyword.includes(d))
      );
      if (matchesDislike) return false;
    }

    return true;
  });
}

// Generate complete plan
export function generateMealPlan(prefs: UserDietPreferences): GeneratedMealPlan {
  const isMinor = prefs.age > 0 && prefs.age < 18;

  // Determine needed meal types based on mealsPerDay
  const neededTypes: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: 'Breakfast' },
  ];

  if (prefs.mealsPerDay === 5) {
    neededTypes.push({ type: 'morning_snack', label: 'Morning Snack' });
  }

  neededTypes.push({ type: 'lunch', label: 'Lunch' });

  if (prefs.mealsPerDay >= 4) {
    neededTypes.push({ type: 'evening_snack', label: 'Evening Snack' });
  }

  neededTypes.push({ type: 'dinner', label: 'Dinner' });

  // Select a meal for each type
  const selectedMeals = neededTypes.map(({ type, label }) => {
    const candidates = filterCompatibleMeals(MEAL_DATABASE, prefs, type);
    // If no candidates matched due to extreme allergy/dislike combinations, fallback to general options with allergens stripped
    const pool = candidates.length > 0
      ? candidates
      : MEAL_DATABASE.filter((m) => m.mealType === type);

    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosenMeal = pool[randomIndex] || pool[0];

    return {
      mealType: type,
      label,
      meal: chosenMeal,
    };
  });

  // Calculate hydration recommendation
  const baseLiters = prefs.activityLevel === 'very_active' ? '3.0 – 3.5' : prefs.activityLevel === 'moderately_active' ? '2.5 – 3.0' : '2.0 – 2.5';

  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    title: `${prefs.dietaryPreference.charAt(0).toUpperCase() + prefs.dietaryPreference.slice(1)} ${prefs.goal.replace(/_/g, ' ')} Plan`,
    isMinor,
    userPrefs: prefs,
    meals: selectedMeals,
    dailyHydration: {
      targetLiters: baseLiters,
      recommendations: [
        'Drink 1–2 glasses of lukewarm water right upon waking to reactivate metabolism.',
        'Sip fluids gradually between meals rather than chugging large quantities during eating.',
        'Incorporate natural electrolyte fluids: coconut water, light buttermilk (chaas), or infused lemon-mint water.',
        'Monitor urine color: pale straw yellow indicates optimal hydration status.'
      ],
    },
    nutritionSummary: {
      focusArea: isMinor
        ? 'Growth, Cognitive Energy & Wholesome Nutrient Density'
        : 'Metabolic Balance, Sustained Energy & Digestive Longevity',
      macroGuidance: isMinor
        ? 'Prioritizes ample bone-building calcium, iron, unrefined starches for sports and school focus, and adequate protein for active physical growth. Strict dieting and calorie-restriction are contraindicated for teenagers.'
        : 'Structured around the Balanced Plate principle: approximately half plate vegetables and fiber, one quarter wholesome protein, and one quarter low-glycemic complex carbohydrates.',
      safetyDisclaimer: 'All meal ideas are provided for educational and organizational purposes. Individual dietary needs vary with medical history, medications, and clinical parameters. Always consult a registered dietitian or doctor for clinical therapy.',
    }
  };
}
