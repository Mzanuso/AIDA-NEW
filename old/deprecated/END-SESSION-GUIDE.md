# Fine Sessione - Guida Completa

## 🎯 Cosa Fare alla Fine di Ogni Chat

Quando i token stanno per finire o la sessione è completa:

### Script Automatico (Raccomandato)

```bash
node end-session.js "Breve summary di cosa fatto"
```

**Esempio:**
```bash
node end-session.js "Completato Writer Agent + 15 test"
```

---

## ✅ Checklist Automatica

Lo script verifica e mostra:

```
📋 Checklist:
  ✅ SESSION-HANDOFF.md
  ✅ .flow/current.md
  ✅ Git commit
  ✅ Git push
  ⏭️  Notion update (not configured)
```

---

## 📊 Notion Integration (Opzionale)

### Setup Notion (Prima Volta)

1. **Crea Integration:**
   - Vai su https://www.notion.so/my-integrations
   - Click "New integration"
   - Nome: "AIDA Session Tracker"
   - Copia "Internal Integration Token"

2. **Crea Database:**
   - Apri Notion workspace
   - Crea database "AIDA Sessions"
   - Columns: Date, Summary, Tasks Completed, Next Steps, Agent Progress

3. **Condividi Database:**
   - Click "..." sul database
   - "Add connections" → Seleziona "AIDA Session Tracker"

4. **Configura:**
   ```bash
   cd D:\AIDA-NEW\architecture
   cp notion-config.json.example notion-config.json
   ```
   
   Edita `notion-config.json`:
   ```json
   {
     "apiKey": "secret_XXX...",
     "databaseId": "abc123...",
     "enabled": true
   }
   ```

5. **Installa SDK:**
   ```bash
   npm install @notionhq/client
   ```

### Come Verificare Notion Funziona

Dopo `end-session.js` vedi:
```
📊 Aggiorno Notion database...
✅ Notion aggiornato
```

Se NON configurato:
```
⏭️  Notion non configurato (crea architecture/notion-config.json)
```

---

## 🚨 Come Capire Se Qualcosa Non Funziona

### Scenario 1: Notion Non Aggiorna

**Sintomo:**
```
⏭️  Notion update (not configured)
```

**Soluzione:**
1. Verifica esiste `architecture/notion-config.json`
2. Verifica `enabled: true` nel file
3. Verifica `apiKey` e `databaseId` corretti
4. Verifica installato `@notionhq/client`

### Scenario 2: Git Push Fallisce

**Sintomo:**
```
⚠️  Git push fallito (normale se remote non configurato)
```

**Soluzione:**
```bash
git remote add origin https://github.com/USER/AIDA-NEW.git
git push -u origin master
```

### Scenario 3: Nessuna Modifica da Committare

**Sintomo:**
```
⚠️  Nessuna modifica da committare
```

**Causa:** SESSION-HANDOFF.md già aggiornato in precedenza.  
**Azione:** Normale, nessun problema.

---

## 🔧 Opzioni Avanzate

### Skip Git Push
```bash
node end-session.js "Summary" --no-push
```

### Skip Notion Update
```bash
node end-session.js "Summary" --no-notion
```

### Skip Entrambi
```bash
node end-session.js "Summary" --no-push --no-notion
```

---

## 📝 Manuale (Se Script Non Funziona)

1. **Aggiorna SESSION-HANDOFF.md:**
   - Data + ora + summary
   - Next steps

2. **Svuota .flow/current.md** (se task completo)

3. **Git commit + push:**
   ```bash
   git add SESSION-HANDOFF.md .flow/current.md FLOW-STATUS.md
   git commit -m "[SESSION] Summary"
   git push
   ```

4. **Notion (se configurato):**
   - Apri Notion database manualmente
   - Aggiungi nuova riga con info sessione

---

## ✅ Verifica Finale

Dopo `end-session.js` dovresti vedere:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FINE SESSIONE COMPLETATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Checklist:
  ✅ SESSION-HANDOFF.md
  ✅ .flow/current.md
  ✅ Git commit
  ✅ Git push
  ✅ Notion update

🚀 Prossima sessione:
  Scrivi: "Continua AIDA"
```

Se vedi ✅ su tutto → **PERFETTO!**

Se vedi ⚠️ o ⏭️ → Leggi messaggi di errore sopra.

---

## 🚀 Inizio Prossima Sessione

Scrivi semplicemente:
```
Continua AIDA
```

Claude caricherà automaticamente tutto il contesto + Notion data (se configurato).

---

**Aggiornato:** 2025-10-14  
**Versione:** 2.0 (con Notion support)
