/**
 * Director Agent HTTP Client
 *
 * Client for calling Director microservice (port 3007)
 * Used by Technical Planner to generate video storyboards
 */

import axios, { AxiosInstance } from 'axios';
import {
  DirectorRequest,
  DirectorResult,
  MultiVariantRequest,
  MultiVariantResult,
} from '../director/types';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DirectorClient');

export interface DirectorClientConfig {
  baseUrl?: string;
  timeout?: number;
}

const DEFAULT_CONFIG: DirectorClientConfig = {
  baseUrl: process.env.DIRECTOR_URL || 'http://localhost:3007',
  timeout: 60000, // 60s timeout (storyboards can be detailed)
};

/**
 * Director Client - HTTP client for Director Agent
 */
export class DirectorClient {
  private client: AxiosInstance;
  private config: DirectorClientConfig;

  constructor(config?: Partial<DirectorClientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('Director client initialized', {
      baseUrl: this.config.baseUrl,
    });
  }

  /**
   * Generate single concept with specified philosophy
   *
   * @param request - Director request with brief and philosophy
   * @returns DirectorResult with storyboard
   */
  async generate(request: DirectorRequest): Promise<DirectorResult> {
    try {
      logger.info('Generating single concept', {
        philosophy: request.philosophy || 'emotional',
        brief: request.brief.substring(0, 50) + '...',
      });

      const response = await this.client.post<DirectorResult>(
        '/generate',
        request
      );

      logger.info('Concept generated successfully', {
        philosophy: response.data.philosophy,
        scenes: response.data.storyboard.scenes.length,
        success: response.data.success,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to generate concept', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Director generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate 3 concepts in parallel (Feature 3: Multi-Agent Creative Debate)
   *
   * Generates 3 diverse concepts with different creative philosophies:
   * - Emotional: Story-driven, human connection
   * - Disruptive: Bold, unconventional, norm-breaking
   * - Data-Driven: Metrics-backed, proven patterns
   *
   * @param request - Multi-variant request with brief
   * @returns MultiVariantResult with all 3 variants + recommendation
   */
  async generateMultiVariant(
    request: MultiVariantRequest
  ): Promise<MultiVariantResult> {
    try {
      logger.info('Generating multi-variant concepts (Feature 3)', {
        brief: request.brief.substring(0, 50) + '...',
        synthesize: request.synthesize_best || false,
      });

      const response = await this.client.post<MultiVariantResult>(
        '/generate/multi-variant',
        request
      );

      logger.info('Multi-variant concepts generated successfully', {
        success: response.data.success,
        emotional: response.data.variants.emotional.success,
        disruptive: response.data.variants.disruptive.success,
        dataDriven: response.data.variants.dataDriven.success,
        recommendation: response.data.recommendation?.best_variant,
        totalTime: response.data.total_generation_time_ms,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to generate multi-variant concepts', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Director multi-variant generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get available philosophies
   */
  async getPhilosophies(): Promise<string[]> {
    try {
      const response = await this.client.get<{ philosophies: string[] }>(
        '/philosophies'
      );
      return response.data.philosophies;
    } catch (error) {
      logger.error('Failed to get philosophies', {
        error: error instanceof Error ? error.message : String(error),
      });
      return ['emotional', 'disruptive', 'dataDriven']; // Fallback
    }
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data.status === 'healthy';
    } catch (error) {
      logger.warn('Director health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
