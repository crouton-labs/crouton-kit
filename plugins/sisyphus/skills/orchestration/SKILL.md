---
name: orchestration
description: >
  Task breakdown patterns for sisyphus orchestrator sessions. How to structure tasks, sequence agents, and manage cycles for debugging, feature builds, refactors, and other common workflows. Use when planning orchestration strategy or structuring a multi-agent session.
---

# Orchestration Patterns

How to structure sisyphus sessions for common task types. This skill helps the orchestrator break work into tasks, choose agent types, sequence cycles, and handle failures.

## Core Principles

1. **Tasks are the orchestrator's memory.** State.json persists across cycles — tasks and agent reports are all you have. Make task descriptions specific enough that a fresh orchestrator can pick up where you left off.

2. **Agents are disposable.** Each agent gets one focused instruction. If it fails or the scope changes, spawn a new one — don't try to redirect a running agent.

3. **Parallelize when independent.** If two tasks don't share files or depend on each other's output, spawn agents for both in the same cycle.

4. **Validate at boundaries.** After each logical phase completes, spawn a validation agent before moving on. Catching problems early prevents cascading rework.

5. **Reports are handoffs.** Agent reports should contain everything the next cycle's orchestrator needs — what was done, what was found, what's unresolved, where artifacts were saved.

## Agent Types Quick Reference

| Agent | Model | Use For |
|-------|-------|---------|
| `sisyphus:general` | sonnet | Ad-hoc tasks, summarization, simple questions |
| `sisyphus:debug` | opus | Bug diagnosis and root cause analysis |
| `sisyphus:spec-draft` | opus | Feature investigation and spec drafting |
| `sisyphus:plan` | opus | Implementation planning from spec |
| `sisyphus:review-plan` | opus | Validate plan covers spec completely |
| `sisyphus:test-spec` | opus | Define behavioral properties to verify |
| `sisyphus:implement` | sonnet | Execute plan phases, write code |
| `sisyphus:validate` | opus | Verify implementation matches plan |
| `sisyphus:review` | opus | Code review with parallel concern subagents |
| `sisyphus:tactician` | opus | Track plan progress, dispatch next task |
| `sisyphus:triage` | sonnet | Classify tickets by type/size |

For task breakdown patterns per workflow type, see [task-patterns.md](task-patterns.md).
For end-to-end workflow examples, see [workflow-examples.md](workflow-examples.md).
