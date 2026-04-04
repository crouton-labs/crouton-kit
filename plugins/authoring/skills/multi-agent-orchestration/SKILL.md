---
name: multi-agent-orchestration
description: Design and implement multi-agent LLM systems. Covers orchestrator patterns, parallel agent coordination, pipeline architecture, hierarchical delegation, agent communication, and failure handling. Use when building multi-agent workflows, coordinating parallel agents, designing orchestrators, splitting tasks across agents, or debugging multi-agent failures.
---

# Multi-Agent Orchestration

Multi-agent systems are not an upgrade from single-agent. They're a different architecture with a different cost structure, failure profile, and operating envelope. The decision to use them should be deliberate, not aspirational.

The research is unambiguous: multi-agent systems show **+81% improvement on parallelizable tasks and -70% degradation on sequential tasks** — the same architecture, opposite outcomes depending on decomposition. [[Google Research (2025)](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)]

For implementation patterns and code, see [reference.md](reference.md).

## When Multi-Agent Helps

Use multi-agent when the task has genuine parallelism — independent subtasks that don't share reasoning state:

- **Parallel research**: Multiple domains investigated simultaneously, results synthesized
- **Large codebases**: Independent modules, files, or subsystems that don't overlap
- **Parallel quality**: Review alongside implementation (different concerns, same codebase)
- **Role specialization**: Tasks requiring different expertise — security review vs. code quality vs. performance profiling

The economic case requires high-value tasks. Multi-agent token cost runs ~15x higher than single-agent chat. [[Anthropic (2025) — How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)]

## When Multi-Agent Hurts

Don't use multi-agent for:

- **Sequential tasks with shared reasoning state** — planning, feature design, anything where step N depends on step N-1's reasoning
- **Simple, well-scoped tasks** — a single agent doesn't need coordination overhead
- **High file overlap** — agents touching the same files will conflict
- **Tasks where single-agent already hits ~45%+ accuracy** — above this threshold, adding agents yields diminishing or negative returns [[Google Research (2025)](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)]

Independent multi-agent systems without orchestrator validation **amplify errors 17.2x**. Centralized systems with orchestrators contain this to 4.4x. [[Google Research (2025)](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)]

## Architecture Patterns

### Orchestrator-Worker (Fan-Out)

The dominant production pattern. A central orchestrator decomposes tasks dynamically, delegates to workers, synthesizes results. Workers get self-contained instructions with all necessary context — they don't share state or talk to each other.

**Use when**: Complex tasks where subtasks can't be predicted in advance. Multi-file codebase changes, research gathering from multiple sources, parallel implementation of independent features.

**Key constraint**: Orchestrator owns the quality bar. Workers don't decide if they're done — the orchestrator does.

**Production evidence**: Anthropic's internal research system uses Opus as orchestrator with Sonnet subagents, outperforming single-agent Opus 4 by 90.2%. Typical spawn count: 3-5 subagents. [[Anthropic (2025)](https://www.anthropic.com/engineering/multi-agent-research-system)]

```
Orchestrator
  ├── agent-001: implement auth middleware
  ├── agent-002: implement session store
  └── agent-003: review auth design (parallel quality)
```

### Pipeline (Sequential Chain)

Agents process work in stages. Output of one feeds the next. MetaGPT formalizes this as software SOPs: Product Manager → Architect → Engineer → QA. [[Hong et al. (2023) — MetaGPT](https://arxiv.org/abs/2308.00352)]

**Use when**: Work has natural sequential dependencies — plan → implement → review → validate.

**Critical vulnerability**: Linear pipelines have no error recovery. A corrupted output from one stage propagates downstream unchecked, compounding at each step. A single planning error halts the entire workflow. [[MAS-FIRE (2026)](https://arxiv.org/html/2602.19843)]

**Mitigation**: Add critic loops. A critique-refinement cycle after key stages neutralizes cascading faults. Never run 2+ sequential stages without a review gate.

### Debate / Critic

Multiple agents review each other's work. Fresh agents critique without confirmation bias — researchers don't review their own findings. Results are aggregated by majority vote or orchestrator synthesis.

**Use when**: Correctness matters more than speed. Math reasoning, security review, plan validation.

**Sisyphus review pattern** (two-layer filtering):
```
review coordinator (opus)
  ├── reuse reviewer    (sonnet)
  ├── quality reviewer  (sonnet)
  ├── efficiency reviewer (sonnet)
  └── security reviewer (opus) [conditional]
After review:
  ├── validation subagent 1  (opus, for bugs/security findings)
  ├── validation subagent 2  (sonnet, everything else)
  └── dismissal audit        (sonnet, samples dismissed findings)
```
Findings that don't survive validation get dropped before they reach the implementer. For detailed judge methodology, see [eval-and-quality-gates](../eval-and-quality-gates/SKILL.md).

### Hierarchical Delegation

Sub-orchestrators manage their own teams. The top-level orchestrator spawns coordinators; coordinators spawn workers. Each level manages its own scope.

**Use when**: Large features spanning 15+ files or 3+ subsystems. When a single orchestrator would need too much context to manage everything directly.

**Key design**: Sub-agents are invisible to the parent orchestrator. The coordinator is the abstraction boundary. This prevents the orchestrator from micromanaging.

### Stateless Orchestrator Cycles

For long-running sessions, kill the orchestrator after each cycle and respawn it fresh with updated state. The orchestrator has no memory beyond what's in its prompt. State persists via files, not agent memory.

**Why this matters**: Prevents context exhaustion on sessions that run for hours. Each cycle the orchestrator gets a clean window with the latest state — no stale context from 50 cycles ago.

**Proven in production**: Sisyphus, Anthropic's research system, and similar architectures all use this pattern.

## The Coordination Tax

Every handoff between agents is a risk point. The most common failure category in production multi-agent systems — **37% of all failures** — is inter-agent coordination breakdown, not individual LLM limitations. [[Cemri, Pan, Yang et al. (2025) — Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)]

The coordination tax shows up as:
- **Context pollution**: An agent's output exceeds another's context window and critical details vanish
- **Task derailment**: Agents overstep scope and start doing adjacent work
- **Cascading errors**: One bad output propagates undetected through subsequent stages
- **Tool overload**: Performance degrades proportionally with tool count; 16+ tools per agent creates disproportionate overhead

## Common Failure Modes

**1. Multi-agent for sequential tasks** — If the subtasks can't run independently, you pay coordination cost with no parallelism benefit. The metric to check: can subtask B start before subtask A finishes? If no, keep it single-agent.

**2. Vague agent instructions** — "Look at the existing auth middleware" fails. "Implement auth middleware per `context/requirements-auth.md` and `context/design-auth.md`. Reference `context/conventions.md` for middleware patterns." works. Each agent instruction must be self-contained.

**3. Skipping review cycles** — 2+ stages completing without critique is the trigger for stopping and catching up. Unreviewed work compounds. A conservative implementation gets caught by reviewers; an unreviewed implementation ships broken.

**4. Spawning too many agents** — Early versions of Anthropic's research system spawned 50+ subagents for simple queries. Simple fact-finding: 1 agent. Direct comparisons: 2-4. Complex research: 10+. [[Anthropic (2025)](https://www.anthropic.com/engineering/multi-agent-research-system)]

**5. Framework over-engineering** — "The most successful implementations weren't using complex frameworks or specialized libraries." Simple, composable patterns beat abstraction layers. Frameworks obscure prompts and responses, complicating debugging. [[Anthropic (2024) — Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)]

**6. Ambition in worker prompts** — Workers' primary failure mode is scope creep, not timidity. Ambition belongs at the orchestrator. Workers should have narrow scope and conservative behavior. The "bail and report" pattern — stop, flag unexpected complexity, let the orchestrator decide — is load-bearing.

## Prompt Asymmetry: Orchestrators vs Workers

Orchestrators and workers have opposite prompt requirements:

| Aspect | Orchestrator | Worker |
|--------|-------------|--------|
| Scope | Broad — sees the full session | Narrow — one specific task |
| Ambition | High — sets the quality ceiling | Low — disciplined execution |
| Primary failure | Too conservative | Scope creep |
| Context | Full session state | Task instruction + relevant files only |
| Lifecycle | Killed and respawned each cycle | Runs to completion or failure |

Orchestrator prompts need decision heuristics — concrete triggers for when to spawn research agents, when to add review gates, when to stop and reassess. Worker prompts need scope boundaries and a reporting protocol. See [reference.md](reference.md) for annotated examples of both.

## Model Selection

- **Orchestrator**: Best available model (Opus/o3). Sets the quality ceiling.
- **Workers**: Cheaper models (Sonnet/Haiku) for well-scoped tasks.
- **Reviewers**: Match model to severity — security and correctness get expensive models; style gets cheap ones.

Counterintuitively, larger models sometimes decrease accuracy without architectural constraints. Smaller, fine-tuned models with proper harnesses can outperform larger general-purpose models. [[ZenML (2025) — 1,200 Production Deployments](https://www.zenml.io/blog/what-1200-production-deployments-reveal-about-llmops-in-2025)]

## Decision Framework

| Task characteristic | Architecture | Why |
|---|---|---|
| Parallelizable subtasks | Orchestrator-worker | +81% on parallelizable tasks |
| Sequential with feedback | Pipeline + critic loops | Catches 40% of cascading faults |
| Correctness-critical | Debate/voting | Multiple perspectives, majority vote |
| Large scope (15+ files) | Hierarchical delegation | Sub-orchestrators manage complexity |
| Simple/well-scoped | Single agent | Avoids 17.2x error amplification |
| Long-running (hours) | Stateless orchestrator cycles | Prevents context exhaustion |
