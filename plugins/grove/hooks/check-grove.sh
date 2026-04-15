#!/usr/bin/env bash
# SessionStart hook: ensure grove CLI is installed and up to date
if ! command -v grove &>/dev/null; then
  echo "grove CLI not found — installing..." >&2
  npm i -g @crouton-kit/grove 2>&1
  exit $?
fi

LOCAL=$(grove --version 2>/dev/null)
LATEST=$(npm view @crouton-kit/grove version 2>/dev/null)

if [[ -n "$LATEST" && "$LOCAL" != "$LATEST" ]]; then
  echo "grove $LOCAL → $LATEST — updating..." >&2
  npm i -g @crouton-kit/grove@latest 2>&1
fi
