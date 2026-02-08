#!/usr/bin/env bash
# Block destructive git commands that revert/discard working tree changes.
# PreToolUse hook — reads JSON from stdin, outputs block decision.

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')

[ "$TOOL" = "Bash" ] || exit 0

CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[ -n "$CMD" ] || exit 0

REASON="BLOCKED: This command discards working tree changes and is forbidden in this environment. Users often make changes you don't know about, so reverting files is disabled. Stop immediately and explain to the user what you were trying to do and why, rather than trying to move forward. This could be potentially catastrophic if you ignore this message."

# git checkout -- <path> (revert files)
if echo "$CMD" | grep -qE 'git\s+checkout\s+--\s'; then
  echo "{\"decision\": \"block\", \"reason\": \"$REASON\"}"
  exit 0
fi

# git checkout . (revert all)
if echo "$CMD" | grep -qE 'git\s+checkout\s+\.'; then
  echo "{\"decision\": \"block\", \"reason\": \"$REASON\"}"
  exit 0
fi

# git restore (revert files)
if echo "$CMD" | grep -qE 'git\s+restore\s'; then
  echo "{\"decision\": \"block\", \"reason\": \"$REASON\"}"
  exit 0
fi

# git reset --hard
if echo "$CMD" | grep -qE 'git\s+reset\s+--hard'; then
  echo "{\"decision\": \"block\", \"reason\": \"$REASON\"}"
  exit 0
fi

# git clean -f (delete untracked files)
if echo "$CMD" | grep -qE 'git\s+clean\s+-[a-zA-Z]*f'; then
  echo "{\"decision\": \"block\", \"reason\": \"$REASON\"}"
  exit 0
fi
