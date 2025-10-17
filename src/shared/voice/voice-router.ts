import type { VoiceSynthesisOptions, VoiceSynthesisResult } from './types';
import { VOICE_CONFIG } from './config';

export class VoiceRouter {
  private useMock: boolean;
  private mockStorage: Map<string, VoiceSynthesisResult> = new Map();

  constructor() {
    this.useMock = process.env.NODE_ENV === 'test' || process.env.VOICE_USE_MOCK === 'true';
  }

  async synthesize(text: string, options?: VoiceSynthesisOptions): Promise<VoiceSynthesisResult> {
    if (this.useMock) {
      return this.mockSynthesize(text, options);
    }

    // Route based on text length
    const provider = this.selectProvider(text, options);

    if (provider === 'xtts') {
      return this.synthesizeWithXTTS(text, options);
    } else {
      return this.synthesizeWithFAL(text, options);
    }
  }

  private selectProvider(text: string, options?: VoiceSynthesisOptions): 'xtts' | 'fal' {
    // Use XTTS for short text or voice cloning
    if (text.length < VOICE_CONFIG.router.shortTextThreshold || options?.useCloning) {
      return 'xtts';
    }

    // Use FAL.AI for longer text
    return 'fal';
  }

  private async synthesizeWithXTTS(text: string, options?: VoiceSynthesisOptions): Promise<VoiceSynthesisResult> {
    // Real XTTS implementation would go here
    return {
      audioUrl: 'http://example.com/xtts-audio.wav',
      provider: 'xtts',
      metadata: {
        cloned: options?.useCloning || false,
        language: options?.language || 'en'
      }
    };
  }

  private async synthesizeWithFAL(text: string, options?: VoiceSynthesisOptions): Promise<VoiceSynthesisResult> {
    // Real FAL.AI implementation would go here
    return {
      audioUrl: 'http://example.com/fal-audio.wav',
      provider: 'fal',
      metadata: {
        language: options?.language || 'en'
      }
    };
  }

  private mockSynthesize(text: string, options?: VoiceSynthesisOptions): VoiceSynthesisResult {
    const provider = this.selectProvider(text, options);

    return {
      audioUrl: `mock://audio/${Date.now()}.wav`,
      provider,
      metadata: {
        cloned: options?.useCloning || false,
        language: options?.language || 'en',
        textLength: text.length
      }
    };
  }
}
