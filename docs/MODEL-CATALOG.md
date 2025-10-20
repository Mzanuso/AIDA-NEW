# AIDA Model Catalog - Complete Database

**Version:** 1.0  
**Updated:** October 18, 2025  
**Status:** Production Ready  
**Purpose:** Comprehensive AI model database for AIDA platform

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Model Database](#2-model-database)
3. [Pricing Matrix](#3-pricing-matrix)
4. [Capabilities Map](#4-capabilities-map)
5. [Provider Integration](#5-provider-integration)
6. [Seed Data (JSON)](#6-seed-data-json)
7. [Admin UI Specifications](#7-admin-ui-specifications)
8. [Migration Scripts](#8-migration-scripts)

---

## 1. Overview

### 1.1 Purpose

The Model Catalog is AIDA's central registry of all available AI models. It serves as:
- Single source of truth for model specifications
- Reference for Technical Planner decisions
- Data source for Admin UI
- Seed data for database initialization

### 1.2 Model Categories

```yaml
Categories:
  video_generation:
    - text_to_video
    - image_to_video
    - video_to_video
  
  image_generation:
    - text_to_image
    - image_editing
    - vector_graphics
  
  audio_generation:
    - text_to_speech
    - music_generation
  
  specialized:
    - ugc_avatars
    - upscaling
```

### 1.3 Providers

```yaml
Primary Providers:
  FAL.AI:
    - Video: Sora, Veo, Kling, Runway, etc.
    - Image: FLUX, Recraft, Nano Banana, etc.
    - Count: 40+ models
  
  KIE.AI:
    - Image: Midjourney V7
    - Audio: Udio
    - Count: 2 models
  
  Internal:
    - Audio: XTTS v2
    - Count: 1 model

Total Models: 43+ active models
```

---

## 2. Model Database

### 2.1 Video Generation Models

#### Sora 2 (OpenAI via FAL.AI)

```yaml
model_id: 'sora-2-standard'
full_id: 'fal-ai/sora-2'
provider: 'FAL.AI'
category: 'video_generation'
subcategory: 'text_to_video'
quality_tier: 'premium'

capabilities:
  text_to_video: true
  image_to_video: true
  native_audio: true
  synchronized_dialogue: true
  photorealistic: true
  advanced_physics: true
  camera_movements: true

specifications:
  max_duration: 60 # seconds
  resolution: '1080p'
  aspect_ratios: ['16:9', '9:16', '1:1', '4:3']
  audio_included: true
  generation_time: 180-300 # seconds
  output_format: 'mp4'

pricing:
  model: 'fixed_per_video'
  cost: 0.10 # USD
  billing_unit: 'video'
  notes: 'Same cost regardless of duration (up to 60s)'

quality_metrics:
  realism: 95
  motion_quality: 95
  audio_quality: 90
  prompt_adherence: 92

best_for:
  - High-end commercial content
  - Cinematic storytelling
  - Content requiring dialogue
  - Premium brand campaigns

use_when:
  - User requests "premium" or "professional"
  - Native audio is essential
  - Photorealistic quality required
  - Budget allows premium tier

limitations:
  - 60 second maximum
  - Longer generation time
  - Higher cost than alternatives

api_endpoint: 'fal-ai/sora-2'
documentation_url: 'https://fal.ai/models/fal-ai/sora-2'

tags:
  - video
  - premium
  - audio
  - openai
  - photorealistic
  - cinematic

status: 'active'
added_date: '2025-10-05'
last_verified: '2025-10-18'
```

#### Sora 2 Pro (OpenAI via FAL.AI)

```yaml
model_id: 'sora-2-pro'
full_id: 'fal-ai/sora-2/pro'
provider: 'FAL.AI'
category: 'video_generation'
subcategory: 'text_to_video'
quality_tier: 'cinematic'

capabilities:
  text_to_video: true
  image_to_video: true
  native_audio: true
  synchronized_dialogue: true
  photorealistic: true
  advanced_physics: true
  camera_movements: true
  enhanced_quality: true

specifications:
  max_duration: 60
  resolution: '1080p'
  aspect_ratios: ['16:9', '9:16', '1:1', '4:3']
  audio_included: true
  generation_time: 240-360
  output_format: 'mp4'

pricing:
  model: 'fixed_per_video'
  cost: 0.15
  billing_unit: 'video'
  notes: 'Premium tier - highest quality'

quality_metrics:
  realism: 98
  motion_quality: 98
  audio_quality: 95
  prompt_adherence: 95

best_for:
  - Luxury brand campaigns
  - Film-quality content
  - High-end commercials
  - Premium product launches

use_when:
  - User requests "cinematic" or "luxury"
  - Maximum quality needed
  - Budget allows top tier
  - Professional output critical

api_endpoint: 'fal-ai/sora-2/pro'
tags: [video, cinematic, luxury, openai, premium, audio]
status: 'active'
```

#### Veo 3.1 (Google via FAL.AI)

```yaml
model_id: 'veo-3.1'
full_id: 'fal-ai/veo-3.1'
provider: 'FAL.AI'
category: 'video_generation'
subcategory: 'image_to_video'
quality_tier: 'premium'

capabilities:
  text_to_video: true
  image_to_video: true # PRIMARY STRENGTH
  native_audio: true
  dialogue_audio: true
  ambient_sounds: true
  narrative_control: true
  photorealistic: true

specifications:
  max_duration: 60
  resolution: '1080p'
  audio_included: true
  generation_time: 120-240
  output_format: 'mp4'

pricing:
  model: 'fixed_per_video'
  cost: 0.12
  billing_unit: 'video'

quality_metrics:
  realism: 94
  motion_quality: 92
  audio_quality: 93
  prompt_adherence: 96

best_for:
  - Image-to-video with audio
  - Narrative-driven content
  - Scenes requiring dialogue
  - Photorealistic animations

use_when:
  - Starting from reference images
  - Need dialogue + ambient audio
  - Narrative coherence critical
  - Premium tier budget

api_endpoint: 'fal-ai/veo-3.1'
tags: [video, premium, audio, google, image-to-video, narrative]
status: 'active'
```

#### Kling 2.5 Turbo Pro (Kuaishou via FAL.AI)

```yaml
model_id: 'kling-2.5-turbo-pro'
full_id: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video'
provider: 'FAL.AI'
category: 'video_generation'
subcategory: 'text_to_video'
quality_tier: 'standard'

capabilities:
  text_to_video: true
  image_to_video: true
  cinematic_motion: true
  camera_control: true
  physics_realistic: true
  fast_generation: true

specifications:
  base_duration: 5 # seconds (base cost)
  max_duration: 10
  resolution: '1080p'
  audio_included: false # IMPORTANT
  generation_time: 60-120
  output_format: 'mp4'

pricing:
  model: 'per_second'
  base_cost: 0.35 # for 5 seconds
  cost_per_extra_second: 0.07
  billing_unit: 'second'
  examples:
    5_seconds: 0.35
    10_seconds: 0.70 # 0.35 + (5 * 0.07)
  notes: 'Best quality/price ratio for standard tier'

quality_metrics:
  realism: 88
  motion_quality: 95 # EXCEPTIONAL
  audio_quality: 0 # No audio
  prompt_adherence: 90

best_for:
  - High-quality standard videos
  - Budget-conscious projects
  - Social media content
  - Product demos without audio
  - When motion quality is priority

use_when:
  - DEFAULT choice for video generation
  - Budget is moderate
  - Audio can be added separately
  - Fast delivery needed

cost_optimization:
  strategy: 'Use 5-second clips when possible'
  multi_scene_approach: 'Multiple 5s clips cheaper than long video'
  recommendation: 'For 30s video: 6×5s = $2.10 vs 1×30s elsewhere'

api_endpoint: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video'
image_to_video_endpoint: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video'
tags: [video, standard, motion, cost-effective, kuaishou]
status: 'active'
```

#### Runway Gen-3 Alpha (via FAL.AI)

```yaml
model_id: 'runway-gen3-alpha'
full_id: 'fal-ai/runway/gen3-alpha'
provider: 'FAL.AI'
category: 'video_editing'
subcategory: 'video_to_video'
quality_tier: 'premium'

capabilities:
  video_to_video: true # PRIMARY
  style_transfer: true
  object_manipulation: true
  scene_modification: true
  temporal_consistency: true

specifications:
  input: 'existing_video'
  max_duration: 60
  generation_time: 180-300
  output_format: 'mp4'

pricing:
  model: 'fixed_per_video'
  cost: 0.12
  billing_unit: 'video'

quality_metrics:
  transformation_quality: 92
  consistency: 94
  style_accuracy: 90

best_for:
  - Transforming existing footage
  - Style changes
  - Scene modifications
  - Creative video editing

use_when:
  - User has source video
  - Needs transformation not generation
  - Style transfer required

api_endpoint: 'fal-ai/runway/gen3-alpha'
tags: [video, editing, transformation, style-transfer]
status: 'active'
```

#### Runway Gen-3 Turbo (via FAL.AI)

```yaml
model_id: 'runway-gen3-turbo'
full_id: 'fal-ai/runway/gen3-turbo'
provider: 'FAL.AI'
category: 'video_editing'
subcategory: 'video_to_video'
quality_tier: 'standard'

capabilities:
  video_to_video: true
  style_transfer: true
  faster_generation: true

specifications:
  input: 'existing_video'
  generation_time: 120-180
  output_format: 'mp4'

pricing:
  model: 'fixed_per_video'
  cost: 0.08
  billing_unit: 'video'
  notes: '33% cheaper than Alpha, slightly lower quality'

best_for:
  - Budget video transformations
  - Fast turnaround needed
  - Good enough quality acceptable

api_endpoint: 'fal-ai/runway/gen3-turbo'
tags: [video, editing, fast, budget]
status: 'active'
```

#### MiniMax Hailuo-02 (via FAL.AI)

```yaml
model_id: 'minimax-hailuo-02'
full_id: 'fal-ai/minimax-hailuo-02'
provider: 'FAL.AI'
category: 'video_generation'
subcategory: 'image_to_video'
quality_tier: 'fast'

capabilities:
  image_to_video: true
  fast_generation: true
  good_motion: true

specifications:
  base_duration: 6
  resolution: '720p'
  audio_included: false
  generation_time: 60-90
  output_format: 'mp4'

pricing:
  model: 'fixed_per_video'
  cost: 0.06
  billing_unit: 'video'
  notes: 'Most economical option'

quality_metrics:
  realism: 75
  motion_quality: 78
  prompt_adherence: 72

best_for:
  - Budget image animation
  - When speed is priority
  - Simple motion needs
  - High-volume generation

use_when:
  - Budget is very limited
  - Fast delivery critical
  - Standard quality acceptable
  - Volume over perfection

api_endpoint: 'fal-ai/minimax-hailuo-02'
tags: [video, fast, budget, economical]
status: 'active'
```

#### Wan 2.5 (via FAL.AI)

```yaml
model_id: 'wan-2.5'
full_id: 'fal-ai/wan-2.5'
provider: 'FAL.AI'
category: 'video_generation'
subcategory: 'image_to_video'
quality_tier: 'standard'

capabilities:
  image_to_video: true
  native_audio: true
  natural_motion: true

specifications:
  max_duration: 10
  resolution: '720p'
  audio_included: true
  generation_time: 120-180
  output_format: 'mp4'

pricing:
  model: 'fixed_per_video'
  cost: 0.08
  billing_unit: 'video'

quality_metrics:
  realism: 80
  motion_quality: 82
  audio_quality: 75

best_for:
  - Budget image animation with audio
  - When Veo/Sora too expensive
  - Simple animated scenes

use_when:
  - Need audio but budget limited
  - Image-to-video is sufficient
  - Standard quality acceptable

api_endpoint: 'fal-ai/wan-2.5'
tags: [video, standard, audio, budget-friendly]
status: 'active'
```

#### OmniHuman v1.5 (via FAL.AI)

```yaml
model_id: 'omnihuman-v1.5'
full_id: 'fal-ai/omnihuman-v1.5'
provider: 'FAL.AI'
category: 'ugc_video'
subcategory: 'avatar_generation'
quality_tier: 'premium'

capabilities:
  realistic_avatars: true
  natural_gestures: true
  lip_sync: true
  multi_language: true
  custom_voice: true
  expression_control: true

specifications:
  max_duration: 60
  resolution: '1280x720'
  generation_time: 120-180
  input_options: ['text_script', 'audio_file']
  output_format: 'mp4'

pricing:
  model: 'fixed_per_video'
  cost: 0.15
  billing_unit: 'video'

quality_metrics:
  avatar_realism: 88
  lip_sync_accuracy: 92
  gesture_natural: 85
  voice_quality: 90

best_for:
  - UGC-style marketing videos
  - Product testimonials
  - Educational content
  - Spokesperson videos
  - Social media ads

use_when:
  - Need authentic human presence
  - User requests "influencer style"
  - Budget allows premium avatar
  - Multi-lingual content needed

workflow_options:
  option_a: 'Text → XTTS → OmniHuman'
  option_b: 'Pre-recorded audio → OmniHuman'
  option_c: 'Multiple avatars → segments'

api_endpoint: 'fal-ai/omnihuman-v1.5'
tags: [video, ugc, avatar, testimonial, spokesperson]
status: 'active'
```

### 2.2 Image Generation Models

#### FLUX 1.1 Pro (via FAL.AI)

```yaml
model_id: 'flux-1.1-pro'
full_id: 'fal-ai/flux-pro/v1.1'
provider: 'FAL.AI'
category: 'image_generation'
subcategory: 'text_to_image'
quality_tier: 'premium'

capabilities:
  photorealistic: true
  exceptional_detail: true
  text_accuracy: true
  fast_generation: true
  style_versatile: true

specifications:
  max_resolution: '2048x2048'
  generation_time: 10-15
  output_format: 'PNG'
  aspect_ratios: ['1:1', '16:9', '9:16', '4:3', '3:4']

pricing:
  model: 'fixed_per_image'
  cost: 0.055
  billing_unit: 'image'

quality_metrics:
  photorealism: 96
  detail_quality: 98
  text_rendering: 90
  prompt_adherence: 94

best_for:
  - Product photography
  - Marketing materials
  - Photorealistic scenes
  - High-detail requirements
  - Professional content

use_when:
  - DEFAULT choice for images
  - Quality is important
  - Photorealism needed
  - Professional output required

api_endpoint: 'fal-ai/flux-pro/v1.1'
tags: [image, premium, photorealistic, fast, versatile]
status: 'active'
```

#### FLUX Pro (via FAL.AI)

```yaml
model_id: 'flux-pro'
full_id: 'fal-ai/flux-pro'
provider: 'FAL.AI'
category: 'image_generation'
subcategory: 'text_to_image'
quality_tier: 'premium'

capabilities:
  photorealistic: true
  high_detail: true
  fast_generation: true

specifications:
  max_resolution: '2048x2048'
  generation_time: 10-15
  output_format: 'PNG'

pricing:
  model: 'fixed_per_image'
  cost: 0.055
  billing_unit: 'image'

quality_metrics:
  photorealism: 95
  detail_quality: 96
  prompt_adherence: 92

best_for:
  - Stable alternative to v1.1
  - Professional images
  - Proven reliability

api_endpoint: 'fal-ai/flux-pro'
tags: [image, premium, photorealistic, stable]
status: 'active'
```

#### FLUX Schnell (via FAL.AI)

```yaml
model_id: 'flux-schnell'
full_id: 'fal-ai/flux/schnell'
provider: 'FAL.AI'
category: 'image_generation'
subcategory: 'text_to_image'
quality_tier: 'fast'

capabilities:
  fast_generation: true # 3-5 seconds
  good_quality: true
  cost_effective: true

specifications:
  max_resolution: '1024x1024'
  generation_time: 3-5
  output_format: 'PNG'

pricing:
  model: 'fixed_per_image'
  cost: 0.003
  billing_unit: 'image'
  notes: '94% cheaper than FLUX Pro'

quality_metrics:
  photorealism: 75
  detail_quality: 78
  speed: 98

best_for:
  - Rapid prototyping
  - Budget projects
  - High-volume generation
  - When speed > quality

use_when:
  - User requests "fast" or "draft"
  - Budget is very limited
  - Testing/iteration phase
  - Volume over perfection

cost_benefit:
  savings_vs_pro: '94%'
  use_case: 'Generate 10 variations for $0.03 vs $0.55'

api_endpoint: 'fal-ai/flux/schnell'
tags: [image, fast, budget, economical, volume]
status: 'active'
```

#### Recraft v3 (via FAL.AI)

```yaml
model_id: 'recraft-v3'
full_id: 'fal-ai/recraft-v3'
provider: 'FAL.AI'
category: 'image_generation'
subcategory: 'illustration'
quality_tier: 'premium'

capabilities:
  illustration_styles: true
  cartoon_anime: true
  graphic_design: true
  brand_materials: true

specifications:
  max_resolution: '1024x1024'
  generation_time: 10-15
  output_format: 'PNG'
  styles: ['digital_illustration', 'realistic_image', 'vector_illustration']

pricing:
  model: 'fixed_per_image'
  cost: 0.04
  billing_unit: 'image'

quality_metrics:
  illustration_quality: 92
  style_variety: 95
  brand_friendly: 90

best_for:
  - Illustrations
  - Cartoon characters
  - Graphic design
  - Brand materials
  - Non-photorealistic needs

use_when:
  - User requests artistic/illustration
  - Cartoon or anime aesthetic
  - Design-focused project
  - Brand identity work

api_endpoint: 'fal-ai/recraft-v3'
tags: [image, illustration, cartoon, design, brand]
status: 'active'
```

#### Recraft v3 SVG (via FAL.AI)

```yaml
model_id: 'recraft-v3-svg'
full_id: 'fal-ai/recraft-v3/svg'
provider: 'FAL.AI'
category: 'image_generation'
subcategory: 'vector_graphics'
quality_tier: 'premium'

capabilities:
  vector_output: true # SVG format
  infinite_scalability: true
  text_rendering: true # EXCELLENT
  logo_creation: true
  precise_graphics: true

specifications:
  output_format: 'SVG'
  generation_time: 10-15
  scalability: 'infinite'
  text_support: 'excellent'

pricing:
  model: 'fixed_per_image'
  cost: 0.04
  billing_unit: 'image'

quality_metrics:
  vector_quality: 98
  text_accuracy: 95
  scalability: 100

best_for:
  - Logos
  - Text-heavy graphics
  - Scalable designs
  - Icons and symbols
  - Print materials

use_when:
  - User needs vector format
  - Logos or icons required
  - Text is important element
  - Scalability needed

api_endpoint: 'fal-ai/recraft-v3/svg'
tags: [image, vector, logo, scalable, text]
status: 'active'
```

#### Nano Banana (Google via FAL.AI)

```yaml
model_id: 'nano-banana'
full_id: 'fal-ai/nano-banana/edit'
provider: 'FAL.AI'
original_provider: 'Google'
category: 'image_editing'
subcategory: 'photorealistic_editing'
quality_tier: 'premium'

capabilities:
  natural_language_editing: true
  photorealistic_output: true
  object_manipulation: true
  character_consistency: true
  style_preservation: true
  detail_enhancement: true

specifications:
  input: 'image + text_instruction'
  output_format: 'PNG'
  generation_time: 5-10
  
pricing:
  model: 'fixed_per_edit'
  cost: 0.03
  billing_unit: 'edit'

quality_metrics:
  editing_quality: 98
  consistency: 96
  photorealism: 97

rankings:
  lmarena_leaderboard: 1 # #1 on LMArena image editing

best_for:
  - Editing existing images
  - Character consistency across scenes
  - Object removal/addition
  - Style-preserving modifications
  - Photorealistic touch-ups

use_when:
  - Starting from existing image
  - Need to modify without regenerating
  - Character consistency critical
  - Photorealistic edits required

workflow_patterns:
  character_consistency:
    - 'FLUX Pro base → Nano Banana variations'
    - 'Saves cost vs multiple FLUX generations'
  product_variations:
    - 'FLUX Pro product → Nano Banana color/style changes'

api_endpoint: 'fal-ai/nano-banana/edit'
tags: [image, editing, google, consistency, photorealistic]
status: 'active'
ranking_position: 1
ranking_source: 'LMArena Image Editing Leaderboard'
```

#### Midjourney V7 (via KIE.AI)

```yaml
model_id: 'midjourney-v7'
full_id: 'midjourney-v7'
provider: 'KIE.AI'
original_provider: 'Midjourney'
category: 'image_generation'
subcategory: 'artistic'
quality_tier: 'premium'

capabilities:
  artistic_interpretation: true
  unique_aesthetics: true
  creative_styles: true
  high_originality: true
  exceptional_quality: true

specifications:
  max_resolution: 'variable' # up to 2048px
  style_range: 'extremely_wide'
  generation_time: 60-120
  output_format: 'PNG'

pricing:
  model: 'credit_based'
  estimated_cost: 0.04-0.08 # per image
  billing_unit: 'image'
  provider_discount: '40-60% vs official'
  notes: 'Via KIE.AI credit system'

quality_metrics:
  artistic_quality: 98
  originality: 98
  aesthetic_appeal: 97
  prompt_creativity: 92

best_for:
  - Artistic projects
  - Creative campaigns
  - Unique visual identity
  - When originality is key
  - Brand distinctiveness

use_when:
  - User requests "artistic" or "unique"
  - Standard photorealism too generic
  - Brand needs distinctive look
  - Budget allows KIE.AI access

api_endpoint: 'KIE.AI: /v1/midjourney'
api_key_required: 'KIE_API_KEY'
tags: [image, artistic, creative, midjourney, unique]
status: 'active'
provider_integration: 'KIE.AI'
```

#### Hunyuan Image 3 (via FAL.AI)

```yaml
model_id: 'hunyuan-image-3'
full_id: 'fal-ai/hunyuan-image-3'
provider: 'FAL.AI'
category: 'image_generation'
subcategory: 'text_to_image'
quality_tier: 'premium'

capabilities:
  text_accuracy: true # EXCELLENT
  photorealistic: true
  chinese_language: true
  high_detail: true

specifications:
  max_resolution: '2048x2048'
  generation_time: 15-20
  output_format: 'PNG'

pricing:
  model: 'fixed_per_image'
  cost: 0.05
  billing_unit: 'image'

quality_metrics:
  text_accuracy: 95
  photorealism: 90
  chinese_support: 98

best_for:
  - Images with text elements
  - Multi-lingual content (esp. Chinese)
  - Photorealistic needs
  - Alternative to FLUX Pro

use_when:
  - Text accuracy is critical
  - Chinese language content
  - Alternative to FLUX Pro
  - Specific text rendering needs

api_endpoint: 'fal-ai/hunyuan-image-3'
tags: [image, text-accuracy, chinese, photorealistic]
status: 'active'
```

### 2.3 Audio Generation Models

#### XTTS v2 (Internal - AIDA)

```yaml
model_id: 'xtts-v2'
full_id: 'xtts-v2-internal'
provider: 'Internal'
category: 'audio_generation'
subcategory: 'text_to_speech'
quality_tier: 'premium'

capabilities:
  natural_voice_synthesis: true
  multi_lingual: true # 29+ languages
  voice_cloning: true
  emotional_control: true
  fast_generation: true

specifications:
  languages: 29+ # en, it, es, fr, de, pt, pl, ar, zh, ja, ko, etc.
  generation_time: 5-10
  output_format: 'WAV'
  quality: '24kHz'
  max_length: 300 # seconds

pricing:
  model: 'internal'
  cost: 0.00 # FREE
  billing_unit: 'generation'
  notes: 'Internal deployment - zero cost'

quality_metrics:
  naturalness: 90
  pronunciation: 92
  emotion_control: 85
  multilingual_quality: 88

voice_options:
  - professional_male
  - professional_female
  - casual_male
  - casual_female
  - enthusiastic
  - calm
  - authoritative

best_for:
  - Voiceovers
  - Narration
  - Character voices
  - Multi-lingual content
  - Educational videos

use_when:
  - ANY text-to-speech need # ALWAYS FIRST CHOICE
  - Multiple language versions
  - Budget is consideration (FREE)
  - Voice customization needed

cost_advantage:
  vs_alternatives: '100% savings'
  recommendation: 'ALWAYS use XTTS first'

api_endpoint: 'http://localhost:3002/tts/generate'
internal: true
tags: [audio, tts, free, internal, multilingual]
status: 'active'
priority: 'always_first'
```

#### Udio (via KIE.AI)

```yaml
model_id: 'udio'
full_id: 'udio'
provider: 'KIE.AI'
category: 'audio_generation'
subcategory: 'music_generation'
quality_tier: 'premium'

capabilities:
  music_creation: true
  genre_diversity: true
  lyric_integration: true
  commercial_quality: true

specifications:
  max_duration: 120 # seconds
  output_format: 'MP3'
  generation_time: 60-120

pricing:
  model: 'credit_based'
  estimated_cost: 0.10-0.20 # per track
  billing_unit: 'track'
  provider_discount: '40-60% vs official'
  notes: 'Via KIE.AI credit system'

quality_metrics:
  music_quality: 88
  genre_accuracy: 85
  commercial_ready: 90

best_for:
  - Background music
  - Original soundtracks
  - Brand audio identity
  - Music videos

use_when:
  - Need original music
  - Custom audio branding
  - Background tracks for videos
  - Budget allows KIE.AI

api_endpoint: 'KIE.AI: /v1/udio'
api_key_required: 'KIE_API_KEY'
tags: [audio, music, udio, creative]
status: 'active'
provider_integration: 'KIE.AI'
```

---

## 3. Pricing Matrix

### 3.1 Cost Comparison

```yaml
Video Generation (per 5 seconds):
  Cinematic Tier:
    - Sora 2 Pro: $0.15 (up to 60s fixed)
    - Veo 3.1: $0.12 (up to 60s fixed)
  
  Premium Tier:
    - Sora 2: $0.10 (up to 60s fixed)
    - OmniHuman v1.5: $0.15 (up to 60s fixed)
  
  Standard Tier:
    - Kling 2.5 Pro: $0.35 (5s) + $0.07/extra s
    - Wan 2.5: $0.08 (up to 10s fixed)
    - Runway Gen-3 Alpha: $0.12
    - Runway Gen-3 Turbo: $0.08
  
  Fast Tier:
    - MiniMax Hailuo-02: $0.06

Image Generation:
  Premium Tier:
    - FLUX Pro v1.1: $0.055
    - FLUX Pro: $0.055
    - Hunyuan Image 3: $0.05
    - Midjourney V7: $0.04-0.08 (KIE.AI)
  
  Standard Tier:
    - Recraft v3: $0.04
    - Recraft v3 SVG: $0.04
  
  Editing:
    - Nano Banana: $0.03
  
  Fast Tier:
    - FLUX Schnell: $0.003 (94% cheaper!)

Audio Generation:
  Free:
    - XTTS v2: $0.00 (internal)
  
  Paid:
    - Udio: $0.10-0.20 (KIE.AI)
```

### 3.2 Cost Per Use Case

```yaml
Social Media Post (single image):
  Budget: FLUX Schnell = $0.003
  Standard: FLUX Pro = $0.055
  Premium: Midjourney V7 = $0.06

Product Photo:
  Standard: FLUX Pro = $0.055
  
UGC Video (20s with voiceover):
  Audio: XTTS v2 = $0.00
  Video: OmniHuman = $0.15
  Total: $0.15

Marketing Video (30s, 3 scenes):
  Images: 3 × FLUX Pro = $0.165
  Videos: 3 × Kling 10s = $2.10
  Voiceover: XTTS v2 = $0.00
  Total: $2.27

Logo Design:
  Vector: Recraft v3 SVG = $0.04

Character Consistency (4 images):
  Base: FLUX Pro = $0.055
  Edits: 3 × Nano Banana = $0.09
  Total: $0.145
```

---

## 4. Capabilities Map

### 4.1 By Feature

```yaml
Native Audio Generation:
  - Sora 2 / Sora 2 Pro ✅
  - Veo 3.1 ✅
  - Wan 2.5 ✅
  - OmniHuman v1.5 ✅ (with XTTS)
  - Kling 2.5 ❌ (add separately)
  - MiniMax ❌ (add separately)

Photorealistic Quality:
  - FLUX Pro v1.1 ✅ (98/100)
  - FLUX Pro ✅ (96/100)
  - Sora 2 Pro ✅ (98/100)
  - Veo 3.1 ✅ (94/100)
  - Nano Banana ✅ (97/100)

Artistic/Creative:
  - Midjourney V7 ✅ (98/100)
  - Recraft v3 ✅ (92/100)

Text Rendering:
  - Recraft v3 SVG ✅ (95/100)
  - Hunyuan Image 3 ✅ (95/100)
  - FLUX Pro ⚠️ (moderate)

Character Consistency:
  - Nano Banana ✅ (#1 editing tool)
  - FLUX Pro + Nano Banana ✅ (workflow)

Motion Quality:
  - Kling 2.5 Pro ✅ (95/100 - exceptional)
  - Sora 2 Pro ✅ (98/100)
  - Veo 3.1 ✅ (92/100)

Cost Efficiency:
  - FLUX Schnell ✅ (94% savings)
  - XTTS v2 ✅ (100% savings - free)
  - MiniMax ✅ (cheapest video)
  - Kling 2.5 ✅ (best quality/price)
```

### 4.2 By Use Case

```yaml
Commercial/Luxury:
  Video: Sora 2 Pro, Veo 3.1
  Image: FLUX Pro v1.1, Midjourney V7

Professional/Standard:
  Video: Sora 2, Kling 2.5 Pro
  Image: FLUX Pro, Recraft v3

Budget/Fast:
  Video: MiniMax Hailuo-02
  Image: FLUX Schnell

UGC/Testimonial:
  Video: OmniHuman v1.5
  Audio: XTTS v2

Product Photography:
  Image: FLUX Pro v1.1
  Edit: Nano Banana

Illustration/Design:
  Image: Recraft v3
  Vector: Recraft v3 SVG

Video Transformation:
  Edit: Runway Gen-3 Alpha/Turbo

Voiceover:
  Audio: XTTS v2 (always)

Music:
  Audio: Udio (via KIE.AI)
```

---

## 5. Provider Integration

### 5.1 FAL.AI Integration

```yaml
Provider: FAL.AI
Base URL: https://fal.run/
Auth: API Key (FAL_API_KEY)
Payment: Credit-based
Status: Primary provider

Models Count: 40+

Categories:
  video_generation:
    - Sora 2, Sora 2 Pro
    - Veo 3.1
    - Kling 2.5 Turbo Pro
    - Runway Gen-3 (Alpha, Turbo)
    - MiniMax Hailuo-02
    - Wan 2.5
    - OmniHuman v1.5
  
  image_generation:
    - FLUX (Pro v1.1, Pro, Schnell)
    - Recraft (v3, v3 SVG)
    - Hunyuan Image 3
    - Nano Banana

API Pattern:
  POST https://fal.run/{model_id}
  Headers:
    Authorization: Key {FAL_API_KEY}
    Content-Type: application/json
  Body:
    {
      "prompt": "...",
      "model_specific_params": {}
    }

Rate Limits:
  - Varies by model
  - Generally generous
  - 429 error on limit hit

Error Handling:
  - 5xx: Retry with exponential backoff
  - 429: Wait and retry
  - 400: Invalid params, fix and retry
```

### 5.2 KIE.AI Integration

```yaml
Provider: KIE.AI
Base URL: https://api.kie.ai/
Auth: API Key (KIE_API_KEY)
Payment: Credit system ($5 minimum)
Status: Secondary provider (Midjourney + Udio)

Models Count: 2

Models:
  - Midjourney V7 (image, artistic)
  - Udio (audio, music)

Pricing Advantage:
  - 40-60% cheaper than official
  - Credit-based flexible system

API Pattern:
  POST https://api.kie.ai/v1/{model}
  Headers:
    Authorization: Bearer {KIE_API_KEY}
    Content-Type: application/json

Integration Strategy:
  Use KIE.AI only for:
    - Midjourney (no alternative)
    - Udio (music generation)
  
  All other models via FAL.AI
```

### 5.3 Internal Services

```yaml
Provider: AIDA Internal
Base URL: http://localhost:3002
Auth: Internal (no key needed)
Status: Internal services

Models:
  - XTTS v2 (text-to-speech)

Advantages:
  - Zero cost
  - No rate limits
  - Fast response
  - Full control

API Pattern:
  POST http://localhost:3002/tts/generate
  Body:
    {
      "text": "...",
      "voice": "professional_female",
      "language": "en",
      "emotion": "confident"
    }

Priority:
  ALWAYS use XTTS v2 first for any TTS needs
  Only use alternatives if XTTS fails (rare)
```

---

## 6. Seed Data (JSON)

### 6.1 Database Seed Format

```json
{
  "version": "1.0",
  "last_updated": "2025-10-18",
  "models": [
    {
      "model_id": "sora-2-standard",
      "full_id": "fal-ai/sora-2",
      "name": "Sora 2",
      "provider": "FAL.AI",
      "original_provider": "OpenAI",
      "category": "video_generation",
      "subcategory": "text_to_video",
      "quality_tier": "premium",
      "capabilities": {
        "text_to_video": true,
        "image_to_video": true,
        "native_audio": true,
        "synchronized_dialogue": true,
        "photorealistic": true,
        "advanced_physics": true,
        "camera_movements": true
      },
      "specifications": {
        "max_duration": 60,
        "resolution": "1080p",
        "aspect_ratios": ["16:9", "9:16", "1:1", "4:3"],
        "audio_included": true,
        "generation_time_min": 180,
        "generation_time_max": 300,
        "output_format": "mp4"
      },
      "pricing": {
        "model": "fixed_per_video",
        "cost": 0.10,
        "currency": "USD",
        "billing_unit": "video"
      },
      "quality_metrics": {
        "realism": 95,
        "motion_quality": 95,
        "audio_quality": 90,
        "prompt_adherence": 92
      },
      "best_for": [
        "High-end commercial content",
        "Cinematic storytelling",
        "Content requiring dialogue",
        "Premium brand campaigns"
      ],
      "tags": ["video", "premium", "audio", "openai", "photorealistic", "cinematic"],
      "status": "active",
      "api_endpoint": "fal-ai/sora-2",
      "added_date": "2025-10-05",
      "last_verified": "2025-10-18"
    }
    // ... more models
  ],
  "providers": [
    {
      "id": "fal-ai",
      "name": "FAL.AI",
      "base_url": "https://fal.run/",
      "auth_type": "api_key",
      "status": "active",
      "model_count": 40,
      "priority": 1
    },
    {
      "id": "kie-ai",
      "name": "KIE.AI",
      "base_url": "https://api.kie.ai/",
      "auth_type": "bearer_token",
      "status": "active",
      "model_count": 2,
      "priority": 2
    },
    {
      "id": "internal",
      "name": "AIDA Internal",
      "base_url": "http://localhost:3002",
      "auth_type": "none",
      "status": "active",
      "model_count": 1,
      "priority": 0
    }
  ]
}
```

*Full seed data JSON file will be created separately as `model-catalog-seed.json`*

---

## 7. Admin UI Specifications

### 7.1 Model Management Interface

```yaml
Page: /admin/models

Features:
  - List all models with filters
  - Enable/disable models
  - Update pricing
  - Add new models
  - View usage statistics
  - Test model endpoints

Filters:
  - By provider (FAL.AI, KIE.AI, Internal)
  - By category (video, image, audio)
  - By status (active, inactive, maintenance)
  - By quality tier (fast, standard, premium, cinematic)

Table Columns:
  - Model Name
  - Provider
  - Category
  - Cost
  - Status
  - Last Used
  - Success Rate
  - Actions (Edit, Disable, Test)

Actions:
  - Quick Enable/Disable toggle
  - Edit model details
  - Test generation
  - View analytics
```

### 7.2 Cost Tracking Dashboard

```yaml
Page: /admin/analytics/costs

Metrics:
  Total Spend:
    - Today
    - This Week
    - This Month
    - All Time
  
  By Provider:
    - FAL.AI spend
    - KIE.AI spend
    - XTTS savings (free)
  
  By Model:
    - Top 10 most expensive models
    - Usage vs Cost ratio
  
  By User/Project:
    - Cost per user
    - Cost per project

Visualizations:
  - Line chart: Spend over time
  - Pie chart: Spend by provider
  - Bar chart: Cost by model
  - Table: Top spending projects

Alerts:
  - Daily budget exceeded
  - Unusual spending patterns
  - Model failure rate high
```

### 7.3 Model Testing Interface

```yaml
Page: /admin/models/{model_id}/test

Features:
  - Live model testing
  - Custom prompt input
  - Parameter adjustment
  - Result preview
  - Cost estimation
  - Performance metrics

Form Fields:
  - Prompt (textarea)
  - Model-specific parameters
  - Number of variations
  - Expected cost display

Results Display:
  - Generated output (image/video/audio)
  - Actual generation time
  - Actual cost
  - Quality assessment
  - Success/Failure status

Analytics:
  - Average generation time
  - Success rate
  - Cost per generation
  - Quality score (if available)
```

### 7.4 Provider Configuration

```yaml
Page: /admin/providers

Features:
  - Manage provider API keys
  - Test provider connectivity
  - View provider status
  - Configure rate limits
  - Set budget caps

Provider Card:
  name: Provider Name
  status: Active/Inactive
  model_count: X models
  total_cost: $X.XX this month
  success_rate: XX%
  actions:
    - Configure
    - Test Connection
    - View Models

Configuration Form:
  - API Key (encrypted storage)
  - Base URL
  - Rate limit settings
  - Budget cap per day/month
  - Webhook URL (for status updates)
```

---

## 8. Migration Scripts

### 8.1 Database Schema

```sql
-- Models Table
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT UNIQUE NOT NULL,
  full_id TEXT NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  original_provider TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  quality_tier TEXT NOT NULL,
  
  -- Capabilities (JSONB)
  capabilities JSONB NOT NULL,
  
  -- Specifications (JSONB)
  specifications JSONB NOT NULL,
  
  -- Pricing
  pricing_model TEXT NOT NULL,
  cost DECIMAL(10,4) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_unit TEXT NOT NULL,
  
  -- Quality Metrics (JSONB)
  quality_metrics JSONB,
  
  -- Metadata
  best_for TEXT[],
  tags TEXT[],
  status TEXT DEFAULT 'active',
  api_endpoint TEXT NOT NULL,
  documentation_url TEXT,
  
  -- Timestamps
  added_date DATE DEFAULT CURRENT_DATE,
  last_verified DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers Table
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  auth_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  model_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 1,
  
  -- Configuration (JSONB - encrypted API keys stored here)
  config JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model Usage Tracking
CREATE TABLE IF NOT EXISTS model_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT REFERENCES models(model_id),
  user_id UUID,
  project_id UUID,
  
  -- Usage Details
  prompt TEXT,
  parameters JSONB,
  
  -- Results
  success BOOLEAN,
  generation_time INTEGER, -- seconds
  actual_cost DECIMAL(10,4),
  output_url TEXT,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost Tracking
CREATE TABLE IF NOT EXISTS cost_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  provider TEXT NOT NULL,
  model_id TEXT,
  
  -- Aggregates
  total_cost DECIMAL(10,2) NOT NULL,
  usage_count INTEGER NOT NULL,
  success_count INTEGER NOT NULL,
  failure_count INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date, provider, model_id)
);

-- Indexes
CREATE INDEX idx_models_provider ON models(provider);
CREATE INDEX idx_models_category ON models(category);
CREATE INDEX idx_models_status ON models(status);
CREATE INDEX idx_model_usage_model_id ON model_usage(model_id);
CREATE INDEX idx_model_usage_created_at ON model_usage(created_at);
CREATE INDEX idx_cost_tracking_date ON cost_tracking(date);
```

### 8.2 Seed Data Import Script

```typescript
// scripts/seed-models.ts
import { createClient } from '@supabase/supabase-js';
import modelCatalogSeed from './model-catalog-seed.json';

async function seedModels() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  console.log('Seeding models database...');
  
  // Insert providers
  for (const provider of modelCatalogSeed.providers) {
    const { error } = await supabase
      .from('providers')
      .upsert(provider, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error seeding provider ${provider.id}:`, error);
    } else {
      console.log(`✓ Provider: ${provider.name}`);
    }
  }
  
  // Insert models
  for (const model of modelCatalogSeed.models) {
    const { error } = await supabase
      .from('models')
      .upsert(model, { onConflict: 'model_id' });
    
    if (error) {
      console.error(`Error seeding model ${model.model_id}:`, error);
    } else {
      console.log(`✓ Model: ${model.name}`);
    }
  }
  
  console.log('\nSeed complete!');
  console.log(`Total Providers: ${modelCatalogSeed.providers.length}`);
  console.log(`Total Models: ${modelCatalogSeed.models.length}`);
}

seedModels().catch(console.error);
```

---

## Appendix: Quick Reference

### Model Selection Cheat Sheet

```yaml
Need Video?
  Luxury/Cinematic: Sora 2 Pro ($0.15)
  Premium: Sora 2 ($0.10) or Veo 3.1 ($0.12)
  Standard: Kling 2.5 Pro ($0.35/5s)
  Budget: MiniMax ($0.06)
  UGC/Avatar: OmniHuman ($0.15)
  Transform Existing: Runway Gen-3

Need Image?
  Photorealistic: FLUX Pro ($0.055)
  Artistic: Midjourney V7 ($0.06)
  Illustration: Recraft v3 ($0.04)
  Logo/Vector: Recraft v3 SVG ($0.04)
  Edit Existing: Nano Banana ($0.03)
  Fast/Draft: FLUX Schnell ($0.003)

Need Audio?
  Voiceover: XTTS v2 (FREE - always use first!)
  Music: Udio ($0.15)

Character Consistency?
  FLUX Pro base + Nano Banana edits

Text in Image?
  Recraft v3 SVG or Hunyuan Image 3

Native Audio Video?
  Sora 2, Veo 3.1, or Wan 2.5
```

---

**Version:** 1.0  
**Last Updated:** October 18, 2025  
**Maintained By:** AIDA Development Team  
**Status:** Production Ready ✅
