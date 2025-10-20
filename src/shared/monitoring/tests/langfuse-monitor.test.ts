import { describe, it, expect, beforeEach } from 'vitest';
import { LangfuseMonitor } from '../langfuse-monitor';

describe('Langfuse Monitoring System', () => {
  let monitor: LangfuseMonitor;

  beforeEach(() => {
    monitor = new LangfuseMonitor();
  });

  it('should create a root trace for user request', async () => {
    const trace = await monitor.startTrace('user-session-123', {
      userId: 'user-1',
      requestType: 'chat'
    });

    expect(trace.id).toBeDefined();
    expect(trace.sessionId).toBe('user-session-123');
  });

  it('should create nested spans for agent operations', async () => {
    const trace = await monitor.startTrace('session-123');
    const span = await monitor.startSpan(trace.id, 'orchestrator', {
      operation: 'intent-analysis'
    });

    expect(span.id).toBeDefined();
    expect(span.traceId).toBe(trace.id);
    expect(span.name).toBe('orchestrator');
  });

  it('should track token usage', async () => {
    const trace = await monitor.startTrace('session-123');
    await monitor.logTokens(trace.id, {
      input: 100,
      output: 200,
      total: 300
    });

    const metrics = await monitor.getMetrics(trace.id);
    expect(metrics.totalTokens).toBe(300);
  });

  it('should record errors', async () => {
    const trace = await monitor.startTrace('session-123');
    await monitor.logError(trace.id, new Error('Test error'));

    const metrics = await monitor.getMetrics(trace.id);
    expect(metrics.errorCount).toBeGreaterThan(0);
  });
});
