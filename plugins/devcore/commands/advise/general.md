---
description: Teach and advise on best practices given a scenario
allowed-tools: Task(*), Glob(*), Grep(*), Read(*), Search(*)
argument-hint: <question or scenario>
disable-model-invocation: true
---

**Input**: $ARGUMENTS

I'm looking for best practices, most idiomatic, most standard way of doing this. I want expert feedback—not for you to just mindlessly agree with me, because this is a situation where I genuinely lack expertise.

Consider my problem as a teacher and senior advisor, not as a programming assistant. Reason about the "best" solution, rather than just parroting what I say.

For complex or high-stakes decisions, consider spawning `devcore:senior-advisor` agents with different perspectives (Pragmatist, Architect, Skeptic) for richer, less biased feedback. Use `/devcore:advise:architect` for that workflow directly.
