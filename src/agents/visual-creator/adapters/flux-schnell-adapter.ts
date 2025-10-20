/**
 * FLUX Schnell Adapter
 * 
 * Translates universal prompts to FLUX Schnell format - Budget tier FLUX model.
 * 
 * Key characteristics:
 * - Simple, concise natural language
 * - NO IMG_xxxx.cr2 prefix (budget tier, no photorealism boost)
 * - Less verbose than FLUX Pro
 * - Faster generation, lower cost ($0.003 vs $0.055)
 * - Still uses prose format (not parameters)
 * 
 * Best for: Quick iterations, concept testing, high volume generation
 * 
 * @module visual-creator/adapters/flux-schnell
 */

import { PromptAdapter, UniversalPrompt } from '../prompt-adapter.interface';

export class FluxSchnellAdapter implements PromptAdapter {
  readonly modelName = 'FLUX Schnell';

  /**
   * Translate universal prompt to FLUX Schnell format
   * Creates concise natural language (simpler than FLUX Pro)
   */
  translate(prompt: UniversalPrompt): string {
    const parts: string[] = [];

    // Build concise description - Concept focused
    if (prompt.photographyStyle) {
      parts.push(`${this.capitalize(prompt.photographyStyle)} photo of`);
    } else {
      parts.push('Photo of');
    }

    // Subject + action
    parts.push(prompt.subject);
    
    if (prompt.action) {
      parts.push(prompt.action);
    }

    // Environment
    if (prompt.environment) {
      parts.push(`in ${prompt.environment}`);
    }

    // Lighting (brief)
    if (prompt.lighting) {
      parts.push(`with ${prompt.lighting} lighting`);
    }

    // Mood (brief)
    if (prompt.mood) {
      parts.push(`${prompt.mood} atmosphere`);
    }

    // Technical details (minimal, only if provided)
    if (prompt.technicalDetails) {
      parts.push(`${prompt.technicalDetails}`);
    }

    // Join as flowing text, end with period
    return parts.join(', ') + '.';
  }

  /**
   * FLUX Schnell doesn't use parameters - natural language only
   */
  getParameters(): undefined {
    return undefined;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
