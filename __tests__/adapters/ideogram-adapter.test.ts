/**
 * Ideogram v2 Adapter Tests
 * 
 * Tests for IdeogramAdapter - Typography excellence specialist
 * 
 * Best practices:
 * - All text in "quotation marks" for exact rendering
 * - Explicit positioning: "at top", "centered", "at bottom"
 * - English language for best reliability
 * - Font style descriptions: "1960s hippie-style typeface, elongated artistic"
 * - Professional publishing quality emphasis
 * 
 * Primary use: Book covers, posters, text-heavy designs, typography projects
 */

import { IdeogramAdapter } from '../../src/agents/visual-creator/adapters/ideogram-adapter';
import { UniversalPrompt } from '../../src/agents/visual-creator/prompt-adapter.interface';

describe('IdeogramAdapter', () => {
  let adapter: IdeogramAdapter;

  beforeEach(() => {
    adapter = new IdeogramAdapter();
  });

  describe('Text Quotation Requirements', () => {
    test('Should wrap all text in double quotes', () => {
      const prompt: UniversalPrompt = {
        subject: 'book cover',
        textElements: [
          { text: 'The Adventure Begins', position: 'top' }
        ]
      };

      const result = adapter.translate(prompt);

      // Text must be in quotes
      expect(result).toContain('"The Adventure Begins"');
    });

    test('Should handle multiple text elements with quotes', () => {
      const prompt: UniversalPrompt = {
        subject: 'poster',
        textElements: [
          { text: 'SUMMER FESTIVAL', position: 'top' },
          { text: '2025', position: 'center' },
          { text: 'June 15-20', position: 'bottom' }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('"SUMMER FESTIVAL"');
      expect(result).toContain('"2025"');
      expect(result).toContain('"June 15-20"');
    });
  });

  describe('Positioning Terminology', () => {
    test('Should use explicit position phrases', () => {
      const prompt: UniversalPrompt = {
        subject: 'book cover',
        textElements: [
          { text: 'Title', position: 'top' },
          { text: 'Author', position: 'bottom' }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('at top');
      expect(result.toLowerCase()).toContain('at bottom');
    });

    test('Should handle center positioning', () => {
      const prompt: UniversalPrompt = {
        subject: 'logo',
        textElements: [
          { text: 'BRAND', position: 'center' }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toMatch(/centered|at center/);
    });
  });

  describe('Font Style Descriptions', () => {
    test('Should include font style when provided in textElement', () => {
      const prompt: UniversalPrompt = {
        subject: 'vintage poster',
        textElements: [
          { 
            text: 'RETRO VIBES', 
            position: 'top',
            style: '1960s hippie-style typeface'
          }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('"RETRO VIBES"');
      expect(result.toLowerCase()).toContain('1960s');
      expect(result.toLowerCase()).toContain('hippie');
    });

    test('Should use generic font descriptions when style not specified', () => {
      const prompt: UniversalPrompt = {
        subject: 'book cover',
        textElements: [
          { text: 'Mystery Novel', position: 'top' }
        ]
      };

      const result = adapter.translate(prompt);

      // Should mention font or typography
      expect(result.toLowerCase()).toMatch(/font|typeface|typography/);
    });
  });

  describe('Professional Publishing Quality', () => {
    test('Should emphasize professional quality', () => {
      const prompt: UniversalPrompt = {
        subject: 'book cover design',
        textElements: [
          { text: 'Epic Fantasy', position: 'top' }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toMatch(/professional|publishing|quality/);
    });

    test('Should mention book/poster design context', () => {
      const prompt: UniversalPrompt = {
        subject: 'magazine cover',
        textElements: [
          { text: 'VOGUE', position: 'top' }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('cover');
    });
  });

  describe('Background and Visual Elements', () => {
    test('Should integrate background with text layout', () => {
      const prompt: UniversalPrompt = {
        subject: 'fantasy book cover',
        environment: 'mystical forest',
        textElements: [
          { text: 'The Enchanted Realm', position: 'top' }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('forest');
      expect(result).toContain('"The Enchanted Realm"');
    });

    test('Should handle photography style as design style', () => {
      const prompt: UniversalPrompt = {
        subject: 'poster',
        photographyStyle: 'minimalist',
        textElements: [
          { text: 'SIMPLE', position: 'center' }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('minimalist');
    });
  });

  describe('Text-Only Prompts', () => {
    test('Should handle prompts without text elements', () => {
      const prompt: UniversalPrompt = {
        subject: 'landscape illustration'
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      expect(result.toLowerCase()).toContain('landscape');
      // Should still be valid Ideogram prompt
      expect(result.length).toBeGreaterThan(15);
    });

    test('Should work with just visual description', () => {
      const prompt: UniversalPrompt = {
        subject: 'abstract art',
        mood: 'vibrant'
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('abstract');
      expect(result).toContain('vibrant');
    });
  });

  describe('Parameters - Should NOT Use Any', () => {
    test('Should return undefined for parameters', () => {
      const prompt: UniversalPrompt = {
        subject: 'poster',
        textElements: [{ text: 'TEST', position: 'top' }]
      };

      const params = adapter.getParameters?.(prompt);

      expect(params).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('Should handle minimal text prompt', () => {
      const prompt: UniversalPrompt = {
        subject: 'title card',
        textElements: [
          { text: 'INTRO', position: 'center' }
        ]
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('"INTRO"');
      expect(result.toLowerCase()).toContain('center');
    });

    test('Should handle complex book cover design', () => {
      const prompt: UniversalPrompt = {
        subject: 'sci-fi novel cover',
        environment: 'futuristic cityscape',
        textElements: [
          { 
            text: 'NEON GENESIS', 
            position: 'top',
            style: 'bold futuristic font'
          },
          { 
            text: 'A Cyberpunk Tale', 
            position: 'center',
            style: 'sleek modern typeface'
          },
          { 
            text: 'John Doe', 
            position: 'bottom',
            style: 'elegant serif'
          }
        ],
        mood: 'dramatic',
        lighting: 'neon glow'
      };

      const result = adapter.translate(prompt);

      // All text should be quoted
      expect(result).toContain('"NEON GENESIS"');
      expect(result).toContain('"A Cyberpunk Tale"');
      expect(result).toContain('"John Doe"');
      
      // Positions should be specified
      expect(result.toLowerCase()).toContain('at top');
      expect(result.toLowerCase()).toContain('at bottom');
      
      // Font styles should be included
      expect(result.toLowerCase()).toContain('futuristic');
      expect(result.toLowerCase()).toContain('serif');
    });
  });

  describe('Model Information', () => {
    test('Should identify as Ideogram v2', () => {
      expect(adapter.modelName).toBe('Ideogram v2');
    });
  });
});
