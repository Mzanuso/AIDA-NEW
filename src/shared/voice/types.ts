export interface VoiceSynthesisOptions {
  voiceSample?: string;
  useCloning?: boolean;
  language?: string;
  speed?: number;
  pitch?: number;
}

export interface VoiceSynthesisResult {
  audioUrl: string;
  provider: 'xtts' | 'fal';
  duration?: number;
  metadata?: Record<string, any>;
}

export interface VoiceProvider {
  synthesize(text: string, options?: VoiceSynthesisOptions): Promise<VoiceSynthesisResult>;
  isAvailable(): Promise<boolean>;
}
