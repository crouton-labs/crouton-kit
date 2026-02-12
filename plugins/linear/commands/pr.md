---
description: Make a PR into dev from this feature branch. Make sure the PR is linked to relevant linear issues...
---
Create a GitHub pull request linked to the Linear issue using the `linear` CLI.

## CLI Reference

```bash
linear issue pr [issueId] [options]
```

**Options:**
- `--base <branch>` - Target branch (default: main)
- `--head <branch>` - Source branch (default: current branch)
- `-t, --title <title>` - Custom title (Linear issue ID auto-prefixed)
- `--draft` - Create as draft PR
- `--web` - Open PR in browser after creation

If `issueId` is omitted, uses the issue from the current git branch.

## Instructions

1. Get the Linear issue for the current branch:
   ```bash
   linear issue id
   ```

2. If no issue is linked to the branch, search for relevant issues:
   ```bash
   linear issue list -s started -a self
   ```

3. Review current changes:
   ```bash
   git status
   git log dev..HEAD --oneline
   ```

4. Create the PR:
   ```bash
   linear issue pr DEV-123 --base dev
   ```

   This automatically:
   - Sets PR title with Linear issue ID prefix
   - Adds Linear issue link to PR body
   - Links the PR to Linear (shows in Linear UI)

5. If you need a custom title:
   ```bash
   linear issue pr DEV-123 --base dev -t "Add user authentication"
   ```

## Alternative: Manual gh pr create

If you need more control, use `gh pr create` directly but **always include the Linear reference**:

```bash
gh pr create --base dev --title "DEV-123: Add feature" --body "$(cat <<'EOF'
## Summary
- Added user authentication

## Linear Issue
Closes DEV-123
EOF
)"
```

**Important:** Use `Closes DEV-123` to auto-close the Linear issue when PR merges, or `Relates to DEV-123` for reference only.

## Useful Commands

```bash
# Check current branch's Linear issue
linear issue id
linear issue view

# View issue details before PR
linear issue view DEV-123

# Start working on an issue (creates branch)
linear issue start DEV-123
```

User request: $ARGUMENTS
