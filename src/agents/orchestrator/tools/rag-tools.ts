import { db } from '../../../utils/db';
import OpenAI from 'openai';
import { sql } from 'drizzle-orm';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('RagTools');

interface SimilarProject {
  id: string;
  title: string;
  brief: string;
  style: {
    id: string;
    name: string;
    code: string;
  };
  videoUrl: string;
  similarity: number;
  createdAt: Date;
}

interface UserFile {
  id: string;
  fileName: string;
  fileType: 'text' | 'image' | 'video';
  fileUrl: string;
  textContent?: string;
  metadata: Record<string, any>;
  similarity?: number;
}

interface Campaign {
  id: string;
  name: string;
  theme: string;
  status: string;
  projectCount: number;
}

interface CampaignContext {
  campaign: Campaign;
  projectCount: number;
  mostUsedStyle: string;
  averageDuration: number;
  projects: SimilarProject[];
}

interface UserPreferences {
  id: string;
  category: string;
  preferredStyleId?: string;
  preferredDuration?: number;
  preferredTone?: string;
  confidenceScore: number;
}

export class RagTools {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
  }
  
  /**
   * Search similar projects using pgvector semantic search
   */
  async searchSimilarProjects(
    userId: string,
    query: string,
    limit: number = 5
  ): Promise<SimilarProject[]> {
    logger.info('Searching similar projects', { userId, query, limit });
    
    try {
      // Generate embedding for query
      const embedding = await this.generateEmbedding(query);
      
      // Vector search with pgvector
      const results = await db.execute(sql`
        SELECT 
          p.id,
          p.title,
          p.brief,
          p."styleId",
          p."videoUrl",
          p."createdAt",
          s.name as style_name,
          s.code as sref_code,
          pe.embedding <=> ${embedding}::vector as distance
        FROM projects p
        JOIN project_embeddings pe ON p.id = pe."projectId"
        LEFT JOIN styles s ON p."styleId" = s.id
        WHERE p."userId" = ${userId}
        ORDER BY distance ASC
        LIMIT ${limit}
      `);
      
      return results.map((r: any) => ({
        id: r.id,
        title: r.title,
        brief: r.brief,
        style: {
          id: r.styleId,
          name: r.style_name,
          code: r.sref_code
        },
        videoUrl: r.videoUrl,
        similarity: 1 - r.distance, // convert distance to similarity
        createdAt: r.createdAt
      }));
    } catch (error) {
      logger.error('Failed to search similar projects', { error });
      return [];
    }
  }
  
  /**
   * Find user files by semantic description
   */
  async findRelevantFiles(
    userId: string,
    description: string,
    fileType?: 'text' | 'image' | 'video'
  ): Promise<UserFile[]> {
    logger.info('Finding relevant files', { userId, description, fileType });
    
    try {
      const embedding = await this.generateEmbedding(description);
      
      const typeFilter = fileType ? sql`AND "fileType" = ${fileType}` : sql``;
      
      const results = await db.execute(sql`
        SELECT 
          id,
          "fileName",
          "fileType",
          "fileUrl",
          "textContent",
          metadata,
          embedding <=> ${embedding}::vector as distance
        FROM user_files
        WHERE "userId" = ${userId}
        ${typeFilter}
        ORDER BY distance ASC
        LIMIT 5
      `);
      
      return results.map((r: any) => ({
        id: r.id,
        fileName: r.fileName,
        fileType: r.fileType,
        fileUrl: r.fileUrl,
        textContent: r.textContent,
        metadata: r.metadata,
        similarity: 1 - r.distance
      }));
    } catch (error) {
      logger.error('Failed to find files', { error });
      return [];
    }
  }
  
  /**
   * Get active campaigns for user
   */
  async getActiveCampaigns(userId: string): Promise<Campaign[]> {
    logger.info('Getting active campaigns', { userId });
    
    try {
      const results = await db.execute(sql`
        SELECT 
          c.id,
          c.name,
          c.theme,
          c.status,
          COUNT(pc."projectId") as project_count
        FROM campaigns c
        LEFT JOIN project_campaigns pc ON c.id = pc."campaignId"
        WHERE c."userId" = ${userId} AND c.status = 'active'
        GROUP BY c.id
        ORDER BY c."createdAt" DESC
      `);
      
      return results.map((r: any) => ({
        id: r.id,
        name: r.name,
        theme: r.theme,
        status: r.status,
        projectCount: parseInt(r.project_count) || 0
      }));
    } catch (error) {
      logger.error('Failed to get campaigns', { error });
      return [];
    }
  }
  
  /**
   * Load campaign context with all associated projects
   */
  async loadCampaignContext(
    userId: string,
    campaignName: string
  ): Promise<CampaignContext | null> {
    logger.info('Loading campaign context', { userId, campaignName });
    
    try {
      // Find campaign by fuzzy name match
      const campaignResults = await db.execute(sql`
        SELECT id, name, theme, status
        FROM campaigns
        WHERE "userId" = ${userId}
        AND LOWER(name) LIKE ${`%${campaignName.toLowerCase()}%`}
        LIMIT 1
      `);
      
      if (campaignResults.length === 0) {
        logger.warn('Campaign not found', { campaignName });
        return null;
      }
      
      const campaign = campaignResults[0] as any;
      
      // Load all projects in campaign
      const projectResults = await db.execute(sql`
        SELECT 
          p.id,
          p.title,
          p.brief,
          p."styleId",
          p."videoUrl",
          p."createdAt",
          p.duration,
          s.name as style_name,
          s.code as sref_code
        FROM projects p
        JOIN project_campaigns pc ON p.id = pc."projectId"
        LEFT JOIN styles s ON p."styleId" = s.id
        WHERE pc."campaignId" = ${campaign.id}
        ORDER BY p."createdAt" DESC
      `);
      
      const projects = projectResults as any[];
      
      // Aggregate common parameters
      const styleCounts: Record<string, number> = {};
      let totalDuration = 0;
      
      projects.forEach(p => {
        if (p.styleId) {
          styleCounts[p.styleId] = (styleCounts[p.styleId] || 0) + 1;
        }
        if (p.duration) {
          totalDuration += p.duration;
        }
      });
      
      const mostUsedStyle = Object.entries(styleCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
      
      const avgDuration = projects.length > 0 
        ? Math.round(totalDuration / projects.length) 
        : 30;
      
      return {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          theme: campaign.theme,
          status: campaign.status,
          projectCount: projects.length
        },
        projectCount: projects.length,
        mostUsedStyle,
        averageDuration: avgDuration,
        projects: projects.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          brief: p.brief,
          style: {
            id: p.styleId,
            name: p.style_name,
            code: p.sref_code
          },
          videoUrl: p.videoUrl,
          similarity: 1,
          createdAt: p.createdAt
        }))
      };
    } catch (error) {
      logger.error('Failed to load campaign context', { error });
      return null;
    }
  }
  
  /**
   * Get user preferences (explicit or learned)
   */
  async getUserPreferences(
    userId: string,
    category?: string
  ): Promise<UserPreferences[]> {
    logger.info('Getting user preferences', { userId, category });
    
    try {
      const categoryFilter = category 
        ? sql`AND category = ${category}`
        : sql``;
      
      const results = await db.execute(sql`
        SELECT 
          id,
          category,
          "preferredStyleId",
          "preferredDuration",
          "preferredTone",
          "confidenceScore"
        FROM user_preferences
        WHERE "userId" = ${userId}
        ${categoryFilter}
        ORDER BY "confidenceScore" DESC
      `);
      
      if (results.length > 0) {
        return results as unknown as UserPreferences[];
      }
      
      // No explicit preferences - learn from history
      return this.learnPreferences(userId, category);
    } catch (error) {
      logger.error('Failed to get preferences', { error });
      return [];
    }
  }
  
  /**
   * Learn preferences from user's project history
   */
  private async learnPreferences(
    userId: string,
    category?: string
  ): Promise<UserPreferences[]> {
    logger.info('Learning preferences from history', { userId, category });
    
    try {
      const results = await db.execute(sql`
        SELECT 
          p."styleId",
          p.duration,
          COUNT(*) as usage_count
        FROM projects p
        WHERE p."userId" = ${userId}
        GROUP BY p."styleId", p.duration
        ORDER BY usage_count DESC
        LIMIT 1
      `);
      
      if (results.length === 0) {
        return [];
      }
      
      const mostUsed = results[0] as any;
      const totalProjects = parseInt(mostUsed.usage_count) || 0;
      
      // Save learned preference
      const savedPref = await db.execute(sql`
        INSERT INTO user_preferences (
          "userId",
          category,
          "preferredStyleId",
          "preferredDuration",
          "confidenceScore",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${userId},
          ${category || 'general'},
          ${mostUsed.styleId},
          ${mostUsed.duration},
          ${Math.min(totalProjects / 10, 0.9)},
          NOW(),
          NOW()
        )
        ON CONFLICT ("userId", category) 
        DO UPDATE SET
          "preferredStyleId" = EXCLUDED."preferredStyleId",
          "preferredDuration" = EXCLUDED."preferredDuration",
          "confidenceScore" = EXCLUDED."confidenceScore",
          "updatedAt" = NOW()
        RETURNING *
      `);
      
      return savedPref as unknown as UserPreferences[];
    } catch (error) {
      logger.error('Failed to learn preferences', { error });
      return [];
    }
  }
  
  /**
   * Generate text embedding via OpenAI
   */
  private async generateEmbedding(text: string): Promise<string> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 1536
      });
      
      return `[${response.data[0].embedding.join(',')}]`;
    } catch (error) {
      logger.error('Failed to generate embedding', { error });
      throw new Error('Embedding generation failed');
    }
  }
}
