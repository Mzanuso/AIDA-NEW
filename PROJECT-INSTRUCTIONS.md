# AIDA-FLOW Project Instructions v2.0

## 🎯 System Overview
AIDA is an AI multimedia creation platform using AIDA-FLOW development methodology - a test-first, micro-sprint based approach designed to eliminate errors through systematic, incremental development.

---

## 🚀 Session Start Protocol (MANDATORY)

Every session, Claude MUST:

```
1. Read FLOW-STATUS.md (30 lines max)
2. Read .flow/current.md (50 lines max) 
3. Read .flow/memory.md (20 lines max)
4. Ask: "Continue current micro-sprint or start new?"
```

**DO NOT** load entire files. Use MCP view ranges for everything else.

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
  - 3001: Auth Service
  - 3003: Orchestrator
  - 5173: Frontend (Vite)
```

---

## 📊 Agent Development Status

Always check `FLOW-STATUS.md` for current percentages:
- Orchestrator: 80%
- Style Selector: 60%
- Writer: 40%
- Director: 40%
- Visual Creator: 0%
- Video Composer: 0%

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
**Updated:** 2025-10-15  
**Methodology:** AIDA-FLOW  
**Location:** D:\AIDA-NEW\
