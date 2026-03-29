# rpi

Six-phase feature workflow with collaborative requirements, technical design, iterative planning, and parallel execution.

## Commands

- `/rpi:problem <topic>` - Explore and frame the problem space (optional)
- `/rpi:requirements <topic>` - Define requirements through investigation and conversation
- `/rpi:design <topic>` - Create technical design from requirements
- `/rpi:plan <design-path>` - Create implementation plan from design
- `/rpi:implement <plan-path>` - Execute plan with parallel agents
- `/rpi:validate <topic>` - Run validation for a topic or phase

## Phase 1a: Requirements (`/rpi:requirements`)

**Input:** Topic name or feature description

**Process:**
1. Investigates codebase for patterns, constraints, integration points
2. Proposes concrete requirements with reasoning
3. Iterates through conversation to resolve ambiguity
4. Saves requirements in EARS format (non-technical, behavioral only)

**Output:** `.claude/specs/{topic}/requirements.md`

**Requirements format:**
- **Summary** - One paragraph feature description
- **Functional Requirements** - EARS-format behavioral statements (no technical decisions)
- **Non-functional Requirements** - Performance, security, reliability constraints
- **Scope** - What's in and out of scope
- **Open Questions** - Unresolved design choices deferred to design phase

**Optional problem framing** (ambiguous domains only):
- Run `/rpi:problem` first to explore the problem space
- Output: `.claude/specs/{topic}/problem.md`

## Phase 1b: Design (`/rpi:design`)

**Input:** Topic name or requirements path

**Process:**
1. Reads requirements + any context documents from `.claude/context/`
2. Investigates codebase for existing patterns and integration points
3. Proposes technical architecture with trade-offs
4. Iterates through conversation on architectural decisions
5. Saves design document

**Output:** `.claude/specs/{topic}/design.md`

**Design format:**
- **Overview** - How requirements map to technical approach
- **Architecture** - Component boundaries, contracts, data flow
- **Key Abstractions** - Core types, interfaces, state machines
- **Integration Points** - How new code connects to existing systems
- **Constraints** - Technical limitations and boundaries
- **Related Files** - Paths to relevant existing code

**Optional research phase** (large features only):
- Spawns `Explore` agents to investigate domains in parallel
- Creates context documents: `.claude/context/{topic}-{domain}.context.md`
- Each context doc covers patterns, utilities, integration points for one domain

## Phase 2: Planning (`/rpi:plan`)

**Input:** Design path (or topic name to auto-resolve from `.claude/specs/{topic}/`)

**Process:**
1. Reads design + any context documents from `.claude/context/`
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

## Phase 3: Implementation (`/rpi:implement`)

**Input:** Plan path (or topic name to auto-resolve from `.claude/plans/`)

**Process:**
1. Reads plan document (if master plan with sub-plans, implements current phase only)
2. Builds dependency graph from plan tasks
3. Delegates to agents:
   - haiku subagents for bounded, well-specified tasks
   - `devcore:programmer` for pattern analysis or multi-file changes
4. Launches tasks respecting dependencies:
   - All no-dependency tasks launch immediately (parallel batch)
   - As agents complete, newly unblocked tasks launch immediately
   - Continues until phase complete
5. Monitors progress, surfaces blockers

**Output:** Implemented code

**Notes:**
- Agents do NOT run tests during execution (other agents may be running)
- Large plans run one phase at a time (user must invoke `/rpi:implement` per phase)
- User review expected between phases

## Phase 4: Validation (`/rpi:validate`)

**Input:** Topic name and optional phase number

**Process:**
1. Reads validation plan from `.claude/plans/{topic}.validation.plan.md`
2. Runs proof scripts for the specified phase (or all phases if none specified)
3. Reports pass/fail with evidence for each exit criterion
4. Failures surface with reproduction steps

**Output:** Validation report with pass/fail per criterion

## File Structure Created

```
.claude/
├── specs/{topic}/
│   ├── problem.md                    # Problem framing (optional, phase 0)
│   ├── requirements.md               # EARS requirements (phase 1a)
│   └── design.md                     # Technical design (phase 1b)
├── context/                          # Optional, large features only
│   ├── {topic}-{domain1}.context.md
│   └── {topic}-{domain2}.context.md
└── plans/
    ├── {topic}.plan.md               # Master plan (phase 2)
    ├── {topic}.tests.plan.md         # Test plan
    ├── {topic}.validation.plan.md    # Validation plan with exit criteria
    ├── {topic}-{phase1}.plan.md      # Sub-plans (large features)
    └── {topic}-{phase2}.plan.md
```

## Phase Connections

**problem → requirements:**
- Requirements-writer reads problem framing from `.claude/specs/{topic}/problem.md`
- Problem doc informs scope decisions and known constraints

**requirements → design:**
- Design-lead reads requirements from `.claude/specs/{topic}/requirements.md`
- Requirements define what the feature must do; design determines how

**design → plan:**
- Plan reads design from `.claude/specs/{topic}/design.md`
- Design's architecture section defines component breakdown for planning
- Context documents in `.claude/context/` used for large features

**plan → implement:**
- Implement reads plan from `.claude/plans/{topic}.plan.md`
- Plan's task breakdown defines dependency graph for agent orchestration
- Context documents passed to agents as needed
- Sub-plans (if any) linked from master plan, processed one phase at a time

**implement → validate:**
- Validate reads plan from `.claude/plans/{topic}.validation.plan.md`
- Runs per-phase exit criteria as proof scripts
- Pass required before advancing to next phase or final testing
