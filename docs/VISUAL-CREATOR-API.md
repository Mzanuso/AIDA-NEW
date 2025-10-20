# Visual Creator API Documentation

**Version:** 1.0  
**Last Updated:** 2025-10-20  
**Status:** Production Ready ✅

---

## Overview

Visual Creator is AIDA's image generation agent, capable of executing complex multi-step workflows using multiple AI models (FLUX, Midjourney, Seedream, Ideogram, Recraft).

### Key Features
- ✅ Multi-model support (FAL.AI + KIE.AI)
- ✅ Automatic fallback strategies
- ✅ Retry logic with exponential backoff
- ✅ Rate limiting
- ✅ Dependency orchestration
- ✅ Cost & time tracking
- ✅ Partial success handling

---

## API Endpoint

### Execute Visual Creator Workflow

```
POST http://localhost:3003/api/agents/visual-creator/execute
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** ExecutionPlan
```json
{
  "id": "plan-001",
  "brief_id": "brief-001",
  "target_agent": "visual_creator",
  "content_type": "image",
  "quality_tier": "premium",
  "approach": "single_model",
  "personalization_required": false,
  "total_estimated_cost": 0.05,
  "total_estimated_time": 8,
  "primary_model": {
    "name": "FLUX Pro 1.1",
    "provider": "FAL.AI",
    "model_id": "flux-pro-1.1",
    "reason": "Premium quality",
    "estimated_cost": 0.05,
    "estimated_time": 8
  },
  "fallback_models": [{
    "name": "FLUX Schnell",
    "provider": "FAL.AI",
    "model_id": "flux-schnell",
    "reason": "Faster fallback",
    "estimated_cost": 0.03,
    "estimated_time": 5
  }],
  "steps": [{
    "step_id": "step-1",
    "model": {
      "name": "FLUX Pro 1.1",
      "provider": "FAL.AI",
      "model_id": "flux-pro-1.1",
      "reason": "Premium",
      "estimated_cost": 0.05,
      "estimated_time": 8
    },
    "prompt": "Mountain landscape at sunset, photorealistic",
    "dependencies": []
  }],
  "scene_descriptions": ["Mountain landscape at sunset"],
  "created_at": "2025-10-20T12:00:00Z"
}
```

**Success Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "workflowId": "wf-12345",
    "status": "success",
    "steps": [{
      "stepId": "step-1",
      "modelUsed": "flux-pro-1.1",
      "status": "success",
      "output": {
        "url": "https://fal.ai/generated-image.jpg",
        "contentType": "image/jpeg"
      },
      "actualCost": 0.05,
      "actualTime": 7.2
    }],
    "totalCost": 0.05,
    "totalTime": 7.2
  },
  "metadata": {
    "duration": 7245,
    "planId": "plan-001"
  }
}
```

**Error Response:** 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid target_agent: expected 'visual_creator', got 'writer'",
  "details": [{
    "field": "target_agent",
    "message": "Must be 'visual_creator'"
  }]
}
```

**Error Response:** 500 Internal Server Error
```json
{
  "success": false,
  "error": "All models unavailable",
  "metadata": {
    "duration": 15234
  }
}
```

---

## Health Check

```
GET http://localhost:3003/api/agents/visual-creator/health
```

**Response:** 200 OK
```json
{
  "status": "healthy",
  "agent": "visual-creator",
  "timestamp": "2025-10-20T12:00:00Z"
}
```

---

## Error Codes

| Code | Description | Action |
|------|-------------|--------|
| 400 | Invalid input (missing fields, wrong agent) | Fix request body |
| 500 | Execution failure (API errors, timeouts) | Check logs, retry |
| 503 | Service unavailable | Wait and retry |

---

## Fallback Strategy

Visual Creator automatically falls back to alternative models when primary fails:

1. **Primary model** (e.g., FLUX Pro 1.1) - tried first
2. **Fallback 1** (e.g., FLUX Schnell) - if primary fails
3. **Fallback 2** (e.g., Seedream 4.0) - if fallback 1 fails
4. **Failure** - if all models exhausted

**Example fallback chain:**
```
FLUX Pro → FLUX Schnell → Seedream → Failed
```

**Logging:** Each fallback attempt is logged with:
- Which model was tried
- Why it failed
- Which fallback was used
- Cost adjustment (fallback models may be cheaper)

---

## Cost & Time Tracking

Visual Creator tracks actual vs estimated costs and times:

**Estimated:**
- Provided in ExecutionPlan
- Based on model specs

**Actual:**
- Measured during execution
- Returned in WorkflowResult
- May differ due to:
  - Fallback model usage (cheaper/faster)
  - Network latency
  - API performance

**Example:**
```json
{
  "estimatedCost": 0.05,
  "actualCost": 0.03,  // Used cheaper fallback
  "estimatedTime": 8,
  "actualTime": 5.2    // Faster than expected
}
```

---

## Supported Models

### FAL.AI Models
- **FLUX Pro 1.1** - Premium quality ($0.05, 8s)
- **FLUX Schnell** - Fast generation ($0.03, 5s)
- **Seedream 4.0** - Character consistency ($0.05, 10s)
- **Ideogram V2** - Text rendering ($0.05, 10s)
- **Recraft V3** - Vector/design ($0.02, 7s)

### KIE.AI Models
- **Midjourney V6** - Artistic quality ($0.08, 15s)

---

## Workflow Types

### 1. Single-Shot
Generate one image quickly.
```json
{
  "approach": "single_model",
  "steps": [{ "stepId": "step-1", ... }]
}
```

### 2. Multi-Step Consistency
Generate multiple variations with same character/style.
```json
{
  "approach": "multi_step",
  "steps": [
    { "stepId": "base", ... },
    { "stepId": "var1", "dependencies": ["base"], ... },
    { "stepId": "var2", "dependencies": ["base"], ... }
  ]
}
```

### 3. Parallel Exploration
Try multiple models simultaneously.
```json
{
  "approach": "parallel",
  "steps": [
    { "stepId": "flux", ... },
    { "stepId": "midjourney", ... },
    { "stepId": "ideogram", ... }
  ]
}
```

---

## Rate Limiting

Visual Creator respects API rate limits:
- **FAL.AI**: 100ms between requests (10 req/s)
- **KIE.AI**: 500ms between requests (2 req/s)

Rate limits are enforced automatically.

---

## Timeout Protection

All requests have a **30-second timeout**. If execution exceeds this:
- Returns 500 error
- Error message: "Execution timeout after 30 seconds"
- Logged for debugging

---

## Troubleshooting

### Issue: All models failing
**Cause:** API keys missing or invalid  
**Solution:** Check environment variables:
```bash
FAL_KEY=your_fal_api_key
KIE_API_KEY=your_kie_api_key
```

### Issue: Timeout errors
**Cause:** Slow network or complex workflow  
**Solution:** 
- Reduce number of steps
- Use faster models (FLUX Schnell vs FLUX Pro)
- Check network connection

### Issue: High costs
**Cause:** Using expensive models  
**Solution:**
- Use fallback to cheaper models
- Reduce image count
- Use FLUX Schnell instead of FLUX Pro

### Issue: Partial success
**Cause:** Some steps failed, others succeeded  
**Solution:**
- Check which steps failed in response
- Retry failed steps only
- Use fallback models

---

## Environment Variables

Required:
```bash
FAL_KEY=your_fal_api_key
KIE_API_KEY=your_kie_api_key
```

Optional:
```bash
ORCHESTRATOR_PORT=3003
LOG_LEVEL=info
```

---

## Integration Example

```typescript
import axios from 'axios';

const executionPlan = {
  id: 'plan-001',
  brief_id: 'brief-001',
  target_agent: 'visual_creator',
  content_type: 'image',
  quality_tier: 'premium',
  approach: 'single_model',
  personalization_required: false,
  total_estimated_cost: 0.05,
  total_estimated_time: 8,
  primary_model: {
    name: 'FLUX Pro 1.1',
    provider: 'FAL.AI',
    model_id: 'flux-pro-1.1',
    reason: 'Premium quality',
    estimated_cost: 0.05,
    estimated_time: 8
  },
  steps: [{
    step_id: 'step-1',
    model: {
      name: 'FLUX Pro 1.1',
      provider: 'FAL.AI',
      model_id: 'flux-pro-1.1',
      reason: 'Premium',
      estimated_cost: 0.05,
      estimated_time: 8
    },
    prompt: 'Mountain landscape',
    dependencies: []
  }],
  scene_descriptions: ['Mountain landscape'],
  created_at: new Date().toISOString()
};

const response = await axios.post(
  'http://localhost:3003/api/agents/visual-creator/execute',
  executionPlan
);

if (response.data.success) {
  const imageUrl = response.data.data.steps[0].output.url;
  console.log('Image generated:', imageUrl);
} else {
  console.error('Failed:', response.data.error);
}
```

---

## Support

For issues or questions:
- Check logs: `src/agents/orchestrator/logs/`
- Review test suite: `__tests__/integration/visual-creator-pipeline.test.ts`
- Contact: AIDA Development Team

---

**Visual Creator - Production Ready ✅**  
**Version:** 1.0  
**Last Updated:** 2025-10-20
