/**
 * Image Flow Service Tests
 * 
 * Tests for menu-driven image generation flow.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ImageFlowService } from '../src/services/image-flow.service';
import { Language } from '../src/utils/language-detector-simple';

describe('ImageFlowService', () => {
  let service: ImageFlowService;

  beforeEach(() => {
    service = new ImageFlowService();
  });

  describe('Start Image Request', () => {
    it('should show initial menu in Italian', () => {
      const result = service.startImageRequest('it');
      
      expect(result.state).toBe('AWAITING_METHOD_CHOICE');
      expect(result.message).toContain('📸');
      expect(result.message).toContain('✍️');
      expect(result.message).toContain('gallery');
    });

    it('should show initial menu in English', () => {
      const result = service.startImageRequest('en');
      
      expect(result.state).toBe('AWAITING_METHOD_CHOICE');
      expect(result.message).toContain('📸');
      expect(result.message).toContain('gallery');
    });

    it('should transition from NEW_IMAGE_REQUEST', () => {
      const result = service.startImageRequest('it');
      
      expect(result.previousState).toBe('NEW_IMAGE_REQUEST');
      expect(result.state).toBe('AWAITING_METHOD_CHOICE');
    });
  });

  describe('Handle User Choice', () => {
    beforeEach(() => {
      service.startImageRequest('it');
    });

    it('should handle gallery choice', () => {
      const result = service.handleMethodChoice('gallery', 'it');
      
      expect(result.state).toBe('AWAITING_STYLE_SELECTION');
      expect(result.action).toBe('show_gallery');
    });

    it('should handle manual description choice', () => {
      const result = service.handleMethodChoice('manual', 'it');
      
      expect(result.state).toBe('AWAITING_DESCRIPTION');
      expect(result.message).toContain('dettagli');
    });

    it('should reject invalid choice', () => {
      expect(() => {
        service.handleMethodChoice('invalid' as any, 'it');
      }).toThrow();
    });
  });

  describe('Handle Gallery Selection', () => {
    beforeEach(() => {
      service.startImageRequest('it');
      service.handleMethodChoice('gallery', 'it');
    });

    it('should process gallery selection', () => {
      const result = service.handleGallerySelection(['sref_001'], 'it');
      
      expect(result.state).toBe('GATHERING_DETAILS');
      expect(result.gallerySelections).toBeDefined();
      expect(result.gallerySelections?.[0].id).toBe('sref_001');
      expect(result.gallerySelections?.[0].requires_artistic_model).toBe(true);
    });

    it('should handle multiple selections', () => {
      const result = service.handleGallerySelection(['sref_001', 'sref_002'], 'it');
      
      expect(result.gallerySelections?.length).toBe(2);
    });
  });

  describe('Handle Manual Description', () => {
    beforeEach(() => {
      service.startImageRequest('it');
      service.handleMethodChoice('manual', 'it');
    });

    it('should process description', () => {
      const result = service.handleDescription('un gatto nero su sfondo bianco', 'it');
      
      expect(result.state).toBe('GENERATING');
      expect(result.description).toBe('un gatto nero su sfondo bianco');
    });

    it('should not have artistic model flag for manual', () => {
      const result = service.handleDescription('test description', 'it');
      
      expect(result.gallerySelections).toBeUndefined();
    });
  });

  describe('State Management', () => {
    it('should track state history', () => {
      service.startImageRequest('it');
      service.handleMethodChoice('gallery', 'it');
      
      const state = service.getCurrentState();
      expect(state.previousState).toBe('AWAITING_METHOD_CHOICE');
    });

    it('should prevent invalid transitions', () => {
      service.startImageRequest('it');
      
      // Can't go directly to GENERATING without choice
      expect(() => {
        service.transitionTo('GENERATING');
      }).toThrow();
    });
  });

  describe('Reset Flow', () => {
    it('should reset to initial state', () => {
      service.startImageRequest('it');
      service.handleMethodChoice('gallery', 'it');
      
      service.reset();
      
      const state = service.getCurrentState();
      expect(state.state).toBe('NEW_IMAGE_REQUEST');
    });
  });
});
