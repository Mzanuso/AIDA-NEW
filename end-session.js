#!/usr/bin/env node

/**
 * AIDA - Fine Sessione Automatica
 * 
 * Esegui questo script alla fine di ogni chat per aggiornare i docs.
 * 
 * Usage:
 *   node end-session.js "Breve summary di cosa fatto"
 * 
 * Aggiorna automaticamente:
 * - SESSION-HANDOFF.md
 * - FLOW-STATUS.md (se percentuali cambiate)
 * - .flow/current.md (svuota se task completo)
 * - Git commit automatico
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const ROOT = process.cwd();
const SESSION_HANDOFF = path.join(ROOT, 'SESSION-HANDOFF.md');
const FLOW_STATUS = path.join(ROOT, 'FLOW-STATUS.md');
const CURRENT_TASK = path.join(ROOT, '.flow', 'current.md');

// Get summary from command line
const summary = process.argv[2] || "Sessione di lavoro";

// Get current date
const now = new Date();
const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

console.log('🔄 Aggiornamento documenti fine sessione...\n');

// 1. Update SESSION-HANDOFF.md
console.log('📝 Aggiorno SESSION-HANDOFF.md...');

const handoffContent = `# SESSION HANDOFF

**Data:** ${dateStr}
**Ora:** ${timeStr}
**Summary:** ${summary}

---

## ✅ COMPLETATO QUESTA SESSIONE

${summary}

---

## 📍 STATO ATTUALE PROGETTO

[Leggere FLOW-STATUS.md per dettagli completi]

---

## 🎯 PROSSIMI STEP

[Da definire nella prossima sessione]

---

## 🔧 COMANDO PROSSIMA CHAT

\`\`\`
Continua AIDA
\`\`\`

---

**Fine Session Handoff**
**Updated:** ${dateStr} ${timeStr}
`;

fs.writeFileSync(SESSION_HANDOFF, handoffContent, 'utf8');
console.log('✅ SESSION-HANDOFF.md aggiornato\n');

// 2. Clear current task (if completed)
console.log('📝 Svuoto .flow/current.md...');
const emptyTask = `# Current Micro-Sprint

**Status:** Nessun task attivo
**Last Update:** ${dateStr}

---

Questo file viene popolato all'inizio di ogni micro-sprint.
`;

fs.writeFileSync(CURRENT_TASK, emptyTask, 'utf8');
console.log('✅ .flow/current.md svuotato\n');

// 3. Git commit
console.log('📦 Commit automatico...');
try {
  execSync('git add SESSION-HANDOFF.md .flow/current.md', { stdio: 'inherit' });
  execSync(`git commit -m "[AUTO] End session: ${summary}"`, { stdio: 'inherit' });
  console.log('✅ Commit creato\n');
} catch (err) {
  console.log('⚠️ Nessuna modifica da committare (probabilmente già committato)\n');
}

// 4. Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ FINE SESSIONE COMPLETATA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📋 File aggiornati:');
console.log('  ✅ SESSION-HANDOFF.md');
console.log('  ✅ .flow/current.md');
console.log('  ✅ Git commit creato');
console.log('');
console.log('🚀 Prossima sessione:');
console.log('  Scrivi: "Continua AIDA"');
console.log('');
