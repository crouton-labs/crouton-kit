#!/bin/bash
# Called from tmux window-status-format with a window_id argument.
# Returns colored dots for each pane in that window that has Claude state.

STATE_DIR="/tmp/claude-tmux-state"
WINDOW_ID="$1"

if [ -z "$WINDOW_ID" ] || [ ! -d "$STATE_DIR" ]; then
    exit 0
fi

panes=$(tmux list-panes -t "$WINDOW_ID" -F '#{pane_id} #{pane_pid}' 2>/dev/null)
if [ -z "$panes" ]; then
    exit 0
fi

dots=""

while IFS=' ' read -r pane_id pane_pid; do
    pane_num="${pane_id#%}"
    state_file="${STATE_DIR}/${pane_num}"

    if [ ! -f "$state_file" ]; then
        continue
    fi

    state=$(cat "$state_file" 2>/dev/null)

    case "$state" in
        idle)       dots="${dots}#[fg=#5e584e]●" ;;   # gloam fg4
        processing) dots="${dots}#[fg=#d4ad6a]●" ;;   # gloam yellow
        stopped)    dots="${dots}#[fg=#a9b16e]●" ;;   # gloam green
    esac
done <<< "$panes"

if [ -n "$dots" ]; then
    printf " %s" "$dots"
fi
