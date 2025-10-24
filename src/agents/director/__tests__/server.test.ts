/**
 * Director Server Integration Tests
 *
 * Tests HTTP endpoints for video concept generation
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import app from "../server";

// Mock Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn().mockResolvedValue({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Test concept",
                reasoning: "Test reasoning",
                storyboard: {
                  scenes: [
                    {
                      scene_number: 1,
                      duration: 30,
                      description: "Test scene",
                      visual_style: "cinematic",
                    },
                  ],
                  overall_style: "professional",
                },
                estimated_impact: {
                  emotional_score: 8,
                  originality_score: 7,
                  feasibility_score: 9,
                },
              }),
            },
          ],
          usage: {
            input_tokens: 500,
            output_tokens: 800,
          },
        }),
      };
    },
  };
});

describe("Director Server", () => {
  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  describe("GET /health", () => {
    it("should return healthy status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("healthy");
      expect(response.body.service).toBe("Director Agent");
      expect(response.body.philosophies).toEqual([
        "emotional",
        "disruptive",
        "dataDriven",
      ]);
      expect(response.body.model).toBe("claude-sonnet-4-20250514");
    });
  });

  // ============================================================================
  // SINGLE CONCEPT GENERATION
  // ============================================================================

  describe("POST /generate", () => {
    it("should generate emotional concept", async () => {
      const response = await request(app).post("/generate").send({
        brief: "Promote running shoes with family values",
        product: "RunFree Pro",
        philosophy: "emotional",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.philosophy).toBe("emotional");
      expect(response.body.storyboard).toBeDefined();
      expect(response.body.concept_summary).toBeDefined();
      expect(response.body.model_used).toBe("claude-sonnet-4-20250514");
    });

    it("should generate disruptive concept", async () => {
      const response = await request(app).post("/generate").send({
        brief: "Promote running shoes",
        philosophy: "disruptive",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.philosophy).toBe("disruptive");
    });

    it("should generate data-driven concept", async () => {
      const response = await request(app).post("/generate").send({
        brief: "Promote running shoes",
        philosophy: "dataDriven",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.philosophy).toBe("dataDriven");
    });

    it("should default to emotional if philosophy not specified", async () => {
      const response = await request(app).post("/generate").send({
        brief: "Test brief",
      });

      expect(response.status).toBe(200);
      expect(response.body.philosophy).toBe("emotional");
    });

    it("should validate brief field", async () => {
      const response = await request(app).post("/generate").send({
        product: "Test Product",
        // Missing brief
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("brief");
    });

    it("should handle complex request with all fields", async () => {
      const response = await request(app).post("/generate").send({
        brief: "Create engaging video for new product launch",
        product: "SmartWatch Pro",
        target_audience: "Tech enthusiasts, 25-40",
        duration: 60,
        script: {
          hook: "What if your watch could predict your health?",
          scenes: [
            { description: "Morning routine", duration: 15 },
            { description: "Smart features showcase", duration: 35 },
            { description: "Happy customer", duration: 10 },
          ],
          cta: "Pre-order now",
        },
        brand: {
          tone: "innovative, friendly",
          visual_style: "modern, tech-focused",
          colors: ["#007AFF", "#5AC8FA"],
          avoid: ["outdated technology", "boring corporate"],
        },
        philosophy: "dataDriven",
        temperature: 0.9,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // ============================================================================
  // MULTI-VARIANT GENERATION (Feature 3)
  // ============================================================================

  describe("POST /generate/multi-variant", () => {
    it("should generate 3 concepts in parallel", async () => {
      const response = await request(app)
        .post("/generate/multi-variant")
        .send({
          brief: "Promote new running shoes",
          product: "RunFree Pro",
          duration: 30,
          generate_all_variants: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Should have all 3 variants
      expect(response.body.variants.emotional).toBeDefined();
      expect(response.body.variants.disruptive).toBeDefined();
      expect(response.body.variants.dataDriven).toBeDefined();

      expect(response.body.variants.emotional.success).toBe(true);
      expect(response.body.variants.disruptive.success).toBe(true);
      expect(response.body.variants.dataDriven.success).toBe(true);

      // Should have recommendation
      expect(response.body.recommendation).toBeDefined();
      expect(response.body.recommendation.best_variant).toBeDefined();
      expect(response.body.recommendation.reason).toBeDefined();

      // Should have total time
      expect(response.body.total_generation_time_ms).toBeGreaterThanOrEqual(0);
    });

    it("should synthesize when requested", async () => {
      const response = await request(app)
        .post("/generate/multi-variant")
        .send({
          brief: "Test brief",
          generate_all_variants: true,
          synthesize_best: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.synthesis).toBeDefined();
    });

    it("should validate brief field", async () => {
      const response = await request(app)
        .post("/generate/multi-variant")
        .send({
          generate_all_variants: true,
          // Missing brief
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("brief");
    });

    it("should validate generate_all_variants field", async () => {
      const response = await request(app)
        .post("/generate/multi-variant")
        .send({
          brief: "Test brief",
          // Missing generate_all_variants
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("generate_all_variants");
    });
  });

  // ============================================================================
  // UTILITY ENDPOINTS
  // ============================================================================

  describe("GET /philosophies", () => {
    it("should return available philosophies", async () => {
      const response = await request(app).get("/philosophies");

      expect(response.status).toBe(200);
      expect(response.body.philosophies).toEqual([
        "emotional",
        "disruptive",
        "dataDriven",
      ]);
      expect(response.body.descriptions).toBeDefined();
      expect(response.body.descriptions.emotional).toContain("Story-driven");
      expect(response.body.descriptions.disruptive).toContain("Bold");
      expect(response.body.descriptions.dataDriven).toContain("Metrics");
    });
  });

  describe("GET /config", () => {
    it("should return current config", async () => {
      const response = await request(app).get("/config");

      expect(response.status).toBe(200);
      expect(response.body.config).toBeDefined();
      expect(response.body.config.model).toBe("claude-sonnet-4-20250514");
      expect(response.body.config.max_tokens).toBe(4000);
      expect(response.body.config.temperature).toBe(0.85);
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe("Error Handling", () => {
    it("should return 404 for unknown route", async () => {
      const response = await request(app).get("/unknown-route");

      expect(response.status).toBe(404);
      expect(response.body.error).toContain("Not found");
      expect(response.body.available_routes).toBeDefined();
    });

    it("should handle invalid JSON", async () => {
      const response = await request(app)
        .post("/generate")
        .set("Content-Type", "application/json")
        .send("{ invalid json");

      // Body-parser returns 400 for malformed JSON
      expect([400, 500]).toContain(response.status);
    });
  });
});
