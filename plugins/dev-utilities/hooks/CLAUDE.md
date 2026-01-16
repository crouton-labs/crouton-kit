# Hooks Directory

Claude Code lifecycle hooks that execute at specific session and tool events.

## Hook Types (hooks.json)

- **Notification** - Fires on file notifications (e.g., success sounds)
- **PreToolUse** - Before Write/Edit/MultiEdit/NotebookEdit tools execute
- **PostToolUse** - After Bash tool execution
- **SessionStart** - When session starts (matched on `clear` command)
- **SessionEnd** - When session ends

## Hook Implementations

- `protected-branch-guard.py` - PreToolUse: prevents accidental edits to protected files
- `push-to-protected-guard.py` - PreToolUse: blocks git push to protected branches, instructs to use extract-commits
- `push-pr-prompt.py` - PostToolUse: prompts for git push/PR creation after Bash commands
- `notification-sound.sh` - Notification: plays success sound feedback
- `claude-md-manager.mjs` - SessionStart/End: manages CLAUDE.md files

## Pattern Notes

- Each hook is a **separate executable** (Python, shell, or JavaScript)
- Hooks are **synchronous** - execution blocks the operation
- Use `${CLAUDE_PLUGIN_ROOT}` to reference hook paths in hooks.json
- Matchers support `|` for multiple tools (e.g., `Write|Edit`)
