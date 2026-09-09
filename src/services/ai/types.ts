/**
 * NAVIKO Local AI Assistant Types
 * 100% Client-Side Local Intelligence & Feedback Architecture
 */

export type AssistantIntent =
  | 'AI_TOOLS'
  | 'FINANCE'
  | 'CALCULATORS'
  | 'STUDENT'
  | 'PDF'
  | 'PRODUCTIVITY'
  | 'RESUME'
  | 'IMAGE_TOOLS'
  | 'PREMIUM'
  | 'ACCOUNT'
  | 'GENERAL_NAVIKO'
  | 'GENERAL_QUESTION'
  | 'TOOL_DISCOVERY'
  | 'HELP'
  | 'UNKNOWN';

export interface AssistantToolEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  route: string;
  isPremium: boolean;
  supportedUseCases: string[];
  keywords: string[];
  synonyms: string[];
}

export interface ExtractedEntities {
  amount?: number;
  rate?: number;
  tenureYears?: number;
  frequency?: 'monthly' | 'yearly';
  cgpa?: number;
  percentage?: number;
  attendedClasses?: number;
  totalClasses?: number;
  weightKg?: number;
  heightCm?: number;
  gstRate?: number;
  discountPct?: number;
}

export type ClarificationType =
  | 'SIP_DETAILS'
  | 'EMI_DETAILS'
  | 'ATTENDANCE_DETAILS'
  | 'CGPA_VALUE'
  | 'BMI_DETAILS'
  | 'DISCOUNT_DETAILS'
  | 'GST_DETAILS';

export interface SessionContext {
  lastIntent: AssistantIntent;
  lastToolId?: string;
  entities: ExtractedEntities;
  awaitingClarification?: ClarificationType;
  history: Array<{ query: string; intent: AssistantIntent; timestamp: number }>;
  feedback: FeedbackSubmission[];
}

export interface AssistantResponse {
  id: string;
  text: string;
  intent: AssistantIntent;
  confidence: number;
  recommendedTool?: AssistantToolEntry;
  rankedTools?: AssistantToolEntry[];
  actionButton?: {
    label: string;
    path: string;
  };
  secondaryActions?: Array<{
    label: string;
    path: string;
  }>;
  quickReplies?: string[];
  requiresClarification?: boolean;
}

export type FeedbackCategory =
  | 'WRONG_ANSWER'
  | 'DIDNT_UNDERSTAND'
  | 'WRONG_TOOL'
  | 'CALCULATION_ISSUE'
  | 'TOO_COMPLICATED'
  | 'UNCLEAR'
  | 'MISSING_INFO'
  | 'OTHER';

export interface FeedbackSubmission {
  id: string;
  timestamp: string;
  messageId: string;
  query: string;
  intent: AssistantIntent;
  toolId?: string;
  helpful: boolean;
  rating?: number; // 1 to 5 stars
  category?: FeedbackCategory;
  comment?: string;
  userId?: string;
  userEmail?: string;
  isAnonymous: boolean;
}

export interface FeedbackAnalytics {
  total: number;
  helpfulCount: number;
  notHelpfulCount: number;
  helpfulPercentage: number;
  notHelpfulPercentage: number;
  averageRating: number;
  topComplaints: Array<{ category: FeedbackCategory; count: number }>;
  topMisunderstoodIntents: Array<{ intent: AssistantIntent; count: number }>;
  topRecommendedTools: Array<{ toolId: string; count: number }>;
}
