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

### Step 1: Assess

Review this conversation and make a honest judgment: **did the session have actual failures?**

A failure is a moment where you concretely went wrong — took a wrong path, wasted significant tokens, backtracked, made an incorrect assumption, or were misled. A clean session with no failures is a normal, common outcome. If the session was clean, say so in 1-3 sentences and stop. Do not continue to Step 2.

**These are NOT failures:**
- Codebase improvements you noticed along the way
- Documentation that *could* be better but didn't actually cause a problem
- Hypothetical future issues that didn't manifest in this session
- Things that went fine but could theoretically go faster

### Step 2: Enumerate failures (only if Step 1 found issues)

For each failure, all three fields are required:

1. **What happened** — cite the specific moment. What did you do, and what went wrong? If you cannot point to a concrete action and its bad outcome, it is not a finding.
2. **Root cause** — which failure mode category applies (see reference below)
3. **Proposed fix** — specific fix with fix type (see reference below)

Prioritize by: (frequency x severity). Recurring issues that waste significant tokens rank highest. Skip one-off missteps, issues already fixed mid-session, or findings where the fix is "no action."

#### Failure mode reference
- Went down a wrong path, wasted tokens, or had to backtrack
- Made incorrect assumptions instead of reading code
- Were misled by documentation, rules, CLAUDE.md files, or tool output
- Struggled with confusing code (layout, naming, duplication, size, smells)
- Used a script/tool/command that didn't behave as expected
- Lacked context that would have prevented a mistake
- Received conflicting guidance from different sources
- Over-engineered or under-delivered due to unclear requirements
- **Context pollution**: too much irrelevant context loaded, drowning useful signal
- **Stale docs**: CLAUDE.md or rules describing outdated behavior
- **Hidden side effects**: functions doing more than their names suggest
- **Over-abstraction**: code too layered to trace
- **Silent failures**: tools/scripts failing without useful error messages
- **Repeated manual ceremony**: multi-step sequences that should be scripted
- **Wrong search strategy**: grepped when should have globbed, read wrong files, rabbit-holed

#### Fix type reference

Don't default to docs for everything — there are stronger options.

- **Hooks** — deterministic lifecycle handlers. Unlike instructions, these **cannot be ignored**. Use the `hooks` skill.
- **Rules** (`.claude/rules/*.md`) — auto-loaded constraints, optionally scoped via `paths` frontmatter. Use the `rules-authoring` skill.
- **CLAUDE.md updates** — universal project context. Every line is scarce real estate; propose pruning alongside additions. If >5 lines of domain knowledge, suggest a skill instead. Use the `claude-md-authoring` skill.
- **Scripts/tools** (`bin/`, MCP servers) — abstract repeated multi-step sequences. Use the `scripts-and-tooling` skill.
- **Skills** (`.claude/skills/`) — on-demand reference, not loaded every session. Use the `skills-authoring` skill.
- **Commands** — reusable prompts for specific workflows. Use the `commands-authoring` skill.
- **Refactoring** — when the code itself is the problem.
- **Bug fixes** — when tools/scripts are broken or misdocumented.

## Constraints

- **Report only.** Present findings, then ask before implementing anything.
- **Never auto-modify** CLAUDE.md files, rules, skills, agent prompts, or hooks. Always show proposed content for review first.
- When proposing hooks: specify the event, matcher, and behavior — confirm before writing code.
- When proposing scripts: describe the interface (args, behavior) before implementing.
- Be honest about issues that aren't fixable (inherent model limitations, genuinely ambiguous requirements).
