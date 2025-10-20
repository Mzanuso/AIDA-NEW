/**
 * Execution Plan Types
 * 
 * Defines output from Technical Planner for execution agents.
 * Includes model selection, prompts, and delegation instructions.
 * 
 * @module shared/types/execution-plan
 */

/**
 * Quality tier after interpretation by Technical Planner
 */
export type QualityTier = 'fast' | 'standard' | 'premium';

/**
 * Content types supported by AIDA
 */
export type ContentType = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'multi_asset';

/**
 * Target execution agents
 */
export type TargetAgent = 
  | 'visual_creator' 
  | 'video_composer' 
  | 'audio_generator' 
  | 'writer' 
  | 'director';

/**
 * Execution approach strategy
 */
export type ExecutionApproach = 
  | 'single_model'    // One model, one pass
  | 'multi_step'      // Sequential steps
  | 'parallel';       // Multiple models in parallel

/**
 * Model selection details
 */
export interface ModelSelection {
  /**
   * Human-readable model name
   * @example "FLUX Pro", "Veo 3.1", "Seedream 4.0"
   */
  name: string;

  /**
   * Technical model identifier
   * @example "fal-ai/flux/pro", "kie/midjourney-v6"
   */
  model_id: string;

  /**
   * Provider/API service
   */
  provider: 'FAL.AI' | 'KIE.AI' | 'ANTHROPIC' | 'OPENAI' | 'ELEVENLABS';

  /**
   * Reason for model selection
   * @example "Premium portrait requires FLUX Pro photorealism"
   */
  reason: string;

  /**
   * Estimated cost per generation (USD)
   */
  estimated_cost: number;

  /**
   * Estimated time per generation (seconds)
   */
  estimated_time: number;
}

/**
 * Single execution step (for multi-step workflows)
 */
export interface ExecutionStep {
  /**
   * Step identifier
   */
  step_id: string;

  /**
   * Model for this step
   */
  model: ModelSelection;

  /**
   * Step-specific prompt
   */
  prompt: string;

  /**
   * Step-specific parameters
   */
  parameters?: Record<string, any>;

  /**
   * Dependencies on other steps
   */
  dependencies?: string[];
}

/**
 * Complete Execution Plan from Technical Planner
 * 
 * This is sent to execution agents (Visual Creator, Video Composer, etc.)
 */
export interface ExecutionPlan {
  /**
   * Unique plan identifier
   */
  id: string;

  /**
   * Reference to source ProjectBrief
   */
  brief_id: string;

  // ========== Model Selection ==========

  /**
   * Primary model selected for execution
   */
  primary_model: ModelSelection;

  /**
   * Fallback models if primary fails (ordered by preference)
   */
  fallback_models?: ModelSelection[];

  // ========== Strategy ==========

  /**
   * Execution approach
   */
  approach: ExecutionApproach;

  /**
   * Detailed steps (for multi-step approach)
   */
  steps?: ExecutionStep[];

  // ========== Prompting ==========

  /**
   * Optimized prompt for primary model
   */
  prompt: string;

  /**
   * Model-specific parameters
   */
  parameters?: Record<string, any>;

  // ========== Scene Descriptions (for images/video) ==========

  /**
   * Array of scene descriptions (one per image/video segment)
   * Used by Visual Creator to generate multiple images
   */
  scene_descriptions?: string[];

  // ========== Quality & Estimates ==========

  /**
   * Quality tier (INTERPRETED from keywords by Technical Planner)
   */
  quality_tier: QualityTier;

  /**
   * Total estimated cost (USD)
   */
  total_estimated_cost: number;

  /**
   * Total estimated time (seconds)
   */
  total_estimated_time: number;

  // ========== Delegation ==========

  /**
   * Target agent that should execute this plan
   */
  target_agent: TargetAgent;

  /**
   * Special instructions for the agent
   */
  special_instructions?: string;

  // ========== Style & Preferences ==========

  /**
   * Style preferences from Style Selector
   */
  style_preferences?: {
    gallery_selected?: string[];
    custom_description?: string;
  };

  // ========== Metadata ==========

  /**
   * Plan creation timestamp (ISO 8601)
   */
  created_at: string;

  /**
   * Additional notes or warnings
   */
  notes?: string[];
}

/**
 * Execution result from execution agent
 */
export interface ExecutionResult {
  /**
   * Plan identifier
   */
  plan_id: string;

  /**
   * Execution status
   */
  status: 'success' | 'partial_success' | 'failed';

  /**
   * Generated asset URLs
   */
  asset_urls: string[];

  /**
   * Model actually used (may be fallback)
   */
  model_used: string;

  /**
   * Actual cost incurred (USD)
   */
  actual_cost: number;

  /**
   * Actual time taken (seconds)
   */
  actual_time: number;

  /**
   * Error message if failed
   */
  error?: string;

  /**
   * Completion timestamp (ISO 8601)
   */
  completed_at: string;
}
