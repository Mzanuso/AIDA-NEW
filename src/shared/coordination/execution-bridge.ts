/**
 * Visual Creator Bridge
 * 
 * Bridges Technical Planner's ExecutionPlan to Visual Creator's workflow system.
 * Converts ExecutionPlan → UniversalPrompt → ModelSelectionStrategy → WorkflowExecutionPlan
 * 
 * @module agents/visual-creator/visual-creator-bridge
 */

import type {
  ExecutionPlan,
  WorkflowExecutionPlan,
  ModelConfig
} from '../types';
import type { UniversalPrompt } from '../../agents/visual-creator/prompt-adapter.interface';
import { SmartRouter } from './smart-router';
import { WorkflowOrchestrator } from './workflow-orchestrator';

/**
 * Visual Creator Bridge
 * 
 * Converts Technical Planner's ExecutionPlan into Visual Creator's WorkflowExecutionPlan.
 */
export class VisualCreatorBridge {
  private smartRouter: SmartRouter;
  private orchestrator: WorkflowOrchestrator;

  /**
   * Supported model IDs (from ADAPTER_REGISTRY in workflow-orchestrator)
   */
  private readonly SUPPORTED_MODELS = [
    'midjourney-v6',
    'flux-pro-1.1',
    'flux-schnell',
    'seedream-4.0',
    'hunyuan-video',
    'recraft-v3',
    'ideogram-v2'
  ];

  constructor() {
    this.smartRouter = new SmartRouter();
    this.orchestrator = new WorkflowOrchestrator();
  }

  /**
   * Process ExecutionPlan and generate WorkflowExecutionPlan for each scene
   * 
   * @param plan - ExecutionPlan from Technical Planner
   * @returns Array of WorkflowExecutionPlan (one per scene)
   */
  async process(plan: ExecutionPlan): Promise<WorkflowExecutionPlan[]> {
    // Validate input
    this.validateExecutionPlan(plan);

    // Extract and filter scene descriptions
    const scenes = this.extractScenes(plan);

    if (scenes.length === 0) {
      throw new Error('No valid scene descriptions found in ExecutionPlan');
    }

    // Process each scene
    const workflows: WorkflowExecutionPlan[] = [];

    for (const scene of scenes) {
      try {
        // Convert scene → UniversalPrompt
        const universalPrompt = this.sceneToUniversalPrompt(scene, plan);

        // Convert ExecutionPlan model to ModelConfig
        const modelConfig = this.executionModelToModelConfig(plan.primary_model);

        // Determine workflow type
        const workflowType = this.determineWorkflowType(plan, scenes.length);

        // Create ModelSelectionStrategy manually (bypass Smart Router for now)
        const strategy = {
          primaryModel: modelConfig,
          fallbackModels: plan.fallback_models?.map(m => 
            this.executionModelToModelConfig(m)
          ) || [],
          workflowType,
          reasoning: plan.primary_model.reason,
          qualityTier: plan.quality_tier
        };

        // Generate workflow plan
        const workflowPlan = await this.orchestrator.generateWorkflowPlan(
          strategy,
          universalPrompt
        );

        workflows.push(workflowPlan);
      } catch (error) {
        console.error(`Failed to process scene: ${scene}`, error);
        throw new Error(`Scene processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return workflows;
  }

  /**
   * Validate ExecutionPlan has required fields
   */
  private validateExecutionPlan(plan: ExecutionPlan): void {
    if (!plan) {
      throw new Error('ExecutionPlan is required');
    }

    if (plan.target_agent !== 'visual_creator') {
      throw new Error('ExecutionPlan target_agent must be visual_creator');
    }

    if (!plan.scene_descriptions || plan.scene_descriptions.length === 0) {
      throw new Error('ExecutionPlan must have scene_descriptions for visual content');
    }

    if (!plan.primary_model) {
      throw new Error('ExecutionPlan must have primary_model');
    }

    if (!plan.quality_tier) {
      throw new Error('ExecutionPlan must have quality_tier');
    }

    // Validate model ID is supported
    if (plan.primary_model.model_id && !this.SUPPORTED_MODELS.includes(plan.primary_model.model_id)) {
      throw new Error(
        `Unsupported model: ${plan.primary_model.model_id}. ` +
        `Supported models: ${this.SUPPORTED_MODELS.join(', ')}`
      );
    }
  }

  /**
   * Extract and filter valid scene descriptions
   */
  private extractScenes(plan: ExecutionPlan): string[] {
    if (!plan.scene_descriptions) {
      return [];
    }

    return plan.scene_descriptions
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Convert scene description to UniversalPrompt
   */
  private sceneToUniversalPrompt(
    sceneDescription: string,
    plan: ExecutionPlan
  ): UniversalPrompt {
    // Parse scene description to extract components
    const parsed = this.parseSceneDescription(sceneDescription);

    // Build UniversalPrompt
    const universalPrompt: UniversalPrompt = {
      subject: parsed.subject,
      action: parsed.action,
      environment: parsed.environment,
      photographyStyle: parsed.photographyStyle,
      mood: parsed.mood,
      lighting: parsed.lighting,
      shotType: parsed.shotType,
      aspectRatio: this.extractAspectRatio(plan),
      quality: plan.quality_tier === 'fast' ? 'budget' : 
               plan.quality_tier === 'standard' ? 'standard' : 'premium',
      technicalDetails: parsed.technicalDetails
    };

    // Add style preferences if available
    if (plan.style_preferences) {
      if (plan.style_preferences.custom_description) {
        universalPrompt.photographyStyle = plan.style_preferences.custom_description;
      }
    }

    // Add special instructions as technical details
    if (plan.special_instructions) {
      universalPrompt.technicalDetails = 
        (universalPrompt.technicalDetails ? universalPrompt.technicalDetails + ', ' : '') +
        plan.special_instructions;
    }

    return universalPrompt;
  }

  /**
   * Parse scene description into components
   * 
   * Uses simple keyword extraction. In production, could use NLP.
   */
  private parseSceneDescription(description: string): {
    subject: string;
    action?: string;
    environment?: string;
    photographyStyle?: string;
    mood?: string;
    lighting?: string;
    shotType?: string;
    technicalDetails?: string;
  } {
    const lower = description.toLowerCase();

    // Extract subject (first noun phrase, simplified)
    const words = description.split(' ');
    const subject = words.slice(0, 3).join(' '); // First 3 words as subject

    // Detect action verbs
    const actionVerbs = ['standing', 'sitting', 'walking', 'running', 'working', 'smiling', 'looking'];
    const action = actionVerbs.find(v => lower.includes(v));

    // Detect environments
    const environments = ['office', 'studio', 'outdoor', 'forest', 'beach', 'city', 'indoor', 'room'];
    const environment = environments.find(e => lower.includes(e));

    // Detect lighting
    const lightingKeywords = ['natural', 'soft', 'dramatic', 'golden hour', 'window light', 'studio'];
    const lighting = lightingKeywords.find(l => lower.includes(l));

    // Detect shot types
    const shotTypes = ['close-up', 'wide shot', 'medium shot', 'portrait', 'full body'];
    const shotType = shotTypes.find(s => lower.includes(s));

    // Detect photography styles
    const styles = ['editorial', 'documentary', 'fashion', 'portrait', 'commercial'];
    const photographyStyle = styles.find(s => lower.includes(s));

    // Detect mood
    const moods = ['confident', 'serene', 'energetic', 'professional', 'warm', 'cold'];
    const mood = moods.find(m => lower.includes(m));

    return {
      subject,
      action,
      environment,
      lighting,
      shotType,
      photographyStyle,
      mood
    };
  }

  /**
   * Extract aspect ratio from ExecutionPlan parameters
   */
  private extractAspectRatio(plan: ExecutionPlan): string {
    if (plan.parameters?.aspect_ratio) {
      return plan.parameters.aspect_ratio;
    }

    // Default based on quality tier
    return plan.quality_tier === 'premium' ? '16:9' : '1:1';
  }

  /**
   * Convert ExecutionPlan ModelSelection to Visual Creator ModelConfig
   */
  private executionModelToModelConfig(model: any): ModelConfig {
    return {
      id: model.model_id,
      name: model.name,
      provider: model.provider.toLowerCase().replace('.', ''),
      tier: this.inferTierFromCost(model.estimated_cost),
      costPerGeneration: model.estimated_cost,
      averageTime: model.estimated_time,
      supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'], // Default set
      capabilities: {}
    };
  }

  /**
   * Infer tier from cost
   */
  private inferTierFromCost(cost: number): 'budget' | 'standard' | 'premium' {
    if (cost < 0.01) return 'budget';
    if (cost < 0.05) return 'standard';
    return 'premium';
  }

  /**
   * Determine workflow type based on ExecutionPlan
   */
  private determineWorkflowType(plan: ExecutionPlan, sceneCount: number): any {
    // Check for character consistency
    if (plan.special_instructions?.toLowerCase().includes('consistency') ||
        plan.special_instructions?.toLowerCase().includes('character')) {
      return 'consistency';
    }

    // Check for text rendering
    if (plan.special_instructions?.toLowerCase().includes('text')) {
      return 'text-composite';
    }

    // Default to single-shot
    return 'single-shot';
  }
}
