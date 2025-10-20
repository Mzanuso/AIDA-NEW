# Current Micro-Sprint

**STATUS:** 🚧 IN PROGRESS
**Started:** 2025-10-20

---

## MS-021: API Integration Layer - Visual Creator Execution

### Objective
Create the API wrapper layer that executes WorkflowExecutionPlan by calling FAL.AI and KIE.AI services. This is the final piece that makes Visual Creator fully functional end-to-end.

### Why This Matters
The API Integration Layer is the execution engine:
- Receives WorkflowExecutionPlan from Workflow Orchestrator
- Calls appropriate AI APIs (FAL.AI for FLUX/Seedream/Ideogram, KIE.AI for Midjourney)
- Handles rate limiting, retries, and errors
- Returns generated image URLs
- Updates workflow status in real-time

### Input (from Workflow Orchestrator)
```typescript
interface WorkflowExecutionPlan {
  workflowId: string;
  workflowType: WorkflowType;
  steps: WorkflowStep[];
  estimatedTime: number;
  estimatedCost: number;
}
```

### Output (to User/Storage)
```typescript
interface WorkflowResult {
  workflowId: string;
  status: 'success' | 'partial_success' | 'failed';
  allImageUrls: string[];
  totalCost: number;
  totalTime: number;
}
```

### Deliverables
1. **FAL.AI Wrapper** `api/fal-client.ts`
   - FLUX Pro/Schnell generation
   - Seedream generation
   - Ideogram generation
   - Recraft generation
   - Response parsing
   - Error handling

2. **KIE.AI Wrapper** `api/kie-client.ts`
   - Midjourney generation
   - Status polling (async)
   - Response parsing
   - Error handling

3. **Workflow Executor** `visual-creator-executor.ts`
   - Execute WorkflowExecutionPlan
   - Step-by-step execution
   - Dependency management
   - Rate limiting
   - Retry logic (3 attempts)
   - Progress tracking

4. **Tests** `__tests__/visual-creator-executor.test.ts`
   - Test FAL.AI integration (3 tests)
   - Test KIE.AI integration (2 tests)
   - Test step execution (3 tests)
   - Test retry logic (2 tests)
   - Test rate limiting (1 test)
   - Test error handling (2 tests)
   - **Target: 13+ tests**

---

## Test-First Approach

### Phase 1: Interface & Planning ✅ (NOW)
- [x] Define API wrapper interfaces
- [x] Understand FAL.AI SDK
- [x] Understand KIE.AI API
- [x] Plan rate limiting strategy

### Phase 2: RED - Write Tests
- [ ] Test: FAL.AI FLUX Pro call
- [ ] Test: FAL.AI Seedream call
- [ ] Test: KIE.AI Midjourney call
- [ ] Test: Execute single-shot workflow
- [ ] Test: Execute multi-step workflow
- [ ] Test: Retry on failure
- [ ] Test: Rate limiting

### Phase 3: GREEN - Implement Wrappers
- [ ] Implement FAL.AI wrapper
- [ ] Implement KIE.AI wrapper
- [ ] Implement Workflow Executor
- [ ] Pass all tests

### Phase 4: VERIFY
- [ ] Run all tests (target: 13/13 passing)
- [ ] Test with real API keys (optional)
- [ ] Verify end-to-end flow

---

## Technical Decisions

### Rate Limiting Strategy
- FAL.AI: 10 requests/second
- KIE.AI: 2 requests/second (Midjourney is slower)
- Use simple queue with delay

### Retry Strategy
- 3 attempts per step
- Exponential backoff: 2s, 4s, 8s
- Try fallback model on 3rd failure

### Error Handling
- Network errors: Retry
- API errors (400): Don't retry, fail immediately
- API errors (429 rate limit): Retry with longer delay
- API errors (500): Retry

---

## Progress Tracking
- [ ] FAL.AI wrapper complete
- [ ] KIE.AI wrapper complete
- [ ] Workflow Executor complete
- [ ] Tests written (RED phase)
- [ ] Tests passing (GREEN phase)
- [ ] Integration verified
- [ ] Committed

**Time Budget:** 60 min (might be 2 micro-sprints)
**Complexity:** High (external API integration)
