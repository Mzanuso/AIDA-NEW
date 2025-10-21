# AIDA-FLOW Project Instructions v2.0

## 🎯 System Overview
AIDA is an AI multimedia creation platform using AIDA-FLOW development methodology - a test-first, micro-sprint based approach designed to eliminate errors through systematic, incremental development.

### Architecture (Updated Oct 21, 2025)
**Pattern:** Centralized Orchestration with HTTP Microservices

**Current Status (75% Complete):**
```
Orchestrator (3003) - 85% ✅
  ├─→ Style Selector (3002) - 100% ✅ PRODUCTION READY
  ├─→ Technical Planner (3004) - 100% ✅ PRODUCTION READY
  │     └─→ Visual Creator (3005) - 100% ✅ PRODUCTION READY
  ├─→ Writer Agent (3006) - 0% ⏳ Next Sprint
  ├─→ Director Agent (3007) - 0% ⏳ Planned
  ├─→ Video Composer (3008) - 0% ⏳ Planned
  └─→ Audio Generator (3009) - 0% ⏳ Planned
```

**Communication:** All agents communicate via HTTP REST APIs (no peer-to-peer)

📚 **Complete Architecture:** See `docs/AIDA-ARCHITECTURE-FINAL.md`
🗺️ **Development Roadmap:** See `ROADMAP.md`

---

## 🚀 Session Start Protocol (MANDATORY)

Every session, Claude MUST follow `.flow/session-protocol.md`:

```
1. Read .flow/current.md (ALL - ~500 tokens)
2. Read .flow/memory.md (ALL - ~300 tokens)
3. Read FLOW-STATUS.md (SECTIONS ONLY - ~950 tokens):
   - Current Focus (lines 1-30)
   - Agent Status table (lines 25-45)
   - Recent Completions (last 2 entries, lines 59-103)
4. Ask: "Continue current micro-sprint or start new?"
```

**TOTAL START:** ~1,750 tokens ✅

**Reference files** (read only when needed):
- FLOW-LOG.md (last session only)
- ROADMAP.md (specific phase only)

See `.flow/session-protocol.md` for complete guidelines.

### 🔧 Enforcement Tools

**Session Start:** Run `.flow/session-start.sh` at beginning of each session
- Displays mandatory reading checklist
- Confirms protocol compliance
- Reminds of token-optimized approach

**Session End:** Run `.flow/session-end.sh` before ending session
- Reviews files that need updates
- Checks for uncommitted changes
- Verifies mandatory files exist

**Git Protection:** Install hooks with `.flow/install-hooks.sh` (one-time setup)
- Prevents deletion of mandatory files
- Verifies file content before commits
- Protects project continuity

**Installation (one-time):**
```bash
cd D:\AIDA-NEW
bash .flow/install-hooks.sh
```

**Usage (every session):**
```bash
# Session start
bash .flow/session-start.sh

# ... work on tasks ...

# Session end
bash .flow/session-end.sh
```

---

## 🔴 Core Rules (NEVER VIOLATE)

### Context Management
- **NEVER** load files > 100 lines completely
- **ALWAYS** use MCP view ranges for large files
- **NEVER** keep old context between tasks

### Development
- **NEVER** write code without test first
- **NEVER** commit > 100 lines
- **NEVER** proceed if test fails
- **ALWAYS** work in micro-sprints (20 min max)
- **ALWAYS** verify tests pass before proceeding

### Communication
- **NEVER** assume user remembers previous context
- **ALWAYS** show what you're about to do
- **NEVER** proceed without explicit approval

---

## 📁 File Structure

```
D:\AIDA-NEW\
├── .flow/              # Active work
│   ├── current.md      # Current task (50 lines max)
│   ├── memory.md       # Critical info (20 lines max)
│   ├── tests.json      # Test registry
│   └── checkpoints/    # Progress snapshots
├── FLOW-STATUS.md      # Project state (30 lines)
├── FLOW-LOG.md         # Session history
├── AIDA-FLOW.md        # Complete methodology
└── PROJECT-INSTRUCTIONS.md  # This file
```

---

## 🔄 Micro-Sprint Workflow (STRICT)

### Phase 1: SPEC (5 min)
```yaml
What: Define ONE specific outcome
Input: Exact data/parameters
Output: Expected result
Test: How to verify it works
```

### Phase 2: TEST (5 min)
```javascript
// Write test FIRST - before any implementation
describe('Component', () => {
  it('should specific behavior', () => {
    // Arrange
    // Act  
    // Assert
  });
});
```

### Phase 3: CODE (5 min)
- Write MINIMAL code to pass test
- No extras, no optimization
- Just make it work

### Phase 4: VERIFY (2 min)
```bash
npm test:current "test name"
```

### Phase 5: CHECKPOINT (3 min)
```bash
# Update logs
echo "MS-XXX complete" >> FLOW-LOG.md

# Commit
git add .
git commit -m "[FLOW-XXX] Specific change"

# Clear current
> .flow/current.md
```

---

## 💻 MCP Usage Patterns

```javascript
// ✅ CORRECT - Load only what you need
vscode:text_editor({
  command: "view",
  path: "file.ts",
  view_range: [1, 50]  // Max 50 lines at once
})

// ✅ CORRECT - Keep tests running
vscode:execute_command({
  command: "npm test -- --watch",
  background: true
})

// ❌ WRONG - Loading entire file
vscode:text_editor({
  command: "view",
  path: "file.ts"  // NO! Specify range
})
```

---

## 💬 Communication Protocol

### Response Format
1. **Acknowledge** what user said (1 line)
2. **Propose** approach (max 3 points)
3. **Ask** for approval or clarification

### Example
```
Got it - fixing the authentication error.

I'll:
1. Write test for login endpoint
2. Fix JWT token validation
3. Verify all auth tests pass

Shall I proceed with the test first?
```

### Approval Words
- User says "ok", "proceed", "yes" → Continue
- User says "stop", "wait", "no" → Pause and clarify
- User asks question → Answer, then re-propose

---

## 🛠 Tech Stack Reference

```yaml
Frontend:
  - React 18 with TypeScript
  - Vite (build tool)
  - TailwindCSS (styling)
  - Redux Toolkit (state)
  - React Query (server state)

Backend:
  - Node.js + Express
  - PostgreSQL (database)
  - Drizzle ORM
  - Jest/Vitest (testing)

AI Services:
  - Claude Sonnet 4.5 (Anthropic)
  - FAL.AI (primary media API)
  - KIE.AI (Midjourney access)

Ports:
  - 3000: API Gateway
  - 3003: Orchestrator (Account Manager)
  - 3002: Style Selector ✅
  - 3004: Technical Planner ✅
  - 3005: Visual Creator ✅
  - 3006: Writer Agent (planned)
  - 3007: Director Agent (planned)
  - 3008: Video Composer (planned)
  - 3009: Audio Generator (planned)
  - 5173: Frontend (Vite)
```

---

## 📊 Agent Development Status

Always check `FLOW-STATUS.md` for current percentages:
- Orchestrator: 85% (57 TS errors to fix)
- Style Selector: 100% ✅ PRODUCTION READY
- Technical Planner: 100% ✅ PRODUCTION READY
- Visual Creator: 100% ✅ PRODUCTION READY
- Writer: 0% (planned - MS-028/029)
- Director: 0% (planned - MS-030/031)
- Video Composer: 0% (planned - MS-032/033)
- Audio Generator: 0% (planned - MS-034/035)

---

## 🚨 Error Handling Protocol

```bash
# On test failure
1. Stop immediately
2. Read error message
3. Fix ONLY that specific issue
4. Re-run test
5. If still fails after 3 attempts:
   echo "BLOCKED: [reason]" >> .flow/current.md
   # Move to different task
```

---

## 🏁 Session End Checklist

```bash
□ Update FLOW-LOG.md (3-line summary)
□ Clear .flow/current.md
□ Commit with [FLOW-XXX] tag
□ Update FLOW-STATUS.md percentages
□ Note any blockers for next session
```

---

## 🆘 Emergency Commands

```bash
# Reset to last good state
git reset --hard HEAD~1

# Check last checkpoint
cat .flow/checkpoints/latest.json

# Run specific test
npm test:current "test name"

# View logs
git log --oneline -10

# Check what changed
git diff --stat

# Recovery from confusion
cat FLOW-STATUS.md
cat .flow/current.md
# Start fresh micro-sprint
```

---

## 📈 Success Metrics

### Per Session
✅ Zero failed tests  
✅ 3+ micro-sprints completed  
✅ All commits < 100 lines  
✅ Clear progress documented  

### Per Week
✅ 15+ micro-sprints  
✅ 90%+ test coverage  
✅ Zero rollbacks needed  
✅ Continuous forward progress  

---

## 🎯 Key Principles

1. **Test First** - No code without test
2. **Small Steps** - Max 100 lines per commit
3. **Verify Always** - Green tests or stop
4. **Document Progress** - Update logs constantly
5. **Stay Focused** - One task at a time

---

## 📝 Micro-Sprint Template

```markdown
## MS-XXX: [Task Name]
**Spec:** One line description
**Test:** Test file location
**Time:** 20 min max

### Checklist
- [ ] Test written
- [ ] Test fails (red)
- [ ] Code written
- [ ] Test passes (green)
- [ ] Committed

### Result
[One line outcome]
```

---

## 🏆 Final Reminders

> If it's not tested, it's not done.

> If it's > 100 lines, it's too complex.

> If Claude is confused, the task is too big.

> Small wins compound into big victories.

---

**Version:** 2.0  
**Updated:** 2025-10-11  
**Methodology:** AIDA-FLOW  
**Location:** D:\AIDA-CLEAN\
