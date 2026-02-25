# Hooks Directory

Claude Code lifecycle hooks that execute at specific session and tool events.

## Hook Types (hooks.json)

- **SessionStart** - When session starts (with optional `matcher` for `clear` or unconditional)
- **PreToolUse** - Before Bash tool execution (with tool matchers)
- **PostToolUse** - After Bash tool execution (with tool matchers)
- **SessionEnd** - When session ends
- **Notification** - Fires on events (e.g., success sounds)

## Active Hook Implementations

### SessionStart/SessionEnd
- `claude-md-manager.bundle.mjs` - Auto-creates/updates CLAUDE.md files for directories with git-changed files; uses caching and respects `.claude-md-manager-ignore` patterns
- `setup-path.sh` - Initializes PATH (SessionStart only)

### PreToolUse (Bash only)
- `push-to-protected-guard.py` - Blocks git push to protected branches
- `block-destructive-git.sh` - Prevents destructive git operations (e.g., `git reset --hard`)

### PostToolUse (Bash only)
- `push-pr-prompt.py` - Prompts for git push/PR creation after Bash commands
- `pr-merge-cleanup.py` - Cleanup operations after PR merges

### Notification
- `notification-sound.sh` - Plays success sound feedback

## Implementation Notes

- Each hook is a **separate executable** (Python, shell, or JavaScript)
- Hooks are **synchronous** - execution blocks the operation
- Use `${CLAUDE_PLUGIN_ROOT}` to reference hook paths in hooks.json
- Matchers: `matcher: "Bash"` targets specific tools; `matcher: "clear"` targets SessionStart source type
