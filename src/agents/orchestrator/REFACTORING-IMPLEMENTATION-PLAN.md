# AIDA Orchestrator Refactoring - Implementation Plan

**Created:** 2025-10-15
**Status:** Ready for Implementation
**Target:** Complete migration to 94-capability multi-agent architecture

---

## 📊 Current State Analysis

### ✅ **What's Working** (MUST PRESERVE)

1. **Conversational Orchestrator** ([conversational-orchestrator.ts](src/agents/conversational-orchestrator.ts))
   - Multi-phase conversation system (discovery → refinement → execution → delivery)
   - Intent analysis with `IntentAnalyzer`
   - Context management with `ContextAnalyzer`
   - Model selection with `UniversalModelSelector`
   - Style Selector integration via `StyleSelectorClient`
   - Personality system (Zerocalcare-inspired tone)

2. **Database Schema** (PostgreSQL via Drizzle ORM)
   - `conversation_sessions` - Session tracking
   - `conversation_messages` - Message history
   - `detected_intents` - Extracted user intentions
   - `tool_plans` - Execution plans
   - Using Neon PostgreSQL currently

3. **Supporting Services**
   - `model-selector.ts` - Handles 94 capabilities across 50+ models
   - `context-analyzer.ts` - Session and context management
   - `intent-analyzer.ts` - Natural language understanding
   - `tool-selector.ts` - Tool routing
   - `personality-prompt.ts` - Personality definitions

4. **API Endpoints** ([chat.routes.ts](src/routes/chat.routes.ts))
   - `POST /api/orchestrator/chat` - Main conversational endpoint
   - `GET /api/orchestrator/session/:sessionId` - Session details
   - `POST /api/orchestrator/session/:sessionId/approve` - User approval
   - `GET /api/orchestrator/user/:userId/history` - User history
   - `POST /api/orchestrator/session/:sessionId/abandon` - Abandon session

5. **Dependencies**
   - `@anthropic-ai/sdk` - Claude Sonnet 4.5
   - `openai` - Embeddings (temporary)
   - `@fal-ai/client` - FAL.AI models
   - `postgres` via Drizzle ORM
   - `express` - Server
   - `axios` - HTTP client

### 🔍 **Gaps Identified**

1. **Language Detection:** Not implemented (only Italian)
2. **Technical Planner:** Referenced but not implemented
3. **Proactive Style Proposals:** Partial implementation
4. **Context Engineering:** No prompt caching, no JIT loading
5. **Error Handling:** Basic try/catch, no circuit breaker
6. **Database:** Using Neon, need to migrate to Supabase
7. **94 Capabilities:** Model selector has ~60 capabilities, missing ~34

### 📁 **Current File Structure**

```
src/agents/orchestrator/
├── server-main.ts                        # Express server entry point
├── orchestrator.ts                       # LEGACY (will be deprecated)
├── package.json                          # Dependencies
├── .env.example                          # Environment variables
├── src/
│   ├── agents/
│   │   └── conversational-orchestrator.ts  # Main orchestrator (CORE)
│   ├── services/
│   │   ├── context-analyzer.ts            # Context management
│   │   ├── intent-analyzer.ts             # NLU
│   │   ├── model-selector.ts              # 94 capabilities router
│   │   └── tool-selector.ts               # Tool selection
│   ├── routes/
│   │   └── chat.routes.ts                 # API endpoints
│   ├── config/
│   │   └── personality-prompt.ts          # Personality definitions
│   ├── clients/
│   │   └── style-selector-client.ts       # Style Selector integration
│   └── utils/
│       └── cost-calculator.ts             # Cost estimation
└── tools/
    ├── rag-tools.ts                       # Vector search (pgvector)
    ├── agent-tools.ts                     # Sub-agent spawning
    └── media-tools.ts                     # FAL.AI + KIE.AI wrappers
```

---

## 🎯 Implementation Roadmap

### **Phase 1: Database Migration** (Priority 1)

**Goal:** Migrate from Neon to Supabase with ZERO code changes

**Tasks:**
1. Update `.env.example` with Supabase connection string template
2. Add migration documentation comment in code
3. Verify Drizzle ORM compatibility (same PostgreSQL)
4. Test connection with Supabase
5. Run existing migrations on Supabase
6. Verify all queries work unchanged

**Files to Modify:**
- `.env.example`
- `README.md` (update database setup)

**Testing:**
- Connection test
- All CRUD operations
- Migration scripts

**Estimated Time:** 30 minutes

---

### **Phase 2: Language Detection System** (Priority 2)

**Goal:** Detect and adapt to 5 languages (IT, EN, ES, FR, DE)

**Tasks:**
1. Create `src/services/language-detector.ts`
   - Pattern-based detection
   - Common word matching
   - Special character analysis
   - Confidence scoring
   - Fallback to previous language

2. Create multilingual personality prompts
   - `src/config/personality-prompts-multilingual.ts`
   - 5 language versions of PERSONALITY_PROMPT
   - Translation-aware response generation

3. Update `conversational-orchestrator.ts`
   - Add language detection on each message
   - Select appropriate personality prompt
   - Track language in session metadata

4. Update `context-analyzer.ts`
   - Add `language` field to ConversationContext
   - Store detected language in session

**Files to Create:**
- `src/services/language-detector.ts`
- `src/config/personality-prompts-multilingual.ts`

**Files to Modify:**
- `src/agents/conversational-orchestrator.ts`
- `src/services/context-analyzer.ts`

**Testing:**
- Test each language detection
- Test language switching mid-conversation
- Test fallback logic

**Estimated Time:** 2 hours

---

### **Phase 3: Proactive Style Guidance** (Priority 2)

**Goal:** Intelligently propose style gallery when appropriate

**Tasks:**
1. Create `src/services/style-proposal-system.ts`
   - Rules engine for when to propose styles
   - `always`, `never`, `conditional` capability mapping
   - Integration with Style Selector service
   - Multilingual proposal messages

2. Update `conversational-orchestrator.ts`
   - Call style proposal system in discovery phase
   - Return UI component metadata for gallery
   - Handle user style selection

3. Enhance `style-selector-client.ts`
   - Add `matchStyles()` method
   - Add `categorizeMessage()` method
   - Add fallback gallery for offline mode

**Files to Create:**
- `src/services/style-proposal-system.ts`

**Files to Modify:**
- `src/agents/conversational-orchestrator.ts`
- `src/clients/style-selector-client.ts`

**Testing:**
- Test proposal rules for all 94 capabilities
- Test category-based filtering
- Test fallback mode

**Estimated Time:** 2 hours

---

### **Phase 4: Technical Planner Interface** (Priority 3)

**Goal:** Create mock Technical Planner for multi-agent architecture

**Tasks:**
1. Create TypeScript contracts
   - `src/types/technical-planner.types.ts`
   - ProjectBrief, ExecutionPlan, ExecutionStep, ProjectStatus, ProjectResult

2. Create mock implementation
   - `src/mocks/technical-planner.mock.ts`
   - Realistic timing simulation
   - Realistic failure scenarios (3-5%)
   - Model selection based on capability
   - Multi-step workflow generation

3. Update `conversational-orchestrator.ts`
   - Generate ProjectBrief in refinement phase
   - Call Technical Planner in execution phase
   - Poll for status updates
   - Handle failures gracefully

**Files to Create:**
- `src/types/technical-planner.types.ts`
- `src/mocks/technical-planner.mock.ts`

**Files to Modify:**
- `src/agents/conversational-orchestrator.ts`

**Testing:**
- Test brief generation for all capability types
- Test execution flow
- Test failure handling
- Test cost estimation

**Estimated Time:** 3 hours

---

### **Phase 5: Context Engineering** (Priority 3)

**Goal:** Implement Anthropic best practices for context management

**Tasks:**
1. Create prompt caching system
   - `src/utils/prompt-cache.ts`
   - Cache personality prompts (500 tokens)
   - Cache tool catalog (400 tokens)
   - Cache capabilities map (300 tokens)
   - Monitor cache hit rate

2. Implement JIT context loading
   - `src/services/dynamic-context-loader.ts`
   - Load recent messages only (last 10)
   - Load similar projects on demand
   - Load reference content only if URL provided
   - Token budget enforcement

3. Create conversation compression
   - `src/utils/conversation-compressor.ts`
   - Summarize old messages (>20 messages)
   - Keep recent messages in full detail
   - Use Claude for summarization

4. Implement token budget manager
   - `src/utils/token-budget-manager.ts`
   - Max context: 150K tokens
   - Reserved for response: 4K tokens
   - Available for context: 146K tokens
   - Aggressive compression when exceeded

5. Selective tool loading
   - Update `conversational-orchestrator.ts`
   - Load tools based on intent
   - Conditional loading (RAG, web search, etc.)

**Files to Create:**
- `src/utils/prompt-cache.ts`
- `src/services/dynamic-context-loader.ts`
- `src/utils/conversation-compressor.ts`
- `src/utils/token-budget-manager.ts`

**Files to Modify:**
- `src/agents/conversational-orchestrator.ts`

**Testing:**
- Test cache hit rate (target >80%)
- Test JIT loading performance
- Test compression quality
- Test token budget enforcement

**Estimated Time:** 4 hours

---

### **Phase 6: Comprehensive Error Handling** (Priority 4)

**Goal:** Production-grade error handling with retries and circuit breakers

**Tasks:**
1. Create error categorization system
   - `src/types/errors.types.ts`
   - ErrorCategory enum
   - ErrorResponse interface
   - Custom error classes

2. Create error handler
   - `src/services/error-handler.ts`
   - Categorize errors
   - Generate user-friendly messages
   - Multilingual error messages
   - Recovery strategies

3. Create retry strategy
   - `src/utils/retry-strategy.ts`
   - Exponential backoff (1s, 2s, 4s, 8s)
   - Max 3 retries
   - Retryable vs. non-retryable detection
   - Timeout handling (30s)

4. Create circuit breaker
   - `src/utils/circuit-breaker.ts`
   - Failure threshold: 5
   - Reset timeout: 60s
   - States: CLOSED, OPEN, HALF_OPEN

5. Update all service calls
   - Wrap external API calls with retry strategy
   - Wrap service calls with circuit breaker
   - Log all errors with context

**Files to Create:**
- `src/types/errors.types.ts`
- `src/services/error-handler.ts`
- `src/utils/retry-strategy.ts`
- `src/utils/circuit-breaker.ts`

**Files to Modify:**
- `src/agents/conversational-orchestrator.ts`
- `src/clients/style-selector-client.ts`
- `src/services/intent-analyzer.ts`

**Testing:**
- Test error categorization
- Test retry logic
- Test circuit breaker states
- Test multilingual error messages

**Estimated Time:** 3 hours

---

### **Phase 7: Complete 94 Capabilities** (Priority 4)

**Goal:** Ensure all 94 capabilities are mapped in model selector

**Tasks:**
1. Audit `model-selector.ts` for missing capabilities
2. Add missing capability mappings
3. Verify model selection logic for each capability
4. Update capability type definitions

**Current Coverage:** ~60/94
**Missing:** ~34 capabilities

**Files to Modify:**
- `src/services/model-selector.ts`

**Testing:**
- Test model selection for each capability
- Verify cost estimates
- Verify fallback models

**Estimated Time:** 2 hours

---

### **Phase 8: Testing & Documentation** (Priority 5)

**Goal:** Comprehensive testing and documentation

**Tasks:**
1. Write unit tests
   - Language detector
   - Style proposal system
   - Error handler
   - Retry strategy
   - Circuit breaker

2. Write integration tests
   - End-to-end conversation flows
   - Multi-language conversations
   - Error scenarios
   - Technical Planner integration

3. Update documentation
   - README.md with new features
   - API documentation
   - Migration guide (Neon → Supabase)
   - Architecture diagrams

4. Create example conversations
   - All 94 capabilities examples
   - Multi-language examples
   - Error handling examples

**Files to Create:**
- `src/__tests__/language-detector.test.ts`
- `src/__tests__/style-proposal-system.test.ts`
- `src/__tests__/error-handler.test.ts`
- `src/__tests__/retry-strategy.test.ts`
- `src/__tests__/circuit-breaker.test.ts`
- `MIGRATION-GUIDE-SUPABASE.md`
- `ARCHITECTURE-V2.md`

**Files to Modify:**
- `README.md`
- `IMPLEMENTATION_SUMMARY.md`

**Estimated Time:** 3 hours

---

## 📋 Implementation Checklist

### **Week 1: Core Infrastructure**
- [ ] Phase 1: Database Migration (30 min)
- [ ] Phase 2: Language Detection (2 hrs)
- [ ] Phase 3: Style Guidance (2 hrs)
- [ ] Phase 4: Technical Planner (3 hrs)

**Total:** ~8 hours

### **Week 2: Optimization & Resilience**
- [ ] Phase 5: Context Engineering (4 hrs)
- [ ] Phase 6: Error Handling (3 hrs)
- [ ] Phase 7: Complete Capabilities (2 hrs)

**Total:** ~9 hours

### **Week 3: Polish & Ship**
- [ ] Phase 8: Testing & Documentation (3 hrs)
- [ ] End-to-end testing
- [ ] Performance benchmarking
- [ ] Production deployment

**Total:** ~5 hours

---

## 🚨 Critical Success Factors

### **Must Haves**
1. ✅ All existing code continues to work
2. ✅ Database migration is seamless (connection string only)
3. ✅ All 94 capabilities supported
4. ✅ Multi-language support works correctly
5. ✅ Error handling is production-grade
6. ✅ Context management prevents token overflow

### **Risk Mitigation**
1. **Database Migration:** Test on staging environment first
2. **Breaking Changes:** Feature flags for new features
3. **Performance:** Benchmark before/after context engineering
4. **Error Handling:** Test failure scenarios extensively

### **Success Metrics**
- 0 breaking changes to existing API
- >80% cache hit rate
- <3s response time for discovery phase
- <5% error rate in production
- Support for all 5 languages

---

## 📝 Notes

### **Preserved Architecture**
- Multi-phase conversation system (discovery → refinement → execution → delivery)
- Drizzle ORM for database operations
- Express.js for API server
- Claude Sonnet 4.5 for orchestration
- Style Selector service integration

### **New Architecture**
- Orchestrator = Account Manager (no model selection)
- Technical Planner = Project Manager (model selection, workflow design)
- Multi-agent execution layer (future)

### **Migration Strategy**
- Backward compatible changes only
- Feature flags for new capabilities
- Gradual rollout per language
- A/B testing for context engineering

---

## 🎯 Next Steps

1. **Review this plan** with stakeholders
2. **Set up Supabase** project and get connection details
3. **Create feature branch:** `feat/orchestrator-v2-refactoring`
4. **Start Phase 1:** Database migration
5. **Progress tracking:** Update TODO list after each phase

---

**Total Estimated Time:** ~22 hours
**Recommended Timeline:** 3 weeks (part-time)
**Go-Live Target:** End of Week 3

**Status:** ✅ Ready to implement
