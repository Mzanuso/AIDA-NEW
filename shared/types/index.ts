/**
 * AIDA Shared Types
 * 
 * Central export point for all shared type definitions.
 * These types define the contracts between AIDA agents.
 * 
 * @module shared/types
 * 
 * @example
 * // Import specific types
 * import { ProjectBrief, ExecutionPlan } from '@shared/types';
 * 
 * @example
 * // Import all types
 * import * as AidaTypes from '@shared/types';
 */

// Budget Constraints
export {
  BudgetType,
  OptimizationPriority,
  BudgetConstraints,
  validateBudgetConstraints,
} from './budget-constraints.types';

// Project Brief
export {
  ContentType,
  ProjectPriority,
  StylePreferences,
  ProjectBrief,
  validateProjectBrief,
} from './project-brief.types';

// Execution Plan
export {
  AIProvider,
  QualityTier,
  ExecutionApproach,
  TargetAgent,
  ModelSelection,
  ExecutionStep,
  ExecutionPlan,
  ExecutionResult,
  validateExecutionPlan,
} from './execution-plan.types';

// Model Selection Strategy
export {
  ModelConfig,
  WorkflowStep,
  WorkflowType,
  QualityExpectation,
  ModelSelectionStrategy,
  StrategyValidationResult,
  validateModelStrategy,
} from './model-strategy.types';

// Re-export validation result type (used by multiple modules)
export type { ValidationResult } from './execution-plan.types';
