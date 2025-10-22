/**
 * Writer Agent - HTTP Server
 * Express server for content generation microservice
 * Port: 3006
 */

import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { join } from "path";
import writerRoutes from "./routes";
import type { HealthResponse } from "./types";

// Load environment variables from project root
dotenv.config({ path: join(__dirname, "../../.env") });

const app = express();
const PORT = parseInt(process.env.WRITER_AGENT_PORT || "3006", 10);
const SERVICE_NAME = "Writer Agent";
const VERSION = "1.0.0";

// Track service start time for uptime calculation
const START_TIME = Date.now();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/health", (req, res) => {
  const uptime = Math.floor((Date.now() - START_TIME) / 1000);

  const health: HealthResponse = {
    status: "ok",
    service: SERVICE_NAME,
    version: VERSION,
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime_seconds: uptime,
  };

  res.status(200).json(health);
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use("/api", writerRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
    available_endpoints: [
      "GET /health",
      "POST /api/write",
      "GET /api/models",
      "GET /api/content-types",
      "GET /api/tones",
    ],
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Writer Server] Error:", err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message || "Unknown error",
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 ${SERVICE_NAME} v${VERSION}`);
  console.log("=".repeat(60));
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/write`);
  console.log(`📚 Models: http://localhost:${PORT}/api/models`);
  console.log(`🎨 Content types: http://localhost:${PORT}/api/content-types`);
  console.log("=".repeat(60) + "\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");
  process.exit(0);
});

export default app;
