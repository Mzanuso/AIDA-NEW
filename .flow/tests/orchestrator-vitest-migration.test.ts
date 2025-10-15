import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Orchestrator Test Migration', () => {
  const orchestratorPath = join(process.cwd(), 'backend', 'services', 'orchestrator');
  const packageJsonPath = join(orchestratorPath, 'package.json');

  it('should have package.json', () => {
    expect(existsSync(packageJsonPath)).toBe(true);
  });

  it('should use vitest instead of jest', () => {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    
    // Verify vitest in devDependencies
    expect(pkg.devDependencies).toHaveProperty('vitest');
    expect(pkg.devDependencies).not.toHaveProperty('jest');
    
    // Verify test script uses vitest
    expect(pkg.scripts.test).toContain('vitest');
  });

  it('should have vitest config', () => {
    const vitestConfigPath = join(orchestratorPath, 'vitest.config.ts');
    expect(existsSync(vitestConfigPath)).toBe(true);
  });
});
