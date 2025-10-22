/**
 * Writer Agent - API Routes
 * HTTP endpoints for content generation service
 */

import { Router, Request, Response } from "express";
import { WriterExecutor } from "./writer-executor";
import { WriterRequestSchema, WriterRequest } from "./types";
import { ZodError } from "zod";

const router = Router();

// Initialize executor (singleton pattern)
let executor: WriterExecutor | null = null;

function getExecutor(): WriterExecutor {
  if (!executor) {
    executor = new WriterExecutor();
  }
  return executor;
}

/**
 * POST /api/write
 * Main endpoint for content generation
 *
 * Request body: WriterRequest
 * Response: WriterResult
 */
router.post("/write", async (req: Request, res: Response) => {
  try {
    console.log("[Writer API] POST /api/write", {
      content_type: req.body.content_type,
      language: req.body.language,
    });

    // Validate request
    const validatedRequest = WriterRequestSchema.parse(req.body);

    // Execute generation
    const executor = getExecutor();
    const result = await executor.execute(validatedRequest);

    // Return result
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error("[Writer API] Error:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid request format",
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * GET /api/models
 * Returns available AI models for content generation
 */
router.get("/models", (req: Request, res: Response) => {
  res.status(200).json({
    models: [
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        description: "Most capable model for content generation",
        capabilities: [
          "video_scripts",
          "marketing_copy",
          "blog_posts",
          "ad_copy",
        ],
        max_tokens: 8192,
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "OpenAI",
        description: "Versatile model for various content types",
        capabilities: ["all"],
        max_tokens: 4096,
        status: "planned",
      },
    ],
    default: "claude-3-5-sonnet-20241022",
  });
});

/**
 * GET /api/content-types
 * Returns supported content types
 */
router.get("/content-types", (req: Request, res: Response) => {
  res.status(200).json({
    content_types: [
      {
        id: "video_script",
        name: "Video Script",
        description: "Script for video content with scene breakdown",
        requires: ["brief", "duration"],
        optional: ["tone", "style", "target_audience"],
      },
      {
        id: "marketing_copy",
        name: "Marketing Copy",
        description: "Persuasive copy for marketing campaigns",
        requires: ["brief"],
        optional: ["tone", "target_audience", "call_to_action"],
      },
      {
        id: "social_media",
        name: "Social Media Post",
        description: "Content optimized for social platforms",
        requires: ["brief"],
        optional: ["tone", "platform"],
      },
      {
        id: "blog_post",
        name: "Blog Post",
        description: "Long-form content for blogs",
        requires: ["brief"],
        optional: ["tone", "target_audience", "key_messages"],
      },
      {
        id: "product_description",
        name: "Product Description",
        description: "E-commerce product descriptions",
        requires: ["brief"],
        optional: ["tone", "key_messages"],
      },
      {
        id: "ad_copy",
        name: "Advertisement Copy",
        description: "Copy for paid advertising",
        requires: ["brief", "call_to_action"],
        optional: ["tone", "target_audience"],
      },
    ],
  });
});

/**
 * GET /api/tones
 * Returns available tone options
 */
router.get("/tones", (req: Request, res: Response) => {
  res.status(200).json({
    tones: [
      { id: "professional", name: "Professional", description: "Formal and authoritative" },
      { id: "casual", name: "Casual", description: "Friendly and conversational" },
      { id: "energetic", name: "Energetic", description: "Dynamic and enthusiastic" },
      { id: "calm", name: "Calm", description: "Soothing and relaxed" },
      { id: "humorous", name: "Humorous", description: "Funny and entertaining" },
      { id: "serious", name: "Serious", description: "Grave and important" },
      { id: "inspirational", name: "Inspirational", description: "Motivating and uplifting" },
      { id: "educational", name: "Educational", description: "Informative and instructive" },
    ],
    default: "professional",
  });
});

export default router;
