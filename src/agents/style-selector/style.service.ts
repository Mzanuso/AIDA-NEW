/** Style Service - Business logic using Supabase */
import { createClient } from '@supabase/supabase-js';
import { StyleResponse, StyleSearchQuery } from './types';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map database record to API response format
function mapDbToResponse(dbRecord: any): StyleResponse {
  return {
    id: dbRecord.sref_code,
    name: dbRecord.name,
    description: dbRecord.description || '',
    category: dbRecord.category,
    tags: dbRecord.tags || [],
    images: {
      thumbnail: dbRecord.thumbnail_url || '',
      full: dbRecord.image_urls || []
    },
    palette: dbRecord.rgb_palette || [],
    technicalDetails: {
      medium: dbRecord.technical_details?.medium || [],
      style: dbRecord.technical_details?.style || []
    }
  };
}

export class StyleService {
  async getAllStyles(): Promise<StyleResponse[]> {
    const { data, error } = await supabase
      .from('style_references')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching styles:', error);
      return [];
    }

    return data.map(mapDbToResponse);
  }

  async getStyleById(id: string): Promise<StyleResponse | null> {
    const { data, error } = await supabase
      .from('style_references')
      .select('*')
      .eq('sref_code', id)
      .single();

    if (error) {
      console.error(`Error fetching style ${id}:`, error);
      return null;
    }

    return mapDbToResponse(data);
  }

  async searchStyles(query: StyleSearchQuery): Promise<StyleResponse[]> {
    let dbQuery = supabase.from('style_references').select('*');

    // Filter by keyword (searches in name, description)
    if (query.keyword) {
      const kw = query.keyword;
      dbQuery = dbQuery.or(`name.ilike.%${kw}%,description.ilike.%${kw}%`);
    }

    // Filter by tags (array contains)
    if (query.tags && query.tags.length > 0) {
      dbQuery = dbQuery.contains('tags', query.tags);
    }

    // Filter by category
    if (query.category) {
      dbQuery = dbQuery.eq('category', query.category);
    }

    // Apply limit
    if (query.limit && query.limit > 0) {
      dbQuery = dbQuery.limit(query.limit);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error searching styles:', error);
      return [];
    }

    return data.map(mapDbToResponse);
  }
}
