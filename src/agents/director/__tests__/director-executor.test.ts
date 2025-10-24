/**
 * Director Executor Tests
 *
 * Tests for video concept generation with 3 creative philosophies:
 * - Emotional: Story-driven, human connection
 * - Disruptive: Bold, unconventional, norm-breaking
 * - Data-Driven: Metrics-backed, proven patterns
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { DirectorExecutor } from "../director-executor";
import {
  DirectorRequest,
  DirectorResult,
  MultiVariantRequest,
  DirectorPhilosophy,
} from "../types";

// Mock Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn(),
      };
    },
  };
});

describe("DirectorExecutor", () => {
  let executor: DirectorExecutor;

  beforeEach(() => {
    executor = new DirectorExecutor();
    vi.clearAllMocks();
  });

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe("Initialization", () => {
    it("should initialize with default config", () => {
      const config = executor.getConfig();

      expect(config.model).toBe("claude-sonnet-4-20250514");
      expect(config.max_tokens).toBe(4000);
      expect(config.temperature).toBe(0.85);
      expect(config.use_cache).toBe(true);
    });

    it("should allow custom config", () => {
      const customExecutor = new DirectorExecutor({
        temperature: 0.9,
        max_tokens: 3000,
      });

      const config = customExecutor.getConfig();
      expect(config.temperature).toBe(0.9);
      expect(config.max_tokens).toBe(3000);
      // Should preserve defaults for other settings
      expect(config.model).toBe("claude-sonnet-4-20250514");
    });

    it("should return available philosophies", () => {
      const philosophies = executor.getAvailablePhilosophies();

      expect(philosophies).toEqual(["emotional", "disruptive", "dataDriven"]);
      expect(philosophies).toHaveLength(3);
    });
  });

  // ============================================================================
  // SINGLE CONCEPT GENERATION TESTS
  // ============================================================================

  describe("Single Concept Generation", () => {
    it("should generate emotional concept successfully", async () => {
      // Mock successful API response
      const mockResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              concept_summary:
                "A heartwarming story of connection through running",
              reasoning:
                "Emotional approach focuses on the bond between father and daughter",
              storyboard: {
                scenes: [
                  {
                    scene_number: 1,
                    duration: 10,
                    description: "Father and daughter lacing up shoes together",
                    visual_style: "close-up, intimate",
                    camera_movement: "slow pan",
                    lighting: "golden hour",
                    mood: "warm, anticipatory",
                    audio_notes: "gentle acoustic guitar",
                  },
                  {
                    scene_number: 2,
                    duration: 15,
                    description: "Running through park, sharing a laugh",
                    visual_style: "medium shot, natural",
                    camera_movement: "tracking shot",
                    lighting: "soft morning light",
                    mood: "joyful, connected",
                    audio_notes: "uplifting strings",
                  },
                  {
                    scene_number: 3,
                    duration: 5,
                    description: "High-five at finish, product reveal",
                    visual_style: "close-up on faces",
                    camera_movement: "static",
                    lighting: "warm backlight",
                    mood: "triumphant, loving",
                    audio_notes: "emotional crescendo",
                  },
                ],
                overall_style: "cinematic, character-driven",
                color_palette: ["warm tones", "golden", "natural greens"],
                music_direction: "acoustic, emotional, building",
                transitions: "gentle dissolves",
              },
              estimated_impact: {
                emotional_score: 9,
                originality_score: 6,
                feasibility_score: 8,
              },
            }),
          },
        ],
        usage: {
          input_tokens: 500,
          output_tokens: 800,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      // Execute
      const request: DirectorRequest = {
        brief: "Promote new running shoes with family values",
        product: "RunFree Pro",
        target_audience: "Parents, ages 30-45",
        duration: 30,
        philosophy: "emotional",
      };

      const result = await executor.execute(request);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.philosophy).toBe("emotional");
      expect(result.concept_summary).toContain("heartwarming");
      expect(result.storyboard.scenes).toHaveLength(3);
      expect(result.storyboard.scenes[0].description).toContain(
        "Father and daughter"
      );
      expect(result.estimated_impact.emotional_score).toBe(9);
      expect(result.model_used).toBe("claude-sonnet-4-20250514");
      expect(result.tokens_used?.input).toBe(500);
      expect(result.tokens_used?.output).toBe(800);
      expect(result.generation_time_ms).toBeGreaterThanOrEqual(0);
    });

    it("should generate disruptive concept successfully", async () => {
      const mockResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              concept_summary:
                "Shoes running WITHOUT the runner - exploring city alone",
              reasoning:
                "Subverts expectation by making product the protagonist",
              storyboard: {
                scenes: [
                  {
                    scene_number: 1,
                    duration: 8,
                    description: "Empty shoes standing alone, suddenly animate",
                    visual_style: "surreal, macro close-up",
                    camera_movement: "dutch tilt, dramatic zoom",
                    lighting: "high contrast, neon accents",
                    mood: "surprising, playful",
                    audio_notes: "unexpected electronic beats",
                  },
                  {
                    scene_number: 2,
                    duration: 17,
                    description: "Shoes exploring city on their own adventure",
                    visual_style: "dynamic POV, ground-level",
                    camera_movement: "whip pans, crash zooms",
                    lighting: "bold, colorful",
                    mood: "energetic, rebellious",
                    audio_notes: "genre-bending synth + rock",
                  },
                  {
                    scene_number: 3,
                    duration: 5,
                    description: "Shoes return to waiting runner, CTA",
                    visual_style: "reverse motion",
                    camera_movement: "upside-down reveal",
                    lighting: "unexpected sunset",
                    mood: "satisfying, bold",
                    audio_notes: "silence then bass drop",
                  },
                ],
                overall_style: "surreal, unconventional",
                color_palette: ["neon", "bold contrasts", "unexpected"],
                music_direction: "genre-bending, surprising",
                transitions: "jump cuts, whip pans",
              },
              estimated_impact: {
                emotional_score: 5,
                originality_score: 10,
                feasibility_score: 6,
              },
            }),
          },
        ],
        usage: {
          input_tokens: 520,
          output_tokens: 850,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Promote new running shoes with family values",
        product: "RunFree Pro",
        philosophy: "disruptive",
      };

      const result = await executor.execute(request);

      expect(result.success).toBe(true);
      expect(result.philosophy).toBe("disruptive");
      expect(result.concept_summary).toContain("WITHOUT the runner");
      expect(result.estimated_impact.originality_score).toBe(10);
      expect(result.storyboard.overall_style).toContain("unconventional");
    });

    it("should generate data-driven concept successfully", async () => {
      const mockResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              concept_summary:
                "Hook-value-CTA format optimized for conversion",
              reasoning:
                "Proven structure with clear problem-solution-proof flow",
              storyboard: {
                scenes: [
                  {
                    scene_number: 1,
                    duration: 3,
                    description:
                      'Bold text: "Tired feet stopping your runs?" + runner struggling',
                    visual_style: "high contrast, mobile-optimized",
                    camera_movement: "static with text overlay",
                    lighting: "bright, clear",
                    mood: "relatable problem",
                    audio_notes: "upbeat, attention-grabbing",
                  },
                  {
                    scene_number: 2,
                    duration: 15,
                    description:
                      "Product demo: cushioning tech + happy runner testimonial",
                    visual_style: "fast-paced cuts, product prominence",
                    camera_movement: "quick zooms on features",
                    lighting: "professional, consistent",
                    mood: "solution-focused, positive",
                    audio_notes: "energetic music, voice-over",
                  },
                  {
                    scene_number: 3,
                    duration: 7,
                    description:
                      "Social proof stats + strong CTA with discount code",
                    visual_style: "text-heavy, clear typography",
                    camera_movement: "static with animated text",
                    lighting: "attention-grabbing",
                    mood: "urgent, action-driven",
                    audio_notes: "music drop for CTA",
                  },
                ],
                overall_style: "fast-paced, conversion-optimized",
                color_palette: ["high contrast", "brand colors", "bright"],
                music_direction: "upbeat, energetic",
                transitions: "quick cuts, pattern interrupts",
              },
              estimated_impact: {
                emotional_score: 6,
                originality_score: 4,
                feasibility_score: 9,
              },
            }),
          },
        ],
        usage: {
          input_tokens: 510,
          output_tokens: 820,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Promote new running shoes with family values",
        product: "RunFree Pro",
        philosophy: "dataDriven",
      };

      const result = await executor.execute(request);

      expect(result.success).toBe(true);
      expect(result.philosophy).toBe("dataDriven");
      expect(result.concept_summary).toContain("conversion");
      expect(result.estimated_impact.feasibility_score).toBe(9);
      expect(result.storyboard.overall_style).toContain("conversion-optimized");
    });

    it("should default to emotional philosophy if not specified", async () => {
      const mockResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              concept_summary: "Emotional concept",
              reasoning: "Using emotional approach",
              storyboard: {
                scenes: [
                  {
                    scene_number: 1,
                    duration: 30,
                    description: "Emotional scene",
                    visual_style: "warm",
                  },
                ],
                overall_style: "emotional",
              },
              estimated_impact: {},
            }),
          },
        ],
        usage: { input_tokens: 400, output_tokens: 600 },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Test brief",
        // No philosophy specified
      };

      const result = await executor.execute(request);

      expect(result.success).toBe(true);
      expect(result.philosophy).toBe("emotional"); // Should default
    });

    it("should handle Writer script input", async () => {
      const mockResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              concept_summary: "Concept based on script",
              reasoning: "Building on Writer output",
              storyboard: {
                scenes: [
                  {
                    scene_number: 1,
                    duration: 15,
                    description: "Visual interpretation of hook",
                    visual_style: "dynamic",
                  },
                  {
                    scene_number: 2,
                    duration: 15,
                    description: "Visual interpretation of scenes",
                    visual_style: "engaging",
                  },
                ],
                overall_style: "script-driven",
              },
              estimated_impact: {},
            }),
          },
        ],
        usage: { input_tokens: 550, output_tokens: 700 },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Test brief",
        script: {
          hook: "Ready to transform your mornings?",
          scenes: [
            { description: "Morning routine struggle", duration: 10 },
            { description: "Product introduction", duration: 15 },
            { description: "Happy customer testimonial", duration: 5 },
          ],
          cta: "Try now risk-free",
        },
        philosophy: "emotional",
      };

      const result = await executor.execute(request);

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining("Writer Script Output"),
            }),
          ]),
        })
      );
    });

    it("should handle brand context", async () => {
      const mockResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              concept_summary: "Brand-aligned concept",
              reasoning: "Following brand guidelines",
              storyboard: {
                scenes: [
                  {
                    scene_number: 1,
                    duration: 30,
                    description: "Brand-aligned scene",
                    visual_style: "minimalist",
                  },
                ],
                overall_style: "brand-focused",
              },
              estimated_impact: {},
            }),
          },
        ],
        usage: { input_tokens: 480, output_tokens: 650 },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Test brief",
        brand: {
          tone: "playful, energetic",
          visual_style: "minimalist, modern",
          colors: ["#FF6B6B", "#4ECDC4"],
          avoid: ["corporate jargon", "stock footage"],
        },
        philosophy: "emotional",
      };

      const result = await executor.execute(request);

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining("Brand Context"),
            }),
          ]),
        })
      );
    });
  });

  // ============================================================================
  // MULTI-VARIANT GENERATION TESTS (Feature 3)
  // ============================================================================

  describe("Multi-Variant Generation (Feature 3)", () => {
    it("should generate 3 concepts in parallel", async () => {
      // Mock responses for all 3 philosophies
      const mockResponses = {
        emotional: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Emotional concept",
                reasoning: "Emotional approach",
                storyboard: {
                  scenes: [
                    {
                      scene_number: 1,
                      duration: 30,
                      description: "Emotional scene",
                      visual_style: "warm",
                    },
                  ],
                  overall_style: "emotional",
                },
                estimated_impact: {
                  emotional_score: 9,
                  originality_score: 6,
                  feasibility_score: 8,
                },
              }),
            },
          ],
          usage: { input_tokens: 500, output_tokens: 800 },
        },
        disruptive: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Disruptive concept",
                reasoning: "Disruptive approach",
                storyboard: {
                  scenes: [
                    {
                      scene_number: 1,
                      duration: 30,
                      description: "Disruptive scene",
                      visual_style: "bold",
                    },
                  ],
                  overall_style: "disruptive",
                },
                estimated_impact: {
                  emotional_score: 5,
                  originality_score: 10,
                  feasibility_score: 6,
                },
              }),
            },
          ],
          usage: { input_tokens: 520, output_tokens: 850 },
        },
        dataDriven: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Data-driven concept",
                reasoning: "Data-driven approach",
                storyboard: {
                  scenes: [
                    {
                      scene_number: 1,
                      duration: 30,
                      description: "Data-driven scene",
                      visual_style: "optimized",
                    },
                  ],
                  overall_style: "data-driven",
                },
                estimated_impact: {
                  emotional_score: 6,
                  originality_score: 4,
                  feasibility_score: 9,
                },
              }),
            },
          ],
          usage: { input_tokens: 510, output_tokens: 820 },
        },
      };

      let callCount = 0;
      const mockCreate = vi.fn().mockImplementation(() => {
        const responses = [
          mockResponses.emotional,
          mockResponses.disruptive,
          mockResponses.dataDriven,
        ];
        return Promise.resolve(responses[callCount++]);
      });

      (executor as any).anthropic.messages.create = mockCreate;

      const request: MultiVariantRequest = {
        brief: "Promote new running shoes",
        product: "RunFree Pro",
        duration: 30,
        generate_all_variants: true,
      };

      const result = await executor.executeMultiVariant(request);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.variants.emotional.success).toBe(true);
      expect(result.variants.disruptive.success).toBe(true);
      expect(result.variants.dataDriven.success).toBe(true);

      expect(result.variants.emotional.concept_summary).toBe("Emotional concept");
      expect(result.variants.disruptive.concept_summary).toBe(
        "Disruptive concept"
      );
      expect(result.variants.dataDriven.concept_summary).toBe(
        "Data-driven concept"
      );

      // Should have recommendation
      expect(result.recommendation).toBeDefined();
      expect(result.recommendation?.best_variant).toBeDefined();
      expect(result.recommendation?.reason).toBeDefined();

      // Total time should be reasonable (parallel execution)
      expect(result.total_generation_time_ms).toBeGreaterThanOrEqual(0);

      // Should have called API 3 times
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it("should recommend best variant based on scores", async () => {
      // Set up disruptive to have highest total score
      const mockResponses = {
        emotional: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Emotional",
                reasoning: "Emotional",
                storyboard: {
                  scenes: [
                    { scene_number: 1, duration: 30, description: "Scene", visual_style: "warm" },
                  ],
                  overall_style: "emotional",
                },
                estimated_impact: {
                  emotional_score: 6,
                  originality_score: 5,
                  feasibility_score: 6,
                }, // Avg: 5.67
              }),
            },
          ],
          usage: { input_tokens: 500, output_tokens: 800 },
        },
        disruptive: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Disruptive",
                reasoning: "Disruptive",
                storyboard: {
                  scenes: [
                    { scene_number: 1, duration: 30, description: "Scene", visual_style: "bold" },
                  ],
                  overall_style: "disruptive",
                },
                estimated_impact: {
                  emotional_score: 8,
                  originality_score: 9,
                  feasibility_score: 7,
                }, // Avg: 8.0 (HIGHEST)
              }),
            },
          ],
          usage: { input_tokens: 520, output_tokens: 850 },
        },
        dataDriven: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Data-driven",
                reasoning: "Data-driven",
                storyboard: {
                  scenes: [
                    { scene_number: 1, duration: 30, description: "Scene", visual_style: "optimized" },
                  ],
                  overall_style: "data-driven",
                },
                estimated_impact: {
                  emotional_score: 5,
                  originality_score: 4,
                  feasibility_score: 8,
                }, // Avg: 5.67
              }),
            },
          ],
          usage: { input_tokens: 510, output_tokens: 820 },
        },
      };

      let callCount = 0;
      const mockCreate = vi.fn().mockImplementation(() => {
        const responses = [
          mockResponses.emotional,
          mockResponses.disruptive,
          mockResponses.dataDriven,
        ];
        return Promise.resolve(responses[callCount++]);
      });

      (executor as any).anthropic.messages.create = mockCreate;

      const request: MultiVariantRequest = {
        brief: "Test brief",
        generate_all_variants: true,
      };

      const result = await executor.executeMultiVariant(request);

      expect(result.success).toBe(true);
      expect(result.recommendation?.best_variant).toBe("disruptive");
      expect(result.recommendation?.reason).toContain("8.0");
    });

    it("should synthesize best elements when requested", async () => {
      // Mock base responses
      const baseResponses = {
        emotional: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Emotional concept",
                reasoning: "Emotional approach",
                storyboard: {
                  scenes: [{ scene_number: 1, duration: 30, description: "Emotional", visual_style: "warm" }],
                  overall_style: "emotional",
                },
                estimated_impact: { emotional_score: 9 },
              }),
            },
          ],
          usage: { input_tokens: 500, output_tokens: 800 },
        },
        disruptive: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Disruptive concept",
                reasoning: "Disruptive approach",
                storyboard: {
                  scenes: [{ scene_number: 1, duration: 30, description: "Disruptive", visual_style: "bold" }],
                  overall_style: "disruptive",
                },
                estimated_impact: { originality_score: 10 },
              }),
            },
          ],
          usage: { input_tokens: 520, output_tokens: 850 },
        },
        dataDriven: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Data-driven concept",
                reasoning: "Data-driven approach",
                storyboard: {
                  scenes: [{ scene_number: 1, duration: 30, description: "Data-driven", visual_style: "optimized" }],
                  overall_style: "data-driven",
                },
                estimated_impact: { feasibility_score: 9 },
              }),
            },
          ],
          usage: { input_tokens: 510, output_tokens: 820 },
        },
      };

      // Mock synthesis response (4th call)
      const synthesisResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              concept_summary: "Synthesized best-of-all concept",
              reasoning: "Combined best elements from all 3 philosophies",
              storyboard: {
                scenes: [
                  {
                    scene_number: 1,
                    duration: 30,
                    description: "Synthesized scene combining all approaches",
                    visual_style: "balanced",
                  },
                ],
                overall_style: "synthesized",
              },
              estimated_impact: {
                emotional_score: 8,
                originality_score: 8,
                feasibility_score: 8,
              },
            }),
          },
        ],
        usage: { input_tokens: 600, output_tokens: 900 },
      };

      let callCount = 0;
      const mockCreate = vi.fn().mockImplementation(() => {
        const responses = [
          baseResponses.emotional,
          baseResponses.disruptive,
          baseResponses.dataDriven,
          synthesisResponse,
        ];
        return Promise.resolve(responses[callCount++]);
      });

      (executor as any).anthropic.messages.create = mockCreate;

      const request: MultiVariantRequest = {
        brief: "Test brief",
        generate_all_variants: true,
        synthesize_best: true, // Request synthesis
      };

      const result = await executor.executeMultiVariant(request);

      expect(result.success).toBe(true);
      expect(result.synthesis).toBeDefined();
      expect(result.synthesis?.concept_summary).toContain("Synthesized");
      expect(result.synthesis?.reasoning).toContain("best elements");

      // Should have called API 4 times (3 base + 1 synthesis)
      expect(mockCreate).toHaveBeenCalledTimes(4);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe("Error Handling", () => {
    it("should return fallback storyboard on API error", async () => {
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new Error("API timeout"));

      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Test brief",
        product: "Test Product",
        philosophy: "emotional",
      };

      const result = await executor.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain("API timeout");
      expect(result.storyboard.scenes).toHaveLength(3); // Fallback storyboard
      expect(result.storyboard.scenes[0].description).toContain("Opening");
      expect(result.metadata?.source).toBe("simplified_fallback");
    });

    it("should handle malformed JSON response", async () => {
      const mockResponse = {
        content: [
          {
            type: "text",
            text: "This is not valid JSON { broken",
          },
        ],
        usage: { input_tokens: 500, output_tokens: 100 },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Test brief",
        philosophy: "emotional",
      };

      const result = await executor.execute(request);

      // Should succeed with fallback storyboard
      expect(result.success).toBe(true);
      expect(result.storyboard.scenes.length).toBeGreaterThan(0);
    });

    it("should handle missing text content in response", async () => {
      const mockResponse = {
        content: [
          {
            type: "image", // Wrong type
            data: "...",
          },
        ],
        usage: { input_tokens: 500, output_tokens: 100 },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Test brief",
        philosophy: "emotional",
      };

      const result = await executor.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No text content");
      expect(result.storyboard.scenes).toHaveLength(3); // Fallback
    });

    it("should handle partial failure in multi-variant", async () => {
      let callCount = 0;
      const mockCreate = vi.fn().mockImplementation(() => {
        if (callCount++ === 1) {
          // Fail second call (disruptive)
          return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                concept_summary: "Success",
                reasoning: "Success",
                storyboard: {
                  scenes: [{ scene_number: 1, duration: 30, description: "Scene", visual_style: "style" }],
                  overall_style: "style",
                },
                estimated_impact: {},
              }),
            },
          ],
          usage: { input_tokens: 500, output_tokens: 800 },
        });
      });

      (executor as any).anthropic.messages.create = mockCreate;

      const request: MultiVariantRequest = {
        brief: "Test brief",
        generate_all_variants: true,
      };

      const result = await executor.executeMultiVariant(request);

      // Promise.all rejects on first error, so success should be false
      // But implementation currently catches and returns error results
      // At least one variant should have error
      const hasError =
        result.variants.emotional.error ||
        result.variants.disruptive.error ||
        result.variants.dataDriven.error;

      // If any variant has error, result should reflect that
      if (hasError) {
        expect(result.success).toBe(false);
      }
      expect(hasError).toBeTruthy();
    });
  });

  // ============================================================================
  // CUSTOM CONFIG TESTS
  // ============================================================================

  describe("Custom Configuration", () => {
    it("should respect custom temperature", async () => {
      const mockResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              concept_summary: "Test",
              reasoning: "Test",
              storyboard: {
                scenes: [{ scene_number: 1, duration: 30, description: "Scene", visual_style: "style" }],
                overall_style: "style",
              },
              estimated_impact: {},
            }),
          },
        ],
        usage: { input_tokens: 500, output_tokens: 800 },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Test brief",
        temperature: 0.5, // Custom temperature
        philosophy: "emotional",
      };

      await executor.execute(request);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.5,
        })
      );
    });

    it("should use default temperature if not specified", async () => {
      const mockResponse = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              concept_summary: "Test",
              reasoning: "Test",
              storyboard: {
                scenes: [{ scene_number: 1, duration: 30, description: "Scene", visual_style: "style" }],
                overall_style: "style",
              },
              estimated_impact: {},
            }),
          },
        ],
        usage: { input_tokens: 500, output_tokens: 800 },
      };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (executor as any).anthropic.messages.create = mockCreate;

      const request: DirectorRequest = {
        brief: "Test brief",
        // No temperature specified
        philosophy: "emotional",
      };

      await executor.execute(request);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.85, // Default
        })
      );
    });
  });
});
