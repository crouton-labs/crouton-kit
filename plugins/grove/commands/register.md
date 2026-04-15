---
description: Register a project source directory with grove for instance management
allowed-tools: Bash(grove:*), Read, Glob
argument-hint: <path> [--name <name>] [--init <script>] [--port <name:base:offset>...]
---

# Grove Register

**Arguments:** $ARGUMENTS

Register the project so grove can plant instances of it.

```bash
grove register $ARGUMENTS
```

If no arguments provided, register the current working directory:

```bash
grove register .
```

After registering, verify with `grove list` and then use `/grove:plant` to create instances.

## Port definitions

Ports follow the format `name:base:offset` where the actual port = base + (slot × offset):

```
--port core:3068:100 --port gateway:3069:100 --port cdp:9222:1
```

## Init script

Point to a script that sets up new instances. Grove calls it with `<source> <target> <slot> <name>`:

```
--init .claude/scripts/create-env.sh
```
