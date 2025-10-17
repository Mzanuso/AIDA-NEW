#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 Scanning for test files...');

// Find all test files
const testFiles = glob.sync('**/*.test.{ts,tsx}', {
  cwd: projectRoot,
  ignore: ['**/node_modules/**', 'dist/**', 'build/**'],
  absolute: true,
  dot: true
});

console.log(`📊 Found ${testFiles.length} test files`);

// Parse each test file
const tests = [];
let totalTests = 0;

testFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');

  // Count test cases (it, test blocks)
  const itMatches = content.match(/\b(it|test)\s*\(/g) || [];
  const testCount = itMatches.length;
  totalTests += testCount;

  // Count describe blocks
  const describeMatches = content.match(/\bdescribe\s*\(/g) || [];

  const relativePath = path.relative(projectRoot, file);

  tests.push({
    file: relativePath,
    tests: testCount,
    suites: describeMatches.length,
    path: file
  });

  console.log(`  ✓ ${relativePath}: ${testCount} tests in ${describeMatches.length} suites`);
});

// Generate report
const report = {
  tests,
  stats: {
    total: totalTests,
    files: testFiles.length,
    suites: tests.reduce((sum, t) => sum + t.suites, 0)
  },
  lastScan: new Date().toISOString()
};

// Write to tests.json
const outputPath = path.join(projectRoot, '.flow', 'tests.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log(`\n✅ Test registry updated: ${outputPath}`);
console.log(`📈 Total: ${totalTests} tests in ${testFiles.length} files`);
