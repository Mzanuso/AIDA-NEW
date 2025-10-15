/**
 * Style Selector Client
 *
 * Client to communicate with the Style Selector service
 */

import { createLogger } from '@backend/utils/logger';

const logger = createLogger('StyleSelectorClient');

export interface StyleReference {
  id: string;
  name: string;
  description?: string;
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
  // Legacy fields for compatibility
  code?: string;
  moodTags?: string[];
  useCases?: string[];
  era?: string;
  subjects?: string[];
  thumbnailUrl?: string;
  patternAnalysis?: string;
  creativeInterpretation?: string;
}

export interface StyleSearchParams {
  keyword?: string;
  tags?: string[];
  category?: string;
  limit?: number;
}

export class StyleSelectorClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
    logger.info('StyleSelectorClient initialized', { baseUrl });
  }

  /**
   * Get all available styles
   */
  async getAllStyles(limit: number = 10): Promise<StyleReference[]> {
    try {
      const url = `${this.baseUrl}/api/styles?limit=${limit}`;
      logger.info('Fetching all styles', { url, limit });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Style Selector API error: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('Received styles response', { success: data.success, count: data.data?.length || 0 });

      return data.data || [];
    } catch (error) {
      logger.error('Failed to get all styles', { error });
      return [];
    }
  }

  /**
   * Get style by ID
   */
  async getStyleById(id: number): Promise<StyleReference | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/styles/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Style Selector API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      logger.error('Failed to get style by ID', { id, error });
      return null;
    }
  }

  /**
   * Search styles by criteria
   */
  async searchStyles(params: StyleSearchParams): Promise<StyleReference[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.tags && params.tags.length > 0) {
        params.tags.forEach(tag => queryParams.append('tags', tag));
      }

      const response = await fetch(`${this.baseUrl}/api/styles/search?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Style Selector API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      logger.error('Failed to search styles', { params, error });
      return [];
    }
  }

  /**
   * Get styles by mood/intent (helper method)
   */
  async getStylesByMood(mood: string, limit: number = 5): Promise<StyleReference[]> {
    return this.searchStyles({ keyword: mood, limit });
  }

  /**
   * Get styles by category
   */
  async getStylesByCategory(category: string, limit: number = 5): Promise<StyleReference[]> {
    return this.searchStyles({ category, limit });
  }

  /**
   * Get style recommendations based on user intent
   */
  async getRecommendations(intent: {
    purpose?: string;
    platform?: string;
    style?: string;
    mood?: string;
  }, limit: number = 5): Promise<StyleReference[]> {
    logger.info('getRecommendations called', { intent, limit });

    // Build search query based on intent
    const keywords: string[] = [];
    const tags: string[] = [];

    if (intent.style && intent.style !== 'unknown') {
      keywords.push(intent.style);
    }

    if (intent.mood) {
      keywords.push(intent.mood);
    }

    if (intent.purpose && intent.purpose !== 'unknown') {
      tags.push(intent.purpose);
    }

    if (intent.platform && intent.platform !== 'unknown') {
      tags.push(intent.platform);
    }

    logger.info('Parsed intent', { keywords, tags });

    // If we have keywords, search by keyword
    if (keywords.length > 0) {
      logger.info('Using keyword search');
      return this.searchStyles({
        keyword: keywords.join(' '),
        tags: tags.length > 0 ? tags : undefined,
        limit
      });
    }

    // If we only have tags, search by tags
    if (tags.length > 0) {
      logger.info('Using tags search');
      return this.searchStyles({
        tags,
        limit
      });
    }

    // Fallback: return popular styles
    logger.info('Using fallback - getAllStyles');
    return this.getAllStyles(limit);
  }
}
