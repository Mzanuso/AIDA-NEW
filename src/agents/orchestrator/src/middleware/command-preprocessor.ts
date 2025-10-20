/**
 * Command Preprocessor
 * 
 * Detects and processes explicit commands from user messages.
 * Commands ALWAYS override any other conversation logic.
 * 
 * Design principle: Explicit > Implicit
 * - User types command → Always recognized
 * - No keyword detection ambiguity
 * - Clear, predictable behavior
 */

import { createLogger } from '../../../../../utils/logger';

const logger = createLogger('CommandPreprocessor');

export type CommandType = 'GALLERY' | 'NONE';

export interface CommandDetectionResult {
  isCommand: boolean;
  commandType: CommandType;
  originalMessage: string;
  normalizedCommand?: string;
}

/**
 * Command Preprocessor
 * 
 * Detects explicit commands with exact matching (no fuzzy logic).
 */
export class CommandPreprocessor {
  // Gallery command triggers (exact match, case insensitive)
  private readonly GALLERY_COMMANDS = [
    '/gallery',
    '/stili',
    '/styles'
  ];

  private readonly GALLERY_PHRASES = [
    'mostra gallery',
    'mostra stili',
    'apri galleria',
    'show gallery',
    'show styles',
    'open gallery'
  ];

  /**
   * Detect command from user message
   * 
   * @param message - User message
   * @returns Command detection result
   */
  detectCommand(message: string): CommandDetectionResult {
    // Normalize message
    const normalized = message.trim().toLowerCase();

    // Check if empty
    if (!normalized) {
      return {
        isCommand: false,
        commandType: 'NONE',
        originalMessage: message
      };
    }

    // Check for gallery commands
    if (this.isGalleryCommand(normalized)) {
      logger.info('Gallery command detected', {
        originalMessage: message,
        normalized
      });

      return {
        isCommand: true,
        commandType: 'GALLERY',
        originalMessage: message,
        normalizedCommand: 'show_gallery'
      };
    }

    // No command detected
    return {
      isCommand: false,
      commandType: 'NONE',
      originalMessage: message
    };
  }

  /**
   * Check if message is a gallery command
   */
  private isGalleryCommand(normalized: string): boolean {
    // Exact match for slash commands
    if (this.GALLERY_COMMANDS.includes(normalized)) {
      return true;
    }

    // Exact match for phrases (handle extra spaces)
    const cleanedMessage = normalized.replace(/\s+/g, ' ');
    if (this.GALLERY_PHRASES.includes(cleanedMessage)) {
      return true;
    }

    return false;
  }

  /**
   * Process command and return action
   * 
   * @param result - Detection result
   * @returns Action to take
   */
  getAction(result: CommandDetectionResult): string | null {
    if (!result.isCommand) {
      return null;
    }

    switch (result.commandType) {
      case 'GALLERY':
        return 'show_gallery';
      default:
        return null;
    }
  }
}
