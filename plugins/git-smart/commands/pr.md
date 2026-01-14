---
description: Create a pull request to target branch
argument-hint: <target-branch>
allowed-tools: Bash(git:*), Bash(gh:*)
---

Create a pull request from current branch to target.

**Target:** $ARGUMENTS (default: main)

## Context

**Current branch:**
```
!`git branch --show-current`
```

**Commits to include:**
```
!`git log --oneline origin/${ARGUMENTS:-main}..HEAD 2>/dev/null || git log --oneline -10`
```

**Changed files:**
```
!`git diff --stat origin/${ARGUMENTS:-main}..HEAD 2>/dev/null || git diff --stat HEAD~5`
```

## Process

1. **Ensure pushed** - Push current branch if needed
2. **Analyze changes** - Review all commits (not just latest) for PR summary
3. **Create PR** - Use `gh pr create`

**PR format:**
```
gh pr create --title "..." --body "$(cat <<'EOF'
## Summary
<1-3 bullet points covering ALL commits>

## Test plan
<checklist of testing steps>
EOF
)"
```

Report PR URL when done.
