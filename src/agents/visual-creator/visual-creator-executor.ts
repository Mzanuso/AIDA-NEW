/**
 * Visual Creator Executor
 * 
 * Executes WorkflowExecutionPlan by calling FAL.AI and KIE.AI APIs.
 * Handles step orchestration, dependencies, retries, and rate limiting.
 * 
 * @module agents/visual-creator/visual-creator-executor
 */

import type {
  WorkflowExecutionPlan,
  WorkflowResult,
  WorkflowStepResult,
  WorkflowStatus
} from '../../shared/types';

/**
 * Rate limiting delays (milliseconds)
 */
const RATE_LIMITS = {
  'fal.ai': 100,      // 10 requests/second
  'kie.ai': 500,      // 2 requests/second
  'default': 200
};

/**
 * Retry configuration
 */
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000, 8000]; // Exponential backoff

/**
 * API endpoints
 */
const API_ENDPOINTS = {
  FAL_BASE: 'https://queue.fal.run',
  KIE_BASE: 'https://api.kie.ai/v1'
};

/**
 * Model to API provider mapping
 */
const MODEL_PROVIDERS: Record<string, 'fal.ai' | 'kie.ai'> = {
  'flux-pro-1.1': 'fal.ai',
  'flux-schnell': 'fal.ai',
  'seedream-4.0': 'fal.ai',
  'ideogram-v2': 'fal.ai',
  'recraft-v3': 'fal.ai',
  'hunyuan-video': 'fal.ai',
  'midjourney-v6': 'kie.ai'
};

/**
 * Model to FAL.AI endpoint mapping
 */
const FAL_ENDPOINTS: Record<string, string> = {
  'flux-pro-1.1': 'fal-ai/flux-pro/v1.1-ultra',
  'flux-schnell': 'fal-ai/flux/schnell',
  'seedream-4.0': 'fal-ai/seedream',
  'ideogram-v2': 'fal-ai/ideogram-v2',
  'recraft-v3': 'fal-ai/recraft-v3'
};

/**
 * Visual Creator Executor
 * 
 * Executes complete WorkflowExecutionPlan by calling appropriate AI APIs.
 */
export class VisualCreatorExecutor {
  private lastApiCallTime: number = 0;

  /**
   * Execute WorkflowExecutionPlan
   * 
   * @param plan - Workflow execution plan from Workflow Orchestrator
   * @returns Complete workflow result with generated images
   */
  async execute(plan: WorkflowExecutionPlan): Promise<WorkflowResult> {
    const startTime = Date.now();
    const stepResults: WorkflowStepResult[] = [];
    const completedSteps = new Set<string>();

    // Execute steps respecting dependencies
    for (const step of plan.steps) {
      // Wait for dependencies
      if (step.dependencies) {
        const allDepsComplete = step.dependencies.every(depId => 
          completedSteps.has(depId)
        );
        
        if (!allDepsComplete) {
          // In a real implementation, we'd use a queue system
          // For now, we assume steps are ordered correctly
          console.warn(`Step ${step.stepId} has unmet dependencies`);
        }
      }

      // Execute step with retry logic
      const stepResult = await this.executeStepWithRetry(step, stepResults);
      stepResults.push(stepResult);

      if (stepResult.status === 'completed') {
        completedSteps.add(step.stepId);
      }

      // Rate limiting delay
      await this.applyRateLimit(step.model);
    }

    // Aggregate results
    const allImageUrls = stepResults
      .flatMap(r => r.imageUrls || [])
      .filter(url => url);

    const totalCost = stepResults
      .reduce((sum, r) => sum + (r.actualCost || 0), 0);

    const totalTime = (Date.now() - startTime) / 1000; // seconds

    // Determine overall status
    const status = this.determineOverallStatus(stepResults);

    return {
      workflowId: plan.workflowId,
      status,
      stepResults,
      allImageUrls,
      totalCost,
      totalTime,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString()
    };
  }

  /**
   * Execute step with retry logic
   */
  private async executeStepWithRetry(
    step: any,
    previousResults: WorkflowStepResult[]
  ): Promise<WorkflowStepResult> {
    let lastError: string | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Add delay for retries
        if (attempt > 0) {
          await this.sleep(RETRY_DELAYS[attempt - 1]);
        }

        const result = await this.executeStep(step, previousResults);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Step ${step.stepId} attempt ${attempt + 1} failed:`, lastError);
      }
    }

    // All retries failed
    return {
      stepId: step.stepId,
      status: 'failed',
      error: `Failed after ${MAX_RETRIES} attempts: ${lastError}`,
      completedAt: new Date().toISOString()
    };
  }

  /**
   * Execute single step
   */
  private async executeStep(
    step: any,
    previousResults: WorkflowStepResult[]
  ): Promise<WorkflowStepResult> {
    const startTime = Date.now();
    const provider = MODEL_PROVIDERS[step.model] || 'fal.ai';

    // Get reference images if needed
    const referenceImageUrls = this.getReferenceImageUrls(step, previousResults);

    try {
      let imageUrls: string[];

      if (provider === 'fal.ai') {
        imageUrls = await this.callFalAI(step, referenceImageUrls);
      } else if (provider === 'kie.ai') {
        imageUrls = await this.callKieAI(step);
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }

      const actualTime = (Date.now() - startTime) / 1000;

      return {
        stepId: step.stepId,
        status: 'completed',
        imageUrls,
        actualTime,
        actualCost: step.estimatedCost, // In real impl, track actual cost
        referenceStepId: step.dependencies?.[0], // Track first dependency for test
        completedAt: new Date().toISOString()
      };
    } catch (error) {
      throw error; // Let retry logic handle it
    }
  }

  /**
   * Call FAL.AI API
   */
  private async callFalAI(
    step: any,
    referenceImageUrls?: string[]
  ): Promise<string[]> {
    const endpoint = FAL_ENDPOINTS[step.model];
    
    if (!endpoint) {
      throw new Error(`No FAL.AI endpoint for model: ${step.model}`);
    }

    const payload: any = {
      prompt: step.prompt
    };

    // Add parameters
    if (step.parameters) {
      Object.assign(payload, step.parameters);
    }

    // Add reference images for consistency workflows
    if (referenceImageUrls && referenceImageUrls.length > 0) {
      payload.image_url = referenceImageUrls[0]; // Most models support one reference
    }

    // Call FAL.AI API
    const response = await fetch(`${API_ENDPOINTS.FAL_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${process.env.FAL_KEY || ''}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`FAL.AI API error: ${response.status} ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    // Extract image URLs from response
    if (result.images && Array.isArray(result.images)) {
      return result.images.map((img: any) => img.url);
    } else if (result.image && typeof result.image === 'string') {
      return [result.image];
    } else {
      throw new Error('No images in FAL.AI response');
    }
  }

  /**
   * Call KIE.AI API (Midjourney)
   */
  private async callKieAI(step: any): Promise<string[]> {
    // Submit generation request
    const submitResponse = await fetch(`${API_ENDPOINTS.KIE_BASE}/midjourney/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KIE_API_KEY || ''}`
      },
      body: JSON.stringify({
        prompt: step.prompt
      })
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json().catch(() => ({}));
      throw new Error(`KIE.AI API error: ${submitResponse.status} ${JSON.stringify(error)}`);
    }

    const submitResult = await submitResponse.json();
    const taskId = submitResult.task_id;

    if (!taskId) {
      throw new Error('No task_id in KIE.AI response');
    }

    // Poll for completion
    return await this.pollKieAITask(taskId);
  }

  /**
   * Poll KIE.AI task until completion
   */
  private async pollKieAITask(taskId: string, maxAttempts: number = 60): Promise<string[]> {
    for (let i = 0; i < maxAttempts; i++) {
      await this.sleep(5000); // Wait 5 seconds between polls

      const response = await fetch(`${API_ENDPOINTS.KIE_BASE}/midjourney/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.KIE_API_KEY || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`KIE.AI polling error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'completed') {
        if (result.result && result.result.image_url) {
          return [result.result.image_url];
        } else {
          throw new Error('No image_url in completed KIE.AI result');
        }
      } else if (result.status === 'failed') {
        throw new Error(`KIE.AI generation failed: ${result.error || 'Unknown error'}`);
      }

      // Still processing, continue polling
    }

    throw new Error('KIE.AI polling timeout');
  }

  /**
   * Get reference image URLs from previous steps
   */
  private getReferenceImageUrls(
    step: any,
    previousResults: WorkflowStepResult[]
  ): string[] | undefined {
    if (!step.referenceImages || step.referenceImages.length === 0) {
      return undefined;
    }

    const urls: string[] = [];

    for (const refStepId of step.referenceImages) {
      const refResult = previousResults.find(r => r.stepId === refStepId);
      if (refResult && refResult.imageUrls) {
        urls.push(...refResult.imageUrls);
      }
    }

    return urls.length > 0 ? urls : undefined;
  }

  /**
   * Apply rate limiting delay
   */
  private async applyRateLimit(model: string): Promise<void> {
    const provider = MODEL_PROVIDERS[model] || 'default';
    const delay = RATE_LIMITS[provider] || RATE_LIMITS.default;

    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCallTime;

    if (timeSinceLastCall < delay) {
      await this.sleep(delay - timeSinceLastCall);
    }

    this.lastApiCallTime = Date.now();
  }

  /**
   * Determine overall workflow status
   */
  private determineOverallStatus(stepResults: WorkflowStepResult[]): WorkflowStatus {
    const completed = stepResults.filter(r => r.status === 'completed').length;
    const failed = stepResults.filter(r => r.status === 'failed').length;

    if (failed === 0) {
      return 'completed';
    } else if (completed > 0) {
      return 'partial_success' as WorkflowStatus;
    } else {
      return 'failed';
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
