import { describe, it, expect, beforeEach } from 'vitest';
import { ChromaManager } from '../chroma-manager';

describe('ChromaDB Memory System', () => {
  let memory: ChromaManager;

  beforeEach(async () => {
    memory = new ChromaManager();
    await memory.initialize();
  });

  it('should save and retrieve conversation', async () => {
    const data = {
      agentId: 'orchestrator',
      sessionId: 'test-123',
      messages: [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' }
      ]
    };

    await memory.saveConversation(data);
    const retrieved = await memory.getConversation('test-123');

    expect(retrieved).toBeDefined();
    expect(retrieved?.messages).toHaveLength(2);
    expect(retrieved?.messages[0].content).toBe('Hello');
  });

  it('should perform semantic search on conversations', async () => {
    await memory.saveConversation({
      agentId: 'orchestrator',
      sessionId: 'session-1',
      messages: [{ role: 'user' as const, content: 'I want to create a video about cooking' }]
    });

    await memory.saveConversation({
      agentId: 'orchestrator',
      sessionId: 'session-2',
      messages: [{ role: 'user' as const, content: 'Generate an image of a sunset' }]
    });

    const results = await memory.searchSimilar('video', 5);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should handle cross-agent memory access', async () => {
    // Orchestrator saves
    await memory.save('orchestrator', 'session-1', {
      brief: 'Create UGC video',
      style: 'casual'
    });

    // Technical Planner retrieves
    const data = await memory.get('orchestrator', 'session-1');

    expect(data).toBeDefined();
    expect(data.brief).toBe('Create UGC video');
  });

  it('should handle missing data gracefully', async () => {
    const data = await memory.getConversation('non-existent');
    expect(data).toBeNull();
  });
});
