/**
 * FLUX Pro 1.1 Ultra Adapter
 * 
 * Translates universal prompts to FLUX Pro format following best practices:
 * - Natural language descriptions (complete sentences, prose format)
 * - Camera settings explicit and integrated into prose
 * - IMG_xxxx.cr2 trick for photorealism boost (premium only)
 * - Mood and lighting in narrative form
 * - Layering: Concept → Style → Technical → Mood
 * 
 * Unlike Midjourney, FLUX uses NO parameters - everything is natural language.
 * 
 * @module visual-creator/adapters/flux-pro
 */

import { PromptAdapter, UniversalPrompt } from '../prompt-adapter.interface';

export class FluxProAdapter implements PromptAdapter {
  readonly modelName = 'FLUX Pro 1.1 Ultra';

  /**
   * Translate universal prompt to FLUX Pro natural language format
   * Creates flowing prose rather than comma-separated keywords
   */
  translate(prompt: UniversalPrompt): string {
    const sentences: string[] = [];

    // IMG_xxxx.cr2 prefix for premium photorealism boost
    const prefix = prompt.quality === 'premium' ? this.generateImgPrefix() : '';

    // Layer 1: Concept - Photography style + shot type + subject + action
    const conceptParts: string[] = [];
    
    if (prompt.photographyStyle) {
      conceptParts.push(`${this.capitalize(prompt.photographyStyle)} photograph`);
    } else {
      conceptParts.push('Photograph');
    }

    if (prompt.shotType) {
      conceptParts.push(`${prompt.shotType} shot`);
    }

    conceptParts.push(`of ${prompt.subject}`);

    if (prompt.action) {
      conceptParts.push(prompt.action);
    }

    if (prompt.environment) {
      conceptParts.push(`in ${prompt.environment}`);
    }

    sentences.push(conceptParts.join(' ') + '.');

    // Layer 2: Lighting and Mood
    const atmosphereParts: string[] = [];

    if (prompt.lighting) {
      atmosphereParts.push(`The scene is lit with ${prompt.lighting} lighting`);
    }

    if (prompt.mood) {
      if (atmosphereParts.length > 0) {
        atmosphereParts.push(`creating a ${prompt.mood} mood`);
      } else {
        atmosphereParts.push(`The atmosphere is ${prompt.mood}`);
      }
    }

    if (atmosphereParts.length > 0) {
      sentences.push(atmosphereParts.join(', ') + '.');
    }

    // Layer 3: Technical details (camera settings)
    if (prompt.technicalDetails) {
      sentences.push(`Shot with DSLR camera, ${prompt.technicalDetails}.`);
    }

    // Combine with optional IMG prefix
    const finalPrompt = sentences.join(' ');
    return prefix ? `${prefix} ${finalPrompt}` : finalPrompt;
  }

  /**
   * FLUX Pro doesn't use parameters - everything is natural language
   * Returns undefined to indicate no parameters needed
   */
  getParameters(): undefined {
    return undefined;
  }

  /**
   * Generate IMG_xxxx.cr2 prefix for photorealism boost
   * Uses random 4-digit number for variety
   */
  private generateImgPrefix(): string {
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `IMG_${randomNum}.cr2:`;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
