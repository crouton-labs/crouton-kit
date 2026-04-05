#!/usr/bin/env bash
#
# PostToolUse hook for Skill tool — injects termrender CLI help
# and tmux status when the termrender skill is invoked.
#

set -euo pipefail

INPUT=$(cat)

# Only fire for termrender skill invocations
SKILL_NAME=$(echo "$INPUT" | jq -r '.tool_input.skill // empty' 2>/dev/null)
case "$SKILL_NAME" in
  termrender|termrender:termrender) ;;
  *) exit 0 ;;
esac

HELP_OUTPUT=$(termrender -h 2>&1 || echo "termrender not installed")

if [ -n "${TMUX:-}" ]; then
  TMUX_STATUS="Inside tmux session (TMUX=$TMUX)"
else
  TMUX_STATUS="Not inside a tmux session"
fi

CONTEXT=$(cat <<EOF
## termrender CLI help
${HELP_OUTPUT}

## tmux status
${TMUX_STATUS}
EOF
)

jq -n --arg ctx "$CONTEXT" '{
  hookSpecificOutput: {
    additionalContext: $ctx
  }
}'
