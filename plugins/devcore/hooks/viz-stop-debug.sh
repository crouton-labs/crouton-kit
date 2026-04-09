#!/usr/bin/env bash
#
# Stop hook: fires render-viz when the last assistant message is substantive.
#
# Two modes:
#   1. Active session (/tmp/render-viz-{session_id} exists): uses the
#      builtin from the session file, fires at >= 500 words.
#   2. No session: auto-triggers with "summary" builtin at >= 1000 words,
#      creating the session file so subsequent turns reuse the same pane.
#

set -euo pipefail

command -v render-viz &>/dev/null || exit 0

input=$(cat)

session_id=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("session_id",""))' 2>/dev/null || true)
transcript_path=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("transcript_path",""))' 2>/dev/null || true)
stop_hook_active=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("stop_hook_active",False))' 2>/dev/null || true)

[[ "$stop_hook_active" == "True" ]] && exit 0
[[ -z "$session_id" || -z "$transcript_path" ]] && exit 0

# Count words in last assistant message
word_count=$(python3 -c "
import json
lines = open('$transcript_path').read().strip().split('\n')
for line in reversed(lines):
    entry = json.loads(line)
    if entry.get('type') != 'assistant': continue
    content = entry.get('message', {}).get('content', '')
    if isinstance(content, list):
        text = ' '.join(b.get('text','') for b in content if b.get('type')=='text')
    else:
        text = str(content)
    print(len(text.split()))
    break
else:
    print(0)
" 2>/dev/null || echo 0)

vizfile="/tmp/render-viz-${session_id}"

if [[ -f "$vizfile" ]]; then
    # Active session: 500-word threshold
    [[ "$word_count" -lt 500 ]] && exit 0
    builtin=$(grep '^builtin=' "$vizfile" | cut -d= -f2)
    [[ -z "$builtin" ]] && exit 0
else
    # No session: 1000-word auto-trigger with summary builtin
    [[ "$word_count" -lt 1000 ]] && exit 0
    builtin="summary"
    echo "builtin=summary" > "$vizfile"
fi

nohup render-viz --builtin "$builtin" --session "$session_id" \
    --transcript "$transcript_path" \
    >/tmp/render-viz-stop-${session_id}.log 2>&1 </dev/null &
disown

exit 0
