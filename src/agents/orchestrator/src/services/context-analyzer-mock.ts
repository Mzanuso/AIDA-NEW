import { createLogger } from '../../../../utils/logger';

const logger = createLogger('ContextAnalyzerMock');

// Anonymous user UUID constant
const ANONYMOUS_USER_UUID = 'e13ba0a4-0ad3-4b08-8c53-9564d3eddc53';

/**
 * Message in conversation
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

/**
 * Detected user intent from conversation
 */
export interface Intent {
  purpose: 'brand' | 'personal' | 'tutorial' | 'entertainment' | 'marketing' | 'unknown';
  platform: 'instagram' | 'tiktok' | 'youtube' | 'website' | 'linkedin' | 'unknown';
  style: 'cinematic' | 'casual' | 'minimalist' | 'energetic' | 'professional' | 'unknown';
  mediaType: 'image' | 'video' | 'music' | 'mixed' | 'unknown';
  budgetSensitivity: 'low' | 'medium' | 'high' | 'unknown';
  hasScript: boolean;
  hasVisuals: boolean;
}

/**
 * Inferred technical specifications
 */
export interface InferredSpecs {
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  duration?: string;
  resolution?: '720p' | '1080p' | '4K';
  qualityLevel?: 'high' | 'medium' | 'fast';
}

/**
 * Conversation context including history and analysis
 */
export interface ConversationContext {
  sessionId: string;
  userId: string;
  projectId?: string;
  messages: Message[];
  detectedIntent: Intent;
  inferredSpecs: InferredSpecs;
  phase: 'discovery' | 'refinement' | 'execution' | 'delivery';
  missingInfo: string[];
  metadata: Record<string, any>;
}

// In-memory storage
const sessions = new Map<string, ConversationContext>();

/**
 * Context Analyzer Mock (In-Memory)
 *
 * Mock implementation for testing without database dependency
 */
export class ContextAnalyzer {
  async loadContext(sessionId: string): Promise<ConversationContext> {
    logger.info('Loading context (mock)', { sessionId });

    const context = sessions.get(sessionId);
    if (!context) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    return context;
  }

  async createSession(userId: string, projectId?: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Creating session (mock)', { sessionId, userId });

    const context: ConversationContext = {
      sessionId,
      userId,
      projectId,
      messages: [],
      detectedIntent: {
        purpose: 'unknown',
        platform: 'unknown',
        style: 'unknown',
        mediaType: 'unknown',
        budgetSensitivity: 'unknown',
        hasScript: false,
        hasVisuals: false
      },
      inferredSpecs: {},
      phase: 'discovery',
      missingInfo: [],
      metadata: {}
    };

    sessions.set(sessionId, context);
    return sessionId;
  }

  async updateContext(
    sessionId: string,
    message?: Message,
    intentUpdates?: Partial<Intent>,
    specsUpdates?: Partial<InferredSpecs>
  ): Promise<ConversationContext> {
    const context = sessions.get(sessionId);
    if (!context) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (message) {
      message.createdAt = new Date();
      context.messages.push(message);
    }

    if (intentUpdates) {
      context.detectedIntent = { ...context.detectedIntent, ...intentUpdates };
    }

    if (specsUpdates) {
      context.inferredSpecs = { ...context.inferredSpecs, ...specsUpdates };
    }

    // Auto-advance phase logic
    const hasEnoughInfo =
      context.detectedIntent.purpose !== 'unknown' &&
      context.detectedIntent.platform !== 'unknown' &&
      context.detectedIntent.mediaType !== 'unknown';

    if (hasEnoughInfo && context.phase === 'discovery') {
      context.phase = 'refinement';
    }

    sessions.set(sessionId, context);
    return context;
  }

  async getUserHistory(userId: string, limit: number = 10): Promise<any[]> {
    logger.info('Getting user history (mock)', { userId, limit });
    return [];
  }

  async abandonSession(sessionId: string): Promise<void> {
    logger.info('Abandoning session (mock)', { sessionId });
    sessions.delete(sessionId);
  }

  async completeSession(sessionId: string): Promise<void> {
    logger.info('Completing session (mock)', { sessionId });
    const context = sessions.get(sessionId);
    if (context) {
      context.phase = 'delivery';
    }
  }
}
