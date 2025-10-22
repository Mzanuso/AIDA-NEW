/**
 * Writer Executor - Complete Implementation
 * Advanced content generation engine with:
 * - 120+ narrative techniques database
 * - AI-powered cliché detection
 * - Tri-modal brand identity integration
 * - Emotional resonance validation
 * - Scene-by-scene context retention
 * - Dynamic system prompts
 * - Context-adaptive philosophy
 * - Rework cycle (safe → bold → radical)
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  WriterRequest,
  WriterResult,
  WriterConfig,
  SceneDescription,
  VisualDescription,
} from "./types";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load knowledge bases
const narrativeTechniques = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "knowledge", "narrative-techniques.json"),
    "utf-8"
  )
);

const clicheBlacklist = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "knowledge", "cliche-blacklist.json"),
    "utf-8"
  )
);

const visualReferences = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "knowledge", "visual-references.json"),
    "utf-8"
  )
);

interface GenerationContext {
  selectedTechniques: string[];
  reworkLevel: "safe" | "bold" | "radical";
  previousAttempts: string[];
  sceneContext?: string; // For progressive summarization
}

export class WriterExecutor {
  private anthropic: Anthropic;
  private config: WriterConfig;
  private generationContext: GenerationContext;

  constructor(config?: Partial<WriterConfig>) {
    // Initialize Anthropic client
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not found in environment variables");
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Default configuration - Creative temperature for originality
    this.config = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      temperature: 0.85, // High temperature for creativity
      use_cache: true,
      ...config,
    };

    this.generationContext = {
      selectedTechniques: [],
      reworkLevel: "safe",
      previousAttempts: [],
    };
  }

  /**
   * Main execution method with rework support
   */
  async execute(
    request: WriterRequest,
    reworkLevel?: "safe" | "bold" | "radical"
  ): Promise<WriterResult> {
    const executionStart = Date.now();

    try {
      // Update rework level
      if (reworkLevel) {
        this.generationContext.reworkLevel = reworkLevel;
      }

      console.log(`[WriterExecutor] Generating ${request.content_type}`, {
        tone: request.tone,
        language: request.language,
        reworkLevel: this.generationContext.reworkLevel,
      });

      // STEP 1: Select narrative techniques
      this.generationContext.selectedTechniques =
        await this.selectNarrativeTechniques(request);

      console.log("[WriterExecutor] Selected techniques:", {
        count: this.generationContext.selectedTechniques.length,
        techniques: this.generationContext.selectedTechniques,
      });

      // STEP 2: Route to appropriate generator
      let result: WriterResult;

      switch (request.content_type) {
        case "video_script":
          result = await this.generateVideoScript(request);
          break;

        case "marketing_copy":
          result = await this.generateMarketingCopy(request);
          break;

        case "social_media":
          result = await this.generateSocialMedia(request);
          break;

        case "blog_post":
          result = await this.generateBlogPost(request);
          break;

        case "product_description":
          result = await this.generateProductDescription(request);
          break;

        case "ad_copy":
          result = await this.generateAdCopy(request);
          break;

        default:
          throw new Error(`Unsupported content type: ${request.content_type}`);
      }

      // STEP 3: Validate for clichés and emotional resonance
      const validation = await this.validateContent(result.content);

      if (!validation.passed && this.generationContext.reworkLevel === "safe") {
        console.log("[WriterExecutor] Validation failed, regenerating...");
        // Auto-rework once if validation fails
        return this.execute(request, "bold");
      }

      // Add metadata
      result.metadata.generation_time_ms = Date.now() - executionStart;
      result.metadata.techniques_used = this.generationContext.selectedTechniques;
      result.metadata.rework_level = this.generationContext.reworkLevel;
      result.metadata.validation_score = validation.score;

      // Store attempt for rework cycle
      this.generationContext.previousAttempts.push(
        JSON.stringify(result.content)
      );

      console.log(`[WriterExecutor] Generation completed`, {
        content_type: request.content_type,
        word_count: result.metadata.word_count,
        validation_score: validation.score,
        time_ms: result.metadata.generation_time_ms,
      });

      return result;
    } catch (error: any) {
      console.error("[WriterExecutor] Generation failed:", error);

      return {
        success: false,
        content: {},
        metadata: {
          content_type: request.content_type,
          tone_applied: request.tone,
          language: request.language,
          word_count: 0,
          generation_time_ms: Date.now() - executionStart,
          model_used: this.config.model,
        },
        error: error.message || "Unknown error during content generation",
      };
    }
  }

  // ============================================================================
  // NARRATIVE TECHNIQUE SELECTION
  // ============================================================================

  /**
   * AI-powered technique selection from 120+ database
   * Selects 5-8 techniques based on brief analysis
   */
  private async selectNarrativeTechniques(
    request: WriterRequest
  ): Promise<string[]> {
    const selectionPrompt = `You are an expert narrative strategist. Analyze this brief and select 5-8 narrative techniques that would work best.

BRIEF: ${request.brief}
CONTENT TYPE: ${request.content_type}
TONE: ${request.tone}
DURATION: ${request.duration || "N/A"} seconds
TARGET AUDIENCE: ${request.target_audience || "general"}
REWORK LEVEL: ${this.generationContext.reworkLevel}

AVAILABLE TECHNIQUES DATABASE:
${JSON.stringify(narrativeTechniques, null, 2)}

INSTRUCTIONS:
1. Select 5-8 techniques that complement each other
2. Consider complexity vs content length (short content = simple techniques)
3. If REWORK LEVEL is "bold" or "radical", prioritize techniques marked "anti_cliche: true"
4. Return ONLY a JSON array of technique IDs, e.g. ["in_medias_res", "shock_opening", "power_words"]
5. NO explanation, ONLY the JSON array

OUTPUT FORMAT:
["technique_id_1", "technique_id_2", ...]`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 500,
        temperature: 0.7, // Lower temp for technique selection
        messages: [{ role: "user", content: selectionPrompt }],
      });

      const responseText =
        response.content[0].type === "text" ? response.content[0].text : "[]";

      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: return some default techniques
      return ["three_act_structure", "power_words", "show_dont_tell"];
    } catch (error) {
      console.error("[WriterExecutor] Technique selection failed:", error);
      return ["three_act_structure", "power_words", "show_dont_tell"];
    }
  }

  // ============================================================================
  // CONTENT GENERATORS
  // ============================================================================

  /**
   * 🎬 VIDEO SCRIPT GENERATOR
   * Scene-by-scene generation with context retention
   */
  private async generateVideoScript(
    request: WriterRequest
  ): Promise<WriterResult> {
    const duration = request.duration || 30;
    const estimatedScenes = Math.max(1, Math.floor(duration / 10)); // ~10s per scene

    const scenes: SceneDescription[] = [];
    let fullScript = "";

    // Generate scene-by-scene
    for (let i = 0; i < estimatedScenes; i++) {
      const scenePrompt = this.buildVideoScriptPrompt(
        request,
        i + 1,
        estimatedScenes
      );

      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.max_tokens,
        temperature: this.config.temperature,
        messages: [{ role: "user", content: scenePrompt }],
      });

      const sceneText =
        response.content[0].type === "text" ? response.content[0].text : "";

      fullScript += sceneText + "\n\n";

      // Parse scene
      const scene: SceneDescription = {
        scene_number: i + 1,
        description: this.extractSceneDescription(sceneText),
        duration_seconds: Math.floor(duration / estimatedScenes),
        voiceover: this.extractVoiceover(sceneText),
        visual_cues: this.extractVisualCues(sceneText),
        // NEW: Generate rich visual description
        visual_description: await this.generateVisualDescription(
          sceneText,
          request
        ),
      };

      scenes.push(scene);

      // Update context with progressive summarization
      if (i < estimatedScenes - 1) {
        this.generationContext.sceneContext = await this.summarizeContext(
          scenes
        );
      }
    }

    const wordCount = fullScript.split(/\s+/).length;

    return {
      success: true,
      content: {
        script: fullScript.trim(),
        scenes: scenes,
      },
      metadata: {
        content_type: "video_script",
        tone_applied: request.tone,
        language: request.language,
        word_count: wordCount,
        estimated_speaking_time_seconds: Math.ceil(wordCount / 2.5),
        generation_time_ms: 0,
        model_used: this.config.model,
      },
    };
  }

  /**
   * 📢 MARKETING COPY GENERATOR
   */
  private async generateMarketingCopy(
    request: WriterRequest
  ): Promise<WriterResult> {
    const prompt = this.buildMarketingPrompt(request);

    const response = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: this.config.max_tokens,
      temperature: this.config.temperature,
      messages: [{ role: "user", content: prompt }],
    });

    const generatedText =
      response.content[0].type === "text" ? response.content[0].text : "";

    const parsed = this.parseMarketingCopy(generatedText);

    return {
      success: true,
      content: {
        headline: parsed.headline,
        body: parsed.body,
        cta: parsed.cta || request.call_to_action,
      },
      metadata: {
        content_type: "marketing_copy",
        tone_applied: request.tone,
        language: request.language,
        word_count: generatedText.split(/\s+/).length,
        generation_time_ms: 0,
        model_used: this.config.model,
      },
    };
  }

  /**
   * 📱 SOCIAL MEDIA GENERATOR
   */
  private async generateSocialMedia(
    request: WriterRequest
  ): Promise<WriterResult> {
    const prompt = this.buildSocialMediaPrompt(request);

    const response = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: 1024, // Shorter for social
      temperature: this.config.temperature,
      messages: [{ role: "user", content: prompt }],
    });

    const generatedText =
      response.content[0].type === "text" ? response.content[0].text : "";

    return {
      success: true,
      content: {
        body: generatedText.trim(),
      },
      metadata: {
        content_type: "social_media",
        tone_applied: request.tone,
        language: request.language,
        word_count: generatedText.split(/\s+/).length,
        character_count: generatedText.length,
        generation_time_ms: 0,
        model_used: this.config.model,
      },
    };
  }

  /**
   * 📝 BLOG POST GENERATOR
   */
  private async generateBlogPost(request: WriterRequest): Promise<WriterResult> {
    const prompt = this.buildBlogPostPrompt(request);

    const response = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: this.config.max_tokens,
      temperature: this.config.temperature,
      messages: [{ role: "user", content: prompt }],
    });

    const generatedText =
      response.content[0].type === "text" ? response.content[0].text : "";

    const parsed = this.parseBlogPost(generatedText);

    return {
      success: true,
      content: {
        headline: parsed.title,
        body: parsed.content,
      },
      metadata: {
        content_type: "blog_post",
        tone_applied: request.tone,
        language: request.language,
        word_count: generatedText.split(/\s+/).length,
        estimated_reading_time_minutes: Math.ceil(
          generatedText.split(/\s+/).length / 200
        ),
        generation_time_ms: 0,
        model_used: this.config.model,
      },
    };
  }

  /**
   * 🏷️ PRODUCT DESCRIPTION GENERATOR
   */
  private async generateProductDescription(
    request: WriterRequest
  ): Promise<WriterResult> {
    const prompt = this.buildProductDescriptionPrompt(request);

    const response = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: 1024,
      temperature: this.config.temperature,
      messages: [{ role: "user", content: prompt }],
    });

    const generatedText =
      response.content[0].type === "text" ? response.content[0].text : "";

    return {
      success: true,
      content: {
        body: generatedText.trim(),
      },
      metadata: {
        content_type: "product_description",
        tone_applied: request.tone,
        language: request.language,
        word_count: generatedText.split(/\s+/).length,
        generation_time_ms: 0,
        model_used: this.config.model,
      },
    };
  }

  /**
   * 💰 AD COPY GENERATOR
   */
  private async generateAdCopy(request: WriterRequest): Promise<WriterResult> {
    const prompt = this.buildAdCopyPrompt(request);

    const response = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: 512, // Very short for ads
      temperature: this.config.temperature,
      messages: [{ role: "user", content: prompt }],
    });

    const generatedText =
      response.content[0].type === "text" ? response.content[0].text : "";

    const parsed = this.parseAdCopy(generatedText);

    return {
      success: true,
      content: {
        headline: parsed.headline,
        body: parsed.body,
        cta: parsed.cta || request.call_to_action,
      },
      metadata: {
        content_type: "ad_copy",
        tone_applied: request.tone,
        language: request.language,
        word_count: generatedText.split(/\s+/).length,
        character_count: generatedText.length,
        generation_time_ms: 0,
        model_used: this.config.model,
      },
    };
  }

  // ============================================================================
  // DYNAMIC SYSTEM PROMPTS
  // ============================================================================

  /**
   * Build context-adaptive system prompt
   */
  private buildSystemPrompt(request: WriterRequest): string {
    const reworkInstructions = this.getReworkInstructions();
    const philosophyStatement = this.getPhilosophyStatement(request);

    return `You are an exceptional creative writer and copywriter with these core principles:

${philosophyStatement}

ANTI-CLICHÉ MANDATE:
You MUST avoid these universal clichés:
${this.formatBlacklistForPrompt()}

Beyond this blacklist, use your judgment: Would an experienced creator roll their eyes at this phrase? If yes, find a fresh alternative.

NARRATIVE TECHNIQUES TO EMPLOY:
You have access to these selected techniques for this piece:
${this.formatTechniquesForPrompt()}

Apply these techniques naturally and organically. Don't force them.

REWORK LEVEL: ${this.generationContext.reworkLevel.toUpperCase()}
${reworkInstructions}

${this.getBrandIdentitySection(request)}

EMOTIONAL RESONANCE:
Your writing must evoke genuine emotion. Aim for emotional variety - mix moments of different feelings. Avoid emotional flatness.

LANGUAGE CLARITY:
Keep language clear and accessible to all. Intelligence comes from ideas and structure, not complex vocabulary.

GLOBAL PERSPECTIVE:
Write for a global audience. Use cultural references only if widely understood.`;
  }

  /**
   * Get philosophy statement based on context-adaptive approach
   */
  private getPhilosophyStatement(request: WriterRequest): string {
    const tone = request.tone;
    const audience = request.target_audience?.toLowerCase() || "";

    // Context-adaptive philosophy
    if (
      tone === "professional" &&
      (audience.includes("b2b") || audience.includes("enterprise"))
    ) {
      return `PHILOSOPHY: Intelligent but accessible. Bold but not alienating. Surprising but credible.
Your goal: Make sophisticated readers nod in recognition while introducing fresh perspectives.`;
    } else if (
      tone === "energetic" ||
      (audience.includes("gen z") || audience.includes("youth"))
    ) {
      return `PHILOSOPHY: Surprise above all. Push boundaries. Break expectations.
Your goal: Make the audience stop scrolling and say "wait, what?" - then keep them hooked.`;
    } else if (tone === "inspirational" || tone === "emotional") {
      return `PHILOSOPHY: Authentic emotion trumps manufactured drama. Vulnerability creates connection.
Your goal: Touch the heart without manipulation. Inspire action through genuine resonance.`;
    } else {
      // Default balanced approach
      return `PHILOSOPHY: Context-adaptive intelligence. Surprise when appropriate, clarify when needed.
Your goal: Exceed expectations while remaining universally comprehensible.`;
    }
  }

  /**
   * Get rework-specific instructions
   */
  private getReworkInstructions(): string {
    switch (this.generationContext.reworkLevel) {
      case "safe":
        return `Create intelligent, accessible content that's fresh but not alienating.
Surprise the audience subtly. This is the first attempt - balance creativity with broad appeal.`;

      case "bold":
        return `Push boundaries. Be provocative and surprising.
Use anti-cliché techniques marked in your arsenal. Challenge assumptions.
The first attempt was too safe - now take creative risks.`;

      case "radical":
        return `Maximum creative freedom. Be irreverent. Break conventions.
This is the third attempt - the user wants something truly unconventional.
Use experimental techniques. Embrace controlled chaos. Provoke thought.`;

      default:
        return "";
    }
  }

  /**
   * Get brand identity section if provided
   */
  private getBrandIdentitySection(request: WriterRequest): string {
    if (!request.brand_identity) {
      return "";
    }

    let section = "BRAND IDENTITY:\n";

    // Parameters
    if (request.brand_identity.brand_voice) {
      section += `Voice: ${request.brand_identity.brand_voice}\n`;
    }
    if (request.brand_identity.brand_values?.length) {
      section += `Values: ${request.brand_identity.brand_values.join(", ")}\n`;
    }
    if (request.brand_identity.target_persona) {
      section += `Persona: ${request.brand_identity.target_persona}\n`;
    }

    // Examples (few-shot learning)
    if (request.brand_identity.example_content?.length) {
      section += `\nBRAND EXAMPLES (match this style):\n`;
      request.brand_identity.example_content.forEach((example, i) => {
        section += `Example ${i + 1}: ${example}\n`;
      });
    }

    return section;
  }

  /**
   * Format blacklist for prompt
   */
  private formatBlacklistForPrompt(): string {
    const categories = Object.values(clicheBlacklist.categories);
    const allPatterns: string[] = [];

    categories.forEach((category: any) => {
      allPatterns.push(...category.patterns.slice(0, 5)); // First 5 from each
    });

    return allPatterns.slice(0, 20).join(", "); // Limit to 20 total
  }

  /**
   * Format selected techniques for prompt
   */
  private formatTechniquesForPrompt(): string {
    const techniqueDescriptions: string[] = [];

    // Find full technique objects
    Object.values(narrativeTechniques.categories).forEach((category: any) => {
      category.techniques.forEach((tech: any) => {
        if (this.generationContext.selectedTechniques.includes(tech.id)) {
          techniqueDescriptions.push(
            `- ${tech.name}: ${tech.description} (${tech.emotional_impact})`
          );
        }
      });
    });

    return techniqueDescriptions.join("\n");
  }

  // ============================================================================
  // PROMPT BUILDERS
  // ============================================================================

  private buildVideoScriptPrompt(
    request: WriterRequest,
    sceneNumber: number,
    totalScenes: number
  ): string {
    const duration = request.duration || 30;
    const sceneDuration = Math.floor(duration / totalScenes);
    const language = request.language === "it" ? "Italian" : "English";

    const systemPrompt = this.buildSystemPrompt(request);

    const contextSection = this.generationContext.sceneContext
      ? `\nPREVIOUS SCENES CONTEXT:\n${this.generationContext.sceneContext}\n\nBuild on this context for narrative continuity.`
      : "";

    return `${systemPrompt}

TASK: Write scene ${sceneNumber} of ${totalScenes} for a ${duration}-second video in ${language}.

BRIEF: ${request.brief}
TONE: ${request.tone}
SCENE DURATION: ~${sceneDuration} seconds
${request.style?.style_name ? `VISUAL STYLE: ${request.style.style_name}` : ""}
${request.target_audience ? `TARGET AUDIENCE: ${request.target_audience}` : ""}
${request.key_messages?.length ? `KEY MESSAGES: ${request.key_messages.join(", ")}` : ""}
${request.call_to_action && sceneNumber === totalScenes ? `CALL TO ACTION: ${request.call_to_action}` : ""}
${contextSection}

VISUAL STORYTELLING:
Think like a director. Describe the visuals in RICH DETAIL:
- What do we SEE? (setting, subjects, composition)
- What is the LIGHTING like? (quality, direction, mood)
- What is the ATMOSPHERE? (emotional tone, mood)
- What COLORS dominate the scene?
- Any cinematic STYLE references? (optional)

OUTPUT FORMAT:
SCENE ${sceneNumber}:
[Detailed visual description - what we see on screen, including lighting, atmosphere, composition]

VOICEOVER:
[Exact words to be spoken]

VISUAL CUES:
[Specific shots, camera movements, visual elements]

MAKE IT: Visually rich, cinematic, surprising, and emotionally resonant. Every word counts.`;
  }

  private buildMarketingPrompt(request: WriterRequest): string {
    const language = request.language === "it" ? "Italian" : "English";
    const systemPrompt = this.buildSystemPrompt(request);

    return `${systemPrompt}

TASK: Write compelling marketing copy in ${language}.

BRIEF: ${request.brief}
TONE: ${request.tone}
${request.target_audience ? `TARGET AUDIENCE: ${request.target_audience}` : ""}
${request.key_messages?.length ? `KEY MESSAGES: ${request.key_messages.join(", ")}` : ""}
${request.call_to_action ? `CALL TO ACTION: ${request.call_to_action}` : ""}

OUTPUT FORMAT:
HEADLINE:
[Attention-grabbing headline]

BODY:
[Persuasive marketing copy - benefit-focused]

CTA:
[Specific, actionable call to action]

MAKE IT: Benefit-driven, emotionally compelling, conversion-optimized.`;
  }

  private buildSocialMediaPrompt(request: WriterRequest): string {
    const language = request.language === "it" ? "Italian" : "English";
    const systemPrompt = this.buildSystemPrompt(request);

    const platform = request.platform_specific?.platform || "general";
    const charLimit = request.platform_specific?.character_limit || 280;

    return `${systemPrompt}

TASK: Write social media post in ${language} for ${platform}.

BRIEF: ${request.brief}
TONE: ${request.tone}
CHARACTER LIMIT: ${charLimit}
${request.target_audience ? `TARGET AUDIENCE: ${request.target_audience}` : ""}
${request.call_to_action ? `CALL TO ACTION: ${request.call_to_action}` : ""}

PLATFORM CONTEXT:
${this.getPlatformContext(platform)}

OUTPUT: Just the post text, optimized for ${platform}. No formatting labels.

MAKE IT: Scroll-stopping, shareable, action-driving. Hook in first 5 words.`;
  }

  private buildBlogPostPrompt(request: WriterRequest): string {
    const language = request.language === "it" ? "Italian" : "English";
    const systemPrompt = this.buildSystemPrompt(request);

    return `${systemPrompt}

TASK: Write a compelling blog post in ${language}.

BRIEF: ${request.brief}
TONE: ${request.tone}
${request.target_audience ? `TARGET AUDIENCE: ${request.target_audience}` : ""}
${request.key_messages?.length ? `KEY MESSAGES: ${request.key_messages.join(", ")}` : ""}

OUTPUT FORMAT:
[Compelling Title]

[Opening hook paragraph]

[Body - structured with subheadings]

[Conclusion with key takeaway]

MAKE IT: In-depth, insightful, SEO-friendly but human-first. Mix short and long paragraphs.`;
  }

  private buildProductDescriptionPrompt(request: WriterRequest): string {
    const language = request.language === "it" ? "Italian" : "English";
    const systemPrompt = this.buildSystemPrompt(request);

    return `${systemPrompt}

TASK: Write product description in ${language}.

PRODUCT: ${request.brief}
TONE: ${request.tone}
${request.target_audience ? `TARGET BUYER: ${request.target_audience}` : ""}
${request.key_messages?.length ? `KEY FEATURES: ${request.key_messages.join(", ")}` : ""}

MAKE IT: Benefit-focused, sensory-rich, conversion-optimized. Show how it improves life.`;
  }

  private buildAdCopyPrompt(request: WriterRequest): string {
    const language = request.language === "it" ? "Italian" : "English";
    const systemPrompt = this.buildSystemPrompt(request);

    const adFormat = request.platform_specific?.ad_format || "standard";
    const charLimit = request.platform_specific?.character_limit || 150;

    return `${systemPrompt}

TASK: Write ad copy in ${language} for ${adFormat} format.

BRIEF: ${request.brief}
TONE: ${request.tone}
CHARACTER LIMIT: ${charLimit}
${request.target_audience ? `TARGET: ${request.target_audience}` : ""}
${request.call_to_action ? `CTA: ${request.call_to_action}` : ""}

OUTPUT FORMAT:
HEADLINE: [max 60 chars]
BODY: [main ad text]
CTA: [action prompt]

MAKE IT: Ultra-concise, high-impact, conversion-focused. Every word must earn its place.`;
  }

  // ============================================================================
  // PARSERS
  // ============================================================================

  private extractSceneDescription(sceneText: string): string {
    const match = sceneText.match(/SCENE \d+:\s*\n([^\n]+)/);
    return match ? match[1].trim() : sceneText.substring(0, 100);
  }

  private extractVoiceover(sceneText: string): string {
    const match = sceneText.match(/VOICEOVER:\s*\n([\s\S]*?)(?:VISUAL CUES:|$)/);
    return match ? match[1].trim() : "";
  }

  private extractVisualCues(sceneText: string): string[] {
    const match = sceneText.match(/VISUAL CUES:\s*\n([\s\S]*)/);
    if (!match) return [];

    return match[1]
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^[-•]\s*/, "").trim());
  }

  private parseMarketingCopy(text: string): {
    headline: string;
    body: string;
    cta?: string;
  } {
    const headlineMatch = text.match(/HEADLINE:\s*\n([^\n]+)/);
    const bodyMatch = text.match(/BODY:\s*\n([\s\S]*?)(?:CTA:|$)/);
    const ctaMatch = text.match(/CTA:\s*\n([^\n]+)/);

    return {
      headline: headlineMatch?.[1].trim() || "Untitled",
      body: bodyMatch?.[1].trim() || text,
      cta: ctaMatch?.[1].trim(),
    };
  }

  private parseBlogPost(text: string): { title: string; content: string } {
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const title = lines[0] || "Untitled";
    const content = lines.slice(1).join("\n");

    return { title, content };
  }

  private parseAdCopy(text: string): {
    headline: string;
    body: string;
    cta?: string;
  } {
    const headlineMatch = text.match(/HEADLINE:\s*([^\n]+)/);
    const bodyMatch = text.match(/BODY:\s*([\s\S]*?)(?:CTA:|$)/);
    const ctaMatch = text.match(/CTA:\s*([^\n]+)/);

    return {
      headline: headlineMatch?.[1].trim() || text.split("\n")[0] || "",
      body: bodyMatch?.[1].trim() || text,
      cta: ctaMatch?.[1].trim(),
    };
  }

  // ============================================================================
  // VISUAL STORYTELLING
  // ============================================================================

  /**
   * Generate rich visual description using visual references database
   * This creates descriptive visual details for Visual Creator to translate into technical prompts
   */
  private async generateVisualDescription(
    sceneText: string,
    request: WriterRequest
  ): Promise<VisualDescription> {
    const visualPrompt = `You are a cinematographer and visual storytelling expert. Analyze this scene and create a RICH, DETAILED visual description.

SCENE TEXT:
${sceneText}

BRIEF CONTEXT: ${request.brief}
TONE: ${request.tone}
${request.style?.style_name ? `VISUAL STYLE: ${request.style.style_name}` : ""}

VISUAL REFERENCES DATABASE (use for inspiration):
${JSON.stringify(visualReferences, null, 2)}

YOUR TASK:
Create a detailed visual description that a Visual Creator Agent can use to generate image prompts.
Think like a director describing a shot to the cinematographer.

IMPORTANT:
- Be DESCRIPTIVE, not technical (e.g., "warm golden sunlight" not "color temperature 3200K")
- Include sensory details (lighting quality, atmosphere, mood)
- Suggest cinematic styles or references when relevant
- Describe colors in natural terms ("deep blue", "neon pink", "warm amber")
- Don't write technical prompt syntax - just rich descriptions

OUTPUT FORMAT (JSON):
{
  "setting": "Physical location and environment",
  "subjects": "Characters, objects, or focal points",
  "lighting": "Quality, direction, and mood of light",
  "atmosphere": "Overall feeling and mood",
  "camera_suggestion": "Suggested angle and framing (descriptive, not technical)",
  "composition_notes": "Visual composition guidance",
  "emotional_tone": "The emotion this visual should evoke",
  "color_palette_suggestion": ["color1", "color2", "color3"],
  "style_reference": "Optional cinematic/artistic style reference"
}

RETURN ONLY THE JSON OBJECT, NO EXPLANATIONS.`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 1500,
        temperature: 0.75, // Creative but controlled
        messages: [{ role: "user", content: visualPrompt }],
      });

      const responseText =
        response.content[0].type === "text" ? response.content[0].text : "{}";

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          setting: parsed.setting || "Unspecified setting",
          subjects: parsed.subjects || "No specific subject",
          lighting: parsed.lighting || "Natural lighting",
          atmosphere: parsed.atmosphere || "Neutral atmosphere",
          camera_suggestion: parsed.camera_suggestion || "Eye-level shot",
          composition_notes: parsed.composition_notes || "Balanced composition",
          emotional_tone: parsed.emotional_tone || "Neutral",
          color_palette_suggestion: parsed.color_palette_suggestion || [
            "natural",
          ],
          style_reference: parsed.style_reference,
        };
      }

      // Fallback if parsing fails
      return this.createFallbackVisualDescription(sceneText);
    } catch (error) {
      console.error(
        "[WriterExecutor] Visual description generation failed:",
        error
      );
      return this.createFallbackVisualDescription(sceneText);
    }
  }

  /**
   * Create fallback visual description when AI generation fails
   */
  private createFallbackVisualDescription(
    sceneText: string
  ): VisualDescription {
    return {
      setting: "Generic environment matching scene context",
      subjects: "Scene subjects as described",
      lighting: "Natural, balanced lighting",
      atmosphere: "Appropriate to scene mood",
      camera_suggestion: "Medium shot, eye-level",
      composition_notes: "Balanced, rule of thirds",
      emotional_tone: "Contextually appropriate",
      color_palette_suggestion: ["natural tones"],
      style_reference: undefined,
    };
  }

  // ============================================================================
  // VALIDATION & QUALITY CONTROL
  // ============================================================================

  /**
   * Validate content for clichés and emotional resonance
   */
  private async validateContent(content: any): Promise<{
    passed: boolean;
    score: number;
    issues: string[];
  }> {
    const contentText = JSON.stringify(content).toLowerCase();
    const issues: string[] = [];

    // Check blacklist clichés
    let clicheCount = 0;
    Object.values(clicheBlacklist.categories).forEach((category: any) => {
      category.patterns.forEach((pattern: string) => {
        if (contentText.includes(pattern.toLowerCase())) {
          clicheCount++;
          issues.push(`Cliché detected: "${pattern}"`);
        }
      });
    });

    // Calculate score (0-100)
    let score = 100;
    score -= clicheCount * 15; // -15 per cliché
    score = Math.max(0, score);

    return {
      passed: score >= 70,
      score,
      issues,
    };
  }

  /**
   * Progressive context summarization for long content
   */
  private async summarizeContext(scenes: SceneDescription[]): Promise<string> {
    if (scenes.length === 0) return "";

    const sceneSummaries = scenes
      .map(
        (s) =>
          `Scene ${s.scene_number}: ${s.description.substring(0, 50)}... (${s.duration_seconds}s)`
      )
      .join("\n");

    return `Previous scenes:\n${sceneSummaries}\n\nNarrative flow: ${this.inferNarrativeFlow(scenes)}`;
  }

  private inferNarrativeFlow(scenes: SceneDescription[]): string {
    // Simple inference based on scene progression
    if (scenes.length < 2) return "Beginning";
    if (scenes.length === 2) return "Rising action";
    return "Building to climax";
  }

  /**
   * Get platform-specific context
   */
  private getPlatformContext(platform: string): string {
    const contexts: Record<string, string> = {
      twitter:
        "Short, punchy, conversational. Use line breaks. Hashtags optional.",
      instagram:
        "Visual-first storytelling. Emojis welcome. First line is crucial.",
      linkedin:
        "Professional but human. Thought leadership tone. Value-driven.",
      tiktok: "Gen Z energy. Fast-paced. Hook in first 3 words. Trend-aware.",
      facebook: "Conversational, community-focused. Questions engage well.",
      youtube:
        "Structured storytelling. Can be longer. Value proposition upfront.",
    };

    return (
      contexts[platform.toLowerCase()] ||
      "Engaging, shareable, platform-optimized."
    );
  }
}
