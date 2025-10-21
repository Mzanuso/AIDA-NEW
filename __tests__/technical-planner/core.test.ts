/**
 * Technical Planner Core Tests
 *
 * Tests for TechnicalPlannerWorkflow class
 * Following AIDA-FLOW test-first methodology
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TechnicalPlannerWorkflow } from '../../src/agents/technical-planner/TechnicalPlannerWorkflow';
import type {
  ProjectBrief,
  WorkflowState,
  TechnicalPlan,
  AssetRequirement
} from '../../src/agents/technical-planner/types';

describe('TechnicalPlannerWorkflow - Core Functionality', () => {
  let workflow: TechnicalPlannerWorkflow;
  let mockProjectBrief: ProjectBrief;

  beforeEach(() => {
    workflow = new TechnicalPlannerWorkflow();

    // Mock ProjectBrief matching Orchestrator output
    mockProjectBrief = {
      id: 'test-project-001',
      user_id: 'test-user-001',
      content_type: 'image',
      requirements: [
        'Create a professional product photo',
        'Luxury aesthetic',
        'White background'
      ],
      style_preferences: {
        gallery_selected: [{
          id: '2813938774',
          selection_method: 'gallery' as const,
          requires_artistic_model: true
        }],
        custom_description: 'Cinematic lighting with soft shadows'
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
  });

  describe('1. Initialization', () => {
    it('should create a new workflow state on initialization', async () => {
      const state = await workflow.initialize(mockProjectBrief);

      expect(state).toBeDefined();
      expect(state.project_brief_id).toBe(mockProjectBrief.id);
      expect(state.user_id).toBe(mockProjectBrief.user_id);
      expect(state.current_step).toBe('initialized');
      expect(state.progress_percentage).toBe(0);
      expect(state.status).toBe('in_progress');
    });

    it('should generate a unique workflow state ID', async () => {
      const state1 = await workflow.initialize(mockProjectBrief);
      const state2 = await workflow.initialize({ ...mockProjectBrief, id: 'test-project-002' });

      expect(state1.id).not.toBe(state2.id);
    });
  });

  describe('2. Asset Analysis', () => {
    it('should analyze ProjectBrief and identify required assets', async () => {
      const state = await workflow.initialize(mockProjectBrief);
      const updatedState = await workflow.analyzeRequirements(state);

      expect(updatedState.current_step).toBe('analyzing');
      expect(updatedState.progress_percentage).toBeGreaterThan(0);
      expect(updatedState.technical_plan).toBeDefined();
      expect(updatedState.technical_plan?.assets).toHaveLength(1); // Single image asset
    });

    it('should create correct asset requirements for image content type', async () => {
      const state = await workflow.initialize(mockProjectBrief);
      const updatedState = await workflow.analyzeRequirements(state);

      const asset = updatedState.technical_plan?.assets[0];
      expect(asset).toBeDefined();
      expect(asset?.asset_type).toBe('image');
      expect(asset?.agent_assigned).toBe('visual-creator');
      expect(asset?.specifications.quality_level).toBe('high');
    });

    it('should handle multi-asset video content type', async () => {
      const videoProjectBrief: ProjectBrief = {
        ...mockProjectBrief,
        id: 'test-video-001',
        content_type: 'video',
        requirements: [
          'Create a 30-second product demo video',
          'Include background music',
          'Add text overlay with product name'
        ]
      };

      const state = await workflow.initialize(videoProjectBrief);
      const updatedState = await workflow.analyzeRequirements(state);

      const assets = updatedState.technical_plan?.assets || [];
      expect(assets.length).toBeGreaterThan(1);

      const videoAsset = assets.find(a => a.asset_type === 'video');
      const audioAsset = assets.find(a => a.asset_type === 'audio');

      expect(videoAsset).toBeDefined();
      expect(audioAsset).toBeDefined();
    });
  });

  describe('3. Progress Tracking', () => {
    it('should calculate progress correctly through workflow steps', async () => {
      const state = await workflow.initialize(mockProjectBrief);
      expect(state.progress_percentage).toBe(0);

      const analyzing = await workflow.analyzeRequirements(state);
      expect(analyzing.progress_percentage).toBe(25);

      const planned = await workflow.createTechnicalPlan(analyzing);
      expect(planned.progress_percentage).toBe(50);

      const withModels = await workflow.selectModels(planned);
      expect(withModels.progress_percentage).toBe(75);

      const completed = await workflow.estimateCosts(withModels);
      expect(completed.progress_percentage).toBe(100);
      expect(completed.status).toBe('completed');
    });

    it('should update current_step throughout workflow', async () => {
      const state = await workflow.initialize(mockProjectBrief);

      const steps: Array<{ method: keyof TechnicalPlannerWorkflow; expectedStep: string }> = [
        { method: 'analyzeRequirements', expectedStep: 'analyzing' },
        { method: 'createTechnicalPlan', expectedStep: 'planning' },
        { method: 'selectModels', expectedStep: 'selecting_models' },
        { method: 'estimateCosts', expectedStep: 'estimating_cost' }
      ];

      let currentState = state;
      for (const { method, expectedStep } of steps) {
        currentState = await (workflow[method] as any)(currentState);
        expect(currentState.current_step).toBe(expectedStep);
      }

      expect(currentState.status).toBe('completed');
    });
  });

  describe('4. Model Selection Integration', () => {
    it('should select appropriate models for each asset', async () => {
      const state = await workflow.initialize(mockProjectBrief);
      const analyzing = await workflow.analyzeRequirements(state);
      const planned = await workflow.createTechnicalPlan(analyzing);
      const withModels = await workflow.selectModels(planned);

      expect(withModels.model_selections).toBeDefined();
      expect(withModels.model_selections?.length).toBeGreaterThan(0);

      const selection = withModels.model_selections?.[0];
      expect(selection?.model_id).toBeDefined();
      expect(selection?.provider).toBeDefined();
      expect(selection?.confidence_score).toBeGreaterThan(0);
      expect(selection?.confidence_score).toBeLessThanOrEqual(1);
    });

    it('should respect style_preferences.requires_artistic_model flag', async () => {
      const state = await workflow.initialize(mockProjectBrief);
      const analyzing = await workflow.analyzeRequirements(state);
      const planned = await workflow.createTechnicalPlan(analyzing);
      const withModels = await workflow.selectModels(planned);

      const imageSelection = withModels.model_selections?.find(
        s => s.asset_id === withModels.technical_plan?.assets[0].asset_id
      );

      expect(imageSelection?.provider).toBe('midjourney');
    });
  });

  describe('5. Cost Estimation', () => {
    it('should calculate total cost estimate', async () => {
      const state = await workflow.initialize(mockProjectBrief);
      const analyzing = await workflow.analyzeRequirements(state);
      const planned = await workflow.createTechnicalPlan(analyzing);
      const withModels = await workflow.selectModels(planned);
      const final = await workflow.estimateCosts(withModels);

      expect(final.cost_estimate).toBeDefined();
      expect(final.cost_estimate?.total_estimated_cost).toBeGreaterThan(0);
      expect(final.cost_estimate?.breakdown).toBeDefined();
    });

    it('should check budget constraints', async () => {
      const state = await workflow.initialize(mockProjectBrief);
      const analyzing = await workflow.analyzeRequirements(state);
      const planned = await workflow.createTechnicalPlan(analyzing);
      const withModels = await workflow.selectModels(planned);
      const final = await workflow.estimateCosts(withModels);

      expect(final.cost_estimate?.budget_status).toBe('within_budget');
      expect(final.cost_estimate?.budget_remaining).toBeDefined();
    });

    it('should warn when budget is exceeded', async () => {
      const lowBudgetBrief: ProjectBrief = {
        ...mockProjectBrief,
        budget_constraints: {
          max_total_cost: 0.50,
          cost_per_asset_limit: 0.25,
          currency: 'USD'
        }
      };

      const state = await workflow.initialize(lowBudgetBrief);
      const analyzing = await workflow.analyzeRequirements(state);
      const planned = await workflow.createTechnicalPlan(analyzing);
      const withModels = await workflow.selectModels(planned);
      const final = await workflow.estimateCosts(withModels);

      expect(final.cost_estimate?.budget_status).toBe('exceeds_budget');
      expect(final.cost_estimate?.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('6. Error Handling', () => {
    it('should handle invalid ProjectBrief gracefully', async () => {
      const invalidBrief = {
        ...mockProjectBrief,
        id: '',
        requirements: []
      };

      await expect(workflow.initialize(invalidBrief)).rejects.toThrow();
    });

    it('should mark workflow as failed on critical errors', async () => {
      const state = await workflow.initialize(mockProjectBrief);

      // Simulate error by passing corrupted state
      const corruptedState = { ...state, technical_plan: null };

      await expect(workflow.selectModels(corruptedState as any)).rejects.toThrow();
    });
  });
});
