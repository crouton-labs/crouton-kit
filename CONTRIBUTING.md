# Contributing to crouton-kit

Issues and pull requests are welcome at [github.com/crouton-labs/crouton-kit](https://github.com/crouton-labs/crouton-kit).

## Before you start

- **Bugs:** open an issue with the plugin name and version (from `.claude-plugin/marketplace.json`, or `/plugin` in Claude Code), your Claude Code version (`claude --version`), your OS, and the command or behaviour that failed with its output.
- **Features and larger changes:** open an issue first, so the direction is agreed before you write the code.
- **Questions:** ask in [Discord](https://discord.gg/afwW4saEtr) or open an issue. The authoring guide for plugins is [`plugins/CLAUDE.md`](plugins/CLAUDE.md).
- **Security problems:** do not open a public issue. See [SECURITY.md](SECURITY.md).

## Set up

You need Git and [Claude Code](https://docs.claude.com/en/docs/claude-code). Most plugins are markdown and JSON, so there is nothing to install or build. The exception is `plugins/ai-cli`, which needs Node.js and pnpm. The repository pins no Node version; CI runs Node 20 for its version-bump job.

```bash
git clone git@github.com:crouton-labs/crouton-kit.git
cd crouton-kit
claude --plugin-dir ./plugins/devcore --plugin-dir ./plugins/web   # load plugins from the checkout
```

`--plugin-dir` loads the plugins straight from your working tree, so edits show up without going through the plugin cache.

## Add or change a plugin

Claude Code reads [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) to find plugins, and each plugin is a directory under [`plugins/`](plugins). To add one:

1. Create `plugins/<name>/.claude-plugin/plugin.json` with `name`, `version`, `description` and `author`. Copy [`plugins/git-smart`](plugins/git-smart) as a small example.
2. Add the components the plugin needs, each in its own directory: `commands/*.md` (slash commands), `agents/*.md`, `rules/*.md`, `hooks/hooks.json`, `skills/<skill>/SKILL.md`. The format of each is in [`plugins/CLAUDE.md`](plugins/CLAUDE.md), and rules for editing them fire from [`.claude/rules/`](.claude/rules) when you work in this repository with Claude Code.
3. Add an entry to `.claude-plugin/marketplace.json`:

   ```json
   {
     "name": "my-plugin",
     "source": "./plugins/my-plugin",
     "description": "What it does",
     "version": "1.0.0",
     "keywords": ["relevant", "keywords"]
   }
   ```

   A plugin directory without this entry is invisible to Claude Code.
4. Add a row for it to the table in [`README.md`](README.md).

To change a plugin, edit its files and, if you change its description, keep the `marketplace.json` entry in step.

Do not edit version numbers by hand. The [version-bump workflow](.github/workflows/version-bump.yml) runs on every push to `main`: it raises the version of each plugin whose files changed, in both `plugin.json` and `marketplace.json`, plus the marketplace version, from the subject of the commit (`feat:` is a minor bump, `feat!:` or `BREAKING CHANGE:` a major one, anything else a patch). It commits the result with `[skip ci]`, and a `[skip ci]` in your own commit message skips the bump, so leave it out. After a bump lands, run `/reload-plugins` in Claude Code to pick it up.

`bin/new-worktree <type> <topic>` creates a sibling git worktree and branch for a change (`feat`, `fix`, `refactor`, `chore` or `docs`). Run it with no arguments for its usage.

### ai-cli

`plugins/ai-cli` is the one plugin with a build step. It has both `pnpm-lock.yaml` and `package-lock.json`, and `pnpm install --frozen-lockfile` is the one that installs cleanly, so use pnpm. The built `bin/ai` is committed, so rebuild and commit it when you change `src/`:

```bash
cd plugins/ai-cli
pnpm install --frozen-lockfile
pnpm build                          # bundles src/cli.ts into bin/ai
node bin/ai --list                  # lists the modes in modes/*.md
node bin/ai -m <mode> -p "<prompt>"
```

## Run the checks

There is no test suite and no lint step. Before you push:

- Run `claude plugin validate .` from the repository root. It validates `.claude-plugin/marketplace.json` and each plugin's manifest; it currently passes with warnings about missing `author` fields. `claude plugin validate plugins/<name>` checks one plugin.
- Load your plugin with `claude --plugin-dir ./plugins/<name>` and run the command, agent or hook you changed.
- If you changed `plugins/ai-cli/src`, run `pnpm build` there. `npx tsc --noEmit` currently reports type errors in that plugin, so it is not a gate.

## Pull requests

- Branch from the current `main`, and keep one change per pull request.
- Describe what changed and why in the pull request body, and say how you tested it.
- Keep the history linear: rebase onto `main` rather than merging it into your branch.
- Commit messages follow the style of the existing log: a short imperative subject with a conventional prefix and the plugin as scope, such as `feat(grove):` or `fix(crtr):`. The prefix decides the version bump.

## Repository layout

| Path | Contents |
|---|---|
| [`plugins/`](plugins) | One directory per plugin, each with a `.claude-plugin/plugin.json` and its commands, agents, rules, hooks and skills |
| [`.claude-plugin/`](.claude-plugin) | `marketplace.json`, the registry Claude Code reads |
| [`.claude/rules/`](.claude/rules) | Rules that apply when editing plugin components in this repository |
| [`.github/workflows/`](.github/workflows) | The version-bump workflow |
| [`bin/`](bin) | `new-worktree`, a shell helper for development |
| [`assets/`](assets) | README images |

## License

crouton-kit is licensed under GPL-3.0. By contributing, you agree that your contribution is licensed under the same terms.
