# Session Start Protocol

**Purpose:** Minimize token usage while maintaining full project context

---

## 🚀 START OF SESSION (Every time)

### MANDATORY - Read these sections only:

**1. `.flow/current.md` (ALL)** - ~500 tokens
- Current sprint status
- Active blockers
- Next actions

**2. `.flow/memory.md` (ALL)** - ~300 tokens
- Critical project info
- Architecture ports
- Recent milestones

**3. `FLOW-STATUS.md` (SECTIONS ONLY):**
- Lines 1-30: "Current Focus" → ~200 tokens
- Lines 25-45: "Agent Development Status" table → ~250 tokens
- Lines 59-103: "Recent Completions" (last 2 entries) → ~500 tokens

**TOTAL START:** ~1,750 tokens ✅

---

## 📖 REFERENCE (Read only when needed)

### When you need to remember "why we did X":

**`FLOW-LOG.md`** - Read last session entry only
- Scroll to bottom
- Read last 200 lines (~3,000 tokens)
- Contains: bug fixes, decisions, lessons learned

### When you need to plan next 2-3 weeks:

**`ROADMAP.md`** - Read specific phase only
- Phase 1 (Infrastructure): Lines 1-150
- Phase 2 (Agents): Lines 150-450
- Don't read all 600 lines at once

### When you forgot methodology:

**`PROJECT-INSTRUCTIONS.md`** - Read once per project
- Already loaded, don't reload

---

## 📝 END OF SESSION (Update files)

### ALWAYS update:

**`.flow/current.md`** (~600 tokens)
- Update status (completed/blocked/in_progress)
- Update next actions
- Update blockers if changed

### UPDATE ONLY IF:

**`.flow/memory.md`** (~400 tokens)
- NEW blocker appeared
- Major milestone completed
- Architecture changed

**`FLOW-STATUS.md`** (~2,000 tokens)
- Milestone completed (MS-XXX)
- Agent status % changed significantly
- Add to "Recent Completions"

**`FLOW-LOG.md`** (~3,000 tokens)
- Session lasted > 60 min
- Multiple milestones completed
- Important decisions made
- Append only, don't rewrite

---

## 💡 Token Budget Guidelines

| Activity | Budget | Frequency |
|----------|--------|-----------|
| Session start | 1,750 tokens | Every session |
| Reference lookup | 3,000 tokens | As needed |
| Session end update | 600-6,000 tokens | End of session |
| **TOTAL/SESSION** | **2,350-10,750 tokens** | **Typical** |

---

## 🎯 Quick Rules

1. **NEVER** read entire FLOW-LOG.md (788 lines)
2. **NEVER** read entire ROADMAP.md (600 lines)
3. **ALWAYS** read .flow/current.md + memory.md
4. **ONLY** update FLOW-STATUS if milestone complete
5. **ONLY** update FLOW-LOG if session > 60 min

---

## 📊 File Purposes (Quick Reference)

| File | Size | Purpose | Read Frequency |
|------|------|---------|----------------|
| `.flow/current.md` | 64 lines | Active work | Every session |
| `.flow/memory.md` | 40 lines | Critical context | Every session |
| `FLOW-STATUS.md` | 345 lines | Project dashboard | Sections only |
| `FLOW-LOG.md` | 788 lines | Historical archive | Last entry only |
| `ROADMAP.md` | 600 lines | Future planning | Specific phase |
| `PROJECT-INSTRUCTIONS.md` | 326 lines | Methodology | Once per project |

---

**Last Updated:** 2025-10-21
**Token Savings:** ~90% vs reading all files
**Context Loss Risk:** LOW (all info still available)
