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
 * Model configuration details
 */
export interface ModelConfig {
  /**
   * Model identifier (e.g., "flux-pro", "seedream-4.0")
   */
  id: string;

  /**
   * Human-readable model name
   */
  name: string;

  /**
   * Provider/API (e.g., "fal.ai", "kie.ai")
   */
  provider: string;

  /**
   * Quality tier classification
   */
  tier: 'budget' | 'standard' | 'premium';

  /**
   * Cost per generation (USD)
   */
  costPerGeneration: number;

  /**
   * Average generation time (seconds)
   */
  averageTime: number;

  /**
   * Supported aspect ratios
   */
  supportedAspectRatios: string[];

  /**
   * Model-specific capabilities
   */
  capabilities: {
    textRendering?: boolean;
    characterConsistency?: boolean;
    vectorOutput?: boolean;
    style3D?: boolean;
  };
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
   * Fallback models if primary fails (ordered by preference)
   */
  fallbackModels: ModelConfig[];

  /**
   * Workflow type to execute
   */
  workflowType: WorkflowType;

  /**
   * Human-readable explanation of selection reasoning
   * 
   * @example "Premium portrait requires FLUX Pro for photorealism"
   * @example "Budget constraint: downgraded from FLUX Pro to FLUX Schnell"
   */
  reasoning: string;

  /**
   * Quality tier determined by Smart Router
   */
  qualityTier: 'budget' | 'standard' | 'premium';

  /**
   * Whether budget constraints forced a downgrade
   */
  wasDowngraded?: boolean;
}
