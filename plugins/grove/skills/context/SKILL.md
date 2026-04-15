---
name: grove-context
description: Grove instance awareness — shows which parallel instance you're in, sibling instances, port mappings, and how to avoid cross-instance collisions. Use when working in a grove-managed project, checking ports, or coordinating with other instances.
disable-model-invocation: true
---

# Grove Instance Context

## What is Grove?

Grove manages **parallel, isolated instances** of a project. Each instance gets a **slot** (1-9) and unique ports computed as `base + slot * offset`, preventing collisions when multiple copies run simultaneously.

- **Source** — the original project directory (slot 0, base ports)
- **Instance** — a cloned copy with its own slot and port assignments
- **Slot** — integer 1-9 that determines port offsets for the instance

## Current State

```!
"${CLAUDE_SKILL_DIR}/scripts/grove-context.sh"
```

## Key Rules

**Never use base ports in an instance.** If you're in slot 2 and the base port for `core` is 3068, your port is `3068 + 2*100 = 3268`. Using 3068 would collide with the source or another instance.

**Port formula:** `actual_port = base + (slot * offset)`. Offset is typically 100 for services, 1 for debug/CDP ports.

**Check .env files for your ports.** After planting, ports are patched into `.env` files. If you need a port number, read your `.env` rather than hardcoding.

**Other instances are independent.** Don't modify files in sibling instance directories. Each instance has its own agent session. Coordinate through the source repo (git), not by reaching into siblings.

## Common Actions

- **List all instances:** `grove list` or `grove list <project>`
- **Check port health:** `grove list` shows green/gray dots per service
- **Clean up zombies:** `grove doctor` prunes instances whose directories are missing
- **Tear down an instance:** `grove uproot <project>/<instance> --force`
- **Create a new instance:** use the `/grove:plant` command
