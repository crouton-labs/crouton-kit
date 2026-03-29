---
description: Create technical design from requirements through investigation and user iteration
argument-hint: <topic or description>
---
# Technical Design

**Input:** $ARGUMENTS

The user wants a technical design before implementation begins.

Spawn a `sisyphus:design` agent to lead this — it's interactive, investigates the codebase, proposes architecture, and iterates with the user. Output goes to `context/design.md`. It expects `context/requirements.md` to exist; if it doesn't, flag that to the user or run requirements first.

If the current strategy doesn't include a design stage, update it before spawning. Don't do the design work yourself.
