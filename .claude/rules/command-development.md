---
paths:
  - "**/commands/**"
  - "**/commands/*.md"
---

# Slash Command Development Reference

**Commands and skills are the same thing.** `.claude/commands/foo.md` and `.claude/skills/foo/SKILL.md` both create `/foo` with identical frontmatter. Existing commands keep working; use skills when you need bundled scripts, reference files, or per-skill hooks.

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
| `model` | Override model | `claude-haiku-4-5-20251001` |
| `effort` | Effort level override | `low`, `medium`, `high`, `max` |
| `disable-model-invocation` | User-only invocation | `true` |
| `user-invocable` | Agent-only (`false` hides from menu) | `false` |
| `paths` | Glob patterns — scope activation | `src/**/*.ts` |
| `context` | `fork` for isolated context | `fork` |
| `agent` | Agent type when forked | `Explore` |
| `hooks` | Command-scoped hooks | See hooks section |
| `shell` | Shell for `` !`...` `` | `bash` or `powershell` |

## Arguments

**Flexible input**: `$ARGUMENTS` captures all args as a single string.
**Positional**: `$ARGUMENTS[N]` or `$N` — 0-indexed, so `$0` is the first argument, `$1` is the second.
**Runtime vars**: `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}`.

```yaml
argument-hint: [issue-number] [priority]
---
Fix issue #$0 with priority $1
```

Indexed args use shell-style quoting: `/fix "hello world" high` → `$0` = `hello world`, `$1` = `high`.

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
