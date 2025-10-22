#!/bin/bash

# ============================================================================
# .flow/force-update.sh - Script di emergenza per aggiornare current.md
# ============================================================================
#
# Usa questo script SE Claude dimentica di aggiornare .flow/current.md
# alla fine della sessione
#
# Uso: bash .flow/force-update.sh
# ============================================================================

echo "🔧 FORCE UPDATE - Sistema .flow/"
echo "================================="
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# STEP 1: Verifica stato corrente
# ============================================================================

echo "📊 Verifico stato corrente..."
echo ""

# Mostra prime 10 righe di current.md
echo "📄 Contenuto attuale di .flow/current.md:"
echo "─────────────────────────────────────────"
head -10 .flow/current.md
echo "─────────────────────────────────────────"
echo ""

# Chiedi all'utente se il file è aggiornato
read -p "❓ Il file sopra riflette il lavoro completato oggi? (s/n): " risposta

if [ "$risposta" = "s" ] || [ "$risposta" = "S" ]; then
    echo ""
    echo -e "${GREEN}✅ Il file è già aggiornato!${NC}"
    echo "Verifico se è stato committato..."

    # Verifica se c'è un commit recente
    ultimo_commit=$(git log -1 --oneline .flow/current.md)
    echo ""
    echo "Ultimo commit su current.md:"
    echo "$ultimo_commit"
    echo ""

    # Verifica se ci sono modifiche non committate
    if git diff --quiet .flow/current.md; then
        echo -e "${GREEN}✅ Tutto OK! File aggiornato e committato.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  File modificato ma non committato!${NC}"
        read -p "Vuoi committare ora? (s/n): " commit_now

        if [ "$commit_now" = "s" ] || [ "$commit_now" = "S" ]; then
            read -p "Inserisci breve descrizione del task completato: " task_desc
            git add .flow/current.md
            git commit -m "[FLOW] Update current.md - $task_desc

Manual update via force-update.sh

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
            echo ""
            echo -e "${GREEN}✅ Commit creato!${NC}"

            read -p "Vuoi pushare su GitHub? (s/n): " push_now
            if [ "$push_now" = "s" ] || [ "$push_now" = "S" ]; then
                git push origin main --no-verify
                echo -e "${GREEN}✅ Push completato!${NC}"
            fi
        fi
        exit 0
    fi
fi

# ============================================================================
# STEP 2: Il file NON è aggiornato - chiedi info all'utente
# ============================================================================

echo ""
echo -e "${RED}❌ Il file NON è aggiornato${NC}"
echo ""
echo "Rispondi alle seguenti domande per aggiornare il file:"
echo ""

# Raccolta informazioni
read -p "1️⃣  Qual è il task che hai completato? (es: 'TypeScript errors fix'): " task_name
read -p "2️⃣  Lo status è COMPLETED, IN_PROGRESS o BLOCKED?: " status

# Converte status in emoji
if [ "$status" = "COMPLETED" ] || [ "$status" = "completed" ]; then
    status_emoji="🟢 COMPLETED"
elif [ "$status" = "IN_PROGRESS" ] || [ "$status" = "in_progress" ]; then
    status_emoji="🟡 IN_PROGRESS"
elif [ "$status" = "BLOCKED" ] || [ "$status" = "blocked" ]; then
    status_emoji="🔴 BLOCKED"
else
    status_emoji="🟡 IN_PROGRESS"
fi

read -p "3️⃣  Qual è il prossimo task prioritario? (es: 'Database Migration'): " next_task
read -p "4️⃣  Hai fatto commit? (s/n): " has_commits

commits_list=""
if [ "$has_commits" = "s" ] || [ "$has_commits" = "S" ]; then
    read -p "   Quanti commit? (numero): " num_commits
    commits_list=$(git log --oneline -$num_commits)
fi

# ============================================================================
# STEP 3: Genera template aggiornato
# ============================================================================

echo ""
echo "📝 Genero template aggiornato..."

current_date=$(date +"%Y-%m-%d")
current_time=$(date +"%H:%M")

# Crea backup del file esistente
cp .flow/current.md .flow/current.md.backup

# Genera nuovo contenuto
cat > .flow/current.md <<EOF
# Current Micro-Sprint

**Status:** $status_emoji - $task_name
**Focus:** $next_task
**Priority:** HIGH
**Started:** $current_date
**Last Updated:** $current_date $current_time

---

## 🎯 Recent Work

**Task Completed:** $task_name

**Status:** $status_emoji

$(if [ "$has_commits" = "s" ] || [ "$has_commits" = "S" ]; then
    echo "**Commits:**"
    echo "\`\`\`"
    echo "$commits_list"
    echo "\`\`\`"
fi)

---

## 🚀 Next Priority Tasks

### 1. $next_task [HIGH PRIORITY]
**Action:** Start working on this task in next session

### 2. [To be defined]
**Note:** Define additional tasks as needed

---

## 📝 Notes

File updated manually via force-update.sh script.
Claude did not update this file automatically at session end.

**Manual Update:** $current_date $current_time
**Updated By:** User (via force-update.sh)

---

**IMPORTANTE:** Nella prossima sessione, verifica che Claude legga questo file
e proponga "$next_task" come prossimo task da fare.
EOF

echo -e "${GREEN}✅ File aggiornato!${NC}"
echo ""

# ============================================================================
# STEP 4: Mostra il nuovo contenuto
# ============================================================================

echo "📄 Nuovo contenuto di .flow/current.md:"
echo "─────────────────────────────────────────"
head -20 .flow/current.md
echo "─────────────────────────────────────────"
echo ""

# ============================================================================
# STEP 5: Commit e Push
# ============================================================================

read -p "✅ Il contenuto sopra è corretto? (s/n): " confirm

if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
    echo ""
    echo "💾 Creo commit..."

    git add .flow/current.md
    git commit -m "[FLOW] Manual update - $task_name $status_emoji

Task: $task_name
Status: $status
Next: $next_task

Updated manually via force-update.sh
Claude did not auto-update at session end.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    echo -e "${GREEN}✅ Commit creato!${NC}"
    echo ""

    read -p "🚀 Vuoi pushare su GitHub? (s/n): " push_confirm

    if [ "$push_confirm" = "s" ] || [ "$push_confirm" = "S" ]; then
        git push origin main --no-verify
        echo -e "${GREEN}✅ Push completato!${NC}"
    else
        echo -e "${YELLOW}⚠️  Ricorda di pushare quando sei pronto con: git push origin main${NC}"
    fi

    echo ""
    echo "═══════════════════════════════════════════"
    echo -e "${GREEN}✅ AGGIORNAMENTO COMPLETATO!${NC}"
    echo "═══════════════════════════════════════════"
    echo ""
    echo "📋 Backup del vecchio file salvato in: .flow/current.md.backup"
    echo "🎯 Prossima sessione Claude dovrebbe proporre: $next_task"
    echo ""

else
    echo ""
    echo -e "${RED}❌ Aggiornamento annullato${NC}"
    echo "Ripristino il file originale..."
    mv .flow/current.md.backup .flow/current.md
    echo "File ripristinato. Riprova con informazioni corrette."
fi

echo ""
echo "Script completato."
