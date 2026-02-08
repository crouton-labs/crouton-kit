---
name: commands-authoring
description: Guide to writing slash commands for Claude Code. Use when creating commands that set mode, constraints, or workflows invoked via /command-name.
user-invocable: false
---

# Writing Slash Commands

Commands specify **constraints and mode**, not instructions. Claude already knows how to do most things — commands tell it what to do differently.

## Structure

```markdown
---
description: One-line description (shows in /help)
allowed-tools: Tool(pattern:*), Tool(pattern:*)
argument-hint: [arg1] [arg2]
---

Prompt content. Set role, constraints, then get out of the way.
```

## Features

- `$ARGUMENTS` — all args as string, or `$1`, `$2` for positional
- `` !`git status` `` — inline bash execution (output included in context)
- `@path/to/file.ts` — file reference (contents included inline)

Bash execution requires matching `allowed-tools` declarations.

## Key Rules

1. **Minimal tokens** — every line costs context
2. **Constraints > procedures** — say what to do differently, not how
3. **Don't restate knowledge** — skip things Claude already knows
4. **Limit allowed-tools** — only enable what's needed
5. **One concern** — focused commands, not kitchen sinks

## Optional Frontmatter

| Field | Purpose |
|-------|---------|
| `model` | Override model (haiku for cheap, opus for capability) |
| `disable-model-invocation: true` | Only invokable by user, not autonomously |
| `argument-hint` | Document expected args for autocomplete |

## When to Use Commands vs Skills

| Commands | Skills |
|----------|--------|
| Quick, frequently used prompts | Complex multi-step workflows |
| Single .md file | Directory with SKILL.md + reference files |
| User explicitly invokes with `/` | Automatic discovery by context |
| <200 lines | Extensive reference documentation |

## Anti-Patterns

- Missing `description` (won't appear in `/help` or Skill tool)
- `allowed-tools: Bash(*)` (overly permissive)
- Absolute file paths (use `@` references instead)
- No `argument-hint` when args are expected
- Long procedural instructions (use constraints instead)
