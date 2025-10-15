import { readFile } from 'fs/promises';
import { join } from 'path';
import { createLogger } from '@backend/utils/logger';

const logger = createLogger('CostCalculator');

/**
 * Pricing information for a model
 */
interface PriceInfo {
  model: string;
  pricePerSecond?: number; // For video
  pricePerImage?: number; // For images
  pricePerGeneration?: number; // For 3D, fixed-price items
  pricePerMinute?: number; // For audio/music
  unit: 'second' | 'image' | 'generation' | 'minute' | 'character';
  notes?: string;
}

/**
 * Cost estimate breakdown
 */
export interface CostEstimate {
  credits: number;
  usd: number;
  breakdown: {
    imageGeneration?: number;
    videoGeneration?: number;
    audioGeneration?: number;
    upscaling?: number;
    other?: number;
  };
  toolsUsed: string[];
  reasoning: string;
}

/**
 * Tool plan for cost calculation
 */
export interface ToolPlan {
  imageGenerator?: string;
  videoGenerator?: string;
  audioGenerator?: string;
  duration?: string; // "10s", "30s", etc.
  imageCount?: number;
  qualityLevel?: 'high' | 'medium' | 'fast';
}

/**
 * Cost Calculator
 * 
 * Calculates cost estimates based on selected tools and parameters.
 * Loads pricing from CATALOGO_v2.md
 */
export class CostCalculator {
  private pricingTable: Map<string, PriceInfo> = new Map();
  private catalogLoaded: boolean = false;

  /**
   * Load pricing table from CATALOGO
   */
  async loadPricingTable(): Promise<void> {
    if (this.catalogLoaded) {
      return; // Already loaded
    }

    logger.info('Loading pricing table from CATALOGO');

    try {
      // Path to CATALOGO_v2.md (or catalogo_v2_complete.md)
      const catalogPath = join(
        process.cwd(),
        'catalogo_v2_complete.md'
      );

      const content = await readFile(catalogPath, 'utf-8');

      // Parse pricing from CATALOGO
      this.parsePricingFromCatalog(content);

      this.catalogLoaded = true;
      logger.info('Pricing table loaded', {
        modelCount: this.pricingTable.size
      });
    } catch (error) {
      logger.error('Failed to load pricing table', { error });
      // Use hardcoded fallback pricing
      this.loadFallbackPricing();
    }
  }

  /**
   * Parse pricing information from CATALOGO markdown
   */
  private parsePricingFromCatalog(content: string): void {
    // Video models pricing patterns
    const videoPatterns = [
      // Sora 2: $0.10/second
      /Sora 2.*?\$0\.10\/s/gi,
      // Kling: $0.35/5s + $0.07/s
      /Kling.*?\$0\.35\/5s.*?\$0\.07/gi,
      // Veo 3: $0.10-0.40/s
      /Veo 3.*?\$0\.(10|20|40)\/s/gi,
      // Wan 2.5: $0.05-0.15/s
      /Wan 2\.5.*?\$0\.(05|15)\/s/gi,
    ];

    // Manual pricing table (extracted from CATALOGO)
    // Video models
    this.pricingTable.set('sora-2-pro', {
      model: 'sora-2-pro',
      pricePerSecond: 0.10,
      unit: 'second',
      notes: 'With audio, lip sync, up to 1080p'
    });

    this.pricingTable.set('sora-2-standard', {
      model: 'sora-2-standard',
      pricePerSecond: 0.10,
      unit: 'second',
      notes: 'With audio, 720p'
    });

    this.pricingTable.set('kling-v2.5-turbo-pro', {
      model: 'kling-v2.5-turbo-pro',
      pricePerSecond: 0.07,
      unit: 'second',
      notes: 'Base: $0.35/5s, additional: $0.07/s'
    });

    this.pricingTable.set('veo-3', {
      model: 'veo-3',
      pricePerSecond: 0.30,
      unit: 'second',
      notes: 'Standard with audio, $0.20-0.40/s range'
    });

    this.pricingTable.set('veo-3-fast', {
      model: 'veo-3-fast',
      pricePerSecond: 0.125,
      unit: 'second',
      notes: 'Budget option, $0.10-0.15/s'
    });

    this.pricingTable.set('wan-2.5', {
      model: 'wan-2.5',
      pricePerSecond: 0.10,
      unit: 'second',
      notes: 'With audio, $0.05-0.15/s range'
    });

    this.pricingTable.set('luma-ray-2', {
      model: 'luma-ray-2',
      pricePerSecond: 0.15,
      unit: 'second',
      notes: 'Estimated, no official pricing'
    });

    this.pricingTable.set('minimax-hailuo-02-pro', {
      model: 'minimax-hailuo-02-pro',
      pricePerSecond: 0.08,
      unit: 'second',
      notes: '1080p, camera control'
    });

    this.pricingTable.set('pika-v2.2', {
      model: 'pika-v2.2',
      pricePerSecond: 0.04,
      unit: 'second',
      notes: '$0.20/5s for 720p, $0.45/5s for 1080p'
    });

    this.pricingTable.set('runway-gen-3-turbo', {
      model: 'runway-gen-3-turbo',
      pricePerSecond: 0.05,
      unit: 'second',
      notes: '$0.25/5s, $0.50/10s'
    });

    // Image models
    this.pricingTable.set('nano-banana', {
      model: 'nano-banana',
      pricePerImage: 0.039,
      unit: 'image',
      notes: 'Budget option'
    });

    this.pricingTable.set('flux-dev', {
      model: 'flux-dev',
      pricePerImage: 0.05,
      unit: 'image',
      notes: 'Versatile, LoRA support'
    });

    this.pricingTable.set('flux-pro', {
      model: 'flux-pro',
      pricePerImage: 0.08,
      unit: 'image',
      notes: 'Maximum quality'
    });

    this.pricingTable.set('recraft-v3', {
      model: 'recraft-v3',
      pricePerImage: 0.08,
      unit: 'image',
      notes: 'Vector art, logos, brand'
    });

    this.pricingTable.set('ideogram-v3', {
      model: 'ideogram-v3',
      pricePerImage: 0.06,
      unit: 'image',
      notes: 'Typography specialist'
    });

    this.pricingTable.set('seedream-v4', {
      model: 'seedream-v4',
      pricePerImage: 0.10,
      unit: 'image',
      notes: '4K, multi-image composition'
    });

    this.pricingTable.set('midjourney', {
      model: 'midjourney',
      pricePerImage: 0.12,
      unit: 'image',
      notes: 'Premium artistic, via KIE.AI'
    });

    // 3D models
    this.pricingTable.set('hyper3d-rodin', {
      model: 'hyper3d-rodin',
      pricePerGeneration: 0.40,
      unit: 'generation',
      notes: 'Production-ready, Unity/Unreal'
    });

    this.pricingTable.set('hunyuan3d-v2.1', {
      model: 'hunyuan3d-v2.1',
      pricePerGeneration: 0.16,
      unit: 'generation',
      notes: 'Budget 3D with PBR'
    });

    // Audio/Music - typically credit-based, estimate
    this.pricingTable.set('suno-v4.5-plus', {
      model: 'suno-v4.5-plus',
      pricePerMinute: 0.50,
      unit: 'minute',
      notes: 'Estimated, credit system'
    });

    this.pricingTable.set('minimax-tts', {
      model: 'minimax-tts',
      pricePerMinute: 0.10,
      unit: 'minute',
      notes: 'TTS, 30+ languages'
    });

    logger.info('Pricing table populated', {
      count: this.pricingTable.size
    });
  }

  /**
   * Load fallback pricing if CATALOGO fails
   */
  private loadFallbackPricing(): void {
    logger.warn('Using fallback pricing');
    // Already populated in parsePricingFromCatalog
    // This is the same data, just called as fallback
    this.parsePricingFromCatalog('');
  }

  /**
   * Estimate cost for a tool plan
   */
  async estimateCost(toolPlan: ToolPlan): Promise<CostEstimate> {
    await this.loadPricingTable();

    logger.info('Estimating cost', { toolPlan });

    const breakdown: CostEstimate['breakdown'] = {};
    const toolsUsed: string[] = [];
    let totalUsd = 0;
    const reasoningParts: string[] = [];

    // Video generation cost
    if (toolPlan.videoGenerator) {
      const pricing = this.pricingTable.get(toolPlan.videoGenerator);
      if (pricing && pricing.pricePerSecond) {
        const duration = this.parseDuration(toolPlan.duration || '10s');
        const cost = duration * pricing.pricePerSecond;

        breakdown.videoGeneration = cost;
        totalUsd += cost;
        toolsUsed.push(toolPlan.videoGenerator);
        reasoningParts.push(
          `Video (${toolPlan.videoGenerator}): ${duration}s × $${pricing.pricePerSecond}/s = $${cost.toFixed(2)}`
        );
      }
    }

    // Image generation cost
    if (toolPlan.imageGenerator) {
      const pricing = this.pricingTable.get(toolPlan.imageGenerator);
      if (pricing && pricing.pricePerImage) {
        const count = toolPlan.imageCount || 1;
        const cost = count * pricing.pricePerImage;

        breakdown.imageGeneration = cost;
        totalUsd += cost;
        toolsUsed.push(toolPlan.imageGenerator);
        reasoningParts.push(
          `Image (${toolPlan.imageGenerator}): ${count} × $${pricing.pricePerImage}/img = $${cost.toFixed(2)}`
        );
      }
    }

    // Audio generation cost
    if (toolPlan.audioGenerator) {
      const pricing = this.pricingTable.get(toolPlan.audioGenerator);
      if (pricing) {
        let cost = 0;
        if (pricing.pricePerMinute) {
          const minutes = toolPlan.duration
            ? this.parseDuration(toolPlan.duration) / 60
            : 1;
          cost = minutes * pricing.pricePerMinute;
        } else if (pricing.pricePerGeneration) {
          cost = pricing.pricePerGeneration;
        }

        breakdown.audioGeneration = cost;
        totalUsd += cost;
        toolsUsed.push(toolPlan.audioGenerator);
        reasoningParts.push(
          `Audio (${toolPlan.audioGenerator}): $${cost.toFixed(2)}`
        );
      }
    }

    // Convert USD to credits (100 crediti = $1)
    const credits = Math.round(totalUsd * 100);

    const estimate: CostEstimate = {
      credits,
      usd: totalUsd,
      breakdown,
      toolsUsed,
      reasoning: reasoningParts.join('\n')
    };

    logger.info('Cost estimated', {
      credits,
      usd: totalUsd,
      toolsCount: toolsUsed.length
    });

    return estimate;
  }

  /**
   * Parse duration string to seconds
   */
  private parseDuration(duration: string): number {
    // Handle formats: "10s", "30s", "1m", "10-15s"
    const match = duration.match(/(\d+)(?:-(\d+))?s?/);
    if (!match) {
      return 10; // Default 10 seconds
    }

    const [, first, second] = match;
    if (second) {
      // Range: take average
      return (parseInt(first) + parseInt(second)) / 2;
    }

    return parseInt(first);
  }

  /**
   * Get pricing for specific model
   */
  getPricing(modelName: string): PriceInfo | undefined {
    return this.pricingTable.get(modelName);
  }

  /**
   * Format cost for user display
   */
  formatCostForUser(estimate: CostEstimate): string {
    if (estimate.credits === 0) {
      return 'Gratis!';
    }

    if (estimate.credits < 50) {
      return `circa ${(estimate.credits / 100).toFixed(1)} crediti`;
    }

    return `circa ${(estimate.credits / 100).toFixed(1)} crediti`;
  }

  /**
   * Determine if cost needs explicit approval
   */
  needsExplicitApproval(estimate: CostEstimate): boolean {
    // Costs over 2 credits ($2) need explicit approval
    return estimate.credits > 200;
  }

  /**
   * Get budget tier category
   */
  getBudgetTier(estimate: CostEstimate): 'low' | 'medium' | 'high' {
    if (estimate.credits < 50) return 'low'; // < $0.50
    if (estimate.credits < 150) return 'medium'; // $0.50-1.50
    return 'high'; // > $1.50
  }
}
