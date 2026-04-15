---
description: Branch, commit, push, open PR, and monitor CI in background
argument-hint: [scope] [--all] [--type feat|fix|refactor|chore|docs]
allowed-tools: Bash(git:*), Bash(gh:*), Agent, Skill
disable-model-invocation: true
---

Save current work: branch off, commit, push, open PR to original branch, return to original branch, and monitor CI in the background.

**Args:** $ARGUMENTS

Parse flags:
- `--all` → commit ALL uncommitted changes (not just conversation-relevant). Clean working tree of non-committable files (confirm before deleting/reverting anything).
- `--type <type>` → commit type override (feat, fix, refactor, chore, docs). Default: infer from changes.
- Remaining positional text → scope filter for commit

## Context

**Git repo:** !`git rev-parse --is-inside-work-tree 2>/dev/null || echo "NOT_A_GIT_REPO"`
**Git root:** !`git rev-parse --show-toplevel 2>/dev/null`
**User first name:** !`git config user.name | awk '{print tolower($1)}'`
**Current branch:** !`git branch --show-current 2>/dev/null`

**Status:**
```
!`git status --short 2>/dev/null || true`
```

**Recent commits (style reference):**
```
!`git log --oneline -n 8 2>/dev/null || true`
```

## Process

### 1. Determine change set

- **Default (no `--all`):** Identify only files relevant to what was discussed/worked on in this conversation. Leave unrelated dirty files alone.
- **`--all`:** Include everything. For files that shouldn't be committed (build artifacts, secrets, temp files), either add to `.gitignore` or delete/revert them. **Ask the user before deleting or reverting any files.**
- **Scope provided:** Further filter to matching files.

### 2. Create branch

Derive a short, descriptive topic slug from the changes (2-4 words, kebab-case).

Branch name: `<first-name>/<type>/<topic>`
- Example: `silas/feat/add-auth-middleware`

```bash
git checkout -b <branch-name>
```

### 3. Stage & commit

Stage the determined files. Review staged diff for logical groupings.

Small changes (<3 files, single concern) = single commit. Larger = group logically.

**Format:** `type(scope): subject`
- Match style from recent commits
- Types: feat, fix, docs, style, refactor, test, chore

### 4. Push

```bash
git push -u origin HEAD
```

### 5. Open PR

Target branch = the branch we were on before (captured in step 2).

```bash
gh pr create --title "..." --body "$(cat <<'EOF'
## Summary
<1-3 bullet points>

## Test plan
<checklist>
EOF
)"
```

### 6. Return to original branch

```bash
git checkout <original-branch>
```

Unstaged changes that were left behind (default mode, non-`--all`) should still be there on the original branch.

### 7. Monitor CI in background

Spawn a background agent that watches the PR checks using a loop:

```
/loop 2m check PR <pr-url> CI status with `gh pr checks <pr-url>`. If all checks pass, report success and stop. If any check fails, read logs with `gh run view <run-id> --log-failed`. If the failure is obvious (lint, type error, missing import, test assertion, build error), check out the PR branch, fix it, commit, push, and check out the original branch again. If the failure is ambiguous or requires design decisions, report to the user and stop. Stop looping after success or after 3 fix attempts.
```

## Output

1. List commits created
2. PR URL
3. Confirmation that original branch is restored
4. Note that CI is being monitored in background

### Final CI report (from background agent)

Always include:
- Pass/fail status
- If failed: **why** it failed (root cause, not just the check name)
- If fixes were attempted: what was changed and whether it resolved the issue
- If stopped: why the agent stopped (ambiguous failure, iteration cap, etc.)
