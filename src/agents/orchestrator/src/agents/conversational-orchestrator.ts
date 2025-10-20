/**
 * Conversational Orchestrator - The Brain
 *
 * Coordinates all components to provide conversational video creation experience.
 * Manages state machine (discovery → refinement → execution → delivery).
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../../../../utils/logger';
import { ContextAnalyzer, ConversationContext, Message } from '../services/context-analyzer-mock';
import { IntentAnalyzer } from '../services/intent-analyzer';
import { UniversalModelSelector, UserIntent, CreativeCapability } from '../services/model-selector';
import { CostCalculator } from '../utils/cost-calculator';
import { StyleSelectorClient } from '../clients/style-selector-client';
import { LanguageDetector, Language } from '../services/language-detector';
import {
  buildSystemPrompt,
  buildUserContextString,
  getPersonalityPrompt,
  getCostTransparencyPrompt,
  getTherapyModePrompt,
  getDirectAnswerPrompt
} from '../config/personality-prompts-multilingual';
import { MockTechnicalPlanner } from '../mocks/technical-planner.mock';
import {
  ITechnicalPlanner,
  ProjectBrief,
  ExecutionPlan,
  ProjectStatus,
  ContentType
} from '../types/technical-planner.types';
import { ContextOptimizer } from '../services/context-optimizer';
import { ErrorHandler, CategorizedError } from '../services/error-handler';
import { fetchURLContent, containsURL, extractURLs } from '../utils/url-fetcher';

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
  executionPlan?: ExecutionPlan;
  projectStatus?: ProjectStatus;
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
  private languageDetector: LanguageDetector;
  private technicalPlanner: ITechnicalPlanner;
  private contextOptimizer: ContextOptimizer;
  private errorHandler: ErrorHandler;
  private claude: Anthropic;

  constructor(config?: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    styleSelectorUrl?: string;
    enableCaching?: boolean;
    enableCompression?: boolean;
  }) {
    const apiKey = config?.anthropicApiKey || process.env.ANTHROPIC_API_KEY!;

    this.contextAnalyzer = new ContextAnalyzer();
    this.intentAnalyzer = new IntentAnalyzer(apiKey);
    this.modelSelector = new UniversalModelSelector();
    this.costCalculator = new CostCalculator();
    this.styleSelector = new StyleSelectorClient(config?.styleSelectorUrl);
    this.languageDetector = new LanguageDetector();
    this.technicalPlanner = new MockTechnicalPlanner();
    this.contextOptimizer = new ContextOptimizer(apiKey, {
      enableCaching: config?.enableCaching ?? true,
      enableCompression: config?.enableCompression ?? true
    });
    this.errorHandler = new ErrorHandler();

    this.claude = new Anthropic({ apiKey });

    logger.info('ConversationalOrchestrator initialized', {
      multilingualSupport: true,
      technicalPlanner: true,
      contextOptimization: true,
      errorHandling: true,
      caching: config?.enableCaching ?? true,
      compression: config?.enableCompression ?? true
    });
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

    // Declare context outside try block so it's accessible in catch
    let context: ConversationContext | undefined;
    let isNewSession = false;

    try {
      // 1. Load or create conversation context

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

      // 2. Detect language from current message and conversation history
      const previousLanguage = context.metadata?.language as Language | undefined;
      const userMessages = context.messages
        .filter(m => m.role === 'user')
        .map(m => m.content);

      const languageDetection = userMessages.length > 0
        ? this.languageDetector.detectFromHistory(userMessages, message)
        : this.languageDetector.detect(message, previousLanguage);

      const detectedLanguage = languageDetection.language;

      // Log language change if detected
      if (previousLanguage && this.languageDetector.hasLanguageChanged(previousLanguage, detectedLanguage, languageDetection.confidence)) {
        logger.info('Language changed', {
          from: previousLanguage,
          to: detectedLanguage,
          confidence: languageDetection.confidence
        });
      }

      // Update context metadata with detected language
      context.metadata = {
        ...context.metadata,
        language: detectedLanguage,
        languageConfidence: languageDetection.confidence
      };

      // 2.5. Check for URLs in message and fetch content
      let enrichedMessage = message;
      if (containsURL(message)) {
        const urls = extractURLs(message);
        logger.info('URLs detected in message', { count: urls.length, urls });

        // Fetch content from all URLs
        const urlContents = await Promise.all(
          urls.map(async (url) => {
            const result = await fetchURLContent(url);
            if (result.success) {
              logger.info('URL content fetched', {
                url: result.url,
                title: result.title,
                contentLength: result.content?.length || 0
              });
              return {
                url: result.url,
                title: result.title,
                content: result.content,
                excerpt: result.excerpt
              };
            } else {
              logger.warn('URL fetch failed', { url, error: result.error });
              return null;
            }
          })
        );

        // Append fetched content to message
        const successfulFetches = urlContents.filter(c => c !== null);
        if (successfulFetches.length > 0) {
          const urlContentText = successfulFetches
            .map(c => `\n\n--- Content from ${c!.url} ---\nTitle: ${c!.title || 'N/A'}\n\n${c!.content}`)
            .join('\n\n');

          enrichedMessage = message + '\n\n[SYSTEM: User provided URL(s). Content fetched below:]' + urlContentText;

          logger.info('Message enriched with URL content', {
            originalLength: message.length,
            enrichedLength: enrichedMessage.length,
            urlsFetched: successfulFetches.length
          });
        }
      }

      // 3. Detect conversation mode (therapy, direct answer, or task)
      const conversationMode = this.detectConversationMode(enrichedMessage, context, detectedLanguage);

      // 3. Handle special modes early (before intent analysis)
      if (conversationMode === 'therapy') {
        return await this.handleTherapyMode(enrichedMessage, context, sessionId);
      }

      if (conversationMode === 'direct_answer') {
        return await this.handleDirectAnswer(enrichedMessage, context, sessionId);
      }

      // 4. Analyze user message for intent (task mode)
      const analysisResult = await this.intentAnalyzer.analyze(enrichedMessage, context);

      // 5. Update context with new message and intent
      context = await this.contextAnalyzer.updateContext(
        sessionId,
        {
          role: 'user',
          content: enrichedMessage, // Use enriched message with URL content
          metadata: {
            originalIntent: analysisResult,
            originalMessage: message, // Keep original for display
            hasURLContent: enrichedMessage !== message
          }
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

      // Categorize and handle error
      const categorizedError = this.errorHandler.categorizeError(error);
      const language = context?.metadata?.language as Language || 'it';

      // Get user-friendly error message
      const userMessage = this.errorHandler.getUserMessage(categorizedError, language);
      const recoverySuggestion = this.errorHandler.getRecoverySuggestion(categorizedError, language);

      return {
        message: `${userMessage} ${recoverySuggestion}`,
        sessionId: sessionId || 'error',
        phase: context?.phase || 'discovery',
        needsUserInput: true,
        metadata: {
          error: categorizedError.message,
          errorCategory: categorizedError.category,
          recoveryStrategy: categorizedError.recoveryStrategy,
          retryable: categorizedError.retryable
        }
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

    const asksForStyles = lastUserMessage && (
      /(mostra|suggerisci|proponi|vedi|vedere|quali|fammi vedere|far vedere|mostrami).*(stile|stili|style)/i.test(lastUserMessage.content) ||
      /(stile|stili|style).*(visual|fotografic|immagine|video)/i.test(lastUserMessage.content) ||
      /fammi vedere.*stile/i.test(lastUserMessage.content)
    );

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

      // Always show modal when user asks for styles, even if we have 0 results
      // The modal UI will handle the empty state
      return {
        message: styles.length > 0
          ? 'Ti mostro alcuni stili visivi che potrebbero funzionare per il tuo progetto. Seleziona quello che preferisci dalla galleria!'
          : 'Sto aprendo la galleria degli stili per te. Dai un\'occhiata e seleziona quello che preferisci!',
        sessionId,
        phase: 'discovery',
        needsUserInput: true,
        metadata: {
          showStyleModal: true, // 🔑 Frontend flag to trigger modal - always set when user asks for styles
          suggestedStyles: Array.isArray(styles) ? styles.map(s => ({ id: s.id, name: s.name, category: s.category, code: s.code })) : [],
          detectedIntent: context.detectedIntent
        }
      };
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

    if (hasApproval && context.metadata.projectBrief) {
      // User approved - move to execution
      context.phase = 'execution';
      return this.handleExecution(context, sessionId);
    }

    // Generate ProjectBrief for Technical Planner
    const brief = await this.generateProjectBrief(context);

    // Propose direction + cost
    const proposal = await this.proposeDirection(context, brief);

    // Store brief in context metadata for execution phase
    context.metadata = {
      ...context.metadata,
      projectBrief: brief
    };

    return {
      message: proposal.message,
      sessionId,
      phase: 'refinement',
      needsUserInput: true,
      proposedCost: proposal.cost,
      toolPlan: proposal.toolPlan,
      metadata: {
        toolPlan: proposal.toolPlan,
        costBreakdown: proposal.costBreakdown,
        projectBrief: brief
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

    // Get ProjectBrief from context
    const brief = context.metadata.projectBrief as ProjectBrief;

    if (!brief) {
      logger.error('No ProjectBrief found in context metadata', { sessionId });
      throw new Error('ProjectBrief missing - cannot start execution');
    }

    // Check if execution plan already exists (checking status)
    if (context.metadata.executionPlanId) {
      const planId = context.metadata.executionPlanId as string;
      logger.info('Checking execution status', { planId });

      const status = await this.technicalPlanner.getProjectStatus(planId);

      // If completed, move to delivery
      if (status.status === 'completed') {
        context.phase = 'delivery';
        return this.handleDelivery(context, sessionId);
      }

      // If failed, provide error information
      if (status.status === 'failed') {
        const language = (context.metadata?.language as Language) || 'it';
        const errorMessage = this.formatExecutionError(status, language);

        return {
          message: errorMessage,
          sessionId,
          phase: 'execution',
          needsUserInput: true,
          executionStatus: 'failed',
          projectStatus: status,
          metadata: {
            executionPlanId: planId,
            projectStatus: status
          }
        };
      }

      // Still in progress - return status update
      const language = (context.metadata?.language as Language) || 'it';
      const statusMessage = this.formatExecutionStatus(status, language);

      return {
        message: statusMessage,
        sessionId,
        phase: 'execution',
        needsUserInput: false,
        executionStatus: 'in_progress',
        projectStatus: status,
        metadata: {
          executionPlanId: planId,
          projectStatus: status
        }
      };
    }

    // Create execution plan via Technical Planner
    logger.info('Creating execution plan', { briefId: brief.id });
    const executionPlan = await this.technicalPlanner.createExecutionPlan(brief);

    // Store execution plan ID in context
    context.metadata = {
      ...context.metadata,
      executionPlanId: executionPlan.id
    };

    // Generate execution confirmation message
    const language = (context.metadata?.language as Language) || 'it';
    const executionMessage = await this.execute(context, executionPlan, language);

    return {
      message: executionMessage,
      sessionId,
      phase: 'execution',
      needsUserInput: false,
      executionStatus: 'in_progress',
      executionPlan,
      metadata: {
        executionPlanId: executionPlan.id,
        executionPlan
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

    // Get project status with results
    const planId = context.metadata.executionPlanId as string;

    if (!planId) {
      logger.error('No executionPlanId found in context', { sessionId });
      throw new Error('ExecutionPlanId missing - cannot deliver results');
    }

    const status = await this.technicalPlanner.getProjectStatus(planId);

    // Generate delivery message with results
    const language = (context.metadata?.language as Language) || 'it';
    const deliveryMessage = await this.deliverResults(context, status, language);

    return {
      message: deliveryMessage,
      sessionId,
      phase: 'delivery',
      needsUserInput: true,
      executionStatus: 'completed',
      projectStatus: status,
      metadata: {
        executionPlanId: planId,
        projectStatus: status,
        resultUrls: status.result?.files || []
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

    const language = (context.metadata?.language as Language) || 'it';

    // Optimize context with token budget tracking
    const optimizedMessages = await this.contextOptimizer.optimizeMessages(
      context,
      language,
      context.sessionId
    );
    const optimizedRequest = this.contextOptimizer.buildOptimizedRequest(
      context,
      'discovery',
      language,
      optimizedMessages
    );

    logger.debug('Context optimization stats', {
      ...optimizedRequest.metadata,
      tokenUsage: optimizedMessages.tokenUsage?.percentUsed.toFixed(1) + '%'
    });

    // Log budget warning if present
    if (optimizedMessages.budgetWarning) {
      logger.warn('Token budget warning', {
        sessionId: context.sessionId,
        warning: optimizedMessages.budgetWarning
      });
    }

    try {
      // Execute with retry and circuit breaker protection
      const response = await this.errorHandler.executeWithProtection(
        'claude-api',
        async () => {
          return await this.claude.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            temperature: 0.7,
            system: optimizedRequest.system,
            messages: optimizedMessages.messages
          });
        }
      );

      const question = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Raccontami un po\' - che tipo di progetto hai in mente?';

      logger.info('Smart question generated', { question });
      return question;

    } catch (error) {
      logger.error('Failed to generate smart question after retries', { error });

      // Fallback questions based on language
      const fallbackQuestions: Record<Language, string> = {
        it: 'Raccontami un po\' - che tipo di progetto hai in mente?',
        en: 'Tell me a bit - what kind of project do you have in mind?',
        es: 'Cuéntame un poco - ¿qué tipo de proyecto tienes en mente?',
        fr: 'Dites-moi un peu - quel type de projet avez-vous en tête?',
        de: 'Erzähl mir ein bisschen - was für ein Projekt hast du im Kopf?'
      };

      return fallbackQuestions[language];
    }
  }

  /**
   * Propose creative direction with cost during refinement
   */
  private async proposeDirection(context: ConversationContext, brief: ProjectBrief): Promise<{
    message: string;
    cost: number;
    toolPlan: any;
    costBreakdown: any;
  }> {
    logger.info('Proposing creative direction', { sessionId: context.sessionId, briefId: brief.id });

    try {
      const language = (context.metadata?.language as Language) || 'it';

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

      // 6. Generate proposal with Claude (including style suggestions and context optimization)

      // Optimize context with token budget tracking
      const optimizedMessages = await this.contextOptimizer.optimizeMessages(
        context,
        language,
        context.sessionId
      );
      const optimizedRequest = this.contextOptimizer.buildOptimizedRequest(
        context,
        'refinement',
        language,
        optimizedMessages
      );

      logger.debug('Context optimization stats for proposal', {
        ...optimizedRequest.metadata,
        tokenUsage: optimizedMessages.tokenUsage?.percentUsed.toFixed(1) + '%'
      });

      // Log budget warning if present
      if (optimizedMessages.budgetWarning) {
        logger.warn('Token budget warning', {
          sessionId: context.sessionId,
          warning: optimizedMessages.budgetWarning
        });
      }

      // Add style recommendations and tool plan to the last system message
      const stylesInfo = styleRecommendations.length > 0
        ? `\n\nSTYLE RECOMMENDATIONS:\n${styleRecommendations.map(s =>
            `- ${s.name} (${s.code}): ${s.patternAnalysis || s.creativeInterpretation || 'No description'}`
          ).join('\n')}`
        : '';

      const toolPlanInfo = `\n\nSELECTED TOOLS: ${JSON.stringify(toolPlan, null, 2)}`;

      // Append to system prompt (works for both cached and non-cached)
      const finalSystem = Array.isArray(optimizedRequest.system)
        ? [
            ...optimizedRequest.system.slice(0, -1),
            {
              ...(optimizedRequest.system[optimizedRequest.system.length - 1] as any),
              text: (optimizedRequest.system[optimizedRequest.system.length - 1] as any).text + stylesInfo + toolPlanInfo
            }
          ]
        : optimizedRequest.system + stylesInfo + toolPlanInfo;

      const proposalResponse = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        temperature: 0.7,
        system: finalSystem as any,
        messages: optimizedMessages.messages
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
  private async execute(
    context: ConversationContext,
    executionPlan: ExecutionPlan,
    language: Language
  ): Promise<string> {
    logger.info('Starting execution', {
      sessionId: context.sessionId,
      planId: executionPlan.id,
      steps: executionPlan.steps.length
    });

    // Build execution message based on language
    const executionMessages: Record<Language, string[]> = {
      'it': [
        'Perfetto! Comincio subito a lavorarci.',
        'Ci sto! Ti aggiorno tra poco.',
        'Ok, parto! Ti faccio sapere quando ho finito.',
        'Vai tranquillo, me ne occupo io adesso.'
      ],
      'en': [
        'Perfect! Starting work right now.',
        'Got it! I\'ll update you soon.',
        'Alright, getting started! I\'ll let you know when it\'s done.',
        'On it! Working on this now.'
      ],
      'es': [
        '¡Perfecto! Empiezo ahora mismo.',
        '¡Entendido! Te actualizo pronto.',
        '¡Vale, empiezo! Te aviso cuando termine.',
        'Tranquilo, me encargo ahora.'
      ],
      'fr': [
        'Parfait ! Je commence tout de suite.',
        'Compris ! Je vous tiens au courant bientôt.',
        'D\'accord, je commence ! Je vous préviens quand c\'est terminé.',
        'Je m\'en occupe maintenant.'
      ],
      'de': [
        'Perfekt! Ich fange jetzt an.',
        'Verstanden! Ich melde mich bald.',
        'Okay, ich lege los! Ich sage Bescheid, wenn es fertig ist.',
        'Ich kümmere mich jetzt darum.'
      ]
    };

    // Randomly pick a message
    const messages = executionMessages[language];
    const baseMessage = messages[Math.floor(Math.random() * messages.length)];

    // Add execution details
    const detailsMessages: Record<Language, string> = {
      'it': `\n\nUso ${executionPlan.primaryModel.name} - dovrei metterci circa ${Math.round(executionPlan.estimatedTime / 60)} minuti.`,
      'en': `\n\nUsing ${executionPlan.primaryModel.name} - should take about ${Math.round(executionPlan.estimatedTime / 60)} minutes.`,
      'es': `\n\nUsando ${executionPlan.primaryModel.name} - debería tardar unos ${Math.round(executionPlan.estimatedTime / 60)} minutos.`,
      'fr': `\n\nUtilisation de ${executionPlan.primaryModel.name} - ça devrait prendre environ ${Math.round(executionPlan.estimatedTime / 60)} minutes.`,
      'de': `\n\nVerwende ${executionPlan.primaryModel.name} - sollte etwa ${Math.round(executionPlan.estimatedTime / 60)} Minuten dauern.`
    };

    const fullMessage = baseMessage + detailsMessages[language];

    logger.info('Execution started', { message: fullMessage });
    return fullMessage;
  }

  /**
   * Deliver results and ask for feedback
   */
  private async deliverResults(
    context: ConversationContext,
    status: ProjectStatus,
    language: Language
  ): Promise<string> {
    logger.info('Delivering results', {
      sessionId: context.sessionId,
      planId: status.planId,
      filesCount: status.result?.files?.length || 0
    });

    // Build delivery message based on language
    const deliveryMessages: Record<Language, string[]> = {
      'it': [
        'Ecco fatto! Dai un\'occhiata.',
        'Fatto! Che ne pensi?',
        'Finito! Dimmi se ti piace.',
        'Pronto! Vedi un po\'.'
      ],
      'en': [
        'Done! Take a look.',
        'All set! What do you think?',
        'Finished! Let me know if you like it.',
        'Ready! Check it out.'
      ],
      'es': [
        '¡Listo! Échale un vistazo.',
        '¡Hecho! ¿Qué te parece?',
        '¡Terminado! Dime si te gusta.',
        '¡Preparado! Míralo.'
      ],
      'fr': [
        'Voilà ! Jetez un œil.',
        'C\'est fait ! Qu\'en pensez-vous ?',
        'Terminé ! Dites-moi si ça vous plaît.',
        'Prêt ! Regardez.'
      ],
      'de': [
        'Fertig! Schau es dir an.',
        'Erledigt! Was denkst du?',
        'Fertig! Sag mir, ob es dir gefällt.',
        'Bereit! Sieh es dir an.'
      ]
    };

    // Randomly pick a message
    const messages = deliveryMessages[language];
    const baseMessage = messages[Math.floor(Math.random() * messages.length)];

    // Add follow-up question based on language
    const followUpMessages: Record<Language, string> = {
      'it': '\n\nVuoi che modifichi qualcosa o facciamo altro?',
      'en': '\n\nWant me to change anything or create something else?',
      'es': '\n\n¿Quieres que modifique algo o creamos otra cosa?',
      'fr': '\n\nVoulez-vous que je modifie quelque chose ou que nous créions autre chose ?',
      'de': '\n\nMöchtest du, dass ich etwas ändere oder etwas anderes erstelle?'
    };

    const fullMessage = baseMessage + followUpMessages[language];

    logger.info('Results delivered', { message: fullMessage });
    return fullMessage;
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
    context: ConversationContext,
    language: Language
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

  // ========================================
  // TECHNICAL PLANNER INTEGRATION HELPERS
  // ========================================

  /**
   * Generate ProjectBrief from conversation context
   */
  private async generateProjectBrief(context: ConversationContext): Promise<ProjectBrief> {
    const language = (context.metadata?.language as Language) || 'it';
    const capability = this.mapIntentToCapability(context.detectedIntent);
    const contentType = this.determineContentType(context.detectedIntent);

    const brief: ProjectBrief = {
      id: this.generateId(),
      sessionId: context.sessionId,
      userId: context.userId,
      capability,
      type: contentType,
      requirements: {
        description: this.extractDescription(context),
        style: context.detectedIntent.style !== 'unknown' ? context.detectedIntent.style : undefined,
        mood: context.detectedIntent.style !== 'unknown' ? context.detectedIntent.style : undefined,
        duration: context.inferredSpecs.duration,
        aspectRatio: context.inferredSpecs.aspectRatio,
        resolution: context.inferredSpecs.resolution,
        quality: context.inferredSpecs.qualityLevel,
        budget: context.detectedIntent.budgetSensitivity === 'high' ? 'low' : 'medium',
        deadline: undefined // Could be extracted from conversation
      },
      context: {
        description: this.extractDescription(context),
        mood: context.detectedIntent.style !== 'unknown' ? context.detectedIntent.style : undefined,
        targetAudience: undefined, // Could be extracted
        brandGuidelines: undefined // Could be extracted
      },
      rawConversation: context.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date()
      })),
      createdAt: new Date(),
      language
    };

    logger.info('ProjectBrief generated', {
      briefId: brief.id,
      capability: brief.capability,
      type: brief.type,
      language: brief.language
    });

    return brief;
  }

  /**
   * Determine content type from intent
   */
  private determineContentType(intent: any): ContentType {
    switch (intent.mediaType) {
      case 'video':
        return 'video';
      case 'image':
        return 'image';
      case 'music':
      case 'audio':
        return 'audio';
      case 'text':
        return 'text';
      default:
        return 'multimedia';
    }
  }

  /**
   * Extract description from conversation context
   */
  private extractDescription(context: ConversationContext): string {
    // Get user messages
    const userMessages = context.messages
      .filter(m => m.role === 'user')
      .map(m => m.content);

    // Combine all user messages into a description
    return userMessages.join(' ').substring(0, 500); // Limit to 500 chars
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Format execution status message
   */
  private formatExecutionStatus(status: ProjectStatus, language: Language): string {
    const progress = status.progress || 0;

    const statusMessages: Record<Language, Record<string, string>> = {
      'it': {
        'in_progress': `Sto lavorando... ${progress}% completato.`,
        'pending': 'Sto per iniziare...'
      },
      'en': {
        'in_progress': `Working on it... ${progress}% complete.`,
        'pending': 'About to start...'
      },
      'es': {
        'in_progress': `Trabajando... ${progress}% completado.`,
        'pending': 'A punto de empezar...'
      },
      'fr': {
        'in_progress': `En cours... ${progress}% terminé.`,
        'pending': 'Sur le point de commencer...'
      },
      'de': {
        'in_progress': `Arbeite daran... ${progress}% abgeschlossen.`,
        'pending': 'Gleich geht\'s los...'
      }
    };

    return statusMessages[language][status.status] || statusMessages[language]['in_progress'];
  }

  /**
   * Format execution error message
   */
  private formatExecutionError(status: ProjectStatus, language: Language): string {
    const errorMessages: Record<Language, string> = {
      'it': 'Accidenti, c\'è stato un problema. Vuoi che riprovo?',
      'en': 'Oops, something went wrong. Want me to try again?',
      'es': 'Ups, hubo un problema. ¿Quieres que lo intente de nuevo?',
      'fr': 'Oups, il y a eu un problème. Voulez-vous que je réessaie ?',
      'de': 'Hoppla, etwas ist schief gelaufen. Soll ich es nochmal versuchen?'
    };

    return errorMessages[language];
  }
}

// Legacy constants for backward compatibility
const PERSONALITY_PROMPT = getPersonalityPrompt('it');
const THERAPY_MODE_PROMPT = getTherapyModePrompt('it');
const DIRECT_ANSWER_PROMPT = getDirectAnswerPrompt('it');

