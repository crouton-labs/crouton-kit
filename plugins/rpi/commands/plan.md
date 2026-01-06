---
description: After /rpi/arch - create implementation plan from spec
argument-hint: <spec-path or description>
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

1. **Review spec and context**
   - Understand the required behavior from the spec
   - Review context docs for patterns, constraints, and integration points
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

### Quality Standards
- Follow existing patterns and conventions from context
- Maintain consistency across the codebase
- Design for maintainability and testability
- Make dependencies and side effects explicit

## Plan Quality Evaluation

After writing the plan document, evaluate it for **iterative deepening**.

### The Goldilocks Test

Each section should be:
- **Open enough** to trust the implementing agent's judgment on details
- **Granular enough** that implementation path is never unknown or unexplored

Sections fail this test when they acknowledge complexity without resolving it, defer decisions to implementation time, or leave the "how" genuinely unclear.

### Iterative Deepening

For sections that fail evaluation:
1. Spawn a `Plan` agent focused specifically on that section
2. Provide the section content + relevant spec/context
3. Agent produces deeper breakdown
4. Either update the section inline or create a linked sub-plan in `.claude/plans/`

For plans with many weak sections, consider spawning one `Plan` agent per phase to deepen in parallel.

## Post-Plan Review

After the plan is finalized (including any deepening), offer advisor review.

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

Summarize findings. Revise plan to address significant concerns, re-deepening sections if needed.

## Output

Save the master plan to the project's .claude directory at `.claude/plans/` with a descriptive name (e.g., `implement-auth-flow.plan.md`).

For large plans with sub-plans, list the linked sub-plan documents.

State after deepening: "Plan saved to `{path}`. Would you like advisor review before implementation?"

State after review (if done): "Plan reviewed and finalized. Clear chat and run `/rpi:implement {plan-path}`."