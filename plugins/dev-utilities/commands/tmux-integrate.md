---
description: Set up tmux status bar with Claude session state indicators
allowed-tools: Bash(tmux:*), Read, Edit, Write
---

The dev-utilities plugin tracks Claude session state per-pane via hooks (idle/processing/stopped). The status helper script at `~/.tmux/claude-status.sh` is auto-installed by the hook. This command wires it into the user's tmux config.

## What to do

1. Read `~/.tmux.conf` (may not exist)
2. Read the reference config at `${CLAUDE_PLUGIN_ROOT}/hooks/tmux.conf` for the recommended setup
3. Present the user with the situation and get confirmation before making changes:

**If no `~/.tmux.conf` exists:**
Tell the user you'll install the full reference config and ask for confirmation.

**If `~/.tmux.conf` exists:**
Show the user what needs to be added to their existing config. The required pieces are:

```
# Claude state dots in window tabs — add to your window-status-format and window-status-current-format:
#   #(~/.tmux/claude-status.sh '#{window_id}')
#
# Example: if your current format is:
#   set -g window-status-format "... #W ..."
# Change it to:
#   set -g window-status-format "... #W#(~/.tmux/claude-status.sh '#{window_id}') ..."
#
# Also add for status refresh:
#   set -g status-interval 2
```

Show the user their current `window-status-format` and `window-status-current-format` values, propose the specific edits, and ask for confirmation before applying.

4. After changes, run `tmux source-file ~/.tmux.conf` to apply immediately.

## State indicator reference
- `●` gray (#6c7086) = idle (fresh/cleared chat)
- `●` yellow (#f9e2af) = processing (Claude working)
- `●` green (#a6e3a1) = stopped (Claude finished)
