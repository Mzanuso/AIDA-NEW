/**
 * Technical Planner Type Definitions
 *
 * TypeScript contracts for communication between:
 * - Orchestrator (Account Manager)
 * - Technical Planner (Project Manager)
 * - Execution Layer (Workers)
 *
 * This defines the multi-agent architecture interface.
 */

import { CreativeCapability } from '../services/model-selector';
import { Language } from '../services/language-detector';

// Re-export CreativeCapability for external use
export { CreativeCapability };

// =============================================================================
// PROJECT BRIEF (Orchestrator → Technical Planner)
// =============================================================================

/**
 * Content type categories
 */
export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'design' | 'repurpose' | 'multimedia';

/**
 * Project Brief
 *
 * Complete requirements gathered by Orchestrator during discovery/refinement.
 * Sent to Technical Planner for execution planning.
 */
export interface ProjectBrief {
  id: string;
  sessionId: string;
  userId: string;

  // Core requirements
  capability: CreativeCapability;
  type: ContentType;

  // User requirements
  requirements: ProjectRequirements;

  // Context and preferences
  context: ProjectContext;

  // Conversation history (for reference)
  rawConversation: ConversationMessage[];

  // Metadata
  createdAt: Date;
  language: Language;
}

/**
 * Project Requirements
 *
 * Technical and creative requirements extracted from conversation
 */
export interface ProjectRequirements {
  // Common
  style?: string;
  budget?: 'low' | 'medium' | 'high';
  deadline?: Date;
  qualityLevel?: 'fast' | 'standard' | 'premium';

  // Visual-specific
  duration?: string; // "4s", "10s", "30s", "60s"
  platform?: string; // "instagram", "tiktok", "youtube"
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
  resolution?: '720p' | '1080p' | '4K';

  // Text-specific
  length?: 'short' | 'medium' | 'long';
  tone?: 'formal' | 'casual' | 'professional' | 'friendly';
  targetAudience?: string;

  // Audio-specific
  voice?: 'male' | 'female' | 'neutral';
  musicGenre?: string;

  // Additional specifications
  customSpecs?: Record<string, any>;
}

/**
 * Project Context
 *
 * Additional context to inform execution decisions
 */
export interface ProjectContext {
  description: string;
  references?: string[]; // URLs, file IDs, etc.
  mood?: string;
  targetAudience?: string;
  brandGuidelines?: string;
  inspirationExamples?: string[];
}

/**
 * Conversation Message
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// =============================================================================
// EXECUTION PLAN (Technical Planner → Orchestrator)
// =============================================================================

/**
 * Execution Plan
 *
 * Technical Planner's plan for how to execute the project.
 * Includes model selection, workflow steps, cost/time estimates.
 */
export interface ExecutionPlan {
  id: string;
  briefId: string;

  // Execution strategy
  approach: 'single_model' | 'multi_step_workflow' | 'hybrid';

  // Model selection
  primaryModel: ModelConfig;
  fallbackModel?: ModelConfig;

  // Workflow steps
  steps: ExecutionStep[];

  // Estimates
  estimatedTime: number; // seconds
  estimatedCost: number; // dollars/credits

  // Status tracking
  status: ExecutionStatus;
  progress: number; // 0-100

  // Metadata
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Model Configuration
 */
export interface ModelConfig {
  name: string;
  provider: 'fal-ai' | 'kie-ai' | 'anthropic' | 'openai' | 'other';
  apiEndpoint: string;
  estimatedCost: number;
  estimatedTime: number; // seconds
  parameters?: Record<string, any>;
  reason: string; // Why this model was selected
}

/**
 * Execution Step
 *
 * Individual step in the workflow
 */
export interface ExecutionStep {
  id: string;
  sequenceNumber: number;

  // Agent assignment
  agent: AgentType;
  action: string;

  // Model usage (if applicable)
  model?: ModelConfig;

  // Input/Output
  input: any;
  output?: any;

  // Status
  status: StepStatus;
  startTime?: Date;
  endTime?: Date;
  error?: ExecutionError;

  // Dependencies
  dependsOn?: string[]; // IDs of previous steps
}

/**
 * Agent Types in Multi-Agent Architecture
 */
export type AgentType =
  | 'writer'           // Text generation, script writing
  | 'director'         // Storyboarding, shot planning
  | 'style_selector'   // Visual style selection
  | 'visual_creator'   // Image generation
  | 'video_composer'   // Video generation and editing
  | 'audio_creator'    // Music and audio generation
  | 'designer'         // Graphic design
  | 'coordinator';     // Workflow coordination

/**
 * Execution Status
 */
export type ExecutionStatus =
  | 'pending'          // Not started yet
  | 'in_progress'      // Currently executing
  | 'paused'           // Paused (waiting for user input)
  | 'completed'        // Successfully completed
  | 'failed'           // Failed with error
  | 'cancelled';       // Cancelled by user

/**
 * Step Status
 */
export type StepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

/**
 * Execution Error
 */
export interface ExecutionError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  suggestedAction?: string;
}

// =============================================================================
// PROJECT STATUS (Technical Planner → Orchestrator)
// =============================================================================

/**
 * Project Status
 *
 * Real-time status updates during execution
 */
export interface ProjectStatus {
  planId: string;
  status: ExecutionStatus;
  progress: number; // 0-100

  // Current step info
  currentStep?: CurrentStepInfo;

  // Result (if completed)
  result?: ProjectResult;

  // Error (if failed)
  error?: ExecutionError;

  // Timing
  startedAt?: Date;
  estimatedCompletionTime?: Date;
  actualCompletionTime?: Date;
}

/**
 * Current Step Information
 */
export interface CurrentStepInfo {
  stepId: string;
  name: string;
  agent: AgentType;
  progress: number; // 0-100
  message?: string; // User-facing status message
}

/**
 * Project Result
 *
 * Final output when execution completes
 */
export interface ProjectResult {
  // Generated files
  files: ResultFile[];

  // Metadata
  metadata: ResultMetadata;

  // Preview/Thumbnails
  previews?: PreviewData[];
}

/**
 * Result File
 */
export interface ResultFile {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive';
  url: string;
  filename: string;
  size: number; // bytes
  mimeType: string;

  // Media-specific
  duration?: number; // seconds (video/audio)
  resolution?: string; // "1920x1080"
  aspectRatio?: string; // "16:9"
  thumbnail?: string; // URL to thumbnail
}

/**
 * Result Metadata
 */
export interface ResultMetadata {
  // Models used
  modelsUsed: string[];

  // Actual costs
  totalCost: number;
  costBreakdown: CostBreakdownItem[];

  // Timing
  generationTime: number; // seconds
  totalSteps: number;

  // Capability
  capability: CreativeCapability;

  // Quality metrics (if available)
  qualityScore?: number; // 0-100
}

/**
 * Cost Breakdown Item
 */
export interface CostBreakdownItem {
  step: string;
  model: string;
  cost: number;
  currency: 'USD' | 'credits';
}

/**
 * Preview Data
 *
 * Preview/thumbnail for quick viewing
 */
export interface PreviewData {
  type: 'image' | 'video' | 'gif';
  url: string;
  width: number;
  height: number;
}

// =============================================================================
// TECHNICAL PLANNER INTERFACE
// =============================================================================

/**
 * Technical Planner Interface
 *
 * Contract that any Technical Planner implementation must follow
 */
export interface ITechnicalPlanner {
  /**
   * Create execution plan from project brief
   */
  createExecutionPlan(brief: ProjectBrief): Promise<ExecutionPlan>;

  /**
   * Get current project status
   */
  getProjectStatus(planId: string): Promise<ProjectStatus>;

  /**
   * Cancel execution
   */
  cancelExecution(planId: string): Promise<void>;

  /**
   * Retry failed execution
   */
  retryExecution(planId: string): Promise<ExecutionPlan>;

  /**
   * Get execution history for a user
   */
  getExecutionHistory(userId: string, limit?: number): Promise<ExecutionPlan[]>;
}

// =============================================================================
// VALIDATION ERRORS
// =============================================================================

/**
 * Validation Error
 *
 * Thrown when project brief is invalid
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Planning Error
 *
 * Thrown when execution plan cannot be created
 */
export class PlanningError extends Error {
  constructor(
    message: string,
    public reason: string,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'PlanningError';
  }
}

/**
 * Execution Error Class
 *
 * Thrown during execution
 */
export class ExecutionException extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = false,
    public details?: any
  ) {
    super(message);
    this.name = 'ExecutionException';
  }
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Brief Validation Result
 */
export interface BriefValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Model Selection Criteria
 */
export interface ModelSelectionCriteria {
  capability: CreativeCapability;
  requirements: ProjectRequirements;
  budget: 'low' | 'medium' | 'high';
  prioritizeSpeed: boolean;
  prioritizeQuality: boolean;
}

/**
 * Workflow Template
 *
 * Pre-defined workflow for common capabilities
 */
export interface WorkflowTemplate {
  capability: CreativeCapability;
  steps: WorkflowStepTemplate[];
  estimatedTime: number;
  estimatedCost: number;
}

/**
 * Workflow Step Template
 */
export interface WorkflowStepTemplate {
  agent: AgentType;
  action: string;
  requiredInputs: string[];
  outputType: string;
  parallel: boolean; // Can run in parallel with other steps
}
