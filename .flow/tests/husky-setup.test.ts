import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Husky Pre-Commit Setup', () => {
  const huskyDir = join(process.cwd(), '.husky');
  const preCommitPath = join(huskyDir, 'pre-commit');
  const packageJsonPath = join(process.cwd(), 'package.json');

  it('should have .husky directory', () => {
    expect(existsSync(huskyDir)).toBe(true);
  });

  it('should have pre-commit hook file', () => {
    expect(existsSync(preCommitPath)).toBe(true);
  });

  it('should have executable pre-commit hook', () => {
    const content = readFileSync(preCommitPath, 'utf-8');
    expect(content).toContain('#!/usr/bin/env sh');
  });

  it('should run type-check in pre-commit', () => {
    const content = readFileSync(preCommitPath, 'utf-8');
    expect(content).toContain('type-check');
  });

  it('should have husky installed in package.json', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.devDependencies).toHaveProperty('husky');
  });

  it('should have prepare script in package.json', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.scripts).toHaveProperty('prepare');
    expect(packageJson.scripts.prepare).toContain('husky');
  });
});
