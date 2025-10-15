#!/usr/bin/env node

/**
 * AIDA - Fine Sessione Automatica
 * 
 * Script per chiudere sessioni con aggiornamento automatico di:
 * - SESSION-HANDOFF.md
 * - .flow/current.md
 * - Git commit + push
 * - Notion database (via Claude MCP)
 * 
 * Usage:
 *   node end-session.js "Summary di cosa fatto"
 * 
 * Flags:
 *   --no-push    Skip git push
 *   --no-notion  Skip Notion update
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
const noPush = process.argv.includes('--no-push');
const noNotion = process.argv.includes('--no-notion');

// Get current date
const now = new Date();
const dateStr = now.toISOString().split('T')[0];
const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔄 AIDA - Fine Sessione Automatica');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const checklist = {
  handoff: false,
  currentTask: false,
  git: false,
  push: false,
  notion: false
};

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
checklist.handoff = true;
console.log('✅ SESSION-HANDOFF.md aggiornato\n');

// 2. Clear current task
console.log('📝 Svuoto .flow/current.md...');
const emptyTask = `# Current Micro-Sprint

**Status:** Nessun task attivo
**Last Update:** ${dateStr}

---

Questo file viene popolato all'inizio di ogni micro-sprint.
`;

fs.writeFileSync(CURRENT_TASK, emptyTask, 'utf8');
checklist.currentTask = true;
console.log('✅ .flow/current.md svuotato\n');

// 3. Git commit
console.log('📦 Git commit...');
try {
  execSync('git add SESSION-HANDOFF.md .flow/current.md FLOW-STATUS.md', { stdio: 'pipe' });
  execSync(`git commit -m "[AUTO] End session: ${summary}"`, { stdio: 'pipe' });
  checklist.git = true;
  console.log('✅ Git commit creato\n');
  
  // 4. Git push
  if (!noPush) {
    console.log('🚀 Git push...');
    try {
      execSync('git push', { stdio: 'pipe' });
      checklist.push = true;
      console.log('✅ Git push completato\n');
    } catch (pushErr) {
      console.log('⚠️  Git push fallito (normale se remote non configurato)\n');
    }
  } else {
    console.log('⏭️  Git push skippato (--no-push flag)\n');
  }
  
} catch (err) {
  console.log('⚠️  Nessuna modifica da committare\n');
}

// 5. Notion update
if (!noNotion) {
  console.log('📊 Notion update...');
  console.log('   ⚠️  Usa Claude nella prossima chat per aggiornare Notion');
  console.log('   Prompt: "Aggiungi sessione a Notion con summary: ' + summary + '"');
  checklist.notion = false;
  console.log('');
} else {
  console.log('⏭️  Notion update skippato (--no-notion flag)\n');
}

// Final summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ FINE SESSIONE COMPLETATA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Checklist:');
console.log(`  ${checklist.handoff ? '✅' : '❌'} SESSION-HANDOFF.md`);
console.log(`  ${checklist.currentTask ? '✅' : '❌'} .flow/current.md`);
console.log(`  ${checklist.git ? '✅' : '❌'} Git commit`);
console.log(`  ${checklist.push ? '✅' : '⏭️ '} Git push`);
console.log(`  💬 Notion (update via Claude nella prossima chat)`);
console.log('');

console.log('🚀 Prossima sessione:');
console.log('  1. Scrivi: "Continua AIDA"');
console.log('  2. Claude aggiornerà Notion automaticamente\n');

const success = checklist.handoff && checklist.currentTask && checklist.git;
process.exit(success ? 0 : 1);
