# Voice Router System

Intelligent voice synthesis routing between XTTS and FAL.AI providers.

## Features
- Automatic provider selection based on text length
- Voice cloning support (XTTS)
- Multi-language synthesis
- Mock mode for testing
- Fallback provider support

## Usage
```typescript
import { VoiceRouter } from '@/shared/voice/voice-router';

const router = new VoiceRouter();

// Short text → XTTS
const result = await router.synthesize('Hello world');

// Long text → FAL.AI
const result = await router.synthesize('A'.repeat(1000));

// Voice cloning → XTTS
const result = await router.synthesize('Clone my voice', {
  voiceSample: 'http://example.com/voice.wav',
  useCloning: true
});

// Multi-language
const result = await router.synthesize('Bonjour', {
  language: 'fr'
});
```

## Providers

### XTTS (Primary for short text & cloning)
- Best for: Short text < 500 chars, voice cloning
- Fast inference
- Voice cloning capability

### FAL.AI (Primary for long text)
- Best for: Long text > 500 chars
- Cloud-based
- High quality

## Environment Variables
```bash
XTTS_ENABLED=true                  # Enable XTTS provider
FAL_API_KEY=your-key-here          # FAL.AI API key
VOICE_PROVIDER=xtts                # Preferred provider
VOICE_USE_MOCK=true                # Use mock mode for testing
NODE_ENV=test                      # Auto-enables mock mode
```

## Mock Mode
In test environment or when `VOICE_USE_MOCK=true`, the system uses mock synthesis instead of real providers.
