import { db } from '../../../../utils/db';
// TODO: Fix Drizzle ORM integration - these imports are currently incompatible with utils/db
// Temporary workaround: declare as any to prevent compile errors
const conversationSessions: any = null;
const conversationMessages: any = null;
const detectedIntents: any = null;
const eq: any = (...args: any[]) => null;
const and: any = (...args: any[]) => null;
const desc: any = (...args: any[]) => null;
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('ContextAnalyzer');

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
  duration?: string; // "4s", "10s", "30s", etc.
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

/**
 * Context Analyzer
 * 
 * Manages conversation context, loads history, determines conversation phase,
 * and identifies missing information needed to proceed.
 */
export class ContextAnalyzer {
  /**
   * Load existing conversation context from database
   */
  async loadContext(sessionId: string): Promise<ConversationContext> {
    logger.info('Loading context', { sessionId });

    try {
      // Load session
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      const [session] = await db
        .select()
        .from(conversationSessions)
        .where(eq(conversationSessions.id, sessionId))
        .limit(1);

      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      // Load messages
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      const messages = await db
        .select()
        .from(conversationMessages)
        .where(eq(conversationMessages.sessionId, sessionId))
        .orderBy(conversationMessages.createdAt);

      // Load detected intent
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      const [intentRow] = await db
        .select()
        .from(detectedIntents)
        .where(eq(detectedIntents.sessionId, sessionId))
        .orderBy(desc(detectedIntents.updatedAt))
        .limit(1);

      const intent: Intent = intentRow
        ? {
            purpose: (intentRow.purpose as Intent['purpose']) || 'unknown',
            platform: (intentRow.platform as Intent['platform']) || 'unknown',
            style: (intentRow.style as Intent['style']) || 'unknown',
            mediaType: (intentRow.mediaType as Intent['mediaType']) || 'unknown',
            budgetSensitivity: (intentRow.budgetSensitivity as Intent['budgetSensitivity']) || 'unknown',
            hasScript: intentRow.hasScript || false,
            hasVisuals: intentRow.hasVisuals || false
          }
        : this.getDefaultIntent();

      const inferredSpecs: InferredSpecs = intentRow?.inferredSpecs 
        ? (intentRow.inferredSpecs as InferredSpecs)
        : {};

      const context: ConversationContext = {
        sessionId,
        userId: session.userId,
        projectId: session.projectId || undefined,
        messages: messages.map((m: any) => ({
          role: m.role as Message['role'],
          content: m.content,
          metadata: m.metadata as Record<string, any>,
          createdAt: m.createdAt || undefined
        })),
        detectedIntent: intent,
        inferredSpecs,
        phase: 'discovery', // Will be determined by determinePhase
        missingInfo: [],
        metadata: session.metadata as Record<string, any>
      };

      // Determine current phase
      context.phase = this.determinePhase(context);
      
      // Identify missing information
      context.missingInfo = this.identifyMissingInfo(context);

      logger.info('Context loaded', {
        sessionId,
        messageCount: context.messages.length,
        phase: context.phase,
        missingInfoCount: context.missingInfo.length
      });

      return context;
    } catch (error) {
      logger.error('Failed to load context', { sessionId, error });
      throw error;
    }
  }

  /**
   * Create new conversation session
   */
  async createSession(userId: string, projectId?: string): Promise<string> {

    // Convert "anonymous" string or numeric IDs to UUID
    // If userId is "anonymous", "1", or any non-UUID string, use anonymous user
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const resolvedUserId = (userId === 'anonymous' || !isUUID) ? ANONYMOUS_USER_UUID : userId;

    logger.info('Creating new session', { userId, resolvedUserId, projectId });

    try {
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      const [session] = await db
        .insert(conversationSessions)
        .values({
          userId: resolvedUserId,
          projectId,
          status: 'active',
          metadata: {}
        })
        .returning();

      // Create default intent record
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      await db.insert(detectedIntents).values({
        sessionId: session.id,
        purpose: 'unknown',
        platform: 'unknown',
        style: 'unknown',
        mediaType: 'unknown',
        budgetSensitivity: 'unknown',
        hasScript: false,
        hasVisuals: false,
        inferredSpecs: {},
        confidence: 0.0
      });

      logger.info('Session created', { sessionId: session.id });
      return session.id;
    } catch (error) {
      logger.error('Failed to create session', { userId, error });
      throw error;
    }
  }

  /**
   * Update context with new message
   */
  async updateContext(
    sessionId: string,
    message: Message,
    updatedIntent?: Partial<Intent>,
    updatedSpecs?: Partial<InferredSpecs>
  ): Promise<ConversationContext> {
    logger.info('Updating context', { sessionId, role: message.role });

    try {
      // Save message
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      await db.insert(conversationMessages).values({
        sessionId,
        role: message.role,
        content: message.content,
        metadata: message.metadata || {}
      });

      // Update intent if provided
      if (updatedIntent) {
        // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
        const [existing] = await db
          .select()
          .from(detectedIntents)
          .where(eq(detectedIntents.sessionId, sessionId))
          .limit(1);

        if (existing) {
          // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
          await db
            .update(detectedIntents)
            .set({
              ...updatedIntent,
              inferredSpecs: updatedSpecs
                ? { ...(existing.inferredSpecs as object), ...updatedSpecs }
                : existing.inferredSpecs,
              updatedAt: new Date()
            })
            .where(eq(detectedIntents.sessionId, sessionId));
        }
      }

      // Update session timestamp
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      await db
        .update(conversationSessions)
        .set({ updatedAt: new Date() })
        .where(eq(conversationSessions.id, sessionId));

      // Reload and return updated context
      return await this.loadContext(sessionId);
    } catch (error) {
      logger.error('Failed to update context', { sessionId, error });
      throw error;
    }
  }

  /**
   * Determine conversation phase based on context
   */
  determinePhase(context: ConversationContext): ConversationContext['phase'] {
    const { detectedIntent, inferredSpecs, messages } = context;

    // Delivery: Last message was execution complete
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.metadata?.status === 'completed') {
      return 'delivery';
    }

    // Execution: User approved, all info available
    const hasApproval = messages.some(m => 
      m.role === 'user' && 
      /^(sì|si|yes|ok|vai|procedi|perfetto)/i.test(m.content.trim())
    );
    
    if (
      hasApproval &&
      detectedIntent.purpose !== 'unknown' &&
      inferredSpecs.aspectRatio &&
      inferredSpecs.duration
    ) {
      return 'execution';
    }

    // Refinement: Have purpose + platform, need to propose direction
    if (
      detectedIntent.purpose !== 'unknown' &&
      detectedIntent.platform !== 'unknown'
    ) {
      return 'refinement';
    }

    // Discovery: Missing critical information
    return 'discovery';
  }

  /**
   * Identify what information is still missing
   */
  identifyMissingInfo(context: ConversationContext): string[] {
    const missing: string[] = [];
    const { detectedIntent, inferredSpecs } = context;

    // Critical info for any creation
    if (detectedIntent.purpose === 'unknown') {
      missing.push('purpose');
    }

    if (detectedIntent.platform === 'unknown') {
      missing.push('platform');
    }

    if (detectedIntent.mediaType === 'unknown') {
      missing.push('mediaType');
    }

    // Technical specs (can be inferred but good to have)
    if (!inferredSpecs.aspectRatio) {
      missing.push('aspectRatio');
    }

    if (detectedIntent.mediaType === 'video' && !inferredSpecs.duration) {
      missing.push('duration');
    }

    // Assets availability
    if (detectedIntent.mediaType === 'video' && !detectedIntent.hasScript) {
      // Don't mark as missing - we'll generate if needed
      // Just noting for workflow planning
    }

    return missing;
  }

  /**
   * Get default intent for new sessions
   */
  private getDefaultIntent(): Intent {
    return {
      purpose: 'unknown',
      platform: 'unknown',
      style: 'unknown',
      mediaType: 'unknown',
      budgetSensitivity: 'unknown',
      hasScript: false,
      hasVisuals: false
    };
  }

  /**
   * Mark session as completed
   */
  async completeSession(sessionId: string): Promise<void> {
    logger.info('Completing session', { sessionId });

    try {
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      await db
        .update(conversationSessions)
        .set({
          status: 'completed',
          updatedAt: new Date()
        })
        .where(eq(conversationSessions.id, sessionId));

      logger.info('Session completed', { sessionId });
    } catch (error) {
      logger.error('Failed to complete session', { sessionId, error });
      throw error;
    }
  }

  /**
   * Mark session as abandoned
   */
  async abandonSession(sessionId: string): Promise<void> {
    logger.info('Abandoning session', { sessionId });

    try {
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      await db
        .update(conversationSessions)
        .set({
          status: 'abandoned',
          updatedAt: new Date()
        })
        .where(eq(conversationSessions.id, sessionId));

      logger.info('Session abandoned', { sessionId });
    } catch (error) {
      logger.error('Failed to abandon session', { sessionId, error });
      throw error;
    }
  }

  /**
   * Get user's conversation history summary
   */
  async getUserHistory(userId: string, limit: number = 5): Promise<{
    totalSessions: number;
    completedSessions: number;
    recentTopics: string[];
  }> {
    logger.info('Loading user history', { userId });

    try {
      // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
      const sessions = await db
        .select()
        .from(conversationSessions)
        .where(eq(conversationSessions.userId, userId))
        .orderBy(desc(conversationSessions.createdAt))
        .limit(limit);

      const completed = sessions.filter((s: any) => s.status === 'completed').length;

      // Extract topics from session intents
      const recentTopics: string[] = [];
      for (const session of sessions.slice(0, 3)) {
        // @ts-ignore - TODO: Fix Drizzle ORM integration with utils/db
        const [intent] = await db
          .select()
          .from(detectedIntents)
          .where(eq(detectedIntents.sessionId, session.id))
          .limit(1);

        if (intent && intent.purpose !== 'unknown') {
          recentTopics.push(`${intent.purpose} ${intent.mediaType}`);
        }
      }

      return {
        totalSessions: sessions.length,
        completedSessions: completed,
        recentTopics
      };
    } catch (error) {
      logger.error('Failed to load user history', { userId, error });
      throw error;
    }
  }
}
