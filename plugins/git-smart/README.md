# git-smart

Safe git commits with automated security and quality review.

## Command: `/commit [scope]`

Four-phase workflow that scans, validates, commits, and pushes changes.

### Phase 1: Security & Quality Review

Spawns a haiku agent to scan all changed files.

**Blockers (halts commit):**
- Secrets: API keys, tokens, passwords, private keys, .env file values
- Credentials: AWS keys, database URLs with passwords, auth tokens
- Merge conflicts: Unresolved `<<<<<<<`, `=======`, `>>>>>>>` markers
- Large binaries: Files >1MB, node_modules, build artifacts

**Warnings (remove unless intentional):**
- Debug code: `console.log`, `debugger`, `print()`, `var_dump`, `dd()` (unless codebase standard)
- TODO/FIXME: New additions in diff (not existing code)
- Commented code: Large blocks of commented-out code

**Rules violations:** Checks changed files against `.claude/rules/*.md` patterns. Only flags clear violations.

Agent reports `BLOCK: <reason>` or `PASS`. Halts on block until user responds.

### Phase 2: Prep

- Updates `.gitignore` if needed (node_modules, build dirs, .env)
- Stages appropriate files

### Phase 3: Commit Strategy

**Small changes** (<3 files, single concern): Single commit
**Large changes** (3+ files, multiple concerns): Multiple logical commits grouped by concern

**Format:** `type(scope): subject`
**Types:** feat, fix, docs, style, refactor, test, chore
**Style:** Matches recent commit history from repo

### Phase 4: Push

**Branch safety check:**
- On `main`/`master` with other branches present: Warns, suggests feature branch
- On feature branch or only branch: Pushes normally

Runs `git push origin <branch>`

### Output

Lists all commits created with messages and final push status.

## Examples

```bash
/commit                    # Review and commit all changes
/commit auth               # Commit with "auth" scope context
```

## Flow

```
git status → haiku scan → PASS/BLOCK → stage files → create commits → push
                              ↓
                           BLOCK: reports issues, waits for user
```
