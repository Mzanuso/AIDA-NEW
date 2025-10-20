/**
 * Recraft v3 Adapter
 * 
 * Translates universal prompts to Recraft format - Vector/SVG native specialist.
 * 
 * Key characteristics:
 * - Vector style, flat design, scalable illustration keywords
 * - Explicit HEX color palette codes
 * - Design-first language (not photographic)
 * - Clean lines, geometric shapes
 * - Ideal for logos, icons, brand materials
 * 
 * Best for: Logos, icons, illustrations, vector graphics, brand identity
 * 
 * @module visual-creator/adapters/recraft
 */

import { PromptAdapter, UniversalPrompt } from '../prompt-adapter.interface';

export class RecraftAdapter implements PromptAdapter {
  readonly modelName = 'Recraft v3';

  /**
   * Translate universal prompt to Recraft vector format
   * Emphasizes design language over photographic terms
   */
  translate(prompt: UniversalPrompt): string {
    const parts: string[] = [];

    // Always start with vector/flat design emphasis
    parts.push('Flat vector illustration');
    parts.push('scalable design');

    // Photography style becomes design style
    if (prompt.photographyStyle) {
      parts.push(`${prompt.photographyStyle} style`);
    } else {
      parts.push('modern style');
    }

    // Subject in design context
    parts.push(prompt.subject);

    // Color palette with explicit HEX codes
    if (prompt.colorPalette && prompt.colorPalette.length > 0) {
      const colorCount = prompt.colorPalette.length;
      const hexList = prompt.colorPalette.join(' ');
      parts.push(`${colorCount}-color palette: ${hexList}`);
    }

    // Design characteristics
    parts.push('clean lines');
    parts.push('geometric shapes');

    // Mood as design attribute
    if (prompt.mood) {
      parts.push(`${prompt.mood} aesthetic`);
    }

    // Ignore photographic elements (lighting, shot type, camera)
    // Recraft is design-focused, not photo-focused

    return parts.join(', ') + '.';
  }

  /**
   * Recraft doesn't use parameters
   */
  getParameters(): undefined {
    return undefined;
  }
}
