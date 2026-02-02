---
name: review-spec
description: Validate feature specs for relevance, edge cases, and compatibility with existing patterns. Use after creating a spec.
user-invocable: false
allowed-tools: Task
---

# Review Spec

**Input:** `$ARGUMENTS`

Spawn a Task agent to review the spec:

```
Task tool parameters:
  subagent_type: general-purpose
  model: sonnet
  description: Review spec for issues
  prompt: |
    Review the spec file at: $ARGUMENTS

    ## Process

    1. Read the spec file
    2. Read existing patterns: CLAUDE.md, .claude/rules/*.md, referenced "Related files"
    3. Validate against criteria below

    **Threshold: Only flag issues that would block implementation or cause genuine confusion.**

    ### Criteria
    - **Relevance**: Spec stays focused; only flag scope creep causing wasted work
    - **Edge Cases**: Error states, boundary conditions, failure modes covered
    - **Architecture Quality**: Only flag actual code smells, not preferences
    - **Abstraction Level**: Behavioral/contractual; only flag if implementation details constrain options
    - **Pattern Compatibility**: Doesn't contradict CLAUDE.md or .claude/rules/
    - **Context Coverage**: Only flag if spec is huge (20+ files) and splitting helps

    ## Output

    If no issues: `PASS`

    If issues exist:
    1. Scope: [what strays from the feature]
    2. Edge case: [missing error/boundary handling]
    3. Architecture: [code smell or design issue]
```

Report the agent's findings to the user.
