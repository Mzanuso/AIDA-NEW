/**
 * Midjourney Adapter
 * 
 * Translates universal prompts to Midjourney v7 format following best practices:
 * - 4W1H Formula (What, Who, Where, When, How + Why for mood)
 * - 60-30-10 Rule (60% concept, 30% style, 10% technical)
 * - Word Hierarchy (first 8 words = 70% impact)
 * - Parameters: --ar, --s, --c, --v
 * 
 * @module visual-creator/adapters/midjourney
 */

import { PromptAdapter, UniversalPrompt } from '../prompt-adapter.interface';

export class MidjourneyAdapter implements PromptAdapter {
  readonly modelName = 'Midjourney v7';

  /**
   * Translate universal prompt to Midjourney format
   * Applies 4W1H formula with strategic word ordering
   */
  translate(prompt: UniversalPrompt): string {
    const parts: string[] = [];

    // Apply 4W1H formula with word hierarchy (first 8 words = 70% impact)
    // Priority order: Photography style, Shot type, Subject, Action, Environment, Lighting, Mood, Technical

    // Photography style (if provided) - helps set context early
    if (prompt.photographyStyle) {
      parts.push(`${prompt.photographyStyle} photography`);
    }

    // Shot type - framing context
    if (prompt.shotType) {
      parts.push(`${prompt.shotType} shot`);
    }

    // WHAT - Subject (most important, early position for 70% impact)
    parts.push(prompt.subject);

    // WHO/WHAT - Action (if provided)
    if (prompt.action) {
      parts.push(prompt.action);
    }

    // WHERE - Environment
    if (prompt.environment) {
      parts.push(`in ${prompt.environment}`);
    }

    // WHEN/HOW - Lighting
    if (prompt.lighting) {
      const lightingText = prompt.lighting.toLowerCase().includes('light') 
        ? prompt.lighting 
        : `${prompt.lighting} lighting`;
      parts.push(lightingText);
    }

    // WHY - Mood
    if (prompt.mood) {
      parts.push(`${prompt.mood} mood`);
    }

    // Technical details (10% of 60-30-10 rule)
    if (prompt.technicalDetails) {
      parts.push(prompt.technicalDetails);
    }

    // Note: textElements and colorPalette are ignored - not Midjourney strengths
    // characterReferences would need --cref parameter (not implemented yet)

    return parts.join(', ');
  }

  /**
   * Generate Midjourney parameters based on prompt requirements
   */
  getParameters(prompt: UniversalPrompt): Record<string, any> {
    const params: Record<string, any> = {
      v: 7  // Always use Midjourney v7
    };

    // Aspect ratio
    if (prompt.aspectRatio) {
      params.ar = prompt.aspectRatio;
    }

    // Stylize based on quality tier
    params.s = this.getStylizeValue(prompt.quality);

    // Chaos - keep low for consistency (0-15 range)
    params.c = 10;

    return params;
  }

  /**
   * Map quality tiers to Midjourney --s (stylize) values
   * 
   * Premium: 200-300 (high artistic interpretation)
   * Standard: 150-200 (balanced)
   * Budget: 100-150 (lower stylization, faster)
   */
  private getStylizeValue(quality?: 'premium' | 'standard' | 'budget'): number {
    switch (quality) {
      case 'premium':
        return 250;  // 200-300 range, use middle-high
      case 'standard':
        return 175;  // 150-200 range, use middle
      case 'budget':
        return 125;  // 100-150 range, use middle
      default:
        return 175;  // Default to standard
    }
  }
}
