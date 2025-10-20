/**
 * Shared Types
 *
 * Common type definitions used across the application
 */

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  timestamp: string;
  requestId?: string;
  duration?: number;
  version?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * User context (from session/JWT)
 */
export interface UserContext {
  userId: string;
  email?: string;
  role?: string;
  permissions?: string[];
}

/**
 * Session context
 */
export interface SessionContext extends UserContext {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Language codes
 */
export type LanguageCode = 'en' | 'it' | 'es' | 'fr' | 'de';

/**
 * Model selection options
 */
export type ModelType = 'claude-sonnet-4-5-20250929' | 'claude-opus-4-20250514';

/**
 * Agent types in the system
 */
export type AgentType =
  | 'orchestrator'
  | 'style-selector'
  | 'technical-planner'
  | 'music-director'
  | 'writer'
  | 'director';

/**
 * Tool execution result
 */
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  duration?: number;
}
