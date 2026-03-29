---
description: Explore the problem space collaboratively before committing to a solution
argument-hint: <topic or description>
---
# Problem Exploration

**Input:** $ARGUMENTS

Parse the input for the core topic and any context about what the user wants to explore.

## Objective

Deeply understand the problem before anyone starts solving it. This is NOT about converging on a solution — it's about challenging assumptions, surfacing second-order effects, and ensuring the work makes sense.

## Process

### 1. Understand the Landscape

Assess what you already know from context files and session state. If areas are unfamiliar, spawn explore agents to probe them in parallel — each saves to `$SISYPHUS_SESSION_DIR/context/explore-{area}.md`.

For narrow scope (single subsystem), explore it yourself. For broad scope, delegate.

### 2. Open the Conversation

Share what you found, then explore collaboratively with the user:
- What problem are we actually solving? Is it the right problem?
- Does this make sense from a business perspective?
- What's the user experience we want? Walk through it.
- What are the second-order effects?
- What assumptions are we making that might be wrong?

**Do NOT rush to narrow the problem.** Ask questions that open thinking:
- "What if we didn't solve this at all — what happens?"
- "Who else does this affect?"
- "What would the ideal experience look like if we had no constraints?"
- "Is there a simpler version of this problem worth solving first?"

### 3. Confirm Understanding

When the problem feels well-explored:
- Summarize the problem and goals as you understand them
- Confirm the reasoning and priorities with the user
- Note any open questions or areas of uncertainty

**Wait for the user to confirm.** Do not proceed to saving without sign-off.

### 4. Save Problem Document

Save to `$SISYPHUS_SESSION_DIR/context/problem.md`:

- **Problem Statement** — What's wrong or what opportunity exists
- **Goals** — What success looks like (non-technical)
- **User Experience** — How users should experience the change
- **Context** — Business reasoning, who it affects, why now
- **Assumptions** — What we're taking for granted
- **Open Questions** — Anything unresolved

This is a thinking document, not a spec. It captures understanding, not decisions.

### 5. Next

Summarize what was captured so the user can verify. When ready, move to requirements — either run `/sisyphus:orch/requirements` or spawn a `sisyphus:requirements` agent.
