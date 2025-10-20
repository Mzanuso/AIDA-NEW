/**
 * Style Selector Client
 *
 * Client to fetch styles from Supabase database
 * Replaces old REST API client with direct Supabase queries
 */

import { supabaseStylesClient } from './supabase-styles-client';
import { createLogger } from '../../../../utils/logger';

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

export interface StyleGalleryRequest {
  category?: string;
  limit?: number;
}

export interface StyleGallery {
  styles: StyleReference[];
  ui_type: 'image_gallery' | 'list' | 'cards';
}

export interface StyleMatch {
  styleId: string;
  confidence: number;
  reason: string;
}

export class StyleSelectorClient {
  constructor() {
    logger.info('StyleSelectorClient initialized (using Supabase)');
  }

  /**
   * Get all available styles
   */
  async getAllStyles(limit: number = 10): Promise<StyleReference[]> {
    try {
      logger.info('Fetching all styles from Supabase', { limit });
      return await supabaseStylesClient.getAllStyles(limit);
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
    try {
      logger.info('getRecommendations called', { intent, limit });
      return await supabaseStylesClient.getRecommendations(intent, limit);
    } catch (error) {
      logger.error('Failed to get recommendations', { error });
      return [];
    }
  }

  /**
   * Get style gallery for UI display
   *
   * Returns styles formatted for image gallery, list, or cards UI
   */
  async getGallery(request: StyleGalleryRequest): Promise<StyleGallery> {
    try {
      const { category, limit = 12 } = request;

      logger.info('Fetching style gallery', { category, limit });

      let styles: StyleReference[];

      if (category) {
        // Get styles by category
        styles = await this.getStylesByCategory(category, limit);
      } else {
        // Get all popular styles
        styles = await this.getAllStyles(limit);
      }

      // Determine UI type based on number of styles
      const ui_type: StyleGallery['ui_type'] =
        styles.length > 6 ? 'image_gallery' :
        styles.length > 3 ? 'cards' :
        'list';

      logger.info('Gallery fetched successfully', {
        stylesCount: styles.length,
        ui_type
      });

      return {
        styles,
        ui_type
      };

    } catch (error) {
      logger.error('Failed to fetch gallery', { error, request });

      // Return fallback gallery
      return this.getFallbackGallery();
    }
  }

  /**
   * Match styles mentioned in user message
   *
   * Analyzes message for style keywords and returns matching styles
   */
  async matchStyles(message: string): Promise<StyleMatch[]> {
    try {
      logger.info('Matching styles in message', { message: message.substring(0, 50) });

      // Extract potential style keywords
      const keywords = this.extractStyleKeywords(message);

      if (keywords.length === 0) {
        return [];
      }

      // Search for matching styles
      const matches: StyleMatch[] = [];

      for (const keyword of keywords) {
        const styles = await this.searchStyles({ keyword, limit: 3 });

        styles.forEach(style => {
          matches.push({
            styleId: style.id,
            confidence: this.calculateMatchConfidence(keyword, style),
            reason: `Matched keyword: "${keyword}"`
          });
        });
      }

      // Sort by confidence
      matches.sort((a, b) => b.confidence - a.confidence);

      logger.info('Style matches found', { matchCount: matches.length });

      return matches.slice(0, 5); // Return top 5 matches

    } catch (error) {
      logger.error('Failed to match styles', { error });
      return [];
    }
  }

  /**
   * Categorize user message to a style category
   *
   * Determines which style category best fits the user's message
   */
  async categorizeMessage(message: string): Promise<string | null> {
    const lowerMessage = message.toLowerCase();

    // Category patterns
    const categoryPatterns: Record<string, RegExp[]> = {
      'realistic': [
        /\b(realistic|photo|photographic|real)\b/i,
        /\b(fotorealistic|naturale)\b/i
      ],
      'illustration': [
        /\b(illustration|illustrated|drawing|disegno)\b/i,
        /\b(draw|sketch|cartoon)\b/i
      ],
      'cinematic': [
        /\b(cinematic|film|movie|epic)\b/i,
        /\b(cinema|cinematografico)\b/i
      ],
      'minimal': [
        /\b(minimal|minimalist|simple|clean)\b/i,
        /\b(minimalista|pulito)\b/i
      ],
      'vintage': [
        /\b(vintage|retro|classic|old)\b/i,
        /\b(classico|antico)\b/i
      ],
      'modern': [
        /\b(modern|contemporary|new)\b/i,
        /\b(moderno|contemporaneo)\b/i
      ]
    };

    // Find matching category
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => pattern.test(lowerMessage))) {
        logger.info('Categorized message', { category, message: message.substring(0, 50) });
        return category;
      }
    }

    return null;
  }

  /**
   * Get details of a specific style
   */
  async getStyleDetails(styleId: string): Promise<StyleReference | null> {
    try {
      const id = parseInt(styleId);
      if (isNaN(id)) {
        logger.warn('Invalid style ID', { styleId });
        return null;
      }

      return await this.getStyleById(id);
    } catch (error) {
      logger.error('Failed to get style details', { error, styleId });
      return null;
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Extract style-related keywords from message
   */
  private extractStyleKeywords(message: string): string[] {
    const keywords: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Common style keywords in multiple languages
    const styleKeywords = [
      // English
      'realistic', 'photo', 'illustration', 'cartoon', 'abstract',
      'minimal', 'modern', 'vintage', 'retro', 'cinematic',
      'artistic', 'professional', 'casual', 'elegant', 'bold',

      // Italian
      'realistico', 'fotorealistico', 'illustrato', 'fumetto',
      'astratto', 'minimale', 'moderno', 'vintage', 'classico',

      // Spanish
      'realista', 'ilustrado', 'minimalista', 'moderno',

      // French
      'réaliste', 'illustré', 'minimaliste', 'moderne',

      // German
      'realistisch', 'illustriert', 'minimalistisch', 'modern'
    ];

    styleKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Calculate confidence score for style match
   */
  private calculateMatchConfidence(keyword: string, style: StyleReference): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence if keyword in name
    if (style.name.toLowerCase().includes(keyword.toLowerCase())) {
      confidence += 0.3;
    }

    // Increase confidence if keyword in tags
    if (style.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))) {
      confidence += 0.2;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Get fallback gallery when service is unavailable
   */
  private getFallbackGallery(): StyleGallery {
    logger.warn('Using fallback gallery (service unavailable)');

    return {
      styles: [
        {
          id: 'fallback-realistic',
          name: 'Realistic',
          description: 'Photorealistic style',
          category: 'realistic',
          tags: ['photo', 'realistic'],
          images: {
            thumbnail: '',
            full: []
          },
          palette: [],
          technicalDetails: {
            medium: ['digital'],
            style: ['photorealistic']
          }
        },
        {
          id: 'fallback-illustration',
          name: 'Illustration',
          description: 'Hand-drawn illustration style',
          category: 'illustration',
          tags: ['drawing', 'illustrated'],
          images: {
            thumbnail: '',
            full: []
          },
          palette: [],
          technicalDetails: {
            medium: ['digital'],
            style: ['illustration']
          }
        },
        {
          id: 'fallback-minimal',
          name: 'Minimal',
          description: 'Clean minimalist style',
          category: 'minimal',
          tags: ['minimal', 'clean'],
          images: {
            thumbnail: '',
            full: []
          },
          palette: [],
          technicalDetails: {
            medium: ['digital'],
            style: ['minimal']
          }
        }
      ],
      ui_type: 'list'
    };
  }
}
