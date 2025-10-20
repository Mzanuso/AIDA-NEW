/**
 * Workflow Orchestrator Tests
 * 
 * Test workflow plan generation for all 4 workflow types.
 * 
 * @module __tests__/workflow-orchestrator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowOrchestrator } from '../src/shared/coordination/workflow-orchestrator';
import type { ModelSelectionStrategy, ModelConfig } from '../src/shared/types/model-strategy.types';
import type { UniversalPrompt } from '../src/agents/visual-creator/prompt-adapter.interface';

describe('WorkflowOrchestrator', () => {
  let orchestrator: WorkflowOrchestrator;

  // Mock model config for testing
  const mockFluxPro: ModelConfig = {
    id: 'flux-pro-1.1',
    name: 'FLUX Pro 1.1',
    provider: 'fal.ai',
    tier: 'premium',
    costPerGeneration: 0.055,
    averageTime: 12,
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    capabilities: {}
  };

  const mockFluxSchnell: ModelConfig = {
    id: 'flux-schnell',
    name: 'FLUX Schnell',
    provider: 'fal.ai',
    tier: 'budget',
    costPerGeneration: 0.003,
    averageTime: 3,
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    capabilities: {}
  };

  const mockSeedream: ModelConfig = {
    id: 'seedream-4.0',
    name: 'Seedream 4.0',
    provider: 'fal.ai',
    tier: 'standard',
    costPerGeneration: 0.024,
    averageTime: 8,
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3'],
    capabilities: {
      characterConsistency: true
    }
  };

  const mockIdeogram: ModelConfig = {
    id: 'ideogram-v2',
    name: 'Ideogram v2',
    provider: 'fal.ai',
    tier: 'premium',
    costPerGeneration: 0.08,
    averageTime: 15,
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    capabilities: {
      textRendering: true
    }
  };

  // Mock universal prompt
  const mockPrompt: UniversalPrompt = {
    subject: 'professional woman',
    action: 'standing confidently',
    environment: 'modern office',
    photographyStyle: 'editorial',
    mood: 'inspiring',
    lighting: 'natural window light',
    cameraAngle: 'eye level',
    detailLevel: 'high',
    aspectRatio: '16:9',
    quality: 'premium'
  };

  beforeEach(() => {
    orchestrator = new WorkflowOrchestrator();
  });

  describe('Single-Shot Workflow', () => {
    it('should generate plan for single-shot workflow with FLUX Pro', async () => {
      const strategy: ModelSelectionStrategy = {
        primaryModel: mockFluxPro,
        fallbackModels: [mockFluxSchnell],
        workflowType: 'single-shot',
        reasoning: 'Premium portrait requires FLUX Pro',
        qualityTier: 'premium'
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, mockPrompt);

      // Verify plan structure
      expect(plan.workflowId).toBeDefined();
      expect(plan.workflowType).toBe('single-shot');
      expect(plan.steps).toHaveLength(1);

      // Verify single step
      const step = plan.steps[0];
      expect(step.model).toBe('flux-pro-1.1');
      expect(step.prompt).toBeDefined();
      expect(step.prompt.length).toBeGreaterThan(0);
      expect(step.dependencies).toBeUndefined(); // No dependencies for single-shot
      expect(step.referenceImages).toBeUndefined(); // No references for single-shot

      // Verify cost/time estimates
      expect(plan.estimatedCost).toBe(mockFluxPro.costPerGeneration);
      expect(plan.estimatedTime).toBe(mockFluxPro.averageTime);
      expect(plan.reasoning).toBeDefined();
      expect(plan.createdAt).toBeDefined();
    });

    it('should generate plan for single-shot workflow with budget model', async () => {
      const strategy: ModelSelectionStrategy = {
        primaryModel: mockFluxSchnell,
        fallbackModels: [],
        workflowType: 'single-shot',
        reasoning: 'Budget constraint: using FLUX Schnell',
        qualityTier: 'budget',
        wasDowngraded: true
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, mockPrompt);

      expect(plan.steps).toHaveLength(1);
      expect(plan.steps[0].model).toBe('flux-schnell');
      expect(plan.estimatedCost).toBe(mockFluxSchnell.costPerGeneration);
      expect(plan.estimatedTime).toBe(mockFluxSchnell.averageTime);
    });

    it('should apply correct prompt adapter for selected model', async () => {
      const strategy: ModelSelectionStrategy = {
        primaryModel: mockFluxPro,
        fallbackModels: [],
        workflowType: 'single-shot',
        reasoning: 'FLUX Pro for premium quality',
        qualityTier: 'premium'
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, mockPrompt);

      // FLUX Pro adapter should add IMG_ prefix for premium
      expect(plan.steps[0].prompt).toContain('IMG_');
      // Should contain subject
      expect(plan.steps[0].prompt.toLowerCase()).toContain('woman');
    });
  });

  describe('Consistency Workflow', () => {
    it('should generate multi-step plan for consistency workflow', async () => {
      const strategy: ModelSelectionStrategy = {
        primaryModel: mockSeedream,
        fallbackModels: [],
        workflowType: 'consistency',
        reasoning: 'Character consistency requires Seedream 4.0',
        qualityTier: 'standard'
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, mockPrompt);

      // Consistency workflow should have 3-5 steps
      expect(plan.steps.length).toBeGreaterThanOrEqual(3);
      expect(plan.steps.length).toBeLessThanOrEqual(5);

      // First step is base generation
      const firstStep = plan.steps[0];
      expect(firstStep.stepId).toContain('base');
      expect(firstStep.dependencies).toBeUndefined();

      // Subsequent steps should have dependency on first step
      const secondStep = plan.steps[1];
      expect(secondStep.dependencies).toBeDefined();
      expect(secondStep.dependencies).toContain(firstStep.stepId);

      // All steps should use same model
      plan.steps.forEach(step => {
        expect(step.model).toBe('seedream-4.0');
      });

      // Cost should be sum of all steps
      const expectedCost = plan.steps.length * mockSeedream.costPerGeneration;
      expect(plan.estimatedCost).toBeCloseTo(expectedCost, 3);
    });

    it('should include reference images in consistency workflow', async () => {
      const strategy: ModelSelectionStrategy = {
        primaryModel: mockSeedream,
        fallbackModels: [],
        workflowType: 'consistency',
        reasoning: 'Multi-scene character consistency',
        qualityTier: 'standard'
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, mockPrompt);

      // Steps after the first should reference the base image
      const laterSteps = plan.steps.slice(1);
      laterSteps.forEach(step => {
        expect(step.referenceImages).toBeDefined();
        expect(step.referenceImages!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Text-Composite Workflow', () => {
    it('should generate 2-step plan for text-composite workflow', async () => {
      const promptWithText: UniversalPrompt = {
        ...mockPrompt,
        textOverlay: {
          content: 'INNOVATION 2025',
          position: 'center',
          style: 'bold modern'
        }
      };

      const strategy: ModelSelectionStrategy = {
        primaryModel: mockFluxPro,
        fallbackModels: [],
        workflowType: 'text-composite',
        reasoning: 'Base generation + text overlay',
        qualityTier: 'premium'
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, promptWithText);

      // Should have exactly 2 steps
      expect(plan.steps).toHaveLength(2);

      // Step 1: Base generation (no text)
      const baseStep = plan.steps[0];
      expect(baseStep.stepId).toContain('base');
      expect(baseStep.model).toBe('flux-pro-1.1');
      expect(baseStep.dependencies).toBeUndefined();

      // Step 2: Text overlay (with text, depends on base)
      const textStep = plan.steps[1];
      expect(textStep.stepId).toContain('text');
      expect(textStep.model).toBe('ideogram-v2'); // Should use text specialist
      expect(textStep.dependencies).toContain(baseStep.stepId);
      expect(textStep.referenceImages).toBeDefined();
      expect(textStep.prompt).toContain('INNOVATION 2025');
    });

    it('should calculate cost for both steps in text-composite', async () => {
      const promptWithText: UniversalPrompt = {
        ...mockPrompt,
        textOverlay: {
          content: 'TEST',
          position: 'center',
          style: 'bold'
        }
      };

      const strategy: ModelSelectionStrategy = {
        primaryModel: mockFluxPro,
        fallbackModels: [],
        workflowType: 'text-composite',
        reasoning: 'Composite workflow',
        qualityTier: 'premium'
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, promptWithText);

      // Cost should be: base model + Ideogram
      const expectedCost = mockFluxPro.costPerGeneration + mockIdeogram.costPerGeneration;
      expect(plan.estimatedCost).toBeCloseTo(expectedCost, 3);
    });
  });

  describe('Parallel-Explore Workflow', () => {
    it('should generate 4 parallel steps for parallel-explore workflow', async () => {
      const strategy: ModelSelectionStrategy = {
        primaryModel: mockFluxPro,
        fallbackModels: [mockFluxSchnell, mockSeedream],
        workflowType: 'parallel-explore',
        reasoning: 'Exploring multiple styles in parallel',
        qualityTier: 'standard'
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, mockPrompt);

      // Should have 4 parallel steps
      expect(plan.steps).toHaveLength(4);

      // All steps should have no dependencies (parallel execution)
      plan.steps.forEach(step => {
        expect(step.dependencies).toBeUndefined();
      });

      // Should use different models
      const models = plan.steps.map(s => s.model);
      const uniqueModels = new Set(models);
      expect(uniqueModels.size).toBeGreaterThanOrEqual(2); // At least 2 different models
    });

    it('should use fallback models in parallel-explore', async () => {
      const strategy: ModelSelectionStrategy = {
        primaryModel: mockFluxPro,
        fallbackModels: [mockFluxSchnell, mockSeedream],
        workflowType: 'parallel-explore',
        reasoning: 'Parallel model exploration',
        qualityTier: 'standard'
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, mockPrompt);

      const models = plan.steps.map(s => s.model);
      
      // Should include primary model
      expect(models).toContain(mockFluxPro.id);
      
      // Should include at least one fallback
      const hasFallback = models.some(m => 
        m === mockFluxSchnell.id || m === mockSeedream.id
      );
      expect(hasFallback).toBe(true);
    });

    it('should calculate total time as max (not sum) for parallel workflow', async () => {
      const strategy: ModelSelectionStrategy = {
        primaryModel: mockFluxPro,
        fallbackModels: [mockFluxSchnell],
        workflowType: 'parallel-explore',
        reasoning: 'Parallel execution',
        qualityTier: 'standard'
      };

      const plan = await orchestrator.generateWorkflowPlan(strategy, mockPrompt);

      // Time should be max of all steps (parallel execution)
      const maxStepTime = Math.max(...plan.steps.map(s => s.estimatedTime));
      expect(plan.estimatedTime).toBe(maxStepTime);

      // Cost should be sum of all steps
      const totalCost = plan.steps.reduce((sum, s) => sum + s.estimatedCost, 0);
      expect(plan.estimatedCost).toBeCloseTo(totalCost, 3);
    });
  });

  describe('Error Handling', () => {
    it('should throw error if strategy is invalid', async () => {
      const invalidStrategy = {
        primaryModel: mockFluxPro,
        fallbackModels: [],
        workflowType: 'invalid-type' as any,
        reasoning: 'Invalid',
        qualityTier: 'premium' as const
      };

      await expect(
        orchestrator.generateWorkflowPlan(invalidStrategy, mockPrompt)
      ).rejects.toThrow();
    });

    it('should throw error if prompt is invalid', async () => {
      const strategy: ModelSelectionStrategy = {
        primaryModel: mockFluxPro,
        fallbackModels: [],
        workflowType: 'single-shot',
        reasoning: 'Test',
        qualityTier: 'premium'
      };

      const invalidPrompt = {} as UniversalPrompt;

      await expect(
        orchestrator.generateWorkflowPlan(strategy, invalidPrompt)
      ).rejects.toThrow();
    });
  });
});
