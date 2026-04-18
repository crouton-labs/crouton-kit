# Hooks Directory

## Active Hook Implementations

### SessionStart/SessionEnd
- `claude-md-manager.bundle.mjs` - Auto-creates/updates CLAUDE.md files for directories with git-changed files (source: `claude-md-manager.mjs`)
- `setup-path.sh` - Initializes PATH (SessionStart only)

#### claude-md-manager non-obvious behavior

**Two-process detach**: The hook reads stdin, spawns a detached child with `--background`, and immediately calls `process.exit(0)` so Claude is never blocked. All LLM calls happen in the background worker.

**Two trigger conditions** (both handled in main()):
- `SessionEnd` — fires after every session; `reason === 'other'` guard exits immediately to prevent looping when `query()` inside the hook re-fires `SessionEnd`.
- `SessionStart` with `source === 'clear'` — fires only on `/clear`; no `reason` guard needed since this source type is never emitted by internal `query()` calls.

**Recursion guards** (all three must hold or the hook silently no-ops):
- `reason === 'other'` check — SessionEnd only; does not apply to SessionStart path.
- Lock file at `~/.claude/state/claude-md-{parentSessionId}.lock` — keyed to the *parent* session ID extracted from the transcript's first `session_start` event, not the current `sessionId`. Child sessions spawned by the hook would otherwise re-trigger processing.
- `hooks: {}` in `query()` options — disables all hooks in the sub-agent so the sub-agent's own `SessionEnd` can't re-enter this hook.

**`allowedTools: []` + `permissionMode: "bypassPermissions"` are coupled**: `bypassPermissions` grants full tool access despite the empty list. Changing `permissionMode` to anything else silently leaves the sub-agent with no tools — Write calls fail without error output.

**Directory skip threshold**: Non-root dirs with `< 4 files` and no existing `CLAUDE.md` are skipped entirely. Root is always processed.

**Cache** (`~/.claude/state/claude-md-manager-cache.json`): keyed by absolute path, value is `{mtimeMs, size}`. A file that changes mtime without changing content will still re-process.

**Multi-repo discovery**: If `cwd` is not itself a git repo, the hook scans immediate children for `.git` entries. Handles workspace roots that aren't git repos themselves.

**Per-directory prompt injection**: Drop a `.claude-md-manager.md` file in any directory to append custom guidance to the LLM prompt for that directory only.

**Ignore patterns** (`~/.claude/.claude-md-manager-ignore`, `~/.claude-md-manager-ignore`, or `<cwd>/.claude-md-manager-ignore`): supports exact paths, prefix paths, and `*` wildcards; segment-level matches (e.g. `node_modules` matches anywhere in the path).

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
