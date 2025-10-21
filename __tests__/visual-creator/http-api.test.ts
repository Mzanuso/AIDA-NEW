/**
 * Visual Creator HTTP API Integration Tests
 *
 * Tests for the REST API endpoints
 */

import { describe, it, expect } from 'vitest';
import type { WorkflowExecutionPlan } from '../../src/shared/types';

const API_BASE_URL = 'http://localhost:3005';

// Mock WorkflowExecutionPlan for testing
const mockPlan: WorkflowExecutionPlan = {
  planId: 'test-plan-001',
  steps: [
    {
      stepId: 'step-1',
      model: 'flux-schnell', // Fast model for testing
      parameters: {
        prompt: 'A professional product photo of a luxury watch on white background',
        width: 1024,
        height: 1024,
        num_images: 1
      },
      dependencies: []
    }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    source: 'test'
  }
};

describe('Visual Creator HTTP API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.service).toBe('visual-creator');
      expect(data.port).toBe(3005);
      expect(data.capabilities).toBeDefined();
      expect(data.capabilities.models).toBeGreaterThan(0);
    });
  });

  describe('GET /api/models', () => {
    it('should return list of supported models', async () => {
      const response = await fetch(`${API_BASE_URL}/api/models`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.models).toBeDefined();
      expect(Array.isArray(data.data.models)).toBe(true);
      expect(data.data.models.length).toBeGreaterThan(0);

      // Check model structure
      const firstModel = data.data.models[0];
      expect(firstModel.id).toBeDefined();
      expect(firstModel.name).toBeDefined();
      expect(firstModel.provider).toBeDefined();
      expect(firstModel.type).toBeDefined();
    });

    it('should include FLUX models', async () => {
      const response = await fetch(`${API_BASE_URL}/api/models`);
      const data = await response.json();

      const fluxModels = data.data.models.filter((m: any) =>
        m.id.includes('flux')
      );

      expect(fluxModels.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/providers', () => {
    it('should return list of API providers', async () => {
      const response = await fetch(`${API_BASE_URL}/api/providers`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.providers).toBeDefined();
      expect(Array.isArray(data.data.providers)).toBe(true);

      // Should have FAL.AI and KIE.AI
      const providers = data.data.providers;
      const falProvider = providers.find((p: any) => p.id === 'fal.ai');
      const kieProvider = providers.find((p: any) => p.id === 'kie.ai');

      expect(falProvider).toBeDefined();
      expect(kieProvider).toBeDefined();
    });
  });

  describe('POST /api/execute', () => {
    it('should reject invalid WorkflowExecutionPlan', async () => {
      const invalidPlan = { planId: 'test' }; // Missing steps

      const response = await fetch(`${API_BASE_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPlan)
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid WorkflowExecutionPlan');
    });

    it('should execute WorkflowExecutionPlan successfully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPlan)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.planId).toBe(mockPlan.planId);
      expect(data.data.stepResults).toBeDefined();
      expect(Array.isArray(data.data.stepResults)).toBe(true);
    }, 30000); // 30s timeout for actual API call
  });

  describe('POST /api/execute/step', () => {
    it('should reject invalid WorkflowStep', async () => {
      const invalidStep = { stepId: 'test' }; // Missing model

      const response = await fetch(`${API_BASE_URL}/api/execute/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidStep)
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid WorkflowStep');
    });

    it('should execute single step successfully', async () => {
      const singleStep = mockPlan.steps[0];

      const response = await fetch(`${API_BASE_URL}/api/execute/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleStep)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.stepId).toBe(singleStep.stepId);
    }, 30000); // 30s timeout for actual API call
  });

  describe('404 handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await fetch(`${API_BASE_URL}/api/unknown`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Not found');
      expect(data.available_endpoints).toBeDefined();
    });
  });
});
