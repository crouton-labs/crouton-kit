#!/usr/bin/env python3
"""Stop hook: blocks session end if submit tool was required but not called."""

import json
import os
import sys


def main():
    submit_path = os.environ.get("AI_WORKFLOW_SUBMIT_PATH")
    if not submit_path:
        # Not a submit-required session — allow
        return

    # Guard against infinite recursion (block → retry → block)
    if os.environ.get("AI_WORKFLOW_STOP_HOOK_ACTIVE"):
        return

    os.environ["AI_WORKFLOW_STOP_HOOK_ACTIVE"] = "1"

    # Check if submit file has content
    try:
        if os.path.isfile(submit_path) and os.path.getsize(submit_path) > 0:
            return  # Submitted — allow
    except OSError:
        pass

    # Not submitted — build a helpful error message
    reason = "You MUST call the submit tool with your structured result before stopping."

    # Check transcript for tool use to give targeted feedback
    transcript = sys.stdin.read() if not sys.stdin.isatty() else ""
    if "mcp__submit__submit" in transcript:
        reason += " It looks like you called the submit tool but it may have failed. Try again."

    json.dump({"decision": "block", "reason": reason}, sys.stdout)


if __name__ == "__main__":
    main()
