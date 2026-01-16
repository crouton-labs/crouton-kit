#!/usr/bin/env python3
"""
PreToolUse hook that blocks git push to protected branches.
Instructs the agent to use protected-push script instead.

Detects:
- git push (to current branch)
- git push origin main (explicit branch)
- git push -u origin main (with upstream)

Does NOT block:
- git push to non-protected branches
- git push when no commits ahead of remote
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# Cache for branch protection status
_protection_cache: dict[str, bool] = {}

# Get the protected-push script path from plugin root
_plugin_root = os.environ.get("CLAUDE_PLUGIN_ROOT") or str(Path(__file__).parent.parent)
PROTECTED_PUSH = f"{_plugin_root}/bin/protected-push"


def get_repo_root() -> str | None:
    """Get the git repository root for cwd."""
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def get_current_branch() -> str | None:
    """Get the current git branch name."""
    result = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def get_remote_url(remote: str = "origin") -> str | None:
    """Get the remote URL."""
    result = subprocess.run(
        ["git", "remote", "get-url", remote],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def parse_github_repo(remote_url: str) -> tuple[str, str] | None:
    """Parse owner/repo from GitHub remote URL."""
    match = re.search(r"github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$", remote_url)
    if match:
        return match.groups()
    return None


def is_protected_branch(branch: str, owner: str, repo: str) -> bool:
    """Check if branch has protection rules on GitHub."""
    cache_key = f"{owner}/{repo}:{branch}"
    if cache_key in _protection_cache:
        return _protection_cache[cache_key]

    try:
        result = subprocess.run(
            ["gh", "api", f"repos/{owner}/{repo}/branches/{branch}/protection", "--silent"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        # 200 = protected, 404 = not protected
        is_protected = result.returncode == 0
        _protection_cache[cache_key] = is_protected
        return is_protected
    except (subprocess.TimeoutExpired, FileNotFoundError):
        _protection_cache[cache_key] = False
        return False


def has_commits_ahead(remote: str, branch: str) -> bool:
    """Check if there are commits ahead of remote."""
    # Fetch first to ensure we have latest
    subprocess.run(
        ["git", "fetch", remote, branch, "--quiet"],
        capture_output=True,
        timeout=30,
    )

    result = subprocess.run(
        ["git", "rev-list", "--count", f"{remote}/{branch}..HEAD"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode != 0:
        return False
    count = int(result.stdout.strip())
    return count > 0


def parse_push_command(command: str) -> tuple[str | None, str | None]:
    """
    Parse a git push command to extract remote and branch.
    Returns (remote, branch) or (None, None) if not a push or can't parse.
    """
    # Match various git push patterns
    # git push
    # git push origin
    # git push origin main
    # git push -u origin main
    # git push --set-upstream origin main

    if not re.search(r"\bgit\s+push\b", command):
        return None, None

    # Remove git push and flags to get positional args
    # First extract the git push part
    match = re.search(r"\bgit\s+push\b(.*)$", command)
    if not match:
        return None, None

    args_part = match.group(1).strip()

    # Remove known flags
    # -u, --set-upstream, -f, --force, --force-with-lease, -q, --quiet, etc.
    args_part = re.sub(r"\s+(-u|--set-upstream|--force-with-lease|-f|--force|-q|--quiet|--no-verify|-v|--verbose|--tags|--all|--mirror|--prune|--dry-run|-n|--delete|-d)\b", "", args_part)
    # Remove flags with values
    args_part = re.sub(r"\s+(-o|--push-option|--repo|--receive-pack|--exec)\s+\S+", "", args_part)

    parts = args_part.split()

    remote = None
    branch = None

    if len(parts) == 0:
        # Just "git push" - uses default remote and current branch
        remote = "origin"
        branch = get_current_branch()
    elif len(parts) == 1:
        # "git push origin" - pushes current branch
        remote = parts[0]
        branch = get_current_branch()
    elif len(parts) >= 2:
        # "git push origin main" or "git push origin main:main"
        remote = parts[0]
        branch_spec = parts[1]
        # Handle refspec (local:remote)
        if ":" in branch_spec:
            branch = branch_spec.split(":")[1]  # Use remote branch name
        else:
            branch = branch_spec

    return remote, branch


def main():
    try:
        input_data = json.load(sys.stdin)
    except (json.JSONDecodeError, Exception):
        sys.exit(0)  # Invalid input - allow operation

    tool_name = input_data.get("tool_name", "")

    # Only check Bash commands
    if tool_name != "Bash":
        sys.exit(0)

    tool_input = input_data.get("tool_input", {})
    command = tool_input.get("command", "")

    # Check if this is a git push command
    remote, branch = parse_push_command(command)

    if not remote or not branch:
        sys.exit(0)  # Not a git push or couldn't parse

    # Get repo info
    repo_root = get_repo_root()
    if not repo_root:
        sys.exit(0)  # Not in a git repo

    remote_url = get_remote_url(remote)
    if not remote_url:
        sys.exit(0)  # No remote configured

    repo_info = parse_github_repo(remote_url)
    if not repo_info:
        sys.exit(0)  # Not a GitHub repo

    owner, repo = repo_info

    # Check if target branch is protected
    if not is_protected_branch(branch, owner, repo):
        sys.exit(0)  # Not protected - allow push

    # Check if we're on the protected branch (pushing from it)
    current_branch = get_current_branch()
    if current_branch != branch:
        # Pushing to a different branch (e.g., PR merge) - allow
        # This handles the case of pushing a feature branch
        sys.exit(0)

    # Check if there are actually commits to push
    if not has_commits_ahead(remote, branch):
        sys.exit(0)  # Nothing to push - allow (will be a no-op anyway)

    # Block the push
    error_msg = f"""⛔ Blocked: Cannot push directly to protected branch '{branch}'

You have commits on '{branch}' that need to go through a PR.

Run instead:
  {PROTECTED_PUSH}

This will:
1. Create a new branch from your commits
2. Push that branch
3. Open a PR to '{branch}'
4. Reset local '{branch}' to match remote

Options:
  {PROTECTED_PUSH} --auto-merge    # Auto-merge when CI passes
  {PROTECTED_PUSH} --dry-run       # Preview without making changes
  {PROTECTED_PUSH} --help          # More options"""

    print(error_msg, file=sys.stderr)
    sys.exit(2)  # Exit code 2 = block and show message


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)  # On any error, allow the operation
