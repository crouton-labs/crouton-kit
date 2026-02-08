#!/usr/bin/env python3
"""
Stop hook that suggests running /audit after substantial sessions.
Fires once per stop sequence (stop_hook_active prevents re-fire).
"""
import json
import re
import sys


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

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

    assistant_turns = 0
    tool_calls = 0
    file_edits = 0
    file_edit_counts = {}
    audit_ran = False
    user_corrections = 0

    correction_pattern = re.compile(
        r"\b(no[,.\s]|wrong|undo|revert|that's not|try again|actually[,.\s]|don't|stop)\b",
        re.IGNORECASE,
    )

    for line in lines:
        try:
            entry = json.loads(line.strip())
        except json.JSONDecodeError:
            continue

        entry_type = entry.get("type")

        if entry_type == "assistant":
            assistant_turns += 1
            message = entry.get("message", {})
            for block in message.get("content", []):
                if block.get("type") != "tool_use":
                    continue
                tool_calls += 1
                tool_name = block.get("name", "")
                tool_input = block.get("input", {})

                if tool_name in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
                    file_path = tool_input.get(
                        "file_path", tool_input.get("notebook_path", "")
                    )
                    if file_path:
                        file_edits += 1
                        file_edit_counts[file_path] = (
                            file_edit_counts.get(file_path, 0) + 1
                        )

                if tool_name == "Skill" and "audit" in tool_input.get("skill", ""):
                    audit_ran = True

        elif entry_type == "human":
            message = entry.get("message", {})
            for block in message.get("content", []):
                if block.get("type") == "text" and correction_pattern.search(
                    block.get("text", "")
                ):
                    user_corrections += 1

    if audit_ran:
        sys.exit(0)

    backtrack_detected = any(count >= 3 for count in file_edit_counts.values())
    substantial = assistant_turns >= 8 and tool_calls >= 10 and file_edits >= 3
    corrections_detected = user_corrections >= 2

    if not substantial and not backtrack_detected and not corrections_detected:
        sys.exit(0)

    reasons = []
    if substantial:
        reasons.append(f"{assistant_turns} turns, {file_edits} file edits")
    if backtrack_detected:
        thrashed = [f for f, c in file_edit_counts.items() if c >= 3]
        reasons.append(f"repeated edits to {', '.join(thrashed)}")
    if corrections_detected:
        reasons.append(f"{user_corrections} user corrections")

    output = {
        "continue": True,
        "systemMessage": (
            f"Substantial session ({'; '.join(reasons)}). "
            "Consider running /audit to capture failure modes and generate targeted fixes "
            "(hooks, rules, CLAUDE.md updates) before context is lost."
        ),
    }
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
