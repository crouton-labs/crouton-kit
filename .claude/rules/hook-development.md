---
paths:
  - "**/hooks/**"
  - "**/hooks.json"
  - "**/*hook*"
---

# Hook Development Reference

## Hook Types & Events

| Event | Trigger | Can Block | Matchers |
|-------|---------|-----------|----------|
| **PreToolUse** | Before tool execution | Yes | Yes (tool name) |
| **PermissionRequest** | Permission dialog shown | Yes | Yes (tool name) |
| **PostToolUse** | After tool completes | No | Yes (tool name) |
| **Notification** | Notification sent | No | Yes (notification type) |
| **UserPromptSubmit** | User submits prompt | Yes | No |
| **Stop** | Claude finishes response | Yes | No |
| **SubagentStop** | Subagent finishes | Yes | No |
| **PreCompact** | Before context compaction | No | Yes (manual/auto) |
| **SessionStart** | Session begins/resumes | No | Yes (startup/resume/clear/compact) |
| **SessionEnd** | Session ends | No | No |

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

## Command vs Prompt-Based Hooks

**Command hooks** (`type: "command"`): Execute bash scripts, deterministic logic
**Prompt hooks** (`type: "prompt"`): Query LLM for decisions, use `$ARGUMENTS` for input

## Key Output Fields

### PreToolUse
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "explanation",
    "updatedInput": { "field": "new_value" }
  }
}
```

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
