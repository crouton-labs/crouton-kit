---
description: Register a project source directory with grove for instance management
allowed-tools: Bash(grove:*), Read, Glob
argument-hint: <path> [--name <name>] [--init <script>] [--port <name:base:offset>...]
---

# Grove Register

**Arguments:** $ARGUMENTS

```!
grove register --help
```

```bash
grove register $ARGUMENTS
```

If no arguments provided, register the current working directory:

```bash
grove register .
```

After registering, verify with `grove list` and then use `/grove:plant` to create instances.

## Port semantics

Actual port = `base + (slot × offset)`. Use offset `1` for debug/CDP ports, `100` for everything else.

## Init script contract

Grove calls the init script as `<script> <source> <target> <slot> <name>`. Seeded projects use `.claude/grove/setup.sh` instead and should be registered with `--from-config`.
