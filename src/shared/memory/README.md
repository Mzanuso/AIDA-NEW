# ChromaDB Memory System

Shared memory system for all AIDA agents using ChromaDB for semantic search and retrieval.

## Features
- Cross-agent memory access
- Semantic search on conversations
- Persistent storage (when server available)
- Mock mode for testing
- Fast retrieval

## Usage
```typescript
import { ChromaManager } from '@/shared/memory/chroma-manager';

const memory = new ChromaManager();
await memory.initialize();

// Save conversation
await memory.saveConversation({
  agentId: 'orchestrator',
  sessionId: 'session-123',
  messages: [...]
});

// Retrieve conversation
const data = await memory.getConversation('session-123');

// Semantic search
const results = await memory.searchSimilar('video creation', 5);
```

## Collections
- `conversations`: User conversations across agents
- `technical_decisions`: Technical Planner decisions
- `agent_outputs`: Intermediate outputs from agents

## Environment Variables
```bash
CHROMA_SERVER_URL=http://localhost:8000  # ChromaDB server URL
CHROMA_USE_MOCK=true                      # Use mock mode for testing
NODE_ENV=test                             # Auto-enables mock mode
```

## Mock Mode
In test environment or when `CHROMA_USE_MOCK=true`, the system uses in-memory storage instead of ChromaDB server.
This allows development and testing without running a separate ChromaDB instance.
