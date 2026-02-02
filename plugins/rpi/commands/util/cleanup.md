---
description: List spec/plan files, flag orphans, offer cleanup of old files
allowed-tools: Bash(find:*), Bash(stat:*), Bash(rm:*)
---
# Spec/Plan Cleanup

## Current Files

### Spec Files
!`bash -c 'find . \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o -type d -name .claude -print 2>/dev/null | while read d; do for f in "$d"/specs/*.spec.md; do [ -f "$f" ] && echo "---" && echo "Path: $f" && stat -f "Created: %SB%nModified: %Sm" -t "%Y-%m-%d" "$f"; done; done; true'`

### Plan Files
!`bash -c 'find . \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -o -type d -name .claude -print 2>/dev/null | while read d; do for f in "$d"/plans/*.plan.md; do [ -f "$f" ] && echo "---" && echo "Path: $f" && stat -f "Created: %SB%nModified: %Sm" -t "%Y-%m-%d" "$f"; done; done; true'`

## Analysis Tasks

1. **Identify orphan specs** — Specs without corresponding plan files (same basename)
2. **Identify orphan plans** — Plans without corresponding spec files
3. **Flag old files** — Files with last modified date >10 days ago

## Output Format

Present a table:

| File | Type | Has Pair | Age (days) | Candidate for Deletion |
|------|------|----------|------------|------------------------|

Candidates for deletion: files >10 days old that either:
- Are orphan specs (no plan exists)
- Are orphan plans (no spec exists)
- Have both spec+plan present (feature likely implemented)

## User Interaction

After presenting the table, ask which files to delete using AskUserQuestion with multiSelect enabled. Only include deletion candidates as options.

If user selects files, delete them and confirm.
