---
description: Copy relevant file list and context summary to clipboard for carrying over to a new conversation
allowed-tools: Bash(pbcopy:*)
disable-model-invocation: true
---

Collect all files relevant to the current conversation's task/topic.

Output format (no backticks, no markdown fencing):
1. A 1-2 sentence summary of what the feature/bug/topic is (not how files work)
2. A blank line
3. Each relevant file on its own line prefixed with @

Example output shape:
Adding webhook support for incoming Slack notifications.

@src/webhooks/handler.ts
@src/webhooks/types.ts
@src/routes/slack.ts

Copy this exact text to the clipboard using pbcopy. Then say only "Copied" — no other output.
