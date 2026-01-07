# rpi

Three-phase feature workflow with collaborative design, iterative planning, and parallel execution.

## Commands

- `/rpi/arch <topic>` - Define spec through investigation and conversation
- `/rpi/plan <spec-path>` - Create implementation plan from spec
- `/rpi/implement <plan-path>` - Execute plan with parallel agents

## Phase 1: Architecture (`/rpi/arch`)

**Input:** Topic name or feature description

**Process:**
1. Investigates codebase for patterns, constraints, integration points
2. Proposes concrete approach with trade-offs
3. Iterates through conversation to resolve ambiguity
4. Saves specification when feature is well-defined

**Output:** `.claude/specs/{topic}.spec.md`

**Spec format:**
- **Summary** - One paragraph feature description
- **Behavior** - Input/output mappings, preconditions, invariants, state transitions (no code)
- **Architecture** - Key abstractions, component interactions (if applicable)
- **Constraints** - Limitations, requirements, boundaries
- **Related files** - Paths to relevant existing code

**Optional research phase** (large features only):
- Spawns `Explore` agents to investigate domains in parallel
- Creates context documents: `.claude/context/{topic}-{domain}.context.md`
- Each context doc covers patterns, utilities, integration points for one domain

## Phase 2: Planning (`/rpi/plan`)

**Input:** Spec path (or topic name to auto-resolve from `.claude/specs/`)

**Process:**
1. Reads spec + any context documents from `.claude/context/`
2. Determines plan complexity:
   - **Simple** (1-3 files): Single plan document
   - **Medium** (4-10 files): Spawn `Plan` agents per domain, synthesize into one document
   - **Large** (10+ files): Master plan + linked sub-plans (saved separately)
3. Evaluates plan quality (Goldilocks test: open enough to trust agent judgment, granular enough that path is clear)
4. Iterative deepening: spawns focused `Plan` agents for weak sections
5. Offers optional advisor review (`devcore:senior-advisor` with distinct perspectives)

**Output:** `.claude/plans/{topic}.plan.md` (+ sub-plans if large)

**Plan format:**
- **Overview** - What and why
- **Phases** - Logical work breakdown (if multi-phase)
- **Implementation details** - File-by-file changes with type definitions, pseudocode for complex logic
- **Integration points** - How pieces connect
- **Verification** - Actionable tests per phase

**Quality constraints:**
- No conditionals or uncertainty (all decisions resolved during planning)
- No timelines (focus on what, not when)
- Type definitions and complex logic specified
- No fallbacks or code smells

## Phase 3: Implementation (`/rpi/implement`)

**Input:** Plan path (or topic name to auto-resolve from `.claude/plans/`)

**Process:**
1. Reads plan document (if master plan with sub-plans, implements current phase only)
2. Builds dependency graph from plan tasks
3. Delegates to agents:
   - `devcore:junior-engineer` for bounded, well-specified tasks
   - `devcore:programmer` for pattern analysis or multi-file changes
4. Launches tasks respecting dependencies:
   - All no-dependency tasks launch immediately (parallel batch)
   - As agents complete, newly unblocked tasks launch immediately
   - Continues until phase complete
5. Monitors progress, surfaces blockers

**Agent prompts include:**
- Specific task from plan
- Context document paths
- Constraints/patterns to follow
- Success criteria

**Output:** Implemented code

**Notes:**
- Agents do NOT run tests during execution (other agents may be running)
- Large plans run one phase at a time (user must invoke `/rpi/implement` per phase)
- User review expected between phases

## File Structure Created

```
.claude/
├── specs/
│   └── {topic}.spec.md              # Behavioral specification (phase 1)
├── context/                          # Optional, large features only
│   ├── {topic}-{domain1}.context.md
│   └── {topic}-{domain2}.context.md
└── plans/
    ├── {topic}.plan.md               # Master plan (phase 2)
    ├── {topic}-{phase1}.plan.md      # Sub-plans (large features)
    └── {topic}-{phase2}.plan.md
```

## Phase Connections

**arch → plan:**
- Plan reads spec from `.claude/specs/{topic}.spec.md`
- Spec's "Related files" provides context for small features
- Context documents in `.claude/context/` used for large features

**plan → implement:**
- Implement reads plan from `.claude/plans/{topic}.plan.md`
- Plan's task breakdown defines dependency graph for agent orchestration
- Context documents passed to agents as needed
- Sub-plans (if any) linked from master plan, processed one phase at a time
