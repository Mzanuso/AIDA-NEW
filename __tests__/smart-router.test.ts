/**
 * Smart Router Tests
 *
 * TEST-FIRST DEVELOPMENT - RED Phase
 * These tests define the expected behavior of the Smart Router before implementation.
 * All tests should FAIL until the SmartRouter class is implemented.
 *
 * The Smart Router selects optimal AI models based on project requirements.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { SmartRouter } from '../src/shared/coordination/smart-router';
import type { ProjectBrief } from '../src/shared/types/project-brief.types';

/**
 * ModelSelectionStrategy - Expected output from SmartRouter.selectModel()
 * This interface defines what the router should return.
 */
interface ModelSelectionStrategy {
  primaryModel: {
    name: string;
    provider: string;
    model_id: string;
  };
  fallbackModel?: {
    name: string;
    provider: string;
    model_id: string;
    triggerConditions: string[];
  };
  workflow: 'single-shot' | 'consistency' | 'iterative' | 'multi-step';
  steps?: Array<{
    step_number: number;
    description: string;
    model: string;
  }>;
  costBreakdown: {
    totalEstimated: number;
    withinBudget: boolean;
  };
  optimizations: {
    promptStrategy: string[];
  };
  reasoning: {
    modelChoice: string;
    qualityExpectation: 'acceptable' | 'good' | 'high' | 'premium';
    tradeoffs?: string[];
  };
}

describe('SmartRouter - Model Selection', () => {
  let router: SmartRouter;

  beforeEach(() => {
    router = new SmartRouter();
  });

  // ========== LEVEL 1: Special Requirements ==========

  test('Should select Recraft v3 when vector output required', () => {
    const brief: ProjectBrief = {
      id: 'brief_001',
      user_id: 'user_123',
      conversation_id: 'conv_001',
      content_type: 'image',
      requirements: ['Create logo design', 'Scalable vector graphics'],
      quality_keywords: ['professional'],
      language: 'en',
      created_at: new Date(),
      special_requirements: ['vectorOutput']
    };

    const strategy = router.selectModel(brief);

    expect(strategy.primaryModel.name).toBe('Recraft v3');
    expect(strategy.primaryModel.provider).toBe('fal.ai');
    expect(strategy.workflow).toBe('single-shot');
    expect(strategy.reasoning.modelChoice).toContain('vector');
  });

  test('Should select Seedream 4.0 when character consistency required', () => {
    const brief: ProjectBrief = {
      id: 'brief_002',
      user_id: 'user_123',
      conversation_id: 'conv_002',
      content_type: 'image',
      requirements: ['Character in multiple scenes', 'Same person across 5 images'],
      quality_keywords: ['professional'],
      language: 'en',
      created_at: new Date(),
      special_requirements: ['characterConsistency', 'multipleScenes']
    };

    const strategy = router.selectModel(brief);

    expect(strategy.primaryModel.name).toBe('Seedream 4.0');
    expect(strategy.workflow).toBe('consistency');
    expect(strategy.steps).toBeDefined();
    expect(strategy.steps).toHaveLength(4);
    expect(strategy.reasoning.modelChoice).toContain('94% character consistency');
  });

  test('Should select Ideogram v2 when text rendering is critical', () => {
    const brief: ProjectBrief = {
      id: 'brief_003',
      user_id: 'user_123',
      conversation_id: 'conv_003',
      content_type: 'image',
      requirements: ['Book cover design', 'Title: "The Adventure Begins"', 'Author name at bottom'],
      quality_keywords: ['professional', 'typography'],
      language: 'en',
      created_at: new Date(),
      special_requirements: ['textRendering']
    };

    const strategy = router.selectModel(brief);

    expect(strategy.primaryModel.name).toBe('Ideogram v2');
    expect(strategy.optimizations.promptStrategy).toContain('quoted text');
    expect(strategy.reasoning.modelChoice).toContain('text rendering');
  });

  // ========== LEVEL 2: Quality Tier + Content Type ==========

  test('Should select FLUX Schnell for budget tier', () => {
    const brief: ProjectBrief = {
      id: 'brief_004',
      user_id: 'user_123',
      conversation_id: 'conv_004',
      content_type: 'image',
      requirements: ['Quick product photo', 'White background'],
      quality_keywords: ['fast', 'draft', 'quick'],
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    expect(strategy.primaryModel.name).toBe('FLUX Schnell');
    expect(strategy.costBreakdown.totalEstimated).toBeLessThan(0.01);
    expect(strategy.reasoning.qualityExpectation).toBe('acceptable');
  });

  test('Should select FLUX Pro 1.1 Ultra for premium portrait', () => {
    const brief: ProjectBrief = {
      id: 'brief_005',
      user_id: 'user_123',
      conversation_id: 'conv_005',
      content_type: 'image',
      requirements: ['Professional headshot', 'Corporate executive', 'Studio lighting'],
      quality_keywords: ['professional', 'high-quality', 'premium', 'photorealistic'],
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    expect(strategy.primaryModel.name).toBe('FLUX Pro 1.1 Ultra');
    expect(strategy.optimizations.promptStrategy).toContain('natural language');
    expect(strategy.reasoning.qualityExpectation).toBe('high');
  });

  // ========== LEVEL 3: Budget Constraints ==========

  test('Should downgrade model when cost exceeds budget', () => {
    const brief: ProjectBrief = {
      id: 'brief_006',
      user_id: 'user_123',
      conversation_id: 'conv_006',
      content_type: 'image',
      requirements: ['Product photo'],
      quality_keywords: ['premium', 'high-quality'],
      budget_constraints: {
        type: 'hard_limit',
        max_cost: 0.005,
        priority: 'cost'
      },
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    expect(strategy.primaryModel.name).toBe('FLUX Schnell');
    expect(strategy.costBreakdown.totalEstimated).toBeLessThanOrEqual(0.005);
    expect(strategy.costBreakdown.withinBudget).toBe(true);
    expect(strategy.reasoning.tradeoffs).toBeDefined();
    expect(strategy.reasoning.tradeoffs).toContain('budget');
  });

  test('Should respect soft budget preference', () => {
    const brief: ProjectBrief = {
      id: 'brief_007',
      user_id: 'user_123',
      conversation_id: 'conv_007',
      content_type: 'image',
      requirements: ['Marketing banner'],
      quality_keywords: ['professional'],
      budget_constraints: {
        type: 'soft_preference',
        max_cost: 0.05,
        priority: 'quality'
      },
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    // Should aim for quality but consider budget
    expect(strategy.costBreakdown.totalEstimated).toBeLessThanOrEqual(0.08); // Allow some overage
    expect(strategy.reasoning.qualityExpectation).not.toBe('acceptable'); // Should be better than minimum
  });

  // ========== LEVEL 4: Fallback Logic ==========

  test('Should provide fallback model when primary unavailable', () => {
    const brief: ProjectBrief = {
      id: 'brief_008',
      user_id: 'user_123',
      conversation_id: 'conv_008',
      content_type: 'image',
      requirements: ['Fashion photography'],
      quality_keywords: ['artistic', 'creative'],
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    expect(strategy.fallbackModel).toBeDefined();
    expect(strategy.fallbackModel?.name).toBeTruthy();
    expect(strategy.fallbackModel?.triggerConditions).toBeDefined();
    expect(strategy.fallbackModel?.triggerConditions).toContain('primary unavailable');
  });

  test('Should provide multiple fallback options for critical projects', () => {
    const brief: ProjectBrief = {
      id: 'brief_009',
      user_id: 'user_123',
      conversation_id: 'conv_009',
      content_type: 'image',
      requirements: ['Client presentation material'],
      quality_keywords: ['premium', 'critical'],
      priority: 'high',
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    expect(strategy.fallbackModel).toBeDefined();
    // High priority projects should have solid fallback
    expect(strategy.fallbackModel?.provider).toBeTruthy();
  });

  // ========== LEVEL 5: Style Preferences Integration ==========

  test('Should handle gallery selection with artistic model requirement', () => {
    const brief: ProjectBrief = {
      id: 'brief_010',
      user_id: 'user_123',
      conversation_id: 'conv_010',
      content_type: 'image',
      requirements: ['Artistic portrait'],
      quality_keywords: ['professional'],
      style_preferences: {
        gallery_selected: [{
          id: 'sref_123456',
          selection_method: 'gallery',
          requires_artistic_model: true
        }]
      },
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    // When artistic model required, should note this in reasoning
    expect(strategy.reasoning.modelChoice).toBeTruthy();
    // Smart Router should indicate artistic model preference
    expect(strategy.reasoning.modelChoice.toLowerCase()).toMatch(/artistic|midjourney|style/);
  });

  test('Should handle reference images', () => {
    const brief: ProjectBrief = {
      id: 'brief_011',
      user_id: 'user_123',
      conversation_id: 'conv_011',
      content_type: 'image',
      requirements: ['Product photo matching brand style'],
      quality_keywords: ['professional'],
      style_preferences: {
        reference_images: ['https://example.com/ref1.jpg', 'https://example.com/ref2.jpg']
      },
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    // Should mention image-to-image or reference in strategy
    expect(strategy.optimizations.promptStrategy.length).toBeGreaterThan(0);
  });

  // ========== LEVEL 6: Edge Cases ==========

  test('Should handle minimal requirements', () => {
    const brief: ProjectBrief = {
      id: 'brief_012',
      user_id: 'user_123',
      conversation_id: 'conv_012',
      content_type: 'image',
      requirements: ['An image'],
      quality_keywords: [],
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    // Should default to reasonable standard model
    expect(strategy.primaryModel.name).toBeTruthy();
    expect(strategy.costBreakdown.totalEstimated).toBeGreaterThan(0);
    expect(strategy.reasoning.qualityExpectation).toBe('good'); // Default to good
  });

  test('Should handle conflicting requirements', () => {
    const brief: ProjectBrief = {
      id: 'brief_013',
      user_id: 'user_123',
      conversation_id: 'conv_013',
      content_type: 'image',
      requirements: ['Ultra high quality image'],
      quality_keywords: ['premium', 'ultra', 'best'],
      budget_constraints: {
        type: 'hard_limit',
        max_cost: 0.003, // Very low budget
        priority: 'cost'
      },
      language: 'en',
      created_at: new Date()
    };

    const strategy = router.selectModel(brief);

    // Budget should win due to hard_limit
    expect(strategy.costBreakdown.withinBudget).toBe(true);
    expect(strategy.reasoning.tradeoffs).toBeDefined();
    expect(strategy.reasoning.tradeoffs?.length).toBeGreaterThan(0);
  });

  test('Should validate input brief', () => {
    const invalidBrief = {
      id: 'brief_014',
      // Missing required fields
    } as ProjectBrief;

    expect(() => {
      router.selectModel(invalidBrief);
    }).toThrow();
  });
});

/**
 * Next Steps After RED Phase:
 *
 * 1. Run tests: npm test -- smart-router.test.ts
 * 2. Confirm all tests FAIL (expected in RED phase)
 * 3. Implement SmartRouter class in src/agents/visual-creator/smart-router.ts
 * 4. Run tests again to reach GREEN phase
 * 5. Refactor for clean code (REFACTOR phase)
 */
