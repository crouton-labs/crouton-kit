---
description: Draft an X post from recent git activity
allowed-tools: Bash(git log:*), Bash(git show:*), Bash(git diff:*), Bash(northlight:*), Read, Glob, Grep, AskUserQuestion, Skill(llm-posting-guide), Skill(silas-posting-guide)
---

Draft an X post based on recent git history. Single post or short thread.

Pull recent commits (!`git log --since="10 days ago" --format="%h %s" --all`), identify the 3-5 most substantive changes. **Read the actual source files, READMEs, and configs** for each change before discussing it — get the real terminology, architecture, and details from the code itself. Then **ask the user** what the real motivation and thinking was before writing anything. AI-authored commits miss the *why* — the user's reasoning is the actual content.

Once you have a clear angle, load `llm-posting-guide` and `silas-posting-guide` and follow both strictly. Present 2-3 draft options.

Where a screenshot or image would strengthen the post, include `[screenshot: description]` or `[image: description]` placeholders.

## Publishing via Northlight

Use `northlight` to publish the post directly to X once the user approves the final draft. The x library requires an x.com tab open in the user's browser (CDP).

**Single post:**
```bash
echo '{"text":"Your post text here"}' | northlight test x createPost --target <tabId>
```

**Thread** (chain replies via `replyToTweetId`):
```bash
# First tweet
echo '{"text":"1/ First tweet"}' | northlight test x createPost --target <tabId>
# Grab the tweet ID from the output, then reply
echo '{"text":"2/ Second tweet","replyToTweetId":"<id>"}' | northlight test x createPost --target <tabId>
```

**Before publishing**, find the x.com tab:
```bash
northlight cdp list   # find the tab ID for x.com
```

Always confirm with the user before executing — never auto-publish.

## Constraints

- Never fabricate details — only use what the user confirms
- Every post must contain at least one concrete, specific detail
- Don't write until you understand the user's thinking behind the changes
