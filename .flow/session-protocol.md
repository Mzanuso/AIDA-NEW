# 🔒 SESSION PROTOCOL - OBBLIGATORIO

**⚠️ QUESTO FILE DEVE ESSERE LETTO ALL'INIZIO DI OGNI SESSIONE ⚠️**

**Purpose:** Garantire che ogni sessione inizi e finisca correttamente

---

## 🚀 QUANDO L'UTENTE DICE "inizia sessione"

### STEP 1: LEGGERE I FILE DI CONTESTO (OBBLIGATORIO)

**PRIMA DI QUALSIASI RISPOSTA, LEGGI QUESTI FILE:**

**1. `.flow/current.md` (TUTTO)** - ~500 tokens
- **Status corrente:** COMPLETED? IN_PROGRESS? READY? BLOCKED?
- **Ultimo task completato:** quale era?
- **Prossimi task documentati:** quali sono?
- **Blockers:** ci sono problemi?

**2. `.flow/memory.md` (TUTTO)** - ~300 tokens
- Critical project info
- Architecture ports
- Recent milestones

**3. `FLOW-STATUS.md` (Sezioni specifiche):**
- Lines 1-30: "Current Focus"
- Lines 25-45: "Agent Development Status"
- Lines 59-103: "Recent Completions" (last 2 entries)

**TOTAL START:** ~1,750 tokens ✅

### STEP 2: ANALIZZARE LO STATO (OBBLIGATORIO)

**Dopo aver letto i file, VERIFICA:**

```
✅ Status in .flow/current.md è COMPLETED, IN_PROGRESS, READY, BLOCKED?
✅ Ultimo task documentato: quale era?
✅ Il task è già stato completato? (non riproporre task fatti!)
✅ Prossimi task: quali sono secondo .flow/current.md?
✅ Blockers: ci sono problemi documentati?
```

### STEP 3: PROPORRE AZIONE ALL'UTENTE

**Mostrare all'utente:**

```markdown
🚀 Nuova Sessione Iniziata

📊 Stato Progetto:
- Ultima sessione: [data e descrizione]
- Task completato: [nome task se COMPLETED]
- Status corrente: [COMPLETED/IN_PROGRESS/etc]

📋 Prossimi Task Prioritari:
1. [Task 1 da .flow/current.md] - [PRIORITY]
2. [Task 2 da .flow/current.md] - [PRIORITY]

🎯 Cosa vuoi fare?
1. [Continuare con task consigliato]
2. [Altro task dalla lista]
3. [Specificare task diverso]
```

### ❌ NON FARE MAI:

- ❌ **Proporre task già completati** (verificare status in current.md)
- ❌ **Proporre milestone vecchie** (es. MS-021 se già completata)
- ❌ **Iniziare senza leggere .flow/current.md**
- ❌ **Assumere che l'utente voglia task X senza verificare**

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

## 📝 QUANDO L'UTENTE DICE "fine sessione"

### ⚠️ IMPORTANTE: PRIMA DI DARE IL RIEPILOGO, AGGIORNA I FILE! ⚠️

### STEP 1: AGGIORNARE .flow/current.md (OBBLIGATORIO)

**SEMPRE aggiornare questo file PRIMA di rispondere all'utente!**

**Template da usare:**

```markdown
# Current Micro-Sprint

**Status:** 🟢 COMPLETED / 🟡 IN_PROGRESS / 🔴 BLOCKED - [Nome Task]
**Focus:** [Prossimo task da fare]
**Priority:** HIGH / MEDIUM / LOW
**Started:** [Data inizio]
**Completed:** [Data fine, solo se COMPLETED]
**Last Updated:** [Data e ora corrente]

---

## 🎯 Completed Objectives (se status = COMPLETED)

✅ **[Nome task completato]**
- [Dettaglio 1]
- [Dettaglio 2]
- [Files modificati]

✅ **Verification:** [Cosa è stato verificato]

✅ **Commits:**
- [hash]: [messaggio]
- [hash]: [messaggio]

---

## 📊 Current Project Status

**Microservices:**
- ✅ Style Selector (port 3002) - 100%
- ✅ Orchestrator (port 3003) - [%]
- ✅ Technical Planner (port 3004) - 100%
- ✅ Visual Creator (port 3005) - 100%

**Tests:** [numero] total
- [Status test]

**Database:** [status]

---

## 🚀 Next Priority Tasks

### 1. [Nome Task 1] [HIGH/MEDIUM/LOW PRIORITY]
**File/Path:** [se applicabile]
**Purpose:** [Scopo del task]
**Estimated Time:** [stima]
**Blockers:** [eventuali blocchi]
**Action:** [Prima azione da fare]

### 2. [Task 2]...

---

## 📝 Recent Changes Summary

**Session [Data] ([Ora inizio] - [Ora fine]):**

**Completed:**
1. [Cosa fatto specifico]
2. [Cosa fatto specifico]

**Git Commits:**
- [hash]: [messaggio]

---

## 🎯 Recommended Next Action

[Comando o descrizione dettagliata della prossima azione]

---

## 💡 Notes for Next Session

- [Note importante 1]
- [Decisione presa]
- [Cosa ricordare]

---

**Last Updated:** [Data e ora]
**Updated By:** Claude (Session End - [Nome Task])
```

### STEP 2: COMMIT E PUSH (OBBLIGATORIO)

```bash
git add .flow/current.md
git commit -m "[FLOW] Update current.md - [Task] [STATUS]

[Breve descrizione di cosa fatto]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main --no-verify
```

### STEP 3: DARE RIEPILOGO ALL'UTENTE

**SOLO DOPO aver aggiornato e pushato, dai il riepilogo:**

```markdown
✅ Sessione Completata

## 🎯 Task Completato
[Nome task]

## 📊 Stato Finale
- TypeScript: [stato]
- Services: [stato]
- Tests: [stato]

## 🚀 Prossimi Passi
1. [Task 1]
2. [Task 2]

## 💾 Repository Aggiornato
- Commit: [hash]
- Branch: main
- Status: Pushed to GitHub

**Sessione chiusa con successo!**
```

### ❌ NON FARE MAI:

- ❌ **Dare riepilogo PRIMA di aggiornare .flow/current.md**
- ❌ **Lasciare status obsoleto** (es. "READY" quando è "COMPLETED")
- ❌ **Dimenticare di committare e pushare**
- ❌ **Non documentare i prossimi task**

---

## 📝 UPDATE OPTIONAL FILES

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

## ⚠️ REMINDER PER CLAUDE

**SE STAI LEGGENDO QUESTO:**

1. **All'inizio sessione** ("inizia sessione"):
   → PRIMA COSA: leggi .flow/current.md
   → SECONDA COSA: analizza lo status
   → TERZA COSA: proponi task giusto (NON obsoleto!)

2. **Alla fine sessione** ("fine sessione"):
   → PRIMA COSA: aggiorna .flow/current.md
   → SECONDA COSA: commit + push
   → TERZA COSA: riepilogo all'utente

**Non fidarti della memoria: leggi sempre i file!**

---

## 📋 Checklist Veloce

**Inizio Sessione:**
- [ ] Letto .flow/session-protocol.md
- [ ] Letto .flow/current.md
- [ ] Analizzato status (COMPLETED/IN_PROGRESS/etc)
- [ ] Verificato che task proposto NON sia già completato
- [ ] Proposto task corretto secondo current.md

**Fine Sessione:**
- [ ] Aggiornato .flow/current.md con status corretto
- [ ] Documentato cosa fatto + prossimi task
- [ ] Commit creato con [FLOW] prefix
- [ ] Push su GitHub eseguito
- [ ] Riepilogo dato all'utente

---

## 🛡️ Piano B per l'Utente

**SE Claude dimentica di aggiornare alla fine sessione:**

```bash
bash .flow/force-update.sh
```

Lo script guida l'aggiornamento manuale di .flow/current.md

**Vedi anche:** `.flow/CHECKLIST.md` per checklist dettagliata

---

**Last Updated:** 2025-10-21
**Version:** 2.0 (Protocollo completo inizio/fine sessione)
**Token Savings:** ~90% vs reading all files
**Context Loss Risk:** LOW (all info still available)
