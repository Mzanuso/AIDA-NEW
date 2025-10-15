/**
 * Conversational Orchestrator - The Brain
 *
 * Coordinates all components to provide conversational video creation experience.
 * Manages state machine (discovery → refinement → execution → delivery).
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '@backend/utils/logger';
import { ContextAnalyzer, ConversationContext, Message } from '../services/context-analyzer';
import { IntentAnalyzer } from '../services/intent-analyzer';
import { UniversalModelSelector, UserIntent, CreativeCapability } from '../services/model-selector';
import { CostCalculator } from '../utils/cost-calculator';
import { StyleSelectorClient } from '../clients/style-selector-client';
import {
  buildSystemPrompt,
  buildUserContextString,
  COST_TRANSPARENCY_PROMPT,
  PERSONALITY_PROMPT,
  THERAPY_MODE_PROMPT,
  DIRECT_ANSWER_PROMPT
} from '../config/personality-prompt';

const logger = createLogger('ConversationalOrchestrator');

/**
 * Response from the orchestrator
 */
export interface OrchestratorResponse {
  message: string;
  sessionId: string;
  phase: ConversationContext['phase'];
  needsUserInput: boolean;
  proposedCost?: number;
  toolPlan?: any;
  executionStatus?: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

/**
 * Conversational Orchestrator
 *
 * The brain that coordinates context, intent, tool selection, and response generation.
 */
export class ConversationalOrchestrator {
  private contextAnalyzer: ContextAnalyzer;
  private intentAnalyzer: IntentAnalyzer;
  private modelSelector: UniversalModelSelector;
  private costCalculator: CostCalculator;
  private styleSelector: StyleSelectorClient;
  private claude: Anthropic;

  constructor(config?: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    styleSelectorUrl?: string;
  }) {
    this.contextAnalyzer = new ContextAnalyzer();
    this.intentAnalyzer = new IntentAnalyzer(config?.anthropicApiKey);
    this.modelSelector = new UniversalModelSelector();
    this.costCalculator = new CostCalculator();
    this.styleSelector = new StyleSelectorClient(config?.styleSelectorUrl);

    this.claude = new Anthropic({
      apiKey: config?.anthropicApiKey || process.env.ANTHROPIC_API_KEY!
    });

    logger.info('ConversationalOrchestrator initialized');
  }

  /**
   * Main entry point - process user message and return orchestrator response
   */
  async processMessage(
    message: string,
    userId: string,
    sessionId?: string,
    projectId?: string
  ): Promise<OrchestratorResponse> {
    logger.info('Processing message', { message, userId, sessionId });

    try {
      // 1. Load or create conversation context
      let context: ConversationContext;
      let isNewSession = false;

      if (!sessionId) {
        // New conversation - create session
        sessionId = await this.contextAnalyzer.createSession(userId, projectId);
        context = await this.contextAnalyzer.loadContext(sessionId);
        isNewSession = true;
        logger.info('Created new session', { sessionId });
      } else {
        // Try to load existing conversation
        try {
          context = await this.contextAnalyzer.loadContext(sessionId);
        } catch (error) {
          // Session not found or invalid - create new one
          logger.warn('Session not found or invalid, creating new session', {
            oldSessionId: sessionId,
            error
          });
          sessionId = await this.contextAnalyzer.createSession(userId, projectId);
          context = await this.contextAnalyzer.loadContext(sessionId);
          isNewSession = true;
        }
      }

      // 2. Detect conversation mode (therapy, direct answer, or task)
      const conversationMode = this.detectConversationMode(message, context);

      // 3. Handle special modes early (before intent analysis)
      if (conversationMode === 'therapy') {
        return await this.handleTherapyMode(message, context, sessionId);
      }

      if (conversationMode === 'direct_answer') {
        return await this.handleDirectAnswer(message, context, sessionId);
      }

      // 4. Analyze user message for intent (task mode)
      const analysisResult = await this.intentAnalyzer.analyze(message, context);

      // 5. Update context with new message and intent
      context = await this.contextAnalyzer.updateContext(
        sessionId,
        {
          role: 'user',
          content: message,
          metadata: { originalIntent: analysisResult }
        },
        {
          purpose: analysisResult.purpose,
          platform: analysisResult.platform,
          style: analysisResult.style,
          mediaType: analysisResult.mediaType,
          budgetSensitivity: analysisResult.budgetSensitivity,
          hasScript: analysisResult.hasScript,
          hasVisuals: analysisResult.hasVisuals
        },
        analysisResult.inferredSpecs
      );

      // 6. Determine phase and route to appropriate handler
      const phase = context.phase;
      logger.info('Current conversation phase', { phase, sessionId });

      let response: OrchestratorResponse;

      switch (phase) {
        case 'discovery':
          response = await this.handleDiscovery(context, sessionId);
          break;

        case 'refinement':
          response = await this.handleRefinement(context, sessionId);
          break;

        case 'execution':
          response = await this.handleExecution(context, sessionId);
          break;

        case 'delivery':
          response = await this.handleDelivery(context, sessionId);
          break;

        default:
          throw new Error(`Unknown phase: ${phase}`);
      }

      // 5. Save assistant response to context
      await this.contextAnalyzer.updateContext(
        sessionId,
        {
          role: 'assistant',
          content: response.message,
          metadata: {
            phase,
            proposedCost: response.proposedCost,
            toolPlan: response.toolPlan
          }
        }
      );

      logger.info('Message processed successfully', {
        sessionId,
        phase,
        needsUserInput: response.needsUserInput
      });

      return response;

    } catch (error) {
      logger.error('Failed to process message', { error, userId, sessionId });

      // Return friendly error message
      return {
        message: 'Scusa, ho avuto un problema. Puoi riprovare?',
        sessionId: sessionId || 'error',
        phase: 'discovery',
        needsUserInput: true,
        metadata: { error: String(error) }
      };
    }
  }

  /**
   * DISCOVERY PHASE: Ask smart questions to understand user needs
   */
  private async handleDiscovery(
    context: ConversationContext,
    sessionId: string
  ): Promise<OrchestratorResponse> {
    logger.info('Handling discovery phase', { sessionId });

    // Check if user is explicitly asking for style suggestions
    const lastUserMessage = context.messages
      .filter(m => m.role === 'user')
      .pop();

    const asksForStyles = lastUserMessage &&
      /(mostra|suggerisci|proponi|vedi|quali).*(stile|stili|style)/i.test(lastUserMessage.content);

    if (asksForStyles) {
      logger.info('User explicitly asked for style suggestions');

      // Get style recommendations
      const styleIntent = {
        purpose: context.detectedIntent.purpose,
        platform: context.detectedIntent.platform,
        style: context.detectedIntent.style
      };

      logger.info('Fetching style recommendations', { styleIntent });

      const styles = await this.styleSelector.getRecommendations(styleIntent, 5);

      logger.info('Style recommendations received', { count: styles.length });

      if (styles.length > 0) {
        return {
          message: 'Ti mostro alcuni stili visivi che potrebbero funzionare per il tuo progetto. Seleziona quello che preferisci dalla galleria!',
          sessionId,
          phase: 'discovery',
          needsUserInput: true,
          metadata: {
            showStyleModal: true, // 🔑 Frontend flag to trigger modal
            suggestedStyles: styles.map(s => ({ id: s.id, name: s.name, category: s.category, code: s.code })),
            detectedIntent: context.detectedIntent
          }
        };
      }
    }

    // Check if we have enough info to move to refinement
    if (this.hasEnoughInfoForRefinement(context)) {
      // Move to refinement phase
      context.phase = 'refinement';
      return this.handleRefinement(context, sessionId);
    }

    // Ask smart question
    const question = await this.askSmartQuestion(context);

    return {
      message: question,
      sessionId,
      phase: 'discovery',
      needsUserInput: true,
      metadata: {
        missingInfo: context.missingInfo,
        detectedIntent: context.detectedIntent
      }
    };
  }

  /**
   * REFINEMENT PHASE: Propose creative direction and get approval
   */
  private async handleRefinement(
    context: ConversationContext,
    sessionId: string
  ): Promise<OrchestratorResponse> {
    logger.info('Handling refinement phase', { sessionId });

    // Check if user approved (look for affirmative in last message)
    const lastUserMessage = context.messages
      .filter(m => m.role === 'user')
      .pop();

    const hasApproval = lastUserMessage &&
      /^(sì|si|yes|ok|vai|procedi|perfetto|va bene|certo)/i.test(lastUserMessage.content.trim());

    if (hasApproval && context.metadata.proposedToolPlan) {
      // User approved - move to execution
      context.phase = 'execution';
      return this.handleExecution(context, sessionId);
    }

    // Propose direction + cost
    const proposal = await this.proposeDirection(context);

    return {
      message: proposal.message,
      sessionId,
      phase: 'refinement',
      needsUserInput: true,
      proposedCost: proposal.cost,
      toolPlan: proposal.toolPlan,
      metadata: {
        toolPlan: proposal.toolPlan,
        costBreakdown: proposal.costBreakdown
      }
    };
  }

  /**
   * EXECUTION PHASE: Execute the plan with sub-agents
   */
  private async handleExecution(
    context: ConversationContext,
    sessionId: string
  ): Promise<OrchestratorResponse> {
    logger.info('Handling execution phase', { sessionId });

    // Generate execution confirmation message
    const executionMessage = await this.execute(context);

    return {
      message: executionMessage,
      sessionId,
      phase: 'execution',
      needsUserInput: false,
      executionStatus: 'in_progress',
      metadata: {
        toolPlan: context.metadata.proposedToolPlan
      }
    };
  }

  /**
   * DELIVERY PHASE: Deliver results and ask for feedback
   */
  private async handleDelivery(
    context: ConversationContext,
    sessionId: string
  ): Promise<OrchestratorResponse> {
    logger.info('Handling delivery phase', { sessionId });

    const deliveryMessage = await this.deliverResults(context);

    return {
      message: deliveryMessage,
      sessionId,
      phase: 'delivery',
      needsUserInput: true,
      executionStatus: 'completed',
      metadata: {
        resultUrls: context.metadata.resultUrls || []
      }
    };
  }

  /**
   * Ask intelligent follow-up question during discovery
   */
  private async askSmartQuestion(context: ConversationContext): Promise<string> {
    logger.info('Generating smart question', {
      sessionId: context.sessionId,
      missingInfo: context.missingInfo
    });

    const systemPrompt = buildSystemPrompt('discovery');
    const userContext = buildUserContextString({
      detectedIntent: context.detectedIntent,
      inferredSpecs: context.inferredSpecs,
      messageCount: context.messages.length,
      previousProjects: 0 // TODO: get from user history
    });

    // Build conversation history for Claude
    const messages: Anthropic.MessageParam[] = context.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

    try {
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        temperature: 0.7,
        system: `${systemPrompt}\n\n${userContext}`,
        messages
      });

      const question = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Raccontami un po\' - che tipo di progetto hai in mente?';

      logger.info('Smart question generated', { question });
      return question;

    } catch (error) {
      logger.error('Failed to generate smart question', { error });
      // Fallback question
      return 'Raccontami un po\' - che tipo di progetto hai in mente?';
    }
  }

  /**
   * Propose creative direction with cost during refinement
   */
  private async proposeDirection(context: ConversationContext): Promise<{
    message: string;
    cost: number;
    toolPlan: any;
    costBreakdown: any;
  }> {
    logger.info('Proposing creative direction', { sessionId: context.sessionId });

    try {
      // 1. Get style recommendations from Style Selector
      const styleRecommendations = await this.styleSelector.getRecommendations({
        purpose: context.detectedIntent.purpose,
        platform: context.detectedIntent.platform,
        style: context.detectedIntent.style,
        mood: context.detectedIntent.style
      }, 3);

      logger.info('Style recommendations retrieved', {
        count: styleRecommendations.length,
        styles: styleRecommendations.map(s => s.name)
      });

      // 2. Map context to UserIntent for model selector
      const capability = this.mapIntentToCapability(context.detectedIntent);
      const userIntent: UserIntent = {
        capability,
        // Video specific
        duration: context.inferredSpecs.duration ? parseInt(context.inferredSpecs.duration) : undefined,
        aspectRatio: context.inferredSpecs.aspectRatio,
        isCinematic: context.detectedIntent.style === 'cinematic',
        hasDialogue: context.detectedIntent.hasScript,
        // Image specific
        isArtistic: context.detectedIntent.style === 'cinematic' || context.detectedIntent.style === 'minimalist',
        hasText: false, // Could be inferred from context
        // General
        qualityLevel: context.inferredSpecs.qualityLevel === 'high' ? 'premium' : 'standard',
        budgetSensitive: context.detectedIntent.budgetSensitivity === 'high'
      };

      // 3. Select best model
      const modelSelection = this.modelSelector.selectModel(userIntent);

      // 4. Build tool plan from model selection
      const toolPlan = {
        primaryModel: modelSelection.primary,
        fallbackModel: modelSelection.fallback,
        capability,
        estimatedCost: modelSelection.primary.estimatedCost,
        styleReferences: styleRecommendations.map(s => ({
          code: s.code,
          name: s.name,
          category: s.category
        }))
      };

      // 5. Calculate cost (use model's estimated cost)
      const costEstimate = {
        credits: modelSelection.primary.estimatedCost,
        breakdown: {
          model: modelSelection.primary.name,
          baseCost: modelSelection.primary.estimatedCost
        }
      };

      // 6. Generate proposal with Claude (including style suggestions)
      const systemPrompt = buildSystemPrompt('refinement');

      // Add style recommendations to context
      const stylesInfo = styleRecommendations.length > 0
        ? `\n\nSTYLE RECOMMENDATIONS:\n${styleRecommendations.map(s =>
            `- ${s.name} (${s.code}): ${s.patternAnalysis || s.creativeInterpretation || 'No description'}`
          ).join('\n')}`
        : '';

      const userContext = buildUserContextString({
        detectedIntent: context.detectedIntent,
        inferredSpecs: context.inferredSpecs,
        messageCount: context.messages.length,
        previousProjects: 0
      }) + stylesInfo;

      const messages: Anthropic.MessageParam[] = context.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));

      const proposalResponse = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        temperature: 0.7,
        system: `${systemPrompt}\n\n${userContext}\n\nSelected tools: ${JSON.stringify(toolPlan, null, 2)}`,
        messages
      });

      const proposal = proposalResponse.content[0].type === 'text'
        ? proposalResponse.content[0].text
        : 'Ti propongo di creare qualcosa di figo!';

      // 4. Add cost information
      const costMessage = this.formatCostMessage(costEstimate.credits);
      const fullMessage = `${proposal}\n\n${costMessage}`;

      logger.info('Direction proposed', {
        cost: costEstimate.credits,
        toolPlan
      });

      return {
        message: fullMessage,
        cost: costEstimate.credits,
        toolPlan,
        costBreakdown: costEstimate.breakdown
      };

    } catch (error) {
      logger.error('Failed to propose direction', { error });
      throw error;
    }
  }

  /**
   * Start execution and inform user
   */
  private async execute(context: ConversationContext): Promise<string> {
    logger.info('Starting execution', { sessionId: context.sessionId });

    // TODO: Coordinate with sub-agents (Writer, Director, Media Generator)
    // For now, return acknowledgment message

    const systemPrompt = `${PERSONALITY_PROMPT}\n\nCURRENT TASK: User approved the plan. Acknowledge enthusiastically and let them know you're starting work. Be brief (1-2 sentences).`;

    try {
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: 'User approved the creative direction and cost. Start execution.'
        }]
      });

      const message = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Perfetto! Comincio subito a lavorarci.';

      logger.info('Execution started', { message });
      return message;

    } catch (error) {
      logger.error('Failed to generate execution message', { error });
      return 'Perfetto! Comincio subito a lavorarci. Ti aggiorno tra poco!';
    }
  }

  /**
   * Deliver results and ask for feedback
   */
  private async deliverResults(context: ConversationContext): Promise<string> {
    logger.info('Delivering results', { sessionId: context.sessionId });

    const systemPrompt = `${PERSONALITY_PROMPT}\n\nCURRENT TASK: Deliver completed results. Be proud but not boastful. Ask if they want to iterate or create something else.`;

    try {
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: 'Results are ready. Present them to the user.'
        }]
      });

      const message = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Ecco fatto! Che ne pensi?';

      logger.info('Results delivered', { message });
      return message;

    } catch (error) {
      logger.error('Failed to generate delivery message', { error });
      return 'Ecco fatto! Dai un\'occhiata e dimmi che ne pensi.';
    }
  }

  /**
   * Check if we have enough information to move to refinement phase
   */
  private hasEnoughInfoForRefinement(context: ConversationContext): boolean {
    const { detectedIntent, inferredSpecs } = context;

    // Need at minimum: purpose, platform, and media type
    const hasBasicInfo =
      detectedIntent.purpose !== 'unknown' &&
      detectedIntent.platform !== 'unknown' &&
      detectedIntent.mediaType !== 'unknown';

    // For videos, also need aspect ratio (can be inferred from platform)
    if (detectedIntent.mediaType === 'video') {
      return hasBasicInfo && !!inferredSpecs.aspectRatio;
    }

    return hasBasicInfo;
  }

  /**
   * Format cost message based on price point
   */
  private formatCostMessage(credits: number): string {
    if (credits < 0.5) {
      return `Costa circa ${credits.toFixed(1)} crediti - quasi niente!`;
    } else if (credits < 1.5) {
      return `Questo ti costerà circa ${credits.toFixed(1)} crediti. Ti va bene?`;
    } else if (credits < 3.0) {
      return `Questo verrebbe ${credits.toFixed(1)} crediti. Se vuoi posso proporti un'alternativa più economica, oppure andiamo con questa?`;
    } else {
      return `Questo costerebbe ${credits.toFixed(1)} crediti (qualità premium). Preferisci una versione più economica o andiamo su questa?`;
    }
  }

  /**
   * Map Intent to CreativeCapability
   * Maps the conversational intent to a specific model capability
   */
  private mapIntentToCapability(intent: any): CreativeCapability {
    const { mediaType, platform, purpose } = intent;

    // Video generation
    if (mediaType === 'video') {
      if (platform === 'tiktok' || platform === 'instagram') {
        return 'SHORT_FORM_VIDEO';
      }
      if (platform === 'youtube') {
        return 'LONG_FORM_VIDEO';
      }
      if (purpose === 'marketing') {
        return 'PRODUCT_VIDEO';
      }
      if (purpose === 'tutorial') {
        return 'EXPLAINER_VIDEO';
      }
      return 'VIDEO_FROM_TEXT';
    }

    // Image generation
    if (mediaType === 'image') {
      if (purpose === 'brand') {
        return 'GENERATE_LOGO';
      }
      if (purpose === 'marketing') {
        return 'GENERATE_PRODUCT_PHOTO';
      }
      return 'GENERATE_IMAGE';
    }

    // Music/audio
    if (mediaType === 'music') {
      return 'GENERATE_MUSIC';
    }

    // Default fallback
    return 'VIDEO_FROM_TEXT';
  }

  /**
   * Detect conversation mode based on message content and context
   */
  private detectConversationMode(
    message: string,
    context: ConversationContext
  ): 'task' | 'therapy' | 'direct_answer' {
    const lowerMessage = message.toLowerCase();

    // Therapy mode triggers
    const therapyTriggers = [
      'sto male', 'sto malissimo', 'periodo difficile', 'tutto va male',
      'depresso', 'stressato', 'ansia', 'non ce la faccio',
      'ho bisogno di parlare', 'sono giù'
    ];

    if (therapyTriggers.some(trigger => lowerMessage.includes(trigger))) {
      logger.info('Therapy mode detected', { message });
      return 'therapy';
    }

    // Direct answer triggers (questions that need factual answers)
    const directQuestionPatterns = [
      /^(sai|mi sai dire|mi dici|come si fa|qual[eè]|che cos[a'è])/i,
      /ricetta/i,
      /che font/i,
      /come faccio/i,
      /suggerimenti/i
    ];

    if (directQuestionPatterns.some(pattern => pattern.test(message))) {
      logger.info('Direct answer mode detected', { message });
      return 'direct_answer';
    }

    // Default: task mode
    return 'task';
  }

  /**
   * Handle therapy mode - pure conversation, no tools
   */
  private async handleTherapyMode(
    message: string,
    context: ConversationContext,
    sessionId: string
  ): Promise<OrchestratorResponse> {
    logger.info('Handling therapy mode', { sessionId });

    // Check if user wants to switch back to task mode
    const taskSwitchSignals = [
      'ok basta', 'facciamo qualcosa', 'cambiamo discorso',
      'voglio fare', 'aiutami con', 'creiamo'
    ];

    if (taskSwitchSignals.some(signal => message.toLowerCase().includes(signal))) {
      logger.info('Switching from therapy to task mode', { sessionId });
      return await this.processMessage(message, context.userId, sessionId);
    }

    // Count therapy exchanges
    const therapyCount = context.messages.filter(m =>
      m.metadata?.mode === 'therapy'
    ).length;

    // Build conversation history
    const messages: Anthropic.MessageParam[] = context.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

    messages.push({
      role: 'user',
      content: message
    });

    try {
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        temperature: 0.8,
        system: THERAPY_MODE_PROMPT,
        messages
      });

      let therapyResponse = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Che è successo?';

      // After 3-4 exchanges, subtle creative suggestion
      if (therapyCount >= 3) {
        therapyResponse += '\n\nVuoi provare a fare qualcosa di creativo? A volte aiuta staccare.';
      }

      // Save to context with therapy mode flag
      await this.contextAnalyzer.updateContext(
        sessionId,
        {
          role: 'user',
          content: message,
          metadata: { mode: 'therapy' }
        }
      );

      await this.contextAnalyzer.updateContext(
        sessionId,
        {
          role: 'assistant',
          content: therapyResponse,
          metadata: { mode: 'therapy' }
        }
      );

      return {
        message: therapyResponse,
        sessionId,
        phase: 'discovery',
        needsUserInput: true,
        metadata: { mode: 'therapy', therapyCount }
      };

    } catch (error) {
      logger.error('Failed in therapy mode', { error });
      return {
        message: 'Che è successo? Racconta.',
        sessionId,
        phase: 'discovery',
        needsUserInput: true,
        metadata: { mode: 'therapy', error: String(error) }
      };
    }
  }

  /**
   * Handle direct answer - answer question, then optionally offer tool
   */
  private async handleDirectAnswer(
    message: string,
    context: ConversationContext,
    sessionId: string
  ): Promise<OrchestratorResponse> {
    logger.info('Handling direct answer', { sessionId });

    // Build conversation history
    const messages: Anthropic.MessageParam[] = context.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

    messages.push({
      role: 'user',
      content: message
    });

    try {
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 250,
        temperature: 0.7,
        system: DIRECT_ANSWER_PROMPT,
        messages
      });

      const answer = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Famme capì meglio cosa ti serve.';

      // Save to context
      await this.contextAnalyzer.updateContext(
        sessionId,
        {
          role: 'user',
          content: message,
          metadata: { mode: 'direct_answer' }
        }
      );

      await this.contextAnalyzer.updateContext(
        sessionId,
        {
          role: 'assistant',
          content: answer,
          metadata: { mode: 'direct_answer' }
        }
      );

      return {
        message: answer,
        sessionId,
        phase: 'discovery',
        needsUserInput: true,
        metadata: { mode: 'direct_answer' }
      };

    } catch (error) {
      logger.error('Failed in direct answer mode', { error });
      return {
        message: 'Dimmi meglio cosa ti serve.',
        sessionId,
        phase: 'discovery',
        needsUserInput: true,
        metadata: { mode: 'direct_answer', error: String(error) }
      };
    }
  }

  /**
   * Complete session (mark as completed)
   */
  async completeSession(sessionId: string): Promise<void> {
    logger.info('Completing session', { sessionId });
    await this.contextAnalyzer.completeSession(sessionId);
  }

  /**
   * Abandon session (user dropped off)
   */
  async abandonSession(sessionId: string): Promise<void> {
    logger.info('Abandoning session', { sessionId });
    await this.contextAnalyzer.abandonSession(sessionId);
  }

  /**
   * Get user conversation history
   */
  async getUserHistory(userId: string) {
    return this.contextAnalyzer.getUserHistory(userId);
  }
}
