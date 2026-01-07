# debugging

Systematic debugging workflows that prioritize root cause identification over quick fixes.

## Commands

### `/debug [issue description]`

Structured 5-step debugging workflow with optional agent delegation.

**Workflow:**
1. **Understand** — If you know the exact cause, fix immediately and exit
2. **Document** — Launches background `@agent-Explore` to map related code while you clarify with user:
   - Expected vs actual behavior
   - Reproduction steps
   - Context (error messages, feature/story IDs)
3. **Investigate** — Default: investigate yourself. Use `use-agents` flag or post-feature work to delegate to `@senior-engineer`
4. **Identify** — If root cause unclear, list 3-5 hypotheses and 3-5 assumptions, then trace exact data flow or UI hierarchy until issue is quoted
5. **Fix** — Minimal changes following existing patterns

**Example:**
```bash
/debug "Login form validation fails on submit"
# Spawns explorer agent, asks clarifying questions, traces validation logic
```

### `/investigate-fix`

Minimal prompt for confident diagnosis before fixing. No structured steps—just a constraint: don't suggest fixes until you've identified root cause.

**Key rule:** Read files completely rather than assuming logic. Question all assumptions.

**Example:**
```bash
/investigate-fix
# User describes bug in conversation
# Command enforces: investigate → confirm root cause → implement
```

## When to Use Which

- **`/debug`** — Unclear issue, need structure, large codebase (can delegate)
- **`/investigate-fix`** — Clear bug report, confident you can trace it quickly

Both enforce: **no speculative fixes**.
