#!/bin/bash
# Install Git Hooks for Session Protocol Enforcement
# Version: 1.0

echo "=================================="
echo "🔧 Installing AIDA-FLOW Git Hooks"
echo "=================================="
echo ""

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    echo "Please run this script from the project root (D:\\AIDA-NEW\\)"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
echo "📦 Installing pre-commit hook..."
cp .flow/pre-commit-hook.sh .git/hooks/pre-commit

# Make it executable (Unix-like systems)
if command -v chmod &> /dev/null; then
    chmod +x .git/hooks/pre-commit
    echo "✅ Pre-commit hook installed and made executable"
else
    echo "✅ Pre-commit hook installed"
    echo "⚠️  Note: On Windows, Git Bash will handle execution automatically"
fi

echo ""
echo "=================================="
echo "✅ Git hooks installed successfully!"
echo ""
echo "The pre-commit hook will now:"
echo "  • Prevent deletion of mandatory files"
echo "  • Verify mandatory files exist"
echo "  • Check .flow/current.md has content"
echo "  • Check .flow/memory.md has content"
echo ""
echo "Protected files:"
echo "  • .flow/current.md"
echo "  • .flow/memory.md"
echo "  • .flow/session-protocol.md"
echo "  • FLOW-STATUS.md"
echo "  • FLOW-LOG.md"
echo "  • PROJECT-INSTRUCTIONS.md"
echo "  • ROADMAP.md"
echo ""
echo "To bypass checks (NOT RECOMMENDED):"
echo "  git commit --no-verify"
echo "=================================="
