#!/usr/bin/env node
/**
 * Strict TypeScript Error Checker
 * Blocks commits if TypeScript errors exist
 * Part of AIDA-FLOW cross-validation system
 */

const { execSync } = require('child_process');

console.log('🔍 Checking TypeScript compilation...');

try {
  // Run type-check and capture output
  const output = execSync('npm run type-check 2>&1', {
    encoding: 'utf-8',
    stdio: 'pipe'
  });

  // Count errors
  const errorLines = output.split('\n').filter(line => line.includes('error TS'));
  const errorCount = errorLines.length;

  if (errorCount === 0) {
    console.log('✅ TypeScript compilation successful - 0 errors');
    process.exit(0);
  } else {
    console.error(`\n❌ TypeScript compilation failed with ${errorCount} errors:\n`);

    // Show first 10 errors
    const preview = errorLines.slice(0, 10);
    preview.forEach(line => console.error(`   ${line}`));

    if (errorCount > 10) {
      console.error(`\n   ... and ${errorCount - 10} more errors`);
    }

    console.error('\n💡 Fix TypeScript errors before committing:');
    console.error('   npm run type-check (to see all errors)');
    console.error('\n⚠️  To bypass (NOT RECOMMENDED):');
    console.error('   git commit --no-verify\n');

    process.exit(1);
  }
} catch (error) {
  // Type-check command failed (which is expected when errors exist)
  const output = error.stdout || error.stderr || '';
  const errorLines = output.split('\n').filter(line => line.includes('error TS'));
  const errorCount = errorLines.length;

  if (errorCount > 0) {
    console.error(`\n❌ TypeScript compilation failed with ${errorCount} errors:\n`);

    // Show first 10 errors
    const preview = errorLines.slice(0, 10);
    preview.forEach(line => console.error(`   ${line}`));

    if (errorCount > 10) {
      console.error(`\n   ... and ${errorCount - 10} more errors`);
    }

    console.error('\n💡 Fix TypeScript errors before committing:');
    console.error('   npm run type-check (to see all errors)');
    console.error('\n⚠️  To bypass (NOT RECOMMENDED):');
    console.error('   git commit --no-verify\n');

    process.exit(1);
  } else {
    console.log('✅ TypeScript compilation successful - 0 errors');
    process.exit(0);
  }
}
