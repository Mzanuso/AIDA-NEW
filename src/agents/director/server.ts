/**
 * Director Agent - HTTP Microservice (Port 3007)
 *
 * Provides video concept generation with 3 creative philosophies:
 * - Emotional: Story-driven, human connection
 * - Disruptive: Bold, unconventional, norm-breaking
 * - Data-Driven: Metrics-backed, proven patterns
 *
 * Feature 3: Multi-Agent Creative Debate
 * - Generates 3 diverse concepts in parallel
 * - Optional synthesis of best elements
 * - Automatic recommendation of best variant
 */

import express from "express";
import cors from "cors";
import { DirectorExecutor } from "./director-executor";
import {
  DirectorRequest,
  DirectorResult,
  MultiVariantRequest,
  MultiVariantResult,
} from "./types";

const app = express();
const PORT = process.env.DIRECTOR_PORT || 3007;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize Director Executor
const executor = new DirectorExecutor();

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Director Agent",
    version: "1.0.0",
    philosophies: executor.getAvailablePhilosophies(),
    model: executor.getConfig().model,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// SINGLE CONCEPT GENERATION
// ============================================================================

/**
 * POST /generate
 *
 * Generate single video concept with specified philosophy
 *
 * Body:
 * {
 *   brief: string;
 *   product?: string;
 *   target_audience?: string;
 *   duration?: number;
 *   script?: { hook, scenes, cta };
 *   brand?: { tone, visual_style, colors, avoid };
 *   philosophy?: "emotional" | "disruptive" | "dataDriven";
 *   temperature?: number;
 * }
 *
 * Response: DirectorResult
 */
app.post("/generate", async (req, res) => {
  try {
    const request: DirectorRequest = req.body;

    // Validation
    if (!request.brief || typeof request.brief !== "string") {
      return res.status(400).json({
        error: "Missing or invalid 'brief' field",
        message: "Request must include a non-empty 'brief' string",
      });
    }

    // Execute
    const result: DirectorResult = await executor.execute(request);

    // Return result
    res.json(result);
  } catch (error) {
    console.error("Error in /generate:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// MULTI-VARIANT GENERATION (Feature 3)
// ============================================================================

/**
 * POST /generate/multi-variant
 *
 * Generate 3 concepts in parallel with different philosophies
 * This is the core endpoint for Feature 3: Multi-Agent Creative Debate
 *
 * Body:
 * {
 *   brief: string;
 *   product?: string;
 *   target_audience?: string;
 *   duration?: number;
 *   generate_all_variants: true;
 *   synthesize_best?: boolean;
 * }
 *
 * Response: MultiVariantResult
 * {
 *   success: boolean;
 *   variants: {
 *     emotional: DirectorResult;
 *     disruptive: DirectorResult;
 *     dataDriven: DirectorResult;
 *   };
 *   synthesis?: DirectorResult;
 *   recommendation?: {
 *     best_variant: "emotional" | "disruptive" | "dataDriven";
 *     reason: string;
 *   };
 *   total_generation_time_ms: number;
 * }
 */
app.post("/generate/multi-variant", async (req, res) => {
  try {
    const request: MultiVariantRequest = req.body;

    // Validation
    if (!request.brief || typeof request.brief !== "string") {
      return res.status(400).json({
        error: "Missing or invalid 'brief' field",
        message: "Request must include a non-empty 'brief' string",
      });
    }

    if (!request.generate_all_variants) {
      return res.status(400).json({
        error: "Missing 'generate_all_variants' field",
        message:
          "Multi-variant generation requires generate_all_variants: true",
      });
    }

    // Execute
    const result: MultiVariantResult =
      await executor.executeMultiVariant(request);

    // Return result
    res.json(result);
  } catch (error) {
    console.error("Error in /generate/multi-variant:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================================================
// UTILITY ENDPOINTS
// ============================================================================

/**
 * GET /philosophies
 *
 * Get list of available creative philosophies
 */
app.get("/philosophies", (req, res) => {
  res.json({
    philosophies: executor.getAvailablePhilosophies(),
    descriptions: {
      emotional: "Story-driven, human connection, character-focused",
      disruptive: "Bold, unconventional, norm-breaking, original",
      dataDriven: "Metrics-backed, proven patterns, conversion-optimized",
    },
  });
});

/**
 * GET /config
 *
 * Get current Director configuration
 */
app.get("/config", (req, res) => {
  res.json({
    config: executor.getConfig(),
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
    available_routes: [
      "GET /health",
      "POST /generate",
      "POST /generate/multi-variant",
      "GET /philosophies",
      "GET /config",
    ],
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                     DIRECTOR AGENT                            ║
║                  Video Concept Generation                     ║
╚═══════════════════════════════════════════════════════════════╝

🎬 Service:     Director Agent (Multi-Philosophy Concept Generation)
🌐 Port:        ${PORT}
🤖 Model:       ${executor.getConfig().model}
🎨 Philosophies: ${executor.getAvailablePhilosophies().join(", ")}

📍 Endpoints:
   GET  /health                  - Health check
   POST /generate                - Single concept generation
   POST /generate/multi-variant  - Multi-variant generation (Feature 3)
   GET  /philosophies            - List available philosophies
   GET  /config                  - Get current config

🚀 Feature 3: Multi-Agent Creative Debate
   Generates 3 diverse concepts in parallel with different philosophies

Ready to generate creative video concepts!
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export default app;
