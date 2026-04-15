---
description: Create a new parallel instance of a registered project
allowed-tools: Bash(grove:*), Bash(rsync:*), Bash(git:*), Bash(pnpm:*), Bash(npm:*), Bash(ls:*), Bash(cat:*), Read, Glob, Grep
argument-hint: <project> <name> [--slot N]
---

# Grove Plant

**Arguments:** $ARGUMENTS

## Step 1: Plant the instance

```bash
grove plant $ARGUMENTS
```

## Step 2: Post-plant setup

Read the `grove-output` JSON block from the command output. It contains:
- `target` — the new instance directory
- `slot` — the assigned slot number
- `ports` — computed port mappings for each service
- `source` — the source project that was copied

Use this information to complete any project-specific setup:

1. **Verify** the target directory was created and has the expected structure
2. **Patch** .env files and config with the slot's port numbers
3. **Install** dependencies (check each repo's package manager)
4. **Generate** any codegen artifacts (Prisma, etc.)
5. **Report** the final state — path, ports, what's ready, what needs manual attention

If the project has an init script, it may have already handled some of these steps. Check its output to avoid duplicate work.
