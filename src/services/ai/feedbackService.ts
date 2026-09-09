import {
  FeedbackSubmission,
  FeedbackAnalytics,
  FeedbackCategory,
  AssistantIntent,
} from './types';

const FEEDBACK_STORAGE_KEY = 'naviko_ai_feedback_v1';

export const FEEDBACK_CATEGORIES: Array<{ id: FeedbackCategory; label: string }> = [
  { id: 'WRONG_ANSWER', label: 'Wrong answer' },
  { id: 'DIDNT_UNDERSTAND', label: "Didn't understand me" },
  { id: 'WRONG_TOOL', label: 'Wrong tool' },
  { id: 'CALCULATION_ISSUE', label: 'Calculation issue' },
  { id: 'TOO_COMPLICATED', label: 'Too complicated' },
  { id: 'MISSING_INFO', label: 'Missing information' },
  { id: 'OTHER', label: 'Other' },
];

/**
 * Sanitize query to prevent storing sensitive information (tokens, passwords, cards)
 */
function sanitizeQuery(raw?: string): string {
  if (!raw) return 'N/A';
  // Strip potential passwords, auth keys, credit card numbers
  let safe = raw
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REDACTED]')
    .replace(/(?:password|pwd|secret|token)\s*[:=]\s*\S+/gi, '[SECRET_REDACTED]')
    .trim();
  // Cap length
  return safe.slice(0, 150);
}

/**
 * Feedback storage adapter interface for decoupling storage mechanisms
 */
export interface FeedbackStorageAdapter {
  saveFeedback(item: FeedbackSubmission): FeedbackSubmission;
  getFeedback(): FeedbackSubmission[];
  getAnalytics(): FeedbackAnalytics;
}

/**
 * Default Local Storage Adapter (client-side & memory fallback)
 */
export class LocalFeedbackStorageAdapter implements FeedbackStorageAdapter {
  private memoryCache: FeedbackSubmission[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        if (raw) {
          this.memoryCache = JSON.parse(raw);
        }
      } catch (err) {
        console.warn('Failed to load feedback from localStorage:', err);
      }
    }
  }

  saveFeedback(item: FeedbackSubmission): FeedbackSubmission {
    try {
      const existing = this.getFeedback();
      const updated = [item, ...existing].slice(0, 250);
      this.memoryCache = updated;

      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      console.warn('Failed to persist feedback item:', err);
    }
    return item;
  }

  getFeedback(): FeedbackSubmission[] {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        if (raw) {
          this.memoryCache = JSON.parse(raw);
        }
      } catch {
        // use memoryCache
      }
    }
    return this.memoryCache;
  }

  getAnalytics(): FeedbackAnalytics {
    const list = this.getFeedback();
    const total = list.length;

    if (total === 0) {
      return {
        total: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        helpfulPercentage: 100,
        notHelpfulPercentage: 0,
        averageRating: 5.0,
        topComplaints: [],
        topMisunderstoodIntents: [],
        topRecommendedTools: [],
      };
    }

    const helpfulCount = list.filter((f) => f.helpful).length;
    const notHelpfulCount = total - helpfulCount;
    const helpfulPercentage = Math.round((helpfulCount / total) * 100);
    const notHelpfulPercentage = 100 - helpfulPercentage;

    const ratedItems = list.filter((f) => typeof f.rating === 'number' && f.rating > 0);
    const averageRating = ratedItems.length
      ? Number((ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length).toFixed(1))
      : 5.0;

    const complaintCounts: Record<FeedbackCategory, number> = {
      WRONG_ANSWER: 0,
      DIDNT_UNDERSTAND: 0,
      WRONG_TOOL: 0,
      CALCULATION_ISSUE: 0,
      TOO_COMPLICATED: 0,
      UNCLEAR: 0,
      MISSING_INFO: 0,
      OTHER: 0,
    };

    const intentCounts: Record<string, number> = {};
    const toolCounts: Record<string, number> = {};

    for (const item of list) {
      if (item.category && complaintCounts[item.category] !== undefined) {
        complaintCounts[item.category] += 1;
      }
      if (!item.helpful && item.intent) {
        intentCounts[item.intent] = (intentCounts[item.intent] || 0) + 1;
      }
      if (item.toolId) {
        toolCounts[item.toolId] = (toolCounts[item.toolId] || 0) + 1;
      }
    }

    const topComplaints = Object.entries(complaintCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category: category as FeedbackCategory, count }));

    const topMisunderstoodIntents = Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([intent, count]) => ({ intent: intent as AssistantIntent, count }));

    const topRecommendedTools = Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([toolId, count]) => ({ toolId, count }));

    return {
      total,
      helpfulCount,
      notHelpfulCount,
      helpfulPercentage,
      notHelpfulPercentage,
      averageRating,
      topComplaints,
      topMisunderstoodIntents,
      topRecommendedTools,
    };
  }
}

// Active storage adapter instance (defaults to Local)
let activeStorageAdapter: FeedbackStorageAdapter = new LocalFeedbackStorageAdapter();

/**
 * Configure or swap feedback storage adapter
 */
export function setFeedbackStorageAdapter(adapter: FeedbackStorageAdapter) {
  activeStorageAdapter = adapter;
}

/**
 * Exported active storage adapter reference
 */
export const feedbackStorageAdapter = {
  get current(): FeedbackStorageAdapter {
    return activeStorageAdapter;
  },
  set(adapter: FeedbackStorageAdapter) {
    activeStorageAdapter = adapter;
  },
};

/**
 * Retrieve all feedback from current adapter
 */
export function getAllFeedback(): FeedbackSubmission[] {
  return activeStorageAdapter.getFeedback();
}

/**
 * Submit feedback for an AI assistant response via current adapter
 */
export function submitFeedback(submission: Omit<FeedbackSubmission, 'id' | 'timestamp'>): FeedbackSubmission {
  const newEntry: FeedbackSubmission = {
    ...submission,
    query: sanitizeQuery(submission.query),
    id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  return activeStorageAdapter.saveFeedback(newEntry);
}

/**
 * Calculate aggregated feedback analytics via current adapter
 */
export function getFeedbackAnalytics(): FeedbackAnalytics {
  return activeStorageAdapter.getAnalytics();
}
