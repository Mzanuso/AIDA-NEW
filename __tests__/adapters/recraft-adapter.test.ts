/**
 * Recraft v3 Adapter Tests
 * 
 * Tests for RecraftAdapter - Vector/SVG native specialist
 * 
 * Best practices:
 * - "vector style, flat design, scalable illustration" keywords
 * - Explicit color palette with HEX codes
 * - Upload brand style if available
 * - Design-first language (not photographic)
 * - Clean lines, geometric shapes emphasis
 * 
 * Primary use: Logos, icons, illustrations, brand materials, scalable graphics
 */

import { RecraftAdapter } from '../../src/agents/visual-creator/adapters/recraft-adapter';
import { UniversalPrompt } from '../../src/agents/visual-creator/prompt-adapter.interface';

describe('RecraftAdapter', () => {
  let adapter: RecraftAdapter;

  beforeEach(() => {
    adapter = new RecraftAdapter();
  });

  describe('Vector Style Keywords', () => {
    test('Should emphasize vector/flat design style', () => {
      const prompt: UniversalPrompt = {
        subject: 'logo design'
      };

      const result = adapter.translate(prompt);

      // Should mention vector/flat/scalable
      expect(result.toLowerCase()).toMatch(/vector|flat|scalable/);
    });

    test('Should use design terminology (not photography)', () => {
      const prompt: UniversalPrompt = {
        subject: 'tech company icon',
        photographyStyle: 'minimalist'
      };

      const result = adapter.translate(prompt);

      // Should say "design" or "illustration", not "photograph"
      expect(result.toLowerCase()).toMatch(/design|illustration|graphic/);
      expect(result.toLowerCase()).not.toContain('photograph');
    });

    test('Should mention clean lines and geometric shapes', () => {
      const prompt: UniversalPrompt = {
        subject: 'abstract logo'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toMatch(/clean|geometric|lines|shapes/);
    });
  });

  describe('Color Palette with HEX Codes', () => {
    test('Should include HEX codes explicitly', () => {
      const prompt: UniversalPrompt = {
        subject: 'brand logo',
        colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D']
      };

      const result = adapter.translate(prompt);

      // Should include actual HEX codes
      expect(result).toContain('#FF6B6B');
      expect(result).toContain('#4ECDC4');
      expect(result).toContain('#FFE66D');
    });

    test('Should handle 2-color palette', () => {
      const prompt: UniversalPrompt = {
        subject: 'minimalist logo',
        colorPalette: ['#000000', '#FFFFFF']
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('#000000');
      expect(result).toContain('#FFFFFF');
      expect(result.toLowerCase()).toMatch(/2.*color|two.*color/);
    });

    test('Should work without explicit color palette', () => {
      const prompt: UniversalPrompt = {
        subject: 'logo'
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      // Should still be valid vector prompt
      expect(result.toLowerCase()).toContain('vector');
    });
  });

  describe('Design-First Language', () => {
    test('Should use design/illustration terminology', () => {
      const prompt: UniversalPrompt = {
        subject: 'corporate logo',
        photographyStyle: 'modern'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toMatch(/design|illustration|graphic|icon/);
    });

    test('Should emphasize scalability', () => {
      const prompt: UniversalPrompt = {
        subject: 'app icon'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('scalable');
    });
  });

  describe('Subject and Style Integration', () => {
    test('Should describe subject in design context', () => {
      const prompt: UniversalPrompt = {
        subject: 'mountain peak logo',
        photographyStyle: 'minimalist'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('mountain');
      expect(result.toLowerCase()).toContain('logo');
      expect(result.toLowerCase()).toContain('minimalist');
    });

    test('Should handle geometric abstract concepts', () => {
      const prompt: UniversalPrompt = {
        subject: 'abstract tech symbol',
        mood: 'innovative'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('abstract');
      expect(result.toLowerCase()).toContain('tech');
    });
  });

  describe('Brand and Modern Aesthetics', () => {
    test('Should emphasize modern design when specified', () => {
      const prompt: UniversalPrompt = {
        subject: 'startup logo',
        photographyStyle: 'modern',
        mood: 'professional'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('modern');
    });

    test('Should handle brand-specific requirements', () => {
      const prompt: UniversalPrompt = {
        subject: 'fintech company logo',
        colorPalette: ['#1E3A8A', '#FBBF24'],
        photographyStyle: 'professional'
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('#1E3A8A');
      expect(result).toContain('#FBBF24');
      expect(result.toLowerCase()).toContain('professional');
    });
  });

  describe('Parameters - Should NOT Use Any', () => {
    test('Should return undefined for parameters', () => {
      const prompt: UniversalPrompt = {
        subject: 'logo',
        colorPalette: ['#FF0000']
      };

      const params = adapter.getParameters?.(prompt);

      expect(params).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('Should handle minimal prompt', () => {
      const prompt: UniversalPrompt = {
        subject: 'icon'
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      expect(result.toLowerCase()).toContain('vector');
      expect(result.toLowerCase()).toContain('icon');
    });

    test('Should handle complex brand design', () => {
      const prompt: UniversalPrompt = {
        subject: 'eco-friendly brand logo with leaf motif',
        colorPalette: ['#2D5016', '#7CB342', '#FFFFFF'],
        photographyStyle: 'organic',
        mood: 'natural'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('eco');
      expect(result.toLowerCase()).toContain('leaf');
      expect(result).toContain('#2D5016');
      expect(result).toContain('#7CB342');
      expect(result).toContain('#FFFFFF');
    });

    test('Should ignore photographic elements', () => {
      const prompt: UniversalPrompt = {
        subject: 'logo',
        lighting: 'soft studio',  // Not relevant for vector
        shotType: 'close-up'      // Not relevant for vector
      };

      const result = adapter.translate(prompt);

      // Should focus on design, ignore camera/lighting
      expect(result.toLowerCase()).toContain('vector');
      expect(result.toLowerCase()).not.toContain('lighting');
      expect(result.toLowerCase()).not.toContain('shot');
    });
  });

  describe('Model Information', () => {
    test('Should identify as Recraft v3', () => {
      expect(adapter.modelName).toBe('Recraft v3');
    });
  });
});
