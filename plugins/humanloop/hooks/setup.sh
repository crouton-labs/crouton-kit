#!/usr/bin/env bash
#
# SessionStart hook: installs `hl` (npm — @crouton-kit/humanloop) and
# `termrender` (pip). Each is independent; one failing does not block
# the other. Always exits 0.
#

set -euo pipefail

messages=()

install_hl() {
    if command -v hl &>/dev/null; then
        return 0
    fi

    if command -v npm &>/dev/null; then
        npm install -g @crouton-kit/humanloop --silent 2>/dev/null && return 0
    fi
    if command -v pnpm &>/dev/null; then
        pnpm add -g @crouton-kit/humanloop --silent 2>/dev/null && return 0
    fi
    if command -v yarn &>/dev/null; then
        yarn global add @crouton-kit/humanloop --silent 2>/dev/null && return 0
    fi

    messages+=("hl not installed: no npm/pnpm/yarn found. Install manually: npm install -g @crouton-kit/humanloop")
    return 1
}

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

install_hl || true
install_termrender || true

if [[ ${#messages[@]} -gt 0 ]]; then
    joined=$(printf '%s. ' "${messages[@]}")
    printf '{"systemMessage": %s}\n' "$(printf '%s' "$joined" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))')"
fi

exit 0
