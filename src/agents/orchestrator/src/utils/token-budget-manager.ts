/**
 * Token Budget Manager
 *
 * Manages token usage across conversations to:
 * 1. Prevent exceeding context window limits
 * 2. Reserve tokens for response generation
 * 3. Track token usage per conversation
 * 4. Alert when approaching limits
 * 5. Auto-compress when needed
 *
 * Based on Claude's 200K context window with 4K reserved for output.
 */

import { createLogger } from '@backend/utils/logger';

const logger = createLogger('TokenBudgetManager');

/**
 * Budget configuration
 */
export interface BudgetConfig {
  maxContextTokens: number;      // Max tokens for context (default: 200,000)
  reservedOutputTokens: number;  // Reserved for response (default: 4,000)
  warningThreshold: number;      // Warn at % (default: 80%)
  criticalThreshold: number;     // Critical at % (default: 95%)
  compressionThreshold: number;  // Auto-compress at % (default: 85%)
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  systemPrompt: number;
  conversationHistory: number;
  userContext: number;
  total: number;
  percentUsed: number;
  remaining: number;
  status: 'ok' | 'warning' | 'critical' | 'exceeded';
}

/**
 * Budget status
 */
export interface BudgetStatus {
  usage: TokenUsage;
  shouldCompress: boolean;
  shouldAlert: boolean;
  canAddMessage: boolean;
  estimatedTokensForNewMessage: number;
}

/**
 * Token Budget Manager
 */
export class TokenBudgetManager {
  private config: Required<BudgetConfig>;
  private currentUsage: Map<string, TokenUsage> = new Map(); // sessionId -> usage

  constructor(config?: Partial<BudgetConfig>) {
    this.config = {
      maxContextTokens: config?.maxContextTokens ?? 200000,
      reservedOutputTokens: config?.reservedOutputTokens ?? 4000,
      warningThreshold: config?.warningThreshold ?? 0.80,
      criticalThreshold: config?.criticalThreshold ?? 0.95,
      compressionThreshold: config?.compressionThreshold ?? 0.85
    };

    logger.info('TokenBudgetManager initialized', {
      maxTokens: this.config.maxContextTokens,
      reserved: this.config.reservedOutputTokens,
      available: this.getAvailableTokens()
    });
  }

  /**
   * Get available tokens for context (excluding reserved output tokens)
   */
  getAvailableTokens(): number {
    return this.config.maxContextTokens - this.config.reservedOutputTokens;
  }

  /**
   * Estimate tokens in text (rough approximation: 1 token ≈ 4 characters)
   */
  estimateTokens(text: string): number {
    // More accurate estimation accounting for:
    // - English: ~4 chars per token
    // - Code: ~2.5 chars per token
    // - Numbers: ~1 char per token

    const avgCharsPerToken = 3.5; // Conservative estimate
    const estimatedTokens = Math.ceil(text.length / avgCharsPerToken);

    return estimatedTokens;
  }

  /**
   * Calculate token usage for a conversation
   */
  calculateUsage(
    systemPromptText: string,
    messages: Array<{ role: string; content: string }>,
    userContextText?: string
  ): TokenUsage {
    const systemPrompt = this.estimateTokens(systemPromptText);
    const conversationHistory = messages.reduce(
      (total, msg) => total + this.estimateTokens(msg.content),
      0
    );
    const userContext = userContextText ? this.estimateTokens(userContextText) : 0;

    const total = systemPrompt + conversationHistory + userContext;
    const available = this.getAvailableTokens();
    const percentUsed = (total / available) * 100;
    const remaining = available - total;

    let status: TokenUsage['status'] = 'ok';
    if (percentUsed >= this.config.criticalThreshold * 100) {
      status = 'critical';
    } else if (percentUsed >= this.config.warningThreshold * 100) {
      status = 'warning';
    }

    if (remaining < 0) {
      status = 'exceeded';
    }

    return {
      systemPrompt,
      conversationHistory,
      userContext,
      total,
      percentUsed,
      remaining,
      status
    };
  }

  /**
   * Check budget status and determine actions
   */
  checkBudget(
    sessionId: string,
    systemPromptText: string,
    messages: Array<{ role: string; content: string }>,
    userContextText?: string,
    newMessageText?: string
  ): BudgetStatus {
    const usage = this.calculateUsage(systemPromptText, messages, userContextText);

    // Store current usage
    this.currentUsage.set(sessionId, usage);

    // Estimate tokens for new message (if provided)
    const estimatedTokensForNewMessage = newMessageText
      ? this.estimateTokens(newMessageText)
      : 0;

    // Calculate what usage would be with new message
    const projectedTotal = usage.total + estimatedTokensForNewMessage;
    const projectedPercent = (projectedTotal / this.getAvailableTokens()) * 100;

    // Determine actions
    const shouldCompress = projectedPercent >= (this.config.compressionThreshold * 100);
    const shouldAlert = usage.status === 'warning' || usage.status === 'critical';
    const canAddMessage = projectedTotal <= this.getAvailableTokens();

    if (shouldCompress) {
      logger.warn('Token budget approaching compression threshold', {
        sessionId,
        currentPercent: usage.percentUsed.toFixed(1),
        projectedPercent: projectedPercent.toFixed(1),
        threshold: (this.config.compressionThreshold * 100).toFixed(0)
      });
    }

    if (!canAddMessage) {
      logger.error('Cannot add message - would exceed token budget', {
        sessionId,
        currentTotal: usage.total,
        newMessageTokens: estimatedTokensForNewMessage,
        projectedTotal,
        available: this.getAvailableTokens()
      });
    }

    return {
      usage,
      shouldCompress,
      shouldAlert,
      canAddMessage,
      estimatedTokensForNewMessage
    };
  }

  /**
   * Get current usage for a session
   */
  getUsage(sessionId: string): TokenUsage | undefined {
    return this.currentUsage.get(sessionId);
  }

  /**
   * Clear usage tracking for a session
   */
  clearUsage(sessionId: string): void {
    this.currentUsage.delete(sessionId);
    logger.debug('Cleared token usage tracking', { sessionId });
  }

  /**
   * Get all sessions approaching limits
   */
  getSessionsApproachingLimit(): Array<{ sessionId: string; usage: TokenUsage }> {
    const approaching: Array<{ sessionId: string; usage: TokenUsage }> = [];

    this.currentUsage.forEach((usage, sessionId) => {
      if (usage.status === 'warning' || usage.status === 'critical') {
        approaching.push({ sessionId, usage });
      }
    });

    return approaching;
  }

  /**
   * Calculate optimal compression target
   * Returns how many tokens should remain after compression
   */
  calculateCompressionTarget(currentTotal: number): number {
    // Target: Reduce to 60% of available tokens
    // This leaves room for growth before next compression
    const targetPercent = 0.60;
    const targetTokens = Math.floor(this.getAvailableTokens() * targetPercent);

    const tokensToRemove = currentTotal - targetTokens;

    logger.info('Calculated compression target', {
      currentTotal,
      targetTokens,
      tokensToRemove,
      targetPercent: (targetPercent * 100).toFixed(0) + '%'
    });

    return tokensToRemove;
  }

  /**
   * Estimate how many messages to compress
   * Given a target token reduction, estimate how many messages should be compressed
   */
  estimateMessagesToCompress(
    messages: Array<{ role: string; content: string }>,
    tokensToRemove: number
  ): number {
    // Sort messages by size (largest first for efficient removal)
    const messageSizes = messages.map((msg, index) => ({
      index,
      tokens: this.estimateTokens(msg.content)
    })).sort((a, b) => b.tokens - a.tokens);

    let removedTokens = 0;
    let messagesToCompress = 0;

    // Keep first 2 messages (context setting)
    // Keep last 6 messages (active conversation)
    const keepFirst = 2;
    const keepLast = 6;
    const compressibleRange = messages.length - keepFirst - keepLast;

    if (compressibleRange <= 0) {
      logger.warn('Not enough messages to compress', {
        totalMessages: messages.length,
        compressibleRange
      });
      return 0;
    }

    // Calculate tokens in compressible range
    for (let i = keepFirst; i < messages.length - keepLast; i++) {
      removedTokens += this.estimateTokens(messages[i].content);
      messagesToCompress++;

      if (removedTokens >= tokensToRemove) {
        break;
      }
    }

    // Account for compression ratio (summary is ~10% of original)
    const compressionRatio = 0.10;
    const summaryTokens = Math.ceil(removedTokens * compressionRatio);
    const netReduction = removedTokens - summaryTokens;

    logger.info('Estimated messages to compress', {
      messagesToCompress,
      removedTokens,
      summaryTokens,
      netReduction,
      targetReduction: tokensToRemove,
      achieved: netReduction >= tokensToRemove
    });

    return messagesToCompress;
  }

  /**
   * Get budget statistics
   */
  getStatistics(): {
    totalSessions: number;
    avgTokensPerSession: number;
    sessionsAtWarning: number;
    sessionsAtCritical: number;
    maxUsagePercent: number;
  } {
    let totalTokens = 0;
    let sessionsAtWarning = 0;
    let sessionsAtCritical = 0;
    let maxUsagePercent = 0;

    this.currentUsage.forEach((usage) => {
      totalTokens += usage.total;

      if (usage.status === 'warning') sessionsAtWarning++;
      if (usage.status === 'critical') sessionsAtCritical++;

      if (usage.percentUsed > maxUsagePercent) {
        maxUsagePercent = usage.percentUsed;
      }
    });

    const totalSessions = this.currentUsage.size;
    const avgTokensPerSession = totalSessions > 0
      ? Math.round(totalTokens / totalSessions)
      : 0;

    return {
      totalSessions,
      avgTokensPerSession,
      sessionsAtWarning,
      sessionsAtCritical,
      maxUsagePercent
    };
  }

  /**
   * Format usage for logging/display
   */
  formatUsage(usage: TokenUsage): string {
    const bar = this.createProgressBar(usage.percentUsed, 20);

    return [
      `Tokens: ${usage.total.toLocaleString()} / ${this.getAvailableTokens().toLocaleString()}`,
      `Usage: ${bar} ${usage.percentUsed.toFixed(1)}%`,
      `Remaining: ${usage.remaining.toLocaleString()} tokens`,
      `Status: ${usage.status.toUpperCase()}`
    ].join('\n');
  }

  /**
   * Create visual progress bar
   */
  private createProgressBar(percent: number, width: number): string {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;

    let bar = '[';
    bar += '█'.repeat(filled);
    bar += '░'.repeat(empty);
    bar += ']';

    return bar;
  }

  /**
   * Get budget warning message
   */
  getBudgetWarningMessage(usage: TokenUsage): string | null {
    if (usage.status === 'ok') {
      return null;
    }

    if (usage.status === 'exceeded') {
      return `⚠️ Token limit exceeded! Using ${usage.total.toLocaleString()} tokens (limit: ${this.getAvailableTokens().toLocaleString()}). Conversation will be automatically compressed.`;
    }

    if (usage.status === 'critical') {
      return `⚠️ Approaching token limit! Using ${usage.percentUsed.toFixed(1)}% of available tokens. Consider compressing conversation history.`;
    }

    if (usage.status === 'warning') {
      return `⚡ Token usage at ${usage.percentUsed.toFixed(1)}%. Conversation may be compressed soon.`;
    }

    return null;
  }
}
