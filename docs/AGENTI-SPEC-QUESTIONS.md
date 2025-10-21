# AGENTI - Specifiche e Domande Aperte

**Versione:** 1.0
**Data:** 2025-10-21
**Scopo:** Documentare tutte le domande, dubbi e decisioni da prendere PRIMA di sviluppare gli agenti rimanenti

---

## 📊 Status Certezza per Agente

| Agente | Funzione | Input/Output | Provider | Certezza | Blockers |
|--------|----------|--------------|----------|----------|----------|
| **Writer** | ✅ Chiaro | ✅ Definito | ✅ Claude | **95%** | Nessuno |
| **Audio** | ✅ Chiaro | ✅ Definito | ✅ ElevenLabs | **90%** | API Key setup |
| **Montage** | ⚠️ Unclear | ⚠️ Parziale | ❓ TBD | **70%** | Provider decision |
| **Storage** | ❌ Non definito | - | ❓ TBD | **50%** | Architecture decision |
| **Cost Tracking** | ⚠️ Parziale | ⚠️ Parziale | Supabase? | **60%** | Aggregation logic |
| **Error Recovery** | ❌ Non definito | - | - | **40%** | Strategy undefined |

---

## 🎬 WRITER AGENT (Certezza: 95%)

### ✅ Cosa Sappiamo

**Funzione:**
Generazione script video scene-by-scene con dialoghi, descrizioni, timing

**Input:**
```typescript
{
  projectBrief: ProjectBrief,
  technicalPlan: TechnicalPlan,
  styleGuide: StyleGuide
}
```

**Output:**
```typescript
{
  script_id: string,
  scenes: Scene[],
  voiceOvers: VoiceOver[],
  total_duration_seconds: number,
  word_count: number
}

interface Scene {
  sceneId: string,
  sceneNumber: number,
  description: string,  // Visual description for image generation
  voiceOver: string,    // Narration text for TTS
  duration_seconds: number,
  mood: string,
  cameraAngle?: string
}
```

**Provider:** Anthropic Claude (Sonnet 3.5 or Opus)
**Porta:** 3006
**Costo Stimato:** ~$0.01 per script (500 input + 2000 output tokens)

### ❓ Domande Aperte (5%)

**Q1: Lunghezza Script**
- Durata target video: 60sec, 90sec, 120sec?
- Numero scene: fisso (10 scene) o variabile (8-15)?
- **DECISIONE RICHIESTA:** Standardizzare 60sec = 10 scene da 6sec cadauna?

**Q2: Formato Output**
- JSON puro o Markdown structured?
- Salvare su Supabase o solo in-memory?
- **DECISIONE RICHIESTA:** Salvare script in `workflow_states.scripts` JSONB field?

**Q3: Iterazione/Refining**
- Supportare revisioni script da parte utente?
- Flow: Draft → User feedback → Final?
- **DECISIONE RICHIESTA:** V1 = single-pass, V2 = iterative?

---

## 🎙️ AUDIO AGENT (Certezza: 90%)

### ✅ Cosa Sappiamo

**Funzione:**
Sintesi vocale (TTS) per voice-over di ogni scena

**Input:**
```typescript
{
  script_id: string,
  voiceOvers: {
    sceneId: string,
    text: string,
    mood?: string  // calm, excited, dramatic, etc.
  }[]
}
```

**Output:**
```typescript
{
  audio_id: string,
  audioFiles: {
    sceneId: string,
    audioUrl: string,  // Supabase Storage URL
    duration_seconds: number,
    fileSize_bytes: number
  }[],
  total_duration_seconds: number
}
```

**Provider:** ElevenLabs API
**Porta:** 3007
**Costo Stimato:** ~$0.30 per minuto audio (ElevenLabs pricing)

### ❓ Domande Aperte (10%)

**Q1: Voice Selection**
- Voce fissa (es. "Rachel - Professional") o scelta utente?
- Supportare voci multiple (narratore + personaggi)?
- **DECISIONE RICHIESTA:** V1 = single voice, V2 = multiple?

**Q2: Audio Quality**
- 128kbps MP3 o 256kbps AAC?
- Mono o Stereo?
- **DECISIONE RICHIESTA:** 128kbps Mono per ridurre storage costs?

**Q3: Storage Location**
- Supabase Storage (100GB free, $0.021/GB dopo)?
- Cloudinary ($0.12/GB)?
- AWS S3 ($0.023/GB)?
- **DECISIONE RICHIESTA:** Supabase Storage (integrate with existing stack)?

**Q4: Voice Emotions/Mood**
- ElevenLabs supporta "stability" e "similarity_boost" parameters
- Mappare mood → parameters automaticamente?
- **DECISIONE RICHIESTA:** mood mapping table?

```typescript
const moodMapping = {
  'calm': { stability: 0.7, similarity_boost: 0.5 },
  'excited': { stability: 0.3, similarity_boost: 0.8 },
  'dramatic': { stability: 0.5, similarity_boost: 0.9 }
};
```

---

## 🎞️ MONTAGE AGENT (Certezza: 70%) ⚠️

### ✅ Cosa Sappiamo

**Funzione:**
Assemblare immagini + audio in video finale

**Input:**
```typescript
{
  workflow_id: string,
  images: {
    sceneId: string,
    imageUrl: string,
    duration_seconds: number
  }[],
  audioFiles: {
    sceneId: string,
    audioUrl: string,
    duration_seconds: number
  }[],
  transitions?: 'crossfade' | 'cut' | 'zoom',
  music?: {
    backgroundMusicUrl?: string,
    volume: number  // 0.0 - 1.0
  }
}
```

**Output:**
```typescript
{
  video_id: string,
  videoUrl: string,
  duration_seconds: number,
  fileSize_mb: number,
  resolution: string,  // "1920x1080"
  format: string       // "mp4"
}
```

**Porta:** 3008

### ❓ Domande Critiche (30%) 🚨

**Q1: Provider Selection (CRITICAL)**

**Opzione A: FFmpeg (Local Processing)**
- ✅ Pro: Free, completo controllo, veloce
- ❌ Contro: Qualità transitions basic (no AI motion)
- Costo: $0
- Installazione: `npm install fluent-ffmpeg`
- Esempio:
```typescript
ffmpeg()
  .input('image1.png')
  .loop(6)  // 6 seconds
  .input('audio1.mp3')
  .videoCodec('libx264')
  .outputOptions('-pix_fmt yuv420p')
  .save('scene1.mp4');
```

**Opzione B: RunwayML Gen-3 (AI Motion)**
- ✅ Pro: AI-generated camera movements, smooth transitions
- ❌ Contro: Expensive (~$0.05/sec video = $3 per 60sec)
- Costo: ~$3-5 per video
- API: `runwayml.com/api`

**Opzione C: Pika 1.5 (AI Animation)**
- ✅ Pro: Cheaper than Runway (~$0.02/sec video = $1.20 per 60sec)
- ❌ Contro: Meno controllo rispetto FFmpeg
- Costo: ~$1-2 per video

**Opzione D: Hybrid Approach**
- FFmpeg per simple cuts/crossfades
- Pika/Runway per hero scenes (prima e ultima scena)
- Costo medio: ~$0.50 per video
- Complessità: media

**🔴 DECISIONE RICHIESTA:** Quale provider? Raccomandazione: **Opzione A (FFmpeg) per V1**, poi Opzione D per V2

**Q2: Transitions & Effects**
- Ken Burns effect (zoom + pan su immagini statiche)?
- Crossfade duration: 0.5sec, 1sec, 2sec?
- Background blur/vignette?
- **DECISIONE RICHIESTA:** Standard transitions library?

**Q3: Video Resolution**
- 1920x1080 (Full HD - 200MB per 60sec)?
- 1280x720 (HD - 100MB per 60sec)?
- 3840x2160 (4K - 800MB per 60sec)?
- **DECISIONE RICHIESTA:** 1080p per quality/size balance?

**Q4: Aspect Ratio**
- 16:9 (landscape - YouTube standard)?
- 9:16 (portrait - TikTok/Reels)?
- 1:1 (square - Instagram)?
- User-selectable?
- **DECISIONE RICHIESTA:** Default 16:9, support others in V2?

**Q5: Background Music**
- Dove prenderla? (Epidemic Sound API, Artlist, royalty-free?)?
- Volume mixing: -20dB background quando c'è voice-over?
- **DECISIONE RICHIESTA:** V1 = no music, V2 = integrate Epidemic Sound?

**Q6: Rendering Performance**
- Sync (blocca HTTP request) o Async (webhook callback)?
- Tempo stimato: 30sec per 60sec video (FFmpeg) vs 5min (Pika)?
- **DECISIONE RICHIESTA:** Async con polling endpoint GET /api/video/:id/status?

```typescript
// Async flow
POST /api/montage/create
→ { job_id: "job_123", status: "processing" }

GET /api/montage/job/job_123
→ { status: "processing", progress: 45 }

GET /api/montage/job/job_123 (dopo 2 min)
→ { status: "completed", videoUrl: "https://..." }
```

---

## 💾 FILE STORAGE (Certezza: 50%) 🚨

### ❓ Domande Architetturali (50%)

**Q1: Provider Selection**

**Opzione A: Supabase Storage**
- ✅ Pro: Integrated con database, 100GB free
- ❌ Contro: $0.021/GB dopo 100GB
- Bandwidth: 200GB/month free
- Max file size: 50MB (aumentabile)

**Opzione B: Cloudinary**
- ✅ Pro: Ottimizzazione automatica immagini/video
- ❌ Contro: Expensive ($0.12/GB), 25GB free
- Trasformazioni on-the-fly (resize, compress, format conversion)

**Opzione C: AWS S3**
- ✅ Pro: Industry standard, $0.023/GB, scalable
- ❌ Contro: Setup complex, separato da Supabase
- Bandwidth: $0.09/GB

**Opzione D: Vercel Blob**
- ✅ Pro: Semplicissimo se usiamo Vercel per deploy
- ❌ Contro: $0.15/GB storage, $0.40/GB bandwidth
- Max file size: 500MB

**🔴 DECISIONE RICHIESTA:** Raccomandazione: **Supabase Storage** (coerenza stack, costo)

**Q2: File Organization**

```
bucket: aida-projects/
├── {user_id}/
│   ├── {project_id}/
│   │   ├── images/
│   │   │   ├── scene_1.png
│   │   │   ├── scene_2.png
│   │   ├── audio/
│   │   │   ├── scene_1.mp3
│   │   │   ├── scene_2.mp3
│   │   └── videos/
│   │       └── final.mp4
```

**Q3: Retention Policy**
- Delete dopo 30 giorni?
- Delete dopo download?
- Mantieni forever (user pays)?
- **DECISIONE RICHIESTA:** 30 giorni auto-delete, con opzione "keep forever" (premium)?

**Q4: File Size Limits**
- Immagini: max 10MB cadauna?
- Audio: max 5MB cadauno?
- Video: max 500MB?
- **DECISIONE RICHIESTA:** Enforced at upload time o post-processing compression?

**Q5: CDN/Delivery**
- Supabase CDN built-in?
- CloudFlare in front?
- **DECISIONE RICHIESTA:** Use Supabase CDN (automatic)?

**Q6: Backup Strategy**
- S3 backup ogni 24h?
- Versioning (keep old versions)?
- **DECISIONE RICHIESTA:** V1 = no backup, V2 = S3 cross-region replication?

---

## 💰 COST TRACKING (Certezza: 60%)

### ✅ Cosa Sappiamo

Technical Planner calcola **estimated_cost_usd**, ma dobbiamo tracciare **actual_cost_usd**

**Agenti che Generano Costi:**
1. Writer: Claude API (~$0.01)
2. Visual Creator: FAL/KIE APIs (~$0.05 - $1.50)
3. Audio: ElevenLabs (~$0.30)
4. Montage: Pika/Runway (~$0 - $5) o FFmpeg (free)

**TOTALE STIMATO:** $0.36 - $6.81 per progetto

### ❓ Domande Aperte (40%)

**Q1: Cost Aggregation**

Chi tiene il conto running del budget?

**Opzione A: Orchestrator**
```typescript
// Orchestrator mantiene running_total
workflow_state = {
  budget_usd: 50,
  estimated_cost: 6.50,
  actual_cost_spent: 0,
  steps_completed: []
};

// Dopo ogni agente
actual_cost_spent += agent_response.cost_usd;
remaining_budget = budget_usd - actual_cost_spent;
```

**Opzione B: Ogni Agente Scrive su Supabase**
```sql
-- Table: project_costs
CREATE TABLE project_costs (
  project_id TEXT,
  agent_name TEXT,
  step_id TEXT,
  estimated_cost_usd DECIMAL,
  actual_cost_usd DECIMAL,
  timestamp TIMESTAMP
);

-- Aggregation query
SELECT SUM(actual_cost_usd) FROM project_costs WHERE project_id = 'proj_123';
```

**Opzione C: Hybrid**
- Orchestrator tiene running total in-memory
- Ogni agente scrive su database (audit trail)
- **DECISIONE RICHIESTA:** Raccomandazione: Opzione C

**Q2: Budget Overflow Handling**

User budget: $10
Estimated: $8
Dopo Writer + Visual Creator: $6 spesi
Remaining: $4

Audio Agent richiede $5 → **OVERFLOW!**

**Cosa facciamo?**
- ❌ Bloccare e chiedere user di aumentare budget?
- ❌ Procedere e notificare (over budget)?
- ❌ Usare fallback cheaper model?
- **DECISIONE RICHIESTA:** Bloccare + notifica + opzione "proceed anyway"?

**Q3: Cost Breakdown UI**

L'utente vede:
```
Estimated Cost: $8.50
Actual Cost: $6.75 (saved $1.75!)

Breakdown:
├── Writer: $0.01 (estimated $0.01) ✅
├── Visual Creator: $0.45 (estimated $1.20) ✅ saved $0.75
├── Audio: $0.29 (estimated $0.30) ✅
└── Montage: IN PROGRESS...
```

**DECISIONE RICHIESTA:** Real-time cost updates via WebSocket o polling GET /api/project/:id/costs?

---

## 🔄 ERROR RECOVERY & RETRY LOGIC (Certezza: 40%) 🚨

### ❓ Domande Critiche

**Q1: Partial Failure Scenario**

```
Visual Creator workflow: 10 immagini
├── Step 1: SUCCESS (image_1.png)
├── Step 2: SUCCESS (image_2.png)
├── Step 3: FAILED (API timeout)
└── Steps 4-10: NOT STARTED
```

**Cosa facciamo?**

**Opzione A: Restart from Beginning**
- ❌ Spreco di costi (re-generate image_1, image_2)
- ✅ Semplice da implementare

**Opzione B: Resume from Failed Step**
- ✅ Efficiente (skip step 1-2)
- ❌ Complex state management

```typescript
// Resume logic
const completedSteps = workflow_state.results.filter(r => r.status === 'success');
const failedStep = workflow_state.results.find(r => r.status === 'failed');
const remainingSteps = steps.slice(failedStep.index);

// Retry
await retrySteps(remainingSteps);
```

**Opzione C: Checkpoint System**
```typescript
// Save checkpoint after ogni batch di 3 steps
if (completedSteps.length % 3 === 0) {
  await saveCheckpoint(workflow_id, completedSteps);
}

// On failure
const lastCheckpoint = await loadCheckpoint(workflow_id);
resumeFrom(lastCheckpoint.lastCompletedStep + 1);
```

**🔴 DECISIONE RICHIESTA:** Raccomandazione: **Opzione B** (resume from failed step)

**Q2: Retry Strategy**

**Max Retries:** 3
**Backoff:** Exponential (1sec, 2sec, 4sec)

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

**DECISIONE RICHIESTA:** Confermare max 3 retries? O configurabile per agent?

**Q3: Fallback Model Strategy**

```typescript
// Primary fails, use fallback
const strategy = {
  primary: 'flux-pro-1.1',    // $0.05, slow, high quality
  fallback: 'flux-schnell',   // $0.01, fast, draft quality
};

// After 3 failed retries with primary
if (retries >= 3) {
  console.warn('Primary model failed, using fallback');
  result = await executewith(fallbackModel);
}
```

**DECISIONE RICHIESTA:** Fallback automatico o ask user permission?

**Q4: Error Types & Handling**

```typescript
enum ErrorType {
  API_TIMEOUT = 'api_timeout',         // Retry: YES
  API_RATE_LIMIT = 'api_rate_limit',   // Retry: YES (after 60sec)
  INVALID_PROMPT = 'invalid_prompt',   // Retry: NO (fix prompt first)
  INSUFFICIENT_FUNDS = 'insufficient_funds', // Retry: NO (user action required)
  MODEL_UNAVAILABLE = 'model_unavailable',   // Retry: Fallback model
}

function shouldRetry(error: ErrorType): boolean {
  return [
    ErrorType.API_TIMEOUT,
    ErrorType.API_RATE_LIMIT,
    ErrorType.MODEL_UNAVAILABLE
  ].includes(error);
}
```

**DECISIONE RICHIESTA:** Approve error classification?

**Q5: User Notifications**

```typescript
// Real-time updates
websocket.emit('workflow_update', {
  workflow_id: 'wf_123',
  status: 'retrying',
  message: 'Step 3 failed (API timeout), retrying in 2 seconds... (attempt 2/3)',
  progress: 25
});
```

**DECISIONE RICHIESTA:** WebSocket o polling? Notifiche email se fallisce completamente?

---

## 🗄️ WORKFLOW STATE MANAGEMENT

### ✅ Cosa Sappiamo

Abbiamo `migrations/001_workflow_states.sql`:

```sql
CREATE TABLE workflow_states (
  workflow_id TEXT PRIMARY KEY,
  current_step TEXT,  -- 'style_selection' | 'planning' | 'script_generation' | etc.
  progress_percentage INTEGER,
  technical_plan JSONB,
  model_selections JSONB,
  cost_estimate JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### ❓ Domande (20%)

**Q1: Estendere per Tutti gli Agenti?**

```sql
ALTER TABLE workflow_states ADD COLUMN script JSONB;
ALTER TABLE workflow_states ADD COLUMN audio_files JSONB;
ALTER TABLE workflow_states ADD COLUMN final_video JSONB;
ALTER TABLE workflow_states ADD COLUMN actual_costs JSONB;
ALTER TABLE workflow_states ADD COLUMN error_log JSONB;
```

**DECISIONE RICHIESTA:** Approve schema extension?

**Q2: current_step Values**

```typescript
type WorkflowStep =
  | 'style_selection'      // Style Selector
  | 'technical_planning'   // Technical Planner
  | 'script_generation'    // Writer ← NEW
  | 'image_generation'     // Visual Creator
  | 'audio_synthesis'      // Audio Agent ← NEW
  | 'video_montage'        // Montage Agent ← NEW
  | 'completed'
  | 'failed';
```

**DECISIONE RICHIESTA:** Approve step names?

**Q3: Progress Calculation**

```typescript
const STEP_WEIGHTS = {
  style_selection: 5,      // 5%
  technical_planning: 10,  // 10%
  script_generation: 15,   // 15%
  image_generation: 40,    // 40% (longest)
  audio_synthesis: 15,     // 15%
  video_montage: 15        // 15%
};
// TOTAL: 100%

function calculateProgress(currentStep: string, stepProgress: number): number {
  const completedWeight = Object.entries(STEP_WEIGHTS)
    .filter(([step]) => isCompletedBefore(step, currentStep))
    .reduce((sum, [, weight]) => sum + weight, 0);

  const currentWeight = STEP_WEIGHTS[currentStep] * (stepProgress / 100);

  return completedWeight + currentWeight;
}
```

**DECISIONE RICHIESTA:** Approve weights distribution?

---

## 🔗 INTEGRATION TESTING SCENARIOS

### ❓ Cosa Testare End-to-End?

**Test 1: Happy Path (60sec video, $5 budget)**
```
User Input:
- Topic: "Sustainable Fashion"
- Duration: 60sec
- Budget: $5
- Style: "Modern Minimalist"

Expected Flow:
1. Style Selector → styleId: "modern-minimalist"
2. Technical Planner → 10 steps, estimated $4.50
3. Writer → 10 scenes, 600 words
4. Visual Creator → 10 images, actual $1.20
5. Audio → 10 audio clips, actual $0.30
6. Montage → 1 video (60sec), actual $0 (FFmpeg)
TOTAL: $1.50 (under budget ✅)

Assertions:
- Video exists at Supabase Storage
- Duration = 60sec ± 2sec
- All 10 scenes have image + audio
- Total cost < budget
```

**Test 2: Budget Overflow**
```
Budget: $2
Estimated: $4.50

Expected:
- Technical Planner warns: "Estimated $4.50 > Budget $2"
- User prompted: "Reduce scope or increase budget?"
- If user increases → proceed
- If user reduces → re-plan with cheaper models
```

**Test 3: Partial Failure + Recovery**
```
Visual Creator generates 5/10 images, then API timeout

Expected:
- Retry step 6 (3 attempts)
- If still fails → use fallback model (flux-schnell)
- Resume from step 6, complete 6-10
- Workflow completes with 10 images (5 primary + 5 fallback)
```

**Test 4: Invalid Input**
```
User input: Topic = "NSFW content"

Expected:
- Style Selector detects inappropriate content
- Returns error 400: "Content policy violation"
- Workflow stops immediately
```

**DECISIONE RICHIESTA:** Approve test scenarios? Altri da aggiungere?

---

## 📝 SUMMARY - Decisioni da Prendere

### 🔴 CRITICAL (Blockers per Sviluppo)

1. **Montage Provider:** FFmpeg vs Pika vs Runway vs Hybrid?
2. **Storage Provider:** Supabase Storage vs Cloudinary vs S3?
3. **Error Recovery:** Resume from failed step vs Restart?
4. **Cost Tracking:** Orchestrator vs Database vs Hybrid?

### 🟡 HIGH PRIORITY (Impattano UX)

5. **Video Resolution:** 1080p vs 720p vs 4K?
6. **Async Processing:** Webhook vs Polling vs WebSocket?
7. **Retry Strategy:** Max 3 retries? Backoff timing?
8. **Budget Overflow:** Block vs Warn vs Proceed?

### 🟢 MEDIUM PRIORITY (Possono essere V2)

9. **Background Music:** V1 no music vs integrate Epidemic Sound?
10. **Voice Selection:** Single voice vs multiple?
11. **Script Iteration:** Single-pass vs user feedback loop?
12. **File Retention:** 30 days vs forever vs user-configurable?

---

## 🎯 Raccomandazioni Preliminari

**Per iniziare sviluppo SUBITO:**

1. **Montage:** FFmpeg (V1), Pika (V2)
2. **Storage:** Supabase Storage
3. **Error Recovery:** Resume from failed step
4. **Cost Tracking:** Hybrid (Orchestrator + Database)
5. **Resolution:** 1080p
6. **Processing:** Async con polling
7. **Retry:** Max 3, exponential backoff
8. **Budget:** Warn user, block if > 20% overflow

**Queste decisioni permettono di:**
- ✅ Iniziare Writer Agent (95% ready)
- ✅ Iniziare Audio Agent (90% ready)
- ⚠️ Iniziare Montage Agent (70% → 90% con FFmpeg decision)

**Timeline Stimata con decisioni:**
- Writer: 2 giorni
- Audio: 2 giorni
- Montage: 3 giorni
- Integration testing: 2 giorni
**TOTALE: 9 giorni lavorativi (2 settimane)**

---

**Prossimo Step:** Review questo documento, confermare/modificare raccomandazioni, poi iniziare MS-028 (Writer Agent)
