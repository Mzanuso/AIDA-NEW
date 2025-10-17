import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Pre-push Hook Validation', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const prePushPath = path.join(projectRoot, '.husky', 'pre-push');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const vitestConfigPath = path.join(projectRoot, 'vitest.config.ts');

  it('should have pre-push hook file', () => {
    expect(fs.existsSync(prePushPath)).toBe(true);
  });

  it('pre-push hook should run coverage check', () => {
    const hookContent = fs.readFileSync(prePushPath, 'utf-8');
    expect(hookContent).toContain('test:coverage');
  });

  it('should have coverage config in vitest.config.ts', () => {
    const configContent = fs.readFileSync(vitestConfigPath, 'utf-8');
    expect(configContent).toContain('coverage');
  });

  it('should have test:coverage:check script', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.scripts).toHaveProperty('test:coverage:check');
  });

  it('pre-push should validate before allowing push', () => {
    const hookContent = fs.readFileSync(prePushPath, 'utf-8');
    expect(hookContent).toContain('exit 1');
  });
});
