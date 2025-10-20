import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualCreatorBridge } from '../../src/shared/coordination/execution-bridge';
import { VisualCreatorExecutor } from '../../src/agents/visual-creator/visual-creator-executor';
import { ExecutionPlan } from '../../src/shared/types/execution-plan.types';

/**
 * Integration Tests: Visual Creator Pipeline
 * 
 * Tests the complete flow from Technical Planner output to image generation:
 * ExecutionPlan → Bridge.process() → WorkflowExecutionPlan → Executor.execute() → Images
 */

describe('Visual Creator Pipeline - End-to-End Integration', () => {
  let bridge: VisualCreatorBridge;
  let executor: VisualCreatorExecutor;

  beforeEach(() => {
    // Initialize pipeline components
    bridge = new VisualCreatorBridge();
    executor = new VisualCreatorExecutor();

    // Mock external API calls
    global.fetch = vi.fn();
  });

  describe('Single-Shot Workflow', () => {
    it('should execute complete workflow from ExecutionPlan to image', async () => {
      // ARRANGE
      const plan: ExecutionPlan = {
        id: 'test-001',
        brief_id: 'brief-001',
        target_agent: 'visual_creator',
        content_type: 'image',
        quality_tier: 'premium',
        approach: 'single_model',
        personalization_required: false,
        total_estimated_cost: 0.05,
        total_estimated_time: 8,
        primary_model: {
          name: 'FLUX Pro 1.1',
          provider: 'FAL.AI',
          model_id: 'flux-pro-1.1',
          reason: 'Premium quality',
          estimated_cost: 0.05,
          estimated_time: 8
        },
        steps: [{
          step_id: 'step-1',
          model: {
            name: 'FLUX Pro 1.1',
            provider: 'FAL.AI',
            model_id: 'flux-pro-1.1',
            reason: 'Premium quality',
            estimated_cost: 0.05,
            estimated_time: 8
          },
          prompt: 'Mountain landscape at sunset, photorealistic',
          dependencies: []
        }],
        scene_descriptions: ['Mountain landscape at sunset'],
        created_at: new Date().toISOString()
      };

      // Mock API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: [{ url: 'https://fal.ai/img001.jpg', content_type: 'image/jpeg' }]
        })
      });

      // ACT
      const workflows = await bridge.process(plan);
      const result = await executor.execute(workflows[0]);

      // ASSERT
      expect(workflows).toHaveLength(1);
      expect(result.status).toBe('completed');
      expect(result.stepResults).toHaveLength(1);
      expect(result.stepResults[0].status).toBe('completed');
    });
  });

  describe('Multi-Step Consistency Workflow', () => {
    it('should execute consistency workflow with dependencies', async () => {
      // ARRANGE
      const plan: ExecutionPlan = {
        id: 'test-002',
        brief_id: 'brief-002',
        target_agent: 'visual_creator',
        content_type: 'image',
        quality_tier: 'standard',
        approach: 'multi_step',
        personalization_required: true,
        total_estimated_cost: 0.15,
        total_estimated_time: 25,
        primary_model: {
          name: 'Seedream 4.0',
          provider: 'FAL.AI',
          model_id: 'seedream-4.0',
          reason: 'Character consistency',
          estimated_cost: 0.05,
          estimated_time: 10
        },
        steps: [
          {
            step_id: 'base',
            model: {
              name: 'Seedream 4.0',
              provider: 'FAL.AI',
              model_id: 'seedream-4.0',
              reason: 'Base character',
              estimated_cost: 0.05,
              estimated_time: 10
            },
            prompt: 'Young wizard with blue robes',
            dependencies: []
          },
          {
            step_id: 'var1',
            model: {
              name: 'Seedream 4.0',
              provider: 'FAL.AI',
              model_id: 'seedream-4.0',
              reason: 'Variation 1',
              estimated_cost: 0.05,
              estimated_time: 8
            },
            prompt: 'Same wizard casting a spell',
            dependencies: ['base']
          },
          {
            step_id: 'var2',
            model: {
              name: 'Seedream 4.0',
              provider: 'FAL.AI',
              model_id: 'seedream-4.0',
              reason: 'Variation 2',
              estimated_cost: 0.05,
              estimated_time: 7
            },
            prompt: 'Same wizard reading a book',
            dependencies: ['base']
          }
        ],
        scene_descriptions: ['Young wizard with blue robes', 'Same wizard casting a spell', 'Same wizard reading a book'],
        created_at: new Date().toISOString()
      };

      // Mock API responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/wizard-base.jpg', content_type: 'image/jpeg' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/wizard-spell.jpg', content_type: 'image/jpeg' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/wizard-book.jpg', content_type: 'image/jpeg' }] })
        });

      // ACT
      const workflows = await bridge.process(plan);
      const result = await executor.execute(workflows[0]);

      // ASSERT
      expect(result.status).toBe('completed');
      expect(result.stepResults).toHaveLength(3);
      expect(result.stepResults.every(s => s.status === 'completed')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should retry on temporary failures and eventually succeed', async () => {
      // ARRANGE
      const plan: ExecutionPlan = {
        id: 'test-retry',
        brief_id: 'brief-retry',
        target_agent: 'visual_creator',
        content_type: 'image',
        quality_tier: 'standard',
        approach: 'single_model',
        personalization_required: false,
        total_estimated_cost: 0.03,
        total_estimated_time: 5,
        primary_model: {
          name: 'FLUX Schnell',
          provider: 'FAL.AI',
          model_id: 'flux-schnell',
          reason: 'Fast generation',
          estimated_cost: 0.03,
          estimated_time: 5
        },
        steps: [{
          step_id: 'step-1',
          model: {
            name: 'FLUX Schnell',
            provider: 'FAL.AI',
            model_id: 'flux-schnell',
            reason: 'Fast',
            estimated_cost: 0.03,
            estimated_time: 5
          },
          prompt: 'Simple landscape',
          dependencies: []
        }],
        scene_descriptions: ['Simple landscape'],
        created_at: new Date().toISOString()
      };

      // Mock: fail twice, succeed third time
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/landscape.jpg', content_type: 'image/jpeg' }] })
        });

      // Mock fake timers to avoid retry delays
      vi.useFakeTimers();

      // ACT
      const workflows = await bridge.process(plan);
      const resultPromise = executor.execute(workflows[0]);

      // Advance timers for retry delays (2000ms + 4000ms)
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      const result = await resultPromise;

      // ASSERT
      expect(result.status).toBe('completed');
      expect(global.fetch).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('should handle partial success when some steps fail', async () => {
      // ARRANGE
      const plan: ExecutionPlan = {
        id: 'test-partial',
        brief_id: 'brief-partial',
        target_agent: 'visual_creator',
        content_type: 'image',
        quality_tier: 'standard',
        approach: 'parallel',
        personalization_required: false,
        total_estimated_cost: 0.10,
        total_estimated_time: 15,
        primary_model: {
          name: 'FLUX Schnell',
          provider: 'FAL.AI',
          model_id: 'flux-schnell',
          reason: 'Test',
          estimated_cost: 0.03,
          estimated_time: 5
        },
        steps: [
          {
            step_id: 'step-1',
            model: {
              name: 'FLUX Schnell',
              provider: 'FAL.AI',
              model_id: 'flux-schnell',
              reason: 'Test 1',
              estimated_cost: 0.03,
              estimated_time: 5
            },
            prompt: 'Scene 1',
            dependencies: []
          },
          {
            step_id: 'step-2',
            model: {
              name: 'Ideogram V2',
              provider: 'FAL.AI',
              model_id: 'ideogram-v2',
              reason: 'Test 2',
              estimated_cost: 0.05,
              estimated_time: 10
            },
            prompt: 'Scene 2',
            dependencies: []
          }
        ],
        scene_descriptions: ['Scene 1', 'Scene 2'],
        created_at: new Date().toISOString()
      };

      // Mock: first succeeds, second fails
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/scene1.jpg', content_type: 'image/jpeg' }] })
        })
        .mockRejectedValue(new Error('API error'));

      // ACT
      const workflows = await bridge.process(plan);
      const result = await executor.execute(workflows[0]);

      // ASSERT
      expect(result.status).toBe('partial_success');
      expect(result.stepResults[0].status).toBe('completed');
      expect(result.stepResults[1].status).toBe('failed');
    });

    it('should handle complete failure when all steps fail', async () => {
      // ARRANGE
      const plan: ExecutionPlan = {
        id: 'test-fail',
        brief_id: 'brief-fail',
        target_agent: 'visual_creator',
        content_type: 'image',
        quality_tier: 'standard',
        approach: 'single_model',
        personalization_required: false,
        total_estimated_cost: 0.03,
        total_estimated_time: 5,
        primary_model: {
          name: 'FLUX Schnell',
          provider: 'FAL.AI',
          model_id: 'flux-schnell',
          reason: 'Test',
          estimated_cost: 0.03,
          estimated_time: 5
        },
        steps: [{
          step_id: 'step-1',
          model: {
            name: 'FLUX Schnell',
            provider: 'FAL.AI',
            model_id: 'flux-schnell',
            reason: 'Test',
            estimated_cost: 0.03,
            estimated_time: 5
          },
          prompt: 'Test scene',
          dependencies: []
        }],
        scene_descriptions: ['Test scene'],
        created_at: new Date().toISOString()
      };

      // Mock fake timers to avoid retry delays
      vi.useFakeTimers();

      // Mock: always fail (all 3 retry attempts)
      (global.fetch as any).mockRejectedValue(new Error('Service unavailable'));

      // ACT
      const workflows = await bridge.process(plan);
      const resultPromise = executor.execute(workflows[0]);

      // Advance timers for retry delays (2000ms + 4000ms)
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      const result = await resultPromise;

      // ASSERT
      expect(result.status).toBe('failed');
      expect(result.stepResults[0].status).toBe('failed');

      vi.useRealTimers();
    });
  });

  describe('Performance & Validation', () => {
    it('should complete workflow within reasonable time', async () => {
      // ARRANGE
      const plan: ExecutionPlan = {
        id: 'test-perf',
        brief_id: 'brief-perf',
        target_agent: 'visual_creator',
        content_type: 'image',
        quality_tier: 'fast',
        approach: 'single_model',
        personalization_required: false,
        total_estimated_cost: 0.03,
        total_estimated_time: 5,
        primary_model: {
          name: 'FLUX Schnell',
          provider: 'FAL.AI',
          model_id: 'flux-schnell',
          reason: 'Speed',
          estimated_cost: 0.03,
          estimated_time: 5
        },
        steps: [{
          step_id: 'step-1',
          model: {
            name: 'FLUX Schnell',
            provider: 'FAL.AI',
            model_id: 'flux-schnell',
            reason: 'Speed',
            estimated_cost: 0.03,
            estimated_time: 5
          },
          prompt: 'Quick test',
          dependencies: []
        }],
        scene_descriptions: ['Quick test'],
        created_at: new Date().toISOString()
      };

      // Mock response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ images: [{ url: 'https://fal.ai/quick.jpg', content_type: 'image/jpeg' }] })
      });

      // ACT
      const startTime = Date.now();
      const workflows = await bridge.process(plan);
      const result = await executor.execute(workflows[0]);
      const duration = Date.now() - startTime;

      // ASSERT
      expect(result.status).toBe('completed');
      expect(duration).toBeLessThan(10000); // < 10s with mocks
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should preserve data integrity across pipeline', async () => {
      // ARRANGE
      const plan: ExecutionPlan = {
        id: 'test-integrity',
        brief_id: 'brief-integrity',
        target_agent: 'visual_creator',
        content_type: 'image',
        quality_tier: 'standard',
        approach: 'single_model',
        personalization_required: false,
        total_estimated_cost: 0.05,
        total_estimated_time: 8,
        primary_model: {
          name: 'FLUX Pro 1.1',
          provider: 'FAL.AI',
          model_id: 'flux-pro-1.1',
          reason: 'Quality',
          estimated_cost: 0.05,
          estimated_time: 8
        },
        steps: [{
          step_id: 'integrity-test',
          model: {
            name: 'FLUX Pro 1.1',
            provider: 'FAL.AI',
            model_id: 'flux-pro-1.1',
            reason: 'Quality',
            estimated_cost: 0.05,
            estimated_time: 8
          },
          prompt: 'Data integrity test',
          dependencies: []
        }],
        scene_descriptions: ['Data integrity test'],
        created_at: new Date().toISOString()
      };

      // Mock response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ images: [{ url: 'https://fal.ai/integrity.jpg', content_type: 'image/jpeg' }] })
      });

      // ACT
      const workflows = await bridge.process(plan);
      const result = await executor.execute(workflows[0]);

      // ASSERT
      expect(workflows).toHaveLength(1);
      expect(result.workflowId).toBeDefined();
      expect(result.stepResults[0].stepId).toBe('integrity-test');
      expect(result.status).toBe('completed');
    });
  });
});
