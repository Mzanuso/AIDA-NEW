# Technical Planner - Complete Documentation V3

**Version:** 3.0  
**Updated:** October 18, 2025  
**Status:** Production Ready  

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Input/Output Contracts](#2-inputoutput-contracts)
3. [Core Responsibilities](#3-core-responsibilities)
4. [Model Catalog](#4-model-catalog)
5. [Decision Engine](#5-decision-engine)
6. [Workflow Patterns](#6-workflow-patterns)
7. [Prompting Best Practices](#7-prompting-best-practices)
8. [Cost Optimization](#8-cost-optimization)
9. [Integration Specifications](#9-integration-specifications)
10. [Error Handling & Fallbacks](#10-error-handling--fallbacks)
11. [Examples & Use Cases](#11-examples--use-cases)

---

## 1. Overview

### 1.1 What is Technical Planner?

The **Technical Planner** is AIDA's decision architect for AI model selection and workflow orchestration. It acts as the bridge between creative requirements and technical execution.

**Core Function:**
```
Creative Brief → Analysis → Model Selection → Execution Plan → Delegation
```

**Key Principle:** The Technical Planner **never generates content directly**. It analyzes, decides, plans, and delegates to specialized agents (Visual Creator, Video Composer, etc.).

### 1.2 Position in AIDA Architecture

**UPDATED (Oct 21, 2025):** Corrected architecture flow.

```yaml
User Input
    ↓
Orchestrator (Conversational Agent - Account Manager)
    ↓
Technical Planner (Project Manager) ← YOU ARE HERE
    ↓
    ├─→ Writer Agent (Copywriter)
    ├─→ Director Agent (Art Director)
    ├─→ Visual Creator Agent (Designer)
    ├─→ Video Composer Agent (Video Editor)
    └─→ Audio Generator Agent (Sound Engineer)
    ↓
Final Output → back to Orchestrator → User
```

**Key Points:**
- Technical Planner coordinates ALL execution agents
- Director is an execution agent (NOT a layer between Orchestrator and TP)
- Centralized orchestration: All agents report back to Technical Planner
- No peer-to-peer communication between execution agents

**Reference:** See `AIDA-ARCHITECTURE-FINAL.md` for complete validated architecture.

### 1.3 Design Philosophy

- **Pragmatic over Perfect**: Choose models that work reliably
- **Cost-Conscious**: Balance quality with budget constraints
- **Fallback-First**: Always have Plan B and Plan C
- **Clear Delegation**: Precise instructions to execution agents
- **Silent Recovery**: Handle failures gracefully without user interruption

---

## 2. Input/Output Contracts

### 2.1 Overview

The Technical Planner uses **formal TypeScript interfaces** defined in `shared/types/` for all communication. These contracts ensure type-safe, predictable interactions with Orchestrator and all execution agents.

**Complete interface documentation:** `shared/types/README.md`

### 2.2 Input: ProjectBrief

**Source:** Orchestrator  
**Purpose:** Structured creative requirements from user conversation

```typescript
import { ProjectBrief } from '@shared/types';

interface ProjectBrief {
  // Identifiers
  id: string;
  user_id: string;
  conversation_id: string;
  
  // Content
  content_type: 'image' | 'video' | 'audio' | 'multi_asset';
  requirements: string[];
  
  // Quality (RAW - Technical Planner interprets)
  quality_keywords: string[];  // ["cinematic", "fast", etc.]
  
  // Style
  style_preferences?: {
    gallery_selected?: string[];
    custom_description?: string;
  };
  
  // Budget
  budget_constraints?: {
    type: 'hard_limit' | 'soft_preference' | 'none';
    max_cost?: number;
    priority?: 'cost' | 'quality' | 'speed';
  };
  
  // Context
  language: string;
  created_at: Date;
}
```

**Critical: Quality Keywords Interpretation**

Orchestrator passes `quality_keywords` RAW (uninterpreted). Technical Planner interprets them into `quality_tier`:

```typescript
function interpretQualityTier(keywords: string[]): QualityTier {
  // Premium indicators
  if (keywords.some(k => ["cinematic", "luxury", "premium", "4K"].includes(k)))
    return "premium";
    
  // Fast indicators  
  if (keywords.some(k => ["fast", "draft", "budget", "quick"].includes(k)))
    return "fast";
    
  // Default
  return "standard";
}
```

**Why this design?**
- Keeps Orchestrator simple (just extract keywords)
- Technical Planner has full context for smart decisions
- Easy to update interpretation logic

### 2.3 Output: ExecutionPlan

**Destination:** Execution Agents (Visual Creator, Video Composer, Audio Generator, Writer, Director)  
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
  
  // Strategy
  approach: 'single_model' | 'multi_step' | 'parallel';
  steps?: ExecutionStep[];
  
  // Prompting
  prompt: string;  // Optimized for primary_model
  parameters?: Record<string, any>;
  
  // Estimates
  quality_tier: 'fast' | 'standard' | 'premium';  // INTERPRETED from keywords
  total_estimated_cost: number;
  total_estimated_time: number;
  
  // Delegation
  target_agent: 'visual_creator' | 'video_composer' | 'audio_generator' | 'writer' | 'director';
  special_instructions?: string;
  
  // Metadata
  created_at: Date;
  notes?: string[];
}

interface ModelSelection {
  name: string;  // "FLUX Pro", "Veo 3.1"
  model_id: string;  // "fal-ai/flux/pro"
  provider: 'FAL.AI' | 'KIE.AI' | 'ANTHROPIC' | 'OPENAI';
  reason: string;  // Why selected
  estimated_cost: number;
  estimated_time: number;
}
```

**Target Agent Field**

ExecutionPlan explicitly states which agent should execute:
- `visual_creator`: Image generation/editing
- `video_composer`: Video generation/composition
- `audio_generator`: TTS, music, sound effects
- `writer`: Script generation, copywriting
- `director`: Scene breakdown, shot planning

This enables routing and agent-specific optimizations.

**Fallback Models Array**

Plan B, C, D for silent recovery:
```typescript
primary_model: { name: "Veo 3.1", ... }
fallback_models: [
  { name: "Sora 2", ... },      // Plan B
  { name: "Kling 2.5 Pro", ... } // Plan C
]
```

Orchestrator never knows fallback was used = smooth UX.

### 2.4 Model Strategy (Updated Oct 19, 2025)

**Video Generation Hierarchy:**
```yaml
PREMIUM:
  Primary: Veo 3.1
  Fallback 1: Sora 2
  Fallback 2: Kling 2.5 Pro

STANDARD:
  Primary: Veo 3.1
  Fallback: Kling 2.5 Pro

FAST:
  Primary: Kling 2.5 Turbo
```

**Image Editing (Pre-Video):**
```yaml
PRIMARY: Seedream 4.0 (ByteDance)
USE CASE: Enhance/edit images before video generation
FORMAT: 2K output (1.8s), scalable to 4K
NOTE: For image editing only, not video editing
```

**Audio Generation:**
```yaml
PREMIUM/STANDARD:
  Primary: ElevenLabs Turbo v2.5
  Reason: Professional quality, 30+ languages, sub-100ms latency
  Cost: ~$0.015 per 30s narration

FAST/FALLBACK:
  Primary: XTTS v2 (internal, free)
  Reason: Excellent fallback, great for voice cloning
  Cost: $0

VOICE CLONING:
  Primary: XTTS v2
  Reason: Excels at voice cloning even vs ElevenLabs
```

**Rationale:**
- **ElevenLabs**: Industry-leading quality, unbeatable naturalness
- **XTTS v2**: Free fallback, excellent for voice cloning
- **Hybrid approach**: Balance premium quality with cost efficiency

### 2.5 Usage Example

**Technical Planner receives ProjectBrief:**
```typescript
import { ProjectBrief, ExecutionPlan } from '@shared/types';

function createPlan(brief: ProjectBrief): ExecutionPlan {
  // Step 1: Interpret quality keywords
  const qualityTier = interpretQualityTier(brief.quality_keywords);
  
  // Step 2: Select models based on content type + quality tier
  const model = selectModel(brief.content_type, qualityTier, brief.budget_constraints);
  
  // Step 3: Optimize prompt for selected model
  const prompt = optimizePrompt(brief.requirements, model, brief.language);
  
  // Step 4: Create execution plan
  const plan: ExecutionPlan = {
    id: `plan_${Date.now()}`,
    brief_id: brief.id,
    primary_model: model,
    fallback_models: determineFallbacks(model),
    approach: 'single_model',
    prompt: prompt,
    quality_tier: qualityTier,  // INTERPRETED, not from brief
    total_estimated_cost: model.estimated_cost,
    total_estimated_time: model.estimated_time,
    target_agent: determineAgent(brief.content_type),
    created_at: new Date()
  };
  
  // Step 5: Validate before sending
  const validation = validateExecutionPlan(plan);
  if (!validation.valid) {
    throw new Error(`Invalid plan: ${validation.errors}`);
  }
  
  return plan;
}
```

**Visual Creator receives ExecutionPlan:**
```typescript
import { ExecutionPlan, ExecutionResult } from '@shared/types';

async function execute(plan: ExecutionPlan): Promise<ImageGenerationResult> {
  // Execute using primary_model
  const result = await generateImage(
    plan.primary_model.model_id,
    plan.prompt,
    plan.parameters
  );
  
  // Return typed result
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

---

## 3. Core Responsibilities

### 2.1 Brief Analysis

**Input:** `ProjectBrief` from Orchestrator or Director

**Analysis Steps:**
1. **Content Type Detection**
   - Image generation (single/multiple)
   - Video generation (text-to-video, image-to-video, video-to-video)
   - Audio generation (voiceover, music, sound effects)
   - Multi-asset projects (composite workflows)

2. **Quality Tier Identification**
   ```yaml
   User Keywords → Quality Tier:
   - "cinematic", "luxury", "premium", "4K" → PREMIUM
   - "professional", "high-quality" → STANDARD
   - "fast", "draft", "budget" → FAST
   - No specific request → STANDARD (default)
   ```

3. **Special Requirements Detection**
   - Audio needed (native vs added)
   - Character consistency across scenes
   - Specific style (realistic, artistic, cartoon)
   - Duration constraints
   - Resolution requirements

4. **Budget Constraints**
   - Hard limit (must not exceed)
   - Soft preference (optimize when possible)
   - No constraint (prioritize quality)

### 2.2 Model Selection

**Decision Framework:**
```
LEVEL 1: Input Type
    ├─ Text-only → Text-to-video models
    ├─ Has image(s) → Image-to-video models
    ├─ Has video → Video-to-video models
    └─ Static image need → Image generation/editing

LEVEL 2: Quality vs Budget
    ├─ Premium/Cinematic → Sora 2 Pro, Veo 3.1
    ├─ Standard/Balanced → Kling 2.5 Turbo Pro, FLUX Pro
    └─ Fast/Budget → Kling Turbo, FLUX Schnell

LEVEL 3: Special Features
    ├─ Native audio → Sora 2, Veo 3.1, Wan 2.5
    ├─ Artistic style → Midjourney (KIE.AI)
    ├─ Image editing → Nano Banana
    ├─ Video transformation → Runway Gen-3
    └─ Multiple scenes → Multi-step workflow
```

### 2.3 Workflow Design

**Two Approaches:**

**A) Single-Model Workflow**
```yaml
Use When:
  - Simple, single-asset request
  - Clear model capability match
  - No special composition needed

Example: "Generate UGC video"
  → OmniHuman v1.5 (one model, one step)
```

**B) Multi-Step Workflow**
```yaml
Use When:
  - Complex composite needs
  - Multiple asset types
  - Character consistency required
  - Multi-scene projects

Example: "Marketing video with 5 scenes"
  Step 1: Generate images (FLUX Pro) - parallel
  Step 2: Generate voiceover (XTTS) - parallel with Step 1
  Step 3: Animate scenes (Kling 2.5) - sequential after Step 1
  Step 4: Composite final (Video Composer) - after all
```

### 2.4 Execution Planning

**Output:** `ExecutionPlan` JSON

```typescript
interface ExecutionPlan {
  id: string;
  briefId: string;
  approach: 'single_model' | 'multi_step';
  
  // For single_model
  primaryModel?: ModelAssignment;
  
  // For multi_step
  workflow?: WorkflowStep[];
  
  estimatedCost: number;
  estimatedTime: number; // seconds
  fallbackStrategy: FallbackPlan;
  qualityTier: 'fast' | 'standard' | 'premium' | 'cinematic';
}
```

### 2.5 Agent Coordination

**Responsibilities:**
- Spawn execution agents (Visual Creator, Video Composer)
- Pass clear, specific instructions
- Track progress in real-time
- Manage parallel execution when possible
- Handle agent failures with fallbacks
- Aggregate results
- Calculate actual costs

---

## 3. Model Catalog

### 3.1 Video Generation - Premium Tier

#### Sora 2 / Sora 2 Pro (OpenAI via FAL.AI)

**Capabilities:**
- Text-to-video with native audio + synchronized dialogue
- Image-to-video with audio preservation
- Enhanced physics and realism
- Cinematic quality
- Up to 60 seconds, 1080p

**Specifications:**
```yaml
model_id: 'fal-ai/sora-2' (standard) | 'fal-ai/sora-2/pro' (premium)
provider: 'FAL.AI'
category: 'video_generation'
quality: 'cinematic'

input_modes:
  - text_to_video
  - image_to_video

capabilities:
  - Native audio generation
  - Synchronized dialogue
  - Photorealistic output
  - Advanced physics
  - Camera movements

specifications:
  duration: 'up to 60 seconds'
  resolution: '1080p'
  audio: 'native (included)'
  generation_time: '3-5 minutes'
  
pricing:
  sora_2_standard: '$0.10/video'
  sora_2_pro: '$0.15/video'
```

**Best For:**
- High-end commercial content
- Cinematic storytelling
- Content requiring dialogue
- Premium brand campaigns
- When audio is critical

**Use When:**
- User requests "cinematic", "luxury", "premium"
- Project budget allows premium tier
- Native audio is essential
- Photorealistic quality required

**Prompting Best Practices:**
```markdown
Structure: [Shot Type] + [Subject] + [Action] + [Environment] + [Style] + [Audio]

Example:
"Medium close-up shot of a professional woman in business attire, 
speaking confidently to camera about quarterly results, 
in a modern glass office with city skyline visible through windows, 
cinematic lighting with soft natural light, 
professional and authoritative voice tone"

Key Elements:
1. Camera Movement: "static", "slow pan", "dolly forward", "tracking shot"
2. Subject Detail: Age, clothing, expression, posture
3. Action: Specific, observable behaviors
4. Environment: Lighting, background, atmosphere
5. Audio Direction: Voice tone, background sounds, music style
```

**Workflow Integration:**
```yaml
Pattern 1 - Text to Video:
  Input: Text prompt
  Process: Sora 2 generates video + audio
  Output: Complete video file
  
Pattern 2 - Image to Video:
  Input: Image + motion prompt
  Process: Sora 2 animates with audio
  Output: Video with natural sound
  
Pattern 3 - Dialogue Scene:
  Input: Script + character description
  Process: Sora 2 creates lipsync video
  Output: Video with synchronized speech
```

---

#### Veo 3.1 (Google via FAL.AI)

**Capabilities:**
- Image-to-video with native audio
- Enhanced narrative control
- Dialogue + ambient sounds
- Photorealistic rendering
- Up to 60 seconds, 1080p

**Specifications:**
```yaml
model_id: 'fal-ai/veo-3.1'
provider: 'FAL.AI'
category: 'video_generation'
quality: 'premium'

input_modes:
  - image_to_video
  - text_to_video

capabilities:
  - Native audio (dialogue + ambient)
  - Strong prompt adherence
  - Realistic textures
  - Narrative understanding
  - Camera control

specifications:
  duration: 'up to 60 seconds'
  resolution: '1080p'
  audio: 'native (dialogue + ambient)'
  generation_time: '2-4 minutes'
  
pricing: '$0.12/video'
```

**Best For:**
- Image-to-video animation with audio
- Scenes requiring dialogue
- Narrative-driven content
- Photorealistic animated scenes

**Use When:**
- Starting from reference images
- Need dialogue + ambient audio
- Budget allows premium tier
- Narrative coherence is critical

**Prompting Formula:**
```markdown
Structure: [Image Description] + [Motion Direction] + [Audio Cues] + [Mood]

Example for Image-to-Video:
"The woman in the uploaded image turns her head slowly toward the camera 
with a warm smile, her hair moves naturally in a gentle breeze, 
soft ambient café sounds with quiet conversation in background, 
intimate and welcoming atmosphere"

Key Elements:
1. Reference Acknowledgment: "The [subject] in the uploaded image..."
2. Motion Description: Specific, realistic movements
3. Audio Layering: Dialogue + ambient + optional music
4. Mood/Atmosphere: Emotional tone of the scene
5. Camera Behavior: "maintain focus", "slight zoom", "rack focus"
```

**Workflow Integration:**
```yaml
Pattern 1 - Animate Product Photo:
  Step 1: Generate product image (FLUX Pro)
  Step 2: Animate with Veo 3.1
  Output: Video with ambient product sounds
  
Pattern 2 - Character Scene:
  Step 1: Generate character portrait (FLUX Pro)
  Step 2: Animate with dialogue (Veo 3.1)
  Output: Talking character video
  
Pattern 3 - Environment Scene:
  Input: Location photo
  Process: Veo 3.1 animates with ambient audio
  Output: Living environment video
```

---

### 3.2 Video Generation - Standard Tier

#### Kling 2.5 Turbo Pro (Kuaishou via FAL.AI)

**Capabilities:**
- Exceptional motion fluidity
- Cinematic shot execution
- Strong prompt accuracy
- Text-to-video & Image-to-video
- Best quality/price ratio

**Specifications:**
```yaml
model_id: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video'
          'fal-ai/kling-video/v2.5-turbo/pro/image-to-video'
provider: 'FAL.AI'
category: 'video_generation'
quality: 'standard'

input_modes:
  - text_to_video
  - image_to_video

capabilities:
  - Cinematic motion quality
  - Camera movement control
  - Physics-based realism
  - Fast generation
  - Cost-effective

specifications:
  duration: '5-10 seconds'
  resolution: '1080p'
  audio: 'NO (add separately)'
  generation_time: '1-2 minutes'
  
pricing:
  base_5s: '$0.35'
  per_extra_second: '$0.07'
  example_10s: '$0.70'
```

**Best For:**
- High-quality standard videos
- Budget-conscious projects
- Quick turnaround needs
- Social media content
- Product demos without audio

**Use When:**
- DEFAULT choice for video generation
- Budget is moderate
- Audio can be added separately
- Fast delivery needed

**Prompting Best Practices:**
```markdown
Structure: [Camera] + [Subject] + [Action] + [Environment] + [Style]

Example Text-to-Video:
"Slow dolly shot moving forward, a sleek smartphone rotating on a white 
pedestal, light reflections dancing on its screen, minimalist studio 
with soft gradient background, professional product photography style"

Example Image-to-Video:
"Smooth rotation around the product, maintaining perfect focus, 
subtle floating motion suggesting lightness, professional studio 
lighting with soft shadows, elegant and refined movement"

Key Elements:
1. Camera Movement: Be specific - "dolly", "crane up", "orbit", "static"
2. Subject Behavior: Clear, achievable motions
3. Physics: "floating", "falling", "spinning", "natural gravity"
4. Style Consistency: Match the prompt style throughout
5. Duration Planning: Complex motions need longer duration
```

**Workflow Integration:**
```yaml
Pattern 1 - Product Demo:
  Step 1: Generate product image (FLUX Pro)
  Step 2: Animate product (Kling 2.5)
  Step 3: Add voiceover (XTTS)
  Step 4: Composite (Video Composer)
  
Pattern 2 - Multi-Scene Video:
  Step 1: Generate 5 scene images (FLUX Pro, parallel)
  Step 2: Animate all scenes (Kling 2.5, staggered)
  Step 3: Add audio (XTTS)
  Step 4: Sequence and composite
  
Pattern 3 - Social Media Ad:
  Input: Product photo
  Process: Kling animates (5s)
  Add: Text overlay + music
  Output: Instagram-ready video
```

---

#### Wan 2.5 (via FAL.AI)

**Capabilities:**
- Image-to-video with native audio
- Natural motion
- Good quality/price
- Audio synchronization

**Specifications:**
```yaml
model_id: 'fal-ai/wan-2.5'
provider: 'FAL.AI'
category: 'video_generation'
quality: 'standard'

input_modes:
  - image_to_video

capabilities:
  - Native audio generation
  - Smooth motion
  - Good realism

specifications:
  duration: 'up to 10 seconds'
  resolution: '720p'
  audio: 'native (included)'
  generation_time: '2-3 minutes'
  
pricing: '$0.08/video'
```

**Best For:**
- Budget image animation with audio
- When Veo/Sora too expensive
- Simple animated scenes

**Use When:**
- Need audio but budget limited
- Image-to-video is sufficient
- Standard quality acceptable

---

### 3.3 Video Generation - Specialized

#### Runway Gen-3 Alpha/Turbo (via FAL.AI)

**Capabilities:**
- Video-to-video transformation
- Style transfer
- Object manipulation
- Scene editing

**Specifications:**
```yaml
model_id: 'fal-ai/runway/gen3-alpha'
          'fal-ai/runway/gen3-turbo'
provider: 'FAL.AI'
category: 'video_editing'
quality: 'premium'

input_modes:
  - video_to_video

capabilities:
  - Style transformation
  - Object add/remove
  - Scene modification
  - Temporal consistency

specifications:
  input: 'existing video'
  output: 'transformed video'
  generation_time: '3-5 minutes'
  
pricing:
  gen3_alpha: '$0.12/video'
  gen3_turbo: '$0.08/video'
```

**Best For:**
- Transforming existing footage
- Style changes
- Scene modifications
- Creative video editing

**Use When:**
- User has source video
- Needs transformation not generation
- Style transfer required

**Prompting Formula:**
```markdown
Structure: [Source Description] + [Transformation Goal] + [Style Target] + [Preserve Elements]

Example:
"Transform this smartphone product video from realistic photographic style 
to vibrant 3D animated style, maintaining exact product proportions and 
camera movements, add glowing UI elements floating around device, 
futuristic tech aesthetic with neon accents"

Key Elements:
1. Source Recognition: Acknowledge original style
2. Clear Transformation: What should change
3. Preservation Rules: What must stay the same
4. Style Reference: Specific aesthetic goals
```

---

#### MiniMax Hailuo-02 (via FAL.AI)

**Capabilities:**
- Image-to-video
- Good motion quality
- Fast generation

**Specifications:**
```yaml
model_id: 'fal-ai/minimax-hailuo-02'
provider: 'FAL.AI'
category: 'video_generation'
quality: 'standard'

specifications:
  duration: '6 seconds'
  audio: 'NO'
  cost: '$0.06/video'
```

**Best For:**
- Budget image animation
- When speed is priority
- Simple motion needs

---

#### OmniHuman v1.5 (via FAL.AI)

**Capabilities:**
- Realistic human avatars
- Natural gestures & expressions
- Lip-sync support
- Multi-language
- Custom voice integration

**Specifications:**
```yaml
model_id: 'fal-ai/omnihuman-v1.5'
provider: 'FAL.AI'
category: 'ugc_video'
quality: 'premium'

input_modes:
  - text_script
  - audio_file

capabilities:
  - Photorealistic avatars
  - Natural gestures
  - Lip synchronization
  - Expression control
  - Multiple languages

specifications:
  duration: 'up to 60 seconds'
  resolution: '1280x720'
  generation_time: '2-3 minutes'
  audio_source: 'TTS or custom'
  
pricing: '$0.15/video'
```

**Best For:**
- UGC-style marketing videos
- Product testimonials
- Educational content
- Spokesperson videos
- Social media ads

**Use When:**
- Need authentic, casual human presence
- User requests "influencer style" or "testimonial"
- Budget allows for premium avatar
- Multi-lingual content needed

**Prompting Formula:**
```markdown
Structure: [Avatar Description] + [Script/Message] + [Tone/Emotion] + [Setting]

Example:
"Young professional woman, 28-32 years old, casual business attire 
(white blouse, natural makeup), enthusiastic and friendly demeanor, 
speaking about productivity software benefits, energetic but authentic tone, 
bright modern home office background with plants and natural light"

Key Elements:
1. Avatar Details: Age, ethnicity, clothing, distinctive features
2. Script Content: The actual message to deliver
3. Emotional Tone: How they should speak and gesture
4. Setting: Background and environment
5. Camera: Usually "medium close-up, eye-level"
```

**Workflow Integration:**
```yaml
Pattern 1 - Text to UGC Video:
  Step 1: Generate script (if needed)
  Step 2: XTTS generates voice
  Step 3: OmniHuman creates avatar video
  Output: UGC-style video with audio
  
Pattern 2 - Custom Voice UGC:
  Step 1: User uploads audio
  Step 2: OmniHuman lip-syncs avatar
  Output: Avatar video with custom voice
  
Pattern 3 - Multi-Lingual Campaign:
  Step 1: Translate script (5 languages)
  Step 2: XTTS for each language
  Step 3: OmniHuman for each version
  Output: 5 localized videos
```

---

### 3.4 Image Generation - Premium Tier

#### FLUX 1.1 Pro / FLUX Pro (via FAL.AI)

**Capabilities:**
- State-of-the-art photorealism
- Exceptional detail
- Text accuracy
- Fast generation
- Versatile styles

**Specifications:**
```yaml
model_id: 'fal-ai/flux-pro/v1.1' (latest)
          'fal-ai/flux-pro' (stable)
provider: 'FAL.AI'
category: 'image_generation'
quality: 'premium'

capabilities:
  - Photorealistic output
  - Accurate text rendering
  - Fine detail preservation
  - Style versatility
  - Fast generation

specifications:
  resolution: 'up to 2048x2048'
  generation_time: '10-15 seconds'
  format: 'PNG, JPEG'
  
pricing:
  flux_pro_v1.1: '$0.055/image'
  flux_pro: '$0.055/image'
```

**Best For:**
- Product photography
- Marketing materials
- Photorealistic scenes
- High-detail requirements
- Professional content

**Use When:**
- DEFAULT choice for image generation
- Quality is important
- Photorealism needed
- Professional output required

**Prompting Best Practices:**
```markdown
Structure: [Subject] + [Details] + [Environment/Context] + [Lighting] + [Style] + [Technical]

Example Product:
"Professional product photography of a premium wireless headphone, 
matte black finish with rose gold accents, subtle LED glow on ear cups, 
placed on white marble surface with soft shadows, studio lighting with 
key light from top-right creating gentle highlights, commercial advertising 
style, shot with macro lens, shallow depth of field, 8K quality, 
hyperrealistic details"

Example Scene:
"Modern minimalist home office interior, large wooden desk with laptop 
and coffee mug, floor-to-ceiling windows showing city skyline at sunset, 
warm golden hour lighting streaming through, indoor plants on shelves, 
architectural photography style, wide-angle perspective, professional 
real estate quality, vibrant but natural colors"

Key Elements:
1. Subject Clarity: Be specific about the main element
2. Material Details: Textures, finishes, surfaces
3. Lighting Direction: Source, intensity, quality
4. Composition: Angle, framing, perspective
5. Style References: Photography style, mood, treatment
6. Technical Specs: Quality indicators (8K, hyperrealistic, etc.)
```

**Workflow Integration:**
```yaml
Pattern 1 - Single Image:
  Input: Detailed prompt
  Process: FLUX Pro generates
  Output: High-res image
  
Pattern 2 - Image Series:
  Input: Base prompt + variations
  Process: FLUX Pro batch (parallel)
  Output: Consistent image set
  
Pattern 3 - Image-to-Video Pipeline:
  Step 1: FLUX Pro generates base image
  Step 2: Kling/Veo animates
  Output: Video from generated image
  
Pattern 4 - Character Consistency:
  Step 1: FLUX Pro generates character
  Step 2: Use as reference for additional FLUX Pro images
  Step 3: Nano Banana for edits/consistency
  Output: Consistent character across scenes
```

---

#### FLUX Schnell (via FAL.AI)

**Capabilities:**
- Fast generation
- Good quality
- Cost-effective
- Reliable output

**Specifications:**
```yaml
model_id: 'fal-ai/flux/schnell'
provider: 'FAL.AI'
category: 'image_generation'
quality: 'standard'

capabilities:
  - Quick generation (3-5s)
  - Solid quality
  - Budget-friendly

specifications:
  resolution: 'up to 1024x1024'
  generation_time: '3-5 seconds'
  
pricing: '$0.003/image'
```

**Best For:**
- Rapid prototyping
- Budget projects
- High-volume generation
- When speed > quality

**Use When:**
- User requests "fast" or "draft"
- Budget is very limited
- Testing/iteration phase
- Volume over perfection

---

#### Recraft v3 (via FAL.AI)

**Capabilities:**
- Illustration styles
- Cartoon/anime aesthetics
- Design-focused output
- Brand-friendly

**Specifications:**
```yaml
model_id: 'fal-ai/recraft-v3'
provider: 'FAL.AI'
category: 'image_generation'
quality: 'premium'

capabilities:
  - Illustration styles
  - Cartoon/anime
  - Graphic design
  - Brand materials

specifications:
  styles: 'digital_illustration', 'realistic_image', 'vector_illustration'
  resolution: 'up to 1024x1024'
  
pricing: '$0.04/image'
```

**Best For:**
- Illustrations
- Cartoon characters
- Graphic design
- Brand materials
- Non-photorealistic needs

**Use When:**
- User requests artistic/illustration style
- Cartoon or anime aesthetic
- Design-focused project
- Brand identity work

**Prompting Formula:**
```markdown
Structure: [Style Descriptor] + [Subject] + [Aesthetic] + [Color Palette] + [Composition]

Example Illustration:
"Digital illustration style, cheerful cartoon mascot character of a smiling 
coffee cup with arms and legs, friendly and approachable personality, 
warm color palette with browns and creams, simple shapes with bold outlines, 
clean flat design, centered composition, white background"

Example Brand Material:
"Vector illustration, modern tech startup logo incorporating abstract 
network connections, minimalist geometric shapes, professional blue and 
green gradient, scalable design, negative space utilization, suitable 
for both light and dark backgrounds"

Key Elements:
1. Style Declaration: Start with exact style needed
2. Simplicity: Clear, simple descriptions work best
3. Color Strategy: Specific palette guidance
4. Design Principles: Flat, bold outlines, etc.
5. Use Context: Where/how it will be used
```

---

#### Recraft v3 SVG (via FAL.AI)

**Capabilities:**
- Vector graphics
- Scalable logos
- Text + graphics
- High precision

**Specifications:**
```yaml
model_id: 'fal-ai/recraft-v3/svg'
provider: 'FAL.AI'
category: 'image_generation'
subcategory: 'vector'
quality: 'premium'

capabilities:
  - Vector output (SVG)
  - Infinite scalability
  - Text rendering
  - Logo creation

specifications:
  format: 'SVG'
  text_support: 'YES (excellent)'
  
pricing: '$0.04/image'
```

**Best For:**
- Logos
- Text-heavy graphics
- Scalable designs
- Icons and symbols

**Use When:**
- User needs vector format
- Logos or icons required
- Text is important element
- Scalability needed

---

#### Midjourney V7 (via KIE.AI)

**Capabilities:**
- Artistic, original imagery
- Exceptional aesthetic quality
- Creative interpretations
- Unique visual styles

**Specifications:**
```yaml
model_id: 'midjourney-v7'
provider: 'KIE.AI'
category: 'image_generation'
quality: 'premium'

capabilities:
  - Artistic interpretations
  - Unique aesthetics
  - Creative styles
  - High originality

specifications:
  resolution: 'variable (up to 2048px)'
  style_range: 'extremely wide'
  
pricing: '~$0.04-0.08/image (via KIE.AI credit system)'
```

**Best For:**
- Artistic projects
- Creative campaigns
- Unique visual identity
- When originality is key

**Use When:**
- User requests "artistic", "unique", "creative"
- Standard photorealism too generic
- Brand needs distinctive look
- Budget allows KIE.AI access

**Prompting Formula:**
```markdown
Midjourney Style: [Artistic Direction] + [Subject] + [Mood] + [Technical Parameters]

Example:
"Ethereal fantasy portrait of a modern tech entrepreneur, dramatic lighting 
with chiaroscuro effect, mysterious and visionary atmosphere, painterly 
digital art style, intricate details, cinematic composition --ar 16:9 --style raw"

Key Elements:
1. Artistic Language: Use evocative, visual terms
2. Mood/Atmosphere: Emotional quality of image
3. Style References: Art movements, techniques
4. Midjourney Parameters: --ar, --style, --chaos, etc.
5. Quality Focus: Detailed, intricate, cinematic
```

---

#### Hunyuan Image 3 (via FAL.AI)

**Capabilities:**
- Excellent text accuracy
- Photorealistic output
- Chinese language support
- Good detail

**Specifications:**
```yaml
model_id: 'fal-ai/hunyuan-image-3'
provider: 'FAL.AI'
category: 'image_generation'
quality: 'premium'

capabilities:
  - Accurate text rendering
  - Photorealistic style
  - Chinese text support
  - High detail

pricing: '$0.05/image'
```

**Best For:**
- Images with text elements
- Multi-lingual content (especially Chinese)
- Photorealistic needs
- Alternative to FLUX Pro

**Use When:**
- Text accuracy is critical
- Chinese language content
- Alternative to FLUX Pro
- Specific use cases requiring text

---

### 3.5 Image Editing

#### Nano Banana (Google via FAL.AI)

**Capabilities:**
- State-of-the-art image editing
- Natural language instructions
- Photorealistic editing
- Character consistency
- Object manipulation

**Specifications:**
```yaml
model_id: 'fal-ai/nano-banana/edit'
provider: 'FAL.AI'
category: 'image_editing'
quality: 'premium'

capabilities:
  - Natural language editing
  - Photorealistic output
  - Object add/remove
  - Style preservation
  - Detail enhancement
  - Character consistency

specifications:
  input: 'image + text instruction'
  output: 'edited image'
  generation_time: '5-10 seconds'
  
pricing: '$0.03/edit'

ranking: '#1 on LMArena image editing leaderboard'
```

**Best For:**
- Editing existing images
- Character consistency across scenes
- Object removal/addition
- Style-preserving modifications
- Photorealistic touch-ups

**Use When:**
- Starting from existing image
- Need to modify without regenerating
- Character consistency critical
- Photorealistic edits required

**Prompting Formula:**
```markdown
Structure: [Current State] + [Change Request] + [Preservation Rules]

Example Object Removal:
"Remove the coffee cup from the table while maintaining the wood grain 
pattern and lighting, preserve all shadows and reflections from other 
objects, photorealistic blending"

Example Character Consistency:
"Change the woman's clothing from business suit to casual sweater and 
jeans, keep exact same face, hair style, and pose, maintain photographic 
lighting and background, natural and realistic"

Example Style Edit:
"Convert daytime scene to golden hour lighting, warm sunset tones, 
maintain all objects and composition, enhance shadows and add warm glow, 
photorealistic outdoor lighting"

Key Elements:
1. Clear Instruction: What should change
2. Preservation Rules: What must stay the same
3. Quality Expectations: Photorealistic, natural, seamless
4. Context Understanding: Reference the existing image
```

**Workflow Integration:**
```yaml
Pattern 1 - Character Consistency Series:
  Step 1: FLUX Pro generates base character
  Step 2: Nano Banana edits for scene variations
  Output: Consistent character across contexts
  
Pattern 2 - Product Variations:
  Step 1: FLUX Pro generates product base
  Step 2: Nano Banana changes colors/styles
  Output: Product line variations
  
Pattern 3 - Scene Enhancement:
  Step 1: Generate base scene (FLUX Pro)
  Step 2: Nano Banana adds/removes elements
  Step 3: Final polish
  Output: Refined final image
```

---

### 3.6 Audio Generation

#### XTTS v2 (Internal - AIDA)

**Capabilities:**
- Natural voice synthesis
- 29+ languages
- Voice cloning
- Emotional control
- Fast generation

**Specifications:**
```yaml
model_id: 'xtts-v2'
provider: 'Internal (AIDA)'
category: 'audio_generation'
subcategory: 'text_to_speech'
quality: 'premium'

capabilities:
  - Natural TTS
  - Multi-lingual (29+ languages)
  - Voice cloning support
  - Emotion control
  - Fast generation

specifications:
  languages: 'en, it, es, fr, de, pt, pl, ar, zh, ja, ko, etc.'
  generation_time: '5-10 seconds'
  cost: 'FREE (internal)'
  quality: '24kHz, clear audio'

voice_options:
  - professional_male
  - professional_female
  - casual_male
  - casual_female
  - enthusiastic
  - calm
  - authoritative
```

**Best For:**
- Voiceovers
- Narration
- Character voices
- Multi-lingual content
- Educational videos

**Use When:**
- ANY text-to-speech need (first choice)
- Multiple language versions
- Budget is consideration (FREE)
- Voice customization needed

**Prompting Formula:**
```markdown
Structure: [Text Content] + [Voice Character] + [Emotion/Pace] + [Use Context]

Example Professional:
Text: "Introducing our latest innovation in productivity software..."
Voice: professional_female
Emotion: confident and energetic
Pace: moderate with emphasis on "innovation" and "productivity"
Context: Product launch video voiceover

Example Casual:
Text: "Hey everyone! Today I'm going to show you how to..."
Voice: casual_male
Emotion: friendly and enthusiastic
Pace: conversational with natural pauses
Context: Tutorial video narration

Key Elements:
1. Script Quality: Well-written, natural-sounding text
2. Voice Selection: Match to content type
3. Emotional Direction: How it should sound
4. Pacing Guidance: Speed and rhythm
5. Context: Where/how audio will be used
```

**Workflow Integration:**
```yaml
Pattern 1 - Video Voiceover:
  Step 1: XTTS generates audio
  Step 2: Video Composer adds to video
  Output: Video with voiceover
  
Pattern 2 - UGC Avatar Video:
  Step 1: XTTS generates voice
  Step 2: OmniHuman lip-syncs
  Output: Avatar video with speech
  
Pattern 3 - Multi-Lingual Campaign:
  Step 1: Script in 5 languages
  Step 2: XTTS for each language
  Step 3: Pair with localized visuals
  Output: 5 language versions
```

---

#### Udio (via KIE.AI)

**Capabilities:**
- Music generation
- Multiple genres
- Custom lyrics
- Professional quality

**Specifications:**
```yaml
model_id: 'udio'
provider: 'KIE.AI'
category: 'audio_generation'
subcategory: 'music'
quality: 'premium'

capabilities:
  - Music creation
  - Genre diversity
  - Lyric integration
  - Commercial quality

specifications:
  duration: 'up to 2 minutes'
  format: 'MP3, WAV'
  
pricing: '~$0.10-0.20/track (via KIE.AI credits)'
```

**Best For:**
- Background music
- Original soundtracks
- Brand audio identity
- Music videos

**Use When:**
- Need original music
- Custom audio branding
- Background tracks for videos
- Budget allows KIE.AI

---

### 3.7 Fallback & Alternative Models

**IMPORTANT:** Always have fallback options ready

#### Video Fallbacks:
```yaml
Primary: Kling 2.5 Turbo Pro
Fallback 1: MiniMax Hailuo-02
Fallback 2: Wan 2.5
Final: Ltx Video (for image-to-video only)
```

#### Image Fallbacks:
```yaml
Primary: FLUX Pro
Fallback 1: FLUX Schnell
Fallback 2: Hunyuan Image 3
Final: Recraft v3 (if style allows)
```

#### Audio Fallbacks:
```yaml
Primary: XTTS v2 (internal - always use first)
Fallback 1: N/A (XTTS is internal and free)
If XTTS fails: Report error, ask user for external audio
```

---

## 4. Decision Engine

### 4.1 Model Selection Algorithm

```typescript
function selectModel(brief: ProjectBrief): ModelAssignment {
  // Step 1: Identify content type
  const contentType = identifyContentType(brief);
  
  // Step 2: Determine quality tier
  const qualityTier = determineQualityTier(brief);
  
  // Step 3: Check special requirements
  const specialReqs = analyzeSpecialRequirements(brief);
  
  // Step 4: Apply decision tree
  return applyDecisionTree(contentType, qualityTier, specialReqs, brief.budget);
}

function identifyContentType(brief: ProjectBrief): ContentType {
  if (brief.type === 'video') {
    if (brief.sourceVideo) return 'video_to_video';
    if (brief.sourceImages?.length > 0) return 'image_to_video';
    return 'text_to_video';
  }
  
  if (brief.type === 'image') {
    if (brief.sourceImage) return 'image_editing';
    return 'image_generation';
  }
  
  if (brief.type === 'audio') {
    if (brief.musicNeeded) return 'music_generation';
    return 'voice_generation';
  }
  
  return 'multi_asset'; // Complex project
}

function determineQualityTier(brief: ProjectBrief): QualityTier {
  const keywords = brief.description.toLowerCase();
  
  // Check for explicit tier requests
  if (matchesAny(keywords, ['cinematic', 'luxury', 'premium', '4k', 'ultra'])) {
    return 'cinematic';
  }
  
  if (matchesAny(keywords, ['professional', 'high-quality', 'polished'])) {
    return 'premium';
  }
  
  if (matchesAny(keywords, ['fast', 'quick', 'draft', 'budget'])) {
    return 'fast';
  }
  
  // Check budget constraints
  if (brief.budget?.max_cost && brief.budget.max_cost < 0.50) {
    return 'fast';
  }
  
  return 'standard'; // Default
}

function analyzeSpecialRequirements(brief: ProjectBrief): SpecialReqs {
  return {
    needsAudio: checkAudioRequirement(brief),
    needsConsistency: checkConsistencyRequirement(brief),
    needsEditing: brief.sourceImage || brief.sourceVideo,
    specificStyle: extractStyleRequirement(brief),
    multiScene: brief.scenes?.length > 1
  };
}
```

### 4.2 Decision Trees

#### Video Generation Decision Tree:

```yaml
INPUT: ProjectBrief with type='video'

BRANCH 1: Quality Tier
  IF cinematic/luxury:
    - Has audio need? → Sora 2 Pro
    - Image-to-video? → Veo 3.1
    - Text-to-video? → Sora 2
  
  IF standard:
    - DEFAULT → Kling 2.5 Turbo Pro
    - Needs audio? → Wan 2.5 (if budget tight)
    - UGC style? → Check if avatar needed
  
  IF fast/budget:
    - Image-to-video → MiniMax Hailuo-02
    - Text-to-video → Kling 2.5 Turbo (shorter duration)

BRANCH 2: Special Requirements
  IF video_to_video:
    → Runway Gen-3 (always)
  
  IF ugc_style AND avatar_needed:
    → OmniHuman v1.5 (always)
  
  IF audio_critical AND budget_allows:
    → Sora 2 or Veo 3.1

FALLBACK CHAIN:
  Primary fails → Fallback 1 → Fallback 2 → Notify user
```

#### Image Generation Decision Tree:

```yaml
INPUT: ProjectBrief with type='image'

BRANCH 1: Generation vs Editing
  IF sourceImage exists:
    → Nano Banana (always for editing)
  
  ELSE: Generation needed

BRANCH 2: Style Requirement
  IF photorealistic OR professional:
    - Quality: premium → FLUX Pro v1.1
    - Quality: standard → FLUX Pro
    - Quality: fast → FLUX Schnell
  
  IF artistic OR unique:
    → Midjourney V7 (via KIE.AI)
  
  IF illustration OR cartoon:
    → Recraft v3
  
  IF logo OR vector OR text-heavy:
    → Recraft v3 SVG

BRANCH 3: Special Cases
  IF text_accuracy_critical:
    → Hunyuan Image 3 OR Recraft v3 SVG
  
  IF character_consistency_needed:
    → FLUX Pro + Nano Banana for edits

FALLBACK CHAIN:
  FLUX Pro → FLUX Schnell → Hunyuan → Notify user
```

#### Audio Generation Decision Tree:

```yaml
INPUT: ProjectBrief with type='audio'

BRANCH 1: Audio Type
  IF music OR soundtrack:
    → Udio (via KIE.AI)
  
  IF voiceover OR narration OR speech:
    → XTTS v2 (ALWAYS first choice - internal & free)

BRANCH 2: Voice Quality
  XTTS v2 handles all cases:
    - Professional: professional_male/female voice
    - Casual: casual_male/female voice
    - Emotional: Configure emotion parameter
    - Multi-lingual: Support for 29+ languages

FALLBACK:
  XTTS fails? → Report error, no automatic fallback
  (XTTS is internal, failures are rare and should be investigated)
```

### 4.3 Cost Optimization Logic

```typescript
function optimizeCost(plan: ExecutionPlan, budget: BudgetConstraints): ExecutionPlan {
  const currentCost = calculateTotalCost(plan);
  
  if (!budget.max_cost || currentCost <= budget.max_cost) {
    return plan; // Within budget
  }
  
  // Cost reduction strategies (in order of preference)
  
  // Strategy 1: Swap premium models for standard (minimal quality impact)
  if (plan.primaryModel.name === 'Sora 2 Pro') {
    plan.primaryModel = getModel('Sora 2'); // Save $0.05
  }
  
  if (plan.primaryModel.name === 'FLUX Pro v1.1') {
    plan.primaryModel = getModel('FLUX Pro'); // Same cost, slight quality trade
  }
  
  // Strategy 2: Reduce video duration if flexible
  if (plan.videoDuration && plan.videoDuration > 5) {
    plan.videoDuration = 5; // Use base cost only
  }
  
  // Strategy 3: Use faster models
  if (plan.primaryModel.name === 'Kling 2.5 Pro') {
    plan.primaryModel = getModel('MiniMax Hailuo-02'); // Save $0.29
  }
  
  // Strategy 4: Reduce image resolution
  if (plan.imageResolution === '2048x2048') {
    plan.imageResolution = '1024x1024';
  }
  
  // Strategy 5: Inform user if still over budget
  const newCost = calculateTotalCost(plan);
  if (newCost > budget.max_cost) {
    plan.budgetWarning = {
      requested: budget.max_cost,
      optimized: newCost,
      message: "Cannot meet budget without quality compromise. Suggest user increase budget or accept draft quality."
    };
  }
  
  return plan;
}
```

### 4.4 Quality Tier Matrix

```yaml
Quality Tiers:

CINEMATIC (Premium+):
  Video: Sora 2 Pro, Veo 3.1
  Image: FLUX Pro v1.1, Midjourney V7
  Use Cases: High-end commercial, luxury brands, film-quality
  Cost: $0.12-0.15 per asset
  Timeline: Slower (3-5 min per asset)

PREMIUM:
  Video: Sora 2, Kling 2.5 Pro
  Image: FLUX Pro, Recraft v3
  Use Cases: Professional marketing, brand campaigns
  Cost: $0.05-0.10 per asset
  Timeline: Moderate (2-3 min per asset)

STANDARD (Default):
  Video: Kling 2.5 Turbo Pro, Wan 2.5
  Image: FLUX Pro, FLUX Schnell
  Use Cases: Social media, content marketing, general use
  Cost: $0.03-0.07 per asset
  Timeline: Fast (1-2 min per asset)

FAST:
  Video: MiniMax Hailuo-02
  Image: FLUX Schnell
  Use Cases: Rapid prototyping, high-volume, drafts
  Cost: $0.003-0.06 per asset
  Timeline: Very fast (30s - 1min per asset)
```

---

## 5. Workflow Patterns

### 5.1 Single-Model Workflows

#### Pattern A: Simple Image Generation
```yaml
Use Case: "Generate a product photo"

Workflow:
  agent: Visual Creator
  model: FLUX Pro
  steps:
    - Receive prompt
    - Generate image
    - Return result
  
  cost: $0.055
  time: ~15 seconds
```

#### Pattern B: Simple Video Generation
```yaml
Use Case: "Create a 10-second product demo video"

Workflow:
  agent: Video Composer
  model: Kling 2.5 Turbo Pro
  steps:
    - Receive prompt
    - Generate video (10s)
    - Return result
  
  cost: $0.70 ($0.35 + 5s × $0.07)
  time: ~2 minutes
```

#### Pattern C: UGC Avatar Video
```yaml
Use Case: "Influencer-style product review"

Workflow:
  Step 1: Generate voice (XTTS v2)
    - Input: Script
    - Output: Audio file
    - Cost: $0 (internal)
    - Time: 10 seconds
  
  Step 2: Generate avatar video (OmniHuman)
    - Input: Audio + avatar description
    - Output: Video with lip-sync
    - Cost: $0.15
    - Time: 2-3 minutes
  
  total_cost: $0.15
  total_time: ~3 minutes
```

### 5.2 Multi-Step Workflows

#### Pattern D: Multi-Scene Marketing Video
```yaml
Use Case: "60-second video with 6 scenes, voiceover, and music"

Workflow:
  Phase 1 - Asset Generation (Parallel):
    Task 1a: Generate 6 scene images (FLUX Pro)
      - Parallel execution
      - Cost: 6 × $0.055 = $0.33
      - Time: ~90s (parallel)
    
    Task 1b: Generate voiceover (XTTS v2)
      - Parallel with images
      - Cost: $0 (internal)
      - Time: ~10s
  
  Phase 2 - Animation (Staggered):
    Task 2: Animate 6 scenes (Kling 2.5 Pro)
      - Staggered: 2-3 at a time
      - Cost: 6 × $0.35 (5s each) = $2.10
      - Time: ~10 minutes (staggered)
  
  Phase 3 - Composition:
    Task 3: Composite final video
      - Add voiceover
      - Add background music (from library or Udio)
      - Sequence scenes
      - Transitions
      - Cost: $0 (internal processing)
      - Time: ~2 minutes
  
  Total Cost: $2.43 (+ music if Udio used)
  Total Time: ~13 minutes
```

#### Pattern E: Character Consistency Series
```yaml
Use Case: "3 images of same character in different scenes"

Workflow:
  Step 1: Generate base character (FLUX Pro)
    - Detailed character prompt
    - Cost: $0.055
    - Time: 15s
  
  Step 2: Generate scene variations (Nano Banana)
    - Input: Base character + scene descriptions
    - Edit 1: Office environment
    - Edit 2: Outdoor park
    - Edit 3: Home setting
    - Cost: 3 × $0.03 = $0.09
    - Time: ~30s total
  
  Alternative Step 2: Re-generate with consistency
    - FLUX Pro with base character reference
    - Cost: 3 × $0.055 = $0.165
    - Time: ~45s total
  
  Total Cost: $0.145 (Nano Banana) or $0.22 (FLUX Pro)
  Total Time: ~1 minute

Decision Logic:
  - Nano Banana: For simple edits (clothing, background)
  - FLUX Pro: For major scene changes
```

#### Pattern F: Image-to-Video Pipeline
```yaml
Use Case: "Animate a product photo into a video"

Workflow:
  Option A - User has photo:
    Step 1: User uploads image
    Step 2: Animate with Kling 2.5 Pro (I2V)
    Cost: $0.35
    Time: ~2 minutes
  
  Option B - Generate then animate:
    Step 1: Generate product image (FLUX Pro)
      - Cost: $0.055
      - Time: 15s
    
    Step 2: Animate image (Kling 2.5 Pro I2V)
      - Cost: $0.35
      - Time: ~2 minutes
    
    Total: $0.405, ~2.5 minutes
  
  Option C - Premium with audio:
    Step 1: Generate image (FLUX Pro)
    Step 2: Animate with Veo 3.1 (audio included)
    Cost: $0.055 + $0.12 = $0.175
    Time: ~3 minutes
```

#### Pattern G: Video Style Transfer
```yaml
Use Case: "Transform existing video to different style"

Workflow:
  Step 1: User uploads source video
  Step 2: Runway Gen-3 transforms
    - Input: Video + style prompt
    - Output: Transformed video
    - Cost: $0.12 (Alpha) or $0.08 (Turbo)
    - Time: ~4 minutes
  
  Example: "Realistic iPhone video → 3D animated style"
```

#### Pattern H: Complex Poster Design
```yaml
Use Case: "Advertising poster with product, text, and graphics"

Workflow:
  Option A - Single Generation (Simple):
    Step 1: FLUX Pro generates complete poster
      - Prompt includes all elements
      - Cost: $0.055
      - Time: 15s
    
    Risk: Text accuracy may vary
  
  Option B - Composite Approach (Precise):
    Step 1: Generate background scene (FLUX Pro)
      - Cost: $0.055
    
    Step 2: Generate product (FLUX Pro)
      - Cost: $0.055
    
    Step 3: Create text/logo overlay (Recraft v3 SVG)
      - Cost: $0.04
    
    Step 4: Composite in Visual Creator
      - Cost: $0 (internal)
    
    Total: $0.15, ~2 minutes
    Benefit: Perfect text, layered control
```

### 5.3 Parallel vs Sequential Execution

**Parallel Execution (Speed Optimization):**
```yaml
When to Use:
  - Independent tasks
  - Multiple assets of same type
  - Resource availability allows

Example - 5 Product Images:
  Sequential: 5 × 15s = 75 seconds
  Parallel: ~15 seconds (all at once)
  
  Benefit: 5x speed improvement

Implementation:
  - Queue all 5 requests simultaneously
  - Wait for all to complete
  - Return batch result
```

**Sequential Execution (Dependency Chain):**
```yaml
When to Use:
  - Task B depends on Task A output
  - Resource constraints
  - Fallback scenarios

Example - Image-to-Video:
  Step 1: Generate image (MUST complete first)
  Step 2: Animate image (depends on Step 1)
  
  Cannot parallelize

Implementation:
  - Wait for Step 1 completion
  - Use Step 1 output as Step 2 input
  - Proceed sequentially
```

**Staggered Execution (Resource Management):**
```yaml
When to Use:
  - Multiple similar tasks
  - API rate limits
  - Balance speed and resources

Example - 10 Video Animations:
  Fully Parallel: May hit rate limits
  Fully Sequential: Very slow
  Staggered (3 at a time): Optimal
  
  Batch 1: Videos 1-3 (parallel)
  Batch 2: Videos 4-6 (parallel)
  Batch 3: Videos 7-9 (parallel)
  Batch 4: Video 10

Implementation:
  - Define batch size (e.g., 3)
  - Process batches sequentially
  - Within batch, process parallel
```

---

## 6. Prompting Best Practices

### 6.1 Universal Principles

**Principle 1: Specificity Over Vagueness**
```
❌ Bad: "A nice looking product"
✅ Good: "Premium wireless headphones, matte black finish with rose gold accents, 
         soft LED glow on ear cups, macro lens perspective"

Why: AI models need concrete details to generate accurately
```

**Principle 2: Structure Over Stream-of-Consciousness**
```
❌ Bad: "I want a video of someone talking about the product and it should look 
        professional and maybe in an office or something modern"

✅ Good: "Professional female spokesperson, 30s, business attire, presenting to 
         camera in modern glass office, confident delivery, natural lighting from 
         large windows showing city skyline, medium close-up shot"

Why: Structured prompts are easier for models to parse
```

**Principle 3: Visual Language Over Abstract Concepts**
```
❌ Bad: "Make it feel premium and trustworthy"
✅ Good: "Soft ambient lighting, clean minimalist composition, subtle shadows, 
         high-end product photography style, professional color grading"

Why: Models understand visual descriptions, not emotional abstracts
```

**Principle 4: Technical Precision When Needed**
```
For Photography/Video:
  ✅ "Shot with 85mm lens, shallow depth of field, bokeh background"
  ✅ "Golden hour lighting, warm color temperature 5500K"
  ✅ "4K resolution, cinematic 16:9 aspect ratio"

For Design/Illustration:
  ✅ "Flat design style, bold outlines, limited color palette"
  ✅ "Vector illustration, scalable, clean lines"
  ✅ "Geometric shapes, negative space utilization"
```

### 6.2 Model-Specific Prompting

#### FLUX Pro Image Prompting

**Formula:** [Subject] + [Details] + [Environment] + [Lighting] + [Style] + [Technical]

**Example 1 - Product Photography:**
```
Professional product photography of a premium smartwatch, 
sleek titanium case with sapphire crystal display showing elegant watch face,
black leather strap with visible stitching detail,
placed on dark marble surface with subtle reflections,
studio lighting with key light from top-left creating defined highlights,
rim light separating product from background,
minimalist composition with shallow depth of field,
commercial advertising style, 
shot with macro lens at f/2.8,
8K resolution, hyperrealistic details,
professional color grading with slight warm tone
```

**Example 2 - Environmental Scene:**
```
Cozy Scandinavian living room interior,
large L-shaped gray sofa with cream wool throw blankets,
light oak wooden coffee table with ceramic vase holding dried pampas grass,
floor-to-ceiling windows showing snowy forest landscape,
soft diffused natural daylight creating gentle shadows,
warm minimalist aesthetic with hygge atmosphere,
architectural photography style, 
wide-angle 24mm perspective,
slight film grain texture,
muted color palette with whites, grays, and warm wood tones
```

**Key Techniques:**
- **Material specificity**: "matte black", "brushed aluminum", "soft cotton"
- **Lighting direction**: "from top-right", "backlit", "three-point lighting"
- **Camera simulation**: "85mm portrait lens", "wide-angle", "macro detail"
- **Quality markers**: "8K", "hyperrealistic", "professional", "cinematic"

---

#### Sora 2 Video Prompting

**Formula:** [Shot Type] + [Camera Movement] + [Subject] + [Action] + [Environment] + [Lighting] + [Style] + [Audio]

**Example 1 - Product Demo:**
```
Static medium shot transitioning to slow dolly-in,
premium smartphone rotating on white pedestal,
screen displays vibrant UI animation with smooth transitions,
light reflections dancing across glass surface,
minimalist studio environment with gradient background white to light gray,
professional three-point lighting with soft shadows,
commercial product reveal style,
clean and modern aesthetic,
subtle ambient electronic music with whoosh sound effects on UI animations,
polished and premium feel
```

**Example 2 - Testimonial/Spokesperson:**
```
Medium close-up handheld shot with subtle natural movement,
professional woman in casual business attire (white blouse, minimal jewelry),
speaking directly to camera with warm genuine smile,
natural hand gestures emphasizing key points,
modern home office with bookshelves and plants softly blurred in background,
natural window lighting from left side creating soft wrap-around glow,
authentic and relatable documentary style,
professional voice with friendly confident tone discussing productivity improvements,
slight background ambient home office sounds (keyboard clicks, coffee cup),
warm and trustworthy atmosphere
```

**Example 3 - Narrative Scene:**
```
Wide establishing shot, slow crane down movement,
young entrepreneur working late at minimalist desk with laptop,
reviewing documents and making notes, slight worry in expression,
then moment of realization, sits back with relieved smile,
contemporary urban loft apartment, large windows showing twilight city lights,
moody atmospheric lighting, desk lamp providing warm key light,
cinematic indie film aesthetic with slight color grading (teal and orange),
gentle ambient city sounds, distant traffic, soft rain on windows,
contemplative piano melody building to hopeful resolution,
emotional and inspirational tone
```

**Key Techniques for Sora 2:**
- **Audio integration**: Native audio is Sora 2's strength - use it!
- **Camera language**: "dolly", "crane", "pan", "tracking shot", "handheld"
- **Dialogue direction**: Include tone, emotion, pacing for speech
- **Audio layering**: Dialogue + ambient + music (when appropriate)
- **Physics awareness**: Sora 2 understands physics - describe natural movements
- **Emotional beats**: Sora 2 can capture emotional transitions

---

#### Veo 3.1 Image-to-Video Prompting

**Formula:** [Reference Image] + [Motion Description] + [Camera Behavior] + [Audio Cues] + [Atmosphere]

**Example 1 - Animate Portrait:**
```
The woman in the uploaded image,
turns her head slowly from three-quarter profile to face camera,
subtle smile gradually appearing, eyes making gentle contact with viewer,
soft natural movement of hair responding to slight breeze,
camera maintains steady medium close-up framing, slight shallow focus adjustment,
ambient outdoor café sounds: quiet conversation murmur, distant street traffic, coffee cup clink,
gentle acoustic guitar melody in background,
warm and welcoming atmosphere, natural and authentic feeling
```

**Example 2 - Product Animation:**
```
The smartphone shown in the reference image,
begins with screen off, then smoothly powers on with screen glow,
UI animates into view with fluid transitions,
device rotates slowly 15 degrees revealing side profile and depth,
camera circles around product maintaining focus, subtle shift in perspective,
futuristic tech sound effects: soft power-on chime, UI whooshes, subtle electronic hums,
modern minimalist background with soft bokeh,
sleek and premium technology aesthetic
```

**Key Techniques for Veo 3.1:**
- **Image reference acknowledgment**: Always start with "The [subject] in the uploaded image"
- **Motion realism**: Veo 3.1 excels at realistic motion - describe natural movements
- **Audio richness**: Dialogue + ambient + optional music = immersive result
- **Camera behavior**: Describe camera as another element that can move
- **Emotional continuity**: Match motion to the mood of original image

---

#### Kling 2.5 Turbo Pro Prompting

**Formula:** [Camera Movement] + [Subject] + [Action] + [Environment] + [Style]

**Example 1 - Text-to-Video Product:**
```
Slow orbital camera movement around subject,
luxury perfume bottle on rotating glass platform,
elegant design with gold cap catching light as it turns,
crystalline liquid visible through transparent glass,
black gradient background with subtle smoke wisps,
high-end commercial photography style,
dramatic lighting with key light creating star-like reflections,
cinematic and sophisticated aesthetic,
smooth and fluid motion throughout
```

**Example 2 - Image-to-Video Scene:**
```
Gentle forward dolly motion with slight upward tilt,
the architectural building in the reference image,
subtle movement in foreground elements (trees swaying, flags rippling),
people walking in and out of frame naturally,
golden hour lighting with warm glow intensifying slightly,
professional architectural videography style,
maintaining sharp focus on building while creating depth,
living and dynamic urban environment
```

**Key Techniques for Kling 2.5:**
- **Motion focus**: Kling excels at smooth, cinematic motion - emphasize it
- **Camera precision**: Specific camera movements = better results
- **Duration planning**: Complex shots need full 10 seconds
- **Physics description**: "floating", "falling", "rotating" - Kling understands physics
- **No audio**: Don't mention audio (Kling doesn't generate it)

---

#### OmniHuman Avatar Prompting

**Formula:** [Avatar Description] + [Script/Message] + [Delivery Style] + [Emotion] + [Setting]

**Example 1 - UGC Product Review:**
```
Avatar Description:
Young woman, 25-30 years old, casual and approachable style,
wearing comfortable cream-colored sweater,
natural makeup, friendly smile, warm brown eyes,
shoulder-length wavy hair, casual but put-together appearance

Script:
"Hey everyone! I've been using this productivity app for the past month, 
and honestly, it's completely changed how I manage my day. The interface 
is so intuitive, and the smart scheduling feature? Game-changer. 
Highly recommend trying it out!"

Delivery Style:
Authentic and conversational, like talking to a friend,
natural hand gestures for emphasis (hand raised when saying "game-changer"),
genuine enthusiasm without being over-the-top,
maintains good eye contact with camera,
relaxed posture, leaning slightly forward to show engagement

Emotion:
Genuinely excited and happy to share discovery,
warm and inviting energy,
confident but not salesy

Setting:
Home office or cozy living space,
soft natural lighting from window (side lighting),
blurred background showing plants and bookshelves,
casual home environment aesthetic
```

**Example 2 - Professional Spokesperson:**
```
Avatar Description:
Professional male, 35-40 years old, business attire,
navy blue suit with white dress shirt (no tie for approachable look),
well-groomed appearance, confident posture,
professional yet warm demeanor

Script:
"At TechCorp, we understand that digital transformation isn't just about 
technology—it's about empowering your team. Our platform integrates 
seamlessly with your existing systems, providing real-time insights 
that drive informed decisions. Let's talk about how we can help your 
business grow."

Delivery Style:
Professional and authoritative but not stiff,
controlled gestures that emphasize key points,
direct camera eye contact projecting confidence and trust,
clear articulation with purposeful pauses,
calm and measured pacing

Emotion:
Confident and trustworthy,
approachable expert tone,
genuinely interested in helping

Setting:
Modern corporate office environment,
glass windows with city view softly blurred in background,
professional lighting with soft shadows,
executive presentation aesthetic
```

**Key Techniques for OmniHuman:**
- **Avatar specificity**: Age, clothing, features - be detailed
- **Script clarity**: Natural, conversational language
- **Emotion guidance**: How should they feel and show it?
- **Gesture hints**: Suggest natural gestures that fit message
- **Setting atmosphere**: Match background to content tone
- **Audio option**: Can use XTTS-generated voice or custom audio

---

#### Midjourney V7 Prompting (via KIE.AI)

**Formula:** [Artistic Direction] + [Subject] + [Mood/Atmosphere] + [Style References] + [Technical Parameters]

**Example 1 - Artistic Portrait:**
```
Ethereal dreamlike portrait,
modern female tech entrepreneur in flowing avant-garde clothing,
dramatic chiaroscuro lighting with deep shadows and bright highlights,
mysterious and visionary atmosphere,
painterly digital art style inspired by Renaissance portraiture meets cyberpunk,
intricate details in fabric texture and jewelry,
cinematic composition with subject off-center looking toward light,
rich color palette with deep blues, golds, and purples,
--ar 16:9 --style raw --chaos 20
```

**Example 2 - Creative Product Concept:**
```
Surreal product visualization,
futuristic smartwatch floating in impossible space,
holographic UI elements radiating outward in geometric patterns,
science fiction inspired aesthetic,
ultra-detailed with photorealistic product but fantastical environment,
neon color accents against dark cosmic background,
sense of innovation and cutting-edge technology,
cinematic lighting with dramatic god rays,
inspired by sci-fi concept art and luxury advertising,
--ar 2:3 --style raw --q 2
```

**Example 3 - Brand Illustration:**
```
Whimsical illustrated scene,
diverse group of people collaborating in impossible physics environment,
floating workspace with objects defying gravity,
playful and innovative atmosphere,
modern flat illustration style with subtle gradients,
vibrant color palette: teals, oranges, yellows, purples,
sense of joy and creativity,
clean composition with balanced negative space,
inspired by modern SaaS brand illustration trends,
--ar 16:9 --niji 6 --style cute
```

**Midjourney-Specific Parameters:**
- `--ar X:Y`: Aspect ratio (16:9, 4:3, 2:3, etc.)
- `--style raw`: More literal interpretation
- `--style expressive`: More artistic freedom
- `--chaos X`: Variation amount (0-100)
- `--q 2`: Higher quality (slower)
- `--niji 6`: Anime/manga style

**Key Techniques for Midjourney:**
- **Artistic language**: Use evocative, visual metaphors
- **Style references**: Art movements, artists, techniques
- **Mood over precision**: Midjourney interprets atmosphere well
- **Embrace uniqueness**: Let Midjourney's creativity shine
- **Iterative approach**: V7 responds well to variations

---

#### Nano Banana Editing Prompting

**Formula:** [Current State Observation] + [Change Request] + [Preservation Rules] + [Quality Expectations]

**Example 1 - Object Removal:**
```
Current State:
The image shows a modern office desk with a laptop, coffee cup, and smartphone

Change Request:
Remove the coffee cup from the desk

Preservation Rules:
Maintain the exact wood grain pattern and texture of the desk surface,
preserve all shadows and lighting from the laptop and smartphone,
keep the laptop and phone in exact same positions,
fill the cup's area naturally with desk surface

Quality Expectations:
Photorealistic seamless blend with no visible editing artifacts,
natural lighting consistency throughout,
perfect color and texture matching
```

**Example 2 - Character Consistency Edit:**
```
Current State:
Professional woman in business suit standing in office environment,
mid-length brown hair, specific facial features visible

Change Request:
Change outfit from business suit to casual weekend wear 
(jeans and cozy oversized sweater in cream color)

Preservation Rules:
KEEP EXACTLY: facial features, hair style and color, skin tone, height, build, posture,
maintain exact same pose and position,
preserve lighting direction and quality,
keep same camera angle and framing

Quality Expectations:
Photorealistic clothing change with natural fabric draping,
new outfit should fit body realistically with appropriate shadows and highlights,
seamless integration maintaining all original lighting,
no visible seams or blending errors
```

**Example 3 - Background Replacement:**
```
Current State:
Product photo of smartwatch on plain white background

Change Request:
Replace white background with natural wood desk environment

Preservation Rules:
Product must remain identical in every way,
maintain exact same product lighting and shadows,
preserve watch's reflections and materials,
keep product position and angle unchanged

Quality Expectations:
New background should look like original photo environment,
add natural desk surface with wood grain detail,
create realistic shadows from watch onto desk,
ensure lighting consistency between product and new background,
photorealistic integration
```

**Example 4 - Time-of-Day Change:**
```
Current State:
Exterior building photo taken in harsh midday sunlight

Change Request:
Transform lighting to golden hour sunset

Preservation Rules:
Keep building architecture exactly the same,
maintain all structural details and textures,
preserve people and vehicles if present,
keep camera perspective identical

Quality Expectations:
Realistic golden hour lighting with warm color temperature,
appropriate long shadows consistent with low sun angle,
warm glow on building surfaces facing light source,
cooler shadows on opposite sides,
natural sky gradient appropriate for sunset,
photorealistic atmospheric changes
```

**Key Techniques for Nano Banana:**
- **Clear observation**: State what you see in the image
- **Specific change**: Exactly what should be different
- **Preservation list**: What must NOT change
- **Natural results**: Emphasize photorealism and seamless blending
- **Lighting awareness**: Consider how changes affect light and shadow
- **Material consistency**: New elements should match image quality

---

### 6.3 Prompt Optimization Strategies

#### Strategy 1: Iterative Refinement
```yaml
Process:
  1. Start with base prompt
  2. Generate first version
  3. Identify what's wrong/missing
  4. Add specific details addressing issues
  5. Regenerate
  6. Repeat until satisfactory

Example Iteration:
  V1: "A modern office"
  Result: Generic, unclear style
  
  V2: "A modern minimalist office with white walls and wooden desk"
  Result: Better but lighting unclear
  
  V3: "A modern minimalist office with white walls, oak wooden desk, 
       large windows with natural light, architectural photography style"
  Result: Much closer!
  
  V4: "A modern minimalist office with white walls, natural oak wooden desk,
       floor-to-ceiling windows with cityscape view, soft natural daylight
       creating gentle shadows, architectural photography style, wide-angle
       perspective, professional real estate quality"
  Result: Perfect!
```

#### Strategy 2: Component-Based Construction
```yaml
Technique: Build prompts from modular components

Components:
  - Subject (who/what)
  - Action (doing what)
  - Environment (where)
  - Lighting (how lit)
  - Style (visual treatment)
  - Camera (perspective)
  - Technical (quality markers)

Example Assembly:
  Subject: "Premium wireless headphones"
  + Details: "matte black with rose gold accents"
  + Environment: "on white marble surface"
  + Lighting: "studio lighting, soft shadows"
  + Style: "commercial product photography"
  + Camera: "macro lens, shallow depth of field"
  + Technical: "8K, hyperrealistic"
  
  = Complete prompt combining all components
```

#### Strategy 3: Reference Stacking
```yaml
Technique: Use multiple reference points

Example:
  "Professional product photography [style reference]
   inspired by Apple product campaigns [brand reference]
   with the minimalism of Muji aesthetic [design reference]
   and lighting quality of automotive photography [lighting reference]"

Why It Works:
  - Multiple references = clearer vision
  - Models understand comparative language
  - Reduces ambiguity through triangulation
```

#### Strategy 4: Negative Constraints
```yaml
Technique: Specify what NOT to include

Kling/Sora Example:
  Positive: "Smooth camera dolly movement"
  Negative: "no shaky handheld, no jump cuts, no fast motion"

FLUX Pro Example:
  Positive: "Natural outdoor lighting"
  Negative: "no harsh shadows, no overexposure, no artificial flash"

Why It Works:
  - Prevents common mistakes
  - Guides away from unwanted elements
  - Especially useful when iterating
```

#### Strategy 5: Quality Anchoring
```yaml
Technique: Use quality markers to set expectations

For Images:
  - "8K resolution"
  - "professional photography"
  - "hyperrealistic details"
  - "cinematic quality"
  - "award-winning"

For Video:
  - "cinema-grade footage"
  - "professional color grading"
  - "smooth motion"
  - "broadcast quality"

Why It Works:
  - Models trained on high-quality data
  - Quality markers activate better parameters
  - Sets tone for overall output
```

---

## 7. Cost Optimization

### 7.1 Cost Analysis by Model

```yaml
Video Generation - Cost per 5 seconds:
  Sora 2 Pro: $0.15 (most expensive)
  Veo 3.1: $0.12
  Sora 2: $0.10
  Wan 2.5: $0.08
  Kling 2.5 Pro (5s base): $0.35 (base 5s, best value for quality)
  MiniMax Hailuo-02: $0.06 (most economical)

Video Generation - Cost per 10 seconds:
  Sora 2 Pro: $0.15 (fixed up to 60s)
  Veo 3.1: $0.12 (fixed up to 60s)
  Kling 2.5 Pro: $0.70 ($0.35 + 5 × $0.07)
  
  INSIGHT: For longer videos (10s+), Sora/Veo more cost-effective than Kling

Image Generation - Cost per image:
  FLUX Pro v1.1: $0.055
  FLUX Pro: $0.055
  Hunyuan Image 3: $0.05
  Recraft v3: $0.04
  Recraft v3 SVG: $0.04
  Nano Banana: $0.03 (editing)
  FLUX Schnell: $0.003 (cheapest, 94% savings vs Pro)

Audio Generation:
  XTTS v2: $0 (internal - ALWAYS use first)
  Udio: ~$0.10-0.20 (via KIE.AI, music only)
```

### 7.2 Budget Tier Strategies

#### Luxury/Cinematic Budget (>$5 per project)
```yaml
Strategy: Quality First

Video:
  - Use Sora 2 Pro or Veo 3.1
  - Native audio included
  - Longer durations acceptable

Image:
  - FLUX Pro v1.1
  - Midjourney V7 for artistic needs
  - High resolution (2048px+)

Audio:
  - Udio for custom music
  - XTTS with voice cloning

Approach:
  - Premium models everywhere
  - No compromise on quality
  - Focus on perfect execution
```

#### Professional Budget ($1-5 per project)
```yaml
Strategy: Balanced Quality/Cost

Video:
  - Kling 2.5 Turbo Pro (default)
  - Sora 2/Veo 3.1 only if audio critical
  - 5-10 second clips (optimize duration)

Image:
  - FLUX Pro (standard)
  - Selective use of premium models

Audio:
  - XTTS v2 for all voiceovers (free)
  - Audio library for music (free/cheap)

Approach:
  - Excellent quality at reasonable cost
  - DEFAULT tier for most projects
  - Smart model selection
```

#### Standard Budget ($0.20-1 per project)
```yaml
Strategy: Cost-Conscious Quality

Video:
  - Kling 2.5 Pro (5s clips only)
  - MiniMax Hailuo-02 for animations
  - Avoid premium models

Image:
  - FLUX Pro for hero shots
  - FLUX Schnell for volume
  - Nano Banana for edits

Audio:
  - XTTS v2 exclusively (free)
  - Free music libraries

Approach:
  - Good quality with cost discipline
  - Short clips and efficient generation
  - Volume through speed
```

#### Budget/Draft (<$0.20 per project)
```yaml
Strategy: Maximum Efficiency

Video:
  - MiniMax Hailuo-02 only
  - Shortest durations
  - No premium features

Image:
  - FLUX Schnell exclusively
  - Low resolution acceptable
  - Minimal edits

Audio:
  - XTTS v2 only (free)
  - No music generation

Approach:
  - Rapid prototyping
  - Proof of concept
  - Volume over polish
```

### 7.3 Cost Optimization Tactics

#### Tactic 1: Duration Optimization
```yaml
Problem: Kling 2.5 Pro costs $0.07 per extra second

Solution: Multi-scene approach
  Instead of: 1 × 30-second video = $2.10
  Do: 6 × 5-second clips = 6 × $0.35 = $2.10
  
  Same cost, but:
  - Better control per scene
  - Easier to remake if one fails
  - More variety in shots
  - Can parallelize generation
```

#### Tactic 2: Model Substitution
```yaml
Scenario: User wants "high quality product video"

Expensive Approach:
  Veo 3.1: $0.12/video
  
Optimized Approach:
  Kling 2.5 Pro: $0.35/5s
  Savings: $0 (actually more expensive!)
  
Wait, when is Veo cheaper?
  For 10+ seconds: Veo 3.1 = $0.12, Kling = $0.70
  Savings: $0.58 (83% cheaper!)

LESSON: Longer videos favor fixed-price models (Sora/Veo)
         Short videos favor per-second models (Kling)
```

#### Tactic 3: Batch Generation
```yaml
Scenario: Need 10 product images

Approach A - Sequential Premium:
  10 × FLUX Pro = 10 × $0.055 = $0.55
  Time: ~150 seconds (2.5 min)

Approach B - Parallel Fast:
  10 × FLUX Schnell = 10 × $0.003 = $0.03
  Time: ~5 seconds (parallel)
  Savings: $0.52 (94% cost reduction)
  
WHEN TO USE:
  - User needs variations not perfection
  - Volume over quality
  - Rapid iteration phase
```

#### Tactic 4: Progressive Enhancement
```yaml
Strategy: Start cheap, enhance if needed

Phase 1 - Rapid Prototype:
  Use FLUX Schnell ($0.003)
  Generate 5 variations quickly
  User selects favorite
  
Phase 2 - High-Quality Final:
  Regenerate chosen design with FLUX Pro ($0.055)
  
Total Cost: $0.015 + $0.055 = $0.07
vs. Direct FLUX Pro: 5 × $0.055 = $0.275

Savings: $0.205 (74% reduction)
```

#### Tactic 5: Free Audio First
```yaml
Rule: ALWAYS use XTTS v2 before paid alternatives

Scenario: Video needs voiceover

❌ Wrong Approach:
  Generate video with Sora 2 ($0.10)
  Native audio included
  But what if voiceover needs changes?
  
✅ Right Approach:
  XTTS generates voiceover ($0 - free)
  Test and iterate until perfect ($0)
  Then generate video with Kling ($0.35)
  Add perfected audio ($0)
  
Benefits:
  - Iterate voiceover freely
  - No video regeneration costs
  - More control
  - Cheaper overall
```

#### Tactic 6: Character Consistency Efficiency
```yaml
Scenario: Need same character in 5 scenes

Expensive Approach:
  5 × FLUX Pro = 5 × $0.055 = $0.275
  Risk: Character variations between images
  
Optimized Approach:
  1 × FLUX Pro base character = $0.055
  4 × Nano Banana edits = 4 × $0.03 = $0.12
  Total: $0.175
  Savings: $0.10 (36% reduction)
  Benefit: Better consistency!
```

### 7.4 Cost Prediction

```typescript
function predictCost(plan: ExecutionPlan): CostBreakdown {
  const breakdown: CostBreakdown = {
    videoGeneration: 0,
    imageGeneration: 0,
    audioGeneration: 0,
    editing: 0,
    total: 0
  };
  
  // Video costs
  if (plan.workflow.video) {
    plan.workflow.video.forEach(step => {
      if (step.model.includes('kling')) {
        const duration = step.duration || 5;
        const extraSeconds = Math.max(0, duration - 5);
        breakdown.videoGeneration += 0.35 + (extraSeconds * 0.07);
      } else if (step.model.includes('sora-2-pro')) {
        breakdown.videoGeneration += 0.15;
      } else if (step.model.includes('sora-2')) {
        breakdown.videoGeneration += 0.10;
      } else if (step.model.includes('veo-3.1')) {
        breakdown.videoGeneration += 0.12;
      } else if (step.model.includes('minimax')) {
        breakdown.videoGeneration += 0.06;
      } else if (step.model.includes('omnihuman')) {
        breakdown.videoGeneration += 0.15;
      }
    });
  }
  
  // Image costs
  if (plan.workflow.images) {
    plan.workflow.images.forEach(step => {
      if (step.model.includes('flux-pro')) {
        breakdown.imageGeneration += 0.055;
      } else if (step.model.includes('flux-schnell')) {
        breakdown.imageGeneration += 0.003;
      } else if (step.model.includes('recraft')) {
        breakdown.imageGeneration += 0.04;
      } else if (step.model.includes('midjourney')) {
        breakdown.imageGeneration += 0.06; // Estimate via KIE.AI
      }
    });
  }
  
  // Audio costs (XTTS is free, Udio is paid)
  if (plan.workflow.audio) {
    plan.workflow.audio.forEach(step => {
      if (step.model.includes('udio')) {
        breakdown.audioGeneration += 0.15; // Estimate via KIE.AI
      }
      // XTTS = $0, don't add anything
    });
  }
  
  // Editing costs
  if (plan.workflow.editing) {
    plan.workflow.editing.forEach(step => {
      if (step.model.includes('nano-banana')) {
        breakdown.editing += 0.03;
      } else if (step.model.includes('runway')) {
        breakdown.editing += 0.12;
      }
    });
  }
  
  breakdown.total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  
  return breakdown;
}
```

---

## 8. Integration Specifications

### 8.1 Communication Protocol

**Input: ProjectBrief**
```typescript
interface ProjectBrief {
  id: string;
  type: 'image' | 'video' | 'audio' | 'multi_asset';
  description: string;
  
  // Quality/Budget
  quality_tier?: 'fast' | 'standard' | 'premium' | 'cinematic';
  budget?: {
    max_cost?: number;
    priority?: 'cost' | 'quality' | 'speed';
  };
  
  // Content specifics
  duration?: number; // for video, in seconds
  quantity?: number; // for multi-asset
  resolution?: string; // e.g., '1920x1080'
  
  // Creative requirements
  style?: string;
  mood?: string;
  use_case?: string;
  
  // Assets (if provided)
  source_image?: string; // URL or file path
  source_video?: string;
  source_audio?: string;
  
  // Special requirements
  needs_audio?: boolean;
  needs_consistency?: boolean; // character/style
  special_instructions?: string;
}
```

**Output: ExecutionPlan**
```typescript
interface ExecutionPlan {
  id: string;
  brief_id: string;
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'failed';
  
  // Approach
  approach: 'single_model' | 'multi_step';
  
  // For single_model approach
  primary_model?: {
    name: string;
    model_id: string;
    provider: 'FAL.AI' | 'KIE.AI' | 'Internal';
    api_endpoint: string;
    reason: string; // Why this model was chosen
  };
  
  // For multi_step approach
  workflow?: {
    steps: WorkflowStep[];
    parallel_groups?: number[][]; // Indices of steps that can run parallel
  };
  
  // Estimates
  estimated_cost: number;
  estimated_time: number; // seconds
  cost_breakdown?: {
    video?: number;
    image?: number;
    audio?: number;
    editing?: number;
  };
  
  // Risk management
  fallback_strategy: {
    primary_failed: string; // Model to use if primary fails
    secondary_failed: string; // If fallback also fails
  };
  
  // Quality tier
  quality_tier: 'fast' | 'standard' | 'premium' | 'cinematic';
  
  // Warnings (if any)
  warnings?: string[];
  budget_warning?: {
    requested: number;
    optimized: number;
    message: string;
  };
}

interface WorkflowStep {
  step_id: string;
  step_number: number;
  description: string;
  agent: 'visual_creator' | 'video_composer' | 'audio_generator';
  model: {
    name: string;
    model_id: string;
    provider: string;
  };
  execution: {
    depends_on: string[]; // step_ids
    can_parallel: boolean | 'staggered';
    estimated_time: number;
    estimated_cost: number;
  };
  prompt?: string; // Generated prompt for this step
}
```

### 8.2 API Endpoint Specifications

#### FAL.AI Endpoints

```yaml
Base URL: https://fal.run/

Video Models:
  Sora 2: fal-ai/sora-2
  Sora 2 Pro: fal-ai/sora-2/pro
  Veo 3.1: fal-ai/veo-3.1
  Kling 2.5 Pro T2V: fal-ai/kling-video/v2.5-turbo/pro/text-to-video
  Kling 2.5 Pro I2V: fal-ai/kling-video/v2.5-turbo/pro/image-to-video
  Runway Gen-3 Alpha: fal-ai/runway/gen3-alpha
  Runway Gen-3 Turbo: fal-ai/runway/gen3-turbo
  MiniMax Hailuo-02: fal-ai/minimax-hailuo-02
  Wan 2.5: fal-ai/wan-2.5
  OmniHuman v1.5: fal-ai/omnihuman-v1.5

Image Models:
  FLUX Pro v1.1: fal-ai/flux-pro/v1.1
  FLUX Pro: fal-ai/flux-pro
  FLUX Schnell: fal-ai/flux/schnell
  Recraft v3: fal-ai/recraft-v3
  Recraft v3 SVG: fal-ai/recraft-v3/svg
  Hunyuan Image 3: fal-ai/hunyuan-image-3
  Nano Banana: fal-ai/nano-banana/edit

Audio Models:
  (XTTS v2 is internal, not FAL.AI)
```

#### KIE.AI Endpoints

```yaml
Base URL: https://api.kie.ai/

Models:
  Midjourney: /v1/midjourney
  Udio: /v1/udio

Authentication:
  Header: Authorization: Bearer <KIE_API_KEY>

Credit System:
  Purchase credits in advance
  Deducted per generation
  ~40-60% cheaper than official
```

#### Internal (AIDA) Endpoints

```yaml
XTTS v2:
  Endpoint: http://localhost:3002/tts/generate
  Method: POST
  Payload: {
    text: string,
    voice: string,
    language: string,
    emotion?: string
  }
  Response: {
    audio_url: string,
    duration: number,
    cost: 0
  }
```

### 8.3 Agent Communication

**Spawning Visual Creator:**
```typescript
interface VisualCreatorTask {
  task_id: string;
  type: 'image_generation' | 'image_editing';
  model: {
    name: string;
    model_id: string;
    provider: string;
  };
  prompts: string[]; // Array for batch generation
  parameters?: {
    resolution?: string;
    style?: string;
    // Model-specific params
  };
  fallback_model?: {
    name: string;
    model_id: string;
  };
}

// Send to Visual Creator agent
await sendToAgent('visual_creator', visualCreatorTask);
```

**Spawning Video Composer:**
```typescript
interface VideoComposerTask {
  task_id: string;
  type: 'video_generation' | 'video_editing' | 'composition';
  model: {
    name: string;
    model_id: string;
    provider: string;
  };
  input: {
    type: 'text' | 'image' | 'video';
    content: string | string[]; // URLs or paths
  };
  prompt?: string;
  parameters?: {
    duration?: number;
    resolution?: string;
    audio?: boolean;
  };
  audio_track?: {
    url: string;
    type: 'voiceover' | 'music' | 'effects';
  };
  fallback_model?: {
    name: string;
    model_id: string;
  };
}

await sendToAgent('video_composer', videoComposerTask);
```

**Spawning Audio Generator:**
```typescript
interface AudioGeneratorTask {
  task_id: string;
  type: 'tts' | 'music';
  model: {
    name: string; // 'XTTS v2' or 'Udio'
    provider: string;
  };
  input: {
    text?: string; // For TTS
    script?: string; // For TTS
    style?: string; // For music
    duration?: number; // For music
  };
  parameters?: {
    voice?: string; // For XTTS
    language?: string; // For XTTS
    emotion?: string; // For XTTS
    genre?: string; // For Udio
  };
}

await sendToAgent('audio_generator', audioGeneratorTask);
```

### 8.4 Progress Tracking

```typescript
interface TaskProgress {
  task_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress_percent: number; // 0-100
  current_step?: string;
  estimated_completion?: number; // seconds remaining
  cost_accrued: number;
  
  // For multi-step workflows
  steps_completed?: number;
  steps_total?: number;
  
  // Results (when completed)
  output_urls?: string[];
  final_cost?: number;
  actual_time?: number;
  
  // Error info (if failed)
  error?: {
    message: string;
    step: string;
    fallback_attempted: boolean;
    fallback_success: boolean;
  };
}

// Update progress
function updateProgress(taskId: string, update: Partial<TaskProgress>): void;

// Query progress
function getProgress(taskId: string): TaskProgress;
```

---

## 9. Error Handling & Fallbacks

### 9.1 Failure Scenarios

#### Scenario 1: Primary Model API Failure
```yaml
Problem: FAL.AI Kling endpoint returns 503 Service Unavailable

Detection:
  - HTTP status code 5xx
  - Timeout after 60 seconds
  - Error response from API

Response:
  1. Log error with details
  2. Attempt fallback model (MiniMax Hailuo-02)
  3. If fallback succeeds:
     - Complete task
     - Log model substitution
     - Notify monitoring (not user)
  4. If fallback fails:
     - Try final fallback (if available)
     - If all fail: Escalate to user
```

#### Scenario 2: Content Policy Violation
```yaml
Problem: Model refuses generation due to content policy

Detection:
  - API returns specific policy error
  - Error message contains "content policy", "safety", etc.

Response:
  1. Do NOT retry with same prompt
  2. Analyze prompt for potential issues
  3. If user request clearly inappropriate:
     - Return error to Orchestrator
     - Let Orchestrator handle user communication
  4. If prompt seems benign:
     - Try alternative model (different providers have different policies)
     - If all models refuse: Escalate to user with explanation
```

#### Scenario 3: Budget Exceeded
```yaml
Problem: Execution plan exceeds user's budget

Detection:
  - Calculated cost > max_cost in budget constraints

Response:
  1. Apply cost optimization strategies
  2. Generate alternative plan with cheaper models
  3. Present both plans to user:
     - Option A: Original (high quality, over budget)
     - Option B: Optimized (good quality, within budget)
  4. Require explicit user choice
  5. Do NOT automatically downgrade without approval
```

#### Scenario 4: Generation Quality Below Threshold
```yaml
Problem: Output doesn't meet minimum quality standards

Detection:
  - Manual quality check (if implemented)
  - User reports poor quality
  - Obvious artifacts or errors visible

Response:
  1. Offer free regeneration (same model)
  2. If second attempt also poor:
     - Suggest upgrading to premium model
     - Or try alternative model
  3. Track quality issues per model
  4. Adjust model selection algorithm if pattern detected
```

### 9.2 Fallback Chains

#### Video Generation Fallbacks

**Text-to-Video:**
```yaml
Chain 1 (Premium → Standard):
  Primary: Sora 2 Pro ($0.15)
  Fallback 1: Sora 2 ($0.10)
  Fallback 2: Kling 2.5 Pro ($0.35)
  Final: MiniMax Hailuo-02 ($0.06)
  
  Escalate: If all fail

Chain 2 (Standard):
  Primary: Kling 2.5 Pro ($0.35)
  Fallback: MiniMax Hailuo-02 ($0.06)
  
  Escalate: If both fail
```

**Image-to-Video:**
```yaml
Chain:
  Primary: Veo 3.1 ($0.12)
  Fallback 1: Kling 2.5 Pro I2V ($0.35)
  Fallback 2: Wan 2.5 ($0.08)
  Final: MiniMax Hailuo-02 ($0.06)
  
  Escalate: If all fail
```

**Video-to-Video:**
```yaml
Chain:
  Primary: Runway Gen-3 Alpha ($0.12)
  Fallback: Runway Gen-3 Turbo ($0.08)
  
  Escalate: If both fail (no other V2V options)
```

#### Image Generation Fallbacks

**Photorealistic:**
```yaml
Chain:
  Primary: FLUX Pro v1.1 ($0.055)
  Fallback 1: FLUX Pro ($0.055)
  Fallback 2: Hunyuan Image 3 ($0.05)
  Final: FLUX Schnell ($0.003)
  
  Escalate: If all fail
```

**Artistic/Illustration:**
```yaml
Chain:
  Primary: Midjourney V7 ($0.06)
  Fallback: Recraft v3 ($0.04)
  
  Escalate: If both fail
```

**Vector/Logo:**
```yaml
Single: Recraft v3 SVG ($0.04)
  No fallback (unique capability)
  
  Escalate: If fails
```

#### Audio Generation Fallbacks

**TTS (Text-to-Speech):**
```yaml
Single: XTTS v2 ($0)
  XTTS is internal, highly reliable
  
  If fails: Critical error, escalate immediately
  (Should almost never happen)
```

**Music:**
```yaml
Single: Udio via KIE.AI ($0.10-0.20)
  No fallback
  
  If fails: Suggest user provides music or uses library
```

### 9.3 Retry Strategies

#### Transient Errors (Retry)
```yaml
Conditions:
  - HTTP 5xx errors (server issues)
  - Timeout (no response)
  - Network errors
  - "Try again" messages

Strategy:
  Attempt 1: Immediate retry
  Attempt 2: 5-second delay
  Attempt 3: 15-second delay
  After 3 attempts: Fallback to next model

Max Retries: 3 per model
Total Timeout: 180 seconds (3 minutes) per model
```

#### Permanent Errors (No Retry)
```yaml
Conditions:
  - Content policy violations
  - Invalid parameters
  - Authentication errors
  - "Model not found"

Strategy:
  Do NOT retry
  Immediately fallback to next model
  Or escalate if no fallback
```

#### Rate Limit Errors (Delayed Retry)
```yaml
Conditions:
  - HTTP 429 (Too Many Requests)
  - "Rate limit exceeded"

Strategy:
  Wait duration specified in response (Retry-After header)
  Or default: 60 seconds
  Retry after waiting
  Max wait: 120 seconds
  If still rate limited: Fallback to different model
```

### 9.4 Error Reporting

```typescript
interface ErrorReport {
  task_id: string;
  timestamp: string;
  error_type: 'api_failure' | 'policy_violation' | 'budget_exceeded' | 'quality_issue' | 'timeout' | 'rate_limit';
  
  model: {
    name: string;
    model_id: string;
    provider: string;
  };
  
  error_details: {
    http_status?: number;
    error_message: string;
    raw_response?: any;
  };
  
  recovery_action: {
    action: 'retry' | 'fallback' | 'escalate';
    fallback_model?: string;
    retry_count?: number;
    success: boolean;
  };
  
  impact: {
    cost_wasted: number;
    time_wasted: number;
    user_notified: boolean;
  };
}

function reportError(report: ErrorReport): void {
  // Log to monitoring system
  // If user_notified: Send to Orchestrator for user communication
  // Track error patterns for model reliability
}
```

### 9.5 Graceful Degradation

**Principle:** Always deliver *something* rather than complete failure

```yaml
Scenario: All video models fail

Degradation Path:
  1. Attempt all video models (with retries)
  2. If all fail, check if image generation possible
  3. If yes:
     - Generate static image (FLUX Pro)
     - Inform user: "Video generation failed, here's a static image instead"
     - Offer to retry video later
  4. If image also fails:
     - Return detailed error to user
     - Offer refund/credit
     - Suggest alternative approach

Goal: Partial success > complete failure
```

**Example Implementation:**
```typescript
async function executeWithGracefulDegradation(plan: ExecutionPlan): Promise<Result> {
  try {
    // Attempt primary workflow
    return await executePlan(plan);
  } catch (videoError) {
    console.log('Video generation failed, attempting image fallback');
    
    try {
      // Degrade to static image
      const imagePlan = convertToImagePlan(plan);
      const imageResult = await executePlan(imagePlan);
      
      return {
        ...imageResult,
        warning: 'Video generation failed. Static image provided instead.',
        suggest_retry: true
      };
    } catch (imageError) {
      // Complete failure
      throw new Error('Unable to generate any content. All models failed.');
    }
  }
}
```

---

## 10. Examples & Use Cases

### 10.1 Complete Workflow Examples

#### Example 1: Simple Product Photo

**User Request:**
"Generate a professional photo of a smartwatch"

**Technical Planner Analysis:**
```yaml
Content Type: image_generation
Quality Tier: standard (no specific request)
Special Reqs: None
Budget: None specified
```

**Model Selection:**
```yaml
Primary Model: FLUX Pro
Reason: Default choice for professional image generation
Cost: $0.055
Time: ~15 seconds
```

**Execution Plan:**
```json
{
  "id": "plan_001",
  "approach": "single_model",
  "primary_model": {
    "name": "FLUX Pro",
    "model_id": "fal-ai/flux-pro",
    "provider": "FAL.AI",
    "reason": "Best balance of quality and cost for product photography"
  },
  "prompt": "Professional product photography of a premium smartwatch, sleek black titanium case with OLED display showing elegant watch face, sapphire crystal glass, modern minimalist design, placed on white marble surface with soft shadows, studio lighting with key light from top creating subtle highlights, commercial advertising style, macro lens perspective, 8K resolution, hyperrealistic details",
  "estimated_cost": 0.055,
  "estimated_time": 15,
  "quality_tier": "standard"
}
```

**Result:** High-quality product image delivered in 15 seconds for $0.055

---

#### Example 2: UGC Influencer Video

**User Request:**
"Create a 20-second video of an influencer reviewing my productivity app, casual and authentic style"

**Technical Planner Analysis:**
```yaml
Content Type: video_generation
Subcategory: ugc_video
Quality Tier: premium (UGC requires quality avatar)
Special Reqs: Needs voiceover
Duration: 20 seconds
Budget: None specified
```

**Model Selection:**
```yaml
Audio: XTTS v2 (internal, free)
Video: OmniHuman v1.5 (best for UGC)
Cost: $0 (XTTS) + $0.15 (OmniHuman) = $0.15
Time: ~3 minutes
```

**Execution Plan:**
```json
{
  "id": "plan_002",
  "approach": "multi_step",
  "workflow": {
    "steps": [
      {
        "step_id": "step_001",
        "step_number": 1,
        "description": "Generate voiceover audio",
        "agent": "audio_generator",
        "model": {
          "name": "XTTS v2",
          "model_id": "xtts-v2",
          "provider": "Internal"
        },
        "execution": {
          "depends_on": [],
          "can_parallel": true,
          "estimated_time": 10,
          "estimated_cost": 0
        },
        "prompt": "Hey everyone! I've been using this productivity app for the past few weeks, and honestly, it's completely changed my workflow. The smart task prioritization is incredible - it actually learns what matters to me. And the calendar integration? Seamless. If you're struggling to stay organized, definitely give this a try. Trust me, you won't regret it!"
      },
      {
        "step_id": "step_002",
        "step_number": 2,
        "description": "Generate UGC avatar video with voiceover",
        "agent": "video_composer",
        "model": {
          "name": "OmniHuman v1.5",
          "model_id": "fal-ai/omnihuman-v1.5",
          "provider": "FAL.AI"
        },
        "execution": {
          "depends_on": ["step_001"],
          "can_parallel": false,
          "estimated_time": 180,
          "estimated_cost": 0.15
        },
        "prompt": "Young professional woman, 28 years old, wearing casual white t-shirt and denim jacket, warm and friendly smile, natural makeup, shoulder-length wavy brown hair, authentic and approachable energy, speaking enthusiastically about the app, natural hand gestures emphasizing points, cozy home office background with plants and soft natural lighting from window, genuine excitement in tone, like talking to a friend, medium close-up shot"
      }
    ]
  },
  "estimated_cost": 0.15,
  "estimated_time": 190,
  "quality_tier": "premium"
}
```

**Result:** Authentic UGC-style video with natural voiceover, ready in ~3 minutes for $0.15

---

#### Example 3: Multi-Scene Marketing Video

**User Request:**
"Create a 30-second video showcasing our new coffee maker in 3 scenes: product close-up, brewing process, and happy customer enjoying coffee"

**Technical Planner Analysis:**
```yaml
Content Type: multi_asset
Subcategory: marketing_video
Quality Tier: premium (product launch)
Special Reqs: Multiple scenes, professional quality
Duration: 3 × 10 seconds = 30 seconds
Budget: None specified
```

**Model Selection:**
```yaml
Images: FLUX Pro (3 scenes)
Video: Kling 2.5 Pro (animate each scene)
Audio: XTTS v2 (voiceover)
Music: Audio library (free)
```

**Execution Plan:**
```json
{
  "id": "plan_003",
  "approach": "multi_step",
  "workflow": {
    "steps": [
      {
        "step_id": "step_001",
        "step_number": 1,
        "description": "Generate 3 scene images in parallel",
        "agent": "visual_creator",
        "model": {
          "name": "FLUX Pro",
          "model_id": "fal-ai/flux-pro",
          "provider": "FAL.AI"
        },
        "execution": {
          "depends_on": [],
          "can_parallel": true,
          "estimated_time": 45,
          "estimated_cost": 0.165
        },
        "prompts": [
          "Professional product photography close-up of modern coffee maker, sleek matte black design with chrome accents, LED display showing brew temperature, glass carafe with fresh coffee, placed on marble kitchen counter, studio lighting highlighting metallic details, commercial advertising style, macro lens, 8K, hyperrealistic",
          "Coffee brewing process in action, hot water pouring into filter, steam rising, rich brown coffee dripping into glass carafe, close-up detail shot, warm ambient kitchen lighting, morning atmosphere, professional food photography style, shallow depth of field",
          "Young woman in modern kitchen holding coffee mug with both hands, genuine happy smile, steam rising from cup, warm morning sunlight through window, cozy and inviting atmosphere, lifestyle photography style, natural and authentic feeling, soft focus background"
        ]
      },
      {
        "step_id": "step_002",
        "step_number": 2,
        "description": "Generate voiceover narration",
        "agent": "audio_generator",
        "model": {
          "name": "XTTS v2",
          "model_id": "xtts-v2",
          "provider": "Internal"
        },
        "execution": {
          "depends_on": [],
          "can_parallel": true,
          "estimated_time": 10,
          "estimated_cost": 0
        },
        "prompt": "Introducing the BrewMaster Pro. Precision temperature control. Perfect extraction, every time. Start your mornings right."
      },
      {
        "step_id": "step_003",
        "step_number": 3,
        "description": "Animate 3 scenes (staggered)",
        "agent": "video_composer",
        "model": {
          "name": "Kling 2.5 Turbo Pro",
          "model_id": "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
          "provider": "FAL.AI"
        },
        "execution": {
          "depends_on": ["step_001"],
          "can_parallel": "staggered",
          "estimated_time": 360,
          "estimated_cost": 2.10
        },
        "prompts": [
          "Slow orbital camera movement around coffee maker, LED display animates showing temperature increasing, subtle reflection changes on metallic surfaces, professional product demo motion, smooth and elegant",
          "Steam rises naturally, coffee drips into carafe with realistic fluid motion, subtle camera push-in to emphasize brewing action, warm and inviting atmosphere, natural kitchen dynamics",
          "Woman raises cup toward lips in natural motion, takes sip with satisfied expression, slight camera adjustment for intimate feel, warm morning light creates gentle atmosphere, authentic lifestyle moment"
        ]
      },
      {
        "step_id": "step_004",
        "step_number": 4,
        "description": "Compose final video with audio",
        "agent": "video_composer",
        "model": {
          "name": "Internal Compositor",
          "provider": "Internal"
        },
        "execution": {
          "depends_on": ["step_002", "step_003"],
          "can_parallel": false,
          "estimated_time": 120,
          "estimated_cost": 0
        }
      }
    ],
    "parallel_groups": [[0, 1], [2], [3]]
  },
  "estimated_cost": 2.275,
  "estimated_time": 535,
  "quality_tier": "premium"
}
```

**Cost Breakdown:**
- 3 images: 3 × $0.055 = $0.165
- 3 video animations (10s each): 3 × ($0.35 + 5 × $0.07) = 3 × $0.70 = $2.10
- Voiceover: $0 (XTTS)
- Composition: $0 (internal)
- **Total: $2.275**

**Time Breakdown:**
- Phase 1 (parallel): Images + Audio = ~45 seconds
- Phase 2 (staggered): 3 videos = ~6 minutes
- Phase 3 (sequential): Composition = ~2 minutes
- **Total: ~9 minutes**

**Result:** Professional 30-second marketing video with voiceover, ready in 9 minutes for $2.28

---

#### Example 4: Character Consistency Series

**User Request:**
"Generate 4 images of the same character: 1) at office desk, 2) at coffee shop, 3) at gym, 4) at home cooking"

**Technical Planner Analysis:**
```yaml
Content Type: multi_asset
Subcategory: character_series
Quality Tier: standard
Special Reqs: Character consistency critical
Budget: None specified
```

**Model Selection:**
```yaml
Strategy: Base character + edits
Base: FLUX Pro
Edits: Nano Banana (3 variations)
Cost: $0.055 + 3 × $0.03 = $0.145
Alternative: 4 × FLUX Pro = $0.22
```

**Execution Plan:**
```json
{
  "id": "plan_004",
  "approach": "multi_step",
  "workflow": {
    "steps": [
      {
        "step_id": "step_001",
        "step_number": 1,
        "description": "Generate base character image",
        "agent": "visual_creator",
        "model": {
          "name": "FLUX Pro",
          "model_id": "fal-ai/flux-pro",
          "provider": "FAL.AI"
        },
        "execution": {
          "depends_on": [],
          "can_parallel": true,
          "estimated_time": 15,
          "estimated_cost": 0.055
        },
        "prompt": "Professional portrait of young woman, 28 years old, friendly and approachable expression, light brown shoulder-length wavy hair, warm brown eyes, natural makeup, wearing casual business outfit (white blouse), sitting at modern office desk with laptop, bright office environment with large windows, natural lighting, professional photography style, medium close-up, 8K, photorealistic details"
      },
      {
        "step_id": "step_002",
        "step_number": 2,
        "description": "Edit character for coffee shop scene",
        "agent": "visual_creator",
        "model": {
          "name": "Nano Banana",
          "model_id": "fal-ai/nano-banana/edit",
          "provider": "FAL.AI"
        },
        "execution": {
          "depends_on": ["step_001"],
          "can_parallel": false,
          "estimated_time": 10,
          "estimated_cost": 0.03
        },
        "prompt": "Change setting from office to cozy coffee shop interior, woman now sitting at small wooden table with coffee cup in hands, warm ambient café lighting with soft background blur showing coffee shop elements, keep exact same face, hair, and clothing, maintain photographic style and quality, natural and relaxed atmosphere"
      },
      {
        "step_id": "step_003",
        "step_number": 3,
        "description": "Edit character for gym scene",
        "agent": "visual_creator",
        "model": {
          "name": "Nano Banana",
          "model_id": "fal-ai/nano-banana/edit",
          "provider": "FAL.AI"
        },
        "execution": {
          "depends_on": ["step_001"],
          "can_parallel": true,
          "estimated_time": 10,
          "estimated_cost": 0.03
        },
        "prompt": "Change outfit to athletic wear (gray sports top), change setting to modern gym with exercise equipment softly blurred in background, woman in workout pose holding yoga mat, energetic and healthy vibe, keep exact same facial features and hair, maintain photographic lighting and style"
      },
      {
        "step_id": "step_004",
        "step_number": 4,
        "description": "Edit character for home cooking scene",
        "agent": "visual_creator",
        "model": {
          "name": "Nano Banana",
          "model_id": "fal-ai/nano-banana/edit",
          "provider": "FAL.AI"
        },
        "execution": {
          "depends_on": ["step_001"],
          "can_parallel": true,
          "estimated_time": 10,
          "estimated_cost": 0.03
        },
        "prompt": "Change outfit to casual comfortable home clothes (cream-colored sweater), change setting to bright modern kitchen, woman standing at kitchen counter with cooking ingredients and utensils, warm home atmosphere with natural window lighting, keep exact same face and hair, relaxed and happy expression, maintain photographic quality"
      }
    ],
    "parallel_groups": [[0], [1], [2, 3]]
  },
  "estimated_cost": 0.145,
  "estimated_time": 45,
  "quality_tier": "standard"
}
```

**Result:** 4 images with perfect character consistency, ready in 45 seconds for $0.145

**Cost Savings:** 
- Multi-generation approach: 4 × $0.055 = $0.22
- Optimized approach: $0.145
- **Savings: $0.075 (34% reduction)**

**Quality Benefit:**
- Guaranteed consistency (same base image)
- Better than hoping 4 separate generations match

---

#### Example 5: Budget-Conscious Social Post

**User Request:**
"Quick product image for Instagram, need it fast and cheap"

**Technical Planner Analysis:**
```yaml
Content Type: image_generation
Quality Tier: fast (explicit request)
Special Reqs: Speed priority
Budget: Minimal (implied)
```

**Model Selection:**
```yaml
Primary: FLUX Schnell
Reason: Fastest, cheapest
Cost: $0.003
Time: ~5 seconds
```

**Execution Plan:**
```json
{
  "id": "plan_005",
  "approach": "single_model",
  "primary_model": {
    "name": "FLUX Schnell",
    "model_id": "fal-ai/flux/schnell",
    "provider": "FAL.AI",
    "reason": "User requested fast and cheap - FLUX Schnell delivers both"
  },
  "prompt": "Modern smartphone product photo, sleek black design, white background, simple and clean composition, professional but quick, Instagram-ready",
  "estimated_cost": 0.003,
  "estimated_time": 5,
  "quality_tier": "fast"
}
```

**Result:** Decent quality image, Instagram-ready in 5 seconds for $0.003

**Cost Comparison:**
- FLUX Pro: $0.055 (~18× more expensive)
- FLUX Schnell: $0.003
- **Savings: $0.052 (95% reduction)**

**Use Case:** Perfect for rapid social media posts where volume > perfection

---

### 10.2 Use Case Matrix

| Use Case | Recommended Models | Estimated Cost | Estimated Time |
|----------|-------------------|----------------|----------------|
| **Simple product photo** | FLUX Pro | $0.055 | 15s |
| **Luxury product campaign** | FLUX Pro + Midjourney | $0.115 | 30s |
| **UGC influencer video** | XTTS + OmniHuman | $0.15 | 3min |
| **30s marketing video (3 scenes)** | FLUX Pro + Kling Pro | $2.28 | 9min |
| **Character consistency (4 images)** | FLUX Pro + Nano Banana | $0.145 | 45s |
| **Social media post (budget)** | FLUX Schnell | $0.003 | 5s |
| **Product animation (5s)** | FLUX Pro + Kling Pro | $0.405 | 2.5min |
| **Cinematic brand video (60s)** | Sora 2 Pro | $0.15 | 5min |
| **Logo design (vector)** | Recraft v3 SVG | $0.04 | 15s |
| **Product demo with voiceover (10s)** | FLUX Pro + Kling + XTTS | $0.76 | 3min |

---

## Conclusion

The Technical Planner is AIDA's decision engine - the bridge between creative vision and technical execution. By following the principles, workflows, and best practices outlined in this document, the Technical Planner ensures:

✅ **Optimal Model Selection** - Right tool for every job  
✅ **Cost Efficiency** - Maximum value for budget  
✅ **Quality Delivery** - Professional results consistently  
✅ **Reliable Execution** - Fallbacks and error handling  
✅ **Clear Communication** - Precise agent coordination  

**Key Principles to Remember:**

1. **Pragmatic Over Perfect** - Choose models that work reliably
2. **Test First** - XTTS is free, always use it for audio
3. **Fallback Always** - Have Plan B and C ready
4. **Clear Delegation** - Precise instructions to execution agents
5. **Silent Recovery** - Handle failures gracefully

**Success Metrics:**

- **Model Selection Accuracy**: >95% of plans execute without fallback
- **Cost Efficiency**: Within 10% of predicted cost
- **Time Accuracy**: Within 20% of predicted time
- **User Satisfaction**: >90% approve of quality/cost balance

---

**Version History:**

- **V1.0** (Oct 10, 2025): Initial document
- **V2.0** (Oct 15, 2025): Added workflows, corrected model catalog
- **V3.0** (Oct 18, 2025): Complete rewrite with verified info, detailed workflows, prompting guides, and comprehensive examples
- **V3.1** (Oct 21, 2025): Architecture corrections - Director is execution agent, not intermediate layer

---

## ⚠️ IMPORTANT UPDATE (Oct 21, 2025)

**This document focuses on MODEL SELECTION and AI model catalog.**

**For complete ARCHITECTURE and WORKFLOW COORDINATION, see:**
📚 **[AIDA-ARCHITECTURE-FINAL.md](./AIDA-ARCHITECTURE-FINAL.md)**

The final architecture document includes:
- ✅ Complete sequence diagrams
- ✅ All TypeScript interfaces
- ✅ State management patterns
- ✅ Error handling strategies
- ✅ Workflow coordination implementation
- ✅ 8 micro-sprints implementation plan (MS-025 to MS-033)

**Key Architecture Clarifications:**
1. **Director Agent** is an EXECUTION AGENT (like Writer, Visual Creator), NOT an intermediate layer
2. **Technical Planner** coordinates all execution agents centrally (no peer-to-peer communication)
3. **Prompt optimization** is done by execution agents (Visual Creator, Video Composer), NOT by Director
4. **Workflow is stateful** with PostgreSQL persistence for crash recovery
5. **Parallelization strategy:** Visual Creator (all scenes) + Audio/Video when possible

---

**Maintained by:** AIDA Development Team  
**Last Updated:** October 21, 2025  
**Status:** Production Ready ✅ (Model Selection) | Architecture Finalized ✅ (See AIDA-ARCHITECTURE-FINAL.md)
