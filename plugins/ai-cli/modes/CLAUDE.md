# CLAUDE.md — ai-cli/modes

## Pipeline Ordering & File Contracts

Modes form a strict DAG; running them out of order breaks file reads:

```
spec-draft → plan → review-plan → test-spec → [tactician → implement|validate] × N → done
```

`review-plan` comes **after** `plan` — it needs both spec and plan to check coverage. Putting it before plan means it has nothing to read.

`tactician` is the per-iteration dispatcher, not a final gate. Each iteration: tactician reads current state → submits one implement or validate task → loop repeats until tactician emits `action: "done"`.

| Stage | Reads | Writes |
|---|---|---|
| `spec-draft` | — | `.claude/specs/{topic}.spec.md`, `.claude/pipeline/{topic}.state.md` |
| `plan` | pipeline state | `.claude/plans/{topic}.plan.md` |
| `review-plan` | spec + plan | submits `{verdict, issues}` — no file output |
| `test-spec` | spec + plan | `.claude/plans/{topic}.test-spec.md` (or nothing if `testsNeeded: false`) |
| `tactician` | plan + spec + git diff | mutates plan in-place (`[DONE]` markers), submits next action |
| `implement` | plan phase (+ validation feedback if retry) | code changes |
| `validate` | plan phase + git diff | outputs text PASS/FAIL — no submit call |

## Pipeline State Handoff

`spec-draft` writes `.claude/pipeline/{topic}.state.md` with three sections `plan` reads to avoid re-investigating:
- **Alternatives Considered** — approaches explored and why chosen/rejected
- **Key Discoveries** — codebase constraints not in the spec
- **Handoff Notes** — anything planning needs that doesn't fit the spec format

## Structured Submit Requirement

`triage`, `tactician`, `test-spec`, and `review-plan` submit JSON via the submit tool — **never raw text output**. Changing these to prose breaks the caller that parses their output.

- `triage` → `{type, size, summary}`
- `tactician` → `{action: "implement"|"validate"|"done", prompt|summary}`
- `test-spec` → `{testsNeeded: boolean}`
- `review-plan` → `{verdict: "pass"|"fail", issues: [...]}`

`validate` is the exception — it outputs plain text PASS/FAIL. Tactician reads that output from context on the next iteration.

## Implement Fix-Feedback Retry

When tactician dispatches implement after a validation failure, it includes the failure details in the prompt. `implement` looks for this feedback and targets only what failed — rewriting everything is wrong. This is how the retry loop self-corrects without escalating scope.

## Tactician Is the Loop Controller

`tactician` owns loop termination. It reads the plan's `[DONE]` markers and decides the next `action`. No external runner terminates the loop — only `tactician` emitting `action: "done"` does.

## Model Split

`triage` uses Sonnet (classification only). All other modes use Opus. If `triage` is assigned Opus it defeats the point — triage output feeds `tactician`, which already uses Opus for reasoning.

## Subagent Spawning Thresholds

- `plan`: medium = 4–10 files (inline), large = 10+ files (spawns sub-plans per phase)
- `review`: <10 files → 3–4 subagents; 10–25 → 6–8; 25+ → 8–12 (always parallel, never serial)
- `implement`: spawns subagents for phases with 3+ files
- `debug`: spawns 2–5 subagents depending on difficulty

Crossing the size threshold changes the file layout — large plans write `{topic}-{phase}.plan.md` files that `tactician` must find by phase name, not a single flat file.

## Standalone Modes

`review` and `debug` do **not** read from `.claude/plans/` or `.claude/specs/`. They can run on any branch state without running the pipeline first. `general` is a fallback with no file dependencies.

## test-spec Opt-Out and CDP

Purely mechanical changes (renames, config bumps, dependency updates) submit `{testsNeeded: false}` and write no file. `validate` falls back to build + integration checks when the test-spec file is absent.

For visual/accessibility properties, `test-spec` marks **CDP Validation Candidates** — properties requiring browser-based proof (screenshots, a11y captures). These are a separate validation step outside the normal build+typecheck+test chain.
