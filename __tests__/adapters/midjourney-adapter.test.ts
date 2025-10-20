/**
 * Midjourney Adapter Tests
 * 
 * Tests for MidjourneyAdapter following researched best practices:
 * - 4W1H Formula (What, Who, Where, When, How)
 * - 60-30-10 Rule (60% concept, 30% style, 10% technical)
 * - Word hierarchy (first 8 words = 70% impact)
 * - Parameters: --ar, --s, --c, --v
 */

import { MidjourneyAdapter } from '../../src/agents/visual-creator/adapters/midjourney-adapter';
import { UniversalPrompt } from '../../src/agents/visual-creator/prompt-adapter.interface';

describe('MidjourneyAdapter', () => {
  let adapter: MidjourneyAdapter;

  beforeEach(() => {
    adapter = new MidjourneyAdapter();
  });

  describe('Basic Translation - 4W1H Formula', () => {
    test('Should apply 4W1H formula with all elements', () => {
      const prompt: UniversalPrompt = {
        subject: 'confident businesswoman',
        action: 'standing',
        environment: 'urban rooftop',
        lighting: 'golden hour',
        mood: 'inspiring',
        shotType: 'medium',
        photographyStyle: 'editorial'
      };

      const result = adapter.translate(prompt);

      // Should include all core elements
      expect(result).toContain('businesswoman');
      expect(result).toContain('urban rooftop');
      expect(result).toContain('golden hour');
      
      // Should use proper terminology
      expect(result).toContain('medium shot');
      expect(result).toContain('editorial');
    });

    test('Should prioritize subject early (word hierarchy)', () => {
      const prompt: UniversalPrompt = {
        subject: 'vintage sports car',
        photographyStyle: 'documentary',
        shotType: 'wide'
      };

      const result = adapter.translate(prompt);
      const words = result.split(' ');

      // Subject should appear in first 8 words (70% impact zone)
      const subjectIndex = words.findIndex(w => w.includes('car'));
      expect(subjectIndex).toBeLessThan(8);
    });

    test('Should handle minimal prompt (subject only)', () => {
      const prompt: UniversalPrompt = {
        subject: 'mountain landscape'
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('mountain landscape');
      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe('Parameter Generation', () => {
    test('Should generate correct parameters for premium quality', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        quality: 'premium',
        aspectRatio: '4:5'
      };

      const params = adapter.getParameters?.(prompt);

      expect(params).toBeDefined();
      expect(params?.v).toBe(7);  // Always v7
      expect(params?.ar).toBe('4:5');
      
      // Premium should use --s 200-300
      expect(params?.s).toBeGreaterThanOrEqual(200);
      expect(params?.s).toBeLessThanOrEqual(300);
      
      // Low chaos for consistency
      expect(params?.c).toBeLessThanOrEqual(15);
    });

    test('Should map quality tiers to stylize values', () => {
      const premium: UniversalPrompt = {
        subject: 'test',
        quality: 'premium'
      };
      const standard: UniversalPrompt = {
        subject: 'test',
        quality: 'standard'
      };
      const budget: UniversalPrompt = {
        subject: 'test',
        quality: 'budget'
      };

      const premiumParams = adapter.getParameters?.(premium);
      const standardParams = adapter.getParameters?.(standard);
      const budgetParams = adapter.getParameters?.(budget);

      // Premium: 250-300
      expect(premiumParams?.s).toBeGreaterThanOrEqual(200);
      expect(premiumParams?.s).toBeLessThanOrEqual(300);

      // Standard: 150-200
      expect(standardParams?.s).toBeGreaterThanOrEqual(150);
      expect(standardParams?.s).toBeLessThanOrEqual(200);

      // Budget: 100-150
      expect(budgetParams?.s).toBeGreaterThanOrEqual(100);
      expect(budgetParams?.s).toBeLessThanOrEqual(150);
    });

    test('Should default to standard quality if not specified', () => {
      const prompt: UniversalPrompt = {
        subject: 'test'
      };

      const params = adapter.getParameters?.(prompt);

      expect(params?.s).toBeGreaterThanOrEqual(150);
      expect(params?.s).toBeLessThanOrEqual(200);
    });

    test('Should handle all aspect ratios', () => {
      const ratios = ['1:1', '16:9', '4:5', '2:3', '3:2', '21:9'];

      ratios.forEach(ratio => {
        const prompt: UniversalPrompt = {
          subject: 'test',
          aspectRatio: ratio
        };

        const params = adapter.getParameters?.(prompt);
        expect(params?.ar).toBe(ratio);
      });
    });
  });

  describe('Photography Styles and Shot Types', () => {
    test('Should handle editorial photography style', () => {
      const prompt: UniversalPrompt = {
        subject: 'fashion model',
        photographyStyle: 'editorial',
        shotType: 'close-up'
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('editorial');
      expect(result).toContain('close-up');
    });

    test('Should apply correct shot type terminology', () => {
      const shotTypes = {
        'close-up': 'close-up shot',
        'medium': 'medium shot',
        'wide': 'wide shot',
        'extreme close-up': 'extreme close-up'
      };

      Object.entries(shotTypes).forEach(([input, expected]) => {
        const prompt: UniversalPrompt = {
          subject: 'subject',
          shotType: input
        };

        const result = adapter.translate(prompt);
        expect(result.toLowerCase()).toContain(expected.toLowerCase());
      });
    });
  });

  describe('Lighting and Technical Details', () => {
    test('Should include camera technical details', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        technicalDetails: '85mm f/1.4 portrait lens, shallow depth of field'
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('85mm');
      expect(result).toContain('portrait lens');
    });

    test('Should format lighting properly', () => {
      const prompt: UniversalPrompt = {
        subject: 'landscape',
        lighting: 'golden hour'
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('golden hour');
      // Should add "lighting" suffix if not present
      expect(result.toLowerCase()).toContain('light');
    });
  });

  describe('Edge Cases', () => {
    test('Should handle empty optional fields gracefully', () => {
      const prompt: UniversalPrompt = {
        subject: 'simple subject'
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      expect(result).toContain('simple subject');
      // Should still produce reasonable prompt
      expect(result.split(',').length).toBeGreaterThanOrEqual(1);
    });

    test('Should handle very long subject descriptions', () => {
      const prompt: UniversalPrompt = {
        subject: 'extremely detailed and complex subject with many descriptive words and elaborate characteristics'
      };

      const result = adapter.translate(prompt);

      expect(result).toContain(prompt.subject);
      expect(result.length).toBeLessThan(400);  // Reasonable limit
    });

    test('Should ignore unsupported features gracefully', () => {
      const prompt: UniversalPrompt = {
        subject: 'test',
        textElements: [{ text: 'Hello', position: 'top' }],  // Midjourney doesn't excel at text
        colorPalette: ['#FF0000']  // Not a Midjourney feature
      };

      const result = adapter.translate(prompt);

      // Should not crash, just ignore unsupported features
      expect(result).toBeTruthy();
      expect(result).toContain('test');
    });
  });

  describe('Model Information', () => {
    test('Should identify as Midjourney v7', () => {
      expect(adapter.modelName).toBe('Midjourney v7');
    });
  });
});
