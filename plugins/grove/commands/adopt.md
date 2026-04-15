---
description: Adopt an existing directory as a grove instance (auto-detects slot from .env)
allowed-tools: Bash(grove:*), Read
argument-hint: <project> <name> <path> [--slot N]
---

# Grove Adopt

**Arguments:** $ARGUMENTS

Adopt an existing instance directory into grove's registry. Slot number is auto-detected from PORT= values in .env files if not specified.

```bash
grove adopt $ARGUMENTS
```

After adopting, verify with `grove list`.
