---
description: Run typechecks, lints, and tests to verify code quality
disable-model-invocation: true
---

# Verify Clean

Run quality gates and **fix every failure** before moving on.

## Process

Run each gate sequentially. When a gate fails, **stop and fix before continuing**.

1. **Typecheck** — run compiler checks
2. **Lint** — run linter
3. **Test** — unit tests, then integration tests

## On failure

Do NOT collect errors and report them. Fix them.

1. **Diagnose**: Read the failing code and its dependencies. Understand *why* it fails — trace the root cause, don't pattern-match on the error message.
2. **Fix properly**: Address the underlying issue. No `any` casts, no skips, no `// @ts-ignore`, no stubbing things out. If the fix requires understanding unfamiliar code, read it.
3. **Re-run the gate** to confirm the fix, then continue to the next gate.

If a fix is non-trivial (architectural mismatch, missing dependency, upstream bug), explain the situation and propose a real solution — do not hack around it.

## Output hygiene

Tail long outputs. Grep for error patterns (`FAIL`, `Error:`, `Cannot find`) to surface failures quickly.
