/**
 * Technical Planner Types
 *
 * Type definitions for Technical Planner agent
 * FIX #4: Import ProjectBrief from shared types instead of redefining
 */

import { ProjectBrief } from '../../shared/types/project-brief.types';

// Re-export ProjectBrief for convenience
export { ProjectBrief };

/**
 * Workflow State Persistence
 * Matches workflow_states table schema in Supabase
 */
export interface WorkflowState {
  id: string;
  project_brief_id: string;
  user_id: string;

  // Progress tracking
  current_step: WorkflowStep;
  progress_percentage: number; // 0-100
  status: WorkflowStatus;

  // Technical plan data (nullable during workflow)
  technical_plan?: TechnicalPlan;
  model_selections?: ModelSelection[];
  cost_estimate?: CostEstimate;
  execution_steps?: ExecutionStep[];

  // Metadata
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
}

export type WorkflowStep =
  | 'initialized'
  | 'analyzing'
  | 'planning'
  | 'selecting_models'
  | 'estimating_cost'
  | 'completed';

export type WorkflowStatus =
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'paused';

/**
 * Technical Plan Output
 * Core deliverable from Technical Planner
 */
export interface TechnicalPlan {
  project_id: string;
  assets: AssetRequirement[];
  workflow_steps: string[];
  dependencies: AssetDependency[];
  estimated_duration_minutes: number;
  complexity_score: number; // 1-10
  recommendations: string[];
}

export interface AssetRequirement {
  asset_id: string;
  asset_type: 'image' | 'video' | 'audio' | 'text';
  description: string;
  specifications: {
    dimensions?: string; // e.g. "1920x1080"
    duration_seconds?: number;
    format?: string;
    quality_level?: 'draft' | 'standard' | 'high' | 'ultra';
  };
  agent_assigned: 'visual-creator' | 'video-composer' | 'audio-generator' | 'writer';
  priority: number; // 1 = highest
  dependencies: string[]; // Other asset_ids this depends on
}

export interface AssetDependency {
  asset_id: string;
  depends_on: string[];
  blocking: boolean; // Must complete before dependent assets can start
}

/**
 * Model Selection (from SmartRouter)
 */
export interface ModelSelection {
  asset_id: string;
  model_id: string;
  model_name: string;
  provider: 'openai' | 'anthropic' | 'midjourney' | 'runway' | 'elevenlabs';
  reasoning: string;
  confidence_score: number; // 0-1
  fallback_model_id?: string;
}

/**
 * Cost Estimation
 */
export interface CostEstimate {
  total_estimated_cost: number; // USD
  breakdown: CostBreakdown[];
  budget_status: 'within_budget' | 'at_limit' | 'exceeds_budget';
  budget_remaining?: number;
  warnings: string[];
}

export interface CostBreakdown {
  asset_id: string;
  model_id: string;
  estimated_cost: number;
  cost_components: {
    compute?: number;
    api_calls?: number;
    storage?: number;
  };
}

/**
 * Execution Steps (for Director Agent)
 */
export interface ExecutionStep {
  step_id: string;
  step_number: number;
  description: string;
  agent: string;
  asset_ids: string[];
  estimated_duration_minutes: number;
  can_parallelize: boolean;
  depends_on_steps: string[]; // step_ids
}

/**
 * Progress Tracking
 */
export interface ProgressUpdate {
  workflow_state_id: string;
  current_step: WorkflowStep;
  progress_percentage: number;
  message: string;
  timestamp: string;
}

/**
 * API Response Types
 */
export interface TechnicalPlanResponse {
  success: boolean;
  data?: {
    workflow_state_id: string;
    technical_plan: TechnicalPlan;
    model_selections: ModelSelection[];
    cost_estimate: CostEstimate;
    execution_steps: ExecutionStep[];
  };
  error?: string;
}

export interface ProgressResponse {
  success: boolean;
  data?: {
    workflow_state_id: string;
    current_step: WorkflowStep;
    progress_percentage: number;
    status: WorkflowStatus;
    estimated_completion_time?: string;
  };
  error?: string;
}
