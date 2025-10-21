# .flow/ Folder - Session Protocol Enforcement Tools

**Version:** 1.0
**Purpose:** Maintain session discipline and protect project continuity
**Token Savings:** 90% (18,300 → 1,750 tokens per session)

---

## 📁 Files Overview

### 📄 Documentation Files (Mandatory - Never Delete)

| File | Size | Purpose | Update Frequency |
|------|------|---------|-----------------|
| `current.md` | 64 lines | Active sprint status | Every session |
| `memory.md` | 40 lines | Critical blockers & context | When changed |
| `session-protocol.md` | 150 lines | Token optimization guide | Rarely |
| `tests.json` | Auto | Test registry | Automatic |

### 🛠️ Enforcement Scripts (New)

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `session-start.sh` | Display mandatory reading checklist | Start of every session |
| `session-end.sh` | Verify files & prompt updates | End of every session |
| `install-hooks.sh` | Install git pre-commit hook | One-time setup |
| `pre-commit-hook.sh` | Protect mandatory files | Automatic (git) |

---

## 🚀 Quick Start

### First Time Setup

```bash
# 1. Install git hooks (one-time)
cd D:\AIDA-NEW
bash .flow/install-hooks.sh
```

### Every Session

```bash
# 2. Start session
bash .flow/session-start.sh

# 3. Work on tasks...
# (Claude reads mandatory sections only - ~1,750 tokens)

# 4. End session
bash .flow/session-end.sh

# 5. Commit changes
git add .
git commit -m "[FLOW-XXX] Description"
```

---

## 📖 Session Protocol Details

### Session Start (~1,750 tokens)

**MANDATORY Reading:**
1. `.flow/current.md` (ALL) - ~500 tokens
2. `.flow/memory.md` (ALL) - ~300 tokens
3. `FLOW-STATUS.md` (SECTIONS) - ~950 tokens
   - Lines 1-30: Current Focus
   - Lines 25-45: Agent Status table
   - Lines 59-103: Recent Completions (last 2)

**REFERENCE Reading (only when needed):**
- `FLOW-LOG.md` - Last session entry (~3,000 tokens)
- `ROADMAP.md` - Specific phase (~1,500 tokens)
- `PROJECT-INSTRUCTIONS.md` - Once per project

### Session End (Variable tokens)

**ALWAYS Update:**
- `.flow/current.md` - Status, next actions, blockers

**UPDATE ONLY IF:**
- `.flow/memory.md` - New blocker, milestone, architecture change
- `FLOW-STATUS.md` - Milestone completed, agent % changed
- `FLOW-LOG.md` - Session > 60 min, multiple milestones, decisions

---

## 🔒 Git Hook Protection

The pre-commit hook prevents:
- ❌ Deletion of mandatory files
- ❌ Commits with missing mandatory files
- ❌ Empty or corrupted .flow/current.md
- ❌ Empty or corrupted .flow/memory.md

**Protected Files:**
- `.flow/current.md`
- `.flow/memory.md`
- `.flow/session-protocol.md`
- `FLOW-STATUS.md`
- `FLOW-LOG.md`
- `PROJECT-INSTRUCTIONS.md`
- `ROADMAP.md`

**Bypass (NOT RECOMMENDED):**
```bash
git commit --no-verify
```

---

## 📊 Token Savings Comparison

### Before Optimization
```
Session Start:
- FLOW-STATUS.md: 2,500 tokens
- FLOW-LOG.md: 15,000 tokens
- Other files: 800 tokens
Total: ~18,300 tokens
```

### After Optimization
```
Session Start:
- .flow/current.md: 500 tokens
- .flow/memory.md: 300 tokens
- FLOW-STATUS.md (sections): 950 tokens
Total: ~1,750 tokens
Savings: 90%
```

---

## 🎯 Usage Examples

### Example 1: Normal Session
```bash
$ bash .flow/session-start.sh
🚀 AIDA-FLOW SESSION START
📖 MANDATORY READING (1,750 tokens)...
✅ Have you read all mandatory sections? [y/N] y
✅ Session protocol confirmed

# ... work on tasks ...

$ bash .flow/session-end.sh
🏁 AIDA-FLOW SESSION END
✅ All mandatory files intact
💡 Reminder: Commit changes before ending session
```

### Example 2: Blocked by Hook
```bash
$ git add .
$ git commit -m "Remove old files"
🔍 Checking mandatory files...
❌ ERROR: Attempting to delete mandatory file: FLOW-STATUS.md
This file is critical for project continuity and cannot be deleted.
```

### Example 3: Missing Mandatory File
```bash
$ git commit -m "Update docs"
🔍 Checking mandatory files...
⚠️  WARNING: The following mandatory files are missing:
   • .flow/current.md
Please restore them before committing.
```

---

## 🆘 Troubleshooting

### "Script not found" error
```bash
# Ensure you're in project root
cd D:\AIDA-NEW
pwd  # Should show D:\AIDA-NEW
```

### "Permission denied" on Unix/Mac
```bash
chmod +x .flow/*.sh
```

### Hook not working
```bash
# Reinstall hooks
bash .flow/install-hooks.sh

# Verify installation
ls -la .git/hooks/pre-commit
```

### Need to bypass hook temporarily
```bash
# Only use if absolutely necessary
git commit --no-verify -m "Emergency commit"
```

---

## 🔄 Maintenance

### Update Scripts
Scripts are versioned. To update:
1. Edit the script in `.flow/`
2. Re-run `bash .flow/install-hooks.sh` if updating pre-commit hook
3. Test with `bash .flow/session-start.sh` or `bash .flow/session-end.sh`

### Check Hook Status
```bash
cat .git/hooks/pre-commit | head -5
# Should show: "Git Pre-Commit Hook - Protect Mandatory Files"
```

---

## 📝 Version History

**v1.0 (2025-10-21):**
- Initial release
- Session start/end scripts
- Git pre-commit hook
- Token optimization (90% savings)
- Mandatory file protection

---

## 🤝 For New Team Members

1. **Read** `PROJECT-INSTRUCTIONS.md` (complete methodology)
2. **Install** hooks: `bash .flow/install-hooks.sh`
3. **Start** every session: `bash .flow/session-start.sh`
4. **End** every session: `bash .flow/session-end.sh`
5. **Never** delete files in `.flow/` folder

---

**Questions?** See `PROJECT-INSTRUCTIONS.md` or `.flow/session-protocol.md`
