---
description: Extract changes for a specific feature into a new worktree
allowed-tools: Bash(git:*), Bash(new-worktree:*), Read, Write
argument-hint: <feature-description>
---

Extract uncommitted changes related to "$ARGUMENTS" into a new worktree.

## Current Changes
```
!`git diff --stat`
```

## Task

1. Analyze `git diff` to find changes related to "$ARGUMENTS"
2. Determine extraction method:
   - **Whole files**: All changes in file relate to this feature → `--extract`
   - **Partial files**: Mixed concerns → generate patch with relevant hunks
3. Suggest worktree name (type/topic format)
4. Show extraction plan, ask user to confirm
5. Execute: `new-worktree <type> <topic> --extract <files>` or `--patch <file>`
6. Verify original branch is clean of extracted changes

## Patch Generation (for partial files)

Write patch to `/tmp/extract-<topic>.patch` containing only hunks for this feature.
