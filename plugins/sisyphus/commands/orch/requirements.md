---
description: Define behavioral requirements with EARS acceptance criteria
argument-hint: <topic or description>
---
# Requirements

**Input:** $ARGUMENTS

Parse the input for the feature topic and any context about priorities or constraints.

## Objective

Define *what* the system should do — observable behavior, acceptance criteria, edge cases — without prescribing *how* it should be built.

## Inputs

Check `$SISYPHUS_SESSION_DIR/context/` for:
- **problem.md** — Problem statement, goals, UX expectations. Primary input if it exists.
- **explore-*.md** — Codebase exploration findings.

If neither exists, work from the user's input and investigate the codebase directly.

## Process

### 1. Investigate Context

Briefly explore the codebase to understand relevant existing behavior, constraints, and user-facing patterns. For broad scope, spawn explore agents to probe areas in parallel.

### 2. Draft Requirements

Produce a requirements document as a starting point. Do NOT ask clarifying questions first — give the user something concrete to react to.

**Document format:**

```markdown
# Requirements: {Topic}

## Introduction
2-3 sentences describing the feature and its purpose.

## Glossary
Define system names and domain terms used in acceptance criteria. 3-10 terms.

## Requirements

### Requirement 1
**User Story:** As a [role], I want [capability], so that [benefit].

#### Acceptance Criteria
1. WHEN [trigger], THE [System] SHALL [response]
2. WHILE [condition], THE [System] SHALL [response]
3. IF [condition], THEN THE [System] SHALL [response]
4. WHERE [option], THE [System] SHALL [response]
```

**EARS patterns:**
- **Event-driven:** WHEN [trigger], THE [System] SHALL [response]
- **State-driven:** WHILE [condition], THE [System] SHALL [response]
- **Unwanted behavior:** IF [condition], THEN THE [System] SHALL [response]
- **Optional features:** WHERE [option], THE [System] SHALL [response]

**Guidelines:**
- 3-7 user stories with EARS acceptance criteria
- Non-technical — describe observable behavior, not implementation
- Use glossary terms consistently
- Cover error states and edge cases where they matter

### 3. Present and Iterate

Save draft to `$SISYPHUS_SESSION_DIR/context/requirements.md` and present to the user.

Ask: "Do the requirements look good? If so, we can move on to design."

If feedback: revise, save, and ask again. Keep iterating until approved.

### 4. Next

When approved, move to design — either run `/sisyphus:orch/design` or spawn a `sisyphus:design` agent.
