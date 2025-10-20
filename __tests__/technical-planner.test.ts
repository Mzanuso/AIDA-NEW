/**
 * Technical Planner Tests
 *
 * Tests the Technical Planner agent's ability to:
 * - Analyze ProjectBrief
 * - Select optimal models
 * - Create ExecutionPlan
 *
 * @module __tests__/technical-planner
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TechnicalPlanner } from '../src/agents/technical-planner/technical-planner';
import type { ProjectBrief } from '../src/shared/types/project-brief.types';

describe('TechnicalPlanner', () => {
  let planner: TechnicalPlanner;

  beforeEach(() => {
    planner = new TechnicalPlanner();
  });

  describe('plan() - Basic Functionality', () => {
    it('should create ExecutionPlan from ProjectBrief', async () => {
      const brief: ProjectBrief = {
        id: 'brief-001',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: ['Create a professional headshot photo'],
        quality_keywords: ['professional', 'high-quality'],
        language: 'en',
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      expect(plan).toBeDefined();
      expect(plan.id).toMatch(/^plan-/);
      expect(plan.brief_id).toBe('brief-001');
      expect(plan.target_agent).toBe('visual_creator');
      expect(plan.primary_model).toBeDefined();
      expect(plan.primary_model.name).toBeTruthy();
      expect(plan.scene_descriptions).toHaveLength(1);
      expect(plan.prompt).toBeTruthy();
    });

    it('should throw error for invalid ProjectBrief (missing ID)', async () => {
      const invalidBrief = {
        user_id: 'user-001',
        content_type: 'image',
        requirements: ['Test']
      } as any;

      await expect(planner.plan(invalidBrief)).rejects.toThrow('missing required IDs');
    });

    it('should throw error for empty requirements', async () => {
      const brief: ProjectBrief = {
        id: 'brief-001',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: [],
        quality_keywords: ['professional'],
        language: 'en',
        created_at: new Date()
      };

      await expect(planner.plan(brief)).rejects.toThrow('must have requirements');
    });
  });

  describe('Model Selection', () => {
    it('should select premium model for high-quality keywords', async () => {
      const brief: ProjectBrief = {
        id: 'brief-002',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: ['Professional headshot'],
        quality_keywords: ['premium', 'best', 'photorealistic'],
        language: 'en',
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      expect(plan.quality_tier).toBe('premium');
      expect(plan.primary_model.name).toMatch(/FLUX Pro|Midjourney/i);
    });

    it('should select budget model for fast/draft keywords', async () => {
      const brief: ProjectBrief = {
        id: 'brief-003',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: ['Quick draft image'],
        quality_keywords: ['fast', 'draft', 'quick'],
        language: 'en',
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      expect(plan.quality_tier).toBe('fast');
      expect(plan.primary_model.name).toMatch(/Schnell/i);
    });

    it('should select Ideogram for text rendering special requirement', async () => {
      const brief: ProjectBrief = {
        id: 'brief-004',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: ['Book cover with title text'],
        quality_keywords: ['professional'],
        language: 'en',
        special_requirements: ['textRendering'],
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      expect(plan.primary_model.name).toMatch(/Ideogram/i);
    });

    it('should select Recraft for vector output special requirement', async () => {
      const brief: ProjectBrief = {
        id: 'brief-005',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: ['Company logo design'],
        quality_keywords: ['professional'],
        language: 'en',
        special_requirements: ['vectorOutput'],
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      expect(plan.primary_model.name).toMatch(/Recraft/i);
    });
  });

  describe('ExecutionPlan Structure', () => {
    it('should include all required fields in ExecutionPlan', async () => {
      const brief: ProjectBrief = {
        id: 'brief-006',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: ['Test image'],
        quality_keywords: ['standard'],
        language: 'en',
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      // Required fields
      expect(plan.id).toBeDefined();
      expect(plan.brief_id).toBe('brief-006');
      expect(plan.target_agent).toBe('visual_creator');
      expect(plan.prompt).toBeTruthy();
      expect(plan.scene_descriptions).toBeDefined();
      expect(plan.quality_tier).toBeDefined();
      expect(plan.primary_model).toBeDefined();
      expect(plan.approach).toBeDefined();
      expect(plan.total_estimated_cost).toBeTypeOf('number');
      expect(plan.total_estimated_time).toBeTypeOf('number');
      expect(plan.created_at).toBeDefined();

      // Model fields
      expect(plan.primary_model.name).toBeTruthy();
      expect(plan.primary_model.model_id).toBeTruthy();
      expect(plan.primary_model.provider).toBeTruthy();
      expect(plan.primary_model.reason).toBeTruthy();
      expect(plan.primary_model.estimated_cost).toBeTypeOf('number');
      expect(plan.primary_model.estimated_time).toBeTypeOf('number');
    });

    it('should pass through style preferences from brief', async () => {
      const brief: ProjectBrief = {
        id: 'brief-007',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: ['Portrait photo'],
        quality_keywords: ['professional'],
        language: 'en',
        style_preferences: {
          gallery_selected: [{
            id: 'style-001',
            category: 'portrait',
            name: 'Cinematic',
            requires_artistic_model: true
          }]
        },
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      expect(plan.style_preferences).toBeDefined();
      expect(plan.style_preferences?.gallery_selected).toHaveLength(1);
      expect(plan.style_preferences?.gallery_selected?.[0]).toBe('style-001');
    });

    it('should include special instructions in plan', async () => {
      const brief: ProjectBrief = {
        id: 'brief-008',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: ['Character design'],
        quality_keywords: ['premium'],
        language: 'en',
        special_requirements: ['characterConsistency'],
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      expect(plan.special_instructions).toBeDefined();
      expect(plan.special_instructions).toContain('characterConsistency');
    });
  });

  describe('Cost and Time Estimates', () => {
    it('should provide realistic cost estimates', async () => {
      const brief: ProjectBrief = {
        id: 'brief-009',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: ['Product photo'],
        quality_keywords: ['professional'],
        language: 'en',
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      expect(plan.total_estimated_cost).toBeGreaterThan(0);
      expect(plan.total_estimated_cost).toBeLessThan(1); // Should be < $1 for single image
      expect(plan.total_estimated_time).toBeGreaterThan(0);
      expect(plan.total_estimated_time).toBeLessThan(60); // Should be < 1 minute
    });
  });

  describe('Scene Extraction', () => {
    it('should combine requirements into scene description', async () => {
      const brief: ProjectBrief = {
        id: 'brief-010',
        user_id: 'user-001',
        conversation_id: 'conv-001',
        content_type: 'image',
        requirements: [
          'Professional headshot',
          'Natural lighting',
          'Office background'
        ],
        quality_keywords: ['professional'],
        language: 'en',
        created_at: new Date()
      };

      const plan = await planner.plan(brief);

      expect(plan.scene_descriptions).toHaveLength(1);
      expect(plan.scene_descriptions[0]).toContain('Professional headshot');
      expect(plan.scene_descriptions[0]).toContain('Natural lighting');
      expect(plan.scene_descriptions[0]).toContain('Office background');
    });
  });
});
