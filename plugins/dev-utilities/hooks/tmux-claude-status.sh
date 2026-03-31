#!/bin/bash
# Called from tmux window-status-format with a window_id argument.
# Returns colored dots for each pane in that window that has Claude state.
#
# Also corrects stale "processing" state when Claude is actually waiting
# for input (e.g. after user interrupt/Esc, which has no hook).

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

    # If state says processing, verify Claude isn't actually idle.
    # When Claude waits for input, the pane's foreground process group
    # matches the shell/claude pid and its state includes "S" (sleeping).
    # We check if the node process (Claude's runtime) is in a sleep state
    # with low CPU — indicating it's waiting for input, not working.
    if [ "$state" = "processing" ]; then
        # Find the claude node process under this pane's process tree
        fg_pid=$(tmux display-message -p -t "$pane_id" '#{pane_pid}' 2>/dev/null)
        if [ -n "$fg_pid" ]; then
            # Check if any child process is actively running (state R = running)
            active=$(ps -o state= -g "$fg_pid" 2>/dev/null | grep -c 'R')
            if [ "$active" -eq 0 ]; then
                # All processes sleeping — Claude is likely waiting for input
                # Check how long ago the state file was written
                if [ "$(uname)" = "Darwin" ]; then
                    file_age=$(( $(date +%s) - $(stat -f %m "$state_file") ))
                else
                    file_age=$(( $(date +%s) - $(stat -c %Y "$state_file") ))
                fi
                # If processing for >10s and no active processes, assume stopped
                if [ "$file_age" -gt 10 ]; then
                    state="stopped"
                    echo "stopped" > "$state_file"
                fi
            fi
        fi
    fi

    case "$state" in
        idle)       dots="${dots}#[fg=#6c7086]●" ;;
        processing) dots="${dots}#[fg=#f9e2af]●" ;;
        stopped)    dots="${dots}#[fg=#a6e3a1]●" ;;
    esac
done <<< "$panes"

if [ -n "$dots" ]; then
    printf " %s" "$dots"
fi
