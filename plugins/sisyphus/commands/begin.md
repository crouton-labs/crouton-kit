---
description: Quick reference for using sisyphus multi-agent orchestration
---

# Sisyphus Quick Reference

Sisyphus is a tmux-based daemon that orchestrates multi-agent Claude Code workflows. A background daemon manages sessions where an orchestrator breaks work into subtasks, spawns agents in tmux panes, and coordinates their lifecycle through cycles.

## Start the daemon

```bash
sisyphus start "your task description"
```

This creates a session and spawns an orchestrator Claude in a tmux pane. The orchestrator plans work, spawns agents, then yields. Agents work in parallel and submit reports. The orchestrator respawns each cycle to review progress.

## How it works

1. **You** run `sisyphus start` with a complete, detailed task
2. **Orchestrator** decomposes it into subtasks, spawns agents in parallel, yields
3. **Agents** work in parallel tmux panes, submit reports when done
4. **Daemon** detects completion, respawns orchestrator with updated state
5. **Orchestrator** reviews reports, spawns more agents or calls complete

Orchestrator pane is yellow. Agent panes cycle through blue, green, magenta, cyan, red, white.

## Task description philosophy

**Be bold and thorough.** Give sisyphus complete, meaty descriptions. Don't hold back out of concern that it's "too much" — detailed tasks produce better orchestration. The orchestrator figures out how to break it down; your job is to describe what done looks like.

**No pre-planning needed.** You don't need to spec or plan before handing off to sisyphus. Skip the `/rpi:arch` → `/rpi:plan` ceremony unless you want to. Sisyphus spawns agents that can investigate, draft specs, write plans, implement, and review — all within a single session.

**Good task descriptions include:**
- What needs to be built or fixed (with context on why)
- Where relevant code lives if you know it
- What a successful outcome looks like
- Any constraints or preferences (tech choices, style, tests)
- Adjacent concerns to be aware of (don't break X, keep Y working)

**Example — too sparse:**
```
sisyphus start "fix the auth bug"
```

**Example — good:**
```
sisyphus start "Fix the JWT refresh bug in src/auth/. When a token expires mid-session, the app shows a blank screen instead of redirecting to login. Root cause is probably in the token interceptor (src/auth/interceptor.ts) — it catches 401s but doesn't clear state before redirect. Fix the bug, add a test that simulates token expiry during an active session, and make sure the logout flow also clears tokens correctly."
```

## Key commands

| Command | Purpose |
|---------|---------|
| `sisyphus start "task"` | Create a session and launch the orchestrator |
| `sisyphus status` | Check current session state |
| `sisyphus list` | List all sessions |
| `sisyphus resume <id>` | Resume a paused session |
| `sisyphus tasks list` | View tracked tasks |
| `sisyphus spawn --instruction "..."` | Spawn an agent (orchestrator only) |
| `sisyphus yield` | Hand control back to daemon (orchestrator only) |
| `sisyphus submit --report "..."` | Report results (agent only) |
| `sisyphus complete --report "..."` | Mark session done (orchestrator only) |
