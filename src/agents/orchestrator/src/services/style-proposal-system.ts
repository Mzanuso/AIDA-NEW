/**
 * Style Proposal System
 *
 * Intelligently proposes visual style gallery to users based on:
 * - Capability type (94 capabilities)
 * - Context (user message, conversation history)
 * - Rules engine (always/never/conditional)
 *
 * Integrates with Style Selector service for fetching style galleries.
 */

import { createLogger } from '../../../../utils/logger';
import { StyleSelectorClient } from '../clients/style-selector-client';
import { Language } from './language-detector';
import { CreativeCapability } from './model-selector';

const logger = createLogger('StyleProposalSystem');

/**
 * Style Proposal Result
 */
export interface StyleProposal {
  shouldPropose: boolean;
  category?: string;
  styles?: any[];
  message?: string;
  uiComponent?: 'image_gallery' | 'list' | 'cards';
  metadata?: Record<string, any>;
}

/**
 * Proposal Context
 */
export interface ProposalContext {
  capability: CreativeCapability;
  userMessage: string;
  hasExistingStyle: boolean;
  conversationPhase: 'discovery' | 'refinement' | 'execution' | 'delivery';
  language: Language;
}

/**
 * Style Proposal Rules
 */
interface StyleProposalRules {
  always: CreativeCapability[];
  never: CreativeCapability[];
  conditional: Map<CreativeCapability, (context: ProposalContext) => boolean>;
}

/**
 * Style Proposal System
 *
 * Determines when and how to propose visual styles to users
 */
export class StyleProposalSystem {
  private rules: StyleProposalRules;
  private styleSelectorClient: StyleSelectorClient;

  constructor(styleSelectorClient: StyleSelectorClient) {
    this.styleSelectorClient = styleSelectorClient;
    this.rules = this.buildRules();
    logger.info('StyleProposalSystem initialized');
  }

  /**
   * Build proposal rules for all 94 capabilities
   */
  private buildRules(): StyleProposalRules {
    return {
      // ==========================================
      // ALWAYS PROPOSE (Visual generation capabilities)
      // ==========================================
      always: [
        // Image Generation
        'GENERATE_IMAGE',
        'GENERATE_ILLUSTRATION',
        'GENERATE_LOGO',
        'GENERATE_ICON_SET',
        'GENERATE_PORTRAIT',
        'GENERATE_PRODUCT_PHOTO',
        'GENERATE_SCENE',
        'GENERATE_PATTERN',
        'GENERATE_MOCKUP',
        'GENERATE_BRAND_KIT',
        'GENERATE_STORYBOARD',
        'GENERATE_THUMBNAIL',
        'GENERATE_INFOGRAPHIC',
        'GENERATE_MEME',
        'GENERATE_POSTER',
        'GENERATE_BOOK_COVER',
        'GENERATE_TEXTURE',

        // Video Generation (from scratch)
        'VIDEO_FROM_TEXT',
        'SHORT_FORM_VIDEO',
        'LONG_FORM_VIDEO',
        'MUSIC_VIDEO',
        'EXPLAINER_VIDEO',
        'PRODUCT_VIDEO',
        'TESTIMONIAL_VIDEO',
        'ANIMATED_LOGO',
        'INTRO_OUTRO',

        // Design & Branding
        'POSTER_DESIGN',
        'FLYER_DESIGN',
        'BANNER_DESIGN',
        'BUSINESS_CARD',
        'SOCIAL_POST',
        'BOOK_COVER',
        'ALBUM_COVER',
        'MENU_DESIGN',
        'INVITATION',

        // Multimedia Projects
        'ILLUSTRATED_BOOK',
        'COMIC_BOOK',
        'PHOTO_BOOK',
        'PORTFOLIO',
        'CATALOG',
        'MAGAZINE'
      ],

      // ==========================================
      // NEVER PROPOSE (Text-only or editing capabilities)
      // ==========================================
      never: [
        // Text & Writing
        'WRITE_STORY',
        'WRITE_SCRIPT',
        'WRITE_BLOG_POST',
        'WRITE_SOCIAL_COPY',
        'WRITE_POETRY',
        'WRITE_SONG_LYRICS',
        'WRITE_BOOK',
        'WRITE_EMAIL',
        'WRITE_SPEECH',
        'EDIT_TEXT',
        'TRANSLATE',
        'LOCALIZE',
        'SUMMARIZE_TEXT',

        // Audio (no visual component)
        'GENERATE_MUSIC',
        'GENERATE_SOUND_FX',
        'TEXT_TO_SPEECH',
        'VOICE_CLONE',
        'EXTEND_MUSIC',
        'REMIX_MUSIC',
        'PODCAST_EDIT',
        'AUDIO_ENHANCEMENT',
        'AUDIO_TRANSCRIPTION',
        'MEETING_SUMMARY',
        'TEXT_TO_PODCAST',

        // Image Editing (has input image, not generating new style)
        'REMOVE_BACKGROUND',
        'REMOVE_OBJECT',
        'UPSCALE_IMAGE',
        'RESTORE_PHOTO',
        'COLORIZE_BW',
        'RELIGHT_IMAGE',
        'HEADSHOT_GENERATOR',

        // Video Editing (transforming existing video)
        'AUTO_EDIT_VIDEO',
        'CLIP_EXTRACTION',
        'VIDEO_REPURPOSE',
        'AUTO_CAPTION',
        'AUTO_B_ROLL',
        'MULTI_CAMERA_EDIT',
        'COLOR_GRADING',
        'NOISE_REDUCTION',
        'STABILIZATION',
        'SLOW_MOTION',
        'TIME_REMAPPING',
        'TRANSITION_GENERATION',

        // Repurposing (input-driven)
        'BLOG_TO_VIDEO',
        'LONG_TO_SHORT',
        'VIDEO_TO_BLOG',
        'PODCAST_TO_SOCIAL',
        'PRESENTATION_TO_VIDEO',
        'EBOOK_TO_COURSE',

        // 3D (specialized, not style-based)
        'TEXT_TO_3D',
        'IMAGE_TO_3D',
        '3D_RIGGING',
        '3D_ANIMATION',
        '3D_SCENE',
        '3D_CHARACTER',
        'VIRTUAL_TRY_ON',
        '3D_PRODUCT_RENDER'
      ],

      // ==========================================
      // CONDITIONAL (Propose based on context)
      // ==========================================
      conditional: new Map<CreativeCapability, (context: ProposalContext) => boolean>([
        // Image to Video - only if no style specified
        ['IMAGE_TO_VIDEO' as CreativeCapability, (ctx: ProposalContext) => !ctx.hasExistingStyle],

        // Video to Video - only if changing style
        ['VIDEO_TO_VIDEO' as CreativeCapability, (ctx: ProposalContext) =>
          ctx.userMessage.toLowerCase().includes('stile') ||
          ctx.userMessage.toLowerCase().includes('style') ||
          ctx.userMessage.toLowerCase().includes('look')
        ],

        // Style Transfer - always propose target style
        ['STYLE_TRANSFER' as CreativeCapability, () => true],

        // Image Editing with new objects - propose style for new objects
        ['ADD_OBJECT' as CreativeCapability, (ctx: ProposalContext) =>
          ctx.userMessage.toLowerCase().includes('add') ||
          ctx.userMessage.toLowerCase().includes('aggiungi')
        ],

        // Change Background - propose background styles
        ['CHANGE_BACKGROUND' as CreativeCapability, (ctx: ProposalContext) =>
          !ctx.userMessage.toLowerCase().includes('remove') &&
          !ctx.userMessage.toLowerCase().includes('rimuovi')
        ],

        // Face Swap - only if creating new character
        ['FACE_SWAP' as CreativeCapability, (ctx: ProposalContext) =>
          ctx.userMessage.toLowerCase().includes('character') ||
          ctx.userMessage.toLowerCase().includes('personaggio')
        ],

        // Change Outfit - propose outfit styles
        ['CHANGE_OUTFIT' as CreativeCapability, () => true],

        // Presentation Deck - propose design styles
        ['PRESENTATION_DECK' as CreativeCapability, (ctx: ProposalContext) => !ctx.hasExistingStyle],

        // Lip Sync Video - only if creating character
        ['LIPSYNC_VIDEO' as CreativeCapability, (ctx: ProposalContext) =>
          ctx.userMessage.toLowerCase().includes('character') ||
          ctx.userMessage.toLowerCase().includes('avatar')
        ],

        // Animate Character - propose character styles
        ['ANIMATE_CHARACTER' as CreativeCapability, (ctx: ProposalContext) => !ctx.hasExistingStyle]
      ])
    };
  }

  /**
   * Determine if style proposal should be made
   */
  async shouldPropose(context: ProposalContext): Promise<StyleProposal> {
    const { capability, userMessage, hasExistingStyle, conversationPhase, language } = context;

    logger.debug('Evaluating style proposal', {
      capability,
      hasExistingStyle,
      phase: conversationPhase
    });

    // Don't propose during execution or delivery
    if (conversationPhase === 'execution' || conversationPhase === 'delivery') {
      return { shouldPropose: false };
    }

    // Check if user explicitly asks for style suggestions
    if (this.userAsksForStyles(userMessage)) {
      return await this.generateProposal(capability, userMessage, language, 'explicit_request');
    }

    // Check explicit rules
    if (this.rules.always.includes(capability)) {
      // Don't propose if style already selected
      if (hasExistingStyle) {
        logger.debug('Style already selected, skipping proposal');
        return { shouldPropose: false };
      }
      return await this.generateProposal(capability, userMessage, language, 'always_rule');
    }

    if (this.rules.never.includes(capability)) {
      return { shouldPropose: false };
    }

    // Check conditional rules
    const conditionalRule = this.rules.conditional.get(capability);
    if (conditionalRule && conditionalRule(context)) {
      return await this.generateProposal(capability, userMessage, language, 'conditional_rule');
    }

    // Default: don't propose
    return { shouldPropose: false };
  }

  /**
   * Generate style proposal with gallery and message
   */
  private async generateProposal(
    capability: CreativeCapability,
    userMessage: string,
    language: Language,
    reason: string
  ): Promise<StyleProposal> {
    logger.info('Generating style proposal', { capability, reason });

    try {
      // Try to extract style category from message
      const category = await this.extractStyleCategory(userMessage, capability);

      // Fetch appropriate gallery from Style Selector
      const galleryLimit = category ? 9 : 12; // More options if general, fewer if filtered
      const gallery = await this.styleSelectorClient.getGallery({
        category: category || undefined,
        limit: galleryLimit
      });

      // Generate proposal message
      const proposalMessage = this.getProposalMessage(capability, category, language);

      return {
        shouldPropose: true,
        category: category || undefined,
        styles: gallery.styles,
        message: proposalMessage,
        uiComponent: gallery.styles.length > 6 ? 'image_gallery' : 'cards',
        metadata: {
          reason,
          capability,
          stylesCount: gallery.styles.length
        }
      };

    } catch (error) {
      logger.error('Failed to generate style proposal', { error, capability });

      // Fallback: simple text proposal
      return {
        shouldPropose: true,
        message: this.getFallbackProposalMessage(language),
        uiComponent: 'list',
        metadata: {
          reason: 'fallback_error',
          error: String(error)
        }
      };
    }
  }

  /**
   * Extract style category from user message and capability
   */
  private async extractStyleCategory(
    message: string,
    capability: CreativeCapability
  ): Promise<string | null> {
    const lowerMessage = message.toLowerCase();

    // Category keywords by capability
    const categoryMappings: Partial<Record<CreativeCapability, Record<string, RegExp>>> = {
      'GENERATE_IMAGE': {
        'realistic': /\b(realistic|photo|photographic|realist|fotorealistic)\b/i,
        'illustration': /\b(illustration|illustrated|drawing|drawn|disegno)\b/i,
        'artistic': /\b(artistic|art|artistic|painterly|dipinto)\b/i,
        'cartoon': /\b(cartoon|comic|fumetto|anime)\b/i,
        'abstract': /\b(abstract|astratto|modern)\b/i
      },
      'VIDEO_FROM_TEXT': {
        'cinematic': /\b(cinematic|cinematic|film|movie|epic)\b/i,
        'ugc': /\b(ugc|user|authentic|casual|real)\b/i,
        'commercial': /\b(commercial|ad|advertising|promo)\b/i,
        'documentary': /\b(documentary|documentario|real)\b/i
      },
      'GENERATE_LOGO': {
        'minimal': /\b(minimal|minimalist|simple|clean|pulito)\b/i,
        'modern': /\b(modern|contemporary|moderno)\b/i,
        'vintage': /\b(vintage|retro|classic|classico)\b/i,
        'bold': /\b(bold|strong|powerful|forte)\b/i
      }
    };

    const mappings = categoryMappings[capability];
    if (!mappings) return null;

    // Find matching category
    for (const [category, pattern] of Object.entries(mappings)) {
      if (pattern.test(lowerMessage)) {
        logger.debug('Extracted style category', { category, capability });
        return category;
      }
    }

    return null;
  }

  /**
   * Check if user explicitly asks for style suggestions
   */
  private userAsksForStyles(message: string): boolean {
    const patterns = [
      // Italian
      /\b(mostra|suggerisci|proponi|vedi|quali).*(stile|stili)\b/i,
      /\b(che|quale).*(stile|stili)\b/i,
      /\b(stile|stili).*(disponibili|ci sono|hai)\b/i,

      // English
      /\b(show|suggest|propose|see|what).*(style|styles)\b/i,
      /\b(which|what).*(style|styles)\b/i,
      /\b(style|styles).*(available|do you have)\b/i,

      // Spanish
      /\b(muestra|sugiere|propone|ve|cuáles).*(estilo|estilos)\b/i,
      /\b(qué|cuál).*(estilo|estilos)\b/i,

      // French
      /\b(montre|suggère|propose|vois|quels).*(style|styles)\b/i,
      /\b(quel|quels).*(style|styles)\b/i,

      // German
      /\b(zeige|schlage vor|vorschlagen|siehe|welche).*(stil|stile)\b/i,
      /\b(welcher|welche).*(stil|stile)\b/i
    ];

    return patterns.some(pattern => pattern.test(message));
  }

  /**
   * Get proposal message for specific capability and language
   */
  private getProposalMessage(
    capability: CreativeCapability,
    category: string | null,
    language: Language
  ): string {
    const messages: Record<Language, Record<string, string>> = {
      it: {
        GENERATE_LOGO: 'Che stile vuoi per il logo? Ti mostro alcuni esempi.',
        GENERATE_IMAGE: category
          ? `Ho diversi stili ${category}! Quale ti piace?`
          : 'Che stile preferisci? Eccone alcuni.',
        VIDEO_FROM_TEXT: 'Che look vuoi per il video? Dai un\'occhiata a questi stili.',
        BOOK_COVER: 'Stile copertina! Quale si addice al tuo libro?',
        ILLUSTRATED_BOOK: 'Che stile per le illustrazioni? Guarda questi esempi.',
        MUSIC_VIDEO: 'Che estetica per il music video? Ti mostro alcune opzioni.',
        POSTER_DESIGN: 'Che stile di poster? Eccone alcuni.',
        default: category
          ? `Stili ${category} disponibili. Quale preferisci?`
          : 'Che stile vuoi? Ti mostro alcune opzioni.'
      },
      en: {
        GENERATE_LOGO: 'What style for the logo? Here are some examples.',
        GENERATE_IMAGE: category
          ? `Got several ${category} styles! Which one do you like?`
          : 'What style do you prefer? Here are some.',
        VIDEO_FROM_TEXT: 'What look for the video? Check out these styles.',
        BOOK_COVER: 'Cover style! Which suits your book?',
        ILLUSTRATED_BOOK: 'What style for illustrations? Look at these examples.',
        MUSIC_VIDEO: 'What aesthetic for the music video? Here are some options.',
        POSTER_DESIGN: 'What poster style? Here are some.',
        default: category
          ? `${category} styles available. Which do you prefer?`
          : 'What style do you want? Here are some options.'
      },
      es: {
        GENERATE_LOGO: '¿Qué estilo para el logo? Aquí hay algunos ejemplos.',
        GENERATE_IMAGE: category
          ? `¡Tengo varios estilos ${category}! ¿Cuál te gusta?`
          : '¿Qué estilo prefieres? Aquí hay algunos.',
        VIDEO_FROM_TEXT: '¿Qué look para el video? Mira estos estilos.',
        BOOK_COVER: '¡Estilo de portada! ¿Cuál se adapta a tu libro?',
        ILLUSTRATED_BOOK: '¿Qué estilo para las ilustraciones? Mira estos ejemplos.',
        MUSIC_VIDEO: '¿Qué estética para el video musical? Aquí hay algunas opciones.',
        POSTER_DESIGN: '¿Qué estilo de cartel? Aquí hay algunos.',
        default: category
          ? `Estilos ${category} disponibles. ¿Cuál prefieres?`
          : '¿Qué estilo quieres? Aquí hay algunas opciones.'
      },
      fr: {
        GENERATE_LOGO: 'Quel style pour le logo? Voici quelques exemples.',
        GENERATE_IMAGE: category
          ? `J'ai plusieurs styles ${category}! Lequel tu aimes?`
          : 'Quel style tu préfères? En voici quelques-uns.',
        VIDEO_FROM_TEXT: 'Quel look pour la vidéo? Regarde ces styles.',
        BOOK_COVER: 'Style de couverture! Lequel convient à ton livre?',
        ILLUSTRATED_BOOK: 'Quel style pour les illustrations? Regarde ces exemples.',
        MUSIC_VIDEO: 'Quelle esthétique pour le clip musical? Voici quelques options.',
        POSTER_DESIGN: 'Quel style d\'affiche? En voici quelques-uns.',
        default: category
          ? `Styles ${category} disponibles. Lequel préfères-tu?`
          : 'Quel style veux-tu? Voici quelques options.'
      },
      de: {
        GENERATE_LOGO: 'Welcher Stil für das Logo? Hier sind einige Beispiele.',
        GENERATE_IMAGE: category
          ? `Habe mehrere ${category}-Stile! Welcher gefällt dir?`
          : 'Welchen Stil bevorzugst du? Hier sind einige.',
        VIDEO_FROM_TEXT: 'Welcher Look für das Video? Schau dir diese Stile an.',
        BOOK_COVER: 'Cover-Stil! Welcher passt zu deinem Buch?',
        ILLUSTRATED_BOOK: 'Welcher Stil für Illustrationen? Schau dir diese Beispiele an.',
        MUSIC_VIDEO: 'Welche Ästhetik für das Musikvideo? Hier sind einige Optionen.',
        POSTER_DESIGN: 'Welcher Poster-Stil? Hier sind einige.',
        default: category
          ? `${category}-Stile verfügbar. Welchen bevorzugst du?`
          : 'Welchen Stil willst du? Hier sind einige Optionen.'
      }
    };

    const langMessages = messages[language];
    return langMessages[capability] || langMessages.default;
  }

  /**
   * Get fallback proposal message when Style Selector is unavailable
   */
  private getFallbackProposalMessage(language: Language): string {
    const messages: Record<Language, string> = {
      it: 'Che stile preferisci? (Il catalogo stili è temporaneamente non disponibile)',
      en: 'What style do you prefer? (Style catalog temporarily unavailable)',
      es: '¿Qué estilo prefieres? (Catálogo de estilos temporalmente no disponible)',
      fr: 'Quel style préfères-tu? (Catalogue de styles temporairement indisponible)',
      de: 'Welchen Stil bevorzugst du? (Stilkatalog vorübergehend nicht verfügbar)'
    };

    return messages[language];
  }
}
