/**
 * Command Preprocessor Tests
 * 
 * Tests for gallery command detection with exact matching.
 * Commands should ALWAYS be recognized, overriding any other logic.
 */

import { describe, it, expect } from 'vitest';
import { CommandPreprocessor, CommandType } from '../src/middleware/command-preprocessor';

describe('CommandPreprocessor', () => {
  const preprocessor = new CommandPreprocessor();

  describe('Gallery Commands - Italian', () => {
    it('should detect /gallery command', () => {
      const result = preprocessor.detectCommand('/gallery');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });

    it('should detect /stili command', () => {
      const result = preprocessor.detectCommand('/stili');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });

    it('should detect "mostra gallery" phrase', () => {
      const result = preprocessor.detectCommand('mostra gallery');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });

    it('should detect "mostra stili" phrase', () => {
      const result = preprocessor.detectCommand('mostra stili');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });

    it('should detect "apri galleria" phrase', () => {
      const result = preprocessor.detectCommand('apri galleria');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });
  });

  describe('Gallery Commands - English', () => {
    it('should detect /styles command', () => {
      const result = preprocessor.detectCommand('/styles');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });

    it('should detect "show gallery" phrase', () => {
      const result = preprocessor.detectCommand('show gallery');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });

    it('should detect "show styles" phrase', () => {
      const result = preprocessor.detectCommand('show styles');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });

    it('should detect "open gallery" phrase', () => {
      const result = preprocessor.detectCommand('open gallery');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });
  });

  describe('Case Insensitivity', () => {
    it('should detect commands in uppercase', () => {
      const result = preprocessor.detectCommand('/GALLERY');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });

    it('should detect phrases in mixed case', () => {
      const result = preprocessor.detectCommand('Mostra Gallery');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });
  });

  describe('Non-Commands', () => {
    it('should NOT detect partial matches', () => {
      const result = preprocessor.detectCommand('voglio vedere la gallery');
      expect(result.isCommand).toBe(false);
    });

    it('should NOT detect similar words', () => {
      const result = preprocessor.detectCommand('galleria fotografica');
      expect(result.isCommand).toBe(false);
    });

    it('should NOT detect empty string', () => {
      const result = preprocessor.detectCommand('');
      expect(result.isCommand).toBe(false);
    });

    it('should NOT detect unrelated text', () => {
      const result = preprocessor.detectCommand('crea un\'immagine');
      expect(result.isCommand).toBe(false);
    });
  });

  describe('Whitespace Handling', () => {
    it('should trim whitespace before detection', () => {
      const result = preprocessor.detectCommand('  /gallery  ');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });

    it('should handle extra spaces in phrases', () => {
      const result = preprocessor.detectCommand('mostra  gallery');
      expect(result.isCommand).toBe(true);
      expect(result.commandType).toBe('GALLERY');
    });
  });

  describe('Command Metadata', () => {
    it('should return original message', () => {
      const message = '/gallery';
      const result = preprocessor.detectCommand(message);
      expect(result.originalMessage).toBe(message);
    });

    it('should return normalized command for gallery', () => {
      const result = preprocessor.detectCommand('/stili');
      expect(result.normalizedCommand).toBe('show_gallery');
    });
  });
});
