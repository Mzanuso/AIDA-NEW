/**
 * Visual Creator HTTP Server
 *
 * Microservice for AI image/video generation execution
 * Port: 3005
 *
 * Endpoints:
 * - POST /api/execute - Execute complete WorkflowExecutionPlan
 * - POST /api/execute/step - Execute single step
 * - GET /api/models - List supported AI models
 * - GET /api/providers - List API providers
 * - GET /health - Health check
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { join } from 'path';
import apiRoutes from './routes';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const app: Express = express();
const PORT = process.env.VISUAL_CREATOR_PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Larger limit for image data
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'visual-creator',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    capabilities: {
      models: 7,
      providers: 2,
      features: ['image_generation', 'video_generation', 'prompt_adaptation', 'rate_limiting', 'retry_logic']
    }
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path,
    available_endpoints: [
      'POST /api/execute',
      'POST /api/execute/step',
      'GET /api/models',
      'GET /api/providers',
      'GET /health'
    ]
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎨 Visual Creator Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Execute API:  http://localhost:${PORT}/api/execute`);
  console.log(`   Models list:  http://localhost:${PORT}/api/models\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
