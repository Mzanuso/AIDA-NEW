/**
 * Seedream 4.0 Adapter
 * 
 * Translates universal prompts to Seedream format - Character consistency specialist.
 * 
 * Key characteristics:
 * - 94% character consistency (best in class)
 * - Modular prompts: [character] + [action] + [scene]
 * - Reference preservation keywords
 * - Negative prompts for face drift prevention
 * - Best with fixed seed for maximum consistency
 * 
 * Best for: Multi-shot storytelling, character-based content, brand mascots
 * 
 * @module visual-creator/adapters/seedream
 */

import { PromptAdapter, UniversalPrompt } from '../prompt-adapter.interface';

export class SeedreamAdapter implements PromptAdapter {
  readonly modelName = 'Seedream 4.0';

  /**
   * Translate universal prompt to Seedream format
   * Emphasizes character preservation and consistency
   */
  translate(prompt: UniversalPrompt): string {
    const parts: string[] = [];

    // If references provided, emphasize exact character preservation
    if (prompt.characterReferences && prompt.characterReferences.length > 0) {
      parts.push('Place exact character from reference image');
    }

    // Photography style context
    if (prompt.photographyStyle) {
      parts.push(`${prompt.photographyStyle} style`);
    }

    // Subject (character description)
    parts.push(prompt.subject);

    // Action
    if (prompt.action) {
      parts.push(prompt.action);
    }

    // Environment/scene
    if (prompt.environment) {
      parts.push(`in ${prompt.environment}`);
    }

    // Lighting
    if (prompt.lighting) {
      parts.push(`${prompt.lighting} lighting`);
    }

    // Mood
    if (prompt.mood) {
      parts.push(`${prompt.mood} atmosphere`);
    }

    // Preservation instructions (critical for Seedream)
    if (prompt.characterReferences && prompt.characterReferences.length > 0) {
      parts.push('preserve facial features and hair style');
      parts.push('maintain exact character appearance');
      parts.push('no face drift');
    }

    return parts.join(', ') + '.';
  }

  /**
   * Seedream doesn't use parameters in prompt string
   * (Uses API-level parameters like seed, reference images)
   */
  getParameters(): undefined {
    return undefined;
  }
}
