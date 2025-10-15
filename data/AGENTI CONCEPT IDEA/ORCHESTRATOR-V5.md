# AIDA Orchestrator V5 - Multi-Agent Architecture

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Revolution](#architecture-revolution)
3. [Agent Responsibilities](#agent-responsibilities)
4. [Communication Flow](#communication-flow)
5. [Database Strategy](#database-strategy)
6. [Implementation Guide](#implementation-guide)
7. [Claude Code Prompt](#claude-code-prompt)

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

(... rest of the document continues with all the content from the artifact ...)

---

*Document Version: 5.0*  
*Last Updated: October 15, 2025*  
*Status: Ready for Implementation*  
*Architecture: Multi-Agent System*
