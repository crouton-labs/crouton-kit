---
description: Add linear issue
disable-model-invocation: true
---
Create a Linear issue using the `linear` CLI.

## CLI Reference

```bash
linear issue create [options]
```

**Options:**
- `-t, --title <title>` - Title of the issue (required)
- `-d, --description <description>` - Description of the issue
- `-a, --assignee <assignee>` - Assign to 'self' or username/name
- `-p, --parent <parent>` - Parent issue (e.g., DEV-123)
- `-l, --label <label>` - Labels (can be repeated: `-l bug -l urgent`)
- `-s, --state <state>` - Workflow state (triage, backlog, unstarted, started)
- `--team <team>` - Team key (if not default team)
- `--project <project>` - Project name
- `--priority <1-4>` - Priority (1=urgent, 4=low)
- `--estimate <points>` - Points estimate
- `--due-date <date>` - Due date
- `--start` - Start the issue immediately after creation

## Instructions

1. Analyze the user's request and determine:
   - **Title**: Generate a clear, concise title
   - **Description**: Include relevant context
   - **Parent**: If this relates to an existing issue
   - **Labels**: Infer from context (bug, feature, etc.)
   - **Priority**: Only set if explicitly mentioned
   - **Assignee**: Default to `self` unless specified otherwise

2. Run the command:
   ```bash
   linear issue create -t "Title" -d "Description" -a self [other options]
   ```

3. If the user wants to start working immediately, add `--start` flag

4. Return the created issue URL

5. If sub-issues seem necessary, offer to create them

## Examples

```bash
# Basic issue
linear issue create -t "Fix login bug" -d "Users can't log in with SSO" -a self -l bug

# With parent issue
linear issue create -t "Add unit tests" -p DEV-123 -a self

# High priority with project
linear issue create -t "Critical security fix" --priority 1 --project "Q4 Security" -a self --start
```

User request: $ARGUMENTS
