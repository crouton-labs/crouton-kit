# crouton-kit — a Claude Code plugin marketplace: slash commands, agents, hooks and skills for development workflows

![crouton-kit](https://raw.githubusercontent.com/crouton-labs/crouton-kit/main/assets/banner.svg)

<p align="center">
  <a href="https://github.com/crouton-labs/crouton-kit/blob/main/.claude-plugin/marketplace.json"><img alt="plugins" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcrouton-labs%2Fcrouton-kit%2Fmain%2F.claude-plugin%2Fmarketplace.json&query=%24.plugins.length&label=plugins"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-GPL--3.0-blue"></a>
</p>

crouton-kit is a marketplace of plugins for [Claude Code](https://docs.claude.com/en/docs/claude-code). The registry is `.claude-plugin/marketplace.json`, and each plugin is a directory under `plugins/`. A plugin is made of slash commands, background agents, auto-applied rules, lifecycle hooks and skills, in whatever mix it needs.

The plugins cover day-to-day development work: committing and opening pull requests (`git-smart`), code review and debugging (`devcore`), a requirements-to-review feature workflow (`rpi`), frontend design (`web`), Linear issues (`linear`), and guides for writing Claude Code artifacts such as hooks, rules and skills (`authoring`). A few wrap other Crouton Labs tools: `crtr` routes slash commands to the [crouter](https://github.com/crouton-labs/crouter) CLI, `grove` manages parallel project instances, `capture` takes screenshots and HAR files through the Chrome DevTools Protocol, and `humanloop` covers the `hl` decision TUI and [termrender](https://github.com/crouton-labs/termrender).

## Install

Inside Claude Code, add the marketplace, then install the plugins you want:

```
/plugin marketplace add crouton-labs/crouton-kit
/plugin install git-smart@crouton-kit
```

Commands are namespaced by plugin, so the one above gives you `/git-smart:commit`, `/git-smart:pr`, `/git-smart:push`, `/git-smart:rebase` and `/git-smart:save`. After the marketplace updates, run `/reload-plugins` to pick up the new version.

Some plugins need tools outside Claude Code. `crtr` needs the `crtr` binary on your `PATH`, and `ai-cli` runs a bundled script that calls the Claude Code SDK (see below). Each plugin's `plugin.json` says what it requires.

## Plugins

| Plugin | What it does |
|---|---|
| `devcore` | Core development agents and code quality hooks |
| `git-smart` | Smart git commits with security and quality review |
| `rpi` | Feature development workflow: arch → plan → implement → review → fix |
| `learn` | Interactive commands to help you understand code |
| `knowledge-capture` | Requirements gathering, interviews, and learning commands |
| `dev-utilities` | Developer utilities (notifications, command creation) |
| `web` | Web development tools including frontend design workflows |
| `hookify` | Create configurable hooks from markdown rule files |
| `linear` | Linear CLI integration: context injection, skill reference, issue management |
| `authoring` | Guides for authoring CLAUDE.md, hooks, rules, skills, commands and scripts |
| `ai-cli` | CLI for running Claude Code SDK sessions with configurable modes |
| `ai-workflow` | Multi-step agent workflows: chain headless `ai-cli` runs with branching |
| `capture` | App state capture (screenshots, HAR, console, logs) via CDP |
| `social` | X (Twitter) posting, engagement and growth tools |
| `humanloop` | Human-in-the-loop decision TUI (`hl`) and terminal rendering (`termrender`) |
| `grove` | Manage parallel project instances: plant, adopt, uproot, monitor |
| `crtr` | Routing-only slash commands that bridge Claude Code to the `crtr` CLI |

## Develop

```bash
git clone git@github.com:crouton-labs/crouton-kit.git
cd crouton-kit
claude --plugin-dir ./plugins/devcore --plugin-dir ./plugins/web   # load plugins from the checkout
```

A new plugin needs two files: `plugins/<name>/.claude-plugin/plugin.json` and an entry for it in `.claude-plugin/marketplace.json`. Without the registry entry Claude Code does not see the plugin. Do not edit versions by hand: a GitHub Actions workflow bumps the version in both files on every push to `main`, based on the conventional commit prefix (`feat:` is minor, `fix:` and the rest are patch, `feat!:` is major). The authoring guide is [`plugins/CLAUDE.md`](plugins/CLAUDE.md), and `bin/new-worktree` creates a sibling git worktree for a new branch.

`ai-cli` is the one plugin with a build step. From `plugins/ai-cli/`, `npm run build` bundles `src/cli.ts` into `bin/ai` (a built copy is committed), and `node bin/ai -m <mode> -p "<prompt>"` runs a Claude Code session in one of the modes in `modes/*.md`. `node bin/ai --list` shows the modes.
