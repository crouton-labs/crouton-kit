---
paths:
  - "**/agents/**"
  - "**/agents/*.md"
---

# Agent Development Reference

## File Structure

| Location | Scope |
|----------|-------|
| `.claude/agents/` | Project (shared via git) |
| `~/.claude/agents/` | Personal (user-specific) |
| Plugin `agents/` | Distributed with plugin |

## Required Frontmatter

```yaml
---
name: agent-name          # lowercase, hyphens only
description: When Claude should use this agent. Be specific with keywords.
---
```

## Optional Frontmatter

| Field | Purpose | Example |
|-------|---------|---------|
| `tools` | Available tools | `Read, Grep, Glob, Bash` |
| `disallowedTools` | Deny tools | `Write, Edit` |
| `model` | Model to use | `sonnet`, `opus`, `haiku`, `inherit` |
| `permissionMode` | Permission handling | `default`, `acceptEdits`, `dontAsk`, `plan` |
| `skills` | Load skills | `pr-review, security-check` |
| `color` | UI background | `red`, `blue`, `green`, etc. |
| `hooks` | Agent-scoped hooks | PreToolUse, PostToolUse, Stop |

## Color Options

```
red, orange, yellow, green, blue, purple, pink, gray, indigo,
teal, cyan, lime, emerald, sky, violet, fuchsia, rose, amber, zinc
```

## System Prompt Design

The markdown body becomes the agent's system prompt:

```markdown
---
name: code-reviewer
description: Expert code review. Use after code changes.
tools: Read, Grep, Glob
---

You are a senior code reviewer.

When invoked:
1. Run git diff to see changes
2. Focus on modified files
3. Check patterns immediately

Review checklist:
- No exposed secrets
- Input validation
- Proper error handling
```

## Permission Modes

| Mode | Behavior |
|------|----------|
| `default` | Standard permission prompts |
| `acceptEdits` | Auto-accept file edits |
| `dontAsk` | Auto-deny prompts |
| `bypassPermissions` | Skip all checks |
| `plan` | Read-only exploration |

## Agents vs Commands vs Skills

| Use Agent | When |
|-----------|------|
| Complex multi-step task | Yes |
| Needs isolated context | Yes |
| Different tool restrictions | Yes |
| Output shouldn't clutter main convo | Yes |

| Use Command | When |
|-------------|------|
| Simple, reusable prompt | Yes |
| Quick template | Yes |
| Explicit invocation | Yes |

| Use Skill | When |
|-----------|------|
| Auto-discovery needed | Yes |
| Multiple supporting files | Yes |
| Comprehensive docs | Yes |

## Agent-Scoped Hooks

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
  Stop:
    - hooks:
        - type: command
          command: "./scripts/cleanup.sh"
```

## Best Practices

- Design focused agents (one specific task)
- Write detailed descriptions with keywords
- Limit tool access (principle of least privilege)
- Use appropriate models (haiku for read-only, opus for complex)
- Start system prompt with role definition
- Include evaluation criteria and output format
