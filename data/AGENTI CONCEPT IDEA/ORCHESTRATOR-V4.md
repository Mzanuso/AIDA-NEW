# AIDA Orchestrator V4 - Revised Implementation Guide

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Core Conversational System](#phase-1-core-conversational-system)
4. [Critical Anthropic Best Practices](#critical-anthropic-best-practices)
5. [FAL.AI Model Selection](#fal-model-selection)
6. [Complete Implementation](#complete-implementation)
7. [Testing Strategy](#testing-strategy)
8. [What's Removed (V2 Features)](#whats-removed)

---

## Executive Summary

### Key Transformations
- **From:** 3-4 sequential LLM calls (6-12s latency)
- **To:** Single LLM call with multi-turn tool use (<2s per turn)
- **Personality:** Zerocalcare-inspired (direct, sarcastic, constructive)
- **Memory:** RAG-based project history (NOT performance learning)

### Implementation Timeline
- **Phase 1:** Core Conversational System (3-4 days)
- **Total:** 3-4 days for production-ready V1

### What Makes V4 Different
✅ **Prompt Caching** - 90% token cost reduction on static content
✅ **Extended Thinking** - Better decision making for agent spawning
✅ **Multi-turn Tool Use** - Proper conversation loop with tools
✅ **Web Search Integration** - Real-time trends/holidays via web_search
✅ **Web Fetch Support** - Handle user-shared links
✅ **RAG Memory** - Historical project context (NO learning/feedback)
✅ **Smart Model Selection** - Semantic mapping to FAL.AI models

❌ **Removed for V1:**
- Holiday Intelligence module (replaced by web_search)
- Trend Intelligence module (replaced by web_search)
- Performance Learning (feedback loops)
- Conversation Evolution
- Complex database tables for patterns/metrics

---

## Architecture Overview

### New Architecture V4
```
User Message
    ↓
Single Claude Call (with caching + thinking)
    ↓
Multi-turn Tool Use Loop:
├─ search_similar_projects (RAG)
├─ web_search (trends/holidays)
├─ web_fetch (user links)
├─ spawn_writer_agent
├─ spawn_director_agent
└─ generate_visual_content
    ↓
Natural Response (<2s per turn)
```

### Technology Stack
- **Runtime:** Node.js + TypeScript
- **LLM:** Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- **Database:** PostgreSQL with pgvector (RAG only)
- **Testing:** Vitest
- **Tools:** web_search, web_fetch (Anthropic native)

---

## Phase 1: Core Conversational System

### 1.1 File Structure

```
src/agents/orchestrator/
├── core/
│   ├── conversational-orchestrator.ts  # Main class with tool loop
│   ├── mega-prompt-builder.ts         # Prompt with caching
│   └── response-parser.ts             # JSON response parsing
├── config/
│   ├── personality-prompt.ts          # Zerocalcare personality (cached)
│   ├── tool-catalog.ts                # All tools definition (cached)
│   └── fal-model-catalog.ts           # FAL model semantic mapping (cached)
├── tools/
│   ├── rag-tools.ts                   # Project history search
│   ├── web-tools.ts                   # web_search + web_fetch
│   └── agent-tools.ts                 # Sub-agent spawning
├── types/
│   └── orchestrator.types.ts
└── __tests__/
    └── orchestrator.test.ts
```

### 1.2 Core Implementation

#### Conversational Orchestrator with Multi-turn Loop

The orchestrator implements a proper tool-use loop where:
1. User sends message
2. Claude analyzes and may call tools
3. Tools execute and return results
4. Claude receives results and continues conversation
5. Loop repeats until Claude provides final response

Key features:
- Prompt caching on static parts (personality, tool catalog)
- Extended thinking for complex decisions
- Multi-turn tool execution
- RAG context loading
- Dynamic temperature based on task type

### 1.3 Personality System

**Zerocalcare-Inspired Tone:**
- Direct and sarcastic but constructive
- Friendly, not corporate
- Pop/nerd references when appropriate
- Zero formalities
- Quick jokes, not explanations

**Rules:**
- Never mention technical model names (Kling, Midjourney, FLUX)
- Adapt language automatically to user
- Max 1 question per response
- Gather info conversationally, not interrogatively

### 1.4 Intelligence & State Tracking

**Tracked State:**
- Content type (video/image/campaign/story)
- Purpose and context
- Style preferences
- Platform (Instagram, TikTok, etc)
- Brand context
- Timeline and urgency
- User expertise level

**Output Format:**
All responses structured as JSON:
```
{
  "userResponse": "Natural text in Zerocalcare style",
  "stateUpdate": { /* updated conversation state */ },
  "agentPlan": null | { agent: "writer", params: {...} }
}
```

---

## Critical Anthropic Best Practices

### 2.1 Prompt Caching (MUST HAVE)

**Problem:** Static content (personality, tools, FAL catalog) = ~1500 tokens repeated every call.

**Solution:** Cache control on static blocks.

**Implementation:**
- Personality prompt: CACHED (~500 tokens)
- Tool catalog: CACHED (~400 tokens)
- FAL model catalog: CACHED (~300 tokens)
- User context: NOT cached (dynamic)

**Result:** 90% cost reduction on repeated conversations.

### 2.2 Extended Thinking (MUST HAVE)

**When to use:**
- Deciding which agent to spawn
- Analyzing if enough info is gathered
- Planning multi-step workflows
- Complex reasoning about user intent

**Implementation:**
- Enable thinking mode with 3000-5000 token budget
- Use for strategic decisions, not simple responses
- Thinking is invisible to user

### 2.3 Multi-turn Tool Use (MUST HAVE)

**Flow:**
1. User: "Voglio un video per gioielli"
2. Orc calls: search_similar_projects("gioielli")
3. Result: 2 past projects found
4. Orc: "Hai già fatto 2 video gioielli. Quale riprendiamo?"
5. User: "Il primo"
6. Orc calls: get_project_details(id)
7. Result: Full project data
8. Orc: "Ok, stile elegante. Lo rifaccio uguale?"

**Key:** Loop continues until Claude produces final text response (no more tool calls).

### 2.4 Dynamic Temperature

**Conversational responses:** 0.7-0.8
**Agent planning decisions:** 0.3-0.5
**JSON structure generation:** 0.2

### 2.5 Error Handling

**Retry logic:**
- Exponential backoff on rate limits (429)
- Timeout handling (ETIMEDOUT)
- Circuit breaker on repeated failures
- Fallback responses on total failure

**Non-retryable:**
- Auth errors (401, 403)
- Bad requests (400)
- Quota exceeded

---

## FAL.AI Model Selection

### 3.1 Semantic Mapping Approach

**User speaks naturally**, Orc maps semantically to technical models.

**Examples:**
- "realistico" → FLUX Pro
- "illustrazione" → Recraft v3
- "cartoon" → Recraft v3
- "cinematic video" → Runway Gen3
- "video da immagini" → Kling

### 3.2 Embedded Model Catalog (Cached)

The catalog is embedded in the cached system prompt with semantic mappings:

**Image Generation:**
- Realistic/photo/photography → fal-ai/flux-pro
- Illustration/cartoon/drawing → fal-ai/recraft-v3
- Logo/vector/flat → fal-ai/recraft-v3-svg

**Video Generation:**
- From images/slideshow → fal-ai/kling-video (default)
- From text only → fal-ai/luma-dream-machine
- Cinematic/high quality → fal-ai/runway-gen3/turbo/image-to-video

**Audio:**
- Voiceover/narration → fal-ai/wizper/tts
- Music/soundtrack → External (Suno API)

### 3.3 Tool Definition for Visual Generation

Tool name: `generate_visual_content`

Parameters:
- contentType: "image" | "video"
- style: "realistic" | "illustration" | "cartoon" | "cinematic" | "flat"
- sourceType: "text-to-image" | "text-to-video" | "image-to-video"
- prompt: Generated from conversation context

Backend receives semantic parameters and maps to specific FAL model IDs.

### 3.4 Rules

❌ **Never** ask user which model to use
❌ **Never** mention model names (FLUX, Kling, etc)
✅ **Always** choose based on context and style
✅ **Always** speak about results, not tools
✅ **If ambiguous**, ask for style/quality clarification (not model)

---

## Web Search Integration

### 4.1 Replacing Holiday & Trend Intelligence

Instead of complex database systems, use Anthropic's web_search tool:

**Tool:** `web_search`

**When to use:**
- User mentions holidays/events ("San Valentino", "Natale")
- User asks for viral/trending content
- User needs current/updated information
- User references current events

**Examples:**
- User: "Video per San Valentino" → web_search("idee contenuti San Valentino 2025")
- User: "Cosa va di moda ora?" → web_search("trend video Instagram 2025")

### 4.2 Web Fetch for User Links

**Tool:** `web_fetch`

**When to use:**
- User shares URL (http/https detected)
- User says "guarda questo", "come questo", "simile a"
- User wants style reference from web

**Examples:**
- User: "Stile come questo: [Instagram URL]" → web_fetch(url)
- User: "Ispirazione da qui: [Pinterest]" → web_fetch(url)

**Flow:**
1. Detect URL in message
2. Call web_fetch automatically
3. Analyze content (style, tone, aesthetic)
4. Integrate into conversation naturally
5. No technical language ("Ho letto il link" ❌, "Vedo che è minimal" ✅)

---

## RAG Memory System

### 5.1 What We Keep

**Database tables (essential):**
- projects (completed work)
- project_embeddings (semantic search)
- user_files (uploaded assets)
- campaigns (project groupings)
- user_preferences (language, favorite styles)
- conversation_sessions (chat history)
- conversation_messages (for context)

### 5.2 What We Remove

**Database tables (eliminated for V1):**
- ContentMetadata (performance tracking)
- PerformanceData (metrics)
- SuccessPattern (learned patterns)
- TrendData (trend cache)
- ConversationMetrics (analytics)
- ConversationAnalysis (pattern recognition)

### 5.3 How RAG Works

**On every request:**
1. User message arrives
2. Generate embedding of message
3. Semantic search in project_embeddings
4. Load top 5 similar projects
5. Include in context for Claude
6. Claude uses history naturally in conversation

**Benefits:**
- "Voglio altro video gioielli" → Finds past jewelry videos
- "Rifammi quello stile" → Identifies which project
- User doesn't repeat info → Smooth experience

---

## Complete Implementation

### Day 1: Core Setup (8h)

**Morning (4h):**
- File structure setup
- ConversationalOrchestrator skeleton
- MegaPromptBuilder with caching structure
- Basic types definition

**Afternoon (4h):**
- Personality prompt implementation
- Tool catalog definition
- FAL model catalog
- Response parser

### Day 2: Tool Loop & RAG (8h)

**Morning (4h):**
- Multi-turn tool use loop
- Extended thinking integration
- Dynamic temperature logic
- Error handling and retry

**Afternoon (4h):**
- RAG tools implementation
- Web search integration
- Web fetch integration
- Agent spawning tools

### Day 3: Testing & Polish (8h)

**Morning (4h):**
- Unit tests for orchestrator
- Tool execution tests
- RAG search tests
- Personality tests

**Afternoon (4h):**
- Integration tests
- Performance benchmarking
- Bug fixes
- Documentation

### Day 4: Deploy & Monitor (4-8h)

**Optional if needed:**
- Production deployment
- Monitoring setup
- Load testing
- Final adjustments

---

## Testing Strategy

### Unit Tests

**Response Time:**
- Target: <2s per turn
- Test with various message types
- Monitor cache hit rates

**Personality:**
- Verify Zerocalcare tone
- Check for banned phrases ("perfetto!", "eccellente!")
- Validate language adaptation

**Tool Use:**
- Test RAG search results
- Verify web_search triggers
- Check web_fetch URL detection
- Validate agent spawning logic

**Multi-turn:**
- Test conversation continuity
- Verify state updates
- Check tool result integration

### Integration Tests

**Full Conversations:**
- New user (no history)
- Returning user (with projects)
- Link sharing flow
- Holiday/trend queries
- Multi-project scenarios

### Performance Benchmarks

**Targets:**
- First response: <2s
- Cached responses: <1s
- Tool calls: <500ms overhead
- Memory: <300MB per session
- Concurrent users: 50+

---

## What's Removed (V2 Features)

### Eliminated Modules

**Holiday Intelligence:**
- ❌ Fixed holidays database
- ❌ Easter calculation algorithm
- ❌ Anticipation windows
- ✅ Replaced with: web_search when needed

**Trend Intelligence:**
- ❌ Trend database
- ❌ Cron job updates
- ❌ Platform-specific tracking
- ✅ Replaced with: web_search when needed

**Performance Learning:**
- ❌ Feedback scheduling (24h delay)
- ❌ Pattern recognition
- ❌ Success rate tracking
- ❌ ContentMetadata table
- ❌ PerformanceData table
- ❌ SuccessPattern table
- ✅ Deferred to: V2 (if needed)

**Conversation Evolution:**
- ❌ Automatic dialogue improvement
- ❌ Confusion point detection
- ❌ ConversationMetrics table
- ❌ ConversationAnalysis table
- ✅ Deferred to: V2 (if needed)

### Simplified Database Schema

**Keep:**
```
- projects
- project_embeddings
- user_files
- campaigns
- user_preferences
- conversation_sessions
- conversation_messages
```

**Remove:**
```
- ContentMetadata
- PerformanceData
- SuccessPattern
- TrendData
- ConversationMetrics
- ConversationAnalysis
```

### Why These Removals?

**Complexity vs Value:**
- Evolution modules add 4 new systems
- Require complex cron jobs, schedulers
- Depend on uncertain user behavior
- Can be added later if data shows value

**V1 Focus:**
- Core conversational intelligence
- Excellent personality and UX
- Real-time web awareness
- Historical project memory
- Smart model selection

**Result:**
- 50% less code to maintain
- Faster development (3-4 days vs 7 days)
- Lower operational complexity
- Easier to debug and test
- Can always add evolution in V2

---

## Migration Notes

### From V3 to V4

**What Changed:**
1. Removed evolution modules
2. Added prompt caching
3. Added extended thinking
4. Added web_search/web_fetch
5. Simplified database schema

**Breaking Changes:**
- No more `/evolution/*` endpoints
- No more feedback scheduling
- No more trend cache

**New Requirements:**
- Anthropic API with caching support
- Web search tool access
- Updated system prompts

---

## Conclusion

V4 is a **lean, production-ready orchestrator** that:

✅ Responds naturally with personality
✅ Maintains project history (RAG)
✅ Uses real-time web data (search/fetch)
✅ Selects models intelligently (FAL)
✅ Implements Anthropic best practices (caching, thinking, multi-turn)
✅ Can be built in 3-4 days

**V2 can add** (if data shows need):
- Performance learning
- Feedback loops
- Conversation analytics
- Trend caching

**Focus:** Ship fast, iterate based on real usage.

---

*Document Version: 4.0*  
*Last Updated: October 2025*  
*Author: AIDA Development Team*
