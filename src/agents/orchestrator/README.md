# AIDA Orchestrator Service

Central intelligence service for AIDA that coordinates all AI agents to create videos.

## Features

- **Conversational Memory (RAG)**: Semantic search with pgvector
- **Multi-Agent Coordination**: Writer → Director → Visual → Video pipeline
- **Cost Optimization**: Extended prompt caching (90% savings)
- **Error Resilience**: Automatic retries with exponential backoff

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL with pgvector extension
- Environment variables configured

### Installation

```bash
cd backend/services/orchestrator
npm install
```

### Environment Variables

Create `.env` file:

```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # For embeddings (temporary)
FAL_KEY=...
KIE_API_KEY=...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/aida

# Service Config
ORCHESTRATOR_PORT=3003
NODE_ENV=development
```

### Run Database Migration

```bash
# From project root
psql $DATABASE_URL < backend/migrations/0003_add_rag_tables.sql
```

### Start Service

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Health Check

```bash
curl http://localhost:3003/health
```

## API Endpoints

### POST `/api/orchestrator/create-video`

Create a new video.

**Request:**
```json
{
  "userId": "user_123",
  "message": "Voglio un video food come l'altra volta",
  "projectId": "proj_456",  // optional, for refinement
  "campaignId": "camp_789"  // optional
}
```

**Response:**
```json
{
  "taskId": "task_abc123",
  "projectId": "proj_new456",
  "videoUrl": "https://...",
  "status": "completed",
  "cost": {
    "tokens": 15234,
    "dollars": 2.34
  }
}
```

### GET `/api/orchestrator/status/:taskId`

Get video generation status.

**Response:**
```json
{
  "taskId": "task_abc123",
  "status": "processing",
  "currentStep": "visual",
  "progress": 65,
  "videoUrl": null
}
```

### POST `/api/orchestrator/refine/:projectId`

Refine an existing video.

**Request:**
```json
{
  "userId": "user_123",
  "feedback": "Make it more dynamic",
  "aspectToRefine": "script"  // 'script' | 'style' | 'visuals' | 'all'
}
```

## Architecture

```
Orchestrator (Claude Sonnet 4.5)
├── RAG Layer (pgvector)
│   ├── search_similar_projects
│   ├── find_user_file
│   ├── load_campaign_context
│   └── get_user_preferences
│
├── Agent Tools
│   ├── spawn_writer_agent
│   └── spawn_director_agent
│
└── Media Tools
    ├── generate_images_midjourney (KIE.AI)
    └── generate_video_kling (FAL.AI)
```

## RAG (Retrieval-Augmented Generation)

The Orchestrator uses semantic search to remember user's past projects:

- **"Like last time"** → Finds similar projects
- **"Use the brief I uploaded"** → Finds uploaded files
- **"Add to Food Q1 campaign"** → Loads campaign context
- **Learns preferences** → Auto-suggests based on history

### Vector Search

Uses pgvector with OpenAI `text-embedding-3-small` (1536 dimensions).

**Similarity threshold:** 0.7 (70% match)

## Cost Optimization

### Extended Caching (1hr TTL)

- System prompt: 5K tokens → 90% savings
- User context: 2-8K tokens → 90% savings
- SREF descriptions: 1K tokens → 90% savings

**Expected cost per video:**
- First video: $2.52 (no cache)
- 2nd+ video: $2.49 → $1.85 (with cache)

### Parallel Execution

- Images: Max 4 concurrent (30 sec instead of 2 min)
- Video: Sequential (expensive, be careful)

## Error Handling

### Retry Strategy

```typescript
Max retries: 3
Backoff: 1s, 2s, 4s (exponential)

Retry on: 429, ETIMEDOUT, ECONNRESET
Don't retry: 401, 400, quota errors
```

### Graceful Degradation

- Writer fails → Template script
- Director fails → Simple 3-frame storyboard
- Visual fails → Offer different style
- Video fails → Save partial, retry later

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Integration tests
npm run test:integration
```

## Monitoring

### Logs

```bash
# View logs
tail -f logs/orchestrator.log

# PM2 logs
pm2 logs orchestrator
```

### Metrics

- Requests per minute
- Average cost per video
- Cache hit rate
- Error rate by component

### Database Queries

```sql
-- Daily cost summary
SELECT 
  DATE("createdAt") as date,
  component,
  SUM("costDollars") as total_cost,
  AVG("cacheHitRate") as avg_cache_hit
FROM cost_tracking
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("createdAt"), component;

-- User video count
SELECT 
  "userId",
  COUNT(DISTINCT "taskId") as videos_created,
  AVG("costDollars") as avg_cost
FROM cost_tracking
GROUP BY "userId"
ORDER BY videos_created DESC
LIMIT 20;
```

## Troubleshooting

### "Cannot find module '@fal-ai/client'"

Install dependencies:
```bash
npm install
```

### "pgvector extension not found"

Enable pgvector in PostgreSQL:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### "OpenAI API key invalid"

Check `.env` file has correct `OPENAI_API_KEY`.

### High costs

Check cache hit rate:
```sql
SELECT AVG("cacheHitRate") FROM cost_tracking WHERE component = 'orchestrator';
```

Should be > 0.60 (60%).

## Development

### Project Structure

```
orchestrator/
├── orchestrator.ts       # Main class
├── server.ts             # Express server
├── tools/
│   ├── rag-tools.ts      # Vector search
│   ├── agent-tools.ts    # Sub-agent spawning
│   └── media-tools.ts    # Midjourney + Kling
├── package.json
└── README.md
```

### Adding New Tools

1. Define tool in `orchestrator.ts` → `defineTools()`
2. Implement function in appropriate tools file
3. Update system prompt if needed
4. Add tests

### Debug Mode

```bash
LOG_LEVEL=debug npm run dev
```

## Production Deployment

See main AIDA deployment guide.

**PM2 config:**
```bash
pm2 start server.ts --name orchestrator --instances 2
```

---

**Status:** ✅ Production Ready (Sprint #2)  
**Version:** 1.0.0  
**Last Updated:** 2025-10-07
