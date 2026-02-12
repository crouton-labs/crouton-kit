---
description: Update linear issue
---
Update an existing Linear issue using the `linear` CLI.

## CLI Reference

```bash
linear issue update [issueId] [options]
```

**Options:**
- `-t, --title <title>` - Update title
- `-d, --description <description>` - Update description
- `-a, --assignee <assignee>` - Reassign to 'self' or username/name
- `-p, --parent <parent>` - Set/change parent issue
- `-l, --label <label>` - Update labels (can be repeated)
- `-s, --state <state>` - Change workflow state (see State Values below)

> **IMPORTANT:** The flag is `--state` (or `-s`), NOT `--status`. `--status` does not exist.
- `--team <team>` - Move to different team
- `--project <project>` - Change project
- `--priority <1-4>` - Update priority
- `--estimate <points>` - Update estimate
- `--due-date <date>` - Update due date

If `issueId` is omitted, uses the issue from the current git branch.

## Instructions

1. Identify the issue to update:
   - If issue ID provided (e.g., "DEV-42"), use it directly
   - If not provided, get it from current branch: `linear issue id`
   - Or search: `linear issue list --all-states`

2. View current issue state:
   ```bash
   linear issue view DEV-42
   ```

3. Ask clarifying questions if the update request is ambiguous

4. Run the update:
   ```bash
   linear issue update DEV-42 -s started -a self
   ```

5. Only update fields explicitly mentioned—don't change unmentioned fields

## State Values

For `issue update`, use **workflow state names** (not enum values):

| State Name | Use |
|------------|-----|
| `"Todo"` | Ready to work on |
| `"In Progress"` | Being worked on |
| `"In Review"` | Under review |
| `"Done"` | Completed/closed |
| `"Canceled"` | Canceled |

Note: `issue list` uses different enum values (`unstarted`, `started`, `completed`). Don't mix them up.

## Examples

```bash
# Change state to in progress
linear issue update DEV-42 --state "In Progress"

# Close an issue
linear issue update DEV-42 --state "Done"

# Reassign and update priority
linear issue update DEV-42 -a john --priority 2

# Update current branch's issue
linear issue update --state "Done"

# Add labels
linear issue update DEV-42 -l bug -l P1
```

## Useful Commands

```bash
# Get issue from current branch
linear issue id

# View issue details
linear issue view DEV-42
linear issue view DEV-42 --json  # JSON output

# List issues
linear issue list                    # Your unstarted issues
linear issue list -s started         # In progress
linear issue list --all-states       # All states
linear issue list -A                 # All assignees
```

User request: $ARGUMENTS
