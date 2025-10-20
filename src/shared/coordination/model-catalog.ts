/**
 * Model Catalog - Available AI Models and Specifications
 *
 * Centralized configuration for all supported image generation models.
 * Prices and specifications based on provider documentation.
 *
 * @module agents/visual-creator/model-catalog
 */

/**
 * Prompt style preference for model
 */
export type PromptStyle = 'natural_language' | 'structured' | 'parameters';

/**
 * Model specification
 */
export interface ModelSpec {
  /**
   * Human-readable model name
   */
  name: string;

  /**
   * API provider
   */
  provider: 'fal.ai' | 'kie.ai';

  /**
   * Provider-specific model ID
   */
  model_id: string;

  /**
   * Cost per image in USD
   */
  cost_per_image: number;

  /**
   * Model strengths and capabilities
   */
  strengths: string[];

  /**
   * Best use cases
   */
  best_for: string[];

  /**
   * Preferred prompt style
   */
  prompt_style: PromptStyle;
}

/**
 * Complete catalog of available models
 */
export const MODEL_CATALOG: Record<string, ModelSpec> = {
  // ========== Premium Tier ==========

  FLUX_PRO_ULTRA: {
    name: 'FLUX Pro 1.1 Ultra',
    provider: 'fal.ai',
    model_id: 'fal-ai/flux-pro/v1.1-ultra',
    cost_per_image: 0.055,
    strengths: ['photorealism', 'natural_language', 'speed', 'quality'],
    best_for: ['portrait', 'product', 'commercial', 'professional'],
    prompt_style: 'natural_language',
  },

  HUNYUAN_3: {
    name: 'Hunyuan Image 3',
    provider: 'fal.ai',
    model_id: 'fal-ai/hunyuan-image-3',
    cost_per_image: 0.05,
    strengths: ['text_rendering', 'spatial_relationships', 'chinese_text'],
    best_for: ['posters', 'infographics', 'text_heavy'],
    prompt_style: 'structured',
  },

  MIDJOURNEY_V7: {
    name: 'Midjourney v7',
    provider: 'kie.ai',
    model_id: 'midjourney-v7',
    cost_per_image: 0.06,
    strengths: ['artistic', 'aesthetic', 'creative', 'style'],
    best_for: ['artistic', 'editorial', 'creative', 'gallery'],
    prompt_style: 'parameters',
  },

  // ========== Standard Tier ==========

  FLUX_PRO: {
    name: 'FLUX Pro',
    provider: 'fal.ai',
    model_id: 'fal-ai/flux-pro',
    cost_per_image: 0.04,
    strengths: ['balanced', 'versatile', 'reliable'],
    best_for: ['general', 'versatile', 'standard'],
    prompt_style: 'natural_language',
  },

  // ========== Fast/Budget Tier ==========

  FLUX_SCHNELL: {
    name: 'FLUX Schnell',
    provider: 'fal.ai',
    model_id: 'fal-ai/flux/schnell',
    cost_per_image: 0.003,
    strengths: ['speed', 'cost', 'acceptable_quality'],
    best_for: ['draft', 'rapid_iteration', 'budget', 'quick'],
    prompt_style: 'natural_language',
  },

  // ========== Specialized Models ==========

  SEEDREAM_4: {
    name: 'Seedream 4.0',
    provider: 'fal.ai',
    model_id: 'fal-ai/seedream-4',
    cost_per_image: 0.04,
    strengths: ['character_consistency', 'multi_reference', '94%_accuracy', 'consistency'],
    best_for: ['character_series', 'consistency', 'campaigns', 'multipleScenes'],
    prompt_style: 'structured',
  },

  RECRAFT_V3: {
    name: 'Recraft v3',
    provider: 'fal.ai',
    model_id: 'fal-ai/recraft-v3',
    cost_per_image: 0.04,
    strengths: ['vector_output', 'svg', 'scalable', 'design'],
    best_for: ['logos', 'icons', 'illustrations', 'vector'],
    prompt_style: 'structured',
  },

  IDEOGRAM_V2: {
    name: 'Ideogram v2',
    provider: 'fal.ai',
    model_id: 'fal-ai/ideogram-v2',
    cost_per_image: 0.08,
    strengths: ['typography', 'text_accuracy', 'perfect_text', 'text_rendering'],
    best_for: ['book_covers', 'posters', 'text_design', 'typography'],
    prompt_style: 'structured',
  },
};

/**
 * Quality tier definitions
 */
export interface QualityTierConfig {
  max_cost: number;
  min_quality: string;
  expected_quality: 'acceptable' | 'good' | 'high' | 'premium';
}

/**
 * Quality tier configurations
 */
export const QUALITY_TIERS: Record<string, QualityTierConfig> = {
  budget: {
    max_cost: 0.01,
    min_quality: 'acceptable',
    expected_quality: 'acceptable',
  },
  standard: {
    max_cost: 0.05,
    min_quality: 'medium',
    expected_quality: 'good',
  },
  premium: {
    max_cost: 0.10,
    min_quality: 'high',
    expected_quality: 'high',
  },
};

/**
 * Get model by key
 */
export function getModel(key: string): ModelSpec | undefined {
  return MODEL_CATALOG[key];
}

/**
 * Find models within cost limit
 */
export function findModelsWithinBudget(maxCost: number): ModelSpec[] {
  return Object.values(MODEL_CATALOG)
    .filter((m) => m.cost_per_image <= maxCost)
    .sort((a, b) => b.cost_per_image - a.cost_per_image); // Descending (best quality first)
}

/**
 * Find models by capability
 */
export function findModelsByCapability(capability: string): ModelSpec[] {
  return Object.values(MODEL_CATALOG).filter(
    (m) =>
      m.strengths.some((s) => s.includes(capability)) ||
      m.best_for.some((b) => b.includes(capability))
  );
}
