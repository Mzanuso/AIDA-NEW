---
name: aida-session-manager
description: AIDA project session initialization and management. Load project context from .flow/ directory, read current.md for status, propose next priority tasks. Track file read patterns and signal when new skills are needed. Use ALWAYS when user says "inizia sessione" or "fine sessione" or starts working on AIDA project. Critical for maintaining session continuity and preventing duplicate work.
version: 1.1.0
allowed-tools: [read, edit, bash]
---

# AIDA Session Manager

## Purpose

This skill manages AIDA project sessions to ensure:
- Every session starts from the correct continuation point
- Status files are automatically updated at session end
- No duplicate work is proposed
- Git commits track session progress
- Context is preserved across sessions
- **NEW:** Track file read patterns and signal when new skills should be created

## When to Activate

**ALWAYS activate when:**
- User says "inizia sessione"
- User says "fine sessione"
- User mentions starting work on AIDA project
- You detect this is an AIDA project session (check for `.flow/` directory)

## Instructions

### SESSION START: "inizia sessione"

When user says "inizia sessione", follow these steps EXACTLY:

#### STEP 1: Read Context Files (MANDATORY)

```bash
# Read these files in order:
1. D:\AIDA-NEW\.flow\current.md (ENTIRE FILE - ~280 lines)
2. D:\AIDA-NEW\.flow\memory.md (ENTIRE FILE - ~40 lines)
3. D:\AIDA-NEW\.flow\skills-metrics.md (CURRENT SESSION section only - ~50 lines)
```

**DO NOT:**
- Skip reading these files
- Ask "how can I help?"
- Propose generic tasks

**SKILLS METRICS:** Initialize mental tracking for this session (reset all counters to 0)

#### STEP 2: Parse Status (MANDATORY)

Extract from `current.md`:
- **Status line**: Is it COMPLETED, IN_PROGRESS, READY, or BLOCKED?
- **Last task**: What was completed in previous session?
- **Next tasks section**: What tasks are documented as next priorities?
- **Completed date**: When was last work done?

#### STEP 3: Propose Specific Next Task (MANDATORY)

**Format your response EXACTLY like this:**

```markdown
🚀 Nuova Sessione Iniziata

📊 Stato Progetto:
- Ultima sessione: [data] - [task completato]
- Status corrente: [COMPLETED/IN_PROGRESS/etc]

📋 Prossimi Task Prioritari:
1. [Task 1 from current.md] - [HIGH/MEDIUM/LOW]
2. [Task 2 from current.md] - [HIGH/MEDIUM/LOW]

🎯 Procedo con: [Nome Task 1]

[Brief description of what you'll do]
```

**CRITICAL RULES:**
- ❌ NEVER propose tasks that are marked as COMPLETED in current.md
- ❌ NEVER ask "what do you want to do?" - always propose the top priority task
- ❌ NEVER skip reading files
- ✅ ALWAYS propose the specific task listed in "Next Priority Tasks" section

#### STEP 4: Begin Work

After proposing the task, immediately start working on it unless user interrupts.

---

### DURING SESSION: Skills Metrics Tracking

**CRITICAL: Track file reads and signal user when patterns emerge**

#### Mental Tracking (Keep Count in Memory)

Track these metrics throughout the session:
- File read counts (same file read multiple times)
- Topic time spent (visual prompting, architecture, database, etc.)
- Repeated searches/greps for same information

#### Signaling Rules

**🟡 YELLOW (2nd occurrence):**
```markdown
🟡 2nd read of [file/topic name]
```
Display this emoji in your response when reading same file/topic for 2nd time.

**🔴 RED (3rd occurrence):**
```markdown
🔴 3rd read of [file/topic] - [skill-name] skill would save time. Create now?
```
Display this emoji + suggestion when reading same file/topic for 3rd time.

**⏱️ TIME (> 10 minutes on topic):**
```markdown
⏱️ Spent 10+ minutes on [topic] - [skill-name] skill recommended. Create?
```

#### Examples

**Example 1: Architecture Docs**
```
1st read: (no signal, normal)
  Reading docs/AIDA-ARCHITECTURE-FINAL.md to understand agent ports...

2nd read: (yellow signal)
  🟡 2nd read of architecture docs (AIDA-ARCHITECTURE-FINAL.md)
  Checking agent coordination patterns...

3rd read: (red signal + recommendation)
  🔴 3rd read of architecture docs - aida-agent-coordinator skill would save time. Create now?
```

**Example 2: Visual Prompting**
```
1st grep: (no signal)
  Searching for visual prompting patterns in Visual Creator code...

2nd grep: (yellow signal)
  🟡 2nd search for visual prompting patterns

3rd search: (red signal)
  🔴 3rd search for visual prompting - aida-visual-prompting skill would save time. Create now?
```

#### Potential Skills to Monitor

| Pattern | Skill Name | Trigger |
|---------|------------|---------|
| Architecture docs (agent ports, coordination) | aida-agent-coordinator | 3 reads or 10 min |
| Visual prompting patterns | aida-visual-prompting | 3 reads or 10 min |
| Database schema/queries | aida-database-schema | 3 reads or 10 min |
| Brand guidelines lookup | client-brand-guidelines | 3 reads or 10 min |
| Microservice API patterns | aida-microservice-api | 3 reads or 10 min |

#### Important Notes

- **Count only SAME topic/file**: Reading different files once each = no signal
- **Reset each session**: Counter starts at 0 each "inizia sessione"
- **User decides**: Signal only, don't auto-create skill
- **Be honest**: Don't inflate counts, track accurately

---

### SESSION END: "fine sessione"

When user says "fine sessione", follow these steps EXACTLY:

#### STEP 1: Update current.md FIRST (MANDATORY - BEFORE SUMMARY)

**Read current.md first to understand current content:**

```bash
# Read to understand structure
Read: D:\AIDA-NEW\.flow\current.md
```

**Then update with new status:**

Use Edit tool to update these sections:
1. **Status line**: Update to COMPLETED (if task finished) or IN_PROGRESS
2. **Focus**: Update to next task to be done
3. **Completed date**: Add current date/time if COMPLETED
4. **Completed Objectives**: Document what was accomplished
5. **Next Priority Tasks**: Update with remaining tasks
6. **Last Updated**: Current date and time

**Template for updates:**

```markdown
**Status:** 🟢 COMPLETED - [Task Name]
**Focus:** [Next Task]
**Completed:** 2025-10-23 [time]
**Last Updated:** 2025-10-23 [time]

---

## 🎯 Completed Objectives

✅ **[Task Name]**
- [What was accomplished - bullet 1]
- [What was accomplished - bullet 2]
- [Files modified]

✅ **Verification:**
- [What was verified - tests, TypeScript, etc]

---

## 🚀 Next Priority Tasks

### 1. [Next Task Name] [HIGH/MEDIUM/LOW PRIORITY]
**Purpose:** [Why this task]
**Estimated Time:** [time estimate]
**Action:** [First step to take]

### 2. [Second Task]...
```

#### STEP 2: Update skills-metrics.md (MANDATORY)

**If any patterns were tracked during session**, update skills-metrics.md:

```markdown
## 📈 Session: [DATE]

### File Read Counts
| File/Topic | Reads | Status |
|------------|-------|--------|
| docs/AIDA-ARCHITECTURE-FINAL.md | [X] | [🟢/🟡/🔴] |
| Visual prompting patterns | [X] | [🟢/🟡/🔴] |

### Time Spent
| Topic | Minutes | Status |
|-------|---------|--------|
| Multi-agent coordination | [X] | [🟢/🟡/🔴] |

### Repeated Questions
[List any questions asked 2+ times]

### Recommendations
[List any skills recommended with 🔴 signal]
```

**If no patterns emerged** (all metrics at 0-1), add brief note:
```markdown
## Session: [DATE]
No repeated patterns detected. All metrics below threshold.
```

#### STEP 3: Commit and Push (MANDATORY)

```bash
# Add both current.md and skills-metrics.md if updated
git add .flow/current.md .flow/skills-metrics.md

git commit -m "[FLOW] Update current.md - [Task Name] [STATUS]

[Brief description of what was accomplished]

Skills Metrics: [Summary of patterns if any]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main --no-verify
```

#### STEP 4: Give Summary to User (ONLY AFTER STEP 1-3)

**Format:**

```markdown
✅ Sessione Completata

## 🎯 Task Completato
[Task name and description]

## 📊 Stato Finale
- TypeScript: [status]
- Tests: [status]
- Services: [status]

## 🚀 Prossimi Passi
1. [Next task 1]
2. [Next task 2]

## 💾 Repository Aggiornato
- Commit: [hash]
- Branch: main
- Status: Pushed to GitHub

**Sessione chiusa con successo!**
```

**CRITICAL RULES:**
- ❌ NEVER give summary before updating current.md
- ❌ NEVER skip commit and push
- ❌ NEVER leave status as outdated (e.g., "READY" when should be "COMPLETED")
- ✅ ALWAYS update current.md FIRST
- ✅ ALWAYS commit and push BEFORE summary
- ✅ ALWAYS document next tasks clearly

---

## Common Mistakes to Avoid

### ❌ DON'T DO THIS:
```
User: "inizia sessione"
Assistant: "Come posso aiutarti oggi?"  # TOO GENERIC!
```

### ✅ DO THIS:
```
User: "inizia sessione"
Assistant: [Reads current.md]
Assistant: "🚀 Nuova Sessione Iniziata
Ultima sessione: 2025-10-22 - Writer Agent Visual Storytelling COMPLETED
Procedo con: Test Writer Agent with Real Examples [HIGH]"
[Immediately starts working]
```

### ❌ DON'T DO THIS:
```
User: "fine sessione"
Assistant: "✅ Sessione completata! Ecco il riepilogo..."  # DIDN'T UPDATE FILES!
```

### ✅ DO THIS:
```
User: "fine sessione"
Assistant: [Updates current.md with Edit tool]
Assistant: [Commits and pushes]
Assistant: "✅ Sessione Completata [full summary]"
```

---

## File Locations Reference

**Project Root**: `D:\AIDA-NEW\`

**Critical Files**:
- `.flow/current.md` - Current sprint status (READ EVERY SESSION START)
- `.flow/memory.md` - Critical context (READ EVERY SESSION START)
- `.flow/session-protocol.md` - Detailed protocol (reference if needed)
- `FLOW-STATUS.md` - Project dashboard (read specific sections if needed)

---

## Examples

### Example 1: Session Start with COMPLETED Status

**User**: "inizia sessione"

**Your Response**:
```markdown
🚀 Nuova Sessione Iniziata

📊 Stato Progetto:
- Ultima sessione: 2025-10-22 07:45 - Writer Agent Visual Storytelling COMPLETED
- Status corrente: 🟢 COMPLETED

📋 Prossimi Task Prioritari:
1. Test Writer Agent with Real Examples [HIGH PRIORITY] - 1-2 hours
2. MS-027: Writer → Visual Creator Integration [HIGH PRIORITY] - 4-6 hours

🎯 Procedo con: Test Writer Agent with Real Examples

Avvierò il Writer Agent service (port 3006) e genererò script di esempio con visual descriptions per verificare la qualità del sistema di visual storytelling appena implementato.
```

[Then immediately start: `npm run dev:writer` or appropriate action]

### Example 2: Session End After Task Completion

**User**: "fine sessione"

**Your Actions**:
1. Read current.md
2. Edit current.md:
   ```markdown
   **Status:** 🟢 COMPLETED - Test Writer Agent with Real Examples
   **Focus:** MS-027: Writer → Visual Creator Integration
   **Completed:** 2025-10-23 15:30

   ## 🎯 Completed Objectives
   ✅ **Writer Agent Testing Complete**
   - Generated 3 sample video scripts
   - Verified visual descriptions quality
   - All 60+ visual references working correctly
   ```
3. Commit: `git add .flow/current.md && git commit -m "[FLOW] Update current.md - Writer Agent Testing COMPLETED"`
4. Push: `git push origin main --no-verify`
5. Give summary to user

---

## Verification Checklist

**Before responding to "inizia sessione":**
- [ ] Read .flow/current.md (entire file)
- [ ] Read .flow/memory.md (entire file)
- [ ] Parsed status (COMPLETED/IN_PROGRESS/etc)
- [ ] Identified next priority task from current.md
- [ ] Verified task is NOT already completed
- [ ] Proposed specific task (not generic "how can I help?")

**Before responding to "fine sessione":**
- [ ] Updated .flow/current.md (status, objectives, next tasks)
- [ ] Created git commit with [FLOW] prefix
- [ ] Pushed to GitHub
- [ ] ONLY THEN gave summary to user

---

## Token Budget

This skill is designed for efficiency:
- **Session start**: Read 2 files (~320 lines = ~2,500 tokens)
- **Session end**: Update 1 file, commit, push (~500 tokens)
- **Total per session**: ~3,000 tokens (vs 8,700 for manual process)

**Savings**: ~5,700 tokens per session + guaranteed reliability

---

## Success Metrics

This skill is working correctly when:
- ✅ Every session starts with specific task proposal (not generic)
- ✅ No tasks are ever proposed twice
- ✅ .flow/current.md is always updated at session end
- ✅ Git history shows regular [FLOW] commits
- ✅ User never needs to run `force-update.sh`

---

**Version**: 1.0.0
**Last Updated**: 2025-10-23
**Maintainer**: AIDA Development Team
