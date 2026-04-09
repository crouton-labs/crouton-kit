#!/usr/bin/env bash
#
# UserPromptSubmit hook: if the user invoked /rpi:plan or /rpi:arch, drop a
# marker file. The corresponding Stop hook picks it up and fires render-viz.
#

set -euo pipefail

# Read hook JSON input
input=$(cat)

# Extract prompt and session_id via python (jq not always available)
prompt=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("prompt",""))' 2>/dev/null || true)
session_id=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("session_id",""))' 2>/dev/null || true)

if [[ -z "$session_id" ]]; then
    exit 0
fi

marker="/tmp/render-viz-rpi-${session_id}"

if printf '%s' "$prompt" | grep -qE '(^|[[:space:]])/rpi:plan([[:space:]]|$)'; then
    echo -n "plan" > "$marker"
elif printf '%s' "$prompt" | grep -qE '(^|[[:space:]])/rpi:arch([[:space:]]|$)'; then
    echo -n "arch" > "$marker"
fi

exit 0
