/**
 * NAVIKO 3.0 — Numerology Engine
 * 
 * Implements:
 * - Life Path Number (Root summation of full birth date)
 * - Destiny / Expression Number (Full Name letter conversion, Pythagorean & Chaldean)
 * - Soul Urge / Heart's Desire Number (Vowels summation)
 * - Personality Number (Consonants summation)
 * - Birth / Psychic Number (Day of birth 1-31 reduced to 1-9)
 * - Personal Year Number (Birth month + Birth day + Current year)
 * - Compatibility matrix between Life Path numbers
 */

export interface NumerologyProfile {
  name: string;
  birthDate: {
    day: number;
    month: number;
    year: number;
  };
  lifePathNumber: number;
  birthDayNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  personalYearNumber: number;
  chaldeanNameNumber: number;
  rulingPlanet: string;
  luckyColors: string[];
  luckyDays: string[];
  luckyGems: string[];
  coreTraits: string[];
  strengths: string[];
  challenges: string[];
  careerSuggestions: string[];
  relationshipsInsight: string;
}

// Chaldean letter values (1 to 8, 9 is considered sacred and not assigned to individual letters)
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

// Pythagorean letter values (1 to 9)
const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

/**
 * Reduce a number to a single digit (1-9) or master numbers (11, 22, 33)
 */
export function reduceToSingleDigit(num: number, allowMaster: boolean = false): number {
  if (num <= 0) return 0;
  let current = num;
  while (current > 9) {
    if (allowMaster && (current === 11 || current === 22 || current === 33)) {
      return current;
    }
    current = String(current)
      .split('')
      .reduce((sum, char) => sum + parseInt(char, 10), 0);
  }
  return current;
}

export function calculateLifePath(day: number, month: number, year: number): number {
  const d = reduceToSingleDigit(day, true);
  const m = reduceToSingleDigit(month, true);
  const y = reduceToSingleDigit(year, true);
  return reduceToSingleDigit(d + m + y, true);
}

export function calculateBirthNumber(day: number): number {
  return reduceToSingleDigit(day, false);
}

export function calculateDestinyNumber(name: string): number {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
  const sum = clean.split('').reduce((acc, char) => acc + (PYTHAGOREAN_MAP[char] || 0), 0);
  return reduceToSingleDigit(sum, true);
}

export function calculateChaldeanNumber(name: string): number {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
  const sum = clean.split('').reduce((acc, char) => acc + (CHALDEAN_MAP[char] || 0), 0);
  return reduceToSingleDigit(sum, false);
}

export function calculateSoulUrge(name: string): number {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
  const vowelSum = clean.split('').filter((c) => VOWELS.has(c)).reduce((acc, char) => acc + (PYTHAGOREAN_MAP[char] || 0), 0);
  return reduceToSingleDigit(vowelSum, true);
}

export function calculatePersonalityNumber(name: string): number {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
  const consonantSum = clean.split('').filter((c) => !VOWELS.has(c)).reduce((acc, char) => acc + (PYTHAGOREAN_MAP[char] || 0), 0);
  return reduceToSingleDigit(consonantSum, true);
}

export function calculatePersonalYear(day: number, month: number, currentYear: number = new Date().getFullYear()): number {
  const d = reduceToSingleDigit(day);
  const m = reduceToSingleDigit(month);
  const y = reduceToSingleDigit(currentYear);
  return reduceToSingleDigit(d + m + y);
}

const NUMBER_PROFILES: Record<number, any> = {
  1: {
    rulingPlanet: 'Sun (Surya)',
    luckyColors: ['Gold', 'Yellow', 'Copper', 'Orange'],
    luckyDays: ['Sunday', 'Monday'],
    luckyGems: ['Ruby (Manikya)'],
    coreTraits: ['Leadership', 'Independence', 'Pioneering Spirit', 'Ambition', 'Self-Reliance'],
    strengths: ['Visionary drive', 'Decisiveness', 'Courage in pioneering new paths'],
    challenges: ['Authoritarian tendencies', 'Impatience', 'Over-competitiveness'],
    careerSuggestions: ['Founder / CEO', 'Administration', 'Civil Services', 'Military / Law Enforcement', 'Politics'],
    relationshipsInsight: 'Values respect and equality in partnerships; flourishes with partners who respect autonomy.'
  },
  2: {
    rulingPlanet: 'Moon (Chandra)',
    luckyColors: ['White', 'Cream', 'Silver', 'Light Green'],
    luckyDays: ['Monday', 'Friday'],
    luckyGems: ['Pearl (Moti)', 'Moonstone'],
    coreTraits: ['Harmony', 'Diplomacy', 'Intuition', 'Empathy', 'Collaboration'],
    strengths: ['Peacemaking', 'Emotional intelligence', 'Supportive partnership building'],
    challenges: ['Hypersensitivity', 'Indecision', 'Risk of emotional dependence'],
    careerSuggestions: ['Counseling & Psychology', 'Diplomacy', 'Creative Arts', 'Healthcare', 'Human Resources'],
    relationshipsInsight: 'Deeply devoted and nurturing; seeks soulful, emotionally safe connections with reciprocal care.'
  },
  3: {
    rulingPlanet: 'Jupiter (Brihaspati / Guru)',
    luckyColors: ['Yellow', 'Saffron', 'Amber', 'Gold'],
    luckyDays: ['Thursday', 'Tuesday'],
    luckyGems: ['Yellow Sapphire (Pukhraj)'],
    coreTraits: ['Creative Expression', 'Wisdom', 'Optimism', 'Communication', 'Generosity'],
    strengths: ['Inspirational oratory', 'Social magnetism', 'Expansive philosophical mind'],
    challenges: ['Scattered focus', 'Extravagance', 'Difficulty following rigid routines'],
    careerSuggestions: ['Education & Academia', 'Author & Journalism', 'Public Speaking', 'Marketing', 'Spiritual Guidance'],
    relationshipsInsight: 'Lively, joyful companion who brings lighthearted optimism and values intellectual banter.'
  },
  4: {
    rulingPlanet: 'Rahu (North Node)',
    luckyColors: ['Electric Blue', 'Grey', 'Indigo', 'Khaki'],
    luckyDays: ['Saturday', 'Sunday'],
    luckyGems: ['Hessonite Garnet (Gomed)'],
    coreTraits: ['Organization', 'Discipline', 'Practicality', 'Perseverance', 'Integrity'],
    strengths: ['Steadfast reliability', 'Systematic execution', 'Building unshakeable foundations'],
    challenges: ['Rigidity', 'Stubbornness', 'Excessive caution in taking leaps'],
    careerSuggestions: ['Architecture & Civil Engg', 'Finance & Accounting', 'Data Engineering', 'Law', 'Real Estate'],
    relationshipsInsight: 'Loyal and devoted anchor who shows love through practical service and unwavering fidelity.'
  },
  5: {
    rulingPlanet: 'Mercury (Budh)',
    luckyColors: ['Emerald Green', 'Turquoise', 'Light Blue'],
    luckyDays: ['Wednesday', 'Friday'],
    luckyGems: ['Emerald (Panna)'],
    coreTraits: ['Adaptability', 'Curiosity', 'Freedom', 'Commerce', 'Versatility'],
    strengths: ['Swift learning', 'Resourceful problem-solving', 'Charm and linguistic prowess'],
    challenges: ['Restlessness', 'Fickleness', 'Distaste for routine and confinement'],
    careerSuggestions: ['Trading & Stock Markets', 'Media & Broadcasting', 'Travel & Tourism', 'Tech Innovations', 'Sales'],
    relationshipsInsight: 'Needs intellectual stimulation and healthy personal space; thrives with adventurous companions.'
  },
  6: {
    rulingPlanet: 'Venus (Shukra)',
    luckyColors: ['Silvery White', 'Sky Blue', 'Pastel Pink'],
    luckyDays: ['Friday', 'Tuesday'],
    luckyGems: ['Diamond (Heera)', 'White Sapphire'],
    coreTraits: ['Unconditional Love', 'Aesthetics', 'Responsibility', 'Domestic Harmony', 'Healing'],
    strengths: ['Community stewardship', 'Exquisite eye for design', 'Supportive healing aura'],
    challenges: ['Over-protectiveness', 'Perfectionism', 'Martyr syndrome'],
    careerSuggestions: ['Medicine & Healing', 'Design & Architecture', 'Culinary Arts', 'Social Welfare', 'Hospitality'],
    relationshipsInsight: 'Devoted, romantic, and deeply family-oriented; places relationship harmony as their highest pillar.'
  },
  7: {
    rulingPlanet: 'Ketu (South Node)',
    luckyColors: ['Smoky Grey', 'Violet', 'Sea Green', 'White'],
    luckyDays: ['Monday', 'Wednesday'],
    luckyGems: ["Cat's Eye (Vaidurya)"],
    coreTraits: ['Spiritual Inquiry', 'Analytical Depth', 'Introspection', 'Solitude', 'Truth-Seeking'],
    strengths: ['Penetrating intuition', 'Deep technical research', 'Detached spiritual insight'],
    challenges: ['Emotional aloofness', 'Skepticism', 'Tendency toward cynical reclusion'],
    careerSuggestions: ['Scientific Research', 'Philosophy & Metaphysics', 'Cybersecurity', 'Psychiatry', 'Astrology'],
    relationshipsInsight: 'Selective and private; values quiet mutual respect, soulful depth, and freedom from superficial drama.'
  },
  8: {
    rulingPlanet: 'Saturn (Shani)',
    luckyColors: ['Midnight Blue', 'Black', 'Dark Navy', 'Steel Grey'],
    luckyDays: ['Saturday', 'Wednesday'],
    luckyGems: ['Blue Sapphire (Neelam)', 'Amethyst'],
    coreTraits: ['Karmic Mastery', 'Endurance', 'Material Authority', 'Prudence', 'Justice'],
    strengths: ['Unshakeable resilience under adversity', 'Long-term empire building', 'Impartial justice'],
    challenges: ['Emotional hardness', 'Pessimism', 'Fear of vulnerability'],
    careerSuggestions: ['Corporate Governance', 'Judiciary & Law', 'Heavy Industries', 'Banking & Investment', 'Mining & Energy'],
    relationshipsInsight: 'Deeply loyal once trust is earned; demonstrates love through protection, security, and long-term commitment.'
  },
  9: {
    rulingPlanet: 'Mars (Mangal)',
    luckyColors: ['Crimson Red', 'Coral', 'Maroon', 'Rose'],
    luckyDays: ['Tuesday', 'Thursday'],
    luckyGems: ['Red Coral (Moonga)'],
    coreTraits: ['Universal Humanitarianism', 'Fiery Zeal', 'Courage', 'Generosity', 'Idealism'],
    strengths: ['Champion of the underdog', 'Passionate energy', 'Broad philanthropic vision'],
    challenges: ['Short temper', 'Impulsive crusades', 'Difficulty letting go of grievances'],
    careerSuggestions: ['Social Activism & NGOs', 'Defense & Emergency Rescue', 'Sports & Fitness', 'Creative Arts', 'Medicine'],
    relationshipsInsight: 'Passionate, generous, and romantic; thrives alongside partners who share a desire to uplift the world.'
  },
  11: {
    rulingPlanet: 'Master Intuitive (Moon + Neptune)',
    luckyColors: ['Silver', 'Electric Violet', 'White'],
    luckyDays: ['Monday'],
    luckyGems: ['Pearl', 'Clear Quartz'],
    coreTraits: ['Spiritual Illumination', 'Visionary Insight', 'High Vibration', 'Inspiration'],
    strengths: ['Direct prophetic intuition', 'Empathic resonance', 'Inspirational teacher'],
    challenges: ['Nervous tension', 'Overwhelm in chaotic environments'],
    careerSuggestions: ['Spiritual Teacher', 'Visionary Artist', 'Counselor', 'Inventor'],
    relationshipsInsight: 'Deep soulmate resonance required; cannot thrive in purely transactional marriages.'
  },
  22: {
    rulingPlanet: 'Master Builder (Saturn + Uranus)',
    luckyColors: ['Deep Bronze', 'Gold', 'Midnight Indigo'],
    luckyDays: ['Saturday'],
    luckyGems: ['Blue Sapphire', 'Topaz'],
    coreTraits: ['Master Builder', 'Manifestation of Grand Dreams', 'Global Impact'],
    strengths: ['Turning ethereal ideas into physical institutions', 'Supreme organizational capacity'],
    challenges: ['Crushing weight of high potential', 'Workaholism'],
    careerSuggestions: ['Infrastructure Pioneer', 'Global Humanitarian Leader', 'Institution Founder'],
    relationshipsInsight: 'Needs a solid, understanding co-creator who grounds them and believes in their monumental missions.'
  }
};

/**
 * Computes complete Numerological Profile
 */
export function calculateNumerology(name: string, day: number, month: number, year: number): NumerologyProfile {
  const lifePath = calculateLifePath(day, month, year);
  const birthDay = calculateBirthNumber(day);
  const destiny = calculateDestinyNumber(name);
  const soulUrge = calculateSoulUrge(name);
  const personality = calculatePersonalityNumber(name);
  const personalYear = calculatePersonalYear(day, month);
  const chaldean = calculateChaldeanNumber(name);

  const profile = NUMBER_PROFILES[lifePath] || NUMBER_PROFILES[reduceToSingleDigit(lifePath)] || NUMBER_PROFILES[1];

  return {
    name,
    birthDate: { day, month, year },
    lifePathNumber: lifePath,
    birthDayNumber: birthDay,
    destinyNumber: destiny,
    soulUrgeNumber: soulUrge,
    personalityNumber: personality,
    personalYearNumber: personalYear,
    chaldeanNameNumber: chaldean,
    rulingPlanet: profile.rulingPlanet,
    luckyColors: profile.luckyColors,
    luckyDays: profile.luckyDays,
    luckyGems: profile.luckyGems,
    coreTraits: profile.coreTraits,
    strengths: profile.strengths,
    challenges: profile.challenges,
    careerSuggestions: profile.careerSuggestions,
    relationshipsInsight: profile.relationshipsInsight,
  };
}
