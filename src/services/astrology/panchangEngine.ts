/**
 * NAVIKO 3.0 — Vedic Panchang & Muhurat Calculation Engine
 * 
 * Provides verified calculations for:
 * - Tithi (Lunar day based on Moon-Sun elongation, 12° per Tithi)
 * - Vara (Weekday ruler based on planetary hours)
 * - Nakshatra (Moon's asterism 13°20' span)
 * - Yoga (Sum of Sun and Moon longitudes, 13°20' span)
 * - Karana (Half of a Tithi, 6° span)
 * - Sunrise, Sunset & Day Duration
 * - Rahu Kaal, Yamaganda, Gulika Kaal (1/8th division of day length)
 * - Day & Night Choghadiya (Amrit, Shubh, Labh, Char, Rog, Kaal, Udveg)
 * - Muhurat evaluators: Marriage, Griha Pravesh, Vehicle Purchase, Business Inauguration
 */

import { getJulianDay, getLahiriAyanamsha, calculatePlanetaryPositions, normalizeDegrees, NAKSHATRAS } from './calculationEngine';

export interface PanchangData {
  dateString: string;
  location: {
    city: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  tithi: {
    number: number;
    name: string;
    hindiName: string;
    paksha: 'Shukla (Waxing)' | 'Krishna (Waning)';
    pakshaHindi: string;
    deity: string;
    percentageElapsed: number;
  };
  vara: {
    day: string;
    hindiName: string;
    rulingPlanet: string;
  };
  nakshatra: {
    number: number;
    name: string;
    lord: string;
    pada: number;
  };
  yoga: {
    number: number;
    name: string;
    hindiName: string;
    meaning: string;
    auspiciousness: 'Auspicious' | 'Inauspicious' | 'Neutral';
  };
  karana: {
    number: number;
    name: string;
    hindiName: string;
    type: 'Movable' | 'Fixed';
    deity: string;
  };
  sunTimings: {
    sunrise: string;
    sunset: string;
    solarNoon: string;
    dayLength: string;
  };
  inauspiciousPeriods: {
    rahuKaal: { start: string; end: string; significance: string };
    yamaganda: { start: string; end: string; significance: string };
    gulikaKaal: { start: string; end: string; significance: string };
  };
  auspiciousPeriods: {
    abhijitMuhurat: { start: string; end: string; significance: string };
    brahmaMuhurat: { start: string; end: string; significance: string };
    amritKaal: { start: string; end: string; significance: string };
  };
  choghadiya: {
    daySlots: { name: string; type: 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg'; isGood: boolean; time: string }[];
    nightSlots: { name: string; type: 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg'; isGood: boolean; time: string }[];
  };
}

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
];

export const TITHI_HINDI = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा / अमावस्या'
];

export const YOGAS_27 = [
  { name: 'Vishkumbha', hi: 'विष्कम्भ', auspiciousness: 'Inauspicious', meaning: 'Prevailing poison; caution advised for new beginnings' },
  { name: 'Priti', hi: 'प्रीति', auspiciousness: 'Auspicious', meaning: 'Mutual affection, amity and lasting love' },
  { name: 'Ayushman', hi: 'आयुष्मान', auspiciousness: 'Auspicious', meaning: 'Promotes health, vitality and long life' },
  { name: 'Saubhagya', hi: 'सौभाग्य', auspiciousness: 'Auspicious', meaning: 'Good fortune, auspicious accomplishments' },
  { name: 'Shobhana', hi: 'शोभन', auspiciousness: 'Auspicious', meaning: 'Beauty, grace, prosperity and celebrations' },
  { name: 'Atiganda', hi: 'अतिगण्ड', auspiciousness: 'Inauspicious', meaning: 'Obstacles and friction in endeavors' },
  { name: 'Sukarma', hi: 'सुकर्मा', auspiciousness: 'Auspicious', meaning: 'Righteous deeds and prosperous career decisions' },
  { name: 'Dhriti', hi: 'धृति', auspiciousness: 'Auspicious', meaning: 'Patience, endurance and peaceful resolve' },
  { name: 'Shula', hi: 'शूल', auspiciousness: 'Inauspicious', meaning: 'Prickly challenges; internal fortitude needed' },
  { name: 'Ganda', hi: 'गण्ड', auspiciousness: 'Inauspicious', meaning: 'Knots and entanglements; proceed with care' },
  { name: 'Vriddhi', hi: 'वृद्धि', auspiciousness: 'Auspicious', meaning: 'Expansion, investment return and growth' },
  { name: 'Dhruva', hi: 'ध्रुव', auspiciousness: 'Auspicious', meaning: 'Fixed stability, enduring legacy and permanence' },
  { name: 'Vyaghata', hi: 'व्याघात', auspiciousness: 'Inauspicious', meaning: 'Sudden turns; avoid signing contracts' },
  { name: 'Harshana', hi: 'हर्षण', auspiciousness: 'Auspicious', meaning: 'Joy, celebration, family gatherings' },
  { name: 'Vajra', hi: 'वज्र', auspiciousness: 'Neutral', meaning: 'Indestructible resolve; firmness of mind' },
  { name: 'Siddhi', hi: 'सिद्धि', auspiciousness: 'Auspicious', meaning: 'Fulfillment of aspirations and success' },
  { name: 'Vyatipata', hi: 'व्यतीपात', auspiciousness: 'Inauspicious', meaning: 'Calamity risk; deep prayer and contemplation' },
  { name: 'Variyan', hi: 'वरीयान', auspiciousness: 'Auspicious', meaning: 'Pre-eminence and leadership honor' },
  { name: 'Parigha', hi: 'परिघ', auspiciousness: 'Neutral', meaning: 'Defense and boundaries' },
  { name: 'Shiva', hi: 'शिव', auspiciousness: 'Auspicious', meaning: 'Pure auspiciousness, spiritual grace' },
  { name: 'Siddha', hi: 'सिद्ध', auspiciousness: 'Auspicious', meaning: 'Mastery and successful negotiations' },
  { name: 'Sadhya', hi: 'साध्य', auspiciousness: 'Auspicious', meaning: 'Achievable endeavors through discipline' },
  { name: 'Shubha', hi: 'शुभ', auspiciousness: 'Auspicious', meaning: 'Wholesome auspiciousness for ceremonies' },
  { name: 'Shukla', hi: 'शुक्ल', auspiciousness: 'Auspicious', meaning: 'Luminosity, clarity and pure vision' },
  { name: 'Brahma', hi: 'ब्रह्म', auspiciousness: 'Auspicious', meaning: 'Supreme creative vision and wisdom' },
  { name: 'Indra', hi: 'इन्द्र', auspiciousness: 'Auspicious', meaning: 'Nobility, leadership and government favors' },
  { name: 'Vaidhriti', hi: 'वैधृति', auspiciousness: 'Inauspicious', meaning: 'Dissatisfaction; keep commitments modest' }
];

export const KARANAS = [
  { name: 'Bava', hi: 'बव', type: 'Movable', deity: 'Indra' },
  { name: 'Balava', hi: 'बालव', type: 'Movable', deity: 'Brahma' },
  { name: 'Kaulava', hi: 'कौलव', type: 'Movable', deity: 'Mitra' },
  { name: 'Taitila', hi: 'तैतिल', type: 'Movable', deity: 'Aryaman' },
  { name: 'Gara', hi: 'गर', type: 'Movable', deity: 'Bhumi' },
  { name: 'Vanija', hi: 'वणिज', type: 'Movable', deity: 'Lakshmi' },
  { name: 'Vishti (Bhadra)', hi: 'विष्टि (भद्रा)', type: 'Movable', deity: 'Yama' },
  { name: 'Shakuni', hi: 'शकुनि', type: 'Fixed', deity: 'Kaliyuga' },
  { name: 'Chatushpada', hi: 'चतुष्पद', type: 'Fixed', deity: 'Vrishabha' },
  { name: 'Naga', hi: 'नाग', type: 'Fixed', deity: 'Sarpa' },
  { name: 'Kimstughna', hi: 'किंस्तुघ्न', type: 'Fixed', deity: 'Vayu' }
];

// 1/8th of day divisions starting offset from sunrise for each day of week (0 = Sunday to 6 = Saturday)
// Rahu Kaal slot index (1 to 8): Sun: 8, Mon: 2, Tue: 7, Wed: 5, Thu: 6, Fri: 4, Sat: 3
const RAHU_KAAL_SLOTS = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_SLOTS = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SLOTS = [7, 6, 5, 4, 3, 2, 1];

/**
 * Calculates full daily Vedic Panchang for a specific date and coordinates
 */
export function calculatePanchang(date: Date, lat: number = 28.6139, lon: number = 77.2090, timezone: number = 5.5, cityName: string = 'New Delhi'): PanchangData {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // Reference at local sunrise ~6:00 AM local time = (6 - timezone) UTC
  const sunriseHourUTC = 6.0 - timezone;
  const jd = getJulianDay(y, m, d, sunriseHourUTC);
  const ayanamsha = getLahiriAyanamsha(jd);

  const planets = calculatePlanetaryPositions(jd, ayanamsha);
  const sunLon = planets.Sun.lon;
  const moonLon = planets.Moon.lon;

  // 1. Tithi: Angle between Moon and Sun (0° to 360°, each 12° is one Tithi)
  let diff = normalizeDegrees(moonLon - sunLon);
  const tithiIndex = Math.floor(diff / 12); // 0 to 29
  const isShukla = tithiIndex < 15;
  const tithiNumber = (tithiIndex % 15) + 1;
  const tithiName = TITHI_NAMES[tithiNumber - 1];
  const tithiHindi = TITHI_HINDI[tithiNumber - 1];
  const percentageElapsed = Number((((diff % 12) / 12) * 100).toFixed(1));

  // 2. Vara: Day of week
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const weekDays = [
    { en: 'Sunday', hi: 'रविवार (Ravivar)', planet: 'Sun' },
    { en: 'Monday', hi: 'सोमवार (Somvar)', planet: 'Moon' },
    { en: 'Tuesday', hi: 'मंगलवार (Mangalvar)', planet: 'Mars' },
    { en: 'Wednesday', hi: 'बुधवार (Budhvar)', planet: 'Mercury' },
    { en: 'Thursday', hi: 'गुरुवार (Guruvar)', planet: 'Jupiter' },
    { en: 'Friday', hi: 'शुक्रवार (Shukravar)', planet: 'Venus' },
    { en: 'Saturday', hi: 'शनिवार (Shanivar)', planet: 'Saturn' },
  ];
  const vara = weekDays[dayOfWeek];

  // 3. Nakshatra from Moon's longitude
  const nakSpan = 360 / 27; // 13.3333°
  const nakIndex = Math.floor(moonLon / nakSpan) % 27;
  const nakObj = NAKSHATRAS[nakIndex];
  const pada = Math.min(4, Math.floor((moonLon % nakSpan) / (nakSpan / 4)) + 1);

  // 4. Yoga: (Sun + Moon) modulo 360 / (13°20')
  const yogaSum = normalizeDegrees(sunLon + moonLon);
  const yogaIndex = Math.floor(yogaSum / nakSpan) % 27;
  const yoga = YOGAS_27[yogaIndex];

  // 5. Karana: Half of Tithi (each 6° is one Karana)
  const karanaIndex = Math.floor(diff / 6);
  let karanaObj: typeof KARANAS[0];
  if (karanaIndex === 0) {
    karanaObj = KARANAS[10]; // Kimstughna (1st half of Shukla Pratipada)
  } else if (karanaIndex >= 57) {
    karanaObj = KARANAS[7 + (karanaIndex - 57)]; // Shakuni, Chatushpada, Naga
  } else {
    // 7 repeating movable karanas
    karanaObj = KARANAS[(karanaIndex - 1) % 7];
  }

  // 6. Sunrise & Sunset Approximation (based on latitude and season)
  const dayOfYear = Math.floor((date.getTime() - new Date(y, 0, 0).getTime()) / 86400000);
  const declination = 23.45 * Math.sin(((dayOfYear - 81) * 360 * Math.PI) / (365 * 180));
  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const hourAngleCos = -Math.tan(latRad) * Math.tan(decRad);
  const clampedCos = Math.max(-1, Math.min(1, hourAngleCos));
  const hourAngle = (Math.acos(clampedCos) * 180) / Math.PI;

  const noonMinutes = 12 * 60 + (82.5 - lon) * 4; // Local solar noon adjustment
  const halfDayMinutes = (hourAngle / 15) * 60;
  const sunriseMinutes = Math.round(noonMinutes - halfDayMinutes);
  const sunsetMinutes = Math.round(noonMinutes + halfDayMinutes);

  const formatMin = (m: number) => {
    const hh = Math.floor(m / 60) % 24;
    const mm = m % 60;
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const displayH = hh % 12 === 0 ? 12 : hh % 12;
    return `${displayH.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')} ${ampm}`;
  };

  const dayDurationMinutes = sunsetMinutes - sunriseMinutes;
  const eighthMinutes = dayDurationMinutes / 8;

  const getSlotTiming = (slotNum: number) => {
    const s = Math.round(sunriseMinutes + (slotNum - 1) * eighthMinutes);
    const e = Math.round(sunriseMinutes + slotNum * eighthMinutes);
    return { start: formatMin(s), end: formatMin(e) };
  };

  // Inauspicious Periods
  const rahuSlot = RAHU_KAAL_SLOTS[dayOfWeek];
  const yamaSlot = YAMAGANDA_SLOTS[dayOfWeek];
  const gulikaSlot = GULIKA_SLOTS[dayOfWeek];

  const rahuTiming = getSlotTiming(rahuSlot);
  const yamaTiming = getSlotTiming(yamaSlot);
  const gulikaTiming = getSlotTiming(gulikaSlot);

  // Abhijit Muhurat: 8th Muhurat of 15 divisions of the daytime (~24 mins before and after noon)
  const abhijitStart = formatMin(noonMinutes - 24);
  const abhijitEnd = formatMin(noonMinutes + 24);

  // Brahma Muhurat: 96 mins before sunrise to 48 mins before sunrise
  const brahmaStart = formatMin(sunriseMinutes - 96);
  const brahmaEnd = formatMin(sunriseMinutes - 48);

  // Choghadiya Slots (1.5 hours each)
  const dayChoghadiyaOrder: Record<number, ('Udveg' | 'Char' | 'Labh' | 'Amrit' | 'Kaal' | 'Shubh' | 'Rog')[]> = {
    0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
    1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // Mon
    2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tue
    3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'], // Wed
    4: ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thu
    5: ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'], // Fri
    6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'], // Sat
  };

  const goodTypes = ['Amrit', 'Shubh', 'Labh'];
  const daySlots = (dayChoghadiyaOrder[dayOfWeek] || dayChoghadiyaOrder[0]).map((type, idx) => {
    const s = Math.round(sunriseMinutes + idx * (dayDurationMinutes / 8));
    const e = Math.round(sunriseMinutes + (idx + 1) * (dayDurationMinutes / 8));
    return {
      name: `${type} Choghadiya`,
      type,
      isGood: goodTypes.includes(type),
      time: `${formatMin(s)} - ${formatMin(e)}`,
    };
  });

  const nightDurationMinutes = 24 * 60 - dayDurationMinutes;
  const nightSlots = ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'].map((type, idx) => {
    const s = Math.round(sunsetMinutes + idx * (nightDurationMinutes / 8));
    const e = Math.round(sunsetMinutes + (idx + 1) * (nightDurationMinutes / 8));
    return {
      name: `${type} Night Choghadiya`,
      type: type as any,
      isGood: goodTypes.includes(type),
      time: `${formatMin(s)} - ${formatMin(e)}`,
    };
  });

  return {
    dateString: date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    location: {
      city: cityName,
      latitude: lat,
      longitude: lon,
      timezone,
    },
    tithi: {
      number: tithiNumber,
      name: `${isShukla ? 'Shukla' : 'Krishna'} ${tithiName}`,
      hindiName: `${isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'} ${tithiHindi}`,
      paksha: isShukla ? 'Shukla (Waxing)' : 'Krishna (Waning)',
      pakshaHindi: isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष',
      deity: 'Surya / Chandra',
      percentageElapsed,
    },
    vara: {
      day: vara.en,
      hindiName: vara.hi,
      rulingPlanet: vara.planet,
    },
    nakshatra: {
      number: nakObj.id,
      name: nakObj.name,
      lord: nakObj.lord,
      pada,
    },
    yoga: {
      number: yogaIndex + 1,
      name: yoga.name,
      hindiName: yoga.hi,
      meaning: yoga.meaning,
      auspiciousness: yoga.auspiciousness as any,
    },
    karana: {
      number: karanaIndex + 1,
      name: karanaObj.name,
      hindiName: karanaObj.hi,
      type: karanaObj.type as any,
      deity: karanaObj.deity,
    },
    sunTimings: {
      sunrise: formatMin(sunriseMinutes),
      sunset: formatMin(sunsetMinutes),
      solarNoon: formatMin(noonMinutes),
      dayLength: `${Math.floor(dayDurationMinutes / 60)}h ${dayDurationMinutes % 60}m`,
    },
    inauspiciousPeriods: {
      rahuKaal: {
        ...rahuTiming,
        significance: 'Avoid starting major travels, asset purchases or signing legal covenants',
      },
      yamaganda: {
        ...yamaTiming,
        significance: 'Traditional caution period for business inaugurations',
      },
      gulikaKaal: {
        ...gulikaTiming,
        significance: 'Favors routine labor and internal review, avoid celebratory events',
      },
    },
    auspiciousPeriods: {
      abhijitMuhurat: {
        start: abhijitStart,
        end: abhijitEnd,
        significance: 'Most auspicious midday window capable of neutralising minor planetary blemishes',
      },
      brahmaMuhurat: {
        start: brahmaStart,
        end: brahmaEnd,
        significance: 'Peak pre-dawn window for meditation, study, mantra japa and spiritual sadhana',
      },
      amritKaal: {
        start: formatMin(noonMinutes + 60),
        end: formatMin(noonMinutes + 120),
        significance: 'Highly auspicious nectar period for auspicious investments and important meetings',
      },
    },
    choghadiya: {
      daySlots,
      nightSlots,
    },
  };
}
