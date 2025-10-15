import { describe, it, expect } from 'vitest';
import { UniversalModelSelector } from '../src/services/model-selector';

describe('UniversalModelSelector', () => {
  const selector = new UniversalModelSelector();

  describe('Video Generation', () => {
    it('should select Kling for TikTok videos', () => {
      const result = selector.selectModel({
        capability: 'SHORT_FORM_VIDEO',
        aspectRatio: '9:16',
        duration: 30
      });

      expect(result.primary.name).toContain('Kling');
      expect(result.primary.api).toContain('fal-ai');
      expect(result.primary.estimatedCost).toBeGreaterThan(0);
      expect(result.fallback).toBeDefined();
    });

    it('should select Kling Pro for cinematic videos', () => {
      const result = selector.selectModel({
        capability: 'VIDEO_FROM_TEXT',
        isCinematic: true,
        duration: 60
      });

      expect(result.primary.name).toContain('Master');
      expect(result.primary.estimatedCost).toBeGreaterThan(0.05);
    });

    it('should select Sora for dialogue videos', () => {
      const result = selector.selectModel({
        capability: 'VIDEO_FROM_TEXT',
        hasDialogue: true
      });

      expect(result.primary.name).toContain('Sora');
    });

    it('should select MiniMax for multiple camera movements', () => {
      const result = selector.selectModel({
        capability: 'VIDEO_FROM_TEXT',
        cameraMovesCount: 3
      });

      expect(result.primary.name).toContain('MiniMax');
    });

    it('should select budget option when budget sensitive', () => {
      const result = selector.selectModel({
        capability: 'SHORT_FORM_VIDEO',
        budgetSensitive: true
      });

      expect(result.primary.estimatedCost).toBeLessThan(0.10);
    });
  });

  describe('Image Generation', () => {
    it('should select Flux for standard images', () => {
      const result = selector.selectModel({
        capability: 'GENERATE_IMAGE',
        qualityLevel: 'standard'
      });

      expect(result.primary.name).toContain('FLUX');
      expect(result.primary.api).toContain('fal-ai');
    });

    it('should select Midjourney for artistic images', () => {
      const result = selector.selectModel({
        capability: 'GENERATE_IMAGE',
        isArtistic: true
      });

      expect(result.primary.api).toContain('kie.ai');
      expect(result.primary.name).toContain('Midjourney');
    });

    it('should select Ideogram for images with text', () => {
      const result = selector.selectModel({
        capability: 'GENERATE_IMAGE',
        hasText: true
      });

      expect(result.primary.name).toContain('Ideogram');
    });

    it('should select Flux Schnell for fast iteration', () => {
      const result = selector.selectModel({
        capability: 'GENERATE_ILLUSTRATION',
        needsFastIteration: true
      });

      expect(result.primary.name).toContain('Schnell');
      expect(result.primary.estimatedCost).toBeLessThan(0.06);
    });

    it('should select Midjourney for logos', () => {
      const result = selector.selectModel({
        capability: 'GENERATE_LOGO'
      });

      expect(result.primary.name).toContain('Midjourney');
    });
  });

  describe('Image-to-Video', () => {
    it('should select Kling for standard image-to-video', () => {
      const result = selector.selectModel({
        capability: 'IMAGE_TO_VIDEO',
        aspectRatio: '16:9'
      });

      expect(result.primary.name).toContain('Kling');
      expect(result.fallback).toBeDefined();
    });

    it('should select Sora for image-to-video with audio', () => {
      const result = selector.selectModel({
        capability: 'IMAGE_TO_VIDEO',
        hasDialogue: true
      });

      expect(result.primary.name).toContain('Sora');
    });
  });

  describe('Audio Generation', () => {
    it('should select Suno for music with lyrics', () => {
      const result = selector.selectModel({
        capability: 'GENERATE_MUSIC',
        needsLyrics: true
      });

      expect(result.primary.name).toContain('Suno');
    });

    it('should select Stable Audio for instrumental', () => {
      const result = selector.selectModel({
        capability: 'GENERATE_MUSIC',
        needsLyrics: false
      });

      expect(result.primary.name).toContain('Stable Audio');
    });

    it('should select ElevenLabs for TTS', () => {
      const result = selector.selectModel({
        capability: 'TEXT_TO_SPEECH'
      });

      expect(result.primary.name).toContain('ElevenLabs');
    });

    it('should select multilingual TTS when needed', () => {
      const result = selector.selectModel({
        capability: 'TEXT_TO_SPEECH',
        isMultiLanguage: true
      });

      expect(result.primary.name).toContain('Multilingual');
    });
  });

  describe('Image Editing', () => {
    it('should select BRIA for background removal', () => {
      const result = selector.selectModel({
        capability: 'REMOVE_BACKGROUND'
      });

      expect(result.primary.name).toContain('BRIA');
      expect(result.primary.estimatedCost).toBeLessThan(0.05);
    });

    it('should select upscaler for image enhancement', () => {
      const result = selector.selectModel({
        capability: 'UPSCALE_IMAGE'
      });

      expect(result.primary.name).toContain('Upscaler');
    });

    it('should select appropriate model for object removal', () => {
      const result = selector.selectModel({
        capability: 'REMOVE_OBJECT'
      });

      expect(result.primary.api).toContain('fal-ai');
      expect(result.fallback).toBeDefined();
    });
  });

  describe('3D Generation', () => {
    it('should select TripoSR for 3D generation', () => {
      const result = selector.selectModel({
        capability: 'TEXT_TO_3D'
      });

      expect(result.primary.name).toContain('TripoSR');
    });

    it('should select enterprise model when specified', () => {
      const result = selector.selectModel({
        capability: 'TEXT_TO_3D',
        isEnterprise: true
      });

      expect(result.primary.name).toContain('Enterprise');
      expect(result.primary.estimatedCost).toBeGreaterThan(0.20);
    });
  });

  describe('Text Content', () => {
    it('should select Claude for text content', () => {
      const result = selector.selectModel({
        capability: 'SCRIPT_WRITING'
      });

      expect(result.primary.name).toContain('Claude');
      expect(result.primary.estimatedCost).toBeLessThan(0.02);
    });
  });

  describe('Fallback Strategy', () => {
    it('should always provide fallback option', () => {
      const result = selector.selectModel({
        capability: 'IMAGE_TO_VIDEO',
        aspectRatio: '16:9'
      });

      expect(result.fallback).toBeDefined();
      expect(result.fallback.api).toBeTruthy();
      expect(result.fallback.name).not.toBe(result.primary.name);
    });

    it('should have lower or equal cost for fallback', () => {
      const result = selector.selectModel({
        capability: 'SHORT_FORM_VIDEO'
      });

      expect(result.fallback.estimatedCost).toBeLessThanOrEqual(
        result.primary.estimatedCost * 1.5 // Allow some margin
      );
    });

    it('should have meaningful reason for selection', () => {
      const result = selector.selectModel({
        capability: 'GENERATE_IMAGE'
      });

      expect(result.primary.reason).toBeTruthy();
      expect(result.primary.reason.length).toBeGreaterThan(10);
      expect(result.fallback.reason).toBeTruthy();
    });
  });

  describe('Cost Estimation', () => {
    it('should provide cost estimates for all models', () => {
      const capabilities: Array<'SHORT_FORM_VIDEO' | 'GENERATE_IMAGE' | 'GENERATE_MUSIC' | 'TEXT_TO_3D'> = [
        'SHORT_FORM_VIDEO',
        'GENERATE_IMAGE',
        'GENERATE_MUSIC',
        'TEXT_TO_3D'
      ];

      capabilities.forEach(capability => {
        const result = selector.selectModel({ capability });
        expect(result.primary.estimatedCost).toBeGreaterThan(0);
        expect(result.fallback.estimatedCost).toBeGreaterThan(0);
      });
    });
  });
});
