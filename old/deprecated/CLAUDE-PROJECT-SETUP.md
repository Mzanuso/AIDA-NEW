# AIDA - Custom Instructions per Claude Project

## Sistema Overview
AIDA è una piattaforma AI per creazione contenuti multimediali. Usa metodologia AIDA-FLOW: test-first, micro-sprint, zero errori.

## Protocollo Ogni Nuova Chat

**OBBLIGATORIO - Leggi questi file in ordine:**
1. `START-HERE.md` - Protocollo sessione
2. `PROJECT-INSTRUCTIONS.md` - Metodologia completa
3. `FLOW-STATUS.md` - Stato progetto (30 righe)
4. `SESSION-HANDOFF.md` - Ultima sessione
5. `.flow/current.md` - Task attivo
6. `architecture/0-INDEX.md` - Architettura (se esiste)

**Poi rispondi:**
```
Caricato contesto AIDA.
Ultima sessione: [summary]
Stato: [percentuali agenti]

Opzioni:
A) Continua task: [nome]
B) Nuovo task
C) Aggiorna architettura

Cosa vuoi fare?
```

## Regole Core (MAI Violare)

### Context Management
- NEVER load files > 100 righe completely
- ALWAYS usa MCP view ranges
- NEVER assumere user ricorda contesto

### Development
- NEVER write code senza test first
- NEVER commit > 100 righe
- NEVER procedi se test fallisce
- ALWAYS micro-sprint (20 min max)
- ALWAYS verifica test green prima di procedere

### Communication
- Conciso ma esaustivo
- Mostra cosa stai per fare
- NEVER procedi senza approvazione
- NEVER domande generiche

## Tech Stack
- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Drizzle ORM
- AI: Claude Sonnet 4.5, FAL.AI, KIE.AI
- Ports: 3003 (Orchestrator), 3002 (Style Selector)

## Agenti Status
- Orchestrator: 100% ✅
- Style Selector: 95% ✅
- Writer: 40% (da completare)
- Director: 40% (da completare)
- Visual Creator: 0%
- Video Composer: 0%

## Fine Sessione

**Prima di chiudere chat (o quando token finiscono):**
```bash
node end-session.js "Summary di cosa fatto"
```

Oppure chiedi a Claude Code di eseguirlo.

**Aggiorna:**
- SESSION-HANDOFF.md (cosa fatto + next step)
- FLOW-STATUS.md (se percentuali cambiate)
- Git commit automatico

## Location
Progetto: `D:\AIDA-NEW\`

## Key Principles
1. Test First - No code senza test
2. Small Steps - Max 100 righe per commit
3. Verify Always - Green tests o stop
4. Document Progress - Update logs sempre
5. Stay Focused - Un task alla volta

**Se confuso → task troppo grande, splitta.**
