---
paths:
  - "**/commands/**"
  - "**/commands/*.md"
---

# Slash Command Development Reference

## File Structure

| Location | Scope |
|----------|-------|
| `.claude/commands/` | Project (shared via git) |
| `~/.claude/commands/` | Personal (user-specific) |
| Subdirectories | Namespacing: `frontend/test.md` -> `/test (project:frontend)` |

## Required Frontmatter

```yaml
---
description: Brief description (REQUIRED for Skill tool and /help)
---
```

## Optional Frontmatter

| Field | Purpose | Example |
|-------|---------|---------|
| `allowed-tools` | Scope permissions | `Bash(git:*), Read` |
| `argument-hint` | Document arguments | `[pr-number] [priority]` |
| `model` | Override model | `claude-3-5-haiku-20241022` |
| `disable-model-invocation` | Prevent autonomous use | `true` |
| `context` | `fork` for isolated context | `fork` |
| `agent` | Agent type when forked | `Explore` |
| `hooks` | Command-scoped hooks | See hooks section |

## Arguments

**Flexible input**: `$ARGUMENTS` captures all args as string
**Positional**: `$1`, `$2`, `$3` for structured parameters

```yaml
argument-hint: [issue-number] [priority]
---
Fix issue #$1 with priority $2
```

## Dynamic Content

**Bash execution** (! prefix):
```markdown
Current status: !`git status`
```
Must declare in `allowed-tools`

**File references** (@ prefix):
```markdown
Review @src/utils/helpers.js
```
Uses relative paths

## Tool Scoping

```yaml
allowed-tools:
  - Read
  - Bash(git:*)
  - Bash(npm run:*)
```

Never use `Bash(*)` - too permissive.

## Commands vs Skills vs Agents

| Use | When |
|-----|------|
| Command | Quick, frequently-used prompt, explicit invocation |
| Skill | Auto-discovery, multiple files, comprehensive docs |
| Agent | Isolated context, different permissions, multi-step |

## Best Practices

- Always include `description`
- Scope `allowed-tools` explicitly
- Document arguments with `argument-hint`
- Use relative paths for file refs
- Lowercase, hyphenated names: `/code-review`, `/fix-issue`

## Anti-Patterns

- Missing description (won't appear in /help)
- `allowed-tools: Bash(*)` (too permissive)
- Absolute paths in file references
- Undocumented arguments
