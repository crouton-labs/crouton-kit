---
description: Get a visual briefing on current project state, progress, and next steps
argument-hint: [topic or area]
disable-model-invocation: true
---

Assess the current state of work and synthesize findings into a visual briefing. Use subagents if the scope warrants parallel investigation — skip them if the context is already at hand.

$ARGUMENTS

## Investigation Scope

Subagents should cover whatever dimensions are relevant. Common signals:

- **Specs and plans** — `.claude/specs/`, `.claude/plans/`, `.claude/pipeline/`
- **Active work** — `git diff`, `git log --oneline -20`, branch state, uncommitted changes
- **Task state** — open tasks, blockers, dependencies
- **Conversation context** — what's been discussed, decided, or deferred

Not all of these will exist or matter. Investigate what's actually there.

## Output

Use whatever format best communicates each piece — diagrams, tables, bullet lists, prose. Use diagrams where relationships or flow matter; use prose or lists where they're clearer. Don't force everything into one format.

Cover what's relevant:
- **Where things stand** — current status, what's done, what's in progress
- **Key decisions and context** — what's been decided, why, any blockers
- **What's next** — actionable next steps

## Requirements

1. **Concise** — this is a briefing, not a report. Optimize for a reader who has 60 seconds
2. **Skip empty dimensions** — show what exists, don't catalog what doesn't
3. **Highlight decisions and blockers** — surface anything that requires action or was recently decided
