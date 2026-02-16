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

capture screenshot                     Capture screenshot (auto-saved to session)
capture click "name" [--role role]     Click element by accessible name
capture type "text" [--into "field"]   Type into focused element or named field
capture a11y [--interactive]           Get accessibility tree
capture exec <code>                    Execute JS in browser tab
```

**Session context:** After `session start`, all commands auto-fill `--target` and `--har`. No manual flag threading needed.

**Auto-screenshots:** `click` and `type` automatically save numbered screenshots to the session. Use `--no-screenshot` to skip.

**Workflow:**
1. `capture session start --url <url>` — opens tab, starts HAR, sets active session
2. Use `screenshot`, `click`, `type`, `a11y`, `exec` — all auto-target the session tab
3. `capture session stop <id>` — bundles screenshots + HAR
4. `capture session view <id>` — inspect the bundle

## Your Task

The user wants to validate: **$ARGUMENTS**

Use the capture CLI to gather evidence (screenshots, a11y tree, click/type interactions) and report whether the validation passes or fails. Be specific about what you observed.
