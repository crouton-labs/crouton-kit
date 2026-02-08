# Hook Patterns Reference

## Guardrails and Enforcement

**Block dangerous commands** — PreToolUse on Bash. Regex-match `rm -rf`, `sudo`, `chmod 777`, fork bombs. Exit 2 with feedback.

**Protect sensitive files** — PreToolUse on Read|Edit|Write. Check file paths against patterns (`.env`, credentials, private keys). Block access.

**Branch protection** — PreToolUse on Bash matching git push/commit to main/master. Redirect to PR workflow.

**Prompt filtering** — UserPromptSubmit to reject prompts violating organizational policies before Claude processes them.

**TDD enforcement** — PreToolUse blocking implementation file changes unless failing tests exist first.

## Context Injection

**Session bootstrap** — SessionStart to load git status, recent commits, sprint info, or project conventions automatically.

**Re-inject after compaction** — SessionStart with `compact` matcher to restore critical context lost during summarization (e.g., "Use Bun not npm. Current sprint: auth refactor.").

**Prompt enrichment** — UserPromptSubmit to append relevant context (ticket info, coding standards, checklists) before Claude processes the prompt. stdout gets added to context.

**Subagent instructions** — SubagentStart to inject team-wide context, security guidelines, or constraints into subagents as they spawn.

**Environment variables** — SessionStart with `CLAUDE_ENV_FILE` to persist env vars (`NODE_ENV`, `PATH` extensions, NVM setup) for all subsequent Bash commands.

## Quality Gates

**Auto-format after edits** — PostToolUse on Edit|Write to run Prettier/Black/gofmt on changed files. Feedback flows back to Claude.

**Lint after edits** — PostToolUse on Edit|Write to run ESLint/Ruff. Claude sees and can fix violations immediately.

**Type checking** — PostToolUse to run `tsc --noEmit` or `mypy` after code changes.

**Test gate on Stop** — Stop hook (agent-based) that runs the test suite before allowing Claude to finish. If tests fail, Claude continues with failure output.

**Task completion gate** — TaskCompleted hook that runs tests/lint before allowing task to be marked complete.

**Multi-criteria Stop evaluation** — Stop with `type: "prompt"` using an LLM to evaluate whether all tasks are actually complete.

## Notifications

**Desktop alerts** — Notification or Stop hook using `osascript` (macOS) or `notify-send` (Linux).

**Sound feedback** — Notification hook playing OS sounds via `terminal-notifier` or `afplay`.

**Slack/messaging** — Stop or Notification hook using `curl` to POST to a Slack webhook.

**Permission-specific alerts** — Notification with `permission_prompt` matcher for dedicated alerts when Claude needs approval.

## Logging and Auditing

**Command logging** — PostToolUse on Bash to log every shell command to a file.

**Event logging** — Hooks on multiple events logging structured JSON for post-session analysis.

**Transcript backup** — PreCompact to back up the full transcript before compaction summarizes it.

**MCP operation logging** — PreToolUse with `mcp__*` matcher to audit operations against MCP servers.

## Auto-Approval

**Auto-approve reads** — PermissionRequest hook that allows Read, Glob, Grep without prompting.

**Safe MCP operations** — PermissionRequest classifying MCP tools by operation (get/list/read = safe, delete/update/create = prompt).

**Conditional Bash approval** — PreToolUse allowing safe commands (`npm test`, `git status`) while blocking others.

**LLM-assisted decisions** — PermissionRequest with `type: "prompt"` for context-aware allow/deny on edge cases.

## Input Modification

**Sandbox writes** — PreToolUse on Write|Edit modifying `file_path` to redirect to a sandbox directory via `updatedInput`.

**Dry-run injection** — PreToolUse on Bash injecting `--dry-run` flags into destructive commands.

**Secret redaction** — PreToolUse stripping API keys or secrets from commands before execution.

**Commit message formatting** — PreToolUse on Bash matching git commit to enforce commit message conventions.

## Git Integration

**Auto-stage** — PostToolUse on Edit|Write to `git add` modified files automatically.

**Auto-commit checkpoints** — Stop hook that commits all changes with the user's last prompt as the message.

**Pre-edit safety** — PreToolUse on Write|Edit to commit current file state before modification, creating a rollback point.

**Multi-session branch isolation** — PreToolUse + PostToolUse creating separate Git indexes per Claude session, committing to isolated branches.

## Session Management

**Transcript backup before compaction** — PreCompact to preserve full detail before summarization.

**Session cleanup** — SessionEnd to clean up temporary files and scratch artifacts.

**Persistent memory** — Hooks on Stop/PreCompact/SessionEnd that extract and persist structured knowledge, feeding it back via SessionStart.

**Force continuation** — Stop hook returning `decision: "block"` with reason when work is incomplete. Must guard with `stop_hook_active` to avoid infinite loops.

## Agent Team Coordination

**Subagent context injection** — SubagentStart to inject team-wide instructions or constraints.

**Subagent output validation** — SubagentStop to verify quality before accepting results.

**Teammate work enforcement** — TeammateIdle to prevent idling until required artifacts are produced.

**Task gating** — TaskCompleted to run verification before any agent can mark work done.
