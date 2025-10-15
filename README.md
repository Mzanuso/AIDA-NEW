# 🎬 AIDA V5

**AI Multimedia Creation Platform**

[![Architecture](https://img.shields.io/badge/Architecture-V5-blue)]()
[![Methodology](https://img.shields.io/badge/Methodology-AIDA--FLOW-green)]()
[![Database](https://img.shields.io/badge/Database-Supabase-orange)]()

---

## 🚀 Overview

AIDA is an advanced AI-powered platform for creating multimedia content through natural conversation. Version 5 introduces a multi-agent architecture with enhanced capabilities for video, image, and text generation.

### Key Features

- 🤖 **Multi-Agent Architecture** - Specialized agents for different creative tasks
- 🌍 **Multi-Language Support** - IT, EN, ES, FR, DE
- 🎨 **Style Management** - Proactive style proposals and consistency
- 🎥 **Media Generation** - Integration with FAL.AI and KIE.AI (Midjourney)
- 📊 **Supabase Backend** - Scalable PostgreSQL database
- ⚡ **AIDA-FLOW Methodology** - Test-first, micro-sprint development

---

## 🏗 Architecture

### Multi-Agent System

```
Orchestrator (Account Manager)
    ├── Style Selector Agent
    ├── Writer Agent
    ├── Director Agent
    ├── Visual Creator Agent
    └── Video Composer Agent
```

### Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + Drizzle ORM
- **Database:** PostgreSQL (Supabase)
- **AI:** Claude Sonnet 4.5 (Anthropic)
- **Media:** FAL.AI, KIE.AI

---

## 📊 Development Status

| Agent | Progress |
|-------|----------|
| Orchestrator | 80% |
| Style Selector | 60% |
| Writer | 40% |
| Director | 40% |
| Visual Creator | 0% |
| Video Composer | 0% |

---

## 🔧 Setup

```bash
# Clone repository
git clone https://github.com/Mzanuso/AIDA-NEW.git

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development
npm run dev
```

---

## 📖 Documentation

- [AIDA-FLOW Methodology](./AIDA-FLOW.md)
- [Project Instructions](./PROJECT-INSTRUCTIONS.md)
- [Flow Status](./FLOW-STATUS.md)
- [Architecture Details](./architecture/)

---

## 🧪 Development Methodology

AIDA uses **AIDA-FLOW**, a test-first micro-sprint approach:

1. **SPEC** - Define exact outcome
2. **TEST** - Write test first
3. **CODE** - Minimal implementation
4. **VERIFY** - Green tests or stop
5. **CHECKPOINT** - Commit and document

Max 20 minutes per sprint, max 100 lines per commit.

---

## 🔒 Environment Variables

```bash
# API Keys
ANTHROPIC_API_KEY=your_key_here
FAL_API_KEY=your_key_here
KIE_API_KEY=your_key_here

# Database
DATABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Ports
PORT_API_GATEWAY=3000
PORT_AUTH_SERVICE=3001
PORT_ORCHESTRATOR=3003
```

---

## 🤝 Contributing

This project follows strict AIDA-FLOW principles:

- ✅ Test-first development
- ✅ Micro-commits (< 100 lines)
- ✅ Green tests always
- ✅ Clear documentation

See [PROJECT-INSTRUCTIONS.md](./PROJECT-INSTRUCTIONS.md) for details.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Contact

- **GitHub:** [@Mzanuso](https://github.com/Mzanuso)
- **Project:** [AIDA-NEW](https://github.com/Mzanuso/AIDA-NEW)

---

**Status:** 🟡 Active Development  
**Version:** 5.0  
**Last Updated:** 2025-10-15
