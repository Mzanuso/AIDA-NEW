/**
 * Style Selector Types
 *
 * Core type definitions for Style Selector Agent
 */

export interface StyleResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  images: {
    thumbnail: string;
    full: string[];
  };
  palette: string[];
  technicalDetails: {
    medium: string[];
    style: string[];
  };
}

export interface StyleSearchQuery {
  keyword?: string;
  tags?: string[];
  category?: string;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
