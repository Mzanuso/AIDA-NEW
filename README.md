# AIDA NEW - Clean Version

**Created:** 2025-10-14
**Purpose:** Fresh start with only working code from AIDA-CLEAN

## Project Structure

```
D:\AIDA-NEW/
├── docs/                        # Documentation files
├── src/
│   ├── ui/                      # UI Components
│   │   ├── Launchpad.tsx
│   │   ├── StyleSelectorModal.tsx
│   │   └── components/          # Shadcn UI components
│   ├── agents/
│   │   ├── orchestrator/        # Conversational orchestrator service
│   │   └── style-selector/      # Style selector API service
│   └── database/
│       └── migrations/          # Database migration files
├── data/
│   └── sref_v2/                 # SREF style reference data
├── architecture/                # Architecture documentation
└── .flow/                       # AIDA-FLOW process files
```

## What's Included

### Working Components
- **UI Components:** Launchpad and StyleSelectorModal from `_FROZEN/client`
- **Orchestrator Service:** Conversational AI orchestrator (needs review)
- **Style Selector Service:** Working style selection API
- **Database:** Schema and migrations
- **SREF Data:** Complete style reference library (200 files)
- **Documentation:** All project docs, flow files, and architecture

### Configuration Files
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Vitest test configuration
- `postcss.config.js` - PostCSS configuration
- `drizzle.config.ts` - Drizzle ORM configuration

## What's NOT Included

The following were intentionally excluded:
- `node_modules/` - Install fresh with `npm install`
- `venv/` - Python virtual environments
- `_FROZEN/` - Archive directory
- `Old/` - Deprecated code
- `archive/` - Old documentation
- Writer/Director/Visual/Video agents - To be reimplemented

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## Next Steps

Refer to [START-HERE.md](START-HERE.md) for detailed instructions on:
- Setting up the development environment
- Understanding the AIDA-FLOW methodology
- Working with the agents and services

## Migration Notes

This is a clean extraction from `D:\AIDA-CLEAN` performed on 2025-10-14.
See the migration report for detailed information about what was copied.
