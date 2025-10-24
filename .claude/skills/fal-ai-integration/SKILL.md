---
name: fal-ai-integration
description: Handle FAL.AI API integration with proper error handling, retry logic, rate limiting, and cost optimization. Use when working with FAL.AI API calls, AI image/video generation, or when user mentions FAL, fal.ai, image models, video models, or AI generation endpoints.
version: 1.0.0
allowed-tools: [read, write, edit, bash]
---

# FAL.AI Integration Skill

## Purpose

Ensure all FAL.AI API integrations follow best practices for:
- Secure API key management
- Robust error handling with exponential backoff
- Rate limiting and quota management
- Cost optimization through smart model selection
- Proper timeout handling
- Comprehensive logging and monitoring

## When to Activate

**ALWAYS activate when:**
- User mentions FAL.AI, fal.ai, or FAL API
- Working on image generation features
- Working on video generation features
- Implementing or debugging AI model API calls
- User asks about AI generation costs
- User mentions model selection or optimization

**Relevant Files**:
- `src/agents/visual-creator/`
- `src/shared/coordination/smart-router.ts`
- `src/shared/coordination/model-catalog.ts`
- Any file with `fal.ai` API calls

---

## API Key Management

### ✅ CORRECT: Environment Variables

```typescript
// .env (NEVER commit this file!)
FAL_API_KEY=your-api-key-here

// src/config/fal-config.ts
import dotenv from 'dotenv';
dotenv.config();

export const falConfig = {
  apiKey: process.env.FAL_API_KEY,
  baseUrl: 'https://fal.run',
};

// Validate on startup
if (!falConfig.apiKey) {
  throw new Error('FAL_API_KEY environment variable is required');
}
```

### ❌ WRONG: Hardcoded Keys

```typescript
// NEVER DO THIS!
const API_KEY = 'sk-xxxxx-xxxxx';  // ❌ SECURITY RISK!
```

### .env File Structure

```env
# FAL.AI Configuration
FAL_API_KEY=your-key-here
FAL_TIMEOUT_IMAGE=60000
FAL_TIMEOUT_VIDEO=300000
FAL_MAX_RETRIES=3
FAL_RETRY_DELAY=1000
```

### .gitignore (CRITICAL)

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# API keys
**/config/secrets.*
**/api-keys.*
```

**Always verify**: `git status` should NEVER show `.env` files!

---

## Error Handling

### Exponential Backoff Retry Pattern

```typescript
interface RetryConfig {
  maxRetries: number;      // Default: 3
  baseDelay: number;       // Default: 1000ms
  maxDelay: number;        // Default: 8000ms
  timeout: number;         // 60s for images, 300s for videos
}

async function callFalWithRetry<T>(
  apiCall: () => Promise<T>,
  config: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    timeout: 60000,
  }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Set timeout for API call
      const result = await Promise.race([
        apiCall(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), config.timeout)
        ),
      ]);

      return result;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (error instanceof FalApiError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Last attempt - throw error
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delay = Math.min(config.baseDelay * Math.pow(2, attempt), config.maxDelay);

      // Log retry attempt
      console.warn(`FAL API call failed (attempt ${attempt + 1}/${config.maxRetries}), retrying in ${delay}ms...`, {
        error: lastError.message,
      });

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

### Error Types and Handling

```typescript
class FalApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FalApiError';
  }
}

// Usage
try {
  const result = await callFalWithRetry(() => fal.run('fal-ai/flux/dev', params));
} catch (error) {
  if (error instanceof FalApiError) {
    switch (error.statusCode) {
      case 401:
        // Invalid API key
        throw new Error('FAL API authentication failed. Check FAL_API_KEY environment variable.');

      case 429:
        // Rate limit exceeded
        throw new Error('FAL API rate limit exceeded. Implement queue or reduce request frequency.');

      case 500:
      case 503:
        // Server error (already retried)
        throw new Error('FAL API server error. Service may be temporarily unavailable.');

      default:
        throw new Error(`FAL API error (${error.statusCode}): ${error.message}`);
    }
  }

  // Unknown error
  throw new Error(`Unexpected error calling FAL API: ${error.message}`);
}
```

---

## Rate Limiting

### Request Queue Pattern

```typescript
class FalRequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerMinute = 60; // Adjust based on your plan
  private minDelay = 60000 / this.requestsPerMinute; // ms between requests

  async enqueue<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      const apiCall = this.queue.shift()!;

      try {
        await apiCall();
      } catch (error) {
        console.error('Queue processing error:', error);
      }

      // Wait before next request
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay));
      }
    }

    this.processing = false;
  }
}

// Global instance
const falQueue = new FalRequestQueue();

// Usage
const result = await falQueue.enqueue(() =>
  fal.run('fal-ai/flux/dev', params)
);
```

---

## Model Selection and Cost Optimization

### Smart Model Selection

```typescript
interface ModelInfo {
  id: string;
  provider: 'fal-ai' | 'replicate' | 'stability';
  type: 'image' | 'video' | 'audio';
  costPer1000: number;      // USD
  avgLatency: number;       // seconds
  quality: 'low' | 'medium' | 'high' | 'ultra';
  maxResolution: string;    // e.g., '1024x1024'
}

interface TaskRequirements {
  type: 'image' | 'video';
  budget: 'low' | 'medium' | 'high';
  quality: 'draft' | 'production' | 'premium';
  urgency: 'low' | 'normal' | 'high';
}

function selectOptimalModel(
  task: TaskRequirements,
  catalog: ModelInfo[]
): ModelInfo {
  // Filter by type
  let candidates = catalog.filter(m => m.type === task.type);

  // Apply budget constraints
  const maxCost = task.budget === 'low' ? 0.01 : task.budget === 'medium' ? 0.05 : 0.20;
  candidates = candidates.filter(m => m.costPer1000 <= maxCost);

  // Apply quality constraints
  const minQuality = task.quality === 'draft' ? 'low' : task.quality === 'production' ? 'medium' : 'high';
  const qualityOrder = ['low', 'medium', 'high', 'ultra'];
  const minQualityIndex = qualityOrder.indexOf(minQuality);
  candidates = candidates.filter(m => qualityOrder.indexOf(m.quality) >= minQualityIndex);

  // Sort by urgency (latency vs quality)
  if (task.urgency === 'high') {
    // Prioritize speed
    candidates.sort((a, b) => a.avgLatency - b.avgLatency);
  } else {
    // Prioritize quality, then cost
    candidates.sort((a, b) => {
      const qualityDiff = qualityOrder.indexOf(b.quality) - qualityOrder.indexOf(a.quality);
      if (qualityDiff !== 0) return qualityDiff;
      return a.costPer1000 - b.costPer1000;
    });
  }

  if (candidates.length === 0) {
    throw new Error(`No model found matching requirements: ${JSON.stringify(task)}`);
  }

  return candidates[0];
}
```

### AIDA Model Catalog (Current)

```typescript
const MODEL_CATALOG: ModelInfo[] = [
  // Image Generation
  {
    id: 'fal-ai/flux/dev',
    provider: 'fal-ai',
    type: 'image',
    costPer1000: 0.025,
    avgLatency: 3.5,
    quality: 'high',
    maxResolution: '1024x1024',
  },
  {
    id: 'fal-ai/flux/schnell',
    provider: 'fal-ai',
    type: 'image',
    costPer1000: 0.003,
    avgLatency: 1.2,
    quality: 'medium',
    maxResolution: '1024x1024',
  },
  {
    id: 'fal-ai/flux-pro',
    provider: 'fal-ai',
    type: 'image',
    costPer1000: 0.055,
    avgLatency: 5.0,
    quality: 'ultra',
    maxResolution: '1440x1440',
  },

  // Video Generation
  {
    id: 'fal-ai/kling-video/v1/standard/image-to-video',
    provider: 'fal-ai',
    type: 'video',
    costPer1000: 2.0,
    avgLatency: 120,
    quality: 'high',
    maxResolution: '1280x720',
  },
];
```

---

## Timeout Configuration

### Recommended Timeouts

```typescript
const TIMEOUTS = {
  // Image generation
  IMAGE_GENERATION: 60_000,      // 60 seconds
  IMAGE_UPSCALE: 90_000,         // 90 seconds

  // Video generation
  VIDEO_SHORT: 180_000,          // 3 minutes (< 5 sec videos)
  VIDEO_STANDARD: 300_000,       // 5 minutes (5-10 sec videos)
  VIDEO_LONG: 600_000,           // 10 minutes (> 10 sec videos)

  // Other operations
  MODEL_LIST: 10_000,            // 10 seconds
  QUEUE_STATUS: 5_000,           // 5 seconds
};

// Usage
const timeout = params.duration > 5
  ? TIMEOUTS.VIDEO_STANDARD
  : TIMEOUTS.VIDEO_SHORT;

const result = await callFalWithRetry(
  () => fal.run(modelId, params),
  { timeout, maxRetries: 3, baseDelay: 1000, maxDelay: 8000 }
);
```

---

## Common FAL.AI Models and Parameters

### FLUX Image Models

#### flux/dev (Recommended for most use cases)

```typescript
const params = {
  prompt: 'A serene landscape at golden hour with warm lighting',
  image_size: {
    width: 1024,
    height: 1024,
  },
  num_inference_steps: 28,        // Default: 28, Range: 1-50
  guidance_scale: 3.5,            // Default: 3.5, Range: 1-20
  num_images: 1,                  // Default: 1, Range: 1-4
  enable_safety_checker: true,    // Default: true
  seed: 42,                       // Optional: for reproducibility
  sync_mode: true,                // Wait for completion
};

const result = await fal.subscribe('fal-ai/flux/dev', {
  input: params,
  logs: true,
  onQueueUpdate: (update) => {
    console.log('Queue position:', update.position);
  },
});

// Result structure
interface FluxResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: 'image/png' | 'image/jpeg';
  }>;
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}
```

#### flux/schnell (Fast, lower cost)

```typescript
const params = {
  prompt: 'Quick product mockup for testing',
  image_size: 'square_hd',        // Preset sizes
  num_inference_steps: 4,         // Faster: 4 steps
  num_images: 1,
};
```

#### flux-pro (Highest quality)

```typescript
const params = {
  prompt: 'Ultra-detailed cinematic scene with perfect lighting',
  image_size: {
    width: 1440,
    height: 1440,
  },
  num_inference_steps: 50,
  guidance_scale: 5.0,
  safety_tolerance: '2',          // Stricter safety
};
```

### KLING Video Models

#### image-to-video (Image animation)

```typescript
const params = {
  prompt: 'Camera slowly pans right, gentle movement, cinematic',
  image_url: 'https://example.com/input-image.png',
  duration: '5',                  // '5' or '10' seconds
  aspect_ratio: '16:9',           // '16:9', '9:16', '1:1'
  cfg_scale: 0.5,                 // Prompt adherence: 0.0-1.0
  mode: 'std',                    // 'std' or 'pro'
};

const result = await fal.subscribe('fal-ai/kling-video/v1/standard/image-to-video', {
  input: params,
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === 'IN_PROGRESS') {
      console.log(`Progress: ${update.logs?.join('\n')}`);
    }
  },
});

// Result structure
interface KlingVideoResult {
  video: {
    url: string;
    content_type: 'video/mp4';
    file_size: number;
  };
}
```

#### text-to-video

```typescript
const params = {
  prompt: 'A drone shot flying over a futuristic city at sunset, cinematic lighting, high detail',
  duration: '5',
  aspect_ratio: '16:9',
  cfg_scale: 0.5,
  mode: 'std',
};
```

---

## Error Code Reference

### Common FAL.AI Error Codes

| Status | Error Code | Meaning | Action |
|--------|------------|---------|--------|
| 400 | INVALID_INPUT | Invalid parameters | Check prompt, image_size, other params |
| 401 | UNAUTHORIZED | Invalid API key | Verify FAL_API_KEY environment variable |
| 402 | PAYMENT_REQUIRED | Insufficient credits | Check FAL.AI account balance |
| 429 | RATE_LIMIT | Too many requests | Implement queue, reduce frequency |
| 500 | INTERNAL_ERROR | FAL.AI server error | Retry with backoff |
| 503 | SERVICE_UNAVAILABLE | Service down | Wait and retry |

### Custom Error Messages

```typescript
function getFriendlyErrorMessage(error: FalApiError): string {
  switch (error.statusCode) {
    case 400:
      return `Invalid parameters for FAL.AI model. ${error.details?.message || 'Check your input parameters.'}`;

    case 401:
      return 'FAL.AI authentication failed. Please check that FAL_API_KEY is set correctly in your .env file.';

    case 402:
      return 'Insufficient FAL.AI credits. Please add credits to your account at fal.ai/dashboard.';

    case 429:
      return 'FAL.AI rate limit exceeded. Please wait a moment before trying again.';

    case 500:
    case 503:
      return 'FAL.AI service is temporarily unavailable. Please try again in a few moments.';

    default:
      return `FAL.AI error (${error.statusCode}): ${error.message}`;
  }
}
```

---

## Logging and Monitoring

### Structured Logging

```typescript
interface FalApiLog {
  timestamp: string;
  modelId: string;
  operation: 'generate' | 'upscale' | 'queue-status';
  duration: number;           // milliseconds
  cost: number;               // USD
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

class FalLogger {
  private logs: FalApiLog[] = [];

  logApiCall(log: Omit<FalApiLog, 'timestamp'>) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      ...log,
    });

    // Console log for development
    console.log(`[FAL.AI] ${log.operation} ${log.modelId} - ${log.success ? 'SUCCESS' : 'FAILED'} (${log.duration}ms, $${log.cost.toFixed(4)})`);

    // Optionally send to monitoring service
    // this.sendToMonitoring(log);
  }

  getDailyCost(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.logs
      .filter(l => l.timestamp.startsWith(today))
      .reduce((sum, l) => sum + l.cost, 0);
  }

  getStats() {
    return {
      totalCalls: this.logs.length,
      successRate: this.logs.filter(l => l.success).length / this.logs.length,
      totalCost: this.logs.reduce((sum, l) => sum + l.cost, 0),
      avgDuration: this.logs.reduce((sum, l) => sum + l.duration, 0) / this.logs.length,
    };
  }
}

const falLogger = new FalLogger();
```

### Usage in API Calls

```typescript
const startTime = Date.now();
let success = false;

try {
  const result = await callFalWithRetry(() =>
    fal.run('fal-ai/flux/dev', params)
  );

  success = true;

  falLogger.logApiCall({
    modelId: 'fal-ai/flux/dev',
    operation: 'generate',
    duration: Date.now() - startTime,
    cost: 0.025 / 1000,  // Cost per image
    success: true,
    metadata: { imageSize: params.image_size },
  });

  return result;
} catch (error) {
  falLogger.logApiCall({
    modelId: 'fal-ai/flux/dev',
    operation: 'generate',
    duration: Date.now() - startTime,
    cost: 0,
    success: false,
    error: error.message,
  });

  throw error;
}
```

---

## Complete Integration Example

### Visual Creator Agent with FAL.AI

```typescript
import * as fal from '@fal-ai/serverless-client';
import { falConfig } from '../config/fal-config';

// Configure FAL client
fal.config({
  credentials: falConfig.apiKey,
});

class VisualCreatorExecutor {
  private queue = new FalRequestQueue();
  private logger = new FalLogger();

  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<ImageResult> {
    // Select optimal model
    const model = selectOptimalModel(
      {
        type: 'image',
        budget: options.budget || 'medium',
        quality: options.quality || 'production',
        urgency: options.urgency || 'normal',
      },
      MODEL_CATALOG
    );

    console.log(`Selected model: ${model.id} (cost: $${model.costPer1000}/1000, quality: ${model.quality})`);

    // Prepare parameters
    const params = {
      prompt: prompt,
      image_size: options.size || { width: 1024, height: 1024 },
      num_inference_steps: model.quality === 'ultra' ? 50 : 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
      sync_mode: true,
    };

    // Execute with retry logic and rate limiting
    const startTime = Date.now();

    try {
      const result = await this.queue.enqueue(() =>
        callFalWithRetry(
          () => fal.subscribe(model.id, { input: params, logs: true }),
          {
            timeout: TIMEOUTS.IMAGE_GENERATION,
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 8000,
          }
        )
      );

      // Log success
      this.logger.logApiCall({
        modelId: model.id,
        operation: 'generate',
        duration: Date.now() - startTime,
        cost: model.costPer1000 / 1000,
        success: true,
        metadata: { prompt: prompt.substring(0, 50) },
      });

      return {
        url: result.images[0].url,
        width: result.images[0].width,
        height: result.images[0].height,
        model: model.id,
        cost: model.costPer1000 / 1000,
      };
    } catch (error) {
      // Log failure
      this.logger.logApiCall({
        modelId: model.id,
        operation: 'generate',
        duration: Date.now() - startTime,
        cost: 0,
        success: false,
        error: error.message,
      });

      // Throw friendly error
      throw new Error(getFriendlyErrorMessage(error));
    }
  }
}
```

---

## Testing FAL.AI Integration

### Unit Tests (Mock FAL.AI)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('VisualCreatorExecutor', () => {
  beforeEach(() => {
    // Mock fal.subscribe
    vi.mock('@fal-ai/serverless-client', () => ({
      subscribe: vi.fn(),
      config: vi.fn(),
    }));
  });

  it('should handle successful image generation', async () => {
    const mockResult = {
      images: [{ url: 'https://example.com/image.png', width: 1024, height: 1024 }],
    };

    fal.subscribe.mockResolvedValue(mockResult);

    const executor = new VisualCreatorExecutor();
    const result = await executor.generateImage('test prompt', {});

    expect(result.url).toBe('https://example.com/image.png');
    expect(fal.subscribe).toHaveBeenCalledWith(
      expect.stringContaining('flux'),
      expect.objectContaining({ input: expect.any(Object) })
    );
  });

  it('should retry on server error', async () => {
    const mockError = new FalApiError(500, 'SERVER_ERROR', 'Internal error');
    fal.subscribe
      .mockRejectedValueOnce(mockError)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({ images: [{ url: 'https://example.com/image.png' }] });

    const executor = new VisualCreatorExecutor();
    const result = await executor.generateImage('test prompt', {});

    expect(result.url).toBeDefined();
    expect(fal.subscribe).toHaveBeenCalledTimes(3);
  });

  it('should throw on client error without retry', async () => {
    const mockError = new FalApiError(400, 'INVALID_INPUT', 'Bad parameters');
    fal.subscribe.mockRejectedValue(mockError);

    const executor = new VisualCreatorExecutor();

    await expect(executor.generateImage('', {})).rejects.toThrow('Invalid parameters');
    expect(fal.subscribe).toHaveBeenCalledTimes(1); // No retry on 4xx
  });
});
```

---

## Checklist for FAL.AI Integration

**Before writing FAL.AI code:**
- [ ] FAL_API_KEY in .env (not hardcoded)
- [ ] .env in .gitignore
- [ ] Error handling with exponential backoff
- [ ] Timeout configured (60s images, 300s videos)
- [ ] Rate limiting queue implemented
- [ ] Model selection based on requirements
- [ ] Logging for monitoring and debugging
- [ ] Unit tests with mocked FAL.AI

**Before deploying:**
- [ ] Test with real FAL.AI API (small requests)
- [ ] Verify retry logic works
- [ ] Check daily cost limits
- [ ] Monitor error rates
- [ ] Document model choices and costs

---

## References

**FAL.AI Documentation**:
- Main docs: https://fal.ai/docs
- Model gallery: https://fal.ai/models
- Pricing: https://fal.ai/pricing

**AIDA Files**:
- `src/agents/visual-creator/`
- `src/shared/coordination/smart-router.ts`
- `src/shared/coordination/model-catalog.ts`

---

**Version**: 1.0.0
**Last Updated**: 2025-10-23
**Maintainer**: AIDA Development Team
