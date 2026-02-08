---
description: Full feature workflow - spec, plan, implement via agent team
argument-hint: <topic or description>
disable-model-invocation: true
---

# Feature Development Pipeline

**Input:** $ARGUMENTS

You are the team lead for a full feature development workflow: specification, planning, implementation.

## Phase 1: Specification

1. `TeamCreate` a team (e.g., `rpi-{topic}`)
2. Spawn an `rpi:spec-writer` teammate with the topic/description from the input
3. Tell the user: **"Spec-writer is ready. Switch to them (Shift+Down) to design your feature spec. They'll notify me when it's done."**
4. Wait for the spec-writer's completion message containing the spec path and scope assessment

## Phase 2: Planning

1. Send `shutdown_request` to the spec-writer — it's done
2. Spawn an `rpi:planning-lead` teammate. Provide: spec path, context doc paths (if any), scope assessment
3. The planning-lead works autonomously — creates plan, runs advisor review, validates
4. Wait for its completion message containing the plan path and implementation structure
5. Send `shutdown_request` to the planning-lead

## Phase 2.5: Validation Planning

1. Spawn an `rpi:validation-lead` teammate. Provide: spec path, plan path, context document paths
2. The validation-lead works in parallel with Phase 3 implementation
3. It inventories existing infrastructure, proposes reusable tools, writes the validation plan
4. Wait for its readiness message before running the first phase validation

## Phase 3: Implementation (repeat per phase)

Read the plan and build the team:

1. `TaskCreate` for each implementation task in the current phase
   - Set `addBlockedBy` per the plan's dependency graph
   - Each task description: specific work, context paths, file ownership, integration points
   - Constraint in every task: do not run tests or typechecks (other teammates may be mid-edit)

2. Spawn `devcore:teammate` teammates with `team_name`:
   - Use the planning-lead's recommended teammate count from their completion message
   - If no recommendation: count independent task groups — 2 for ≤4 groups, 3 for 5-8, 4 for 8+
   - Teammates delegate internally to sonnet/haiku subagents for subtasks

3. Each teammate's prompt: claim tasks from shared list via `TaskList` → `TaskUpdate` (claim) → implement → `TaskUpdate` (complete) → `TaskList` (next). Message teammates directly when finishing shared interfaces. Message lead if blocked.

4. Coordinate — respond to blockers, redirect idle teammates to unclaimed tasks, surface progress

5. When all phase tasks complete, keep implementation teammates alive — they'll receive fix instructions from reviewers

### Phase Review (after each major implementation phase)

Run review before proceeding to the next phase or to testing:

1. Spawn `rpi:reviewer` teammates — scaled to phase change size:
   - Small (<10 files): 1 reviewer covering all concern areas
   - Medium (10-25 files): 2 reviewers, split by concern area (e.g., correctness vs quality)
   - Large (>25 files): 3 reviewers, split by vertical slice or concern area
   - Provide each: file list, plan path, spec path, assigned concerns, and **names of implementation teammates**

2. Wait for review reports. Present consolidated findings to user:
   - High signal: recommend fixing before continuing
   - Medium/low: user's call

3. Tell reviewers which issues to address. Reviewers message the relevant implementation teammates directly with fix instructions.

4. Implementation teammates apply fixes. When done, `shutdown_request` to all reviewers and implementation teammates.

### Phase Validation (after review fixes, before next phase)

1. Message the validation-lead: "validate phase N"
2. The validation-lead runs proof scripts, reports pass/fail with evidence
3. If failures: share evidence with implementation teammates, they fix
4. Re-validate until all exit criteria pass
5. Only proceed to the next phase when validation passes

If multi-phase plan and more phases remain, return to Phase 3 for the next phase. For very large plans, tell user to clear chat and re-run `/rpi:rpi` instead.

## Phase 4: Testing

After all implementation phases pass review:

1. Read the test plan (`.claude/plans/{topic}.tests.plan.md`) produced by the planning-lead
2. `TaskCreate` for each test task from the test plan
3. Spawn a dedicated `devcore:teammate` for test implementation
   - Prompt: implement tests per the test plan, referencing the actual implementation (not just the plan). Tests should verify real behavior, not just exercise code paths.
   - This teammate CAN run tests — it's the only one writing code at this point
4. When tests are written, coordinate a final pass: run the full test suite, fix any failures
5. Message the validation-lead: "run full cross-phase validation" — final smoke test across all phases
6. If validation fails, fix and re-validate
7. `shutdown_request` to test teammate and validation-lead, then `TeamDelete`

State: "Feature complete. Implementation reviewed, tests passing."

## Rules

- Stay in coordination role during implementation — do not implement yourself
- Never skip a phase or proceed without the prior phase completing
- The priority is excellent code, not speed
