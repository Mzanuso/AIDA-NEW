import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Pre-commit Hook Validation', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const preCommitPath = path.join(projectRoot, '.husky', 'pre-commit');
  const packageJsonPath = path.join(projectRoot, 'package.json');

  it('should have pre-commit hook file', () => {
    expect(fs.existsSync(preCommitPath)).toBe(true);
  });

  it('should have validate script in package.json', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.scripts).toHaveProperty('validate');
  });

  it('validate script should include type-check, lint, and test', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const validateScript = packageJson.scripts.validate;
    
    expect(validateScript).toContain('type-check');
    expect(validateScript).toContain('lint');
    expect(validateScript).toContain('test');
  });

  it('pre-commit hook should call validate script', () => {
    const hookContent = fs.readFileSync(preCommitPath, 'utf-8');
    expect(hookContent).toContain('npm run validate');
  });

  it('should have lint:fix script for auto-fixing', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.scripts).toHaveProperty('lint:fix');
  });

  it('should have test:coverage script', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.scripts).toHaveProperty('test:coverage');
  });
});
