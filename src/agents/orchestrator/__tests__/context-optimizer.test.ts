/**
 * Tests for Context Optimizer - Phase 5: Context Engineering
 * 
 * MINIMAL TEST SUITE - Only essential tests for coverage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextOptimizer } from '../src/services/context-optimizer';
import type { ConversationContext } from '../src/services/context-analyzer';

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      constructor() {}
      messages = {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Compressed summary of conversation' }]
        })
      };
    }
  };
});

describe('ContextOptimizer', () => {
  let optimizer: ContextOptimizer;
  const mockApiKey = 'sk-ant-test-123';

  beforeEach(() => {
    optimizer = new ContextOptimizer(mockApiKey, {
      enableCaching: true,
      enableCompression: true,
      compressionThreshold: 20,
      recentMessagesToKeep: 6
    });
  });

  describe('Prompt Caching', () => {
    it('should build cached system prompt', () => {
      const result = optimizer.buildOptimizedSystemPrompt('discovery', 'it');

      expect(result.cachingEnabled).toBe(true);
      expect(result.systemBlocks).toBeDefined();
      expect(result.estimatedSavings).toBeGreaterThan(0);
    });

    it('should support all languages', () => {
      const languages: Array<'it' | 'en' | 'es' | 'fr' | 'de'> = ['it', 'en', 'es', 'fr', 'de'];

      languages.forEach(lang => {
        const result = optimizer.buildOptimizedSystemPrompt('discovery', lang);
        expect(result.cachingEnabled).toBe(true);
      });
    });

    it('should disable caching when config is false', () => {
      const noCacheOptimizer = new ContextOptimizer(mockApiKey, {
        enableCaching: false
      });

      const result = noCacheOptimizer.buildOptimizedSystemPrompt('discovery', 'it');
      
      expect(result.cachingEnabled).toBe(false);
    });
  });

  describe('Conversation Compression', () => {
    it('should NOT compress when below threshold', async () => {
      const context: ConversationContext = {
        messages: [
          { role: 'user', content: 'Message 1' },
          { role: 'assistant', content: 'Response 1' },
          { role: 'user', content: 'Message 2' }
        ],
        detectedIntent: 'create_video',
        inferredSpecs: {}
      };

      const result = await optimizer.optimizeMessages(context, 'it');

      expect(result.compressionApplied).toBe(false);
      expect(result.compressedCount).toBe(3);
      expect(result.originalCount).toBe(3);
    });

    it('should compress when over threshold', async () => {
      // Create 25 messages (over 20 threshold)
      const messages = Array.from({ length: 25 }, (_, i) => ({
        role: (i % 2 === 0 ? 'user' : 'assistant'),
        content: `Message ${i + 1}`
      }));

      const context: ConversationContext = {
        messages: messages as any[],
        detectedIntent: 'create_video',
        inferredSpecs: {}
      };

      const result = await optimizer.optimizeMessages(context, 'it');

      expect(result.compressionApplied).toBe(true);
      expect(result.compressedCount).toBeLessThan(25);
    });

    it('should disable compression when config is false', async () => {
      const noCompressOptimizer = new ContextOptimizer(mockApiKey, {
        enableCompression: false
      });

      const messages = Array.from({ length: 25 }, (_, i) => ({
        role: (i % 2 === 0 ? 'user' : 'assistant'),
        content: `Message ${i + 1}`
      }));

      const context: ConversationContext = {
        messages: messages as any[],
        detectedIntent: 'create_video',
        inferredSpecs: {}
      };

      const result = await noCompressOptimizer.optimizeMessages(context, 'it');

      expect(result.compressionApplied).toBe(false);
      expect(result.compressedCount).toBe(25);
    });
  });

  describe('Token Budget', () => {
    it('should track token usage', async () => {
      const context: ConversationContext = {
        messages: [
          { role: 'user', content: 'Test message' }
        ],
        detectedIntent: 'create_video',
        inferredSpecs: {}
      };

      const result = await optimizer.optimizeMessages(context, 'it');

      expect(result.tokenUsage).toBeDefined();
      expect(result.tokenUsage?.total).toBeGreaterThan(0);
    });
  });
});
