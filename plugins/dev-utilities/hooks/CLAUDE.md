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

### tmux State Integration (`tmux-claude-state.sh`)
Writes per-pane Claude state to `/tmp/claude-tmux-state/<pane_num>` (the `%` is stripped from `$TMUX_PANE`). Silent no-op if `$TMUX_PANE` is unset, so safe to register unconditionally.

Hook event → state mapping:
- `SessionStart` → `idle`
- `UserPromptSubmit` → `processing`
- `Stop` / `SubagentStop` → `stopped`  ← both map here
- `SessionEnd` → file deleted

**Color semantics** (non-obvious): `stopped` = **green** (Claude awaiting user input), `processing` = yellow, `idle` = gray. "Stopped" is the highest-priority state in the session aggregator.

On each run, the hook auto-copies `tmux-claude-status.sh` → `~/.tmux/claude-status.sh` and `tmux-session-status.sh` → `~/.tmux/claude-sessions.sh`, using `cmp -s` to skip unchanged files.

`tmux.conf` carries the tag `# managed:claude-tmux-state` so the installer can locate and replace the block. `status-interval 2` — tmux polls the status scripts every 2 seconds.

**Activation**: run `/tmux-integrate` to install the `tmux.conf` fragment into the active tmux config. Without this step, the state files are written but nothing displays them.

## Implementation Notes

- Each hook is a **separate executable** (Python, shell, or JavaScript)
- Hooks are **synchronous** - execution blocks the operation
- Use `${CLAUDE_PLUGIN_ROOT}` to reference hook paths in hooks.json
- Matchers: `matcher: "Bash"` targets specific tools; `matcher: "clear"` targets SessionStart source type
