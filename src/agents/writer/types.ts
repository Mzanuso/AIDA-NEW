/**
 * Writer Agent - Type Definitions
 * Microservice for generating scripts, marketing copy, and written content
 */

import { z } from "zod";

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

/**
 * Writer Request Schema
 * Input for generating written content
 */
export const WriterRequestSchema = z.object({
  // Core input
  brief: z.string().min(10, "Brief must be at least 10 characters"),

  // Style & tone
  style: z
    .object({
      sref_code: z.string().optional(),
      style_name: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),

  tone: z
    .enum([
      "professional",
      "casual",
      "energetic",
      "calm",
      "humorous",
      "serious",
      "inspirational",
      "educational",
    ])
    .default("professional"),

  // Content type
  content_type: z
    .enum([
      "video_script",
      "marketing_copy",
      "social_media",
      "blog_post",
      "product_description",
      "ad_copy",
    ])
    .default("video_script"),

  // Video-specific params
  duration: z.number().min(5).max(600).optional(), // seconds (only for video scripts)

  // Language
  language: z.enum(["it", "en"]).default("it"),

  // Optional constraints
  target_audience: z.string().optional(),
  key_messages: z.array(z.string()).optional(),
  call_to_action: z.string().optional(),

  // Brand Identity (tri-modal)
  brand_identity: z
    .object({
      // 1. Parameters
      brand_voice: z.string().optional(),
      brand_values: z.array(z.string()).optional(),
      target_persona: z.string().optional(),

      // 2. Documents (URL to brand guidelines)
      brand_guidelines_url: z.string().url().optional(),

      // 3. Examples (few-shot learning)
      example_content: z.array(z.string()).optional(),
    })
    .optional(),

  // Platform-specific parameters
  platform_specific: z
    .object({
      platform: z
        .enum([
          "twitter",
          "instagram",
          "linkedin",
          "tiktok",
          "facebook",
          "youtube",
          "general",
        ])
        .optional(),
      character_limit: z.number().optional(),
      ad_format: z.string().optional(),
    })
    .optional(),
});

export type WriterRequest = z.infer<typeof WriterRequestSchema>;

// ============================================================================
// OUTPUT TYPES
// ============================================================================

/**
 * Visual Description for detailed scene visualization
 * Used by Writer Agent to create rich visual descriptions
 * Visual Creator Agent will translate this into technical prompts
 */
export interface VisualDescription {
  // Setting & Environment
  setting: string; // Physical location and environment description
  subjects: string; // Characters, objects, or focal points in scene

  // Lighting & Atmosphere
  lighting: string; // Quality, direction, and mood of light
  atmosphere: string; // Overall mood and feeling of the scene

  // Camera & Composition (suggestions, not technical specs)
  camera_suggestion: string; // Suggested camera angle and movement
  composition_notes: string; // Framing and visual composition guidance

  // Mood & Emotion
  emotional_tone: string; // The emotional feeling this visual should evoke

  // Color & Style
  color_palette_suggestion: string[]; // Suggested colors (descriptive, not hex codes)
  style_reference?: string; // Optional cinematic or artistic style reference
}

/**
 * Scene for video scripts
 */
export interface SceneDescription {
  scene_number: number;
  description: string; // General narrative description
  duration_seconds: number;

  // Audio/Narrative
  voiceover?: string;

  // Visual Storytelling (NEW)
  visual_description?: VisualDescription; // Rich visual details for Visual Creator

  // Legacy fields (kept for backward compatibility)
  visual_cues: string[];
  camera_notes?: string;
}

/**
 * Writer Result
 * Output from Writer Agent execution
 */
export interface WriterResult {
  success: boolean;

  // Generated content
  content: {
    script?: string; // Full script text
    scenes?: SceneDescription[]; // Scene breakdown (for video scripts)
    headline?: string; // For marketing copy
    body?: string; // Main content
    cta?: string; // Call to action
  };

  // Metadata
  metadata: {
    content_type: string;
    tone_applied: string;
    language: string;
    word_count: number;
    estimated_reading_time_seconds?: number;
    estimated_speaking_time_seconds?: number;
    estimated_reading_time_minutes?: number;
    character_count?: number;
    generation_time_ms: number;
    model_used: string;
    techniques_used?: string[]; // Narrative techniques applied
    rework_level?: "safe" | "bold" | "radical"; // Current rework iteration
    validation_score?: number; // Quality score (0-100)
  };

  // Error handling
  error?: string;
}

/**
 * Writer Executor Configuration
 */
export interface WriterConfig {
  model: string; // e.g. "claude-3-5-sonnet-20241022"
  max_tokens: number;
  temperature: number;
  use_cache: boolean;
  maxTokens?: number; // Alias for max_tokens (legacy support)
}

/**
 * Health Check Response
 */
export interface HealthResponse {
  status: "ok" | "error";
  service: string;
  version: string;
  port: number;
  timestamp: string;
  uptime_seconds: number;
}
