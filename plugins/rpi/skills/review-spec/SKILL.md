---
name: review-spec
description: Validate feature specs for relevance, edge cases, and compatibility with existing patterns. Use after creating a spec.
user-invocable: false
allowed-tools: Task
---

# Review Spec

**Input:** `$ARGUMENTS`

## Phase 1: Structural Validation

Spawn a Task agent to check spec quality:

```
Task tool parameters:
  subagent_type: general-purpose
  model: sonnet
  description: Structural spec validation
  prompt: |
    Validate the spec at: $ARGUMENTS

    ## Process

    1. Read the spec file
    2. Read existing patterns: CLAUDE.md, .claude/rules/*.md, referenced "Related files"
    3. Validate against criteria below

    **Threshold: Only flag issues that would block implementation or cause genuine confusion.**

    ### Criteria
    - **Relevance**: Spec stays focused; only flag scope creep causing wasted work
    - **Abstraction Level**: Behavioral/contractual only. Flag any internal mechanisms masquerading as requirements — step-by-step code paths, specific function threading ("ref flows through X to Y"), storage optimization decisions, or timing/lifecycle prescriptions ("generated on creation"). These should be removed from the spec entirely — the planner decides implementation.
    - **Pattern Compatibility**: Doesn't contradict CLAUDE.md or .claude/rules/
    - **Completeness**: Spec sections are present and non-empty. Related files listed.

    ## Output

    If no issues: `PASS`

    If issues exist, list each with category and explanation. Keep it terse.
```

If structural validation fails, report issues and stop. The spec needs to be well-formed before domain review adds value.

## Phase 2: Assess Complexity

Read the spec yourself. Determine the number of domain reviewers to spawn based on spec complexity:

| Complexity | Signals | Reviewers |
|---|---|---|
| Simple | Single behavior, few edge cases, <5 related files | 1 |
| Moderate | Multiple behaviors or integration points, 5-15 related files | 2 |
| Complex | Cross-cutting concerns, multiple domains, 15+ related files, architectural decisions | 3-4 |

Identify **concern areas** derived from the spec's actual content — not from a fixed list. Concern areas are the distinct domains, behaviors, or risk surfaces in the spec. Examples of what concern areas might look like (these are illustrative, not prescribed):

- "Authentication flow edge cases"
- "Multi-tenant data isolation"
- "API contract completeness"
- "Failure and recovery modes"
- "Concurrency and ordering guarantees"

Each reviewer gets exactly one concern area. Concern areas should not overlap.

## Phase 3: Domain Review

Spawn reviewer agents in parallel — one per concern area:

```
Task tool parameters:
  subagent_type: general-purpose
  model: sonnet
  description: "Review spec: {concern area name}"
  prompt: |
    You are reviewing a feature spec for gaps in one specific area.

    Spec path: $ARGUMENTS
    Your concern area: {concern area}

    ## Process

    1. Read the spec file
    2. Read related files listed in the spec that are relevant to your concern area
    3. Investigate your concern area thoroughly — look for:
       - Unstated assumptions that an implementer would have to guess about
       - Edge cases or error states not addressed
       - Boundary conditions left ambiguous
       - Interactions with existing code that the spec doesn't account for

    ## Critical Rules

    - **If the spec adequately covers your area, report PASS.** Finding nothing is a valid and good outcome.
    - **Do NOT fabricate concerns.** Only flag issues where you can point to a specific gap and explain what would go wrong during implementation.
    - **Do NOT flag**: subjective preferences, alternative approaches that aren't better, speculative future problems, things the planner will naturally resolve.
    - **Threshold**: Would an implementer get stuck, make a wrong assumption, or build the wrong thing because of this gap?

    ## Output

    If no issues: `PASS — {concern area} is well-specified.`

    If issues exist:
    - **{issue}** — {what's missing or ambiguous} → {what could go wrong during implementation}
```

## Phase 4: Aggregate

Collect results from all reviewers. Drop any PASS results — they need no action.

If all reviewers pass: report `PASS` to the user.

If issues were found:
- Group by severity: issues flagged by multiple reviewers from different angles are highest signal
- Present each issue with its concern area, the gap, and the implementation risk
- Keep the report concise — findings only, no preamble
