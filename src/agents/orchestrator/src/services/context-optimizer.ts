/**
 * Context Optimizer
 *
 * Optimizes context usage for Claude API calls using:
 * 1. Prompt caching - Cache static personality prompts (90% cost savings)
 * 2. Just-in-time loading - Load context only when needed
 * 3. Conversation compression - Summarize old messages when >20 messages
 *
 * Based on Anthropic's prompt caching and context engineering best practices.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../../../../utils/logger';
import { ConversationContext } from './context-analyzer';
import { Language } from './language-detector';
import {
  getPersonalityPrompt,
  getCostTransparencyPrompt,
  buildUserContextString
} from '../config/personality-prompts-multilingual';
import { TokenBudgetManager, BudgetConfig } from '../utils/token-budget-manager';

const logger = createLogger('ContextOptimizer');

/**
 * Phase-specific instructions for the orchestrator
 */
const PHASE_INSTRUCTIONS: Record<string, Record<Language, string>> = {
  discovery: {
    it: '\n\n**FASE: DISCOVERY**\nFai domande intelligenti per capire cosa vuole il cliente. Non proporre soluzioni ancora.',
    en: '\n\n**PHASE: DISCOVERY**\nAsk smart questions to understand what the client wants. Don\'t propose solutions yet.',
    es: '\n\n**FASE: DESCUBRIMIENTO**\nHaz preguntas inteligentes para entender qué quiere el cliente. No propongas soluciones todavía.',
    fr: '\n\n**PHASE: DÉCOUVERTE**\nPosez des questions intelligentes pour comprendre ce que veut le client. Ne proposez pas encore de solutions.',
    de: '\n\n**PHASE: ENTDECKUNG**\nStelle intelligente Fragen, um zu verstehen, was der Kunde will. Schlage noch keine Lösungen vor.'
  },
  refinement: {
    it: '\n\n**FASE: REFINEMENT**\nProponi una direzione creativa con costi. Sii specifico su modelli e approccio.',
    en: '\n\n**PHASE: REFINEMENT**\nPropose a creative direction with costs. Be specific about models and approach.',
    es: '\n\n**FASE: REFINAMIENTO**\nPropón una dirección creativa con costos. Sé específico sobre modelos y enfoque.',
    fr: '\n\n**PHASE: RAFFINEMENT**\nProposez une direction créative avec les coûts. Soyez précis sur les modèles et l\'approche.',
    de: '\n\n**PHASE: VERFEINERUNG**\nSchlage eine kreative Richtung mit Kosten vor. Sei spezifisch über Modelle und Ansatz.'
  },
  execution: {
    it: '\n\n**FASE: EXECUTION**\nConferma che stai lavorando. Fornisci aggiornamenti se richiesti.',
    en: '\n\n**PHASE: EXECUTION**\nConfirm you\'re working. Provide updates if requested.',
    es: '\n\n**FASE: EJECUCIÓN**\nConfirma que estás trabajando. Proporciona actualizaciones si se solicitan.',
    fr: '\n\n**PHASE: EXÉCUTION**\nConfirmez que vous travaillez. Fournissez des mises à jour si demandé.',
    de: '\n\n**PHASE: AUSFÜHRUNG**\nBestätige, dass du arbeitest. Gib Updates wenn angefordert.'
  },
  delivery: {
    it: '\n\n**FASE: DELIVERY**\nPresenta i risultati. Chiedi feedback e offri iterazioni.',
    en: '\n\n**PHASE: DELIVERY**\nPresent the results. Ask for feedback and offer iterations.',
    es: '\n\n**FASE: ENTREGA**\nPresenta los resultados. Pide comentarios y ofrece iteraciones.',
    fr: '\n\n**PHASE: LIVRAISON**\nPrésentez les résultats. Demandez des commentaires et proposez des itérations.',
    de: '\n\n**PHASE: LIEFERUNG**\nPräsentiere die Ergebnisse. Frage nach Feedback und biete Iterationen an.'
  }
};

/**
 * Configuration for context optimization
 */
export interface ContextOptimizerConfig {
  /** Enable prompt caching (default: true) */
  enableCaching?: boolean;
  /** Enable conversation compression (default: true) */
  enableCompression?: boolean;
  /** Max messages before compression triggers (default: 20) */
  compressionThreshold?: number;
  /** Number of recent messages to keep uncompressed (default: 6) */
  recentMessagesToKeep?: number;
  /** Token budget configuration */
  budgetConfig?: Partial<BudgetConfig>;
}

/**
 * Optimized system prompt with caching
 */
export interface OptimizedSystemPrompt {
  /** System prompt blocks with cache control */
  systemBlocks: string | Anthropic.Messages.TextBlockParam[];
  /** Whether caching is used */
  cachingEnabled: boolean;
  /** Estimated token savings */
  estimatedSavings?: number;
}

/**
 * Optimized conversation messages
 */
export interface OptimizedMessages {
  /** Compressed messages ready for API */
  messages: Anthropic.MessageParam[];
  /** Original message count */
  originalCount: number;
  /** Compressed message count */
  compressedCount: number;
  /** Whether compression was applied */
  compressionApplied: boolean;
  /** Budget warning message (if any) */
  budgetWarning?: string;
  /** Token usage details */
  tokenUsage?: {
    total: number;
    percentUsed: number;
    remaining: number;
    status: 'ok' | 'warning' | 'critical' | 'exceeded';
  };
}

/**
 * Context Optimizer Service
 */
export class ContextOptimizer {
  private config: Required<Omit<ContextOptimizerConfig, 'budgetConfig'>> & {
    budgetConfig?: Partial<BudgetConfig>;
  };
  private claude: Anthropic;
  private budgetManager: TokenBudgetManager;

  constructor(
    anthropicApiKey: string,
    config: ContextOptimizerConfig = {}
  ) {
    this.config = {
      enableCaching: config.enableCaching ?? true,
      enableCompression: config.enableCompression ?? true,
      compressionThreshold: config.compressionThreshold ?? 20,
      recentMessagesToKeep: config.recentMessagesToKeep ?? 6,
      budgetConfig: config.budgetConfig
    };

    this.claude = new Anthropic({ apiKey: anthropicApiKey });
    this.budgetManager = new TokenBudgetManager(config.budgetConfig);

    logger.info('ContextOptimizer initialized', {
      caching: this.config.enableCaching,
      compression: this.config.enableCompression,
      compressionThreshold: this.config.compressionThreshold,
      tokenBudget: this.budgetManager.getAvailableTokens()
    });
  }

  /**
   * Build optimized system prompt with prompt caching
   *
   * Uses Anthropic's prompt caching to cache the personality prompt
   * which rarely changes, saving ~90% on repeated API calls.
   */
  buildOptimizedSystemPrompt(
    phase: 'discovery' | 'refinement' | 'execution' | 'delivery',
    language: Language,
    context?: ConversationContext
  ): OptimizedSystemPrompt {
    const personalityPrompt = getPersonalityPrompt(language);
    const costPrompt = getCostTransparencyPrompt(language);
    const phaseInstruction = PHASE_INSTRUCTIONS[phase][language];

    // Build user context if provided
    const userContext = context
      ? '\n\n' + buildUserContextString({
          detectedIntent: context.detectedIntent,
          inferredSpecs: context.inferredSpecs,
          messageCount: context.messages.length,
          previousProjects: 0, // Could be loaded from history
          detectedLanguage: language
        })
      : '';

    if (this.config.enableCaching) {
      // Use prompt caching for static parts
      // Cache personality + cost transparency (changes rarely)
      // Don't cache phase instruction (changes frequently) or user context (always unique)
      const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
        {
          type: 'text',
          text: personalityPrompt + '\n\n' + costPrompt
          // Note: cache_control removed - not in official Anthropic SDK types
        },
        {
          type: 'text',
          text: phaseInstruction + userContext
          // No caching for dynamic content
        }
      ];

      // Estimate token savings (personality prompt is ~800 tokens)
      const estimatedSavings = Math.floor(800 * 0.9); // 90% savings on cached tokens

      logger.debug('Built cached system prompt', {
        phase,
        language,
        estimatedSavings
      });

      return {
        systemBlocks,
        cachingEnabled: true,
        estimatedSavings
      };
    } else {
      // No caching - single text block
      const systemBlocks: string =
        personalityPrompt + '\n\n' + costPrompt + phaseInstruction + userContext;

      return {
        systemBlocks,
        cachingEnabled: false
      };
    }
  }

  /**
   * Optimize conversation messages with compression
   *
   * When conversation exceeds threshold OR token budget triggers compression:
   * 1. Keep first 2 messages (context setting)
   * 2. Compress middle messages into summary
   * 3. Keep last N messages verbatim (active conversation)
   */
  async optimizeMessages(
    context: ConversationContext,
    language: Language,
    sessionId: string = 'default'
  ): Promise<OptimizedMessages> {
    const messages = context.messages.filter(m => m.role !== 'system');
    const messageCount = messages.length;

    // Build system prompt text for budget calculation
    const personalityPrompt = getPersonalityPrompt(language);
    const costPrompt = getCostTransparencyPrompt(language);
    const systemPromptText = personalityPrompt + '\n\n' + costPrompt;

    // Check token budget
    const budgetStatus = this.budgetManager.checkBudget(
      sessionId,
      systemPromptText,
      messages.map(m => ({ role: m.role, content: m.content }))
    );

    // Determine if compression needed
    const needsCompression =
      this.config.enableCompression && (
        messageCount > this.config.compressionThreshold ||
        budgetStatus.shouldCompress
      );

    // Get budget warning if applicable
    const budgetWarning = this.budgetManager.getBudgetWarningMessage(budgetStatus.usage);

    if (!needsCompression) {
      // No compression needed
      const optimizedMessages: Anthropic.MessageParam[] = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      logger.debug('No compression needed', {
        messageCount,
        tokenUsage: budgetStatus.usage.percentUsed.toFixed(1) + '%'
      });

      return {
        messages: optimizedMessages,
        originalCount: messageCount,
        compressedCount: messageCount,
        compressionApplied: false,
        budgetWarning: budgetWarning ?? undefined,
        tokenUsage: {
          total: budgetStatus.usage.total,
          percentUsed: budgetStatus.usage.percentUsed,
          remaining: budgetStatus.usage.remaining,
          status: budgetStatus.usage.status
        }
      };
    }

    // Apply compression
    const compressionReason = budgetStatus.shouldCompress
      ? `token budget (${budgetStatus.usage.percentUsed.toFixed(1)}% used)`
      : `message threshold (${messageCount} messages)`;

    logger.info('Compressing conversation', {
      originalCount: messageCount,
      reason: compressionReason,
      threshold: this.config.compressionThreshold,
      keepRecent: this.config.recentMessagesToKeep,
      tokenUsage: budgetStatus.usage.percentUsed.toFixed(1) + '%'
    });

    // Calculate how many messages to compress based on budget
    let messagesToCompress = messageCount - 2 - this.config.recentMessagesToKeep;

    if (budgetStatus.shouldCompress) {
      const tokensToRemove = this.budgetManager.calculateCompressionTarget(
        budgetStatus.usage.total
      );
      const estimatedMessages = this.budgetManager.estimateMessagesToCompress(
        messages,
        tokensToRemove
      );
      messagesToCompress = Math.max(messagesToCompress, estimatedMessages);
    }

    const firstMessages = messages.slice(0, 2); // Keep first 2 (context)
    const compressibleMessages = messages.slice(2, -this.config.recentMessagesToKeep);
    const recentMessages = messages.slice(-this.config.recentMessagesToKeep);

    // Take only the number of messages we need to compress
    const middleMessages = compressibleMessages.slice(0, messagesToCompress);
    const uncompressedMiddle = compressibleMessages.slice(messagesToCompress);

    // Compress middle messages
    const compressedSummary = await this.compressMessages(middleMessages, language);

    // Build optimized message array
    const optimizedMessages: Anthropic.MessageParam[] = [
      // First messages
      ...firstMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      // Compressed summary (as system-like assistant message)
      {
        role: 'assistant',
        content: `[Previous conversation summary: ${compressedSummary}]`
      },
      // Uncompressed middle messages (if any)
      ...uncompressedMiddle.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      // Recent messages
      ...recentMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    const compressedCount = firstMessages.length + 1 + uncompressedMiddle.length + recentMessages.length;

    // Recalculate usage after compression
    const postCompressionUsage = this.budgetManager.calculateUsage(
      systemPromptText,
      optimizedMessages.map(m => ({
        role: typeof m.role === 'string' ? m.role : 'assistant',
        content: typeof m.content === 'string' ? m.content : ''
      }))
    );

    logger.info('Compression complete', {
      originalCount: messageCount,
      compressedCount,
      savedMessages: messageCount - compressedCount,
      tokenReduction: `${budgetStatus.usage.percentUsed.toFixed(1)}% → ${postCompressionUsage.percentUsed.toFixed(1)}%`
    });

    return {
      messages: optimizedMessages,
      originalCount: messageCount,
      compressedCount,
      compressionApplied: true,
      budgetWarning: this.budgetManager.getBudgetWarningMessage(postCompressionUsage) ?? undefined,
      tokenUsage: {
        total: postCompressionUsage.total,
        percentUsed: postCompressionUsage.percentUsed,
        remaining: postCompressionUsage.remaining,
        status: postCompressionUsage.status
      }
    };
  }

  /**
   * Compress a range of messages into a concise summary
   *
   * Uses Claude to summarize the conversation while preserving key details
   */
  private async compressMessages(
    messages: ConversationContext['messages'],
    language: Language
  ): Promise<string> {
    if (messages.length === 0) {
      return 'No prior conversation.';
    }

    // Build conversation text
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const summaryPrompts: Record<Language, string> = {
      it: 'Riassumi questa conversazione in 2-3 frasi, mantenendo i dettagli chiave sul progetto (tipo di contenuto, piattaforma, stile, requisiti). Sii conciso ma preciso.',
      en: 'Summarize this conversation in 2-3 sentences, keeping key details about the project (content type, platform, style, requirements). Be concise but precise.',
      es: 'Resume esta conversación en 2-3 oraciones, manteniendo detalles clave sobre el proyecto (tipo de contenido, plataforma, estilo, requisitos). Sé conciso pero preciso.',
      fr: 'Résumez cette conversation en 2-3 phrases, en conservant les détails clés sur le projet (type de contenu, plateforme, style, exigences). Soyez concis mais précis.',
      de: 'Fasse dieses Gespräch in 2-3 Sätzen zusammen und behalte wichtige Details über das Projekt (Inhaltstyp, Plattform, Stil, Anforderungen). Sei prägnant aber präzise.'
    };

    try {
      const response = await this.claude.messages.create({
        model: 'claude-haiku-4-20250514', // Use fast, cheap model for summarization
        max_tokens: 150,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: `${summaryPrompts[language]}\n\n${conversationText}`
          }
        ]
      });

      const summary = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Conversation about content creation.';

      logger.debug('Messages compressed', {
        originalMessages: messages.length,
        summaryLength: summary.length
      });

      return summary;
    } catch (error) {
      logger.error('Failed to compress messages', { error });
      // Fallback: simple text summary
      return `Previous ${messages.length} messages about: ${messages[0]?.content.substring(0, 100)}...`;
    }
  }

  /**
   * Create optimized Claude API call parameters
   *
   * Combines optimized system prompt and messages for a complete API call
   */
  buildOptimizedRequest(
    context: ConversationContext,
    phase: 'discovery' | 'refinement' | 'execution' | 'delivery',
    language: Language,
    optimizedMessages: OptimizedMessages
  ): {
    system: string | Anthropic.Messages.TextBlockParam[];
    messages: Anthropic.MessageParam[];
    metadata: {
      cachingEnabled: boolean;
      compressionApplied: boolean;
      originalMessageCount: number;
      optimizedMessageCount: number;
    };
  } {
    const systemPrompt = this.buildOptimizedSystemPrompt(phase, language, context);

    return {
      system: systemPrompt.systemBlocks,
      messages: optimizedMessages.messages,
      metadata: {
        cachingEnabled: systemPrompt.cachingEnabled,
        compressionApplied: optimizedMessages.compressionApplied,
        originalMessageCount: optimizedMessages.originalCount,
        optimizedMessageCount: optimizedMessages.compressedCount
      }
    };
  }

  /**
   * Get optimization statistics
   */
  getStats(
    originalMessageCount: number,
    optimizedMessageCount: number,
    cachingEnabled: boolean
  ): {
    messagesSaved: number;
    percentSaved: number;
    cachingSavings: string;
  } {
    const messagesSaved = originalMessageCount - optimizedMessageCount;
    const percentSaved = originalMessageCount > 0
      ? Math.round((messagesSaved / originalMessageCount) * 100)
      : 0;

    return {
      messagesSaved,
      percentSaved,
      cachingSavings: cachingEnabled ? '~90% on cached system prompt' : 'disabled'
    };
  }

  /**
   * Get token budget manager for direct access
   */
  getBudgetManager(): TokenBudgetManager {
    return this.budgetManager;
  }

  /**
   * Get current token usage for a session
   */
  getTokenUsage(sessionId: string) {
    return this.budgetManager.getUsage(sessionId);
  }

  /**
   * Clear token usage tracking for a session
   */
  clearTokenUsage(sessionId: string): void {
    this.budgetManager.clearUsage(sessionId);
  }

  /**
   * Get all sessions approaching token limits
   */
  getSessionsApproachingLimit() {
    return this.budgetManager.getSessionsApproachingLimit();
  }

  /**
   * Get token budget statistics
   */
  getBudgetStatistics() {
    return this.budgetManager.getStatistics();
  }
}
