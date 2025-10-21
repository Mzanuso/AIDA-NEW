/**
 * Visual Creator API Routes
 *
 * Endpoints for AI image generation execution
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { VisualCreatorExecutor } from './visual-creator-executor';
import type { WorkflowExecutionPlan, WorkflowResult } from '../../shared/types';

const router = Router();
const executor = new VisualCreatorExecutor();

/**
 * POST /api/execute
 * Execute WorkflowExecutionPlan
 *
 * Request body: WorkflowExecutionPlan
 * Response: WorkflowResult with generated images
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const plan: WorkflowExecutionPlan = req.body;

    // Validate required fields
    if (!plan.planId || !plan.steps || plan.steps.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid WorkflowExecutionPlan: missing planId or steps'
      });
    }

    // Execute the workflow
    const result: WorkflowResult = await executor.execute(plan);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in /api/execute:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/execute/step
 * Execute a single workflow step
 *
 * Request body: WorkflowStep
 * Response: WorkflowStepResult
 */
router.post('/execute/step', async (req: Request, res: Response) => {
  try {
    const step = req.body;

    if (!step.stepId || !step.model) {
      return res.status(400).json({
        success: false,
        error: 'Invalid WorkflowStep: missing stepId or model'
      });
    }

    // Create a single-step plan
    const plan: WorkflowExecutionPlan = {
      planId: `single-step-${Date.now()}`,
      steps: [step],
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'api'
      }
    };

    const result = await executor.execute(plan);

    // Return only the first step result
    const stepResult = result.stepResults[0];

    return res.status(200).json({
      success: true,
      data: stepResult
    });
  } catch (error: any) {
    console.error('Error in /api/execute/step:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/models
 * Get list of supported AI models
 */
router.get('/models', (req: Request, res: Response) => {
  const models = [
    {
      id: 'flux-pro-1.1',
      name: 'FLUX Pro 1.1',
      provider: 'fal.ai',
      type: 'image',
      capabilities: ['high_quality', 'fast', 'photorealistic']
    },
    {
      id: 'flux-schnell',
      name: 'FLUX Schnell',
      provider: 'fal.ai',
      type: 'image',
      capabilities: ['ultra_fast', 'draft_quality']
    },
    {
      id: 'seedream-4.0',
      name: 'SeeDream 4.0',
      provider: 'fal.ai',
      type: 'image',
      capabilities: ['artistic', 'stylized']
    },
    {
      id: 'ideogram-v2',
      name: 'Ideogram V2',
      provider: 'fal.ai',
      type: 'image',
      capabilities: ['text_rendering', 'logos', 'typography']
    },
    {
      id: 'recraft-v3',
      name: 'Recraft V3',
      provider: 'fal.ai',
      type: 'image',
      capabilities: ['vector_style', 'illustrations']
    },
    {
      id: 'midjourney-v6',
      name: 'Midjourney V6',
      provider: 'kie.ai',
      type: 'image',
      capabilities: ['artistic', 'high_quality', 'creative']
    },
    {
      id: 'hunyuan-video',
      name: 'Hunyuan Video',
      provider: 'fal.ai',
      type: 'video',
      capabilities: ['text_to_video', 'short_clips']
    }
  ];

  return res.status(200).json({
    success: true,
    data: {
      models,
      total: models.length
    }
  });
});

/**
 * GET /api/providers
 * Get list of API providers
 */
router.get('/providers', (req: Request, res: Response) => {
  const providers = [
    {
      id: 'fal.ai',
      name: 'FAL.AI',
      endpoint: 'https://queue.fal.run',
      status: 'active',
      rate_limit: '10 req/sec'
    },
    {
      id: 'kie.ai',
      name: 'KIE.AI',
      endpoint: 'https://api.kie.ai/v1',
      status: 'active',
      rate_limit: '2 req/sec'
    }
  ];

  return res.status(200).json({
    success: true,
    data: {
      providers,
      total: providers.length
    }
  });
});

export default router;
