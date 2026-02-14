# devcore

Core development agents and code quality commands for systematic code review, refactoring, and expert consultation.

## Commands

### `/code-quality [path]`
Audits for "design stupidisms"—code that works but doesn't make sense. Spawns parallel agents (one per top-level directory) to find:
- Unnecessary abstraction/indirection
- Purposeless state or config
- Cargo-culted patterns
- Clever-but-confusing code
- Dead/unreachable logic
- Overly defensive code against impossible scenarios

Returns prioritized findings table with `file:line`, issue description, and severity (high/med/low).

```bash
/code-quality src/
```

### `/code-review [scope|plan-path]`
Multi-agent code review scaled to change size. Covers 9 concerns: edge cases, dead code, error paths, compliance, logic bugs, security, code smells, pattern consistency, idiomatic code.

**Scope inference** (auto-detects):
1. Conversation changes (default)
2. Uncommitted changes (staged + unstaged)
3. Branch changes (commits ahead of main)
4. Last commit (fallback)

**Agent scaling**:
- Small (<10 files): 3-4 agents, each covering multiple concerns
- Medium (10-25 files): 6-8 agents, split by concern or vertical slice
- Large (>25 files): 8-12 agents, vertical slices + dedicated opus for bugs/security

**Validation**: ~1 validator per 3 issues. Opus validates bugs/security; sonnet validates compliance/smells/patterns.

Output format: High/Medium/Low signal sections with `file:line` references.

```bash
/code-review           # Reviews conversation changes
/code-review branch    # Reviews branch changes
/code-review commit    # Reviews last commit
```

### `/delegate-fixes [additional instructions]`
Delegates fixes for issues identified in conversation. Categorizes by complexity:
- **Obvious**: Single clear fix → haiku subagent (parallel, background)
- **Likely**: Tradeoffs exist but one approach recommended → haiku subagent or `programmer`
- **Complex**: Design decisions needed → discuss, optionally use `senior-advisor`, then delegate

For <3 changes, implements directly instead of spawning agents.

```bash
/delegate-fixes
```

### `/validate-findings [context]`
Independent verification of major findings. Spawns parallel sonnet agents (one per finding) to confirm or refute. Returns validation summary: ✓ confirmed, ✗ refuted, or ⚠ partially correct.

```bash
/validate-findings
```

### `/advise <scenario>`
Expert consultation mode. Spawns `senior-advisor` agents with different perspectives for unbiased feedback. Use when you need best practices guidance, not implementation.

```bash
/advise How should I structure this authentication system?
```

## Agents

### `programmer` (sonnet, blue)
Multi-file feature implementation. Analyzes patterns first, then implements. Use for:
- Tasks involving 3+ files
- Pattern analysis needed
- Breaking changes for quality improvements

Throws errors early, flags false assumptions, breaks existing code for quality in pre-production.

### `senior-advisor` (opus, orange)
Expert analysis, read-only. Launch multiple in parallel with perspectives:
- **Pragmatist**: Simplest path, fastest solution
- **Architect**: Long-term implications, system fit
- **Skeptic**: Risks, false assumptions, edge cases

Focuses on: code quality, architecture, type safety, error handling, performance, security, hidden assumptions, pattern integration.

### `library-docs-writer` (haiku, pink)
Compresses external library docs for LLM consumption. Focuses only on non-obvious information:
- Exact function signatures with all parameters/types
- Non-obvious constraints (max items, case requirements)
- Version-specific changes/deprecations
- Non-intuitive behaviors/gotchas

Excludes: common APIs, general patterns, obvious parameters. Saves to `.claude/docs/external/[library]/[topic].docs.md`.

## When Agents Auto-Spawn

- **code-quality**: Always spawns agents (one per directory)
- **code-review**: Always spawns review agents (3-12 based on size) + validation agents
- **delegate-fixes**: Spawns haiku subagents for obvious fixes, `programmer` for likely fixes after approval
- **validate-findings**: Always spawns validation agents (one per finding)
- **advise**: May spawn `senior-advisor` agents for complex scenarios

Manual spawning: Use Task tool with agent name (`devcore:programmer`, `devcore:senior-advisor`, etc.).
