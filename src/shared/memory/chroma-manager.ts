import { ChromaClient, Collection } from 'chromadb';
import { CHROMA_CONFIG } from './config';
import type { ConversationData, MemorySearchResult } from './types';

export class ChromaManager {
  private client: ChromaClient | null = null;
  private collections: Map<string, Collection> = new Map();
  private mockStorage: Map<string, ConversationData> = new Map();
  private useMock: boolean;

  constructor() {
    this.useMock = process.env.CHROMA_USE_MOCK === 'true' || process.env.NODE_ENV === 'test';

    if (!this.useMock) {
      this.client = new ChromaClient({
        path: CHROMA_CONFIG.path
      });
    }
  }

  async initialize(): Promise<void> {
    if (this.useMock) return;

    const conversationCollection = await this.client!.getOrCreateCollection({
      name: CHROMA_CONFIG.collections.conversations,
      metadata: { description: 'User conversations across all agents' }
    });

    this.collections.set('conversations', conversationCollection);
  }

  async saveConversation(data: ConversationData): Promise<void> {
    if (this.useMock) {
      this.mockStorage.set(data.sessionId, data);
      return;
    }

    const collection = this.collections.get('conversations');
    if (!collection) throw new Error('Conversations collection not initialized');

    await collection.upsert({
      ids: [data.sessionId],
      documents: [JSON.stringify(data.messages)],
      metadatas: [{ agentId: data.agentId, sessionId: data.sessionId, timestamp: Date.now() }]
    });
  }

  async getConversation(sessionId: string): Promise<ConversationData | null> {
    if (this.useMock) {
      return this.mockStorage.get(sessionId) || null;
    }

    const collection = this.collections.get('conversations');
    if (!collection) throw new Error('Conversations collection not initialized');

    try {
      const results = await collection.get({ ids: [sessionId] });
      if (!results.documents || results.documents.length === 0) return null;

      const messages = JSON.parse(results.documents[0] as string);
      const metadata = results.metadatas?.[0];

      return {
        agentId: (metadata?.agentId as string) || 'unknown',
        sessionId,
        messages,
        metadata
      };
    } catch (error) {
      return null;
    }
  }

  async searchSimilar(query: string, limit: number = 5): Promise<MemorySearchResult[]> {
    if (this.useMock) {
      const results: MemorySearchResult[] = [];
      for (const [sessionId, data] of this.mockStorage.entries()) {
        const content = JSON.stringify(data.messages);
        if (content.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            sessionId,
            agentId: data.agentId,
            data: data.messages,
            similarity: 0.8
          });
        }
      }
      return results.slice(0, limit);
    }

    const collection = this.collections.get('conversations');
    if (!collection) throw new Error('Conversations collection not initialized');

    const results = await collection.query({ queryTexts: [query], nResults: limit });
    if (!results.documents || results.documents.length === 0) return [];

    return results.ids[0].map((id, index) => ({
      sessionId: id as string,
      agentId: (results.metadatas?.[0]?.[index]?.agentId as string) || 'unknown',
      data: JSON.parse((results.documents[0][index] as string) || '[]'),
      similarity: results.distances?.[0]?.[index] || 0
    }));
  }

  async save(agentId: string, sessionId: string, data: any): Promise<void> {
    if (this.useMock) {
      this.mockStorage.set(`${agentId}-${sessionId}`, {
        agentId,
        sessionId,
        messages: [],
        metadata: data
      });
      return;
    }

    const collection = this.collections.get('conversations');
    if (!collection) throw new Error('Collection not initialized');

    await collection.upsert({
      ids: [`${agentId}-${sessionId}`],
      documents: [JSON.stringify(data)],
      metadatas: [{ agentId, sessionId, timestamp: Date.now() }]
    });
  }

  async get(agentId: string, sessionId: string): Promise<any | null> {
    if (this.useMock) {
      const stored = this.mockStorage.get(`${agentId}-${sessionId}`);
      return stored?.metadata || null;
    }

    const collection = this.collections.get('conversations');
    if (!collection) throw new Error('Collection not initialized');

    try {
      const results = await collection.get({ ids: [`${agentId}-${sessionId}`] });
      if (!results.documents || results.documents.length === 0) return null;
      return JSON.parse(results.documents[0] as string);
    } catch (error) {
      return null;
    }
  }
}
