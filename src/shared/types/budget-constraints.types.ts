/**
 * Budget Constraints Types
 * 
 * Shared type definitions for budget management across AIDA agents.
 * Used by Orchestrator to capture user budget preferences and by
 * Technical Planner to make cost-optimized model selections.
 * 
 * @module shared/types/budget-constraints
 */

/**
 * Budget constraint type
 * - 'hard_limit': Must not exceed max_cost (reject if impossible)
 * - 'soft_preference': Try to optimize cost but quality matters more
 * - 'none': No budget constraints, prioritize quality
 */
export type BudgetType = 'hard_limit' | 'soft_preference' | 'none';

/**
 * Optimization priority when making tradeoffs
 * - 'cost': Minimize cost (choose cheapest model)
 * - 'quality': Maximize quality (choose best model within budget)
 * - 'speed': Minimize time (choose fastest model)
 */
export type OptimizationPriority = 'cost' | 'quality' | 'speed';

/**
 * Budget constraints for a project
 * 
 * @example
 * // User says "budget massimo 5 dollari"
 * { type: 'hard_limit', max_cost: 5, priority: 'quality' }
 * 
 * @example
 * // User says "cerca di risparmiare"
 * { type: 'soft_preference', priority: 'cost' }
 * 
 * @example
 * // User doesn't mention budget
 * { type: 'none', priority: 'quality' }
 */
export interface BudgetConstraints {
  /**
   * Type of budget constraint
   */
  type: BudgetType;

  /**
   * Maximum cost in USD
   * Required if type is 'hard_limit' or 'soft_preference'
   */
  max_cost?: number;

  /**
   * Optimization priority for tradeoffs
   * @default 'quality'
   */
  priority?: OptimizationPriority;

  /**
   * Optional note from user about budget
   * e.g., "It's for a client, quality matters"
   */
  note?: string;
}

/**
 * Budget validation helper
 */
export function validateBudgetConstraints(
  constraints: BudgetConstraints
): { valid: boolean; error?: string } {
  if (constraints.type === 'hard_limit' && !constraints.max_cost) {
    return {
      valid: false,
      error: 'max_cost is required for hard_limit budget type',
    };
  }

  if (constraints.max_cost && constraints.max_cost <= 0) {
    return {
      valid: false,
      error: 'max_cost must be greater than 0',
    };
  }

  return { valid: true };
}
