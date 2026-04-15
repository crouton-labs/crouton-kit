---
description: Tear down a project instance — remove directory and clean up registry
allowed-tools: Bash(grove:*), Bash(lsof:*), Bash(kill:*), Bash(psql:*), Read
argument-hint: <project/name> [--force]
---

# Grove Uproot

**Arguments:** $ARGUMENTS

```bash
grove uproot --force $ARGUMENTS
```

After uprooting, check the cleanup hints in the output. There may be:
- Processes still running on the instance's ports
- Slot-specific databases to drop

Run any suggested cleanup commands, then confirm the instance is gone with `grove list`.
