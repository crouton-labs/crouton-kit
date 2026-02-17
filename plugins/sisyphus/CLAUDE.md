# Sisyphus

Persistent orchestration daemon for Claude Code. Spawns and cycles through Claude instances — an orchestrator that decides what to do, phase agents that do the work — with the user watching and steering the whole time.

See `DESIGN-flexible-orchestrator.md` for architecture.

## Philosophy

**Trust agents.** They'll get better and better. Build for what they're becoming, not just what they are today. Don't over-constrain, don't micromanage, don't add guardrails where the model already does the right thing.

**Give them tools, not workflows.** Agents don't need rigid harnesses or DAGs telling them what step comes next. They need good tools (`workflow submit`, artifact read/write, state inspection) and good context (the state file, the spec, the plan). The agent decides what to do — the system just makes it possible.

**Observability is necessary.** Every phase runs in the foreground. The user sees every tool call, every decision, every mistake. No headless background agents making invisible choices. You must be able to watch and interact with the live claude session.

**Let the agent close the loop.** The orchestrator reads state, picks a phase, evaluates the result, and decides what's next. Humans yield control and take it back at natural boundaries — they don't babysit each step. The system runs until it's done or until it needs a human decision.
