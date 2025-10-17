import { describe, it, expect } from 'vitest'

describe('Orchestrator Health Check', () => {
  it('should return healthy status', async () => {
    const response = await fetch('http://localhost:3003/api/orchestrator/health')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
  })
})
