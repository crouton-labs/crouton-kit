# Workflow Examples

End-to-end examples showing how the orchestrator structures cycles for real scenarios.

---

## Example 1: Fix a Race Condition in WebSocket Reconnection

**Starting task**: "WebSocket connections sometimes drop messages during reconnection"

### Cycle 1 — Diagnosis
```
Tasks added:
  t1: Diagnose message loss during WebSocket reconnection
  t2: Fix root cause
  t3: Validate fix under concurrent load
  t4: Review fix

Agents spawned:
  debug agent → t1: "Diagnose why WebSocket messages are lost during reconnection.
    Focus on src/ws/client.ts and src/ws/reconnect.ts.
    Check for race conditions between disconnect handler and message queue.
    Look at git blame for recent changes to reconnection logic."
```

### Cycle 2 — Read diagnosis, plan fix
```
Agent report: "Root cause: reconnect() clears the message queue before the new socket
  is ready. Messages sent between disconnect and reconnect are dropped.
  Line 47 of src/ws/reconnect.ts — queue.clear() is called in onDisconnect
  but should be deferred until onReconnect confirms the new socket is live.
  Confidence: High."

Tasks updated:
  t1: complete

Agents spawned:
  implement agent → t2: "Fix race condition in src/ws/reconnect.ts.
    Root cause: queue.clear() at line 47 runs on disconnect, dropping pending messages.
    Fix: defer queue drain until reconnect confirms new socket. Buffer messages during
    reconnection window. See existing buffer pattern in src/ws/buffer.ts."
```

### Cycle 3 — Validate
```
Agent report: "Fixed. Moved queue.clear() to onReconnect callback after socket.readyState
  confirms OPEN. Added message buffer during reconnection window. 2 files changed."

Tasks updated:
  t2: complete

Agents spawned:
  validate agent → t3: "Verify WebSocket reconnection fix. Run existing tests in
    src/__tests__/ws/. Manually verify: disconnect simulation should not lose queued
    messages. Check that buffer drains correctly on reconnect."
```

### Cycle 4 — Review and complete
```
Validation: PASS. Existing tests pass, reconnection preserves messages.

Tasks updated:
  t3: complete

Agents spawned:
  review agent → t4: "Review changes in src/ws/reconnect.ts and src/ws/buffer.ts.
    Focus on: thread safety of the new buffer, memory leak potential if reconnect
    never succeeds, edge case of rapid disconnect/reconnect cycles."
```

### Cycle 5 — Complete
```
Review: Clean. One medium finding — buffer should have a max size to prevent
  memory issues if reconnect fails indefinitely. Not blocking.

Tasks updated:
  t4: complete

Action: complete — "Fixed WebSocket message loss during reconnection. Messages now
  buffered during reconnection window and drained on successful reconnect."
```

---

## Example 2: Add API Rate Limiting

**Starting task**: "Add rate limiting to the REST API — per-user, configurable limits"

### Cycle 1 — Spec
```
Tasks added:
  t1: Draft spec for API rate limiting
  t2: Plan implementation
  t3: Review plan
  t4: Implement rate limiting middleware
  t5: Implement rate limit configuration
  t6: Implement rate limit headers and error responses
  t7: Validate implementation
  t8: Review implementation

Agents spawned:
  spec-draft agent → t1: "Investigate codebase and draft spec for per-user API rate
    limiting. Check existing middleware patterns in src/api/middleware/.
    Questions to resolve: storage backend (Redis vs in-memory), limit granularity
    (per-endpoint vs global), response format for rate-limited requests."
```

### Cycle 2 — Plan (after human reviews spec)
```
Agent report: "Spec saved to context/spec-rate-limiting.md.
  Approach: Redis-backed sliding window. Per-user with endpoint-specific overrides.
  Standard 429 response with Retry-After header. Config via environment variables.
  Open questions resolved with user: Redis is already in stack, use it."

Tasks updated:
  t1: complete

Agents spawned:
  plan agent → t2: "Create implementation plan from spec at context/spec-rate-limiting.md"
  test-spec agent → (new task): "Define behavioral properties for rate limiting from spec"
```

### Cycle 3 — Review plan
```
Both agents complete. Plan at context/plan-rate-limiting.md.
Plan has 3 phases: middleware (t4), config (t5), response format (t6).

Agents spawned:
  review-plan agent → t3: "Validate plan at context/plan-rate-limiting.md
    against spec at context/spec-rate-limiting.md"
```

### Cycle 4 — Implement (phases 1+2 parallel)
```
Plan review: PASS.

Tasks updated:
  t3: complete

Agents spawned:
  implement agent → t4: "Implement Phase 1 from context/plan-rate-limiting.md —
    rate limiting middleware in src/api/middleware/rate-limit.ts"
  implement agent → t5: "Implement Phase 2 from context/plan-rate-limiting.md —
    rate limit configuration in src/config/rate-limits.ts"
```

### Cycle 5-7 — Continue phases, validate, review, complete

---

## Example 3: Refactor Authentication Module

**Starting task**: "Refactor auth — extract token logic from route handlers into dedicated service"

### Cycle 1 — Plan + baseline
```
Tasks added:
  t1: Plan auth refactor — extract token service
  t2: Capture behavioral baseline (run all auth tests)
  t3: Create TokenService class with extracted logic
  t4: Update route handlers to use TokenService
  t5: Update tests to use new service interface
  t6: Validate all auth tests still pass
  t7: Review for dead code and missed references

Agents spawned (parallel):
  plan agent → t1: "Plan refactor: extract token creation, validation, and refresh
    logic from src/api/routes/auth.ts into a new src/services/token-service.ts.
    Map all token-related functions, their callers, and the extraction plan."
  validate agent → t2: "Run all tests in src/__tests__/auth/ and record results.
    This is the behavioral baseline — these must all pass after refactor."
```

### Cycle 2 — Extract (serial — must happen before consumer updates)
```
Plan complete, baseline captured (47 tests passing).

Agents spawned:
  implement agent → t3: "Execute Phase 1 of refactor plan: create TokenService class
    at src/services/token-service.ts. Extract validateToken, createToken, refreshToken
    from src/api/routes/auth.ts. Export the class. Do NOT modify route handlers yet."
```

### Cycle 3 — Update consumers (parallel where possible)
```
TokenService created.

Agents spawned:
  implement agent → t4: "Update route handlers in src/api/routes/auth.ts to import
    and use TokenService instead of inline token logic. Remove extracted functions."
  implement agent → t5: "Update tests in src/__tests__/auth/ to use TokenService
    where they directly tested extracted functions."
```

### Cycle 4 — Validate + review
```
Agents spawned (parallel):
  validate agent → t6: "Run all auth tests. Compare against baseline of 47 passing.
    Every test must still pass."
  review agent → t7: "Review src/api/routes/auth.ts and src/services/token-service.ts.
    Check for: dead code left behind, missed references to old functions, broken imports."
```

### Cycle 5 — Complete
```
All 47 tests passing. Review clean.
Complete — "Extracted token logic into TokenService. All existing tests pass."
```
