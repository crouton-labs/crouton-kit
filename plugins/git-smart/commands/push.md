---
description: Verify code quality and push to remote
allowed-tools: Bash(git:*), Skill
disable-model-invocation: true
---

Push current branch to remote after verifying code quality.

## Pre-flight

Run `/verify-clean` first. If it fails, stop and report issues.

## Push

**Current branch:**
```
!`git branch --show-current`
```

**Branch check:**
- If on `main`/`master` AND other branches exist: Warn before pushing, suggest creating a branch
- Otherwise: Push normally

```bash
git push origin <branch>
```

Report push result.
