#!/usr/bin/env bash
#
# UserPromptSubmit hook: when user invokes /devcore:debug, write the
# session viz file. Preserves existing pane ID if file already exists.
#

set -euo pipefail

input=$(cat)

prompt=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("prompt",""))' 2>/dev/null || true)
session_id=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("session_id",""))' 2>/dev/null || true)

[[ -z "$session_id" ]] && exit 0

if printf '%s' "$prompt" | grep -qE '(^|[[:space:]])/devcore:debug([[:space:]]|$)'; then
    vizfile="/tmp/render-viz-${session_id}"
    pane_line=""
    if [[ -f "$vizfile" ]]; then
        pane_line=$(grep '^pane=' "$vizfile" 2>/dev/null || true)
    fi
    echo "builtin=debug" > "$vizfile"
    [[ -n "$pane_line" ]] && echo "$pane_line" >> "$vizfile"
fi

exit 0
