---
description: Hand off a task to sisyphus multi-agent orchestration
---

!`sisyphus -h`

Run `sisyphus start` with a concise task/goal and optional background context:

```bash
sisyphus start "your task description" -c "background context"
```

**Task description** — the goal. Keep it focused: what needs to be built or fixed and what done looks like. This is the persistent objective the orchestrator sees every cycle.

**Context (`-c`)** — background info that informs the work but isn't the goal itself: relevant file paths, constraints, specs, adjacent concerns, prior findings. Rendered separately so the orchestrator can reference it without confusing it with the task.

**Context should be factual, not diagnostic.** Point to relevant files, areas of the codebase, and constraints — don't speculate on root causes or solutions, which can bias the orchestrator down the wrong path.

**Example:**
```bash
sisyphus start "Fix the JWT refresh bug — app shows blank screen on token expiry instead of redirecting to login" -c "Auth system lives in src/auth/. Key files: interceptor.ts (HTTP interceptor), token-store.ts (token persistence), refresh.ts (refresh flow). Tests in src/auth/__tests__/. Don't break the logout flow."
```
