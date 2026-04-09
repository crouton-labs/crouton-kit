#!/usr/bin/env bash
#
# SessionStart hook: ensures render-viz is installed via npm.
#

set -euo pipefail

if command -v render-viz &>/dev/null; then
    exit 0
fi

if ! command -v npm &>/dev/null; then
    printf '{"systemMessage": "render-viz not installed: npm not found. Install manually: npm install -g @crouton-kit/render-viz"}\n'
    exit 0
fi

npm install -g @crouton-kit/render-viz 2>/dev/null
if command -v render-viz &>/dev/null; then
    printf '{"systemMessage": "Installed render-viz CLI via npm"}\n'
else
    printf '{"systemMessage": "render-viz install failed. Install manually: npm install -g @crouton-kit/render-viz"}\n'
fi

exit 0
