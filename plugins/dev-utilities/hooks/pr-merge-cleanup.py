#!/usr/bin/env python3
"""
PostToolUse hook that reminds to cleanup after merging a PR.
Triggers when `gh pr merge` is detected in a Bash command.
"""
import json
import re
import sys


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    if tool_name != "Bash":
        sys.exit(0)

    tool_input = input_data.get("tool_input", {})
    command = tool_input.get("command", "")

    # Check if this is a gh pr merge command
    if not re.search(r"\bgh\s+pr\s+merge\b", command):
        sys.exit(0)

    # Check if the command succeeded
    tool_result = input_data.get("tool_result", {})
    exit_code = tool_result.get("exit_code", 0)
    if exit_code != 0:
        sys.exit(0)  # Merge failed, no cleanup needed

    message = """PR merged successfully. Complete the cleanup:

1. Switch to the target branch: `git checkout main` (or the merge target)
2. Pull latest changes: `git pull`
3. Delete the merged branch locally: `git branch -d <branch-name>`
4. Prune remote tracking branches: `git fetch --prune`
5. If using worktrees, remove the worktree: `git worktree remove <path>`"""

    output = {
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": message
        }
    }
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
