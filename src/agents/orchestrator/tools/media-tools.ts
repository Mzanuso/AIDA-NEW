import axios from 'axios';
import { fal } from '@fal-ai/client';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('MediaTools');

// Configure FAL.AI
fal.config({
  credentials: process.env.FAL_KEY
});

interface MidjourneyImage {
  url: string;
  prompt: string;
}

interface MidjourneyResult {
  images: MidjourneyImage[];
  totalCost: number;
}

interface KlingVideoResult {
  videoUrl: string;
  duration: number;
  cost: number;
}

export class MediaTools {
  private kieApiKey: string;
  private kieBaseUrl = 'https://api.kie.ai/api/v1';
  private maxParallelImages = 4;
  
  constructor() {
    this.kieApiKey = process.env.KIE_API_KEY!;
    if (!this.kieApiKey) {
      throw new Error('KIE_API_KEY not found in environment');
    }
  }
  
  /**
   * Generate images via Midjourney (KIE.AI)
   */
  async generateImagesMidjourney(params: {
    prompts: string[];
    srefCode: string;
    parallel?: boolean;
  }): Promise<MidjourneyResult> {
    logger.info('Generating images with Midjourney', {
      count: params.prompts.length,
      parallel: params.parallel !== false
    });
    
    try {
      // Enhance prompts with SREF code
      const enhancedPrompts = params.prompts.map(p =>
        `${p} --sref ${params.srefCode}`
      );
      
      const images: MidjourneyImage[] = [];
      
      if (params.parallel !== false && params.prompts.length > 1) {
        // Parallel generation with concurrency limit
        images.push(...await this.generateImagesParallel(enhancedPrompts));
      } else {
        // Sequential generation
        for (const prompt of enhancedPrompts) {
          const image = await this.generateSingleImage(prompt);
          images.push(image);
        }
      }
      
      return {
        images,
        totalCost: images.length * 0.05 // ~$0.05 per image estimate
      };
      
    } catch (error) {
      logger.error('Midjourney generation failed', { error });
      throw new MediaError('Midjourney generation failed', error);
    }
  }
  
  /**
   * Generate video via Kling (FAL.AI)
   */
  async generateVideoKling(params: {
    images: string[];
    duration: number;
    aspectRatio?: '16:9' | '9:16' | '1:1';
  }): Promise<KlingVideoResult> {
    logger.info('Generating video with Kling', {
      imageCount: params.images.length,
      duration: params.duration
    });
    
    try {
      // Use FAL.AI Kling API
      const result = await fal.subscribe('fal-ai/kling-video/v2.5-turbo/pro/image-to-video', {
        input: {
          image_url: params.images[0], // Use first image as base
          prompt: 'Create smooth transitions between scenes',
          duration: params.duration.toString(),
          aspect_ratio: params.aspectRatio || '16:9'
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            logger.info('Kling progress', { logs: update.logs });
          }
        }
      });
      
      const costPerSecond = 0.07;
      const baseCost = 0.35; // Base cost for 5 seconds
      const additionalSeconds = Math.max(0, params.duration - 5);
      const totalCost = baseCost + (additionalSeconds * costPerSecond);
      
      return {
        videoUrl: result.data.video.url,
        duration: params.duration,
        cost: totalCost
      };
      
    } catch (error) {
      logger.error('Kling generation failed', { error });
      throw new MediaError('Kling generation failed', error);
    }
  }
  
  /**
   * Generate images in parallel with concurrency limit
   */
  private async generateImagesParallel(prompts: string[]): Promise<MidjourneyImage[]> {
    const chunks = this.chunkArray(prompts, this.maxParallelImages);
    const allImages: MidjourneyImage[] = [];
    
    for (const chunk of chunks) {
      const chunkImages = await Promise.all(
        chunk.map(prompt => this.generateSingleImage(prompt))
      );
      allImages.push(...chunkImages);
    }
    
    return allImages;
  }
  
  /**
   * Generate single image via KIE.AI Midjourney API
   */
  private async generateSingleImage(prompt: string): Promise<MidjourneyImage> {
    try {
      // Start generation
      const startResponse = await axios.post(
        `${this.kieBaseUrl}/mj/generate`,
        {
          prompt,
          model: 'v7',
          aspect_ratio: '16:9',
          speed: 'Fast'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.kieApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const taskId = startResponse.data.task_id;
      
      // Poll for completion
      const imageUrl = await this.pollMidjourneyStatus(taskId);
      
      return {
        url: imageUrl,
        prompt
      };
      
    } catch (error: any) {
      // Retry on rate limit
      if (error.response?.status === 429) {
        logger.warn('Rate limit hit, waiting before retry');
        await this.delay(2000);
        return this.generateSingleImage(prompt);
      }
      
      throw error;
    }
  }
  
  /**
   * Poll Midjourney task status until completion
   */
  private async pollMidjourneyStatus(taskId: string, maxAttempts: number = 60): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      await this.delay(5000); // Wait 5 seconds between polls
      
      try {
        const response = await axios.get(
          `${this.kieBaseUrl}/mj/record-info`,
          {
            params: { task_id: taskId },
            headers: {
              'Authorization': `Bearer ${this.kieApiKey}`
            }
          }
        );
        
        const status = response.data.status;
        
        if (status === 'completed' && response.data.image_url) {
          return response.data.image_url;
        }
        
        if (status === 'failed') {
          throw new Error('Midjourney generation failed');
        }
        
        // Still processing, continue polling
        
      } catch (error) {
        logger.error('Failed to check Midjourney status', { error });
      }
    }
    
    throw new Error('Midjourney generation timeout');
  }
  
  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class MediaError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = 'MediaError';
  }
}
