/**
 * FLUX Schnell Adapter Tests
 * 
 * Tests for FluxSchnellAdapter - Budget tier FLUX model
 * 
 * Key differences from FLUX Pro:
 * - Simpler, more concise prompts
 * - NO IMG_xxxx.cr2 prefix (budget tier)
 * - Less technical detail emphasis
 * - Faster generation, lower cost ($0.003 vs $0.055)
 * - Still uses natural language (not parameters)
 * 
 * Best for: Quick iterations, high volume, concept testing
 */

import { FluxSchnellAdapter } from '../../src/agents/visual-creator/adapters/flux-schnell-adapter';
import { UniversalPrompt } from '../../src/agents/visual-creator/prompt-adapter.interface';

describe('FluxSchnellAdapter', () => {
  let adapter: FluxSchnellAdapter;

  beforeEach(() => {
    adapter = new FluxSchnellAdapter();
  });

  describe('Simplified Natural Language', () => {
    test('Should create concise prose (shorter than FLUX Pro)', () => {
      const prompt: UniversalPrompt = {
        subject: 'mountain landscape',
        environment: 'alpine valley',
        lighting: 'golden hour',
        mood: 'peaceful'
      };

      const result = adapter.translate(prompt);

      // Should be natural language but concise
      expect(result).toBeTruthy();
      expect(result.toLowerCase()).toContain('mountain');
      expect(result.toLowerCase()).toContain('landscape');
      
      // Should be shorter than verbose FLUX Pro style
      expect(result.length).toBeLessThan(200);
    });

    test('Should use simple photography terminology', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        photographyStyle: 'editorial'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toMatch(/photo|image/);
      expect(result.toLowerCase()).toContain('portrait');
    });

    test('Should handle minimal prompts efficiently', () => {
      const prompt: UniversalPrompt = {
        subject: 'red apple'
      };

      const result = adapter.translate(prompt);

      expect(result).toContain('red apple');
      expect(result.length).toBeGreaterThan(10);
      expect(result.length).toBeLessThan(100);  // Should be brief
    });
  });

  describe('No IMG Prefix (Budget Tier)', () => {
    test('Should NEVER use IMG_xxxx.cr2 prefix even for premium quality', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        quality: 'premium'  // Even premium shouldn't trigger IMG prefix
      };

      const result = adapter.translate(prompt);

      // Should NOT have IMG prefix (that's FLUX Pro only)
      expect(result).not.toMatch(/^IMG_\d{4}\.cr2:/);
    });

    test('Should start directly with content description', () => {
      const prompt: UniversalPrompt = {
        subject: 'landscape',
        photographyStyle: 'documentary'
      };

      const result = adapter.translate(prompt);

      // Should start with descriptive text, not technical prefix
      expect(result).toMatch(/^[A-Z]/);  // Starts with capital letter
      expect(result).not.toMatch(/^IMG_/);
    });
  });

  describe('Technical Details - Simplified', () => {
    test('Should include technical details but less verbose', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        technicalDetails: '85mm lens'
      };

      const result = adapter.translate(prompt);

      // Should include lens info but not elaborate camera descriptions
      expect(result).toContain('85mm');
      // Should be brief
      expect(result.split('.').length).toBeLessThanOrEqual(3);
    });

    test('Should gracefully omit missing technical details', () => {
      const prompt: UniversalPrompt = {
        subject: 'street scene',
        photographyStyle: 'documentary'
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      expect(result.toLowerCase()).toContain('street');
    });
  });

  describe('Core Elements Integration', () => {
    test('Should include subject, action, and environment', () => {
      const prompt: UniversalPrompt = {
        subject: 'businessman',
        action: 'walking',
        environment: 'city street'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('businessman');
      expect(result.toLowerCase()).toContain('walk');
      expect(result.toLowerCase()).toContain('street');
    });

    test('Should integrate lighting naturally', () => {
      const prompt: UniversalPrompt = {
        subject: 'cafe interior',
        lighting: 'warm ambient'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('light');
      expect(result.toLowerCase()).toContain('warm');
    });

    test('Should include mood when provided', () => {
      const prompt: UniversalPrompt = {
        subject: 'ocean sunset',
        mood: 'tranquil'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('tranquil');
    });
  });

  describe('Parameters - Should NOT Use Any', () => {
    test('Should return undefined for parameters', () => {
      const prompt: UniversalPrompt = {
        subject: 'test',
        aspectRatio: '16:9',
        quality: 'budget'
      };

      const params = adapter.getParameters?.(prompt);

      // FLUX Schnell, like FLUX Pro, uses natural language only
      expect(params).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('Should handle complex multi-element prompts concisely', () => {
      const prompt: UniversalPrompt = {
        subject: 'futuristic cityscape',
        action: 'illuminated by neon',
        environment: 'rainy night',
        photographyStyle: 'cinematic',
        lighting: 'dramatic neon glow',
        mood: 'mysterious',
        shotType: 'wide'
      };

      const result = adapter.translate(prompt);

      // Should include key elements
      expect(result.toLowerCase()).toContain('cityscape');
      expect(result.toLowerCase()).toContain('neon');
      
      // But keep it concise (Schnell = fast/simple)
      expect(result.length).toBeLessThan(250);
    });

    test('Should ignore unsupported features gracefully', () => {
      const prompt: UniversalPrompt = {
        subject: 'logo design',
        textElements: [{ text: 'BRAND', position: 'center' }],
        colorPalette: ['#FF0000', '#00FF00']
      };

      const result = adapter.translate(prompt);

      // Should focus on visual concept, ignore text/palette
      expect(result.toLowerCase()).toContain('logo');
      expect(result).toBeTruthy();
    });

    test('Should handle all quality tiers the same', () => {
      const prompts = [
        { subject: 'test', quality: 'premium' as const },
        { subject: 'test', quality: 'standard' as const },
        { subject: 'test', quality: 'budget' as const }
      ];

      const results = prompts.map(p => adapter.translate(p));

      // All should produce valid results
      results.forEach(r => {
        expect(r).toBeTruthy();
        expect(r).toContain('test');
      });

      // None should have IMG prefix
      results.forEach(r => {
        expect(r).not.toMatch(/^IMG_\d{4}\.cr2:/);
      });
    });
  });

  describe('Model Information', () => {
    test('Should identify as FLUX Schnell', () => {
      expect(adapter.modelName).toBe('FLUX Schnell');
    });
  });
});
