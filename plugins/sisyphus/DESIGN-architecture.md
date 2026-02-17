# Sisyphus Architecture

## What It Is

A tmux-integrated orchestration daemon for Claude Code. You talk to your normal Claude session. When a task is big enough, Claude kicks off a sisyphus workflow — a disposable orchestrator agent manages the work, spawning agents you can watch and steer in tmux panes. The orchestrator dies after dispatching, gets respawned fresh when all agents finish.

## The Three Layers

```
tmux window (sisyphus session)
  ├── pane 0: your Claude session
  │     You stay here. Free to keep working, start more workflows, or just watch.
  │     Kicks off sisyphus when needed: "sisyphus start 'build auth system'"
  │
  ├── pane 1: orchestrator agent (dedicated pane)
  │     Fresh Claude each cycle. Reads state, updates tasks, spawns agents, dies.
  │     Respawned by daemon when all spawned agents complete.
  │     Interactive — you can tab over and steer it.
  │
  ├── pane 2: agent (created/destroyed per task)
  │     Uses Claude Code's native --agent-type flag.
  │     Calls `sisyphus submit` when done → pane closes.
  │
  └── pane 3+: additional agents (parallel work)
```

## The Daemon

Long-lived process that:
- Manages tmux windows (one window per session, within current tmux session)
- Maintains state.json per session (sole writer — agents interact via CLI only)
- Listens for CLI commands from agents and the user
- Spawns Claude processes into tmux panes with prompts, env vars, and unique colors
- Tracks which agents are running per session
- Respawns orchestrator when all active agents for a session have completed
- Detects when user kills a pane and records it in state

Multiple sessions can run in the same directory. Isolation via `SISYPHUS_SESSION_ID` env var set in every pane.

## Lifecycle

```
User in pane 0:
  "build a new auth system with OAuth support"
  → Claude decides this needs orchestration
  → calls: sisyphus start "build auth system with OAuth support"

Daemon:
  → creates session {id}
  → creates state.json with original task
  → creates new tmux window
  → opens pane 1 in that window, spawns fresh orchestrator Claude

Orchestrator in pane 1 (cycle 1):
  → state.json inlined in prompt — just the original task, no history yet
  → calls: sisyphus tasks add "Write spec for OAuth auth system"
  → calls: sisyphus tasks add "Plan implementation architecture"
  → calls: sisyphus tasks add "Implement auth endpoints"
  → calls: sisyphus tasks add "Review implementation"
  → calls: sisyphus tasks add "Validate correctness"
  → decides: "need a spec first"
  → calls: sisyphus spawn --agent-type rpi:spec-writer --name speccer \
      --instruction "clarify OAuth requirements, define endpoints, acceptance criteria"
  → calls: sisyphus yield (daemon kills orchestrator process)

Daemon:
  → records agent spawn in state.json
  → opens pane 2, spawns Claude with:
      claude --agent-type rpi:spec-writer --agent-name speccer --agent-color blue ...
      (with sisyphus system prompt suffix appended)

Spec agent in pane 2:
  → works on spec, user can watch/steer
  → saves spec to wherever the orchestrator's instruction told it to
  → calls: sisyphus submit --report "spec complete. 5 REST endpoints defined. Auth via
      JWT + refresh tokens. Acceptance criteria written for each endpoint. Saved to spec.md."

Daemon:
  → records report in state.json
  → closes pane 2
  → no more active agents → spawns fresh orchestrator in pane 1

Orchestrator in pane 1 (cycle 2):
  → state.json inlined — sees spec complete, submission summary, reads spec.md
  → calls: sisyphus tasks update t1 --status complete
  → decides: "ready to plan, and can start impl of the simple parts in parallel"
  → calls: sisyphus spawn --agent-type rpi:planning-lead --name planner \
      --instruction "design implementation based on spec"
  → calls: sisyphus spawn --agent-type devcore:programmer --name impl-models \
      --instruction "implement user model and migrations"
  → calls: sisyphus yield (daemon kills orchestrator)

Daemon:
  → records both spawns
  → opens panes 2 and 3 (each gets a unique color)
  → waits for BOTH to complete before respawning orchestrator

... (cycles continue) ...

Orchestrator in pane 1 (cycle N):
  → all tasks complete, validation passing
  → calls: sisyphus complete --report "auth system implemented, tests passing"

Daemon:
  → marks session complete
  → cleans up window
```

## The Ralph Wiggum Loop

The orchestrator is disposable. Every cycle:

1. Daemon spawns fresh orchestrator Claude with state.json inlined in prompt
2. Orchestrator updates tasks via `sisyphus tasks`, decides what to do
3. Orchestrator spawns one or more agents via `sisyphus spawn`, then calls `sisyphus yield`
4. Daemon kills orchestrator, waits for all spawned agents to finish (submit or get killed)
5. Daemon respawns fresh orchestrator → goto 1

No context preserved between cycles. State.json is the orchestrator's entire memory. This means:
- No context window bloat
- Orchestrator can't get confused by stale conversation history
- If the orchestrator prompt is good and state.json is rich, decisions are good
- Recovery is trivial: just respawn the orchestrator

## State

The daemon is the sole writer of state.json. Agents interact with state only through the `sisyphus` CLI, which communicates with the daemon.

JSON file per session at `.sisyphus/sessions/{session-id}/state.json`:

```json
{
  "id": "abc-123",
  "task": "build auth system with OAuth support",
  "cwd": "/Users/me/project",
  "status": "active",
  "createdAt": "2026-02-16T10:00:00Z",

  "tasks": [
    {
      "id": "t1",
      "description": "Write spec for OAuth auth system",
      "status": "complete"
    },
    {
      "id": "t2",
      "description": "Plan implementation architecture",
      "status": "in_progress"
    },
    {
      "id": "t3",
      "description": "Implement auth endpoints",
      "status": "pending"
    },
    {
      "id": "t4",
      "description": "Review implementation",
      "status": "pending"
    },
    {
      "id": "t5",
      "description": "Validate correctness",
      "status": "pending"
    }
  ],

  "agents": [
    {
      "id": "agent-001",
      "name": "speccer",
      "agentType": "rpi:spec-writer",
      "claudeSessionId": "c1a2b3c4-...",
      "color": "blue",
      "instruction": "clarify OAuth requirements, define endpoints, acceptance criteria",
      "status": "completed",
      "spawnedAt": "2026-02-16T10:01:00Z",
      "completedAt": "2026-02-16T10:05:00Z",
      "report": "spec complete. 5 REST endpoints defined (register, login, refresh, logout, me). Auth via JWT + refresh tokens with 15min/7day expiry. Acceptance criteria written for each endpoint. Edge cases: rate limiting on login, token revocation on password change. Saved to spec.md.",
      "paneId": "%2"
    },
    {
      "id": "agent-002",
      "name": "planner",
      "agentType": "rpi:planning-lead",
      "color": "green",
      "instruction": "design implementation based on spec",
      "status": "running",
      "spawnedAt": "2026-02-16T10:06:00Z",
      "completedAt": null,
      "report": null,
      "paneId": "%3"
    },
    {
      "id": "agent-003",
      "name": "impl-models",
      "agentType": "devcore:programmer",
      "color": "yellow",
      "instruction": "implement user model and migrations",
      "status": "running",
      "spawnedAt": "2026-02-16T10:06:00Z",
      "completedAt": null,
      "report": null,
      "paneId": "%4"
    }
  ],

  "orchestratorCycles": [
    {
      "cycle": 1,
      "timestamp": "2026-02-16T10:01:00Z",
      "agentsSpawned": ["agent-001"]
    },
    {
      "cycle": 2,
      "timestamp": "2026-02-16T10:06:00Z",
      "agentsSpawned": ["agent-002", "agent-003"]
    }
  ]
}
```

## Agents

Agents are standard Claude Code sessions spawned with `--agent-type`, using Claude Code's native agent resolution. The orchestrator specifies:
- **`--agent-type`**: resolved by Claude Code (project `.claude/agents/`, then `~/.claude/agents/`, then plugins)
- **`--name`**: chosen by the orchestrator, human-readable
- **`--color`**: assigned by the daemon, unique per session for visual differentiation
- **`--id`**: assigned by the daemon

The daemon appends a system prompt suffix to every agent:

```
You are part of a sisyphus orchestration session.
Session ID: {id}
Your task: {instruction from orchestrator}

When you are done with your task and the user is satisfied with the result:
  Run: sisyphus submit --report "what you accomplished, what you found, what's unresolved"

If you hit a wall — the task is harder than expected, requirements are wrong, you need
information you don't have — don't keep grinding. Bail and report what happened:
  Run: sisyphus submit --report "explain what went wrong and why you're stopping"

Your report is your full handoff to the orchestrator. Be honest, be specific.

You can check session status:
  Run: sisyphus status

Work with the user — they can see everything you do and may steer you.
The orchestrator may instruct you to save artifacts (specs, plans) to specific locations.
```

## Orchestrator

The orchestrator is a Claude session spawned with a prompt built from:
1. **Base prompt** from `.sisyphus/orchestrator.md` (project-level, customizable)
2. **State.json contents** inlined so it has full context immediately
3. **Sisyphus CLI docs** so it knows how to spawn agents and manage tasks

The orchestrator's personality/strategy lives in `orchestrator.md`. Different prompts = different workflows, same infrastructure. A project can tune how aggressive the orchestrator is about requiring specs, how it parallelizes work, when it decides to re-plan, etc.

## Nested Sessions

An agent can start a new sisyphus session if the work is complex enough:

```
sisyphus start "refactor the token refresh subsystem"
```

This creates a child session with its own tmux window, orchestrator, agents, and state. The parent session's state records the child. When the child completes, the parent's orchestrator sees it on its next cycle.

## Pane Lifecycle & Failure Handling

| Event | Daemon action |
|-------|--------------|
| Agent calls `sisyphus submit` | Record submission in state, close pane, check if all agents done |
| User closes agent pane | Record "killed by user" in state, check if all agents done |
| Agent process crashes | Record "crashed" in state, check if all agents done |
| All active agents done | Respawn orchestrator in pane 1 with updated state |
| User closes orchestrator pane | Pause session (can resume later) |
| Orchestrator calls `sisyphus complete` | Mark session done, clean up all panes |

When an agent is killed, state records it:

```json
{
  "id": "agent-003",
  "name": "impl-models",
  "agentType": "devcore:programmer",
  "status": "killed",
  "report": null,
  "killedReason": "pane closed by user"
}
```

The next orchestrator cycle sees this and decides how to adapt — retry, skip, ask the user.

## CLI Surface

Every agent in the session has `SISYPHUS_SESSION_ID` and `SISYPHUS_AGENT_ID` in its environment.

| Command | Who uses it | What it does |
|---------|-------------|--------------|
| `sisyphus start "<task>"` | User / agents | Create new session, spawn orchestrator |
| `sisyphus spawn --agent-type <type> --name <name> --instruction "<task>"` | Orchestrator | Spawn agent in new pane |
| `sisyphus submit --report "<report>"` | Agents | Report results and signal done |
| `sisyphus yield` | Orchestrator | Request daemon to kill orchestrator (after spawning agents) |
| `sisyphus complete --report "<report>"` | Orchestrator | Mark session done, clean up |
| `sisyphus status` | Anyone | Print current state |
| `sisyphus tasks add "<description>"` | Orchestrator | Add task to state |
| `sisyphus tasks update <id> --status <status>` | Orchestrator | Update task status |
| `sisyphus tasks list` | Anyone | List tasks |
| `sisyphus list` | User | List active sessions |
| `sisyphus resume <session-id>` | User | Respawn orchestrator for paused/crashed session |

## Agent Initialization

When the daemon spawns a Claude process:

1. **Base prompt** — from agent definition (if custom type) or built-in
2. **Sisyphus suffix** — session context, CLI docs, submit/report instructions
3. **Environment** — `SISYPHUS_SESSION_ID`, `SISYPHUS_AGENT_ID`, working directory
4. **Session ID capture** — a SessionStart hook reports the Claude session ID back to the daemon via socket (same pattern as Klaude), daemon records it in state.json
5. **Orchestrator gets state.json inlined** in its prompt so it has full context immediately

## Configuration

```
~/.sisyphus/
  config.json              # global defaults (model, tmux prefs)

project/.sisyphus/
  config.json              # project overrides
  orchestrator.md          # orchestrator base prompt (customizable per project)
  sessions/
    {session-id}/
      state.json           # daemon-managed, agents interact via CLI
```

## Session Recovery

`sisyphus resume <session-id>` reads state.json and spawns a fresh orchestrator. The orchestrator sees the full history — what agents ran, what submitted, what got killed — and picks up where things left off. No tmux state needed for recovery, just state.json.

## Daemon Communication

CLI talks to daemon via Unix socket at `~/.sisyphus/daemon.sock`. Agent calls `sisyphus submit` → CLI sends message over socket → daemon updates state and acts immediately. No polling, no filesystem latency.

## Color Palette

Orchestrator is always yellow. Agents rotate through a fixed palette: blue, green, magenta, cyan, red, white. Daemon assigns colors on spawn, cycling through the palette. Colors help visually differentiate panes at a glance.

## Daemon Lifecycle

One global daemon, one socket at `~/.sisyphus/daemon.sock`. Always running — managed by launchd, restarts on crash. All CLI commands talk to this single daemon. No "start daemon if not running" logic.

If the daemon restarts (machine reboot, manual kill), it reads all session state.json files on startup. Any agents marked "running" get marked "lost" — the tmux panes are almost certainly gone too. User can `sisyphus resume <id>` to pick back up.
