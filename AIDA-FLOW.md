# AIDA-FLOW: Anti-Error Development System

**Version:** 2.0  
**Created:** 2025-10-11  
**Purpose:** Eliminate errors through systematic development

---

## 🎯 Core Philosophy

**"Small, Tested, Incremental"**

Every piece of work must be:
1. **Small** - Max 100 lines of code per commit
2. **Tested** - Test written BEFORE implementation
3. **Incremental** - Builds on previous verified work

---

## 📁 New File Structure (Simplified)

```
AIDA-CLEAN/
├── .flow/                    # Flow system (NEW)
│   ├── current.md           # Current micro-sprint (50 lines max)
│   ├── tests.json           # Test registry
│   └── checkpoints/         # Verified work snapshots
├── FLOW-STATUS.md           # Single status file (replaces CONTEXT)
├── FLOW-LOG.md              # Session log (replaces SPRINT)
├── backend/
├── client/
└── docs/
```

---

## 🔄 Development Workflow 2.0

### Phase 0: START (Every Session)
```javascript
// Claude reads ONLY these 2 files
1. Read FLOW-STATUS.md (current state - 30 lines max)
2. Read .flow/current.md (active task - 50 lines max)

// Ask ONE question
"Continue current task or start new micro-sprint?"
```

### Phase 1: SPEC (10 minutes max)
```yaml
What: Define ONE specific outcome
Input: Exact data/parameters
Output: Expected result
Test: How to verify it works
```

**Output:** `.flow/current.md` with spec

### Phase 2: TEST (Write test FIRST)
```javascript
// ALWAYS write test before code
describe('Component/Function', () => {
  it('should do X when Y', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

**Output:** Test file created

### Phase 3: IMPLEMENT (Make test pass)
```javascript
// Write MINIMAL code to pass test
// No extras, no optimization
// Just make it work
```

**Output:** Implementation that passes test

### Phase 4: VERIFY (Run test)
```bash
npm test -- --testNamePattern="specific test"
```

**Output:** Green test

### Phase 5: CHECKPOINT
```javascript
// If test passes:
1. Update FLOW-LOG.md (add 3-line entry)
2. Create checkpoint: .flow/checkpoints/[timestamp].json
3. Clear .flow/current.md
4. Update FLOW-STATUS.md (increment progress)
```

---

## 🚫 STRICT RULES (Never Violate)

### Context Management
1. **NEVER load files > 100 lines completely**
2. **ALWAYS use MCP view ranges**
3. **NEVER keep old context between tasks**

### Testing
1. **NEVER write code without test**
2. **NEVER proceed if test fails**
3. **NEVER skip test verification**

### Commits
1. **NEVER commit > 100 lines**
2. **NEVER mix features in one commit**
3. **ALWAYS tag with [FLOW-XXX]**

### Communication
1. **NEVER assume Claude remembers**
2. **ALWAYS show what you're about to do**
3. **NEVER proceed without explicit approval**

---

## 📊 Progress Tracking

### Micro-Sprint Format
```markdown
## MS-001: [Task Name]
**Started:** [timestamp]
**Test:** ✅ Written → ⏳ Running → ✅ Passed
**Code:** ⏳ Writing → ✅ Complete
**Verified:** ✅ [timestamp]
**Next:** MS-002
```

### Daily Progress
```markdown
Day Start: 3 micro-sprints planned
- [x] MS-001: Setup test framework
- [x] MS-002: Create first component
- [ ] MS-003: Add API integration
Day End: 2/3 complete, 0 errors
```

---

## 🛠 Tool Configuration

### VSCode MCP Commands
```javascript
// Optimized for AIDA-FLOW
vscode:text_editor({
  command: "view",
  path: "file",
  view_range: [1, 50]  // Never more than 50 lines
})

vscode:execute_command({
  command: "npm test -- --watch",
  background: true  // Keep tests running
})
```

### Test Framework Setup
```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:current": "vitest --testNamePattern",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 🎮 Command Reference

### For Claude
```bash
# Start session
cat FLOW-STATUS.md        # 30 lines
cat .flow/current.md       # 50 lines

# During work
npm test:current "test name"
git diff --stat           # Verify < 100 lines

# End session
echo "MS-XXX complete" >> FLOW-LOG.md
git commit -m "[FLOW-XXX] Single specific change"
```

### For User
```bash
# Approve
"ok" or "proceed"

# Reject
"stop" or "change X to Y"

# Query
"show test" or "show progress"
```

---

## 🚀 Migration Plan

### Step 1: Archive Old System
```bash
mkdir archive/old-system
mv CONTEXT.md SPRINT.md DECISIONS.md archive/old-system/
```

### Step 2: Initialize FLOW
```bash
# Create new structure
mkdir .flow .flow/checkpoints
touch FLOW-STATUS.md FLOW-LOG.md .flow/current.md

# Install test framework
npm install -D vitest @vitest/ui @testing-library/react
```

### Step 3: First Micro-Sprint
```markdown
## MS-001: Setup Vitest
**Spec:** Configure test framework
**Test:** Run example test successfully
**Time:** 20 minutes max
```

---

## 📈 Success Metrics

### Per Session
- ✅ Zero failed tests
- ✅ All commits < 100 lines
- ✅ 3+ micro-sprints complete
- ✅ No context confusion

### Per Week
- ✅ 15+ micro-sprints
- ✅ 90%+ test coverage
- ✅ Zero rollbacks needed
- ✅ Continuous progress

---

## 🔥 Emergency Recovery

### If Confused
```bash
# Reset to last checkpoint
git reset --hard HEAD~1
cat .flow/checkpoints/latest.json
# Start fresh micro-sprint
```

### If Tests Fail
```bash
# Isolate problem
npm test:current "failing test" -- --reporter=verbose
# Fix ONLY that issue
# Re-run until green
```

### If Blocked
```bash
# Document blocker
echo "BLOCKED: [reason]" >> .flow/current.md
# Move to different micro-sprint
# Return when unblocked
```

---

## 💡 Why This Works

1. **Cognitive Load:** Max 100 lines keeps everything in working memory
2. **Verification:** Tests catch errors immediately
3. **Progress:** Small wins maintain momentum
4. **Recovery:** Checkpoints enable fast rollback
5. **Clarity:** Single task focus prevents confusion

---

## 🎯 End Goal

**"Zero errors, continuous progress, happy development"**

Every session should end with:
- Working code (tests pass)
- Clear progress (micro-sprints complete)
- No confusion (next step obvious)
- No technical debt (clean as you go)

---

**Remember:** If it's not tested, it's not done.  
**Remember:** If it's > 100 lines, it's too big.  
**Remember:** If Claude is confused, the task is too complex.
