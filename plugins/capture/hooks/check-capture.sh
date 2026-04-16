#!/usr/bin/env bash
# SessionStart hook: ensure capture CLI is installed and up to date
if ! command -v capture &>/dev/null; then
  echo "capture CLI not found — installing..." >&2
  npm i -g @crouton-kit/capture 2>&1
  exit $?
fi

LOCAL=$(capture --version 2>/dev/null)
LATEST=$(npm view @crouton-kit/capture version 2>/dev/null)

if [[ -n "$LATEST" && "$LOCAL" != "$LATEST" ]]; then
  echo "capture $LOCAL → $LATEST — updating..." >&2
  npm i -g @crouton-kit/capture@latest 2>&1
fi
