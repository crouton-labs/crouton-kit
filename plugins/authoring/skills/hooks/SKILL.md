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

**Session lifecycle**
| Event | Fires When | Can Block? | Can Inject Context? |
|-------|-----------|-----------|-------------------|
| `SessionStart` | Session begins/resumes/compacts | No | Yes |
| `InstructionsLoaded` | After CLAUDE.md and system instructions load | No | Yes |
| `SessionEnd` | Session terminates | No | No |
| `ConfigChange` | settings.json or config reloads mid-session | No | No |
| `CwdChanged` | Working directory changes | No | No |

**Prompt and tool flow**
| Event | Fires When | Can Block? | Can Inject Context? |
|-------|-----------|-----------|-------------------|
| `UserPromptSubmit` | User submits prompt | Yes | Yes |
| `PreToolUse` | Before tool executes | Yes | Yes |
| `PermissionRequest` | Permission dialog appears | Yes (auto-allow) | No |
| `PermissionDenied` | User denies a permission request | No | Yes |
| `PostToolUse` | After tool succeeds | No | Yes |
| `PostToolUseFailure` | After tool fails | No | Yes |
| `FileChanged` | File modified outside Claude's tools | No | Yes |
| `Stop` | Claude finishes responding | Yes (continue) | Yes |
| `StopFailure` | Claude stops due to error | No | Yes |
| `Notification` | Notification sent | No | No |

**Subagents and teams**
| Event | Fires When | Can Block? | Can Inject Context? |
|-------|-----------|-----------|-------------------|
| `SubagentStart` | Subagent spawns | No | Yes |
| `SubagentStop` | Subagent finishes | Yes (continue) | Yes |
| `TeammateIdle` | Teammate about to idle | Yes (continue) | Yes |
| `TaskCreated` | Task added to task list | No | Yes |
| `TaskCompleted` | Task marked complete | Yes (reject) | Yes |

**Compaction and worktrees**
| Event | Fires When | Can Block? | Can Inject Context? |
|-------|-----------|-----------|-------------------|
| `PreCompact` | Before context compaction | No | No |
| `PostCompact` | After compaction finishes | No | Yes |
| `WorktreeCreate` | New worktree created | No | No |
| `WorktreeRemove` | Worktree removed | No | No |

**Elicitation (MCP interactive prompts)**
| Event | Fires When | Can Block? | Can Inject Context? |
|-------|-----------|-----------|-------------------|
| `Elicitation` | MCP server requests user input | No | No |
| `ElicitationResult` | User responds to elicitation | No | Yes |

## Handler Types

**command** — Shell script. Receives JSON on stdin, returns via exit code + stdout/stderr.
- Exit 0: allow (stdout = JSON with control fields)
- Exit 2: block (stderr = feedback message)

**http** — POST request to a URL. Handler config takes `url` (required), `headers` (optional, supports `$VAR` interpolation), `allowedEnvVars` (whitelist for interpolation), `timeout` (default 30s). Response body is the same JSON shape as command hooks. Use for centralized hook services or cross-machine enforcement.

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/pre-tool-use",
  "headers": { "Authorization": "Bearer $MY_TOKEN" },
  "allowedEnvVars": ["MY_TOKEN"],
  "timeout": 30
}
```

**prompt** — Single-turn LLM evaluation. Fast, no tool access. Good for nuanced decisions.

**agent** — Multi-turn subagent with tool access. Can read files, run commands, investigate. Most powerful but slowest.

## Decision Control

All hook output must be wrapped in `hookSpecificOutput` with the matching `hookEventName`:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "injected text"
  }
}
```

**`hookEventName` is required** — without it, Claude Code silently drops the payload.

PreToolUse handlers can return:
- `permissionDecision: "allow" | "deny" | "ask" | "defer"` — override permission system
- `updatedInput: {...}` — transparently modify tool parameters
- `additionalContext: "..."` — inject text into Claude's context

`"defer"` is only valid in headless mode (`claude -p`). It pauses execution and exits with `stop_reason: "tool_deferred"` so the calling process can handle the tool call (e.g. `AskUserQuestion` from an SDK harness) and resume via `claude -p --resume <session-id>`. Ignored with a warning in interactive sessions.

PostToolUse handlers can return:
- `additionalContext: "..."` — inject text into Claude's context after tool execution

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

## Skill- and Agent-Scoped Hooks

Hooks can be declared inside `SKILL.md` or agent frontmatter so they only fire while that skill/agent is active. Useful for scoped guardrails that shouldn't apply globally.

```yaml
---
name: deploy
description: Deploy to production
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "${CLAUDE_SKILL_DIR}/scripts/confirm-deploy.sh"
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "${CLAUDE_SKILL_DIR}/scripts/validate.sh"
---
```

Same matcher/handler format as `hooks.json`, just nested under `hooks:` in frontmatter.

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
