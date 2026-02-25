# dev-utilities Plugin

Developer utility commands and helpers for Claude Code workflows.

## Structure

- **commands/** - Utility slash commands (analysis, formatting, utilities)
- **hooks/** - Lifecycle hooks for utility integrations
- **bin/** - Executable scripts supporting commands
- **node_modules/** - Dependencies

## Key Patterns

- Commands should focus on **single, reusable concerns** (not multi-step workflows)
- Utility commands are typically **read-only or analysis-focused**
- Keep command complexity low; use allowed-tools constraints to prevent sprawl

## Dependencies

Check `package.json` for runtime deps. Updates to bin scripts should maintain compatibility with declared Node/tool versions.
