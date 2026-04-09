#!/usr/bin/env bash
#
# SessionStart hook: installs `termrender` (pip).
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

install_termrender || true

if [[ ${#messages[@]} -gt 0 ]]; then
    joined=$(printf '%s. ' "${messages[@]}")
    printf '{"systemMessage": %s}\n' "$(printf '%s' "$joined" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))')"
fi

exit 0
