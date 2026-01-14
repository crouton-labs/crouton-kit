#!/usr/bin/env python3
"""
Stop hook that reminds to run /rpi:review-plan after editing .plan.md files.
"""
import json
import sys


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    # Prevent infinite loops
    if input_data.get("stop_hook_active", False):
        sys.exit(0)

    transcript_path = input_data.get("transcript_path", "")
    if not transcript_path:
        sys.exit(0)

    try:
        with open(transcript_path, "r") as f:
            lines = f.readlines()
    except (IOError, FileNotFoundError):
        sys.exit(0)

    # Track: last plan edit line, review-plan skill usage
    last_plan_edit_line = -1
    review_plan_run_line = -1

    for line_num, line in enumerate(lines):
        try:
            entry = json.loads(line.strip())
        except json.JSONDecodeError:
            continue

        # Check assistant messages for tool use
        if entry.get("type") == "assistant":
            message = entry.get("message", {})
            content = message.get("content", [])

            for block in content:
                if block.get("type") != "tool_use":
                    continue

                tool_name = block.get("name", "")
                tool_input = block.get("input", {})

                # Check for .plan.md edits
                if tool_name in ("Write", "Edit"):
                    file_path = tool_input.get("file_path", "")
                    if file_path.endswith(".plan.md"):
                        last_plan_edit_line = line_num

                # Check for review-plan skill invocation
                if tool_name == "Skill":
                    skill_name = tool_input.get("skill", "")
                    if "review-plan" in skill_name:
                        review_plan_run_line = line_num

    # No plan edits - nothing to do
    if last_plan_edit_line < 0:
        sys.exit(0)

    # Determine message based on state
    if review_plan_run_line < 0:
        # Never run - MUST run
        message = """<system-reminder>
You edited a .plan.md file but have not run /rpi:review-plan to validate it.
You MUST run /rpi:review-plan {spec-path} {plan-path} before finishing.
</system-reminder>"""
    elif review_plan_run_line < last_plan_edit_line:
        # Run but before latest edit - suggest running
        message = """<system-reminder>
You edited a .plan.md file after the last /rpi:review-plan validation.
Consider running /rpi:review-plan again if the changes were significant.
</system-reminder>"""
    else:
        # Review was run after last edit - all good
        sys.exit(0)

    output = {
        "hookSpecificOutput": {
            "hookEventName": "Stop",
            "additionalContext": message
        }
    }
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
