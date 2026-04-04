# Multi-Agent Orchestration Reference

Implementation patterns for multi-agent systems. This supplements [SKILL.md](SKILL.md).

---

## Orchestrator-Worker: TypeScript Pattern

```typescript
// Orchestrator spawns workers with self-contained instructions.
// Workers write to filesystem; orchestrator reads on next cycle.

interface AgentTask {
  id: string;
  instruction: string;
  outputPath: string;  // Where the agent writes its artifact
}

async function orchestrate(tasks: AgentTask[]): Promise<void> {
  // Spawn in parallel — only works if tasks are independent
  await Promise.all(tasks.map(task => spawnAgent(task)));

  // Orchestrator reads artifacts and synthesizes
  const results = await Promise.all(
    tasks.map(task => fs.readFile(task.outputPath, 'utf8'))
  );
  await synthesize(results);
}
```

Self-contained instructions are non-negotiable. Passing references to "the existing code" or "what we discussed earlier" fails because workers have no shared context.

**Bad instruction:**
> "Look at how the existing middleware works and implement something similar for auth."

**Good instruction:**
> "Implement auth middleware per `context/requirements-auth.md` and `context/design-auth.md`. Reference `context/conventions.md` for middleware patterns. Write implementation to `src/middleware/auth.ts`. If you find design gaps or ambiguities, stop and report via `sisyphus report`."

Every agent instruction needs: an objective, output format/location, scope boundaries, and a reporting protocol. [[Anthropic (2024) — Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)]

---

## File-Based Artifact Passing

The most robust communication mechanism. Agents write structured artifacts to a shared filesystem rather than passing everything through conversation history.

**Why not message passing?** Every hand-off through conversation history puts shared memory at risk. When one model's output exceeds another's context window, critical details vanish silently. [[Cemri et al. (2025) — Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)]

**Anthropic's approach**: "Subagent output goes to a filesystem to minimize miscommunication, and specialized agents can create outputs that persist independently." [[Anthropic (2025) — Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)]

```
$SESSION_DIR/context/
  requirements-auth.md      # written by requirements agent
  design-auth.md            # written by design agent (reads requirements)
  plan-backend.md           # written by planner (reads design)
  explore-auth-patterns.md  # written by explore agent
```

Each agent reads only the files relevant to its task. Context is selective by design — no context window pollution. Artifacts persist across agent lifecycles and can be referenced in future cycles.

---

## Stateless Orchestrator: Cycle Pattern

The orchestrator is killed after yielding and respawned fresh each cycle. It has no memory beyond what's in its prompt. State persists via files.

```typescript
// Orchestrator reads current state on each spawn
interface OrchestratorContext {
  roadmap: string;        // Current stage, exit criteria, next steps
  agentReports: Report[]; // What agents found/completed
  cycleHistory: Cycle[];  // What happened in prior cycles
  contextFiles: string[]; // Artifacts from context/ directory
}

// After spawning agents, orchestrator calls yield — it's killed here.
// Daemon polls for agent completion, then respawns orchestrator.
// New orchestrator reads fresh state. No stale context from prior cycles.
```

This pattern prevents context exhaustion on long sessions. An orchestrator managing a 20-cycle session never accumulates 20 cycles of conversation history — it always starts with a clean window and the latest state. Proven in Sisyphus, Anthropic's research system, and similar architectures.

**Orchestrator prompts need decision heuristics** — concrete triggers, not instructions to "use judgment":

```markdown
# Decision Heuristics
- "Am I guessing about something?" → Spawn a research agent first.
- "Can one agent handle this?" → If no, decompose further before spawning.
- "Have 2+ stages completed without critique?" → Stop implementing. Add a review gate.
- "Is this agent instruction self-contained?" → If no, rewrite it before spawning.
```

---

## Hierarchical Delegation Pattern

For large features (15+ files, 3+ subsystems), use sub-orchestrators that manage their own teams:

```
orchestrator
  └── plan-lead (opus)
        ├── sub-planner: backend   (sonnet)
        ├── sub-planner: frontend  (sonnet)
        └── sub-planner: data      (sonnet)
        [plan-lead synthesizes → validates with reviewers]
        ├── review: code-smells     (sonnet)
        ├── review: security        (opus)
        └── review: requirements-coverage (sonnet)
```

**Key rule**: Sub-agents are invisible to the parent orchestrator. The coordinator agent is the abstraction boundary — it can spawn sub-agents via the Agent tool, but the orchestrator cannot reach past the coordinator to manage them directly. This prevents micromanagement and keeps scope boundaries clean.

---

## Pipeline with Critic Loops

Linear pipelines without feedback are "fundamentally vulnerable" — a corrupted output propagates downstream unchecked, compounding at each stage. [[MAS-FIRE (2026) — Fault Injection](https://arxiv.org/html/2602.19843)]

A critique-refinement loop after key stages neutralizes over 40% of cascading faults that cause catastrophic collapse in linear workflows. [[MAS-FIRE (2026)](https://arxiv.org/html/2602.19843)]

**Pattern: add a gate after each major stage**

```
explore → requirements → [REVIEW GATE] → design → [REVIEW GATE] → plan → implement → [REVIEW GATE] → validate
```

The review gate doesn't have to be expensive — it can be a focused critic agent checking only for the failure modes that the previous stage is prone to. A requirements review checks completeness and EARS compliance. A design review checks architectural soundness and feasibility against requirements.

```typescript
// Conditional edge: retry or proceed based on critique
graph.add_conditional_edges(
  "reviewer",
  (state: AgentState) => state.reviewNotes.includes("REJECT") ? "revise" : "proceed",
  { revise: "planner", proceed: "implementer" }
);
```

---

## Two-Layer Review: Validate Before Acting

The Sisyphus review pattern filters noise before findings reach implementers:

```
Phase 1: Parallel specialized reviewers
  ├── reuse-reviewer (sonnet)    — duplicate functionality
  ├── quality-reviewer (sonnet)  — code quality
  ├── efficiency-reviewer (sonnet) — performance
  └── security-reviewer (opus)   — vulnerabilities

Phase 2: Validation subagents (read-only, independent)
  ├── validator-1 (opus)   — bugs and security findings
  └── validator-2 (sonnet) — everything else

Phase 3: Dismissal audit
  └── audit (sonnet) — samples dismissed findings for false negatives
```

Findings that don't survive validation get dropped. This two-layer approach filters noise before anything reaches an implementer. Review agents are **read-only** — strict separation between finding and fixing.

---

## WARP: Write-As-You-Research

For complex research tasks, a living draft evolves with each researcher round rather than synthesizing at the end:

```
1. Decompose question → 2-8 sub-questions based on scope
2. Spawn researchers in parallel per sub-question
3. After each batch: update living draft at context/research-{topic}.md
4. Spawn critic: review draft for gaps and contradictions
5. Critic gaps → push to front of question queue
6. Repeat until critic finds no gaps
7. Final synthesis: single-pass rewrite of living draft
```

The living draft acts as persistent memory across researcher batches. Each researcher writes to a separate file; the orchestrator/lead agent updates the draft. This avoids requiring any single agent to hold the full research context.

---

## Agent Communication: Mechanism Tradeoffs

| Mechanism | Robustness | Parallelism | Use for |
|---|---|---|---|
| File-based artifacts | High — persists across lifecycles | Full — agents write concurrently | Primary communication between agents |
| Message queue | Medium — async, one-directional | Full | Agents flagging problems to orchestrator |
| Shared state (LangGraph reducers) | High with mutex | Concurrent with locks | Deterministic execution graphs [[LangChain](https://www.langchain.com/langgraph)] |
| Conversation handoff (Swarm) | Medium | None — one agent at a time | Customer service routing [[OpenAI](https://github.com/openai/swarm)] |
| GroupChat (AutoGen) | Low — context pollution on long runs | Simulated via speaker selection | Debate/deliberation patterns [[Microsoft](https://arxiv.org/abs/2308.08155)] |

Conversation-based communication (AutoGen GroupChat) creates coupling — all agents see all messages, leading to context pollution on long conversations. File-based artifacts naturally achieve selective context: agents read only what's relevant to their task.

---

## Token Budget: What Actually Drives Cost

Multi-agent systems cost ~15x more in tokens than single-agent chat. Token usage explains 80% of performance variance. [[Anthropic (2025) — Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)]

The biggest token consumer is usually tool outputs, not prompts. Shopify found tool outputs consume "100x more tokens than user messages." [[ZenML (2025) — 1,200 Production Deployments](https://www.zenml.io/blog/what-1200-production-deployments-reveal-about-llmops-in-2025)]

**Savings levers in priority order:**

1. **Selective context** — agents read only files relevant to their task, not the full context directory
2. **Prune tool outputs** — truncate large file reads, summarize search results before passing to next agent
3. **Stateless orchestrator** — orchestrator gets a compressed state summary each cycle, not full history
4. **Model matching** — workers on well-scoped tasks don't need Opus; Sonnet or Haiku suffice
5. **Parallel tool calls** — reduces wall-clock time by up to 90% without reducing token cost, but saves the human's time

**Context beyond 200K tokens**: Use external memory. Agent summarizes completed work phases; the summary replaces the full history in the next cycle. [[Anthropic (2024) — Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)] For comprehensive context strategies, see [context-management](../context-management/SKILL.md).

---

## Failure Mode Taxonomy (MASFT)

From analysis of 1,600+ multi-agent traces, failures cluster in three categories. **37% are inter-agent coordination failures** — not individual LLM limitations. [[Cemri, Pan, Yang et al. (2025) — Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)]

**FC2: Inter-Agent Misalignment (37% of failures)**
- Task derailment — agents overstep scope
- Information withholding — agents don't surface relevant findings
- Ignored input — agents don't incorporate upstream output
- Conversation reset — context lost at handoff

Prompt improvements alone yield only +14% gains against these failures. They require structural solutions — explicit scope boundaries, file-based handoffs (no context loss), and validation gates before agents act on upstream work.

**FC1: Specification Failures**
- Disobeying role specification — agents overstep their mandate
- Step repetition — unnecessary reiteration consuming context
- Unaware of termination conditions — agents don't know when they're done

**FC3: Verification Failures**
- Premature termination — stopping before verifying correctness
- Incomplete verification — surface-level checks only

The "bail and report" pattern addresses FC1 directly: when an agent encounters unexpected scope, complexity, or ambiguity, it stops and reports rather than improvising. This moves the decision back to the orchestrator, which has the context to make it.

---

## Good vs Bad Task Decomposition

**Bad decomposition — shared reasoning state:**
```
agent-001: Design the authentication system
agent-002: Implement the authentication system
```
These can't run in parallel — the implementer needs the design to exist first. And if they're sequential, there's no parallelism benefit; the coordination overhead is pure cost.

**Good decomposition — independent work streams:**
```
agent-001: Implement auth middleware (reads context/design-auth.md)
agent-002: Implement session store  (reads context/design-auth.md)
agent-003: Review auth design       (reads context/design-auth.md, writes findings)
```
Three agents reading the same design artifact and working on independent concerns. Review runs in parallel with implementation — parallel quality, not sequential overhead.

**The independence test**: Can agent B start before agent A produces output? If yes, they're parallelizable. If agent B needs agent A's output to begin, serialize them and add a review gate between.

---

## Operational Concerns

**Monitoring**: Track per-agent token usage, wall-clock time, and success/failure rates. Production failure rates run 41-86.7% depending on task complexity. Budget for retries. [[Cemri et al. (2025)](https://arxiv.org/abs/2503.13657)]

**Debugging**: Preserve agent prompts, tool calls, and artifacts for post-mortem. When a cycle goes wrong, the rendered agent prompts are the first thing to check — most failures trace to missing context or vague scope in the instruction.

**Rollback**: Cycle-boundary snapshots allow reverting to known-good state. If cycle 12 produces bad output, you can roll back to cycle 11's artifacts and respawn with revised agent instructions.

**Graceful degradation**: Set circuit breakers on token cost and turn count. Define human handoff protocols before you need them — not during an incident. [[ZenML (2025)](https://www.zenml.io/blog/what-1200-production-deployments-reveal-about-llmops-in-2025)]

**State concurrency**: Use a session-level mutex on shared state writes. Multiple agents writing to the same JSON file without locking causes read-modify-write races that corrupt state silently.
