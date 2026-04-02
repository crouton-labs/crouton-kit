#!/bin/bash
# tmux-session-status.sh — show all tmux sessions colored by aggregate Claude state
# Called from status-right: #(~/.tmux/claude-sessions.sh '#{session_name}')
#
# Format: ● SessionName  ● SessionName  ...
# Dot colors:  green = has pane waiting for input (stopped)
#              yellow = has pane processing
#              gray = idle / no Claude sessions

STATE_DIR="/tmp/claude-tmux-state"
CURRENT_SESSION="$1"

GREEN="#a9b16e"
YELLOW="#d4ad6a"
GRAY="#5e584e"
NAME_FG="#b0a898"

# Get all panes across all sessions in one call
pane_data=$(tmux list-panes -a -F '#{session_name} #{pane_id}' 2>/dev/null)
sessions=$(tmux list-sessions -F '#{session_name}' 2>/dev/null)

if [ -z "$sessions" ]; then
    exit 0
fi

# Build priority string: "session_name priority" per pane with Claude state
priorities=""
if [ -d "$STATE_DIR" ]; then
    while IFS=' ' read -r sess pane_id; do
        [ -z "$sess" ] && continue
        pane_num="${pane_id#%}"
        state_file="${STATE_DIR}/${pane_num}"
        [ -f "$state_file" ] || continue
        state=$(cat "$state_file" 2>/dev/null)
        case "$state" in
            stopped)    priorities="${priorities}${sess} 2"$'\n' ;;
            processing) priorities="${priorities}${sess} 1"$'\n' ;;
            idle)       priorities="${priorities}${sess} 0"$'\n' ;;
        esac
    done <<< "$pane_data"
fi

output=""
while IFS= read -r sess; do
    [ -z "$sess" ] && continue

    # Find highest priority for this session
    highest=0
    if [ -n "$priorities" ]; then
        while IFS=' ' read -r s p; do
            if [ "$s" = "$sess" ] && [ -n "$p" ] && [ "$p" -gt "$highest" ] 2>/dev/null; then
                highest="$p"
            fi
        done <<< "$priorities"
    fi

    case "$highest" in
        2) dot_color="$GREEN" ;;
        1) dot_color="$YELLOW" ;;
        *) dot_color="$GRAY" ;;
    esac

    if [ "$sess" = "$CURRENT_SESSION" ]; then
        output="${output}#[fg=${dot_color}]●#[fg=${NAME_FG},bold] ${sess} #[nobold]"
    else
        output="${output}#[fg=${dot_color}]●#[fg=${NAME_FG}] ${sess} "
    fi
done <<< "$sessions"

printf "%s" "$output"
