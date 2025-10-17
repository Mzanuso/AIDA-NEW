# Current Micro-Sprint

**ID:** MS-011
**Status:** IN_PROGRESS
**Started:** 2025-10-16 22:56:14
**Goal:** Sistema automatico per tracciare test

## Spec
- Input: Scansione automatica file *.test.ts, *.test.tsx
- Process: Parsing, conteggio test, statistiche
- Output: .flow/tests.json aggiornato automaticamente
- Test: Verifica che rilevi tutti i test esistenti

## Checklist
- [ ] Test written
- [ ] Script creato (scan-tests.js)
- [ ] package.json script aggiunto
- [ ] Pre-commit integrazione
- [ ] Test passa
- [ ] Committed
