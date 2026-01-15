---
description: Analyze uncommitted changes and extract them into separate worktrees
allowed-tools: Bash(git:*), Bash(new-worktree:*), Read, Write, Glob, Grep
argument-hint: [--dry-run]
---

# Extract Changes

Analyze uncommitted changes on the current branch and help extract them into separate feature worktrees.

## Current State

```
!`git status --short`
```

## Your Task

1. **Analyze changes**: Run `git diff` and `git diff --cached` to see all modifications
2. **Group by concern**: Identify distinct features/fixes in the changes
3. **For each group, determine**:
   - Suggested worktree name (type/topic)
   - Files that belong entirely to this concern → use `--extract`
   - Hunks in shared files → generate a patch file

## Extraction Methods

### File-level (simple)
When all changes in a file belong to one concern:
```bash
new-worktree feat auth-improvements --extract src/auth.ts src/middleware/auth.ts
```

### Hunk-level (surgical)
When a file has changes for multiple concerns:
1. Generate patch with only relevant hunks:
```bash
git diff src/api.ts > /tmp/full.patch
# Edit to keep only relevant hunks, save as /tmp/auth-hunks.patch
```
2. Apply:
```bash
new-worktree feat auth-fix --patch /tmp/auth-hunks.patch
```

## Output Format

Present findings as:

```
## Detected Changes

### Group 1: [suggested-name]
Type: feat|fix|refactor|chore
Files (whole): file1.ts, file2.ts
Files (partial): file3.ts (lines 10-30)

### Group 2: [suggested-name]
...
```

Then ask user to confirm before executing extractions.

## Rules

- Always show the user what will happen before executing
- If `--dry-run` passed via $ARGUMENTS, only analyze, don't execute
- For partial file extractions, write patch to `/tmp/extract-<name>.patch`
- After extraction, verify original branch is clean of extracted changes
