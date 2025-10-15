/**
 * Language Detection System
 *
 * Detects user language from natural conversation across 5 languages:
 * - Italian (IT) - Primary
 * - English (EN)
 * - Spanish (ES)
 * - French (FR)
 * - German (DE)
 *
 * Uses pattern matching, common word analysis, and special character detection.
 */

import { createLogger } from '@backend/utils/logger';

const logger = createLogger('LanguageDetector');

export type Language = 'it' | 'en' | 'es' | 'fr' | 'de';

interface LanguagePattern {
  language: Language;
  patterns: RegExp[];
  commonWords: string[];
  specialChars: string[];
}

/**
 * Language Detection Result
 */
export interface LanguageDetectionResult {
  language: Language;
  confidence: number; // 0-1
  scores: Record<Language, number>;
}

/**
 * Language Detector
 *
 * Detects language from text using multiple signals
 */
export class LanguageDetector {
  private patterns: LanguagePattern[] = [
    {
      language: 'it',
      patterns: [
        /\b(sono|voglio|posso|fare|creare|grazie|ciao|come|quando|dove|perch[eé]|cosa|molto|tutto|bene|male)\b/i,
        /\b(vorrei|facciamo|dimmi|dammi|fammi|aiutami|perfetto|bello|brutto)\b/i
      ],
      commonWords: [
        'sono', 'voglio', 'posso', 'che', 'come', 'dove', 'quando', 'perché',
        'cosa', 'chi', 'quale', 'quanto', 'molto', 'poco', 'tutto', 'niente',
        'bene', 'male', 'sì', 'no', 'grazie', 'prego', 'scusa', 'ciao'
      ],
      specialChars: ['à', 'è', 'é', 'ì', 'ò', 'ù']
    },
    {
      language: 'en',
      patterns: [
        /\b(am|want|can|make|create|thanks|hello|how|when|where|why|what|very|all|good|bad)\b/i,
        /\b(would|could|should|please|help|nice|great|awesome)\b/i
      ],
      commonWords: [
        'am', 'want', 'can', 'the', 'what', 'where', 'when', 'why',
        'how', 'who', 'which', 'very', 'much', 'all', 'nothing',
        'good', 'bad', 'yes', 'no', 'thanks', 'please', 'sorry', 'hello'
      ],
      specialChars: []
    },
    {
      language: 'es',
      patterns: [
        /\b(soy|quiero|puedo|hacer|crear|gracias|hola|c[oó]mo|cu[aá]ndo|d[oó]nde|por qu[eé]|qu[eé]|muy|todo|bien|mal)\b/i,
        /\b(querr[ií]a|hagamos|dime|dame|ay[uú]dame|perfecto|bonito|feo)\b/i
      ],
      commonWords: [
        'soy', 'quiero', 'puedo', 'que', 'como', 'donde', 'cuando', 'porque',
        'qué', 'quien', 'cual', 'cuanto', 'muy', 'poco', 'todo', 'nada',
        'bien', 'mal', 'sí', 'no', 'gracias', 'por favor', 'perdón', 'hola'
      ],
      specialChars: ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡']
    },
    {
      language: 'fr',
      patterns: [
        /\b(suis|veux|peux|faire|cr[eé]er|merci|bonjour|comment|quand|o[uù]|pourquoi|quoi|tr[eè]s|tout|bien|mal)\b/i,
        /\b(voudrais|faisons|dis(-| )moi|donne(-| )moi|aide(-| )moi|parfait|beau|laid)\b/i
      ],
      commonWords: [
        'suis', 'veux', 'peux', 'que', 'comment', 'où', 'quand', 'pourquoi',
        'quoi', 'qui', 'quel', 'combien', 'très', 'peu', 'tout', 'rien',
        'bien', 'mal', 'oui', 'non', 'merci', 's\'il vous plaît', 'pardon', 'bonjour'
      ],
      specialChars: ['à', 'â', 'é', 'è', 'ê', 'ë', 'ï', 'î', 'ô', 'ù', 'û', 'ü', 'ç', 'œ']
    },
    {
      language: 'de',
      patterns: [
        /\b(bin|will|kann|machen|erstellen|danke|hallo|wie|wann|wo|warum|was|sehr|alles|gut|schlecht)\b/i,
        /\b(w[uü]rde|machen wir|sag mir|gib mir|hilf mir|perfekt|sch[oö]n|h[aä]sslich)\b/i
      ],
      commonWords: [
        'bin', 'will', 'kann', 'das', 'wie', 'wo', 'wann', 'warum',
        'was', 'wer', 'welche', 'viel', 'sehr', 'wenig', 'alles', 'nichts',
        'gut', 'schlecht', 'ja', 'nein', 'danke', 'bitte', 'entschuldigung', 'hallo'
      ],
      specialChars: ['ä', 'ö', 'ü', 'ß']
    }
  ];

  /**
   * Detect language from text
   *
   * @param text - Text to analyze
   * @param previousLanguage - Previous detected language (for context)
   * @returns Detected language with confidence
   */
  detect(text: string, previousLanguage?: Language): LanguageDetectionResult {
    // Handle edge cases
    if (!text || text.trim().length < 3) {
      const fallbackLanguage = previousLanguage || 'it';
      logger.debug('Text too short, using fallback', {
        textLength: text?.length || 0,
        fallback: fallbackLanguage
      });
      return {
        language: fallbackLanguage,
        confidence: 0.5,
        scores: this.getDefaultScores(fallbackLanguage)
      };
    }

    // Calculate scores for each language
    const scores: Record<Language, number> = {
      it: this.calculateScore(text, this.patterns[0]),
      en: this.calculateScore(text, this.patterns[1]),
      es: this.calculateScore(text, this.patterns[2]),
      fr: this.calculateScore(text, this.patterns[3]),
      de: this.calculateScore(text, this.patterns[4])
    };

    // Find language with highest score
    const sortedLanguages = (Object.entries(scores) as [Language, number][])
      .sort((a, b) => b[1] - a[1]);

    const topLanguage = sortedLanguages[0][0];
    const topScore = sortedLanguages[0][1];
    const secondScore = sortedLanguages[1][1];

    // Calculate confidence (difference between top and second)
    const confidence = topScore > 0
      ? Math.min(1.0, topScore / (topScore + secondScore))
      : 0.5;

    // If score is very low and we have previous language, use it
    if (topScore < 3 && previousLanguage) {
      logger.debug('Low confidence, using previous language', {
        detected: topLanguage,
        topScore,
        previous: previousLanguage,
        text: text.substring(0, 50)
      });
      return {
        language: previousLanguage,
        confidence: 0.6,
        scores
      };
    }

    logger.debug('Language detected', {
      language: topLanguage,
      confidence,
      topScore,
      secondScore,
      text: text.substring(0, 50)
    });

    return {
      language: topLanguage,
      confidence,
      scores
    };
  }

  /**
   * Calculate language score for text
   */
  private calculateScore(text: string, pattern: LanguagePattern): number {
    let score = 0;
    const lowerText = text.toLowerCase();

    // Score by regex patterns (weight: 3 points each)
    for (const regex of pattern.patterns) {
      const matches = text.match(regex);
      if (matches) {
        score += matches.length * 3;
      }
    }

    // Score by common words (weight: 2 points each)
    for (const word of pattern.commonWords) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(wordRegex);
      if (matches) {
        score += matches.length * 2;
      }
    }

    // Score by special characters (weight: 1 point each)
    for (const char of pattern.specialChars) {
      const charCount = (text.match(new RegExp(char, 'g')) || []).length;
      score += charCount;
    }

    return score;
  }

  /**
   * Get default scores for fallback
   */
  private getDefaultScores(language: Language): Record<Language, number> {
    const scores: Record<Language, number> = {
      it: 0,
      en: 0,
      es: 0,
      fr: 0,
      de: 0
    };
    scores[language] = 1;
    return scores;
  }

  /**
   * Detect language from conversation history
   *
   * Analyzes multiple messages to get more confident detection
   */
  detectFromHistory(messages: string[], currentMessage: string): LanguageDetectionResult {
    // Weight recent messages more heavily
    const weights = [0.5, 0.3, 0.2]; // Last 3 messages
    const relevantMessages = messages.slice(-3);

    let totalScore: Record<Language, number> = {
      it: 0,
      en: 0,
      es: 0,
      fr: 0,
      de: 0
    };

    // Score historical messages with decreasing weight
    relevantMessages.forEach((msg, index) => {
      const weight = weights[relevantMessages.length - 1 - index] || 0.1;
      const result = this.detect(msg);

      Object.keys(result.scores).forEach(lang => {
        totalScore[lang as Language] += result.scores[lang as Language] * weight;
      });
    });

    // Score current message with highest weight (0.6)
    const currentResult = this.detect(currentMessage);
    Object.keys(currentResult.scores).forEach(lang => {
      totalScore[lang as Language] += currentResult.scores[lang as Language] * 0.6;
    });

    // Find highest score
    const sortedLanguages = (Object.entries(totalScore) as [Language, number][])
      .sort((a, b) => b[1] - a[1]);

    const topLanguage = sortedLanguages[0][0];
    const topScore = sortedLanguages[0][1];
    const secondScore = sortedLanguages[1][1];

    const confidence = topScore > 0
      ? Math.min(1.0, topScore / (topScore + secondScore))
      : 0.5;

    logger.info('Language detected from history', {
      language: topLanguage,
      confidence,
      messagesAnalyzed: relevantMessages.length + 1
    });

    return {
      language: topLanguage,
      confidence,
      scores: totalScore
    };
  }

  /**
   * Check if language changed between messages
   */
  hasLanguageChanged(
    previous: Language,
    current: Language,
    confidence: number
  ): boolean {
    // Only consider it a change if confidence is high enough
    return previous !== current && confidence > 0.7;
  }
}
