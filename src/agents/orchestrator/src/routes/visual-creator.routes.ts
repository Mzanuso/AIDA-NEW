/**
 * Visual Creator Routes
 * 
 * HTTP endpoints for Visual Creator agent integration with Orchestrator.
 * Handles ExecutionPlan execution and returns WorkflowResult.
 * 
 * @module orchestrator/routes/visual-creator
 */

import { Router } from 'express';
import { VisualCreatorBridge } from '../../../../shared/coordination/execution-bridge';
import { VisualCreatorExecutor } from '../../../../agents/visual-creator/visual-creator-executor';
import { createLogger } from '../../../../utils/logger';
import type { ExecutionPlan } from '../../../../shared/types/execution-plan.types';
import type { WorkflowResult } from '../../../../shared/types';

const router = Router();
const logger = createLogger('VisualCreatorRoutes');

// Lazy initialization
let bridge: VisualCreatorBridge | null = null;
let executor: VisualCreatorExecutor | null = null;

function getBridge(): VisualCreatorBridge {
  if (!bridge) {
    logger.info('Initializing Visual Creator Bridge');
    bridge = new VisualCreatorBridge();
  }
  return bridge;
}

function getExecutor(): VisualCreatorExecutor {
  if (!executor) {
    logger.info('Initializing Visual Creator Executor');
    executor = new VisualCreatorExecutor();
  }
  return executor;
}

/**
 * POST /api/agents/visual-creator/execute
 * 
 * Execute an ExecutionPlan through Visual Creator pipeline
 */
router.post('/execute', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate basic structure
    const plan = req.body as ExecutionPlan;
    
    if (!plan || !plan.id) {
      logger.warn('Invalid request: missing plan or plan.id');
      return res.status(400).json({
        success: false,
        error: 'Invalid request: ExecutionPlan required with id field',
        details: [{ field: 'id', message: 'Required field' }]
      });
    }

    // Validate target agent
    if (plan.target_agent !== 'visual_creator') {
      logger.warn('Wrong target agent', { 
        received: plan.target_agent,
        expected: 'visual_creator'
      });
      return res.status(400).json({
        success: false,
        error: `Invalid target_agent: expected 'visual_creator', got '${plan.target_agent}'`,
        details: [{ 
          field: 'target_agent', 
          message: "Must be 'visual_creator'"
        }]
      });
    }

    // Validate required fields
    const requiredFields = [
      'brief_id', 'content_type', 'quality_tier', 
      'approach', 'total_estimated_cost', 'total_estimated_time',
      'primary_model', 'created_at'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in plan));
    
    if (missingFields.length > 0) {
      logger.warn('Missing required fields', { missingFields });
      return res.status(400).json({
        success: false,
        error: 'Invalid ExecutionPlan: missing required fields',
        details: missingFields.map(field => ({
          field,
          message: 'Required field'
        }))
      });
    }

    logger.info('Executing Visual Creator plan', {
      planId: plan.id,
      briefId: plan.brief_id,
      qualityTier: plan.quality_tier,
      approach: plan.approach,
      stepCount: plan.steps?.length || 0
    });

    // Set timeout (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout after 30 seconds')), 30000);
    });

    // Execute with timeout
    const executionPromise = (async () => {
      // Process ExecutionPlan → WorkflowExecutionPlan
      const workflows = await getBridge().process(plan);
      
      if (workflows.length === 0) {
        throw new Error('Bridge returned no workflows');
      }

      // Execute first workflow (most plans have 1 workflow)
      const result = await getExecutor().execute(workflows[0]);
      
      return result;
    })();

    const result: WorkflowResult = await Promise.race([
      executionPromise,
      timeoutPromise
    ]);

    const duration = Date.now() - startTime;

    logger.info('Visual Creator execution complete', {
      planId: plan.id,
      status: result.status,
      stepCount: result.stepResults.length,
      duration,
      totalCost: result.totalCost,
      totalTime: result.totalTime
    });

    // Return success (even for partial_success status)
    res.json({
      success: true,
      data: result,
      metadata: {
        duration,
        planId: plan.id
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Visual Creator execution failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      metadata: {
        duration
      }
    });
  }
});

/**
 * GET /api/agents/visual-creator/health
 * 
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agent: 'visual-creator',
    timestamp: new Date().toISOString()
  });
});

export default router;
