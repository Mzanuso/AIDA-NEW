/**
 * Model Selection Strategy Types
 *
 * Defines output from Smart Router for model selection and workflow planning.
 * Used as input by Workflow Orchestrator.
 *
 * @module shared/types/model-strategy
 */

/**
 * Workflow execution types
 */
export type WorkflowType =
  | 'single-shot'        // Generate 1 image, return immediately
  | 'consistency'        // Generate 3-5 variants with same character/style
  | 'text-composite'     // Generate base + text overlay (2 steps)
  | 'parallel-explore';  // Generate 4 variants with different models

/**
 * Model configuration details (minimal structure from SmartRouter)
 */
export interface ModelConfig {
  /**
   * Human-readable model name
   */
  name: string;

  /**
   * Provider/API (e.g., "fal.ai", "kie.ai")
   */
  provider: string;

  /**
   * Model identifier (e.g., "flux-pro-1.1", "seedream-4.0")
   */
  model_id: string;

  /**
   * Estimated cost per generation (USD)
   */
  estimatedCost: number;
}

/**
 * Workflow step definition
 */
export interface WorkflowStep {
  step_number: number;
  model: string;
  description: string;
  output_usage: string;
}

/**
 * Cost breakdown information
 */
export interface CostBreakdown {
  totalEstimated: number;
  withinBudget: boolean;
}

/**
 * Optimization recommendations
 */
export interface Optimizations {
  promptStrategy: string[];
}

/**
 * Selection reasoning details
 */
export interface SelectionReasoning {
  modelChoice: string;
  qualityExpectation: 'acceptable' | 'good' | 'high' | 'premium';
  tradeoffs?: string[];
}

/**
 * Complete model selection strategy from Smart Router
 *
 * This is the output of Smart Router and input to Workflow Orchestrator.
 */
export interface ModelSelectionStrategy {
  /**
   * Primary model selected for generation
   */
  primaryModel: ModelConfig;

  /**
   * Fallback model if primary fails (optional)
   */
  fallbackModel?: ModelConfig;

  /**
   * Workflow type to execute
   */
  workflow: WorkflowType;

  /**
   * Detailed workflow steps (for multi-step workflows)
   */
  steps?: WorkflowStep[];

  /**
   * Cost breakdown
   */
  costBreakdown: CostBreakdown;

  /**
   * Optimization recommendations
   */
  optimizations?: Optimizations;

  /**
   * Detailed selection reasoning
   */
  reasoning: SelectionReasoning;
}
