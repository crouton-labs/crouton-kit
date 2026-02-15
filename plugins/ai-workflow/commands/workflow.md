---
description: Run or inspect ai-workflow automated pipelines
allowed-tools: Bash(ai-workflow:*), Bash(linear issue:*)
argument-hint: <natural language request>
---

`ai-workflow` orchestrates multi-step headless Claude Code sessions — triage, planning, implementation, and validation — driven by Linear tickets.

## CLI

```
!`ai-workflow --help`
```

## Workflows

```
!`ai-workflow list`
```

## Config

Requires `.claude/workflow.json` with Linear team and state mappings.

## Your job

Interpret the user's request and translate it into `ai-workflow` commands. Extract ticket IDs, workflow names, and intent yourself.

- Multiple tickets → run the workflow for each (sequentially or note they'll run in parallel via dispatch)
- Ambiguous ticket references → use `linear issue list` to find them
- "triage these" → `ai-workflow run triage <ticketId>` per ticket
- "implement DEV-123" → `ai-workflow run implement DEV-123`
- "what's running" → `ai-workflow runs`
- "status on that last run" → `ai-workflow runs --last 1` then `ai-workflow status <id>`

User request: $ARGUMENTS
