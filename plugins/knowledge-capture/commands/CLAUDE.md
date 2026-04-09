# CLAUDE.md

## Command Behavior

**`/learn <focus> <output-file>`** — Both args required. `$0` scopes what to extract; `$1` is the literal file path to write. Without `$1`, there's nowhere to save. Always proposes takeaways for confirmation before writing — never auto-saves silently.

**`/interview <topic>`** — Four-phase flow (Setup → Q&A → Gap review → Save). Saves to `<relevant-name>-interview.md` by convention. "One question per turn" is a hard constraint, not a style suggestion — breaking it collapses the interview structure.

**`/collaborate`** — Strictly read-only. Produces no output file; advisory only. If you need a saved artifact at the end, use `/interview` instead.

**`/epiphany <problem>`** — Spawns 4 parallel `model: opus` Task agents. The only command here without `disable-model-invocation: true`, so Claude can invoke it autonomously. Expect significant token cost; each advisor is isolated and unaware of the others' lenses by design.

## Invocation Guard

`/learn`, `/interview`, and `/collaborate` all set `disable-model-invocation: true` — they only run when the user explicitly invokes them. `/epiphany` does not, so it can appear in autonomous agent chains.
