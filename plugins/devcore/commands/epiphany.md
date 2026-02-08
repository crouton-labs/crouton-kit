---
description: Generate breakthrough insights through parallel multi-framework divergent thinking
allowed-tools: Task(*), Read(*), Glob(*), Grep(*)
argument-hint: <problem or challenge to think through>
disable-model-invocation: true
---

**Problem**: $ARGUMENTS

Generate genuinely novel insights on this problem. The goal is ideas that make the problem *disappear*, not just solve it—and ideas that surprise you.

## Phase 1: Divergent Exploration (parallel)

Spawn **5 parallel `devcore:senior-advisor` subagents**, each assigned one cognitive lens. Give each the exact problem statement and instruct them to push to extremes—boring answers mean they aren't thinking differently enough.

Each advisor should generate 3-5 concrete approaches, not abstract hand-waving.

### Advisor assignments:

1. **Perspective Shifter** — Attack from alien viewpoints: temporal (100yr past/future), scale (1000x larger/smaller), adversarial (how would an opponent solve this?), zero-constraint (how would a child approach it?). The point is to escape the default frame.

2. **Cross-Domain Translator** — Find the core *structure* of this problem, then find analogous solved problems in biology, economics, physics, game theory, and art. Extract transferable principles and adapt them concretely.

3. **Constraint Breaker** — Identify the 5 biggest constraints limiting current solutions. For each: what if it weren't true? Then add 3 *impossible* constraints (negative budget, no technology, must work in reverse) and solve anyway. Finally: what if each constraint became an *advantage*?

4. **Inversion Specialist** — Define the exact *opposite* of this problem. Solve that instead. Then negate each inverse solution and extract the underlying principles. Apply those principles back to the original.

5. **Abstraction Climber** — Starting from the problem, ask "what question does solving this answer?" Repeat 5 levels up. Determine if the *real* problem is at a higher abstraction level. Generate solutions for the highest-level question that emerged.

## Phase 2: Synthesis (after all advisors return)

With all 5 advisor outputs:

1. **Cross-reference** — Find recurring themes, principles, or approaches across advisors
2. **Hybridize** — Combine strongest elements from different lenses into novel hybrid solutions
3. **Meta-pattern** — What patterns emerge about the problem *itself*? What assumptions were consistently challenged?

## Phase 3: Rank & Present

Present **top 3 breakthrough solutions**, each with:
- The insight and how it works
- Which lenses contributed to it
- Why it represents a genuine shift in thinking
- Concrete next steps

Close with: **What surprised you most? What assumptions did you have to abandon?**

## Constraints

- Don't filter for "practicality" during Phase 1—that's Phase 3's job
- Advisors must work independently—don't share one advisor's output with another
- If an advisor returns safe/conventional ideas, that lens failed. Note it.
