/**
 * Seedream 4.0 Adapter Tests
 * 
 * Tests for SeedreamAdapter - Character consistency specialist (94% accuracy)
 * 
 * Best practices:
 * - Reference images provided upfront (up to 10 images)
 * - Modular prompts: [character] + [action] + [scene]
 * - Preservation keywords: "preserve face geometry, freckles, hair length"
 * - Negative prompts: "no face drift, maintain facial structure"
 * - Fixed seed for maximum consistency
 * 
 * Primary use: Multi-shot storytelling, character-based content
 */

import { SeedreamAdapter } from '../../src/agents/visual-creator/adapters/seedream-adapter';
import { UniversalPrompt } from '../../src/agents/visual-creator/prompt-adapter.interface';

describe('SeedreamAdapter', () => {
  let adapter: SeedreamAdapter;

  beforeEach(() => {
    adapter = new SeedreamAdapter();
  });

  describe('Modular Prompt Structure', () => {
    test('Should use modular format: character + action + scene', () => {
      const prompt: UniversalPrompt = {
        subject: 'young woman with red hair',
        action: 'sitting at cafe',
        environment: 'Parisian street'
      };

      const result = adapter.translate(prompt);

      // Should mention character, action, scene distinctly
      expect(result.toLowerCase()).toContain('woman');
      expect(result.toLowerCase()).toContain('red hair');
      expect(result.toLowerCase()).toContain('sitting');
      expect(result.toLowerCase()).toContain('cafe');
    });

    test('Should emphasize "exact character from reference"', () => {
      const prompt: UniversalPrompt = {
        subject: 'businessman',
        characterReferences: ['https://example.com/ref1.jpg'],
        environment: 'office'
      };

      const result = adapter.translate(prompt);

      // Should emphasize using exact reference
      expect(result.toLowerCase()).toMatch(/exact|same|reference/);
    });
  });

  describe('Preservation Keywords', () => {
    test('Should include preservation instructions when references provided', () => {
      const prompt: UniversalPrompt = {
        subject: 'character',
        characterReferences: ['ref1.jpg', 'ref2.jpg']
      };

      const result = adapter.translate(prompt);

      // Should include preservation language
      expect(result.toLowerCase()).toMatch(/preserve|maintain|keep|exact/);
    });

    test('Should mention facial features preservation', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        characterReferences: ['ref.jpg']
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toMatch(/face|facial|features/);
    });
  });

  describe('Reference Image Handling', () => {
    test('Should acknowledge multiple reference images', () => {
      const prompt: UniversalPrompt = {
        subject: 'character in new scene',
        characterReferences: [
          'ref1.jpg',
          'ref2.jpg',
          'ref3.jpg'
        ]
      };

      const result = adapter.translate(prompt);

      // Should indicate reference-based generation
      expect(result.toLowerCase()).toContain('reference');
    });

    test('Should work without references (less emphasis on consistency)', () => {
      const prompt: UniversalPrompt = {
        subject: 'generic character'
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      expect(result).toContain('character');
    });
  });

  describe('Action and Scene Integration', () => {
    test('Should place character in new scene naturally', () => {
      const prompt: UniversalPrompt = {
        subject: 'athlete',
        action: 'running',
        environment: 'mountain trail',
        characterReferences: ['ref.jpg']
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('running');
      expect(result.toLowerCase()).toContain('mountain');
      expect(result.toLowerCase()).toContain('trail');
    });

    test('Should handle clothing/styling changes', () => {
      const prompt: UniversalPrompt = {
        subject: 'woman in business suit',
        characterReferences: ['casual-ref.jpg'],
        environment: 'corporate office'
      };

      const result = adapter.translate(prompt);

      // Should mention both maintaining character AND new outfit
      expect(result.toLowerCase()).toContain('suit');
      expect(result.toLowerCase()).toMatch(/maintain|preserve|exact/);
    });
  });

  describe('Negative Prompting', () => {
    test('Should include negative instructions for consistency', () => {
      const prompt: UniversalPrompt = {
        subject: 'character',
        characterReferences: ['ref.jpg']
      };

      const result = adapter.translate(prompt);

      // Seedream benefits from explicit "no face drift" type instructions
      expect(result.toLowerCase()).toMatch(/no.*drift|maintain.*structure|preserve.*geometry/);
    });
  });

  describe('Photography Style Integration', () => {
    test('Should combine style with consistency instructions', () => {
      const prompt: UniversalPrompt = {
        subject: 'woman',
        photographyStyle: 'editorial',
        characterReferences: ['ref.jpg'],
        lighting: 'natural'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('editorial');
      expect(result.toLowerCase()).toContain('natural');
      expect(result.toLowerCase()).toMatch(/maintain|preserve/);
    });
  });

  describe('Parameters - Should NOT Use Any', () => {
    test('Should return undefined for parameters', () => {
      const prompt: UniversalPrompt = {
        subject: 'test',
        characterReferences: ['ref.jpg']
      };

      const params = adapter.getParameters?.(prompt);

      expect(params).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('Should handle minimal prompt with references', () => {
      const prompt: UniversalPrompt = {
        subject: 'character',
        characterReferences: ['ref.jpg']
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(20);
    });

    test('Should handle complex scene with multiple elements', () => {
      const prompt: UniversalPrompt = {
        subject: 'young detective',
        action: 'investigating crime scene',
        environment: 'dimly lit warehouse',
        characterReferences: ['ref1.jpg', 'ref2.jpg'],
        lighting: 'dramatic shadows',
        mood: 'tense'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('detective');
      expect(result.toLowerCase()).toContain('investigating');
      expect(result.toLowerCase()).toContain('warehouse');
    });
  });

  describe('Model Information', () => {
    test('Should identify as Seedream 4.0', () => {
      expect(adapter.modelName).toBe('Seedream 4.0');
    });
  });
});
