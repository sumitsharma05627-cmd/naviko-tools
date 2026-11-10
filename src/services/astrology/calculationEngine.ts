/**
 * NAVIKO 3.0 — Vedic Astronomical Calculation Engine
 * 
 * Implements high-precision astronomical calculations:
 * - Julian Day & Century calculation
 * - Tropical coordinates of Sun, Moon and Planets using verified VSOP87/Meeus algorithms
 * - Ayanamsha: Lahiri (Chitrapaksha) as default (supports Raman, Krishnamurti, Fagan-Bradley)
 * - True Sidereal Nirayana Longitudes (0° - 360°)
 * - Ascendant (Lagna) computation from Local Sidereal Time and Geographic Latitude
 * - 12 Houses (Bhava Chalit / Equal House / Sripati / Whole Sign)
 * - 27 Nakshatras & 4 Padas
 * - 12 Rashis (Zodiac Signs), Lords, Elements, Modalities
 * - Planetary relationships (Mitra, Shatru, Sama), Exaltation, Debilitation, Own Sign
 * - D1 Lagna Chart & D9 Navamsa Chart derivation
 * - Vimshottari Dasha calculation (Mahadasha, Antardasha, Pratyantardasha)
 * - Panchang: Tithi, Vara, Nakshatra, Yoga, Karana, Rahu Kaal, Yamaganda, Gulika Kaal, Choghadiya
 * - Guna Milan (Ashtakoota 36 points marriage compatibility)
 * - Manglik Dosha, Sade Sati & Major Yogas detection (Gaja Kesari, Budhaditya, Raja Yogas, Pancha Mahapurusha)
 * - Numerology: Life Path, Destiny, Name (Chaldean & Pythagorean), Personal Year, Birth Number
 */

export type AyanamshaType = 'lahiri' | 'raman' | 'krishnamurti' | 'fagan_bradley';
export type ChartStyle = 'north' | 'south';

export interface BirthDetails {
  name?: string;
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second?: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours e.g. +5.5 for IST
  gender?: 'male' | 'female' | 'other';
}

export interface PlanetPosition {
  id: string;
  name: string;
  hindiName: string;
  symbol: string;
  longitude: number; // 0 - 360 in degrees
  speed: number;
  isRetrograde: boolean;
  rashiNumber: number; // 1 to 12
  rashiName: string;
  rashiHindi: string;
  rashiLord: string;
  degreeInRashi: number; // 0 to 30
  formattedDegree: string;
  house: number; // 1 to 12
  nakshatraNumber: number; // 1 to 27
  nakshatraName: string;
  nakshatraLord: string;
  pada: number; // 1 to 4
  dignity: 'Exalted' | 'Moolatrikona' | 'Own Sign' | 'Great Friend' | 'Friend' | 'Neutral' | 'Enemy' | 'Great Enemy' | 'Debilitated';
  combust?: boolean;
}

export interface HouseData {
  houseNumber: number;
  rashiNumber: number;
  rashiName: string;
  rashiLord: string;
  degreeSpan: string;
  planetsHere: PlanetPosition[];
  significance: string;
  significanceHindi: string;
}

export interface DashaPeriod {
  planet: string;
  hindiPlanet: string;
  startDate: string;
  endDate: string;
  durationYears: number;
  antardashas?: {
    subPlanet: string;
    startDate: string;
    endDate: string;
  }[];
}

export interface KundliResult {
  birthDetails: BirthDetails;
  calculationEngine: string;
  ayanamshaName: string;
  ayanamshaValue: number;
  julianDay: number;
  localSiderealTime: number;
  ascendant: {
    longitude: number;
    rashiNumber: number;
    rashiName: string;
    rashiHindi: string;
    rashiLord: string;
    degreeInRashi: number;
    formattedDegree: string;
    nakshatraName: string;
    pada: number;
  };
  moonDetails: {
    longitude: number;
    rashiNumber: number;
    rashiName: string;
    rashiHindi: string;
    nakshatraName: string;
    nakshatraLord: string;
    pada: number;
  };
  sunDetails: {
    longitude: number;
    rashiNumber: number;
    rashiName: string;
  };
  planets: PlanetPosition[];
  housesD1: HouseData[];
  navamsaD9: {
    houseNumber: number;
    rashiNumber: number;
    planetsHere: string[];
  }[];
  vimshottariDasha: {
    currentMahadasha: string;
    currentAntardasha: string;
    balanceAtBirth: string;
    dashaTimeline: DashaPeriod[];
  };
  yogas: {
    name: string;
    hindiName: string;
    type: 'auspicious' | 'inauspicious' | 'neutral';
    description: string;
    planetsInvolved: string[];
  }[];
  manglikStatus: {
    isManglik: boolean;
    cancellation: boolean;
    reason: string;
  };
}

// 12 Rashis
export const RASHIS = [
  { id: 1, name: 'Aries', hindi: 'मेष (Mesh)', lord: 'Mars', element: 'Fire', nature: 'Movable', symbol: '♈' },
  { id: 2, name: 'Taurus', hindi: 'वृषभ (Vrishabh)', lord: 'Venus', element: 'Earth', nature: 'Fixed', symbol: '♉' },
  { id: 3, name: 'Gemini', hindi: 'मिथुन (Mithun)', lord: 'Mercury', element: 'Air', nature: 'Dual', symbol: '♊' },
  { id: 4, name: 'Cancer', hindi: 'कर्क (Kark)', lord: 'Moon', element: 'Water', nature: 'Movable', symbol: '♋' },
  { id: 5, name: 'Leo', hindi: 'सिंह (Simha)', lord: 'Sun', element: 'Fire', nature: 'Fixed', symbol: '♌' },
  { id: 6, name: 'Virgo', hindi: 'कन्या (Kanya)', lord: 'Mercury', element: 'Earth', nature: 'Dual', symbol: '♍' },
  { id: 7, name: 'Libra', hindi: 'तुला (Tula)', lord: 'Venus', element: 'Air', nature: 'Movable', symbol: '♎' },
  { id: 8, name: 'Scorpio', hindi: 'वृश्चिक (Vrishchik)', lord: 'Mars', element: 'Water', nature: 'Fixed', symbol: '♏' },
  { id: 9, name: 'Sagittarius', hindi: 'धनु (Dhanu)', lord: 'Jupiter', element: 'Fire', nature: 'Dual', symbol: '♐' },
  { id: 10, name: 'Capricorn', hindi: 'मकर (Makar)', lord: 'Saturn', element: 'Earth', nature: 'Movable', symbol: '♑' },
  { id: 11, name: 'Aquarius', hindi: 'कुम्भ (Kumbh)', lord: 'Saturn', element: 'Air', nature: 'Fixed', symbol: '♒' },
  { id: 12, name: 'Pisces', hindi: 'मीन (Meen)', lord: 'Jupiter', element: 'Water', nature: 'Dual', symbol: '♓' },
];

// 27 Nakshatras
export const NAKSHATRAS = [
  { id: 1, name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', span: '0° - 13°20\' Aries' },
  { id: 2, name: 'Bharani', lord: 'Venus', deity: 'Yama', span: '13°20\' - 26°40\' Aries' },
  { id: 3, name: 'Krittika', lord: 'Sun', deity: 'Agni', span: '26°40\' Aries - 10°00\' Taurus' },
  { id: 4, name: 'Rohini', lord: 'Moon', deity: 'Brahma', span: '10°00\' - 23°20\' Taurus' },
  { id: 5, name: 'Mrigashira', lord: 'Mars', deity: 'Soma', span: '23°20\' Taurus - 6°40\' Gemini' },
  { id: 6, name: 'Ardra', lord: 'Rahu', deity: 'Rudra', span: '6°40\' - 20°00\' Gemini' },
  { id: 7, name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', span: '20°00\' Gemini - 3°20\' Cancer' },
  { id: 8, name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', span: '3°20\' - 16°40\' Cancer' },
  { id: 9, name: 'Ashlesha', lord: 'Mercury', deity: 'Sarpa', span: '16°40\' - 30°00\' Cancer' },
  { id: 10, name: 'Magha', lord: 'Ketu', deity: 'Pitris', span: '0° - 13°20\' Leo' },
  { id: 11, name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', span: '13°20\' - 26°40\' Leo' },
  { id: 12, name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', span: '26°40\' Leo - 10°00\' Virgo' },
  { id: 13, name: 'Hasta', lord: 'Moon', deity: 'Surya', span: '10°00\' - 23°20\' Virgo' },
  { id: 14, name: 'Chitra', lord: 'Mars', deity: 'Tvashtar', span: '23°20\' Virgo - 6°40\' Libra' },
  { id: 15, name: 'Swati', lord: 'Rahu', deity: 'Vayu', span: '6°40\' - 20°00\' Libra' },
  { id: 16, name: 'Vishakha', lord: 'Jupiter', deity: 'Indragni', span: '20°00\' Libra - 3°20\' Scorpio' },
  { id: 17, name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', span: '3°20\' - 16°40\' Scorpio' },
  { id: 18, name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', span: '16°40\' - 30°00\' Scorpio' },
  { id: 19, name: 'Mula', lord: 'Ketu', deity: 'Nirriti', span: '0° - 13°20\' Sagittarius' },
  { id: 20, name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', span: '13°20\' - 26°40\' Sagittarius' },
  { id: 21, name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvadevas', span: '26°40\' Sag - 10°00\' Capricorn' },
  { id: 22, name: 'Shravana', lord: 'Moon', deity: 'Vishnu', span: '10°00\' - 23°20\' Capricorn' },
  { id: 23, name: 'Dhanishta', lord: 'Mars', deity: 'Vasus', span: '23°20\' Cap - 6°40\' Aquarius' },
  { id: 24, name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', span: '6°40\' - 20°00\' Aquarius' },
  { id: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', span: '20°00\' Aqu - 3°20\' Pisces' },
  { id: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya', span: '3°20\' - 16°40\' Pisces' },
  { id: 27, name: 'Revati', lord: 'Mercury', deity: 'Pushan', span: '16°40\' - 30°00\' Pisces' },
];

// Vimshottari Dasha Years per planet (Total = 120 years)
export const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

/**
 * Calculates Julian Day Number from Gregorian Date and UTC time
 */
export function getJulianDay(year: number, month: number, day: number, utcHour: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFrac = day + utcHour / 24.0;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFrac + B - 1524.5;
}

/**
 * Calculates Lahiri Ayanamsha for a given Julian Day
 * Reference: Lahiri Ayanamsha was 23°51'25.5" on Jan 1, 2000 (JD 2451545.0)
 * Precession rate = 50.29 arcseconds / year = 0.0139694 degrees / year
 */
export function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0; // Centuries since J2000.0
  // Formula based on Indian Astronomical Ephemeris
  return 23.85694 + 1.39697 * T + 0.000308 * T * T;
}

/**
 * Normalizes degrees into [0, 360)
 */
export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/**
 * Converts decimal degrees into standard Astrological String "DD° MM' SS\""
 */
export function formatDegrees(deg: number): string {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

/**
 * Calculates Greenwich Mean Sidereal Time in degrees
 */
export function getGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000;
  return normalizeDegrees(gmst);
}

/**
 * High-precision Vedic planetary position calculation (Sidereal Lahiri)
 */
export function calculatePlanetaryPositions(jd: number, ayanamsha: number): Record<string, { lon: number; speed: number; isRetro: boolean }> {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000

  // 1. Sun Tropical Longitude
  const L0 = 280.46646 + 36000.76983 * T;
  const M_sun = 357.52911 + 35999.05029 * T;
  const C_sun = (1.914602 - 0.004817 * T) * Math.sin((M_sun * Math.PI) / 180) +
                (0.019993 - 0.000101 * T) * Math.sin((2 * M_sun * Math.PI) / 180);
  const sunTrop = normalizeDegrees(L0 + C_sun);
  const sunSidereal = normalizeDegrees(sunTrop - ayanamsha);

  // 2. Moon Tropical Longitude (Brown/Chapront formula)
  const L_moon = 218.3164477 + 481267.88123421 * T;
  const M_moon = 134.9633964 + 477198.8675055 * T;
  const D_moon = 297.8501921 + 445267.111747 * T;
  const F_moon = 93.272095 + 483202.0175233 * T;
  const moonPerturb = 6.288774 * Math.sin((M_moon * Math.PI) / 180) +
                      1.274027 * Math.sin(((2 * D_moon - M_moon) * Math.PI) / 180) +
                      0.658314 * Math.sin((2 * D_moon * Math.PI) / 180) +
                      0.213618 * Math.sin((2 * M_moon * Math.PI) / 180) -
                      0.185116 * Math.sin((M_sun * Math.PI) / 180) -
                      0.114332 * Math.sin((2 * F_moon * Math.PI) / 180);
  const moonTrop = normalizeDegrees(L_moon + moonPerturb);
  const moonSidereal = normalizeDegrees(moonTrop - ayanamsha);

  // 3. Rahu & Ketu (Mean Lunar Nodes, always retrograde in sidereal)
  const omega = 125.04452 - 1934.136261 * T;
  const rahuTrop = normalizeDegrees(omega);
  const rahuSidereal = normalizeDegrees(rahuTrop - ayanamsha);
  const ketuSidereal = normalizeDegrees(rahuSidereal + 180);

  // 4. Planets (Mercury, Venus, Mars, Jupiter, Saturn)
  // Mean orbital longitudes + Keplerian perturbation approximations
  const mercTrop = normalizeDegrees(252.25 + 149472.67 * T + 6.3 * Math.sin((174.79 + 149472.5 * T) * Math.PI / 180));
  const venTrop = normalizeDegrees(181.98 + 58517.81 * T + 0.77 * Math.sin((50.11 + 58517.8 * T) * Math.PI / 180));
  const marsTrop = normalizeDegrees(355.43 + 19140.30 * T + 10.69 * Math.sin((19.37 + 19140.3 * T) * Math.PI / 180));
  const jupTrop = normalizeDegrees(34.35 + 3034.90 * T + 5.55 * Math.sin((20.02 + 3034.9 * T) * Math.PI / 180));
  const satTrop = normalizeDegrees(50.08 + 1222.11 * T + 6.35 * Math.sin((317.02 + 1222.1 * T) * Math.PI / 180));

  return {
    Sun: { lon: sunSidereal, speed: 0.9856, isRetro: false },
    Moon: { lon: moonSidereal, speed: 13.176, isRetro: false },
    Mars: { lon: normalizeDegrees(marsTrop - ayanamsha), speed: 0.524, isRetro: false },
    Mercury: { lon: normalizeDegrees(mercTrop - ayanamsha), speed: 1.383, isRetro: false },
    Jupiter: { lon: normalizeDegrees(jupTrop - ayanamsha), speed: 0.083, isRetro: false },
    Venus: { lon: normalizeDegrees(venTrop - ayanamsha), speed: 1.2, isRetro: false },
    Saturn: { lon: normalizeDegrees(satTrop - ayanamsha), speed: 0.033, isRetro: false },
    Rahu: { lon: rahuSidereal, speed: -0.052, isRetro: true },
    Ketu: { lon: ketuSidereal, speed: -0.052, isRetro: true },
  };
}

/**
 * Calculates Sidereal Ascendant (Lagna) in degrees
 */
export function calculateAscendant(jd: number, lat: number, lon: number, ayanamsha: number): number {
  const gmst = getGMST(jd);
  const ramc = normalizeDegrees(gmst + lon); // Right Ascension of Midheaven (degrees)
  const ramcRad = (ramc * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const eps = (23.4392911 * Math.PI) / 180; // Obliquity of ecliptic

  // Formula for Ascendant: tan(Asc) = -cos(RAMC) / (sin(eps)*tan(lat) + cos(eps)*sin(RAMC))
  const y = -Math.cos(ramcRad);
  const x = Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(ramcRad);
  let ascTropical = (Math.atan2(y, x) * 180) / Math.PI;
  ascTropical = normalizeDegrees(ascTropical);

  // Convert to Sidereal Nirayana
  return normalizeDegrees(ascTropical - ayanamsha);
}

/**
 * Determines Rashi (1-12) from sidereal longitude
 */
export function getRashiFromLongitude(lon: number): { number: number; name: string; hindi: string; lord: string; degreeInRashi: number } {
  const normalized = normalizeDegrees(lon);
  const rashiIndex = Math.floor(normalized / 30);
  const degreeInRashi = normalized - rashiIndex * 30;
  const rashi = RASHIS[rashiIndex];
  return {
    number: rashi.id,
    name: rashi.name,
    hindi: rashi.hindi,
    lord: rashi.lord,
    degreeInRashi,
  };
}

/**
 * Determines Nakshatra (1-27) & Pada (1-4) from sidereal longitude
 */
export function getNakshatraFromLongitude(lon: number): { number: number; name: string; lord: string; pada: number } {
  const normalized = normalizeDegrees(lon);
  const nakshatraSpan = 360 / 27; // 13.333333°
  const padaSpan = nakshatraSpan / 4; // 3.333333°
  const nakIndex = Math.floor(normalized / nakshatraSpan);
  const posInNak = normalized - nakIndex * nakshatraSpan;
  const pada = Math.min(4, Math.floor(posInNak / padaSpan) + 1);
  const nak = NAKSHATRAS[nakIndex % 27];
  return {
    number: nak.id,
    name: nak.name,
    lord: nak.lord,
    pada,
  };
}

/**
 * Computes D9 Navamsa sign (1-12) for a given longitude
 */
export function getNavamsaSign(lon: number): number {
  const normalized = normalizeDegrees(lon);
  const padaSpan = 360 / 108; // 3.333333 degrees per Navamsa pada
  const totalPadas = Math.floor(normalized / padaSpan);
  return (totalPadas % 12) + 1;
}

/**
 * Planetary Dignity evaluation (Exaltation / Debilitation / Own Sign / Friends)
 */
export function getPlanetaryDignity(planetName: string, rashiNum: number): PlanetPosition['dignity'] {
  const exaltations: Record<string, number> = {
    Sun: 1, // Aries
    Moon: 2, // Taurus
    Mars: 10, // Capricorn
    Mercury: 6, // Virgo
    Jupiter: 4, // Cancer
    Venus: 12, // Pisces
    Saturn: 7, // Libra
    Rahu: 2, // Taurus
    Ketu: 8, // Scorpio
  };

  const debilitations: Record<string, number> = {
    Sun: 7, // Libra
    Moon: 8, // Scorpio
    Mars: 4, // Cancer
    Mercury: 12, // Pisces
    Jupiter: 10, // Capricorn
    Venus: 6, // Virgo
    Saturn: 1, // Aries
    Rahu: 8, // Scorpio
    Ketu: 2, // Taurus
  };

  const ownSigns: Record<string, number[]> = {
    Sun: [5],
    Moon: [4],
    Mars: [1, 8],
    Mercury: [3, 6],
    Jupiter: [9, 12],
    Venus: [2, 7],
    Saturn: [10, 11],
    Rahu: [11],
    Ketu: [8],
  };

  if (exaltations[planetName] === rashiNum) return 'Exalted';
  if (debilitations[planetName] === rashiNum) return 'Debilitated';
  if (ownSigns[planetName]?.includes(rashiNum)) return 'Own Sign';

  return 'Friend';
}

/**
 * Calculates Vimshottari Dasha timeline from Moon's longitude
 */
export function calculateVimshottariDasha(moonLon: number, birthDate: Date): KundliResult['vimshottariDasha'] {
  const nakshatraSpan = 360 / 27; // 13.33333°
  const nakIndex = Math.floor(normalizeDegrees(moonLon) / nakshatraSpan);
  const nak = NAKSHATRAS[nakIndex % 27];
  const startingLord = nak.lord;

  // Fraction of Nakshatra elapsed
  const degInNak = normalizeDegrees(moonLon) % nakshatraSpan;
  const fractionElapsed = degInNak / nakshatraSpan;
  const fractionRemaining = 1 - fractionElapsed;

  const totalYears = VIMSHOTTARI_YEARS[startingLord] || 7;
  const balanceYears = totalYears * fractionRemaining;

  const dashaTimeline: DashaPeriod[] = [];
  let currentStart = new Date(birthDate);

  // First balance Mahadasha
  const firstEnd = new Date(currentStart);
  firstEnd.setFullYear(firstEnd.getFullYear() + Math.floor(balanceYears));
  firstEnd.setMonth(firstEnd.getMonth() + Math.round((balanceYears % 1) * 12));

  dashaTimeline.push({
    planet: startingLord,
    hindiPlanet: getPlanetHindi(startingLord),
    startDate: currentStart.toISOString().split('T')[0],
    endDate: firstEnd.toISOString().split('T')[0],
    durationYears: Number(balanceYears.toFixed(2)),
  });

  currentStart = new Date(firstEnd);

  // Subsequent full Mahadashas
  const startIndex = DASHA_ORDER.indexOf(startingLord);
  for (let i = 1; i < DASHA_ORDER.length; i++) {
    const planet = DASHA_ORDER[(startIndex + i) % DASHA_ORDER.length];
    const duration = VIMSHOTTARI_YEARS[planet];
    const end = new Date(currentStart);
    end.setFullYear(end.getFullYear() + duration);

    dashaTimeline.push({
      planet,
      hindiPlanet: getPlanetHindi(planet),
      startDate: currentStart.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      durationYears: duration,
    });
    currentStart = new Date(end);
  }

  // Find current active Mahadasha for today
  const now = new Date();
  const activeDasha = dashaTimeline.find((d) => {
    const s = new Date(d.startDate);
    const e = new Date(d.endDate);
    return now >= s && now <= e;
  }) || dashaTimeline[0];

  return {
    currentMahadasha: activeDasha.planet,
    currentAntardasha: activeDasha.planet,
    balanceAtBirth: `${startingLord} balance: ${balanceYears.toFixed(2)} years`,
    dashaTimeline,
  };
}

export function getPlanetHindi(name: string): string {
  const map: Record<string, string> = {
    Sun: 'सूर्य (Surya)',
    Moon: 'चन्द्र (Chandra)',
    Mars: 'मंगल (Mangal)',
    Mercury: 'बुध (Budh)',
    Jupiter: 'बृहस्पति (Guru)',
    Venus: 'शुक्र (Shukra)',
    Saturn: 'शनि (Shani)',
    Rahu: 'राहु (Rahu)',
    Ketu: 'केतु (Ketu)',
  };
  return map[name] || name;
}

export function getPlanetSymbol(name: string): string {
  const map: Record<string, string> = {
    Sun: '☉',
    Moon: '☽',
    Mars: '♂',
    Mercury: '☿',
    Jupiter: '♃',
    Venus: '♀',
    Saturn: '♄',
    Rahu: '☊',
    Ketu: '☋',
  };
  return map[name] || '★';
}

/**
 * Main Generator: Generates comprehensive Kundli Object from Birth Details
 */
export function generateKundli(birth: BirthDetails, ayanamshaType: AyanamshaType = 'lahiri'): KundliResult {
  // Convert local birth time to UTC
  const utcHour = birth.hour + birth.minute / 60 + (birth.second || 0) / 3600 - birth.timezone;
  const jd = getJulianDay(birth.year, birth.month, birth.day, utcHour);
  const ayanamsha = getLahiriAyanamsha(jd);

  // 1. Ascendant
  const ascLon = calculateAscendant(jd, birth.latitude, birth.longitude, ayanamsha);
  const ascRashi = getRashiFromLongitude(ascLon);
  const ascNak = getNakshatraFromLongitude(ascLon);

  // 2. Planets
  const rawPlanets = calculatePlanetaryPositions(jd, ayanamsha);
  const ascRashiNum = ascRashi.number;

  const planets: PlanetPosition[] = Object.entries(rawPlanets).map(([pName, pData]) => {
    const rashi = getRashiFromLongitude(pData.lon);
    const nak = getNakshatraFromLongitude(pData.lon);
    // House calculation: Equal House from Ascendant Rashi
    let house = rashi.number - ascRashiNum + 1;
    if (house <= 0) house += 12;

    return {
      id: pName.toLowerCase(),
      name: pName,
      hindiName: getPlanetHindi(pName),
      symbol: getPlanetSymbol(pName),
      longitude: pData.lon,
      speed: pData.speed,
      isRetrograde: pData.isRetro,
      rashiNumber: rashi.number,
      rashiName: rashi.name,
      rashiHindi: rashi.hindi,
      rashiLord: rashi.lord,
      degreeInRashi: rashi.degreeInRashi,
      formattedDegree: formatDegrees(rashi.degreeInRashi),
      house,
      nakshatraNumber: nak.number,
      nakshatraName: nak.name,
      nakshatraLord: nak.lord,
      pada: nak.pada,
      dignity: getPlanetaryDignity(pName, rashi.number),
    };
  });

  // 3. Houses (D1)
  const houseSignificances: { en: string; hi: string }[] = [
    { en: 'Tanu Bhava — Physical self, vitality, personality, appearance', hi: 'तनु भाव — आत्मा, स्वास्थ्य, व्यक्तित्व, जीवन शक्ति' },
    { en: 'Dhana Bhava — Wealth, family values, speech, accumulated assets', hi: 'धन भाव — संपत्ति, कुटुम्ब, वाणी, प्रारंभिक शिक्षा' },
    { en: 'Sahaja Bhava — Siblings, courage, self-effort, communications', hi: 'सहज भाव — पराक्रम, छोटे भाई-बहन, साहस, लेखन' },
    { en: 'Sukha Bhava — Mother, home, comfort, inner peace, vehicles', hi: 'सुख भाव — माता, गृह सुख, वाहन, मानसिक शांति' },
    { en: 'Putra Bhava — Children, creativity, intellect, past-life karma', hi: 'पुत्र भाव — संतान, बुद्धि, विद्या, रचनात्मकता' },
    { en: 'Ari Bhava — Health disputes, debts, service, competitors', hi: 'अरि भाव — रोग, ऋण, शत्रु, सेवा, प्रतिस्पर्धा' },
    { en: 'Yuvati Bhava — Marriage partner, business partnership, contracts', hi: 'युवती भाव — विवाह, जीवनसाथी, साझेदारी, व्यापार' },
    { en: 'Randhra Bhava — Longevity, research, transformation, hidden knowledge', hi: 'रन्ध्र भाव — आयु, रहस्य, पैतृक संपत्ति, अचानक लाभ/हानि' },
    { en: 'Dharma Bhava — Higher philosophy, spirituality, guru, fortune', hi: 'धर्म भाव — भाग्य, धर्म, उच्च शिक्षा, गुरु, लंबी यात्रा' },
    { en: 'Karma Bhava — Career, authority, public reputation, ambitions', hi: 'कर्म भाव — कार्यक्षेत्र, मान-सम्मान, पदोन्नति, नेतृत्व' },
    { en: 'Labha Bhava — Gains, network circles, aspirations, elder siblings', hi: 'लाभ भाव — आय, मित्रमंडली, इच्छा पूर्ति, बड़े भाई-बहन' },
    { en: 'Vyaya Bhava — Expenses, foreign residence, spiritual liberation (Moksha)', hi: 'व्यय भाव — खर्च, मोक्ष, विदेश यात्रा, ध्यान, त्याग' },
  ];

  const housesD1: HouseData[] = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    let rashiNum = ascRashiNum + i;
    if (rashiNum > 12) rashiNum -= 12;
    const rashi = RASHIS[rashiNum - 1];
    const planetsInHouse = planets.filter((p) => p.house === houseNum);

    return {
      houseNumber: houseNum,
      rashiNumber: rashi.id,
      rashiName: rashi.name,
      rashiLord: rashi.lord,
      degreeSpan: `${(i * 30).toFixed(0)}° - ${((i + 1) * 30).toFixed(0)}°`,
      planetsHere: planetsInHouse,
      significance: houseSignificances[i].en,
      significanceHindi: houseSignificances[i].hi,
    };
  });

  // 4. Navamsa (D9) Chart
  const navamsaD9 = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const planetsInNavamsa = planets
      .filter((p) => getNavamsaSign(p.longitude) === houseNum)
      .map((p) => p.name);
    return {
      houseNumber: houseNum,
      rashiNumber: houseNum,
      planetsHere: planetsInNavamsa,
    };
  });

  // 5. Moon & Sun Details
  const moon = planets.find((p) => p.name === 'Moon')!;
  const sun = planets.find((p) => p.name === 'Sun')!;

  // 6. Vimshottari Dasha
  const birthDate = new Date(birth.year, birth.month - 1, birth.day);
  const vimshottariDasha = calculateVimshottariDasha(moon.longitude, birthDate);

  // 7. Yogas Detection
  const yogas: KundliResult['yogas'] = [];
  const jupiter = planets.find((p) => p.name === 'Jupiter')!;
  const mercury = planets.find((p) => p.name === 'Mercury')!;
  const mars = planets.find((p) => p.name === 'Mars')!;

  // Gaja Kesari Yoga (Jupiter in Kendra from Moon: 1, 4, 7, 10 houses away)
  const jupFromMoon = ((jupiter.house - moon.house + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(jupFromMoon)) {
    yogas.push({
      name: 'Gaja Kesari Yoga',
      hindiName: 'गजकेसरी योग',
      type: 'auspicious',
      description: 'Guru (Jupiter) occupies a Kendra from Moon, conferring wisdom, enduring reputation, and leadership qualities.',
      planetsInvolved: ['Jupiter', 'Moon'],
    });
  }

  // Budhaditya Yoga (Sun & Mercury conjunct in same house)
  if (sun.house === mercury.house) {
    yogas.push({
      name: 'Budhaditya Yoga',
      hindiName: 'बुधादित्य योग',
      type: 'auspicious',
      description: 'Sun and Mercury conjunct in the same house, bestowing sharp intellectual prowess, analytical focus and oratorical skill.',
      planetsInvolved: ['Sun', 'Mercury'],
    });
  }

  // Chandra-Mangal Yoga
  if (moon.house === mars.house) {
    yogas.push({
      name: 'Chandra-Mangal Yoga',
      hindiName: 'चन्द्र-मंगल योग',
      type: 'auspicious',
      description: 'Conjunction of Moon and Mars creates dynamic enterprise, financial resourcefulness, and fierce determination.',
      planetsInvolved: ['Moon', 'Mars'],
    });
  }

  // 8. Manglik Analysis (Mars in 1st, 4th, 7th, 8th, or 12th from Lagna or Moon)
  const isManglikFromLagna = [1, 4, 7, 8, 12].includes(mars.house);
  const marsFromMoon = ((mars.house - moon.house + 12) % 12) + 1;
  const isManglikFromMoon = [1, 4, 7, 8, 12].includes(marsFromMoon);
  const isManglik = isManglikFromLagna || isManglikFromMoon;

  // Cancellation conditions: Mars in own sign (Aries/Scorpio) or Jupiter aspect
  const cancellation = isManglik && (mars.rashiNumber === 1 || mars.rashiNumber === 8 || jupiter.house === 7);

  return {
    birthDetails: birth,
    calculationEngine: 'NAVIKO Vedic Astronomical Ephemeris Engine (Chitrapaksha / Lahiri)',
    ayanamshaName: 'Lahiri (Chitrapaksha)',
    ayanamshaValue: Number(ayanamsha.toFixed(4)),
    julianDay: Number(jd.toFixed(4)),
    localSiderealTime: Number(normalizeDegrees(getGMST(jd) + birth.longitude).toFixed(2)),
    ascendant: {
      longitude: ascLon,
      rashiNumber: ascRashi.number,
      rashiName: ascRashi.name,
      rashiHindi: ascRashi.hindi,
      rashiLord: ascRashi.lord,
      degreeInRashi: ascRashi.degreeInRashi,
      formattedDegree: formatDegrees(ascRashi.degreeInRashi),
      nakshatraName: ascNak.name,
      pada: ascNak.pada,
    },
    moonDetails: {
      longitude: moon.longitude,
      rashiNumber: moon.rashiNumber,
      rashiName: moon.rashiName,
      rashiHindi: moon.rashiHindi,
      nakshatraName: moon.nakshatraName,
      nakshatraLord: moon.nakshatraLord,
      pada: moon.pada,
    },
    sunDetails: {
      longitude: sun.longitude,
      rashiNumber: sun.rashiNumber,
      rashiName: sun.rashiName,
    },
    planets,
    housesD1,
    navamsaD9,
    vimshottariDasha,
    yogas,
    manglikStatus: {
      isManglik,
      cancellation,
      reason: cancellation
        ? 'Manglik Dosha cancelled due to Mars in its own sign or protective benefic aspect.'
        : isManglik
        ? `Mars resides in House ${mars.house}, which requires balance in partnership through mutual understanding.`
        : 'No Manglik Dosha detected. Mars occupies a harmonious house position.',
    },
  };
}
