/**
 * Ideogram v2 Adapter
 * 
 * Translates universal prompts to Ideogram format - Typography excellence specialist.
 * 
 * Key characteristics:
 * - All text in "quotation marks" for exact rendering
 * - Explicit positioning: "at top", "centered", "at bottom"
 * - Font style descriptions included
 * - Professional publishing quality
 * - Best text rendering reliability in English
 * 
 * Best for: Book covers, posters, text-heavy designs, typography projects
 * 
 * @module visual-creator/adapters/ideogram
 */

import { PromptAdapter, UniversalPrompt } from '../prompt-adapter.interface';

export class IdeogramAdapter implements PromptAdapter {
  readonly modelName = 'Ideogram v2';

  /**
   * Translate universal prompt to Ideogram format
   * Emphasizes text rendering with proper quoting and positioning
   */
  translate(prompt: UniversalPrompt): string {
    const parts: string[] = [];

    // Design type context
    if (prompt.subject.toLowerCase().includes('cover')) {
      parts.push('Professional publishing quality');
    }

    // Photography/design style
    if (prompt.photographyStyle) {
      parts.push(`${prompt.photographyStyle} design`);
    }

    // Subject/base concept
    parts.push(prompt.subject);

    // Text elements with quotes and positioning (Ideogram's strength)
    if (prompt.textElements && prompt.textElements.length > 0) {
      prompt.textElements.forEach(textEl => {
        const position = this.formatPosition(textEl.position);
        const fontStyle = textEl.style || 'bold professional font';
        parts.push(`text ${position}: "${textEl.text}" in ${fontStyle}`);
      });
    }

    // Support for textOverlay (alternative format used by workflow orchestrator)
    if (prompt.textOverlay) {
      const position = this.formatPosition(prompt.textOverlay.position);
      const fontStyle = prompt.textOverlay.style || 'bold professional font';
      parts.push(`text ${position}: "${prompt.textOverlay.content}" in ${fontStyle}`);
    }

    // Background/environment
    if (prompt.environment) {
      parts.push(`${prompt.environment} background`);
    }

    // Lighting/mood
    if (prompt.lighting) {
      parts.push(`${prompt.lighting} lighting`);
    }

    if (prompt.mood) {
      parts.push(`${prompt.mood} mood`);
    }

    // Professional quality emphasis
    if ((prompt.textElements && prompt.textElements.length > 0) || prompt.textOverlay) {
      parts.push('high-quality typography');
    }

    return parts.join(', ') + '.';
  }

  /**
   * Ideogram doesn't use parameters
   */
  getParameters(): undefined {
    return undefined;
  }

  /**
   * Format position for Ideogram syntax
   */
  private formatPosition(position: string): string {
    const posMap: Record<string, string> = {
      'top': 'at top',
      'center': 'centered',
      'bottom': 'at bottom',
      'custom': 'positioned'
    };

    return posMap[position] || 'at top';
  }
}
