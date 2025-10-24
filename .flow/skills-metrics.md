# Skills Metrics Tracker

## 📊 Purpose

This file tracks patterns that indicate when a new Claude Skill should be created.

**Decision Rules:**
- 🟢 GREEN (1 occurrence): Normal, no action
- 🟡 YELLOW (2 occurrences): Pattern emerging, monitor
- 🔴 RED (3+ occurrences): **CREATE SKILL NOW**

**Time Rule:**
- If > 10 minutes spent searching same information → 🔴 CREATE SKILL

**Cross-Session Rule:**
- If same pattern in 2+ sessions → 🔴 CREATE SKILL

---

## 📈 Current Session: [DATE]

### File Read Counts

| File/Topic | Reads | Status | Action |
|------------|-------|--------|--------|
| docs/AIDA-ARCHITECTURE-FINAL.md | 0 | 🟢 | - |
| Visual prompting patterns | 0 | 🟢 | - |
| Database schema queries | 0 | 🟢 | - |
| Agent coordination patterns | 0 | 🟢 | - |
| Brand guidelines lookup | 0 | 🟢 | - |

### Time Spent on Repeated Topics

| Topic | Time (min) | Status | Action |
|-------|------------|--------|--------|
| Multi-agent coordination | 0 | 🟢 | - |
| Visual prompt engineering | 0 | 🟢 | - |
| Database queries | 0 | 🟢 | - |
| API integration patterns | 0 | 🟢 | - |

### Repeated Questions/Searches

None yet this session.

### Skill Recommendations

**Current Session:** No new skills needed (all metrics below threshold)

**Potential Skills Being Monitored:**
- aida-visual-prompting (visual prompt engineering patterns)
- aida-agent-coordinator (multi-agent architecture patterns)
- aida-database-schema (PostgreSQL + Drizzle patterns)
- client-brand-guidelines (brand consistency enforcement)

---

## 📝 How to Use This File

### For Claude Code:

**During Session:**
1. When reading a file for the 2nd time, add 🟡 emoji in response
2. When reading a file for the 3rd time, add 🔴 emoji and suggest skill creation
3. Update this file with actual counts (don't guess)
4. Signal user when threshold reached

**Example Signal Format:**
```
🟡 2nd read of visual prompting patterns (visual-creator-executor.ts)
```
```
🔴 3rd read of architecture docs - aida-agent-coordinator skill would save time. Create now?
```

### For User:

**During Session:**
- Watch for 🟡 and 🔴 emoji signals from Claude
- Decide whether to create skill immediately or continue
- If you see pattern yourself, ask Claude to create skill

**After Session:**
- Review this file to see metrics
- Check if any 🔴 patterns emerged
- Decide if skills should be created for next session

---

## 🎯 Skill Creation Triggers

### ✅ CREATE SKILL if:
- [x] Same file read 3+ times in one session
- [x] Same search/grep 3+ times in one session
- [x] > 10 minutes spent finding same information
- [x] Same question asked in 2+ different sessions
- [x] Pattern causes errors or inconsistencies

### 🟡 MONITOR if:
- [ ] Same file read 2 times
- [ ] Same search 2 times
- [ ] 5-10 minutes spent on topic
- [ ] Pattern noticed but not critical

### 🟢 NO SKILL NEEDED if:
- [ ] File read 1 time (normal discovery)
- [ ] Quick lookup (< 5 minutes)
- [ ] One-time information need
- [ ] Already covered by existing skill

---

## 📚 Historical Data

### Session 2025-10-23 (Skills System Creation)

**Files Read:**
- AIDA-NEW_CLAUDE-SKILLS-GUIDE.md: 1 time (study phase)
- .flow/current.md: 2 times (normal session management)

**Time Spent:**
- Skills system design: 90 minutes (one-time setup)

**Skills Created:**
- aida-session-manager (solved session continuity problem)
- aida-flow-tdd (enforces TDD workflow)
- fal-ai-integration (FAL.AI best practices)

**Patterns Observed:**
- Session management files read every session → skill created ✅
- TDD patterns repeated in every task → skill created ✅
- FAL.AI docs consulted frequently → skill created ✅

**Result:** 3 critical skills created proactively based on known patterns

---

## 🔄 Next Session Template

**Copy this section at start of each new session:**

```markdown
## 📈 Session: [DATE]

### File Read Counts
| File/Topic | Reads | Status |
|------------|-------|--------|
| docs/AIDA-ARCHITECTURE-FINAL.md | 0 | 🟢 |
| Visual prompting patterns | 0 | 🟢 |
| Database schema | 0 | 🟢 |

### Time Spent
| Topic | Minutes | Status |
|-------|---------|--------|
| [Topic] | 0 | 🟢 |

### Repeated Questions
None

### Recommendations
None yet
```

---

**Last Updated:** 2025-10-23 11:45
**Session:** Skills Metrics System Creation
**Next Review:** Start of next session
