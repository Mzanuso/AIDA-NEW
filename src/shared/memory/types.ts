export interface ConversationData {
  agentId: string;
  sessionId: string;
  messages: Message[];
  metadata?: Record<string, any>;
  timestamp?: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface MemorySearchResult {
  sessionId: string;
  agentId: string;
  data: any;
  similarity: number;
}
