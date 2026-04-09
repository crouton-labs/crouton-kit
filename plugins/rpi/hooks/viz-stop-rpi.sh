#!/usr/bin/env bash
#
# Stop hook: if the /rpi:plan or /rpi:arch marker is present, fire render-viz
# in the background to visualize the output, then clear the marker.
#
# Gracefully no-ops if render-viz is not installed.
#

set -euo pipefail

if ! command -v render-viz &>/dev/null; then
    exit 0
fi

input=$(cat)
session_id=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("session_id",""))' 2>/dev/null || true)
transcript_path=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("transcript_path",""))' 2>/dev/null || true)
stop_hook_active=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("stop_hook_active",False))' 2>/dev/null || true)

# Don't fire on recursive stops (Claude continuing after a blocking hook).
if [[ "$stop_hook_active" == "True" ]]; then
    exit 0
fi

if [[ -z "$session_id" || -z "$transcript_path" ]]; then
    exit 0
fi

marker="/tmp/render-viz-rpi-${session_id}"
if [[ ! -f "$marker" ]]; then
    exit 0
fi

builtin=$(cat "$marker")
rm -f "$marker" 2>/dev/null || true

# Fire and forget. Fully detach so Claude's Stop isn't blocked.
nohup render-viz --builtin "$builtin" --session "$session_id" \
    --transcript "$transcript_path" \
    >/tmp/render-viz-rpi-${session_id}.log 2>&1 </dev/null &
disown

exit 0
