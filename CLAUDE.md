# CLAUDE.md

## Architecture

Claude Code plugin marketplace repo. `plugins/` holds standalone plugins; `.claude-plugin/marketplace.json` is the registry Claude Code reads to discover and distribute them. `bin/` holds shell utilities for local dev workflows.

## Key Constraints

- **Never manually edit versions** in `plugin.json` or `.claude-plugin/marketplace.json` — CI bumps both on every push to `main` based on conventional commit prefix.
- **New plugins require two files**: a `plugins/<name>/.claude-plugin/plugin.json` AND a corresponding entry in `.claude-plugin/marketplace.json`. Files without a registry entry are invisible to Claude Code.
- **Version bump commit loop**: CI commits with `[skip ci]` in the message. If you add that to a non-version commit, CI will skip the version bump entirely.

## Commands

```bash
# Build ai-cli (run from plugins/ai-cli/)
pnpm build                        # compiles src/cli.ts → dist/ai.mjs

# Run ai-cli locally
node plugins/ai-cli/dist/ai.mjs -m <mode> -p "<prompt>"
node plugins/ai-cli/dist/ai.mjs --list   # show available modes

# Load plugins locally without cache
claude --plugin-dir ./plugins/devcore --plugin-dir ./plugins/web

# Create a worktree for a new branch
bin/new-worktree feat <topic>
bin/new-worktree fix VAL-123-description   # links to Linear issue if `linear` CLI present
```

## CI — Conventional Commit → Bump Type

| Prefix | Bump |
|--------|------|
| `feat:` | minor |
| `fix:`, `refactor:`, `chore:`, etc. | patch |
| `feat!:` or `BREAKING CHANGE:` | major |

Only plugins with changed files in `plugins/<name>/` get bumped; marketplace always bumps.

## Plugin Authoring

→ See `plugins/CLAUDE.md` for full authoring guide (commands, agents, rules, hooks, skills).

Quick structure:
```
plugins/<name>/
├── .claude-plugin/plugin.json   # required: name, version, description
├── commands/*.md                # slash commands
├── agents/*.md                  # background workers
├── rules/*.md                   # auto-applied constraints (paths frontmatter)
├── hooks/hooks.json             # lifecycle hooks
└── skills/                      # reusable skills
```

## ai-cli Modes

Modes live in `plugins/ai-cli/modes/*.md` with required frontmatter:
```
---
model: claude-opus-4-6       # required
system-prompt-mode: append   # or "replace"
help: one-line description
---
```
- Add project-local modes at `.claude/.ai/modes/<name>.md` — these override builtins with the same name.
- `## Prompt Wrapper` section in a mode file wraps the user prompt; everything before it is the system prompt.

## bin/new-worktree

Creates a sibling worktree at `../<git-username>/<type>/<topic>` on a new branch `<username>/<type>/<topic>`.
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`
- Copies dotfiles and gitignored dirs (symlinks `node_modules`, `dist`, etc.)
- `--extract <files>` moves staged changes to the worktree and resets them in the original
- `--patch <file>` applies a patch to the worktree and reverse-applies it to the original
- Requires `git user.name` to be set; uses first name as username

## After Pushing Changes

1. Wait for CI version bump commit (usually seconds)
2. Run `/reload-plugins` in Claude Code to pick up the new version
3. No `git pull` or session restart needed

Known upstream cache bugs that may interfere: see `plugins/CLAUDE.md` § Known Upstream Issues.

## .claude/rules/

Auto-applied rules for authoring within this repo: `agent-development.md`, `command-development.md`, `hook-development.md`, `rule-development.md`, `skill-development.md`. These fire when editing the corresponding plugin component types.
