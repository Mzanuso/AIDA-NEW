/**
 * Technical Planner API Routes
 *
 * Endpoints for project planning and execution
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { TechnicalPlannerWorkflow } from './TechnicalPlannerWorkflow';
import { DirectorClient } from './director-client';
import type { ProjectBrief } from './types';
import type { MultiVariantRequest } from '../director/types';

const router = Router();
const workflow = new TechnicalPlannerWorkflow();
const directorClient = new DirectorClient();

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

/**
 * POST /api/concept-debate
 * Feature 3: Multi-Agent Creative Debate
 *
 * Generate 3 diverse video concepts with different creative philosophies:
 * - Emotional: Story-driven, human connection
 * - Disruptive: Bold, unconventional, norm-breaking
 * - Data-Driven: Metrics-backed, proven patterns
 *
 * Request body:
 * {
 *   brief: string;
 *   product?: string;
 *   target_audience?: string;
 *   duration?: number;
 *   synthesize_best?: boolean; // Optional: create 4th "best of all" concept
 * }
 *
 * Response: Multi Variant Result with all 3 concepts + recommendation
 */
router.post('/concept-debate', async (req: Request, res: Response) => {
  try {
    const { brief, product, target_audience, duration, synthesize_best } =
      req.body;

    // Validation
    if (!brief || typeof brief !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "brief" field',
      });
    }

    // Build multi-variant request
    const request: MultiVariantRequest = {
      brief,
      product,
      target_audience,
      duration: duration || 30,
      generate_all_variants: true,
      synthesize_best: synthesize_best || false,
    };

    // Call Director Agent for multi-variant generation
    const result = await directorClient.generateMultiVariant(request);

    // Return result
    return res.status(200).json({
      success: true,
      data: {
        emotional_concept: {
          summary: result.variants.emotional.concept_summary,
          reasoning: result.variants.emotional.reasoning,
          storyboard: result.variants.emotional.storyboard,
          impact: result.variants.emotional.estimated_impact,
        },
        disruptive_concept: {
          summary: result.variants.disruptive.concept_summary,
          reasoning: result.variants.disruptive.reasoning,
          storyboard: result.variants.disruptive.storyboard,
          impact: result.variants.disruptive.estimated_impact,
        },
        dataDriven_concept: {
          summary: result.variants.dataDriven.concept_summary,
          reasoning: result.variants.dataDriven.reasoning,
          storyboard: result.variants.dataDriven.storyboard,
          impact: result.variants.dataDriven.estimated_impact,
        },
        synthesis: result.synthesis
          ? {
              summary: result.synthesis.concept_summary,
              reasoning: result.synthesis.reasoning,
              storyboard: result.synthesis.storyboard,
              impact: result.synthesis.estimated_impact,
            }
          : undefined,
        recommendation: result.recommendation,
        total_generation_time_ms: result.total_generation_time_ms,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/concept-debate:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
