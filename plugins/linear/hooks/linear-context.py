#!/usr/bin/env python3
"""
UserPromptSubmit hook: injects Linear CLI context when user mentions "linear" or a ticket ID.
"""
import json
import re
import subprocess
import sys


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    prompt = input_data.get("prompt", "")

    # Trigger on "linear" keyword or ticket IDs like DEV-123
    if not re.search(r'\blinear\b|\b[A-Z]{2,5}-\d+\b', prompt, re.IGNORECASE):
        sys.exit(0)

    # Get auth identity
    try:
        result = subprocess.run(
            ["linear", "auth", "whoami"],
            capture_output=True, text=True, timeout=5
        )
        whoami = result.stdout.strip() if result.returncode == 0 else "Not authenticated"
    except (subprocess.TimeoutExpired, FileNotFoundError):
        whoami = "linear CLI not available"

    context = f"""<linear-context>
**Linear CLI Context:**
  {whoami}

**Quick reference:**
- Update state: `linear issue update DEV-xxx --state "Done"` (flag is `--state`, NOT `--status`)
- Workflow states for update/create: "Todo", "In Progress", "In Review", "Done", "Canceled"
- List states for `issue list -s`: triage, backlog, unstarted, started, completed, canceled
- Close issue: `linear issue update DEV-xxx --state "Done"`

**For complex operations** (creating issues, PRs, bulk updates): use the `linear-cli` skill for full CLI docs, or the `/linear:update-issue`, `/linear:new-issue`, `/linear:pr` commands.
</linear-context>"""

    output = {
        "additionalContext": context
    }
    print(json.dumps(output))


if __name__ == "__main__":
    main()
