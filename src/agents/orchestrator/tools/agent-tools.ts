import { createLogger } from '../../../utils/logger';

const logger = createLogger('AgentTools');

interface StyleReference {
  id: string;
  name: string;
  code: string;
}

interface WriterAgentParams {
  brief: string;
  style: StyleReference;
  duration?: number;
  tone?: string;
  context?: any;
}

interface WriterAgentResult {
  script: string;
  metadata: {
    agentUsed: 'WriterAgent';
    duration: number;
    wordsCount: number;
  };
}

interface DirectorAgentParams {
  script: string;
  style: StyleReference;
  frames?: number;
}

interface DirectorAgentResult {
  storyboard: StoryboardFrame[];
  metadata: {
    agentUsed: 'DirectorAgent';
    framesCount: number;
  };
}

interface StoryboardFrame {
  frameNumber: number;
  description: string;
  visualPrompt: string;
  action: string;
  dialogue?: string;
}

export class AgentTools {
  constructor() {}
  
  /**
   * Spawn Writer sub-agent to generate script
   */
  async spawnWriterAgent(params: WriterAgentParams): Promise<WriterAgentResult> {
    logger.info('Spawning Writer Agent', {
      briefLength: params.brief.length,
      style: params.style.name
    });
    
    try {
      // Enrich brief with context if available
      const enrichedBrief = params.context
        ? this.enrichBriefWithContext(params.brief, params.context)
        : params.brief;
      
      // TODO: Call existing Writer Agent from /backend/ai-agents/writer/
      // For now, return mock data
      const script = this.generateMockScript(enrichedBrief, params.duration || 30);
      
      logger.info('Writer Agent completed', {
        scriptLength: script.length
      });
      
      return {
        script,
        metadata: {
          agentUsed: 'WriterAgent',
          duration: params.duration || 30,
          wordsCount: script.split(' ').length
        }
      };
      
    } catch (error) {
      logger.error('Writer Agent failed', { error });
      throw new AgentError('Writer Agent failed', error);
    }
  }
  
  /**
   * Spawn Director sub-agent to generate storyboard
   */
  async spawnDirectorAgent(params: DirectorAgentParams): Promise<DirectorAgentResult> {
    logger.info('Spawning Director Agent', {
      scriptLength: params.script.length,
      frames: params.frames || 6
    });
    
    try {
      // TODO: Call existing Director Agent from /backend/ai-agents/director/
      // For now, return mock data
      const storyboard = this.generateMockStoryboard(
        params.script,
        params.frames || 6
      );
      
      logger.info('Director Agent completed', {
        framesGenerated: storyboard.length
      });
      
      return {
        storyboard,
        metadata: {
          agentUsed: 'DirectorAgent',
          framesCount: storyboard.length
        }
      };
      
    } catch (error) {
      logger.error('Director Agent failed', { error });
      throw new AgentError('Director Agent failed', error);
    }
  }
  
  /**
   * Enrich brief with context from similar projects
   */
  private enrichBriefWithContext(brief: string, context: any): string {
    if (!context || !context.similarProjects || context.similarProjects.length === 0) {
      return brief;
    }
    
    const similar = context.similarProjects[0];
    
    return `
${brief}

CONTEXT FROM SIMILAR PROJECT:
- Previous project: "${similar.title}"
- Style used: ${similar.style?.name} (${similar.style?.code})
- Similarity: ${Math.round(similar.similarity * 100)}%

Please maintain consistency with the previous project's tone and style.
    `.trim();
  }
  
  /**
   * Generate mock script (temporary until Writer Agent integrated)
   */
  private generateMockScript(brief: string, duration: number): string {
    return `
[OPENING - 0:00]
Captivating hook that introduces the main theme.

[MAIN CONTENT - 0:05]
${brief}

Development of key points with engaging narrative.

[CALL TO ACTION - 0:${duration - 5}]
Strong conclusion with clear next steps.

[CLOSING - 0:${duration}]
Brand message and contact information.
    `.trim();
  }
  
  /**
   * Generate mock storyboard (temporary until Director Agent integrated)
   */
  private generateMockStoryboard(script: string, frameCount: number): StoryboardFrame[] {
    const frames: StoryboardFrame[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      frames.push({
        frameNumber: i + 1,
        description: `Frame ${i + 1} description from script`,
        visualPrompt: `Visual prompt for frame ${i + 1}`,
        action: `Action happening in frame ${i + 1}`,
        dialogue: i === 0 ? 'Opening dialogue' : undefined
      });
    }
    
    return frames;
  }
}

class AgentError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = 'AgentError';
  }
}
