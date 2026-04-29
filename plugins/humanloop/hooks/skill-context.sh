#!/usr/bin/env bash
#
# PostToolUse hook for Skill tool — injects live CLI help for whichever
# skill was invoked (humanloop or termrender) plus tmux status.
#

set -euo pipefail

INPUT=$(cat)

SKILL_NAME=$(echo "$INPUT" | jq -r '.tool_input.skill // empty' 2>/dev/null)

case "$SKILL_NAME" in
  humanloop|humanloop:humanloop)
    KIND="humanloop"
    ;;
  termrender|humanloop:termrender)
    KIND="termrender"
    ;;
  *)
    exit 0
    ;;
esac

if [ -n "${TMUX:-}" ]; then
  TMUX_STATUS="Inside tmux session (TMUX=$TMUX)"
else
  TMUX_STATUS="Not inside a tmux session"
fi

if [ "$KIND" = "humanloop" ]; then
  if command -v hl &>/dev/null; then
    HL_HELP=$(hl --help 2>&1 || echo "hl help failed")
    HL_CREATE_HELP=$(hl create --help 2>&1 || echo "hl create help failed")
  else
    HL_HELP="hl not installed — run: npm install -g @crouton-kit/humanloop"
    HL_CREATE_HELP=""
  fi

  CONTEXT=$(cat <<EOF
## hl --help
${HL_HELP}

## hl create --help
${HL_CREATE_HELP}

## tmux status
${TMUX_STATUS}
EOF
)
else
  HELP_OUTPUT=$(termrender -h 2>&1 || echo "termrender not installed — run: pip install termrender")

  CONTEXT=$(cat <<EOF
## termrender CLI help
${HELP_OUTPUT}

## tmux status
${TMUX_STATUS}
EOF
)
fi

jq -n --arg ctx "$CONTEXT" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: $ctx
  }
}'
