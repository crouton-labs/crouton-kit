---
name: capture
description: Browser automation and UI validation via the capture CLI. Interact with pages using accessibility-driven click, type, screenshot, a11y tree, JS exec, and HAR recording over CDP. Use when validating UI state, testing features in the browser, or manipulating a running web app.
allowed-tools: Bash(capture:*), Read, Glob, Grep
---

# Capture — Browser Automation Skill

Use the `capture` CLI to observe, interact with, and validate browser state via CDP.

## CLI Quick Reference

```
capture session start [--url <url>]    Start session (opens tab, sets context)
capture session stop <session-id>      Finalize and bundle artifacts
capture session view <id>              View bundle manifest

capture detect                         Detect CDP port
capture list                           List browser tabs
capture open <url> [--new]             Open URL in browser
capture navigate <url> [--settle <ms>] Navigate + record HAR
capture screenshot [--out <path>]      Capture screenshot
capture a11y [--interactive] [--json]  Get accessibility tree
capture click "name" [--role role]     Click element by accessible name
capture type "text" [--into "field"]   Type into focused element or named field
capture exec <code>                    Execute JS in browser tab
capture exec --file <path>             Execute JS from file
capture record [--duration <secs>]     Passive HAR recording
capture log <path> [--name label]      Tail a log file into the session
capture network <offline|online>       Toggle network (simulate disconnect)
capture har create|read|delete         Manage HAR recordings
```

## Session Workflow

1. `capture session start --url <url>` — opens tab, starts HAR, sets active session
2. Interact: `screenshot`, `click`, `type`, `a11y`, `exec`, `navigate`
3. `capture session stop <id>` — bundles screenshots + HAR + a11y snapshots
4. `capture session view <id>` — inspect the bundle

**Session context auto-fills `--target` and `--har`** after `session start`. No manual flag threading.

## Key Behaviors

- **Targeting**: `--target <id>` (preferred, parallel-safe) or `--url <pattern>` (fuzzy match). Target IDs support **prefix matching** — use the first 8 characters instead of the full ID (e.g. `--target 6d82f8c1`).
- **Auto-screenshots**: `click` and `type` save numbered screenshots to the session automatically. Use `--no-screenshot` to skip.
- **HAR recording**: Use `--har <id>` with `exec` or `navigate` to append network traffic. Or `--record` with `exec` for standalone HAR.
- **exec supports await**: `capture exec 'await fetch("/api/data").then(r => r.json())'`
- **Any command supports `--help`**

## Validation Pattern

When validating a UI feature:

1. Start a session targeting the page under test
2. Use `a11y --interactive` to understand what's on the page
3. Interact via `click` and `type` using accessible names (not selectors)
4. Take screenshots at key states
5. Use `exec` to check DOM or JS state when a11y isn't sufficient
6. Use `har read` to verify network requests if relevant
7. Stop the session and report pass/fail with evidence

## Interaction Tips

- Always prefer `click "Name"` over `exec` with selectors — a11y names are stable
- If `click` reports multiple matches, add `--role` to disambiguate
- Run `a11y --interactive` before interacting to see available elements
- `type --into "Field Name"` clicks the field first, then types — no separate click needed
- After interactions, screenshot to capture the resulting state
