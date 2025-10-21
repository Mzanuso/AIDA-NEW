/**
 * Technical Planner Workflow
 *
 * Core workflow for Technical Planner agent
 * Implements test-first development methodology (MS-025)
 *
 * FIX #1: Using Supabase client (not raw PostgreSQL)
 * FIX #4: Importing ProjectBrief from shared types
 */

import { randomUUID } from 'crypto';
import type {
  ProjectBrief,
  WorkflowState,
  TechnicalPlan,
  AssetRequirement,
  ModelSelection,
  CostEstimate,
  CostBreakdown,
  ExecutionStep,
  WorkflowStep
} from './types';

/**
 * TechnicalPlannerWorkflow
 *
 * Orchestrates the technical planning process:
 * 1. Initialize workflow state
 * 2. Analyze ProjectBrief requirements
 * 3. Create technical plan with asset breakdown
 * 4. Select appropriate AI models (via SmartRouter)
 * 5. Estimate costs and check budget
 * 6. Generate execution steps for Director
 */
export class TechnicalPlannerWorkflow {
  // Store ProjectBrief context for access throughout workflow
  private projectBriefContext: Map<string, ProjectBrief> = new Map();

  /**
   * Initialize a new workflow from ProjectBrief
   */
  async initialize(projectBrief: ProjectBrief): Promise<WorkflowState> {
    // Validation
    if (!projectBrief.id || !projectBrief.user_id) {
      throw new Error('ProjectBrief must have id and user_id');
    }

    if (!projectBrief.requirements || projectBrief.requirements.length === 0) {
      throw new Error('ProjectBrief must have at least one requirement');
    }

    const workflowState: WorkflowState = {
      id: randomUUID(),
      project_brief_id: projectBrief.id,
      user_id: projectBrief.user_id,
      current_step: 'initialized',
      progress_percentage: 0,
      status: 'in_progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store ProjectBrief for later access
    this.projectBriefContext.set(projectBrief.id, projectBrief);

    return workflowState;
  }

  /**
   * Analyze ProjectBrief and identify required assets
   * Progress: 0% → 25%
   */
  async analyzeRequirements(state: WorkflowState): Promise<WorkflowState> {
    // Get ProjectBrief from context
    const projectBrief = this.projectBriefContext.get(state.project_brief_id);
    if (!projectBrief) {
      throw new Error('ProjectBrief not found in context');
    }

    const assets: AssetRequirement[] = [];
    const contentType = projectBrief.content_type;

    if (contentType === 'image') {
      assets.push({
        asset_id: `asset_${randomUUID()}`,
        asset_type: 'image',
        description: 'Main image asset based on requirements',
        specifications: {
          dimensions: '1920x1080',
          format: 'PNG',
          quality_level: 'high'
        },
        agent_assigned: 'visual-creator',
        priority: 1,
        dependencies: []
      });
    } else if (contentType === 'video') {
      // Video requires multiple assets
      assets.push(
        {
          asset_id: `asset_video_${randomUUID()}`,
          asset_type: 'video',
          description: 'Main video sequence',
          specifications: {
            dimensions: '1920x1080',
            duration_seconds: 30,
            format: 'MP4',
            quality_level: 'high'
          },
          agent_assigned: 'video-composer',
          priority: 1,
          dependencies: []
        },
        {
          asset_id: `asset_audio_${randomUUID()}`,
          asset_type: 'audio',
          description: 'Background music',
          specifications: {
            duration_seconds: 30,
            format: 'MP3',
            quality_level: 'standard'
          },
          agent_assigned: 'audio-generator',
          priority: 2,
          dependencies: []
        }
      );
    }

    const technicalPlan: TechnicalPlan = {
      project_id: state.project_brief_id,
      assets,
      workflow_steps: [
        'Analyze requirements',
        'Create technical plan',
        'Select AI models',
        'Estimate costs',
        'Generate execution steps'
      ],
      dependencies: [],
      estimated_duration_minutes: 15,
      complexity_score: assets.length <= 1 ? 3 : 7,
      recommendations: [
        'Single asset workflow - straightforward execution',
        'High quality settings selected based on requirements'
      ]
    };

    return {
      ...state,
      current_step: 'analyzing',
      progress_percentage: 25,
      technical_plan: technicalPlan,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Create detailed technical plan
   * Progress: 25% → 50%
   */
  async createTechnicalPlan(state: WorkflowState): Promise<WorkflowState> {
    if (!state.technical_plan) {
      throw new Error('Cannot create technical plan: analysis not completed');
    }

    // Enhance technical plan with dependencies and execution order
    const assets = state.technical_plan.assets;
    const dependencies = assets.map(asset => ({
      asset_id: asset.asset_id,
      depends_on: asset.dependencies,
      blocking: asset.priority === 1
    }));

    return {
      ...state,
      current_step: 'planning',
      progress_percentage: 50,
      technical_plan: {
        ...state.technical_plan,
        dependencies
      },
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Select appropriate AI models for each asset
   * Progress: 50% → 75%
   *
   * In production: Calls SmartRouter service
   * For testing: Mock selection based on asset type and style preferences
   */
  async selectModels(state: WorkflowState): Promise<WorkflowState> {
    if (!state.technical_plan) {
      throw new Error('Cannot select models: technical plan not created');
    }

    // Get ProjectBrief from context
    const projectBrief = this.projectBriefContext.get(state.project_brief_id);
    if (!projectBrief) {
      throw new Error('ProjectBrief not found in context');
    }

    const modelSelections: ModelSelection[] = [];

    for (const asset of state.technical_plan.assets) {
      let selection: ModelSelection;

      if (asset.asset_type === 'image') {
        // Check if gallery style selected (requires artistic model)
        const requiresArtisticModel = projectBrief.style_preferences?.gallery_selected?.[0]?.requires_artistic_model ?? false;

        selection = {
          asset_id: asset.asset_id,
          model_id: requiresArtisticModel ? 'midjourney-v7' : 'dall-e-3',
          model_name: requiresArtisticModel ? 'Midjourney V7' : 'DALL-E 3',
          provider: requiresArtisticModel ? 'midjourney' : 'openai',
          reasoning: requiresArtisticModel
            ? 'Gallery style selected - requires artistic rendering'
            : 'Text-to-image generation for photorealistic output',
          confidence_score: 0.95,
          fallback_model_id: 'dall-e-3'
        };
      } else if (asset.asset_type === 'video') {
        selection = {
          asset_id: asset.asset_id,
          model_id: 'runway-gen3',
          model_name: 'Runway Gen-3',
          provider: 'runway',
          reasoning: 'Best for high-quality video generation',
          confidence_score: 0.90,
          fallback_model_id: 'pika-1.0'
        };
      } else if (asset.asset_type === 'audio') {
        selection = {
          asset_id: asset.asset_id,
          model_id: 'elevenlabs-music',
          model_name: 'ElevenLabs Music',
          provider: 'elevenlabs',
          reasoning: 'Background music generation',
          confidence_score: 0.85
        };
      } else {
        // Text asset
        selection = {
          asset_id: asset.asset_id,
          model_id: 'claude-3.5-sonnet',
          model_name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          reasoning: 'Best for copywriting and content creation',
          confidence_score: 0.98
        };
      }

      modelSelections.push(selection);
    }

    return {
      ...state,
      current_step: 'selecting_models',
      progress_percentage: 75,
      model_selections: modelSelections,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Estimate costs and check budget constraints
   * Progress: 75% → 100%
   */
  async estimateCosts(state: WorkflowState): Promise<WorkflowState> {
    if (!state.model_selections || !state.technical_plan) {
      throw new Error('Cannot estimate costs: models not selected');
    }

    // Get ProjectBrief from context
    const projectBrief = this.projectBriefContext.get(state.project_brief_id);
    if (!projectBrief) {
      throw new Error('ProjectBrief not found in context');
    }

    const costBreakdown: CostBreakdown[] = [];
    let totalCost = 0;

    for (const selection of state.model_selections) {
      let estimatedCost = 0;

      // Mock cost calculation based on model provider
      switch (selection.provider) {
        case 'midjourney':
          estimatedCost = 0.80; // ~$0.80 per image (GPU time + fast queue)
          break;
        case 'openai':
          estimatedCost = 0.04; // DALL-E 3 pricing
          break;
        case 'runway':
          estimatedCost = 2.50; // ~$2.50 per 30s video
          break;
        case 'elevenlabs':
          estimatedCost = 0.30; // Audio generation
          break;
        case 'anthropic':
          estimatedCost = 0.015; // ~$0.015 per 1000 tokens (estimate)
          break;
        default:
          estimatedCost = 0.10;
      }

      costBreakdown.push({
        asset_id: selection.asset_id,
        model_id: selection.model_id,
        estimated_cost: estimatedCost,
        cost_components: {
          compute: estimatedCost * 0.7,
          api_calls: estimatedCost * 0.3
        }
      });

      totalCost += estimatedCost;
    }

    // Check budget constraints from ProjectBrief
    const maxBudget = projectBrief.budget_constraints?.max_total_cost ?? 10.00;
    const budgetRemaining = maxBudget - totalCost;

    const costEstimate: CostEstimate = {
      total_estimated_cost: totalCost,
      breakdown: costBreakdown,
      budget_status: totalCost <= maxBudget ? 'within_budget' : 'exceeds_budget',
      budget_remaining: budgetRemaining > 0 ? budgetRemaining : undefined,
      warnings: totalCost > maxBudget
        ? [`Estimated cost ($${totalCost.toFixed(2)}) exceeds budget ($${maxBudget.toFixed(2)})`]
        : []
    };

    // Generate execution steps
    const executionSteps: ExecutionStep[] = state.technical_plan.assets.map((asset, index) => ({
      step_id: `step_${index + 1}`,
      step_number: index + 1,
      description: `Generate ${asset.asset_type} asset: ${asset.description}`,
      agent: asset.agent_assigned,
      asset_ids: [asset.asset_id],
      estimated_duration_minutes: asset.asset_type === 'video' ? 10 : 5,
      can_parallelize: asset.dependencies.length === 0,
      depends_on_steps: asset.dependencies.map(depId => {
        const depAsset = state.technical_plan?.assets.find(a => a.asset_id === depId);
        const depIndex = state.technical_plan?.assets.indexOf(depAsset!);
        return `step_${(depIndex ?? 0) + 1}`;
      })
    }));

    return {
      ...state,
      current_step: 'estimating_cost',
      progress_percentage: 100,
      status: 'completed',
      cost_estimate: costEstimate,
      execution_steps: executionSteps,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Full workflow execution (convenience method)
   */
  async execute(projectBrief: ProjectBrief): Promise<WorkflowState> {
    let state = await this.initialize(projectBrief);
    state = await this.analyzeRequirements(state);
    state = await this.createTechnicalPlan(state);
    state = await this.selectModels(state);
    state = await this.estimateCosts(state);
    return state;
  }
}
