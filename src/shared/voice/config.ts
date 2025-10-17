export const VOICE_CONFIG = {
  xtts: {
    enabled: process.env.XTTS_ENABLED !== 'false',
    maxTextLength: 500, // Characters
  },
  fal: {
    apiKey: process.env.FAL_API_KEY || '',
    enabled: !!process.env.FAL_API_KEY,
  },
  router: {
    preferredProvider: process.env.VOICE_PROVIDER || 'xtts',
    shortTextThreshold: 500, // Use XTTS for short text
  }
};
