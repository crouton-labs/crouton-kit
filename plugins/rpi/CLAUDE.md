# RPI Plugin

Feature development workflow using agent teams. Full pipeline: requirements, design, plan, implement, validate, test.

## Usage

**Full pipeline** (agent team): `/rpi:rpi <topic>`
**Individual phases** (standalone): `/rpi:problem`, `/rpi:requirements`, `/rpi:design`, `/rpi:plan`, `/rpi:implement`, `/rpi:validate`

The standalone commands work independently for partial workflows. `/rpi:rpi` orchestrates the full pipeline as a team with specialized teammates.

## Architecture

### Full Pipeline (`/rpi:rpi`)

```
Phase 1a: Requirements
  Lead spawns rpi:requirements-writer teammate
  User interacts directly with requirements-writer (Shift+Down)
  Requirements-writer: investigate → propose → converse → save requirements → validate
  Optional: fetch 3rd-party library docs, create context documents
  Output: .claude/specs/{topic}/requirements.md

Phase 1b: Design
  Lead spawns rpi:design-lead teammate
  Design-lead: reads requirements → investigates codebase → proposes architecture → converse → save design → validate
  Output: .claude/specs/{topic}/design.md

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
| `rpi:requirements-writer` | Collaborative requirements definition with user | opus | Yes (requirements, context) |
| `rpi:design-lead` | Technical architecture design from requirements | opus | Yes (design, context) |
| `rpi:planning-lead` | Creates implementation + test plans | opus | Yes (plans) |
| `devcore:teammate` | Implementation, claims tasks from shared list | opus | Yes |
| `rpi:reviewer` | Code review + quality audit, directs fixes | opus | No (read-only) |
| `rpi:validation-lead` | Proof-of-life checks, reusable infrastructure | opus | Yes (scripts, commands, infrastructure) |

### Standalone Commands

| Command | Purpose | When to use |
|---------|---------|-------------|
| `/rpi:problem` | Explore and frame the problem space (optional) | Complex or ambiguous problem domains |
| `/rpi:requirements` | Define requirements through conversation | Need requirements without full pipeline |
| `/rpi:design` | Create technical design from requirements | Have requirements, want architecture decisions |
| `/rpi:plan` | Create implementation plan from design | Have design, want to plan without full pipeline |
| `/rpi:implement` | Execute plan with agent team | Have a plan, want to implement without review/test phases |
| `/rpi:validate` | Run validation for a topic or phase | Need to verify implementation against plan |
| `/rpi:cleanup` | Clean up old spec/plan files | Housekeeping |

Standalone commands don't create teams (except `/rpi:implement` for medium+ plans). They end with "clear chat and run the next command."

### Validation Skills

| Skill | Triggered by | Purpose |
|-------|-------------|---------|
| `review-requirements` | Model (after requirements edits) | Validates requirements quality and completeness |
| `review-design` | Model (after design edits) | Validates design against requirements |
| `review-plan` | Model (after plan edits) | Validates plan covers design |

The Stop hook in `hooks/` blocks session end if specs or plans were edited without running validation.

## Artifacts

```
.claude/
├── specs/{topic}/
│   ├── problem.md                           # Problem exploration (optional)
│   ├── requirements.md                       # EARS requirements
│   └── design.md                             # Technical design
├── plans/{topic}.plan.md                     # Implementation plan
├── plans/{topic}.tests.plan.md               # Test plan
├── plans/{topic}.validation.plan.md          # Validation plan
├── plans/{topic}-{phase}.plan.md             # Sub-plans (large features)
├── pipeline/{topic}.state.md                 # Decision journal
├── context/{topic}-{domain}.context.md       # Codebase context
├── context/{topic}-{library}.docs.md         # Library docs
├── scripts/                                  # Reusable validation scripts
└── validation/{topic}/                       # Topic-specific validation
```

## Key Design Decisions

- **Teammates are opus, subagents are sonnet/haiku.** Teammates make judgment calls and coordinate. Subagents handle bounded, repetitive work.
- **Requirements and design are separate phases.** Requirements capture non-technical behavior (EARS format); design translates them into technical architecture. Keeping them separate prevents implementation details from contaminating behavioral intent.
- **Reviewers are read-only.** They investigate and direct fixes through implementers, never edit code themselves.
- **Review happens per phase,** not just at the end. Catches issues before they compound in later phases.
- **Implementation teammates stay alive through review** so reviewers can message them fix instructions directly.
- **Test plan is separate.** Written during planning but implemented after all code passes review. Tests reference actual implementation, not just the plan.
- **Validation creates lasting infrastructure, not throwaway scripts.** The validation-lead prioritizes reusable project tools (commands, shared scripts, debug endpoints) that future features benefit from. Topic-specific scripts supplement but don't replace shared infrastructure.
- **Design-lead fetches library docs.** If the feature uses unfamiliar third-party libraries, docs are gathered upfront and shared through the pipeline.
