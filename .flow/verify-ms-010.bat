@echo off
REM MS-010 Verification Script (Windows)
REM Run this to verify pre-commit hook setup

echo 🔍 MS-010 Verification Starting...
echo.

echo Step 1: Running pre-commit validation test...
call npm test -- .flow/tests/pre-commit-validation.test.ts

if %errorlevel% neq 0 (
  echo ❌ Test failed!
  exit /b 1
)

echo.
echo Step 2: Testing validate script...
call npm run validate

if %errorlevel% neq 0 (
  echo ❌ Validate failed!
  exit /b 1
)

echo.
echo ✅ All verifications passed!
echo.
echo Ready to commit with:
echo git add .
echo git commit -m "[FLOW-010] Pre-commit hook enhancement complete"
