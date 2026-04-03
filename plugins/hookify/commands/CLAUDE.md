# hookify/commands

## `writing-rules` Skill is Authoritative
Every command (except `help`) loads `hookify:writing-rules` first — that skill defines the canonical frontmatter schema and event types. When `help.md` and the skill appear to conflict, the skill wins.

## `/hookify` Without Arguments
Scans the last 10–15 user messages for behavioral signals (corrections, "don't do X", frustrated reactions) to auto-propose rules. With `$ARGUMENTS`, it still scans recent conversation to refine patterns around the stated intent.

## Rule File Locations
Two discovery paths, both scanned by `/list` and `/configure`:
- `~/.claude/hookify.*.local.md` — global (all projects)
- `.claude/hookify.*.local.md` — project-local

`/hookify` (the creation command) always writes to the **project** `.claude/` directory. Creating global rules requires manual placement in `~/.claude/`. Add `.claude/*.local.md` to `.gitignore` — these are personal, not for sharing.

## File Naming is Load-Bearing
Both the `hookify.` prefix **and** the `.local.md` suffix are required for discovery — dropping either causes a silent miss (no error, rule never fires). The glob pattern is `hookify.*.local.md`.

## Event Name Shorthands
Rule frontmatter uses shorthands, not SDK event names:

| Shorthand | SDK Event |
|-----------|-----------|
| `bash` | `PreToolUse` (Bash tool) |
| `file` | `PreToolUse` (Edit/Write tools) |
| `stop` | `Stop` |
| `prompt` | `UserPromptSubmit` |
| `teammate_idle` | `TeammateIdle` |
| `task_completed` | `TaskCompleted` |
| `all` | every event |

## `action: block` Semantics Differ by Event
`block` is not uniform:
- `bash` / `file` (`PreToolUse`) → denies the tool call
- `stop` / `teammate_idle` → forces continuation (Claude keeps working)
- `task_completed` → rejects the completion gate
- `PostToolUse` → always warn-only regardless of `action` value

## Pattern Field Uses Python Regex
`pattern:` is evaluated with Python's `re` module — not JS/PCRE. `(?P<name>...)` named groups and standard `\s`/`\d` work; JS-only syntax like `\p{L}` Unicode properties does not. Silently never matches rather than erroring. Debug with `python3 -c "import re; print(re.search('your_pattern', 'test'))"`.

## `conditions:` vs `pattern:`
Simple `pattern:` matches only `command` (bash) or `new_text` (file). To match on `file_path` + `new_text` simultaneously (e.g., flag `console.log` only in `.ts` files), use the `conditions:` array. See `writing-rules` skill for the full field/operator matrix.

## Dynamic Shell Interpolation in Rule Bodies
Rule message bodies support `` !`command` `` — executed at trigger time, stdout replaces the expression. Commands timeout after **5 seconds**; errors render as `(error: ...)`. Useful for injecting live context (git status, issue lists) when a rule fires.

## YAML Backslash Escaping
Use unquoted patterns in YAML frontmatter (`rm\s+-rf` not `"rm\\s+-rf"`). Quoted strings require double backslashes.
