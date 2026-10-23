export interface AyurvedaHerb {
  id: string;
  name: string;
  hindiName: string;
  sanskritName: string;
  botanicalName: string;
  family: string;
  category: 'spice' | 'herb' | 'fruit' | 'root';
  shortSummary: string;
  culinaryUses: string[];
  activePhytochemicals: string[];
  ayurvedicEnergetics: {
    rasa: string[]; // Taste: Madhura (Sweet), Amla (Sour), Lavana (Salty), Katu (Pungent), Tikta (Bitter), Kashaya (Astringent)
    virya: 'Heating (Ushna)' | 'Cooling (Sheeta)';
    vipaka: 'Sweet (Madhura)' | 'Pungent (Katu)' | 'Sour (Amla)';
    doshaEffect: string; // e.g., 'Balances Vata & Kapha; pacifies Pitta in culinary amounts'
  };
  modernResearchSummary: string;
  evidenceLimitations: string;
  contraindicationsAndWarnings: string[];
  safeCulinaryContext: string;
  references: {
    title: string;
    source: string;
    year?: string;
  }[];
}

export interface AyurvedaScienceArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  readTime: string;
  category: 'Ahara (Dietetics)' | 'Ritucharya (Seasonality)' | 'Bioavailability' | 'Microbiome & Fermentation' | 'Safety & Evidence';
  publishedDate: string;
  reviewedBy: string;
  summary: string;
  sections: {
    heading: string;
    modernScience: string;
    ayurvedicTradition: string;
    evidenceEvaluation: string;
    keyTakeaway: string;
  }[];
  practicalTips: string[];
  references: {
    citation: string;
    organization: string;
  }[];
}

export const AYURVEDA_HERBS: AyurvedaHerb[] = [
  {
    id: 'amla',
    name: 'Amla (Indian Gooseberry)',
    hindiName: 'आंवला',
    sanskritName: 'Amalaki (धात्री)',
    botanicalName: 'Phyllanthus emblica',
    family: 'Phyllanthaceae',
    category: 'fruit',
    shortSummary: 'One of the richest natural botanical sources of Vitamin C and hydrolyzable tannins, traditionally revered as a prime Rasayana (rejuvenator).',
    culinaryUses: [
      'Fresh fruit consumed with a pinch of rock salt or black pepper',
      'Freshly pressed raw juice (Amla ras) diluted in warm water',
      'Traditional spiced Amla pickle (Achar) and sun-dried shreds (Amla supari)',
      'Traditional herbal confection (Chyawanprash) base ingredient',
      'Added to dal or vegetable stews for a tart, vitamin-rich flavor'
    ],
    activePhytochemicals: [
      'Ascorbic Acid (Vitamin C: 400–600 mg per 100g fresh edible pulp)',
      'Ellagitannins (Emblicanin A and B, punigluconin)',
      'Gallic acid and Ellagic acid',
      'Flavonoids (Quercetin, Kaempferol)'
    ],
    ayurvedicEnergetics: {
      rasa: ['Sour (Amla)', 'Astringent (Kashaya)', 'Sweet (Madhura)', 'Bitter (Tikta)', 'Pungent (Katu) — Contains 5 of the 6 tastes, lacking only Salty'],
      virya: 'Cooling (Sheeta)',
      vipaka: 'Sweet (Madhura)',
      doshaEffect: 'Tridoshic (Balances Vata, Pitta, and Kapha; uniquely soothing for Pitta due to cooling virya and sweet post-digestive effect)'
    },
    modernResearchSummary:
      'Human clinical trials and randomized controlled evaluations have demonstrated that Amla supplementation supports endothelial function, assists in normal lipid metabolism (reducing total cholesterol and triglycerides), and exhibits strong free-radical scavenging capacity due to its unique tannin-stabilized ascorbic acid complex.',
    evidenceLimitations:
      'While antioxidant mechanisms and cellular studies are robust, large-scale multi-center clinical trials in human cardiovascular endpoints remain moderate in sample size. Should not be viewed as a substitute for prescribed statins or cardiac therapy.',
    contraindicationsAndWarnings: [
      'May enhance the hypoglycemic effect of antidiabetic medications; monitor blood sugar if consuming concentrated extracts.',
      'Mild anticoagulant activity in high doses; exercise caution prior to scheduled elective surgery.',
      'High acidity in concentrated raw form may cause temporary hyperacidity in individuals with active peptic ulcers.'
    ],
    safeCulinaryContext:
      'Consuming 1 to 2 fresh raw fruits daily, or 15–20 ml of fresh diluted juice, is safe, time-tested, and provides over 100% of daily adult Vitamin C needs.',
    references: [
      { title: 'Indian Food Composition Tables (IFCT)', source: 'ICMR–National Institute of Nutrition (NIN)', year: '2017' },
      { title: 'Amla (Emblica officinalis Gaertn.) in human dyslipidemia: A randomized trial', source: 'BMC Complementary Medicine and Therapies', year: '2019' },
      { title: 'Charaka Samhita, Chikitsa Sthana (Rasayana Adhyaya)', source: 'Traditional Classical Compendium', year: 'Ancient' }
    ]
  },
  {
    id: 'turmeric',
    name: 'Turmeric (Haldi)',
    hindiName: 'हल्दी',
    sanskritName: 'Haridra (हरिद्रा)',
    botanicalName: 'Curcuma longa',
    family: 'Zingiberaceae',
    category: 'spice',
    shortSummary: 'The golden rhizome of Indian culinary tradition, containing curcuminoids and volatile aromatic turmerones.',
    culinaryUses: [
      'Foundation spice in tadka / tempering for lentils, curries, and sabzis',
      'Haldi Doodh (Golden Milk) warmed with crushed black pepper and a touch of fat',
      'Fresh raw turmeric grated into winter salads and seasonal pickles (Kachhi haldi)'
    ],
    activePhytochemicals: [
      'Curcuminoids (Curcumin ~77%, Demethoxycurcumin ~17%, Bisdemethoxycurcumin ~3%)',
      'Volatile Essential Oils (ar-Turmerone, α-turmerone, curlone)',
      'Curcumin content in culinary powder typically ranges from 2% to 5%'
    ],
    ayurvedicEnergetics: {
      rasa: ['Bitter (Tikta)', 'Pungent (Katu)'],
      virya: 'Heating (Ushna)',
      vipaka: 'Pungent (Katu)',
      doshaEffect: 'Balances Kapha and Vata; can increase Pitta if consumed in excessive isolated quantities'
    },
    modernResearchSummary:
      'Curcumin inhibits the NF-κB inflammatory signaling pathway, modulates down-stream inflammatory cytokines (TNF-α, IL-6), and exhibits antioxidant properties. Research strongly confirms traditional culinary synergy: piperine from black pepper enhances curcumin oral bioavailability by up to 2,000% by slowing hepatic glucuronidation.',
    evidenceLimitations:
      'Pure curcumin has inherently low aqueous solubility and rapid intestinal clearance. Many laboratory studies use high-potency encapsulated extracts not achievable through dietary spices alone.',
    contraindicationsAndWarnings: [
      'High-dose extracts may act as a mild anticoagulant; caution advised with blood-thinners (warfarin, aspirin).',
      'May stimulate gallbladder contractions; contraindicated in individuals with active bile duct obstruction or acute gallstones.',
      'Ensure spice purity: choose certified sources to avoid synthetic lead-chromate dye adulteration.'
    ],
    safeCulinaryContext:
      'Daily culinary use (0.5 to 1 teaspoon, ~2–3g of ground turmeric powder in cooked food with cooking fats and black pepper) is safe, beneficial, and well-tolerated across lifetimes.',
    references: [
      { title: 'Influence of piperine on the pharmacokinetics of curcumin in animals and human volunteers', source: 'Planta Medica', year: '1998' },
      { title: 'Safety and anti-inflammatory activity of curcumin: A systematic review', source: 'Critical Reviews in Food Science and Nutrition', year: '2020' },
      { title: 'Sushruta Samhita, Sutra Sthana', source: 'Classical Ayurvedic Compendium', year: 'Ancient' }
    ]
  },
  {
    id: 'ginger',
    name: 'Ginger (Adrak / Sonth)',
    hindiName: 'अदरक (ताज़ा) / सोंठ (सूखा)',
    sanskritName: 'Ardraka / Shunthi (विश्वभेषज)',
    botanicalName: 'Zingiber officinale',
    family: 'Zingiberaceae',
    category: 'root',
    shortSummary: 'Universal digestive spice (Vishwabheshaja), clinically recognized for antiemetic efficacy and digestive enzyme stimulation.',
    culinaryUses: [
      'Minced or grated in daily vegetable sautés, dals, and marinades',
      'Fresh ginger tea brewed with crushed leaves or warm water infusion before meals',
      'Dry ginger powder (Sonth) in winter ladoos, spice blends, and chai masala'
    ],
    activePhytochemicals: [
      'Gingerols (principally 6-gingerol in fresh rhizome)',
      'Shogaols (dehydration product formed upon drying, potent in dry Sonth)',
      'Zingiberene (dominant aromatic sesquiterpene)',
      'Paradols and zingerone'
    ],
    ayurvedicEnergetics: {
      rasa: ['Pungent (Katu)', 'Sweet secondary taste in dry Sonth'],
      virya: 'Heating (Ushna)',
      vipaka: 'Sweet (Madhura)',
      doshaEffect: 'Balances Vata and Kapha; fresh ginger can mildly elevate Pitta, whereas dry ginger is traditionally considered gentler on Pitta'
    },
    modernResearchSummary:
      'Systematic reviews confirm that ginger accelerates gastric emptying, stimulates salivary and pancreatic digestive amylase and lipase secretion, and provides safe relief from mild nausea (pregnancy-related nausea, motion sickness, and post-operative recovery).',
    evidenceLimitations:
      'Long-term high-dose cardiovascular trials are scarce. Findings for inflammatory joint relief show modest to moderate benefit with variable standardized extract dosing.',
    contraindicationsAndWarnings: [
      'Large doses (over 4–5g of dry extract daily) may cause mild heartburn, diarrhea, or mouth irritation.',
      'Mild platelet aggregation inhibition: discuss with a physician if taking prescription antiplatelet medications.',
      'Gallstone sufferers should consult a clinician before consuming therapeutic high-dose supplements.'
    ],
    safeCulinaryContext:
      '1 to 2 teaspoons of fresh grated ginger (or 1–2g of dried ginger powder) in cooking or steeped tea is universally well-tolerated and promotes healthy gastric motility.',
    references: [
      { title: 'The Effect of Ginger on Gastric Motility and Emptying', source: 'European Journal of Gastroenterology & Hepatology', year: '2008' },
      { title: 'WHO Monographs on Selected Medicinal Plants, Vol 1', source: 'World Health Organization', year: '1999' }
    ]
  },
  {
    id: 'tulsi',
    name: 'Tulsi (Holy Basil)',
    hindiName: 'तुलसी',
    sanskritName: 'Surasa / Tulasi (तुलसी)',
    botanicalName: 'Ocimum sanctum (syn. Ocimum tenuiflorum)',
    family: 'Lamiaceae',
    category: 'herb',
    shortSummary: 'Revered as the "Queen of Herbs", an aromatic adaptogen supporting respiratory comfort and normal physiological stress response.',
    culinaryUses: [
      'Fresh leaves steeped in boiling water for morning herbal infusions (Tulsi chai)',
      'Chewed fresh or brewed with black pepper and ginger during weather transitions',
      'Infused in cool water with lemon and honey during summer heat'
    ],
    activePhytochemicals: [
      'Eugenol (1-hydroxy-2-methoxy-4-allylbenzene: primary volatile phenol)',
      'Ursolic acid and Rosmarinic acid (triterpenes with antioxidant properties)',
      'Caryophyllene and Linalool'
    ],
    ayurvedicEnergetics: {
      rasa: ['Pungent (Katu)', 'Bitter (Tikta)'],
      virya: 'Heating (Ushna)',
      vipaka: 'Pungent (Katu)',
      doshaEffect: 'Pacifies Vata and Kapha; may mildly elevate Pitta in excess'
    },
    modernResearchSummary:
      'Clinical studies on Tulsi leaf extracts indicate adaptogenic properties—assisting in modulating neuroendocrine cortisol response during acute psychological and environmental stress, alongside mild antibacterial and bronchodilatory support.',
    evidenceLimitations:
      'Most randomized human studies feature short durations (2 to 8 weeks) and modest cohorts. Not a treatment for severe clinical anxiety or pulmonary infections.',
    contraindicationsAndWarnings: [
      'Traditional animal studies suggest potential mild anti-fertility effects in very high doses; women attempting conception may wish to moderate concentrated extracts.',
      'May enhance sedative effects if co-administered with central nervous system depressants.',
      'Check blood glucose if taking prescription diabetic drugs.'
    ],
    safeCulinaryContext:
      'Brewing 4 to 6 fresh leaves or 1 teaspoon of dried organic leaves into tea daily is safe and non-toxic for ordinary daily consumption.',
    references: [
      { title: 'The Clinical Efficacy and Safety of Tulsi in Humans: A Systematic Review', source: 'Evidence-Based Complementary and Alternative Medicine', year: '2017' },
      { title: 'Ayurvedic Pharmacopoeia of India (API)', source: 'Ministry of Ayush, Govt. of India', year: '2001' }
    ]
  },
  {
    id: 'cumin',
    name: 'Cumin (Jeera)',
    hindiName: 'जीरा',
    sanskritName: 'Jiraka (जीरक — derived from "Jeerna", meaning to digest)',
    botanicalName: 'Cuminum cyminum',
    family: 'Apiaceae',
    category: 'spice',
    shortSummary: 'Everyday digestive seed that enhances gastric acid secretion and bile acid flow, rich in non-heme iron and cuminaldehyde.',
    culinaryUses: [
      'Whole seed tempering (Tadka) in hot ghee or mustard oil',
      'Roasted and freshly ground cumin powder (Bhuna Jeera) sprinkled over dahi, chaat, and raita',
      'Jeera water (seeds boiled in water) consumed warm after heavy meals'
    ],
    activePhytochemicals: [
      'Cuminaldehyde and Cymene (signature volatile oils)',
      'Flavonoids (Apigenin, Luteolin)',
      'Non-heme Iron (~66 mg per 100g dry seeds, significant even in teaspoon servings)'
    ],
    ayurvedicEnergetics: {
      rasa: ['Pungent (Katu)', 'Bitter (Tikta)'],
      virya: 'Heating (Ushna)',
      vipaka: 'Pungent (Katu)',
      doshaEffect: 'Balances Vata and Kapha; stimulates Agni (digestive fire) without severely aggravating Pitta when cooked in moderate amounts'
    },
    modernResearchSummary:
      'Biochemical investigations demonstrate that cumin active fractions stimulate pancreatic lipase, amylase, and proteases, accelerating gastrointestinal transit and mitigating intestinal gas formation.',
    evidenceLimitations:
      'Weight-management claims associated with high-dose cumin extract pills are based on limited small-scale trials and must be paired with lifestyle factors.',
    contraindicationsAndWarnings: [
      'Safe at regular culinary levels. Very high supplemental doses may cause hypoglycemia in insulin-dependent patients.',
      'Rare seed allergies in individuals sensitive to the Apiaceae family (celery, carrot).'
    ],
    safeCulinaryContext:
      '1 to 2 teaspoons of whole or ground seeds daily in food is completely safe and delivers substantial dietary iron and digestive enzymes.',
    references: [
      { title: 'Indian Food Composition Tables', source: 'ICMR-NIN', year: '2017' },
      { title: 'Digestive stimulant action of spices: a review', source: 'Indian Journal of Medical Research', year: '2004' }
    ]
  },
  {
    id: 'fennel',
    name: 'Fennel Seeds (Saunf)',
    hindiName: 'सौंफ',
    sanskritName: 'Mishreya / Shatapushpa (शतपुष्पा)',
    botanicalName: 'Foeniculum vulgare',
    family: 'Apiaceae',
    category: 'spice',
    shortSummary: 'Sweet, cooling digestive seed traditionally consumed as Mukhwas (post-meal digestive) to freshen breath and soothe smooth muscle spasms.',
    culinaryUses: [
      'Chewed raw with rock sugar (Mishri) immediately following meals',
      'Brewed into soothing herbal tea for abdominal bloating or menstrual cramps',
      'Key component of Bengali Panch Phoron spice blend and Kashmiri Rogan Josh gravies'
    ],
    activePhytochemicals: [
      'trans-Anethole (imparts sweet, liquorice aroma)',
      'Fenchone (bitter camphoraceous terpene)',
      'Estragole and Limonene',
      'Rosmarinic acid and Chlorogenic acid'
    ],
    ayurvedicEnergetics: {
      rasa: ['Sweet (Madhura)', 'Pungent (Katu)', 'Bitter (Tikta)'],
      virya: 'Cooling (Sheeta)',
      vipaka: 'Sweet (Madhura)',
      doshaEffect: 'Balances all three Doshas (Tridoshic); exceptionally soothing for Pitta and useful for gas caused by Vata'
    },
    modernResearchSummary:
      'Anethole exhibits carminative and antispasmodic effects on intestinal smooth muscle by modulating calcium influx, clinically easing infantile colic and adult functional dyspepsia.',
    evidenceLimitations:
      'High-concentration isolated fennel essential oils contain estragole and are not recommended for infants or pregnant individuals without medical supervision.',
    contraindicationsAndWarnings: [
      'Whole seeds are completely safe for food use. Concentrated essential oil extracts should be avoided in pregnancy due to mild uterine stimulation risks.',
      'Potential mild cross-reactivity in patients with birch-pollen or mugwort allergies.'
    ],
    safeCulinaryContext:
      '1 to 2 teaspoons of whole seeds daily after meals or brewed in warm water is safe, refreshing, and gentle on the gut.',
    references: [
      { title: 'Foeniculum vulgare Mill: A review of its botany, phytochemistry, and pharmacology', source: 'Biomed Research International', year: '2014' },
      { title: 'Bhavaprakasha Nighantu', source: 'Classical Dravyaguna Reference', year: '16th Century' }
    ]
  },
  {
    id: 'coriander',
    name: 'Coriander (Dhaniya)',
    hindiName: 'धनिया (बीज और पत्ते)',
    sanskritName: 'Dhanyaka (धान्यक)',
    botanicalName: 'Coriandrum sativum',
    family: 'Apiaceae',
    category: 'herb',
    shortSummary: 'Refreshing culinary herb and seed that cools internal heat, supports kidney filtration, and balances gut digestion.',
    culinaryUses: [
      'Fresh green leaves (Kothmir) garnished on warm dishes just before serving',
      'Ground coriander powder (Dhaniya powder) added as a thickener and aromatic base in curries',
      'Dhaniya seeds soaked overnight in water and strained in the morning (Dhanyaka Hima)'
    ],
    activePhytochemicals: [
      'Linalool (primary volatile constituent, 60–70% of seed oil)',
      'Geranyl acetate and Pinene',
      'Quercetin and Beta-carotene (concentrated in fresh green leaves)'
    ],
    ayurvedicEnergetics: {
      rasa: ['Astringent (Kashaya)', 'Bitter (Tikta)', 'Sweet (Madhura)'],
      virya: 'Cooling (Sheeta)',
      vipaka: 'Sweet (Madhura)',
      doshaEffect: 'Balances all three Doshas, especially potent in calming aggravated Pitta and urinary burning sensations'
    },
    modernResearchSummary:
      'Coriander seed extracts possess mild diuretic, antioxidant, and lipid-modulating actions. Linalool promotes gut relaxant activity that reduces intestinal cramping.',
    evidenceLimitations:
      'Most pharmacological studies on blood pressure and lipid modulation have been conducted in animal models; human clinical data is limited but supportive of traditional safety.',
    contraindicationsAndWarnings: [
      'Very rare contact dermatitis or seed allergy.',
      'Safe at regular dietary levels.'
    ],
    safeCulinaryContext:
      'Generous use of fresh leaves and 1–2 teaspoons of ground seed powder in daily home cooking is universally safe.',
    references: [
      { title: 'Coriander (Coriandrum sativum): A promising functional food', source: 'Food Chemistry', year: '2015' }
    ]
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha (Indian Ginseng)',
    hindiName: 'अश्वगंधा',
    sanskritName: 'Ashvagandha (अश्वगन्धा — "smell of a horse", symbolizing equine vitality)',
    botanicalName: 'Withania somnifera',
    family: 'Solanaceae',
    category: 'root',
    shortSummary: 'Prominent Ayurvedic adaptogen that modulates hypothalamic-pituitary-adrenal (HPA) axis cortisol secretion and supports sleep quality.',
    culinaryUses: [
      'Traditionally taken as fine root powder (Churna) stirred into warm milk with a pinch of nutmeg and ghee before bedtime',
      'Infused in decoctions or standardized herbal supplements'
    ],
    activePhytochemicals: [
      'Withanolides (steroidal lactones: Withaferin A, Withanolide A and D)',
      'Sitoindosides VII–X',
      'Alkaloids (Withanine, Somniferine)'
    ],
    ayurvedicEnergetics: {
      rasa: ['Bitter (Tikta)', 'Astringent (Kashaya)', 'Sweet (Madhura)'],
      virya: 'Heating (Ushna)',
      vipaka: 'Sweet (Madhura)',
      doshaEffect: 'Subdues Vata and Kapha; in high amounts can elevate Pitta'
    },
    modernResearchSummary:
      'Randomized, double-blind, placebo-controlled human trials demonstrate statistically significant reductions in serum cortisol levels, perceived stress scores, and improvements in non-restorative sleep parameters following 6–8 weeks of standardized root extract.',
    evidenceLimitations:
      'Long-term continuous safety beyond 3 to 6 months has not been established in large clinical cohorts. Not indicated as a monotherapy for clinical depression or generalized anxiety disorder.',
    contraindicationsAndWarnings: [
      'Contraindicated during pregnancy (potential abortifacient risk in high concentrations).',
      'May stimulate thyroid hormone synthesis: use with caution in hyperthyroidism.',
      'Caution with auto-immune disorders (rheumatoid arthritis, lupus) due to immunostimulant properties.',
      'Rare cases of reversible drug-induced liver injury have been reported with unverified adulterated supplement brands.'
    ],
    safeCulinaryContext:
      'Traditional culinary use is 1/2 teaspoon (approx 1.5–2g) of authentic organic root powder in warm milk. Concentrated commercial extracts (300–600mg) should be consumed with medical oversight.',
    references: [
      { title: 'A prospective, randomized double-blind, placebo-controlled study of safety and efficacy of a high-concentration full-spectrum extract of Ashwagandha root in reducing stress and anxiety in adults', source: 'Indian Journal of Psychological Medicine', year: '2012' },
      { title: 'WHO Monographs on Selected Medicinal Plants', source: 'WHO', year: '2007' }
    ]
  },
  {
    id: 'fenugreek',
    name: 'Fenugreek (Methi)',
    hindiName: 'मेथी (दाने और पत्ते)',
    sanskritName: 'Methika (मेथिका)',
    botanicalName: 'Trigonella foenum-graecum',
    family: 'Fabaceae',
    category: 'spice',
    shortSummary: 'Fiber-dense bitter seed rich in 4-hydroxyisoleucine and galactomannans, extensively studied for glycemic regulation and digestive delay.',
    culinaryUses: [
      'Fresh green leaves (Methi saag) cooked in aloo methi, methi thepla, or dals',
      'Whole seeds sprouted for crisp bitter salads with lemon and rock salt',
      'Seeds soaked overnight in water and consumed with the water in the morning'
    ],
    activePhytochemicals: [
      '4-Hydroxyisoleucine (unique amino acid that stimulates glucose-dependent insulin secretion)',
      'Galactomannan soluble fiber (~45–50% of seed mass)',
      'Trigonelline (alkaloid)',
      'Steroidal saponins (Diosgenin)'
    ],
    ayurvedicEnergetics: {
      rasa: ['Bitter (Tikta)', 'Astringent (Kashaya)'],
      virya: 'Heating (Ushna)',
      vipaka: 'Pungent (Katu)',
      doshaEffect: 'Pacifies Vata and Kapha; increases Pitta if taken in excessive amounts'
    },
    modernResearchSummary:
      'Meta-analyses confirm that dietary fenugreek seeds significantly reduce fasting blood glucose, postprandial glucose peaks, and HbA1c in individuals with prediabetes and type-2 diabetes by slowing carbohydrate gastric absorption.',
    evidenceLimitations:
      'High volumes of seed consumption (over 10–15g) are required to see the strongest glycemic impact, which may cause mild transient flatulence or bloating.',
    contraindicationsAndWarnings: [
      'Potential additive effect with oral antidiabetic drugs and insulin: monitor blood sugar to avoid hypoglycemia.',
      'High doses may stimulate uterine contractions; avoid therapeutic concentrated doses during pregnancy.',
      'Can impart a harmless maple-syrup odor to urine and perspiration.'
    ],
    safeCulinaryContext:
      '1/2 to 1 teaspoon of whole seeds in cooking or 1 teaspoon of soaked seeds in the morning is safe, nutritious, and supportive of metabolic balance.',
    references: [
      { title: 'Effect of fenugreek on glycemic control and lipid profile in diabetes: A systematic review', source: 'Nutrition Journal', year: '2014' }
    ]
  },
  {
    id: 'black-pepper',
    name: 'Black Pepper (Kali Mirch)',
    hindiName: 'काली मिर्च',
    sanskritName: 'Maricha (मरीच — "cleansing and stimulating")',
    botanicalName: 'Piper nigrum',
    family: 'Piperaceae',
    category: 'spice',
    shortSummary: 'The "King of Spices", a potent bio-enhancer (Yogavahi) containing piperine that enhances nutrient and phytonutrient absorption across the intestinal brush border.',
    culinaryUses: [
      'Freshly crushed atop salads, warm soups, and vegetable preparations',
      'Essential in Rasam, Khichdi, and south Indian Pongal',
      'Paired with turmeric in golden milk and chai'
    ],
    activePhytochemicals: [
      'Piperine (alkaloid responsible for pungency: 4% to 9% by dry weight)',
      'Chavicine and Piperidine',
      'Monoterpenes (Beta-caryophyllene, Pinene, Limonene)'
    ],
    ayurvedicEnergetics: {
      rasa: ['Pungent (Katu)'],
      virya: 'Heating (Ushna)',
      vipaka: 'Pungent (Katu)',
      doshaEffect: 'Strongly decreases Kapha and Vata; elevates Pitta'
    },
    modernResearchSummary:
      'Piperine increases the bioavailability of diverse nutrients—including curcumin, beta-carotene, and selenium—by inhibiting hepatic and intestinal glucuronidation and stimulating intestinal amino acid transporters.',
    evidenceLimitations:
      'Because piperine modifies cytochrome P450 and P-glycoprotein drug metabolism, high-dose piperine supplements may alter blood concentrations of prescription pharmaceutical drugs.',
    contraindicationsAndWarnings: [
      'Contraindicated in therapeutic amounts during active acid-peptic disease, gastritis, or bleeding hemorrhoids.',
      'Avoid high-dose piperine supplement pills if taking prescription medications with narrow therapeutic windows without pharmacist advice.'
    ],
    safeCulinaryContext:
      'A fresh pinch to 1/4 teaspoon (0.5–1g) in cooked dishes is safe, flavorful, and optimizes nutrient absorption.',
    references: [
      { title: 'Bioavailability Enhancers of Herbal Origin: An Overview', source: 'Asian Pacific Journal of Tropical Biomedicine', year: '2013' }
    ]
  },
  {
    id: 'cinnamon',
    name: 'True Ceylon Cinnamon (Dalchini)',
    hindiName: 'दालचीनी',
    sanskritName: 'Tvak (त्वक्)',
    botanicalName: 'Cinnamomum verum (Ceylon) vs Cinnamomum cassia',
    family: 'Lauraceae',
    category: 'spice',
    shortSummary: 'Aromatic inner bark containing cinnamaldehyde, known for enhancing insulin receptor sensitivity. It is vital to distinguish low-coumarin Ceylon from Cassia.',
    culinaryUses: [
      'Whole bark stick simmered in biryani, pulao, and slow-cooked dals',
      'Ground cinnamon dusted on oatmeal, fruit bowls, or spiced herbal teas'
    ],
    activePhytochemicals: [
      'Cinnamaldehyde (65–80% of bark essential oil)',
      'Eugenol and Trans-cinnamic acid',
      'Proanthocyanidin oligomers'
    ],
    ayurvedicEnergetics: {
      rasa: ['Pungent (Katu)', 'Sweet (Madhura)', 'Bitter (Tikta)'],
      virya: 'Heating (Ushna)',
      vipaka: 'Sweet (Madhura)',
      doshaEffect: 'Balances Vata and Kapha; increases Pitta in large quantities'
    },
    modernResearchSummary:
      'Cinnamon polyphenols mimic insulin action, activate insulin receptor kinase, and enhance glucose uptake in skeletal muscle cells, contributing to improved post-meal insulin sensitivity in randomized trials.',
    evidenceLimitations:
      'High variability across studies due to differences between Ceylon cinnamon and cheap Cassia bark. Cassia contains significant amounts of coumarin, which is hepatotoxic in cumulative high doses.',
    contraindicationsAndWarnings: [
      'CRITICAL: Commercial grocery store cinnamon is often Cassia, which contains up to 1% coumarin. Seek authentic Ceylon cinnamon (Cinnamomum verum) for daily consumption to protect liver health.',
      'Potential interaction with prescription antidiabetic drugs.'
    ],
    safeCulinaryContext:
      '1/4 to 1/2 teaspoon of true Ceylon cinnamon powder daily in tea or porridge is safe and aromatic.',
    references: [
      { title: 'Cinnamon Use in Type 2 Diabetes: An Updated Systematic Review and Meta-Analysis', source: 'Annals of Family Medicine', year: '2013' }
    ]
  },
  {
    id: 'cardamom',
    name: 'Green Cardamom (Elaichi)',
    hindiName: 'हरी इलायची',
    sanskritName: 'Ela (एला)',
    botanicalName: 'Elettaria cardamomum',
    family: 'Zingiberaceae',
    category: 'spice',
    shortSummary: 'Fragrant "Queen of Spices" that sweetens the breath, reduces mucosal congestion, and relaxes gastrointestinal smooth muscle.',
    culinaryUses: [
      'Crushed pods brewed in morning Masala Chai',
      'Pounded seeds added to kheer, halwa, and traditional Indian desserts to counteract heaviness',
      'Chewed whole after meals for oral freshness'
    ],
    activePhytochemicals: [
      '1,8-Cineole (Eucalyptol: 20–40%)',
      'alpha-Terpinyl acetate (30–50%)',
      'Limonene and Linalool'
    ],
    ayurvedicEnergetics: {
      rasa: ['Pungent (Katu)', 'Sweet (Madhura)'],
      virya: 'Cooling (Sheeta)',
      vipaka: 'Sweet (Madhura)',
      doshaEffect: 'Tridoshic (Balances Vata, Pitta, and Kapha; exceptional for soothing acidic stomach discomfort)'
    },
    modernResearchSummary:
      'Cardamom volatile oils exhibit gastroprotective effects, reducing ethanol-induced gastric ulceration in experimental models, and demonstrate mild blood-pressure-modulating effects via calcium channel blockade.',
    evidenceLimitations:
      'Human trials for cardiovascular outcomes are small-cohort pilot evaluations. General gastroprotective data is well-established through culinary history and pharmacological assays.',
    contraindicationsAndWarnings: [
      'Extremely safe at regular dietary intakes.',
      'Patients with symptomatic gallstones should avoid therapeutic concentrated seed oil supplements.'
    ],
    safeCulinaryContext:
      '1 to 3 crushed green pods daily in tea or culinary dishes is completely safe, soothing, and delightfully aromatic.',
    references: [
      { title: 'Blood pressure lowering, fibrinolysis enhancing and antioxidant activities of cardamom', source: 'Indian Journal of Biochemistry & Biophysics', year: '2009' }
    ]
  }
];

export const AYURVEDA_SCIENCE_ARTICLES: AyurvedaScienceArticle[] = [
  {
    id: 'ahara-vidhi-mindful-eating',
    slug: 'ahara-vidhi-mindful-eating',
    title: 'Ahara Vidhi: The 8 Ancient Rules of Mindful Eating Grounded in Modern Digestion',
    subtitle: 'How classical Ayurvedic meal rules parallel modern cephalic phase digestion, gastric enzyme secretion, and parasympathetic activation.',
    readTime: '6 min read',
    category: 'Ahara (Dietetics)',
    publishedDate: 'October 2026',
    reviewedBy: 'NAVIKO Nutrition & Ayurveda Editorial Desk',
    summary:
      'Charaka Samhita documents the "Ashta Ahara Vidhi Visheshayatana" (8 qualitative factors of food intake). Modern gastroenterology reveals that these rules optimize autonomic nervous system tone, cephalic gastric acid release, and glycemic control.',
    sections: [
      {
        heading: '1. Eating Fresh, Warm Food (Ushnam Ashneeyat)',
        modernScience:
          'Warm food (between 37°C and 45°C) promotes digestive enzyme efficiency (pancreatic lipase and pepsin work optimally at body core temperature) and improves oral palatability without requiring excessive added salt or refined fat.',
        ayurvedicTradition:
          'Warm food kindles Jatharagni (the central digestive fire), digests quickly, promotes downward movement of Vata (Apana Vata), and reduces excess Kapha mucus accumulation in the stomach.',
        evidenceEvaluation:
          'Evidence: Strong. Gastric thermoreceptors and motility studies show that cold meals delay gastric emptying and can trigger abdominal cramping in sensitive individuals.',
        keyTakeaway: 'Prioritize freshly prepared warm meals over refrigerated leftovers or cold packaged meals.'
      },
      {
        heading: '2. Mindful Atmosphere Without Multitasking (Tanmana Bhunjeeta)',
        modernScience:
          'Eating while staring at phone screens or television causes "distracted eating", blunting leptin satiety signaling and suppressing the parasympathetic "rest and digest" vagal stimulation needed for hydrochloric acid secretion.',
        ayurvedicTradition:
          'One should eat with complete presence, not laughing, speaking excessively, or letting the mind wander, to ensure proper assimilation of subtle food essences (Prana and Rasa).',
        evidenceEvaluation:
          'Evidence: High. Controlled trials demonstrate that individuals eating while distracted consume 15–25% more calories and experience more post-meal bloating.',
        keyTakeaway: 'Dedicate 15 undisturbed minutes to your plate without screen distractions.'
      },
      {
        heading: '3. Honoring Quantity & Digestive Capacity (Matravat Ashneeyat)',
        modernScience:
          'Gastric stretch receptors (vagal afferents) signal fullness to the hypothalamus with an approximate 15–20 minute delay. Overfilling the stomach impairs antral grinding and leads to gastroesophageal acid reflux.',
        ayurvedicTradition:
          'Divide the stomach capacity into three thirds: one third for solid food, one third for liquids (soups, buttermilk), and one third left empty for the movement of Doshas (air and digestive gases).',
        evidenceEvaluation:
          'Evidence: Strong. Modern volumetric satiety research mirrors this classical guideline to prevent excessive intragastric pressure.',
        keyTakeaway: 'Stop eating when you feel 75% full, leaving room for comfortable digestion.'
      }
    ],
    practicalTips: [
      'Sit comfortably in an upright posture with your feet planted or cross-legged.',
      'Sip small amounts of warm water or ginger infusion during a meal; avoid iced drinks.',
      'Allow at least 4 to 5 hours between primary meals for previous food to fully clear the small intestine.'
    ],
    references: [
      { citation: 'Charaka Samhita, Vimana Sthana, Chapter 1, Verses 24–25', organization: 'Classical Ayurvedic Compendium' },
      { citation: 'The Role of the Cephalic Phase Response in Human Nutrition', organization: 'Appetite Journal, 2018' },
      { citation: 'Dietary Guidelines for Indians', organization: 'ICMR–National Institute of Nutrition (NIN), 2024' }
    ]
  },
  {
    id: 'shad-rasa-six-tastes',
    slug: 'shad-rasa-six-tastes',
    title: 'Shad Rasa (The 6 Tastes): How Traditional Taste Combinations Regulate Satiety',
    subtitle: 'Moving beyond Western sweet/salty cravings: why incorporating all six tastes in a meal prevents overeating and supports nutrient density.',
    readTime: '7 min read',
    category: 'Ahara (Dietetics)',
    publishedDate: 'October 2026',
    reviewedBy: 'NAVIKO Nutrition & Ayurveda Editorial Desk',
    summary:
      'Ayurveda identifies six distinct tastes (Rasas): Sweet, Sour, Salty, Pungent, Bitter, and Astringent. When all six are present in a main meal, appetite centers experience complete sensory satisfaction, curbing post-meal cravings.',
    sections: [
      {
        heading: 'Understanding the Six Rasas',
        modernScience:
          'Taste buds feature specialized G-protein coupled receptors (GPCRs) for sweet (T1R2/T1R3), bitter (T2R), sour (ion channels), and umami. A diet skewed only toward ultra-palatable sweet and salty flavors triggers sensory-specific cravings and overconsumption.',
        ayurvedicTradition:
          '1. Madhura (Sweet: grains, dairy, fruit)\n2. Amla (Sour: lemon, curd, amla)\n3. Lavana (Salty: rock salt, sea salt)\n4. Katu (Pungent: ginger, pepper, mustard)\n5. Tikta (Bitter: methi, turmeric, karela)\n6. Kashaya (Astringent: lentils, pomegranate, raw banana).',
        evidenceEvaluation:
          'Evidence: Moderate to High. Modern research into sensory-specific satiety demonstrates that sensory variety across bitter and astringent tastes reduces compulsive grazing on refined carbohydrates.',
        keyTakeaway: 'The traditional Indian thali was engineered to balance all six tastes on a single plate.'
      },
      {
        heading: 'The Neglected Tastes: Bitter & Astringent',
        modernScience:
          'Bitter compounds (polyphenols, glucosinolates) and astringent tannins stimulate peptide YY (PYY) and GLP-1 release in the enteroendocrine cells of the gut, naturally supporting healthy blood sugar management.',
        ayurvedicTradition:
          'Bitter (Tikta) and Astringent (Kashaya) tastes dry out excess moisture, clear toxins (Ama), pacify inflammatory Pitta, and prevent metabolic sluggishness (Kapha).',
        evidenceEvaluation:
          'Evidence: Strong. Green leafy vegetables and spices rich in bitter principles correlate with enhanced metabolic health across epidemiological cohorts.',
        keyTakeaway: 'Add fresh coriander, a pinch of methi, or turmeric to balance sweet grains.'
      }
    ],
    practicalTips: [
      'Start your main meal with sweet/complex grain staples (Roti, Rice, Dal).',
      'Integrate pungent and sour notes in the middle (spiced sabzi, lemon squeeze).',
      'Conclude with astringent and cooling buttermilk (Chaas with roasted cumin) to cleanse the palate.'
    ],
    references: [
      { citation: 'Sensory-Specific Satiety and the Control of Food Intake', organization: 'Neuroscience & Biobehavioral Reviews, 2021' },
      { citation: 'Ashtanga Hridaya, Sutra Sthana, Chapter 10', organization: 'Classical Ayurvedic Reference' }
    ]
  },
  {
    id: 'bioavailability-indian-cooking',
    slug: 'bioavailability-indian-cooking',
    title: 'Bioavailability in Indian Cooking: Why Ghee, Turmeric & Black Pepper Work Together',
    subtitle: 'The biochemical rationale behind traditional culinary combinations: lipid carriers, thermal activation, and enzymatic synergy.',
    readTime: '6 min read',
    category: 'Bioavailability',
    publishedDate: 'October 2026',
    reviewedBy: 'NAVIKO Nutrition & Ayurveda Editorial Desk',
    summary:
      'Traditional Indian recipes rarely consume spices in isolation. Exploring how Desi Ghee serves as a lipophilic transporter, black pepper inhibits glucuronidation, and light roasting unlocks fat-soluble phytonutrients.',
    sections: [
      {
        heading: '1. Desi Ghee as a Lipophilic Carrier (Yogavahi)',
        modernScience:
          'Many of the most potent phytonutrients—including curcumin in turmeric, lycopene in cooked tomatoes, and beta-carotene in carrots—are fat-soluble. Consuming them with healthy culinary fats (like Desi Ghee containing short- and medium-chain triglycerides) increases micelle formation and intestinal lymphatic absorption.',
        ayurvedicTradition:
          'Ghee is celebrated as Yogavahi—a substance that carries the medicinal properties of herbs deep into bodily tissues (Dhatus) without losing its own innate cooling and nourishing qualities.',
        evidenceEvaluation:
          'Evidence: Very Strong. Fat co-ingestion increases carotenoid and polyphenol bioavailability by 3- to 10-fold compared to water-based consumption.',
        keyTakeaway: 'Always cook spices in a small amount of healthy fat (ghee, mustard oil, or sesame oil).'
      },
      {
        heading: '2. The Turmeric + Black Pepper Mechanism',
        modernScience:
          'Curcumin is rapidly metabolized by the liver enzyme UDP-glucuronosyltransferase. Piperine from freshly ground black pepper selectively inhibits this enzyme, allowing free curcumin to circulate in the bloodstream for significantly longer durations.',
        ayurvedicTradition:
          'Classical formulas frequently blend Haridra (Turmeric) with Trikatu (Black pepper, long pepper, and dry ginger) to awaken biological assimilation.',
        evidenceEvaluation:
          'Evidence: Confirmed. Pharmacokinetic trials verify up to 20x bioavailability enhancements in human subjects.',
        keyTakeaway: 'Whenever adding turmeric to soups, dals, or warm milk, always add a fresh crack of black pepper.'
      }
    ],
    practicalTips: [
      'Gently heat whole spices in oil or ghee for 30 seconds (Tadka) to release lipophilic volatiles into the fat phase.',
      'Squeeze fresh lemon juice over iron-rich greens (spinach, methi, chana) after cooking to leverage Vitamin C for 3x higher non-heme iron absorption.'
    ],
    references: [
      { citation: 'Curcumin: A Review of Its Effects on Human Health', organization: 'Foods (MDPI), 2017' },
      { citation: 'Dietary Lipids and the Absorption of Fat-Soluble Vitamins', organization: 'Nutrients, 2021' }
    ]
  },
  {
    id: 'fermented-foods-microbiome',
    slug: 'fermented-foods-microbiome',
    title: 'The Fermented Foods of India: Idli, Dahi & Kanji Through Modern Microbiome Science',
    subtitle: 'From natural lactic acid bacteria to resistant starch: how centuries-old fermentation methods enhance digestibility and eliminate antinutrients.',
    readTime: '6 min read',
    category: 'Microbiome & Fermentation',
    publishedDate: 'October 2026',
    reviewedBy: 'NAVIKO Nutrition & Ayurveda Editorial Desk',
    summary:
      'Traditional Indian spontaneous fermentation (in idli batter, spiced buttermilk, and black carrot kanji) breaks down phytic acid, increases free B-vitamins, and provides diverse probiotic species adapted to human gut ecology.',
    sections: [
      {
        heading: 'Idli & Dosa Batter: Natural Symbiotic Fermentation',
        modernScience:
          'Soaking and grinding rice and black gram (urad dal) allows wild Leuconostoc mesenteroides and Lactobacillus species to ferment the batter overnight. This drops pH, deactivates phytates (which bind iron and zinc), and increases available riboflavin and thiamine.',
        ayurvedicTradition:
          'Properly fermented and freshly steamed foods like Idli are praised as Laghu (light to digest), whereas heavy, stale, or yeast-overleavened breads can aggravate Pitta and create acidity.',
        evidenceEvaluation:
          'Evidence: High. Laboratory analyses confirm up to 60% reduction in antinutritional factors during traditional 12-hour batter fermentation.',
        keyTakeaway: 'Traditional fermented staples naturally pre-digest complex starches and proteins for the gut.'
      },
      {
        heading: 'Chaas (Takra) vs Heavy Curd: The Digestion Difference',
        modernScience:
          'Diluting plain yogurt with water and churning it separates excess butterfat while preserving beneficial lactic acid cultures. The resulting beverage is low in osmolarity and gentle on stomach emptying.',
        ayurvedicTradition:
          'Classical texts strictly warn against consuming heavy, thick, unchurned curd at night. Instead, they recommend Takra (buttermilk churned with water, roasted cumin, and rock salt) as a premier digestive nectar.',
        evidenceEvaluation:
          'Evidence: High. Churned buttermilk provides probiotic support without the mucus-promoting heaviness of high-fat sour curd before sleep.',
        keyTakeaway: 'Enjoy light, spiced buttermilk with lunch rather than dense sweet curd at bedtime.'
      }
    ],
    practicalTips: [
      'Prepare traditional Chaas by blending 1/3 cup curd with 2/3 cup water, a pinch of roasted cumin, fresh ginger, and mint.',
      'Allow homemade idli batter to ferment naturally at warm room temperature without commercial baking soda.'
    ],
    references: [
      { citation: 'Indian Traditional Fermented Foods: A Review of Nutritional and Therapeutic Aspects', organization: 'Journal of Ethnic Foods, 2018' },
      { citation: 'Charaka Samhita, Sutra Sthana, Chapter 27 (Takra Varga)', organization: 'Classical Ayurvedic Reference' }
    ]
  },
  {
    id: 'herb-drug-interactions-safety',
    slug: 'herb-drug-interactions-safety',
    title: 'Herb-Drug Interactions & Supplement Safety: What Science Tells Us',
    subtitle: 'Why "natural" does not mean consequence-free: understanding Cytochrome P450 enzymes, heavy-metal safety, and prescription drug interactions.',
    readTime: '8 min read',
    category: 'Safety & Evidence',
    publishedDate: 'October 2026',
    reviewedBy: 'NAVIKO Clinical Pharmacology & Safety Desk',
    summary:
      'Botanicals contain active chemical compounds that can potentiate, inhibit, or alter the breakdown of prescription medications. A clear, responsible guide on avoiding dangerous interactions and verifying supplement purity.',
    sections: [
      {
        heading: '1. Culinary Use vs High-Dose Concentrated Extracts',
        modernScience:
          'Spices used in everyday cooking (a pinch of turmeric, cumin, or grated ginger in dal) have an exemplary safety profile across centuries. In contrast, concentrated 95% standardized extract pills deliver 50 to 100 times the dose of active molecules, entering clinical pharmacological territory.',
        ayurvedicTradition:
          'Classical Ayurveda carefully distinguishes between Ahara (everyday food to nourish), Aushadha (potent therapeutic medicine prescribed by an experienced Vaidya for specific illnesses), and Shodhana (clinical detoxification under strict guidance).',
        evidenceEvaluation:
          'Evidence: Critical. Consumers often mistakenly assume that if a pinch of a herb in food is healthy, a high-dose pill must be even better.',
        keyTakeaway: 'Enjoy culinary spices freely; treat concentrated herbal pills with the same respect as pharmaceutical drugs.'
      },
      {
        heading: '2. Major Known Herb-Drug Interactions',
        modernScience:
          '1. Blood Thinners (Warfarin, Clopidogrel): Concentrated high-dose ginger, turmeric, and ginkgo can increase bleeding risk.\n2. Diabetes Medications (Metformin, Glimepiride): Concentrated fenugreek and amla extracts may compound hypoglycemic drops.\n3. Thyroid Medications (Levothyroxine): Ashwagandha can stimulate endogenous thyroid hormones, requiring close TSH monitoring.',
        ayurvedicTradition:
          'Classical texts emphasize Pathya (compatible lifestyle and diet) and Apathya (contraindicated substances) for every individual constitution.',
        evidenceEvaluation:
          'Evidence: High. Always disclose all dietary supplements, Ayurvedic preparations, and herbs to your primary care physician.',
        keyTakeaway: 'Always inform your doctor about any supplements you are taking alongside prescription treatments.'
      },
      {
        heading: '3. Heavy-Metal Safety & Quality Standards',
        modernScience:
          'Some unverified or unlicensed herbal powders have been found contaminated with heavy metals (lead, mercury, arsenic) due to improper soil sourcing or adulteration. Modern consumers should look for FSSAI-licensed, GMP-certified, and third-party laboratory-tested products.',
        ayurvedicTradition:
          'Authentic classical Rasashastra involved complex, multi-stage purifications (Shodhana) that required master pharmacists; raw unregulated commercial powders pose severe health hazards.',
        evidenceEvaluation:
          'Evidence: Essential. Never purchase unbranded, uncertified Ayurvedic powders from dubious sources.',
        keyTakeaway: 'Buy only from reputable, certified brands with published batch certificates of analysis.'
      }
    ],
    practicalTips: [
      'Disclose all botanical supplements to your healthcare team before any surgery or starting new medications.',
      'Check product packaging for legitimate FSSAI certification and clear batch testing information.',
      'Never discontinue or substitute prescribed pharmaceutical drugs for heart disease, diabetes, or hypertension without your doctor.'
    ],
    references: [
      { citation: 'Herbal Medicine-Drug Interactions: A Systematic Review', organization: 'British Journal of Clinical Pharmacology, 2018' },
      { citation: 'Safety Guidelines for Ayurvedic Herbal Preparations', organization: 'Ministry of Ayush / FSSAI, 2022' },
      { citation: 'WHO Guidelines on Good Agricultural and Collection Practices (GACP) for Medicinal Plants', organization: 'WHO, 2003' }
    ]
  }
];


// ==========================================
// 3. AYURVEDA & NUTRITION MYTH VS EVIDENCE DATABASE
// ==========================================
export interface MythVsEvidenceEntry {
  id: string;
  claim: string;
  category: 'Fat Loss & Metabolism' | 'Herbal Medicine' | 'Food Combinations' | 'Digestion & Gut' | 'Sleep & Circadian';
  verdict: 'Evidence supports' | 'Early or limited evidence' | 'Evidence is mixed' | 'Not established';
  whatTraditionSays: string;
  whatModernEvidenceShows: string;
  nuanceAndLimitations: string;
  references: string[];
  lastReviewedDate: string;
}

export type MythVsEvidenceItem = MythVsEvidenceEntry;

export const MYTH_VS_EVIDENCE_DATABASE: MythVsEvidenceEntry[] = [
  {
    id: 'lemon-honey-water-fat-loss',
    claim: 'Drinking warm lemon water with honey in the morning directly "melts" belly fat.',
    category: 'Fat Loss & Metabolism',
    verdict: 'Not established',
    whatTraditionSays: 'Charaka Samhita praises Madhu (honey) as Lekhana (having scraping or reducing properties) when mixed with warm (not boiling) water to stimulate Agni and clear Kapha buildup.',
    whatModernEvidenceShows: 'No randomized human trial shows that lemon or honey chemically burns adipose tissue. Any modest weight loss observed in practice stems from replacing a 300-calorie sugary tea or coffee with a 40-calorie warm drink, plus the satiety benefits of morning hydration.',
    nuanceAndLimitations: 'Drinking warm water upon waking (Ushapan) is genuinely restorative for peristalsis and hydration. However, honey is still a source of free sugars (fructose & glucose) and should not be consumed in boiling water (which Ayurveda specifically warns against, calling heated honey Ama-forming).',
    references: [
      'American Journal of Clinical Nutrition: Water-induced thermogenesis and metabolic rate reviews',
      'Charaka Samhita, Sutra Sthana Chapter 27 (Madhu Varga)'
    ],
    lastReviewedDate: 'October 2026'
  },
  {
    id: 'turmeric-replaces-nsaids',
    claim: 'Turmeric/Curcumin is as powerful as prescription painkillers (like ibuprofen) and has zero side effects.',
    category: 'Herbal Medicine',
    verdict: 'Evidence is mixed',
    whatTraditionSays: 'Turmeric (Haridra) is an essential culinary spice with bitter-pungent tastes, warming Virya, and a classical reputation as a blood purifier and anti-inflammatory agent for wounds and joints.',
    whatModernEvidenceShows: 'Curcumin modulates inflammatory signaling cascades (NF-kB, COX-2, TNF-alpha). Multiple meta-analyses of standardized 1,000mg curcumin extracts show modest pain reduction in mild-to-moderate knee osteoarthritis comparable to low-dose ibuprofen over 8–12 weeks.',
    nuanceAndLimitations: 'Standard dietary turmeric contains only 2–5% curcumin by weight and has poor oral bioavailability without piperine (black pepper) or fats. High-dose extract supplements can cause gastrointestinal distress, gallbladder contractions, and may interact with prescription anticoagulant medications.',
    references: [
      'Journal of Medicinal Food: Meta-analysis of Curcumin Extracts for Osteoarthritis Symptoms, 2016',
      'World Journal of Gastrointestinal Pharmacology and Therapeutics: Curcumin bioavailability reviews, 2017'
    ],
    lastReviewedDate: 'October 2026'
  },
  {
    id: 'raw-foods-superior-to-cooked',
    claim: 'Raw uncooked vegetables and salads are always healthier and retain more "life energy" than cooked Indian sabzis.',
    category: 'Digestion & Gut',
    verdict: 'Not established',
    whatTraditionSays: 'Ayurveda strongly favors cooked, warm, gently spiced meals (Ahara). Raw foods are characterized as Sheetala (cold), Ruksha (dry), and Guru (heavy to digest), which can extinguish weak digestive Agni and produce gas and Vata aggravation.',
    whatModernEvidenceShows: 'While heat slightly degrades water-soluble vitamins (Vitamin C, B-complex), cooking breaks down tough plant cellulose walls, deactivates anti-nutrients (phytic acid, lectins), and substantially increases bioavailability of fat-soluble carotenoids (lycopene in cooked tomatoes, beta-carotene in carrots).',
    nuanceAndLimitations: 'A balanced diet includes modest fresh salads when digestive fire is strong (midday lunch), but people with IBS or sluggish digestion often experience severe bloating with large bowls of raw raw greens compared to gently steamed or sautéed sabzi.',
    references: [
      'International Journal of Food Sciences and Nutrition: Effects of Cooking on Phytochemical Bioavailability',
      'Charaka Samhita, Vimana Sthana Chapter 1 (Ahara Vidhi Visheshayatana)'
    ],
    lastReviewedDate: 'October 2026'
  },
  {
    id: 'milk-and-fish-incompatible',
    claim: 'Drinking milk after eating fish causes leucoderma (vitiligo / skin pigmentation loss).',
    category: 'Food Combinations',
    verdict: 'Not established',
    whatTraditionSays: 'Ayurveda categorizes Milk and Fish as Viruddha Ahara (incompatible food combinations) due to opposing Virya (milk is cooling/Sheeta; fish is heating/Ushna), which can burden Agni and create systemic Ama.',
    whatModernEvidenceShows: 'Dermatological and clinical science has completely disproven that fish and milk cause vitiligo. Vitiligo is an autoimmune condition where the body’s immune system attacks melanocytes (pigment-producing cells), often with genetic predisposition. There is zero biochemical mechanism linking milk and fish to vitiligo.',
    nuanceAndLimitations: 'Combining dense dairy proteins with heavy animal protein can present a digestive challenge for individuals with hypochlorhydria (low stomach acid), causing temporary dyspepsia or acid reflux, which explains the traditional culinary caution.',
    references: [
      'Indian Journal of Dermatology, Venereology and Leprology: Etiopathogenesis of Vitiligo and Dietary Myths',
      'British Journal of Dermatology: Autoimmune mechanisms in melanocyte destruction'
    ],
    lastReviewedDate: 'October 2026'
  },
  {
    id: 'ashwagandha-instant-anxiety-cure',
    claim: 'Ashwagandha works like an instant natural Xanax for severe anxiety and panic attacks.',
    category: 'Herbal Medicine',
    verdict: 'Early or limited evidence',
    whatTraditionSays: 'Ashwagandha (Withania somnifera) is classified as a Balya (strength-giver) and Medhya Rasayana (mind-nourishing tonic) taken over weeks to restore depleted Ojas from chronic physical and mental exhaustion.',
    whatModernEvidenceShows: 'Double-blind, placebo-controlled trials show that standardized root extracts (300–600mg daily of KSM-66 or Sensoril) over 6 to 8 weeks significantly reduce serum cortisol levels (by 20–30%) and improve perceived stress scores.',
    nuanceAndLimitations: 'Ashwagandha is an adaptogen that requires chronic daily administration over weeks, not an acute emergency rescue remedy. It should not replace psychiatric treatment for clinical panic disorders and is contraindicated during pregnancy or in unmonitored hyperthyroidism.',
    references: [
      'Indian Journal of Psychological Medicine: Prospective Randomized Double-Blind Study of Ashwagandha Root Extract, 2012',
      'Medicine (Baltimore): An investigation into the stress-relieving actions of an adaptogen, 2019'
    ],
    lastReviewedDate: 'October 2026'
  },
  {
    id: 'eating-late-causes-metabolic-slowdown',
    claim: 'Eating dinner after 8 PM causes food to turn directly into fat because metabolism shuts down.',
    category: 'Sleep & Circadian',
    verdict: 'Evidence supports',
    whatTraditionSays: 'Ayurveda’s Dinacharya principle states that Jatharagni (digestive fire) mirrors the sun: strongest at noon (Pitta time) and weakest after sunset (Kapha/Vata time), requiring an early, light dinner.',
    whatModernEvidenceShows: 'Chronobiology and circadian biology studies (such as research published in Cell Metabolism and Nature Communications) confirm that peripheral clocks in the liver and pancreas are calibrated by light and meal timing. Late-night heavy caloric intake causes higher postprandial glucose, reduced insulin sensitivity, and impairs nocturnal melatonin-growth hormone release.',
    nuanceAndLimitations: 'Weight gain still primarily depends on 24-hour total energy balance, but circadian timing shifts substrate utilization: late eaters burn less fat and experience poorer sleep quality and higher visceral fat accumulation over time.',
    references: [
      'Cell Metabolism: Late isocaloric eating increases hunger and decreases energy expenditure, 2022',
      'The Journal of Clinical Endocrinology & Metabolism: Circadian timing of food intake and metabolic health'
    ],
    lastReviewedDate: 'October 2026'
  }
];

// ==========================================
// 4. INTERACTIVE DINACHARYA ROUTINE BUILDER ITEMS
// ==========================================
export interface DinacharyaRoutineStep {
  id: string;
  name: string;
  sanskritName: string;
  phase: 'morning' | 'midday' | 'evening' | 'night';
  suggestedOffsetHoursFromWake: number; // e.g. 0 = wake, +0.5 = 30m after wake
  durationMins: number;
  description: string;
  benefits: string[];
  ayurvedicReference: string;
}

export const DINACHARYA_ROUTINE_STEPS: DinacharyaRoutineStep[] = [
  {
    id: 'brahma-muhurta',
    name: 'Waking During Brahma Muhurta',
    sanskritName: 'ब्राह्म मुहूर्त जागरण',
    phase: 'morning',
    suggestedOffsetHoursFromWake: 0,
    durationMins: 5,
    description: 'Awakening approximately 45–90 minutes before sunrise when the atmosphere is rich in nascent oxygen and Vata dosha dominates lightness and clarity.',
    benefits: ['Natural cortisol awakening response', 'Mental calmness before morning noise', 'Regular bowel elimination rhythm'],
    ayurvedicReference: 'Ashtanga Hridaya, Sutra Sthana 2.1: "Brahme muhurte uttisthet svastho rakshartham ayushah"'
  },
  {
    id: 'ushapan',
    name: 'Ushapan (Morning Warm Water)',
    sanskritName: 'उषःपान',
    phase: 'morning',
    suggestedOffsetHoursFromWake: 0.15,
    durationMins: 10,
    description: 'Drinking 1 to 2 glasses of lukewarm water on an empty stomach to rinse the upper digestive tract and trigger the gastrocolic reflex.',
    benefits: ['Hydrates cellular tissues after 7–8 hours sleep', 'Gently stimulates natural bowel movement', 'Awakens Agni without digestive burden'],
    ayurvedicReference: 'Yogaratnakara, Ushapana Vidhi: "Prahate vimala-varinam..."'
  },
  {
    id: 'jihwa-nirlekhana',
    name: 'Oral Hygiene & Tongue Scraping',
    sanskritName: 'जिह्वा निर्लेखन व दन्तधावन',
    phase: 'morning',
    suggestedOffsetHoursFromWake: 0.3,
    durationMins: 10,
    description: 'Cleaning teeth and using a copper or stainless steel scraper from the back of the tongue forward 7 to 10 times to remove overnight Ama (coating).',
    benefits: ['Removes oral biofilm and volatile sulfur compounds', 'Enhances taste bud sensitivity (Rasa perception)', 'Prevents halitosis and supports oral microbiome'],
    ayurvedicReference: 'Charaka Samhita, Sutra Sthana 5.73: Tongue scraper should not be sharp and removes heaviness, bad breath, and loss of taste.'
  },
  {
    id: 'vyayama-pranayama',
    name: 'Gentle Movement, Yoga & Breathwork',
    sanskritName: 'व्यायाम व प्राणायाम',
    phase: 'morning',
    suggestedOffsetHoursFromWake: 0.6,
    durationMins: 30,
    description: 'Exercising to half your capacity (Ardha Shakti) — brisk walking, Surya Namaskar, or gentle resistance, followed by Nadi Shodhana pranayama.',
    benefits: ['Boosts metabolic circulation and endorphins', 'Avoids excessive sympathetic stress fatigue', 'Balances autonomic nervous system through slow breathing'],
    ayurvedicReference: 'Sushruta Samhita, Chikitsa Sthana 24.38: Exercise gives lightness to body, ability to work, firmness, and stimulates digestive Agni.'
  },
  {
    id: 'snana',
    name: 'Refreshing Bath & Grooming',
    sanskritName: 'स्नान',
    phase: 'morning',
    suggestedOffsetHoursFromWake: 1.2,
    durationMins: 15,
    description: 'Bathing with warm water for the body and room-temperature water for the head, washing away morning lethargy.',
    benefits: ['Cleanses skin secretions and opens pores', 'Elevates mental alertness', 'Stimulates circulation and peripheral sensory receptors'],
    ayurvedicReference: 'Charaka Samhita, Sutra Sthana 5.94: Bath is purifying, enhances longevity, alleviates fatigue, and kindles digestive Agni.'
  },
  {
    id: 'pratarasha',
    name: 'Wholesome, Warm Breakfast',
    sanskritName: 'प्रातराश',
    phase: 'morning',
    suggestedOffsetHoursFromWake: 1.6,
    durationMins: 20,
    description: 'Eating a moderate, cooked, easily digestible breakfast (Moong chilla, ragi porridge, idlis, or warm oats) once hunger awakens.',
    benefits: ['Replenishes glycogen without insulin spikes', 'Sustains morning focus and physical stamina', 'Respects early Kapha digestive speed'],
    ayurvedicReference: 'Bhavaprakasha, Purva Khanda: Morning meals should be Laghu (light) and warm.'
  },
  {
    id: 'madhyahna-bhojana',
    name: 'Mindful Midday Lunch (Largest Meal)',
    sanskritName: 'मध्याह्न भोजन',
    phase: 'midday',
    suggestedOffsetHoursFromWake: 6.0,
    durationMins: 35,
    description: 'Consuming your primary, most substantial meal between 12:00 PM and 1:30 PM when the sun is at its zenith and digestive fire (Pitta Agni) is strongest.',
    benefits: ['Optimal enzymatic digestive efficiency', 'Better postprandial glucose clearance compared to night eating', 'Sustained afternoon cognitive stamina without crashing'],
    ayurvedicReference: 'Charaka Samhita: Midday corresponds to Pitta dominance, maximizing nutrient absorption and assimilation.'
  },
  {
    id: 'shatapadi',
    name: 'Post-Meal 100 Gentle Steps (Shatapadi)',
    sanskritName: 'शतपदी',
    phase: 'midday',
    suggestedOffsetHoursFromWake: 6.6,
    durationMins: 10,
    description: 'Taking a slow, relaxed stroll of 100 paces after lunch rather than immediately collapsing into a chair or lying down flat on a bed.',
    benefits: ['Blunts acute postprandial glucose spikes by 15–20%', 'Promotes downward gastric transit (Anulomana)', 'Prevents acid regurgitation and heaviness'],
    ayurvedicReference: 'Bhavaprakasha: "Bhuktvopavished yavat... Shatapadam gachhet" — After eating, rest momentarily, then take a hundred slow steps.'
  },
  {
    id: 'sayam-sandhya',
    name: 'Evening Wind-down & Digital Sunset',
    sanskritName: 'संध्याकाल व विश्राम',
    phase: 'evening',
    suggestedOffsetHoursFromWake: 13.0,
    durationMins: 30,
    description: 'Dimming blue lights, closing work laptop screens, and practicing 10 minutes of box breathing or calm reflective listening as twilight settles.',
    benefits: ['Allows natural melatonin synthesis in the pineal gland', 'Transitions nervous system from sympathetic to parasympathetic', 'Reduces cognitive rumination before bed'],
    ayurvedicReference: 'Ashtanga Hridaya: Sandhya (transition between day and night) should be observed with stillness and prayer or quiet meditation.'
  },
  {
    id: 'ratri-bhojana',
    name: 'Light, Early Dinner',
    sanskritName: 'रात्रि भोजन',
    phase: 'evening',
    suggestedOffsetHoursFromWake: 14.0,
    durationMins: 25,
    description: 'Consuming a light, easily digestible dinner (Moong khichdi, clear vegetable soup, or thin dal with 1-2 phulkas) at least 2.5–3 hours before bedtime.',
    benefits: ['Prevents midnight acid reflux', 'Allows liver and nocturnal cellular repair during deep sleep', 'Improves resting heart rate and sleep HRV'],
    ayurvedicReference: 'Charaka Samhita: Night food should be small in quantity and light in nature (Alpa and Laghu).'
  },
  {
    id: 'haldi-doodh-nidra',
    name: 'Golden Milk & Restorative Sleep (Nidra)',
    sanskritName: 'निद्रा व क्षीरपान',
    phase: 'night',
    suggestedOffsetHoursFromWake: 16.0,
    durationMins: 15,
    description: 'Sipping warm milk (or almond milk) with a pinch of turmeric, nutmeg, and black pepper, then sleeping before 10:30 PM (before the late Pitta surge).',
    benefits: ['Tryptophan and warm liquid promote GABA neurotransmission', 'Sleep before 11 PM aligns with liver glycogen regeneration', 'Deep slow-wave sleep restores cellular tissue (Ojas)'],
    ayurvedicReference: 'Charaka Samhita, Sutra Sthana 21.36: "Nidrayattam sukham dukham pushtih karshyam balaabalam" — Happiness, nourishment, strength, and vitality depend on proper sleep.'
  }
];
