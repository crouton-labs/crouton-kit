---
description: Get multi-perspective expert analysis (pragmatist, architect, skeptic)
allowed-tools: Task(*), Glob(*), Grep(*), Read(*)
argument-hint: <question, plan, or decision>
disable-model-invocation: true
---

**Input**: $ARGUMENTS

Spawn three `devcore:senior-advisor` agents in parallel, each with a distinct perspective:

1. **Pragmatist**: What's the simplest path? Fastest solution? What can we skip?
2. **Architect**: What are the long-term implications? How does this fit the system? What patterns apply?
3. **Skeptic**: What are the risks? What false assumptions are being made? What edge cases will bite us?

After all three respond, synthesize their findings into a unified recommendation. Highlight where they agree and where they conflict.
