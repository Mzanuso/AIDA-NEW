# AIDA Memory (Auto-loaded)

## Critical Decisions
- Test-first: ALWAYS write test before code
- Micro-sprints: Max 100 lines per commit
- Orchestrator: Port 3003, conversational mode

## Common Patterns
```javascript
// Test pattern
describe('Component', () => {
  it('should behavior', () => {
    // Arrange, Act, Assert
  });
});
```

## Active Ports
- 3000: API Gateway
- 3001: Auth Service
- 3003: Orchestrator

## Never Forget
- If no test = not done
- If > 100 lines = too complex
- If confused = task too big
