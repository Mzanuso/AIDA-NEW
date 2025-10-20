/**
 * Supabase Styles Client
 *
 * Fetches style references directly from Supabase database
 * Replaces mock-styles-server.cjs with real database queries
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('SupabaseStylesClient');

export interface StyleReference {
  id: string;
  sref_code: string;
  name: string;
  description?: string;
  category: string;
  thumbnail_url: string;
  image_urls: string[];
  tags?: string[];
  keywords?: string[];
  rgb_palette?: any;
  technical_details?: any;
  created_at?: string;
  updated_at?: string;
}

export class SupabaseStylesClient {
  private supabase: SupabaseClient;
  private readonly STYLES_TABLE = 'style_references';

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    logger.info('SupabaseStylesClient initialized', { supabaseUrl });
  }

  /**
   * Get all styles with optional limit
   */
  async getAllStyles(limit: number = 10): Promise<StyleReference[]> {
    try {
      logger.info('Fetching all styles', { limit });

      const { data, error } = await this.supabase
        .from(this.STYLES_TABLE)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to fetch styles', { error: error.message });
        return [];
      }

      logger.info('Styles fetched successfully', { count: data?.length || 0 });
      return data || [];

    } catch (error) {
      logger.error('Unexpected error fetching styles', { error });
      return [];
    }
  }

  /**
   * Get style by SREF code
   */
  async getStyleBySrefCode(srefCode: string): Promise<StyleReference | null> {
    try {
      logger.info('Fetching style by SREF code', { srefCode });

      const { data, error } = await this.supabase
        .from(this.STYLES_TABLE)
        .select('*')
        .eq('sref_code', srefCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          logger.warn('Style not found', { srefCode });
          return null;
        }
        logger.error('Failed to fetch style', { error: error.message, srefCode });
        return null;
      }

      return data;

    } catch (error) {
      logger.error('Unexpected error fetching style', { error, srefCode });
      return null;
    }
  }

  /**
   * Get styles by category
   */
  async getStylesByCategory(category: string, limit: number = 10): Promise<StyleReference[]> {
    try {
      logger.info('Fetching styles by category', { category, limit });

      const { data, error } = await this.supabase
        .from(this.STYLES_TABLE)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to fetch styles by category', { error: error.message, category });
        return [];
      }

      logger.info('Styles fetched by category', { category, count: data?.length || 0 });
      return data || [];

    } catch (error) {
      logger.error('Unexpected error fetching styles by category', { error, category });
      return [];
    }
  }

  /**
   * Search styles by keyword (searches in name, description, tags, keywords)
   */
  async searchStyles(keyword: string, limit: number = 10): Promise<StyleReference[]> {
    try {
      logger.info('Searching styles', { keyword, limit });

      const { data, error } = await this.supabase
        .from(this.STYLES_TABLE)
        .select('*')
        .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
        .limit(limit);

      if (error) {
        logger.error('Failed to search styles', { error: error.message, keyword });
        return [];
      }

      logger.info('Styles search complete', { keyword, count: data?.length || 0 });
      return data || [];

    } catch (error) {
      logger.error('Unexpected error searching styles', { error, keyword });
      return [];
    }
  }

  /**
   * Get random styles (for recommendations when no specific criteria)
   */
  async getRandomStyles(count: number = 5): Promise<StyleReference[]> {
    try {
      logger.info('Fetching random styles', { count });

      // Get total count
      const { count: totalCount, error: countError } = await this.supabase
        .from(this.STYLES_TABLE)
        .select('*', { count: 'exact', head: true });

      if (countError || !totalCount) {
        return this.getAllStyles(count);
      }

      // Get random offset
      const maxOffset = Math.max(0, totalCount - count);
      const randomOffset = Math.floor(Math.random() * maxOffset);

      const { data, error } = await this.supabase
        .from(this.STYLES_TABLE)
        .select('*')
        .range(randomOffset, randomOffset + count - 1);

      if (error) {
        logger.error('Failed to fetch random styles', { error: error.message });
        return this.getAllStyles(count);
      }

      logger.info('Random styles fetched', { count: data?.length || 0 });
      return data || [];

    } catch (error) {
      logger.error('Unexpected error fetching random styles', { error });
      return this.getAllStyles(count);
    }
  }

  /**
   * Get styles with recommendations based on intent
   */
  async getRecommendations(intent: {
    purpose?: string;
    platform?: string;
    style?: string;
    mood?: string;
  }, limit: number = 5): Promise<StyleReference[]> {
    try {
      logger.info('Getting style recommendations', { intent, limit });

      // Build search criteria
      let query = this.supabase
        .from(this.STYLES_TABLE)
        .select('*');

      // Apply filters based on intent
      if (intent.style && intent.style !== 'unknown') {
        query = query.or(`name.ilike.%${intent.style}%,description.ilike.%${intent.style}%`);
      }

      // If no specific filters, get random styles
      if (!intent.style || intent.style === 'unknown') {
        logger.info('No specific intent, fetching random styles');
        return this.getRandomStyles(limit);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to get recommendations', { error: error.message });
        return this.getRandomStyles(limit);
      }

      // If no matches found, fallback to random
      if (!data || data.length === 0) {
        logger.info('No matches for intent, falling back to random');
        return this.getRandomStyles(limit);
      }

      logger.info('Recommendations found', { count: data.length });
      return data;

    } catch (error) {
      logger.error('Unexpected error getting recommendations', { error });
      return this.getRandomStyles(limit);
    }
  }

  /**
   * Health check - verify Supabase connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(this.STYLES_TABLE)
        .select('id', { count: 'exact', head: true })
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }
}

// Lazy singleton - created on first use to ensure env vars are loaded
let instance: SupabaseStylesClient | null = null;

export function getSupabaseStylesClient(): SupabaseStylesClient {
  if (!instance) {
    instance = new SupabaseStylesClient();
  }
  return instance;
}

// Export for backwards compatibility
export const supabaseStylesClient = {
  get getAllStyles() { return getSupabaseStylesClient().getAllStyles.bind(getSupabaseStylesClient()); },
  get getStyleBySrefCode() { return getSupabaseStylesClient().getStyleBySrefCode.bind(getSupabaseStylesClient()); },
  get getStylesByCategory() { return getSupabaseStylesClient().getStylesByCategory.bind(getSupabaseStylesClient()); },
  get searchStyles() { return getSupabaseStylesClient().searchStyles.bind(getSupabaseStylesClient()); },
  get getRandomStyles() { return getSupabaseStylesClient().getRandomStyles.bind(getSupabaseStylesClient()); },
  get getRecommendations() { return getSupabaseStylesClient().getRecommendations.bind(getSupabaseStylesClient()); },
  get healthCheck() { return getSupabaseStylesClient().healthCheck.bind(getSupabaseStylesClient()); }
};
