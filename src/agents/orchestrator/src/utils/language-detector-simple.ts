/**
 * Language Detector - Simplified (IT + EN Only)
 * 
 * MVP version for AIDA supporting only Italian and English.
 * 
 * Detection strategy:
 * 1. Check first 3 words for language indicators
 * 2. If ambiguous, default to Italian
 * 3. Simple, fast, predictable
 */

export type Language = 'it' | 'en';

// English indicators (common phrases/words in first 3 words)
const ENGLISH_INDICATORS = [
  'i want',
  'i need',
  'can you',
  'please',
  'create a',
  'make a',
  'generate a',
  'how',
  'what',
  'where',
  'when',
  'why',
  'hello',
  'hi ',
  'good morning',
  'good afternoon'
];

/**
 * Detect language from message
 * 
 * Analyzes first 3 words for language indicators.
 * Defaults to Italian if ambiguous (Italian is primary language).
 * 
 * @param message - User message
 * @returns Detected language ('it' or 'en')
 */
export function detectLanguage(message: string): Language {
  // Handle empty/very short messages
  if (!message || message.trim().length < 2) {
    return 'it'; // Default to Italian
  }

  // Normalize: lowercase and trim
  const normalized = message.toLowerCase().trim();

  // Extract first 3 words
  const words = normalized.split(/\s+/).slice(0, 3);
  const firstWords = words.join(' ');

  // Check for English indicators
  const isEnglish = ENGLISH_INDICATORS.some(indicator => 
    firstWords.includes(indicator)
  );

  if (isEnglish) {
    return 'en';
  }

  // Default to Italian
  // Rationale: AIDA is primarily Italian, most users are Italian speakers
  return 'it';
}

/**
 * Detect language with confidence score
 * 
 * @param message - User message
 * @returns Object with language and confidence (0-1)
 */
export function detectLanguageWithConfidence(
  message: string
): { language: Language; confidence: number } {
  const language = detectLanguage(message);
  
  // Simple confidence: 0.9 if indicators found, 0.6 if default
  const normalized = message.toLowerCase().trim();
  const words = normalized.split(/\s+/).slice(0, 3);
  const firstWords = words.join(' ');
  
  const hasIndicator = ENGLISH_INDICATORS.some(indicator => 
    firstWords.includes(indicator)
  );
  
  const confidence = hasIndicator ? 0.9 : 0.6;
  
  return { language, confidence };
}

/**
 * Get language name in native format
 * 
 * @param lang - Language code
 * @returns Language name
 */
export function getLanguageName(lang: Language): string {
  return lang === 'it' ? 'Italiano' : 'English';
}
