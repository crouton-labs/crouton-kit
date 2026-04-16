---
name: capture
description: Browser automation and UI validation via the capture CLI. Interact with pages using accessibility-driven click, type, screenshot, a11y tree, JS exec, and HAR recording over CDP. Use when validating UI state, testing features in the browser, or manipulating a running web app.
allowed-tools: Bash(capture:*), Read, Glob, Grep
---

# Capture — Browser Automation Skill

Browser automation via CDP for UI validation. For the full command reference, see [cli-reference.md](cli-reference.md).

## Session Basics

1. `capture session start --url <url>` — open a tab and start recording
2. Interact: `screenshot`, `click`, `type`, `a11y`, `exec`, `navigate`
3. `capture session stop <id>` — bundle artifacts; `capture session view <id>` to inspect

Session context auto-fills `--target` and `--har` — no manual flag threading needed.

## Validation Pattern

When validating a UI feature:

1. Start a session targeting the page under test
2. Use `a11y --interactive` to understand what's on the page
3. Interact via `click` and `type` using accessible names (not selectors)
4. Take screenshots at key states
5. Use `exec` to check DOM or JS state when a11y isn't sufficient
6. Use `har read` to verify network requests if relevant (supports `--filter-url`, `--filter-status`, `--filter-method`, `--limit`; ID optional in an active session)
7. Stop the session and report pass/fail with evidence

**HAR caveat:** the session HAR is populated by the commands that run — most reliably `navigate`. `click`/`type` capture the traffic that fires inside their settle window, but cross-navigation traffic after the frame changes is lossy. For continuous "click around" capture, run `capture record --duration N` in parallel.

## Interaction Tips

- Always prefer `click "Name"` over `exec` with selectors — a11y names are stable
- If `click` reports multiple matches, add `--role` to disambiguate
- Run `a11y --interactive` before interacting to see available elements
- `type --into "Field Name"` clicks the field first, then types — no separate click needed
- After interactions, screenshot to capture the resulting state
