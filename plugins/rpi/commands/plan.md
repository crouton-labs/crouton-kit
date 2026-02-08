---
description: After /rpi/arch - create implementation plan from spec
argument-hint: <spec-path or description>
disable-model-invocation: true
---
# Create Implementation Plan

**Input:** $ARGUMENTS

Parse the input above. It may be:
- A direct path to a spec file
- A topic name (look in `.claude/specs/{topic}.spec.md`)
- A description with additional context, priorities, or constraints

Extract the spec reference and any guidance about what to prioritize or skip.

## Objective

Create a comprehensive, actionable implementation plan based on the feature specification and codebase context.

## Inputs

1. **Read the specification**
   - If a path was provided, read it directly
   - If a topic was given, look in `.claude/specs/`
   - The spec defines *what* to build—the plan defines *how*

2. **Locate context documents** (if any)
   - Check `.claude/context/` for related context files
   - These are optional—only created for large multi-domain features
   - If none exist, use the spec's "Related files" section as your context

## Planning Approach

1. **Review spec, context, and pipeline state**
   - Understand the required behavior from the spec
   - Review context docs for patterns, constraints, and integration points
   - Check `.claude/pipeline/{topic}.state.md` if it exists — this contains the spec phase's investigation findings, rejected alternatives, and handoff notes. **Do not re-explore areas already covered there.**
   - Identify areas of complexity or risk

2. **Determine plan complexity and strategy**
   
   - **Simple plans** (1-3 files, single domain)
     - Create a single plan document with all details
   
   - **Medium plans** (multiple domains, 4-10 files)
     - Spawn multiple `Plan` agents in parallel
     - Each agent focuses on a specific phase, domain, or architectural layer
     - Provide each agent with relevant context documents
     - **Synthesize their outputs into one cohesive master plan document**
   
   - **Large plans** (many files, complex cross-cutting changes)
     - Create a master plan document that outlines phases, using two or more `Plan` agents
     - Delegate each phase to a `Plan` agent to create detailed sub-plans focusing on edge cases, tests, and patterns not covered in the master plan
     - **Sub-plans are saved as separate documents** in `{cwd}/.claude/plans/`. Each plan agent should save the plan they created.
     - **Link to sub-plans from each phase** in the master plan

## Plan Document Requirements

### Structure
- **Overview** - What we're building and why
- **Phases** - Logical breakdown of work (if multi-phase)
- **Implementation details** - File-by-file changes, organized by phase
- **Integration points** - How pieces connect
- **Verification** - Actionable tests for each major phase

### Content Guidelines
- **Concise but complete** - Include critical implementation details without verbosity
- **Type definitions** - Specify exact types/interfaces being created
- **Pseudocode when helpful** - For complex algorithms or non-obvious logic
- **No code smells** - Avoid fallbacks, magic values, or shortcuts
- **No timelines** - Focus on what, not when
- **No conditionals or uncertainty** - Plans must be fully resolved. No "if X, then Y" branches, no "investigate whether..." steps, no deferred decisions. Resolve all ambiguity during planning, not during execution.

### Team-Ready Structure (medium+ plans)

For plans with 4+ tasks, structure the plan so `/rpi:implement` can delegate to an agent team:

- **File ownership** - Each task should own a clear set of files. Avoid tasks that edit the same files. If overlap is unavoidable, note it explicitly so the implementer can sequence those tasks.
- **Dependency graph** - State which tasks block which. Use "depends on: {task}" notation.
- **Integration points** - Where tasks produce/consume shared types, interfaces, or APIs, call these out explicitly. Teammates need to know what contract to implement against and who to notify when it changes.
- **Task granularity** - Each task should be a self-contained unit of work completable by one agent. Too coarse = can't parallelize. Too fine = coordination overhead.

### Quality Standards
- Follow existing patterns and conventions from context
- Maintain consistency across the codebase
- Design for maintainability and testability
- Make dependencies and side effects explicit

## Post-Plan Review

After the plan is finalized, offer advisor review.

### Process

1. Offer: "Plan complete. Would you like advisor review before implementation?"
2. If accepted, spawn `devcore:senior-advisor` agents with distinct perspectives:
   - **Complexity**: Are sections deceptively complex? Missing edge cases?
   - **Code Smells**: Does the plan encode bad patterns or shortcuts?
   - **Ambiguity**: Unresolved decisions masquerading as resolved?

3. Provide each advisor:
   - Path to spec document
   - Path to plan document (+ sub-plans if any)

Scale advisor count to plan scope—larger changes warrant more review perspectives.

### After Review

Summarize findings. Revise plan to address significant concerns.

After revisions are complete, run `/rpi:review-plan {spec-path} {plan-path}` to validate coverage.

If validation fails, address the gaps and re-run validation.

## Output

### Append to Pipeline State

If `.claude/pipeline/{topic}.state.md` exists, append a Planning Phase section:

```markdown
## Planning Phase

### Architectural Decisions
- [Decision]: [Rationale — 1 line each]

### Complexity Hotspots
- [Area]: [Why it's risky or non-obvious]

### Handoff Notes
- [What the implementation phase needs beyond the plan itself]
```

Keep it terse. Only capture what's not already in the plan document.

### Save Plan

Save the master plan to the project's .claude directory at `.claude/plans/` with a descriptive name (e.g., `implement-auth-flow.plan.md`).

For large plans with sub-plans, list the linked sub-plan documents.

State after saving: "Plan saved to `{path}`. Would you like advisor review before implementation?"

State after validation passes: "Plan validated. Clear chat and run `/rpi:implement {plan-path}`."