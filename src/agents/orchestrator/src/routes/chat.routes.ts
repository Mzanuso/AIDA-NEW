// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { Router } from 'express';
import { ConversationalOrchestrator } from '../agents/conversational-orchestrator';
import { ContextAnalyzer } from '../services/context-analyzer';
import { createLogger } from '@backend/utils/logger';

const router = Router();
const logger = createLogger('OrchestratorRoutes');

const orchestrator = new ConversationalOrchestrator();
const contextAnalyzer = new ContextAnalyzer();

/**
 * POST /api/orchestrator/chat
 * 
 * Main conversational endpoint
 * Send a message, get a response
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: message, userId'
      });
    }

    logger.info('Chat message received', {
      userId,
      sessionId,
      messageLength: message.length
    });

    // Process message through orchestrator
    const response = await orchestrator.processMessage(message, userId, sessionId || undefined);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Chat endpoint failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

/**
 * GET /api/orchestrator/session/:sessionId
 * 
 * Get conversation session details
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    logger.info('Session details requested', { sessionId });

    const context = await contextAnalyzer.loadContext(sessionId);

    res.json({
      success: true,
      data: {
        sessionId: context.sessionId,
        userId: context.userId,
        projectId: context.projectId,
        messageCount: context.messages.length,
        phase: context.phase,
        detectedIntent: context.detectedIntent,
        inferredSpecs: context.inferredSpecs,
        missingInfo: context.missingInfo,
        messages: context.messages.map(m => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error('Session details failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to load session'
    });
  }
});

/**
 * POST /api/orchestrator/session/:sessionId/approve
 * 
 * User approves proposed direction and cost
 */
router.post('/session/:sessionId/approve', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { approved } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: approved (boolean)'
      });
    }

    logger.info('Approval received', { sessionId, approved });

    if (approved) {
      // Send approval message through orchestrator
      const response = await orchestrator.processMessage(
        'Sì, procediamo',
        sessionId,
        '' // userId will be loaded from session
      );

      res.json({
        success: true,
        data: response
      });
    } else {
      // User declined, ask for alternative
      const response = await orchestrator.processMessage(
        'No, preferirei qualcosa di diverso',
        sessionId,
        ''
      );

      res.json({
        success: true,
        data: response
      });
    }
  } catch (error) {
    logger.error('Approval endpoint failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to process approval'
    });
  }
});

/**
 * GET /api/orchestrator/user/:userId/history
 * 
 * Get user's conversation history
 */
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info('User history requested', { userId, limit });

    const history = await contextAnalyzer.getUserHistory(userId, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('User history failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to load user history'
    });
  }
});

/**
 * POST /api/orchestrator/session/:sessionId/abandon
 * 
 * Mark session as abandoned (user left)
 */
router.post('/session/:sessionId/abandon', async (req, res) => {
  try {
    const { sessionId } = req.params;

    logger.info('Session abandonment', { sessionId });

    await contextAnalyzer.abandonSession(sessionId);

    res.json({
      success: true,
      message: 'Session marked as abandoned'
    });
  } catch (error) {
    logger.error('Abandon endpoint failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to abandon session'
    });
  }
});

/**
 * GET /api/orchestrator/health
 * 
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'orchestrator-v2',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
