---
description: Start new feature - define spec and gather context
argument-hint: <topic or description>
---
# Feature Specification

**Input:** $ARGUMENTS

Parse the input above. It may be:
- A single topic word (e.g., "auth")
- A longer description of what the user wants
- Context about priorities or constraints

Extract the core feature topic and any relevant context to inform your investigation.

## Objective

Define the feature through collaborative conversation. Produce a clear specification that captures behavior and—when relevant—high-level architecture.

---

## Process

### 1. Initial Investigation

Briefly explore the codebase to understand:
- Relevant existing patterns or similar features
- Constraints that might affect the feature design
- Integration points or dependencies
- Architectural patterns already in use

### 2. Present Findings and Proposal

Always share:
- What you found in the codebase
- A concrete proposal with your reasoning
- Relevant file paths that will be involved
- Trade-offs you see or where you're less certain

Share your perspective: what's clear, what's open, what you'd lean toward and why. E.g., "I'm confident about X, but Y could go either way depending on how much we value Z."

### 3. Design Through Conversation (if needed)

If there's ambiguity or complexity worth discussing:
- Propose high-level approaches with rationale
- Ask substantive questions about architecture, behavior, edge cases, or design
- Questions should be specific: Bad: "What should happen on error?" Good: "If the API returns a 429, should we retry with backoff or surface the rate limit to the user?"
- Iterate until the feature is well-defined

Ambiguity can be technical, architectural, or design-related (UI/UX choices count).

### 4. Save Specification

When the feature is well-defined, save to `{cwd}/.claude/specs/{topic-name}.spec.md`

**The spec captures decisions, not questions.** All trade-offs and ambiguity from the conversation should be resolved before saving. The spec is the settled contract for implementation.

**Spec format:**
- **Summary** — One paragraph describing the feature
- **Behavior** — Observable behavior only: what users/systems see from the outside. Input/output mappings, preconditions/postconditions, invariants, state transitions, data shapes. Cover what's non-obvious; skip what's self-evident. Focus on decisions that would otherwise be left to implementer discretion.
- **Architecture** (if applicable) — Component boundaries and contracts between them. NOT internal mechanisms, code paths, or data flow through specific functions.
- **Constraints** — Limitations, requirements, or boundaries
- **Related files** — Paths to relevant existing code. List files that will be involved, but do NOT annotate them with implementation instructions (e.g., don't write "oauth.controller.ts — add ref to state").

**No code.** No pseudocode. No type definitions. Behavioral and contractual only.

**Behavior vs mechanism — the critical distinction.** Specs describe WHAT happens, not HOW it happens internally. During investigation you'll form opinions about implementation — discard them. The planner will figure out mechanisms independently with the right context.
- "Referral is attributed during signup" → behavior ✓ (observable outcome)
- "ref flows through the OAuth state cookie" → mechanism ✗ (internal code path)
- "Every org has a referral slug" → behavior ✓ (observable property)
- "Slug auto-generated on org creation" → mechanism ✗ (timing/lifecycle is implementation)
- "Referrer earns 500 bonus credits" → behavior ✓ (observable outcome)
- "Increment the bonusCredits field" → mechanism ✗ (storage detail)

When in doubt: if a planner couldn't reasonably choose a different approach after reading your spec, you've over-constrained it.

---

## After Saving the Spec

### Save Pipeline State

Save a decision journal to `.claude/pipeline/{topic}.state.md` capturing investigation byproducts that the spec doesn't include. This prevents the planning phase from re-exploring the same territory.

```markdown
# Pipeline State: {topic}

## Specification Phase

### Alternatives Considered
- [Approach]: [Why chosen or rejected — 1 line each]

### Key Discoveries
- [Codebase patterns, constraints, or gotchas found during investigation that aren't in the spec]

### Handoff Notes
- [What the planning phase needs to know that doesn't fit the spec format]
```

Keep it terse — 10-20 bullet points total. This is a scratchpad, not a document.

### Validate

Run `/rpi:review-spec {spec-path}` to validate the spec.

If validation fails, address the issues and re-run validation.

### Evaluate Need for Research

**Small features** (touches ~10 or fewer files):
- The spec's "Related files" section is sufficient context
- No separate research documents needed
- State after validation passes: "Spec validated. Clear chat and run `/rpi:plan {spec-path}`."

**Large features** (touches 10+ files across multiple domains):
- Offer: "This feature spans multiple areas. Would you like me to create dedicated context documents for planning?"
- If yes, proceed to research phase

---

## Research Phase (optional)

Only run if the user confirms, for large multi-domain features.

### 1. Investigate Thoroughly

- Spawn `Explore` agents to investigate different areas in parallel
- Each agent focuses on a specific domain (e.g., data models, API patterns, UI components)
- Synthesize findings into focused context documents

### 2. Create Context Documents

Save to the spec to the project's .claude directory, at `.claude/context/` with descriptive names (e.g., `{topic}-data.context.md`, `{topic}-api.context.md`).

Each context document should include:
- Relevant file paths and key code patterns
- Existing abstractions or utilities to leverage
- Integration points and dependencies
- Constraints or gotchas to be aware of

Documents should be:
- **Organized by domain or layer**
- **Cohesive** — Each covers a complete slice
- **Non-overlapping**
- **Implementation-ready**

### 3. Output

List context documents created with brief summaries.

State after validation passes: "Spec and context validated. Clear chat and run `/rpi:plan {spec-path}`."
