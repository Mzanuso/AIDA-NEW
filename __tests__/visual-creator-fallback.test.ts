import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualCreatorExecutor } from '../../src/agents/visual-creator/visual-creator-executor';
import type { WorkflowExecutionPlan } from '../../src/shared/types';

/**
 * Tests: Enhanced Error Handling & Fallback Strategies
 * 
 * Validates automatic fallback to alternative models when primary fails.
 */

describe('Visual Creator - Fallback Strategies', () => {
  let executor: VisualCreatorExecutor;

  beforeEach(() => {
    executor = new VisualCreatorExecutor();
    global.fetch = vi.fn();
  });

  describe('Automatic Model Fallback', () => {
    it('should automatically fallback to secondary model when primary fails', async () => {
      // ARRANGE
      const plan: WorkflowExecutionPlan = {
        workflowId: 'fallback-test-001',
        workflowType: 'single-shot',
        steps: [
          {
            stepId: 'step-1',
            modelId: 'flux-pro-1.1',
            prompt: 'Test image',
            parameters: {},
            dependencies: [],
            estimatedCost: 0.05,
            estimatedTime: 8,
            fallbackModels: ['flux-schnell', 'seedream-4.0'] // Fallback chain
          }
        ],
        totalEstimatedCost: 0.05,
        totalEstimatedTime: 8,
        reasoning: 'Test with fallback'
      };

      // Mock: primary fails, fallback succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('FLUX Pro unavailable'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            images: [{ url: 'https://fal.ai/fallback-success.jpg', content_type: 'image/jpeg' }]
          })
        });

      // ACT
      const result = await executor.execute(plan);

      // ASSERT
      expect(result.status).toBe('success');
      expect(result.steps[0].status).toBe('success');
      expect(result.steps[0].modelUsed).toBe('flux-schnell'); // Used fallback
      expect(global.fetch).toHaveBeenCalledTimes(2); // Primary + 1 fallback
    });

    it('should try all fallbacks in order until one succeeds', async () => {
      // ARRANGE
      const plan: WorkflowExecutionPlan = {
        workflowId: 'fallback-test-002',
        workflowType: 'single-shot',
        steps: [
          {
            stepId: 'step-1',
            modelId: 'flux-pro-1.1',
            prompt: 'Test image',
            parameters: {},
            dependencies: [],
            estimatedCost: 0.05,
            estimatedTime: 8,
            fallbackModels: ['flux-schnell', 'seedream-4.0', 'ideogram-v2']
          }
        ],
        totalEstimatedCost: 0.05,
        totalEstimatedTime: 8,
        reasoning: 'Test multiple fallbacks'
      };

      // Mock: primary fails, fallback 1 fails, fallback 2 succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockRejectedValueOnce(new Error('Fallback 1 failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            images: [{ url: 'https://fal.ai/fallback2-success.jpg', content_type: 'image/jpeg' }]
          })
        });

      // ACT
      const result = await executor.execute(plan);

      // ASSERT
      expect(result.status).toBe('success');
      expect(result.steps[0].modelUsed).toBe('seedream-4.0'); // Used fallback 2
      expect(global.fetch).toHaveBeenCalledTimes(3); // Primary + 2 fallbacks
    });

    it('should fail gracefully when all fallbacks exhausted', async () => {
      // ARRANGE
      const plan: WorkflowExecutionPlan = {
        workflowId: 'fallback-test-003',
        workflowType: 'single-shot',
        steps: [
          {
            stepId: 'step-1',
            modelId: 'flux-pro-1.1',
            prompt: 'Test image',
            parameters: {},
            dependencies: [],
            estimatedCost: 0.05,
            estimatedTime: 8,
            fallbackModels: ['flux-schnell', 'seedream-4.0']
          }
        ],
        totalEstimatedCost: 0.05,
        totalEstimatedTime: 8,
        reasoning: 'Test all failures'
      };

      // Mock: all models fail
      (global.fetch as any).mockRejectedValue(new Error('All models unavailable'));

      // ACT
      const result = await executor.execute(plan);

      // ASSERT
      expect(result.status).toBe('failed');
      expect(result.steps[0].status).toBe('failed');
      expect(result.steps[0].error).toContain('All models unavailable');
      expect(global.fetch).toHaveBeenCalledTimes(3); // Primary + 2 fallbacks, all failed
    });

    it('should log each fallback attempt with reason', async () => {
      // ARRANGE
      const consoleSpy = vi.spyOn(console, 'log');
      
      const plan: WorkflowExecutionPlan = {
        workflowId: 'fallback-test-004',
        workflowType: 'single-shot',
        steps: [
          {
            stepId: 'step-1',
            modelId: 'flux-pro-1.1',
            prompt: 'Test image',
            parameters: {},
            dependencies: [],
            estimatedCost: 0.05,
            estimatedTime: 8,
            fallbackModels: ['flux-schnell']
          }
        ],
        totalEstimatedCost: 0.05,
        totalEstimatedTime: 8,
        reasoning: 'Test logging'
      };

      // Mock: primary fails, fallback succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            images: [{ url: 'https://fal.ai/success.jpg', content_type: 'image/jpeg' }]
          })
        });

      // ACT
      await executor.execute(plan);

      // ASSERT
      // Verify logging occurred (implementation will add proper logger)
      // For now, just ensure execution completes
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should use correct fallback model costs and times', async () => {
      // ARRANGE
      const plan: WorkflowExecutionPlan = {
        workflowId: 'fallback-test-005',
        workflowType: 'single-shot',
        steps: [
          {
            stepId: 'step-1',
            modelId: 'flux-pro-1.1', // $0.05, 8s
            prompt: 'Test image',
            parameters: {},
            dependencies: [],
            estimatedCost: 0.05,
            estimatedTime: 8,
            fallbackModels: ['flux-schnell'] // $0.03, 5s (cheaper and faster)
          }
        ],
        totalEstimatedCost: 0.05,
        totalEstimatedTime: 8,
        reasoning: 'Test cost adjustment'
      };

      // Mock: primary fails, fallback succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            images: [{ url: 'https://fal.ai/success.jpg', content_type: 'image/jpeg' }]
          })
        });

      // ACT
      const result = await executor.execute(plan);

      // ASSERT
      expect(result.status).toBe('success');
      // Cost should reflect fallback model (cheaper)
      expect(result.totalCost).toBeLessThan(0.05);
      expect(result.totalCost).toBeCloseTo(0.03, 2);
    });
  });

  describe('Enhanced Logging', () => {
    it('should log detailed execution metrics', async () => {
      // ARRANGE
      const plan: WorkflowExecutionPlan = {
        workflowId: 'logging-test-001',
        workflowType: 'single-shot',
        steps: [
          {
            stepId: 'step-1',
            modelId: 'flux-schnell',
            prompt: 'Test image',
            parameters: {},
            dependencies: [],
            estimatedCost: 0.03,
            estimatedTime: 5,
            fallbackModels: []
          }
        ],
        totalEstimatedCost: 0.03,
        totalEstimatedTime: 5,
        reasoning: 'Test logging'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: [{ url: 'https://fal.ai/test.jpg', content_type: 'image/jpeg' }]
        })
      });

      // ACT
      const result = await executor.execute(plan);

      // ASSERT - Result should include detailed metrics
      expect(result.steps[0]).toHaveProperty('actualCost');
      expect(result.steps[0]).toHaveProperty('actualTime');
      expect(result.steps[0]).toHaveProperty('modelUsed');
      expect(result).toHaveProperty('totalCost');
      expect(result).toHaveProperty('totalTime');
    });

    it('should include error context when failures occur', async () => {
      // ARRANGE
      const plan: WorkflowExecutionPlan = {
        workflowId: 'error-context-test',
        workflowType: 'single-shot',
        steps: [
          {
            stepId: 'step-1',
            modelId: 'flux-pro-1.1',
            prompt: 'Test image',
            parameters: {},
            dependencies: [],
            estimatedCost: 0.05,
            estimatedTime: 8,
            fallbackModels: []
          }
        ],
        totalEstimatedCost: 0.05,
        totalEstimatedTime: 8,
        reasoning: 'Test error context'
      };

      const errorMessage = 'API rate limit exceeded';
      (global.fetch as any).mockRejectedValue(new Error(errorMessage));

      // ACT
      const result = await executor.execute(plan);

      // ASSERT
      expect(result.status).toBe('failed');
      expect(result.steps[0].error).toContain(errorMessage);
      expect(result.steps[0]).toHaveProperty('modelUsed'); // Should still log which model was attempted
    });
  });

  describe('Performance Tracking', () => {
    it('should track actual time vs estimated time', async () => {
      // ARRANGE
      const plan: WorkflowExecutionPlan = {
        workflowId: 'perf-test-001',
        workflowType: 'single-shot',
        steps: [
          {
            stepId: 'step-1',
            modelId: 'flux-schnell',
            prompt: 'Test image',
            parameters: {},
            dependencies: [],
            estimatedCost: 0.03,
            estimatedTime: 5, // Estimated 5 seconds
            fallbackModels: []
          }
        ],
        totalEstimatedCost: 0.03,
        totalEstimatedTime: 5,
        reasoning: 'Test performance tracking'
      };

      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              images: [{ url: 'https://fal.ai/test.jpg', content_type: 'image/jpeg' }]
            })
          }), 100) // Simulate 100ms delay
        )
      );

      // ACT
      const result = await executor.execute(plan);

      // ASSERT
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.totalTime).toBeLessThan(5000); // Should be much faster with mocks
      expect(result.steps[0].actualTime).toBeGreaterThan(0);
    });

    it('should track actual cost vs estimated cost', async () => {
      // ARRANGE
      const plan: WorkflowExecutionPlan = {
        workflowId: 'cost-test-001',
        workflowType: 'single-shot',
        steps: [
          {
            stepId: 'step-1',
            modelId: 'flux-schnell',
            prompt: 'Test image',
            parameters: {},
            dependencies: [],
            estimatedCost: 0.03,
            estimatedTime: 5,
            fallbackModels: []
          }
        ],
        totalEstimatedCost: 0.03,
        totalEstimatedTime: 5,
        reasoning: 'Test cost tracking'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: [{ url: 'https://fal.ai/test.jpg', content_type: 'image/jpeg' }]
        })
      });

      // ACT
      const result = await executor.execute(plan);

      // ASSERT
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.totalCost).toBeCloseTo(0.03, 2);
      expect(result.steps[0].actualCost).toBeGreaterThan(0);
    });
  });
});
