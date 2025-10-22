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
});

export type WriterRequest = z.infer<typeof WriterRequestSchema>;

// ============================================================================
// OUTPUT TYPES
// ============================================================================

/**
 * Scene for video scripts
 */
export interface SceneDescription {
  scene_number: number;
  description: string;
  duration_seconds: number;
  voiceover?: string;
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
    generation_time_ms: number;
    model_used: string;
  };

  // Error handling
  error?: string;
}

/**
 * Writer Executor Configuration
 */
export interface WriterConfig {
  model: "claude-3-5-sonnet" | "gpt-4" | "gpt-4-turbo";
  max_tokens: number;
  temperature: number;
  use_cache: boolean;
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
