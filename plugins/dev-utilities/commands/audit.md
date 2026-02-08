---
description: Reflect on this session's failure modes and propose targeted fixes
allowed-tools: Read, Bash(cat:*), Bash(wc:*)
argument-hint: [history]
---

**Arguments:** $ARGUMENTS

If the argument is "history", run **Trend Analysis Mode** below. Otherwise, run **Session Audit Mode**.

---

## Trend Analysis Mode (argument: `history`)

Read the accumulated audit log at `.claude/audit-log.jsonl`. Each line is a JSON record with: `session_id`, `timestamp`, `assistant_turns`, `tool_calls`, `file_edits`, `file_edit_counts`, `user_corrections`, `backtrack_files`.

Analyze the log and produce a concise report covering:

1. **Session summary table** — date, turns, edits, corrections, backtrack files (most recent 20 sessions)
2. **Trends** — are sessions getting longer/shorter? More or fewer corrections? Backtracking increasing or decreasing?
3. **Hotspot files** — files that appear most often in `file_edit_counts` and `backtrack_files` across sessions. These are candidates for refactoring, better rules, or improved CLAUDE.md guidance.
4. **Correction rate** — `user_corrections / assistant_turns` over time. Trending up = quality regression.
5. **Actionable recommendations** — based on the data, what specific improvements (rules, hooks, refactoring) would reduce churn?

If the log file doesn't exist or is empty, say so and suggest running a few sessions first.

### Constraints
- Show real numbers, not vague summaries
- If fewer than 3 sessions, note that trends aren't meaningful yet
- Don't propose fixes that aren't supported by the data

---

## Session Audit Mode (default, no argument)

Review this conversation from start to finish. Identify every point where you:
- Went down a wrong path, wasted tokens, or had to backtrack
- Made incorrect assumptions instead of reading code
- Were misled by documentation, rules, CLAUDE.md files, or tool output
- Struggled with confusing code (layout, naming, duplication, size, smells)
- Used a script/tool/command that didn't behave as expected
- Lacked context that would have prevented a mistake
- Received conflicting guidance from different sources
- Over-engineered or under-delivered due to unclear requirements

Also consider these less obvious failure modes:
- **Context pollution**: too much irrelevant context loaded, drowning useful signal
- **Stale docs**: CLAUDE.md or rules describing outdated behavior
- **Hidden side effects**: functions doing more than their names suggest
- **Over-abstraction**: code too layered to trace
- **Silent failures**: tools/scripts failing without useful error messages
- **Repeated manual ceremony**: multi-step sequences that should be scripted
- **Wrong search strategy**: grepped when should have globbed, read wrong files, rabbit-holed

For each issue found, state:
1. What happened (1-2 sentences)
2. Root cause / failure mode category
3. Proposed fix and fix type

## Available Fix Types

Consider these tools when proposing solutions. Don't default to docs for everything — there are stronger options.

- **Hooks** — deterministic handlers at lifecycle events. Can block dangerous operations, inject context before/after tool use, auto-format code after edits, enforce quality gates before stopping, auto-approve safe operations, modify tool inputs transparently, trigger notifications, log actions for auditing, coordinate agent teams, and more. Unlike instructions, these **cannot be ignored**. Use the `hooks` skill for the full pattern reference.
- **Rules** (`.claude/rules/*.md`) — auto-loaded constraints, optionally scoped to file patterns via `paths` frontmatter. Lighter than hooks, heavier than CLAUDE.md. Use the `rules-authoring` skill for guidance.
- **CLAUDE.md updates** — universal project context loaded every session. Every line is scarce real estate; propose pruning alongside additions. Use the `claude-md-authoring` skill for best practices.
- **Scripts/tools** (`bin/` executables, MCP servers) — abstract away repeated multi-step sequences, complex computation, environment setup, git workflows, API interactions, code scaffolding, deployment pipelines. Deterministic, token-efficient, composable across hooks/commands/CI. Use the `scripts-and-tooling` skill for design guidance.
- **Skills** (`.claude/skills/`) — on-demand reference material loaded when relevant, not every session. Better than CLAUDE.md for domain knowledge that's detailed but not always needed. Use the `skills-authoring` skill.
- **Commands** — reusable prompts that set mode and constraints for specific workflows. Use the `commands-authoring` skill.
- **Refactoring** — when the code itself is the problem (naming, layout, duplication, size, abstraction, smells).
- **Bug fixes** — when tools/scripts are broken or misdocumented.

## Constraints

- **Report only.** Present findings, then ask before implementing anything.
- **Never auto-modify** CLAUDE.md files, rules, skills, agent prompts, or hooks. These are high-leverage artifacts where bad edits compound. Always show proposed content for review first.
- When proposing CLAUDE.md changes: every line is scarce real estate. Propose pruning alongside additions. If content is >5 lines of domain knowledge, suggest a skill instead.
- When proposing hooks: specify the event, matcher, and what the hook should do—but confirm before writing code.
- When proposing scripts: describe the interface (args, behavior) before implementing.
- Prioritize by: (frequency × severity). Recurring issues that waste significant tokens rank highest.
- **Skip low-value findings.** Don't report one-off missteps, issues already fixed during the session, or things where the proposed fix is "no action." If it's not worth changing something to prevent, it's not worth reporting.
- Be honest about issues that aren't fixable (inherent model limitations, genuinely ambiguous requirements).
- If nothing actionable went wrong, say so. Don't manufacture issues.
