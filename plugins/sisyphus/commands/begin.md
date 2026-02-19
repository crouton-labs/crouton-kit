---
description: Hand off a task to sisyphus multi-agent orchestration
---

Run `sisyphus start` with a detailed task description:

```bash
sisyphus start "your task description"
```

**Write a thorough task description.** Include what needs to be built or fixed, where relevant code lives, what done looks like, constraints or preferences, and adjacent concerns (don't break X, keep Y working). More context produces better results — the orchestrator figures out how to break it down.

**Example:**
```bash
sisyphus start "Fix the JWT refresh bug in src/auth/. When a token expires mid-session, the app shows a blank screen instead of redirecting to login. Root cause is probably in the token interceptor (src/auth/interceptor.ts) — it catches 401s but doesn't clear state before redirect. Fix the bug, add a test that simulates token expiry during an active session, and make sure the logout flow also clears tokens correctly."
```
