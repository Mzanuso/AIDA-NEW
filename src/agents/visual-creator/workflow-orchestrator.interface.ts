/**
 * Workflow Orchestrator Interface
 * 
 * Bridges Smart Router output with Prompt Adapters,
 * managing multi-step image generation workflows.
 */

import { ModelSelectionStrategy } from '@/shared/types';
import { UniversalPrompt } from './prompt-adapter.interface';

/**
 * A single step in the workflow execution
 */
export interface WorkflowStep {
  /** Unique identifier for this step */
  stepId: string;
  
  /** AI model to use for this step */
  model: string;
  
  /** Model-specific optimized prompt (already translated by adapter) */
  prompt: string;
  
  /** Optional model-specific parameters */
  parameters?: Record<string, any>;
  
  /** Reference images URLs (for consistency workflows) */
  referenceImages?: string[];
  
  /** IDs of steps that must complete before this one */
  dependencies?: string[];
  
  /** Step type indicator */
  type: 'generation' | 'overlay' | 'variation';
}

/**
 * Complete execution plan for a workflow
 */
export interface WorkflowExecutionPlan {
  /** Unique identifier for this workflow instance */
  workflowId: string;
  
  /** Type of workflow being executed */
  workflowType: 'single-shot' | 'consistency' | 'text-composite' | 'parallel-explore';
  
  /** Ordered list of steps to execute */
  steps: WorkflowStep[];
  
  /** Estimated total execution time in seconds */
  estimatedTime: number;
  
  /** Estimated total cost in USD */
  estimatedCost: number;
  
  /** Human-readable description of what will happen */
  description: string;
}

/**
 * Result of a completed workflow execution
 */
export interface WorkflowResult {
  /** ID of the workflow that was executed */
  workflowId: string;
  
  /** Final status */
  status: 'success' | 'partial' | 'failed';
  
  /** Generated image URLs */
  images: string[];
  
  /** Actual time taken in seconds */
  actualTime: number;
  
  /** Actual cost in USD */
  actualCost: number;
  
  /** Any errors encountered */
  errors?: string[];
}

/**
 * Workflow Orchestrator Interface
 */
export interface WorkflowOrchestrator {
  /**
   * Generate an execution plan from Smart Router output
   * 
   * @param strategy - Output from Smart Router
   * @param universalPrompt - Original universal prompt description
   * @returns Complete workflow execution plan
   */
  generateWorkflowPlan(
    strategy: ModelSelectionStrategy,
    universalPrompt: UniversalPrompt
  ): WorkflowExecutionPlan;
}
