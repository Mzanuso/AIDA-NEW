export interface TraceData {
  id: string;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
  startTime: number;
}

export interface SpanData {
  id: string;
  traceId: string;
  name: string;
  operation?: string;
  metadata?: Record<string, any>;
  startTime: number;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

export interface TraceMetrics {
  totalTokens: number;
  errorCount: number;
  duration?: number;
}
