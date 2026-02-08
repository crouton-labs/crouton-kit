---
name: scripts-and-tooling
description: Guide to creating CLI tools and scripts that augment Claude Code. Use when building bin/ executables, automation scripts, hook handlers, or tooling that abstracts repeated agent workflows.
user-invocable: false
---

# Creating Scripts and Tooling

Scripts abstract away multi-step sequences, complex computation, and ceremony that the agent would otherwise do manually each time. They're deterministic, token-efficient, and reusable across sessions.

## Why Scripts Beat Agent Reasoning

- **Deterministic** — same result every time. No forgotten flags or format drift.
- **Token-efficient** — only the script's *output* enters context. Complex logic costs zero tokens.
- **Fast** — milliseconds vs seconds of LLM reasoning.
- **Composable** — callable from hooks, commands, skills, CI/CD, and plain shell.
- **Persistent** — survives context resets and session boundaries.

## When to Create a Script

- Agent repeats the same 3+ step sequence across sessions
- Logic is purely computational (parsing, transforming, validating)
- Correctness matters more than flexibility (deploy scripts, release workflows)
- The agent regularly constructs complex shell pipelines for the same task
- An existing tool's output needs reformatting for agent consumption

## Where Scripts Live

| Location | Mechanism | Use Case |
|----------|-----------|----------|
| `bin/` on PATH | Agent calls via Bash | General-purpose CLI tools |
| `scripts/` | Agent calls via Bash | Project-specific automation |
| `hooks/` scripts | Called by hooks.json | Lifecycle handlers (guards, formatters, loggers) |
| `skills/*/scripts/` | Bundled with SKILL.md | Deterministic computation a skill needs |
| `.mcp.json` + MCP servers | Claude calls as native tools | API wrappers, database access |

## Design Principles

**Self-documenting** — `--help` is the canonical source of truth, not external docs. Make it comprehensive enough that an agent never needs to look elsewhere. Add a comment block at the top of the script explaining purpose, assumptions, and usage.

**Every output is a prompt** — the agent's next action depends on your script's output. Design both success and failure output to guide the agent forward, not just report status.

**Familiar interfaces** — model your CLI after tools the agent already knows. If it looks like `pytest`, `docker`, or `kubectl`, the agent can infer behavior without reading docs. Reuse conventions: `--dry-run`, `--format json`, `--verbose`.

**Idempotent** — safe to run multiple times. Guard against duplicate operations.

**No interactive input** — agents can't respond to prompts. Use flags/args/env vars instead.

## Output Design

Script output is the primary interface between your tool and the agent. A silent success or cryptic error is a dead end.

**Success output** — confirm what happened, echo IDs/paths the agent needs next, suggest next steps:

```
# bad
OK

# good
Created deployment deploy-a1b2c3d4 (env: staging, 3 services)

Next:
  Check status:  deploy status deploy-a1b2c3d4
  View logs:     deploy logs deploy-a1b2c3d4
  Roll back:     deploy rollback deploy-a1b2c3d4
```

**Error output** — three parts: what went wrong, how to fix it, what to do next:

```
# bad
Error: connection refused

# good
ERROR: Cannot connect to database at localhost:5432 (connection refused)

Fix: Ensure postgres is running:
  brew services start postgresql
  # or: docker start postgres-dev

Then retry: ./migrate --target production
```

**Structured output** — emit JSON when the agent will consume the result programmatically. Raw human-readable text is fine for notification scripts or when the agent just needs to relay information to the user.

## Common Categories

**Git workflow** — commit formatting, branch creation, PR automation, extract-commits, changelog generation.

**Quality checks** — lint wrappers, type-check runners, coverage reporters that produce structured output.

**Environment setup** — dependency installation, tool configuration, env var bootstrapping.

**Code generation** — scaffolding (components, tests, migrations) from templates.

**Data transformation** — log parsing, JSON/CSV processing, token counting, dependency graphing.

**API wrappers** — MCP servers or shell scripts that handle auth, pagination, rate limiting, and return clean data.

**Deployment** — release scripts with dry-run, version bumping, deployment pipelines with approval gates.

**Session tooling** — transcript search, usage tracking, cross-session memory persistence.
