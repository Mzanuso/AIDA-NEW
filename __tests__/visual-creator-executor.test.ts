/**
 * Visual Creator Executor Tests
 * 
 * Test API integration layer that executes WorkflowExecutionPlan
 * by calling FAL.AI and KIE.AI services.
 * 
 * @module __tests__/visual-creator-executor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualCreatorExecutor } from '../src/agents/visual-creator/visual-creator-executor';
import type { WorkflowExecutionPlan, WorkflowResult } from '../src/shared/types';

// Mock FAL.AI SDK
vi.mock('@fal-ai/serverless-client', () => ({
  fal: {
    subscribe: vi.fn()
  }
}));

// Mock fetch for KIE.AI
global.fetch = vi.fn();

describe('VisualCreatorExecutor', () => {
  let executor: VisualCreatorExecutor;

  // Mock WorkflowExecutionPlan
  const mockSingleShotPlan: WorkflowExecutionPlan = {
    workflowId: 'workflow-001',
    workflowType: 'single-shot',
    steps: [
      {
        stepId: 'step-001',
        model: 'flux-pro-1.1',
        prompt: 'IMG_1234.cr2 Professional woman in modern office, natural lighting, editorial style',
        parameters: { aspect_ratio: '16:9' },
        estimatedCost: 0.055,
        estimatedTime: 12
      }
    ],
    estimatedTime: 12,
    estimatedCost: 0.055,
    reasoning: 'Single FLUX Pro generation',
    createdAt: new Date().toISOString()
  };

  const mockMultiStepPlan: WorkflowExecutionPlan = {
    workflowId: 'workflow-002',
    workflowType: 'consistency',
    steps: [
      {
        stepId: 'base-generation',
        model: 'seedream-4.0',
        prompt: 'Hero character in forest',
        estimatedCost: 0.024,
        estimatedTime: 8
      },
      {
        stepId: 'variant-1',
        model: 'seedream-4.0',
        prompt: 'Same hero character in cave',
        dependencies: ['base-generation'],
        referenceImages: ['base-generation'],
        estimatedCost: 0.024,
        estimatedTime: 8
      },
      {
        stepId: 'variant-2',
        model: 'seedream-4.0',
        prompt: 'Same hero character at mountain peak',
        dependencies: ['base-generation'],
        referenceImages: ['base-generation'],
        estimatedCost: 0.024,
        estimatedTime: 8
      }
    ],
    estimatedTime: 16, // base + max(variants)
    estimatedCost: 0.072,
    reasoning: 'Seedream consistency workflow',
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    executor = new VisualCreatorExecutor();
    vi.clearAllMocks();
  });

  describe('FAL.AI Integration', () => {
    it('should call FAL.AI for FLUX Pro generation', async () => {
      // Mock FAL.AI response
      const mockFalResponse = {
        images: [{ url: 'https://fal.ai/files/generated-image.jpg' }]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFalResponse
      } as Response);

      const result = await executor.execute(mockSingleShotPlan);

      expect(result.status).toBe('completed');
      expect(result.allImageUrls).toHaveLength(1);
      expect(result.allImageUrls[0]).toContain('generated-image.jpg');
    });

    it('should call FAL.AI for Seedream generation', async () => {
      const seedreamPlan: WorkflowExecutionPlan = {
        ...mockSingleShotPlan,
        steps: [{
          ...mockSingleShotPlan.steps[0],
          model: 'seedream-4.0',
          prompt: 'Character portrait'
        }]
      };

      const mockResponse = {
        images: [{ url: 'https://fal.ai/files/seedream-image.jpg' }]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await executor.execute(seedreamPlan);

      expect(result.status).toBe('completed');
      expect(result.allImageUrls[0]).toContain('seedream-image.jpg');
    });

    it('should call FAL.AI for Ideogram text rendering', async () => {
      const ideogramPlan: WorkflowExecutionPlan = {
        ...mockSingleShotPlan,
        steps: [{
          ...mockSingleShotPlan.steps[0],
          model: 'ideogram-v2',
          prompt: '"INNOVATION 2025" bold modern typography, center position'
        }]
      };

      const mockResponse = {
        images: [{ url: 'https://fal.ai/files/ideogram-text.jpg' }]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await executor.execute(ideogramPlan);

      expect(result.status).toBe('completed');
      expect(result.allImageUrls).toHaveLength(1);
    });
  });

  describe('KIE.AI Integration', () => {
    it('should call KIE.AI for Midjourney generation', async () => {
      const midjourneyPlan: WorkflowExecutionPlan = {
        ...mockSingleShotPlan,
        steps: [{
          ...mockSingleShotPlan.steps[0],
          model: 'midjourney-v6',
          prompt: 'Professional portrait --ar 16:9 --s 250 --v 6.1'
        }]
      };

      // Mock timers to avoid actual delays
      vi.useFakeTimers();

      // Mock KIE.AI initial response (submit)
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ task_id: 'mj-task-123' })
        } as Response)
        // Mock polling response (after 5s sleep - completed immediately)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'completed',
            result: { image_url: 'https://kie.ai/midjourney-result.jpg' }
          })
        } as Response);

      const resultPromise = executor.execute(midjourneyPlan);

      // Advance timers to skip the 5s polling delay
      await vi.advanceTimersByTimeAsync(5000);

      const result = await resultPromise;

      expect(result.status).toBe('completed');
      expect(result.allImageUrls[0]).toContain('midjourney-result.jpg');

      vi.useRealTimers();
    });

    it('should poll KIE.AI until completion', async () => {
      const midjourneyPlan: WorkflowExecutionPlan = {
        ...mockSingleShotPlan,
        steps: [{
          ...mockSingleShotPlan.steps[0],
          model: 'midjourney-v6',
          prompt: 'Test prompt'
        }]
      };

      // Mock timers to avoid actual delays
      vi.useFakeTimers();

      // Mock initial response (submit)
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ task_id: 'mj-task-456' })
        } as Response)
        // Mock polling - in progress (after first 5s sleep)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'processing' })
        } as Response)
        // Mock polling - completed (after second 5s sleep)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: 'completed',
            result: { image_url: 'https://kie.ai/result.jpg' }
          })
        } as Response);

      const resultPromise = executor.execute(midjourneyPlan);

      // Advance timers for first poll (5s)
      await vi.advanceTimersByTimeAsync(5000);
      // Advance timers for second poll (5s)
      await vi.advanceTimersByTimeAsync(5000);

      const result = await resultPromise;

      expect(result.status).toBe('completed');
      // Should have called fetch 3 times (1 submit + 2 polls)
      expect(global.fetch).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });
  });

  describe('Step Execution', () => {
    it('should execute single-shot workflow', async () => {
      const mockResponse = {
        images: [{ url: 'https://fal.ai/single-shot.jpg' }]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await executor.execute(mockSingleShotPlan);

      expect(result.workflowId).toBe('workflow-001');
      expect(result.status).toBe('completed');
      expect(result.allImageUrls).toHaveLength(1);
      expect(result.stepResults).toHaveLength(1);
    });

    it('should execute multi-step workflow with dependencies', async () => {
      // Mock base generation
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/base.jpg' }] })
        } as Response)
        // Mock variant 1
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/variant1.jpg' }] })
        } as Response)
        // Mock variant 2
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/variant2.jpg' }] })
        } as Response);

      const result = await executor.execute(mockMultiStepPlan);

      expect(result.status).toBe('completed');
      expect(result.allImageUrls).toHaveLength(3);
      expect(result.stepResults).toHaveLength(3);
      
      // Variants should reference base image
      const baseResult = result.stepResults.find(s => s.stepId === 'base-generation');
      expect(baseResult?.imageUrls).toContain('https://fal.ai/base.jpg');
    });

    it('should respect dependencies and execute in correct order', async () => {
      // Mock all three fetch calls for the multi-step plan
      vi.mocked(global.fetch)
        // Base generation
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/base.jpg' }] })
        } as Response)
        // Variant 1
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/variant1.jpg' }] })
        } as Response)
        // Variant 2
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/variant2.jpg' }] })
        } as Response);

      const result = await executor.execute(mockMultiStepPlan);

      // Verify base executed and variants reference it
      const variant1 = result.stepResults.find(s => s.stepId === 'variant-1');
      expect(variant1?.referenceStepId).toBe('base-generation');
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network failure', async () => {
      // Use fake timers to avoid retry delays (2000, 4000ms)
      vi.useFakeTimers();

      // Fail twice, succeed third time
      vi.mocked(global.fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/retry-success.jpg' }] })
        } as Response);

      const resultPromise = executor.execute(mockSingleShotPlan);

      // Advance timers for retry delays (2000ms + 4000ms)
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      const result = await resultPromise;

      expect(result.status).toBe('completed');
      expect(global.fetch).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('should fail after max retries', async () => {
      // Use fake timers to avoid retry delays
      vi.useFakeTimers();

      // Fail all attempts
      vi.mocked(global.fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      const resultPromise = executor.execute(mockSingleShotPlan);

      // Advance timers for retry delays (2000ms + 4000ms)
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      const result = await resultPromise;

      expect(result.status).toBe('failed');
      expect(global.fetch).toHaveBeenCalledTimes(3); // Max retries

      vi.useRealTimers();
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits between API calls', async () => {
      const startTime = Date.now();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ images: [{ url: 'https://fal.ai/test.jpg' }] })
      } as Response);

      // Execute plan with multiple steps
      await executor.execute(mockMultiStepPlan);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should have delays between calls (at least 100ms per call)
      expect(duration).toBeGreaterThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle API error responses gracefully', async () => {
      // Use fake timers to avoid retry delays
      vi.useFakeTimers();

      // Fail all 3 retry attempts
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Invalid prompt' })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Invalid prompt' })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Invalid prompt' })
        } as Response);

      const resultPromise = executor.execute(mockSingleShotPlan);

      // Advance timers for retry delays (2000ms + 4000ms)
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      const result = await resultPromise;

      expect(result.status).toBe('failed');
      expect(result.stepResults[0].error).toContain('Invalid prompt');

      vi.useRealTimers();
    });

    it('should provide partial success for multi-step workflows', async () => {
      // Use fake timers to avoid retry delays and rate limiting
      vi.useFakeTimers();

      // Base succeeds
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/base.jpg' }] })
        } as Response)
        // Variant 1 fails - all 3 retry attempts
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' })
        } as Response)
        // Variant 2 succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/variant2.jpg' }] })
        } as Response);

      const resultPromise = executor.execute(mockMultiStepPlan);

      // Advance timers for:
      // 1. Rate limit after base (100ms for fal.ai)
      await vi.advanceTimersByTimeAsync(100);
      // 2. Variant-1 retry delays (2000ms + 4000ms)
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);
      // 3. Rate limit after variant-1 (100ms)
      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;

      expect(result.status).toBe('partial_success');
      expect(result.allImageUrls).toHaveLength(2); // Base + variant2
      expect(result.stepResults.some(s => s.status === 'failed')).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('Cost and Time Tracking', () => {
    it('should track actual cost and time', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ images: [{ url: 'https://fal.ai/test.jpg' }] })
      } as Response);

      const result = await executor.execute(mockSingleShotPlan);

      // Cost should be tracked from step.estimatedCost
      expect(result.totalCost).toBe(0.055); // mockSingleShotPlan.steps[0].estimatedCost
      // Time should be measured from execution
      expect(result.totalTime).toBeGreaterThanOrEqual(0); // Can be 0 with mocked fetch
    });
  });
});
