#!/usr/bin/env bash
#
# SessionStart hook: installs `termrender` (pip) and `render-viz` (bundled node).
#

set -euo pipefail

messages=()

install_termrender() {
    if command -v termrender &>/dev/null; then
        return 0
    fi

    if command -v pip &>/dev/null; then
        pip install --quiet termrender 2>/dev/null && return 0
    fi
    if command -v pip3 &>/dev/null; then
        pip3 install --quiet termrender 2>/dev/null && return 0
    fi
    if command -v pipx &>/dev/null; then
        pipx install termrender 2>/dev/null && return 0
    fi

    messages+=("termrender not installed: no pip/pip3/pipx found. Install manually: pip install termrender")
    return 1
}

install_render_viz() {
    if command -v render-viz &>/dev/null; then
        return 0
    fi

    if ! command -v node &>/dev/null; then
        messages+=("render-viz not installed: node is not available on PATH.")
        return 1
    fi

    local src="${CLAUDE_PLUGIN_ROOT}/render-viz/bin/render-viz"
    if [[ ! -f "$src" ]]; then
        messages+=("render-viz bundle missing at $src")
        return 1
    fi

    # Install next to termrender if possible (same writable bin dir).
    local dst_dir=""
    if command -v termrender &>/dev/null; then
        dst_dir="$(dirname "$(command -v termrender)")"
        if [[ ! -w "$dst_dir" ]]; then
            dst_dir=""
        fi
    fi

    # Fallback: user-local bin dir.
    if [[ -z "$dst_dir" ]]; then
        dst_dir="$HOME/.local/bin"
        mkdir -p "$dst_dir"
    fi

    cp "$src" "$dst_dir/render-viz"
    chmod +x "$dst_dir/render-viz"

    if ! command -v render-viz &>/dev/null; then
        messages+=("render-viz installed to $dst_dir but not on PATH. Add $dst_dir to your PATH.")
        return 1
    fi

    messages+=("Installed render-viz CLI to $dst_dir")
    return 0
}

install_termrender || true
install_render_viz || true

if [[ ${#messages[@]} -gt 0 ]]; then
    joined=$(printf '%s. ' "${messages[@]}")
    printf '{"systemMessage": %s}\n' "$(printf '%s' "$joined" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))')"
fi

exit 0
