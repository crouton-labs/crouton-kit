# Task Breakdown Patterns

Patterns for how the orchestrator should structure tasks for common workflow types. Each pattern shows the task list structure, agent assignments, cycle sequencing, and failure handling.

---

## Bug Fix

### When to use
Something is broken. User reports a bug, test is failing, behavior is wrong.

### Task structure
```
t1: Diagnose root cause of [bug description]
t2: Implement fix for [root cause]
t3: Validate fix — regression tests pass, bug is resolved
t4: Review fix for unintended side effects
```

### Cycle plan
- **Cycle 1**: Spawn `sisyphus:debug` for t1. Yield.
- **Cycle 2**: Read diagnosis report. If confident root cause found, spawn `sisyphus:implement` for t2 with the diagnosis as context. Yield.
- **Cycle 3**: Spawn `sisyphus:validate` for t3. Yield.
- **Cycle 4**: If validation passes, spawn `sisyphus:review` for t4. If fails, update t2 with failure context and respawn implement. Yield.
- **Cycle 5**: Review results. Complete or address review findings.

### Failure modes
- **Debug inconclusive**: Add more context to t1, respawn debug with narrower scope or different focus areas.
- **Fix breaks other things**: t3 catches this. Feed validation failures back into a new implement cycle.
- **Root cause was wrong**: Create new t1 variant with what was learned, respawn debug.

### Parallelization
Usually serial — diagnosis must complete before fix, fix before validation. Exception: if the bug affects multiple independent areas, spawn multiple debug agents in parallel.

---

## Feature Build (Small — 1-3 files)

### When to use
Clear requirements, small scope, no spec needed.

### Task structure
```
t1: Plan implementation for [feature]
t2: Implement [feature]
t3: Validate implementation
```

### Cycle plan
- **Cycle 1**: Spawn `sisyphus:plan` for t1. Yield.
- **Cycle 2**: Spawn `sisyphus:implement` for t2 with plan path. Yield.
- **Cycle 3**: Spawn `sisyphus:validate` for t3. Yield.
- **Cycle 4**: Complete or fix issues.

### Parallelization
Serial. Too small to benefit from parallel agents.

---

## Feature Build (Medium — 4-10 files)

### When to use
Feature with moderate complexity. Requirements may need clarification. Multiple files across a few modules.

### Task structure
```
t1: Draft spec for [feature] — investigate codebase, propose approach
t2: Create implementation plan from spec
t3: Review plan against spec
t4: Phase 1 — [foundation/types/interfaces]
t5: Phase 2 — [core logic]
t6: Phase 3 — [integration/wiring]
t7: Validate full implementation
t8: Review implementation
```

### Cycle plan
- **Cycle 1**: Spawn `sisyphus:spec-draft` for t1. Yield. (Human iterates on spec between cycles.)
- **Cycle 2**: Spawn `sisyphus:plan` for t2. Yield.
- **Cycle 3**: Spawn `sisyphus:review-plan` for t3. If fail, respawn plan with issues. Yield.
- **Cycle 4**: Spawn `sisyphus:implement` for t4. Yield.
- **Cycle 5**: Spawn `sisyphus:implement` for t5 + `sisyphus:validate` for t4 (parallel if t5 doesn't depend on t4 output). Yield.
- **Cycle 6-8**: Continue phases, validate, review.

### Failure modes
- **Spec needs human input**: Mark session as needing human review. Orchestrator notes open questions.
- **Plan fails review**: Feed review issues back, respawn planner.
- **Phase fails validation**: Feed specifics back to implement agent for that phase only.

### Parallelization
Phases without dependencies can run in parallel. Types/interfaces (t4) must complete before implementation phases that consume them.

---

## Feature Build (Large — 10+ files)

### When to use
Cross-cutting feature, multiple domains, needs team coordination.

### Task structure
```
t1: Draft spec for [feature]
t2: Create master implementation plan
t3: Review plan against spec
t4: Define behavioral test properties
t5: Phase 1 — [domain A foundation]
t6: Phase 2 — [domain B foundation]
t7: Phase 3 — [domain A implementation]
t8: Phase 4 — [domain B implementation]
t9: Phase 5 — [integration layer]
t10: Validate full implementation
t11: Review implementation
t12: Adversarial validation against test spec
```

### Cycle plan
- **Cycle 1**: Spawn `sisyphus:spec-draft` for t1. Yield.
- **Cycle 2**: Spawn `sisyphus:plan` for t2 + `sisyphus:test-spec` for t4 (parallel). Yield.
- **Cycle 3**: Spawn `sisyphus:review-plan` for t3. Yield.
- **Cycle 4**: Spawn `sisyphus:implement` for t5 + t6 (parallel — independent domains). Yield.
- **Cycle 5**: Validate t5 + t6, then spawn t7 + t8 (parallel). Yield.
- **Cycle 6+**: Integration, validation, review.

### Failure modes
- **Integration failures**: Often means contracts between domains don't match. Spawn debug agent targeting the integration seam.
- **Test spec violations**: Feed specific property failures back to implement.

### Parallelization
Maximize. Independent domains run in parallel. Foundation phases complete before implementation phases in the same domain. Integration waits for all domain implementations.

---

## Refactor

### When to use
Restructure code without changing behavior. Move files, rename abstractions, consolidate patterns.

### Task structure
```
t1: Analyze current structure and plan refactor
t2: Capture behavioral snapshot (existing tests + manual checks)
t3: Execute refactor phase 1 — [structural changes]
t4: Execute refactor phase 2 — [update consumers]
t5: Validate behavior preserved — all original tests pass
t6: Review for missed references, dead code, broken imports
```

### Cycle plan
- **Cycle 1**: Spawn `sisyphus:plan` for t1 + `sisyphus:validate` for t2 (capture baseline). Yield.
- **Cycle 2**: Spawn `sisyphus:implement` for t3. Yield.
- **Cycle 3**: Spawn `sisyphus:implement` for t4 + `sisyphus:validate` for t3 (parallel). Yield.
- **Cycle 4**: Spawn `sisyphus:validate` for t5. Yield.
- **Cycle 5**: Spawn `sisyphus:review` for t6. Complete.

### Key principle
**Behavior preservation is the only metric.** The refactor is correct if and only if all existing tests pass and externally observable behavior is unchanged.

### Parallelization
Limited. Refactor phases are often sequential (move before update consumers). Validation can run in parallel with the next phase if they touch different files.

---

## Code Review

### When to use
PR review, pre-merge check, or periodic quality audit.

### Task structure
```
t1: Review [scope] for issues
t2: (conditional) Fix critical/high issues found
t3: (conditional) Re-review fixes
```

### Cycle plan
- **Cycle 1**: Spawn `sisyphus:review` for t1. Yield.
- **Cycle 2**: If critical/high issues, spawn `sisyphus:implement` for t2. If clean, complete.
- **Cycle 3**: Spawn `sisyphus:review` for t3 (targeted at fixes only). Complete.

### Parallelization
Review itself parallelizes internally (subagents per concern). Fix cycle is usually serial.

---

## Investigation / Spike

### When to use
Need to understand something before committing to an approach. Prototype, explore, or answer a technical question.

### Task structure
```
t1: Investigate [question/area]
t2: Summarize findings and recommendation
```

### Cycle plan
- **Cycle 1**: Spawn `sisyphus:debug` (for code investigation) or `sisyphus:general` (for broader research) for t1. Yield.
- **Cycle 2**: Spawn `sisyphus:general` for t2 to synthesize. Complete.

### Parallelization
If investigating multiple independent areas, spawn parallel agents each exploring a different angle.

---

## Tactician-Driven Implementation

### When to use
The plan exists and you want automated cycle-by-cycle execution without manual orchestrator decisions. The tactician reads the plan, dispatches one task at a time, and tracks progress.

### Task structure
```
t1: Execute implementation plan at [path] using tactician loop
```

### Cycle plan
This is a single-task pattern. The orchestrator spawns the tactician once:
- **Cycle 1**: Spawn `sisyphus:tactician` with plan path. The tactician internally dispatches implement/validate agents via submit tool actions. The orchestrator's role is minimal — just monitor the tactician's completion report.

### When NOT to use
- When you need human checkpoints between phases
- When phases have external dependencies (waiting on API access, design review, etc.)
- When the task requires creative decisions the tactician shouldn't make alone
