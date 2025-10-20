/**
 * Smart Router - Model Selection Decision System
 *
 * Analyzes ProjectBrief and selects optimal AI model + workflow.
 * Follows 3-level decision tree:
 *   1. Special Requirements (absolute priority)
 *   2. Quality Tier + Content Type
 *   3. Budget Constraints
 *
 * @module agents/visual-creator/smart-router
 */

import type { ProjectBrief } from '../types/project-brief.types';
import type { ModelSelectionStrategy } from '../types/model-strategy.types';
import { MODEL_CATALOG, type ModelSpec, QUALITY_TIERS } from './model-catalog';

/**
 * SmartRouter - Intelligent model selection engine
 */
export class SmartRouter {
  /**
   * Select optimal model and workflow based on project requirements
   *
   * @param brief - Project requirements from Orchestrator
   * @returns Complete model selection strategy
   * @throws Error if brief is invalid
   */
  selectModel(brief: ProjectBrief): ModelSelectionStrategy {
    // Validate input
    this.validateBrief(brief);

    // LEVEL 1: Special Requirements (absolute priority)
    const specialReq = this.checkSpecialRequirements(brief);
    if (specialReq) return specialReq;

    // LEVEL 2: Quality Tier + Content Type
    const qualityTier = this.inferQualityTier(brief);
    const contentAnalysis = this.analyzeContentType(brief);

    // LEVEL 3: Select model based on tier + content
    const modelKey = this.selectModelByTier(qualityTier, contentAnalysis, brief);
    const modelSpec = MODEL_CATALOG[modelKey];

    // Apply budget constraints (returns [model, wasDowngraded])
    const [finalModel, wasDowngraded] = this.applyBudgetConstraints(modelSpec, brief);

    // Build strategy
    return this.buildStrategy(finalModel, brief, qualityTier, undefined, wasDowngraded);
  }

  /**
   * Validate project brief
   */
  private validateBrief(brief: ProjectBrief): void {
    if (!brief.id || !brief.user_id || !brief.conversation_id) {
      throw new Error('Invalid ProjectBrief: missing required fields');
    }
    if (!brief.requirements || brief.requirements.length === 0) {
      throw new Error('Invalid ProjectBrief: requirements cannot be empty');
    }
  }

  /**
   * LEVEL 1: Check for special requirements that override everything
   */
  private checkSpecialRequirements(brief: ProjectBrief): ModelSelectionStrategy | null {
    const special = brief.special_requirements || [];

    // Vector output → ONLY Recraft v3
    if (special.includes('vectorOutput')) {
      return this.buildStrategy(
        MODEL_CATALOG.RECRAFT_V3,
        brief,
        'standard',
        'vector output requires native SVG generation capability'
      );
    }

    // Character consistency → Seedream 4.0 with multi-step workflow
    if (special.includes('characterConsistency') || special.includes('multipleScenes')) {
      return this.buildConsistencyStrategy(brief);
    }

    // Text rendering → Ideogram v2
    if (special.includes('textRendering')) {
      return this.buildStrategy(
        MODEL_CATALOG.IDEOGRAM_V2,
        brief,
        'premium',
        'Critical text rendering requires typography specialist'
      );
    }

    return null;
  }

  /**
   * Infer quality tier from keywords
   */
  private inferQualityTier(brief: ProjectBrief): 'budget' | 'standard' | 'premium' {
    const keywords = brief.quality_keywords.map((k) => k.toLowerCase());

    // Budget indicators
    const budgetKeywords = ['fast', 'draft', 'quick', 'cheap', 'budget'];
    if (keywords.some((k) => budgetKeywords.includes(k))) {
      return 'budget';
    }

    // Premium indicators
    const premiumKeywords = [
      'premium',
      'high-quality',
      'professional',
      'photorealistic',
      'cinematic',
      'ultra',
      'best',
    ];
    if (keywords.some((k) => premiumKeywords.includes(k))) {
      return 'premium';
    }

    return 'standard';
  }

  /**
   * Analyze content type from requirements
   */
  private analyzeContentType(brief: ProjectBrief): string {
    const reqs = brief.requirements.join(' ').toLowerCase();

    if (reqs.includes('portrait') || reqs.includes('headshot')) return 'portrait';
    if (reqs.includes('product')) return 'product';
    if (reqs.includes('fashion')) return 'fashion';
    if (reqs.includes('logo') || reqs.includes('icon')) return 'vector';
    if (reqs.includes('poster') || reqs.includes('cover')) return 'text_design';

    return 'general';
  }

  /**
   * Select model based on quality tier and content analysis
   */
  private selectModelByTier(
    tier: 'budget' | 'standard' | 'premium',
    content: string,
    brief: ProjectBrief
  ): string {
    // Budget tier → Always FLUX Schnell
    if (tier === 'budget') return 'FLUX_SCHNELL';

    // Content-specific routing (takes priority over tier)
    if (content === 'vector') return 'RECRAFT_V3';
    if (content === 'text_design') return 'IDEOGRAM_V2';

    // Premium tier → Best quality models
    if (tier === 'premium') {
      // Check if gallery selected (requires artistic model)
      const hasArtisticRequirement = brief.style_preferences?.gallery_selected?.some(
        (g) => g.requires_artistic_model
      );
      if (hasArtisticRequirement) {
        return 'MIDJOURNEY_V7';
      }
      return 'FLUX_PRO_ULTRA';
    }

    // Standard tier → Balanced option
    return 'FLUX_PRO_ULTRA';
  }

  /**
   * Apply budget constraints and downgrade if necessary
   * Returns [model, wasDowngraded]
   */
  private applyBudgetConstraints(modelSpec: ModelSpec, brief: ProjectBrief): [ModelSpec, boolean] {
    const budget = brief.budget_constraints;
    if (!budget || !budget.max_cost) return [modelSpec, false];

    // Extract max cost per image
    const maxCost = (budget as any).max_cost_per_image || budget.max_cost;

    // If model cost exceeds budget, downgrade
    if (modelSpec.cost_per_image > maxCost) {
      // Find most expensive model that fits budget
      const affordable = Object.values(MODEL_CATALOG)
        .filter((m) => m.cost_per_image <= maxCost)
        .sort((a, b) => b.cost_per_image - a.cost_per_image)[0];

      return [affordable || MODEL_CATALOG.FLUX_SCHNELL, true];
    }

    return [modelSpec, false];
  }

  /**
   * Build final strategy object
   */
  private buildStrategy(
    model: ModelSpec,
    brief: ProjectBrief,
    tier: 'budget' | 'standard' | 'premium',
    customReason?: string,
    wasDowngraded: boolean = false
  ): ModelSelectionStrategy {
    const cost = model.cost_per_image;
    const budget = brief.budget_constraints;
    const maxCost = budget ? (budget as any).max_cost_per_image || budget.max_cost : undefined;
    const withinBudget = !maxCost || cost <= maxCost;

    const tradeoffs: string[] = [];
    if (wasDowngraded || (budget && budget.type === 'hard_limit')) {
      tradeoffs.push('budget');
    }

    // Build prompt strategy array
    const promptStrategy = this.buildPromptStrategy(model, brief);

    return {
      primaryModel: {
        name: model.name,
        provider: model.provider,
        model_id: model.model_id,
        estimatedCost: cost,
      },
      fallbackModel: this.selectFallback(model),
      workflow: 'single-shot',
      costBreakdown: {
        totalEstimated: cost,
        withinBudget,
      },
      optimizations: {
        promptStrategy,
      },
      reasoning: {
        modelChoice: customReason || `Selected ${model.name} for ${tier} quality tier`,
        qualityExpectation: QUALITY_TIERS[tier].expected_quality,
        tradeoffs: tradeoffs.length > 0 ? tradeoffs : undefined,
      },
    };
  }

  /**
   * Build character consistency workflow strategy
   */
  private buildConsistencyStrategy(brief: ProjectBrief): ModelSelectionStrategy {
    const seedream = MODEL_CATALOG.SEEDREAM_4;

    return {
      primaryModel: {
        name: seedream.name,
        provider: seedream.provider,
        model_id: seedream.model_id,
        estimatedCost: seedream.cost_per_image,
      },
      workflow: 'consistency',
      steps: [
        {
          step_number: 1,
          model: 'FLUX Pro 1.1 Ultra',
          description: 'Generate base character',
          output_usage: 'Reference for subsequent steps',
        },
        {
          step_number: 2,
          model: 'Extract reference',
          description: 'Save character features',
          output_usage: 'Input to Seedream',
        },
        {
          step_number: 3,
          model: 'Seedream 4.0',
          description: 'Generate variations',
          output_usage: 'Final outputs',
        },
        {
          step_number: 4,
          model: 'Quality check',
          description: 'Verify consistency',
          output_usage: 'Refinement if needed',
        },
      ],
      costBreakdown: {
        totalEstimated: seedream.cost_per_image * 3, // Rough estimate
        withinBudget: true,
      },
      optimizations: {
        promptStrategy: [
          'Modular prompts with reference preservation',
          'Use "preserve [features]" keywords',
        ],
      },
      reasoning: {
        modelChoice:
          'Seedream 4.0 selected for 94% character consistency guarantee across multiple scenes',
        qualityExpectation: 'high',
        tradeoffs: [],
      },
    };
  }

  /**
   * Select appropriate fallback model
   */
  private selectFallback(primary: ModelSpec): ModelSelectionStrategy['fallbackModel'] {
    // Premium models → fallback to FLUX Pro
    if (primary.cost_per_image > 0.05) {
      return {
        name: MODEL_CATALOG.FLUX_PRO_ULTRA.name,
        provider: MODEL_CATALOG.FLUX_PRO_ULTRA.provider,
        model_id: MODEL_CATALOG.FLUX_PRO_ULTRA.model_id,
        triggerConditions: ['primary unavailable', 'primary timeout', 'API error'],
      };
    }

    // Others → fallback to FLUX Schnell
    return {
      name: MODEL_CATALOG.FLUX_SCHNELL.name,
      provider: MODEL_CATALOG.FLUX_SCHNELL.provider,
      model_id: MODEL_CATALOG.FLUX_SCHNELL.model_id,
      triggerConditions: ['primary unavailable'],
    };
  }

  /**
   * Build prompt strategy based on model and brief
   */
  private buildPromptStrategy(model: ModelSpec, brief: ProjectBrief): string[] {
    const strategies: string[] = [];

    // Base strategy from model
    if (model.prompt_style === 'natural_language') {
      strategies.push('natural language');
    } else if (model.prompt_style === 'structured') {
      strategies.push('structured');
    } else if (model.prompt_style === 'parameters') {
      strategies.push('Midjourney parameters');
    }

    // Text rendering models need quoted text
    if (model.name.includes('Ideogram')) {
      strategies.push('quoted text');
    }

    // Reference images
    if (brief.style_preferences?.reference_images?.length) {
      strategies.push('image-to-image');
    }

    return strategies;
  }
}
