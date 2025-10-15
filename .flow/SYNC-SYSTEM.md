# 📚 AIDA Documentation Sync System

## 🎯 Problem Solved

**Before:** Documentation files (FLOW-STATUS.md, PRD.md, architecture/) would get out of sync when we made changes. Each file had to be updated manually, leading to inconsistencies.

**Now:** All project state lives in ONE file (`.flow/project-state.json`), and all documentation is auto-generated from it.

---

## 🏗️ Architecture

```
.flow/project-state.json (SINGLE SOURCE OF TRUTH)
        ↓ (auto-generates)
        ├── FLOW-STATUS.md
        ├── architecture/0-INDEX.md
        └── PRD.md (architecture section)
```

---

## 📝 How It Works

### 1. Edit the Source of Truth

```bash
# Open the central file
code .flow/project-state.json
```

Edit any of these fields:
- `version` - Project version
- `architecture.agents.*.completion` - Agent progress %
- `architecture.agents.*.status` - complete|refactoring|in_progress|design|not_started
- `currentFocus.phase` - What you're working on
- `currentFocus.changes` - What's changing
- Any other project state

### 2. Run the Sync Command

```bash
npm run sync:docs
```

This will:
- ✅ Read `.flow/project-state.json`
- ✅ Generate `FLOW-STATUS.md`
- ✅ Generate `architecture/0-INDEX.md`
- ✅ Update architecture section in `PRD.md`
- ✅ Keep everything in sync automatically

---

## 🤖 Automatic Sync (Future)

**Coming soon:** Git pre-commit hook that runs `sync:docs` automatically.

For now, run manually:
```bash
# After editing project-state.json
npm run sync:docs
git add .
git commit -m "Update project state"
```

---

## 📊 What Gets Generated

### FLOW-STATUS.md
- Current focus and changes
- All agent statuses with progress %
- Overall progress table
- Supported languages
- Capabilities summary

### architecture/0-INDEX.md
- System architecture diagram (as text)
- Agent roles and responsibilities
- Integration points
- Tech stack details

### PRD.md (Architecture Section)
- Updates only the "Content Generation Pipeline" section
- Keeps rest of PRD intact
- Shows V5 architecture flow

---

## 🎨 Example: Updating Agent Progress

**Scenario:** Orchestrator V5 refactoring reaches 50%

**Before (manual - error prone):**
```bash
# Edit FLOW-STATUS.md
# Edit architecture/0-INDEX.md  
# Edit PRD.md
# Hope you didn't miss anything...
```

**After (automated - consistent):**
```bash
# 1. Edit ONE file
code .flow/project-state.json
# Change: "orchestrator": { "completion": { "v5": 50 } }

# 2. Run sync
npm run sync:docs

# 3. All 3 docs updated consistently! ✨
```

---

## 🔧 Extending the System

### Add a New Generated Document

Edit `sync-docs.js`:

```javascript
function generateNewDocument() {
  const { agents } = projectState.architecture;
  
  let content = `# My New Doc\n\n`;
  // ... generate content from projectState
  
  return content;
}

// In main execution:
fs.writeFileSync('MY-NEW-DOC.md', generateNewDocument());
```

### Add New Fields to Track

Edit `.flow/project-state.json`:

```json
{
  "myNewField": "myValue",
  "architecture": {
    "agents": {
      "orchestrator": {
        "myCustomMetric": 42
      }
    }
  }
}
```

Then use it in `sync-docs.js`:
```javascript
const { myNewField } = projectState;
```

---

## ⚠️ Important Rules

### ✅ DO:
- Edit `.flow/project-state.json` to change project state
- Run `npm run sync:docs` after editing
- Commit both `project-state.json` and generated files together

### ❌ DON'T:
- Manually edit `FLOW-STATUS.md` (will be overwritten)
- Manually edit `architecture/0-INDEX.md` (will be overwritten)
- Manually edit PRD architecture section (will be overwritten)

### 📝 Manual Edits OK:
- `PRD.md` - Everything EXCEPT architecture section
- `AIDA-FLOW.md` - Methodology (not derived from state)
- `README.md` - High-level overview (manually maintained)
- `PROJECT-INSTRUCTIONS.md` - AIDA-FLOW protocol (manually maintained)

---

## 🚀 Quick Reference

```bash
# View current state
cat .flow/project-state.json | jq

# Edit state
code .flow/project-state.json

# Sync documentation
npm run sync:docs

# Verify changes
git diff FLOW-STATUS.md architecture/0-INDEX.md PRD.md

# Commit
git add .
git commit -m "Update: Orchestrator V5 at 50%"
```

---

## 📈 Benefits

1. **Single Source of Truth** - No conflicting information
2. **Consistency** - All docs always match
3. **Speed** - Update once, propagate everywhere
4. **Reduced Errors** - No manual copy-paste mistakes
5. **Clear History** - Git tracks project-state.json changes
6. **Easy Rollback** - Revert one file, regenerate all docs

---

## 🎯 Future Enhancements

- [ ] Git pre-commit hook for automatic sync
- [ ] Validation schema for project-state.json
- [ ] Generate visual diagrams from state
- [ ] Sync with Notion workspace
- [ ] Generate progress reports
- [ ] Changelog generation

---

**Created:** 2025-10-15  
**Status:** Active  
**Maintainer:** AIDA Team
