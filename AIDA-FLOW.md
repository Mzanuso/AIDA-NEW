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

## 📁 File Structure

```
AIDA-NEW/
├── .flow/                    # Flow system
│   ├── current.md           # Current micro-sprint (50 lines max)
│   ├── memory.md            # Critical info (20 lines max)
│   ├── tests.json           # Test registry
│   └── checkpoints/         # Verified work snapshots
├── FLOW-STATUS.md           # Single status file
├── FLOW-LOG.md              # Session log
├── src/
├── docs/
└── PROJECT-INSTRUCTIONS.md  # This guide
```

---

## 🔄 Development Workflow 2.0

### Phase 0: START (Every Session)
```javascript
// Claude reads ONLY these 3 files
1. Read FLOW-STATUS.md (current state - 30 lines max)
2. Read .flow/current.md (active task - 50 lines max)
3. Read .flow/memory.md (critical info - 20 lines max)

// Ask ONE question
"Continue current task or start new micro-sprint?"
```

### Phase 1: SPEC (5 minutes)
```yaml
What: Define ONE specific outcome
Input: Exact data/parameters
Output: Expected result
Test: How to verify it works
```

### Phase 2: TEST (5 minutes)
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

### Phase 3: IMPLEMENT (5 minutes)
```javascript
// Write MINIMAL code to pass test
// No extras, no optimization
// Just make it work
```

### Phase 4: VERIFY (2 minutes)
```bash
npm test:current "specific test"
```

### Phase 5: CHECKPOINT (3 minutes)
```javascript
// If test passes:
1. Update FLOW-LOG.md (add 3-line entry)
2. Create checkpoint if needed
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
## MS-XXX: [Task Name]
**Started:** [timestamp]
**Test:** ✅ Written → ⏳ Running → ✅ Passed
**Code:** ⏳ Writing → ✅ Complete
**Verified:** ✅ [timestamp]
**Next:** MS-XXX
```

---

## 🛠 Tool Configuration

### VSCode MCP Commands
```javascript
// Optimized for AIDA-FLOW
vscode:read_text_file({
  path: "file",
  head: 50  // Never more than 50 lines
})

// Keep tests running
npm test -- --watch
```

---

## 🎮 Command Reference

### For Claude
```bash
# Start session
cat FLOW-STATUS.md        # 30 lines
cat .flow/current.md       # 50 lines
cat .flow/memory.md        # 20 lines

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
"ok" or "proceed" or "yes"

# Reject
"stop" or "wait" or "no"

# Query
"show test" or "show progress"
```

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
# Stop immediately
# Fix ONLY that issue
# Re-run until green
# If 3 fails: mark blocked, move on
```

---

## 💡 Why This Works

1. **Cognitive Load:** Max 100 lines keeps everything in working memory
2. **Verification:** Tests catch errors immediately
3. **Progress:** Small wins maintain momentum
4. **Recovery:** Checkpoints enable fast rollback
5. **Clarity:** Single task focus prevents confusion

---

## 🎯 Success Metrics

### Per Session
- ✅ Zero failed tests
- ✅ 3+ micro-sprints completed
- ✅ All commits < 100 lines
- ✅ Clear progress documented

### Per Week
- ✅ 15+ micro-sprints
- ✅ 90%+ test coverage
- ✅ Zero rollbacks needed
- ✅ Continuous forward progress

---

**Remember:** 
- If it's not tested, it's not done
- If it's > 100 lines, it's too complex
- If Claude is confused, the task is too big
- Small wins compound into big victories

---

**Version:** 2.0  
**Updated:** 2025-10-15  
**Location:** D:\AIDA-NEW\
