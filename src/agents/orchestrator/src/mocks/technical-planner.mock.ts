/**
 * Mock Technical Planner
 *
 * Realistic mock implementation of the Technical Planner interface.
 * Simulates:
 * - Model selection based on capability
 * - Workflow generation
 * - Execution timing (realistic delays)
 * - Failure scenarios (3-5% failure rate)
 * - Cost estimation
 *
 * Used until real Technical Planner agent is implemented.
 */

import { createLogger } from '@backend/utils/logger';
import {
  ITechnicalPlanner,
  ProjectBrief,
  ExecutionPlan,
  ProjectStatus,
  ExecutionStep,
  ModelConfig,
  AgentType,
  CreativeCapability,
  ValidationError,
  PlanningError,
  ProjectResult,
  ResultFile,
  StepStatus,
  ExecutionStatus
} from '../types/technical-planner.types';

const logger = createLogger('MockTechnicalPlanner');

/**
 * Mock Technical Planner Implementation
 */
export class MockTechnicalPlanner implements ITechnicalPlanner {
  private plans: Map<string, ExecutionPlan> = new Map();
  private executionTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // Realistic timing per capability type (milliseconds)
  private readonly TIMING_MAP: Record<string, number> = {
    // Text (fast)
    'text': 3000,

    // Images (medium)
    'image': 5000,
    'logo': 6000,
    'illustration': 7000,

    // Video (slow)
    'ugc_video': 8000,
    'short_video': 12000,
    'long_video': 25000,

    // Audio (medium-slow)
    'music': 15000,
    'voice': 5000,

    // Design (medium)
    'poster': 6000,
    'social_post': 5000,

    // Complex (very slow)
    'illustrated_book': 30000,
    'comic_book': 35000,
    'multimedia': 40000
  };

  constructor() {
    logger.info('MockTechnicalPlanner initialized');
  }

  /**
   * Create execution plan from project brief
   */
  async createExecutionPlan(brief: ProjectBrief): Promise<ExecutionPlan> {
    logger.info('Creating execution plan', { briefId: brief.id, capability: brief.capability });

    // Validate brief
    this.validateBrief(brief);

    // Simulate network delay (50-200ms)
    await this.delay(50 + Math.random() * 150);

    // Simulate occasional validation errors (5%)
    if (Math.random() < 0.05) {
      throw new ValidationError(
        `Invalid brief: missing ${this.getRandomMissingField()}`,
        this.getRandomMissingField()
      );
    }

    // Select models and create workflow
    const primaryModel = this.selectModel(brief);
    const fallbackModel = this.selectFallback(brief);
    const steps = this.generateWorkflow(brief, primaryModel);
    const estimatedTime = this.estimateTime(brief);
    const estimatedCost = this.estimateCost(brief, primaryModel);

    const plan: ExecutionPlan = {
      id: this.generateId(),
      briefId: brief.id,
      approach: steps.length > 1 ? 'multi_step_workflow' : 'single_model',
      primaryModel,
      fallbackModel,
      steps,
      estimatedTime,
      estimatedCost,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    };

    this.plans.set(plan.id, plan);

    logger.info('Execution plan created', {
      planId: plan.id,
      approach: plan.approach,
      steps: steps.length,
      estimatedTime: `${estimatedTime}s`,
      estimatedCost: `$${estimatedCost}`
    });

    // Start async execution
    this.executeAsync(plan.id);

    return plan;
  }

  /**
   * Get current project status
   */
  async getProjectStatus(planId: string): Promise<ProjectStatus> {
    const plan = this.plans.get(planId);

    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    const status: ProjectStatus = {
      planId: plan.id,
      status: plan.status,
      progress: plan.progress,
      startedAt: plan.startedAt,
      estimatedCompletionTime: this.calculateEstimatedCompletion(plan),
      actualCompletionTime: plan.completedAt
    };

    // Add current step if in progress
    if (plan.status === 'in_progress') {
      const currentStep = plan.steps.find(s => s.status === 'running');
      if (currentStep) {
        status.currentStep = {
          stepId: currentStep.id,
          name: currentStep.action,
          agent: currentStep.agent,
          progress: this.calculateStepProgress(currentStep),
          message: this.getStepMessage(currentStep, plan.briefId)
        };
      }
    }

    // Add result if completed
    if (plan.status === 'completed') {
      status.result = this.generateResult(plan);
    }

    // Add error if failed
    if (plan.status === 'failed') {
      const failedStep = plan.steps.find(s => s.status === 'failed');
      if (failedStep?.error) {
        status.error = failedStep.error;
      }
    }

    return status;
  }

  /**
   * Cancel execution
   */
  async cancelExecution(planId: string): Promise<void> {
    const plan = this.plans.get(planId);

    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    // Cancel timeout if exists
    const timeout = this.executionTimeouts.get(planId);
    if (timeout) {
      clearTimeout(timeout);
      this.executionTimeouts.delete(planId);
    }

    // Update status
    plan.status = 'cancelled';
    plan.completedAt = new Date();

    // Mark all pending/running steps as skipped
    plan.steps.forEach(step => {
      if (step.status === 'pending' || step.status === 'running') {
        step.status = 'skipped';
      }
    });

    logger.info('Execution cancelled', { planId });
  }

  /**
   * Retry failed execution
   */
  async retryExecution(planId: string): Promise<ExecutionPlan> {
    const plan = this.plans.get(planId);

    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    if (plan.status !== 'failed') {
      throw new Error(`Cannot retry execution with status: ${plan.status}`);
    }

    // Reset plan
    plan.status = 'pending';
    plan.progress = 0;
    plan.startedAt = undefined;
    plan.completedAt = undefined;

    // Reset all steps
    plan.steps.forEach(step => {
      step.status = 'pending';
      step.startTime = undefined;
      step.endTime = undefined;
      step.output = undefined;
      step.error = undefined;
    });

    logger.info('Execution retry initiated', { planId });

    // Start async execution again
    this.executeAsync(planId);

    return plan;
  }

  /**
   * Get execution history for a user
   */
  async getExecutionHistory(userId: string, limit: number = 10): Promise<ExecutionPlan[]> {
    // Filter plans by userId (stored in brief)
    const userPlans = Array.from(this.plans.values())
      .filter(plan => {
        // In real implementation, would query database
        // For mock, we don't have userId reference, return all
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return userPlans;
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Validate project brief
   */
  private validateBrief(brief: ProjectBrief): void {
    if (!brief.id) {
      throw new ValidationError('Brief ID is required', 'id');
    }

    if (!brief.capability) {
      throw new ValidationError('Capability is required', 'capability');
    }

    if (!brief.requirements) {
      throw new ValidationError('Requirements are required', 'requirements');
    }

    // Validate type-specific requirements
    if (brief.type === 'video' && !brief.requirements.aspectRatio) {
      throw new ValidationError('Aspect ratio is required for video', 'requirements.aspectRatio');
    }
  }

  /**
   * Select primary model based on brief
   */
  private selectModel(brief: ProjectBrief): ModelConfig {
    const { capability, requirements } = brief;

    // Simplified model selection (in reality, much more complex)
    const modelMap: Partial<Record<CreativeCapability, ModelConfig>> = {
      // Video
      'VIDEO_FROM_TEXT': {
        name: requirements.budget === 'high' ? 'Sora 2 Pro' : 'Kling 2.5 Turbo Pro',
        provider: 'fal-ai',
        apiEndpoint: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
        estimatedCost: requirements.budget === 'high' ? 0.15 : 0.07,
        estimatedTime: 12,
        reason: requirements.budget === 'high' ? 'Premium quality requested' : 'Best value for quality'
      },

      'SHORT_FORM_VIDEO': {
        name: 'Kling 2.5 Turbo Pro',
        provider: 'fal-ai',
        apiEndpoint: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
        estimatedCost: 0.07,
        estimatedTime: 8,
        reason: 'Optimized for short-form content'
      },

      // Image
      'GENERATE_IMAGE': {
        name: brief.requirements.style === 'realistic' ? 'FLUX 1.1 Pro' : 'Midjourney v7',
        provider: brief.requirements.style === 'realistic' ? 'fal-ai' : 'kie-ai',
        apiEndpoint: brief.requirements.style === 'realistic' ? 'fal-ai/flux-1.1-pro' : 'kie.ai/mj/generate',
        estimatedCost: 0.08,
        estimatedTime: 5,
        reason: brief.requirements.style === 'realistic' ? 'Best photorealism' : 'Best artistic quality'
      },

      'GENERATE_LOGO': {
        name: 'Recraft V3 SVG',
        provider: 'fal-ai',
        apiEndpoint: 'fal-ai/recraft-v3-svg',
        estimatedCost: 0.08,
        estimatedTime: 6,
        reason: 'Vector format ideal for logos'
      },

      // Text
      'WRITE_STORY': {
        name: 'Claude Sonnet 4.5',
        provider: 'anthropic',
        apiEndpoint: 'anthropic/claude-sonnet-4-5',
        estimatedCost: 0.01,
        estimatedTime: 3,
        reason: 'Best creative writing'
      }
    };

    const selected = modelMap[capability];

    if (!selected) {
      // Default fallback
      return {
        name: 'FLUX Pro',
        provider: 'fal-ai',
        apiEndpoint: 'fal-ai/flux-pro',
        estimatedCost: 0.08,
        estimatedTime: 5,
        reason: 'Default model for capability'
      };
    }

    return selected;
  }

  /**
   * Select fallback model
   */
  private selectFallback(brief: ProjectBrief): ModelConfig {
    // Simplified - always return a cheaper alternative
    return {
      name: 'FLUX Dev',
      provider: 'fal-ai',
      apiEndpoint: 'fal-ai/flux/dev',
      estimatedCost: 0.05,
      estimatedTime: 4,
      reason: 'Cost-effective fallback'
    };
  }

  /**
   * Generate workflow steps
   */
  private generateWorkflow(brief: ProjectBrief, model: ModelConfig): ExecutionStep[] {
    const { capability, type } = brief;

    // Simple workflows for most capabilities
    if (type === 'text') {
      return [
        {
          id: this.generateId(),
          sequenceNumber: 1,
          agent: 'writer',
          action: 'generate_text',
          model,
          input: brief,
          status: 'pending'
        }
      ];
    }

    // Complex multi-step workflow for illustrated book
    if (capability === 'ILLUSTRATED_BOOK') {
      return [
        {
          id: this.generateId(),
          sequenceNumber: 1,
          agent: 'writer',
          action: 'generate_story',
          model: {
            name: 'Claude Sonnet 4.5',
            provider: 'anthropic',
            apiEndpoint: 'anthropic/claude-sonnet-4-5',
            estimatedCost: 0.01,
            estimatedTime: 3,
            reason: 'Story generation'
          },
          input: brief,
          status: 'pending'
        },
        {
          id: this.generateId(),
          sequenceNumber: 2,
          agent: 'director',
          action: 'create_storyboard',
          input: { type: 'story_output' },
          status: 'pending',
          dependsOn: []
        },
        {
          id: this.generateId(),
          sequenceNumber: 3,
          agent: 'visual_creator',
          action: 'generate_illustrations',
          model,
          input: { type: 'storyboard_output' },
          status: 'pending',
          dependsOn: []
        },
        {
          id: this.generateId(),
          sequenceNumber: 4,
          agent: 'coordinator',
          action: 'assemble_book',
          input: { type: 'illustrations_output' },
          status: 'pending',
          dependsOn: []
        }
      ];
    }

    // Default single-step workflow
    const agent: AgentType =
      type === 'video' ? 'video_composer' :
      type === 'image' ? 'visual_creator' :
      type === 'audio' ? 'audio_creator' :
      type === 'design' ? 'designer' :
      'visual_creator';

    return [
      {
        id: this.generateId(),
        sequenceNumber: 1,
        agent,
        action: `generate_${type}`,
        model,
        input: brief,
        status: 'pending'
      }
    ];
  }

  /**
   * Estimate execution time
   */
  private estimateTime(brief: ProjectBrief): number {
    const baseTime = this.TIMING_MAP[brief.type] || 5000;

    // Add complexity multiplier
    const steps = this.generateWorkflow(brief, this.selectModel(brief));
    const complexityMultiplier = steps.length > 1 ? steps.length * 0.8 : 1;

    return Math.round((baseTime * complexityMultiplier) / 1000); // Convert to seconds
  }

  /**
   * Estimate cost
   */
  private estimateCost(brief: ProjectBrief, model: ModelConfig): number {
    let cost = model.estimatedCost;

    // Add complexity cost
    const steps = this.generateWorkflow(brief, model);
    if (steps.length > 1) {
      cost += (steps.length - 1) * 0.02; // Add $0.02 per additional step
    }

    return Math.round(cost * 100) / 100; // Round to 2 decimals
  }

  /**
   * Execute plan asynchronously
   */
  private async executeAsync(planId: string): Promise<void> {
    const plan = this.plans.get(planId);
    if (!plan) return;

    try {
      plan.status = 'in_progress';
      plan.startedAt = new Date();
      logger.info('Execution started', { planId });

      // Execute each step sequentially
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];

        step.status = 'running';
        step.startTime = new Date();

        // Simulate step execution time
        const stepDuration = (plan.estimatedTime / plan.steps.length) * 1000;
        await this.delay(stepDuration);

        // Simulate occasional step failures (3%)
        if (Math.random() < 0.03) {
          step.status = 'failed';
          step.error = {
            code: this.getRandomErrorCode(),
            message: `${step.action} failed: ${this.getRandomErrorReason()}`,
            recoverable: Math.random() > 0.5,
            suggestedAction: 'Retry execution or try a different model'
          };
          step.endTime = new Date();

          plan.status = 'failed';
          plan.completedAt = new Date();

          logger.error('Step failed', {
            planId,
            stepId: step.id,
            error: step.error.message
          });

          return;
        }

        // Step completed successfully
        step.status = 'completed';
        step.endTime = new Date();
        step.output = this.generateStepOutput(step, plan);

        // Update overall progress
        plan.progress = Math.round(((i + 1) / plan.steps.length) * 100);

        logger.debug('Step completed', {
          planId,
          stepId: step.id,
          progress: plan.progress
        });
      }

      // All steps completed
      plan.status = 'completed';
      plan.progress = 100;
      plan.completedAt = new Date();

      logger.info('Execution completed', {
        planId,
        duration: plan.completedAt.getTime() - (plan.startedAt?.getTime() || 0)
      });

    } catch (error) {
      plan.status = 'failed';
      plan.completedAt = new Date();
      logger.error('Execution failed', { planId, error });
    }
  }

  /**
   * Generate step output (mock data)
   */
  private generateStepOutput(step: ExecutionStep, plan: ExecutionPlan): any {
    const brief = this.getBriefForPlan(plan);

    switch (step.agent) {
      case 'writer':
        return {
          text: `Generated text for ${brief.capability}`,
          wordCount: 500
        };

      case 'visual_creator':
      case 'video_composer':
        return {
          fileId: this.generateId(),
          url: `https://storage.supabase.co/generated/${plan.id}.${this.getFileExtension(brief.type)}`,
          size: Math.random() * 10000000
        };

      default:
        return { status: 'completed' };
    }
  }

  /**
   * Generate mock result
   */
  private generateResult(plan: ExecutionPlan): ProjectResult {
    const brief = this.getBriefForPlan(plan);

    const files: ResultFile[] = [{
      id: this.generateId(),
      type: brief.type as any,
      url: `https://storage.supabase.co/generated/${plan.id}.${this.getFileExtension(brief.type)}`,
      filename: `${brief.capability.toLowerCase()}_${Date.now()}.${this.getFileExtension(brief.type)}`,
      size: Math.floor(Math.random() * 10000000),
      mimeType: this.getMimeType(brief.type),
      duration: brief.type === 'video' ? parseInt(brief.requirements.duration || '30') : undefined,
      resolution: brief.requirements.resolution,
      aspectRatio: brief.requirements.aspectRatio,
      thumbnail: brief.type === 'video' ? `https://storage.supabase.co/thumbs/${plan.id}.jpg` : undefined
    }];

    return {
      files,
      metadata: {
        modelsUsed: [plan.primaryModel.name],
        totalCost: plan.estimatedCost,
        costBreakdown: [{
          step: 'generation',
          model: plan.primaryModel.name,
          cost: plan.estimatedCost,
          currency: 'USD'
        }],
        generationTime: plan.estimatedTime,
        totalSteps: plan.steps.length,
        capability: brief.capability,
        qualityScore: 85 + Math.floor(Math.random() * 15) // 85-100
      },
      previews: brief.type === 'video' ? [{
        type: 'gif',
        url: `https://storage.supabase.co/previews/${plan.id}.gif`,
        width: 480,
        height: 270
      }] : undefined
    };
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFileExtension(type: string): string {
    const extensions: Record<string, string> = {
      'video': 'mp4',
      'image': 'png',
      'audio': 'mp3',
      'text': 'txt',
      'design': 'png',
      'multimedia': 'pdf'
    };
    return extensions[type] || 'bin';
  }

  private getMimeType(type: string): string {
    const mimeTypes: Record<string, string> = {
      'video': 'video/mp4',
      'image': 'image/png',
      'audio': 'audio/mpeg',
      'text': 'text/plain',
      'design': 'image/png',
      'multimedia': 'application/pdf'
    };
    return mimeTypes[type] || 'application/octet-stream';
  }

  private getRandomErrorReason(): string {
    const reasons = [
      'Model timeout',
      'Invalid parameters',
      'Rate limit exceeded',
      'Service temporarily unavailable',
      'Content policy violation',
      'Insufficient credits'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getRandomErrorCode(): string {
    const codes = [
      'MODEL_TIMEOUT',
      'INVALID_PARAMS',
      'RATE_LIMIT',
      'SERVICE_UNAVAILABLE',
      'POLICY_VIOLATION',
      'INSUFFICIENT_CREDITS'
    ];
    return codes[Math.floor(Math.random() * codes.length)];
  }

  private getRandomMissingField(): string {
    const fields = ['style', 'aspectRatio', 'duration', 'description'];
    return fields[Math.floor(Math.random() * fields.length)];
  }

  private calculateStepProgress(step: ExecutionStep): number {
    if (!step.startTime) return 0;
    if (step.status === 'completed') return 100;

    // Simulate progressive completion
    const elapsed = Date.now() - step.startTime.getTime();
    const progress = Math.min(95, Math.floor((elapsed / 1000) * 10)); // ~10% per second, max 95%
    return progress;
  }

  private calculateEstimatedCompletion(plan: ExecutionPlan): Date | undefined {
    if (!plan.startedAt || plan.status !== 'in_progress') return undefined;

    const elapsed = Date.now() - plan.startedAt.getTime();
    const estimated = plan.estimatedTime * 1000;
    const remaining = estimated - elapsed;

    return new Date(Date.now() + Math.max(0, remaining));
  }

  private getStepMessage(step: ExecutionStep, briefId: string): string {
    const messages: Record<string, string> = {
      'generate_text': 'Writing content...',
      'generate_story': 'Creating story...',
      'create_storyboard': 'Planning scenes...',
      'generate_illustrations': 'Creating illustrations...',
      'generate_video': 'Generating video...',
      'generate_image': 'Creating image...',
      'assemble_book': 'Assembling final book...'
    };

    return messages[step.action] || `Executing ${step.action}...`;
  }

  private getBriefForPlan(plan: ExecutionPlan): ProjectBrief {
    // In real implementation, would fetch from database
    // For mock, construct minimal brief from plan data
    return {
      id: plan.briefId,
      sessionId: 'mock-session',
      userId: 'mock-user',
      capability: 'GENERATE_IMAGE' as CreativeCapability, // Would be stored properly
      type: 'image',
      requirements: {},
      context: { description: '' },
      rawConversation: [],
      createdAt: plan.createdAt,
      language: 'it'
    };
  }
}
