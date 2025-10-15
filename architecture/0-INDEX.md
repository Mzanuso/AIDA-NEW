# AIDA Architecture V5

**Version:** 5.0
**Updated:** 2025-10-15
**Description:** Multi-Agent System with separated concerns

---

## 🏗️ System Architecture

```
USER ↔ ORCHESTRATOR → ProjectBrief → TECHNICAL PLANNER → ExecutionPlan → EXECUTION AGENTS → RESULT → ORCHESTRATOR → USER
```

---

## 🤖 Agent Roles & Responsibilities

### Orchestrator (Account Manager)

**Status:** refactoring (87.5% - 7/8 phases complete)
**Port:** 3003
**Database:** Supabase PostgreSQL

**Responsibilities:**
- ✅ User-facing conversation (5 languages: IT, EN, ES, FR, DE)
- ✅ Intent detection (94 capabilities)
- ✅ Requirements gathering through dialogue
- ✅ Proactive style guidance
- ✅ Brief generation
- ✅ Status updates to user
- ✅ Result presentation

**Explicitly Excluded:**
- ❌ Model selection
- ❌ Workflow decisions
- ❌ Technical planning

**Completed Phases:**
- ✅ Phase 1: Database Migration (Neon → Supabase)
- ✅ Phase 2: Language Detection (5 languages)
- ✅ Phase 3: Style Guidance (Proactive proposals)
- ✅ Phase 4: Technical Planner Integration
- ✅ Phase 5: Context Engineering (Caching, JIT, Compression)
- ✅ Phase 6: Error Handling (Retry logic)
- ✅ Phase 7: 94 Capabilities Support
- ⏳ Phase 8: Testing & Documentation (In Progress)

---

### Technical Planner (Project Manager)

**Status:** design (0%)
**Implementation:** mocked

**Responsibilities:**
- ✅ Receives ProjectBrief from Orchestrator
- ✅ Selects optimal AI models (52+ models)
- ✅ Designs execution workflow
- ✅ Estimates cost and time
- ✅ Coordinates execution agents

**Explicitly Excluded:**
- ❌ User interaction

---

### Style Selector (Art Director)

**Status:** complete (95%)
**Port:** 3002

**Responsibilities:**
- ✅ Visual style selection
- ✅ Style gallery management
- ✅ Style matching and categorization

---

### Writer (Content Writer)

**Status:** in_progress (40%)

**Responsibilities:**
- ✅ Text content generation
- ✅ Script writing
- ✅ Story development

---

### Director (Creative Director)

**Status:** in_progress (40%)

**Responsibilities:**
- ✅ Storyboards creation
- ✅ Shot planning
- ✅ Creative direction

---

### Visual Creator (Visual Artist)

**Status:** not_started (0%)

**Responsibilities:**
- ✅ Image generation
- ✅ Visual asset creation
- ✅ Style application

---

### Video Composer (Video Editor)

**Status:** not_started (0%)

**Responsibilities:**
- ✅ Video assembly
- ✅ Editing and composition
- ✅ Final rendering

---

## 🔗 Integration Points

### Orchestrator → Technical Planner
```
POST /api/plans/create
Body: ProjectBrief
Response: ExecutionPlan
```

### Orchestrator → Style Selector
```
GET /api/styles/gallery?category=X&limit=9
Response: StyleGallery
```

### Technical Planner → Execution Agents
```
Internal coordination via ExecutionPlan
```

---

## 🛠️ Tech Stack

### Frontend
- **framework:** React 18 + TypeScript
- **build:** Vite
- **styling:** Tailwind CSS + shadcn/ui
- **state:** Zustand

### Backend
- **runtime:** Node.js + Express
- **database:** PostgreSQL (Supabase)
- **orm:** Drizzle ORM
- **testing:** Vitest

### AI Services
- **conversation:** Anthropic Claude Sonnet 4.5
- **media:** FAL.AI (52+ models)
- **midjourney:** KIE.AI
- **storage:** Supabase Storage

---

**Last Updated:** 2025-10-15
**Source:** .flow/project-state.json + Orchestrator REFACTORING-PROGRESS.md

---

## 💡 To Update This File

Edit `.flow/project-state.json` then run `npm run sync:docs`
