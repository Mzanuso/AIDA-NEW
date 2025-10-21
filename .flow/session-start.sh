#!/bin/bash
# Session Start Protocol - MANDATORY Reading Checklist
# Version: 1.0
# Purpose: Enforce token-optimized session protocol

echo "=================================="
echo "🚀 AIDA-FLOW SESSION START"
echo "=================================="
echo ""
echo "📖 MANDATORY READING (1,750 tokens):"
echo ""
echo "1. .flow/current.md (ALL - ~500 tokens)"
echo "   └─ Current sprint status, active blockers, next actions"
echo ""
echo "2. .flow/memory.md (ALL - ~300 tokens)"
echo "   └─ Critical project info, ports, production services"
echo ""
echo "3. FLOW-STATUS.md (SECTIONS ONLY - ~950 tokens):"
echo "   ├─ Lines 1-30: Current Focus"
echo "   ├─ Lines 25-45: Agent Development Status table"
echo "   └─ Lines 59-103: Recent Completions (last 2 entries)"
echo ""
echo "=================================="
echo "📚 REFERENCE FILES (Read only when needed):"
echo ""
echo "• FLOW-LOG.md - Last session entry only (~3,000 tokens)"
echo "• ROADMAP.md - Specific phase only (~1,500 tokens)"
echo "• PROJECT-INSTRUCTIONS.md - Once per project"
echo ""
echo "=================================="
echo ""
echo "✅ Have you read all mandatory sections? [y/N]"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "⚠️  Please read mandatory files before starting work!"
    echo ""
    exit 1
fi

echo ""
echo "✅ Session protocol confirmed"
echo "🎯 Continue current micro-sprint or start new? Ask the user!"
echo ""
