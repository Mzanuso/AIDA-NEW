import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


import express from 'express';
import cors from 'cors';
import { createLogger } from '../../utils/logger';
import chatRoutes from './src/routes/chat.routes';
import mediaAnalysisRoutes from './src/routes/media-analysis.routes';

const logger = createLogger('OrchestratorServer');

const app = express();
const PORT = process.env.ORCHESTRATOR_PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for media files
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// =============================================================================
// ORCHESTRATOR V2 - CONVERSATIONAL ROUTES
// =============================================================================
app.use('/api/orchestrator', chatRoutes);

// =============================================================================
// MEDIA ANALYSIS ROUTES (Image, Video, Audio, Text)
// =============================================================================
app.use('/api/ai-agent', mediaAnalysisRoutes);

// =============================================================================
// LEGACY ENDPOINTS (Deprecated - will be removed)
// =============================================================================

// Health check (root level - keep for compatibility)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    mode: 'conversational',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// DEPRECATED: Old create-video endpoint (redirect to chat)
app.post('/api/orchestrator/create-video', async (req, res) => {
  logger.warn('DEPRECATED: /create-video called. Use /chat instead.');

  try {
    const { userId, message, projectId, campaignId } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        error: 'Missing required fields: userId, message',
        deprecationNotice: 'This endpoint is deprecated. Please use POST /api/orchestrator/chat'
      });
    }

    // Redirect to new conversational flow
    return res.status(301).json({
      message: 'Endpoint moved',
      newEndpoint: '/api/orchestrator/chat',
      deprecationNotice: 'Please update your client to use the new conversational API'
    });

  } catch (error: any) {
    logger.error('Create video failed', { error });
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Orchestrator service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
