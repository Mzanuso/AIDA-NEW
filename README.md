# AIDA - AI Multimedia Creation Platform

**Version:** V5 Architecture  
**Updated:** 2025-10-15  
**Status:** Active Development - Refactoring Phase

---

## 🎯 What is AIDA?

AIDA is a conversational AI platform that creates multimedia content through specialized AI agents. Users describe what they want in natural language, and AIDA orchestrates multiple AI models to deliver professional results.

**94 Creative Capabilities:** Text, images, video, audio, design, repurposing, and multimedia projects.

---

## 📁 Project Structure

```
D:\AIDA-NEW/
├── src/
│   ├── ui/                      # UI Components (React + Tailwind)
│   │   ├── Launchpad.tsx        # Main interface
│   │   ├── StyleSelectorModal.tsx
│   │   └── components/          # 96 shadcn UI components
│   ├── agents/
│   │   ├── orchestrator/        # Account Manager (100% complete)
│   │   └── style-selector/      # Art Director (95% complete)
│   └── database/
│       └── migrations/          # PostgreSQL/Supabase migrations
├── data/
│   ├── sref_v2/                 # Style reference library
│   └── AGENTI CONCEPT IDEA/     # Agent design documents
├── architecture/
│   └── 0-INDEX.md               # System architecture
├── .flow/                       # AIDA-FLOW micro-sprint files
│   ├── current.md               # Active task
│   ├── memory.md                # Critical decisions
│   └── tests.json               # Test registry
├── old/                         # Archived documentation
│   ├── migration/               # Migration records
│   ├── sessions/                # Historical sessions
│   └── deprecated/              # Superseded files
└── docs/                        # (Reserved for future)
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
npm test
```

---

## 📚 Documentation

### Core Files (Read These First)

1. **[PROJECT-INSTRUCTIONS.md](PROJECT-INSTRUCTIONS.md)** - Complete AIDA-FLOW methodology
2. **[FLOW-STATUS.md](FLOW-STATUS.md)** - Current project state (30 lines)
3. **[PRD.md](PRD.md)** - Product requirements (94 capabilities)
4. **[AIDA-FLOW.md](AIDA-FLOW.md)** - Detailed development methodology

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
└──────────────┬──────────────────────┘
               ↓ ProjectBrief
┌─────────────────────────────────────┐
│   TECHNICAL PLANNER                 │
│   Role: Project Manager             │
│   Status: In Design 🟡              │
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
```

---

## 🎨 Current Status

| Agent | Status | Tests | Progress |
|-------|--------|-------|----------|
| Orchestrator | ✅ Complete | 31/31 | 100% |
| Style Selector | ✅ Complete | - | 95% |
| Writer | 🟡 In Progress | - | 40% |
| Director | 🟡 In Progress | - | 40% |
| Visual Creator | ⚪ Not Started | - | 0% |
| Video Composer | ⚪ Not Started | - | 0% |

**Current Focus:** Orchestrator V5 refactoring (multi-agent architecture)

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

## 📦 What Was Archived

Historical documentation moved to `/old`:
- Migration reports (completed October 2025)
- Session-specific docs (superseded by FLOW-STATUS.md)
- Deprecated guides (replaced by PROJECT-INSTRUCTIONS.md)

See [old/README.md](old/README.md) for details.

---

## 🚧 Active Development

**Current Sprint:** Orchestrator V5 Refactoring
- Multi-language support (IT, EN, ES, FR, DE)
- Proactive style guidance
- Technical Planner integration
- Context engineering optimization

**Next Up:**
- Complete Technical Planner design
- Writer Agent completion
- Director Agent completion

---

## 📊 Project Stats

- **Total Capabilities:** 94
- **Supported Languages:** 5 (IT, EN, ES, FR, DE)
- **AI Models:** 52+ (via FAL.AI + KIE.AI)
- **Active Agents:** 2 (Orchestrator, Style Selector)
- **In Development:** 2 (Writer, Director)
- **Planned:** 2 (Visual Creator, Video Composer)

---

## 🤝 Contributing

Follow the AIDA-FLOW methodology:
1. Read [PROJECT-INSTRUCTIONS.md](PROJECT-INSTRUCTIONS.md)
2. Check [FLOW-STATUS.md](FLOW-STATUS.md) for current state
3. Create micro-sprint in `.flow/current.md`
4. Write test first, then code
5. Commit with `[FLOW-XXX]` tag

---

## 📝 License

[To be determined]

---

**Last Updated:** 2025-10-15  
**Location:** D:\AIDA-NEW  
**Methodology:** AIDA-FLOW v2.0
