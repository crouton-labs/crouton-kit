#!/usr/bin/env bash
#
# SessionStart hook that ensures crouton-kit/bin is in user's PATH.
# Adds to shell config if not already present.
#

set -euo pipefail

# Get plugin root (where this hook lives)
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$(realpath "$0")")")}"
BIN_DIR="$PLUGIN_ROOT/bin"

# Check if new-worktree is already accessible
if command -v new-worktree &>/dev/null; then
    exit 0
fi

# Check if already in shell config
SHELL_CONFIG=""
if [[ -f "$HOME/.zshrc" ]]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [[ -f "$HOME/.bashrc" ]]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [[ -f "$HOME/.bash_profile" ]]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

if [[ -z "$SHELL_CONFIG" ]]; then
    exit 0  # No shell config found, skip
fi

# Check if path already in config
if grep -q "$BIN_DIR" "$SHELL_CONFIG" 2>/dev/null; then
    exit 0  # Already configured
fi

# Add to shell config
{
    echo ""
    echo "# crouton-kit CLI tools (added automatically)"
    echo "export PATH=\"\$PATH:$BIN_DIR\""
} >> "$SHELL_CONFIG"

# Output message for user
echo "{\"systemMessage\": \"Added crouton-kit/bin to PATH in $SHELL_CONFIG. Restart your shell or run: source $SHELL_CONFIG\"}"
