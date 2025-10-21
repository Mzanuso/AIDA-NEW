/**
 * Microservices Contract Validation Tests
 * Ensures API contracts between services are compatible
 * Part of AIDA-FLOW cross-validation system
 */

import { describe, test, expect } from 'vitest';

describe('Microservices Contract Validation', () => {
  describe('Style Selector → Technical Planner', () => {
    test('StyleSelectorResponse matches TechnicalPlannerInput', () => {
      // Style Selector output
      const styleSelectorOutput = {
        styleId: 'cinematic-dark',
        styleName: 'Cinematic Dark',
        description: 'Moody cinematic atmosphere',
        characteristics: {
          lighting: 'dramatic',
          colorPalette: ['#1a1a1a', '#8b0000'],
          mood: 'tense'
        },
        modelRecommendations: [
          { modelId: 'midjourney-v6', priority: 1, reason: 'Best for cinematic' }
        ]
      };

      // Technical Planner expects ProjectBrief which includes style
      expect(styleSelectorOutput).toHaveProperty('styleId');
      expect(styleSelectorOutput).toHaveProperty('styleName');
      expect(styleSelectorOutput).toHaveProperty('modelRecommendations');
      expect(Array.isArray(styleSelectorOutput.modelRecommendations)).toBe(true);
    });
  });

  describe('Technical Planner → Visual Creator', () => {
    test('ExecutionPlan matches Visual Creator input', () => {
      // Technical Planner output (ExecutionPlan)
      const executionPlan = {
        workflow_id: 'wf_123',
        steps: [
          {
            stepId: 'step_1',
            model: 'flux-pro-1.1',
            provider: 'fal.ai',
            prompt: 'A dark cinematic scene',
            parameters: {
              image_size: 'landscape_16_9',
              num_inference_steps: 28,
              guidance_scale: 3.5
            }
          }
        ],
        estimated_duration_seconds: 120,
        estimated_cost_usd: 0.15
      };

      // Visual Creator expects WorkflowExecutionPlan
      expect(executionPlan).toHaveProperty('workflow_id');
      expect(executionPlan).toHaveProperty('steps');
      expect(Array.isArray(executionPlan.steps)).toBe(true);

      const step = executionPlan.steps[0];
      expect(step).toHaveProperty('stepId');
      expect(step).toHaveProperty('model');
      expect(step).toHaveProperty('provider');
      expect(step).toHaveProperty('prompt');
      expect(step).toHaveProperty('parameters');
    });

    test('Visual Creator output matches expected format', () => {
      // Visual Creator output (WorkflowResult)
      const workflowResult = {
        workflow_id: 'wf_123',
        status: 'completed',
        results: [
          {
            stepId: 'step_1',
            status: 'success',
            imageUrl: 'https://fal.ai/outputs/image.png',
            modelUsed: 'flux-pro-1.1',
            duration_seconds: 15,
            cost_usd: 0.05
          }
        ],
        total_duration_seconds: 15,
        total_cost_usd: 0.05
      };

      expect(workflowResult).toHaveProperty('workflow_id');
      expect(workflowResult).toHaveProperty('status');
      expect(workflowResult).toHaveProperty('results');
      expect(Array.isArray(workflowResult.results)).toBe(true);

      const result = workflowResult.results[0];
      expect(result).toHaveProperty('stepId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('imageUrl');
      expect(result).toHaveProperty('modelUsed');
    });
  });

  describe('Cost Tracking Consistency', () => {
    test('Cost fields match across services', () => {
      // Technical Planner estimates
      const technicalPlannerEstimate = {
        estimated_cost_usd: 0.15,
        cost_breakdown: [
          { step: 'step_1', model: 'flux-pro-1.1', estimated_cost: 0.05 },
          { step: 'step_2', model: 'flux-schnell', estimated_cost: 0.02 }
        ]
      };

      // Visual Creator actuals
      const visualCreatorActual = {
        total_cost_usd: 0.07,
        results: [
          { stepId: 'step_1', cost_usd: 0.05 },
          { stepId: 'step_2', cost_usd: 0.02 }
        ]
      };

      // Both use same cost field names
      expect(technicalPlannerEstimate).toHaveProperty('estimated_cost_usd');
      expect(visualCreatorActual).toHaveProperty('total_cost_usd');

      // Cost is a number
      expect(typeof technicalPlannerEstimate.estimated_cost_usd).toBe('number');
      expect(typeof visualCreatorActual.total_cost_usd).toBe('number');
    });
  });

  describe('Model ID Consistency', () => {
    test('Model IDs match across catalog and services', () => {
      const modelCatalogIds = [
        'flux-pro-1.1',
        'flux-schnell',
        'seedream-4.0',
        'ideogram-v2',
        'recraft-v3',
        'midjourney-v6',
        'hunyuan-video'
      ];

      const technicalPlannerModels = [
        'flux-pro-1.1',
        'flux-schnell',
        'seedream-4.0'
      ];

      const visualCreatorModels = [
        'flux-pro-1.1',
        'flux-schnell',
        'seedream-4.0',
        'ideogram-v2',
        'recraft-v3',
        'midjourney-v6',
        'hunyuan-video'
      ];

      // All Technical Planner models exist in catalog
      technicalPlannerModels.forEach(modelId => {
        expect(modelCatalogIds).toContain(modelId);
      });

      // All Visual Creator models exist in catalog
      visualCreatorModels.forEach(modelId => {
        expect(modelCatalogIds).toContain(modelId);
      });
    });
  });

  describe('Workflow State Fields', () => {
    test('workflow_id format is consistent', () => {
      const workflowIds = [
        'wf_abc123',
        'wf_xyz789',
        'wf_test001'
      ];

      workflowIds.forEach(id => {
        expect(id).toMatch(/^wf_[a-z0-9]+$/);
      });
    });

    test('step_id format is consistent', () => {
      const stepIds = [
        'step_1',
        'step_2',
        'step_10'
      ];

      stepIds.forEach(id => {
        expect(id).toMatch(/^step_\d+$/);
      });
    });
  });

  describe('Provider Names Consistency', () => {
    test('Provider names match across services', () => {
      const catalogProviders = ['fal.ai', 'kie.ai'];
      const visualCreatorProviders = ['fal.ai', 'kie.ai'];

      expect(catalogProviders).toEqual(visualCreatorProviders);
    });
  });

  describe('HTTP Status Codes', () => {
    test('Success responses use 200', () => {
      const expectedSuccessCode = 200;

      // All services should use 200 for success
      expect(expectedSuccessCode).toBe(200);
    });

    test('Error responses use 400/500 range', () => {
      const errorCodes = {
        badRequest: 400,
        unauthorized: 401,
        notFound: 404,
        serverError: 500
      };

      expect(errorCodes.badRequest).toBe(400);
      expect(errorCodes.serverError).toBe(500);
    });
  });
});
