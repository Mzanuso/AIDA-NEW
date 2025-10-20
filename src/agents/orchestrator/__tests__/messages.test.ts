/**
 * Message Templates Tests
 * 
 * Tests for localized message templates (IT + EN).
 */

import { describe, it, expect } from 'vitest';
import { MessageTemplates, getTemplate } from '../src/config/messages';

describe('Message Templates', () => {
  describe('Italian Templates', () => {
    it('should have initial_menu template', () => {
      const template = getTemplate('initial_menu', 'it');
      expect(template).toContain('📸');
      expect(template).toContain('✍️');
      expect(template).toContain('gallery');
    });

    it('should have gallery_proposal template', () => {
      const template = getTemplate('gallery_proposal', 'it');
      expect(template).toContain('stili');
      expect(template).toContain('gallery');
    });

    it('should have generation_started template', () => {
      const template = getTemplate('generation_started', 'it');
      expect(template).toContain('sto');
      expect(template).toContain('generand');
    });

    it('should have generation_complete template', () => {
      const template = getTemplate('generation_complete', 'it');
      expect(template).toContain('pronto');
    });
  });

  describe('English Templates', () => {
    it('should have initial_menu template', () => {
      const template = getTemplate('initial_menu', 'en');
      expect(template).toContain('📸');
      expect(template).toContain('✍️');
      expect(template).toContain('gallery');
    });

    it('should have gallery_proposal template', () => {
      const template = getTemplate('gallery_proposal', 'en');
      expect(template).toContain('styles');
      expect(template).toContain('gallery');
    });

    it('should have generation_started template', () => {
      const template = getTemplate('generation_started', 'en');
      expect(template).toContain('generating');
    });

    it('should have generation_complete template', () => {
      const template = getTemplate('generation_complete', 'en');
      expect(template).toContain('ready');
    });
  });

  describe('Template Variables', () => {
    it('should support variable interpolation', () => {
      const template = getTemplate('generation_started', 'it', {
        description: 'foto prodotto'
      });
      expect(template).toContain('foto prodotto');
    });

    it('should handle missing variables gracefully', () => {
      const template = getTemplate('generation_started', 'it');
      expect(template).toBeDefined();
    });
  });

  describe('Fallback Behavior', () => {
    it('should fallback to Italian for unsupported language', () => {
      const template = getTemplate('initial_menu', 'fr' as any);
      expect(template).toContain('📸');
      // Should be Italian (default)
    });

    it('should return empty string for unknown template', () => {
      const template = getTemplate('unknown_template' as any, 'it');
      expect(template).toBe('');
    });
  });

  describe('Template Consistency', () => {
    const templateKeys: Array<keyof MessageTemplates> = [
      'initial_menu',
      'gallery_proposal',
      'generation_started',
      'generation_complete'
    ];

    it('should have all templates in both languages', () => {
      templateKeys.forEach(key => {
        const itTemplate = getTemplate(key, 'it');
        const enTemplate = getTemplate(key, 'en');
        
        expect(itTemplate).toBeDefined();
        expect(itTemplate.length).toBeGreaterThan(0);
        expect(enTemplate).toBeDefined();
        expect(enTemplate.length).toBeGreaterThan(0);
      });
    });
  });
});
