---
description: Hand off a task to sisyphus multi-agent orchestration
---

!`sisyphus start -h`

Craft a `sisyphus start` invocation from the user's request.

```bash
sisyphus start "<task>" [-c "<context>"] [-n <name>]
```

**Task** — the persistent goal the orchestrator sees every cycle. State what done looks like, not how to get there. Keep it focused.

**Context (`-c`)** — background that informs the work but isn't the goal: relevant paths, constraints, specs, prior findings. Factual, not diagnostic — don't speculate on root causes or solutions, which can bias the orchestrator.

**Name (`-n`)** — short human-readable label for the session (shows in `sisyphus list` and the dashboard). Pick something scannable.

**File references** — use `@path/to/file` in the task to point the orchestrator at specs, designs, or relevant code. It will read them on first cycle.

**Examples:**

```bash
# Bug fix — symptom + relevant area
sisyphus start "Fix blank screen on JWT token expiry — should redirect to login" \
  -c "Auth in src/auth/: interceptor.ts, token-store.ts, refresh.ts. Don't break logout." \
  -n jwt-refresh

# Feature from a spec
sisyphus start "Build the notification system per @docs/notifications-spec.md" -n notifications

# Investigation
sisyphus start "Figure out why cold-start latency spiked 3x after the Redis migration" \
  -c "Dashboards show p99 went from 200ms to 600ms starting March 15. Relevant: src/cache/, src/startup/." \
  -n cold-start-spike
```

**After starting**, useful follow-up commands:
- `sisyphus message "<msg>"` — queue a message the orchestrator sees next cycle (corrections, new context, priority changes)
- `sisyphus status` / `sisyphus dashboard` — monitor progress
- `sisyphus resume <id> "<msg>"` — restart a paused or completed session with new instructions
