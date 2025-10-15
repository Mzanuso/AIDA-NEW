import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Orchestrator } from '../orchestrator';
import { RagTools } from '../tools/rag-tools';
import Anthropic from '@anthropic-ai/sdk';


// Mock dependencies
vi.mock('../tools/rag-tools');
vi.mock('../tools/agent-tools');

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          id: 'msg_test123',
          type: 'message',
          role: 'assistant',
          content: [{
            type: 'text',
            text: JSON.stringify({
              projectId: 'proj_test',
              taskId: 'task_test',
              status: 'completed',
              agentPlan: {
                styleSelector: { status: 'completed' },
                writer: { status: 'completed' },
                director: { status: 'completed' },
                visualCreator: { status: 'completed' }
              }
            })
          }],
          model: 'claude-sonnet-4-5-20250929',
          stop_reason: 'end_turn',
          usage: { input_tokens: 100, output_tokens: 200 }
        })
      }
    }))
  };
});

vi.mock('../tools/media-tools');

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;
  let searchSpy: ReturnType<typeof vi.spyOn>;
  let filesSpy: ReturnType<typeof vi.spyOn>;
  let campaignsSpy: ReturnType<typeof vi.spyOn>;
  let prefsSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Setup fresh spies BEFORE creating orchestrator
    searchSpy = vi.spyOn(RagTools.prototype, 'searchSimilarProjects').mockResolvedValue([]);
    filesSpy = vi.spyOn(RagTools.prototype, 'findRelevantFiles').mockResolvedValue([]);
    campaignsSpy = vi.spyOn(RagTools.prototype, 'getActiveCampaigns').mockResolvedValue([]);
    prefsSpy = vi.spyOn(RagTools.prototype, 'getUserPreferences').mockResolvedValue([]);

    orchestrator = new Orchestrator({
      model: 'claude-sonnet-4-5-20250929',
      cacheTTL: 3600,
      maxRetries: 3,
      parallelVisualGen: true,
      maxParallelTasks: 4
    });
  });

  afterEach(() => {
    // Clean up spies after each test
    searchSpy?.mockRestore();
    filesSpy?.mockRestore();
    campaignsSpy?.mockRestore();
    prefsSpy?.mockRestore();
  });

  describe('processRequest', () => {
    test('should process request successfully for new user', async () => {
      const result = await orchestrator.processRequest('user_new', {
        message: 'Create a video for my restaurant'
      });

      expect(result).toHaveProperty('taskId');
      expect(result).toHaveProperty('projectId');
      expect(result.status).toBe('completed');
    });

    test('should load context for returning user', async () => {
      const mockSimilarProjects = [{
        id: 'proj_123',
        title: 'Restaurant Mario',
        brief: 'Food video',
        style: { id: 'style_1', name: 'Minimale', code: 'SREF_123' },
        videoUrl: 'https://...',
        similarity: 0.95,
        createdAt: new Date()
      }];

      searchSpy.mockResolvedValue(mockSimilarProjects);

      const result = await orchestrator.processRequest('user_123', {
        message: 'Make a video like Restaurant Mario'
      });

      expect(result).toHaveProperty('taskId');
      expect(searchSpy).toHaveBeenCalledWith(
        'user_123',
        expect.any(String),
        5
      );
    });

    test('should retry on temporary failures', async () => {
      // First call fails, second succeeds - need proper error with code property
      const timeoutError = new Error('ETIMEDOUT');
      (timeoutError as any).code = 'ETIMEDOUT';

      // Must use mockImplementation to track calls properly with retries
      let callCount = 0;
      searchSpy.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw timeoutError;
        }
        return [];
      });

      const result = await orchestrator.processRequest('user_123', {
        message: 'Test message'
      });

      expect(result.status).toBe('completed');
      expect(callCount).toBe(2);
    });

    test('should not retry on auth errors', async () => {
      const authError = new Error('Unauthorized');
      (authError as any).code = 401;

      searchSpy.mockRejectedValue(authError);

      await expect(
        orchestrator.processRequest('user_123', { message: 'Test' })
      ).rejects.toThrow('Unauthorized');

      expect(searchSpy).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('shouldRetry', () => {
    test('should retry on rate limit (429)', () => {
      const error = { code: 429 };
      expect((orchestrator as any).shouldRetry(error)).toBe(true);
    });
    
    test('should retry on timeout', () => {
      const error = { code: 'ETIMEDOUT' };
      expect((orchestrator as any).shouldRetry(error)).toBe(true);
    });
    
    test('should not retry on auth error', () => {
      const error = { code: 401 };
      expect((orchestrator as any).shouldRetry(error)).toBe(false);
    });
    
    test('should not retry on bad request', () => {
      const error = { code: 400 };
      expect((orchestrator as any).shouldRetry(error)).toBe(false);
    });
  });
  
  describe('calculateBackoff', () => {
    test('should calculate exponential backoff correctly', () => {
      expect((orchestrator as any).calculateBackoff(0)).toBe(1000);  // 1s
      expect((orchestrator as any).calculateBackoff(1)).toBe(2000);  // 2s
      expect((orchestrator as any).calculateBackoff(2)).toBe(4000);  // 4s
    });
  });
});
