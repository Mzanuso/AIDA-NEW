/**
 * Language Detector Tests - Simplified (IT + EN Only)
 * 
 * MVP version supports only Italian and English.
 * Detection based on first 3 words + common indicators.
 */

import { describe, it, expect } from 'vitest';
import { detectLanguage, Language } from '../src/utils/language-detector-simple';

describe('Language Detector (IT+EN Only)', () => {
  describe('Italian Detection', () => {
    it('should detect Italian from common greetings', () => {
      expect(detectLanguage('ciao come stai?')).toBe('it');
      expect(detectLanguage('buongiorno')).toBe('it');
    });

    it('should detect Italian from common verbs', () => {
      expect(detectLanguage('voglio creare un\'immagine')).toBe('it');
      expect(detectLanguage('posso fare un video?')).toBe('it');
      expect(detectLanguage('vorrei generare qualcosa')).toBe('it');
    });

    it('should detect Italian from question words', () => {
      expect(detectLanguage('come funziona?')).toBe('it');
      expect(detectLanguage('dove trovo la gallery?')).toBe('it');
      expect(detectLanguage('quando sarà pronto?')).toBe('it');
    });

    it('should detect Italian from special characters', () => {
      expect(detectLanguage('perché non funziona?')).toBe('it');
      expect(detectLanguage('è molto bello')).toBe('it');
      expect(detectLanguage('più veloce')).toBe('it');
    });
  });

  describe('English Detection', () => {
    it('should detect English from common phrases', () => {
      expect(detectLanguage('i want to create')).toBe('en');
      expect(detectLanguage('i need help')).toBe('en');
      expect(detectLanguage('can you make')).toBe('en');
    });

    it('should detect English from question words', () => {
      expect(detectLanguage('how does it work?')).toBe('en');
      expect(detectLanguage('where is the gallery?')).toBe('en');
      expect(detectLanguage('what can i do?')).toBe('en');
    });

    it('should detect English from common greetings', () => {
      expect(detectLanguage('hello there')).toBe('en');
      expect(detectLanguage('hi, how are you?')).toBe('en');
      expect(detectLanguage('good morning')).toBe('en');
    });

    it('should detect English from action verbs', () => {
      expect(detectLanguage('create an image')).toBe('en');
      expect(detectLanguage('make a video')).toBe('en');
      expect(detectLanguage('generate something')).toBe('en');
    });
  });

  describe('Default Behavior', () => {
    it('should default to Italian for very short messages', () => {
      expect(detectLanguage('ok')).toBe('it');
      expect(detectLanguage('si')).toBe('it');
    });

    it('should default to Italian for ambiguous text', () => {
      expect(detectLanguage('123 test')).toBe('it');
      expect(detectLanguage('😀')).toBe('it');
    });

    it('should default to Italian for empty string', () => {
      expect(detectLanguage('')).toBe('it');
    });
  });

  describe('Case Insensitivity', () => {
    it('should detect language regardless of case', () => {
      expect(detectLanguage('I WANT TO CREATE')).toBe('en');
      expect(detectLanguage('VOGLIO CREARE')).toBe('it');
      expect(detectLanguage('Hello World')).toBe('en');
      expect(detectLanguage('Ciao Mondo')).toBe('it');
    });
  });

  describe('First Three Words Priority', () => {
    it('should prioritize first 3 words for detection', () => {
      expect(detectLanguage('i want to creare qualcosa')).toBe('en');
      expect(detectLanguage('voglio fare something please')).toBe('it');
    });

    it('should handle mixed language with English start', () => {
      expect(detectLanguage('please create un\'immagine bella')).toBe('en');
    });

    it('should handle mixed language with Italian start', () => {
      expect(detectLanguage('crea una image please')).toBe('it');
    });
  });
});
