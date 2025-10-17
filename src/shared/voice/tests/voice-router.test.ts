import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VoiceRouter } from '../voice-router';

describe('Voice Router System', () => {
  let router: VoiceRouter;

  beforeEach(() => {
    router = new VoiceRouter();
  });

  it('should route short text to XTTS', async () => {
    const shortText = 'Hello world';
    const result = await router.synthesize(shortText);

    expect(result.provider).toBe('xtts');
    expect(result.audioUrl).toBeDefined();
  });

  it('should route long text to FAL.AI', async () => {
    const longText = 'A'.repeat(1000); // Long text
    const result = await router.synthesize(longText);

    expect(result.provider).toBe('fal');
    expect(result.audioUrl).toBeDefined();
  });

  it('should handle voice cloning with XTTS', async () => {
    const text = 'Clone my voice';
    const result = await router.synthesize(text, {
      voiceSample: 'http://example.com/voice.wav',
      useCloning: true
    });

    expect(result.provider).toBe('xtts');
    expect(result.metadata?.cloned).toBe(true);
  });

  it('should support multiple languages', async () => {
    const text = 'Bonjour le monde';
    const result = await router.synthesize(text, {
      language: 'fr'
    });

    expect(result.audioUrl).toBeDefined();
    expect(result.metadata?.language).toBe('fr');
  });
});
