#!/usr/bin/env bash
# SessionStart hook: verify grove CLI is installed
if ! command -v grove &>/dev/null; then
  echo "grove CLI not found. Install with: npm i -g @crouton-kit/grove" >&2
  exit 1
fi
