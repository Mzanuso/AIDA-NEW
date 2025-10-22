# Writer Agent

Microservice for AI-powered content generation including video scripts, marketing copy, blog posts, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- ANTHROPIC_API_KEY in `.env`

### Installation
```bash
cd src/agents/writer
npm install
```

### Run Development Server
```bash
npm run dev
```

Server will start on **port 3006** (configurable via `WRITER_AGENT_PORT` in `.env`)

## 📡 API Endpoints

### POST /api/write
Generate content based on request parameters.

**Request Body:**
```json
{
  "brief": "Create a 30-second video about sustainable fashion",
  "content_type": "video_script",
  "tone": "inspirational",
  "duration": 30,
  "language": "it",
  "target_audience": "environmentally conscious millennials",
  "key_messages": ["eco-friendly materials", "ethical production"],
  "call_to_action": "Shop our sustainable collection"
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "script": "Generated script text...",
    "scenes": [
      {
        "scene_number": 1,
        "description": "Opening shot...",
        "duration_seconds": 10,
        "voiceover": "Voiceover text...",
        "visual_cues": ["Product showcase", "Nature backdrop"]
      }
    ]
  },
  "metadata": {
    "content_type": "video_script",
    "tone_applied": "inspirational",
    "language": "it",
    "word_count": 120,
    "estimated_speaking_time_seconds": 48,
    "generation_time_ms": 1523,
    "model_used": "claude-3-5-sonnet-20241022"
  }
}
```

### GET /api/models
List available AI models for content generation.

### GET /api/content-types
List supported content types (video_script, marketing_copy, blog_post, etc.)

### GET /api/tones
List available tone options (professional, casual, energetic, etc.)

### GET /health
Health check endpoint.

## 🎨 Content Types

- **video_script** - Video scripts with scene breakdown
- **marketing_copy** - Persuasive marketing content
- **social_media** - Social media posts
- **blog_post** - Long-form blog content
- **product_description** - E-commerce product descriptions
- **ad_copy** - Advertisement copy

## 🎭 Tone Options

- professional
- casual
- energetic
- calm
- humorous
- serious
- inspirational
- educational

## 🛠️ Customization

### ⚠️ IMPORTANT: Customize Placeholder Skills

The Writer Agent includes **placeholder implementations** that need to be customized based on your specific requirements.

**Files to customize:**

1. **`writer-executor.ts`** - Content generation logic
   - Video script formatting
   - Scene structure
   - Marketing copy structure
   - Prompt engineering for each content type

2. **Prompt Templates** - Customize prompts in `buildVideoScriptPrompt()`, `buildMarketingPrompt()`, etc.
   - Adjust tone/style instructions
   - Add brand voice guidelines
   - Optimize for conversion goals

3. **Parsing Logic** - Customize output parsing in `parseScenes()`, `parseMarketingCopy()`
   - Scene extraction rules
   - Content structure formatting
   - Visual cue detection

### Example: Customizing Video Script Generation

```typescript
// In writer-executor.ts
private buildVideoScriptPrompt(request: WriterRequest): string {
  // CUSTOMIZE THIS based on your script format preferences
  return `You are a professional video scriptwriter...

  [Add your specific instructions here]
  - Your desired scene format
  - Your voiceover style
  - Your visual description format
  - Your timing preferences
  `;
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 🔧 Configuration

Environment variables (`.env`):
```env
WRITER_AGENT_PORT=3006
ANTHROPIC_API_KEY=sk-ant-api03-xxx
OPENAI_API_KEY=sk-proj-xxx  # Optional, for future GPT support
```

## 📝 TODO / Roadmap

- [x] Basic video script generation
- [x] Marketing copy generation
- [ ] **CUSTOMIZE SKILLS** - User must customize generation logic
- [ ] Platform-specific social media formatting
- [ ] Multi-language optimization
- [ ] Brand voice training
- [ ] A/B testing variations
- [ ] OpenAI GPT-4 integration as fallback
- [ ] Content caching for similar requests
- [ ] Analytics and performance tracking

## 🏗️ Architecture

```
writer/
├── types.ts              # Type definitions & Zod schemas
├── writer-executor.ts    # Core generation logic (CUSTOMIZE THIS!)
├── routes.ts             # Express API routes
├── server.ts             # HTTP server
├── package.json
└── tsconfig.json
```

## 🤝 Integration with Other Services

The Writer Agent is designed to work with:
- **Orchestrator** - Receives generation requests via `spawn_writer_agent` tool
- **Technical Planner** - Provides asset requirements that may need written content
- **Supabase Database** - Can store generated content for caching/retrieval

## 📚 Resources

- [Anthropic Claude API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Express.js Documentation](https://expressjs.com/)
- [Zod Schema Validation](https://zod.dev/)

## 🆘 Support

For issues or questions:
1. Check the placeholder comments in `writer-executor.ts`
2. Review existing microservices (Technical Planner, Visual Creator) for patterns
3. Consult project documentation in `ROADMAP.md` and `FLOW-STATUS.md`
