# AIDA - AI Multimedia Creation Platform

**Version:** V5 Architecture + Visual Creator Core  
**Updated:** 2025-10-20  
**Status:** Active Development - Visual Creator 60% Complete

---

## 🎯 What is AIDA?

AIDA is a conversational AI platform that creates multimedia content through specialized AI agents. Users describe what they want in natural language, and AIDA orchestrates multiple AI models to deliver professional results.

**94 Creative Capabilities:** Text, images, video, audio, design, repurposing, and multimedia projects.

---

## 📁 Project Structure

```
D:\AIDA-NEW/
├── src/
│   ├── shared/                  # 🆕 Shared AI Tools
│   │   ├── memory/              # ChromaDB - Cross-agent memory
│   │   ├── voice/               # Voice Router (FAL.AI + XTTS)
│   │   └── monitoring/          # Langfuse - Pipeline tracing
│   ├── ui/                      # UI Components (React + Tailwind)
│   │   ├── Launchpad.tsx        # Main interface
│   │   ├── StyleSelectorModal.tsx
│   │   └── components/          # 96 shadcn UI components
│   ├── agents/
│   │   ├── orchestrator/        # Account Manager (100% complete)
│   │   │   └── services/
│   │   │       └── technical-planner-mock.ts  # 🆕 Mock for parallel dev
│   │   └── style-selector/      # Art Director (95% complete)
│   └── database/
│       └── migrations/          # PostgreSQL/Supabase migrations
├── client/                      # 🆕 Frontend Deploy Config
│   ├── vercel.json              # Vercel configuration
│   └── .env.production          # Production env vars
├── docs/                        # 🆕 Deploy Documentation
│   └── deploy/
│       ├── README.md            # Deploy overview
│       ├── vercel-setup.md      # Vercel guide
│       ├── railway-setup.md     # Railway guide
│       └── checklist.md         # Pre-deploy checklist
├── data/
│   ├── sref_v2/                 # Style reference library
│   ├── chroma/                  # 🆕 ChromaDB storage (gitignored)
│   └── audio_cache/             # 🆕 Voice cache (gitignored)
├── architecture/
│   └── 0-INDEX.md               # System architecture
├── .flow/                       # AIDA-FLOW micro-sprint files
│   ├── current.md               # Active task
│   ├── memory.md                # Critical decisions
│   └── tests.json               # Test registry
├── .github/                     # 🆕 CI/CD Pipeline
│   └── workflows/
│       └── deploy.yml           # Auto-deploy to Vercel + Railway
├── railway.json                 # 🆕 Railway configuration
├── Procfile                     # 🆕 Multi-service processes
├── nixpacks.toml                # 🆕 Build configuration
└── old/                         # Archived documentation
    ├── migration/               # Migration records
    ├── sessions/                # Historical sessions
    └── deprecated/              # Superseded files
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys:
# - ANTHROPIC_API_KEY (Claude Sonnet 4.5)
# - DATABASE_URL (Supabase PostgreSQL)
# - FAL_KEY (Media generation)
# - CHROMA_PERSIST_DIR (ChromaDB storage)
# - TTS_CACHE_DIR (Voice cache)
# - LANGFUSE_ENABLED (Monitoring)
```

### 3. Run Development

```bash
# Start Orchestrator (Port 3003)
cd src/agents/orchestrator
npm run dev

# Start Style Selector (Port 3002)
cd src/agents/style-selector
npm run dev

# Start UI (Port 5173)
npm run dev
```

### 4. Run Tests

```bash
npm test                 # Run all tests
npm run test:coverage    # With coverage report
npm run deploy:check     # Pre-deploy validation
```

---

## 📚 Documentation

### Core Files (Read These First)

1. **[PROJECT-INSTRUCTIONS.md](PROJECT-INSTRUCTIONS.md)** - Complete AIDA-FLOW methodology
2. **[FLOW-STATUS.md](FLOW-STATUS.md)** - Current project state (30 lines)
3. **[PRD.md](PRD.md)** - Product requirements (94 capabilities)
4. **[AIDA-FLOW.md](AIDA-FLOW.md)** - Detailed development methodology

### New Documentation

5. **[docs/deploy/README.md](docs/deploy/README.md)** - Complete deploy guide
6. **[docs/deploy/vercel-setup.md](docs/deploy/vercel-setup.md)** - Frontend deploy
7. **[docs/deploy/railway-setup.md](docs/deploy/railway-setup.md)** - Backend deploy

### Reference Documentation

- **[architecture/0-INDEX.md](architecture/0-INDEX.md)** - System architecture
- **[.flow/memory.md](.flow/memory.md)** - Critical project decisions
- **[old/README.md](old/README.md)** - Archived documentation guide

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────┐
│         USER LAYER                  │
│  Natural language, 94 capabilities  │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   ORCHESTRATOR (Port 3003)          │
│   Role: Account Manager             │
│   Status: 100% Complete ✅          │
│   + Technical Planner Mock 🆕       │
└──────────────┬──────────────────────┘
               ↓ ProjectBrief
┌─────────────────────────────────────┐
│   TECHNICAL PLANNER                 │
│   Role: Project Manager             │
│   Status: Mock Ready 🟢             │
└──────────────┬──────────────────────┘
               ↓ ExecutionPlan
┌─────────────────────────────────────┐
│   EXECUTION AGENTS                  │
│   - Writer (40%)                    │
│   - Director (40%)                  │
│   - Visual Creator (0%)             │
│   - Video Composer (0%)             │
│   - Style Selector (95%) ✅         │
└─────────────────────────────────────┘
               ↕️
┌─────────────────────────────────────┐
│   SHARED TOOLS 🆕                   │
│   - ChromaDB (Memory)               │
│   - Voice Router (FAL.AI + XTTS)   │
│   - Langfuse (Monitoring)           │
└─────────────────────────────────────┘
```

---

## 🎨 Current Status

### Core Agents
| Agent | Status | Tests | Progress |
|-------|--------|-------|----------|
| Orchestrator | ✅ Complete | 31/31 | 100% |
| Style Selector | ✅ Complete | - | 95% |
| Technical Planner | 🟢 Mock Ready | 6/6 | Mock: 100% |
| Writer | 🟡 In Progress | - | 40% |
| Director | 🟡 In Progress | - | 40% |
| Visual Creator | ⚪ Not Started | - | 0% |
| Video Composer | ⚪ Not Started | - | 0% |

### Shared Tools (NEW!)
| Tool | Status | Tests | Purpose |
|------|--------|-------|---------|
| ChromaDB | ✅ Ready | 5/5 | Cross-agent memory |
| Voice Router | ✅ Ready | 4/4 | FAL.AI + XTTS fallback |
| Langfuse | ✅ Ready | 5/5 | Pipeline monitoring |

### Deploy Infrastructure (NEW!)
| Component | Status | Config | Platform |
|-----------|--------|--------|----------|
| Frontend | ✅ Configured | vercel.json | Vercel |
| Backend | ✅ Configured | railway.json | Railway |
| CI/CD | ✅ Active | deploy.yml | GitHub Actions |

**Current Focus:** Tool integration testing + parallel agent development

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Zustand (state management)

### Backend
- Node.js + Express
- PostgreSQL (Supabase)
- Drizzle ORM
- Vitest (testing)

### AI Services
- **Anthropic Claude Sonnet 4.5** (conversation, orchestration)
- **FAL.AI** (52+ media generation models)
- **KIE.AI** (Midjourney, Udio access)
- **Supabase** (database, auth, storage)

### Shared AI Tools (NEW!)
- **ChromaDB** (vector database for agent memory)
- **XTTS-v2** (local voice generation backup)
- **Langfuse** (LLM observability & tracing)

### Deploy & DevOps (NEW!)
- **Vercel** (frontend hosting, CDN)
- **Railway** (backend multi-service hosting)
- **GitHub Actions** (CI/CD pipeline)

---

## 🔄 Development Methodology

AIDA uses **AIDA-FLOW**, a test-first, micro-sprint methodology:

### Core Principles
- ✅ **Test First** - Write test before code
- ✅ **Small Steps** - Max 100 lines per commit
- ✅ **Verify Always** - Green tests or stop
- ✅ **Document Progress** - Update logs constantly

### Micro-Sprint Workflow (20 min max)
1. **SPEC** (5 min) - Define ONE specific outcome
2. **TEST** (5 min) - Write test FIRST
3. **CODE** (5 min) - Minimal code to pass test
4. **VERIFY** (2 min) - Run test, must pass
5. **CHECKPOINT** (3 min) - Commit & update logs

See [PROJECT-INSTRUCTIONS.md](PROJECT-INSTRUCTIONS.md) for complete methodology.

---

## 🆕 Recent Updates (October 17, 2025)

### Shared Tools Integration
- ✅ **MS-011:** ChromaDB shared memory system
- ✅ **MS-012:** Voice router with XTTS fallback
- ✅ **MS-013:** Langfuse monitoring pipeline
- ✅ **MS-014:** Technical Planner mock for parallel development

### Deploy Infrastructure
- ✅ **MS-015:** Vercel frontend configuration
- ✅ **MS-016:** Railway backend multi-service setup
- ✅ GitHub Actions auto-deploy pipeline
- ✅ Complete deploy documentation

### Architecture Improvements
- Multi-agent communication via shared memory
- Voice generation with automatic fallback
- Complete pipeline observability
- Production-ready deploy configuration

---

## 📦 What Was Archived

Historical documentation moved to `/old`:
- Migration reports (completed October 2025)
- Session-specific docs (superseded by FLOW-STATUS.md)
- Deprecated guides (replaced by PROJECT-INSTRUCTIONS.md)

See [old/README.md](old/README.md) for details.

---

## 🚧 Active Development

**Completed This Week:**
- ✅ Shared AI tools infrastructure
- ✅ Technical Planner mock
- ✅ Deploy automation setup

**Current Sprint:** Visual Creator Development (MS-020 series)

**Recent Completions (Oct 20):**
- ✅ MS-020A: Smart Router (model selection, 3-level decision tree)
- ✅ MS-020B: Prompt Adapters (7 model-specific optimizers)
- ✅ MS-020C: Workflow Orchestrator (4 workflow types)
- 🎉 Visual Creator: 60% complete (core functional)

**Next Up:**
- MS-020D: Technical Planner Integration
- MS-021: API Integration (FAL.AI, KIE.AI wrappers)
- MS-022: Reference Management System
- MS-023: Quality Validation & Retry Logic

---

## 📊 Project Stats

- **Total Capabilities:** 94
- **Supported Languages:** 5 (IT, EN, ES, FR, DE)
- **AI Models:** 52+ (via FAL.AI + KIE.AI)
- **Active Agents:** 2.6 (Orchestrator 88%, Style Selector 60%, Visual Creator 60%) 🆕
- **Shared Tools:** 3 (Memory, Voice, Monitoring)
- **In Development:** 3 (Visual Creator 60%, Writer 0%, Director 0%)
- **Planned:** 2 (Technical Planner implementation, Video Composer)
- **Deploy Platforms:** 2 (Vercel, Railway) 🆕

---

## 🚀 Deploy & Production

### Quick Deploy
```bash
# Pre-deploy check
npm run deploy:check

# Deploy frontend
npm run deploy:frontend

# Deploy backend
npm run deploy:backend

# Or push to main for auto-deploy
git push origin main
```

### URLs
- **Frontend:** https://aida-new.vercel.app
- **Backend API:** https://aida-gateway-production.up.railway.app
- **Monitoring:** http://localhost:3004 (Langfuse, local dev)

See [docs/deploy/README.md](docs/deploy/README.md) for complete guide.

---

## 🤝 Contributing

Follow the AIDA-FLOW methodology:
1. Read [PROJECT-INSTRUCTIONS.md](PROJECT-INSTRUCTIONS.md)
2. Check [FLOW-STATUS.md](FLOW-STATUS.md) for current state
3. Create micro-sprint in `.flow/current.md`
4. Write test first, then code
5. Commit with `[FLOW-XXX]` tag

**New Contributors:** Start by reading the deploy documentation to understand the full stack.

---

## 🔐 Environment Variables

Required in `.env`:
```bash
# Core AI
ANTHROPIC_API_KEY=sk-ant-api03-...
FAL_KEY=...
KIE_API_KEY=...

# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# Shared Tools (NEW!)
CHROMA_PERSIST_DIR=./data/chroma
TTS_CACHE_DIR=./data/audio_cache
LANGFUSE_ENABLED=true
LANGFUSE_HOST=http://localhost:3004

# Deploy (for production)
VERCEL_TOKEN=...
RAILWAY_TOKEN=...
```

---

## 📝 License

[To be determined]

---

**Last Updated:** 2025-10-20  
**Location:** D:\AIDA-NEW  
**Methodology:** AIDA-FLOW v2.0  
**Phase:** Visual Creator Core Complete (Smart Router + Adapters + Orchestrator)
