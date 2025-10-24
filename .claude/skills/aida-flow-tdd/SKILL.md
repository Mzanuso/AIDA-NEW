---
name: aida-flow-tdd
description: Enforce AIDA's FLOW TDD methodology for test-driven development. Use when writing code, implementing features, or fixing bugs in AIDA project. Ensures RED-GREEN-REFACTOR workflow, prevents untested code, enforces micro-sprints under 20 minutes. Activate for any AIDA code changes.
version: 1.0.0
allowed-tools: [read, write, edit, bash]
---

# AIDA FLOW TDD Skill

## Purpose

Enforce AIDA's FLOW (Fast, Light, Optimized Workflow) TDD methodology to ensure:
- All code is test-driven (tests before implementation)
- RED → GREEN → REFACTOR cycle is followed
- Micro-sprints stay under 20 minutes
- No production code without tests
- Continuous validation at every step

## When to Activate

**ALWAYS activate when:**
- User asks to implement a feature
- User asks to fix a bug
- User asks to refactor code
- You're about to write ANY production code in AIDA project
- User mentions "TDD", "tests", or "FLOW methodology"

**DO NOT activate for:**
- Writing documentation
- Reading/analyzing code
- Configuration files (package.json, etc.)
- Skills development (this is meta-development)

## The FLOW TDD Cycle

### 1. RED Phase (Write Failing Test)

**BEFORE writing ANY production code:**

```typescript
// Example: Adding a new method to WriterExecutor
describe('WriterExecutor', () => {
  it('should generate visual description with composition techniques', async () => {
    const executor = new WriterExecutor(mockConfig);
    const scene = { description: 'A lonely figure in vast desert' };

    const result = await executor.generateVisualDescription(scene);

    expect(result.composition).toBeDefined();
    expect(result.mood).toContain('isolation');
  });
});
```

**Run test to verify it FAILS:**
```bash
npm run test:run -- <test-file-name>
```

**Expected**: Test should FAIL (RED) - this proves the test is actually testing something!

### 2. GREEN Phase (Minimal Implementation)

**Write ONLY enough code to make test pass:**

```typescript
class WriterExecutor {
  async generateVisualDescription(scene: SceneDescription): Promise<VisualDescription> {
    // Minimal implementation
    return {
      composition: 'rule-of-thirds',
      mood: ['isolation'],
      // ... minimal fields
    };
  }
}
```

**Run test to verify it PASSES:**
```bash
npm run test:run -- <test-file-name>
```

**Expected**: Test should PASS (GREEN)

### 3. REFACTOR Phase (Improve Code Quality)

**Now improve the implementation:**

```typescript
class WriterExecutor {
  async generateVisualDescription(scene: SceneDescription): Promise<VisualDescription> {
    // Load visual references
    const references = await this.loadVisualReferences();

    // AI-powered selection
    const selectedTechniques = await this.selectVisualTechniques(scene, references);

    return this.buildVisualDescription(selectedTechniques);
  }
}
```

**Run test again to verify still PASSES:**
```bash
npm run test:run -- <test-file-name>
```

**Expected**: Test still PASSES after refactoring

### 4. REPEAT

Continue cycle for next feature/requirement.

---

## Micro-Sprint Rules

### Time Boxing: MAX 20 Minutes Per Sprint

**Each micro-sprint should:**
- Have a clear, single objective
- Be completable in < 20 minutes
- Result in working, tested code
- Be committable to git

**If sprint is taking > 20 min:**
- ❌ STOP
- Break it into smaller sprints
- Commit what's working
- Plan next micro-sprint

### Sprint Structure

```markdown
🎯 Micro-Sprint: [Sprint Name]
⏱️ Estimated: [X] minutes (max 20)

## Objective
[Single, clear goal]

## RED Phase (5 min)
- [ ] Write failing test
- [ ] Verify test fails

## GREEN Phase (10 min)
- [ ] Minimal implementation
- [ ] Verify test passes

## REFACTOR Phase (5 min)
- [ ] Improve code quality
- [ ] Verify tests still pass
- [ ] Run full test suite

## Commit
```

---

## Test Structure for AIDA

### Unit Tests

**Location**: `__tests__/[component-name].test.ts`

**Structure**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('[ComponentName]', () => {
  let component: ComponentType;
  let mockDependency: MockType;

  beforeEach(() => {
    mockDependency = createMockDependency();
    component = new ComponentType(mockDependency);
  });

  describe('[method name]', () => {
    it('should [expected behavior]', async () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = await component.method(input);

      // Assert
      expect(result).toMatchObject({ ... });
    });

    it('should handle [error case]', async () => {
      // Arrange - setup error condition
      mockDependency.method.mockRejectedValue(new Error('API error'));

      // Act & Assert
      await expect(component.method(input)).rejects.toThrow('API error');
    });
  });
});
```

### Integration Tests

**Location**: `__tests__/integration/[feature-name].test.ts`

**Structure**:
```typescript
describe('[Feature] Integration', () => {
  it('should complete full workflow', async () => {
    // Test multiple components working together
    const orchestrator = new WorkflowOrchestrator(config);
    const result = await orchestrator.executeWorkflow(input);

    expect(result.stages).toHaveLength(3);
    expect(result.status).toBe('completed');
  });
});
```

---

## Code Coverage Requirements

**Minimum Coverage** (enforced by vitest):
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Check coverage:**
```bash
npm run test:coverage
```

**Coverage exceptions** (document in test file):
- External API calls (mock instead)
- Error handling for unreachable states
- Legacy code being refactored

---

## AIDA-Specific Test Patterns

### Pattern 1: Agent Executor Tests

```typescript
describe('WriterExecutor', () => {
  it('should apply narrative techniques based on tone', async () => {
    const executor = new WriterExecutor(config);
    const brief = { tone: 'dramatic', content: 'product launch' };

    const result = await executor.generateVideoScript(brief);

    expect(result.techniques).toContain('foreshadowing');
    expect(result.scenes).toHaveLength(3); // Setup, confrontation, resolution
  });
});
```

### Pattern 2: Smart Router Tests

```typescript
describe('SmartRouter', () => {
  it('should select correct model based on budget constraints', () => {
    const router = new SmartRouter(catalog);
    const task = { type: 'image-generation', budget: 'low' };

    const model = router.selectModel(task);

    expect(model.provider).toBe('fal-ai');
    expect(model.cost).toBeLessThan(0.01);
  });
});
```

### Pattern 3: Workflow Orchestrator Tests

```typescript
describe('WorkflowOrchestrator', () => {
  it('should execute stages in correct order', async () => {
    const orchestrator = new WorkflowOrchestrator(agents);
    const executionOrder: string[] = [];

    // Spy on agent calls
    agents.styleSelector.execute = vi.fn().mockImplementation(() => {
      executionOrder.push('style');
    });
    agents.writer.execute = vi.fn().mockImplementation(() => {
      executionOrder.push('writer');
    });

    await orchestrator.run(brief);

    expect(executionOrder).toEqual(['style', 'technical', 'writer', 'visual']);
  });
});
```

---

## Commands Reference

### Run Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test:run -- writer-executor.test.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:run -- integration/
```

### TypeScript Validation

```bash
# Check TypeScript errors (should be 0 before commit)
npm run type-check

# Run linter
npm run lint
```

### Full Validation

```bash
# Run full validation (tests + types + lint)
npm run validate
```

---

## Workflow Example: Adding New Feature

### Feature: "Add emotional intensity scoring to Writer Agent"

#### Micro-Sprint 1: Add Intensity Field to Types (10 min)

**RED Phase**:
```typescript
// __tests__/writer-executor.test.ts
it('should calculate emotional intensity score', () => {
  const executor = new WriterExecutor(config);
  const scene = { description: 'Explosive confrontation', tone: 'dramatic' };

  const result = executor.scoreEmotionalIntensity(scene);

  expect(result.intensity).toBeGreaterThan(7);
  expect(result.intensity).toBeLessThanOrEqual(10);
});
```

Run: `npm run test:run -- writer-executor.test.ts` → FAILS ✅

**GREEN Phase**:
```typescript
// src/agents/writer/writer-executor.ts
scoreEmotionalIntensity(scene: SceneDescription): { intensity: number } {
  return { intensity: 8 }; // Minimal implementation
}
```

Run: `npm run test:run -- writer-executor.test.ts` → PASSES ✅

**REFACTOR Phase**:
```typescript
scoreEmotionalIntensity(scene: SceneDescription): { intensity: number } {
  const toneScores = { dramatic: 8, calm: 3, neutral: 5 };
  const baseScore = toneScores[scene.tone] || 5;

  // Adjust based on keywords
  const intensityKeywords = ['explosive', 'intense', 'powerful'];
  const hasIntenseKeyword = intensityKeywords.some(k =>
    scene.description.toLowerCase().includes(k)
  );

  return { intensity: hasIntenseKeyword ? Math.min(baseScore + 2, 10) : baseScore };
}
```

Run: `npm run test:run -- writer-executor.test.ts` → PASSES ✅

**Commit**:
```bash
git add __tests__/writer-executor.test.ts src/agents/writer/writer-executor.ts
git commit -m "[WRITER] Add emotional intensity scoring

- Add scoreEmotionalIntensity() method
- Tests: intensity calculation based on tone + keywords
- Test coverage: 85%

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### Micro-Sprint 2: Integrate Intensity into Scene Generation (15 min)

[Repeat RED-GREEN-REFACTOR cycle...]

---

## Anti-Patterns to Avoid

### ❌ DON'T: Write Code Before Test

```typescript
// BAD: Writing implementation first
class WriterExecutor {
  async generateScript() {
    // 200 lines of code...
  }
}

// Then trying to write tests...
```

### ✅ DO: Write Test First

```typescript
// GOOD: Test defines the interface
it('should generate script with 3-act structure', async () => {
  const result = await executor.generateScript(brief);
  expect(result.acts).toHaveLength(3);
});

// Then implement to satisfy test
```

### ❌ DON'T: Test Implementation Details

```typescript
// BAD: Testing private implementation
it('should call _loadTechniques method', () => {
  const spy = vi.spyOn(executor, '_loadTechniques');
  executor.generateScript();
  expect(spy).toHaveBeenCalled(); // Brittle!
});
```

### ✅ DO: Test Public Behavior

```typescript
// GOOD: Testing observable behavior
it('should include narrative techniques in script', async () => {
  const result = await executor.generateScript(brief);
  expect(result.techniques).toBeDefined();
  expect(result.techniques.length).toBeGreaterThan(0);
});
```

### ❌ DON'T: Mega-Sprints

```markdown
🎯 Micro-Sprint: Complete Writer Agent
⏱️ Estimated: 6 hours  ← TOO LONG!
```

### ✅ DO: True Micro-Sprints

```markdown
🎯 Micro-Sprint: Add cliché detection to scene validation
⏱️ Estimated: 15 minutes  ← PERFECT!
```

---

## Checklist for Every Code Change

**Before writing production code:**
- [ ] Test file created/opened
- [ ] Failing test written (RED phase)
- [ ] Test executed and confirmed FAILING
- [ ] Micro-sprint time estimate < 20 min

**After writing minimal implementation:**
- [ ] Test executed and confirmed PASSING (GREEN phase)
- [ ] TypeScript compiles (0 errors)

**After refactoring:**
- [ ] Test still PASSING
- [ ] Full test suite run: `npm run test`
- [ ] TypeScript check: `npm run type-check`
- [ ] Code committed with descriptive message

---

## Integration with Session Manager

When `aida-session-manager` proposes a task, this skill should:

1. **Break task into micro-sprints** (< 20 min each)
2. **For each micro-sprint**: Follow RED-GREEN-REFACTOR
3. **Commit after each sprint**: Keep git history granular
4. **Update .flow/current.md**: Track progress

**Example**:
```markdown
Task: Implement visual description generation

Micro-Sprint 1: Add VisualDescription interface to types (10 min)
→ RED-GREEN-REFACTOR → COMMIT

Micro-Sprint 2: Add generateVisualDescription() method (15 min)
→ RED-GREEN-REFACTOR → COMMIT

Micro-Sprint 3: Integrate into scene generation pipeline (20 min)
→ RED-GREEN-REFACTOR → COMMIT
```

---

## Success Metrics

This skill is working correctly when:
- ✅ Every production code change has a test written FIRST
- ✅ Test suite passes on every commit
- ✅ Code coverage stays above 80%
- ✅ Micro-sprints complete in < 20 minutes
- ✅ Git history shows frequent, small commits
- ✅ TypeScript errors stay at 0

---

## References

**AIDA Project Files**:
- `PROJECT-INSTRUCTIONS.md` - Full FLOW methodology
- `__tests__/` - Existing test examples
- `vitest.config.ts` - Test configuration

**Commands**:
- `npm run test` - Run all tests
- `npm run test:run -- <file>` - Run specific test
- `npm run type-check` - TypeScript validation
- `npm run validate` - Full validation

---

**Version**: 1.0.0
**Last Updated**: 2025-10-23
**Maintainer**: AIDA Development Team
