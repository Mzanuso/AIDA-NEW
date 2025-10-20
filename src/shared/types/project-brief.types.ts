/**
 * Project Brief Types
 * 
 * Shared type definitions for project briefs across AIDA agents.
 * ProjectBrief is the primary interface between Orchestrator and Technical Planner.
 * 
 * @module shared/types/project-brief
 */

import { BudgetConstraints } from './budget-constraints.types';

/**
 * Content type for the project
 */
export type ContentType = 'image' | 'video' | 'audio' | 'multi_asset';

/**
 * Project priority level
 */
export type ProjectPriority = 'low' | 'normal' | 'high';

/**
 * Gallery selection item
 */
export interface GallerySelection {
  /**
   * Gallery item ID (e.g., sref code for Midjourney)
   */
  id: string;

  /**
   * How the style was selected
   */
  selection_method: 'gallery' | 'manual';

  /**
   * Whether this selection requires artistic model (e.g., Midjourney)
   * Set to true when gallery item selected (uses sref codes)
   * Technical Planner MUST use artistic model if true
   */
  requires_artistic_model: boolean;
}

/**
 * Style preferences from user or Style Selector
 */
export interface StylePreferences {
  /**
   * Gallery items selected by user via Style Selector
   * Includes sref codes and artistic model requirement flag
   */
  gallery_selected?: GallerySelection[];

  /**
   * Custom style description from user
   * e.g., "Minimalist, warm tones, professional but friendly"
   */
  style_description?: string;

  /**
   * Reference images provided by user
   * Array of URLs or file paths
   */
  reference_images?: string[];

  /**
   * Specific artistic style requested
   * e.g., "realistic", "artistic", "cartoon", "cinematic"
   */
  artistic_style?: string;
}

/**
 * Project Brief - Interface between Orchestrator and Technical Planner
 * 
 * The Orchestrator extracts requirements from natural conversation with the user
 * and packages them into a structured ProjectBrief. The Technical Planner receives
 * this brief and makes all technical decisions (model selection, workflow design).
 * 
 * @example
 * {
 *   id: "brief_001",
 *   user_id: "user_123",
 *   conversation_id: "conv_456",
 *   content_type: "image",
 *   requirements: [
 *     "Create a product photo",
 *     "Modern smartphone",
 *     "White background"
 *   ],
 *   quality_keywords: ["professional", "high-quality"],
 *   budget_constraints: { type: "soft_preference", priority: "quality" },
 *   language: "en",
 *   created_at: new Date()
 * }
 */
export interface ProjectBrief {
  // ============ Identifiers ============

  /**
   * Unique identifier for this brief
   * Format: "brief_" + timestamp
   */
  id: string;

  /**
   * User who requested this project
   */
  user_id: string;

  /**
   * Conversation where this request was made
   */
  conversation_id: string;

  // ============ Content ============

  /**
   * Type of content to generate
   */
  content_type: ContentType;

  /**
   * Array of specific requirements extracted from conversation
   * Each requirement is a clear, actionable statement
   * 
   * @example
   * ["Create a product photo", "Modern smartphone", "White background"]
   */
  requirements: string[];

  /**
   * Detailed description if provided by user
   * This is raw input, not processed
   */
  detailed_description?: string;

  // ============ Style ============

  /**
   * Style preferences from Style Selector or direct user input
   * Optional - not all projects need explicit style guidance
   */
  style_preferences?: StylePreferences;

  // ============ Quality (RAW - Technical Planner interprets) ============

  /**
   * Quality-related keywords extracted from user conversation
   * Orchestrator does NOT interpret these - just extracts and passes them.
   * Technical Planner interprets and maps to quality_tier.
   * 
   * @example
   * ["cinematic", "luxury"] → TP interprets as PREMIUM
   * ["fast", "draft"] → TP interprets as FAST
   * ["professional"] → TP interprets as STANDARD
   * [] → TP defaults to STANDARD
   */
  quality_keywords: string[];

  // ============ Budget ============

  /**
   * Budget constraints extracted from conversation
   * Optional - absence means no budget constraints
   */
  budget_constraints?: BudgetConstraints;

  // ============ Context ============

  /**
   * Language code (ISO 639-1)
   * Used for prompting and result presentation
   * @example "en", "it", "es", "fr"
   */
  language: string;

  /**
   * Relevant conversation context (last 2-3 messages)
   * Helps Technical Planner understand nuances
   */
  conversation_context?: string;

  /**
   * Special requirements or constraints
   * e.g., "Character must be consistent across scenes"
   */
  special_requirements?: string[];

  // ============ Metadata ============

  /**
   * When this brief was created
   */
  created_at: Date;

  /**
   * Priority level for execution
   * @default 'normal'
   */
  priority?: ProjectPriority;

  /**
   * Deadline if specified by user
   */
  deadline?: Date;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate a ProjectBrief
 */
export function validateProjectBrief(brief: ProjectBrief): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!brief.id) errors.push('id is required');
  if (!brief.user_id) errors.push('user_id is required');
  if (!brief.conversation_id) errors.push('conversation_id is required');
  if (!brief.content_type) errors.push('content_type is required');
  if (!brief.language) errors.push('language is required');

  // Requirements array must have at least one item
  if (!brief.requirements || brief.requirements.length === 0) {
    errors.push('requirements array must have at least one item');
  }

  // Quality keywords must be array (can be empty)
  if (!Array.isArray(brief.quality_keywords)) {
    errors.push('quality_keywords must be an array');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
