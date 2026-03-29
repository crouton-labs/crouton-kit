---
description: Explore the problem space collaboratively before committing to a solution
argument-hint: <topic or description>
---
# Problem Exploration

**Input:** $ARGUMENTS

The user wants to step back and explore the problem space before committing to a direction. This is a signal to prioritize understanding over progress.

Spawn a `sisyphus:problem` agent to lead this — it's interactive, collaborates with the user, and saves findings to `context/problem.md`. If the current strategy doesn't account for a problem exploration stage, update it before spawning.

Don't do the exploration yourself. The `sisyphus:problem` agent is purpose-built for divergent thinking and user collaboration.
