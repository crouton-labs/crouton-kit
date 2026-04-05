#!/usr/bin/env bash
#
# SessionStart hook that ensures `termrender` is installed.
# Installs/upgrades from PyPI if missing.
#

set -euo pipefail

# Already accessible — nothing to do
if command -v termrender &>/dev/null; then
    exit 0
fi

# Install from PyPI
if command -v pip &>/dev/null; then
    pip install --quiet termrender 2>/dev/null
elif command -v pip3 &>/dev/null; then
    pip3 install --quiet termrender 2>/dev/null
elif command -v pipx &>/dev/null; then
    pipx install termrender 2>/dev/null
else
    echo "{\"systemMessage\": \"termrender not installed: no pip/pip3/pipx found. Install manually: pip install termrender\"}"
    exit 0
fi

echo "{\"systemMessage\": \"Installed termrender CLI from PyPI.\"}"
