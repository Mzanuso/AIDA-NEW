# AIDA Orchestrator V3 - Complete Implementation Guide

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Conversational Refactor](#phase-1-conversational-refactor)
4. [Phase 2: Evolutionary System](#phase-2-evolutionary-system)
5. [Complete Implementation](#complete-implementation)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Guide](#deployment-guide)
8. [Monitoring & Maintenance](#monitoring-maintenance)

---

## Executive Summary

This document provides a complete implementation guide for rewriting the AIDA Orchestrator from a mechanical "form compiler" to an intelligent, conversational AI assistant that learns and improves over time.

### Key Transformations
- **From:** 3-4 sequential LLM calls (6-12s latency)
- **To:** Single LLM call (<2s latency)
- **Personality:** Zerocalcare-inspired (direct, sarcastic, constructive)
- **Evolution:** Self-improving through pattern recognition and feedback loops

### Implementation Timeline
- **Phase 1:** Conversational Refactor (2-3 days)
- **Phase 2:** Evolutionary System (3-4 days)
- **Total:** 5-7 days for complete rewrite

---

## Architecture Overview

### Current Problems
```
Current Orchestrator:
├── Multiple LLM calls (slow)
├── Form-like mentality
├── No memory/learning
├── Mechanical responses
└── Poor user experience
```

### New Architecture
```
AIDA V3 Orchestrator:
├── Single LLM call (fast)
├── Natural conversation
├── Evolutionary learning
├── Personality-driven
└── Continuous improvement
```

### Technology Stack
- **Runtime:** Node.js + TypeScript
- **LLM:** Claude 3 Sonnet (Anthropic)
- **Database:** PostgreSQL with Prisma ORM
- **Testing:** Vitest
- **Dependencies:** date-fns, anthropic SDK

---

## Phase 1: Conversational Refactor

### 1.1 Core Concept

Transform the orchestrator from sequential processing to single-call intelligence:

```typescript
// OLD APPROACH (Remove this)
message → IntentAnalyzer → ToolSelector → ResponseGenerator → output
// 3-4 LLM calls, 6-12 seconds

// NEW APPROACH (Implement this)
message → SingleClaudeCall → output
// 1 LLM call, <2 seconds
```

### 1.2 File Structure

```
backend/services/orchestrator/src/
├── core/
│   ├── conversational-orchestrator.ts  # Main orchestrator class
│   ├── mega-prompt-builder.ts         # Prompt construction
│   └── response-parser.ts             # Response parsing
├── config/
│   ├── personality-prompt.ts          # Zerocalcare personality
│   └── embedded-catalog.ts            # Tool catalog
├── types/
│   └── orchestrator.types.ts          # TypeScript interfaces
└── __tests__/
    └── conversational.test.ts          # New tests
```

### 1.3 Implementation Details

#### File: `core/conversational-orchestrator.ts`

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { MegaPromptBuilder } from './mega-prompt-builder';
import { ResponseParser } from './response-parser';
import { ConversationState, OrchestratorResponse } from '../types/orchestrator.types';

export class ConversationalOrchestrator {
  private claude: Anthropic;
  private promptBuilder: MegaPromptBuilder;
  private responseParser: ResponseParser;
  
  constructor() {
    this.claude = new Anthropic({ 
      apiKey: process.env.ANTHROPIC_API_KEY 
    });
    this.promptBuilder = new MegaPromptBuilder();
    this.responseParser = new ResponseParser();
  }

  async processMessage(
    message: string, 
    sessionId: string,
    userId: string
  ): Promise<OrchestratorResponse> {
    const startTime = Date.now();
    
    // 1. Load conversation context (last 5-10 messages)
    const context = await this.loadConversationContext(sessionId);
    
    // 2. Build mega-prompt with everything embedded
    const megaPrompt = this.promptBuilder.build(message, context);
    
    // 3. Single Claude call (target: <2 seconds)
    const response = await this.claude.messages.create({
      model: 'claude-3-sonnet-20240229',
      messages: megaPrompt,
      temperature: 0.7,
      max_tokens: 500
    });
    
    // 4. Parse structured response
    const parsed = this.responseParser.parse(response);
    
    // 5. Async agent triggering (non-blocking)
    if (parsed.agentPlan) {
      this.triggerAgentsAsync(parsed.agentPlan);
    }
    
    // 6. Save conversation state
    await this.saveConversationState(sessionId, parsed.stateUpdate);
    
    // Verify we're under 2 seconds
    const responseTime = Date.now() - startTime;
    if (responseTime > 2000) {
      console.warn(`Slow response: ${responseTime}ms`);
    }
    
    return {
      message: parsed.userResponse,
      sessionId,
      timestamp: new Date()
    };
  }

  private async loadConversationContext(sessionId: string): Promise<ConversationState> {
    // Implementation details in full code
  }

  private async triggerAgentsAsync(agentPlan: any): Promise<void> {
    // Fire and forget - non-blocking
    setImmediate(async () => {
      // Agent triggering logic
    });
  }

  private async saveConversationState(sessionId: string, update: any): Promise<void> {
    // Save to database
  }
}
```

#### File: `config/personality-prompt.ts`

```typescript
export const ZEROCALCARE_PERSONALITY = `
Sei AIDA, consulente creativo con personalità ispirata a Zerocalcare.

PERSONALITÀ E TONO:
- Diretto e sarcastico, ma costruttivo
- Ironico ma mai offensivo
- Parli come parlerebbe un amico, non un'azienda
- Usi riferimenti pop/nerd quando ci stanno
- Zero formalismi, zero "aziendalese"
- Battute veloci, non spiegoni

ESEMPI DI TONO:
✅ "Gioielli artigianali? Scommetto che c'è di mezzo una nonna..."
✅ "Aspè, quindi vuoi una roba elegante ma che non sembri tuo nonno?"
✅ "Ok dai, vediamo di tirar fuori qualcosa di figo"
✅ "Madonna che casino, ma ce la possiamo fare"

❌ MAI: "Perfetto! Sarà fantastico!"
❌ MAI: "Ho preparato delle opzioni per te"
❌ MAI: "Certamente! Procediamo subito!"

GESTIONE CONVERSAZIONE:
1. Ascolta più di quanto parli
2. Raccogli info mentre chiacchieri, non interrogando
3. Adattati al livello dell'utente (pro/novizio)
4. Rispondi nella lingua dell'utente automaticamente
5. Mai più di una domanda per messaggio

QUANDO SUGGERIRE AGENTI (senza nominarli):
- Style Selector: "Ti faccio vedere un po' di roba visiva"
- Writer: "Dai, mettiamo giù sta storia"  
- Director: "Vediamo come tradurla in scene"

IMPORTANTE: Non nominare MAI modelli tecnici (Kling, Midjourney, etc.)
Parla di risultati, non di strumenti.`;

export const INTELLIGENCE_PROMPT = `
ANALISI CONVERSAZIONALE (invisibile all'utente):

Durante ogni messaggio devi:
1. Identificare cosa vuole VERAMENTE l'utente
2. Capire il suo livello (novizio/esperto)
3. Dedurre urgenza e contesto
4. Decidere se/quando attivare agenti

STATO DA TRACCIARE:
{
  gathered: {
    contentType?: 'video'|'image'|'campaign'|'story',
    purpose?: string,
    style?: string,
    platform?: string,
    brandContext?: string,
    timeline?: string,
    budget?: 'low'|'medium'|'high'
  },
  userProfile: {
    expertise: 'novice'|'intermediate'|'expert',
    urgency: 'relaxed'|'normal'|'rushed',
    personality: 'explorer'|'decisive'|'perfectionist',
    language: auto-detect
  },
  agentReadiness: {
    styleSelector: 'not_ready'|'can_suggest'|'ready',
    writer: 'not_ready'|'can_suggest'|'ready',
    director: 'not_ready'|'needs_script'|'ready'
  }
}

OUTPUT STRUTTURATO:
Rispondi SEMPRE in questo formato JSON:
{
  "userResponse": "Risposta naturale in stile Zerocalcare",
  "stateUpdate": { ...aggiornamenti stato... },
  "agentPlan": null | {
    "agent": "styleSelector|writer|director",
    "params": { ...contesto raccolto... }
  }
}`;
```

#### File: `core/mega-prompt-builder.ts`

```typescript
import { ZEROCALCARE_PERSONALITY, INTELLIGENCE_PROMPT } from '../config/personality-prompt';
import { EMBEDDED_CATALOG } from '../config/embedded-catalog';

export class MegaPromptBuilder {
  build(
    userMessage: string,
    conversationHistory: Message[],
    currentState: ConversationState
  ): AnthropicMessage[] {
    const systemPrompt = `
${ZEROCALCARE_PERSONALITY}

${INTELLIGENCE_PROMPT}

<tool_catalog>
${EMBEDDED_CATALOG}
</tool_catalog>

<current_state>
${JSON.stringify(currentState, null, 2)}
</current_state>

IMPORTANTE: 
- Rispondi in JSON come specificato
- Tempo target risposta: <2 secondi
- Max 2-3 frasi per risposta
- Adatta automaticamente la lingua`;

    const messages: AnthropicMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add last 5-10 messages for context
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }
}
```

### 1.4 Types Definition

```typescript
// File: types/orchestrator.types.ts

export interface ConversationState {
  sessionId: string;
  userId: string;
  messages: Message[];
  gathered: {
    contentType?: 'video' | 'image' | 'campaign' | 'story';
    purpose?: string;
    style?: string;
    platform?: string;
    brandContext?: string;
    timeline?: string;
    budget?: 'low' | 'medium' | 'high';
  };
  userProfile: {
    expertise: 'novice' | 'intermediate' | 'expert';
    urgency: 'relaxed' | 'normal' | 'rushed';
    personality: 'explorer' | 'decisive' | 'perfectionist';
    language: string;
  };
  agentReadiness: {
    styleSelector: 'not_ready' | 'can_suggest' | 'ready';
    writer: 'not_ready' | 'can_suggest' | 'ready';
    director: 'not_ready' | 'needs_script' | 'ready';
  };
}

export interface OrchestratorResponse {
  message: string;
  sessionId: string;
  timestamp: Date;
}

export interface AgentExecutionPlan {
  agent: 'styleSelector' | 'writer' | 'director' | 'visualCreator' | 'videoComposer';
  params: any;
  priority: 'immediate' | 'background';
}
```

---

## Phase 2: Evolutionary System

### 2.1 Overview

Add self-improvement capabilities through four evolutionary modules:

```
Evolutionary Modules:
├── Holiday Intelligence (dates & events)
├── Performance Learning (feedback loops)
├── Trend Intelligence (current trends)
└── Conversation Evolution (improves dialogue)
```

### 2.2 Extended File Structure

```
backend/services/orchestrator/src/
├── evolution/
│   ├── holiday-intelligence.ts
│   ├── performance-learning.ts
│   ├── trend-intelligence.ts
│   └── conversation-evolution.ts
├── core/
│   └── evolutionary-orchestrator.ts  # Extends conversational
└── __tests__/
    └── evolution.test.ts
```

### 2.3 Holiday Intelligence Module

```typescript
// File: evolution/holiday-intelligence.ts

import { addDays, format, getYear } from 'date-fns';

export class HolidayIntelligence {
  // Fixed holidays (same date every year)
  private fixedHolidays: Record<string, Holiday> = {
    "01-01": {
      name: "Capodanno",
      type: "fixed",
      anticipationDays: 7,
      keywords: ["nuovo anno", "propositi", "fresh start"],
      contentSuggestions: [
        "Retrospettiva dell'anno passato",
        "Obiettivi e propositi",
        "Nuovo inizio per il brand"
      ]
    },
    "02-14": {
      name: "San Valentino",
      type: "fixed",
      anticipationDays: 14,
      keywords: ["amore", "coppia", "romantico"],
      contentSuggestions: [
        "Prodotti per coppie",
        "Storia d'amore del brand",
        "Anti-San Valentino per single"
      ]
    }
    // ... more holidays
  };

  // Calculate movable holidays (Easter, etc.)
  private calculateEaster(year: number): Date {
    // Gauss algorithm for Easter calculation
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
  }

  async getUpcomingEvents(
    locale: string = 'it',
    daysAhead: number = 14
  ): Promise<Array<HolidayEvent>> {
    // Combine fixed, movable, and trending holidays
    // Return events within daysAhead window
  }
}
```

### 2.4 Performance Learning Module

```typescript
// File: evolution/performance-learning.ts

export class PerformanceLearning {
  private readonly FEEDBACK_DELAY_HOURS = 24;
  
  async registerContent(metadata: ContentMetadata): Promise<void> {
    // Save content metadata
    // Schedule feedback request after 24h
    await this.db.content_metadata.create({
      data: {
        ...metadata,
        feedback_requested: false,
        feedback_scheduled_at: addHours(new Date(), 24)
      }
    });
    
    this.scheduleFeedbackRequest(metadata.id);
  }

  async recordPerformance(
    contentId: string,
    performance: 'poor' | 'average' | 'good' | 'excellent'
  ): Promise<void> {
    // Update success patterns
    // Learn what works
    const patterns = await this.analyzePatterns(contentId, performance);
    await this.updatePatternConfidence(patterns);
  }

  async getSuccessSuggestions(context: any): Promise<Suggestion[]> {
    // Based on learned patterns
    // Return contextual suggestions
    const patterns = await this.getRelevantPatterns(context);
    return this.patternsToSuggestions(patterns);
  }
}
```

### 2.5 Complete Evolutionary Orchestrator

```typescript
// File: core/evolutionary-orchestrator.ts

import { ConversationalOrchestrator } from './conversational-orchestrator';
import { HolidayIntelligence } from '../evolution/holiday-intelligence';
import { PerformanceLearning } from '../evolution/performance-learning';
import { TrendIntelligence } from '../evolution/trend-intelligence';
import { ConversationEvolution } from '../evolution/conversation-evolution';

export class EvolutionaryOrchestrator extends ConversationalOrchestrator {
  private holidayIntel: HolidayIntelligence;
  private performanceLearn: PerformanceLearning;
  private trendIntel: TrendIntelligence;
  private conversationEvo: ConversationEvolution;

  constructor() {
    super();
    
    // Initialize evolutionary modules
    this.holidayIntel = new HolidayIntelligence();
    this.performanceLearn = new PerformanceLearning(this.db, this);
    this.trendIntel = new TrendIntelligence(this.claude, this.db);
    this.conversationEvo = new ConversationEvolution(this.db, this.claude);

    // Start evolution
    this.startEvolution();
  }

  async processMessage(
    message: string,
    sessionId: string,
    userId: string
  ): Promise<OrchestratorResponse> {
    // Get evolutionary context
    const [holidays, insights, trends] = await Promise.all([
      this.holidayIntel.getUpcomingEvents(),
      this.performanceLearn.getContextualInsights(context),
      this.trendIntel.getRelevantTrends(context)
    ]);

    // Build enhanced prompt
    const evolutionaryContext = {
      holidays: this.holidayIntel.formatEventContext(holidays),
      insights,
      trends: this.trendIntel.formatTrendContext(trends)
    };

    // Process with evolution
    return super.processMessage(message, sessionId, userId, evolutionaryContext);
  }
}
```

---

## Complete Implementation

### Step-by-Step Implementation Plan

#### Day 1: Setup & Conversational Core
1. **Morning (4h)**
   - Create new branch: `feat/orchestrator-v3`
   - Set up file structure
   - Implement `ConversationalOrchestrator` class
   - Create `MegaPromptBuilder`

2. **Afternoon (4h)**
   - Implement personality system
   - Create response parser
   - Write embedded catalog
   - Initial testing

#### Day 2: Complete Conversational & Test
1. **Morning (4h)**
   - Complete agent triggering system
   - Implement state management
   - Add language detection
   - Performance optimization

2. **Afternoon (4h)**
   - Write comprehensive tests
   - Fix bugs
   - Performance benchmarking
   - Integration testing

#### Day 3: Evolutionary Foundation
1. **Morning (4h)**
   - Database schema updates
   - Implement Holiday Intelligence
   - Create Performance Learning structure

2. **Afternoon (4h)**
   - Implement Trend Intelligence
   - Basic conversation evolution
   - Integration scaffolding

#### Day 4: Complete Evolution
1. **Morning (4h)**
   - Complete all evolutionary modules
   - Create EvolutionaryOrchestrator
   - Integration testing

2. **Afternoon (4h)**
   - Admin routes
   - Monitoring setup
   - Final testing

#### Day 5: Polish & Deploy
1. **Morning (4h)**
   - Bug fixes
   - Performance optimization
   - Documentation

2. **Afternoon (4h)**
   - Deployment preparation
   - Production testing
   - Monitoring setup

---

## Testing Strategy

### Unit Tests

```typescript
describe('ConversationalOrchestrator', () => {
  it('should respond in <2 seconds', async () => {
    const start = Date.now();
    const response = await orchestrator.processMessage(
      "Voglio fare un video",
      "session123",
      "user123"
    );
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(2000);
  });

  it('should maintain Zerocalcare personality', async () => {
    const response = await orchestrator.processMessage(
      "Voglio qualcosa di perfetto",
      "session123",
      "user123"
    );
    
    expect(response.message).not.toMatch(/perfetto|eccellente/);
    expect(response.message).toMatch(/ok|dai|aspè/);
  });

  it('should adapt language automatically', async () => {
    const itResponse = await orchestrator.processMessage(
      "Ciao, voglio un video",
      "session1",
      "user1"
    );
    expect(itResponse.message).toMatch(/video|fare/);
    
    const enResponse = await orchestrator.processMessage(
      "Hi, I need a video",
      "session2",
      "user2"
    );
    expect(enResponse.message).toMatch(/video|create/);
  });
});
```

### Integration Tests

```typescript
describe('Evolutionary Features', () => {
  it('should detect upcoming holidays', async () => {
    const response = await orchestrator.processMessage(
      "Cosa posso fare per San Valentino?",
      "session123",
      "user123"
    );
    
    expect(response.message).toContain('San Valentino');
  });

  it('should learn from feedback', async () => {
    // Create content
    const content = await orchestrator.processMessage(
      "Crea un video",
      "session123",
      "user123"
    );
    
    // Simulate 24h later
    jest.advanceTimersByTime(24 * 60 * 60 * 1000);
    
    // Should ask for feedback
    const followUp = await orchestrator.processMessage(
      "Ciao",
      "session123",
      "user123"
    );
    
    expect(followUp.message).toContain('com\'è andato');
  });
});
```

### Performance Benchmarks

```
Target Metrics:
├── Response Time: <2s (p95)
├── Memory Usage: <500MB
├── Concurrent Users: 100+
├── Evolution Overhead: <500ms
└── Cache Hit Rate: >80%
```

---

## Deployment Guide

### Prerequisites
```bash
# Node.js 18+
node --version

# PostgreSQL 14+
psql --version

# Environment variables
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Seed initial data (holidays, etc.)
npm run seed
```

### Build & Deploy
```bash
# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3003

CMD ["npm", "run", "start:prod"]
```

### Environment Configuration
```env
# Production .env
NODE_ENV=production
PORT=3003

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/aida_prod

# Evolution Settings
EVOLUTION_ENABLED=true
FEEDBACK_DELAY_HOURS=24
TREND_UPDATE_INTERVAL_DAYS=7

# Performance
MAX_RESPONSE_TIME_MS=2000
PARALLEL_EVOLUTION=true
CACHE_DURATION_DAYS=7
```

---

## Monitoring & Maintenance

### Key Metrics to Monitor

```typescript
interface OrchestratorMetrics {
  // Performance
  avgResponseTime: number;
  p95ResponseTime: number;
  slowResponseRate: number;
  
  // Evolution
  patternsLearned: number;
  feedbackResponseRate: number;
  trendAccuracy: number;
  
  // Usage
  dailyActiveUsers: number;
  messagesProcessed: number;
  agentTriggers: number;
  
  // Health
  errorRate: number;
  uptime: number;
  memoryUsage: number;
}
```

### Monitoring Dashboard
```typescript
// File: monitoring/dashboard.ts

export class OrchestratorDashboard {
  async getMetrics(): Promise<OrchestratorMetrics> {
    const [performance, evolution, usage, health] = await Promise.all([
      this.getPerformanceMetrics(),
      this.getEvolutionMetrics(),
      this.getUsageMetrics(),
      this.getHealthMetrics()
    ]);

    return { ...performance, ...evolution, ...usage, ...health };
  }

  private async getPerformanceMetrics() {
    // Query response times from last 24h
    const responseTimes = await this.db.orchestrator_logs.findMany({
      where: { createdAt: { gte: subDays(new Date(), 1) } },
      select: { responseTime: true }
    });

    return {
      avgResponseTime: average(responseTimes),
      p95ResponseTime: percentile(responseTimes, 95),
      slowResponseRate: responseTimes.filter(t => t > 2000).length / responseTimes.length
    };
  }
}
```

### Maintenance Tasks

#### Daily
- Check response time metrics
- Review error logs
- Verify evolution modules active

#### Weekly
- Analyze learned patterns
- Review conversation quality
- Update trending events cache
- Check feedback response rates

#### Monthly
- Full performance audit
- Evolution effectiveness review
- Prompt optimization based on learnings
- Database cleanup (old patterns)

### Troubleshooting Guide

#### High Response Times
```bash
# Check Claude API latency
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-sonnet-20240229","messages":[{"role":"user","content":"Test"}],"max_tokens":10}'

# Check database query times
npm run analyze:queries

# Enable detailed logging
LOG_LEVEL=debug npm start
```

#### Evolution Not Working
```bash
# Verify evolution enabled
echo $EVOLUTION_ENABLED

# Check background jobs
npm run jobs:status

# Manual evolution update
npm run evolution:update

# View evolution metrics
curl http://localhost:3003/api/orchestrator/evolution/metrics
```

#### Memory Issues
```bash
# Heap snapshot
node --inspect npm start
# Then use Chrome DevTools

# Increase memory limit
node --max-old-space-size=4096 npm start

# Check for memory leaks
npm run test:memory
```

---

## Appendix A: Complete Database Schema

```prisma
// schema.prisma additions

model ConversationSession {
  id        String   @id @default(uuid())
  userId    String
  state     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  messages  ConversationMessage[]
}

model ConversationMessage {
  id        String   @id @default(uuid())
  sessionId String
  session   ConversationSession @relation(fields: [sessionId], references: [id])
  role      String
  content   String
  metadata  Json?
  createdAt DateTime @default(now())
}

model ContentMetadata {
  id                   String   @id @default(uuid())
  type                 String
  style                String
  duration             Int?
  platform             String?
  topic                String
  dayOfWeek            Int
  hourOfDay            Int
  keywords             String[]
  feedbackRequested    Boolean  @default(false)
  feedbackScheduledAt  DateTime?
  userId               String
  createdAt            DateTime @default(now())
  
  performances         PerformanceData[]
}

model PerformanceData {
  id           String          @id @default(uuid())
  contentId    String
  content      ContentMetadata @relation(fields: [contentId], references: [id])
  performance  String
  metrics      Json?
  userFeedback String?
  recordedAt   DateTime        @default(now())
}

model SuccessPattern {
  id             String   @id @default(uuid())
  pattern        String   @unique
  avgPerformance Float
  occurrences    Int
  confidence     Float
  lastUpdated    DateTime @default(now())
}

model TrendData {
  id               String   @id @default(uuid())
  name             String   @unique
  category         String
  strength         Float
  keywords         String[]
  exampleContent   String[]
  platformSpecific Json?
  expiresAt        DateTime?
  lastUpdated      DateTime @default(now())
  createdAt        DateTime @default(now())
}

model ConversationMetrics {
  id                     String   @id @default(uuid())
  sessionId              String
  userId                 String
  turns                  Int
  completionRate         Float
  userSatisfaction       Int?
  confusionPoints        String[]
  successfulAgentTriggers String[]
  failedAgentTriggers    String[]
  avgResponseTime        Float
  language               String
  userType               String
  recordedAt             DateTime @default(now())
}

model ConversationAnalysis {
  id           String   @id @default(uuid())
  patterns     Json
  improvements Json
  analyzedAt   DateTime @default(now())
}
```

---

## Appendix B: API Documentation

### Core Endpoints

#### POST /api/orchestrator/chat
Main conversation endpoint.

**Request:**
```json
{
  "message": "Voglio creare un video per Instagram",
  "sessionId": "optional-session-id",
  "userId": "user123"
}
```

**Response:**
```json
{
  "message": "Instagram, ok! Che tipo di contenuto hai in mente?",
  "sessionId": "session-123",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### GET /api/orchestrator/session/:sessionId
Get session history and state.

#### GET /api/orchestrator/health
Health check endpoint.

### Evolution Endpoints

#### GET /api/orchestrator/evolution/metrics
Get evolution system metrics.

#### POST /api/orchestrator/evolution/feedback/:contentId
Submit manual feedback for content.

#### GET /api/orchestrator/evolution/patterns
View learned success patterns.

---

## Appendix C: Migration Guide

### From V2 to V3

1. **Backup Database**
```bash
pg_dump aida_prod > backup_$(date +%Y%m%d).sql
```

2. **Run Migrations**
```bash
npx prisma migrate deploy
```

3. **Update Environment**
```bash
# Add new variables
echo "EVOLUTION_ENABLED=true" >> .env
echo "SINGLE_CALL_MODE=true" >> .env
```

4. **Deploy New Code**
```bash
git checkout feat/orchestrator-v3
npm ci
npm run build
```

5. **Gradual Rollout**
```typescript
// Use feature flag for gradual rollout
if (process.env.USE_V3_ORCHESTRATOR === 'true') {
  orchestrator = new EvolutionaryOrchestrator();
} else {
  orchestrator = new LegacyOrchestrator();
}
```

---

## Conclusion

This complete rewrite transforms AIDA's orchestrator from a mechanical tool into an intelligent, evolving assistant that:

- **Responds naturally** with personality and context awareness
- **Learns continuously** from user interactions and feedback
- **Adapts automatically** to trends, events, and user preferences
- **Performs efficiently** with <2s response times

The implementation is designed to be:
- **Maintainable**: Clear separation of concerns
- **Testable**: Comprehensive test coverage
- **Scalable**: Handles growth gracefully
- **Evolvable**: Improves with use

Total implementation time: 5-7 days for a complete, production-ready system.

---

*Document Version: 1.0*  
*Last Updated: January 2024*  
*Author: AIDA Development Team*