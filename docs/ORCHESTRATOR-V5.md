# AIDA Orchestrator V5 - Multi-Agent Architecture

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Data Contracts](#data-contracts)
3. [Architecture Revolution](#architecture-revolution)
4. [Agent Responsibilities](#agent-responsibilities)
5. [Communication Flow](#communication-flow)
6. [Database Strategy](#database-strategy)
7. [Implementation Guide](#implementation-guide)
8. [Claude Code Prompt](#claude-code-prompt)

---

## Executive Summary

### Key V5 Transformations

**From V4:**
- Single Orchestrator doing everything
- Monolithic decision making
- Mixed responsibilities (conversation + tech)

**To V5:**
- **Orchestrator** = Account Manager (user-facing only)
- **Technical Planner** = Project Manager (new agent)
- **Style Selector** = Art Director (existing, 95% done)
- Clean separation of concerns

### Architecture Philosophy

```
Agency Model:

Client (User)
    ↕️ natural conversation only
Account Manager (Orchestrator)
    ↕️ structured briefs only
Project Manager (Technical Planner)
    ↕️ technical coordination
Creative Team (Writer, Director, Visual, Video)
```

### Critical V5 Decisions

✅ **Orchestrator Completable NOW** - No dependencies on other agents  
✅ **Proactive Style Guidance** - Proposes gallery when visual context detected  
✅ **Language Detection** - Responds in user's language automatically  
✅ **Supabase Migration** - From Neon to Supabase (same PostgreSQL)  
✅ **52+ AI Models** - Complete FAL.AI + KIE.AI catalog mapped  

---

## Data Contracts

### Overview

AIDA V5 uses **formal TypeScript interfaces** to define contracts between agents. These interfaces are located in `shared/types/` and ensure type-safe communication across the entire system.

**Key Principle:** Interfaces are **agent-agnostic** - ExecutionPlan works for ALL execution agents (Visual Creator, Video Composer, Audio Generator, Writer, Director).

### ProjectBrief Interface

**Direction:** Orchestrator → Technical Planner

**Purpose:** Structured requirements extracted from natural conversation

```typescript
import { ProjectBrief } from '@shared/types';

interface ProjectBrief {
  // Identifiers
  id: string;
  user_id: string;
  conversation_id: string;
  
  // Content
  content_type: 'image' | 'video' | 'audio' | 'multi_asset';
  requirements: string[];  // ["Create product photo", "White background"]
  detailed_description?: string;
  
  // Style
  style_preferences?: {
    gallery_selected?: string[];  // From Style Selector
    custom_description?: string;
    reference_images?: string[];
    artistic_style?: string;
  };
  
  // Quality (RAW - TP interprets)
  quality_keywords: string[];  // ["cinematic", "luxury"] - Orchestrator does NOT interpret
  
  // Budget
  budget_constraints?: {
    type: 'hard_limit' | 'soft_preference' | 'none';
    max_cost?: number;  // USD
    priority?: 'cost' | 'quality' | 'speed';
  };
  
  // Context
  language: string;  // ISO 639-1 ("en", "it", etc.)
  conversation_context?: string;
  special_requirements?: string[];
  
  // Metadata
  created_at: Date;
  priority?: 'low' | 'normal' | 'high';
  deadline?: Date;
}
```

**Critical Design Decisions:**

1. **Quality Keywords are RAW**
   - Orchestrator extracts keywords ("cinematic", "fast", "luxury")
   - Technical Planner interprets them into quality_tier
   - Reason: Keeps Orchestrator simple, Technical Planner has full context

2. **Style Preferences Optional**
   - Not all projects need explicit style
   - When present, comes from Style Selector proactive proposal

3. **Language Always Present**
   - Used for prompting ("cinematic" vs "cinematografico")
   - Used for result presentation

**Example:**
```typescript
const brief: ProjectBrief = {
  id: "brief_001",
  user_id: "user_123",
  conversation_id: "conv_456",
  content_type: "image",
  requirements: [
    "Create a product photo",
    "Modern smartphone",
    "White background"
  ],
  quality_keywords: ["professional", "high-quality"],
  budget_constraints: {
    type: "soft_preference",
    priority: "quality"
  },
  language: "en",
  created_at: new Date()
};
```

### ExecutionPlan Interface

**Direction:** Technical Planner → Execution Agents (ALL)

**Purpose:** Detailed execution instructions with model selection

```typescript
import { ExecutionPlan, ModelSelection } from '@shared/types';

interface ExecutionPlan {
  // Identifiers
  id: string;
  brief_id: string;
  
  // Models
  primary_model: ModelSelection;
  fallback_models?: ModelSelection[];
  
  // Execution Strategy
  approach: 'single_model' | 'multi_step' | 'parallel';
  steps?: ExecutionStep[];  // For multi_step workflows
  
  // Prompting
  prompt: string;  // Optimized for primary_model
  parameters?: Record<string, any>;
  
  // Estimates
  quality_tier: 'fast' | 'standard' | 'premium';
  total_estimated_cost: number;
  total_estimated_time: number;
  
  // Delegation
  target_agent: 'visual_creator' | 'video_composer' | 'audio_generator' | 'writer' | 'director';
  special_instructions?: string;
  expected_output?: string;
  
  // Metadata
  created_at: Date;
  planner_version?: string;
  notes?: string[];
}

interface ModelSelection {
  name: string;  // "FLUX Pro", "Veo 3.1"
  model_id: string;  // "fal-ai/flux/pro"
  provider: 'FAL.AI' | 'KIE.AI' | 'ANTHROPIC' | 'OPENAI';
  reason: string;
  estimated_cost: number;
  estimated_time: number;
  parameters?: Record<string, any>;
}
```

**Critical Design Decisions:**

1. **Target Agent Field**
   - ExecutionPlan explicitly states which agent should execute
   - Enables routing and agent-specific optimizations

2. **Fallback Models Array**
   - Plan B, C, D for silent recovery
   - Orchestrator never knows fallback was used

3. **Approach Types**
   - `single_model`: Simple, one API call
   - `multi_step`: Sequential workflow (e.g., generate + edit)
   - `parallel`: Multiple models simultaneously

**Example - Simple:**
```typescript
const plan: ExecutionPlan = {
  id: "plan_001",
  brief_id: "brief_001",
  approach: "single_model",
  primary_model: {
    name: "FLUX Pro",
    model_id: "fal-ai/flux/pro",
    provider: "FAL.AI",
    reason: "Best quality for product photography",
    estimated_cost: 0.055,
    estimated_time: 15
  },
  fallback_models: [
    {
      name: "FLUX 1.1 Pro",
      model_id: "fal-ai/flux-pro-1.1",
      provider: "FAL.AI",
      reason: "Backup if FLUX Pro unavailable",
      estimated_cost: 0.055,
      estimated_time: 15
    }
  ],
  prompt: "Modern smartphone product photo, sleek black design, white background, professional studio lighting, high detail, photorealistic",
  quality_tier: "premium",
  total_estimated_cost: 0.055,
  total_estimated_time: 15,
  target_agent: "visual_creator",
  created_at: new Date()
};
```

**Example - Multi-Step:**
```typescript
const complexPlan: ExecutionPlan = {
  id: "plan_002",
  brief_id: "brief_002",
  approach: "multi_step",
  primary_model: {
    name: "FLUX Pro",
    model_id: "fal-ai/flux/pro",
    provider: "FAL.AI",
    reason: "Step 1: Generate base image",
    estimated_cost: 0.055,
    estimated_time: 15
  },
  steps: [
    {
      step_number: 1,
      description: "Generate base image",
      model: { /* FLUX Pro */ },
      prompt: "Create product image"
    },
    {
      step_number: 2,
      description: "Enhance details",
      model: { /* Seedream 4.0 */ },
      prompt: "Enhance image quality",
      depends_on: [1]
    }
  ],
  quality_tier: "premium",
  total_estimated_cost: 0.095,  // 0.055 + 0.04
  total_estimated_time: 30,     // 15 + 15
  target_agent: "visual_creator",
  created_at: new Date()
};
```

### ExecutionResult Interface

**Direction:** Execution Agents → Technical Planner → Orchestrator

**Purpose:** Report execution outcomes

```typescript
import { ExecutionResult } from '@shared/types';

interface ExecutionResult {
  plan_id: string;
  success: boolean;
  error?: string;
  
  // Actual metrics
  model_used: string;  // May be fallback
  actual_cost: number;
  actual_time: number;
  
  // Timing
  started_at: Date;
  completed_at: Date;
  
  // Notes
  notes?: string[];  // ["Used fallback model due to rate limit"]
}

// Each agent extends ExecutionResult with specific fields
interface ImageGenerationResult extends ExecutionResult {
  image_url: string;
  dimensions: { width: number; height: number };
  format: string;
}

interface VideoCompositionResult extends ExecutionResult {
  video_url: string;
  duration: number;
  resolution: { width: number; height: number };
  has_audio: boolean;
}
```

### Quality Tier Interpretation

**Orchestrator → Technical Planner Mapping:**

```typescript
// Orchestrator extracts keywords
quality_keywords: ["cinematic", "luxury"]  // RAW

// Technical Planner interprets
function interpretQualityTier(keywords: string[]): QualityTier {
  if (keywords.some(k => ["cinematic", "luxury", "premium", "4K"].includes(k)))
    return "premium";
    
  if (keywords.some(k => ["fast", "draft", "budget", "quick"].includes(k)))
    return "fast";
    
  return "standard";  // Default
}

quality_tier: "premium"  // INTERPRETED
```

**Reason for separation:**
- Orchestrator stays simple (just extract)
- Technical Planner has full context (budget, requirements, etc.) for smart decisions
- Easier to update interpretation logic without touching Orchestrator

### Model Strategy (Updated Oct 19, 2025)

**Video Generation:**
```yaml
PREMIUM: Veo 3.1 → Sora 2 → Kling 2.5 Pro
STANDARD: Veo 3.1 → Kling 2.5 Pro
FAST: Kling 2.5 Turbo
```

**Image Editing (Pre-Video):**
```yaml
PRIMARY: Seedream 4.0 (ByteDance)
USE CASE: Enhance/edit images before video generation
FORMAT: 2K output (1.8s), scalable to 4K
```

**Audio Generation:**
```yaml
PREMIUM: ElevenLabs Turbo v2.5
STANDARD: ElevenLabs Turbo v2.5
FAST/FALLBACK: XTTS v2 (free, internal)
VOICE CLONING: XTTS v2 (excellent quality)
```

**Rationale:**
- **ElevenLabs** = Professional quality, 30+ languages, sub-100ms latency
- **XTTS v2** = Free fallback, excellent for voice cloning, 17 languages
- **Hybrid approach** = Balance cost/quality

### Usage in Code

**Orchestrator:**
```typescript
import { ProjectBrief, validateProjectBrief } from '@shared/types';

const brief: ProjectBrief = {
  id: `brief_${Date.now()}`,
  user_id: userId,
  conversation_id: conversationId,
  content_type: 'video',
  requirements: extractRequirements(userMessage),
  quality_keywords: extractQualityKeywords(userMessage),  // RAW!
  language: detectLanguage(userMessage),
  created_at: new Date()
};

const validation = validateProjectBrief(brief);
if (validation.valid) {
  await sendToTechnicalPlanner(brief);
}
```

**Technical Planner:**
```typescript
import { ProjectBrief, ExecutionPlan, validateExecutionPlan } from '@shared/types';

function createPlan(brief: ProjectBrief): ExecutionPlan {
  const qualityTier = interpretQualityTier(brief.quality_keywords);  // Interpret here
  const model = selectModel(brief.content_type, qualityTier, brief.budget_constraints);
  
  const plan: ExecutionPlan = {
    id: `plan_${Date.now()}`,
    brief_id: brief.id,
    primary_model: model,
    approach: 'single_model',
    prompt: optimizePrompt(brief, model),
    quality_tier: qualityTier,
    total_estimated_cost: model.estimated_cost,
    total_estimated_time: model.estimated_time,
    target_agent: determineAgent(brief.content_type),
    created_at: new Date()
  };
  
  validateExecutionPlan(plan);
  return plan;
}
```

**Visual Creator:**
```typescript
import { ExecutionPlan, ExecutionResult } from '@shared/types';

async function execute(plan: ExecutionPlan): Promise<ImageGenerationResult> {
  const result = await generateImage(plan.primary_model.model_id, plan.prompt);
  
  return {
    plan_id: plan.id,
    success: true,
    model_used: plan.primary_model.name,
    actual_cost: 0.055,
    actual_time: 14,
    started_at: startTime,
    completed_at: new Date(),
    // Visual Creator specific
    image_url: result.url,
    dimensions: result.dimensions,
    format: 'PNG'
  };
}
```

### Documentation

Complete interface documentation available at:
- `shared/types/README.md` - Usage guide
- `shared/types/*.types.ts` - Full TypeScript definitions with JSDoc
- Examples and validation helpers included

---

## Architecture Revolution

### V5 Multi-Agent System

```
┌─────────────────────────────────────┐
│         USER LAYER                  │
│  Natural language, non-technical    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   ORCHESTRATOR (Port 3003)          │
│   Role: Account Manager             │
│   ─────────────────────────────     │
│   ✅ Conversation with user         │
│   ✅ Requirements extraction        │
│   ✅ Proactive style proposals      │
│   ✅ Language detection/adaptation  │
│   ✅ Brief generation               │
│   ✅ Status updates to user         │
│   ✅ Result presentation            │
│   ❌ NO model selection             │
│   ❌ NO workflow decisions          │
└──────────────┬──────────────────────┘
               ↓ ProjectBrief
┌─────────────────────────────────────┐
│   TECHNICAL PLANNER (Port 3004)     │
│   Role: Project Manager             │
│   ─────────────────────────────     │
│   ✅ Receives brief from Orc        │
│   ✅ Model selection (52+ models)   │
│   ✅ Workflow design                │
│   ✅ Agent coordination             │
│   ✅ Cost/time estimation           │
│   ✅ Progress tracking              │
│   ❌ NO user interaction            │
└──────────────┬──────────────────────┘
               ↓ ExecutionPlan
┌─────────────────────────────────────┐
│   EXECUTION LAYER                   │
│   ─────────────────────────────     │
│   ↔️ Style Selector (3002) - 95%    │
│   ↔️ Writer (TBD) - 40%             │
│   ↔️ Director (TBD) - 40%           │
│   ↔️ Visual Creator (TBD) - 0%      │
│   ↔️ Video Composer (TBD) - 0%      │
└─────────────────────────────────────┘
```

### Why This Works

**Clear Responsibilities:**
- Orchestrator = Human-facing, understands intent
- Technical Planner = Machine-facing, optimizes execution
- Execution Agents = Specialized tasks

**No Circular Dependencies:**
```
User → Orchestrator → Tech Planner → Execution Agents
                ↑                         ↓
                └─────── Results ─────────┘
```

**Parallel Development:**
- Each agent can be built independently
- Mocks enable testing without full system
- Clear interfaces between components

---

## Agent Responsibilities

### Orchestrator - Account Manager

**Port:** 3003  
**Status:** 85% Complete  
**Dependencies:** NONE (can be completed now!)  

#### Core Responsibilities

```typescript
interface OrchestratorRole {
  // ✅ User Interaction
  conversation: {
    receive: UserMessage;
    understand: Intent;
    respond: NaturalLanguage;
    language: AutoDetect; // Responds in user's language
  };
  
  // ✅ Style Guidance (PROACTIVE)
  styleProposal: {
    detectVisualContext: boolean;
    proposeGallery: StyleGallery;
    refineSelection: UserFeedback;
  };
  
  // ✅ Brief Generation
  briefCreation: {
    extract: UserRequirements;
    structure: ProjectBrief;
    sendTo: TechnicalPlanner;
  };
  
  // ✅ Status Updates
  progressTracking: {
    receive: StatusUpdates;
    translate: HumanReadable;
    notify: User;
  };
  
  // ❌ What Orchestrator DOES NOT DO
  forbidden: {
    modelSelection: false;
    technicalDecisions: false;
    directAgentCoordination: false;
    costCalculation: false;
  };
}
```

#### Conversation Flow

**User Message → Orchestrator Processing:**

```yaml
Step 1: Language Detection
  - Detect user's language automatically
  - Set response language accordingly
  - Support: EN, IT, ES, FR, DE, PT

Step 2: Intent Classification
  - Image generation request
  - Video generation request
  - Style exploration
  - Status inquiry
  - General question

Step 3: Context Assessment
  - Is this a visual request?
  - Does user need style guidance?
  - Has user selected style before?

Step 4: Proactive Style Proposal (if applicable)
  Orchestrator: "Ti mostro una galleria di stili per capire 
                 meglio cosa desideri. Quale preferisci?"
  [Shows Style Gallery with 6-8 examples]
  
Step 5: Requirements Extraction
  - Visual style (from gallery or description)
  - Content description
  - Quality expectations
  - Quantity
  - Special requirements

Step 6: Brief Generation
  Create ProjectBrief for Technical Planner

Step 7: User Confirmation
  "Ho capito: [summary]. Procedo?"
```

#### Proactive Style Guidance

**Key Innovation: Orchestrator proposes style gallery BEFORE Technical Planner**

```typescript
// When Orchestrator detects visual request without clear style
if (isVisualRequest && !hasStyleGuidance) {
  // PROACTIVE PROPOSAL
  const gallery = await styleSelector.generateGallery({
    context: userMessage,
    count: 6-8,
    diverse: true
  });
  
  await sendToUser({
    message: "Per creare l'immagine perfetta, ti mostro alcuni stili. " +
             "Quale si avvicina di più a ciò che immagini?",
    gallery: gallery,
    allowCustom: true
  });
  
  // Wait for user selection
  const userChoice = await waitForSelection();
  
  // NOW create brief with chosen style
  const brief = createBrief({
    ...requirements,
    styleGuidance: userChoice
  });
}
```

**Benefits:**
- Better quality results (style clarity upfront)
- User education (sees possibilities)
- Reduced iterations (right style first time)
- Natural conversation flow

#### Language Adaptation

```typescript
interface LanguageSupport {
  detection: {
    analyze: UserMessage;
    identify: Language; // en, it, es, fr, de, pt
    confidence: number;
  };
  
  response: {
    language: MatchUserLanguage;
    tone: MaintainConsistency;
    terminology: UseLocalTerms;
  };
  
  briefs: {
    internal: AlwaysEnglish; // For Technical Planner
    userFacing: MatchUserLanguage;
  };
}
```

**Example:**
```
User (IT): "Voglio creare un'immagine di un tramonto"
Orchestrator (IT): "Perfetto! Ti mostro alcuni stili fotografici..."

User (EN): "I want to create a sunset image"
Orchestrator (EN): "Great! Let me show you some photographic styles..."
```

---

### Technical Planner - Project Manager

**Port:** 3004  
**Status:** 95% (Documentation complete, implementation ready)  
**Dependencies:** Orchestrator (receives briefs)  

#### Core Responsibilities

```typescript
interface TechnicalPlannerRole {
  // ✅ Brief Processing
  briefAnalysis: {
    receive: ProjectBrief;
    analyze: Requirements;
    classify: ContentType;
  };
  
  // ✅ Model Selection (52+ Models)
  modelDecision: {
    video: {
      luxury: ['Sora 2 Pro', 'Veo 3.1'],
      premium: ['Sora 2', 'Kling 2.5 Pro'],
      standard: ['Kling 2.5 Pro', 'Wan 2.5'],
      fast: ['MiniMax Hailuo-02']
    },
    image: {
      photorealistic: ['FLUX Pro v1.1', 'FLUX Pro'],
      artistic: ['Midjourney V7 (KIE.AI)'],
      illustration: ['Recraft v3'],
      vector: ['Recraft v3 SVG'],
      editing: ['Nano Banana']
    },
    audio: {
      voiceover: ['XTTS v2 (internal)'],
      music: ['Udio (KIE.AI)']
    }
  };
  
  // ✅ Workflow Design
  workflowOrchestration: {
    approach: 'single_model' | 'multi_step';
    parallelization: boolean;
    dependencies: ExecutionGraph;
  };
  
  // ✅ Cost/Time Estimation
  estimates: {
    cost: CalculateFromModels;
    time: EstimateFromWorkflow;
    budget: CheckConstraints;
  };
  
  // ✅ Agent Coordination
  execution: {
    spawn: ExecutionAgents;
    monitor: Progress;
    handle: Errors;
    aggregate: Results;
  };
}
```

#### Decision Algorithm

**Model Selection Logic:**

```typescript
function selectModels(brief: ProjectBrief): ExecutionPlan {
  // Step 1: Content Type
  const contentType = identifyType(brief); // video, image, audio, multi
  
  // Step 2: Quality Tier
  const qualityTier = determineQuality(brief); // fast, standard, premium, cinematic
  
  // Step 3: Special Requirements
  const specialReqs = {
    needsAudio: checkAudio(brief),
    needsConsistency: checkConsistency(brief),
    needsEditing: brief.sourceImage || brief.sourceVideo,
    specificStyle: extractStyle(brief)
  };
  
  // Step 4: Apply Decision Tree
  const models = applyDecisionTree(contentType, qualityTier, specialReqs, brief.budget);
  
  // Step 5: Design Workflow
  const workflow = designWorkflow(models, brief.quantity, specialReqs);
  
  // Step 6: Estimate Cost/Time
  const estimates = calculateEstimates(workflow);
  
  // Step 7: Create Execution Plan
  return {
    id: generateId(),
    briefId: brief.id,
    approach: workflow.approach,
    models: models,
    workflow: workflow.steps,
    estimatedCost: estimates.cost,
    estimatedTime: estimates.time,
    fallbackStrategy: defineFallbacks(models)
  };
}
```

**Complete documentation in:** `docs/TECHNICAL-PLANNER-V3.md`

---

### Style Selector - Art Director

**Port:** 3002  
**Status:** 95% Complete  
**Dependencies:** NONE  

#### Core Responsibilities

```typescript
interface StyleSelectorRole {
  // ✅ Gallery Generation
  galleryCreation: {
    context: UserIntent;
    generate: StyleExamples;
    diversity: EnsureVariety;
    count: 6-8;
  };
  
  // ✅ Style Refinement
  refinement: {
    receive: UserSelection;
    refine: StyleParameters;
    iterate: UntilSatisfied;
  };
  
  // ✅ Style Translation
  translation: {
    userSelection: StyleChoice;
    technicalSpec: PromptGuidance;
    modelOptimized: PerModelFormat;
  };
}
```

**Note:** Style Selector is already implemented and working. Used proactively by Orchestrator when visual requests detected.

---

### Execution Agents (Writer, Director, Visual Creator, Video Composer)

**Status:** 0-40% (Development phase)  
**Dependencies:** Technical Planner (receives tasks)  

#### General Pattern

```typescript
interface ExecutionAgentRole {
  // Receive Task
  taskReceival: {
    from: TechnicalPlanner;
    parse: TaskSpecification;
    validate: CanExecute;
  };
  
  // Execute
  execution: {
    prepare: Resources;
    call: APIEndpoint;
    monitor: Progress;
    handle: Errors;
  };
  
  // Return Result
  resultDelivery: {
    validate: OutputQuality;
    package: Result;
    sendTo: TechnicalPlanner;
  };
}
```

**Each agent specialized for specific task:**
- **Writer**: Script generation, copy writing
- **Director**: Scene breakdown, shot planning
- **Visual Creator**: Image generation/editing (FLUX, Recraft, Nano Banana, Midjourney)
- **Video Composer**: Video generation/editing (Sora, Veo, Kling, Runway, OmniHuman)

---

## Communication Flow

### Request Flow

```
USER: "Voglio un video di 30 secondi per Instagram"
  ↓
ORCHESTRATOR:
  - Detects: IT language
  - Identifies: Video request
  - Checks: Visual context present
  - Action: Propose style gallery
  
  Response (IT): "Perfetto! Per creare il video ideale, 
                  ti mostro alcuni stili. Quale preferisci?"
  [Shows gallery]
  
USER: Selects "Cinematic Luxury"
  ↓
ORCHESTRATOR:
  - Extracts requirements
  - Creates ProjectBrief
  - Sends to Technical Planner
  
  Brief = {
    type: 'video',
    description: '30-second Instagram video',
    duration: 30,
    style: 'cinematic_luxury',
    quality_tier: 'premium'
  }
  ↓
TECHNICAL PLANNER:
  - Analyzes brief
  - Selects: Sora 2 Pro (luxury tier + audio)
  - Designs workflow: Single-model approach
  - Estimates: $0.15, ~5 minutes
  - Creates ExecutionPlan
  - Spawns: Video Composer agent
  ↓
VIDEO COMPOSER:
  - Receives task from TP
  - Calls Sora 2 Pro API (FAL.AI)
  - Monitors generation
  - Returns video URL
  ↓
TECHNICAL PLANNER:
  - Validates result
  - Calculates actual cost/time
  - Sends to Orchestrator
  ↓
ORCHESTRATOR:
  - Translates to Italian
  - Presents to user
  
  Response (IT): "Ecco il tuo video! 
                  Generato in 4 minuti per €0.14
                  [video preview]
                  Vuoi modifiche o è perfetto così?"
```

### Status Update Flow

```
TECHNICAL PLANNER → ORCHESTRATOR → USER

TP: "Generation started (step 1/3)"
Orc (IT): "Sto generando il video... 📹"

TP: "Processing (step 2/3, 50% complete)"
Orc (IT): "A metà strada! ⏱️"

TP: "Finalizing (step 3/3, 90% complete)"
Orc (IT): "Quasi pronto! ✨"

TP: "Complete - Result available"
Orc (IT): "Fatto! Ecco il risultato 🎉"
```

### Error Handling Flow

```
VIDEO COMPOSER: Model API failure
  ↓
TECHNICAL PLANNER:
  - Detects failure
  - Attempts fallback (Kling 2.5 Pro)
  - Fallback succeeds
  - Updates Orchestrator: "Minor delay, used alternative model"
  ↓
ORCHESTRATOR:
  - Decides: No need to inform user (silent recovery)
  - Proceeds normally
  
IF all fallbacks fail:
  ↓
TECHNICAL PLANNER:
  - Reports to Orchestrator: "Unable to complete"
  ↓
ORCHESTRATOR:
  - Informs user in their language
  - Proposes alternatives or retry
```

---

## Database Strategy

### Supabase Migration

**Decision:** Migrate from Neon to Supabase  
**Why:**
- Same PostgreSQL (easy migration)
- Better real-time features
- Integrated auth
- Better pricing
- Excellent dashboard

### Schema Design

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  language TEXT DEFAULT 'en', -- Auto-detected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  language TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Briefs
CREATE TABLE project_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  type TEXT NOT NULL,
  description TEXT,
  requirements JSONB,
  style_guidance JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Execution Plans
CREATE TABLE execution_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id UUID REFERENCES project_briefs(id),
  approach TEXT NOT NULL,
  models JSONB NOT NULL,
  workflow JSONB,
  estimated_cost DECIMAL(10,2),
  estimated_time INTEGER,
  actual_cost DECIMAL(10,2),
  actual_time INTEGER,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES execution_plans(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Style Gallery Cache
CREATE TABLE style_galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  context_hash TEXT UNIQUE,
  styles JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

### Data Flow

```
Orchestrator → Supabase:
  - User messages
  - Conversation state
  - Project briefs
  - Style selections

Technical Planner → Supabase:
  - Execution plans
  - Model selections
  - Cost/time tracking
  - Results storage

Style Selector → Supabase:
  - Gallery cache
  - Style refinements
```

---

## Implementation Guide

### Phase 1: Orchestrator Completion (CURRENT)

**Goal:** Complete Orchestrator to production-ready state  
**Timeline:** 1-2 weeks  
**Status:** 85% → 100%  

**Remaining Tasks:**

1. **Proactive Style Proposal Integration**
```typescript
// Add to conversation flow
async function processVisualRequest(message: UserMessage): Promise<Response> {
  const hasStyleGuidance = await checkExistingStyle(message.conversationId);
  
  if (!hasStyleGuidance) {
    const gallery = await styleSelector.generateGallery({
      context: message.content,
      count: 8,
      diverse: true
    });
    
    return {
      type: 'style_proposal',
      message: localizeMessage('style.proposal', message.language),
      gallery: gallery
    };
  }
  
  // Continue with brief generation...
}
```

2. **Language Detection Enhancement**
```typescript
import { franc } from 'franc';

function detectLanguage(text: string): Language {
  const detected = franc(text);
  const supported = ['en', 'it', 'es', 'fr', 'de', 'pt'];
  
  return supported.includes(detected) ? detected : 'en';
}
```

3. **Brief Generation Refinement**
```typescript
interface ProjectBrief {
  // Enhanced with style guidance
  styleGuidance: {
    selectedStyle: StyleChoice;
    referenceImages?: string[];
    customInstructions?: string;
  };
  
  // Language tracking
  userLanguage: Language;
  
  // Quality inference
  qualityTier: InferFromContext; // luxury keywords, budget mentions, etc.
}
```

4. **Status Update Translation**
```typescript
const statusMessages = {
  en: {
    generating: 'Generating your content... 🎨',
    halfway: 'Halfway there! ⏱️',
    finalizing: 'Almost ready! ✨',
    complete: 'Done! Here\'s your result 🎉'
  },
  it: {
    generating: 'Sto generando il contenuto... 🎨',
    halfway: 'A metà strada! ⏱️',
    finalizing: 'Quasi pronto! ✨',
    complete: 'Fatto! Ecco il risultato 🎉'
  }
  // ... other languages
};
```

### Phase 2: Technical Planner Implementation

**Goal:** Build Technical Planner from V3 documentation  
**Timeline:** 2-3 weeks  
**Status:** 95% (docs) → Implementation  
**Dependencies:** Orchestrator complete  

**Steps:**

1. Core engine (decision algorithm)
2. Model selection logic (52+ models)
3. Workflow designer
4. Cost calculator
5. Agent spawner
6. Progress tracker
7. Error handler with fallbacks

**Reference:** `docs/TECHNICAL-PLANNER-V3.md`

### Phase 3: Execution Agents

**Goal:** Build specialized execution agents  
**Timeline:** 3-4 weeks (parallel development possible)  
**Status:** 0-40% → Implementation  
**Dependencies:** Technical Planner complete  

**Agents:**

1. **Visual Creator** (Priority 1)
   - FLUX Pro integration
   - Recraft integration
   - Nano Banana integration
   - Midjourney via KIE.AI

2. **Video Composer** (Priority 2)
   - Sora 2 integration
   - Veo 3.1 integration
   - Kling 2.5 integration
   - Runway integration
   - OmniHuman integration

3. **Writer** (Priority 3)
   - Script generation
   - Copy writing
   - RAG tools integration

4. **Director** (Priority 4)
   - Scene breakdown
   - Shot planning
   - Asset coordination

### Phase 4: Integration & Testing

**Goal:** End-to-end system testing  
**Timeline:** 1-2 weeks  
**Status:** Future  

---

## Claude Code Prompt

### For Orchestrator Development

```
I'm working on the Orchestrator agent for AIDA, a multi-agent AI content creation platform.

Architecture Context:
- Orchestrator = Account Manager (user-facing only)
- Technical Planner = Project Manager (model selection)
- Execution Agents = Specialized tasks

Orchestrator Responsibilities:
✅ Natural conversation with users (multi-language)
✅ Proactive style guidance (proposes gallery)
✅ Requirements extraction
✅ Brief generation for Technical Planner
✅ Status updates in user's language
❌ NO model selection
❌ NO technical decisions

Current Task: [Specific task]

Tech Stack:
- Node.js + Express
- TypeScript
- Anthropic Claude API
- Supabase (PostgreSQL)
- Port 3003

Please help me: [Specific request]

Key Principles:
- Clean separation: Orchestrator never touches model selection
- Proactive style: Propose gallery before Technical Planner
- Language adaptive: Respond in user's language
- Test-first: Write test before implementation
```

---

## Appendix: Model Catalog

### FAL.AI Models (Primary Provider)

**Video Generation:**
- Sora 2 / Sora 2 Pro (OpenAI)
- Veo 3.1 (Google)
- Kling 2.5 Turbo Pro (Kuaishou)
- Runway Gen-3 Alpha/Turbo
- MiniMax Hailuo-02
- Wan 2.5
- OmniHuman v1.5 (UGC avatars)

**Image Generation:**
- FLUX 1.1 Pro / FLUX Pro
- FLUX Schnell
- Recraft v3
- Recraft v3 SVG
- Hunyuan Image 3
- Nano Banana (editing)

**Audio:**
- XTTS v2 (internal, free)

### KIE.AI Models (Artistic + Music)

**Image:**
- Midjourney V7 (artistic)

**Audio:**
- Udio (music generation)

**Total:** 52+ AI models cataloged and mapped

**Complete specifications:** `docs/TECHNICAL-PLANNER-V3.md`

---

*Document Version: 5.0*  
*Last Updated: October 18, 2025*  
*Status: Ready for Implementation*  
*Architecture: Multi-Agent System*
