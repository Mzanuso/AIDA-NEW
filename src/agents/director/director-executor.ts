/**
 * Director Executor - Video Concept Generation Engine
 *
 * Generates storyboards using 3 creative philosophies:
 * - Emotional: Story-driven, human connection
 * - Disruptive: Bold, unconventional, norm-breaking
 * - Data-Driven: Metrics-backed, proven patterns
 *
 * Supports single philosophy OR multi-variant parallel execution (Feature 3)
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  DirectorRequest,
  DirectorResult,
  DirectorConfig,
  DirectorPhilosophy,
  MultiVariantRequest,
  MultiVariantResult,
  Storyboard,
} from "./types";
import { getPhilosophyPrompt, getAllPhilosophies } from "./director-variants";

/**
 * Default configuration for Director Agent
 */
const DEFAULT_CONFIG: DirectorConfig = {
  model: "claude-sonnet-4-20250514", // Sonnet 4.5 (latest, 2x faster)
  max_tokens: 4000, // Storyboards are detailed
  temperature: 0.85, // High creativity by default
  use_cache: true,
  timeout_ms: 30000, // 30s timeout
};

/**
 * Director Executor - Core concept generation logic
 */
export class DirectorExecutor {
  private anthropic: Anthropic;
  private config: DirectorConfig;

  constructor(config?: Partial<DirectorConfig>) {
    // Merge with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize Anthropic client
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      // Fix for Vitest test environment (detects as browser incorrectly)
      // @ts-ignore - dangerouslyAllowBrowser is safe in Node.js test environment
      dangerouslyAllowBrowser: process.env.NODE_ENV === "test",
    });
  }

  /**
   * Generate single concept with specified philosophy
   */
  async execute(request: DirectorRequest): Promise<DirectorResult> {
    const startTime = Date.now();

    try {
      // Select philosophy (default to emotional if not specified)
      const philosophy = request.philosophy || "emotional";
      const philosophyPrompt = getPhilosophyPrompt(philosophy);

      // Build user message with brief and context
      const userMessage = this.buildUserMessage(request);

      // Call Claude API with philosophy-specific system prompt
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.max_tokens,
        temperature: request.temperature || this.config.temperature,
        system: philosophyPrompt.system_prompt,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      // Parse response
      const textContent = response.content.find((c) => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      // Extract storyboard from response
      const storyboard = this.parseStoryboard(textContent.text);

      // Calculate generation time
      const generationTime = Date.now() - startTime;

      // Build result
      const result: DirectorResult = {
        success: true,
        storyboard,
        concept_summary: this.extractConceptSummary(textContent.text),
        philosophy,
        reasoning: this.extractReasoning(textContent.text),
        estimated_impact: this.extractImpactScores(textContent.text),
        generation_time_ms: generationTime,
        model_used: this.config.model,
        tokens_used: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
        metadata: {
          source: "ai_generated",
          retry_count: 0,
        },
      };

      return result;
    } catch (error) {
      // Error handling with fallback
      const generationTime = Date.now() - startTime;

      return {
        success: false,
        storyboard: this.getSimplifiedFallback(request),
        concept_summary: "Fallback concept generated due to error",
        philosophy: request.philosophy || "emotional",
        reasoning: "Error occurred during generation, using simplified fallback",
        estimated_impact: {},
        generation_time_ms: generationTime,
        model_used: this.config.model,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          source: "simplified_fallback",
          retry_count: 0,
        },
      };
    }
  }

  /**
   * Generate 3 concepts in parallel (Feature 3: Multi-Agent Creative Debate)
   *
   * This is the core of Feature 3 - launches 3 Directors with different
   * philosophies simultaneously to get diverse creative approaches.
   */
  async executeMultiVariant(
    request: MultiVariantRequest
  ): Promise<MultiVariantResult> {
    const startTime = Date.now();

    // Launch 3 Directors in parallel with Promise.allSettled (handles partial failures)
    const results = await Promise.allSettled([
      this.execute({ ...request, philosophy: "emotional" }),
      this.execute({ ...request, philosophy: "disruptive" }),
      this.execute({ ...request, philosophy: "dataDriven" }),
    ]);

    // Extract results or create error results
    const emotional =
      results[0].status === "fulfilled"
        ? results[0].value
        : this.getErrorResult("emotional", results[0].reason);

    const disruptive =
      results[1].status === "fulfilled"
        ? results[1].value
        : this.getErrorResult("disruptive", results[1].reason);

    const dataDriven =
      results[2].status === "fulfilled"
        ? results[2].value
        : this.getErrorResult("dataDriven", results[2].reason);

    // Check if all succeeded
    const allSucceeded =
      emotional.success && disruptive.success && dataDriven.success;

    // Optional: Synthesize best elements from all 3 (only if all succeeded)
    let synthesis: DirectorResult | undefined;
    if (request.synthesize_best && allSucceeded) {
      synthesis = await this.synthesizeConcepts(
        request,
        emotional,
        disruptive,
        dataDriven
      );
    }

    // Recommend best variant based on scores (only if all succeeded)
    const recommendation = allSucceeded
      ? this.recommendBestVariant(emotional, disruptive, dataDriven)
      : undefined;

    const totalTime = Date.now() - startTime;

    return {
      success: allSucceeded,
      variants: {
        emotional,
        disruptive,
        dataDriven,
      },
      synthesis,
      recommendation,
      total_generation_time_ms: totalTime,
    };
  }

  // ============================================================================
  // PRIVATE METHODS - Message Building
  // ============================================================================

  /**
   * Build user message with brief and context
   */
  private buildUserMessage(request: DirectorRequest): string {
    let message = `# Video Concept Brief\n\n`;

    // Core brief
    message += `**Brief:** ${request.brief}\n\n`;

    // Optional product info
    if (request.product) {
      message += `**Product:** ${request.product}\n\n`;
    }

    // Optional target audience
    if (request.target_audience) {
      message += `**Target Audience:** ${request.target_audience}\n\n`;
    }

    // Duration
    const duration = request.duration || 30;
    message += `**Duration:** ${duration} seconds\n\n`;

    // Optional Writer script (if this is second stage)
    if (request.script) {
      message += `## Writer Script Output\n\n`;
      message += `**Hook:** ${request.script.hook}\n\n`;
      message += `**Scenes:**\n`;
      request.script.scenes.forEach((scene, i) => {
        message += `${i + 1}. ${scene.description} (${scene.duration}s)\n`;
      });
      if (request.script.cta) {
        message += `\n**CTA:** ${request.script.cta}\n`;
      }
      message += `\n`;
    }

    // Optional brand context
    if (request.brand) {
      message += `## Brand Context\n\n`;
      if (request.brand.tone) {
        message += `**Tone:** ${request.brand.tone}\n`;
      }
      if (request.brand.visual_style) {
        message += `**Visual Style:** ${request.brand.visual_style}\n`;
      }
      if (request.brand.colors && request.brand.colors.length > 0) {
        message += `**Colors:** ${request.brand.colors.join(", ")}\n`;
      }
      if (request.brand.avoid && request.brand.avoid.length > 0) {
        message += `**Avoid:** ${request.brand.avoid.join(", ")}\n`;
      }
      message += `\n`;
    }

    // Instructions
    message += `---\n\n`;
    message += `Create a complete storyboard for this video concept using your creative philosophy.\n\n`;
    message += `**Output Format:**\n`;
    message += `Provide your response as a structured JSON object with:\n`;
    message += `- concept_summary: 2-3 sentence overview of the creative concept\n`;
    message += `- reasoning: Why this approach will work for this brief\n`;
    message += `- storyboard:\n`;
    message += `  - scenes: Array of scenes with scene_number, duration, description, visual_style, camera_movement, lighting, mood, audio_notes\n`;
    message += `  - overall_style: e.g., "cinematic", "documentary", "fast-paced"\n`;
    message += `  - color_palette: Suggested color scheme\n`;
    message += `  - music_direction: Overall music style\n`;
    message += `  - transitions: Transition style between scenes\n`;
    message += `- estimated_impact:\n`;
    message += `  - emotional_score: 0-10 (how emotionally resonant)\n`;
    message += `  - originality_score: 0-10 (how unique/memorable)\n`;
    message += `  - feasibility_score: 0-10 (how practical to produce)\n`;

    return message;
  }

  // ============================================================================
  // PRIVATE METHODS - Response Parsing
  // ============================================================================

  /**
   * Parse storyboard from Claude response
   */
  private parseStoryboard(response: string): Storyboard {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate storyboard structure
      if (!parsed.storyboard || !parsed.storyboard.scenes) {
        throw new Error("Invalid storyboard structure");
      }

      return parsed.storyboard;
    } catch (error) {
      // Fallback: Create basic storyboard from text
      console.warn("Failed to parse JSON storyboard, using fallback", error);
      return this.createFallbackStoryboard(response);
    }
  }

  /**
   * Extract concept summary from response
   */
  private extractConceptSummary(response: string): string {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.concept_summary) {
          return parsed.concept_summary;
        }
      }
    } catch (error) {
      // Fallback to first 200 characters
    }

    // Fallback: Use first paragraph
    const firstPara = response.split("\n\n")[0];
    return firstPara.substring(0, 200);
  }

  /**
   * Extract reasoning from response
   */
  private extractReasoning(response: string): string {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.reasoning) {
          return parsed.reasoning;
        }
      }
    } catch (error) {
      // Fallback
    }

    return "Creative reasoning based on philosophy guidelines";
  }

  /**
   * Extract impact scores from response
   */
  private extractImpactScores(response: string): {
    emotional_score?: number;
    originality_score?: number;
    feasibility_score?: number;
  } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.estimated_impact) {
          return parsed.estimated_impact;
        }
      }
    } catch (error) {
      // Return empty
    }

    return {};
  }

  /**
   * Create fallback storyboard from text response
   */
  private createFallbackStoryboard(response: string): Storyboard {
    return {
      scenes: [
        {
          scene_number: 1,
          duration: 10,
          description: "Opening scene - " + response.substring(0, 100),
          visual_style: "cinematic",
        },
        {
          scene_number: 2,
          duration: 15,
          description: "Main content",
          visual_style: "dynamic",
        },
        {
          scene_number: 3,
          duration: 5,
          description: "Closing scene",
          visual_style: "impactful",
        },
      ],
      overall_style: "professional",
    };
  }

  // ============================================================================
  // PRIVATE METHODS - Multi-Variant Support
  // ============================================================================

  /**
   * Synthesize best elements from all 3 variants
   *
   * Creates a 4th "best of all" concept by asking Claude to combine
   * the strongest elements from emotional, disruptive, and data-driven approaches.
   */
  private async synthesizeConcepts(
    request: MultiVariantRequest,
    emotional: DirectorResult,
    disruptive: DirectorResult,
    dataDriven: DirectorResult
  ): Promise<DirectorResult> {
    const startTime = Date.now();

    try {
      // Build synthesis prompt
      const synthesisPrompt = `You are a master creative director synthesizing the best elements from 3 diverse video concepts.

Review these 3 concepts and create a 4th concept that combines their strongest elements:

**EMOTIONAL CONCEPT:**
${emotional.concept_summary}
Reasoning: ${emotional.reasoning}

**DISRUPTIVE CONCEPT:**
${disruptive.concept_summary}
Reasoning: ${disruptive.reasoning}

**DATA-DRIVEN CONCEPT:**
${dataDriven.concept_summary}
Reasoning: ${dataDriven.reasoning}

**YOUR TASK:**
Create a new concept that takes:
- The emotional resonance from the Emotional approach
- The originality from the Disruptive approach
- The conversion optimization from the Data-Driven approach

Brief: ${request.brief}
Duration: ${request.duration || 30}s

Provide complete storyboard in same JSON format as previous concepts.`;

      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.max_tokens,
        temperature: 0.8, // Slightly lower for synthesis
        messages: [
          {
            role: "user",
            content: synthesisPrompt,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in synthesis response");
      }

      const storyboard = this.parseStoryboard(textContent.text);
      const generationTime = Date.now() - startTime;

      return {
        success: true,
        storyboard,
        concept_summary: this.extractConceptSummary(textContent.text),
        philosophy: "emotional", // Default classification
        reasoning:
          "Synthesized concept combining best elements from all 3 philosophies",
        estimated_impact: this.extractImpactScores(textContent.text),
        generation_time_ms: generationTime,
        model_used: this.config.model,
        tokens_used: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
        metadata: {
          source: "ai_generated",
          retry_count: 0,
        },
      };
    } catch (error) {
      // Return emotional variant as fallback
      return {
        ...emotional,
        reasoning: "Synthesis failed, using emotional variant as fallback",
      };
    }
  }

  /**
   * Recommend best variant based on impact scores
   */
  private recommendBestVariant(
    emotional: DirectorResult,
    disruptive: DirectorResult,
    dataDriven: DirectorResult
  ): { best_variant: DirectorPhilosophy; reason: string } {
    // Calculate total scores
    const scores = {
      emotional: this.calculateTotalScore(emotional.estimated_impact),
      disruptive: this.calculateTotalScore(disruptive.estimated_impact),
      dataDriven: this.calculateTotalScore(dataDriven.estimated_impact),
    };

    // Find highest score
    const best =
      scores.emotional >= scores.disruptive && scores.emotional >= scores.dataDriven
        ? "emotional"
        : scores.disruptive >= scores.dataDriven
          ? "disruptive"
          : "dataDriven";

    // Generate reason
    const reasons: Record<DirectorPhilosophy, string> = {
      emotional: `Highest overall impact (${scores.emotional.toFixed(1)}/10) - strongest emotional resonance and human connection`,
      disruptive: `Highest overall impact (${scores.disruptive.toFixed(1)}/10) - most original and memorable creative approach`,
      dataDriven: `Highest overall impact (${scores.dataDriven.toFixed(1)}/10) - best balance of feasibility and conversion potential`,
    };

    return {
      best_variant: best,
      reason: reasons[best],
    };
  }

  /**
   * Calculate total impact score (average of available scores)
   */
  private calculateTotalScore(impact: {
    emotional_score?: number;
    originality_score?: number;
    feasibility_score?: number;
  }): number {
    const scores = [
      impact.emotional_score || 0,
      impact.originality_score || 0,
      impact.feasibility_score || 0,
    ];

    const validScores = scores.filter((s) => s > 0);
    if (validScores.length === 0) return 0;

    return validScores.reduce((a, b) => a + b, 0) / validScores.length;
  }

  // ============================================================================
  // PRIVATE METHODS - Error Handling
  // ============================================================================

  /**
   * Get simplified fallback storyboard (used when API fails)
   */
  private getSimplifiedFallback(request: DirectorRequest): Storyboard {
    const duration = request.duration || 30;
    const sceneDuration = Math.floor(duration / 3);

    return {
      scenes: [
        {
          scene_number: 1,
          duration: sceneDuration,
          description: `Opening: Introduce ${request.product || "the concept"}`,
          visual_style: "engaging",
          mood: "inviting",
        },
        {
          scene_number: 2,
          duration: sceneDuration,
          description: `Main: Showcase key benefits and features`,
          visual_style: "dynamic",
          mood: "energetic",
        },
        {
          scene_number: 3,
          duration: duration - sceneDuration * 2,
          description: `Closing: Call to action`,
          visual_style: "impactful",
          mood: "inspiring",
        },
      ],
      overall_style: "professional",
      color_palette: ["vibrant", "modern"],
      music_direction: "upbeat and engaging",
      transitions: "smooth cuts",
    };
  }

  /**
   * Get error result for failed variant
   */
  private getErrorResult(
    philosophy: DirectorPhilosophy,
    error: unknown
  ): DirectorResult {
    return {
      success: false,
      storyboard: {
        scenes: [],
        overall_style: "error",
      },
      concept_summary: "Generation failed",
      philosophy,
      reasoning: "Error occurred during generation",
      estimated_impact: {},
      generation_time_ms: 0,
      model_used: this.config.model,
      error: error instanceof Error ? error.message : String(error),
      metadata: {
        source: "simplified_fallback",
        retry_count: 0,
      },
    };
  }

  // ============================================================================
  // PUBLIC METHODS - Utility
  // ============================================================================

  /**
   * Get available philosophies
   */
  getAvailablePhilosophies(): DirectorPhilosophy[] {
    return getAllPhilosophies();
  }

  /**
   * Get current config
   */
  getConfig(): DirectorConfig {
    return { ...this.config };
  }
}
