---
description: List spec/plan files, flag orphans, offer cleanup of old files
allowed-tools: Bash(find:*), Bash(stat:*), Bash(rm:*)
---
# Spec/Plan Cleanup

## Current Files

### Requirements Files
!`bash -c 'find . \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o -type d -name specs -print 2>/dev/null | while read d; do for topic_dir in "$d"/*/; do [ -f "${topic_dir}requirements.md" ] && echo "---" && echo "Path: ${topic_dir}requirements.md" && stat -f "Created: %SB%nModified: %Sm" -t "%Y-%m-%d" "${topic_dir}requirements.md"; done; done; true'`

### Plan Files
!`bash -c 'find . \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o -type d -name .claude -print 2>/dev/null | while read d; do for f in "$d"/plans/*.plan.md; do [ -f "$f" ] && echo "---" && echo "Path: $f" && stat -f "Created: %SB%nModified: %Sm" -t "%Y-%m-%d" "$f"; done; done; true'`

## Analysis Tasks

1. **Identify orphan spec directories** — Topic directories under `specs/` that have a `requirements.md` but no corresponding plan file in `plans/` (matched by topic name)
2. **Identify orphan plans** — Plans without a corresponding topic directory under `specs/`
3. **Flag old files** — Files with last modified date >10 days ago

## Output Format

Present a table:

| Topic | Has Requirements | Has Design | Has Plan | Age (days) | Candidate for Deletion |
|-------|-----------------|------------|----------|------------|------------------------|

Candidates for deletion: topic directories (and all files within) or plan files >10 days old that either:
- Are orphan spec directories (no plan exists for the topic)
- Are orphan plans (no spec directory exists for the topic)
- Have both spec directory + plan present (feature likely implemented)

## User Interaction

After presenting the table, ask which topics/files to delete using AskUserQuestion with multiSelect enabled. Only include deletion candidates as options.

If user selects topics, delete the entire `.claude/specs/{topic}/` directory and any corresponding plan files, then confirm.
