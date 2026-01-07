# Crouton Kit Plugins

A collection of Claude Code plugins for enhanced development workflows.

## Plugins

| Plugin | Description |
|--------|-------------|
| [debugging](./debugging/) | Systematic debugging and bug investigation workflows |
| [dev-utilities](./dev-utilities/) | Developer utilities (notifications, command creation) |
| [devcore](./devcore/) | Core development agents and code quality hooks |
| [git-smart](./git-smart/) | Smart git commits with security and quality review |
| [hookify](./hookify/) | Create configurable hooks from markdown rule files |
| [knowledge-capture](./knowledge-capture/) | Requirements gathering, interviews, and learning commands |
| [learn](./learn/) | Interactive learning commands to help users understand code deeply |
| [rpi](./rpi/) | Feature development workflow: arch → plan → implement → review → fix |
| [web](./web/) | Web development tools including frontend design workflows |

## Installation

Plugins are registered in `/.claude-plugin/marketplace.json`. To install a plugin, add it to your Claude Code configuration.

## Plugin Structure

Each plugin follows this structure:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata
├── commands/                 # Slash commands (*.md)
├── agents/                   # Agent definitions (*.md)
├── rules/                    # Auto-applied rules (*.md)
├── hooks/                    # Lifecycle hooks (hooks.json)
└── skills/                   # Reusable skills (*.md)
```

## Creating a New Plugin

See [CLAUDE.md](./CLAUDE.md) for detailed plugin authoring guidance.
