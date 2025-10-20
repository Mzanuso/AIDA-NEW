/**
 * Execution Plan Types
 * 
 * Shared type definitions for execution plans across AIDA agents.
 * ExecutionPlan is the output of Technical Planner and the input for all execution agents
 * (Visual Creator, Video Composer, Audio Generator, Writer, Director).
 * 
 * @module shared/types/execution-plan
 */

/**
 * AI provider
 */
export type AIProvider = 'FAL.AI' | 'KIE.AI' | 'ANTHROPIC' | 'OPENAI';

/**
 * Quality tier for execution
 */
export type QualityTier = 'fast' | 'standard' | 'premium';

/**
 * Execution approach strategy
 */
export type ExecutionApproach = 'single_model' | 'multi_step' | 'parallel';

/**
 * Target agent for execution
 */
export type TargetAgent = 
  | 'visual_creator'
  | 'video_composer'
  | 'audio_generator'
  | 'writer'
  | 'director';

/**
 * Model selection details
 */
export interface ModelSelection {
  /**
   * Human-readable model name
   * @example "FLUX Pro", "Veo 3.1", "ElevenLabs Turbo v2.5"
   */
  name: string;

  /**
   * Exact model identifier for API calls
   * @example "fal-ai/flux/pro", "fal-ai/veo/v3.1", "fal-ai/elevenlabs/tts/turbo-v2.5"
   */
  model_id: string;

  /**
   * AI provider
   */
  provider: AIProvider;

  /**
   * Why this model was selected
   * @example "Best quality for photorealistic images within budget"
   */
  reason: string;

  /**
   * Estimated cost in USD
   */
  estimated_cost: number;

  /**
   * Estimated time in seconds
   */
  estimated_time: number;

  /**
   * Model-specific parameters
   * @example { "aspect_ratio": "16:9", "steps": 40 }
   */
  parameters?: Record<string, any>;
}

/**
 * Individual step in a multi-step execution
 */
export interface ExecutionStep {
  /**
   * Step number (1-indexed)
   */
  step_number: number;

  /**
   * Description of what this step does
   * @example "Generate base image with FLUX Pro"
   */
  description: string;

  /**
   * Model to use for this step
   */
  model: ModelSelection;

  /**
   * Prompt for this specific step
   */
  prompt: string;

  /**
   * Dependencies on previous steps
   * @example [1] means this step needs step 1's output
   */
  depends_on?: number[];
}

/**
 * Execution Plan - Output of Technical Planner, input for execution agents
 * 
 * The Technical Planner analyzes the ProjectBrief and creates a detailed ExecutionPlan
 * that specifies exactly which models to use, how to use them, and what to expect.
 * 
 * All execution agents (Visual Creator, Video Composer, etc.) receive ExecutionPlans
 * in this standard format.
 * 
 * @example Single Model (Simple)
 * {
 *   id: "plan_001",
 *   brief_id: "brief_001",
 *   approach: "single_model",
 *   primary_model: {
 *     name: "FLUX Pro",
 *     model_id: "fal-ai/flux/pro",
 *     provider: "FAL.AI",
 *     reason: "Best quality for product photography",
 *     estimated_cost: 0.055,
 *     estimated_time: 15
 *   },
 *   prompt: "Modern smartphone product photo...",
 *   quality_tier: "premium",
 *   target_agent: "visual_creator"
 * }
 * 
 * @example Multi-Step (Complex)
 * {
 *   id: "plan_002",
 *   approach: "multi_step",
 *   steps: [
 *     { step_number: 1, description: "Generate base image", model: {...} },
 *     { step_number: 2, description: "Enhance details", model: {...}, depends_on: [1] }
 *   ],
 *   target_agent: "visual_creator"
 * }
 */
export interface ExecutionPlan {
  // ============ Identifiers ============

  /**
   * Unique identifier for this plan
   * Format: "plan_" + timestamp
   */
  id: string;

  /**
   * Reference to the ProjectBrief this plan fulfills
   */
  brief_id: string;

  // ============ Models ============

  /**
   * Primary model to use
   * For single_model approach, this is the only model
   * For multi_step, this is the main model (step 1)
   */
  primary_model: ModelSelection;

  /**
   * Fallback models if primary fails
   * Ordered by preference (Plan B, Plan C, etc.)
   */
  fallback_models?: ModelSelection[];

  // ============ Execution Strategy ============

  /**
   * How to execute this plan
   * - single_model: One model does everything
   * - multi_step: Sequential steps with different models
   * - parallel: Multiple models work simultaneously
   */
  approach: ExecutionApproach;

  /**
   * Detailed steps for multi_step approach
   * Undefined for single_model
   */
  steps?: ExecutionStep[];

  // ============ Prompting ============

  /**
   * Optimized prompt for the primary model
   * For multi_step, this is the main/final prompt
   */
  prompt: string;

  /**
   * Model-specific parameters
   * @example { "aspect_ratio": "16:9", "num_inference_steps": 40 }
   */
  parameters?: Record<string, any>;

  // ============ Estimates ============

  /**
   * Quality tier achieved by this plan
   */
  quality_tier: QualityTier;

  /**
   * Total estimated cost in USD
   * Sum of all models if multi_step
   */
  total_estimated_cost: number;

  /**
   * Total estimated time in seconds
   * Sum of all steps if multi_step, considering parallelization
   */
  total_estimated_time: number;

  // ============ Delegation ============

  /**
   * Which execution agent should handle this plan
   */
  target_agent: TargetAgent;

  /**
   * Special instructions for the execution agent
   * @example "Maintain character consistency across all generations"
   */
  special_instructions?: string;

  /**
   * Expected output format
   * @example "PNG image, 1024x1024", "MP4 video, 1920x1080, 10 seconds"
   */
  expected_output?: string;

  // ============ Metadata ============

  /**
   * When this plan was created
   */
  created_at: Date;

  /**
   * Technical Planner version that created this plan
   * Useful for debugging and tracking
   */
  planner_version?: string;

  /**
   * Notes from Technical Planner
   * @example "Using fallback due to primary model unavailability"
   */
  notes?: string[];
}

/**
 * Result from an execution agent after completing an ExecutionPlan
 * Base interface - each agent extends this with specific fields
 */
export interface ExecutionResult {
  /**
   * Reference to the ExecutionPlan that was executed
   */
  plan_id: string;

  /**
   * Whether execution was successful
   */
  success: boolean;

  /**
   * Error message if failed
   */
  error?: string;

  /**
   * Which model was actually used (may be fallback)
   */
  model_used: string;

  /**
   * Actual cost in USD
   */
  actual_cost: number;

  /**
   * Actual time taken in seconds
   */
  actual_time: number;

  /**
   * When execution started
   */
  started_at: Date;

  /**
   * When execution completed
   */
  completed_at: Date;

  /**
   * Any warnings or notes from execution
   */
  notes?: string[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate an ExecutionPlan
 */
export function validateExecutionPlan(plan: ExecutionPlan): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!plan.id) errors.push('id is required');
  if (!plan.brief_id) errors.push('brief_id is required');
  if (!plan.primary_model) errors.push('primary_model is required');
  if (!plan.approach) errors.push('approach is required');
  if (!plan.prompt) errors.push('prompt is required');
  if (!plan.quality_tier) errors.push('quality_tier is required');
  if (!plan.target_agent) errors.push('target_agent is required');

  // Multi-step must have steps array
  if (plan.approach === 'multi_step' && (!plan.steps || plan.steps.length === 0)) {
    errors.push('multi_step approach requires steps array');
  }

  // Costs and times must be positive
  if (plan.total_estimated_cost < 0) {
    errors.push('total_estimated_cost must be non-negative');
  }
  if (plan.total_estimated_time < 0) {
    errors.push('total_estimated_time must be non-negative');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
