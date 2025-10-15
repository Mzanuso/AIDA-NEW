# AIDA Orchestrator V5 - Complete Implementation Prompt for Claude Code

**Version:** 2.0  
**Date:** October 15, 2025  
**Target:** Claude Code  
**Estimated Time:** 8-10 hours  
**Criticality:** HIGH - Foundation for entire AIDA multi-agent system

---

## 🎯 Mission Statement

Refactor and complete the AIDA Orchestrator agent to handle **ALL 94 content creation capabilities** (text, images, video, audio, design, repurposing, multimedia projects) while maintaining its role as **Account Manager** in the multi-agent architecture.

This implementation must preserve all existing working code, migrate database from Neon to Supabase, and add new capabilities: language detection, proactive style guidance, and Technical Planner integration.

---

## 📊 The 94 Capabilities (Complete Coverage)

AIDA supports 94 creative capabilities that Orchestrator MUST handle:

### **📖 TEXT & WRITING (13)**
WRITE_STORY, WRITE_SCRIPT, WRITE_BLOG_POST, WRITE_SOCIAL_COPY, WRITE_POETRY, WRITE_SONG_LYRICS, WRITE_BOOK, WRITE_EMAIL, WRITE_SPEECH, EDIT_TEXT, TRANSLATE, LOCALIZE, SUMMARIZE_TEXT

### **🎨 VISUAL GENERATION (13)**
GENERATE_IMAGE, GENERATE_ILLUSTRATION, GENERATE_LOGO, GENERATE_ICON_SET, GENERATE_PORTRAIT, GENERATE_PRODUCT_PHOTO, GENERATE_SCENE, GENERATE_PATTERN, GENERATE_MOCKUP, GENERATE_BRAND_KIT, STYLE_TRANSFER, GENERATE_STORYBOARD, GENERATE_THUMBNAIL

### **✏️ IMAGE EDITING (11)**
REMOVE_BACKGROUND, REMOVE_OBJECT, ADD_OBJECT, CHANGE_BACKGROUND, UPSCALE_IMAGE, RESTORE_PHOTO, COLORIZE_BW, FACE_SWAP, CHANGE_OUTFIT, PHOTO_360_VIEW, STYLE_TRANSFER

### **🎬 VIDEO GENERATION (11)**
VIDEO_FROM_TEXT, IMAGE_TO_VIDEO, VIDEO_FROM_MUSIC, LIPSYNC_VIDEO, ANIMATE_CHARACTER, MUSIC_VIDEO, PRODUCT_VIDEO, EXPLAINER_VIDEO, SHORT_FORM_VIDEO, LONG_FORM_VIDEO, TESTIMONIAL_VIDEO

### **🎞️ VIDEO EDITING (12)**
VIDEO_TO_VIDEO, AUTO_EDIT_VIDEO, CLIP_EXTRACTION, VIDEO_REPURPOSE, VIDEO_DUBBING, AUTO_CAPTION, REMOVE_SILENCE, COLOR_GRADING, ADD_BROLL, VIDEO_STABILIZATION, SPEED_RAMPING, BACKGROUND_BLUR

### **🎵 AUDIO & MUSIC (11)**
GENERATE_MUSIC, GENERATE_SOUND_FX, TEXT_TO_SPEECH, VOICE_CLONE, EXTEND_MUSIC, REMIX_MUSIC, PODCAST_EDIT, AUDIO_ENHANCEMENT, AUDIO_TRANSCRIPTION, MEETING_SUMMARY, TEXT_TO_PODCAST

### **🖼️ DESIGN & BRANDING (11)**
POSTER_DESIGN, FLYER_DESIGN, BANNER_DESIGN, BUSINESS_CARD, PRESENTATION_DECK, INFOGRAPHIC, SOCIAL_POST, BOOK_COVER, ALBUM_COVER, MENU_DESIGN, INVITATION

### **📚 CONTENT REPURPOSING (6)**
BLOG_TO_VIDEO, LONG_TO_SHORT, VIDEO_TO_BLOG, PODCAST_TO_SOCIAL, PRESENTATION_TO_VIDEO, EBOOK_TO_COURSE

### **📚 MULTIMEDIA PROJECTS (6)**
ILLUSTRATED_BOOK, COMIC_BOOK, PHOTO_BOOK, PORTFOLIO, CATALOG, MAGAZINE

---

## 📁 Project Context

**Location:** `D:\AIDA-NEW\src\agents\orchestrator\`

**Current State:**
- ✅ Working Orchestrator with Neon PostgreSQL
- ✅ Working UI: `test-orchestrator-chat.html`
- ✅ Existing tools: RAG, Agent Tools, Media Tools
- ✅ Personality system integrated
- ✅ Dependencies: Anthropic SDK, OpenAI, FAL.AI, postgres

**What Changes:**
- 🔄 Database: Neon → Supabase (CRITICAL: only connection string changes)
- 🔄 Architecture: Monolithic → Multi-agent separation
- ➕ New: Language detection (5 languages)
- ➕ New: Proactive style guidance
- ➕ New: Technical Planner interface (mocked)
- ➕ New: Context engineering best practices
- ➕ New: Comprehensive error handling

**What Must NOT Change:**
- ✅ RAG tools functionality
- ✅ Agent tools functionality
- ✅ Media tools functionality
- ✅ Personality system
- ✅ UI functionality
- ✅ Database schema (PostgreSQL)

---

## 🏗️ Architecture: Multi-Agent System

```
┌─────────────────────────────────────┐
│         USER LAYER                  │
│  Natural language, 94 capabilities  │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   ORCHESTRATOR (Port 3003)          │
│   Role: Account Manager             │
│   ─────────────────────────────     │
│   ✅ Conversation (5 languages)     │
│   ✅ Intent detection (94 caps)     │
│   ✅ Requirements extraction        │
│   ✅ Proactive style proposals      │
│   ✅ Brief generation               │
│   ✅ Status updates                 │
│   ✅ Result presentation            │
│   ❌ NO model selection             │
│   ❌ NO workflow decisions          │
└──────────────┬──────────────────────┘
               ↓ ProjectBrief
┌─────────────────────────────────────┐
│   TECHNICAL PLANNER (Mocked)        │
│   Role: Project Manager             │
│   ─────────────────────────────     │
│   ✅ Model selection (52+ models)   │
│   ✅ Workflow design                │
│   ✅ Cost/time estimation           │
│   ❌ NO user interaction            │
└──────────────┬──────────────────────┘
               ↓ ExecutionPlan
┌─────────────────────────────────────┐
│   EXECUTION LAYER (Future)          │
│   Writer, Director, Visual, Video   │
└─────────────────────────────────────┘
```

---

## 🔴 CRITICAL: Database Migration

### Neon → Supabase Migration

**Why:**
- Same PostgreSQL engine (zero code changes)
- Auth included (future user management)
- Storage included (uploaded files, generated media)
- Already using in Style Selector
- Unified backend

**What Changes:**
```bash
# FROM (Neon):
DATABASE_URL=postgresql://user:pass@neon.tech:5432/aida

# TO (Supabase):
DATABASE_URL=postgresql://postgres:pass@db.PROJECT_REF.supabase.co:5432/postgres
```

**What Doesn't Change:**
- ✅ All Drizzle ORM code
- ✅ All SQL queries
- ✅ All migrations
- ✅ All schema definitions
- ✅ All database operations

**Migration Checklist:**
```bash
# 1. Update .env.example
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# 2. Add comment in code
// MIGRATION NOTE: Changed from Neon to Supabase (2025-10-15)
// Both use PostgreSQL - only connection string changed
// All existing code works unchanged

# 3. Test connection
npm run db:verify

# 4. Run existing migrations
npm run db:migrate

# 5. Verify all queries work
npm test
```

---

## 🎨 Context Engineering Best Practices

Following Anthropic's context engineering guidelines to prevent context rot and optimize attention:

### 1. Prompt Caching Strategy

```typescript
interface CachedSystemPrompt {
  system: [
    {
      type: 'text';
      text: string; // PERSONALITY_PROMPT (~500 tokens)
      cache_control: { type: 'ephemeral' }; // ← CACHED
    },
    {
      type: 'text';
      text: string; // TOOL_CATALOG (~400 tokens)
      cache_control: { type: 'ephemeral' }; // ← CACHED
    },
    {
      type: 'text';
      text: string; // CAPABILITIES_MAP (~300 tokens)
      cache_control: { type: 'ephemeral' }; // ← CACHED
    },
    {
      type: 'text';
      text: string; // DYNAMIC CONTEXT
      // NOT cached - changes every request
    }
  ];
}

// Cache TTL: 5 minutes (Anthropic default)
// Cache hit target: >80%
// Monitor cache performance:
logger.info('Cache metrics', {
  cacheHit: response.usage.cache_read_input_tokens > 0,
  cacheCreation: response.usage.cache_creation_input_tokens,
  cacheHitRate: calculateHitRate()
});
```

### 2. Just-in-Time Context Loading

```typescript
// ❌ BAD: Load everything upfront
const context = {
  allProjects: await db.projects.findMany(), // Huge!
  allFiles: await db.files.findMany(),       // Huge!
  allConversations: await db.conversations.findMany() // Huge!
};

// ✅ GOOD: Load only when needed
async function buildDynamicContext(message: string, sessionId: string) {
  const context: DynamicContext = {
    currentBrief: await loadBriefState(sessionId),
    recentMessages: await loadRecentMessages(sessionId, limit: 10)
  };
  
  // Only if user mentions past projects
  if (mentionsPastWork(message)) {
    context.similarProjects = await ragTools.search(message, limit: 5);
  }
  
  // Only if user shares a link
  if (containsURL(message)) {
    context.referenceContent = await fetchURL(extractURL(message));
  }
  
  return context;
}
```

### 3. Conversation History Compression

```typescript
class ConversationCompressor {
  async compress(history: Message[], threshold: number = 20): Promise<Message[]> {
    if (history.length <= threshold) {
      return history;
    }
    
    // Keep recent messages in full detail
    const recentMessages = history.slice(-10);
    
    // Compress old messages
    const oldMessages = history.slice(0, -10);
    const summary = await this.summarizeMessages(oldMessages);
    
    return [
      {
        role: 'system',
        content: `Previous conversation summary: ${summary}`
      },
      ...recentMessages
    ];
  }
  
  private async summarizeMessages(messages: Message[]): Promise<string> {
    // Use Claude to summarize old conversation
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Summarize this conversation in 2-3 sentences, focusing on: 
                    user intent, requirements gathered, and current project state.
                    
                    Conversation:
                    ${JSON.stringify(messages)}`
        }
      ]
    });
    
    return response.content[0].text;
  }
}
```

### 4. Token Budget Management

```typescript
class TokenBudgetManager {
  private readonly MAX_CONTEXT_TOKENS = 150000; // Conservative limit
  private readonly RESERVED_FOR_RESPONSE = 4000;
  private readonly AVAILABLE_FOR_CONTEXT = this.MAX_CONTEXT_TOKENS - this.RESERVED_FOR_RESPONSE;
  
  async enforce(context: DynamicContext): Promise<DynamicContext> {
    let currentTokens = this.estimateTokens(context);
    
    if (currentTokens <= this.AVAILABLE_FOR_CONTEXT) {
      return context; // Within budget
    }
    
    // Reduce context to fit budget
    logger.warn('Context exceeds budget', {
      current: currentTokens,
      available: this.AVAILABLE_FOR_CONTEXT
    });
    
    // Strategy: Remove least important items first
    if (context.similarProjects) {
      context.similarProjects = context.similarProjects.slice(0, 3); // Reduce from 5 to 3
      currentTokens = this.estimateTokens(context);
    }
    
    if (currentTokens > this.AVAILABLE_FOR_CONTEXT && context.recentMessages) {
      context.recentMessages = context.recentMessages.slice(-5); // Reduce from 10 to 5
      currentTokens = this.estimateTokens(context);
    }
    
    if (currentTokens > this.AVAILABLE_FOR_CONTEXT) {
      // Last resort: compress everything
      context = await this.compressAggressively(context);
    }
    
    return context;
  }
  
  private estimateTokens(context: any): number {
    // Rough estimation: 1 token ≈ 4 characters
    const jsonString = JSON.stringify(context);
    return Math.ceil(jsonString.length / 4);
  }
}
```

### 5. Selective Tool Loading

```typescript
// ❌ BAD: Always load all tools
const tools = [
  ragTools,
  agentTools,
  mediaTools,
  webSearchTools,
  webFetchTools,
  styleSelectorTools
]; // Always available

// ✅ GOOD: Load tools just-in-time
function selectRelevantTools(intent: UserIntent, message: string): Tool[] {
  const tools: Tool[] = [];
  
  // Always include these
  tools.push(basicConversationTools);
  
  // Conditional loading
  if (mentionsPastWork(message)) {
    tools.push(ragTools);
  }
  
  if (requiresVisualContent(intent)) {
    tools.push(styleSelectorTools);
    tools.push(mediaTools);
  }
  
  if (requiresWebInfo(message)) {
    tools.push(webSearchTools, webFetchTools);
  }
  
  if (needsAgentSpawning(intent)) {
    tools.push(agentTools);
  }
  
  return tools;
}
```

---

## 🌍 Language Detection & Adaptation

### Supported Languages

- Italian (IT) - Primary
- English (EN)
- Spanish (ES)
- French (FR)
- German (DE)

### Implementation

```typescript
export type Language = 'it' | 'en' | 'es' | 'fr' | 'de';

interface LanguagePattern {
  language: Language;
  patterns: RegExp[];
  commonWords: string[];
  specialChars: string[];
  confidence: number;
}

class LanguageDetector {
  private patterns: LanguagePattern[] = [
    {
      language: 'it',
      patterns: [/\b(sono|voglio|posso|fare|creare|grazie|ciao|come)\b/i],
      commonWords: ['sono', 'voglio', 'posso', 'che', 'come', 'dove', 'quando'],
      specialChars: ['à', 'è', 'é', 'ì', 'ò', 'ù'],
      confidence: 0
    },
    {
      language: 'en',
      patterns: [/\b(am|want|can|make|create|thanks|hello|how)\b/i],
      commonWords: ['am', 'want', 'can', 'the', 'what', 'where', 'when'],
      specialChars: [],
      confidence: 0
    },
    {
      language: 'es',
      patterns: [/\b(soy|quiero|puedo|hacer|crear|gracias|hola|cómo)\b/i],
      commonWords: ['soy', 'quiero', 'puedo', 'que', 'como', 'donde', 'cuando'],
      specialChars: ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'],
      confidence: 0
    },
    {
      language: 'fr',
      patterns: [/\b(suis|veux|peux|faire|créer|merci|bonjour|comment)\b/i],
      commonWords: ['suis', 'veux', 'peux', 'que', 'comment', 'où', 'quand'],
      specialChars: ['à', 'â', 'é', 'è', 'ê', 'ë', 'ï', 'ô', 'ù', 'û', 'ç'],
      confidence: 0
    },
    {
      language: 'de',
      patterns: [/\b(bin|will|kann|machen|erstellen|danke|hallo|wie)\b/i],
      commonWords: ['bin', 'will', 'kann', 'das', 'wie', 'wo', 'wann'],
      specialChars: ['ä', 'ö', 'ü', 'ß'],
      confidence: 0
    }
  ];
  
  detect(text: string, previousLanguage?: Language): Language {
    // Handle edge cases
    if (!text || text.trim().length < 3) {
      return previousLanguage || 'it'; // Default fallback
    }
    
    // Calculate confidence scores
    const scores = this.patterns.map(pattern => ({
      language: pattern.language,
      score: this.calculateScore(text, pattern)
    }));
    
    // Sort by score
    scores.sort((a, b) => b.score - a.score);
    
    // If top score is very low, use previous language
    if (scores[0].score < 3 && previousLanguage) {
      logger.debug('Low confidence, using previous language', {
        detected: scores[0].language,
        score: scores[0].score,
        fallback: previousLanguage
      });
      return previousLanguage;
    }
    
    return scores[0].language;
  }
  
  private calculateScore(text: string, pattern: LanguagePattern): number {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    // Score by regex patterns (weight: 3)
    for (const regex of pattern.patterns) {
      if (regex.test(text)) {
        score += 3;
      }
    }
    
    // Score by common words (weight: 2)
    for (const word of pattern.commonWords) {
      if (lowerText.includes(word)) {
        score += 2;
      }
    }
    
    // Score by special characters (weight: 1)
    for (const char of pattern.specialChars) {
      if (text.includes(char)) {
        score += 1;
      }
    }
    
    return score;
  }
  
  // Get confidence level
  getConfidence(text: string, detectedLanguage: Language): number {
    const allScores = this.patterns.map(p => this.calculateScore(text, p));
    const detectedScore = allScores[this.patterns.findIndex(p => p.language === detectedLanguage)];
    const maxScore = Math.max(...allScores);
    
    return detectedScore / maxScore; // 0-1
  }
}
```

### Multilingual Personality Prompts

```typescript
const PERSONALITY_PROMPTS: Record<Language, string> = {
  it: `
Sei l'Orchestrator di AIDA, un assistente AI creativo.

PERSONALITÀ (stile Zerocalcare):
- Diretto e sarcastico ma sempre costruttivo
- Amichevole, mai corporate o robotico
- Riferimenti pop/nerd quando appropriato
- Zero formalità, niente "egregio" o "cordiali saluti"
- Battute veloci invece di lunghe spiegazioni

FRASI VIETATE (non usare mai):
- "Perfetto!", "Eccellente!", "Assolutamente!", "Con piacere!"

FRASI BUONE (usa queste):
- "Ok, ci sta", "Vediamo un po'", "Mica male!", "Potrebbe funzionare", "Famo così"

REGOLE:
1. Adattati automaticamente alla lingua dell'utente
2. Max 1 domanda per risposta (non interrogare)
3. Non menzionare mai nomi tecnici (FLUX, Kling, Midjourney)
4. Sii proattivo: proponi opzioni, non aspettare che l'utente chieda
5. Quando l'utente menziona contenuto visivo, proponi la galleria stili
6. Raccogli info in modo conversazionale, non come un form
`,

  en: `
You are AIDA's Orchestrator, a creative AI assistant.

PERSONALITY (Zerocalcare-inspired):
- Direct and sarcastic but always constructive
- Friendly, never corporate or robotic
- Pop/nerd references when appropriate
- Zero formalities, no "dear sir" or "kind regards"
- Quick jokes over long explanations

BANNED PHRASES (never use):
- "Perfect!", "Excellent!", "Absolutely!", "With pleasure!"

GOOD PHRASES (use these):
- "Okay, makes sense", "Let's see", "Not bad!", "Might work", "Let's do this"

RULES:
1. Automatically adapt to user's language
2. Max 1 question per response (don't interrogate)
3. Never mention technical names (FLUX, Kling, Midjourney)
4. Be proactive: propose options, don't wait for user to ask
5. When user mentions visual content, propose style gallery
6. Gather info conversationally, not like a form
`,

  es: `
Eres el Orchestrator de AIDA, un asistente creativo de IA.

PERSONALIDAD (estilo Zerocalcare):
- Directo y sarcástico pero siempre constructivo
- Amigable, nunca corporativo o robótico
- Referencias pop/geek cuando sea apropiado
- Cero formalidades, nada de "estimado señor"
- Bromas rápidas en lugar de explicaciones largas

FRASES PROHIBIDAS (nunca uses):
- "¡Perfecto!", "¡Excelente!", "¡Absolutamente!", "¡Con gusto!"

FRASES BUENAS (usa estas):
- "Vale, tiene sentido", "A ver", "¡No está mal!", "Podría funcionar", "Vamos a ello"

REGLAS:
1. Adáptate automáticamente al idioma del usuario
2. Máx 1 pregunta por respuesta (no interrogues)
3. Nunca menciones nombres técnicos (FLUX, Kling, Midjourney)
4. Sé proactivo: propón opciones, no esperes a que el usuario pregunte
5. Cuando el usuario mencione contenido visual, propón la galería de estilos
6. Recoge info de forma conversacional, no como un formulario
`,

  fr: `
Tu es l'Orchestrator d'AIDA, un assistant créatif IA.

PERSONNALITÉ (style Zerocalcare):
- Direct et sarcastique mais toujours constructif
- Amical, jamais corporate ou robotique
- Références pop/geek quand approprié
- Zéro formalités, pas de "cher monsieur"
- Blagues rapides plutôt que longues explications

PHRASES INTERDITES (n'utilise jamais):
- "Parfait!", "Excellent!", "Absolument!", "Avec plaisir!"

BONNES PHRASES (utilise celles-ci):
- "Ok, ça marche", "Voyons voir", "Pas mal!", "Ça pourrait marcher", "C'est parti"

RÈGLES:
1. Adapte-toi automatiquement à la langue de l'utilisateur
2. Max 1 question par réponse (n'interroge pas)
3. Ne mentionne jamais les noms techniques (FLUX, Kling, Midjourney)
4. Sois proactif: propose des options, n'attends pas que l'utilisateur demande
5. Quand l'utilisateur mentionne du contenu visuel, propose la galerie de styles
6. Collecte les infos de manière conversationnelle, pas comme un formulaire
`,

  de: `
Du bist der Orchestrator von AIDA, ein kreativer KI-Assistent.

PERSÖNLICHKEIT (Zerocalcare-Stil):
- Direkt und sarkastisch aber immer konstruktiv
- Freundlich, nie corporate oder robotisch
- Pop/Nerd-Referenzen wenn passend
- Null Formalitäten, kein "sehr geehrter Herr"
- Schnelle Witze statt langer Erklärungen

VERBOTENE PHRASEN (nie verwenden):
- "Perfekt!", "Ausgezeichnet!", "Absolut!", "Mit Vergnügen!"

GUTE PHRASEN (diese verwenden):
- "Okay, macht Sinn", "Mal sehen", "Nicht schlecht!", "Könnte klappen", "Los geht's"

REGELN:
1. Passe dich automatisch an die Sprache des Benutzers an
2. Max 1 Frage pro Antwort (nicht verhören)
3. Erwähne nie technische Namen (FLUX, Kling, Midjourney)
4. Sei proaktiv: schlage Optionen vor, warte nicht auf Fragen
5. Wenn der Benutzer visuelle Inhalte erwähnt, schlage die Stil-Galerie vor
6. Sammle Infos konversationell, nicht wie ein Formular
`
};

// Usage:
const personalityPrompt = PERSONALITY_PROMPTS[detectedLanguage];
```

---

## 🎨 Proactive Style Guidance

### When to Propose Style Gallery

```typescript
type Capability = /* all 94 capabilities */;

interface StyleProposalRules {
  // ALWAYS propose for these capabilities
  always: Capability[];
  
  // NEVER propose for these capabilities
  never: Capability[];
  
  // CONDITIONAL - propose based on context
  conditional: Map<Capability, (context: Context) => boolean>;
}

const STYLE_PROPOSAL_RULES: StyleProposalRules = {
  always: [
    'GENERATE_IMAGE',
    'GENERATE_ILLUSTRATION',
    'GENERATE_LOGO',
    'GENERATE_ICON_SET',
    'GENERATE_PORTRAIT',
    'VIDEO_FROM_TEXT',
    'IMAGE_TO_VIDEO',
    'MUSIC_VIDEO',
    'PRODUCT_VIDEO',
    'BOOK_COVER',
    'ALBUM_COVER',
    'POSTER_DESIGN',
    'FLYER_DESIGN',
    'SOCIAL_POST',
    'ILLUSTRATED_BOOK',
    'COMIC_BOOK'
  ],
  
  never: [
    'WRITE_STORY',
    'WRITE_SCRIPT',
    'WRITE_EMAIL',
    'EDIT_TEXT',
    'TRANSLATE',
    'SUMMARIZE_TEXT',
    'AUDIO_TRANSCRIPTION',
    'MEETING_SUMMARY',
    'REMOVE_BACKGROUND', // Has image input, not generating new style
    'UPSCALE_IMAGE',
    'RESTORE_PHOTO'
  ],
  
  conditional: new Map([
    ['GENERATE_STORYBOARD', (ctx) => !ctx.brief.style], // If no style chosen yet
    ['VIDEO_TO_VIDEO', (ctx) => ctx.transformationType === 'style_change'],
    ['STYLE_TRANSFER', () => true] // Always for style transfer
  ])
};

class StyleProposalSystem {
  constructor(
    private styleSelectorClient: StyleSelectorClient,
    private rules: StyleProposalRules
  ) {}
  
  async shouldPropose(
    capability: Capability,
    message: string,
    context: ConversationContext
  ): Promise<boolean> {
    // Check explicit rules first
    if (this.rules.always.includes(capability)) {
      return true;
    }
    
    if (this.rules.never.includes(capability)) {
      return false;
    }
    
    // Check conditional rules
    const conditionalRule = this.rules.conditional.get(capability);
    if (conditionalRule) {
      return conditionalRule(context);
    }
    
    // If no explicit rule, ask Style Selector if message mentions any style
    const matchedStyles = await this.styleSelectorClient.matchStyles(message);
    return matchedStyles.length > 0;
  }
  
  async generateProposal(
    capability: Capability,
    message: string,
    language: Language
  ): Promise<StyleProposal> {
    // Try to extract style category from message
    const category = await this.styleSelectorClient.categorizeMessage(message);
    
    // Fetch appropriate gallery
    const gallery = await this.styleSelectorClient.getGallery({
      category: category || undefined,
      limit: category ? 9 : 12 // More options if general, fewer if filtered
    });
    
    return {
      type: 'ui_component',
      component: 'image_gallery',
      data: gallery,
      message: this.getProposalMessage(capability, category, language)
    };
  }
  
  private getProposalMessage(
    capability: Capability,
    category: string | null,
    language: Language
  ): string {
    // Capability-specific messages
    const messages: Record<Language, Record<string, string>> = {
      it: {
        GENERATE_LOGO: 'Che stile vuoi per il logo? Ti mostro alcuni esempi.',
        GENERATE_IMAGE: category 
          ? `Ho diversi stili ${category}! Quale ti piace?`
          : 'Che stile preferisci? Eccone alcuni.',
        VIDEO_FROM_TEXT: 'Che look vuoi per il video? Dai un\'occhiata a questi stili.',
        BOOK_COVER: 'Stile copertina! Quale si addice al tuo libro?'
      },
      en: {
        GENERATE_LOGO: 'What style for the logo? Here are some examples.',
        GENERATE_IMAGE: category
          ? `Got several ${category} styles! Which one do you like?`
          : 'What style do you prefer? Here are some.',
        VIDEO_FROM_TEXT: 'What look for the video? Check out these styles.',
        BOOK_COVER: 'Cover style! Which suits your book?'
      }
      // ... ES, FR, DE translations
    };
    
    return messages[language][capability] || messages[language]['GENERATE_IMAGE'];
  }
}
```

### Integration with Style Selector Service

```typescript
interface StyleSelectorClient {
  // Get gallery of styles
  async getGallery(request: StyleGalleryRequest): Promise<StyleGallery>;
  
  // Check if message mentions any known styles
  async matchStyles(message: string): Promise<StyleMatch[]>;
  
  // Categorize message to a style category
  async categorizeMessage(message: string): Promise<string | null>;
  
  // Get details of a specific style
  async getStyleDetails(styleId: string): Promise<StyleDetails>;
}

class StyleSelectorHTTPClient implements StyleSelectorClient {
  private baseURL = 'http://localhost:3002';
  
  async getGallery(request: StyleGalleryRequest): Promise<StyleGallery> {
    try {
      const params = new URLSearchParams();
      if (request.category) params.append('category', request.category);
      if (request.limit) params.append('limit', request.limit.toString());
      
      const response = await axios.get(`${this.baseURL}/styles/gallery?${params}`);
      return response.data;
    } catch (error) {
      logger.error('Style Selector unavailable', { error });
      
      // Fallback: return basic styles without images
      return this.getFallbackGallery();
    }
  }
  
  async matchStyles(message: string): Promise<StyleMatch[]> {
    try {
      const response = await axios.post(`${this.baseURL}/styles/match`, {
        message
      });
      return response.data.matches || [];
    } catch (error) {
      logger.warn('Style matching failed', { error });
      return [];
    }
  }
  
  private getFallbackGallery(): StyleGallery {
    return {
      styles: [
        { id: 'realistic', name: 'Realistic', preview_url: '', description: 'Photorealistic style' },
        { id: 'illustration', name: 'Illustration', preview_url: '', description: 'Hand-drawn style' },
        { id: 'cartoon', name: 'Cartoon', preview_url: '', description: 'Animated style' }
      ],
      ui_type: 'list' // Fallback to simple list without images
    };
  }
}
```

---

## 🤖 Technical Planner Interface (Mock Implementation)

### TypeScript Contracts

```typescript
// types/technical-planner.types.ts

interface ProjectBrief {
  id: string;
  capability: Capability; // One of the 94 capabilities
  type: 'text' | 'image' | 'video' | 'audio' | 'design' | 'repurpose' | 'multimedia';
  requirements: {
    // Common
    style?: string;
    budget?: 'low' | 'medium' | 'high';
    deadline?: Date;
    
    // Visual-specific
    duration?: string;
    platform?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
    resolution?: '720p' | '1080p' | '4K';
    
    // Text-specific
    length?: 'short' | 'medium' | 'long';
    tone?: 'formal' | 'casual' | 'professional' | 'friendly';
    
    // Audio-specific
    voice?: 'male' | 'female' | 'neutral';
    language?: Language;
  };
  context: {
    description: string;
    references?: string[];
    mood?: string;
    targetAudience?: string;
  };
  raw_conversation: ConversationMessage[];
}

interface ExecutionPlan {
  id: string;
  briefId: string;
  approach: 'single_model' | 'multi_step_workflow';
  primaryModel: string;
  fallbackModel?: string;
  steps: ExecutionStep[];
  estimatedTime: number; // seconds
  estimatedCost: number; // dollars
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
}

interface ExecutionStep {
  id: string;
  agent: 'writer' | 'director' | 'style_selector' | 'visual_creator' | 'video_composer';
  action: string;
  model?: string;
  input: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

interface ProjectStatus {
  planId: string;
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep?: {
    name: string;
    progress: number;
  };
  result?: ProjectResult;
  error?: {
    message: string;
    code: string;
    recoverable: boolean;
  };
}

interface ProjectResult {
  files: ResultFile[];
  metadata: {
    modelsUsed: string[];
    totalCost: number;
    generationTime: number;
    capability: Capability;
  };
}

interface ResultFile {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnail?: string;
  size: number;
  duration?: number;
  resolution?: string;
}
```

### Realistic Mock Implementation

```typescript
// mocks/technical-planner.mock.ts

export class MockTechnicalPlanner {
  private plans: Map<string, ExecutionPlan> = new Map();
  
  // Realistic timing per capability type
  private readonly TIMING_MAP: Record<string, number> = {
    // Text (fast)
    'text': 3000,  // 3s
    
    // Images (medium)
    'image': 5000, // 5s
    'logo': 6000,  // 6s
    'illustration': 7000, // 7s
    
    // Video (slow)
    'ugc_video': 8000,  // 8s
    'short_video': 12000, // 12s
    'long_video': 25000,  // 25s
    
    // Audio (medium-slow)
    'music': 15000, // 15s
    'voice': 5000,  // 5s
    
    // Design (medium)
    'poster': 6000,  // 6s
    'social_post': 5000, // 5s
    
    // Complex (very slow)
    'illustrated_book': 30000, // 30s
    'comic_book': 35000 // 35s
  };
  
  async createExecutionPlan(brief: ProjectBrief): Promise<ExecutionPlan> {
    // Validation
    this.validateBrief(brief);
    
    // Simulate network delay
    await this.delay(100 + Math.random() * 200);
    
    // Simulate occasional validation errors (5%)
    if (Math.random() < 0.05) {
      throw new ValidationError(`Invalid brief: missing ${this.getRandomMissingField()}`);
    }
    
    const plan: ExecutionPlan = {
      id: this.generateId(),
      briefId: brief.id,
      approach: this.selectApproach(brief),
      primaryModel: this.selectModel(brief),
      fallbackModel: this.selectFallback(brief),
      steps: this.generateSteps(brief),
      estimatedTime: this.estimateTime(brief),
      estimatedCost: this.estimateCost(brief),
      status: 'pending',
      progress: 0
    };
    
    this.plans.set(plan.id, plan);
    
    // Start async execution
    this.executeAsync(plan.id);
    
    return plan;
  }
  
  async getProjectStatus(planId: string): Promise<ProjectStatus> {
    const plan = this.plans.get(planId);
    
    if (!plan) {
      throw new NotFoundError(`Plan ${planId} not found`);
    }
    
    const status: ProjectStatus = {
      planId: plan.id,
      status: this.mapPlanStatus(plan.status),
      progress: plan.progress
    };
    
    if (plan.status === 'in_progress') {
      const currentStep = plan.steps.find(s => s.status === 'running');
      if (currentStep) {
        status.currentStep = {
          name: currentStep.action,
          progress: this.calculateStepProgress(currentStep)
        };
      }
    }
    
    if (plan.status === 'completed') {
      status.result = this.generateResult(plan);
    }
    
    if (plan.status === 'failed') {
      const failedStep = plan.steps.find(s => s.status === 'failed');
      status.error = {
        message: failedStep?.error || 'Unknown error',
        code: 'EXECUTION_FAILED',
        recoverable: Math.random() > 0.5 // 50% recoverable
      };
    }
    
    return status;
  }
  
  private async executeAsync(planId: string): Promise<void> {
    const plan = this.plans.get(planId);
    if (!plan) return;
    
    try {
      plan.status = 'in_progress';
      
      // Execute each step
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        
        step.status = 'running';
        step.startTime = new Date();
        
        // Simulate step execution time
        const stepDuration = plan.estimatedTime / plan.steps.length;
        await this.delay(stepDuration);
        
        // Simulate occasional step failures (3%)
        if (Math.random() < 0.03) {
          step.status = 'failed';
          step.error = `${step.action} failed: ${this.getRandomErrorReason()}`;
          plan.status = 'failed';
          return;
        }
        
        step.status = 'completed';
        step.endTime = new Date();
        step.output = this.generateStepOutput(step);
        
        // Update overall progress
        plan.progress = Math.round(((i + 1) / plan.steps.length) * 100);
      }
      
      plan.status = 'completed';
      plan.progress = 100;
      
    } catch (error) {
      plan.status = 'failed';
      logger.error('Plan execution failed', { planId, error });
    }
  }
  
  private selectModel(brief: ProjectBrief): string {
    // Comprehensive model selection based on capability
    const capabilityModelMap: Partial<Record<Capability, string>> = {
      // Text capabilities
      'WRITE_STORY': 'claude-sonnet-4-5',
      'WRITE_SCRIPT': 'claude-sonnet-4-5',
      'WRITE_BLOG_POST': 'claude-sonnet-4-5',
      
      // Image generation
      'GENERATE_IMAGE': brief.requirements.style === 'realistic' ? 'flux-1.1-pro' : 'midjourney-v7',
      'GENERATE_ILLUSTRATION': 'recraft-v3',
      'GENERATE_LOGO': 'recraft-v3-svg',
      'GENERATE_PORTRAIT': 'flux-1.1-pro',
      
      // Video generation
      'VIDEO_FROM_TEXT': brief.requirements.budget === 'high' ? 'sora-2-pro' : 'kling-2.5-turbo-pro',
      'IMAGE_TO_VIDEO': 'kling-2.5-turbo-pro',
      'TESTIMONIAL_VIDEO': 'omnihuman-v1.5',
      'MUSIC_VIDEO': 'runway-gen-3',
      
      // Audio
      'GENERATE_MUSIC': 'udio-v4',
      'TEXT_TO_SPEECH': 'wizper-tts',
      'VOICE_CLONE': 'eleven-labs',
      
      // Image editing
      'REMOVE_BACKGROUND': 'bria-rmbg-2.0',
      'UPSCALE_IMAGE': 'aurasr-4x',
      'FACE_SWAP': 'easel-ai-face-swap',
      
      // Video editing
      'AUTO_CAPTION': 'whisper-large',
      'COLOR_GRADING': 'runway-gen-3',
      'VIDEO_TO_VIDEO': 'runway-gen-3',
      
      // Design
      'POSTER_DESIGN': 'recraft-v3',
      'BOOK_COVER': brief.requirements.style === 'illustrated' ? 'midjourney-v7' : 'flux-1.1-pro',
      'SOCIAL_POST': 'recraft-v3'
      
      // ... (continue for all 94 capabilities)
    };
    
    return capabilityModelMap[brief.capability] || 'default-model';
  }
  
  private generateSteps(brief: ProjectBrief): ExecutionStep[] {
    // Different workflow based on capability
    
    if (brief.type === 'text') {
      return [
        {
          id: this.generateId(),
          agent: 'writer',
          action: 'generate_text',
          model: this.selectModel(brief),
          input: brief,
          status: 'pending'
        }
      ];
    }
    
    if (brief.capability === 'ILLUSTRATED_BOOK') {
      return [
        {
          id: this.generateId(),
          agent: 'writer',
          action: 'generate_story',
          model: 'claude-sonnet-4-5',
          input: brief,
          status: 'pending'
        },
        {
          id: this.generateId(),
          agent: 'director',
          action: 'create_storyboard',
          input: 'story_output',
          status: 'pending'
        },
        {
          id: this.generateId(),
          agent: 'visual_creator',
          action: 'generate_illustrations',
          model: 'midjourney-v7',
          input: 'storyboard_output',
          status: 'pending'
        },
        {
          id: this.generateId(),
          agent: 'video_composer',
          action: 'assemble_book',
          input: 'illustrations_output',
          status: 'pending'
        }
      ];
    }
    
    // Simple workflow for most capabilities
    return [
      {
        id: this.generateId(),
        agent: 'visual_creator',
        action: `generate_${brief.type}`,
        model: this.selectModel(brief),
        input: brief,
        status: 'pending'
      }
    ];
  }
  
  private generateResult(plan: ExecutionPlan): ProjectResult {
    const brief = this.getBriefForPlan(plan);
    
    return {
      files: [
        {
          type: brief.type as any,
          url: `https://storage.supabase.co/generated/${plan.id}.${this.getFileExtension(brief.type)}`,
          thumbnail: brief.type === 'video' ? `https://storage.supabase.co/thumbs/${plan.id}.jpg` : undefined,
          size: Math.random() * 10000000, // Random size 0-10MB
          duration: brief.type === 'video' ? parseInt(brief.requirements.duration || '30') : undefined,
          resolution: brief.requirements.resolution
        }
      ],
      metadata: {
        modelsUsed: [plan.primaryModel],
        totalCost: plan.estimatedCost,
        generationTime: plan.estimatedTime / 1000,
        capability: brief.capability
      }
    };
  }
  
  // Utility methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getRandomErrorReason(): string {
    const reasons = [
      'Model timeout',
      'Invalid parameters',
      'Rate limit exceeded',
      'Service temporarily unavailable',
      'Content policy violation'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
}
```

---

## 🚨 Comprehensive Error Handling

### Error Categories & Strategies

```typescript
// types/errors.types.ts

export enum ErrorCategory {
  USER_INPUT = 'user_input',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  BUSINESS_LOGIC = 'business_logic',
  TECHNICAL = 'technical',
  RATE_LIMIT = 'rate_limit'
}

export interface ErrorResponse {
  type: 'error';
  category: ErrorCategory;
  message: string; // User-friendly message in their language
  technicalDetails?: string; // For logging
  recovery?: {
    action: 'retry' | 'fallback' | 'clarify' | 'abort';
    message: string;
    options?: string[];
  };
  retryable: boolean;
}

// errors/error-handler.ts

export class OrchestratorErrorHandler {
  
  handle(error: Error, context: ErrorContext): ErrorResponse {
    // Determine error category
    const category = this.categorize(error);
    
    // Log with context
    logger.error('Orchestrator error', {
      category,
      error: error.message,
      stack: error.stack,
      context
    });
    
    // Generate user-friendly response
    return this.generateResponse(error, category, context);
  }
  
  private categorize(error: Error): ErrorCategory {
    if (error instanceof ValidationError) {
      return ErrorCategory.USER_INPUT;
    }
    
    if (error instanceof ServiceUnavailableError) {
      return ErrorCategory.SERVICE_UNAVAILABLE;
    }
    
    if (error instanceof RateLimitError) {
      return ErrorCategory.RATE_LIMIT;
    }
    
    if (error instanceof BusinessLogicError) {
      return ErrorCategory.BUSINESS_LOGIC;
    }
    
    return ErrorCategory.TECHNICAL;
  }
  
  private generateResponse(
    error: Error,
    category: ErrorCategory,
    context: ErrorContext
  ): ErrorResponse {
    
    const language = context.language || 'en';
    
    switch (category) {
      case ErrorCategory.USER_INPUT:
        return {
          type: 'error',
          category,
          message: this.translateMessage(
            'user_input_error',
            language,
            { detail: error.message }
          ),
          recovery: {
            action: 'clarify',
            message: this.translateMessage('please_clarify', language)
          },
          retryable: false
        };
        
      case ErrorCategory.SERVICE_UNAVAILABLE:
        return {
          type: 'error',
          category,
          message: this.translateMessage('service_unavailable', language),
          technicalDetails: error.message,
          recovery: {
            action: 'fallback',
            message: this.translateMessage('using_fallback', language)
          },
          retryable: true
        };
        
      case ErrorCategory.RATE_LIMIT:
        return {
          type: 'error',
          category,
          message: this.translateMessage('rate_limit', language),
          recovery: {
            action: 'retry',
            message: this.translateMessage('retry_later', language)
          },
          retryable: true
        };
        
      case ErrorCategory.BUSINESS_LOGIC:
        return {
          type: 'error',
          category,
          message: this.translateMessage(
            'capability_not_supported',
            language,
            { capability: error.message }
          ),
          recovery: {
            action: 'clarify',
            message: this.translateMessage('suggest_alternative', language),
            options: this.suggestAlternatives(error)
          },
          retryable: false
        };
        
      default:
        return {
          type: 'error',
          category: ErrorCategory.TECHNICAL,
          message: this.translateMessage('unexpected_error', language),
          technicalDetails: error.message,
          recovery: {
            action: 'abort',
            message: this.translateMessage('please_try_again', language)
          },
          retryable: true
        };
    }
  }
  
  private translateMessage(
    key: string,
    language: Language,
    params?: Record<string, string>
  ): string {
    const messages: Record<Language, Record<string, string>> = {
      it: {
        user_input_error: `Non ho capito bene: ${params?.detail}`,
        please_clarify: 'Puoi spiegarmi meglio?',
        service_unavailable: 'Il servizio è momentaneamente offline.',
        using_fallback: 'Uso un\'alternativa per continuare.',
        rate_limit: 'Troppi richieste. Calma e gesso!',
        retry_later: 'Riprova tra qualche secondo.',
        capability_not_supported: `Non posso fare ${params?.capability} per ora.`,
        suggest_alternative: 'Posso proporti qualcosa di simile?',
        unexpected_error: 'Ops, qualcosa è andato storto.',
        please_try_again: 'Riprova o fammi sapere se serve aiuto.'
      },
      en: {
        user_input_error: `Didn't quite understand: ${params?.detail}`,
        please_clarify: 'Can you explain better?',
        service_unavailable: 'Service is temporarily offline.',
        using_fallback: 'Using an alternative to continue.',
        rate_limit: 'Too many requests. Slow down!',
        retry_later: 'Retry in a few seconds.',
        capability_not_supported: `Can't do ${params?.capability} right now.`,
        suggest_alternative: 'Can I suggest something similar?',
        unexpected_error: 'Oops, something went wrong.',
        please_try_again: 'Try again or let me know if you need help.'
      }
      // ... ES, FR, DE
    };
    
    return messages[language][key] || messages['en'][key];
  }
}

// Retry Strategy with Exponential Backoff

export class RetryStrategy {
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_DELAY = 1000; // 1s
  private readonly MAX_DELAY = 8000; // 8s
  private readonly TIMEOUT = 30000; // 30s
  
  async execute<T>(
    operation: () => Promise<T>,
    context: RetryContext
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Set timeout
        const result = await Promise.race([
          operation(),
          this.timeout(this.TIMEOUT)
        ]);
        
        // Success!
        if (attempt > 0) {
          logger.info('Retry successful', {
            operation: context.operation,
            attempts: attempt + 1
          });
        }
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry certain errors
        if (!this.isRetryable(error)) {
          throw error;
        }
        
        // Last attempt?
        if (attempt === this.MAX_RETRIES) {
          logger.error('Max retries exceeded', {
            operation: context.operation,
            attempts: attempt + 1,
            error: lastError.message
          });
          throw lastError;
        }
        
        // Calculate backoff delay
        const delay = Math.min(
          this.INITIAL_DELAY * Math.pow(2, attempt),
          this.MAX_DELAY
        );
        
        logger.warn('Retrying operation', {
          operation: context.operation,
          attempt: attempt + 1,
          delay,
          error: lastError.message
        });
        
        // Wait before retry
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }
  
  private isRetryable(error: any): boolean {
    // Retry on network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // Retry on rate limits
    if (error.status === 429) {
      return true;
    }
    
    // Retry on server errors
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    
    // Don't retry client errors
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    
    return false;
  }
  
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), ms)
    );
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Circuit Breaker Pattern

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT = 60000; // 1 minute
  
  async execute<T>(
    operation: () => Promise<T>,
    serviceName: string
  ): Promise<T> {
    
    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker half-open', { service: serviceName });
      } else {
        throw new ServiceUnavailableError(`Circuit breaker open for ${serviceName}`);
      }
    }
    
    try {
      const result = await operation();
      
      // Success - reset circuit
      if (this.state === 'HALF_OPEN') {
        this.reset(serviceName);
      }
      
      return result;
      
    } catch (error) {
      this.recordFailure(serviceName);
      throw error;
    }
  }
  
  private recordFailure(serviceName: string): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.state = 'OPEN';
      logger.error('Circuit breaker opened', {
        service: serviceName,
        failures: this.failureCount
      });
    }
  }
  
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.RESET_TIMEOUT;
  }
  
  private reset(serviceName: string): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = undefined;
    
    logger.info('Circuit breaker reset', { service: serviceName });
  }
}
```

---

## 📝 Conversation Examples (All 94 Capabilities)

### TEXT & WRITING

```
[WRITE_STORY]
User: "Scrivi una storia per bambini"
Orc: "Ok! Storia per bambini. Che tipo? Avventura, favola, fantascienza?"
User: "Avventura"
Orc: "Perfetto! Protagonista animale o umano?"
User: "Un drago"
Orc: "Un drago! Mi piace. Quanto lunga? (breve=5 min, media=15 min, lunga=30+ min)"
User: "Breve"
Orc: "Famo così: drago, avventura, 5 minuti. Genero la storia!"
[passes to Technical Planner]

[TRANSLATE]
User: "Traduci questo testo in inglese"
Orc: "Ok, traduco. Mandami il testo."
User: [sends text]
Orc: "Ricevuto! Traduco in inglese. Un attimo..."
[passes to Technical Planner - no style gallery needed]
```

### VISUAL GENERATION

```
[GENERATE_LOGO]
User: "Ho bisogno di un logo per la mia startup"
Orc: "Logo per startup! Che stile?
      [🎨 Mostra Stili Logo] [✍️ Descrivi tu]"
User: [clicks: Modern Minimal]
Orc: "Minimal! Mi dici il nome della startup e in che settore siete?"
User: "TechFlow, software per team collaboration"
Orc: "TechFlow, collaboration. Colori preferiti?"
User: "Blu e bianco"
Orc: "Perfetto! Genero il logo: TechFlow, minimal, blu/bianco, tech."
[passes to Technical Planner]

[GENERATE_PORTRAIT]
User: "Voglio un ritratto di me in stile fantasy"
Orc: "Ritratto fantasy! Quale stile ti ispira?
      [🎨 Mostra Stili Fantasy] [✍️ Descrivi tu]"
User: [clicks: Epic Fantasy]
Orc: "Epic style! Carica una tua foto come riferimento."
User: [uploads photo]
Orc: "Ricevuta! Caratteristiche particolari? (armatura, magia, ambientazione?)"
User: "Armatura da guerriero"
Orc: "Guerriero fantasy! Genero il ritratto."
[passes to Technical Planner]
```

### VIDEO GENERATION

```
[TESTIMONIAL_VIDEO]
User: "Voglio un video UGC per il mio prodotto"
Orc: "Video UGC! Che stile?
      [🎨 Casual Authentic] [🎨 Professional] [🎨 Enthusiastic]"
User: [clicks: Casual Authentic]
Orc: "Casual! Quanto lungo? (15s, 30s, 60s?)"
User: "30 secondi"
Orc: "30s, perfetto! Ti serve un talking head o solo B-roll?"
User: "Talking head"
Orc: "Ok! Talking head 30s, stile casual. Genero il video!"
[passes to Technical Planner → selects OmniHuman v1.5]

[MUSIC_VIDEO]
User: "Crea un music video per la mia canzone"
Orc: "Music video! Che vibe vuoi?
      [🎨 Mostra Stili Video] [✍️ Descrivi tu]"
User: [clicks: Cyberpunk Neon]
Orc: "Cyberpunk! Carica la canzone."
User: [uploads audio]
Orc: "Ricevuta! Durata della canzone?"
User: "3 minuti"
Orc: "3 min di puro cyberpunk. Genero il video!"
[passes to Technical Planner → complex workflow]
```

### IMAGE EDITING

```
[REMOVE_BACKGROUND]
User: "Rimuovi lo sfondo da questa foto"
Orc: "Rimozione sfondo! Carica la foto."
User: [uploads image]
Orc: "Ricevuta! Vuoi uno sfondo trasparente o ne metto uno nuovo?"
User: "Trasparente"
Orc: "Trasparente, fatto! Rimuovo lo sfondo."
[passes to Technical Planner → BRIA RMBG 2.0]

[FACE_SWAP]
User: "Face swap tra me e mio amico"
Orc: "Face swap! Carica due foto: la tua e quella del tuo amico."
User: [uploads 2 images]
Orc: "Ricevute! Swap 1→2 o 2→1?"
User: "Metti la mia faccia sulla sua foto"
Orc: "Fatto! Swap in corso..."
[passes to Technical Planner → Easel AI Face Swap]
```

### VIDEO EDITING

```
[AUTO_CAPTION]
User: "Aggiungi sottotitoli automatici a questo video"
Orc: "Auto caption! Carica il video."
User: [uploads video]
Orc: "Ricevuto! Lingua dei sottotitoli?"
User: "Italiano"
Orc: "Italiano! Stile sottotitoli? (classico, modern, TikTok-style?)"
User: "TikTok style"
Orc: "TikTok style! Genero i caption."
[passes to Technical Planner → Whisper + styling]

[COLOR_GRADING]
User: "Color grading cinematico per questo video"
Orc: "Color grading! Che look?
      [🎨 Cinematic] [🎨 Vintage] [🎨 Neon] [🎨 B&W]"
User: [clicks: Cinematic]
Orc: "Cinematic! Carica il video."
User: [uploads video]
Orc: "Ricevuto! Applico il grading cinematico."
[passes to Technical Planner]
```

### AUDIO & MUSIC

```
[GENERATE_MUSIC]
User: "Crea una musica lofi per studiare"
Orc: "Musica lofi! Quanto lunga?"
User: "5 minuti"
Orc: "5 min di lofi. Mood particolare? (chill, energico, malinconico?)"
User: "Chill"
Orc: "Super chill! Genero la traccia."
[passes to Technical Planner → Udio v4]

[VOICE_CLONE]
User: "Clona la mia voce"
Orc: "Voice clone! Carica un audio di almeno 30 secondi."
User: [uploads audio]
Orc: "Ricevuto! Cosa vuoi farmi dire con la tua voce?"
User: "Leggi questo script [invia testo]"
Orc: "Script ricevuto! Genero l'audio con la tua voce."
[passes to Technical Planner → ElevenLabs]

[TEXT_TO_PODCAST]
User: "Trasforma questo articolo in un podcast"
Orc: "Podcast! Carica l'articolo o mandami il testo."
User: [sends text]
Orc: "Ricevuto! Che tipo di voce? (maschile, femminile, neutrale)"
User: "Femminile"
Orc: "Voce femminile! Tono? (professionale, casual, entusiasta)"
User: "Casual"
Orc: "Casual! Genero il podcast."
[passes to Technical Planner → Wizper TTS + audio enhancement]
```

### DESIGN & BRANDING

```
[POSTER_DESIGN]
User: "Crea un poster per un evento"
Orc: "Poster evento! Che stile?
      [🎨 Mostra Stili Poster] [✍️ Descrivi tu]"
User: [clicks: Modern Bold]
Orc: "Modern bold! Dimmi titolo e dettagli dell'evento."
User: "Tech Conference 2025 - 15 Marzo - Milano"
Orc: "Tech Conference, Milano! Colori preferiti?"
User: "Blu scuro e arancione"
Orc: "Blu scuro + arancione! Genero il poster."
[passes to Technical Planner → Recraft v3]

[BUSINESS_CARD]
User: "Biglietto da visita per me"
Orc: "Business card! Stile?
      [🎨 Minimal] [🎨 Corporate] [🎨 Creative] [🎨 Luxury]"
User: [clicks: Minimal]
Orc: "Minimal! Dammi: nome, ruolo, contatti."
User: "Marco Rossi - UX Designer - marco@email.com - +39 123456789"
Orc: "Perfetto! Logo aziendale o solo testo?"
User: "Solo testo"
Orc: "Clean minimal! Genero il biglietto."
[passes to Technical Planner]
```

### CONTENT REPURPOSING

```
[BLOG_TO_VIDEO]
User: "Trasforma questo blog post in un video"
Orc: "Blog → Video! Mandami il link o il testo."
User: [sends URL]
Orc: "Ricevuto! Leggo l'articolo... [3s] Ok! Stile video?
      [🎨 Talking Head] [🎨 Motion Graphics] [🎨 B-roll + VO]"
User: [clicks: Motion Graphics]
Orc: "Motion graphics! Quanto lungo? (60s, 90s, 120s)"
User: "90 secondi"
Orc: "90s di motion graphics. Genero il video!"
[passes to Technical Planner → complex workflow: text extraction → script → visuals → composition]

[LONG_TO_SHORT]
User: "Estrai 5 clip da questo video lungo"
Orc: "Video lungo → 5 shorts! Carica il video."
User: [uploads 20min video]
Orc: "Ricevuto! Analizzo... [5s] Ho individuato 8 momenti forti. Te ne mostro 5 o li scelgo io?"
User: "Scegli tu i migliori"
Orc: "Perfetto! Estraggo i 5 momenti top."
[passes to Technical Planner → AI analysis + clip extraction]
```

### MULTIMEDIA PROJECTS

```
[ILLUSTRATED_BOOK]
User: "Voglio creare un libro illustrato"
Orc: "Libro illustrato! Grande progetto. Partiamo dalla storia: ce l'hai già o la genero io?"
User: "Generala tu"
Orc: "Ok! Genere? (fantasy, avventura, educativo, fiaba...)"
User: "Fiaba per bambini"
Orc: "Fiaba! Protagonista?"
User: "Un gatto curioso"
Orc: "Gatto curioso! Quante pagine? (8, 16, 24, 32)"
User: "16 pagine"
Orc: "16 pagine perfette! Stile illustrazioni?
      [🎨 Mostra Stili Illustrazione] [✍️ Descrivi tu]"
User: [clicks: Watercolor Dreamy]
Orc: "Watercolor dreamy! Bellissimo. Genero: storia + 16 illustrazioni. Ci vorrà un po'!"
[passes to Technical Planner → Multi-step workflow: Story → Storyboard → 16 Images → Book Assembly]

[COMIC_BOOK]
User: "Crea un fumetto"
Orc: "Fumetto! Storia esistente o la genero?"
User: "Generala tu"
Orc: "Ok! Genere? (supereroi, slice of life, horror, sci-fi...)"
User: "Supereroi"
Orc: "Supereroi! Quante pagine?"
User: "8 pagine"
Orc: "8 pagine! Stile fumetto?
      [🎨 American Comics] [🎨 Manga] [🎨 European BD] [🎨 Indie Style]"
User: [clicks: American Comics]
Orc: "American comics style! Genero il fumetto completo!"
[passes to Technical Planner → Complex workflow: Plot → Script → Panel Layout → Character Designs → 8 Pages → Assembly]
```

---

## 🎯 Implementation Checklist

### Phase 1: Foundation (2 hours)

- [ ] Database migration Neon → Supabase
  - [ ] Update connection string in `.env`
  - [ ] Test connection
  - [ ] Run migrations
  - [ ] Verify existing queries work
- [ ] Language detector implementation
  - [ ] Create `LanguageDetector` class
  - [ ] Add patterns for 5 languages
  - [ ] Test with sample messages
- [ ] Multilingual personality prompts
  - [ ] Create IT, EN, ES, FR, DE versions
  - [ ] Validate tone consistency

### Phase 2: Architecture (2 hours)

- [ ] Define TypeScript contracts
  - [ ] `ProjectBrief` interface
  - [ ] `ExecutionPlan` interface
  - [ ] `ProjectStatus` interface
  - [ ] `ProjectResult` interface
- [ ] Create Mock Technical Planner
  - [ ] Implement `createExecutionPlan()`
  - [ ] Implement `getProjectStatus()`
  - [ ] Add realistic delays & errors
  - [ ] Add all 94 capability → model mappings
- [ ] Integrate with Orchestrator
  - [ ] Replace direct execution with TP call
  - [ ] Handle async execution
  - [ ] Poll for status updates

### Phase 3: Context Engineering (1.5 hours)

- [ ] Implement prompt caching
  - [ ] Static prompts with `cache_control`
  - [ ] Monitor cache hit rates
- [ ] Just-in-time context loading
  - [ ] Load brief state only
  - [ ] Conditional RAG search
  - [ ] Conditional reference fetching
- [ ] Token budget manager
  - [ ] Estimate tokens
  - [ ] Enforce limits
  - [ ] Compress when needed
- [ ] Selective tool loading
  - [ ] Load tools based on intent
  - [ ] Remove unused tools per request

### Phase 4: Proactive Style Guidance (1.5 hours)

- [ ] Create `StyleProposalSystem`
  - [ ] Define rules for 94 capabilities
  - [ ] Implement `shouldPropose()`
  - [ ] Implement `generateProposal()`
- [ ] Create Style Selector client
  - [ ] HTTP client to port 3002
  - [ ] Implement `getGallery()`
  - [ ] Implement `matchStyles()`
  - [ ] Add fallback gallery
- [ ] Integrate into conversation flow
  - [ ] Detect visual intent
  - [ ] Propose gallery proactively
  - [ ] Handle user selection

### Phase 5: Error Handling (1 hour)

- [ ] Create error categories
  - [ ] USER_INPUT errors
  - [ ] SERVICE_UNAVAILABLE errors
  - [ ] RATE_LIMIT errors
  - [ ] BUSINESS_LOGIC errors
  - [ ] TECHNICAL errors
- [ ] Implement `OrchestratorErrorHandler`
  - [ ] Categorization logic
  - [ ] User-friendly messages (5 languages)
  - [ ] Recovery strategies
- [ ] Implement retry strategy
  - [ ] Exponential backoff
  - [ ] Max retries
  - [ ] Timeout handling
- [ ] Implement circuit breaker
  - [ ] Track failures
  - [ ] Open/Close logic
  - [ ] Half-open state

### Phase 6: Testing (30 min)

- [ ] Test all 94 capabilities
  - [ ] Text capabilities
  - [ ] Visual generation
  - [ ] Image editing
  - [ ] Video generation
  - [ ] Video editing
  - [ ] Audio capabilities
  - [ ] Design capabilities
  - [ ] Repurposing
  - [ ] Multimedia projects
- [ ] Test multilingual conversations
  - [ ] IT, EN, ES, FR, DE
  - [ ] Language auto-detection
  - [ ] Language switching mid-conversation
- [ ] Test error scenarios
  - [ ] Invalid input
  - [ ] Service down
  - [ ] Rate limits
  - [ ] Timeout
- [ ] Test style proposals
  - [ ] Proactive suggestions
  - [ ] User selections
  - [ ] Fallback behavior

### Phase 7: Documentation (30 min)

- [ ] Update README with:
  - [ ] All 94 capabilities
  - [ ] Language support
  - [ ] Style proposal system
  - [ ] Error handling
- [ ] Document Technical Planner interface
  - [ ] API contracts
  - [ ] Expected responses
  - [ ] Error codes
- [ ] Add conversation examples
  - [ ] All capability categories
  - [ ] Multi-turn dialogues
  - [ ] Error recovery

---

## 🚀 Expected Outcome

After implementation, the Orchestrator will:

1. **Handle ALL 94 capabilities** with correct intent detection
2. **Support 5 languages** with auto-detection
3. **Proactively propose styles** for visual content
4. **Generate complete ProjectBriefs** with all requirements
5. **Delegate to Technical Planner** (mocked but realistic)
6. **Handle errors gracefully** with user-friendly messages
7. **Maintain personality** across all languages
8. **Use Supabase** for database (PostgreSQL)
9. **Optimize context** using caching & JIT loading
10. **Work seamlessly** with existing UI

---

## 📊 Success Criteria

- ✅ All 94 capabilities correctly detected and handled
- ✅ Language auto-detection accuracy > 95%
- ✅ Style proposals for visual content in < 500ms
- ✅ Context loading < 150k tokens per request
- ✅ Cache hit rate > 80%
- ✅ Error recovery rate > 90%
- ✅ All existing functionality preserved
- ✅ Zero breaking changes to database schema
- ✅ UI works without modifications

---

## 🔗 Integration Points

```typescript
// Orchestrator → Technical Planner
POST /api/plans/create
Body: ProjectBrief
Response: ExecutionPlan

GET /api/plans/:id/status
Response: ProjectStatus

// Orchestrator → Style Selector
GET /api/styles/gallery?category=X&limit=9
Response: StyleGallery

POST /api/styles/match
Body: { message: string }
Response: { matches: StyleMatch[] }

// Orchestrator → RAG (existing)
POST /tools/rag/search
Body: { query: string, limit: number }
Response: { results: RAGResult[] }
```

---

## 🎯 Final Notes

This is a **complete refactor** that:

- Migrates database (Neon → Supabase)
- Adds multilingual support (5 languages)
- Adds proactive style guidance
- Implements Technical Planner interface
- Applies context engineering best practices
- Adds comprehensive error handling
- Covers ALL 94 capabilities

**Estimated time:** 8-10 hours  
**Criticality:** HIGH - Foundation for entire AIDA system  
**Risk:** LOW - Preserves all existing code, only extends functionality  

**Start with:** Phase 1 (Foundation) - 2 hours
**Most complex:** Phase 4 (Style Guidance) - 1.5 hours
**Most critical:** Phase 2 (Architecture) - Technical Planner integration

---

**Ready for Claude Code execution!** 🚀