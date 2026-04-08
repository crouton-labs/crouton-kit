---
paths:
  - "**/hooks/**"
  - "**/hooks.json"
  - "**/*hook*"
---

# Hook Development Reference

## Hook Types & Events

**Session lifecycle**

| Event | Trigger | Can Block | Matchers |
|-------|---------|-----------|----------|
| **SessionStart** | Session begins/resumes | No | Yes (startup/resume/clear/compact) |
| **InstructionsLoaded** | CLAUDE.md and system instructions loaded | No | No |
| **SessionEnd** | Session ends | No | No |
| **ConfigChange** | settings.json reloads mid-session | No | No |
| **CwdChanged** | Working directory changes | No | No |

**Prompt and tool flow**

| Event | Trigger | Can Block | Matchers |
|-------|---------|-----------|----------|
| **UserPromptSubmit** | User submits prompt | Yes | No |
| **PreToolUse** | Before tool execution | Yes | Yes (tool name) |
| **PermissionRequest** | Permission dialog shown | Yes | Yes (tool name) |
| **PermissionDenied** | User denies permission | No | Yes (tool name) |
| **PostToolUse** | After tool completes | No | Yes (tool name) |
| **PostToolUseFailure** | Tool call fails | No | Yes (tool name) |
| **FileChanged** | File modified outside Claude's tools | No | No |
| **Stop** | Claude finishes response | Yes | No |
| **StopFailure** | Claude stops due to error | No | No |
| **Notification** | Notification sent | No | Yes (notification type) |

**Subagents and teams**

| Event | Trigger | Can Block | Matchers |
|-------|---------|-----------|----------|
| **SubagentStart** | Subagent spawns | No | No |
| **SubagentStop** | Subagent finishes | Yes | No |
| **TeammateIdle** | Teammate about to idle | Yes | No |
| **TaskCreated** | Task added to task list | No | No |
| **TaskCompleted** | Task marked complete | Yes | No |

**Compaction, worktrees, elicitation**

| Event | Trigger | Can Block | Matchers |
|-------|---------|-----------|----------|
| **PreCompact** | Before context compaction | No | Yes (manual/auto) |
| **PostCompact** | After compaction finishes | No | No |
| **WorktreeCreate** | New worktree created | No | No |
| **WorktreeRemove** | Worktree removed | No | No |
| **Elicitation** | MCP server requests user input | No | No |
| **ElicitationResult** | User responds to elicitation | No | No |

## Configuration Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "bash-command",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

## Handler Types

- **`command`**: Execute shell scripts. Deterministic logic. JSON on stdin, JSON on stdout.
- **`http`**: POST to a URL. Fields: `url`, `headers` (supports `$VAR` interpolation), `allowedEnvVars`, `timeout`. Response body is the same JSON shape as command hooks.
- **`prompt`**: Query LLM for decisions. Fast, no tool access. Good for nuanced classification.
- **`agent`**: Multi-turn subagent with tool access. Can investigate before deciding. Slowest.

## Skill/Agent-Scoped Hooks

Hooks can be declared in SKILL.md or agent frontmatter to scope them to that skill/agent only:

```yaml
---
name: deploy
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "${CLAUDE_SKILL_DIR}/scripts/confirm.sh"
---
```

## Key Output Fields

### PreToolUse
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask|defer",
    "permissionDecisionReason": "explanation",
    "updatedInput": { "field": "new_value" },
    "additionalContext": "injected text"
  }
}
```

`"defer"` is only valid in headless mode (`claude -p`) — pauses Claude so the calling process can handle the tool call and resume via `claude -p --resume <session-id>`. Ignored in interactive sessions.

### Stop/SubagentStop
```json
{
  "decision": "block",
  "reason": "Message for Claude explaining why to continue"
}
```
- `systemMessage` = shown to USER
- `reason` with `decision: block` = sent to CLAUDE

### PostToolUse
```json
{
  "decision": "block",
  "reason": "feedback",
  "hookSpecificOutput": {
    "additionalContext": "Extra info for Claude"
  }
}
```

## Exit Codes

| Code | Meaning | JSON Processed |
|------|---------|----------------|
| 0 | Success | Yes |
| 2 | Blocking error | No, stderr used |
| Other | Non-blocking error | No |

## Environment Variables

- `CLAUDE_PROJECT_DIR`: Project root path
- `${CLAUDE_PLUGIN_ROOT}`: Plugin directory (plugin hooks only)
- `CLAUDE_ENV_FILE`: File for persisting env vars (SessionStart only)

## Common Patterns

### Block dangerous commands
```python
if "rm -rf" in command:
    print("Blocked: dangerous command", file=sys.stderr)
    sys.exit(2)
```

### Auto-approve safe operations
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow"
  }
}
```

### Inject context on Stop
```json
{
  "decision": "block",
  "reason": "You haven't run tests yet. Run tests before finishing."
}
```

## Anti-Patterns

- Using `systemMessage` for Claude-directed feedback (use `decision`/`reason`)
- Missing `exit 2` for blocking errors
- Relative paths instead of `$CLAUDE_PROJECT_DIR`
- Overly permissive matchers (`*`)
- Missing timeout configuration
