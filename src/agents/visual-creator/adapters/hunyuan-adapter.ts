/**
 * Hunyuan Image 3 Adapter
 * 
 * Translates universal prompts to Hunyuan format - Spatial relationships + Text specialist.
 * 
 * Key characteristics:
 * - Explicit spatial relationships (next to, above, between, centered)
 * - Text in quotes with positioning
 * - 3D rendering style for depth
 * - Color schemes explicitly stated
 * - Excels at poster designs and text-heavy compositions
 * 
 * Best for: Posters, banners, text + image compositions, spatial layouts
 * 
 * @module visual-creator/adapters/hunyuan
 */

import { PromptAdapter, UniversalPrompt } from '../prompt-adapter.interface';

export class HunyuanAdapter implements PromptAdapter {
  readonly modelName = 'Hunyuan Image 3';

  /**
   * Translate universal prompt to Hunyuan format
   * Emphasizes spatial relationships and text rendering
   */
  translate(prompt: UniversalPrompt): string {
    const parts: string[] = [];

    // 3D rendering style (Hunyuan strength)
    parts.push('3D rendering style');

    // Color palette (if provided)
    if (prompt.colorPalette && prompt.colorPalette.length > 0) {
      const colorNames = prompt.colorPalette.map(hex => this.hexToColorName(hex));
      parts.push(`mainly ${colorNames.join(' and ')} color scheme`);
    }

    // Text elements (quoted with positions)
    if (prompt.textElements && prompt.textElements.length > 0) {
      prompt.textElements.forEach(textEl => {
        const position = this.formatPosition(textEl.position);
        parts.push(`text ${position}: '${textEl.text}'`);
      });
    }

    // Subject with spatial awareness
    parts.push(prompt.subject);

    // Action (if provided)
    if (prompt.action) {
      parts.push(prompt.action);
    }

    // Environment
    if (prompt.environment) {
      parts.push(`${prompt.environment} background`);
    }

    // Lighting
    if (prompt.lighting) {
      parts.push(`${prompt.lighting} lighting`);
    }

    // Composition style
    if (prompt.photographyStyle) {
      parts.push(`${prompt.photographyStyle} composition`);
    }

    return parts.join(', ') + '.';
  }

  /**
   * Hunyuan doesn't use parameters
   */
  getParameters(): undefined {
    return undefined;
  }

  /**
   * Format position for Hunyuan syntax
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

  /**
   * Convert HEX color to readable color name
   * Simplified mapping for common colors
   */
  private hexToColorName(hex: string): string {
    // Remove # if present
    const cleanHex = hex.replace('#', '').toLowerCase();

    // Common color mappings
    const colorMap: Record<string, string> = {
      'ff0000': 'red',
      'ff6b6b': 'red',
      '00ff00': 'green',
      '4ecdc4': 'teal',
      '0000ff': 'blue',
      'ffff00': 'yellow',
      'ffe66d': 'yellow',
      'ffffff': 'white',
      '000000': 'black',
      'ff00ff': 'magenta',
      '00ffff': 'cyan',
      'ffa500': 'orange',
      '800080': 'purple'
    };

    // Check exact match
    if (colorMap[cleanHex]) {
      return colorMap[cleanHex];
    }

    // Simple RGB analysis for approximation
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);

    if (r > 200 && g < 100 && b < 100) return 'red';
    if (g > 200 && r < 100 && b < 100) return 'green';
    if (b > 200 && r < 100 && g < 100) return 'blue';
    if (r > 200 && g > 200 && b < 100) return 'yellow';
    if (r > 200 && b > 200 && g < 100) return 'magenta';
    if (g > 200 && b > 200 && r < 100) return 'cyan';
    if (r > 200 && g > 150 && b < 100) return 'orange';
    if (r > 200 && g > 200 && b > 200) return 'white';
    if (r < 50 && g < 50 && b < 50) return 'black';

    return 'colored';
  }
}
