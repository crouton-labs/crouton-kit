# dev-utilities

Developer workflow automation via session and notification hooks.

## Hooks

### notification-sound.sh

**Trigger:** `Notification` event (when Claude needs attention/permission)

**Action:**
- Plays 4-tone ascending audio sequence using macOS `Tink.aiff` (volumes: 8, 5, 3, 8)
- Logs notification message to `~/.claude/logs/hooks.log` with timestamp

**Purpose:** Audible alert when Claude requires user input or approval.

---

### claude-md-manager.mjs

**Trigger:**
- `SessionStart` (when `clear` command is used)
- `SessionEnd` (when session terminates)

**Action:**
Spawns detached background worker that:

1. **Detects changes:** Runs `git diff --name-only HEAD` to find modified files
2. **Groups by directory:** Collects changed files per directory
3. **Filters candidates:**
   - Skips `.claude/` directories
   - Skips git-ignored files
   - Skips directories excluded in `.claude-md-manager-ignore` (global or local)
   - Skips global `~/.claude/CLAUDE.md`
   - Skips directories with <4 files (unless root or already has CLAUDE.md)
4. **Caches state:** Tracks file signatures (mtime + size) in `~/.claude/state/claude-md-manager-cache.json` to avoid reprocessing unchanged files
5. **Processes directories:** For each qualifying directory:
   - Reads existing CLAUDE.md (if present)
   - Collects parent CLAUDE.md files for context
   - Loads custom guidance from `.claude-md-manager.md` (if present)
   - Spawns Haiku 4.5 query with Write-only tool access
   - Agent decides whether to create/update/skip CLAUDE.md

**Behavior:**
- **Root directories:** Target ~150 lines, comprehensive project overview
- **Subdirectories:** Target <25–100 lines depending on complexity, only unique local context
- **Conservative updates:** Only modifies CLAUDE.md when changes are meaningful
- **Session deduplication:** Uses parent session ID to prevent duplicate processing across child sessions

**Configuration:**

Exclusion patterns (`.claude-md-manager-ignore`):
```
# Global: ~/.claude/.claude-md-manager-ignore or ~/.claude-md-manager-ignore
# Local: <project>/.claude-md-manager-ignore

node_modules
dist
commands/*
```

Custom guidance (`.claude-md-manager.md` in target directory):
- Provides directory-specific instructions to the CLAUDE.md generation agent
- Useful for enforcing local conventions or constraints

**Logs:** `~/.claude/logs/hooks.log`

---

## Installation

This plugin is automatically activated—no manual invocation required.
