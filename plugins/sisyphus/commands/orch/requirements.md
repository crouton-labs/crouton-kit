---
description: Define behavioral requirements with EARS acceptance criteria
argument-hint: <topic or description>
---
# Requirements

**Input:** $ARGUMENTS

The user wants formal requirements defined before design or implementation proceeds.

Spawn a `sisyphus:requirements` agent to lead this — it's interactive, drafts EARS-format requirements, and iterates with the user until approved. Output goes to `context/requirements.md`. If the current strategy doesn't include a requirements stage, update it before spawning.

Don't draft requirements yourself. The `sisyphus:requirements` agent handles the full process: codebase investigation, drafting, and user iteration.
