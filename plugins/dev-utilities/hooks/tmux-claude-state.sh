#!/bin/bash
# Writes Claude session state to /tmp/claude-tmux-state/<pane_id>
# so tmux can display per-pane Claude activity indicators.
#
# States: idle | processing | stopped
#
# Hook events mapped:
#   SessionStart     → idle
#   UserPromptSubmit → processing
#   Stop             → stopped
#   SessionEnd       → (cleanup)
#
# Run /tmux-integrate to set up the tmux status bar display.

STATE_DIR="/tmp/claude-tmux-state"
mkdir -p "$STATE_DIR"

input=$(cat)
event=$(echo "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('hook_event_name',''))" 2>/dev/null)

# Resolve which tmux pane this session lives in.
pane_id="${TMUX_PANE}"
if [ -z "$pane_id" ]; then
    exit 0  # not inside tmux, nothing to do
fi

# Ensure the status helper script is installed (lightweight, no config changes)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TMUX_STATUS_SCRIPT="$HOME/.tmux/claude-status.sh"
if [ -f "$SCRIPT_DIR/tmux-claude-status.sh" ]; then
    mkdir -p "$HOME/.tmux"
    if ! cmp -s "$SCRIPT_DIR/tmux-claude-status.sh" "$TMUX_STATUS_SCRIPT" 2>/dev/null; then
        cp "$SCRIPT_DIR/tmux-claude-status.sh" "$TMUX_STATUS_SCRIPT"
        chmod +x "$TMUX_STATUS_SCRIPT"
    fi
fi

# Install session-level status script
TMUX_SESSIONS_SCRIPT="$HOME/.tmux/claude-sessions.sh"
if [ -f "$SCRIPT_DIR/tmux-session-status.sh" ]; then
    if ! cmp -s "$SCRIPT_DIR/tmux-session-status.sh" "$TMUX_SESSIONS_SCRIPT" 2>/dev/null; then
        cp "$SCRIPT_DIR/tmux-session-status.sh" "$TMUX_SESSIONS_SCRIPT"
        chmod +x "$TMUX_SESSIONS_SCRIPT"
    fi
fi

# Write state
pane_file="${STATE_DIR}/${pane_id#%}"

case "$event" in
    SessionStart)
        echo "idle" > "$pane_file"
        ;;
    UserPromptSubmit)
        echo "processing" > "$pane_file"
        ;;
    Stop|SubagentStop)
        echo "stopped" > "$pane_file"
        ;;
    SessionEnd)
        rm -f "$pane_file"
        ;;
esac

exit 0
