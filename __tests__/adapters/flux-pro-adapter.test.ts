/**
 * FLUX Pro 1.1 Ultra Adapter Tests
 * 
 * Tests for FluxProAdapter following researched best practices:
 * - Natural language descriptions (complete sentences)
 * - Camera settings explicit: "DSLR camera, 85mm lens, f/2.8"
 * - IMG_xxxx.cr2 trick for photorealism boost
 * - Mood and lighting in prose form
 * - Layering: Concept → Style → Technical → Mood
 * 
 * NO parameters (unlike Midjourney) - everything in natural language
 */

import { FluxProAdapter } from '../../src/agents/visual-creator/adapters/flux-pro-adapter';
import { UniversalPrompt } from '../../src/agents/visual-creator/prompt-adapter.interface';

describe('FluxProAdapter', () => {
  let adapter: FluxProAdapter;

  beforeEach(() => {
    adapter = new FluxProAdapter();
  });

  describe('Natural Language Translation', () => {
    test('Should create complete prose sentences (not comma-separated)', () => {
      const prompt: UniversalPrompt = {
        subject: 'confident businesswoman',
        action: 'standing',
        environment: 'urban rooftop',
        lighting: 'golden hour',
        mood: 'inspiring',
        photographyStyle: 'editorial'
      };

      const result = adapter.translate(prompt);

      // Should be prose, not comma-separated
      expect(result).toContain('.');  // Has sentence structure
      expect(result.split('.').length).toBeGreaterThan(1);  // Multiple sentences
      
      // Should include all elements in natural language
      expect(result.toLowerCase()).toContain('businesswoman');
      expect(result.toLowerCase()).toContain('rooftop');
      expect(result.toLowerCase()).toContain('golden hour');
    });

    test('Should use photography terminology in prose', () => {
      const prompt: UniversalPrompt = {
        subject: 'vintage car',
        photographyStyle: 'editorial',
        shotType: 'wide'
      };

      const result = adapter.translate(prompt);

      // Should say "editorial photograph" or similar, not just "editorial"
      expect(result.toLowerCase()).toMatch(/photograph|photo|image/);
      expect(result.toLowerCase()).toContain('editorial');
    });
  });

  describe('Camera Technical Details', () => {
    test('Should integrate camera settings into prose', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        technicalDetails: '85mm lens, f/1.4, shallow depth of field'
      };

      const result = adapter.translate(prompt);

      // Technical details should be in prose (e.g., "Shot with...")
      expect(result).toContain('85mm');
      expect(result.toLowerCase()).toMatch(/shot with|using|camera/);
    });

    test('Should add DSLR camera context when technical details present', () => {
      const prompt: UniversalPrompt = {
        subject: 'landscape',
        technicalDetails: '24mm wide angle'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('camera');
    });

    test('Should handle missing technical details gracefully', () => {
      const prompt: UniversalPrompt = {
        subject: 'simple scene'
      };

      const result = adapter.translate(prompt);

      // Should still produce valid prose
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe('IMG_xxxx.cr2 Photorealism Boost', () => {
    test('Should add IMG_xxxx.cr2 prefix for premium quality', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        quality: 'premium',
        photographyStyle: 'editorial'
      };

      const result = adapter.translate(prompt);

      // Should start with IMG_xxxx.cr2 pattern for photorealism
      expect(result).toMatch(/^IMG_\d{4}\.cr2:/);
    });

    test('Should NOT add IMG prefix for non-premium quality', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        quality: 'standard'
      };

      const result = adapter.translate(prompt);

      // Should NOT have IMG prefix for standard/budget
      expect(result).not.toMatch(/^IMG_\d{4}\.cr2:/);
    });

    test('Should use random IMG numbers for variety', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        quality: 'premium'
      };

      const results = new Set();
      for (let i = 0; i < 10; i++) {
        const result = adapter.translate(prompt);
        const match = result.match(/^IMG_(\d{4})\.cr2:/);
        if (match) results.add(match[1]);
      }

      // Should generate different numbers (at least some variety)
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('Mood and Atmosphere Integration', () => {
    test('Should integrate mood into prose naturally', () => {
      const prompt: UniversalPrompt = {
        subject: 'sunset landscape',
        mood: 'serene',
        lighting: 'warm evening'
      };

      const result = adapter.translate(prompt);

      // Mood should be in prose context (e.g., "creating a serene mood")
      expect(result.toLowerCase()).toContain('serene');
      expect(result).toMatch(/creating|with|atmosphere|mood/i);
    });

    test('Should describe lighting in natural language', () => {
      const prompt: UniversalPrompt = {
        subject: 'portrait',
        lighting: 'soft studio'
      };

      const result = adapter.translate(prompt);

      expect(result.toLowerCase()).toContain('lighting');
      expect(result.toLowerCase()).toContain('soft');
    });
  });

  describe('Layering: Concept → Style → Technical → Mood', () => {
    test('Should follow logical narrative structure', () => {
      const prompt: UniversalPrompt = {
        subject: 'mountain climber',
        action: 'reaching summit',
        environment: 'snowy peak',
        photographyStyle: 'documentary',
        lighting: 'dramatic sunrise',
        mood: 'triumphant',
        technicalDetails: '24-70mm zoom lens'
      };

      const result = adapter.translate(prompt);

      // Find positions of key elements
      const subjectPos = result.toLowerCase().indexOf('climber');
      const stylePos = result.toLowerCase().indexOf('documentary');
      const techPos = result.toLowerCase().indexOf('lens');
      const moodPos = result.toLowerCase().indexOf('triumphant');

      // Concept (subject) should come early
      expect(subjectPos).toBeLessThan(result.length / 2);
      
      // All elements should be present
      expect(subjectPos).toBeGreaterThan(-1);
      expect(stylePos).toBeGreaterThan(-1);
      expect(techPos).toBeGreaterThan(-1);
      expect(moodPos).toBeGreaterThan(-1);
    });
  });

  describe('Parameters - Should NOT Use Any', () => {
    test('Should return undefined for parameters (FLUX uses natural language only)', () => {
      const prompt: UniversalPrompt = {
        subject: 'test',
        aspectRatio: '16:9',
        quality: 'premium'
      };

      const params = adapter.getParameters?.(prompt);

      // FLUX Pro doesn't use parameters like Midjourney
      expect(params).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('Should handle minimal prompt elegantly', () => {
      const prompt: UniversalPrompt = {
        subject: 'tree'
      };

      const result = adapter.translate(prompt);

      expect(result).toBeTruthy();
      expect(result).toContain('tree');
      // Should still create complete prose
      expect(result.length).toBeGreaterThan(15);
    });

    test('Should handle complex multi-element prompt', () => {
      const prompt: UniversalPrompt = {
        subject: 'futuristic cityscape',
        action: 'glowing with neon lights',
        environment: 'cyberpunk metropolis at night',
        photographyStyle: 'cinematic',
        lighting: 'dramatic neon and ambient street lights',
        mood: 'mysterious and atmospheric',
        shotType: 'wide',
        technicalDetails: 'ultra wide 14mm lens, long exposure',
        quality: 'premium'
      };

      const result = adapter.translate(prompt);

      // Should integrate all elements smoothly
      expect(result.toLowerCase()).toContain('cityscape');
      expect(result.toLowerCase()).toContain('neon');
      expect(result.toLowerCase()).toContain('cyberpunk');
      expect(result.toLowerCase()).toContain('cinematic');
      expect(result.toLowerCase()).toContain('14mm');
      
      // Should be coherent prose, not fragmented
      expect(result.split('.').length).toBeGreaterThan(1);
    });

    test('Should ignore text elements (not FLUX strength)', () => {
      const prompt: UniversalPrompt = {
        subject: 'poster design',
        textElements: [{ text: 'Hello World', position: 'top' }]
      };

      const result = adapter.translate(prompt);

      // Should not include text rendering (that's Ideogram/Hunyuan)
      expect(result).toContain('poster');
      // Should focus on visual concept, not text
    });
  });

  describe('Model Information', () => {
    test('Should identify as FLUX Pro 1.1 Ultra', () => {
      expect(adapter.modelName).toBe('FLUX Pro 1.1 Ultra');
    });
  });
});