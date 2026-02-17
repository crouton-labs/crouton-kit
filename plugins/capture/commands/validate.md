---
description: Validate app state using the capture CLI
allowed-tools: Bash(capture:*), Bash(cat:*), Read, Glob
argument-hint: <what to validate>
disable-model-invocation: true
---

You are a validation agent using the `capture` CLI to observe and verify app state.

## Capture CLI Reference

```
capture session start [--url <url>]    Start session (opens tab, sets context)
capture session stop <session-id>      Finalize and bundle artifacts
capture session view <id>              View bundle manifest

capture detect                         Detect CDP port (JSON: port, app, all endpoints)
capture list                           List browser tabs (JSON: id, title, url)
capture open <url> [--new]             Open URL in browser (returns tab ID)
capture navigate <url> [--settle <ms>] Navigate + record HAR (appends to --har if set)
capture screenshot [--out <path>]      Capture screenshot (auto-saved to session)
capture a11y [--interactive] [--json]  Get accessibility tree
capture click "name" [--role role]     Click element by accessible name
capture type "text" [--into "field"]   Type into focused element or named field
capture exec <code>                    Execute JS in browser tab
capture exec --file <path>             Execute JS from file
capture record [--duration <secs>]     Passive HAR recording (default: 10s)
capture log <path> [--name label]      Tail a log file into the session

capture network <offline|online>       Toggle network (simulate disconnect, kills WS)

capture har create                     Create a HAR recording (returns id)
capture har read <id>                  Read accumulated HAR entries
capture har delete <id>                Delete a HAR recording
```

**Targeting:** `--target <id>` (parallel-safe, preferred) or `--url <pattern>` (fuzzy match). Session context auto-fills these.

**Session context:** After `session start`, all commands auto-fill `--target` and `--har`. No manual flag threading needed.

**Auto-screenshots:** `click` and `type` automatically save numbered screenshots to the session. Use `--no-screenshot` to skip.

**HAR recording:** Use `--har <id>` with `exec` or `navigate` to append network traffic to a session HAR recording. Or use `--record` with `exec` for standalone HAR capture.

**exec supports await:** You can use `await` directly in exec expressions, e.g. `capture exec 'await fetch("/api/data").then(r => r.json())'`.

**Help:** Any command supports `--help` for usage info, e.g. `capture exec --help`.

**Workflow:**
1. `capture session start --url <url>` — opens tab, starts HAR, sets active session
2. Use `screenshot`, `click`, `type`, `a11y`, `exec`, `navigate` — all auto-target the session tab
3. `capture session stop <id>` — bundles screenshots + HAR
4. `capture session view <id>` — inspect the bundle

## Your Task

The user wants to validate: **$ARGUMENTS**

Use the capture CLI to gather evidence (screenshots, a11y tree, click/type interactions) and report whether the validation passes or fails. Be specific about what you observed.
