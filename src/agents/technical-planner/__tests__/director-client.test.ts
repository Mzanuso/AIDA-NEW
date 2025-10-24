/**
 * Director Client Tests
 *
 * Tests HTTP client for Director Agent integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { DirectorClient } from '../director-client';
import type { DirectorRequest, MultiVariantRequest } from '../../director/types';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('DirectorClient', () => {
  let client: DirectorClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Create mock axios instance
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
    };

    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);

    client = new DirectorClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('3007'),
          timeout: 60000,
        })
      );
    });

    it('should allow custom config', () => {
      new DirectorClient({
        baseUrl: 'http://custom:9999',
        timeout: 30000,
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://custom:9999',
          timeout: 30000,
        })
      );
    });
  });

  // ============================================================================
  // SINGLE CONCEPT GENERATION
  // ============================================================================

  describe('generate()', () => {
    it('should generate emotional concept successfully', async () => {
      const mockResult = {
        success: true,
        philosophy: 'emotional',
        concept_summary: 'Heartwarming story',
        reasoning: 'Emotional connection',
        storyboard: {
          scenes: [
            {
              scene_number: 1,
              duration: 30,
              description: 'Opening scene',
              visual_style: 'warm',
            },
          ],
          overall_style: 'cinematic',
        },
        estimated_impact: {
          emotional_score: 9,
          originality_score: 6,
          feasibility_score: 8,
        },
        generation_time_ms: 5000,
        model_used: 'claude-sonnet-4-20250514',
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResult });

      const request: DirectorRequest = {
        brief: 'Promote running shoes with family values',
        product: 'RunFree Pro',
        philosophy: 'emotional',
      };

      const result = await client.generate(request);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/generate', request);
      expect(result.success).toBe(true);
      expect(result.philosophy).toBe('emotional');
      expect(result.storyboard.scenes).toHaveLength(1);
    });

    it('should generate disruptive concept successfully', async () => {
      const mockResult = {
        success: true,
        philosophy: 'disruptive',
        concept_summary: 'Shoes without runner',
        reasoning: 'Unconventional approach',
        storyboard: {
          scenes: [
            {
              scene_number: 1,
              duration: 30,
              description: 'Animated shoes alone',
              visual_style: 'surreal',
            },
          ],
          overall_style: 'unconventional',
        },
        estimated_impact: {
          emotional_score: 5,
          originality_score: 10,
          feasibility_score: 6,
        },
        generation_time_ms: 5200,
        model_used: 'claude-sonnet-4-20250514',
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResult });

      const request: DirectorRequest = {
        brief: 'Promote running shoes',
        philosophy: 'disruptive',
      };

      const result = await client.generate(request);

      expect(result.philosophy).toBe('disruptive');
      expect(result.estimated_impact.originality_score).toBe(10);
    });

    it('should handle API errors gracefully', async () => {
      mockAxiosInstance.post.mockRejectedValue(
        new Error('Network timeout')
      );

      const request: DirectorRequest = {
        brief: 'Test brief',
        philosophy: 'emotional',
      };

      await expect(client.generate(request)).rejects.toThrow(
        'Director generation failed'
      );
    });
  });

  // ============================================================================
  // MULTI-VARIANT GENERATION (Feature 3)
  // ============================================================================

  describe('generateMultiVariant()', () => {
    it('should generate 3 concepts in parallel', async () => {
      const mockResult = {
        success: true,
        variants: {
          emotional: {
            success: true,
            philosophy: 'emotional',
            concept_summary: 'Emotional concept',
            reasoning: 'Story-driven',
            storyboard: {
              scenes: [
                {
                  scene_number: 1,
                  duration: 30,
                  description: 'Emotional scene',
                  visual_style: 'warm',
                },
              ],
              overall_style: 'emotional',
            },
            estimated_impact: {
              emotional_score: 9,
              originality_score: 6,
              feasibility_score: 8,
            },
            generation_time_ms: 4800,
            model_used: 'claude-sonnet-4-20250514',
          },
          disruptive: {
            success: true,
            philosophy: 'disruptive',
            concept_summary: 'Disruptive concept',
            reasoning: 'Unconventional',
            storyboard: {
              scenes: [
                {
                  scene_number: 1,
                  duration: 30,
                  description: 'Disruptive scene',
                  visual_style: 'bold',
                },
              ],
              overall_style: 'disruptive',
            },
            estimated_impact: {
              emotional_score: 5,
              originality_score: 10,
              feasibility_score: 6,
            },
            generation_time_ms: 5100,
            model_used: 'claude-sonnet-4-20250514',
          },
          dataDriven: {
            success: true,
            philosophy: 'dataDriven',
            concept_summary: 'Data-driven concept',
            reasoning: 'Conversion-optimized',
            storyboard: {
              scenes: [
                {
                  scene_number: 1,
                  duration: 30,
                  description: 'Optimized scene',
                  visual_style: 'conversion-focused',
                },
              ],
              overall_style: 'data-driven',
            },
            estimated_impact: {
              emotional_score: 6,
              originality_score: 4,
              feasibility_score: 9,
            },
            generation_time_ms: 4700,
            model_used: 'claude-sonnet-4-20250514',
          },
        },
        recommendation: {
          best_variant: 'disruptive',
          reason: 'Highest overall impact (8.0/10)',
        },
        total_generation_time_ms: 5200,
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResult });

      const request: MultiVariantRequest = {
        brief: 'Promote running shoes',
        product: 'RunFree Pro',
        duration: 30,
        generate_all_variants: true,
      };

      const result = await client.generateMultiVariant(request);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/generate/multi-variant',
        request
      );
      expect(result.success).toBe(true);
      expect(result.variants.emotional.success).toBe(true);
      expect(result.variants.disruptive.success).toBe(true);
      expect(result.variants.dataDriven.success).toBe(true);
      expect(result.recommendation?.best_variant).toBe('disruptive');
    });

    it('should support synthesis option', async () => {
      const mockResult = {
        success: true,
        variants: {
          emotional: {
            success: true,
            philosophy: 'emotional',
            concept_summary: 'Emotional',
            reasoning: 'Emotional',
            storyboard: { scenes: [], overall_style: 'emotional' },
            estimated_impact: {},
            generation_time_ms: 5000,
            model_used: 'claude-sonnet-4-20250514',
          },
          disruptive: {
            success: true,
            philosophy: 'disruptive',
            concept_summary: 'Disruptive',
            reasoning: 'Disruptive',
            storyboard: { scenes: [], overall_style: 'disruptive' },
            estimated_impact: {},
            generation_time_ms: 5000,
            model_used: 'claude-sonnet-4-20250514',
          },
          dataDriven: {
            success: true,
            philosophy: 'dataDriven',
            concept_summary: 'Data-driven',
            reasoning: 'Data-driven',
            storyboard: { scenes: [], overall_style: 'data-driven' },
            estimated_impact: {},
            generation_time_ms: 5000,
            model_used: 'claude-sonnet-4-20250514',
          },
        },
        synthesis: {
          success: true,
          philosophy: 'emotional',
          concept_summary: 'Best of all 3',
          reasoning: 'Synthesized best elements',
          storyboard: { scenes: [], overall_style: 'synthesized' },
          estimated_impact: {
            emotional_score: 8,
            originality_score: 8,
            feasibility_score: 8,
          },
          generation_time_ms: 6000,
          model_used: 'claude-sonnet-4-20250514',
        },
        recommendation: {
          best_variant: 'emotional',
          reason: 'Best synthesis',
        },
        total_generation_time_ms: 21000,
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResult });

      const request: MultiVariantRequest = {
        brief: 'Test brief',
        generate_all_variants: true,
        synthesize_best: true,
      };

      const result = await client.generateMultiVariant(request);

      expect(result.synthesis).toBeDefined();
      expect(result.synthesis?.concept_summary).toContain('Best of all');
    });

    it('should handle multi-variant API errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(
        new Error('Director service unavailable')
      );

      const request: MultiVariantRequest = {
        brief: 'Test brief',
        generate_all_variants: true,
      };

      await expect(client.generateMultiVariant(request)).rejects.toThrow(
        'Director multi-variant generation failed'
      );
    });
  });

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  describe('Utility Methods', () => {
    it('should get available philosophies', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { philosophies: ['emotional', 'disruptive', 'dataDriven'] },
      });

      const philosophies = await client.getPhilosophies();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/philosophies');
      expect(philosophies).toEqual(['emotional', 'disruptive', 'dataDriven']);
    });

    it('should return fallback philosophies on error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const philosophies = await client.getPhilosophies();

      expect(philosophies).toEqual(['emotional', 'disruptive', 'dataDriven']);
    });

    it('should check health successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { status: 'healthy' },
      });

      const isHealthy = await client.health();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(isHealthy).toBe(true);
    });

    it('should return false on health check failure', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Service down'));

      const isHealthy = await client.health();

      expect(isHealthy).toBe(false);
    });
  });
});
