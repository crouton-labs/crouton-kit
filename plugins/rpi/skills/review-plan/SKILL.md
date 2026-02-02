---
name: review-plan
description: Validate implementation plans against specs. Use after creating a plan to ensure full spec coverage and no ambiguities.
user-invocable: false
allowed-tools: Task
---

# Review Plan Against Spec

**Input:** `$ARGUMENTS`

Parse input to extract spec path and plan path.

Spawn a Task agent to review:

```
Task tool parameters:
  subagent_type: general-purpose
  model: sonnet
  description: Review plan against spec
  prompt: |
    Review plan against spec.

    Paths from input: $ARGUMENTS
    - Spec: `.claude/specs/*.spec.md`
    - Plan: `.claude/plans/*.plan.md`

    ## Process

    1. Read both documents (spec first, then plan)
    2. Extract every behavioral requirement from spec
    3. Map each requirement to plan coverage: covered, partial, or missing
    4. Check plan quality

    **Threshold: Only flag issues that would block implementation or cause genuine confusion.**

    ### Quality Checks
    - Ambiguous language → only if implementation would stall or go wrong
    - Deferred decisions → only if missing info needed to start work
    - Conditional branches → only if unresolved decisions (valid branching is fine)
    - Unexplored complexity → only if it hides surprising work

    ## Output

    If all covered and no issues: `PASS`

    If issues exist:
    1. Missing: [requirement from spec not in plan]
    2. Ambiguous: [unclear section that needs resolution]
```

Report the agent's findings to the user.