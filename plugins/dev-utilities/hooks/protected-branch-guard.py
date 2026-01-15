#!/usr/bin/env python3
"""
PreToolUse hook that blocks file writes on protected branches.
Protected branches: main, master, dev, development, test, staging, production

Only blocks writes to files within the git repository.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

# Cache for branch protection status (persists for hook lifetime, which is per-invocation)
_protection_cache: dict[str, bool] = {}


def get_repo_root() -> str | None:
    """Get the git repository root. Returns None if not in a git repo."""
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip()


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
    """Check if branch has protection rules on remote via GitHub API."""
    if branch in _protection_cache:
        return _protection_cache[branch]
    
    # Try to get repo info from git remote
    try:
        result = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            _protection_cache[branch] = False
            return False
        
        remote_url = result.stdout.strip()
        
        # Parse owner/repo from remote URL
        # Handles: git@github.com:owner/repo.git, https://github.com/owner/repo.git
        match = re.search(r"github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$", remote_url)
        if not match:
            _protection_cache[branch] = False
            return False
        
        owner, repo = match.groups()
        
        # Check branch protection via gh CLI
        result = subprocess.run(
            ["gh", "api", f"repos/{owner}/{repo}/branches/{branch}/protection", "--silent"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        
        # 200 = protected, 404 = not protected, other = assume not protected
        is_protected = result.returncode == 0
        _protection_cache[branch] = is_protected
        return is_protected
        
    except (subprocess.TimeoutExpired, FileNotFoundError):
        # gh not installed or timeout - assume not protected
        _protection_cache[branch] = False
        return False


def file_is_in_repo(file_path: str, repo_root: str) -> bool:
    """Check if a file path is within the git repository."""
    try:
        file_resolved = Path(file_path).resolve()
        repo_resolved = Path(repo_root).resolve()
        return str(file_resolved).startswith(str(repo_resolved) + "/") or file_resolved == repo_resolved
    except Exception:
        return False


def main():
    input_data = json.load(sys.stdin)
    tool_name = input_data.get("tool_name", "")

    # Only check file modification tools
    if tool_name not in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
        sys.exit(0)

    repo_root = get_repo_root()
    if not repo_root:
        sys.exit(0)  # Not in a git repo - nothing to protect

    # Get file path from tool input
    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")
    
    if not file_path:
        sys.exit(0)  # No file path - can't check
    
    # Allow writes outside the repo
    if not file_is_in_repo(file_path, repo_root):
        sys.exit(0)

    # Allow writes to .claude/ directory (config files, not code)
    try:
        file_resolved = Path(file_path).resolve()
        repo_resolved = Path(repo_root).resolve()
        relative = file_resolved.relative_to(repo_resolved)
        if relative.parts and relative.parts[0] == ".claude":
            sys.exit(0)
    except (ValueError, IndexError):
        pass  # Not relative to repo or empty path - continue with checks

    try:
        branch = get_current_branch()
    except RuntimeError:
        sys.exit(0)  # Not in a git repo - nothing to protect

    if not is_protected_branch(branch):
        sys.exit(0)

    # Check for linear config
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
{{"track": true, "teamKey": "<from team list>"}}
```
3. Then use the `linear-worktree` skill to find/create an issue.

**If no:** Create `.claude/linear-config.json`:
```json
{{"track": false}}
```
Then run `${CLAUDE_PLUGIN_ROOT}/bin/new-worktree <type> <topic>` + cd"""
    elif linear_enabled:
        error_msg = f"""⛔ Blocked: Cannot write files on protected branch '{branch}'

Use the `linear-worktree` skill to find an existing Linear issue.

The skill returns:
- `USE: <type> VAL-xxx-slug` → run `${CLAUDE_PLUGIN_ROOT}/bin/new-worktree <type> VAL-xxx-slug`, then `cd` to WORKTREE_PATH from output
- `NEW_ISSUE_NEEDED` → ask user what they're working on, create issue with `linear issue create -t "Title" -a self --start`, then run ${CLAUDE_PLUGIN_ROOT}/bin/new-worktree + cd"""
    else:
        error_msg = f"""⛔ Blocked: Cannot write files on protected branch '{branch}'

Create a worktree and cd into it:
  ${CLAUDE_PLUGIN_ROOT}/bin/new-worktree <type> <topic>
  cd <WORKTREE_PATH from output>

Types: feat, fix, refactor, chore, docs"""

    print(error_msg, file=sys.stderr)
    sys.exit(2)  # Exit code 2 = block and show message


if __name__ == "__main__":
    main()
