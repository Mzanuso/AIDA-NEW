# Current Micro-Sprint

**STATUS:** 🚧 IN PROGRESS
**Started:** 2025-10-20

---

## MS-020B: Prompt Optimizers - Model-Specific Adapters

### Objective
Create 7 adapter classes that translate universal prompt descriptions into model-specific optimized formats, applying researched best practices for each AI model.

### Why This Matters
Each AI model requires different prompt syntax:
- **Midjourney**: `--ar 16:9 --s 250` + 4W1H formula
- **FLUX Pro**: Natural language + camera settings
- **Seedream**: Reference preservation + modular prompts
- **Hunyuan**: Spatial relationships + quoted text
- **Recraft**: Vector keywords + HEX colors
- **Ideogram**: Quoted text + positioning
- **Nano Banana**: Conversational editing

### Deliverables
1. **Interface** `prompt-adapter.interface.ts` (UniversalPrompt + PromptAdapter)
2. **7 Adapter Classes**:
   - MidjourneyAdapter (most complex - 4W1H, 60-30-10 rule)
   - FluxProAdapter (natural language)
   - FluxSchnellAdapter (simplified FLUX)
   - SeedreamAdapter (reference + preservation)
   - HunyuanAdapter (spatial + text)
   - RecraftAdapter (vector + colors)
   - IdeogramAdapter (typography)
3. **7 Test Files** (min 3 tests each = 21+ total tests)

---

## Test-First Approach

### Phase 1: Interface Definition (NOW)
- [ ] Create UniversalPrompt interface
- [ ] Create PromptAdapter interface
- [ ] Define clear contracts

### Phase 2: RED - Midjourney Tests (NEXT)
- [ ] Test: 4W1H formula application
- [ ] Test: Parameter generation (--ar, --s, --v)
- [ ] Test: Quality tier mapping
- [ ] Test: Edge cases (missing fields)

### Phase 3: GREEN - Midjourney Implementation
- [ ] Implement MidjourneyAdapter class
- [ ] Apply best practices from research
- [ ] Make all tests pass

### Phase 4: Repeat for Other Adapters
- [ ] FLUX Pro (natural language)
- [ ] FLUX Schnell (simplified)
- [ ] Seedream (consistency)
- [ ] Hunyuan (text rendering)
- [ ] Recraft (vector)
- [ ] Ideogram (typography)

---

## Success Criteria
✅ UniversalPrompt interface defined
✅ PromptAdapter interface defined
✅ 7 adapter classes implemented
✅ 21+ tests written (3 per adapter minimum)
✅ All tests passing (100%)
✅ Each adapter under 100 lines
✅ Model-specific best practices applied

---

## Research Materials Available
- Midjourney Guide: `GUIDA COMPLETA AI AGENT MIDJOURNEY 2025 (1).md` (300+ pages)
- FLUX: Natural language, IMG_xxxx.cr2 trick
- Seedream: 94% consistency, multi-reference
- Hunyuan: Text rendering, spatial relationships
- Recraft: Vector native, brand styles
- Ideogram: Typography best-in-class

---

## Progress Tracking
- [ ] Interface created
- [ ] Midjourney adapter (0/4 tests)
- [ ] FLUX Pro adapter (0/3 tests)
- [ ] FLUX Schnell adapter (0/3 tests)
- [ ] Seedream adapter (0/3 tests)
- [ ] Hunyuan adapter (0/3 tests)
- [ ] Recraft adapter (0/3 tests)
- [ ] Ideogram adapter (0/3 tests)

**Total Progress: 0/25 tasks**

---

## Time Estimate
- Interface: 5 min
- Midjourney: 10 min (most complex)
- Each other adapter: 4-5 min
- Total: ~40 min (may span multiple sessions)

---

## Notes
- Start with Midjourney (most complex, best documented)
- Keep adapters simple and focused
- Test edge cases (missing fields)
- Apply actual research findings, not generic prompts
