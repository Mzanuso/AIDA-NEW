import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../../../../utils/logger';
import { ConversationContext, Intent, InferredSpecs } from './context-analyzer';
import { INTENT_ANALYSIS_PROMPT } from '../config/personality-prompt';

const logger = createLogger('IntentAnalyzer');

/**
 * Intent extraction result with confidence scores
 */
interface IntentAnalysisResult extends Intent {
  inferredSpecs: InferredSpecs;
  confidence: {
    purpose: number;
    platform: number;
    style: number;
    overall: number;
  };
  reasoning: string;
}

/**
 * Intent Analyzer
 * 
 * Uses Claude to analyze user messages and extract structured intent.
 * Performs psychological reading to understand implicit needs.
 */
export class IntentAnalyzer {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY!
    });
  }

  /**
   * Analyze user message and extract intent
   */
  async analyze(
    message: string,
    context: ConversationContext
  ): Promise<IntentAnalysisResult> {
    logger.info('Analyzing intent', {
      sessionId: context.sessionId,
      messageLength: message.length
    });

    try {
      const prompt = this.buildAnalysisPrompt(message, context);

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        temperature: 0.3, // Lower temp for more deterministic intent extraction
        system: INTENT_ANALYSIS_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse JSON response
      const result = this.parseIntentResponse(content.text);

      logger.info('Intent analyzed', {
        sessionId: context.sessionId,
        purpose: result.purpose,
        platform: result.platform,
        confidence: result.confidence.overall
      });

      return result;
    } catch (error) {
      logger.error('Intent analysis failed', {
        sessionId: context.sessionId,
        error
      });

      // Return default intent on error
      return this.getDefaultAnalysisResult();
    }
  }

  /**
   * Build analysis prompt with conversation context
   */
  private buildAnalysisPrompt(
    message: string,
    context: ConversationContext
  ): string {
    const conversationHistory = context.messages
      .slice(-5) // Last 5 messages for context
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    return `ANALYZE THIS MESSAGE:
"${message}"

CONVERSATION HISTORY:
${conversationHistory || 'No previous messages'}

CURRENT DETECTED INTENT (may be incomplete):
${JSON.stringify(context.detectedIntent, null, 2)}

Extract and update the user's intent based on this new message.
Focus on NEW information revealed in this message.
Be conservative with confidence - if uncertain, mark as "unknown".

Return JSON only, no other text.`;
  }

  /**
   * Parse Claude's JSON response
   */
  private parseIntentResponse(text: string): IntentAnalysisResult {
    try {
      // Extract JSON from response (Claude sometimes adds explanation)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and normalize
      return {
        purpose: this.normalizeEnum(parsed.purpose, [
          'brand',
          'personal',
          'tutorial',
          'entertainment',
          'marketing',
          'unknown'
        ]),
        platform: this.normalizeEnum(parsed.platform, [
          'instagram',
          'tiktok',
          'youtube',
          'website',
          'linkedin',
          'unknown'
        ]),
        style: this.normalizeEnum(parsed.style, [
          'cinematic',
          'casual',
          'minimalist',
          'energetic',
          'professional',
          'unknown'
        ]),
        mediaType: this.normalizeEnum(parsed.mediaType, [
          'image',
          'video',
          'music',
          'mixed',
          'unknown'
        ]),
        budgetSensitivity: this.normalizeEnum(parsed.budgetSensitivity, [
          'low',
          'medium',
          'high',
          'unknown'
        ]),
        hasScript: Boolean(parsed.hasScript),
        hasVisuals: Boolean(parsed.hasVisuals),
        inferredSpecs: this.normalizeSpecs(parsed.inferredSpecs || {}),
        confidence: {
          purpose: this.normalizeConfidence(parsed.confidence?.purpose),
          platform: this.normalizeConfidence(parsed.confidence?.platform),
          style: this.normalizeConfidence(parsed.confidence?.style),
          overall: this.calculateOverallConfidence(parsed.confidence || {})
        },
        reasoning: parsed.reasoning || 'No reasoning provided'
      };
    } catch (error) {
      logger.error('Failed to parse intent response', { error, text });
      return this.getDefaultAnalysisResult();
    }
  }

  /**
   * Normalize enum values (ensure valid)
   */
  private normalizeEnum<T extends string>(
    value: any,
    validValues: T[]
  ): T {
    const normalized = String(value).toLowerCase();
    return validValues.includes(normalized as T)
      ? (normalized as T)
      : (validValues[validValues.length - 1] as T); // Default to last (usually 'unknown')
  }

  /**
   * Normalize confidence score (0.0-1.0)
   */
  private normalizeConfidence(value: any): number {
    const num = Number(value);
    if (isNaN(num)) return 0.0;
    return Math.max(0.0, Math.min(1.0, num));
  }

  /**
   * Calculate overall confidence from individual scores
   */
  private calculateOverallConfidence(confidence: Record<string, any>): number {
    const scores = [
      confidence.purpose,
      confidence.platform,
      confidence.style
    ].map(this.normalizeConfidence);

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Normalize inferred specs
   */
  private normalizeSpecs(specs: any): InferredSpecs {
    const normalized: InferredSpecs = {};

    // Aspect ratio
    const validAspectRatios = ['16:9', '9:16', '1:1', '4:3'];
    if (specs.aspectRatio && validAspectRatios.includes(specs.aspectRatio)) {
      normalized.aspectRatio = specs.aspectRatio;
    }

    // Duration
    if (specs.duration && typeof specs.duration === 'string') {
      normalized.duration = specs.duration;
    }

    // Resolution
    const validResolutions = ['720p', '1080p', '4K'];
    if (specs.resolution && validResolutions.includes(specs.resolution)) {
      normalized.resolution = specs.resolution;
    }

    // Quality level
    const validQuality = ['high', 'medium', 'fast'];
    if (specs.qualityLevel && validQuality.includes(specs.qualityLevel)) {
      normalized.qualityLevel = specs.qualityLevel;
    }

    return normalized;
  }

  /**
   * Get default analysis result (fallback)
   */
  private getDefaultAnalysisResult(): IntentAnalysisResult {
    return {
      purpose: 'unknown',
      platform: 'unknown',
      style: 'unknown',
      mediaType: 'unknown',
      budgetSensitivity: 'unknown',
      hasScript: false,
      hasVisuals: false,
      inferredSpecs: {},
      confidence: {
        purpose: 0.0,
        platform: 0.0,
        style: 0.0,
        overall: 0.0
      },
      reasoning: 'Failed to analyze intent'
    };
  }

  /**
   * Merge new intent with existing context intent
   * (Keep highest confidence values)
   */
  mergeIntent(
    existing: Intent,
    newIntent: IntentAnalysisResult,
    existingConfidence: Record<string, number> = {}
  ): Intent {
    const merged: Intent = { ...existing };

    // Update each field if new confidence is higher
    const fields: (keyof Intent)[] = [
      'purpose',
      'platform',
      'style',
      'mediaType',
      'budgetSensitivity'
    ];

    fields.forEach(field => {
      const newConf = newIntent.confidence[field as keyof typeof newIntent.confidence] || 0;
      const oldConf = existingConfidence[field] || 0;

      if (newConf > oldConf && newIntent[field] !== 'unknown') {
        (merged as any)[field] = newIntent[field];
      }
    });

    // Boolean fields: update if new has true
    if (newIntent.hasScript) {
      merged.hasScript = true;
    }
    if (newIntent.hasVisuals) {
      merged.hasVisuals = true;
    }

    return merged;
  }

  /**
   * Infer additional specs based on intent
   * (Apply common sense rules)
   */
  inferAdditionalSpecs(intent: Intent): Partial<InferredSpecs> {
    const specs: Partial<InferredSpecs> = {};

    // Platform-based inferences
    if (intent.platform === 'instagram' || intent.platform === 'tiktok') {
      specs.aspectRatio = '9:16'; // Vertical for social
      specs.duration = intent.platform === 'tiktok' ? '10-15s' : '15-30s';
    } else if (intent.platform === 'youtube') {
      specs.aspectRatio = '16:9'; // Horizontal for YouTube
      specs.duration = '30-60s'; // Longer form
    }

    // Purpose-based inferences
    if (intent.purpose === 'brand' || intent.purpose === 'marketing') {
      specs.qualityLevel = 'high'; // Brands want quality
    } else if (intent.purpose === 'personal') {
      specs.qualityLevel = 'medium'; // Balance quality/cost
    }

    // Style-based inferences
    if (intent.style === 'cinematic') {
      specs.qualityLevel = 'high';
      specs.resolution = '1080p';
    } else if (intent.style === 'casual') {
      specs.qualityLevel = 'medium';
      specs.resolution = '720p';
    }

    // Budget-based inferences
    if (intent.budgetSensitivity === 'low') {
      specs.qualityLevel = 'fast'; // Prioritize cost
    } else if (intent.budgetSensitivity === 'high') {
      specs.qualityLevel = 'high'; // Budget not a concern
    }

    return specs;
  }
}
