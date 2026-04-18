---
description: Adopt an existing directory as a grove instance (auto-detects slot from .env)
allowed-tools: Bash(grove:*), Read
argument-hint: <project> <name> <path> [--slot N]
---

# Grove Adopt

**Arguments:** $ARGUMENTS

```!
grove adopt --help
```

Slot number is auto-detected from `PORT=` values in `.env` files if `--slot` is omitted.

```bash
grove adopt $ARGUMENTS
```

After adopting, verify with `grove list`.
