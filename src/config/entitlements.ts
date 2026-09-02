import { PlanType } from './pricing';

export type AccessLevel = 'FREE' | 'FREE_LIMITED' | 'PLUS' | 'PRO';

export interface PlanCapabilities {
  aiDailyLimit: number;
  savedHistory: boolean;
  advancedAnalytics: boolean;
  advancedExports: boolean;
  customDashboard: boolean;
  batchProcessing: boolean;
  priorityFeatures: boolean;
  adExperience: 'standard' | 'reduced' | 'ad_free';
  maxFileSizeMb: number;
}

export const PLAN_CAPABILITIES: Record<PlanType, PlanCapabilities> = {
  free: {
    aiDailyLimit: 5,
    savedHistory: false,
    advancedAnalytics: false,
    advancedExports: false,
    customDashboard: false,
    batchProcessing: false,
    priorityFeatures: false,
    adExperience: 'standard',
    maxFileSizeMb: 10,
  },
  plus: {
    aiDailyLimit: 50,
    savedHistory: true,
    advancedAnalytics: true,
    advancedExports: true,
    customDashboard: true,
    batchProcessing: false,
    priorityFeatures: false,
    adExperience: 'reduced',
    maxFileSizeMb: 50,
  },
  pro: {
    aiDailyLimit: 200,
    savedHistory: true,
    advancedAnalytics: true,
    advancedExports: true,
    customDashboard: true,
    batchProcessing: true,
    priorityFeatures: true,
    adExperience: 'ad_free',
    maxFileSizeMb: 200,
  },
  trial: {
    aiDailyLimit: 200,
    savedHistory: true,
    advancedAnalytics: true,
    advancedExports: true,
    customDashboard: true,
    batchProcessing: true,
    priorityFeatures: true,
    adExperience: 'ad_free',
    maxFileSizeMb: 200,
  },
};

export interface ToolEntitlement {
  toolId: string;
  name: string;
  category: string;
  accessLevel: AccessLevel;
  freeDailyLimit?: number;
  plusDailyLimit?: number;
  proDailyLimit?: number;
  description: string;
  requiredTier?: 'plus' | 'pro';
  premiumFeatureSummary?: string;
}

export interface FeatureEntitlement {
  featureId: string;
  name: string;
  accessLevel: AccessLevel;
  requiredTier: 'plus' | 'pro';
  description: string;
  category: string;
}

/**
 * Centralized Entitlement Definitions for NAVIKO tools
 * Free users have full access to core calculators and utilities.
 * Tools with processing or heavy server/AI computations have generous daily quotas based on tier.
 */
export const TOOL_ENTITLEMENTS: Record<string, ToolEntitlement> = {
  // Free Core Tools
  'bmi-calculator': {
    toolId: 'bmi-calculator',
    name: 'BMI & Body Metrics',
    category: 'health',
    accessLevel: 'FREE',
    description: 'Calculate BMI with pediatric growth education and healthy weight ranges.',
  },
  'nutrition-science': {
    toolId: 'nutrition-science',
    name: 'Nutrition Science',
    category: 'health',
    accessLevel: 'FREE',
    description: 'Explore nutrients, food compositions, and construct balanced meal plates.',
  },
  'sip-calculator': {
    toolId: 'sip-calculator',
    name: 'SIP Calculator',
    category: 'finance',
    accessLevel: 'FREE',
    description: 'Calculate systematic investment plan compounding wealth.',
  },
  'emi-calculator': {
    toolId: 'emi-calculator',
    name: 'EMI Loan Calculator',
    category: 'finance',
    accessLevel: 'FREE',
    description: 'Calculate home, car and personal loan monthly installments.',
  },
  'budget-calculator': {
    toolId: 'budget-calculator',
    name: '50/30/20 Budget Planner',
    category: 'finance',
    accessLevel: 'FREE',
    description: 'Plan monthly expenses and emergency savings allocations.',
  },
  'debt-clock': {
    toolId: 'debt-clock',
    name: 'India Sovereign Debt Clock',
    category: 'finance',
    accessLevel: 'FREE',
    description: 'Live real-time national debt clock and citizen liability metrics.',
  },
  'cgpa-calculator': {
    toolId: 'cgpa-calculator',
    name: 'CGPA to Percentage Calculator',
    category: 'student',
    accessLevel: 'FREE',
    description: 'Convert CBSE and university CGPA to percentage marks.',
  },
  'attendance-calculator': {
    toolId: 'attendance-calculator',
    name: '75% Attendance Planner',
    category: 'student',
    accessLevel: 'FREE',
    description: 'Calculate how many classes you can skip or need to attend.',
  },
  'study-timetable-generator': {
    toolId: 'study-timetable-generator',
    name: 'Smart Study Timetable',
    category: 'student',
    accessLevel: 'FREE',
    description: 'Generate customized daily revision timetables with breaks.',
  },

  // Free with Tiered Limits Tools (Heavy processing, AI, or advanced analysis)
  'mock-test-analyzer': {
    toolId: 'mock-test-analyzer',
    name: 'Mock Test Score Analyzer',
    category: 'student',
    accessLevel: 'FREE_LIMITED',
    freeDailyLimit: 5,
    plusDailyLimit: 50,
    proDailyLimit: 200,
    description: 'Analyze NEET/JEE test scores, negative markings, and calculate projected rank.',
    premiumFeatureSummary: 'Includes persistent score history, long-term trend charts, and PDF report export.',
  },
  'background-remover': {
    toolId: 'background-remover',
    name: 'AI Background Remover',
    category: 'image',
    accessLevel: 'FREE_LIMITED',
    freeDailyLimit: 5,
    plusDailyLimit: 50,
    proDailyLimit: 200,
    description: 'Client-side automatic image cutout and transparent background exporter.',
  },
  'pdf-compressor': {
    toolId: 'pdf-compressor',
    name: 'PDF Compressor',
    category: 'pdf',
    accessLevel: 'FREE_LIMITED',
    freeDailyLimit: 8,
    plusDailyLimit: 50,
    proDailyLimit: 200,
    description: 'Compress PDF file size without severe quality loss.',
  },
  'image-compressor': {
    toolId: 'image-compressor',
    name: 'Image Compressor (KB)',
    category: 'image',
    accessLevel: 'FREE_LIMITED',
    freeDailyLimit: 10,
    plusDailyLimit: 50,
    proDailyLimit: 200,
    description: 'Compress JPG and PNG images down to target KB size.',
  },
  'resume-builder': {
    toolId: 'resume-builder',
    name: 'ATS Resume Builder',
    category: 'career',
    accessLevel: 'FREE_LIMITED',
    freeDailyLimit: 3,
    plusDailyLimit: 25,
    proDailyLimit: 100,
    description: 'Build single-page professional resumes with print export.',
  },
};

/**
 * Granular Feature Entitlements
 */
export const FEATURE_ENTITLEMENTS: Record<string, FeatureEntitlement> = {
  // Nutrition Science Plus & Pro Features
  'nutrition.savedMealPlans': {
    featureId: 'nutrition.savedMealPlans',
    name: 'Saved Custom Meal Plates',
    category: 'health',
    accessLevel: 'PLUS',
    requiredTier: 'plus',
    description: 'Save custom balanced meal combinations to your private library.',
  },
  'nutrition.weeklyPlanner': {
    featureId: 'nutrition.weeklyPlanner',
    name: 'Weekly 7-Day Meal Planner',
    category: 'health',
    accessLevel: 'PLUS',
    requiredTier: 'plus',
    description: 'Plan daily breakfast, lunch, dinner and snacks with macro balancing for the week.',
  },
  'nutrition.groceryList': {
    featureId: 'nutrition.groceryList',
    name: 'Smart Grocery List Generator',
    category: 'health',
    accessLevel: 'PLUS',
    requiredTier: 'plus',
    description: 'Generate and copy organized shopping ingredient lists from your weekly meal plan.',
  },
  'nutrition.advancedCompare': {
    featureId: 'nutrition.advancedCompare',
    name: '3-Way Deep Food Comparison',
    category: 'health',
    accessLevel: 'PLUS',
    requiredTier: 'plus',
    description: 'Compare 3 foods at once with micronutrient and macro ratio breakdowns.',
  },

  // Student Productivity Features
  'student.mockTestHistory': {
    featureId: 'student.mockTestHistory',
    name: 'Saved Mock Test History & Trend Graph',
    category: 'student',
    accessLevel: 'PLUS',
    requiredTier: 'plus',
    description: 'Save multiple mock test results and track score progression over time.',
  },
  'student.rankProjection': {
    featureId: 'student.rankProjection',
    name: 'Predictive Rank & Target Score Calculator',
    category: 'student',
    accessLevel: 'PLUS',
    requiredTier: 'plus',
    description: 'Estimate percentile and expected all-India ranks based on historical cutoffs.',
  },
  'student.exportReport': {
    featureId: 'student.exportReport',
    name: 'Detailed Study Report PDF / JSON Export',
    category: 'student',
    accessLevel: 'PLUS',
    requiredTier: 'plus',
    description: 'Export printable performance diagnosis reports for tutors and self-review.',
  },

  // Pro Specific Capabilities
  'platform.batchProcessing': {
    featureId: 'platform.batchProcessing',
    name: 'Batch Document & Image Processing',
    category: 'productivity',
    accessLevel: 'PRO',
    requiredTier: 'pro',
    description: 'Process 20+ PDF documents or images concurrently in batch mode.',
  },
  'platform.priorityAccess': {
    featureId: 'platform.priorityAccess',
    name: 'Priority Beta Access to New AI Tools',
    category: 'experience',
    accessLevel: 'PRO',
    requiredTier: 'pro',
    description: 'Get first-look priority access to newly developed NAVIKO tools.',
  },

  // Productivity & Platform Features
  'platform.savedWorkspace': {
    featureId: 'platform.savedWorkspace',
    name: 'Persistent Tool Workspace History',
    category: 'productivity',
    accessLevel: 'PLUS',
    requiredTier: 'plus',
    description: 'Keep your inputs and results saved automatically across sessions.',
  },
  'platform.customDashboard': {
    featureId: 'platform.customDashboard',
    name: 'Personalized Quick-Access Dashboard',
    category: 'productivity',
    accessLevel: 'PLUS',
    requiredTier: 'plus',
    description: 'Pin your favorite tools, view recent activity, and track daily goals.',
  },
  'platform.adFreeExperience': {
    featureId: 'platform.adFreeExperience',
    name: 'Ad-Free Distractionless Mode',
    category: 'experience',
    accessLevel: 'PRO',
    requiredTier: 'pro',
    description: 'Enjoy a clean interface with all promotional advertisements completely suppressed.',
  },
};

