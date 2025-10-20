/**
 * Prompt Adapter Interface
 * 
 * Defines contracts for translating universal prompts into model-specific formats.
 * Each AI model adapter must implement this interface.
 * 
 * @module visual-creator/prompt-adapter
 */

/**
 * Universal Prompt Format
 * 
 * Common structure used by all adapters as input.
 * Visual Creator generates this format, adapters translate to model-specific syntax.
 */
export interface UniversalPrompt {
  // ========== Core Content ==========
  
  /**
   * Main subject of the image
   * @example "confident businesswoman", "vintage sports car", "mountain landscape"
   */
  subject: string;

  /**
   * Action or state of the subject (optional)
   * @example "walking", "sitting at desk", "driving through desert"
   */
  action?: string;

  /**
   * Environment or setting (optional)
   * @example "urban rooftop", "modern office", "sunset beach"
   */
  environment?: string;

  // ========== Style & Mood ==========

  /**
   * Photography style category (optional)
   * @example "documentary", "editorial", "portrait", "fashion", "street"
   */
  photographyStyle?: string;

  /**
   * Emotional mood or atmosphere (optional)
   * @example "inspiring", "melancholic", "energetic", "serene"
   */
  mood?: string;

  /**
   * Lighting description (optional)
   * @example "golden hour", "soft studio", "dramatic", "natural"
   */
  lighting?: string;

  // ========== Technical Specs ==========

  /**
   * Shot type/framing (optional)
   * @example "close-up", "medium shot", "wide shot", "extreme close-up"
   */
  shotType?: string;

  /**
   * Aspect ratio (optional)
   * @example "16:9", "1:1", "4:5", "2:3", "21:9"
   */
  aspectRatio?: string;

  /**
   * Quality tier (optional)
   * Determines parameter intensity (e.g., stylize level)
   */
  quality?: 'premium' | 'standard' | 'budget';

  // ========== Special Requirements ==========

  /**
   * Text elements to render (optional)
   * Used by Ideogram, Hunyuan for text-heavy designs
   */
  textElements?: Array<{
    text: string;
    position: 'top' | 'center' | 'bottom' | 'custom';
    style?: string;
  }>;

  /**
   * Single text overlay (optional, simpler alternative to textElements)
   * Used for single-text composite workflows
   */
  textOverlay?: {
    content: string;
    position: 'top' | 'center' | 'bottom' | 'custom';
    style?: string;
  };

  /**
   * Reference images for character/object consistency (optional)
   * Used by Seedream, Nano Banana
   */
  characterReferences?: string[];

  /**
   * Color palette (optional)
   * Used by Recraft for vector designs
   * @example ["#FF6B6B", "#4ECDC4", "#FFE66D"]
   */
  colorPalette?: string[];

  /**
   * Additional camera/technical details (optional)
   * @example "85mm lens", "shallow depth of field", "f/1.4"
   */
  technicalDetails?: string;
}

/**
 * Prompt Adapter Interface
 * 
 * All model-specific adapters must implement this interface.
 * Provides consistent API for prompt translation.
 */
export interface PromptAdapter {
  /**
   * Model identifier
   * @example "Midjourney v7", "FLUX Pro 1.1 Ultra"
   */
  readonly modelName: string;

  /**
   * Translate universal prompt to model-specific format
   * 
   * This is the core method that applies model-specific best practices
   * and syntax to create an optimized prompt string.
   * 
   * @param prompt - Universal prompt structure
   * @returns Optimized prompt string for this specific model
   */
  translate(prompt: UniversalPrompt): string;

  /**
   * Get model-specific parameters (optional)
   * 
   * Some models (e.g., Midjourney) use parameters like --ar, --s, --v.
   * Others (e.g., FLUX) don't use parameters at all.
   * 
   * @param prompt - Universal prompt structure
   * @returns Key-value pairs of model parameters, or undefined if not applicable
   */
  getParameters?(prompt: UniversalPrompt): Record<string, any> | undefined;

  /**
   * Optimize/enhance the universal prompt (optional)
   * 
   * Some adapters may want to preprocess or enhance the universal prompt
   * before translation (e.g., reordering elements for importance).
   * 
   * @param prompt - Original universal prompt
   * @returns Enhanced universal prompt
   */
  optimize?(prompt: UniversalPrompt): UniversalPrompt;

  /**
   * Validate that prompt is compatible with this model (optional)
   * 
   * Some models have specific requirements or limitations.
   * 
   * @param prompt - Universal prompt to validate
   * @returns Validation result with any warnings
   */
  validate?(prompt: UniversalPrompt): {
    valid: boolean;
    warnings?: string[];
  };
}

/**
 * Helper type for parameter formatting
 * Used by models like Midjourney that have specific parameter syntax
 */
export type ParameterFormat = 'midjourney' | 'none';

/**
 * Model capability flags
 * Helps determine which features are supported by each model
 */
export interface ModelCapabilities {
  supportsParameters: boolean;
  supportsTextRendering: boolean;
  supportsCharacterConsistency: boolean;
  supportsVectorOutput: boolean;
  maxPromptLength?: number;
}
