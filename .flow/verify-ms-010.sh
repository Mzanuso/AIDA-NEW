#!/bin/bash
# MS-010 Verification Script
# Run this to verify pre-commit hook setup

echo "🔍 MS-010 Verification Starting..."
echo ""

echo "Step 1: Running pre-commit validation test..."
npm test -- .flow/tests/pre-commit-validation.test.ts

if [ $? -ne 0 ]; then
  echo "❌ Test failed!"
  exit 1
fi

echo ""
echo "Step 2: Testing validate script..."
npm run validate

if [ $? -ne 0 ]; then
  echo "❌ Validate failed!"
  exit 1
fi

echo ""
echo "✅ All verifications passed!"
echo ""
echo "Ready to commit with:"
echo "git add ."
echo "git commit -m \"[FLOW-010] Pre-commit hook enhancement complete\""
