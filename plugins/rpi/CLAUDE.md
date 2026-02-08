# RPI Plugin

Feature development workflow using agent teams. Full pipeline: spec, plan, implement, review, test.

## Usage

**Full pipeline** (agent team): `/rpi:rpi <topic>`
**Individual phases** (standalone): `/rpi:arch`, `/rpi:plan`, `/rpi:implement`

The standalone commands work independently for partial workflows. `/rpi:rpi` orchestrates the full pipeline as a team with specialized teammates.

## Architecture

### Full Pipeline (`/rpi:rpi`)

```
Phase 1: Specification
  Lead spawns rpi:spec-writer teammate
  User interacts directly with spec-writer (Shift+Down)
  Spec-writer: investigate → propose → converse → save spec → validate
  Optional: fetch 3rd-party library docs, create context documents
  Output: .claude/specs/{topic}.spec.md

Phase 2: Planning
  Lead spawns rpi:planning-lead teammate
  Planning-lead works autonomously with Plan subagents
  Creates implementation plan + test plan, runs advisor review
  Output: .claude/plans/{topic}.plan.md, {topic}.tests.plan.md

Phase 2.5: Validation Planning
  Lead spawns rpi:validation-lead teammate (runs parallel with Phase 3)
  Inventories existing infrastructure, builds reusable tools
  Writes validation plan with per-phase exit criteria
  Output: .claude/plans/{topic}.validation.plan.md, scripts/commands

Phase 3: Implementation (per phase)
  Lead creates shared task list with dependencies
  Spawns devcore:teammate agents (opus) — they delegate to sonnet/haiku subagents
  Teammates claim tasks, implement, coordinate via messaging

  Phase Review:
    Lead spawns rpi:reviewer teammates (read-only)
    Reviewers validate findings with their own subagents
    User approves fixes → reviewers message implementers with instructions
    Implementers apply fixes

  Phase Validation:
    Lead messages validation-lead: "validate phase N"
    Validation-lead runs proof scripts, reports pass/fail with evidence
    Failures → implementers fix → re-validate until pass

Phase 4: Testing
  Dedicated devcore:teammate implements test plan
  Runs full test suite, fixes failures
  Validation-lead runs full cross-phase validation as final smoke test
  Team shutdown (including validation-lead)
```

### Agent Hierarchy

All teammates are opus. Cheaper models run as subagents within teammates, not as teammates themselves.

| Agent | Role | Model | Edits? |
|-------|------|-------|--------|
| `rpi:spec-writer` | Collaborative spec design with user | opus | Yes (specs, context) |
| `rpi:planning-lead` | Creates implementation + test plans | opus | Yes (plans) |
| `devcore:teammate` | Implementation, claims tasks from shared list | opus | Yes |
| `rpi:reviewer` | Code review + quality audit, directs fixes | opus | No (read-only) |
| `rpi:validation-lead` | Proof-of-life checks, reusable infrastructure | opus | Yes (scripts, commands, infrastructure) |

### Standalone Commands

| Command | Purpose | When to use |
|---------|---------|-------------|
| `/rpi:arch` | Define spec through conversation | Already have a plan/team, just need a spec |
| `/rpi:plan` | Create implementation plan from spec | Have a spec, want to plan without full pipeline |
| `/rpi:implement` | Execute plan with agent team | Have a plan, want to implement without review/test phases |
| `/rpi:cleanup` | Clean up old spec/plan files | Housekeeping |

Standalone commands don't create teams (except `/rpi:implement` for medium+ plans). They end with "clear chat and run the next command."

### Validation Skills

| Skill | Triggered by | Purpose |
|-------|-------------|---------|
| `review-spec` | Model (after spec edits) | Validates spec quality |
| `review-plan` | Model (after plan edits) | Validates plan covers spec |

The Stop hook in `hooks/` blocks session end if specs or plans were edited without running validation.

## Artifacts

```
.claude/
├── specs/{topic}.spec.md                    # Behavioral specification
├── plans/{topic}.plan.md                    # Implementation plan (team-ready)
├── plans/{topic}.tests.plan.md              # Test plan
├── plans/{topic}.validation.plan.md         # Validation plan (exit criteria, proof methods)
├── plans/{topic}-{phase}.plan.md            # Sub-plans (large features)
├── pipeline/{topic}.state.md                 # Decision journal across phases
├── context/{topic}-{domain}.context.md      # Codebase context per domain
├── context/{topic}-{library}.docs.md        # Third-party library docs
├── scripts/                                 # Reusable validation scripts
└── validation/{topic}/                      # Topic-specific validation scripts
```

## Key Design Decisions

- **Teammates are opus, subagents are sonnet/haiku.** Teammates make judgment calls and coordinate. Subagents handle bounded, repetitive work.
- **Reviewers are read-only.** They investigate and direct fixes through implementers, never edit code themselves.
- **Review happens per phase,** not just at the end. Catches issues before they compound in later phases.
- **Implementation teammates stay alive through review** so reviewers can message them fix instructions directly.
- **Test plan is separate.** Written during planning but implemented after all code passes review. Tests reference actual implementation, not just the plan.
- **Validation creates lasting infrastructure, not throwaway scripts.** The validation-lead prioritizes reusable project tools (commands, shared scripts, debug endpoints) that future features benefit from. Topic-specific scripts supplement but don't replace shared infrastructure.
- **Spec-writer fetches library docs.** If the feature uses unfamiliar third-party libraries, docs are gathered upfront and shared through the pipeline.
