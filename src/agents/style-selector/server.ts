/**
 * Style Selector Service
 * Microservice per la selezione e ricerca degli stili visuali (SREF)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import styleRoutes from './style.routes';

const app = express();
const PORT = process.env.STYLE_SERVICE_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from data directory (3 levels up from backend/services/style-selector)
const dataPath = path.join(__dirname, '../../../data');
app.use('/data', express.static(dataPath));
console.log(`📁 Serving static files from: ${dataPath}`);

// Routes
app.use('/api/styles', styleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'style-selector' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Style Selector service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API endpoint: http://localhost:${PORT}/api/styles`);
});
