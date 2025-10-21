# AIDA Architecture - Final Validated Design

**Version:** 1.0 FINAL  
**Date:** October 21, 2025  
**Status:** ✅ Validated & Ready for Implementation  
**Methodology:** AIDA-FLOW (test-first, micro-sprint, centralized orchestration)

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Architecture Pattern](#2-core-architecture-pattern)
3. [Agent Roles & Responsibilities](#3-agent-roles--responsibilities)
4. [Data Flow & Interfaces](#4-data-flow--interfaces)
5. [Workflow Execution](#5-workflow-execution)
6. [Error Handling & Fallback Strategy](#6-error-handling--fallback-strategy)
7. [State Management](#7-state-management)
8. [Performance & Optimization](#8-performance--optimization)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Appendix: Decision Rationale](#10-appendix-decision-rationale)

---

## 1. Executive Summary

### 1.1 The Problem

AIDA needs to generate complex multimedia content (videos, images, audio) through AI models, but:
- Users speak natural language, not technical specs
- Multiple AI models must be coordinated (Claude, FLUX, Veo, Kling, XTTS)
- Workflows are complex (Writer → Director → Visual → Video → Audio)
- Failures must be handled gracefully with fallbacks
- Progress must be trackable in real-time

### 1.2 The Solution

**Centralized Orchestration Pattern** with clear separation of concerns:

```
User ↔ Orchestrator (conversational interface)
           ↓
    Technical Planner (workflow coordinator)
           ↓
    Execution Agents (Writer, Director, Visual, Video, Audio)
```

**Key Design Decisions:**
- ✅ **Centralized**: Technical Planner coordinates all agents (no peer-to-peer)
- ✅ **Stateful**: Workflow state persisted to DB for crash recovery
- ✅ **Parallel execution**: Visual Creator + Audio Generator run simultaneously when possible
- ✅ **Two-level fallback**: Model-level (within agent) + Workflow-level (Technical Planner decides)
- ✅ **Prompt optimization**: Each execution agent optimizes prompts for its models

### 1.3 Benefits

| Aspect | Benefit |
|--------|---------|
| **User Experience** | Simple natural language → professional multimedia |
| **Reliability** | Two-level fallback, crash recovery, timeout protection |
| **Observability** | Centralized logging, progress tracking, state persistence |
| **Maintainability** | Clear responsibilities, separation of concerns |
| **Performance** | Parallel execution where safe, optimized prompts |
| **Scalability** | Agents are independent services, can scale horizontally |

---

## 2. Core Architecture Pattern

### 2.1 The Agency Metaphor (Critical for Understanding)

AIDA is structured like a **marketing agency**:

| Role | Agent | Responsibility |
|------|-------|----------------|
| **Client** | User | Wants result, doesn't know technical details |
| **Account Manager** | Orchestrator | Talks to client, extracts requirements |
| **Project Manager** | Technical Planner | Coordinates entire production team |
| **Copywriter** | Writer Agent | Creates script, copy, messaging |
| **Art Director** | Director Agent | Plans visual execution, storyboard |
| **Designer** | Visual Creator Agent | Generates images with AI models |
| **Video Editor** | Video Composer Agent | Assembles video from assets |
| **Sound Engineer** | Audio Generator Agent | Creates voiceover, sound |

**Golden Rule:** Project Manager (Technical Planner) coordinates everyone. Team members (agents) NEVER talk directly to each other.

### 2.2 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                            │
│  Port: 3003                                                      │
│  Role: Conversational interface, requirement extraction          │
│  Tech: Node.js + Express + Claude Sonnet 4.5                    │
│                                                                   │
│  Input: Natural language from user                               │
│  Output: ProjectBrief JSON → Technical Planner                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ POST /api/technical-planner/execute
                             │ Body: ProjectBrief
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  TECHNICAL PLANNER AGENT                         │
│  Port: 3004 (to be implemented)                                 │
│  Role: Workflow coordinator, model selector, fallback manager   │
│  Tech: Node.js + Express + PostgreSQL (state)                   │
│                                                                   │
│  Responsibilities:                                               │
│  • Analyze ProjectBrief                                          │
│  • Decide workflow (which agents to call)                        │
│  • Select AI models (FLUX, Veo, Kling, etc.)                    │
│  • Coordinate agents sequentially/parallel                       │
│  • Handle workflow-level fallbacks                               │
│  • Track progress (0-100%)                                       │
│  • Persist state to DB                                           │
│  • Enforce 10-minute timeout                                     │
│  • Assemble FinalResult                                          │
│                                                                   │
│  Input: ProjectBrief from Orchestrator                           │
│  Output: FinalResult JSON → Orchestrator                        │
└─────┬────────────┬──────────┬──────────┬──────────┬─────────────┘
      │            │          │          │          │
      │ Sequential │Sequential│Parallel  │Parallel  │
      ▼            ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  WRITER  │ │ DIRECTOR │ │ VISUAL │ │  VIDEO │ │ AUDIO  │
│  AGENT   │ │  AGENT   │ │CREATOR │ │COMPOSER│ │  GEN   │
└──────────┘ └──────────┘ └────────┘ └────────┘ └────────┘
│ Script   │ │Storyboard│ │ Images │ │ Video  │ │Voice   │
│ Claude   │ │ Claude   │ │FAL.AI  │ │FAL.AI  │ │XTTS v2 │
└──────────┘ └──────────┘ └────────┘ └────────┘ └────────┘
```

### 2.3 Communication Pattern: Centralized Hub

**CORRECT (Implemented):**
```
TP → Writer → TP ✓
TP → Director → TP ✓
TP → Visual (3x parallel) → TP ✓
TP → Video → TP ✓
TP → Audio → TP ✓
```

**WRONG (Never do this):**
```
TP → Writer → Director → Visual → Video → TP ✗
     (agents talking directly)
```

**Why centralized?**
- ✅ TP always knows current state
- ✅ TP can retry/fallback at any step
- ✅ Logging is centralized
- ✅ Progress tracking is accurate
- ✅ Timeout is enforceable
- ✅ State persistence is simple

**Trade-off:** +400ms latency (8 hops), but mitigable to ~80ms with HTTP/2 Keep-Alive.

---

## 3. Agent Roles & Responsibilities

### 3.1 Orchestrator Agent

**Status:** 88% Complete ✅

**Role:** Account Manager - User-facing conversational interface

**Responsibilities:**
- Engage in natural language conversation with user
- Extract requirements, preferences, budget constraints
- Clarify ambiguities through dialogue
- Create structured ProjectBrief JSON
- Delegate execution to Technical Planner
- Translate FinalResult back to natural language
- Present final assets to user

**Does NOT:**
- ❌ Select AI models
- ❌ Coordinate execution agents
- ❌ Make technical decisions
- ❌ Generate content directly

**Tech Stack:**
- Node.js + Express
- Claude Sonnet 4.5 (Anthropic API)
- Port 3003

**Example Interaction:**
```
User: "Voglio video Instagram 30s per scarpe eco-friendly, Gen Z"

Orchestrator:
  → [Conversation] "Perfetto! Che stile visivo preferisci? 
     Energico o elegante? Serve musica?"
  → [User responds]
  → [Extraction] Creates ProjectBrief:
     {
       content_type: 'video',
       requirements: ['Instagram 30s', 'scarpe eco', 'Gen Z'],
       quality_keywords: ['energico'],
       language: 'it'
     }
  → [Delegation] POST /api/technical-planner/execute
  → [Wait for result]
  → [Translation] "Ecco il tuo video! Durata 30s, costo €2.22 🎬"
```

---

### 3.2 Style Selector Agent

**Status:** 85% Complete ✅

**Role:** Style Gallery Curator - Provides Midjourney --sref style codes

**Responsibilities:**
- Provide curated style references from Supabase gallery
- Search styles by keyword, tags, category
- Return Midjourney --sref codes with metadata (color palettes, technical details)
- Support style browsing and selection workflow

**Integration Point:**
Called by **Orchestrator** during conversation when user wants to browse visual styles.
Results are added to `ProjectBrief.style_preferences.gallery_selected[]`.

**Tech Stack:**
- Node.js + Express + TypeScript
- Supabase (style_references table with 32+ curated styles)
- Port 3002

**API Endpoints:**
```typescript
GET  /api/styles                    // List all styles (paginated)
GET  /api/styles/:id                // Get specific style by --sref code
GET  /api/styles/search?keyword=X   // Search by keyword
GET  /api/styles/search?category=Y  // Filter by category
```

**Input (Search):**
```typescript
interface StyleSearchQuery {
  keyword?: string;        // Search in name/description
  tags?: string[];         // Filter by tags
  category?: string;       // '3d_render', 'illustration', 'photography',
                          // 'fashion_design', 'editorial', 'fine_art'
  limit?: number;          // Max results to return
}
```

**Output:**
```typescript
interface StyleResponse {
  id: string;              // Midjourney --sref code (e.g., "2813938774")
  name: string;            // "Cinematic Green Tonal Photography"
  description: string;
  category: string;
  tags: string[];
  images: {
    thumbnail: string;     // Preview image URL
    full: string[];        // Full resolution image URLs
  };
  palette: string[];       // RGB color codes extracted from style
  technicalDetails: {
    medium: string[];      // e.g., ["photography", "digital"]
    style: string[];       // e.g., ["cinematic", "moody"]
  };
}
```

**Workflow Integration:**
```
1. User: "Voglio un'immagine in stile fotografico cinematografico"
2. Orchestrator: "Ti mostro alcuni stili fotografici dalla gallery"
3. Orchestrator calls: GET /api/styles/search?keyword=cinematic&category=photography
4. Style Selector returns: [
     { id: "2813938774", name: "Cinematic Green Tonal", ... },
     { id: "1648693186", name: "Post-Apocalyptic Cinematic", ... }
   ]
5. Orchestrator presents gallery to user with thumbnails
6. User selects style → added to ProjectBrief:
   {
     style_preferences: {
       gallery_selected: [
         { id: "2813938774", requires_artistic_model: true }
       ]
     }
   }
7. Technical Planner sees requires_artistic_model: true
8. Visual Creator uses Midjourney with --sref 2813938774
```

**Fallback:**
If Style Selector unavailable, Orchestrator extracts style preferences from natural language only (no gallery browsing).

**Database Schema (Supabase):**
```sql
CREATE TABLE style_references (
  sref_code TEXT PRIMARY KEY,         -- Midjourney --sref code
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  thumbnail_url TEXT,
  image_urls TEXT[],
  rgb_palette TEXT[],
  technical_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Current Gallery:**
- 32 curated styles across 6 categories
- Categories: 3d_render, illustration, photography, fashion_design, editorial, fine_art
- All styles tested and validated with Midjourney V7

---

### 3.3 Technical Planner Agent

**Status:** 50% → Implementation Starting

**Role:** Project Manager - Workflow coordinator and technical decision maker

**Responsibilities:**

1. **Brief Analysis**
   - Parse ProjectBrief
   - Identify content type (image/video/audio)
   - Determine quality tier (fast/standard/premium)
   - Detect special requirements (audio, consistency, style)

2. **Workflow Design**
   - Decide which agents to call (Writer? Director? Visual? Video? Audio?)
   - Determine execution order (sequential vs parallel)
   - Select AI models for each step (FLUX Pro, Veo 3.1, etc.)
   - Calculate cost/time estimates

3. **Agent Coordination**
   - Call Writer → receive WriterResult
   - Call Director (with WriterResult) → receive DirectorResult
   - Call Visual Creator (parallel for all scenes) → receive VisualResult[]
   - Call Video Composer (with all assets) → receive VideoResult
   - Call Audio Generator (parallel with Video) → receive AudioResult

4. **State Management**
   - Persist workflow state to PostgreSQL after every step
   - Enable crash recovery (resume from last checkpoint)
   - Track progress (0-100%)

5. **Error Handling**
   - Implement workflow-level fallbacks
   - Retry failed steps (max 2 retries)
   - Abort on critical failures
   - Log all errors with context

6. **Final Assembly**
   - Merge video + audio
   - Calculate actual cost/time
   - Create FinalResult JSON
   - Return to Orchestrator

**Does NOT:**
- ❌ Talk to user directly
- ❌ Generate content (delegates to execution agents)
- ❌ Optimize prompts (execution agents do this)

**Tech Stack:**
- Node.js + Express + TypeScript
- PostgreSQL (state persistence via Drizzle ORM)
- Port 3004

**Key Methods:**
```typescript
class TechnicalPlannerWorkflow {
  async execute(brief: ProjectBrief): Promise<FinalResult>
  private updateProgress(percent: number, message: string)
  private callWriter(brief: ProjectBrief): Promise<WriterResult>
  private callDirector(script: Script): Promise<DirectorResult>
  private callVisual(scenes: Scene[]): Promise<VisualResult[]>
  private callVideo(assets: VideoAssets): Promise<VideoResult>
  private callAudio(script: Script): Promise<AudioResult>
  private assembleFinal(...): Promise<FinalResult>
}
```

---

### 3.4 Writer Agent

**Status:** 40% → Needs Full Implementation

**Role:** Copywriter - Script and messaging creation

**Responsibilities:**
- Receive brief from Technical Planner (tone, audience, duration, message)
- Use Claude Sonnet 4.5 to generate script
- Structure script into scenes with timing
- Write voiceover narration
- Define tone and emotional direction

**Input (from Technical Planner):**
```typescript
{
  content_type: 'video',
  duration: 30,
  tone: 'energico',
  target_audience: 'Gen Z',
  key_message: 'scarpe eco-friendly',
  language: 'it'
}
```

**Output (to Technical Planner):**
```typescript
interface WriterResult {
  success: true,
  script: {
    scenes: [
      { id: 1, duration: 10, text: "Intro impattante..." },
      { id: 2, duration: 15, text: "Features prodotto..." },
      { id: 3, duration: 5, text: "Call to action..." }
    ],
    voiceover: "Testo completo narrazione per audio...",
    tone: "energico e coinvolgente"
  },
  metadata: { cost: 0.02, time: 5, model_used: "Claude Sonnet 4.5" }
}
```

**Fallback Strategy (decided by Technical Planner):**
- If Writer fails after 2 retries → Use template script based on brief

**Tech Stack:**
- Node.js + Express
- Claude Sonnet 4.5 (Anthropic API)
- Prompt engineering for copywriting

---

### 3.5 Director Agent

**Status:** 40% → Needs Full Implementation

**Role:** Art Director - Visual planning and storyboard creation

**Responsibilities:**
- Receive script from Technical Planner
- Analyze each scene for visual requirements
- Create storyboard with visual descriptions
- Define camera movements, lighting, mood
- Describe scenes in natural language (NOT optimized prompts yet)

**Input (from Technical Planner):**
```typescript
{
  script: <WriterResult.script>,
  visual_style: 'moderno, energico',
  requirements: ['Gen Z appeal', 'eco-friendly vibe']
}
```

**Output (to Technical Planner):**
```typescript
interface DirectorResult {
  success: true,
  storyboard: {
    scenes: [
      {
        scene_id: 1,
        visual_description: "Close-up scarpa running su sfondo naturale outdoor",
        camera_movement: "slow pan destra a sinistra",
        lighting: "luce naturale solare morbida",
        mood: "energico e fresco"
      },
      { scene_id: 2, ... },
      { scene_id: 3, ... }
    ]
  },
  metadata: { cost: 0.03, time: 8, model_used: "Claude Sonnet 4.5" }
}
```

**Important:** Director writes descriptions in natural language. Visual Creator will optimize these into model-specific prompts.

**Fallback Strategy (decided by Technical Planner):**
- If Director fails after 2 retries → Generate simplified storyboard (template-based)

**Tech Stack:**
- Node.js + Express
- Claude Sonnet 4.5 (Anthropic API)
- Prompt engineering for visual planning

---

### 3.6 Visual Creator Agent

**Status:** 100% Complete ✅

**Role:** Designer - Image generation with AI models

**Responsibilities:**
- Receive visual descriptions from Technical Planner (from Director)
- Receive model selection from Technical Planner (FLUX Pro, Midjourney, etc.)
- **Optimize prompts** for specific model (FLUX syntax vs Midjourney syntax)
- Generate images via FAL.AI or KIE.AI
- Handle model-level fallbacks (FLUX Pro → FLUX Schnell → Hunyuan)
- Return image URLs with metadata

**Input (from Technical Planner):**
```typescript
// Technical Planner calls Visual Creator in PARALLEL for all scenes
Promise.all([
  callVisual({
    target_agent: 'visual_creator',
    prompt: "Close-up scarpa running su sfondo naturale outdoor", // From Director
    model_selection: {
      primary: 'FLUX Pro',
      fallbacks: ['FLUX Schnell', 'Hunyuan Image 3']
    }
  }),
  callVisual({ scene 2 }),
  callVisual({ scene 3 })
])
```

**Prompt Optimization (DONE by Visual Creator):**
```typescript
// Input from Director (natural language):
"Close-up scarpa running su sfondo naturale outdoor"

// Visual Creator optimizes for FLUX Pro:
"Professional product photography of running shoe, outdoor natural setting,
 soft sunlight from top-right, macro lens, shallow depth of field,
 8K quality, hyperrealistic details, commercial advertising style"

// Visual Creator optimizes for Midjourney:
"running shoe close-up, natural outdoor lighting, professional
 product photography, cinematic quality --ar 16:9 --style raw --q 2"
```

**Output (to Technical Planner):**
```typescript
interface VisualResult {
  success: true,
  scene_id: 1,
  image_url: "https://fal.ai/generated_image.png",
  dimensions: { width: 1024, height: 1024 },
  model_used: "FLUX Pro",  // or fallback if primary failed
  metadata: { cost: 0.055, time: 12 }
}
```

**Fallback (handled internally by Visual Creator):**
1. Try FLUX Pro
2. If fails → Try FLUX Schnell
3. If fails → Try Hunyuan Image 3
4. If all fail → Return error to Technical Planner

**Tech Stack:**
- Node.js + Express
- FAL.AI (FLUX Pro, FLUX Schnell, Seedream, Hunyuan, etc.)
- KIE.AI (Midjourney V7)
- **Already 100% implemented and tested** ✅

---

### 3.7 Video Composer Agent

**Status:** 0% → To Be Implemented

**Role:** Video Editor - Video assembly and animation

**Responsibilities:**
- Receive images from Technical Planner (from Visual Creator)
- Receive script and storyboard from Technical Planner
- Receive model selection from Technical Planner (Kling, Veo, Sora)
- **Optimize prompts** for video models (Veo syntax vs Kling syntax)
- Animate images into video clips
- Sequence clips according to script timing
- Composite final video
- Handle model-level fallbacks (Kling → Veo → MiniMax)

**Input (from Technical Planner):**
```typescript
{
  target_agent: 'video_composer',
  script: <WriterResult.script>,
  storyboard: <DirectorResult.storyboard>,
  images: [
    { scene_id: 1, url: "https://..." },
    { scene_id: 2, url: "https://..." },
    { scene_id: 3, url: "https://..." }
  ],
  model_selection: {
    primary: 'Kling 2.5 Pro',
    fallbacks: ['Veo 3.1', 'MiniMax Hailuo-02']
  }
}
```

**Prompt Optimization (DONE by Video Composer):**
```typescript
// Input from Director (natural language):
"slow pan destra a sinistra, movimento elegante"

// Video Composer optimizes for Kling:
"Smooth right-to-left pan, elegant product showcase, maintain focus,
 professional studio quality, cinematic motion"

// Video Composer optimizes for Veo:
"The running shoe in the uploaded image pans slowly from right to left,
 camera maintains steady focus, natural lighting, elegant refined movement"
```

**Process:**
1. For each scene: Animate image → video clip (5-10s)
2. Sequence clips according to script.timing
3. Add transitions if needed
4. Composite final video (30s total)
5. Return video URL

**Output (to Technical Planner):**
```typescript
interface VideoResult {
  success: true,
  video_url: "https://fal.ai/video_final.mp4",
  duration: 30,
  has_audio: false,  // Video only, audio added later
  model_used: "Kling 2.5 Pro",
  metadata: { cost: 2.10, time: 180 }
}
```

**Fallback (handled internally):**
1. Try Kling 2.5 Pro
2. If fails → Try Veo 3.1
3. If fails → Try MiniMax Hailuo-02
4. If all fail → Return error to Technical Planner

**Tech Stack:**
- Node.js + Express
- FAL.AI (Kling 2.5 Pro, Veo 3.1, Sora 2, MiniMax, etc.)
- FFmpeg (for video sequencing/composition)

---

### 3.8 Audio Generator Agent

**Status:** 0% → To Be Implemented

**Role:** Sound Engineer - Voice generation

**Responsibilities:**
- Receive script voiceover text from Technical Planner
- Receive voice preferences (tone, gender, language)
- Generate audio using XTTS v2 (internal, free)
- Return audio file URL

**Input (from Technical Planner):**
```typescript
{
  target_agent: 'audio_generator',
  script: "Queste scarpe sono realizzate con materiali riciclati...",
  voice_profile: 'professional_female',
  tone: 'energico',
  language: 'it'
}
```

**Output (to Technical Planner):**
```typescript
interface AudioResult {
  success: true,
  audio_url: "https://storage/audio.mp3",
  duration: 28,  // seconds
  metadata: { cost: 0.00, time: 8, model_used: "XTTS v2" }  // FREE
}
```

**Fallback:**
- XTTS v2 is internal and reliable
- If fails → Return error (no automatic fallback, this is a bug to fix)

**Tech Stack:**
- Node.js + Express
- XTTS v2 (internal Coqui TTS)
- 29+ languages supported

---

## 4. Data Flow & Interfaces

### 4.1 ProjectBrief (Orchestrator → Technical Planner)

```typescript
interface ProjectBrief {
  // Identifiers
  id: string;                    // Brief ID (UUID)
  user_id: string;               // User who created request
  conversation_id: string;       // Orchestrator conversation ID
  
  // Content specifications
  content_type: 'image' | 'video' | 'audio' | 'multi_asset';
  requirements: string[];        // ["Instagram 30s", "scarpe eco", "Gen Z"]
  
  // Quality (RAW - Technical Planner interprets)
  quality_keywords: string[];    // ["energico", "professionale", "cinematic"]
  
  // Style preferences
  style_preferences?: {
    gallery_selected?: string[];       // Style gallery IDs if selected
    custom_description?: string;       // Free-text style description
  };
  
  // Budget constraints
  budget_constraints?: {
    type: 'hard_limit' | 'soft_preference' | 'none';
    max_cost?: number;                 // Max dollars
    priority?: 'cost' | 'quality' | 'speed';
  };
  
  // Context
  language: string;              // 'it', 'en', 'es', etc.
  created_at: Date;
}
```

**Example:**
```json
{
  "id": "brief_1729517234567",
  "user_id": "user_123",
  "conversation_id": "conv_456",
  "content_type": "video",
  "requirements": [
    "Instagram 30 secondi",
    "scarpe eco-friendly",
    "target Gen Z",
    "stile energico"
  ],
  "quality_keywords": ["energico", "professionale"],
  "style_preferences": {
    "custom_description": "moderno, colori verdi"
  },
  "budget_constraints": {
    "type": "soft_preference",
    "max_cost": 3.0,
    "priority": "quality"
  },
  "language": "it",
  "created_at": "2025-10-21T14:30:00Z"
}
```

---

### 4.2 FinalResult (Technical Planner → Orchestrator)

```typescript
interface FinalResult {
  // Status
  status: 'completed' | 'failed' | 'partial';
  
  // Output assets
  video_url?: string;            // Final video URL (if video project)
  image_urls?: string[];         // Final images (if image project)
  audio_url?: string;            // Final audio (if audio project)
  thumbnail_url?: string;        // Preview thumbnail
  
  // Metadata
  metadata: {
    duration?: number;           // seconds (for video/audio)
    resolution?: string;         // "1080x1920" (Instagram format)
    has_audio?: boolean;
    cost: {
      estimated: number;         // Initial estimate
      actual: number;            // Actual cost
    };
    time: {
      estimated: number;         // seconds estimated
      actual: number;            // seconds actual
    };
    agents_used: string[];       // ['writer', 'director', 'visual', 'video']
    models_used: string[];       // ['Claude', 'FLUX Pro', 'Kling 2.5']
  };
  
  // Detailed assets (optional, for debugging/editing)
  assets?: {
    script?: WriterResult;
    storyboard?: DirectorResult;
    images?: VisualResult[];
    raw_video?: VideoResult;
    audio?: AudioResult;
  };
  
  // Error details (if failed or partial)
  error?: {
    agent: string;               // Which agent failed
    reason: string;              // Error message
    timestamp: Date;
  };
  
  // Progress info
  progress?: {
    current_step: string;        // "visual_generation"
    percent: number;             // 0-100
    message: string;             // "Generating images..."
  };
}
```

**Example (Success):**
```json
{
  "status": "completed",
  "video_url": "https://storage.aida.ai/video_final_abc123.mp4",
  "thumbnail_url": "https://storage.aida.ai/thumb_abc123.jpg",
  "metadata": {
    "duration": 30,
    "resolution": "1080x1920",
    "has_audio": true,
    "cost": {
      "estimated": 2.00,
      "actual": 2.22
    },
    "time": {
      "estimated": 180,
      "actual": 213
    },
    "agents_used": ["writer", "director", "visual", "video", "audio"],
    "models_used": ["Claude Sonnet 4.5", "FLUX Pro", "Kling 2.5 Pro", "XTTS v2"]
  }
}
```

---

### 4.3 Agent-Specific Interfaces

#### WriterResult
```typescript
interface WriterResult {
  success: boolean;
  script: {
    scenes: Array<{
      id: number;
      duration: number;          // seconds
      text: string;              // Scene description
    }>;
    voiceover: string;           // Full narration text
    tone: string;                // "energico", "professionale", etc.
  };
  metadata: {
    cost: number;
    time: number;                // seconds
    model_used: string;          // "Claude Sonnet 4.5"
  };
  error?: string;
}
```

#### DirectorResult
```typescript
interface DirectorResult {
  success: boolean;
  storyboard: {
    scenes: Array<{
      scene_id: number;
      visual_description: string;      // Natural language description
      camera_movement: string;         // "slow pan", "static", etc.
      lighting: string;                // "natural outdoor", "studio"
      mood: string;                    // "energico", "elegante"
    }>;
  };
  metadata: {
    cost: number;
    time: number;
    model_used: string;
  };
  error?: string;
}
```

#### VisualResult
```typescript
interface VisualResult {
  success: boolean;
  scene_id: number;
  image_url: string;
  dimensions: {
    width: number;
    height: number;
  };
  format: 'PNG' | 'JPEG' | 'WebP';
  model_used: string;              // "FLUX Pro" or fallback model
  metadata: {
    cost: number;
    time: number;
    fallback_used?: boolean;       // true if primary failed
  };
  error?: string;
}
```

#### VideoResult
```typescript
interface VideoResult {
  success: boolean;
  video_url: string;
  duration: number;                // seconds
  resolution: string;              // "1080x1920"
  has_audio: boolean;              // false (only visuals)
  model_used: string;              // "Kling 2.5 Pro"
  metadata: {
    cost: number;
    time: number;
    fallback_used?: boolean;
  };
  error?: string;
}
```

#### AudioResult
```typescript
interface AudioResult {
  success: boolean;
  audio_url: string;
  duration: number;                // seconds
  format: 'MP3' | 'WAV';
  model_used: string;              // "XTTS v2"
  metadata: {
    cost: number;                  // Always 0 (XTTS is free)
    time: number;
  };
  error?: string;
}
```

---

## 5. Workflow Execution

### 5.1 Complete Sequence Diagram (Representative Workflow)

**Use Case:** "Video Instagram 30s per scarpe eco-friendly, Gen Z, energico"

```
USER: "Video 30s Instagram scarpe eco Gen Z"
  ↓
┌────────────────┐
│  ORCHESTRATOR  │
└────────┬───────┘
         │ 1. Conversation
         │    Q: "Stile visivo? Musica?"
         │    A: "Moderno, sì musica"
         │
         │ 2. Extract ProjectBrief
         │    {
         │      content_type: 'video',
         │      requirements: ['Instagram 30s', 'scarpe eco', 'Gen Z'],
         │      quality_keywords: ['energico']
         │    }
         │
         │ 3. POST /api/technical-planner/execute
         │    Body: ProjectBrief
         │
         ▼
┌──────────────────────┐
│  TECHNICAL PLANNER   │
└──────────┬───────────┘
           │
           │ 4. Analyze Brief
           │    • content_type=video → need full video workflow
           │    • 30s + multiple requirements → need Writer
           │    • quality=energico → tier=standard
           │    • Decide: Writer → Director → Visual → Video → Audio
           │
           │ 5. Initialize State
           │    state = {
           │      brief: <ProjectBrief>,
           │      progress: 0,
           │      currentStep: 'writer'
           │    }
           │    saveState() → PostgreSQL
           │
           │ ========================================
           │ STEP 1: WRITER AGENT
           │ ========================================
           │
           │ 6. updateProgress(10, "Starting Writer...")
           │
           │ 7. POST /api/agents/writer/execute
           │    Body: {
           │      content_type: 'video',
           │      duration: 30,
           │      tone: 'energico',
           │      target_audience: 'Gen Z',
           │      key_message: 'scarpe eco-friendly'
           │    }
           │
           ▼
      ┌────────┐
      │ WRITER │
      └───┬────┘
          │ 8. Generate script with Claude
          │    Prompt: "Crea script Instagram 30s, 3 scene, energico, Gen Z..."
          │
          │ 9. Return WriterResult
          │    {
          │      success: true,
          │      script: {
          │        scenes: [
          │          {id: 1, duration: 10, text: "Intro wow scarpe verdi"},
          │          {id: 2, duration: 15, text: "Features eco materiali"},
          │          {id: 3, duration: 5, text: "CTA acquista ora"}
          │        ],
          │        voiceover: "Queste scarpe sono...",
          │        tone: "energico"
          │      },
          │      metadata: {cost: 0.02, time: 5}
          │    }
          │
          ▼
┌──────────────────────┐
│  TECHNICAL PLANNER   │
└──────────┬───────────┘
           │
           │ 10. Receive WriterResult
           │     state.writerResult = result
           │     saveState()
           │
           │ ========================================
           │ STEP 2: DIRECTOR AGENT
           │ ========================================
           │
           │ 11. updateProgress(30, "Starting Director...")
           │
           │ 12. POST /api/agents/director/execute
           │     Body: {
           │       script: <WriterResult.script>,
           │       visual_style: 'moderno, energico',
           │       requirements: ['Gen Z', 'eco vibe']
           │     }
           │
           ▼
      ┌──────────┐
      │ DIRECTOR │
      └─────┬────┘
            │ 13. Create storyboard with Claude
            │     Prompt: "Dato script [...], crea piano visivo..."
            │
            │ 14. Return DirectorResult
            │     {
            │       success: true,
            │       storyboard: {
            │         scenes: [
            │           {
            │             scene_id: 1,
            │             visual_description: "Close-up scarpa running verde outdoor",
            │             camera_movement: "slow pan",
            │             lighting: "natural sunlight",
            │             mood: "energico fresco"
            │           },
            │           {scene_id: 2, ...},
            │           {scene_id: 3, ...}
            │         ]
            │       },
            │       metadata: {cost: 0.03, time: 8}
            │     }
            │
            ▼
┌──────────────────────┐
│  TECHNICAL PLANNER   │
└──────────┬───────────┘
           │
           │ 15. Receive DirectorResult
           │     state.directorResult = result
           │     saveState()
           │
           │ ========================================
           │ STEP 3: VISUAL CREATOR (PARALLEL)
           │ ========================================
           │
           │ 16. updateProgress(50, "Generating images...")
           │
           │ 17. Parallel calls to Visual Creator (3x)
           │     Promise.all([
           │       POST /api/agents/visual-creator/execute {
           │         prompt: "Close-up scarpa running verde outdoor",
           │         model_selection: {
           │           primary: 'FLUX Pro',
           │           fallbacks: ['FLUX Schnell']
           │         }
           │       },
           │       POST /api/agents/visual-creator/execute {scene 2},
           │       POST /api/agents/visual-creator/execute {scene 3}
           │     ])
           │
           ▼          ▼          ▼
      ┌────────┐ ┌────────┐ ┌────────┐
      │VISUAL 1│ │VISUAL 2│ │VISUAL 3│
      └───┬────┘ └───┬────┘ └───┬────┘
          │          │          │
          │ 18. Each Visual Creator:
          │     • Optimizes prompt for FLUX Pro
          │     • Calls FAL.AI
          │     • Returns image URL
          │
          │ 19. Return VisualResult (each)
          │     {
          │       success: true,
          │       scene_id: 1,
          │       image_url: "https://fal.ai/img1.png",
          │       model_used: "FLUX Pro",
          │       metadata: {cost: 0.055, time: 12}
          │     }
          │
          ▼          ▼          ▼
┌──────────────────────┐
│  TECHNICAL PLANNER   │
└──────────┬───────────┘
           │
           │ 20. Receive 3 VisualResult[]
           │     state.visualResults = [result1, result2, result3]
           │     saveState()
           │
           │ ========================================
           │ STEP 4: VIDEO COMPOSER & AUDIO (PARALLEL)
           │ ========================================
           │
           │ 21. updateProgress(70, "Creating video...")
           │
           │ 22. Start PARALLEL:
           │     Promise.all([
           │       POST /api/agents/video-composer/execute {
           │         script: <WriterResult>,
           │         storyboard: <DirectorResult>,
           │         images: [img1, img2, img3],
           │         model_selection: {
           │           primary: 'Kling 2.5 Pro',
           │           fallbacks: ['Veo 3.1']
           │         }
           │       },
           │       POST /api/agents/audio-generator/execute {
           │         script: <WriterResult.voiceover>,
           │         voice_profile: 'professional_female',
           │         tone: 'energico'
           │       }
           │     ])
           │
           ▼                    ▼
      ┌────────────┐      ┌────────┐
      │VIDEO COMP. │      │ AUDIO  │
      └──────┬─────┘      └───┬────┘
             │                │
             │ 23. Video:     │ 24. Audio:
             │ • Optimize     │ • Generate with
             │   prompts      │   XTTS v2
             │   for Kling    │ • Return MP3
             │ • Animate      │
             │   images       │
             │ • Sequence     │
             │ • Return       │
             │   video URL    │
             │                │
             │ 25. Return     │ 26. Return
             │ VideoResult    │ AudioResult
             │ {              │ {
             │   video_url,   │   audio_url,
             │   duration:30, │   duration:28,
             │   cost: 2.10   │   cost: 0.00
             │ }              │ }
             │                │
             ▼                ▼
┌──────────────────────┐
│  TECHNICAL PLANNER   │
└──────────┬───────────┘
           │
           │ 27. Receive VideoResult + AudioResult
           │     state.videoResult = videoResult
           │     state.audioResult = audioResult
           │     saveState()
           │
           │ ========================================
           │ STEP 5: FINAL ASSEMBLY
           │ ========================================
           │
           │ 28. updateProgress(95, "Final assembly...")
           │
           │ 29. Merge video + audio
           │     • Use FFmpeg to combine
           │     • Upload final video
           │     • Generate thumbnail
           │
           │ 30. Calculate totals
           │     total_cost = 0.02 + 0.03 + (0.055*3) + 2.10 + 0.00 = 2.315
           │     total_time = 5 + 8 + 12 + 180 + 8 = 213s
           │
           │ 31. Create FinalResult
           │     {
           │       status: 'completed',
           │       video_url: "https://storage/final.mp4",
           │       thumbnail_url: "https://storage/thumb.jpg",
           │       metadata: {
           │         duration: 30,
           │         cost: {estimated: 2.00, actual: 2.32},
           │         time: {estimated: 180, actual: 213},
           │         agents_used: ['writer','director','visual','video','audio']
           │       }
           │     }
           │
           │ 32. updateProgress(100, "Completed!")
           │
           │ 33. Return FinalResult to Orchestrator
           │
           ▼
┌────────────────┐
│  ORCHESTRATOR  │
└────────┬───────┘
         │
         │ 34. Receive FinalResult
         │     Translate to natural language
         │
         │ 35. Present to user:
         │     "Ecco il tuo video Instagram! 🎬
         │      Durata: 30s
         │      Costo: €2.32
         │      Tempo: 3 minuti 33 secondi
         │      [Thumbnail preview]
         │      [Download Video Button]"
         │
         ▼
      ┌──────┐
      │ USER │
      └──────┘
      Views final video
```

### 5.2 Parallelization Strategy

**Sequential (must wait):**
- Writer → Director (Director needs script)
- Director → Visual (Visual needs scene descriptions)
- Director → Video (Video needs storyboard)

**Parallel (can run simultaneously):**
- Visual Creator: All 3 scenes in parallel
  ```typescript
  Promise.all([
    callVisual(scene1),
    callVisual(scene2),
    callVisual(scene3)
  ])
  ```
  **Time saved:** 30 seconds (15s each vs 45s total)

- Video Composer + Audio Generator:
  ```typescript
  Promise.all([
    callVideo(...),
    callAudio(...)
  ])
  ```
  **Time saved:** 8 seconds (audio overlaps with video)

**Total time with parallelization:**
- Sequential: ~250 seconds
- Parallel: ~213 seconds
- **Saved: 37 seconds (15% faster)**

---

## 6. Error Handling & Fallback Strategy

### 6.1 Two-Level Fallback System

#### Level 1: Model Fallback (Within Execution Agent)

**Handled by:** Execution agent itself (Visual Creator, Video Composer, etc.)  
**Decided by:** Technical Planner (passes fallback_models[] in ExecutionPlan)  
**Visible to TP:** No (silent recovery)

**Example (Visual Creator):**
```typescript
async execute(plan: ExecutionPlan): Promise<VisualResult> {
  // Try primary model
  try {
    return await this.generate(plan.primary_model);
  } catch (error) {
    // Auto-fallback to next model
    for (const fallback of plan.fallback_models) {
      try {
        return await this.generate(fallback);
      } catch {}
    }
    // All models failed
    throw new Error('All image models failed');
  }
}
```

**Models:**
- FLUX Pro → FLUX Schnell → Hunyuan Image 3
- Kling 2.5 Pro → Veo 3.1 → MiniMax Hailuo-02
- Veo 3.1 → Sora 2 → Kling 2.5 Pro

**Result:** If fallback succeeds, `VisualResult.model_used` shows actual model. User never knows primary failed.

#### Level 2: Workflow Fallback (Decided by Technical Planner)

**Handled by:** Technical Planner  
**Triggered when:** Entire agent fails (all model fallbacks exhausted)  
**Visible to TP:** Yes (explicit decision)

**Strategies by agent:**

**Writer fails:**
```typescript
if (!writerResult.success) {
  // Retry once
  writerResult = await this.callWriter(brief);
  
  if (!writerResult.success) {
    // Use template script
    writerResult = this.generateTemplateScript(brief);
    // Continue workflow with template
  }
}
```

**Director fails:**
```typescript
if (!directorResult.success) {
  // Retry once
  directorResult = await this.callDirector(script);
  
  if (!directorResult.success) {
    // Generate simplified storyboard
    directorResult = this.generateSimpleStoryboard(script);
    // Continue with basic storyboard
  }
}
```

**Visual Creator fails (one scene):**
```typescript
if (!visualResult.success) {
  // Retry THAT scene once
  visualResult = await this.callVisual(scene);
  
  if (!visualResult.success) {
    // ABORT workflow
    return {
      status: 'failed',
      error: {
        agent: 'visual_creator',
        reason: 'Cannot generate images',
        timestamp: new Date()
      }
    };
  }
}
```
**Rationale:** Cannot proceed without images.

**Video Composer fails:**
```typescript
if (!videoResult.success) {
  // Retry once with different model
  videoResult = await this.callVideo({...assets, force_fallback: true});
  
  if (!videoResult.success) {
    // ABORT workflow
    return {status: 'failed', error: {...}};
  }
}
```

**Audio Generator fails:**
```typescript
if (!audioResult.success) {
  // XTTS is internal, failure is unusual
  // Log error and abort (this is a bug to investigate)
  return {
    status: 'failed',
    error: {
      agent: 'audio_generator',
      reason: 'XTTS internal error (investigate)',
      timestamp: new Date()
    }
  };
}
```

### 6.2 Retry Policy

**Per-agent retry:**
- Max 2 retries per agent call
- Exponential backoff: 1s, 2s
- After 2 failures → workflow-level fallback

**Global timeout:**
- 10 minutes maximum for entire workflow
- Enforced at Technical Planner level
- If timeout → abort with partial results (if any)

```typescript
async execute(brief: ProjectBrief): Promise<FinalResult> {
  const timeout = setTimeout(() => {
    throw new Error('Workflow timeout (10 minutes)');
  }, 10 * 60 * 1000);
  
  try {
    // Execute workflow...
    return result;
  } catch (error) {
    if (error.message.includes('timeout')) {
      return {
        status: 'failed',
        error: {
          agent: 'technical_planner',
          reason: 'Workflow exceeded 10 minute timeout',
          timestamp: new Date()
        }
      };
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

---

## 7. State Management

### 7.1 Why Stateful?

**Reasons for stateful Technical Planner:**
1. **Crash Recovery:** If Node.js crashes at 60%, can resume from last checkpoint
2. **Progress Tracking:** Orchestrator can query current state
3. **Debugging:** Full audit trail of what happened when
4. **Cost Tracking:** Accumulate costs incrementally
5. **Long-running workflows:** 10 minute workflows need persistence

### 7.2 WorkflowState Interface

```typescript
interface WorkflowState {
  // Identifiers
  id: string;                          // Workflow ID (UUID)
  brief_id: string;                    // Original ProjectBrief ID
  user_id: string;
  
  // Current status
  status: 'running' | 'completed' | 'failed' | 'paused';
  current_step: 'writer' | 'director' | 'visual' | 'video' | 'audio' | 'assembly';
  progress: number;                    // 0-100
  current_message: string;             // "Generating images..."
  
  // Timing
  started_at: Date;
  last_updated: Date;
  estimated_completion?: Date;
  
  // Input
  brief: ProjectBrief;
  
  // Intermediate results
  writer_result?: WriterResult;
  director_result?: DirectorResult;
  visual_results?: VisualResult[];
  video_result?: VideoResult;
  audio_result?: AudioResult;
  
  // Accumulated metrics
  total_cost_so_far: number;
  total_time_so_far: number;
  agents_called: string[];
  
  // Error tracking
  errors: Array<{
    step: string;
    error: string;
    timestamp: Date;
    recovered: boolean;
  }>;
}
```

### 7.3 State Persistence (PostgreSQL)

**Table: workflow_states**
```sql
CREATE TABLE workflow_states (
  id UUID PRIMARY KEY,
  brief_id UUID NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_step VARCHAR(50),
  progress INTEGER DEFAULT 0,
  current_message TEXT,
  started_at TIMESTAMP NOT NULL,
  last_updated TIMESTAMP NOT NULL,
  brief JSONB NOT NULL,
  writer_result JSONB,
  director_result JSONB,
  visual_results JSONB,
  video_result JSONB,
  audio_result JSONB,
  total_cost_so_far DECIMAL(10,4),
  total_time_so_far INTEGER,
  agents_called TEXT[],
  errors JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_started_at (started_at)
);
```

**Save after every step:**
```typescript
private async saveState() {
  await db.insert(workflowStates)
    .values({
      id: this.state.id,
      brief_id: this.state.brief_id,
      status: this.state.status,
      current_step: this.state.current_step,
      progress: this.state.progress,
      current_message: this.state.current_message,
      // ... all fields
      last_updated: new Date()
    })
    .onConflictDoUpdate({
      target: workflowStates.id,
      set: { /* updated fields */ }
    });
}
```

### 7.4 Crash Recovery

**Scenario:** Technical Planner crashes at 60% (after Visual Creator, before Video Composer)

**Recovery process:**
```typescript
class TechnicalPlannerWorkflow {
  static async resume(workflowId: string): Promise<FinalResult> {
    // 1. Load state from DB
    const state = await db.select()
      .from(workflowStates)
      .where(eq(workflowStates.id, workflowId));
    
    if (!state || state.status === 'completed') {
      throw new Error('Cannot resume: workflow not found or already completed');
    }
    
    // 2. Restore workflow instance
    const workflow = new TechnicalPlannerWorkflow();
    workflow.state = state;
    
    // 3. Resume from last checkpoint
    switch (state.current_step) {
      case 'writer':
        return await workflow.executeFromWriter();
      case 'director':
        return await workflow.executeFromDirector();
      case 'visual':
        return await workflow.executeFromVisual();
      case 'video':
        return await workflow.executeFromVideo();  // ← Resume here
      case 'audio':
        return await workflow.executeFromAudio();
      case 'assembly':
        return await workflow.executeAssembly();
    }
  }
  
  private async executeFromVideo(): Promise<FinalResult> {
    // Already have: writer_result, director_result, visual_results
    // Need to call: Video Composer, Audio Generator, Assembly
    
    this.updateProgress(70, "Resuming: Creating video...");
    
    const [videoResult, audioResult] = await Promise.all([
      this.callVideo({
        script: this.state.writer_result,
        storyboard: this.state.director_result,
        images: this.state.visual_results
      }),
      this.callAudio(this.state.writer_result.script)
    ]);
    
    // Continue normally...
    return this.assembleFinal(videoResult, audioResult);
  }
}
```

**Auto-resume on startup:**
```typescript
// Technical Planner service startup
app.listen(3004, async () => {
  console.log('Technical Planner started on port 3004');
  
  // Check for crashed workflows
  const crashedWorkflows = await db.select()
    .from(workflowStates)
    .where(and(
      eq(workflowStates.status, 'running'),
      lt(workflowStates.last_updated, new Date(Date.now() - 15 * 60 * 1000))  // 15 min ago
    ));
  
  if (crashedWorkflows.length > 0) {
    console.log(`Found ${crashedWorkflows.length} crashed workflows, resuming...`);
    for (const wf of crashedWorkflows) {
      TechnicalPlannerWorkflow.resume(wf.id).catch(console.error);
    }
  }
});
```

---

## 8. Performance & Optimization

### 8.1 Latency Analysis

**Current Architecture (Centralized):**
```
Hop 1: Orchestrator → TP          (50ms)
Hop 2: TP → Writer                 (50ms)
Hop 3: Writer → TP                 (50ms)
Hop 4: TP → Director               (50ms)
Hop 5: Director → TP               (50ms)
Hop 6: TP → Visual (x3 parallel)   (50ms)
Hop 7: Visual → TP (x3 parallel)   (50ms)
Hop 8: TP → Video                  (50ms)
Hop 9: Video → TP                  (50ms)
Hop 10: TP → Audio (parallel)      (50ms)
Hop 11: Audio → TP (parallel)      (50ms)
Hop 12: TP → Orchestrator          (50ms)

TOTAL: 12 hops × 50ms = 600ms overhead
```

**But:** Actual workflow time is dominated by AI generation:
- Writer (Claude): 5 seconds
- Director (Claude): 8 seconds
- Visual (FLUX): 12 seconds each × 3 = 36 seconds (parallel, so 12s actual)
- Video (Kling): 180 seconds
- Audio (XTTS): 8 seconds (parallel with video)

**Total:** ~213 seconds

**Overhead:** 600ms / 213,000ms = **0.28%** (negligible!)

### 8.2 Optimization Strategies

#### Phase 1: HTTP/2 + Keep-Alive (Immediate, 20 min effort)

```typescript
// Enable HTTP/2 and connection pooling
const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10
});

const axiosInstance = axios.create({
  httpAgent: httpAgent,
  timeout: 30000
});

// Latency: 50ms → 10ms per hop
// New total: 12 × 10ms = 120ms (saving: 480ms)
```

**Benefit:** -480ms (80% reduction in network overhead)  
**Effort:** 1 micro-sprint (20 minutes)  
**Trade-off:** None, only benefits

#### Phase 2: Co-location (Medium term, if needed)

```yaml
# Deploy all agents in same datacenter/VPC
Orchestrator + Technical Planner + All Agents → Same AWS region

# Latency: 50ms → 2ms (localhost or same subnet)
# New total: 12 × 2ms = 24ms

# Benefit: -576ms
# Effort: Deployment configuration
# Trade-off: Less fault isolation (but acceptable for AIDA scale)
```

#### Phase 3: Request Batching (Future optimization)

```typescript
// Instead of:
const v1 = await callVisual(scene1);
const v2 = await callVisual(scene2);
const v3 = await callVisual(scene3);

// Batch in single HTTP request:
const results = await callVisualBatch([scene1, scene2, scene3]);

// Saves: 4 hops (2 fewer round-trips)
```

**When:** If latency becomes issue (unlikely)

### 8.3 Bottleneck Analysis

**True bottlenecks (in order):**
1. **Video generation (Kling):** 180 seconds → Use faster models (MiniMax) for drafts
2. **Visual generation (FLUX):** 12 seconds each → Already parallelized
3. **Claude calls (Writer/Director):** 5-8 seconds → Cannot optimize much
4. **Audio generation (XTTS):** 8 seconds → Already fast and free

**Network hops:** 0.6 seconds → NOT a bottleneck

**Focus optimization on:** Model selection, not network.

---

## 9. Implementation Roadmap

### 9.1 Micro-Sprint Breakdown (8 sprints, ~5 hours total)

#### MS-025: Technical Planner Core (40 min)
**Goal:** Basic TechnicalPlannerWorkflow class with state management

**Tasks:**
- Create `TechnicalPlannerWorkflow` class
- Implement `execute(brief: ProjectBrief)` skeleton
- Add state management (saveState, loadState)
- Add progress tracking (updateProgress method)
- PostgreSQL schema for workflow_states

**Test:**
```typescript
describe('TechnicalPlannerWorkflow', () => {
  it('should initialize state from ProjectBrief', () => {
    const workflow = new TechnicalPlannerWorkflow();
    const state = workflow.initState(mockBrief);
    expect(state.progress).toBe(0);
    expect(state.current_step).toBe('writer');
  });
  
  it('should persist state to DB', async () => {
    await workflow.saveState();
    const loaded = await loadState(workflow.state.id);
    expect(loaded).toEqual(workflow.state);
  });
});
```

**Acceptance:**
- ✅ Class structure exists
- ✅ State persists to PostgreSQL
- ✅ Tests green

---

#### MS-026: Writer Agent Integration (40 min)
**Goal:** Call Writer agent, handle result and fallback

**Tasks:**
- Implement `callWriter(brief)` method
- Handle WriterResult success/failure
- Implement template script fallback
- Add retry logic (max 2)
- Update workflow state

**Test:**
```typescript
describe('Writer Integration', () => {
  it('should call Writer and receive script', async () => {
    const result = await workflow.callWriter(mockBrief);
    expect(result.success).toBe(true);
    expect(result.script.scenes).toHaveLength(3);
  });
  
  it('should use template on Writer failure', async () => {
    mockWriterToFail();
    const result = await workflow.callWriter(mockBrief);
    expect(result.metadata.source).toBe('template_fallback');
  });
});
```

**Acceptance:**
- ✅ Writer agent called successfully
- ✅ Fallback to template works
- ✅ State updated correctly
- ✅ Tests green

---

#### MS-027: Director Agent Integration (40 min)
**Goal:** Call Director with Writer output, handle storyboard

**Tasks:**
- Implement `callDirector(script)` method
- Pass WriterResult → Director
- Handle DirectorResult
- Implement simplified storyboard fallback
- Update state

**Test:**
```typescript
describe('Director Integration', () => {
  it('should pass Writer script to Director', async () => {
    const writerResult = mockWriterResult();
    const directorResult = await workflow.callDirector(writerResult.script);
    expect(directorResult.storyboard.scenes).toHaveLength(3);
  });
  
  it('should generate simple storyboard on failure', async () => {
    mockDirectorToFail();
    const result = await workflow.callDirector(mockScript);
    expect(result.metadata.source).toBe('simplified_fallback');
  });
});
```

**Acceptance:**
- ✅ Director receives Writer output
- ✅ Storyboard generated
- ✅ Fallback works
- ✅ Tests green

---

#### MS-028: Visual Creator Parallel Loop (40 min)
**Goal:** Call Visual Creator for all scenes in parallel

**Tasks:**
- Implement `callVisual(scenes[])` method
- Use Promise.all for parallelization
- Handle VisualResult[] array
- Aggregate results
- Handle partial failures (retry individual scenes)

**Test:**
```typescript
describe('Visual Creator Integration', () => {
  it('should generate images for all scenes in parallel', async () => {
    const scenes = mockDirectorResult().storyboard.scenes;
    const results = await workflow.callVisual(scenes);
    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);
  });
  
  it('should retry failed scene individually', async () => {
    mockVisualToFailOnce(sceneId: 2);
    const results = await workflow.callVisual(scenes);
    expect(results[1].metadata.retries).toBe(1);
  });
});
```

**Acceptance:**
- ✅ 3 scenes processed in parallel
- ✅ Individual retry works
- ✅ All images received
- ✅ Tests green

---

#### MS-029: Video Composer Integration (40 min)
**Goal:** Call Video Composer with all assets

**Tasks:**
- Implement `callVideo(assets)` method
- Pass script + storyboard + images
- Handle VideoResult
- Implement model fallback chain
- Update state

**Test:**
```typescript
describe('Video Composer Integration', () => {
  it('should create video from images and script', async () => {
    const assets = {
      script: mockWriterResult().script,
      storyboard: mockDirectorResult().storyboard,
      images: mockVisualResults()
    };
    const result = await workflow.callVideo(assets);
    expect(result.video_url).toBeDefined();
    expect(result.duration).toBe(30);
  });
});
```

**Acceptance:**
- ✅ Video Composer receives all assets
- ✅ Video generated
- ✅ Tests green

---

#### MS-030: Audio Generator + Parallel Execution (40 min)
**Goal:** Call Audio Generator in parallel with Video Composer

**Tasks:**
- Implement `callAudio(script)` method
- Refactor to run Video + Audio in parallel (Promise.all)
- Handle AudioResult
- Update state for both results

**Test:**
```typescript
describe('Audio Integration', () => {
  it('should run Video and Audio in parallel', async () => {
    const start = Date.now();
    const [video, audio] = await Promise.all([
      workflow.callVideo(assets),
      workflow.callAudio(script)
    ]);
    const elapsed = Date.now() - start;
    
    // Should take ~180s (video time), NOT 188s (video + audio sequential)
    expect(elapsed).toBeLessThan(185000);
  });
});
```

**Acceptance:**
- ✅ Parallel execution works
- ✅ Audio generated
- ✅ Time saved vs sequential
- ✅ Tests green

---

#### MS-031: Final Assembly (40 min)
**Goal:** Merge video + audio, create FinalResult

**Tasks:**
- Implement `assembleFinal(video, audio)` method
- Use FFmpeg to merge video + audio
- Calculate total cost/time
- Create FinalResult JSON
- Upload final video
- Generate thumbnail

**Test:**
```typescript
describe('Final Assembly', () => {
  it('should merge video and audio', async () => {
    const final = await workflow.assembleFinal(mockVideo, mockAudio);
    expect(final.video_url).toContain('final');
    expect(final.metadata.has_audio).toBe(true);
  });
  
  it('should calculate accurate cost', async () => {
    const final = await workflow.assembleFinal(video, audio);
    const expected = 0.02 + 0.03 + (0.055*3) + 2.10 + 0.00;
    expect(final.metadata.cost.actual).toBeCloseTo(expected, 2);
  });
});
```

**Acceptance:**
- ✅ Video + audio merged
- ✅ FinalResult complete
- ✅ Cost/time accurate
- ✅ Tests green

---

#### MS-032: Error Handling & Timeout (40 min)
**Goal:** Implement comprehensive error handling

**Tasks:**
- Add global 10-minute timeout
- Implement per-step retry logic (max 2)
- Add workflow-level fallbacks
- Log all errors with context
- Return appropriate error in FinalResult

**Test:**
```typescript
describe('Error Handling', () => {
  it('should timeout after 10 minutes', async () => {
    mockSlowWorkflow(15 * 60 * 1000);  // 15 min
    const result = await workflow.execute(brief);
    expect(result.status).toBe('failed');
    expect(result.error.reason).toContain('timeout');
  });
  
  it('should retry failed agents', async () => {
    mockWriterToFailOnce();
    const result = await workflow.execute(brief);
    expect(result.status).toBe('completed');  // Should succeed on retry
  });
});
```

**Acceptance:**
- ✅ Timeout works
- ✅ Retry logic works
- ✅ Errors logged properly
- ✅ Tests green

---

#### MS-033: Progress Tracking & API (40 min)
**Goal:** Expose progress to Orchestrator

**Tasks:**
- Create GET /api/technical-planner/status/:workflowId endpoint
- Return current WorkflowState
- Add optional webhook for progress updates
- Document progress API

**Test:**
```typescript
describe('Progress Tracking', () => {
  it('should return current workflow status', async () => {
    const response = await request(app)
      .get(`/api/technical-planner/status/${workflowId}`)
      .expect(200);
    
    expect(response.body.progress).toBeDefined();
    expect(response.body.current_step).toBeDefined();
  });
});
```

**Acceptance:**
- ✅ Status endpoint works
- ✅ Progress updates saved
- ✅ Orchestrator can query status
- ✅ Tests green

---

### 9.2 Post-Implementation Tasks

**Documentation Updates:**
- Update TECHNICAL-PLANNER-V3.md (fix inconsistencies)
- Update FLOW-STATUS.md (Technical Planner → 100%)
- Create API documentation

**Integration Testing:**
- End-to-end test: Orchestrator → TP → Agents → Orchestrator
- Load testing: 10 concurrent workflows
- Crash recovery test: Kill TP mid-workflow, verify resume

**Monitoring Setup:**
- Grafana dashboards for workflow metrics
- Error alerting (Sentry or similar)
- Cost tracking per workflow

---

## 10. Appendix: Decision Rationale

### 10.1 Why Centralized Orchestration?

**Alternatives considered:**
1. **Delegated Chain** (Writer → Director → Visual → Video directly)
2. **Event-Driven** (Agents publish/subscribe to events)
3. **Centralized Hub** (Technical Planner coordinates all) ← **CHOSEN**

**Reasons for centralized:**

| Criterion | Centralized | Delegated | Event-Driven |
|-----------|-------------|-----------|--------------|
| **Stateful requirement** | ✅ Natural | ❌ Distributed | ⚠️ Complex |
| **Progress tracking** | ✅ Built-in | ❌ Needs webhooks | ⚠️ Eventual consistency |
| **Workflow fallback** | ✅ Easy | ❌ Complex | ⚠️ Complex |
| **Debugging** | ✅ Single log | ❌ N logs | ❌ Distributed tracing |
| **Timeout enforcement** | ✅ Simple | ❌ Must propagate | ⚠️ Timeouts per step |
| **Implementation complexity** | ⚠️ Medium | ✅ Low | ❌ High |
| **Latency** | ⚠️ +600ms | ✅ Low | ⚠️ Variable |

**Decision:** Centralized wins on observability, reliability, and stateful requirements. Latency is negligible (0.28% overhead).

### 10.2 Why Parallel Visual Creator?

**User feedback:** "Parallel va più veloce giusto?"

**Analysis:**
- Sequential: 3 scenes × 15s each = 45 seconds
- Parallel: 3 scenes × 15s max = 15 seconds
- **Time saved: 30 seconds (67% faster for visual step)**

**Trade-offs:**
- ✅ Faster user experience
- ✅ Better resource utilization (FAL.AI has rate limits anyway)
- ⚠️ Slightly higher peak memory (3 concurrent requests)
- ⚠️ All-or-nothing failure (but we have retry per scene)

**Decision:** Parallel is worth it. 30 seconds saved is meaningful on 3-minute workflow.

### 10.3 Why Each Agent Optimizes Prompts?

**Alternative:** Director writes model-specific prompts (e.g., Midjourney syntax)

**Problems with alternative:**
- ❌ Director must know all model syntaxes (FLUX vs Midjourney vs Seedream)
- ❌ Tight coupling: Director depends on model catalog
- ❌ Cannot update prompt templates without touching Director
- ❌ Director cannot be reused with new models

**Chosen approach:** Separation of concerns
- Director: Creative vision (natural language)
- Technical Planner: Model selection
- Execution Agent: Technical optimization (model-specific prompts)

**Benefits:**
- ✅ Director stays simple (creative only)
- ✅ Visual Creator/Video Composer are reusable
- ✅ Can update prompt templates independently
- ✅ Can add new models without changing Director

### 10.4 Why Stateful vs Stateless?

**User chose:** Stateful

**Rationale:**
- ✅ Crash recovery (workflows are 3-10 minutes)
- ✅ Progress tracking (user wants to see 0-100%)
- ✅ Debugging (full audit trail)
- ✅ Cost tracking (accumulate per step)

**Cost:** Additional PostgreSQL complexity, but acceptable.

---

**END OF DOCUMENT**

---

## Document Metadata

**Version:** 1.0 FINAL  
**Status:** ✅ Validated & Ready for Implementation  
**Last Updated:** October 21, 2025  
**Authors:** AIDA Development Team  
**Approved By:** Project Lead  
**Next Review:** After MS-033 completion

**Change Log:**
- 2025-10-21: Initial validated architecture document
- Future: Update after implementation learnings

**Related Documents:**
- TECHNICAL-PLANNER-V3.md (needs update - see section 10)
- ORCHESTRATOR-V5.md
- VISUAL-CREATOR-API.md
- FLOW-STATUS.md (needs update)
- PROJECT-INSTRUCTIONS.md
