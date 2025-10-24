/**
 * Director Agent Types
 * Defines interfaces for video concept generation with 3 creative philosophies:
 * - Emotional: Story-driven, character-focused
 * - Disruptive: Bold, unconventional, norm-breaking
 * - Data-Driven: Metrics-backed, proven patterns
 */

export type DirectorPhilosophy = 'emotional' | 'disruptive' | 'dataDriven';

/**
 * Input for Director concept generation
 */
export interface DirectorRequest {
  // Brief information
  brief: string; // Main concept/goal
  product?: string; // Product name/description
  target_audience?: string; // Target demographic
  duration?: number; // Video duration in seconds (default: 30)

  // Optional Writer output (if available)
  script?: {
    hook: string;
    scenes: Array<{
      description: string;
      duration: number;
    }>;
    cta?: string;
  };

  // Brand context (optional)
  brand?: {
    tone?: string;
    visual_style?: string;
    colors?: string[];
    avoid?: string[];
  };

  // Generation parameters
  philosophy?: DirectorPhilosophy; // Which Director variant to use
  temperature?: number; // Creativity level (default: 0.85)
}

/**
 * Single scene in storyboard
 */
export interface StoryboardScene {
  scene_number: number;
  duration: number; // seconds
  description: string; // Natural language description for Visual Creator
  visual_style: string; // e.g., "close-up", "wide shot", "dynamic movement"
  camera_movement?: string; // e.g., "slow pan", "zoom in", "static"
  lighting?: string; // e.g., "golden hour", "dramatic shadows"
  mood?: string; // e.g., "energetic", "calm", "suspenseful"
  audio_notes?: string; // Music/sound suggestions
}

/**
 * Complete storyboard output
 */
export interface Storyboard {
  scenes: StoryboardScene[];
  overall_style: string; // e.g., "cinematic", "documentary", "fast-paced"
  color_palette?: string[]; // Suggested color scheme
  music_direction?: string; // Overall music style
  transitions?: string; // Transition style between scenes
}

/**
 * Director concept generation result
 */
export interface DirectorResult {
  success: boolean;

  // Core output
  storyboard: Storyboard;
  concept_summary: string; // 2-3 sentence overview

  // Metadata
  philosophy: DirectorPhilosophy;
  reasoning: string; // Why this approach will work
  estimated_impact: {
    emotional_score?: number; // 0-10
    originality_score?: number; // 0-10
    feasibility_score?: number; // 0-10
  };

  // Technical info
  generation_time_ms: number;
  model_used: string;
  tokens_used?: {
    input: number;
    output: number;
  };

  // Error handling
  error?: string;
  metadata?: {
    source?: 'ai_generated' | 'simplified_fallback';
    retry_count?: number;
  };
}

/**
 * Multi-variant concept generation request
 */
export interface MultiVariantRequest {
  brief: string;
  product?: string;
  target_audience?: string;
  duration?: number;

  // Generate all 3 philosophies in parallel
  generate_all_variants: true;

  // Optional synthesis
  synthesize_best?: boolean; // Create 4th concept combining best elements
}

/**
 * Multi-variant concept generation response
 */
export interface MultiVariantResult {
  success: boolean;

  variants: {
    emotional: DirectorResult;
    disruptive: DirectorResult;
    dataDriven: DirectorResult;
  };

  synthesis?: DirectorResult; // Optional 4th "best of all" concept

  recommendation?: {
    best_variant: DirectorPhilosophy;
    reason: string;
  };

  total_generation_time_ms: number;
}

/**
 * Director configuration
 */
export interface DirectorConfig {
  model: string; // Claude model to use
  max_tokens: number;
  temperature: number;
  use_cache?: boolean;
  timeout_ms?: number;
}

/**
 * System prompt for each philosophy
 */
export interface PhilosophyPrompt {
  name: string;
  philosophy: DirectorPhilosophy;
  system_prompt: string;
  bias_toward: string[];
  avoid: string[];
  examples?: string[];
}
