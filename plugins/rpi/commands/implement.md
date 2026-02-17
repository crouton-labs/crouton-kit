---
description: After /rpi/plan - execute with agent team
argument-hint: <plan-path or description>
---
# Implement Plan

**Input:** $ARGUMENTS

Parse the input above. It may be:
- A direct path to a plan file
- A topic name (look in `.claude/plans/{topic}.plan.md`)
- A description with guidance on what to prioritize, skip, or handle differently

Extract the plan reference and any implementation guidance.

## Objective

Execute the implementation plan using an agent team. Maximize parallelism while respecting dependencies. Teammates coordinate directly with each other.

## Process

### 1. Read the Plan

- Load the plan document provided as input
- If the plan references sub-plans (large multi-phase plans), **implement only the current phase**
- Extract the task list, dependency graph, and integration points

### 2. Assess Scale & Teammate Count

Count the plan's independent task groups (tasks with no mutual dependencies that can run in parallel).

| Independent groups | Files touched | Strategy |
|-------------------|---------------|----------|
| 1-3               | 1-5           | Task subagents directly — no team overhead |
| 2-4               | 5-15          | Agent team with **2 teammates** |
| 4-8               | 10-30         | Agent team with **3 teammates** |
| 8+                | 25+           | Agent team with **4 teammates** (cap) |

Use the higher of the two columns to pick the tier. Never spawn more teammates than independent task groups.

**Scale-up signals** (bump one tier): shared interfaces requiring tight coordination, multiple languages/frameworks, or changes spanning both infrastructure and application layers.

For small plans, delegate with Task tool using `devcore:teammate` and skip to Phase Completion.

### 3. Create Team and Task List

Create an agent team via `TeamCreate`. Then populate the shared task list:

- `TaskCreate` for each task from the plan
- Set `addBlockedBy` to express dependencies between tasks
- Include in each task description:
  - The specific work from the plan
  - Paths to relevant context documents (`.claude/context/`, spec, plan)
  - File ownership boundaries (which files this task owns)
  - Integration points with other tasks (shared types, interfaces, APIs)
  - Constraint: do not run tests or typechecks—other teammates may be mid-edit

### 4. Spawn Teammates

Spawn teammates via the Task tool with `team_name` set:

**Delegation strategy:**
- `devcore:teammate` (opus) — all teammates. They delegate internally to sonnet/haiku subagents for subtasks.

**Teammate prompts should include:**
- Their role and which tasks to claim from the shared task list
- The plan path and relevant context paths
- Instruction to use `TaskList` → `TaskUpdate` (claim) → implement → `TaskUpdate` (complete) → `TaskList` (next) loop
- Instruction to message teammates directly when finishing work on a shared interface or discovering something that affects another task
- Instruction to message you (the lead) if blocked

**Teammate count:** Use the count from Assess Scale above.

### 5. Coordinate

Stay in a coordination role—do not implement tasks yourself.

- Respond to teammate messages (blockers, questions, integration issues)
- When teammates report blockers, assess: resolve yourself, adjust the plan, or escalate to user
- If a teammate finishes all their tasks and others remain unclaimed, direct them to pick up more
- Surface progress to the user periodically

### 6. Shutdown and Phase Completion

When all tasks in the shared task list are complete:

1. Send `shutdown_request` to each teammate
2. Wait for shutdown confirmations
3. Clean up team with `TeamDelete`

State: "Phase {N} implementation complete. Ready for code review or continue to next phase."

**Do not** automatically proceed to the next phase—allow the user to review first.

## Notes

- For large plans, expect to run `/rpi:implement` multiple times (once per phase). Don't run it yourself—just do the first sub-plan, and tell the user to clear chat and run `/rpi:implement` again.
- Keep the user informed of progress, especially for long-running implementations
- The priority is excellent code. Completion of all work should never come at the cost of cut corners.
- **File conflicts:** Structure task ownership so teammates don't edit the same files. If unavoidable, sequence those tasks with `addBlockedBy`.