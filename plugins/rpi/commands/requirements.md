---
description: Gather requirements for a feature
argument-hint: <topic or description>
---
# Gather Requirements

**Input:** $ARGUMENTS

Parse the input. It may be:
- A single topic word (e.g., "auth")
- A longer description of what the user wants
- Context about priorities or constraints

Extract the core feature topic and any relevant context.

## Objective

Define non-technical requirements using EARS (Easy Approach to Requirements Syntax). Requirements describe *what* the system should do, not *how* it should do it.

## Inputs

Check if a problem document exists at `.claude/specs/{topic}/problem.md`. If it does, read it—it provides context about the problem being solved, goals, and user experience expectations. If not, work directly from the user's input.

## Process

### 1. Investigate Context

Briefly explore the codebase to understand:
- Relevant existing behavior
- Constraints that affect requirements
- User-facing patterns and conventions

### 2. Draft Requirements

Generate a requirements document as a starting point. Do NOT ask clarifying questions first—produce a draft, then iterate.

**Requirements format:**

```
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
- Non-technical—describe observable behavior, not implementation
- Use glossary terms consistently
- Cover error states and edge cases where they matter
- Every acceptance criterion must use an EARS pattern

### 3. Present and Iterate

Save draft to `{cwd}/.claude/specs/{topic}/requirements.md` and present to user.

Ask: "Do the requirements look good? If so, we can move on to design."

If feedback: revise, save, and ask again. Keep iterating until approved.

### 4. After Approval

Run `/rpi:review-requirements {requirements-path}` to validate.

If validation fails, address issues and re-validate.

### 5. Save Pipeline State

Save investigation byproducts to `.claude/pipeline/{topic}.state.md`:

```markdown
# Pipeline State: {topic}

## Requirements Phase

### Key Discoveries
- [Existing behavior, constraints, or patterns found during investigation]

### Handoff Notes
- [What the design phase needs to know]
```

Keep terse—10-15 bullet points total.

State after validation passes: "Requirements validated. Clear chat and run `/rpi:design {topic}` to create the technical design."
