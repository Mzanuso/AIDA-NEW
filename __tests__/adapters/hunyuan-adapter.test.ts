/**
 * Hunyuan Image 3 Adapter Tests
 * 
 * Tests for HunyuanAdapter - Spatial relationships + Text rendering specialist
 * 
 * Best practices:
 * - Explicit spatial relationships: "next to", "above", "between"
 * - Text in quotes with positioning: "Bold text 'Summer Festival' centered at top"
 * - 3D rendering style for depth perception
 * - Prefer 16:9 or 9:16 aspect ratios
 * - Color schemes explicitly stated
 * 
 * Primary use: Posters, text-heavy designs, spatial compositions
 */

import { HunyuanAdapter } from '../../src/agents/visual-creator/adapters/hunyuan-adapter';
import { UniversalPrompt } from '../../src/agents/visual-creator/prompt-adapter.interface';

describe('HunyuanAdapter', () => {
  let adapter: HunyuanAdapter;

  beforeEach(() => {
    adapter = new HunyuanAdapter();
  });

  describe('Spatial Relationship Keywords', () => {
    test('Should use explicit spatial prepositions', () => {
      const prompt: UniversalPrompt = {
        subject: 'penguin mascot next to stage',
        environment: 'concert venue'
      };

      const result = adapter.translate(prompt);

      // Should preserve spatial relationship keywords
      expect(result.toLowerCase()).toMatch(/next to|beside|near/);
    });

    test('Should handle multiple spatial relationships', () => {
      const prompt: UniversalPrompt = {
        subject: 'logo centered, text above, icon below',
        environment: 'poster design'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toMatch(/centered|above|below/);
    });
  });

  describe('Text Element Rendering', () => {
    test('Should quote all text elements for exact rendering', () => {
      const prompt: UniversalPrompt = {
        subject: 'festival poster',
        textElements: [
          { text: 'Summer Music Festival', position: 'top' }
        ]
      };

      const result = adapter.translate(prompt);

      // Text should be in quotes
      expect(result).toContain("'Summer Music Festival'");
      expect(result.toLowerCase()).toContain('at top');
    });

    test('Should handle multiple text elements with positions', () => {
      const prompt: UniversalPrompt = {
        subject: 'event poster',
        textElements: [
          { text: 'GRAND OPENING', position: 'top' },
          { text: 'May 15, 2025', position: 'bottom' }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result).toContain("'GRAND OPENING'");
      expect(result).toContain("'May 15, 2025'");
      expect(result.toLowerCase()).toContain('at top');
      expect(result.toLowerCase()).toContain('at bottom');
    });

    test('Should work without text elements', () => {
      const prompt: UniversalPrompt = {
        subject: 'landscape scene'
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      expect(result).toContain('landscape');
    });
  });

  describe('3D Rendering Style', () => {
    test('Should mention 3D rendering for depth', () => {
      const prompt: UniversalPrompt = {
        subject: 'product showcase',
        photographyStyle: 'commercial'
      };

      const result = adapter.translate(prompt);

      // Hunyuan excels with 3D rendering style
      expect(result.toLowerCase()).toMatch(/3d|render|depth/);
    });

    test('Should use 3D terminology for posters', () => {
      const prompt: UniversalPrompt = {
        subject: 'movie poster',
        textElements: [{ text: 'ACTION HERO', position: 'center' }]
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toMatch(/3d|render/);
    });
  });

  describe('Color Palette Integration', () => {
    test('Should explicitly state color scheme', () => {
      const prompt: UniversalPrompt = {
        subject: 'poster design',
        colorPalette: ['#00FF00', '#FFFFFF']
      };

      const result = adapter.translate(prompt);

      // Should mention color scheme
      expect(result.toLowerCase()).toMatch(/green.*white|color.*scheme/);
    });

    test('Should handle RGB color descriptions', () => {
      const prompt: UniversalPrompt = {
        subject: 'banner',
        colorPalette: ['#FF0000', '#0000FF', '#FFFF00']
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toMatch(/red|blue|yellow/);
      expect(result.toLowerCase()).toContain('color');
    });
  });

  describe('Composition and Layout', () => {
    test('Should describe centered composition', () => {
      const prompt: UniversalPrompt = {
        subject: 'logo centered on poster',
        textElements: [{ text: 'BRAND', position: 'center' }]
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('center');
    });

    test('Should integrate environment with spatial layout', () => {
      const prompt: UniversalPrompt = {
        subject: 'mascot character',
        environment: 'stage background',
        action: 'standing next to microphone'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('stage');
      expect(result.toLowerCase()).toMatch(/next to|beside/);
    });
  });

  describe('Parameters - Should NOT Use Any', () => {
    test('Should return undefined for parameters', () => {
      const prompt: UniversalPrompt = {
        subject: 'test',
        textElements: [{ text: 'TEST', position: 'top' }]
      };

      const params = adapter.getParameters?.(prompt);

      expect(params).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('Should handle minimal prompt', () => {
      const prompt: UniversalPrompt = {
        subject: 'simple design'
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(15);
    });

    test('Should handle complex multi-text layout', () => {
      const prompt: UniversalPrompt = {
        subject: 'festival poster with penguin mascot',
        textElements: [
          { text: 'Summer Festival', position: 'top' },
          { text: '2025', position: 'center' },
          { text: 'June 15-20', position: 'bottom' }
        ],
        colorPalette: ['#4ECDC4', '#FFE66D'],
        environment: 'beach theme background'
      };

      const result = adapter.translate(prompt);

      // All text elements should be quoted
      expect(result).toContain("'Summer Festival'");
      expect(result).toContain("'2025'");
      expect(result).toContain("'June 15-20'");
      
      // Positions should be specified
      expect(result.toLowerCase()).toContain('at top');
      expect(result.toLowerCase()).toContain('at bottom');
    });
  });

  describe('Model Information', () => {
    test('Should identify as Hunyuan Image 3', () => {
      expect(adapter.modelName).toBe('Hunyuan Image 3');
    });
  });
});
