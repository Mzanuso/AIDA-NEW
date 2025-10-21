/**
 * Technical Planner API Routes
 *
 * Endpoints for project planning and execution
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { TechnicalPlannerWorkflow } from './TechnicalPlannerWorkflow';
import type { ProjectBrief } from './types';

const router = Router();
const workflow = new TechnicalPlannerWorkflow();

/**
 * POST /api/plan
 * Create technical plan from ProjectBrief
 *
 * Request body: ProjectBrief
 * Response: WorkflowState with TechnicalPlan, ModelSelections, CostEstimate
 */
router.post('/plan', async (req: Request, res: Response) => {
  try {
    const projectBrief: ProjectBrief = req.body;

    // Validate required fields
    if (!projectBrief.id || !projectBrief.user_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, user_id'
      });
    }

    if (!projectBrief.requirements || projectBrief.requirements.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ProjectBrief must have at least one requirement'
      });
    }

    // Execute full workflow
    const finalState = await workflow.execute(projectBrief);

    // Save to database
    await workflow.saveState(finalState);

    return res.status(200).json({
      success: true,
      data: {
        workflow_state_id: finalState.id,
        status: finalState.status,
        progress_percentage: finalState.progress_percentage,
        technical_plan: finalState.technical_plan,
        model_selections: finalState.model_selections,
        cost_estimate: finalState.cost_estimate,
        execution_steps: finalState.execution_steps
      }
    });
  } catch (error: any) {
    console.error('Error in /api/plan:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/plan/:workflowId
 * Get workflow state by ID
 */
router.get('/plan/:workflowId', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;

    const state = await workflow.loadState(workflowId);

    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: state
    });
  } catch (error: any) {
    console.error('Error in GET /api/plan/:workflowId:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/progress/:workflowId
 * Get progress for a workflow
 */
router.get('/progress/:workflowId', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;

    const state = await workflow.loadState(workflowId);

    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        workflow_id: state.id,
        progress_percentage: state.progress_percentage,
        current_step: state.current_step,
        status: state.status,
        created_at: state.created_at,
        updated_at: state.updated_at
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/progress/:workflowId:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * DELETE /api/plan/:workflowId
 * Delete workflow state (for testing/cleanup)
 */
router.delete('/plan/:workflowId', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;

    const deleted = await workflow.deleteState(workflowId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found or could not be deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/plan/:workflowId:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
