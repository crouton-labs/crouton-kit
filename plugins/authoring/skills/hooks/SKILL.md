---
name: hooks
description: Guide to Claude Code hooks — lifecycle events, handler types, decision control, and common patterns. Use when creating, debugging, or planning hooks for guardrails, context injection, quality gates, notifications, or automation.
user-invocable: false
---

# Claude Code Hooks

Hooks are deterministic handlers that fire at lifecycle events. Unlike instructions, hooks **cannot be ignored** — they block, inject, or modify at the system level.

## When to Use Hooks vs Other Tools

- **Hooks**: Must happen every time, no exceptions (guardrails, formatting, enforcement)
- **Rules/CLAUDE.md**: Advisory guidance Claude should follow (conventions, preferences)
- **Skills**: On-demand reference material (knowledge, methodology)

## Hook Events

| Event | Fires When | Can Block? | Can Inject Context? |
|-------|-----------|-----------|-------------------|
| `SessionStart` | Session begins/resumes/compacts | No | Yes |
| `UserPromptSubmit` | User submits prompt | Yes | Yes |
| `PreToolUse` | Before tool executes | Yes | Yes |
| `PostToolUse` | After tool succeeds | No | Yes |
| `PostToolUseFailure` | After tool fails | No | Yes |
| `Stop` | Claude finishes responding | Yes (continue) | Yes |
| `SubagentStart` | Subagent spawns | No | Yes |
| `SubagentStop` | Subagent finishes | Yes (continue) | Yes |
| `TeammateIdle` | Teammate about to idle | Yes (continue) | Yes |
| `TaskCompleted` | Task marked complete | Yes (reject) | Yes |
| `PreCompact` | Before context compaction | No | No |
| `Notification` | Notification sent | No | No |
| `SessionEnd` | Session terminates | No | No |
| `PermissionRequest` | Permission dialog appears | Yes (auto-allow) | No |

## Handler Types

**command** — Shell script. Receives JSON on stdin, returns via exit code + stdout/stderr.
- Exit 0: allow (stdout = JSON with control fields)
- Exit 2: block (stderr = feedback message)

**prompt** — Single-turn LLM evaluation. Fast, no tool access. Good for nuanced decisions.

**agent** — Multi-turn subagent with tool access. Can read files, run commands, investigate. Most powerful but slowest.

## Decision Control

PreToolUse handlers can return:
- `permissionDecision: "allow" | "deny" | "ask"` — override permission system
- `updatedInput: {...}` — transparently modify tool parameters
- `additionalContext: "..."` — inject text into Claude's context

Stop/SubagentStop/TeammateIdle/TaskCompleted handlers can return:
- `decision: "block"` with `reason: "..."` — force continuation

PermissionRequest handlers can return:
- `behavior: "allow" | "deny" | "ask"` — auto-approve or reject
- `updatedPermissions: [...]` — apply persistent permission rules

## Matchers

```json
{
  "event": "PreToolUse",
  "matcher": "Bash|Edit|Write",
  "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/guard.mjs"
}
```

- `|` separates multiple tool names: `Write|Edit|MultiEdit`
- MCP tools: `mcp__servername__toolname` or `mcp__servername__*`
- SessionStart matchers: `resume`, `clear`, `compact`

## Common Patterns

See [patterns.md](patterns.md) for comprehensive examples organized by category:
- Guardrails and enforcement
- Context injection
- Quality gates (auto-format, lint, test)
- Notifications and alerts
- Logging and auditing
- Auto-approval workflows
- Input modification and sandboxing
- Git workflow automation
- Session management
- Agent team coordination

## Best Practices

- **Async for slow operations**: Set `"async": true` for hooks that shouldn't block (tests, notifications)
- **Timeouts**: Default is 60s for sync hooks. Set explicit timeouts for fast hooks.
- **Idempotency**: Hooks may fire multiple times. Guard against duplicate processing.
- **Stop hook loops**: Always check `stop_hook_active` to prevent infinite continuation loops.
- **Minimal hooks.json**: One concern per hook. Compose multiple small hooks rather than one monolith.
