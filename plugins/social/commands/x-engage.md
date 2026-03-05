---
description: Find relevant people on X and engage with their posts
allowed-tools: Bash(northlight:*), Read, Glob, Grep, AskUserQuestion, Skill(llm-posting-guide), Skill(silas-posting-guide), Skill(x-growth)
argument-hint: [topic]
---

Find relevant people and posts on X to engage with via comments and replies. Uses northlight's X library for search and interaction.

Load the `x-growth` skill first — commenting strategy is the core methodology.

## Workflow

1. Find the x.com tab:
```bash
northlight cdp list
```

2. Get auth context:
```bash
echo '{}' | northlight test x getContext --target <tabId>
```

3. Search for posts by topic ($ARGUMENTS or ask the user):
```bash
echo '{"query":"$ARGUMENTS","count":20}' | northlight test x searchPosts --target <tabId>
```

4. Present the most engaging posts to the user — show author, content, and engagement metrics.

5. For each post the user wants to engage with, draft a comment following `silas-posting-guide` voice and `llm-posting-guide` quality standards. Present drafts for approval.

6. Post approved comments:
```bash
echo '{"text":"comment text","replyToTweetId":"<tweetId>"}' | northlight test x createPost --target <tabId>
```

## Also check

- `getForYouTimeline` and `getFollowingTimeline` for posts already in the user's feed
- `listNotifications` for recent mentions to respond to
- Profiles of specific people via `getProfile` + `getUserPosts`

## Constraints

- Never auto-post — always get user approval on comment text
- Comments must add genuine value — no "great post!" or generic replies
- Follow the x-growth 10 comments/day minimum target
- Load silas-posting-guide for voice calibration on every comment
