#!/usr/bin/env python3
"""
PostToolUse hook that prompts to create PR after pushing from a feature branch.
Extracts Linear issue ID from branch name and suggests proper linking.
Only prompts if no PR exists for the branch yet.
"""
import json
import re
import subprocess
import sys

PROTECTED_BRANCHES = {"main", "master", "dev", "development", "test", "staging", "production"}


def get_current_branch() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode != 0:
        raise RuntimeError("Not in a git repository")
    return result.stdout.strip()


def get_default_base_branch() -> str:
    result = subprocess.run(
        ["git", "branch", "-a"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    branches = result.stdout
    for candidate in ["dev", "development", "main", "master"]:
        if re.search(rf"\b{candidate}\b", branches):
            return candidate
    return "dev"


def extract_linear_issue(branch: str) -> str | None:
    """Extract Linear issue ID from branch like silas/feat/VAL-123-description."""
    match = re.search(r"([A-Z]+-\d+)", branch)
    return match.group(1) if match else None


def is_feature_branch(branch: str) -> bool:
    return branch not in PROTECTED_BRANCHES


def pr_exists_for_branch(branch: str) -> bool:
    """Check if a PR already exists for the current branch."""
    result = subprocess.run(
        ["gh", "pr", "view", branch, "--json", "state"],
        capture_output=True,
        text=True,
        timeout=10,
    )
    return result.returncode == 0


def main():
    input_data = json.load(sys.stdin)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    if tool_name != "Bash":
        sys.exit(0)

    command = tool_input.get("command", "")

    if not re.search(r"\bgit\s+push\b", command):
        sys.exit(0)

    try:
        branch = get_current_branch()
    except RuntimeError:
        sys.exit(0)

    if not is_feature_branch(branch):
        sys.exit(0)

    if pr_exists_for_branch(branch):
        sys.exit(0)

    base_branch = get_default_base_branch()
    linear_issue = extract_linear_issue(branch)

    if linear_issue:
        prompt = f"""**[push-pr-prompt]**
Pushed `{branch}`.

Create PR with Linear link:
```bash
gh pr create --base {base_branch} --body "Fixes {linear_issue}"
```"""
    else:
        prompt = f"""**[push-pr-prompt]**
Pushed `{branch}`.

Create PR:
```bash
gh pr create --base {base_branch}
```"""

    output = {
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": prompt,
        }
    }
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
