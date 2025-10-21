/**
 * Technical Planner HTTP Server
 *
 * Microservice for technical project planning and model selection
 * Port: 3004
 *
 * Endpoints:
 * - POST /api/plan - Create technical plan from ProjectBrief
 * - GET /api/plan/:workflowId - Get workflow state
 * - GET /api/progress/:workflowId - Get progress status
 * - DELETE /api/plan/:workflowId - Delete workflow (testing only)
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
const PORT = process.env.TECHNICAL_PLANNER_PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
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
    service: 'technical-planner',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Technical Planner Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API endpoint: http://localhost:${PORT}/api/plan\n`);
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
