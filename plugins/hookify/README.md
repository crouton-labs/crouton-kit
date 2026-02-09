# hookify

Prevent unwanted behaviors through lifecycle hooks that check markdown-defined rules before and after tool execution.

## How It Works

Hookify installs lifecycle hooks (`PreToolUse`, `PostToolUse`, `Stop`, `UserPromptSubmit`, `TeammateIdle`, `TaskCompleted`) that evaluate rules stored in markdown files. Rules define patterns to match and actions to take (warn or block).

**Rules are discovered by walking up from CWD to home directory:**
1. `.claude/hookify.*.local.md` (current directory and all parents)
2. `~/.claude/hookify.*.local.md` (global rules)

Changes take effect immediately—no restart needed.

## Commands

- `/hookify [behavior]` - Create rules from conversation analysis or explicit instructions
- `/hookify:list` - Show all configured rules
- `/hookify:configure` - Toggle rules on/off interactively
- `/hookify:help` - Get help with hookify

## Rule File Format

**Location**: `.claude/hookify.{name}.local.md` or `~/.claude/hookify.{name}.local.md`

### Basic Rule

```markdown
---
name: warn-dangerous-rm
enabled: true
event: bash
pattern: rm\s+-rf
action: warn
---

⚠️ **Dangerous rm command detected!**

This command could delete important files. Please:
- Verify the path is correct
- Consider using a safer approach
- Make sure you have backups
```

### Advanced Rule (Multiple Conditions)

```markdown
---
name: warn-env-credentials
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$
  - field: new_text
    operator: contains
    pattern: API_KEY
---

🔐 **Credentials in .env file detected**

Ensure this file is in .gitignore and never committed to version control.
```

### Diff-Based Rule (Inspect Changes)

```markdown
---
name: warn-removed-tests
enabled: true
event: diff
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.test\.(ts|js)$
  - field: diff
    operator: regex_match
    pattern: ^-.*\b(it|test|describe)\s*\(
---

⚠️ **Test removal detected**

You're removing test cases. Make sure this is intentional and that test
coverage remains adequate.
```

The `diff` field contains a unified diff format where:
- Lines starting with `-` were removed
- Lines starting with `+` were added
- Use regex to match specific change patterns

## Frontmatter Fields

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| `name` | Yes | kebab-case string | Unique identifier (e.g., `warn-dangerous-rm`) |
| `enabled` | Yes | `true` \| `false` | Whether rule is active |
| `event` | Yes | `bash` \| `file` \| `diff` \| `stop` \| `prompt` \| `teammate_idle` \| `task_completed` \| `all` | Which lifecycle events to match |
| `action` | No | `warn` \| `block` | Default: `warn`. Block prevents operation |
| `pattern` | No | regex string | Simple pattern for single-condition rules |
| `conditions` | No | array | Complex multi-condition rules (see below) |

**Simple pattern is shorthand for a single condition.** These are equivalent:

```yaml
# Simple
event: bash
pattern: rm\s+-rf

# Expanded
event: bash
conditions:
  - field: command
    operator: regex_match
    pattern: rm\s+-rf
```

## Event Types

| Event | Triggers On | Available Fields | Use Cases |
|-------|-------------|------------------|-----------|
| `bash` | Bash tool execution | `command` | Block dangerous commands (`rm -rf`, `chmod 777`) |
| `file` | Edit/Write/MultiEdit | `file_path`, `new_text`, `old_text`, `content` | Warn on code patterns (`console.log`), sensitive files |
| `diff` | Edit tool | `diff`, `file_path`, `old_string`, `new_string` | Match changes in unified diff format (`+added`, `-removed`) |
| `stop` | Agent attempts to stop | `reason`, `transcript` | Require tests before completion |
| `prompt` | User submits prompt | `prompt` | Context injection based on user input |
| `teammate_idle` | Teammate about to go idle | `content` | Force continuation until artifacts produced |
| `task_completed` | Task marked complete | `content` | Gate completion with verification checks |
| `all` | All events | Field depends on tool | Cross-cutting concerns |

## Condition Structure

```yaml
conditions:
  - field: command           # Which field to check
    operator: regex_match    # How to match
    pattern: rm\s+-rf       # What to match
```

**Operators:**
- `regex_match` - Python regex pattern
- `contains` - Substring present
- `equals` - Exact match
- `not_contains` - Substring absent
- `starts_with` - Prefix match
- `ends_with` - Suffix match

**All conditions must match for rule to trigger** (AND logic).

## Field Mapping by Event

| Event | Simple Pattern Checks | Available Fields |
|-------|----------------------|------------------|
| `bash` | `command` | `command` |
| `file` | `new_text` | `file_path`, `new_text`, `old_text`, `content` |
| `diff` | `diff` | `diff`, `file_path`, `old_string`, `new_string` |
| `prompt` | `prompt` | `prompt` |
| `stop` | `content` | `reason`, `transcript` |
| `teammate_idle` | `content` | `content` |
| `task_completed` | `content` | `content` |
| `all` | `content` | Context-dependent |

## Actions

**`warn`** (default):
- Shows message to Claude after tool executes (PostToolUse)
- Operation proceeds normally
- Use for reminders, best practices, context

**`block`**:
- Prevents operation before tool executes (PreToolUse)
- For `stop` events: prevents stopping
- Shows error message
- Use for dangerous operations, policy enforcement

## Dynamic Command Interpolation

Messages can execute shell commands and substitute output using `!` followed by backticks:

```markdown
---
name: show-git-status
enabled: true
event: prompt
pattern: \bgit\b
---

**Current Git Status:**
!`git status --short`

**Uncommitted changes:**
!`git diff --stat`
```

- Commands timeout after 5 seconds
- Errors shown as `(error: ...)`
- Empty output shows as `(no output)`
- Runs in login shell (`/bin/zsh -l -c`) for environment variables

## Complete Working Example

```markdown
---
name: block-production-deploy
enabled: true
event: bash
action: block
conditions:
  - field: command
    operator: regex_match
    pattern: kubectl\s+apply|terraform\s+apply|aws\s+deploy
  - field: command
    operator: not_contains
    pattern: --dry-run
---

🚨 **Production deployment detected without dry-run!**

You're about to deploy to production without `--dry-run`.

**Current environment:**
!`echo $ENVIRONMENT`

**Pre-deployment checklist:**
- [ ] Tests passing locally?
- [ ] Reviewed by team?
- [ ] Monitoring alerts configured?
- [ ] Rollback plan ready?

Add `--dry-run` first to verify changes, or use `/hookify:configure` to disable this check.
```

## Hook Implementation

Hookify uses these Claude Code lifecycle hooks:

- **PreToolUse**: Blocks matching `action: block` rules before tool execution
- **PostToolUse**: Shows matching `action: warn` rules after tool execution
- **Stop**: Evaluates `event: stop` rules when agent attempts to stop
- **UserPromptSubmit**: Injects context from `event: prompt` rules
- **TeammateIdle**: Evaluates `event: teammate_idle` rules when a teammate is about to idle
- **TaskCompleted**: Evaluates `event: task_completed` rules when a task is marked complete

Each hook script (`hooks/*.py`) loads rules matching the event type and evaluates them against input data using regex patterns or condition operators.

## Example Rules

See `examples/` directory:

- `dangerous-rm.local.md` - Block `rm -rf` commands
- `console-log-warning.local.md` - Warn on `console.log` in code
- `sensitive-files-warning.local.md` - Warn when editing `.env` or credentials files
- `require-tests-stop.local.md` - Block stopping if tests weren't run (disabled by default)

## Pattern Writing Tips

**Bash patterns:**
```yaml
# Dangerous commands
pattern: rm\s+-rf|chmod\s+777|dd\s+if=

# Package managers
pattern: npm\s+install|pip\s+install|cargo\s+add
```

**File patterns:**
```yaml
# Code smells
pattern: console\.log\(|eval\(|innerHTML\s*=|debugger

# Sensitive files
pattern: \.env$|\.env\.|credentials|secrets|\.pem$
```

**Remember to escape regex metacharacters:** `.` → `\.`, `(` → `\(`, `[` → `\[`

## Rule Discovery Algorithm

```python
# Searches in order:
1. /current/working/directory/.claude/hookify.*.local.md
2. /current/working/.claude/hookify.*.local.md
3. /current/.claude/hookify.*.local.md
4. ... (walk up to home)
5. ~/.claude/hookify.*.local.md

# Deduplicates by realpath
# Only loads enabled rules matching the event type
```

## Usage Workflow

1. **Create rule**: `/hookify Don't use console.log in production code`
2. **Verify rule**: `/hookify:list`
3. **Test trigger**: Try operation that matches pattern
4. **Toggle if needed**: `/hookify:configure`
5. **Refine pattern**: Edit `.claude/hookify.{name}.local.md` directly

Changes apply immediately on next tool use.

## Troubleshooting

**Rule doesn't trigger:**
- Verify `enabled: true`
- Check pattern with: `python3 -c "import re; print(re.search(r'pattern', 'test'))"`
- Confirm file is in `.claude/hookify.*.local.md` (not plugin directory)
- Verify event type matches tool (e.g., `event: bash` for Bash tool)

**Wrong action (block vs warn):**
- `action: warn` shows message after operation (PostToolUse)
- `action: block` prevents operation (PreToolUse)
- Default is `warn` if omitted

**Pattern too broad/narrow:**
- Test with actual command/content from failed match
- Use regex101.com (Python flavor) to debug patterns
- Start broad, then narrow based on false positives

**File path issues:**
- Global rules: `~/.claude/hookify.*.local.md`
- Project rules: `.claude/hookify.*.local.md` (relative to any parent of CWD)
- Name must match pattern: `hookify.{identifier}.local.md`
