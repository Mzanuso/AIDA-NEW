/**
 * Workflow Orchestrator - Visual Creator Conductor
 * 
 * Orchestrates multi-step image generation workflows by:
 * 1. Taking ModelSelectionStrategy from Smart Router
 * 2. Applying appropriate Prompt Adapters
 * 3. Sequencing steps based on workflow type
 * 4. Managing dependencies and parallelization
 * 5. Estimating costs and time
 * 
 * @module agents/visual-creator/workflow-orchestrator
 */

import type {
  ModelSelectionStrategy,
  ModelConfig,
  WorkflowExecutionPlan,
  WorkflowStep
} from '../types';
import type { UniversalPrompt } from '../../agents/visual-creator/prompt-adapter.interface';
import type { PromptAdapter } from '../../agents/visual-creator/prompt-adapter.interface';
import { v4 as uuidv4 } from 'uuid';

// Import adapters
import { MidjourneyAdapter } from '../../agents/visual-creator/adapters/midjourney-adapter';
import { FluxProAdapter } from '../../agents/visual-creator/adapters/flux-pro-adapter';
import { FluxSchnellAdapter } from '../../agents/visual-creator/adapters/flux-schnell-adapter';
import { SeedreamAdapter } from '../../agents/visual-creator/adapters/seedream-adapter';
import { HunyuanAdapter } from '../../agents/visual-creator/adapters/hunyuan-adapter';
import { RecraftAdapter } from '../../agents/visual-creator/adapters/recraft-adapter';
import { IdeogramAdapter } from '../../agents/visual-creator/adapters/ideogram-adapter';

/**
 * Adapter registry mapping model IDs to adapter instances
 */
const ADAPTER_REGISTRY: Record<string, PromptAdapter> = {
  'midjourney-v6': new MidjourneyAdapter(),
  'flux-pro-1.1': new FluxProAdapter(),
  'flux-schnell': new FluxSchnellAdapter(),
  'seedream-4.0': new SeedreamAdapter(),
  'hunyuan-video': new HunyuanAdapter(),
  'recraft-v3': new RecraftAdapter(),
  'ideogram-v2': new IdeogramAdapter(),
};

/**
 * WorkflowOrchestrator - Coordinates complex multi-step workflows
 */
export class WorkflowOrchestrator {
  /**
   * Generate complete workflow execution plan
   * 
   * @param strategy - Model selection from Smart Router
   * @param prompt - Universal prompt to translate
   * @returns Complete workflow plan with steps, cost, time
   */
  async generateWorkflowPlan(
    strategy: ModelSelectionStrategy,
    prompt: UniversalPrompt
  ): Promise<WorkflowExecutionPlan> {
    // Validate inputs
    this.validateInputs(strategy, prompt);

    // Generate workflow ID
    const workflowId = uuidv4();

    // Route to appropriate workflow generator
    let steps: WorkflowStep[];
    
    switch (strategy.workflow) {
      case 'single-shot':
        steps = await this.generateSingleShotWorkflow(strategy, prompt);
        break;

      case 'consistency':
        steps = await this.generateConsistencyWorkflow(strategy, prompt);
        break;

      case 'text-composite':
        steps = await this.generateTextCompositeWorkflow(strategy, prompt);
        break;

      case 'parallel-explore':
        steps = await this.generateParallelExploreWorkflow(strategy, prompt);
        break;

      default:
        throw new Error(`Unsupported workflow type: ${strategy.workflow}`);
    }

    // Calculate totals
    const { estimatedTime, estimatedCost } = this.calculateTotals(
      steps,
      strategy.workflow
    );

    // Build final plan
    return {
      workflowId,
      workflowType: strategy.workflow,
      steps,
      estimatedTime,
      estimatedCost,
      reasoning: this.buildWorkflowReasoning(strategy, steps),
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Single-Shot: Generate 1 image immediately
   */
  private async generateSingleShotWorkflow(
    strategy: ModelSelectionStrategy,
    prompt: UniversalPrompt
  ): Promise<WorkflowStep[]> {
    const model = strategy.primaryModel;
    const translatedPrompt = await this.translatePrompt(model.model_id, prompt);

    return [{
      stepId: 'step-001',
      model: model.model_id,
      prompt: translatedPrompt,
      parameters: this.extractParameters(translatedPrompt),
      estimatedTime: 30, // Default 30s
      estimatedCost: model.estimatedCost
    }];
  }

  /**
   * Consistency: Generate 3-5 variants with same character
   */
  private async generateConsistencyWorkflow(
    strategy: ModelSelectionStrategy,
    prompt: UniversalPrompt
  ): Promise<WorkflowStep[]> {
    const model = strategy.primaryModel;
    const variantCount = 3; // Default to 3 variants
    const steps: WorkflowStep[] = [];

    // Step 1: Generate base/reference image
    const basePrompt = await this.translatePrompt(model.model_id, prompt);
    steps.push({
      stepId: 'base-generation',
      model: model.model_id,
      prompt: basePrompt,
      parameters: this.extractParameters(basePrompt),
      estimatedTime: 30,
      estimatedCost: model.estimatedCost
    });

    // Steps 2-N: Generate variants using step-1 as reference
    for (let i = 2; i <= variantCount; i++) {
      const variantPrompt = await this.translatePrompt(model.model_id, prompt);

      steps.push({
        stepId: `variant-${i}`,
        model: model.model_id,
        prompt: variantPrompt,
        parameters: this.extractParameters(variantPrompt),
        dependencies: ['base-generation'], // Wait for reference image
        referenceImages: ['base-generation'], // Reference to base step
        estimatedTime: 30,
        estimatedCost: model.estimatedCost
      });
    }

    return steps;
  }

  /**
   * Text-Composite: Generate base + text overlay
   */
  private async generateTextCompositeWorkflow(
    strategy: ModelSelectionStrategy,
    prompt: UniversalPrompt
  ): Promise<WorkflowStep[]> {
    const baseModel = strategy.primaryModel;
    
    // Find Ideogram in fallbacks or use primary for text overlay
    // Note: fallbackModel is single, and ModelConfig doesn't have capabilities
    // So we hardcode Ideogram for text rendering
    const textModel = this.getIdeogramModel() || baseModel;

    // Step 1: Generate base image (without text)
    const basePrompt = { ...prompt };
    delete basePrompt.textOverlay;
    const translatedBase = await this.translatePrompt(baseModel.model_id, basePrompt);

    // Step 2: Add text overlay using text specialist
    const translatedText = await this.translatePrompt(textModel.model_id, prompt);

    return [
      {
        stepId: 'base-generation',
        model: baseModel.model_id,
        prompt: translatedBase,
        parameters: this.extractParameters(translatedBase),
        estimatedTime: 30,
        estimatedCost: baseModel.estimatedCost
      },
      {
        stepId: 'text-overlay',
        model: textModel.model_id,
        prompt: translatedText,
        parameters: this.extractParameters(translatedText),
        dependencies: ['base-generation'], // Sequential: wait for base
        referenceImages: ['base-generation'], // Use base as reference
        estimatedTime: 30,
        estimatedCost: textModel.estimatedCost
      }
    ];
  }

  /**
   * Parallel-Explore: Generate 4 variants with different models
   */
  private async generateParallelExploreWorkflow(
    strategy: ModelSelectionStrategy,
    prompt: UniversalPrompt
  ): Promise<WorkflowStep[]> {
    const models: ModelConfig[] = [strategy.primaryModel];

    // Add fallback if available
    if (strategy.fallbackModel) {
      models.push(strategy.fallbackModel);
    }

    // Ensure we have exactly 4 models (pad with primary if needed)
    while (models.length < 4) {
      models.push(strategy.primaryModel);
    }

    // Generate step for each model (all parallel, no dependencies)
    const steps: WorkflowStep[] = [];

    for (let i = 0; i < 4; i++) {
      const model = models[i];
      const translatedPrompt = await this.translatePrompt(model.model_id, prompt);

      steps.push({
        stepId: `parallel-${i + 1}`,
        model: model.model_id,
        prompt: translatedPrompt,
        parameters: this.extractParameters(translatedPrompt),
        estimatedTime: 30,
        estimatedCost: model.estimatedCost
      });
    }

    return steps;
  }

  /**
   * Get Ideogram model config (for text overlay)
   */
  private getIdeogramModel(): ModelConfig | null {
    return {
      model_id: 'ideogram-v2',
      name: 'Ideogram v2',
      provider: 'fal.ai',
      estimatedCost: 0.08
    };
  }

  /**
   * Translate universal prompt using appropriate adapter
   */
  private async translatePrompt(
    modelId: string,
    prompt: UniversalPrompt
  ): Promise<string> {
    const adapter = ADAPTER_REGISTRY[modelId];
    
    if (!adapter) {
      // Fallback to FLUX Pro if no specific adapter found
      const fallbackAdapter = ADAPTER_REGISTRY['flux-pro-1.1'];
      if (!fallbackAdapter) {
        throw new Error(`No adapter found for model: ${modelId}`);
      }
      return fallbackAdapter.translate(prompt);
    }

    return adapter.translate(prompt);
  }

  /**
   * Extract parameters from translated prompt
   * (Some adapters embed parameters in the prompt string)
   */
  private extractParameters(prompt: string): Record<string, any> | undefined {
    // For Midjourney-style parameters (--ar 16:9 --s 250)
    const params: Record<string, any> = {};
    
    const arMatch = prompt.match(/--ar\s+(\S+)/);
    if (arMatch) params.aspect_ratio = arMatch[1];
    
    const sMatch = prompt.match(/--s\s+(\d+)/);
    if (sMatch) params.stylize = parseInt(sMatch[1]);

    const cMatch = prompt.match(/--c\s+(\d+)/);
    if (cMatch) params.chaos = parseInt(cMatch[1]);

    const vMatch = prompt.match(/--v\s+(\S+)/);
    if (vMatch) params.version = vMatch[1];
    
    return Object.keys(params).length > 0 ? params : undefined;
  }

  /**
   * Calculate total time and cost
   */
  private calculateTotals(
    steps: WorkflowStep[],
    workflowType: string
  ): { estimatedTime: number; estimatedCost: number } {
    const estimatedCost = steps.reduce((sum, step) => sum + step.estimatedCost, 0);

    let estimatedTime: number;

    if (workflowType === 'parallel-explore') {
      // Parallel execution: time = max(all steps)
      estimatedTime = Math.max(...steps.map(s => s.estimatedTime));
    } else if (workflowType === 'consistency') {
      // Partially sequential (step 1, then others in parallel)
      const firstStepTime = steps[0].estimatedTime;
      const maxVariantTime = steps.length > 1 
        ? Math.max(...steps.slice(1).map(s => s.estimatedTime))
        : 0;
      estimatedTime = firstStepTime + maxVariantTime;
    } else {
      // Sequential: time = sum(all steps)
      estimatedTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0);
    }

    return { estimatedTime, estimatedCost };
  }

  /**
   * Build human-readable reasoning
   */
  private buildWorkflowReasoning(
    strategy: ModelSelectionStrategy,
    steps: WorkflowStep[]
  ): string {
    const modelName = strategy.primaryModel.name;
    const stepCount = steps.length;
    const workflowType = strategy.workflow;

    const descriptions: Record<string, string> = {
      'single-shot': `Single image generation using ${modelName}`,
      'consistency': `${stepCount} consistent variants using ${modelName} with character preservation`,
      'text-composite': `2-step process: base image + text overlay`,
      'parallel-explore': `4 parallel explorations using ${stepCount} different models for comparison`
    };

    return descriptions[workflowType] || (typeof strategy.reasoning === 'string' ? strategy.reasoning : '');
  }

  /**
   * Validate inputs
   */
  private validateInputs(
    strategy: ModelSelectionStrategy,
    prompt: UniversalPrompt
  ): void {
    if (!strategy || !strategy.primaryModel) {
      throw new Error('Invalid ModelSelectionStrategy: missing primaryModel');
    }

    if (!prompt || !prompt.subject) {
      throw new Error('Invalid UniversalPrompt: missing subject');
    }

    if (!strategy.workflow) {
      throw new Error('Invalid ModelSelectionStrategy: missing workflow');
    }

    const validWorkflowTypes = ['single-shot', 'consistency', 'text-composite', 'parallel-explore'];
    if (!validWorkflowTypes.includes(strategy.workflow)) {
      throw new Error(`Invalid workflow type: ${strategy.workflow}`);
    }
  }
}
