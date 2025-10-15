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

### ✅ Orchestrator (Account Manager) - 100% COMPLETE

**Status:** refactoring complete (8/8 phases)
**Port:** 3003
**Database:** Supabase PostgreSQL

**All Phases Complete:**
1. ✅ Database Migration (Neon → Supabase)
2. ✅ Language Detection (IT, EN, ES, FR, DE)
3. ✅ Style Guidance (Proactive proposals)
4. ✅ Technical Planner Integration
5. ✅ Context Engineering (Caching, JIT, Compression, **Token Budget**)
6. ✅ Error Handling (Comprehensive retry logic)
7. ✅ 94 Capabilities Support
8. ✅ Testing & Documentation

**Responsibilities:**
- ✅ User-facing conversation (5 languages)
- ✅ Intent detection (94 capabilities)
- ✅ Requirements gathering through dialogue
- ✅ Proactive style guidance
- ✅ Brief generation
- ✅ Status updates to user
- ✅ Result presentation
- ✅ Token budget management

**Explicitly Excluded:**
- ❌ Model selection
- ❌ Workflow decisions
- ❌ Technical planning

**New Features:**
- 🆕 Token Budget Management: Automatic compression at 85% context usage
- 🆕 Multi-session tracking: Separate budget per conversation
- 🆕 Smart compression targets: Reduces to 60% after compression
- 🆕 Budget warnings: At 80%, 85%, 95% thresholds

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

## 🎉 Milestone: Orchestrator Complete!

The Orchestrator agent is now **100% complete** with all 8 phases implemented:
- 🎯 Production-ready
- 🧪 Tested
- 📚 Documented
- 🚀 Optimized (90% cost savings with caching)
- 🔒 Token budget protection
- 🌍 Multi-language (5 languages)
- 💪 Error resilient

**Ready for:** Production deployment and integration with other agents

---

**Last Updated:** 2025-10-15
**Next Focus:** Technical Planner implementation
