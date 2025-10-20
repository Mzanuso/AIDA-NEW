/**
 * Technical Planner Routes
 *
 * HTTP API endpoints for Technical Planner agent.
 * Receives ProjectBrief, returns ExecutionPlan.
 *
 * @module agents/technical-planner/routes
 */

import { Router } from 'express';
import { TechnicalPlanner } from './technical-planner';
import { createLogger } from '../../utils/logger';
import type { ProjectBrief } from '../../shared/types/project-brief.types';
import type { ExecutionPlan } from '../../shared/types/execution-plan.types';

const router = Router();
const logger = createLogger('TechnicalPlannerRoutes');

// Lazy initialization
let planner: TechnicalPlanner | null = null;

function getPlanner(): TechnicalPlanner {
  if (!planner) {
    logger.info('Initializing Technical Planner');
    planner = new TechnicalPlanner();
  }
  return planner;
}

/**
 * POST /api/agents/technical-planner/plan
 *
 * Create ExecutionPlan from ProjectBrief
 *
 * Request body: ProjectBrief
 * Response: { success: true, data: ExecutionPlan }
 */
router.post('/plan', async (req, res) => {
  const startTime = Date.now();

  try {
    const brief = req.body as ProjectBrief;

    // Validate basic structure
    if (!brief || !brief.id) {
      logger.warn('Invalid request: missing brief or brief.id');
      return res.status(400).json({
        success: false,
        error: 'Invalid request: ProjectBrief required with id field',
        details: [{ field: 'id', message: 'Required field' }]
      });
    }

    logger.info('Planning request received', {
      briefId: brief.id,
      userId: brief.user_id,
      contentType: brief.content_type
    });

    // Create execution plan
    const plan: ExecutionPlan = await getPlanner().plan(brief);

    const duration = Date.now() - startTime;

    logger.info('Plan created successfully', {
      briefId: brief.id,
      planId: plan.id,
      model: plan.primary_model.name,
      cost: plan.total_estimated_cost,
      duration
    });

    // Return success
    res.json({
      success: true,
      data: plan,
      metadata: {
        duration,
        briefId: brief.id,
        planId: plan.id
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Plan creation failed', {
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
 * GET /api/agents/technical-planner/health
 *
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agent: 'technical-planner',
    timestamp: new Date().toISOString()
  });
});

export default router;
