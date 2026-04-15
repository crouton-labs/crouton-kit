# CLAUDE.md

## Staging behavior in `/commit` and `/save`

Default (no `--all`) stages only files relevant to the **current conversation** — unrelated dirty files are intentionally left unstaged. This is by design, not a bug. `--all` stages everything but must ask before deleting or reverting any file to clean the working tree.

## `/save` branch naming and post-PR state

Branch name is derived from `git config user.name` (first word, lowercased): `<first-name>/<type>/<topic>`. If `user.name` is unset, the command will stall — ensure it's configured.

After opening the PR, `/save` returns to the **original branch**. Unstaged changes left behind in default mode (not `--all`) survive on the original branch; they were never staged and are unaffected by the checkout.

## `/save` CI monitoring — background agent

CI monitoring is spawned as a background `/loop` agent, not inline. The loop:
- Checks every 2 minutes via `gh pr checks`
- Attempts up to **3 auto-fixes** for obvious failures (lint, type errors, build errors)
- Stops and reports to the user for ambiguous failures or anything requiring design decisions
- The PR branch is checked out to apply fixes, then original branch is restored again

## `/pr` autonomous mode (`-a`)

Without `-a`: reports CI results and stops — takes no action.

With `-a`: confirm with user before starting, then loops up to **5 fix-repush iterations**. Stops early if the same check fails twice (likely not a trivial fix) or if the fix requires design decisions. Auto-creates a new branch if invoked while already on the target branch.

Force-push is only used after `--rebase` and always via `--force-with-lease`, never `--force`.

## `/rebase` conflict orientation

During rebase, "ours" = your commits being replayed (the feature branch), "theirs" = the target branch. This is the opposite of merge conflict direction. The command explains this inline, but it's worth knowing when reading logs or conflict markers manually.

Uncommitted changes are stashed automatically before rebase (`pre-rebase` stash) and restored after. The command never pushes automatically post-rebase — it shows the rebased log and waits for user confirmation.

## `/push` gate

`/push` calls the `verify-clean` skill as a pre-flight check and stops on failure. It only warns about pushing to `main`/`master` when other branches exist — solo-branch repos push without warning.
