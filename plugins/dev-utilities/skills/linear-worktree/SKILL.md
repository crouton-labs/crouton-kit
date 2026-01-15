---
name: linear-worktree
description: Find a Linear issue for creating a feature branch. Returns issue ID or NEW_ISSUE_NEEDED. Main agent handles user interaction and runs new-worktree.
model: haiku
---

# Linear Worktree Skill

Find a matching Linear issue based on conversation context.

## Your Issues

**Unstarted:**
!`linear issue list -s unstarted -a self --limit 10 --no-color 2>/dev/null || echo "LINEAR_UNAVAILABLE"`

**In Progress:**
!`linear issue list -s started -a self --limit 5 --no-color 2>/dev/null || echo ""`

## Output

Return ONE line:

1. **Issue matches:** `USE: <type> VAL-xxx-slug`
2. **No match:** `NEW_ISSUE_NEEDED`
3. **Linear unavailable:** `LINEAR_UNAVAILABLE`

**Type** (infer from issue title/labels):
- `feat` - new feature, enhancement, "add X"
- `fix` - bug, error, "fix X", "broken"
- `refactor` - cleanup, improve, restructure
- `chore` - maintenance, deps, config
- `docs` - documentation

**Slug**: issue title → lowercase, spaces to hyphens, remove special chars, max 50 chars

## Examples

```
USE: feat VAL-45-add-user-authentication
```
```
USE: fix ENG-123-broken-login
```
```
NEW_ISSUE_NEEDED
```
```
LINEAR_UNAVAILABLE
```

## For Main Agent

- `USE: <type> <ISSUE-ID-slug>` → `${CLAUDE_PLUGIN_ROOT}/bin/new-worktree <type> <ISSUE-ID-slug>`
- `NEW_ISSUE_NEEDED` → Ask user, create issue with `linear issue create -t "Title" -a self --start`, then `${CLAUDE_PLUGIN_ROOT}/bin/new-worktree`
- `LINEAR_UNAVAILABLE` → `${CLAUDE_PLUGIN_ROOT}/bin/new-worktree <type> <topic>`
