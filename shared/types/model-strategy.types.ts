/**
 * Model Selection Strategy Types
 *
 * Output interface for Smart Router decisions.
 * Describes which model to use and how to use it.
 *
 * @module shared/types/model-strategy
 */

/**
 * Model configuration
 */
export interface ModelConfig {
  /**
   * Human-readable model name
   * @example "FLUX Pro 1.1 Ultra", "Seedream 4.0"
   */
  name: string;

  /**
   * API provider
   */
  provider: 'fal.ai' | 'kie.ai';

  /**
   * Provider-specific model ID for API calls
   * @example "fal-ai/flux-pro/v1.1-ultra"
   */
  model_id: string;

  /**
   * Estimated cost per image in USD
   */
  estimatedCost?: number;
}

/**
 * Workflow step for multi-step generation
 */
export interface WorkflowStep {
  /**
   * Step sequence number
   */
  step_number: number;

  /**
   * Model name for this step
   */
  model: string;

  /**
   * Description of what this step accomplishes
   */
  description: string;

  /**
   * How the output is used
   */
  output_usage?: string;
}

/**
 * Workflow type for generation
 */
export type WorkflowType = 'single-shot' | 'consistency' | 'iterative' | 'multi-step';

/**
 * Quality expectation level
 */
export type QualityExpectation = 'acceptable' | 'good' | 'high' | 'premium';

/**
 * Model Selection Strategy - Output from Smart Router
 *
 * Complete specification of how to execute a generation request,
 * including model selection, workflow, cost analysis, and reasoning.
 */
export interface ModelSelectionStrategy {
  /**
   * Primary model to use for generation
   */
  primaryModel: ModelConfig;

  /**
   * Fallback model if primary fails
   */
  fallbackModel?: ModelConfig & {
    /**
     * Conditions that trigger fallback
     * @example ["primary unavailable", "API timeout"]
     */
    triggerConditions: string[];
  };

  /**
   * Workflow type for this generation
   */
  workflow: WorkflowType;

  /**
   * Detailed steps for multi-step workflows
   * Undefined for single-shot
   */
  steps?: WorkflowStep[];

  /**
   * Cost analysis and budget compliance
   */
  costBreakdown: {
    /**
     * Total estimated cost in USD
     */
    totalEstimated: number;

    /**
     * Whether cost is within user's budget
     */
    withinBudget: boolean;
  };

  /**
   * Prompt optimization recommendations
   */
  optimizations: {
    /**
     * Recommended prompt strategy as array of guidance strings
     * @example ["natural language", "camera settings", "quoted text"]
     */
    promptStrategy: string[];

    /**
     * Model-specific parameters
     * @example { "aspect_ratio": "16:9", "steps": 40 }
     */
    parameters?: Record<string, any>;
  };

  /**
   * Transparency and reasoning for the selection
   */
  reasoning: {
    /**
     * Why this specific model was chosen
     */
    modelChoice: string;

    /**
     * Expected output quality level
     */
    qualityExpectation: QualityExpectation;

    /**
     * Tradeoffs made in the decision
     * @example ["Cost prioritized over quality due to hard budget limit"]
     */
    tradeoffs?: string[];
  };
}

/**
 * Validation result for strategy
 */
export interface StrategyValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate a ModelSelectionStrategy
 */
export function validateModelStrategy(
  strategy: ModelSelectionStrategy
): StrategyValidationResult {
  const errors: string[] = [];

  // Primary model required
  if (!strategy.primaryModel) {
    errors.push('primaryModel is required');
  }

  // Workflow required
  if (!strategy.workflow) {
    errors.push('workflow is required');
  }

  // Multi-step must have steps
  if (strategy.workflow === 'multi-step' && (!strategy.steps || strategy.steps.length === 0)) {
    errors.push('multi-step workflow requires steps array');
  }

  // Cost breakdown required
  if (!strategy.costBreakdown) {
    errors.push('costBreakdown is required');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
