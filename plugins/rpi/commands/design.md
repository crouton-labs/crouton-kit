---
description: Create technical design from requirements
argument-hint: <topic or requirements-path>
---
# Technical Design

**Input:** $ARGUMENTS

Parse the input. It may be:
- A topic name (look in `.claude/specs/{topic}/requirements.md`)
- A direct path to a requirements file
- A description with additional context or constraints

Extract the reference and any guidance.

## Objective

Create a technical design that addresses all requirements. The design defines *how* the system will be built—schema, services, components, contracts, data flow.

## Inputs

1. **Read the requirements** — Required. Located at `.claude/specs/{topic}/requirements.md`
2. **Read problem document** (if any) — `.claude/specs/{topic}/problem.md` provides goals and UX context
3. **Read pipeline state** (if any) — `.claude/pipeline/{topic}.state.md` has investigation findings

## Process

### 1. Investigate Codebase

Explore areas relevant to the requirements:
- Existing architectural patterns and conventions
- Data models and schemas involved
- Services and APIs that will be extended or created
- Frontend components and styling (if applicable)

### 2. Present Design Proposal

Share findings and propose a design:
- Solution approach and key technical decisions
- Trade-offs you see and your reasoning
- Where you're confident vs. uncertain

Iterate through conversation to resolve ambiguity.

### 3. Frontend/Visual Components

If the feature has a frontend or visual component:
- Discuss the visual design and interaction patterns
- Create HTML mockups using the application's real styling (actual CSS classes, design tokens, component library)
- Mockups should be viewable in a browser to validate look-and-feel before implementation
- Reference existing UI patterns in the codebase

### 4. Flow Trace

Before saving, simulate the design end-to-end:

1. Walk through the user/system journey step by step—from trigger to final state
2. At each step, verify:
   - **Preconditions**: What must be true? Is it guaranteed by the design?
   - **State consistency**: Does the system interpret state correctly at each point?
   - **Failure**: What happens if this step fails? Is recovery defined?
   - **Handoff**: Does this step's output match the next step's expected input?
3. If gaps found, discuss with user before saving

### 5. Save Design Document

Save to `{cwd}/.claude/specs/{topic}/design.md`

**Format:**
- **Overview** — Solution approach, key technical decisions (3-5 sentences)
- **Architecture** — Component boundaries, data flow, service interactions. Include an ASCII diagram showing how components connect and data flows through the system. Add a state machine diagram when the feature involves stateful transitions.
- **Components** — Key modules/classes with their responsibilities and interfaces
- **Data Models** — Schema definitions, type interfaces, validation rules
- **Error Handling** — Error types, conditions, recovery strategies
- **Related Files** — Paths to relevant existing code. Do NOT annotate with implementation instructions.

**Design captures technical decisions.** All trade-offs resolved before saving. If it narrows the solution space to one reasonable approach, it belongs. If it prescribes exact code paths, it doesn't.

### 6. After Saving

Run `/rpi:review-design {design-path} {requirements-path}` to validate.

If validation fails, address issues and re-validate.

### 7. Append to Pipeline State

Append a Design Phase section to `.claude/pipeline/{topic}.state.md`:

```markdown
## Design Phase

### Alternatives Considered
- [Approach]: [Why chosen or rejected — 1 line each]

### Key Discoveries
- [Codebase patterns, constraints, or gotchas found during investigation]

### Handoff Notes
- [What the planning phase needs to know beyond the design]
```

### 8. Evaluate Need for Research

**Small features** (touches ~10 or fewer files):
- The design's "Related files" section is sufficient context
- State: "Design validated. Clear chat and run `/rpi:plan {topic}`."

**Large features** (touches 10+ files across multiple domains):
- Offer to create dedicated context documents for planning
- If yes, spawn `Explore` agents per domain, save to `.claude/context/{topic}-{domain}.context.md`
- State: "Design and context validated. Clear chat and run `/rpi:plan {topic}`."
