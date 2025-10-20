import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import visualCreatorRoutes from '../src/routes/visual-creator.routes';
import { ExecutionPlan } from '../../../../shared/types/execution-plan.types';

/**
 * Integration Tests: Orchestrator → Visual Creator
 * 
 * Tests the HTTP endpoint that connects Orchestrator to Visual Creator agent.
 */

describe('Visual Creator Routes - Orchestrator Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create Express app with Visual Creator routes
    app = express();
    app.use(express.json());
    app.use('/api/agents/visual-creator', visualCreatorRoutes);
  });

  describe('POST /api/agents/visual-creator/execute', () => {
    it('should execute valid ExecutionPlan and return WorkflowResult', async () => {
      // ARRANGE
      const validPlan: ExecutionPlan = {
        id: 'test-plan-001',
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
            reason: 'Premium',
            estimated_cost: 0.05,
            estimated_time: 8
          },
          prompt: 'Mountain landscape',
          dependencies: []
        }],
        scene_descriptions: ['Mountain landscape'],
        created_at: new Date().toISOString()
      };

      // Mock FAL.AI response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: [{ url: 'https://fal.ai/test.jpg', content_type: 'image/jpeg' }]
        })
      });

      // ACT
      const response = await request(app)
        .post('/api/agents/visual-creator/execute')
        .send(validPlan)
        .expect('Content-Type', /json/)
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.workflowId).toBeDefined();
      expect(response.body.data.status).toBe('success');
      expect(response.body.data.steps).toHaveLength(1);
    });

    it('should return 400 for invalid ExecutionPlan (missing required fields)', async () => {
      // ARRANGE - Invalid plan missing required fields
      const invalidPlan = {
        id: 'test-invalid',
        // Missing target_agent, content_type, etc.
      };

      // ACT
      const response = await request(app)
        .post('/api/agents/visual-creator/execute')
        .send(invalidPlan)
        .expect('Content-Type', /json/)
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for wrong target_agent', async () => {
      // ARRANGE
      const wrongAgentPlan: ExecutionPlan = {
        id: 'test-wrong-agent',
        brief_id: 'brief-002',
        target_agent: 'writer', // Wrong agent!
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
          reason: 'Fast',
          estimated_cost: 0.03,
          estimated_time: 5
        },
        steps: [],
        scene_descriptions: [],
        created_at: new Date().toISOString()
      };

      // ACT
      const response = await request(app)
        .post('/api/agents/visual-creator/execute')
        .send(wrongAgentPlan)
        .expect('Content-Type', /json/)
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('target_agent');
    });

    it('should return 500 when Visual Creator execution fails', async () => {
      // ARRANGE
      const validPlan: ExecutionPlan = {
        id: 'test-error',
        brief_id: 'brief-error',
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
          step_id: 'error-step',
          model: {
            name: 'FLUX Schnell',
            provider: 'FAL.AI',
            model_id: 'flux-schnell',
            reason: 'Test',
            estimated_cost: 0.03,
            estimated_time: 5
          },
          prompt: 'Error test',
          dependencies: []
        }],
        scene_descriptions: ['Error test'],
        created_at: new Date().toISOString()
      };

      // Mock API failure
      global.fetch = vi.fn().mockRejectedValue(new Error('API unavailable'));

      // ACT
      const response = await request(app)
        .post('/api/agents/visual-creator/execute')
        .send(validPlan)
        .expect('Content-Type', /json/)
        .expect(500);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle timeout scenarios (>30s)', async () => {
      // ARRANGE
      const validPlan: ExecutionPlan = {
        id: 'test-timeout',
        brief_id: 'brief-timeout',
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
          step_id: 'timeout-step',
          model: {
            name: 'FLUX Schnell',
            provider: 'FAL.AI',
            model_id: 'flux-schnell',
            reason: 'Test',
            estimated_cost: 0.03,
            estimated_time: 5
          },
          prompt: 'Timeout test',
          dependencies: []
        }],
        scene_descriptions: ['Timeout test'],
        created_at: new Date().toISOString()
      };

      // Mock slow API (never resolves)
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 35000)) // 35s timeout
      );

      // ACT
      const response = await request(app)
        .post('/api/agents/visual-creator/execute')
        .send(validPlan)
        .expect('Content-Type', /json/)
        .expect(500);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('timeout');
    }, 40000); // Test timeout set to 40s

    it('should return partial success when some steps fail', async () => {
      // ARRANGE
      const multiStepPlan: ExecutionPlan = {
        id: 'test-partial',
        brief_id: 'brief-partial',
        target_agent: 'visual_creator',
        content_type: 'image',
        quality_tier: 'standard',
        approach: 'multi_step',
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
            step_id: 'step-success',
            model: {
              name: 'FLUX Schnell',
              provider: 'FAL.AI',
              model_id: 'flux-schnell',
              reason: 'Test',
              estimated_cost: 0.03,
              estimated_time: 5
            },
            prompt: 'Success step',
            dependencies: []
          },
          {
            step_id: 'step-fail',
            model: {
              name: 'Ideogram V2',
              provider: 'FAL.AI',
              model_id: 'ideogram-v2',
              reason: 'Test',
              estimated_cost: 0.05,
              estimated_time: 10
            },
            prompt: 'Fail step',
            dependencies: []
          }
        ],
        scene_descriptions: ['Success step', 'Fail step'],
        created_at: new Date().toISOString()
      };

      // Mock: first succeeds, second fails
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ images: [{ url: 'https://fal.ai/success.jpg', content_type: 'image/jpeg' }] })
        })
        .mockRejectedValueOnce(new Error('Step failed'));

      // ACT
      const response = await request(app)
        .post('/api/agents/visual-creator/execute')
        .send(multiStepPlan)
        .expect('Content-Type', /json/)
        .expect(200); // Should still return 200 with partial_success status

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('partial_success');
      expect(response.body.data.steps).toHaveLength(2);
      expect(response.body.data.steps[0].status).toBe('success');
      expect(response.body.data.steps[1].status).toBe('failed');
    });
  });

  describe('Health Check', () => {
    it('should return 200 for health check endpoint', async () => {
      // ACT
      const response = await request(app)
        .get('/api/agents/visual-creator/health')
        .expect('Content-Type', /json/)
        .expect(200);

      // ASSERT
      expect(response.body.status).toBe('healthy');
      expect(response.body.agent).toBe('visual-creator');
    });
  });
});
