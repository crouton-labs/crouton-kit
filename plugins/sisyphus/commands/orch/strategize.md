---
description: Redirect session strategy — reactivate if completed, then respawn in strategy mode
argument-hint: <new direction or focus>
---
# Strategize

**Input:** $ARGUMENTS

The user wants to redirect this session's strategy. Parse their input for the new direction, focus, or concern they want to address.

## Steps

### 1. Reactivate if Completed

Check session status with `sisyphus status`. If the session is completed:

```bash
sisyphus continue
```

This clears the roadmap and reactivates the session so you can redirect.

### 2. Capture the Pivot

Update `strategy.md` with a new entry noting the strategic redirect:
- What changed and why
- What the new focus is
- Which existing artifacts (context files, prior work) are still relevant

Don't rewrite the whole strategy — annotate the pivot point so the respawned orchestrator understands the shift.

### 3. Yield to Strategy Mode

```bash
sisyphus yield --mode strategy --prompt "<concise description of the new direction>"
```

This kills the current orchestrator and respawns a fresh instance in strategy mode with the updated strategy.md. The respawned orchestrator will re-evaluate the goal, stages, and approach from the new perspective.
