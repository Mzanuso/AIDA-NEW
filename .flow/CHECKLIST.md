# ✅ CHECKLIST SESSIONE - Per l'Utente

**Tieni questo file aperto durante le sessioni per controllare che Claude segua il protocollo**

---

## 🚀 INIZIO SESSIONE

Quando dici **"inizia sessione"**, verifica che Claude:

- [ ] **Legge `.flow/current.md`** (lo vedi nei file aperti o nelle sue risposte)
- [ ] **Mostra lo status corretto** (COMPLETED/IN_PROGRESS/READY)
- [ ] **Elenca i task completati nella sessione precedente**
- [ ] **Propone il prossimo task documentato** (non task vecchi/già fatti)
- [ ] **Non propone milestone già completate** (es. MS-021 se già fatto)

### ❌ Se Claude propone task sbagliati o vecchi:

**Tu dici:**
```
Il task giusto è: [nome task da .flow/current.md]
Leggi .flow/current.md per verificare
```

**Oppure esegui il fix manuale:**
```bash
bash .flow/force-update.sh
```

---

## 📝 FINE SESSIONE

Quando dici **"fine sessione"**, verifica che Claude:

- [ ] **Aggiorna `.flow/current.md`** prima di dare il riepilogo
- [ ] **Cambia lo status** (da READY → COMPLETED, se task finito)
- [ ] **Documenta cosa è stato fatto** (task completati, commit, file modificati)
- [ ] **Documenta i prossimi task** (cosa fare nella prossima sessione)
- [ ] **Crea commit** con messaggio `[FLOW] Update current.md - ...`
- [ ] **Push su GitHub** (verifica con `git log --oneline -3`)

### ❌ Se Claude NON aggiorna .flow/current.md:

**Tu dici:**
```
Aggiorna .flow/current.md con status COMPLETED prima di chiudere
```

**E aspetti che lo faccia, POI puoi chiudere**

---

## 🔍 VERIFICA RAPIDA

### Prima di chiudere VSCode, controlla:

```bash
# 1. Verifica che .flow/current.md sia aggiornato
cat .flow/current.md | head -10

# Dovresti vedere:
# Status: 🟢 COMPLETED (se task finito)
# Completed: [data di oggi]
```

```bash
# 2. Verifica che ci sia un commit recente
git log --oneline -3

# Dovresti vedere:
# [hash] [FLOW] Update current.md - [Task completato]
```

```bash
# 3. Verifica che sia stato pushato
git status

# Dovresti vedere:
# Your branch is up to date with 'origin/main'
```

---

## 🛠️ SCRIPT DI EMERGENZA

### Se Claude ha dimenticato di aggiornare:

**Opzione A - Chiedi a Claude:**
```
Aggiorna .flow/current.md con:
- Status: COMPLETED
- Task completati: [lista]
- Prossimi task: [lista]
Poi commit e push
```

**Opzione B - Script automatico:**
```bash
bash .flow/force-update.sh
```

Lo script:
1. Mostra l'ultimo stato
2. Chiede a Claude di aggiornare
3. Verifica che sia fatto
4. Commit + Push automatico

---

## 📊 MONITORING

### Ogni 2-3 sessioni, verifica che il sistema funzioni:

```bash
# Controlla gli ultimi 10 commit
git log --oneline -10 | grep FLOW

# Dovresti vedere commit [FLOW] regolari
```

### Se vedi che Claude dimentica spesso:

1. **Esegui sempre lo script di emergenza** alla fine
2. **Considera di passare all'Opzione C** (script obbligatorio)
3. **Aprimi una issue su GitHub** per segnalare il problema

---

## 💡 TIPS

### Per ridurre il rischio di dimenticanze:

✅ **Tieni sempre aperto questo file** durante le sessioni
✅ **Controlla .flow/current.md** prima di chiudere
✅ **Esegui il comando di verifica** (vedi sopra)
✅ **Se hai dubbi, esegui il force-update.sh**

### Segnali che qualcosa non va:

🔴 Alla nuova sessione, Claude propone task già fatti
🔴 .flow/current.md dice "READY" ma il task è finito
🔴 Nessun commit [FLOW] negli ultimi giorni
🔴 git status mostra "ahead of origin" (non pushato)

---

## 🎯 OBIETTIVO

**Il sistema è affidabile quando:**
- ✅ Ogni sessione inizia dal punto giusto
- ✅ .flow/current.md è sempre aggiornato
- ✅ Nessun task viene riproposto se già completato
- ✅ Il commit history mostra aggiornamenti regolari

**Se questo non succede per 2+ sessioni consecutive:**
→ Il sistema va riprogettato
→ Meglio passare a script obbligatori (Opzione C)

---

**Usa questa checklist ogni volta che lavori con Claude!** ✅
