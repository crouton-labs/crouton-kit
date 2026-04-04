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
