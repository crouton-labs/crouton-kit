# Hooks Directory

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

**Silent failure mode**: the script parses `hook_event_name` from stdin JSON via `python3 -c ... 2>/dev/null`. If python3 is absent or the parse fails, `event` is empty and all `case` branches are skipped — no error, no state written. A crashed session also skips `SessionEnd`, leaving a stale state file; it clears only when the next session fires `SessionStart` on that pane.

`tmux.conf` carries the tag `# managed:claude-tmux-state` so the installer can locate and replace the block. `status-interval 2` — tmux polls the status scripts every 2 seconds.

**Activation**: run `/tmux-integrate` to install the helper scripts (`~/.tmux/claude-status.sh`, `~/.tmux/claude-sessions.sh`) and the `tmux.conf` fragment into the active tmux config. Without this step, the state files are written but nothing displays them.

## Hook Configuration Notes

- Use `${CLAUDE_PLUGIN_ROOT}` to reference hook paths in hooks.json
- `matcher: "clear"` targets SessionStart source type (not a tool name); see `hook-development.md` rules for the full event/matcher reference
