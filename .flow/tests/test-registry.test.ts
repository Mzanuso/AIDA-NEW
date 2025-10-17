import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Test Registry System', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const testsJsonPath = path.join(projectRoot, '.flow', 'tests.json');
  const scanScriptPath = path.join(projectRoot, 'scripts', 'scan-tests.js');

  beforeAll(() => {
    // Run scan script before tests
    if (fs.existsSync(scanScriptPath)) {
      execSync('node scripts/scan-tests.js', { cwd: projectRoot });
    }
  });

  it('should have scan-tests.js script', () => {
    expect(fs.existsSync(scanScriptPath)).toBe(true);
  });

  it('should generate tests.json file', () => {
    expect(fs.existsSync(testsJsonPath)).toBe(true);
  });

  it('tests.json should have valid structure', () => {
    const testsData = JSON.parse(fs.readFileSync(testsJsonPath, 'utf-8'));

    expect(testsData).toHaveProperty('tests');
    expect(testsData).toHaveProperty('stats');
    expect(testsData.stats).toHaveProperty('total');
    expect(testsData.stats).toHaveProperty('files');
  });

  it('should detect existing test files', () => {
    const testsData = JSON.parse(fs.readFileSync(testsJsonPath, 'utf-8'));

    // We know these test files exist
    const knownTests = [
      'orchestrator.test.ts',
      'model-selector.test.ts',
      'context-optimizer.test.ts',
      'pre-commit-validation.test.ts'
    ];

    const foundFiles = testsData.tests.map(t => path.basename(t.file));

    knownTests.forEach(testFile => {
      expect(foundFiles).toContain(testFile);
    });
  });

  it('should have test-scan script in package.json', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
    );
    expect(packageJson.scripts).toHaveProperty('test:scan');
  });

  it('should count total tests correctly', () => {
    const testsData = JSON.parse(fs.readFileSync(testsJsonPath, 'utf-8'));
    expect(testsData.stats.total).toBeGreaterThan(0);
    expect(testsData.stats.files).toBeGreaterThan(0);
  });
});
