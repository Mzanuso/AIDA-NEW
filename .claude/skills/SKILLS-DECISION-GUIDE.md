# Skills Decision Guide

## 🎯 Purpose

This guide helps you decide **when to create a new Claude Skill** for the AIDA project.

**Key Principle:** Create skills based on **real pain**, not anticipation.

---

## 📊 The Signal System

During each session, Claude Code will track file reads and searches, signaling with emojis:

### 🟢 GREEN (1st occurrence)
**Status:** Normal discovery
**Action:** None
**Example:** "Reading docs/AIDA-ARCHITECTURE-FINAL.md to understand agent ports..."

### 🟡 YELLOW (2nd occurrence)
**Status:** Pattern emerging
**Action:** Monitor
**Example:** "🟡 2nd read of architecture docs (AIDA-ARCHITECTURE-FINAL.md)"

### 🔴 RED (3rd occurrence)
**Status:** Skill recommended
**Action:** **Decide now** whether to create skill
**Example:** "🔴 3rd read of architecture docs - aida-agent-coordinator skill would save time. Create now?"

### ⏱️ TIME (> 10 minutes on same topic)
**Status:** Time threshold exceeded
**Action:** Skill recommended even if only 2 reads
**Example:** "⏱️ Spent 10+ minutes on visual prompting - aida-visual-prompting skill recommended. Create?"

---

## 🚦 Decision Framework

### When to CREATE skill immediately:

✅ **3+ reads** of same file/topic in single session
✅ **> 10 minutes** spent searching same information
✅ **Same problem** in 2+ different sessions
✅ **Risk of errors** (security, API keys, critical patterns)
✅ **High-value pattern** used frequently (> 1x per session)

### When to WAIT before creating skill:

⏸️ **Only 2 reads** and under 10 minutes
⏸️ **First session** encountering the topic
⏸️ **Information changes frequently** (not stable pattern)
⏸️ **Low frequency** (might not use again for weeks)
⏸️ **Already documented** well in single accessible file

### When to NEVER create skill:

❌ **One-time information** need
❌ **Duplicates existing documentation** without adding value
❌ **Anticipation** (no actual pain yet)
❌ **Topic not related** to AIDA development
❌ **Over-engineering** (simpler solution exists)

---

## 📚 Potential Skills Library

### 🔴 HIGH PRIORITY (Create when pattern emerges)

**aida-visual-prompting**
- **Triggers:** Visual prompt engineering patterns, model-specific optimizations
- **Value:** Critical for MS-027 (Writer → Visual Creator)
- **Create when:** 3 reads of visual prompting code OR 10 min spent on prompt patterns

**aida-agent-coordinator**
- **Triggers:** Architecture docs, agent ports, coordination patterns
- **Value:** High for multi-agent integration tasks
- **Create when:** 3 reads of AIDA-ARCHITECTURE-FINAL.md OR 10 min on coordination

### 🟡 MEDIUM PRIORITY (Monitor, create if needed)

**aida-microservice-api**
- **Triggers:** Creating new agent, API structure patterns
- **Value:** Medium (useful when creating Director/Video Composer/Audio agents)
- **Create when:** Starting work on new microservice agent

**client-brand-guidelines**
- **Triggers:** Brand consistency checks, client onboarding
- **Value:** High commercial value (future)
- **Create when:** First real client delivery approaching

### 🟢 LOW PRIORITY (Create only if becomes bottleneck)

**aida-database-schema**
- **Triggers:** PostgreSQL queries, Drizzle ORM patterns, migrations
- **Value:** Low (database is stable, not frequently modified)
- **Create when:** 3+ database tasks in short period

---

## 🎬 Real-World Scenarios

### Scenario 1: MS-027 (Writer → Visual Creator Integration)

**Expected Patterns:**
- Reading Visual Creator prompting code
- Searching for model-specific parameters
- Looking up FAL.AI model capabilities

**Claude Signals:**
```
Session start: Reading visual-creator-executor.ts... (no signal)
15 min later: 🟡 2nd read of visual prompting patterns
30 min later: 🔴 3rd read - aida-visual-prompting skill would save time. Create now?
```

**Your Decision:**
- ✅ **YES, create** if you see 🔴 signal
- Why: MS-027 is multi-session task, pattern will repeat
- Expected benefit: 10-15 min saved per session

### Scenario 2: Testing Writer Agent

**Expected Patterns:**
- Running Writer service once
- Generating test scripts
- Verifying visual descriptions

**Claude Signals:**
```
(No repeated file reads expected - single test session)
```

**Your Decision:**
- ❌ **NO, don't create** skill
- Why: Testing is one-time activity, no repeated patterns
- No skill needed

### Scenario 3: Creating Director Agent (Future)

**Expected Patterns:**
- Reading existing agent structure (Style Selector, Writer)
- Copying API patterns
- Setting up health checks

**Claude Signals:**
```
Session: Reading style-selector routes... (1st)
Later: 🟡 2nd read of microservice API patterns (writer routes)
Later: 🔴 3rd read - aida-microservice-api skill would save time. Create now?
```

**Your Decision:**
- ✅ **YES, create** if pattern repeats in 2+ agent creations
- Why: Will create 3 more agents (Director, Video Composer, Audio)
- Expected benefit: 15-20 min saved per new agent

---

## 📝 How to Respond to Signals

### When you see 🟡 YELLOW:
**Your response:** Monitor, no action yet
- Pattern is emerging but not critical
- Wait to see if 3rd occurrence happens
- Decision: Continue working normally

### When you see 🔴 RED:
**Your response:** Decide immediately

**Option A: Create skill NOW** (during session)
```
User: "sì, crea skill [nome]"
Claude: [Creates skill immediately, continues work with skill active]
```

**Option B: Create skill LATER** (end of session)
```
User: "crea alla fine della sessione"
Claude: [Notes to create skill during "fine sessione"]
```

**Option C: Don't create skill**
```
User: "no, continua senza skill"
Claude: [Continues without skill, pattern noted for future]
```

### When you see ⏱️ TIME:
**Your response:** Strongly consider creating skill
- Time is more valuable than read count
- 10+ minutes is significant waste
- Usually worth creating skill

---

## 🔄 Review and Maintenance

### Weekly Review (Every ~5 sessions)

Check `.flow/skills-metrics.md` for patterns:
- Any topics hitting 🟡 or 🔴 frequently?
- Any skills used every session?
- Any skills never used?

**Actions:**
- Create skills for frequently-flagged topics
- Keep valuable skills
- Delete unused skills (after 10+ sessions without activation)

### Monthly Review

**Skills Health Check:**
- [ ] Are existing skills still useful?
- [ ] Any new patterns emerging across multiple weeks?
- [ ] Any skills need updates (new best practices)?

---

## ✅ Quick Decision Checklist

When Claude signals 🔴 RED, ask yourself:

**Create Skill if:**
- [ ] This pattern will repeat in future sessions
- [ ] Task is multi-session or recurring
- [ ] Time savings > 5 min per session
- [ ] Pattern is stable (won't change soon)
- [ ] High value or error-prone topic

**Don't Create Skill if:**
- [ ] One-time task
- [ ] Pattern unlikely to repeat
- [ ] Time savings < 5 min per session
- [ ] Information changes frequently
- [ ] Already documented well elsewhere

**When in doubt:** Create the skill. Worst case: 30 min invested, skill unused. Best case: Hours saved over project lifetime.

---

## 📈 Expected Skills Timeline

Based on AIDA roadmap:

**Already Created (Session 2025-10-23):**
- ✅ aida-session-manager
- ✅ aida-flow-tdd
- ✅ fal-ai-integration

**Likely to Create (Next 2-4 weeks):**
- 🟡 aida-visual-prompting (during MS-027)
- 🟡 aida-agent-coordinator (during MS-027 or MS-028)

**Maybe Create (Next 1-2 months):**
- 🟢 aida-microservice-api (when creating new agents)
- 🟢 client-brand-guidelines (when first client delivery)

**Unlikely to Create:**
- ⚪ aida-database-schema (unless DB work increases)

---

## 🎯 Success Metrics

**Skills system is working well if:**
- ✅ Sessions start faster (< 2 min to propose task)
- ✅ Less time searching for information
- ✅ Consistent code quality (TDD, API patterns)
- ✅ 🔴 signals decreasing over time (patterns captured in skills)
- ✅ New skills created based on real pain, not anticipation

**Adjust system if:**
- ❌ Creating skills that never activate
- ❌ Missing obvious patterns (no 🔴 signal when should)
- ❌ Too many signals (threshold too low)
- ❌ Skills overhead > time saved

---

**Last Updated:** 2025-10-23
**Version:** 1.0.0
**Next Review:** After MS-027 completion
