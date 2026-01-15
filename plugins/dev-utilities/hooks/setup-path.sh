#!/usr/bin/env bash
#
# SessionStart hook that ensures new-worktree is globally accessible.
# Creates symlink in ~/.local/bin and adds to PATH if needed.
#

set -euo pipefail

# Get plugin root
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$(realpath "$0")")")}"
NEW_WORKTREE="$PLUGIN_ROOT/bin/new-worktree"
LOCAL_BIN="$HOME/.local/bin"

# Check if new-worktree is already accessible
if command -v new-worktree &>/dev/null; then
    exit 0
fi

# Create ~/.local/bin if it doesn't exist
mkdir -p "$LOCAL_BIN"

# Create/update symlink
ln -sf "$NEW_WORKTREE" "$LOCAL_BIN/new-worktree"

# Check if ~/.local/bin is in PATH via shell config
SHELL_CONFIG=""
if [[ -f "$HOME/.zshrc" ]]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [[ -f "$HOME/.bashrc" ]]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [[ -f "$HOME/.bash_profile" ]]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

# Add to PATH if not already there
if [[ -n "$SHELL_CONFIG" ]] && ! grep -q '\.local/bin' "$SHELL_CONFIG" 2>/dev/null; then
    {
        echo ""
        echo "# Local bin (added automatically)"
        echo 'export PATH="$HOME/.local/bin:$PATH"'
    } >> "$SHELL_CONFIG"
fi

echo "{\"systemMessage\": \"Installed new-worktree to ~/.local/bin. Restart shell or run: export PATH=\\\"$LOCAL_BIN:\$PATH\\\"\"}"
