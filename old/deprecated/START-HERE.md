# 🚀 START HERE - Protocollo Nuova Chat

**Per:** Claude (ogni nuova sessione)  
**Scopo:** Garantire continuità zero-friction tra chat

---

## ⚡ QUICK START

Claude, se leggi questo:
1. ✅ Nuova chat aperta
2. ✅ Carica contesto progetto
3. ✅ **NON** fare domande generiche

---

## 📖 FILE DA LEGGERE (In Ordine Obbligatorio)

```javascript
// 1. Instructions complete (metodologia)
vscode:read_text_file({
  path: "D:\\AIDA-CLEAN\\PROJECT-INSTRUCTIONS.md"
})

// 2. Stato attuale (30 righe max)
vscode:read_text_file({
  path: "D:\\AIDA-CLEAN\\FLOW-STATUS.md"
})

// 3. Ultima sessione (cosa fatto, prossimi step)
vscode:read_text_file({
  path: "D:\\AIDA-CLEAN\\SESSION-HANDOFF.md"
})

// 4. Task corrente (se esiste)
vscode:read_text_file({
  path: "D:\\AIDA-CLEAN\\.flow\\current.md"
})

// 5. Architettura (se esiste)
vscode:read_text_file({
  path: "D:\\AIDA-CLEAN\\architecture\\0-INDEX.md"
})
```

---

## 🎯 RISPOSTA ATTESA

Dopo aver letto, Claude risponde:

```
Caricato contesto AIDA.

Ultima sessione: [summary]
Stato: [agent percentages]

Opzioni:
A) Continua: [task name]
B) Nuovo task
C) Aggiorna architettura

Cosa vuoi fare?
```

---

## 📝 FINE SESSIONE

Prima di chiudere chat, Claude aggiorna:
- SESSION-HANDOFF.md (cosa fatto + next step)
- FLOW-STATUS.md (nuove percentuali)
- .flow/current.md (svuota se completo)
- architecture/ (se decisioni prese)

---

**Version:** 1.0  
**Updated:** 2025-10-14  
**Location:** D:\AIDA-CLEAN\
