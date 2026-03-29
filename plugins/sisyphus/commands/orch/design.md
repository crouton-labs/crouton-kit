---
description: Create technical design from requirements through investigation and user iteration
argument-hint: <topic or description>
---
# Technical Design

**Input:** $ARGUMENTS

Parse the input for the topic and any additional constraints or guidance.

## Objective

Define *how* the system will be built — architecture, component boundaries, data models, contracts — without writing code. All trade-offs resolved before saving.

## Inputs

Check `$SISYPHUS_SESSION_DIR/context/` for:
- **requirements.md** — Required. Defines what to build.
- **problem.md** — Goals and UX context.
- **explore-*.md** — Codebase exploration findings.

## Process

### 1. Investigate Codebase

Assess scope and delegate when appropriate:
- **Small** (single domain, 1-5 files) — investigate yourself.
- **Medium+** (multiple domains, 6+ files) — spawn explore agents to probe different areas in parallel. Synthesize findings before proposing.

Explore:
- Existing architectural patterns and conventions
- Data models and schemas involved
- Services and APIs that will be extended or created
- Frontend components and styling (if applicable)

### 2. Present Design Proposal

Share findings and propose a design:
- Solution approach and key technical decisions
- Trade-offs you see and your reasoning
- Where you're confident vs. uncertain

Iterate through conversation to resolve ambiguity. **Wait for user input before proceeding.**

### 3. Frontend/Visual Components

If the feature has a frontend or visual component:
- Discuss the visual design and interaction patterns
- Create HTML mockups using the application's real styling (actual CSS classes, design tokens, component library)
- Reference existing UI patterns in the codebase

### 4. Flow Trace

Before saving, simulate the design end-to-end:

1. Walk through the user/system journey step by step — from trigger to final state
2. At each step, verify:
   - **Preconditions**: What must be true? Is it guaranteed by the design?
   - **State consistency**: Does the system interpret state correctly at each point?
   - **Failure**: What happens if this step fails? Is recovery defined?
   - **Handoff**: Does this step's output match the next step's expected input?
3. If gaps found, discuss with user before saving

### 5. Save Design Document

Save to `$SISYPHUS_SESSION_DIR/context/design.md`:

- **Overview** — Solution approach, key technical decisions (3-5 sentences)
- **Architecture** — Component boundaries, data flow, service interactions. Include an ASCII diagram. Add a state machine diagram when stateful transitions are involved.
- **Components** — Key modules/classes with responsibilities and interfaces
- **Data Models** — Schema definitions, type interfaces, validation rules
- **Error Handling** — Error types, conditions, recovery strategies
- **Related Files** — Paths to relevant existing code. Do NOT annotate with implementation instructions.

**The line**: If it narrows the solution space to one reasonable approach, it belongs. If it prescribes exact code paths, it doesn't.

### 6. Research for Large Features

**Small features** (touches ~10 or fewer files):
- The design's "Related files" section is sufficient context for planning.

**Large features** (touches 10+ files across multiple domains):
- Offer to create dedicated context documents for planning.
- If yes, spawn explore agents per domain, save to `$SISYPHUS_SESSION_DIR/context/explore-{domain}.md`.

### 7. Next

When the design is solid, move to planning — yield to planning mode or spawn a `sisyphus:plan` agent with the requirements and design as inputs.
