#!/usr/bin/env bash
#
# SessionStart hook that ensures `ai` is globally accessible.
# Creates symlink in ~/.local/bin and adds to PATH if needed.
#

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$(realpath "$0")")")}"
AI_BIN="$PLUGIN_ROOT/dist/ai.mjs"
LOCAL_BIN="$HOME/.local/bin"

# Already accessible — nothing to do
if command -v ai &>/dev/null; then
    exit 0
fi

mkdir -p "$LOCAL_BIN"
ln -sf "$AI_BIN" "$LOCAL_BIN/ai"

# Ensure ~/.local/bin is in PATH via shell config
SHELL_CONFIG=""
if [[ -f "$HOME/.zshrc" ]]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [[ -f "$HOME/.bashrc" ]]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [[ -f "$HOME/.bash_profile" ]]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

if [[ -n "$SHELL_CONFIG" ]] && ! grep -q '\.local/bin' "$SHELL_CONFIG" 2>/dev/null; then
    {
        echo ""
        echo "# Local bin (added automatically)"
        echo 'export PATH="$HOME/.local/bin:$PATH"'
    } >> "$SHELL_CONFIG"
fi

echo "{\"systemMessage\": \"Installed ai CLI to ~/.local/bin. Restart shell or run: export PATH=\\\"$LOCAL_BIN:\$PATH\\\"\"}"
