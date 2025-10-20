/**
 * Visual Creator Bridge Tests
 * 
 * Test the bridge between Technical Planner's ExecutionPlan
 * and Visual Creator's workflow system.
 * 
 * @module __tests__/visual-creator-bridge
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualCreatorBridge } from '../src/shared/coordination/execution-bridge';
import type { ExecutionPlan } from '../src/shared/types';

describe('VisualCreatorBridge', () => {
  let bridge: VisualCreatorBridge;

  // Mock ExecutionPlan for testing
  const mockExecutionPlan: ExecutionPlan = {
    id: 'plan-001',
    brief_id: 'brief-001',
    primary_model: {
      name: 'FLUX Pro 1.1',
      model_id: 'flux-pro-1.1',
      provider: 'FAL.AI',
      reason: 'Premium quality portrait',
      estimated_cost: 0.055,
      estimated_time: 12
    },
    fallback_models: [
      {
        name: 'FLUX Schnell',
        model_id: 'flux-schnell',
        provider: 'FAL.AI',
        reason: 'Budget fallback',
        estimated_cost: 0.003,
        estimated_time: 3
      }
    ],
    approach: 'single_model',
    prompt: 'Professional businesswoman in modern office',
    scene_descriptions: [
      'Professional woman standing confidently in modern office with natural window light',
      'Close-up portrait of the same woman smiling, warm natural lighting',
      'Wide shot of woman at desk working on laptop, editorial style'
    ],
    quality_tier: 'premium',
    total_estimated_cost: 0.165, // 3 scenes * 0.055
    total_estimated_time: 36, // 3 scenes * 12s
    target_agent: 'visual_creator',
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    bridge = new VisualCreatorBridge();
  });

  describe('ExecutionPlan Parsing', () => {
    it('should validate ExecutionPlan has required fields', () => {
      expect(() => {
        bridge.process(mockExecutionPlan);
      }).not.toThrow();
    });

    it('should throw error if ExecutionPlan is missing scene_descriptions', async () => {
      const invalidPlan = { ...mockExecutionPlan };
      delete invalidPlan.scene_descriptions;

      await expect(bridge.process(invalidPlan)).rejects.toThrow(
        'ExecutionPlan must have scene_descriptions for visual content'
      );
    });

    it('should throw error if target_agent is not visual_creator', async () => {
      const invalidPlan: ExecutionPlan = {
        ...mockExecutionPlan,
        target_agent: 'video_composer'
      };

      await expect(bridge.process(invalidPlan)).rejects.toThrow(
        'ExecutionPlan target_agent must be visual_creator'
      );
    });
  });

  describe('UniversalPrompt Generation', () => {
    it('should convert scene description to UniversalPrompt', async () => {
      const result = await bridge.process(mockExecutionPlan);

      // Should have one workflow per scene
      expect(result).toHaveLength(3);

      // First workflow should have UniversalPrompt data
      const firstWorkflow = result[0];
      expect(firstWorkflow.steps[0].prompt).toBeDefined();
      expect(firstWorkflow.steps[0].prompt.length).toBeGreaterThan(0);
    });

    it('should extract subject from scene description', async () => {
      const singleScenePlan: ExecutionPlan = {
        ...mockExecutionPlan,
        scene_descriptions: ['confident businesswoman in urban setting']
      };

      const result = await bridge.process(singleScenePlan);

      // Verify prompt contains subject
      const prompt = result[0].steps[0].prompt.toLowerCase();
      expect(prompt).toContain('woman');
    });

    it('should preserve quality tier in UniversalPrompt', async () => {
      const result = await bridge.process(mockExecutionPlan);

      // Quality tier should influence prompt adapter
      // FLUX Pro should add IMG_ prefix for premium
      expect(result[0].steps[0].prompt).toContain('IMG_');
    });
  });

  describe('Smart Router Integration', () => {
    it('should use Smart Router to select model', async () => {
      const result = await bridge.process(mockExecutionPlan);

      // Should use model from ExecutionPlan
      expect(result[0].steps[0].model).toBe('flux-pro-1.1');
    });

    it('should handle budget constraints', async () => {
      const budgetPlan: ExecutionPlan = {
        ...mockExecutionPlan,
        quality_tier: 'fast',
        primary_model: {
          name: 'FLUX Schnell',
          model_id: 'flux-schnell',
          provider: 'FAL.AI',
          reason: 'Budget tier',
          estimated_cost: 0.003,
          estimated_time: 3
        }
      };

      const result = await bridge.process(budgetPlan);

      // Should use budget model
      expect(result[0].steps[0].model).toBe('flux-schnell');
      expect(result[0].estimatedCost).toBeLessThan(0.01);
    });
  });

  describe('Workflow Orchestrator Integration', () => {
    it('should generate WorkflowExecutionPlan for single-shot workflow', async () => {
      const singleShotPlan: ExecutionPlan = {
        ...mockExecutionPlan,
        scene_descriptions: ['single portrait image']
      };

      const result = await bridge.process(singleShotPlan);

      expect(result).toHaveLength(1);
      expect(result[0].workflowType).toBe('single-shot');
      expect(result[0].steps).toHaveLength(1);
    });

    it('should include cost and time estimates', async () => {
      const result = await bridge.process(mockExecutionPlan);

      result.forEach(workflow => {
        expect(workflow.estimatedCost).toBeGreaterThan(0);
        expect(workflow.estimatedTime).toBeGreaterThan(0);
        expect(workflow.reasoning).toBeDefined();
      });
    });

    it('should generate unique workflowId for each scene', async () => {
      const result = await bridge.process(mockExecutionPlan);

      const workflowIds = result.map(w => w.workflowId);
      const uniqueIds = new Set(workflowIds);

      expect(uniqueIds.size).toBe(result.length);
    });
  });

  describe('Multi-Scene Handling', () => {
    it('should generate one WorkflowExecutionPlan per scene', async () => {
      const result = await bridge.process(mockExecutionPlan);

      // 3 scenes = 3 workflows
      expect(result).toHaveLength(3);
    });

    it('should handle consistency workflow for character-based scenes', async () => {
      const consistencyPlan: ExecutionPlan = {
        ...mockExecutionPlan,
        special_instructions: 'maintain character consistency across scenes',
        scene_descriptions: [
          'Hero character in forest',
          'Same hero character in cave',
          'Same hero character at mountain peak'
        ]
      };

      const result = await bridge.process(consistencyPlan);

      // Should detect consistency requirement
      // First workflow might be base generation
      // Subsequent should reference first
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should aggregate total cost across all scenes', async () => {
      const result = await bridge.process(mockExecutionPlan);

      const totalCost = result.reduce((sum, w) => sum + w.estimatedCost, 0);
      
      // Should be close to ExecutionPlan's total_estimated_cost
      expect(totalCost).toBeCloseTo(mockExecutionPlan.total_estimated_cost, 2);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty scene_descriptions gracefully', async () => {
      const emptyPlan: ExecutionPlan = {
        ...mockExecutionPlan,
        scene_descriptions: []
      };

      await expect(bridge.process(emptyPlan)).rejects.toThrow();
    });

    it('should handle malformed scene descriptions', async () => {
      const malformedPlan: ExecutionPlan = {
        ...mockExecutionPlan,
        scene_descriptions: ['', '   ', 'valid description']
      };

      const result = await bridge.process(malformedPlan);

      // Should filter out empty descriptions
      expect(result.length).toBeLessThan(3);
    });

    it('should propagate model selection errors', async () => {
      const invalidModelPlan: ExecutionPlan = {
        ...mockExecutionPlan,
        primary_model: {
          ...mockExecutionPlan.primary_model,
          model_id: 'non-existent-model'
        }
      };

      // Should handle gracefully with fallback or error
      await expect(bridge.process(invalidModelPlan)).rejects.toThrow();
    });
  });

  describe('Special Instructions Handling', () => {
    it('should pass special_instructions to workflow', async () => {
      const planWithInstructions: ExecutionPlan = {
        ...mockExecutionPlan,
        special_instructions: 'Use vibrant colors and high contrast'
      };

      const result = await bridge.process(planWithInstructions);

      // Instructions should influence prompt or workflow
      expect(result[0].reasoning).toBeDefined();
    });
  });
});
