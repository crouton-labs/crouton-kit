#!/usr/bin/env python3
"""
Stop hook that suggests running /audit after substantial sessions.
Uses a temp file keyed by session_id to fire at most once per threshold.
"""
import json
import os
import re
import sys
import tempfile
from datetime import datetime, timezone


def get_state_path(session_id):
    return os.path.join(tempfile.gettempdir(), f"audit-nudge-{session_id}.json")


def load_state(path):
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (IOError, FileNotFoundError, json.JSONDecodeError):
        return {"last_nudge_edits": 0}


def save_state(path, state):
    with open(path, "w") as f:
        json.dump(state, f)


def get_audit_log_path():
    """Return project-level .claude/audit-log.jsonl path."""
    cwd = os.getcwd()
    claude_dir = os.path.join(cwd, ".claude")
    os.makedirs(claude_dir, exist_ok=True)
    return os.path.join(claude_dir, "audit-log.jsonl")


def append_audit_record(session_id, assistant_turns, tool_calls, file_edits,
                        file_edit_counts, user_corrections, backtrack_files):
    """Append a structured JSONL record to .claude/audit-log.jsonl."""
    record = {
        "session_id": session_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "assistant_turns": assistant_turns,
        "tool_calls": tool_calls,
        "file_edits": file_edits,
        "file_edit_counts": file_edit_counts,
        "user_corrections": user_corrections,
        "backtrack_files": backtrack_files,
    }
    try:
        log_path = get_audit_log_path()
        with open(log_path, "a") as f:
            f.write(json.dumps(record) + "\n")
    except (IOError, OSError):
        pass  # Best-effort — don't break the hook


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    if input_data.get("stop_hook_active", False):
        sys.exit(0)

    session_id = input_data.get("session_id", "")
    transcript_path = input_data.get("transcript_path", "")
    if not transcript_path or not session_id:
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

    # Deduplication: check if we already nudged at this edit level
    state_path = get_state_path(session_id)
    state = load_state(state_path)
    last_nudge_edits = state.get("last_nudge_edits", 0)

    # Require 10+ new file edits since last nudge to re-trigger
    edits_since_nudge = file_edits - last_nudge_edits
    if last_nudge_edits > 0 and edits_since_nudge < 10:
        sys.exit(0)

    backtrack_detected = any(count >= 3 for count in file_edit_counts.values())
    substantial = assistant_turns >= 150 and file_edits >= 10
    corrections_detected = user_corrections >= 2

    if not substantial and not backtrack_detected and not corrections_detected:
        sys.exit(0)

    # Append audit log (dedup: only if file_edits changed since last log)
    last_log_edits = state.get("last_log_edits", 0)
    if file_edits > last_log_edits:
        backtrack_files = [f for f, c in file_edit_counts.items() if c >= 3]
        append_audit_record(
            session_id=session_id,
            assistant_turns=assistant_turns,
            tool_calls=tool_calls,
            file_edits=file_edits,
            file_edit_counts=file_edit_counts,
            user_corrections=user_corrections,
            backtrack_files=backtrack_files,
        )
        state["last_log_edits"] = file_edits

    # Record that we nudged at this edit count
    save_state(state_path, {**state, "last_nudge_edits": file_edits})

    reasons = []
    if substantial:
        reasons.append(f"{assistant_turns} turns, {file_edits} file edits")
    if backtrack_detected:
        thrashed = [f for f, c in file_edit_counts.items() if c >= 3]
        reasons.append(f"repeated edits to {', '.join(thrashed)}")
    if corrections_detected:
        reasons.append(f"{user_corrections} user corrections")

    # Use decision: block to send the message to Claude as feedback
    output = {
        "decision": "block",
        "suppressOutput": True,
        "reason": (
            f"[audit-nudge] Substantial session ({'; '.join(reasons)}). "
            "Consider running /audit before context is lost. "
            "Ask user to confirm if unsure."
        ),
    }
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()
