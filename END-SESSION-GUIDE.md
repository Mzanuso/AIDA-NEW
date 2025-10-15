# Fine Sessione - Guida Rapida

## 🎯 Cosa Fare alla Fine di Ogni Chat

Quando i token stanno per finire o la sessione è completa:

### Opzione 1: Script Automatico (Raccomandato)

```bash
node end-session.js "Breve summary di cosa fatto"
```

Esempio:
```bash
node end-session.js "Completato freeze codice e setup automazione"
```

**Cosa fa lo script:**
- ✅ Aggiorna SESSION-HANDOFF.md con summary
- ✅ Svuota .flow/current.md
- ✅ Commit automatico su git
- ✅ Timestamp automatico

---

### Opzione 2: Manuale (se script non funziona)

1. **Aggiorna SESSION-HANDOFF.md:**
   - Data di oggi
   - Summary di cosa fatto
   - Next steps

2. **Svuota .flow/current.md** (se task completo)

3. **Commit:**
   ```bash
   git add SESSION-HANDOFF.md .flow/current.md
   git commit -m "[SESSION] Descrizione"
   ```

---

## 📋 Checklist Fine Sessione

- [ ] Script eseguito (o aggiornamento manuale)
- [ ] SESSION-HANDOFF.md aggiornato con next steps chiari
- [ ] FLOW-STATUS.md aggiornato (se percentuali cambiate)
- [ ] Git commit fatto
- [ ] Claude Code ha terminato eventuali task in background

---

## 🚀 Inizio Prossima Sessione

Scrivi semplicemente:
```
Continua AIDA
```

Claude caricherà automaticamente tutto il contesto.

---

**Nota:** Se lo script `end-session.js` non funziona, usa l'Opzione 2 manuale.
