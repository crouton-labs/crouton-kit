#!/usr/bin/env python3
"""
PreToolUse hook that blocks file writes on protected branches.
Protected branches: main, master, dev, development, test, staging, production
"""
import json
import subprocess
import sys
from pathlib import Path

PROTECTED_BRANCHES = {"main", "master", "dev", "development", "test", "staging", "production"}


def get_current_branch() -> str:
    """Get the current git branch name. Raises if not in a git repo."""
    result = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode != 0:
        raise RuntimeError("Not in a git repository")
    return result.stdout.strip()


def is_protected_branch(branch: str) -> bool:
    """Check if branch is in the protected set."""
    return branch in PROTECTED_BRANCHES


def get_username() -> str:
    """Get username from git config (first name, lowercase)."""
    result = subprocess.run(
        ["git", "config", "user.name"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode == 0 and result.stdout.strip():
        # Take first name, lowercase, replace spaces with hyphens
        name = result.stdout.strip().split()[0].lower()
        return name
    return "<username>"


def main():
    input_data = json.load(sys.stdin)
    tool_name = input_data.get("tool_name", "")

    # Only check file modification tools
    if tool_name not in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
        sys.exit(0)

    try:
        branch = get_current_branch()
    except RuntimeError:
        sys.exit(0)  # Not in a git repo - nothing to protect

    if not is_protected_branch(branch):
        sys.exit(0)

    # Check for linear config
    username = get_username()
    repo_root = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True, text=True, timeout=5
    ).stdout.strip()

    config_path = f"{repo_root}/.claude/linear-config.json"
    config_exists = False
    linear_enabled = False

    try:
        with open(config_path) as f:
            config = json.load(f)
            config_exists = True
            linear_enabled = config.get("track", False) is True
    except FileNotFoundError:
        pass
    except json.JSONDecodeError:
        config_exists = True  # File exists but invalid

    if not config_exists:
        error_msg = f"""⛔ Blocked: Cannot write files on protected branch '{branch}'

No Linear config found. Ask user: "Do you want to enable Linear tracking for this project?"

**If yes:**
1. Run `linear team list` to find the team key (e.g., VAL, ENG)
2. Create `.claude/linear-config.json`:
```json
{{"track": true, "username": "{username}", "teamKey": "<from team list>"}}
```
3. Then use `/linear-worktree` to find/create an issue.

**If no:** Create `.claude/linear-config.json`:
```json
{{"track": false}}
```
Then run `new-worktree <type> <topic>` + cd"""
    elif linear_enabled:
        error_msg = f"""⛔ Blocked: Cannot write files on protected branch '{branch}'

Use /linear-worktree to find an existing Linear issue.

The skill returns:
- `USE: <type> VAL-xxx-slug` → run `new-worktree <type> VAL-xxx-slug`, then `cd` to WORKTREE_PATH from output
- `NEW_ISSUE_NEEDED` → ask user what they're working on, create issue with `linear issue create -t "Title" -a self --start`, then new-worktree + cd"""
    else:
        error_msg = f"""⛔ Blocked: Cannot write files on protected branch '{branch}'

Create a worktree and cd into it:
  new-worktree <type> <topic>
  cd <WORKTREE_PATH from output>

Types: feat, fix, refactor, chore, docs"""

    print(error_msg, file=sys.stderr)
    sys.exit(2)  # Exit code 2 = block and show message


if __name__ == "__main__":
    main()
