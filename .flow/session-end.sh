#!/bin/bash
# Session End Protocol - File Update Checklist
# Version: 1.0
# Purpose: Ensure documentation stays updated and synchronized

echo "=================================="
echo "🏁 AIDA-FLOW SESSION END"
echo "=================================="
echo ""
echo "📝 MANDATORY UPDATES:"
echo ""

# Function to check if file was modified
check_modified() {
    if git diff --quiet HEAD -- "$1" 2>/dev/null; then
        echo "   ⚪ No changes"
    else
        echo "   🟡 Modified (needs review)"
    fi
}

# Always update current.md
echo "1. .flow/current.md (~600 tokens)"
echo "   ├─ Update status (completed/blocked/in_progress)"
echo "   ├─ Update next actions"
echo "   └─ Update blockers if changed"
check_modified ".flow/current.md"
echo ""

# Conditional updates
echo "=================================="
echo "📊 CONDITIONAL UPDATES (if applicable):"
echo ""

echo "2. .flow/memory.md (~400 tokens)"
echo "   Update ONLY IF:"
echo "   ├─ NEW blocker appeared"
echo "   ├─ Major milestone completed"
echo "   └─ Architecture changed"
check_modified ".flow/memory.md"
echo ""

echo "3. FLOW-STATUS.md (~2,000 tokens)"
echo "   Update ONLY IF:"
echo "   ├─ Milestone completed (MS-XXX)"
echo "   ├─ Agent status % changed significantly"
echo "   └─ Add to 'Recent Completions'"
check_modified "FLOW-STATUS.md"
echo ""

echo "4. FLOW-LOG.md (~3,000 tokens)"
echo "   Update ONLY IF:"
echo "   ├─ Session lasted > 60 min"
echo "   ├─ Multiple milestones completed"
echo "   ├─ Important decisions made"
echo "   └─ Append only, don't rewrite"
check_modified "FLOW-LOG.md"
echo ""

echo "=================================="
echo "🔍 VERIFICATION CHECKLIST:"
echo ""

# Check mandatory files exist
echo "Checking mandatory files..."
files_ok=true

if [ ! -f ".flow/current.md" ]; then
    echo "❌ .flow/current.md is MISSING!"
    files_ok=false
else
    echo "✅ .flow/current.md exists"
fi

if [ ! -f ".flow/memory.md" ]; then
    echo "❌ .flow/memory.md is MISSING!"
    files_ok=false
else
    echo "✅ .flow/memory.md exists"
fi

if [ ! -f "FLOW-STATUS.md" ]; then
    echo "❌ FLOW-STATUS.md is MISSING!"
    files_ok=false
else
    echo "✅ FLOW-STATUS.md exists"
fi

if [ ! -f ".flow/session-protocol.md" ]; then
    echo "❌ .flow/session-protocol.md is MISSING!"
    files_ok=false
else
    echo "✅ .flow/session-protocol.md exists"
fi

echo ""

if [ "$files_ok" = false ]; then
    echo "⚠️  CRITICAL: Some mandatory files are missing!"
    echo "Please restore from git history or regenerate."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "=================================="
    echo "📦 UNCOMMITTED CHANGES DETECTED:"
    echo ""
    git status --short
    echo ""
    echo "💡 Reminder: Commit changes before ending session"
    echo "   git add ."
    echo "   git commit -m \"[FLOW-XXX] Description\""
    echo ""
fi

echo "=================================="
echo "✅ Session end checklist complete!"
echo ""
echo "📊 Token usage this session:"
echo "   • Start: ~1,750 tokens (mandatory reading)"
echo "   • Updates: Varies based on changes"
echo "   • Total saved: ~90% vs reading all files"
echo ""
echo "🎯 Next session: Run .flow/session-start.sh"
echo "=================================="
