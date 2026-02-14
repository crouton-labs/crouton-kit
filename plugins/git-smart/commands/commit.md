---
description: Stage and commit changes into logical commits
argument-hint: [scope]
allowed-tools: Bash(git:*)
model: sonnet
disable-model-invocation: true
---

Stage and commit changes into logical commits.

**Scope:** $ARGUMENTS (empty = all changes)

## Context

**Git repo:** !`git rev-parse --is-inside-work-tree 2>/dev/null || echo "NOT_A_GIT_REPO"`

If the above shows "NOT_A_GIT_REPO", inform the user this command requires a git repository and stop.

**Status:**
```
!`git status --short 2>/dev/null || true`
```

**Recent commits (style reference):**
```
!`git log --oneline -n 8 2>/dev/null || true`
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
