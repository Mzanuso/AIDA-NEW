import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

describe('GitHub Actions CI Setup', () => {
  const workflowPath = join(process.cwd(), '.github', 'workflows', 'ci.yml');

  it('should have CI workflow file', () => {
    expect(existsSync(workflowPath)).toBe(true);
  });

  it('should have valid YAML structure', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(() => parse(content)).not.toThrow();
  });

  it('should run on push and pull_request', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    const workflow = parse(content);
    
    expect(workflow.on).toContain('push');
    expect(workflow.on).toContain('pull_request');
  });

  it('should have test job', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    const workflow = parse(content);
    
    expect(workflow.jobs).toHaveProperty('test');
  });

  it('should run type-check, test, and lint', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    const workflow = parse(content);
    const steps = workflow.jobs.test.steps.map((s: any) => s.run).filter(Boolean);
    
    expect(steps.some((s: string) => s.includes('type-check'))).toBe(true);
    expect(steps.some((s: string) => s.includes('test'))).toBe(true);
    expect(steps.some((s: string) => s.includes('lint'))).toBe(true);
  });
});
