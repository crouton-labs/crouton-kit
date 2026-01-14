#!/usr/bin/env python3
"""
Stop hook that reminds to run review skills after editing .spec.md or .plan.md files.
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

    # Track edits and skill runs
    last_spec_edit_line = -1
    last_plan_edit_line = -1
    review_spec_run_line = -1
    review_plan_run_line = -1

    for line_num, line in enumerate(lines):
        try:
            entry = json.loads(line.strip())
        except json.JSONDecodeError:
            continue

        if entry.get("type") == "assistant":
            message = entry.get("message", {})
            content = message.get("content", [])

            for block in content:
                if block.get("type") != "tool_use":
                    continue

                tool_name = block.get("name", "")
                tool_input = block.get("input", {})

                # Check for spec/plan edits
                if tool_name in ("Write", "Edit"):
                    file_path = tool_input.get("file_path", "")
                    if file_path.endswith(".spec.md"):
                        last_spec_edit_line = line_num
                    elif file_path.endswith(".plan.md"):
                        last_plan_edit_line = line_num

                # Check for review skill invocations
                if tool_name == "Skill":
                    skill_name = tool_input.get("skill", "")
                    if "review-spec" in skill_name:
                        review_spec_run_line = line_num
                    elif "review-plan" in skill_name:
                        review_plan_run_line = line_num

    # Build messages for unvalidated edits
    messages = []

    # Check spec
    if last_spec_edit_line >= 0:
        if review_spec_run_line < 0:
            messages.append(
                "You edited a .spec.md file but have not run /rpi:review-spec to validate it.\n"
                "You MUST run `/rpi:review-spec {spec-path}` before finishing."
            )
        elif review_spec_run_line < last_spec_edit_line:
            messages.append(
                "You edited a .spec.md file after the last /rpi:review-spec validation.\n"
                "Consider running `/rpi:review-spec {spec-path}` again if the changes were significant."
            )

    # Check plan
    if last_plan_edit_line >= 0:
        if review_plan_run_line < 0:
            messages.append(
                "You edited a .plan.md file but have not run /rpi:review-plan to validate it.\n"
                "You MUST run `/rpi:review-plan {spec-path} {plan-path}` before finishing."
            )
        elif review_plan_run_line < last_plan_edit_line:
            messages.append(
                "You edited a .plan.md file after the last /rpi:review-plan validation.\n"
                "Consider running `/rpi:review-plan {spec-path} {plan-path}` again if the changes were significant."
            )

    if not messages:
        sys.exit(0)

    combined = "<system-reminder>\n" + "\n\n".join(messages) + "\n</system-reminder>"

    output = {
        "hookSpecificOutput": {
            "hookEventName": "Stop",
            "additionalContext": combined
        }
    }
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
