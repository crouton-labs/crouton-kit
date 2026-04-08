---
paths:
  - "**/skills/**"
  - "**/SKILL.md"
---

# Skill Development Reference

**Commands are now skills.** `.claude/commands/foo.md` and `.claude/skills/foo/SKILL.md` both create `/foo` and share the same frontmatter. Existing `commands/` files keep working; prefer `skills/` for anything needing bundled files, scripts, or per-skill hooks.

## File Structure

```
skill-name/
├── SKILL.md              # Required: overview and navigation
├── reference.md          # Optional: detailed docs
├── examples.md           # Optional: usage examples
└── scripts/              # Optional: utilities
    └── validate.py
```

## Required Frontmatter

```yaml
---
name: skill-name          # lowercase, kebab-case, max 64 chars
description: What it does and when to use it. Include trigger keywords.
---
```

## Optional Frontmatter

| Field | Description |
|-------|-------------|
| `argument-hint` | Autocomplete hint: `[issue-number]` |
| `allowed-tools` | Restrict tools: `Read, Grep, Glob` |
| `model` | Override model: `opus`, `sonnet`, `haiku` |
| `effort` | Effort level: `low`, `medium`, `high`, `max` (Opus 4.6 only) |
| `context` | `fork` for isolated subagent context |
| `agent` | Agent type when forked: `Explore`, `Plan`, `general-purpose`, custom |
| `user-invocable` | `false` hides from slash menu (agent-only) |
| `disable-model-invocation` | `true` prevents autonomous invocation (user-only) |
| `paths` | Glob patterns — only activate for matching files |
| `hooks` | Skill-scoped hooks (same format as hooks.json, nested in frontmatter) |
| `shell` | `bash` (default) or `powershell` for `` !`...` `` execution |

## Arguments and Substitutions

- `$ARGUMENTS` — all args as a single string
- `$ARGUMENTS[N]` or `$N` — positional, 0-indexed (`$0` is first)
- `${CLAUDE_SESSION_ID}` — current session ID
- `${CLAUDE_SKILL_DIR}` — directory containing this SKILL.md (use for bundled scripts)

If skill content doesn't include `$ARGUMENTS`, Claude Code appends `ARGUMENTS: <value>` to the end.

## Dynamic Context Injection

`` !`command` `` and ` ```! ` fenced blocks execute **before** the skill is sent to Claude — output replaces the placeholder. Preprocessing, not tool use.

```markdown
---
allowed-tools: Bash(gh *)
---

PR diff: !`gh pr diff`
```

Include the word `ultrathink` anywhere in skill content to enable extended thinking.

## Writing Effective Descriptions

**Bad**: `Helps with documents`

**Good**: `Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDFs, forms, or document extraction.`

**Template**: `[What it does]. [Specific capabilities]. Use when [trigger scenarios].`

## Skills vs Commands

| Aspect | Skills | Commands |
|--------|--------|----------|
| Discovery | Automatic | Manual (`/command`) |
| Structure | Directory with SKILL.md | Single .md file |
| Files | Multiple + scripts | One file |
| Best for | Complex workflows, docs | Quick prompts |

## Progressive Disclosure

Keep SKILL.md under 500 lines. Link to supporting files:

```markdown
For detailed API docs, see [reference.md](reference.md)
For examples, see [examples.md](examples.md)
```

Claude reads additional files only when needed.

## Tool Restriction

```yaml
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git:*)
```

## Forked Context

```yaml
context: fork
agent: general-purpose
```

Runs skill in isolated subagent with separate conversation history.

## Skills in Plugins

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── my-skill/
        └── SKILL.md
```

## Best Practices

- Include trigger terms users would naturally say
- Keep SKILL.md focused, reference supporting files
- Use forward slashes in paths
- Match directory name to `name` field
- Test discovery: "What skills are available?"
