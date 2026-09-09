import { classifyIntent } from './intentClassifier';
import { generateResponse } from './responseGenerator';
import { updateContext, createInitialContext, resetContext } from './contextManager';
import { AssistantResponse, SessionContext } from './types';

export * from './types';
export * from './toolRegistry';
export * from './intentClassifier';
export * from './contextManager';
export * from './responseGenerator';
export * from './feedbackService';

/**
 * Main AI Assistant Orchestrator
 * Fully local 7-layer decision engine, zero external AI calls, instant execution.
 */
export function processUserQuery(
  rawQuery: string,
  context: SessionContext
): { response: AssistantResponse; nextContext: SessionContext } {
  // 1. Layered Classification & Entity Extraction
  const { intent, confidence, matchedTool, rankedTools, entities } = classifyIntent(
    rawQuery,
    context.lastIntent,
    context.lastToolId
  );

  // 2. Update Context with new entities and history
  const activeToolId = matchedTool?.id || context.lastToolId;
  const tempContext = updateContext(
    context,
    rawQuery,
    intent,
    entities,
    activeToolId
  );

  // 3. Generate response using updated context & ranked tools
  const { response, updatedClarification } = generateResponse(
    rawQuery,
    intent,
    confidence,
    matchedTool,
    tempContext,
    rankedTools
  );

  // 4. Finalize next context with clarification state if needed
  const nextContext: SessionContext = {
    ...tempContext,
    awaitingClarification: updatedClarification,
    lastToolId: activeToolId,
  };

  return { response, nextContext };
}
