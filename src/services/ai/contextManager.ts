import { SessionContext, ExtractedEntities, AssistantIntent, ClarificationType, FeedbackSubmission } from './types';

/**
 * Creates a fresh session context
 */
export function createInitialContext(): SessionContext {
  return {
    lastIntent: 'UNKNOWN',
    entities: {},
    history: [],
    feedback: [],
  };
}

/**
 * Checks if two intents belong to the same functional domain
 */
function areCompatibleIntents(prev: AssistantIntent, next: AssistantIntent): boolean {
  if (prev === next) return true;
  if (prev === 'UNKNOWN' || next === 'UNKNOWN') return true;
  if (prev === 'GENERAL_QUESTION' || next === 'GENERAL_QUESTION') return true;
  return false;
}

/**
 * Merges newly extracted entities into ongoing session context with cross-domain hygiene
 */
export function updateContext(
  context: SessionContext,
  query: string,
  intent: AssistantIntent,
  newEntities: ExtractedEntities,
  toolId?: string,
  awaitingClarification?: ClarificationType
): SessionContext {
  // If moving between completely different domains (e.g. Student -> Finance), reset mismatched entities
  const baseEntities = areCompatibleIntents(context.lastIntent, intent) ? context.entities : {};

  const mergedEntities: ExtractedEntities = {
    ...baseEntities,
    ...Object.fromEntries(
      Object.entries(newEntities).filter(([_, v]) => v !== undefined && v !== null)
    ),
  };

  const updatedHistory = [
    ...context.history,
    {
      query,
      intent,
      timestamp: Date.now(),
    },
  ].slice(-10); // Keep last 10 messages for context

  return {
    lastIntent: intent,
    lastToolId: toolId || context.lastToolId,
    entities: mergedEntities,
    awaitingClarification: awaitingClarification ?? (intent !== context.lastIntent ? undefined : context.awaitingClarification),
    history: updatedHistory,
    feedback: context.feedback || [],
  };
}

/**
 * Stores feedback directly into the existing session context
 */
export function addFeedbackToSessionContext(
  context: SessionContext,
  feedbackItem: FeedbackSubmission
): SessionContext {
  return {
    ...context,
    feedback: [...(context.feedback || []), feedbackItem],
  };
}

/**
 * Resets context when user clears or resets chat
 */
export function resetContext(): SessionContext {
  return createInitialContext();
}
