# CLI Reference

Full command reference for the capture CLI. For validation methodology, see [SKILL.md](SKILL.md).

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

### HAR flags (`har read`)

- `--filter-url <pattern>` — substring or regex match against request URL
- `--filter-status <s>` — exact code (`404`), prefix (`4` → 4xx), or range (`400-499`)
- `--filter-method <m>` — HTTP method (GET, POST, ...)
- `--limit <N>` — return only the first N matching entries
- ID is optional inside an active session — `capture har read` reads the session HAR.

## Session Workflow

1. `capture session start --url <url>` — opens tab, starts HAR, sets active session
2. Interact: `screenshot`, `click`, `type`, `a11y`, `exec`, `navigate`
3. `capture session stop <id>` — bundles screenshots + HAR + a11y snapshots
4. `capture session view <id>` — inspect the bundle

**Session context auto-fills `--target` and `--har`** after `session start`. No manual flag threading.

## Key Behaviors

- **Targeting**: `--target <id>` (preferred, parallel-safe) or `--url <pattern>` (fuzzy match). Target IDs support **prefix matching** — use the first 8 characters instead of the full ID (e.g. `--target 6d82f8c1`).
- **Auto-screenshots**: `click` and `type` save numbered screenshots to the session automatically. Use `--no-screenshot` to skip.
- **HAR recording**: Each session has its own HAR id; `navigate`/`exec`/`click`/`type` append traffic they observe during their settle window to the session HAR. `navigate` is the most reliable — it brackets the full page load. `click`/`type` capture traffic within their settle (~2.5s for click with HAR active); cross-page-navigation traffic after the listeners disconnect is lossy. For continuous click-around capture, run `capture record --duration N` in parallel. Override per-command with `--settle <ms>`.
- **exec supports await**: `capture exec 'await fetch("/api/data").then(r => r.json())'`
- **Any command supports `--help`**
