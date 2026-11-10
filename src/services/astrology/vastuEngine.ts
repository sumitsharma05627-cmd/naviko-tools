/**
 * NAVIKO 3.0 — Vastu Shastra Spatial Analysis Engine
 * 
 * Traditional Vedic Vastu Purusha Mandala principles:
 * - 8 Primary & Inter-cardinal Directions:
 *   North (Kuber), North-East / Ishanya (Shiva/Water), East (Indra/Sun),
 *   South-East / Agneya (Agni/Fire), South (Yama), South-West / Nairutya (Nirriti/Earth),
 *   West (Varuna/Air), North-West / Vayavya (Vayu/Movement), Center / Brahmasthan (Ether)
 * - Quantitative scoring for 10 primary functional areas:
 *   Main Entrance, Kitchen (Fire element), Master Bedroom (Stability/Earth),
 *   Pooja / Meditation Room (Purity/Ishanya), Bathroom / Toilet (Drainage),
 *   Living / Study Room, Staircase, Water Storage, Balconies, Septic Tank
 * - Non-destructive practical remedies (colors, elemental balancing, brass/copper rods, mirrors)
 */

export type VastuDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'Center';

export interface RoomPlacement {
  id: string;
  name: string;
  type: 'entrance' | 'kitchen' | 'master_bedroom' | 'pooja' | 'bathroom' | 'living' | 'study' | 'staircase' | 'water_tank' | 'balcony';
  direction: VastuDirection;
  notes?: string;
}

export interface VastuEvaluationItem {
  id: string;
  name: string;
  assignedDirection: VastuDirection;
  idealDirections: VastuDirection[];
  acceptableDirections: VastuDirection[];
  negativeDirections: VastuDirection[];
  score: number; // 0 to 10
  status: 'Ideal' | 'Good' | 'Neutral' | 'Challenging' | 'Major Defect';
  impactDescription: string;
  elementalConflict?: string;
  practicalRemedy: string;
}

export interface VastuAnalysisResult {
  overallScore: number; // 0 to 100
  grade: 'A+ (Exemplary)' | 'A (Favorable)' | 'B (Moderate)' | 'C (Defective, Needs Remedies)' | 'D (Significant Imbalance)';
  propertyType: 'home' | 'apartment' | 'office' | 'plot';
  facingDirection: VastuDirection;
  brahmasthanStatus: string;
  directionSummaries: Record<VastuDirection, { element: string; deity: string; balanceScore: number; currentUsage: string }>;
  evaluations: VastuEvaluationItem[];
  highPriorityRemedies: string[];
  positiveHighlights: string[];
}

export const DIRECTION_META: Record<VastuDirection, { name: string; hindi: string; element: string; deity: string; bestFor: string }> = {
  N: { name: 'North', hindi: 'उत्तर', element: 'Water (Jal)', deity: 'Kuber (Lord of Wealth)', bestFor: 'Living, Open Space, Financial safes, Balconies' },
  NE: { name: 'North-East (Ishanya)', hindi: 'ईशान कोण', element: 'Water & Ether', deity: 'Ishana (Lord Shiva)', bestFor: 'Pooja room, Meditation, Underground water tank, Clean open space' },
  E: { name: 'East', hindi: 'पूर्व', element: 'Fire & Light', deity: 'Indra & Surya', bestFor: 'Main entrance, Study, Living room, Large windows' },
  SE: { name: 'South-East (Agneya)', hindi: 'आग्नेय कोण', element: 'Fire (Agni)', deity: 'Agni Deva', bestFor: 'Kitchen (Gas stove facing East), Inverter, Electric meter' },
  S: { name: 'South', hindi: 'दक्षिण', element: 'Earth (Prithvi)', deity: 'Yama', bestFor: 'Bedrooms, Heavy furniture, Elevated flooring, Overhead tank' },
  SW: { name: 'South-West (Nairutya)', hindi: 'नैऋत्य कोण', element: 'Earth (Prithvi)', deity: 'Nirriti', bestFor: 'Master bedroom (Head South/West), Heavy storage, Safe' },
  W: { name: 'West', hindi: 'पश्चिम', element: 'Air & Water', deity: 'Varuna Deva', bestFor: 'Dining room, Study room, Overhead water storage, Children room' },
  NW: { name: 'North-West (Vayavya)', hindi: 'वायव्य कोण', element: 'Air (Vayu)', deity: 'Vayu Deva', bestFor: 'Guest bedroom, Finished goods storage, Garage, Restroom' },
  Center: { name: 'Center (Brahmasthan)', hindi: 'ब्रह्मस्थान', element: 'Space (Akash)', deity: 'Lord Brahma', bestFor: 'Completely open courtyard, Zero heavy pillars or toilets' },
};

// Rules matrix for each room type
const VASTU_RULES: Record<string, { ideal: VastuDirection[]; acceptable: VastuDirection[]; negative: VastuDirection[]; idealText: string; defectText: string; remedyText: string }> = {
  entrance: {
    ideal: ['NE', 'N', 'E'],
    acceptable: ['NW'],
    negative: ['SW', 'SE', 'S'],
    idealText: 'Excellently placed in the zone of cosmic abundance. Welcomes positive prana and financial opportunities.',
    defectText: 'Entrance in this direction can invite financial friction or relationship strain if unprotected.',
    remedyText: 'Install a brass/copper threshold strip, Swastik symbol at the entrance, and keep the foyer brightly illuminated with warm light.',
  },
  kitchen: {
    ideal: ['SE', 'NW'],
    acceptable: ['E'],
    negative: ['NE', 'SW', 'N'],
    idealText: 'Harmonious alignment with Agni Tattva (Fire element). Cultivates robust digestion, health and domestic vitality.',
    defectText: 'Fire element in water/earth zones creates elemental conflict, leading to unexpected health or metabolic stress.',
    remedyText: 'Place a natural green marble slab under the cooking burner and use warm earth-toned pastel colors on walls.',
  },
  master_bedroom: {
    ideal: ['SW', 'S'],
    acceptable: ['W'],
    negative: ['NE', 'SE'],
    idealText: 'Grounded firmly in the Earth zone. Promotes deep restorative sleep, stability, leadership authority, and calm.',
    defectText: 'Sleeping in active or fire zones causes restless sleep, hyperactive mind, or marital friction.',
    remedyText: 'Sleep with head directed South or West. Use grounding earthy terracotta or almond colors; remove mirrors facing the bed.',
  },
  pooja: {
    ideal: ['NE', 'E', 'N'],
    acceptable: ['Center'],
    negative: ['S', 'SW', 'SE'],
    idealText: 'Sacred Ishanya corner acts as the cosmic satellite receiver. Amplifies spiritual concentration, tranquility, and divine grace.',
    defectText: 'Pooja room in heavy or lower vibration zones reduces contemplative focus.',
    remedyText: 'Keep the sanctum elevated on a pure wooden or white marble platform. Use white or light yellow curtains and burn pure camphor daily.',
  },
  bathroom: {
    ideal: ['NW', 'W'],
    acceptable: ['E'],
    negative: ['NE', 'SW', 'Center'],
    idealText: 'Waste water drains efficiently through the zone of movement (Vayu), carrying away stagnant energies.',
    defectText: 'Toilet or drainage in North-East (Ishanya) or Brahmasthan severely blocks energetic flow and peace of mind.',
    remedyText: 'Keep the toilet door closed at all times. Place a bowl of unrefined sea salt in an earthen container, refreshed every 15 days.',
  },
  living: {
    ideal: ['N', 'E', 'NE'],
    acceptable: ['NW'],
    negative: ['SW'],
    idealText: 'Open, welcoming atmosphere that facilitates joyful family dialogues and social camaraderie.',
    defectText: 'Living area placement requires mindful layout to prevent scattered focus.',
    remedyText: 'Arrange seating so the family head faces North or East during discussions. Position television on Southeast wall.',
  },
  study: {
    ideal: ['E', 'N', 'NE'],
    acceptable: ['W'],
    negative: ['SW', 'SE'],
    idealText: 'Surya and Mercury energy zones sharpen memory retention, intellectual grasp and concentration.',
    defectText: 'Facing dull walls or inattentive zones encourages lethargy.',
    remedyText: 'Position desk so student faces East or North while studying. Keep a small brass Saraswati yantra or crystal pyramid on table.',
  },
  staircase: {
    ideal: ['S', 'SW', 'W'],
    acceptable: ['NW'],
    negative: ['NE', 'Center'],
    idealText: 'Heavy vertical mass situated in stabilizing zones provides natural anchorage to the structure.',
    defectText: 'Heavy staircase in North-East or Brahmasthan suppresses positive spiritual vibrations.',
    remedyText: 'Ensure clockwise ascent. Paint stairwell in warm beige or soft grey; keep area beneath stairs free of pooja or kitchen setups.',
  },
};

/**
 * Evaluates a set of room placements and provides quantitative Vastu score and structured report
 */
export function evaluateVastu(
  propertyType: VastuAnalysisResult['propertyType'],
  facing: VastuDirection,
  rooms: RoomPlacement[]
): VastuAnalysisResult {
  let totalScore = 0;
  const evaluations: VastuEvaluationItem[] = [];
  const highPriorityRemedies: string[] = [];
  const positiveHighlights: string[] = [];

  const directionScores: Record<VastuDirection, { total: number; count: number; rooms: string[] }> = {
    N: { total: 10, count: 1, rooms: [] },
    NE: { total: 10, count: 1, rooms: [] },
    E: { total: 10, count: 1, rooms: [] },
    SE: { total: 10, count: 1, rooms: [] },
    S: { total: 10, count: 1, rooms: [] },
    SW: { total: 10, count: 1, rooms: [] },
    W: { total: 10, count: 1, rooms: [] },
    NW: { total: 10, count: 1, rooms: [] },
    Center: { total: 10, count: 1, rooms: [] },
  };

  rooms.forEach((room) => {
    const rules = VASTU_RULES[room.type] || VASTU_RULES.living;
    const isIdeal = rules.ideal.includes(room.direction);
    const isAcceptable = rules.acceptable.includes(room.direction);
    const isNegative = rules.negative.includes(room.direction);

    let score = 5;
    let status: VastuEvaluationItem['status'] = 'Neutral';

    if (isIdeal) {
      score = 10;
      status = 'Ideal';
      positiveHighlights.push(`${room.name} is ideally placed in ${DIRECTION_META[room.direction].name}, maximizing ${DIRECTION_META[room.direction].element} harmony.`);
    } else if (isAcceptable) {
      score = 7.5;
      status = 'Good';
    } else if (isNegative) {
      score = room.direction === 'NE' || room.direction === 'Center' ? 2 : 3.5;
      status = score <= 2.5 ? 'Major Defect' : 'Challenging';
      highPriorityRemedies.push(`${room.name} in ${DIRECTION_META[room.direction].name}: ${rules.remedyText}`);
    }

    evaluations.push({
      id: room.id,
      name: room.name,
      assignedDirection: room.direction,
      idealDirections: rules.ideal,
      acceptableDirections: rules.acceptable,
      negativeDirections: rules.negative,
      score,
      status,
      impactDescription: isIdeal ? rules.idealText : rules.defectText,
      practicalRemedy: rules.remedyText,
    });

    totalScore += score;
    directionScores[room.direction].total += score;
    directionScores[room.direction].count += 1;
    directionScores[room.direction].rooms.push(room.name);
  });

  const maxPossible = Math.max(1, rooms.length * 10);
  const normalizedScore = Math.round((totalScore / maxPossible) * 100);

  let grade: VastuAnalysisResult['grade'] = 'B (Moderate)';
  if (normalizedScore >= 85) grade = 'A+ (Exemplary)';
  else if (normalizedScore >= 70) grade = 'A (Favorable)';
  else if (normalizedScore >= 55) grade = 'B (Moderate)';
  else if (normalizedScore >= 40) grade = 'C (Defective, Needs Remedies)';
  else grade = 'D (Significant Imbalance)';

  const directionSummaries = Object.entries(DIRECTION_META).reduce((acc, [dirKey, meta]) => {
    const key = dirKey as VastuDirection;
    const data = directionScores[key];
    const avg = Math.round((data.total / data.count) * 10);
    acc[key] = {
      element: meta.element,
      deity: meta.deity,
      balanceScore: Math.min(100, avg),
      currentUsage: data.rooms.length > 0 ? data.rooms.join(', ') : 'Unassigned / Open',
    };
    return acc;
  }, {} as VastuAnalysisResult['directionSummaries']);

  return {
    overallScore: normalizedScore,
    grade,
    propertyType,
    facingDirection: facing,
    brahmasthanStatus: directionScores.Center.rooms.length === 0
      ? 'Clean & Open (Ideal Brahmasthan status)'
      : `Occupied by: ${directionScores.Center.rooms.join(', ')}`,
    directionSummaries,
    evaluations,
    highPriorityRemedies,
    positiveHighlights,
  };
}
