---
description: Redirect session strategy — reactivate if completed, then respawn in strategy mode
argument-hint: <new direction or focus>
---
# Strategize

**Input:** $ARGUMENTS

The user wants to redirect this session's strategy.

## Steps

1. If the session is completed (`sisyphus status`), reactivate it with `sisyphus continue`.
2. Annotate `strategy.md` with the pivot — what changed, new focus, which existing artifacts still apply. Don't rewrite the whole strategy.
3. Yield to strategy mode:
   ```bash
   sisyphus yield --mode strategy --prompt "<concise description of the new direction>"
   ```
   This respawns a fresh orchestrator that will re-evaluate the goal, stages, and approach.
