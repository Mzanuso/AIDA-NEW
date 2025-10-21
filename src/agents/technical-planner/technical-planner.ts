/**
 * Technical Planner Agent
 *
 * Decides WHAT to generate and WHICH models to use based on ProjectBrief.
 * Outputs ExecutionPlan for Visual Creator to execute.
 *
 * Responsibilities:
 * - Analyze project requirements
 * - Select optimal AI models
 * - Create execution strategy
 * - Return structured plan
 *
 * @module agents/technical-planner
 */

import type { ProjectBrief } from '../../shared/types/project-brief.types';
import type { ExecutionPlan } from '../../shared/types/execution-plan.types';
import { SmartRouter } from '../../shared/coordination/smart-router';
import { createLogger } from '../../utils/logger';

const logger = createLogger('TechnicalPlanner');

/**
 * TechnicalPlanner - Decision-making agent for visual content generation
 *
 * Takes ProjectBrief, analyzes requirements, selects models, and creates ExecutionPlan.
 */
export class TechnicalPlanner {
  private router: SmartRouter;

  constructor() {
    this.router = new SmartRouter();
    logger.info('Technical Planner initialized');
  }

  /**
   * Create ExecutionPlan from ProjectBrief
   *
   * @param brief - Project requirements from user
   * @returns ExecutionPlan ready for Visual Creator execution
   */
  async plan(brief: ProjectBrief): Promise<ExecutionPlan> {
    logger.info('Creating execution plan', { briefId: brief.id });

    // Validate input
    this.validateBrief(brief);

    // Use Smart Router to select optimal model and workflow
    const strategy = this.router.selectModel(brief);

    logger.info('Model selected', {
      model: strategy.primaryModel.name,
      workflow: strategy.workflow,
      cost: strategy.costBreakdown.totalEstimated
    });

    // Convert ModelSelectionStrategy to ExecutionPlan
    const plan: ExecutionPlan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      brief_id: brief.id,
      target_agent: 'visual_creator',

      // Extract scene descriptions from requirements
      scene_descriptions: this.extractScenes(brief),

      // Build primary prompt from scene descriptions
      prompt: this.extractScenes(brief)[0] || '',

      // Quality tier mapping
      quality_tier: this.mapQualityTier(strategy),

      // Model selection
      primary_model: {
        name: strategy.primaryModel.name,
        model_id: strategy.primaryModel.model_id,
        provider: strategy.primaryModel.provider as any,
        reason: strategy.reasoning.modelChoice,
        estimated_cost: strategy.primaryModel.estimatedCost,
        estimated_time: 12 // Default, will be refined by Visual Creator
      },

      // Fallback models
      fallback_models: strategy.fallbackModel ? [{
        name: strategy.fallbackModel.name,
        model_id: strategy.fallbackModel.model_id,
        provider: strategy.fallbackModel.provider as any,
        reason: 'Fallback if primary unavailable',
        estimated_cost: strategy.fallbackModel.estimatedCost || 0.04,
        estimated_time: 12
      }] : [],

      // Execution approach
      approach: strategy.workflow === 'single-shot' ? 'single_model' :
                strategy.workflow === 'consistency' ? 'multi_step' :
                strategy.workflow === 'parallel-explore' ? 'parallel' : 'single_model',

      // Cost and time estimates
      total_estimated_cost: strategy.costBreakdown.totalEstimated,
      total_estimated_time: 15, // Base estimate

      // Style preferences (map from brief to execution plan format)
      style_preferences: brief.style_preferences ? {
        gallery_selected: brief.style_preferences.gallery_selected?.map(g => g.id),
        custom_description: brief.style_preferences.style_description
      } : undefined,

      // Special instructions
      special_instructions: this.buildSpecialInstructions(brief, strategy),

      // Parameters (defaults, as ProjectBrief doesn't include these yet)
      parameters: {
        aspect_ratio: '1:1',
        output_format: 'png'
      },

      created_at: new Date().toISOString()
    };

    logger.info('Execution plan created', {
      planId: plan.id,
      model: plan.primary_model.name,
      scenes: plan.scene_descriptions?.length || 0,
      cost: plan.total_estimated_cost
    });

    return plan;
  }

  /**
   * Validate ProjectBrief has required fields
   */
  private validateBrief(brief: ProjectBrief): void {
    if (!brief.id || !brief.user_id || !brief.conversation_id) {
      throw new Error('ProjectBrief missing required IDs');
    }

    if (!brief.content_type) {
      throw new Error('ProjectBrief missing content_type');
    }

    if (!brief.requirements || brief.requirements.length === 0) {
      throw new Error('ProjectBrief must have requirements');
    }

    if (!brief.quality_keywords || brief.quality_keywords.length === 0) {
      throw new Error('ProjectBrief must have quality_keywords');
    }
  }

  /**
   * Extract scene descriptions from brief requirements
   */
  private extractScenes(brief: ProjectBrief): string[] {
    // For now, combine all requirements into a single scene description
    // In the future, this could be smarter and detect multiple scenes
    const sceneDescription = brief.requirements.join('. ');

    return [sceneDescription];
  }

  /**
   * Map ModelSelectionStrategy quality to ExecutionPlan QualityTier
   */
  private mapQualityTier(strategy: any): 'fast' | 'standard' | 'premium' {
    const quality = strategy.reasoning.qualityExpectation;

    if (quality === 'acceptable') return 'fast';
    if (quality === 'good') return 'standard';
    if (quality === 'high' || quality === 'premium') return 'premium';

    return 'standard'; // Default
  }

  /**
   * Build special instructions combining brief requirements and strategy optimizations
   */
  private buildSpecialInstructions(brief: ProjectBrief, strategy: any): string {
    const instructions: string[] = [];

    // Add special requirements
    if (brief.special_requirements?.length) {
      instructions.push(`Special requirements: ${brief.special_requirements.join(', ')}`);
    }

    // Add prompt strategy optimizations
    if (strategy.optimizations?.promptStrategy?.length) {
      instructions.push(`Prompt strategy: ${strategy.optimizations.promptStrategy.join(', ')}`);
    }

    // Add reference images if present
    if (brief.style_preferences?.reference_images?.length) {
      instructions.push(`Use ${brief.style_preferences.reference_images.length} reference images for style`);
    }

    return instructions.join('. ') || 'Follow standard generation workflow';
  }
}
