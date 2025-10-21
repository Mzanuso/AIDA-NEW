/**
 * Technical Planner HTTP API Integration Tests
 *
 * Tests for the REST API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { ProjectBrief } from '../../src/agents/technical-planner/types';

const API_BASE_URL = 'http://localhost:3004';

// Mock ProjectBrief for testing
const mockProjectBrief: ProjectBrief = {
  id: 'test-brief-http-001',
  user_id: 'test-user-http-001',
  content_type: 'image',
  requirements: [
    'Create a professional product photo',
    'Luxury aesthetic',
    'White background'
  ],
  style_preferences: {
    gallery_selected: [{
      id: '2813938774',
      selection_method: 'gallery',
      requires_artistic_model: true
    }]
  },
  quality_keywords: ['professional', 'luxury', 'clean'],
  language: 'en',
  budget_constraints: {
    max_total_cost: 10.00,
    cost_per_asset_limit: 5.00,
    currency: 'USD'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

describe('Technical Planner HTTP API', () => {
  let createdWorkflowId: string;

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.service).toBe('technical-planner');
      expect(data.port).toBe(3004);
    });
  });

  describe('POST /api/plan', () => {
    it('should create a technical plan from ProjectBrief', async () => {
      const response = await fetch(`${API_BASE_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockProjectBrief)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.workflow_state_id).toBeDefined();
      expect(data.data.status).toBe('completed');
      expect(data.data.progress_percentage).toBe(100);
      expect(data.data.technical_plan).toBeDefined();
      expect(data.data.model_selections).toBeDefined();
      expect(data.data.cost_estimate).toBeDefined();

      // Save for later tests
      createdWorkflowId = data.data.workflow_state_id;
    });

    it('should reject ProjectBrief without id', async () => {
      const invalidBrief = { ...mockProjectBrief, id: '' };

      const response = await fetch(`${API_BASE_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidBrief)
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should reject ProjectBrief without requirements', async () => {
      const invalidBrief = { ...mockProjectBrief, requirements: [] };

      const response = await fetch(`${API_BASE_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidBrief)
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('at least one requirement');
    });
  });

  describe('GET /api/plan/:workflowId', () => {
    it('should retrieve workflow state by ID', async () => {
      // First create a workflow
      const createResponse = await fetch(`${API_BASE_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockProjectBrief)
      });
      const createData = await createResponse.json();
      const workflowId = createData.data.workflow_state_id;

      // Then retrieve it
      const response = await fetch(`${API_BASE_URL}/api/plan/${workflowId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(workflowId);
      expect(data.data.technical_plan).toBeDefined();
    });

    it('should return 404 for non-existent workflow', async () => {
      const response = await fetch(`${API_BASE_URL}/api/plan/non-existent-id`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  describe('GET /api/progress/:workflowId', () => {
    it('should return progress information', async () => {
      // Create workflow first
      const createResponse = await fetch(`${API_BASE_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockProjectBrief)
      });
      const createData = await createResponse.json();
      const workflowId = createData.data.workflow_state_id;

      // Get progress
      const response = await fetch(`${API_BASE_URL}/api/progress/${workflowId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.workflow_id).toBe(workflowId);
      expect(data.data.progress_percentage).toBe(100);
      expect(data.data.status).toBe('completed');
    });
  });

  describe('DELETE /api/plan/:workflowId', () => {
    it('should delete workflow state', async () => {
      // Create workflow first
      const createResponse = await fetch(`${API_BASE_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockProjectBrief)
      });
      const createData = await createResponse.json();
      const workflowId = createData.data.workflow_state_id;

      // Delete it
      const response = await fetch(`${API_BASE_URL}/api/plan/${workflowId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify it's gone
      const getResponse = await fetch(`${API_BASE_URL}/api/plan/${workflowId}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
