import { AssistantIntent, AssistantToolEntry, ExtractedEntities } from './types';
import { NAVIKO_TOOLS_REGISTRY } from './toolRegistry';

/**
 * Layer 3 — Common typo dictionary for rapid phonetic and character-swap correction
 */
const SPELLING_CORRECTIONS: Record<string, string> = {
  calclate: 'calculate',
  calculat: 'calculate',
  calclutor: 'calculator',
  calculater: 'calculator',
  calcutor: 'calculator',
  resum: 'resume',
  resme: 'resume',
  cvv: 'cv',
  comprse: 'compress',
  compres: 'compress',
  comprss: 'compress',
  redce: 'reduce',
  pln: 'plan',
  paln: 'plan',
  emii: 'emi',
  em: 'emi',
  laon: 'loan',
  lone: 'loan',
  attendence: 'attendance',
  attandance: 'attendance',
  atendance: 'attendance',
  cgpaa: 'cgpa',
  syllubus: 'syllabus',
  syllbus: 'syllabus',
  backloag: 'backlog',
  baklog: 'backlog',
  discont: 'discount',
  discunt: 'discount',
  bckground: 'background',
  bg: 'background',
  scintific: 'scientific',
  prcent: 'percent',
  precentage: 'percentage',
  prcnt: 'percent',
  timetbl: 'timetable',
  nutriton: 'nutrition',
  premum: 'premium',
  interst: 'interest',
  intrest: 'interest',
  tenur: 'tenure',
  mony: 'money',
  manag: 'manage',
};

/**
 * Layer 4 — Hinglish normalization rules
 */
const HINGLISH_RULES: Array<{ regex: RegExp; replaceWith: string }> = [
  // Conversational questions
  { regex: /meri\s+sip\s+(?:(\d+[\d,.]*(?:\s*k|\s*lakh|\s*lac)?)\s*ki\s*)?(\d+)\s*(?:saal|sal)\s*me\s*kitni\s*hogi/gi, replaceWith: 'calculate sip $1 for $2 years' },
  { regex: /meri\s+sip\s+kitni\s+grow\s+hogi/gi, replaceWith: 'calculate sip growth' },
  { regex: /loan\s+ki\s+emi\s+calculate\s+karo/gi, replaceWith: 'calculate loan emi' },
  { regex: /resume\s+banana\s+hai/gi, replaceWith: 'make resume' },
  { regex: /resume\s+ke\s+liye\s+help/gi, replaceWith: 'make resume' },
  { regex: /pdf\s+ka\s+size\s+kam\s+karna\s+hai/gi, replaceWith: 'compress pdf' },
  { regex: /tax\s+kitna\s+lagega/gi, replaceWith: 'salary tax calculator' },
  { regex: /mera\s+bmi\s+kitna\s+hai/gi, replaceWith: 'bmi calculate' },
  { regex: /attendance\s+calculate\s+karo/gi, replaceWith: 'attendance calculator' },
  { regex: /kitni\s+class\s+bunk\s+kar\s+sakte\s+hain/gi, replaceWith: 'bunk attendance calculator' },
  { regex: /padhai\s+ka\s+plan/gi, replaceWith: 'study plan' },
  { regex: /time\s+table\s+banao/gi, replaceWith: 'study timetable' },
  { regex: /backlog\s+clear\s+kaise\s+kare/gi, replaceWith: 'backlog recovery planner' },
  { regex: /syllabus\s+complete\s+hoga\s+kya/gi, replaceWith: 'can i finish my syllabus' },
  { regex: /photo\s+crop\s+karna\s+hai/gi, replaceWith: 'image cropper' },
  { regex: /background\s+hatana\s+hai/gi, replaceWith: 'background remover' },
  // Unit terms in Hinglish
  { regex: /\b(\d+(?:\.\d+)?)\s*(?:saal|sal)\b/gi, replaceWith: '$1 years' },
  { regex: /\b(\d+(?:\.\d+)?)\s*(?:mahine|mahina)\b/gi, replaceWith: '$1 months' },
  { regex: /\b(?:har|per|prati)\s*(?:mahina|mahine)\b/gi, replaceWith: 'monthly' },
  { regex: /\b(?:har|per|prati)\s*(?:saal|sal)\b/gi, replaceWith: 'yearly' },
];

/**
 * Normalizes user queries by running Hinglish mapping, cleaning, and typo correction
 */
export function normalizeQuery(raw: string): { normalized: string; tokens: string[] } {
  let cleaned = raw.toLowerCase().trim();

  // Apply Hinglish replacements
  for (const { regex, replaceWith } of HINGLISH_RULES) {
    cleaned = cleaned.replace(regex, replaceWith);
  }

  // Remove common punctuation except %, ., and numbers
  cleaned = cleaned.replace(/[?¿!¡,;:(){}\[\]"']/g, ' ');

  // Split into tokens
  const words = cleaned.split(/\s+/).filter(Boolean);

  // Apply typo correction
  const correctedWords = words.map((w) => SPELLING_CORRECTIONS[w] || w);
  const normalized = correctedWords.join(' ');

  return { normalized, tokens: correctedWords };
}

/**
 * Layer 2 — Robust Parameter Extraction
 * Extracts amounts (₹5,000, 5000, 5k, 5 lakh, 20 lakh loan),
 * interest rates (12%, 7.5% interest, at 8%),
 * tenure (10 years, 5 year tenure, 15 yrs, 24 months),
 * and contextual adjustments ("make it 15 years", "what if I invest 7000", "change it to 8%")
 */
export function extractEntities(query: string, activeToolId?: string): ExtractedEntities {
  const q = query.toLowerCase();
  const entities: ExtractedEntities = {};

  // 1. Tenure extraction (Check first so "10 years" is not confused with amounts)
  // Support: "10 years", "10 yr", "10 yrs", "10 saal", "5 year tenure", "make it 15 years"
  const yearMatch =
    q.match(/(?:make\s+it\s+|for\s+|tenure\s+of\s+|duration\s+of\s+)?(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr|saal|sal)\b/i) ||
    q.match(/(\d+(?:\.\d+)?)\s*(?:year|yr)\s+tenure\b/i);

  if (yearMatch) {
    entities.tenureYears = parseFloat(yearMatch[1]);
  }

  const monthMatch = q.match(/(\d+)\s*(?:months?|mths?|mahine|mahina)\b/i);
  if (monthMatch && !entities.tenureYears) {
    entities.tenureYears = parseFloat((parseInt(monthMatch[1], 10) / 12).toFixed(2));
  }

  // 2. Interest / Percentage rate extraction
  // Support: "12%", "12 percent", "12 prcnt", "7.5% interest", "change it to 8%", "at 9%"
  const rateMatch =
    q.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|prcnt)/i) ||
    q.match(/(?:at|with|rate\s+of|change\s+(?:it\s+)?to|interest\s+(?:of|rate\s+of)?)\s*(\d+(?:\.\d+)?)\s*(?:%|percent|prcnt)?/i);

  if (rateMatch) {
    const parsedRate = parseFloat(rateMatch[1]);
    // Safety check: rate is usually <= 100
    if (parsedRate > 0 && parsedRate <= 100) {
      entities.rate = parsedRate;
    }
  }

  // 3. Frequency extraction (monthly vs yearly)
  if (q.includes('monthly') || q.includes('per month') || q.includes('p.m.') || q.includes('/mo') || q.includes('/month')) {
    entities.frequency = 'monthly';
  } else if (q.includes('yearly') || q.includes('annually') || q.includes('per year') || q.includes('p.a.') || q.includes('/yr')) {
    entities.frequency = 'yearly';
  }

  // 4. Amount extraction
  // Lakhs / Crores: "5 lakh", "5 lac", "20 lakh loan", "make the loan 10 lakh", "₹5 lakh"
  const lakhMatch =
    q.match(/(?:make\s+(?:the\s+)?loan\s+)?(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|lac|l)\b/i) ||
    q.match(/(?:loan|invest|sip)\s+(?:of\s+)?(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|lac|l)\b/i);

  if (lakhMatch) {
    entities.amount = parseFloat(lakhMatch[1]) * 100000;
  }

  // Crores
  const croreMatch = q.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/i);
  if (croreMatch && !entities.amount) {
    entities.amount = parseFloat(croreMatch[1]) * 10000000;
  }

  // Thousands: "5k", "10k"
  const kMatch = q.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch && !entities.amount) {
    entities.amount = parseFloat(kMatch[1]) * 1000;
  }

  // Contextual modifications: "what if I invest 7000", "what if 7000", "invest 7000", "sip 5000"
  const investMatch = q.match(/(?:what\s+if\s+(?:i\s+)?invest\s+|invest\s+|sip\s+(?:of\s+)?|deposit\s+)(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i);
  if (investMatch && !entities.amount) {
    const rawVal = investMatch[1].replace(/,/g, '');
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed) && parsed > 0) {
      entities.amount = parsed;
    }
  }

  // Currency symbols: "₹5,000", "rs. 5000", "$5000"
  const directCurrencyMatch = q.match(/(?:₹|rs\.?|inr|\$)\s*(\d[\d,]*)/i);
  if (directCurrencyMatch && !entities.amount) {
    const rawVal = directCurrencyMatch[1].replace(/,/g, '');
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed) && parsed > 0) {
      entities.amount = parsed;
    }
  }

  // Plain numbers in sentence, e.g. "5000 for 10 years at 12%"
  if (!entities.amount) {
    // Look for numbers not preceded or followed by years/months/percent
    const standaloneMatch = q.match(/\b(\d{3,9})\b/);
    if (standaloneMatch) {
      const val = parseFloat(standaloneMatch[1]);
      // Avoid interpreting year (e.g. 2024) or small tenures as amount unless in appropriate range
      if (val >= 100) {
        entities.amount = val;
      }
    }
  }

  // If query is pure standalone number (e.g. user just answered "5000")
  if (!entities.amount) {
    const pureNum = q.match(/^\s*(\d[\d,.]*)\s*$/);
    if (pureNum) {
      const val = parseFloat(pureNum[1].replace(/,/g, ''));
      if (!isNaN(val)) {
        entities.amount = val;
      }
    }
  }

  // 5. CGPA (e.g. "8.4 cgpa", "cgpa 9.0", "cgpa of 8.2")
  const cgpaMatch =
    q.match(/(?:cgpa|gpa)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)/i) ||
    q.match(/(\d+(?:\.\d+)?)\s*(?:cgpa|gpa)/i);

  if (cgpaMatch) {
    const val = parseFloat(cgpaMatch[1]);
    if (val >= 0 && val <= 10) {
      entities.cgpa = val;
    }
  }

  // 6. Attendance ratios (e.g. "34 out of 45", "30/40")
  const attMatch = q.match(/(?:attended|attendance)?\s*(\d+)\s*(?:out\s+of|\/)\s*(\d+)/i);
  if (attMatch) {
    entities.attendedClasses = parseInt(attMatch[1], 10);
    entities.totalClasses = parseInt(attMatch[2], 10);
  }

  // 7. BMI Height and Weight (e.g. "70 kg 175 cm", "height 170 weight 65")
  const weightMatch =
    q.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilos)/i) ||
    q.match(/weight\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)/i);

  if (weightMatch) {
    entities.weightKg = parseFloat(weightMatch[1]);
  }

  const heightMatch =
    q.match(/(\d+(?:\.\d+)?)\s*(?:cm|cms|centimeters)/i) ||
    q.match(/height\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)/i);

  if (heightMatch) {
    entities.heightCm = parseFloat(heightMatch[1]);
  }

  // 8. GST rate (e.g. "18% gst", "gst 18%")
  const gstMatch = q.match(/(\d+(?:\.\d+)?)%\s*gst/i) || q.match(/gst\s*(\d+(?:\.\d+)?)%/i);
  if (gstMatch) {
    entities.gstRate = parseFloat(gstMatch[1]);
  }

  // 9. Discount percentage (e.g. "20% off", "25% discount")
  const discMatch = q.match(/(\d+(?:\.\d+)?)%\s*(?:off|discount)/i);
  if (discMatch) {
    entities.discountPct = parseFloat(discMatch[1]);
  }

  return entities;
}

/**
 * Layer 6 — Tool Capability Matching & Ranking
 * Scores all tools in the registry and returns sorted relevant tools
 */
export function rankToolsForQuery(
  normalizedQuery: string,
  tokens: string[],
  categoryFilter?: string
): Array<{ tool: AssistantToolEntry; score: number }> {
  const scoredList: Array<{ tool: AssistantToolEntry; score: number }> = [];

  for (const tool of NAVIKO_TOOLS_REGISTRY) {
    if (categoryFilter && tool.category !== categoryFilter) {
      continue;
    }

    let score = 0;

    // Exact synonym match (Highest Priority)
    for (const syn of tool.synonyms) {
      if (normalizedQuery === syn) {
        score += 120;
        break;
      }
      if (normalizedQuery.includes(syn)) {
        score += 45;
      }
    }

    // Exact tool name match
    const toolNameLower = tool.name.toLowerCase();
    if (normalizedQuery.includes(toolNameLower)) {
      score += 60;
    }

    // Supported use cases
    for (const uc of tool.supportedUseCases) {
      if (normalizedQuery.includes(uc.toLowerCase())) {
        score += 35;
      }
    }

    // Keyword & Token matching
    for (const kw of tool.keywords) {
      if (normalizedQuery.includes(kw)) {
        score += 15;
      }
      for (const tok of tokens) {
        if (tok === kw) {
          score += 12;
        }
      }
    }

    if (score > 0) {
      scoredList.push({ tool, score });
    }
  }

  return scoredList.sort((a, b) => b.score - a.score);
}

/**
 * Helper to match single best tool
 */
export function matchBestTool(normalizedQuery: string, tokens: string[]): {
  tool: AssistantToolEntry | null;
  score: number;
} {
  const ranked = rankToolsForQuery(normalizedQuery, tokens);
  if (ranked.length > 0) {
    return { tool: ranked[0].tool, score: ranked[0].score };
  }
  return { tool: null, score: 0 };
}

/**
 * Checks if query is a contextual update or modifier to an ongoing session
 */
function isContextualCorrection(q: string): boolean {
  return (
    /^(?:make\s+it|what\s+if|change\s+it|change\s+to|show\s+me|compare|now|also|for)\b/i.test(q) ||
    /^(?:\d+[\d,.]*|\d+\s*(?:years?|yrs?|yr|saal|months?|%)|\d+\s*lakh)\s*$/i.test(q) ||
    q.includes('what if i invest') ||
    q.includes('make the loan') ||
    q.includes('show me the monthly emi') ||
    q.includes('compare both')
  );
}

/**
 * 7-Layer Intelligent Decision System & Intent Classifier
 */
export function classifyIntent(
  rawQuery: string,
  lastIntent?: AssistantIntent,
  lastToolId?: string
): {
  intent: AssistantIntent;
  confidence: number;
  matchedTool: AssistantToolEntry | null;
  rankedTools: AssistantToolEntry[];
  entities: ExtractedEntities;
} {
  const { normalized, tokens } = normalizeQuery(rawQuery);
  const entities = extractEntities(normalized, lastToolId);

  // Layer 1 — Exact greetings & casual affirmations
  if (/^(hi|hello|hey|namaste|good morning|good evening|good afternoon|sup|yo|greetings)\b/i.test(normalized)) {
    return { intent: 'GENERAL_QUESTION', confidence: 0.98, matchedTool: null, rankedTools: [], entities };
  }

  if (/^(thank|thanks|thank you|dhanyawad|shukriya|great|awesome|perfect|super)\b/i.test(normalized)) {
    return { intent: 'GENERAL_QUESTION', confidence: 0.98, matchedTool: null, rankedTools: [], entities };
  }

  // Layer 5 — Context-Aware Matching (Follow-ups & Corrections)
  // e.g. "make it 15 years", "what if I invest 7000", "change it to 8%", "make the loan 10 lakh", "5000"
  if (lastIntent && lastIntent !== 'UNKNOWN' && isContextualCorrection(normalized)) {
    const activeTool = lastToolId ? NAVIKO_TOOLS_REGISTRY.find((t) => t.id === lastToolId) || null : null;
    return {
      intent: lastIntent,
      confidence: 0.92,
      matchedTool: activeTool,
      rankedTools: activeTool ? [activeTool] : [],
      entities,
    };
  }

  // Layer 6 — General Money Management / Broad Query Tool Recommendation
  // User asks: "help me manage my money", "I want to manage my money", "how to manage money"
  if (
    normalized.includes('manage my money') ||
    normalized.includes('manage money') ||
    normalized.includes('money management') ||
    normalized.includes('financial planning')
  ) {
    const moneyTools = NAVIKO_TOOLS_REGISTRY.filter((t) =>
      ['sip-calculator', 'emi-calculator', 'salary-calculator', 'budget-calculator'].includes(t.id)
    );
    return {
      intent: 'FINANCE',
      confidence: 0.94,
      matchedTool: moneyTools[0] || null,
      rankedTools: moneyTools,
      entities,
    };
  }

  // Layer 1/2 — Tool Discovery / "What tools do you have" / Directory
  if (
    normalized.includes('what tools do you have') ||
    normalized.includes('list of tools') ||
    normalized.includes('all tools') ||
    normalized.includes('show all tools') ||
    normalized.includes('which tool') ||
    normalized.includes('what can you do') ||
    normalized.includes('suggest a tool') ||
    normalized === 'tools' ||
    normalized === 'help' ||
    normalized.includes('show me tools')
  ) {
    return {
      intent: 'TOOL_DISCOVERY',
      confidence: 0.95,
      matchedTool: null,
      rankedTools: NAVIKO_TOOLS_REGISTRY.slice(0, 6),
      entities,
    };
  }

  // Layer 1/2 — Premium & Pricing
  if (
    normalized.includes('premium') ||
    normalized.includes('pricing') ||
    normalized.includes('subscription') ||
    normalized.includes('pro plan') ||
    normalized.includes('plus plan') ||
    normalized.includes('trial') ||
    normalized.includes('₹1') ||
    normalized.includes('upgrade')
  ) {
    return { intent: 'PREMIUM', confidence: 0.95, matchedTool: null, rankedTools: [], entities };
  }

  // Layer 1/2 — Account & Profile
  if (
    normalized.includes('login') ||
    normalized.includes('signup') ||
    normalized.includes('sign up') ||
    normalized.includes('profile') ||
    normalized.includes('logout') ||
    normalized.includes('password') ||
    normalized.includes('my account')
  ) {
    return { intent: 'ACCOUNT', confidence: 0.95, matchedTool: null, rankedTools: [], entities };
  }

  // Layer 6 — Ranked tool capability matching
  const rankedMatches = rankToolsForQuery(normalized, tokens);
  const bestMatch = rankedMatches.length > 0 ? rankedMatches[0] : null;

  // Specific Domain: Resume
  if (
    normalized.includes('resume') ||
    normalized.includes('cv') ||
    normalized.includes('make resume') ||
    normalized.includes('ats resume') ||
    normalized.includes('resum')
  ) {
    const resumeTool = NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'resume-builder') || bestMatch?.tool || null;
    return {
      intent: 'RESUME',
      confidence: 0.96,
      matchedTool: resumeTool,
      rankedTools: resumeTool ? [resumeTool] : [],
      entities,
    };
  }

  // Specific Domain: PDF
  if (
    normalized.includes('pdf') ||
    (normalized.includes('compress') && normalized.includes('pdf')) ||
    (normalized.includes('merge') && normalized.includes('pdf')) ||
    (normalized.includes('split') && normalized.includes('pdf'))
  ) {
    const pdfTools = NAVIKO_TOOLS_REGISTRY.filter((t) => t.category === 'pdf');
    let target = bestMatch?.tool;
    if (!target || target.category !== 'pdf') {
      if (normalized.includes('compress') || normalized.includes('size') || normalized.includes('kam')) {
        target = NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'pdf-compressor') || null;
      } else if (normalized.includes('merge') || normalized.includes('combine')) {
        target = NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'pdf-merge') || null;
      } else {
        target = pdfTools[0] || null;
      }
    }
    return {
      intent: 'PDF',
      confidence: 0.94,
      matchedTool: target,
      rankedTools: pdfTools,
      entities,
    };
  }

  // Specific Domain: Finance (SIP, EMI, Loan, Tax, Salary, GST, FD, CAGR)
  if (
    normalized.includes('sip') ||
    normalized.includes('emi') ||
    normalized.includes('loan') ||
    normalized.includes('tax') ||
    normalized.includes('salary') ||
    normalized.includes('gst') ||
    normalized.includes('fd') ||
    normalized.includes('cagr') ||
    normalized.includes('fire') ||
    normalized.includes('debt') ||
    normalized.includes('budget') ||
    normalized.includes('interest') ||
    normalized.includes('finance') ||
    normalized.includes('financial')
  ) {
    let financeTarget = bestMatch?.tool;
    if (!financeTarget || financeTarget.category !== 'finance') {
      if (normalized.includes('sip')) {
        financeTarget = NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'sip-calculator') || null;
      } else if (normalized.includes('emi') || normalized.includes('loan')) {
        financeTarget = NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'emi-calculator') || null;
      } else if (normalized.includes('tax') || normalized.includes('salary')) {
        financeTarget = NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'salary-calculator') || null;
      } else if (normalized.includes('gst')) {
        financeTarget = NAVIKO_TOOLS_REGISTRY.find((t) => t.id === 'gst-calculator') || null;
      }
    }
    const financeRanked = rankedMatches.filter((m) => m.tool.category === 'finance').map((m) => m.tool);
    return {
      intent: 'FINANCE',
      confidence: 0.95,
      matchedTool: financeTarget,
      rankedTools: financeRanked.length > 0 ? financeRanked : (financeTarget ? [financeTarget] : []),
      entities,
    };
  }

  // Specific Domain: Student Tools
  if (
    normalized.includes('attendance') ||
    normalized.includes('bunk') ||
    normalized.includes('cgpa') ||
    normalized.includes('gpa') ||
    normalized.includes('study plan') ||
    normalized.includes('backlog') ||
    normalized.includes('syllabus') ||
    normalized.includes('student')
  ) {
    const studentTools = NAVIKO_TOOLS_REGISTRY.filter((t) => t.category === 'student');
    return {
      intent: 'STUDENT',
      confidence: 0.94,
      matchedTool: bestMatch?.tool || studentTools[0] || null,
      rankedTools: studentTools,
      entities,
    };
  }

  // Specific Domain: Image Tools
  if (
    normalized.includes('image') ||
    normalized.includes('photo') ||
    normalized.includes('crop') ||
    normalized.includes('background remover') ||
    normalized.includes('remove background')
  ) {
    const imageTools = NAVIKO_TOOLS_REGISTRY.filter((t) => t.category === 'image');
    return {
      intent: 'IMAGE_TOOLS',
      confidence: 0.92,
      matchedTool: bestMatch?.tool || imageTools[0] || null,
      rankedTools: imageTools,
      entities,
    };
  }

  // Specific Domain: Health & General Calculators
  if (
    normalized.includes('bmi') ||
    normalized.includes('diet') ||
    normalized.includes('nutrition') ||
    normalized.includes('calculator') ||
    normalized.includes('percentage') ||
    normalized.includes('discount') ||
    normalized.includes('scientific')
  ) {
    return {
      intent: 'CALCULATORS',
      confidence: 0.92,
      matchedTool: bestMatch?.tool || null,
      rankedTools: rankedMatches.map((m) => m.tool).slice(0, 4),
      entities,
    };
  }

  // High-confidence tool score fallback
  if (bestMatch && bestMatch.score >= 25) {
    let fallbackIntent: AssistantIntent = 'TOOL_DISCOVERY';
    if (bestMatch.tool.category === 'finance') fallbackIntent = 'FINANCE';
    else if (bestMatch.tool.category === 'student') fallbackIntent = 'STUDENT';
    else if (bestMatch.tool.category === 'pdf') fallbackIntent = 'PDF';
    else if (bestMatch.tool.category === 'image') fallbackIntent = 'IMAGE_TOOLS';
    else if (bestMatch.tool.category === 'career') fallbackIntent = 'RESUME';
    else if (bestMatch.tool.category === 'calculators') fallbackIntent = 'CALCULATORS';

    return {
      intent: fallbackIntent,
      confidence: Math.min(0.9, parseFloat((bestMatch.score / 100).toFixed(2))),
      matchedTool: bestMatch.tool,
      rankedTools: rankedMatches.slice(0, 4).map((m) => m.tool),
      entities,
    };
  }

  // Layer 7 — Smart Unknown Handling (confidence < 0.40)
  return {
    intent: 'UNKNOWN',
    confidence: 0.25,
    matchedTool: null,
    rankedTools: [],
    entities,
  };
}
