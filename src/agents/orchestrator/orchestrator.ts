import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../../utils/logger';
import { RagTools } from './tools/rag-tools';
import { AgentTools } from './tools/agent-tools';
import { MediaTools } from './tools/media-tools';
import { detectCognitiveProfile, type CognitiveProfile } from './src/personality/personality-system';

const logger = createLogger('Orchestrator');

interface OrchestratorConfig {
  model: 'claude-sonnet-4-5-20250929' | 'claude-opus-4-20250514';
  cacheTTL: number; // seconds (3600 = 1 hour)
  maxRetries: number;
  parallelVisualGen: boolean;
  maxParallelTasks: number;
}

interface VideoCreationRequest {
  message: string;
  projectId?: string;
  campaignId?: string;
  retryCount?: number;
}

interface VideoCreationResult {
  taskId: string;
  projectId: string;
  videoUrl: string;
  status: 'processing' | 'completed' | 'failed';
  cost: {
    tokens: number;
    dollars: number;
  };
}

interface UserContext {
  similarProjects: any[];
  files: any[];
  campaigns: any[];
  preferences: any[];
  totalProjects: number;
  cognitiveProfile?: CognitiveProfile;
}

export class Orchestrator {
  private client: Anthropic;
  private ragTools: RagTools;
  private agentTools: AgentTools;
  private mediaTools: MediaTools;
  
  constructor(private config: OrchestratorConfig) {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
    
    this.ragTools = new RagTools();
    this.agentTools = new AgentTools();
    this.mediaTools = new MediaTools();
  }
  
  /**
   * Main entry point for video creation requests
   */
  async processRequest(
    userId: string,
    request: VideoCreationRequest
  ): Promise<VideoCreationResult> {
    const taskId = this.generateTaskId();
    
    logger.info('Processing request', {
      userId,
      taskId,
      message: request.message
    });
    
    try {
      // Step 1: Load user context via RAG
      const userContext = await this.loadUserContext(userId, request);
      
      // Step 2: Run agent with Anthropic SDK
      const result = await this.runAgent(userId, taskId, request, userContext);
      
      // Step 3: Save results and generate embedding
      // TODO: Implement project save + embedding generation
      
      // Step 4: Track costs
      await this.trackCosts(taskId, userId, result);
      
      return {
        taskId,
        projectId: result.projectId,
        videoUrl: result.videoUrl,
        status: 'completed',
        cost: result.cost
      };
      
    } catch (error) {
      logger.error('Request failed', { userId, taskId, error });
      
      // Retry logic
      if (this.shouldRetry(error) && (request.retryCount || 0) < this.config.maxRetries) {
        logger.info('Retrying request', { taskId, retryCount: (request.retryCount || 0) + 1 });
        
        await this.delay(this.calculateBackoff(request.retryCount || 0));
        
        return this.processRequest(userId, {
          ...request,
          retryCount: (request.retryCount || 0) + 1
        });
      }
      
      throw error;
    }
  }
  
  /**
   * Load user's historical context via RAG
   */
  private async loadUserContext(
    userId: string,
    request: VideoCreationRequest
  ): Promise<UserContext> {
    logger.info('Loading user context', { userId });

    // Detect cognitive profile from user's message
    const cognitiveProfile = detectCognitiveProfile(request.message);
    logger.info('Cognitive profile detected', {
      userId,
      profile: cognitiveProfile
    });

    const [similarProjects, files, campaigns, preferences] = await Promise.all([
      this.ragTools.searchSimilarProjects(userId, request.message, 5),
      this.ragTools.findRelevantFiles(userId, request.message),
      this.ragTools.getActiveCampaigns(userId),
      this.ragTools.getUserPreferences(userId)
    ]);

    return {
      similarProjects,
      files,
      campaigns,
      preferences,
      totalProjects: (similarProjects || []).length,
      cognitiveProfile
    };
  }
  
  /**
   * Run Anthropic agent with tools
   */
  private async runAgent(
    userId: string,
    taskId: string,
    request: VideoCreationRequest,
    context: UserContext
  ): Promise<any> {
    logger.info('Running Anthropic agent', { taskId });
    
    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(context);
    
    // Define tools
    const tools = this.defineTools();
    
    // Run agent
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          
        }
      ],
      messages: [
        {
          role: 'user',
          content: request.message
        }
      ],
      tools: tools as any
    });
    
    // Process tool calls and return result
    // TODO: Implement tool call orchestration loop
    
    return {
      projectId: 'proj_' + taskId,
      videoUrl: 'https://placeholder.com/video.mp4',
      cost: {
        tokens: response.usage.input_tokens + response.usage.output_tokens,
        dollars: this.calculateCost(response.usage)
      }
    };
  }
  
  /**
   * Build system prompt with tools and context
   */
  private buildSystemPrompt(context: UserContext): string {
    const hasHistory = context.totalProjects > 0;
    const profile = context.cognitiveProfile;

    // Adapt conversation style based on cognitive profile
    let conversationStyle = '';
    if (profile) {
      if (profile.ageGroup === 'child') {
        conversationStyle = `
CONVERSATION STYLE (ADAPTED FOR YOUNG USER):
- Use enthusiastic, simple language
- Explain concepts in easy-to-understand terms
- Celebrate creativity and imagination
- Use friendly, encouraging tone
- Avoid technical jargon`;
      } else if (profile.expertise === 'advanced') {
        conversationStyle = `
CONVERSATION STYLE (ADAPTED FOR EXPERT):
- Use precise, technical language
- Reference advanced concepts when relevant
- Be concise and efficient
- Challenge assumptions constructively
- Suggest creative alternatives`;
      } else {
        conversationStyle = `
CONVERSATION STYLE:
- Friendly but not overly casual
- Professional but approachable
- Slightly ironic but never sarcastic
- Ask clarifying questions when requests are vague
- Challenge cliché ideas constructively`;
      }
    } else {
      conversationStyle = `
CONVERSATION STYLE:
- Friendly, professional, concise
- Ask clarifying questions when needed
- Confirm before expensive operations (video generation)
- Celebrate successes, empathize with issues`;
    }

    return `
You are the AIDA Orchestrator, the intelligent coordinator for AI video creation.

YOUR ROLE:
- Understand user intent for video creation
- Search user's project history for relevant context
- Coordinate specialized sub-agents to create videos
- Provide conversational, helpful guidance

USER CONTEXT:
${hasHistory ? `
- Total past projects: ${context.totalProjects}
- Active campaigns: ${context.campaigns.length}
- Similar projects found: ${context.similarProjects.length}
${context.similarProjects.length > 0 ? `
Most similar: "${context.similarProjects[0]?.title}" (${Math.round(context.similarProjects[0]?.similarity * 100)}% match)
` : ''}
` : '- First-time user, no history'}
${profile ? `
USER PROFILE:
- Age group: ${profile.ageGroup}
- Complexity level: ${profile.complexity}
- Expertise: ${profile.expertise || 'intermediate'}
` : ''}

AVAILABLE SUB-AGENTS:
1. Writer Agent: Creates video scripts from briefs
2. Director Agent: Converts scripts to storyboards
3. Visual Creator: Generates images via Midjourney
4. Video Composer: Assembles final video with Kling

WORKFLOW:
1. When user requests video, search their history first
2. If similar projects found, suggest reusing parameters
3. If user confirms, spawn agents in sequence:
   Writer → Director → Visual Creator → Video Composer
4. Track progress and inform user at each step
5. Handle failures gracefully with retries

${conversationStyle}

PERSONALITY GUIDELINES:
- NEVER use excessive exclamation marks (max 1 per response)
- Be critical but constructive when ideas are vague or cliché
- Don't be overly compliant - suggest improvements
- Balance encouragement with honest feedback
- Adapt complexity based on user's language patterns

COST AWARENESS:
- Video generation costs ~$2.50 per video
- Suggest iterations on existing videos when possible
- Use extended caching for similar requests
    `.trim();
  }
  
  /**
   * Define all tools available to the Orchestrator
   */
  private defineTools() {
    return [
      // RAG Tools
      {
        name: 'search_similar_projects',
        description: 'Search user past projects by semantic similarity',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'What the user is looking for'
            },
            limit: {
              type: 'number',
              description: 'Max results (default 5)',
              default: 5
            }
          },
          required: ['query']
        }
      },
      
      {
        name: 'find_user_file',
        description: 'Find uploaded files by content description',
        input_schema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Description of file content'
            },
            fileType: {
              type: 'string',
              enum: ['text', 'image', 'video'],
              description: 'Type of file to search'
            }
          },
          required: ['description']
        }
      },
      
      {
        name: 'load_campaign_context',
        description: 'Load all context for a themed campaign',
        input_schema: {
          type: 'object',
          properties: {
            campaignName: {
              type: 'string',
              description: 'Name of campaign (e.g. "Campagna Food Q1")'
            }
          },
          required: ['campaignName']
        }
      },
      
      // Agent Spawning Tools
      {
        name: 'spawn_writer_agent',
        description: 'Generate video script with Writer sub-agent',
        input_schema: {
          type: 'object',
          properties: {
            brief: {
              type: 'string',
              description: 'Video brief/description'
            },
            style: {
              type: 'object',
              description: 'Style reference (SREF code + metadata)'
            },
            duration: {
              type: 'number',
              description: 'Video duration in seconds',
              default: 30
            },
            tone: {
              type: 'string',
              description: 'Desired tone (professional, casual, energetic, etc)'
            }
          },
          required: ['brief', 'style']
        }
      },
      
      {
        name: 'spawn_director_agent',
        description: 'Generate storyboard from script with Director sub-agent',
        input_schema: {
          type: 'object',
          properties: {
            script: {
              type: 'string',
              description: 'Video script from Writer'
            },
            style: {
              type: 'object',
              description: 'Style reference'
            },
            frames: {
              type: 'number',
              description: 'Number of storyboard frames',
              default: 6
            }
          },
          required: ['script', 'style']
        }
      },
      
      // Media Generation Tools
      {
        name: 'generate_images_midjourney',
        description: 'Generate images via Midjourney (KIE.AI)',
        input_schema: {
          type: 'object',
          properties: {
            prompts: {
              type: 'array',
              items: { type: 'string' },
              description: 'Image generation prompts from storyboard'
            },
            srefCode: {
              type: 'string',
              description: 'SREF style code to apply'
            },
            parallel: {
              type: 'boolean',
              description: 'Generate in parallel (faster but higher load)',
              default: true
            }
          },
          required: ['prompts', 'srefCode']
        }
      },
      
      {
        name: 'generate_video_kling',
        description: 'Generate final video via Kling (FAL.AI)',
        input_schema: {
          type: 'object',
          properties: {
            images: {
              type: 'array',
              items: { type: 'string' },
              description: 'Image URLs from Midjourney'
            },
            duration: {
              type: 'number',
              description: 'Target duration in seconds'
            },
            aspectRatio: {
              type: 'string',
              enum: ['16:9', '9:16', '1:1'],
              description: 'Video aspect ratio'
            }
          },
          required: ['images', 'duration']
        }
      }
    ];
  }
  
  /**
   * Determine if error should trigger retry
   */
  private shouldRetry(error: any): boolean {
    if (!error) return false;
    
    const code = error.code || error.status;
    const message = error.message || '';
    
    // Retry on these
    if (code === 429) return true; // Rate limit
    if (code === 'ETIMEDOUT') return true;
    if (code === 'ECONNRESET') return true;
    if (message.includes('temporary')) return true;
    
    // Don't retry on these
    if (code === 401 || code === 403) return false; // Auth
    if (code === 400) return false; // Bad request
    if (message.includes('quota')) return false;
    
    return false;
  }
  
  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const multiplier = 2;
    return baseDelay * Math.pow(multiplier, attempt);
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Calculate cost from token usage
   */
  private calculateCost(usage: { input_tokens: number; output_tokens: number }): number {
    const inputCost = (usage.input_tokens / 1_000_000) * 3; // $3/M tokens
    const outputCost = (usage.output_tokens / 1_000_000) * 15; // $15/M tokens
    return inputCost + outputCost;
  }
  
  /**
   * Track costs to database
   */
  private async trackCosts(taskId: string, userId: string, result: any): Promise<void> {
    // TODO: Implement cost tracking to database
    logger.info('Cost tracked', {
      taskId,
      userId,
      cost: result.cost
    });
  }
}
