---
name: linear-cli
description: This skill should be used when the user asks to "create a Linear issue", "list Linear tickets", "start working on a ticket", "update Linear issue", "link PR to Linear", "view issue details", mentions "linear issue", "DEV-xxx", or needs to manage Linear issues from the command line.
---

# Linear CLI

Command-line interface for managing Linear issues directly from the terminal.

## Installation & Auth

```bash
# Install (npm)
npm install -g @anthropic/linear

# Authenticate
linear auth
```

## Core Commands

### Issue Management

**List Issues:**
```bash
# REQUIRED: Set sort via env var (--sort flag is broken)
LINEAR_ISSUE_SORT=priority linear issue list --team DEV -s unstarted
LINEAR_ISSUE_SORT=priority linear issue list --team DEV -s started
LINEAR_ISSUE_SORT=priority linear issue list --team DEV --all-states
LINEAR_ISSUE_SORT=priority linear issue list --team DEV -A           # All assignees
LINEAR_ISSUE_SORT=priority linear issue list --team DEV -U           # Unassigned only
LINEAR_ISSUE_SORT=priority linear issue list --team DEV --limit 100  # More results
```

**View Issue:**
```bash
linear issue view DEV-123            # Terminal view with comments
linear issue view DEV-123 -j         # JSON output
linear issue view DEV-123 -w         # Open in browser
linear issue view DEV-123 -a         # Open in Linear.app
linear issue view --no-comments      # Hide comments
```

**Create Issue:**
```bash
# --team flag is REQUIRED
linear issue create --team DEV -t "Title" -d "Description"
linear issue create --team DEV -t "Title" -p DEV-100     # With parent issue
linear issue create --team DEV -t "Title" -a self        # Assign to self
linear issue create --team DEV -t "Title" -s "Todo"      # Use workflow state name
linear issue create --team DEV -t "Title" -l "Bug" -l "Urgent"  # Multiple labels
linear issue create --team DEV -t "Title" --priority 1   # 1=urgent, 4=low
linear issue create --team DEV -t "Title" --project "Network Agent"
linear issue create --team DEV --start                   # Start immediately
```

**Update Issue:**
```bash
linear issue update DEV-123 --state "In Progress"
linear issue update DEV-123 --state "Done"   # Close issue
linear issue update DEV-123 -a self          # Assign to self
linear issue update DEV-123 -a "username"    # Assign to user
linear issue update DEV-123 -p DEV-100       # Set parent
linear issue update DEV-123 --priority 2
linear issue update DEV-123 -l "Label"       # Add label
linear issue update DEV-123 -t "New Title"
```

> **IMPORTANT:** The flag is `--state` (or `-s`), NOT `--status`. `--status` does not exist and will error.

**Start Working:**
```bash
linear issue start DEV-123           # Mark in-progress, create git branch
linear issue start DEV-123 -b custom-branch-name
linear issue start DEV-123 -f main   # Branch from specific ref
```

**Delete Issue:**
```bash
linear issue delete DEV-123          # Prompts for confirmation
echo "y" | linear issue delete DEV-123  # Auto-confirm
```

### Git Integration

**Get Issue from Branch:**
```bash
linear issue id                      # Print issue ID from current branch
linear issue title                   # Print issue title
linear issue url                     # Print Linear URL
linear issue describe                # Title + Linear-issue trailer
```

**Create PR with Issue:**
```bash
linear issue pr DEV-123              # Create GitHub PR linked to issue
```

### Comments

```bash
linear issue comment add DEV-123 -b "Comment text"
linear issue comment list DEV-123
linear issue comment update <commentId> -b "Updated text"
```

### Projects & Teams

```bash
linear project list                  # List all projects
linear project view <projectId>      # View project details
linear team list                     # List teams
linear team id                       # Print configured team ID
linear team members                  # List team members
```

## State Values

**For `issue list`** - only these enum values work:

| State | Description |
|-------|-------------|
| `triage` | New, needs triage |
| `backlog` | In backlog |
| `unstarted` | Ready to start (default filter) — includes "Todo" |
| `started` | In progress |
| `completed` | Done |
| `canceled` | Canceled |

**For `issue create` and `issue update`** - use your workspace's workflow state names:

| State Name | Description |
|------------|-------------|
| `"Todo"` | Ready to work on |
| `"In Progress"` | Being worked on |
| `"In Review"` | Under review |
| `"Done"` | Completed |
| `"Canceled"` | Canceled |

## Priority Values

Use with `--priority` flag:

| Value | Meaning |
|-------|---------|
| 1 | Urgent |
| 2 | High |
| 3 | Medium |
| 4 | Low |

## Common Workflows

### Start New Work
```bash
LINEAR_ISSUE_SORT=priority linear issue list --team DEV -U  # Find unassigned
linear issue start DEV-123           # Claim and create branch
# ... do work ...
linear issue pr                      # Create PR linked to issue
```

### Create and Start Feature
```bash
linear issue create --team DEV -t "Add feature X" --start -a self
```

### Bulk Update
```bash
for id in DEV-60 DEV-61 DEV-62; do
  linear issue update $id -s "In Progress" -a self
done
```

## Configuration

**Config file is unreliable.** Use explicit flags and env vars instead:

```bash
# Always use --team flag for create/update/list
# Always use LINEAR_ISSUE_SORT env var for list (--sort flag is broken)
LINEAR_ISSUE_SORT=priority linear issue list --team DEV -s unstarted
```

Get team key with `linear team list` (DEV, SAL, etc.).

## Tips

- Issue IDs follow pattern: `TEAM-123` (e.g., `DEV-123`)
- Use `-a self` to assign to yourself
- `--no-interactive` skips prompts for scripting
- Pipe to `jq` for JSON: `linear issue view DEV-123 -j | jq .title`

## Additional Resources

See `references/api-patterns.md` for advanced GraphQL API usage patterns.
