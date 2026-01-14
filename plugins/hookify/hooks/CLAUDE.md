# hooks/

Claude Code lifecycle hooks that intercept and validate tool usage against rules.

## Hook Lifecycle

Each hook receives JSON from stdin, processes it, and exits with status code:
- **0** = pass (allow operation)
- **2** = block/warn (deny or show message)

| Hook | Timing | Purpose |
|------|--------|---------|
| PreToolUse | Before tool executes | Block unsafe operations (exit 2 to deny) |
| PostToolUse | After tool completes | Show warnings (exit 2 to display stderr as message) |
| Stop | When agent stops | Cleanup, final checks |
| UserPromptSubmit | User submits prompt | Pre-submission validation |

## Implementation Pattern

1. Load rules via `load_rules(event='...', context_path='...')`
2. Map tool name to event type (e.g., 'Bash' → 'bash', 'Edit'/'Write' → 'file')
3. Evaluate rules via `evaluate_rules(rules, input_data)`
4. PreToolUse: exit 2 if blocking rules found
5. PostToolUse: exit 2 and print message to stderr if warnings found

## Adding New Hooks

1. Create `<hookname>.py` with stdin→stdout pattern
2. Register in `hooks.json` under `hooks.<HookName>` array
3. Use `timeout: 10` in hooks.json
4. Import from `core.rules` for rule evaluation
