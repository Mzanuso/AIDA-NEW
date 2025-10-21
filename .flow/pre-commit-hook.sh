#!/bin/bash
# Git Pre-Commit Hook - Protect Mandatory Files
# Version: 1.0
# Purpose: Prevent accidental deletion or corruption of mandatory files
#
# Installation: Copy to .git/hooks/pre-commit and make executable
# chmod +x .git/hooks/pre-commit

# Define mandatory files that must never be deleted
MANDATORY_FILES=(
    ".flow/current.md"
    ".flow/memory.md"
    ".flow/session-protocol.md"
    "FLOW-STATUS.md"
    "FLOW-LOG.md"
    "PROJECT-INSTRUCTIONS.md"
    "ROADMAP.md"
)

echo "🔍 Checking mandatory files..."

# Check if any mandatory files are being deleted
for file in "${MANDATORY_FILES[@]}"; do
    if git diff --cached --name-status | grep -q "^D.*$file$"; then
        echo ""
        echo "❌ ERROR: Attempting to delete mandatory file: $file"
        echo ""
        echo "This file is critical for project continuity and cannot be deleted."
        echo "If you need to update it, edit the file instead of deleting."
        echo ""
        echo "To bypass this check (NOT RECOMMENDED):"
        echo "git commit --no-verify"
        echo ""
        exit 1
    fi
done

# Check if mandatory files exist in the working directory
missing_files=()
for file in "${MANDATORY_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  WARNING: The following mandatory files are missing:"
    for file in "${missing_files[@]}"; do
        echo "   • $file"
    done
    echo ""
    echo "These files are required for project continuity."
    echo "Please restore them before committing."
    echo ""
    echo "To bypass this check (NOT RECOMMENDED):"
    echo "git commit --no-verify"
    echo ""
    exit 1
fi

# Check if .flow/current.md has minimum content (not empty)
if [ -f ".flow/current.md" ]; then
    lines=$(wc -l < ".flow/current.md" | tr -d ' ')
    if [ "$lines" -lt 10 ]; then
        echo ""
        echo "⚠️  WARNING: .flow/current.md appears too short ($lines lines)"
        echo "This file should contain:"
        echo "   • Status"
        echo "   • Focus"
        echo "   • Tasks"
        echo "   • Progress"
        echo "   • Next Actions"
        echo ""
        read -p "Continue anyway? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Check if .flow/memory.md has minimum content
if [ -f ".flow/memory.md" ]; then
    lines=$(wc -l < ".flow/memory.md" | tr -d ' ')
    if [ "$lines" -lt 5 ]; then
        echo ""
        echo "⚠️  WARNING: .flow/memory.md appears too short ($lines lines)"
        echo "This file should contain:"
        echo "   • Current Status"
        echo "   • Blockers"
        echo "   • Production Ready Services"
        echo "   • Tests Status"
        echo ""
        read -p "Continue anyway? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

echo "✅ All mandatory files intact"
echo ""

# Success
exit 0
