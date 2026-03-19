---
description: Interactive rebase with safety checks and conflict assistance
argument-hint: [target] [--onto <base>] — target defaults to origin/main
allowed-tools: Bash(git:*), Bash(gh:*)
disable-model-invocation: true
---

Rebase current branch onto a target. Guide the user through conflicts.

**Target:** ${1:-origin/main}
**Flags:** $ARGUMENTS
- `--onto <base>` — rebase onto a different base (passed through to git)

## Context

**Git root:** !`git rev-parse --show-toplevel 2>/dev/null || echo "NOT A GIT REPO"`

If not inside a git repository, ask the user which repo they want to target. Do not proceed.

**Current branch:**
```
!`git branch --show-current 2>/dev/null || echo "N/A"`
```

**Commits that will be rebased:**
```
!`git log --oneline origin/main..HEAD 2>/dev/null || echo "N/A"`
```

**Uncommitted changes:**
```
!`git status --short 2>/dev/null || true`
```

## Safety

- **Never** run `git rebase` without user confirmation of the rebase plan.
- **Never** use `--force` to push. Use `--force-with-lease` only after rebase completes.
- If there are uncommitted changes, stash them first with `git stash push -m "pre-rebase"` and restore after.
- Do not rush—the user should be involved in every step of this process.

## Process

### 1. Pre-flight

- Confirm the branch is not `main`/`master`. If it is, warn and stop.
- Fetch origin to ensure target ref is current.
- Show the user exactly which commits will be replayed and onto what. Ask for confirmation.

### 2. Rebase

```bash
git rebase <target> [--onto <base>]
```

### 3. Conflict resolution

If conflicts occur:
- Show conflicting files and the specific conflict markers
- Explain what each side of the conflict represents (ours = your commits being replayed, theirs = target branch)
- Suggest a resolution but **wait for user approval** before staging
- After resolving: `git rebase --continue`
- If the user wants to bail: `git rebase --abort`

### 4. Post-rebase

- Show the rebased commit log
- Remind the user they need to force-push: `git push --force-with-lease origin <branch>`
- Ask before pushing — do not push automatically
