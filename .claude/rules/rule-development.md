---
paths:
  - "**/rules/**"
  - "**/rules/*.md"
---

# Rule Development Reference

## File Structure

```
.claude/rules/
├── code-style.md       # Code style guidelines
├── testing.md          # Testing conventions
├── security.md         # Security requirements
└── backend/
    ├── api.md          # API patterns
    └── database.md     # Database conventions
```

## Frontmatter

```yaml
---
paths:
  - "src/api/**/*.ts"
  - "src/services/**/*.ts"
name: api-rules
description: Rules for API development
---
```

## Path Matching

| Pattern | Matches |
|---------|---------|
| `**/*.ts` | All TypeScript files |
| `src/**/*` | All files under src/ |
| `*.md` | Root markdown files only |
| `src/**/*.{ts,tsx}` | TypeScript and React files |
| `{src,lib}/**/*.ts` | Files in src/ or lib/ |

**Rules without `paths` apply globally.**

## Declarative vs Procedural

**Declarative (correct)**:
```markdown
- No `any` types
- Functions must throw errors early
- Use 2-space indentation
```

**Procedural (avoid)**:
```markdown
1. Open your file
2. Check for any types
3. Replace them with specific types
```

## Rules vs CLAUDE.md

| Rules | CLAUDE.md |
|-------|-----------|
| Topic-specific guidelines | Project overview |
| Code style standards | Architecture decisions |
| File-type constraints | Frequent commands |
| Framework patterns | Team workflows |

## Best Practices

- Keep each rule file focused on one topic
- Use specific, measurable standards
- Organize with subdirectories for larger sets
- Use descriptive filenames: `testing.md`, `api-design.md`
- Be specific: "Use 2-space indentation" not "Format properly"

## Example Rule File

```markdown
---
paths:
  - "src/**/*.ts"
---

# TypeScript Rules

## Types
- No `any` types - always provide specific types
- Export interfaces for public APIs
- Use type inference where obvious

## Error Handling
- Throw errors early, don't return null
- Use custom error types for domain errors
- Include context in error messages

## Imports
- Absolute paths first, then relative
- Group by: external, internal, relative
- No circular dependencies
```

## Anti-Patterns

- Vague rules: "Write good code"
- Multiple unrelated topics in one file
- Procedural instructions instead of constraints
- Missing `paths` when rules are file-specific
