---
description: Explore and discuss the problem space (optional first step)
argument-hint: <topic or description>
---
# Problem Exploration

**Input:** $ARGUMENTS

Parse the input. Extract the core topic and any context about what the user wants to explore.

## Objective

Collaboratively explore the problem space with the user. This is NOT about converging on a solution—it's about deeply understanding the problem, challenging assumptions, and ensuring the work makes sense from business and user experience perspectives.

## Process

### 1. Understand the Landscape

Briefly explore the codebase to understand:
- What exists today related to this area
- How users currently experience this
- What constraints or dependencies exist

### 2. Open the Conversation

Share what you found, then explore collaboratively:
- What problem are we actually solving? Is it the right problem?
- Does this make sense from a business perspective?
- What's the user experience we want? Walk through it.
- What are the second-order effects?
- What assumptions are we making that might be wrong?

**Do NOT rush to narrow the problem.** The goal is expansive thinking first. Ask questions that open the user's mind:
- "What if we didn't solve this at all—what happens?"
- "Who else does this affect?"
- "What would the ideal experience look like if we had no constraints?"
- "Is there a simpler version of this problem worth solving first?"

### 3. Confirm Understanding

When the problem feels well-explored:
- Summarize the problem and goals as you understand them
- Confirm the reasoning and priorities with the user
- Note any open questions or areas of uncertainty

### 4. Save Problem Document

Save to `{cwd}/.claude/specs/{topic}/problem.md`

**Format:**
- **Problem Statement** — What's wrong or what opportunity exists
- **Goals** — What success looks like (non-technical)
- **User Experience** — How users should experience the change
- **Context** — Business reasoning, who it affects, why now
- **Assumptions** — What we're taking for granted
- **Open Questions** — Anything unresolved (if any)

This is a thinking document, not a spec. It captures understanding, not decisions.

### 5. Present to User

Briefly summarize the problem document so they can verify it captures their thinking.

State: "Problem captured. When ready, run `/rpi:requirements {topic}` to define requirements."
