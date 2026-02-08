---
name: skills-authoring
description: Guide to writing SKILL.md files for Claude Code. Use when creating skills that provide on-demand reference, methodology, or workflow guidance.
user-invocable: false
---

# Writing Skills

Skills are on-demand reference material Claude loads when relevant — not every session. They're ideal for methodology, domain knowledge, and complex workflows that would bloat CLAUDE.md.

## Structure

```
skill-name/
├── SKILL.md              # Required: overview and navigation
├── reference.md          # Optional: detailed docs
├── examples.md           # Optional: usage examples
└── scripts/              # Optional: bundled utilities
    └── validate.py
```

## Required Frontmatter

```yaml
---
name: skill-name
description: What it does. Specific capabilities. Use when [trigger scenarios].
---
```

The `description` field drives automatic discovery. Include keywords users would naturally say.

**Bad**: `Helps with documents`
**Good**: `Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDFs, forms, or document extraction.`

## Optional Frontmatter

| Field | Purpose |
|-------|---------|
| `allowed-tools` | Restrict available tools |
| `model` | Override model (opus/sonnet/haiku) |
| `context: fork` | Run in isolated subagent |
| `agent` | Agent type when forked |
| `user-invocable: false` | Hide from slash menu |
| `disable-model-invocation: true` | Prevent autonomous invocation |

## Progressive Disclosure

Keep SKILL.md under 500 lines. Put detailed reference in supporting files:

```markdown
For detailed patterns, see [patterns.md](patterns.md)
For examples, see [examples.md](examples.md)
```

Claude reads additional files only when needed — this keeps context lean.

## When to Use Skills vs Other Tools

- **Skills**: Complex methodology, detailed reference, domain knowledge loaded on-demand
- **Commands**: Quick prompts invoked with `/command`. Single .md file, user-triggered.
- **Rules**: Auto-applied constraints for matching files. Declarative, not procedural.
- **CLAUDE.md**: Universal project context. Short, always-loaded.

## Best Practices

- Match directory name to `name` field
- Include trigger terms users would naturally say in the description
- Focus SKILL.md on overview and principles, link to reference files for depth
- Bundle scripts in `scripts/` when the skill needs deterministic computation
- Use `context: fork` for skills that should run in isolation
