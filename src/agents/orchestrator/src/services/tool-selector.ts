import OpenAI from 'openai';
import { db } from '../../../../utils/db';
import { sql } from 'drizzle-orm';
import { createLogger } from '../../../../utils/logger';
import { Intent, InferredSpecs } from './context-analyzer';
import { ToolPlan, CostCalculator } from '../utils/cost-calculator';

const logger = createLogger('ToolSelector');

interface ToolMatch {
  modelName: string;
  category: string;
  description: string;
  pricing: string;
  similarity: number;
  metadata: Record<string, any>;
}

interface ScoredTool extends ToolMatch {
  scores: {
    qualityMatch: number;
    costEfficiency: number;
    speedFactor: number;
    featureMatch: number;
    overall: number;
  };
}

export class ToolSelector {
  private openai?: OpenAI;
  private costCalculator: CostCalculator;

  constructor(apiKey?: string) {
    // OpenAI is optional - only needed for semantic search with embeddings
    // If not provided, fallback to rule-based tool selection
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (key) {
      this.openai = new OpenAI({ apiKey: key });
      logger.info('ToolSelector initialized with OpenAI for semantic search');
    } else {
      logger.warn('ToolSelector initialized without OpenAI - using fallback tool selection');
    }
    this.costCalculator = new CostCalculator();
  }

  async selectTools(intent: Intent, inferredSpecs: InferredSpecs): Promise<ToolPlan> {
    logger.info('Selecting tools', { intent, inferredSpecs });

    try {
      const matches = await this.queryCatalog(intent);
      if (matches.length === 0) {
        return this.getFallbackToolPlan(intent);
      }

      const scoredTools = this.scoreTools(matches, intent, inferredSpecs);
      const toolPlan = this.buildToolPlan(scoredTools, intent, inferredSpecs);

      return toolPlan;
    } catch (error) {
      logger.error('Tool selection failed', { error });
      return this.getFallbackToolPlan(intent);
    }
  }

  async queryCatalog(intent: Intent): Promise<ToolMatch[]> {
    // TODO: Implement semantic search with OpenAI embeddings
    // For now, return empty array to trigger fallback
    if (!this.openai) {
      logger.debug('OpenAI not available, skipping semantic search');
      return [];
    }

    // Semantic search implementation (when OpenAI is available)
    return [];
  }

  private scoreTools(matches: ToolMatch[], intent: Intent, specs: InferredSpecs): ScoredTool[] {
    return matches.map(match => ({
      ...match,
      scores: {
        qualityMatch: 0.8,
        costEfficiency: 0.7,
        speedFactor: 0.6,
        featureMatch: 0.9,
        overall: 0.75
      }
    }));
  }

  private buildToolPlan(scoredTools: ScoredTool[], intent: Intent, specs: InferredSpecs): ToolPlan {
    return {
      duration: specs.duration || '10s',
      qualityLevel: specs.qualityLevel || 'medium'
    };
  }

  private getFallbackToolPlan(intent: Intent): ToolPlan {
    const plan: ToolPlan = {
      duration: '10s',
      qualityLevel: 'medium'
    };

    if (intent.mediaType === 'video') {
      plan.videoGenerator = intent.hasScript ? 'sora-2-pro' : 'veo-3';
    }

    if (intent.mediaType === 'image') {
      plan.imageGenerator = intent.purpose === 'brand' ? 'recraft-v3' : 'flux-dev';
      plan.imageCount = 1;
    }

    return plan;
  }
}
