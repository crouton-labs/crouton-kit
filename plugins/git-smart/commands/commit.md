---
description: Stage and commit changes into logical commits
argument-hint: [scope]
allowed-tools: Bash(git:*)
---

Stage and commit changes into logical commits.

**Scope:** $ARGUMENTS (empty = all changes)

## Context

**Status:**
```
!`git status --short 2>/dev/null`
```

**Recent commits (style reference):**
```
!`git log --oneline -8 2>/dev/null`
```

## Process

1. **Stage** - If scope provided, stage matching files. Otherwise stage all changes.
2. **Analyze** - Review staged diff for logical groupings
3. **Commit** - Create commits. Small changes (<3 files, single concern) = single commit. Large changes = group into logical commits.

**Format:** `type(scope): subject`
- Match style from recent commits
- Types: feat, fix, docs, style, refactor, test, chore

## Output

List commits created with their messages.
