# CLI & Terminal UX

Principles, patterns, and anti-patterns for designing command-line tools and terminal user interfaces that respect both human operators and automated pipelines.

---

## Command Structure & Naming

### Verb-Noun Pattern

Commands should read as sentences: `git commit`, `docker build`, `kubectl apply`. The verb comes first, the noun (resource) second. Subcommands organize complexity without flattening everything into flags.

**Patterns:**
- Use `<verb> <noun>` for resource-centric CLIs (e.g. `app create`, `db migrate`)
- Use `<noun> <verb>` only when the noun is a stable namespace (e.g. `git branch --delete`) — pick one and be consistent
- Limit nesting to two levels deep; three or more collapses discoverability
- Mirror the terminology of your domain — users shouldn't learn new words for existing concepts

**Flag conventions:**
- Long flags (`--verbose`) are required; short aliases (`-v`) are optional shortcuts, not replacements
- Use `--flag=value` or `--flag value` — both must work; never invent `--flag:value`
- Boolean flags toggle by presence (`--dry-run`), not by value (`--dry-run=true`)
- Prefer `--no-flag` as the inverse of `--flag` rather than a separate `--disable-flag`
- Standard names: `--help`, `--version`, `--output`, `--verbose`, `--quiet`, `--dry-run`, `--force`, `--yes` — match what users already know

**Positional args vs. named flags:**
- Positional args for the primary noun (one, at most two); flags for everything else
- More than two positional args is always wrong — order is invisible, order breaks scripts
- When an argument could be a file path, glob, or stdin: prefer `--input` so piping stays unambiguous

Source: [clig.dev](https://clig.dev/), [GNU Coding Standards §4.7](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html), [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)

---

## Output Design

### Human-Readable vs. Machine-Parseable

Every CLI has two classes of consumers: a human running it interactively, and a script piping it somewhere. Default output should optimize for human reading; structured output should be opt-in.

| Mode | Default? | Trigger | Rules |
|------|----------|---------|-------|
| **Human-readable** | Yes (TTY) | stdout is a terminal | Prose, color, alignment, progressive detail |
| **JSON / structured** | No | `--output json` or `--json` | Strict schema, no trailing commas, consistent field names |
| **TSV / CSV** | No | `--output tsv` | One entry per line, no borders, machine-parseable |
| **Quiet** | No | `--quiet` / `-q` | Only errors to stderr; nothing to stdout on success |

**Patterns:**
- Never output table borders — they are noise in pipes and hard to parse
- Each line of tabular output is exactly one logical entry
- Color is for emphasis, not decoration — use it to direct attention, not to style
- Strip ANSI codes automatically when stdout is not a TTY (check `isatty()`)
- `--output json` should emit a machine-stable schema; changing field names is a breaking change

Source: [clig.dev — Output](https://clig.dev/#output), [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46), [Google gcloud CLI conventions](https://docs.cloud.google.com/sdk/gcloud)

---

## Error Messages

### Actionable, Specific, Directed

A bad error message says what went wrong. A good error message says what went wrong, where, and what to do next.

**Structure of a good error:**
1. **What** failed — name the specific operation, not just "error"
2. **Why** it failed — the actual cause, not a stack trace
3. **How to fix it** — a concrete next step or command to run
4. **Where to learn more** — a URL or `--help` pointer when appropriate

**Patterns:**
- Write errors in plain English, present tense: `Cannot connect to registry` not `Connection to registry failed with code ECONNREFUSED`
- Quote the user's input in the error: `Unknown flag '--outptu'. Did you mean '--output'?`
- Suggest the fix inline: `Run 'foo auth login' to authenticate first.`
- For validation errors, tell the user the expected format with an example
- Prefix warning lines with `Warning:` (yellow) and error lines with `Error:` (red)

**Streams & exit codes:**

| Signal | Where | Standard |
|--------|-------|----------|
| Errors and warnings | **stderr** | Never mix with stdout — pipelines must not consume error text |
| Successful output | **stdout** | All parseable content here |
| Exit 0 | — | Success, including "nothing to do" |
| Exit 1 | — | General failure |
| Exit 2 | — | Misuse / bad arguments (POSIX convention) |
| Exit 130 | — | Interrupted by Ctrl-C (SIGINT) |

Source: [clig.dev — Errors](https://clig.dev/#errors), [UX patterns for CLI tools](https://lucasfcosta.com/2022/06/01/ux-patterns-cli-tools.html), [Thoughtworks CLI Design Guidelines](https://www.thoughtworks.com/insights/blog/engineering-effectiveness/elevate-developer-experiences-cli-design-guidelines)

---

## Interactive vs. Non-Interactive

### Detecting TTY

A CLI runs in two contexts: a human at a terminal (interactive), and a script or CI pipeline (non-interactive). Both must work correctly, and the difference should be detected automatically.

**Patterns:**
- Detect TTY via `isatty(stdout)` — enable color, prompts, and animations only when true
- Never require a prompt in non-interactive mode — every prompt must have a non-interactive flag equivalent
- Provide `--yes` / `-y` to skip all confirmation dialogs (CI-safe by default)
- When prompting, always show a sensible default in brackets: `Delete 3 files? [y/N]`
- Capital letter in `[y/N]` signals the default — pressing Enter accepts it
- For destructive actions, require explicit typing (`yes`) rather than a single keypress
- Warn on `--force` with what will be irreversibly changed; never silently destructive

**Interactive prompts (when TTY):**
- Select menus for enumerated choices beat free-text for preventing invalid input
- Show the number of items when the list is long: `(1/12)`
- Allow Ctrl-C at any prompt — it should exit cleanly, not leave state dirty

Source: [clig.dev — Interactivity](https://clig.dev/#interactivity), [Thoughtworks CLI Design Guidelines](https://www.thoughtworks.com/insights/blog/engineering-effectiveness/elevate-developer-experiences-cli-design-guidelines), [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)

---

## Progress & Feedback

### Silence is Alarming

A command that runs for 5 seconds without output looks broken. Feedback is a trust signal.

**Patterns:**
- For operations under 1 second: no progress indicator needed — show the result
- For 1–5 seconds: a spinner signals "I'm working" without implying completeness
- For operations with known steps: a progress bar (`█████░░░░░ 50%`) or step counter (`[3/7] Building image`)
- For streaming operations (log tailing, downloads): stream lines as they arrive; don't buffer
- Clear spinners and progress bars when done — don't leave residue in the terminal
- Show elapsed time for long operations on completion: `✓ Deployed in 23s`
- Always allow Ctrl-C to cancel a long operation cleanly

**Rules:**
- Never leave the cursor hidden on exit — always restore terminal state in cleanup handlers
- Write spinners/progress to stderr so they don't pollute piped stdout
- Suppress all progress indicators when stdout is not a TTY

Source: [clig.dev — Feedback](https://clig.dev/#feedback), [UX patterns for CLI tools](https://lucasfcosta.com/2022/06/01/ux-patterns-cli-tools.html)

---

## Help & Discovery

### --help is the Manual

Most users will never read a man page. `--help` is the first and last resort.

**Patterns:**
- `--help` works on every command and subcommand, including partial/invalid invocations
- Help text structure: one-line description → usage line → arguments → flags → examples → link to docs
- Examples are mandatory — at least two: the minimal case and a realistic one
- Examples use real values, not `<placeholder>` syntax — show what actual output looks like
- `--version` prints `name version` on a single line (machine-parseable)
- Offer shell completion scripts (`--completion bash/zsh/fish`) — auto-completing flags and subcommands dramatically reduces lookup friction
- For complex CLIs, a `help <subcommand>` alias of `<subcommand> --help` helps muscle memory

**Discoverability hierarchy:**
1. Intuitive naming (user guesses correctly)
2. `--help` on the parent command lists subcommands
3. Shell completions surface options mid-typing
4. Error messages suggest the right command when input is close
5. Man page / online docs for deep reference

Source: [clig.dev — Help](https://clig.dev/#help), [GNU Coding Standards](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html), [Atlassian — 10 Design Principles for Delightful CLIs](https://blog.developer.atlassian.com/10-design-principles-for-delightful-clis/)

---

## Configuration

### Precedence & Locations

| Layer | Example | Precedence |
|-------|---------|-----------|
| **CLI flag** | `--region us-east-1` | Highest — always wins |
| **Environment variable** | `APP_REGION=us-east-1` | Overrides config file |
| **Local config file** | `./.app/config.toml` | Project-scoped |
| **User config file** | `~/.config/app/config.toml` | User-scoped (XDG) |
| **System config** | `/etc/app/config.toml` | Lowest — system default |

**Patterns:**
- Follow [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir/latest/): `$XDG_CONFIG_HOME` (default `~/.config`) for config, `$XDG_CACHE_HOME` for cache, `$XDG_DATA_HOME` for data
- Environment variable names: `APP_NAME` prefixed, uppercase, underscore-separated
- Document every environment variable in `--help` and a dedicated config reference
- Ship with sensible defaults — the tool should work out of the box without a config file
- Never require interactive config setup before the first command works; use lazy initialization
- `config show` / `config get <key>` subcommands make the resolved config inspectable
- Never store secrets in config files — use env vars or a credential store

Source: [clig.dev — Configuration](https://clig.dev/#configuration), [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46), [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir/latest/), [XDG Conventions for CLI tools](https://xdgbasedirectoryspecification.com/)

---

## TUI Patterns

### Full-Screen Terminal UIs

TUIs (terminal user interfaces) fill the terminal viewport and use keyboard events for navigation. Frameworks like [Bubbletea](https://github.com/charmbracelet/bubbletea) (Go), [Ink](https://github.com/vadimdemedes/ink) (React/Node), and [Textual](https://github.com/Textualize/textual) (Python) formalize the reactive model.

**Architecture (Bubbletea / Elm model):**
- `Model` holds all application state
- `Update(msg)` handles events and returns a new model + optional command
- `View(model)` renders the current state as a string — pure, no side effects
- Side effects (I/O, timers) are expressed as `Cmd` values returned from `Update`

**Patterns:**
- Keyboard-first: every action reachable without a mouse; common actions on single keys
- Show key bindings in a persistent footer or via `?` help overlay
- `q` / `Ctrl-C` / `Esc` always exit or go back — never trap the user
- Use `Ctrl-Z` for undo within the TUI context if applicable
- Adapt layout to terminal dimensions — query `term.Size()` on resize events
- Use color sparingly and always with a fallback: test with `TERM=dumb` and `NO_COLOR=1`
- Mouse support is opt-in — don't require it, but support click-to-select where intuitive
- Alternate screen (`\033[?1049h`) isolates the TUI from shell history; restore on exit

**Charm ecosystem components:**
- [Bubbles](https://github.com/charmbracelet/bubbles) — prebuilt components: text inputs, viewports, spinners, progress bars, tables
- [Lip Gloss](https://github.com/charmbracelet/lipgloss) — declarative ANSI styling, padding, borders, flex-style layout
- [Harmonica](https://github.com/charmbracelet/harmonica) — spring animation for smooth transitions

Source: [charmbracelet/bubbletea](https://github.com/charmbracelet/bubbletea), [Inngest — Interactive CLIs with Bubbletea](https://www.inngest.com/blog/interactive-clis-with-bubbletea), [dev.to — Intro to Bubble Tea in Go](https://dev.to/andyhaskell/intro-to-bubble-tea-in-go-21lg)

---

## Scripting & Composability

### Unix Philosophy Applied

> Write programs that do one thing and do it well. Write programs to work together. — Doug McIlroy

**Patterns:**
- Read from stdin when no file argument is given; write to stdout
- Exit 0 means success even when output is empty (e.g. `grep` finding no matches exits 1 — that's an exception, not a model)
- Idempotent commands: running the same command twice should not error or double-apply
- `--dry-run` must be a first-class flag for any mutating operation
- `--quiet` / `-q` suppresses all non-error output — essential for scripting
- Ensure structured output (`--json`) has a stable schema across versions — breaking the schema is a semver major
- Don't paginate output when stdout is not a TTY; let the caller pipe through `less` if needed
- Support `--` to separate flags from positional arguments

**Composability rules:**
- Pipe-safe: stdout contains only payload, stderr contains only diagnostics
- Never print ANSI color codes to non-TTY stdout
- Never prompt for input when stdin is not a TTY — fail fast with a clear message

Source: [clig.dev — Scripting](https://clig.dev/#scripting), [GNU Coding Standards](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html), [UX patterns for CLI tools](https://lucasfcosta.com/2022/06/01/ux-patterns-cli-tools.html)

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| **Wall-of-text output** | Unreadable, unparseable, destroys pipelines | Group by concern, respect verbosity levels, default to concise |
| **Color when not TTY** | ANSI codes pollute pipes and log files | Check `isatty()` before emitting any ANSI sequence |
| **Inconsistent flag style** | `-longflag` mixed with `--longflag` | Always `--long`, always `-s` for short; never deviate |
| **Silently ignoring unknown flags** | User typos produce no output, looks like success | Fail loudly: `Unknown flag '--outptu'. Did you mean '--output'?` |
| **Prompting in non-interactive context** | Hangs CI pipelines indefinitely | Detect non-TTY and fail with clear instructions to use `--yes` |
| **Requiring config before first run** | Friction kills adoption | Lazy-initialize; first command should just work with defaults |
| **Printing to stdout on error** | Breaks pipes — error text is consumed as data | All errors and warnings go to stderr, always |
| **Non-zero exit on "not found"** | `grep`-style semantics break callers who treat 1 as crash | Define your exit code semantics clearly and document them |
| **No `--dry-run` for destructive operations** | Users can't test safely | Ship `--dry-run` with every mutating command from day one |
| **Burying the primary action deep in subcommands** | `app tools internal do thing` — no one finds it | Keep the happy path shallow; nest administrative/rare commands |
| **Version with no machine-parseable format** | Scripts can't compare versions | `name X.Y.Z` on one line; optional longer block after |
| **Over-eager stderr** | Flooding stderr with INFO logs breaks `2>&1` log collection | stderr is for warnings and errors, not informational progress |
| **Hardcoding `~/.app/` config location** | Ignores XDG; pollutes home directory | Respect `$XDG_CONFIG_HOME`; default to `~/.config/app/` |
| **No shell completions** | Users tab-complete into nothing | Ship completion scripts for bash, zsh, fish |
| **Swallowing Ctrl-C** | Terminal feels frozen, user force-kills | Handle SIGINT; clean up temp files; exit 130 |

Source: [clig.dev](https://clig.dev/), [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46), [Thoughtworks CLI Design Guidelines](https://www.thoughtworks.com/insights/blog/engineering-effectiveness/elevate-developer-experiences-cli-design-guidelines), [UX patterns for CLI tools](https://lucasfcosta.com/2022/06/01/ux-patterns-cli-tools.html)

---

## Design Checklist

### Command Structure
- [ ] Commands read as `verb noun` or follow a consistent alternative pattern
- [ ] Subcommand nesting is two levels maximum
- [ ] Long flags (`--flag`) required; short aliases (`-f`) optional
- [ ] No more than two positional arguments; everything else is a named flag
- [ ] Standard flag names used where applicable (`--help`, `--version`, `--output`, `--quiet`, `--yes`, `--dry-run`, `--force`)
- [ ] Boolean flags toggle by presence, not by value; `--no-flag` is the inverse

### Output Design
- [ ] stdout carries only payload; stderr carries only diagnostics
- [ ] ANSI color codes suppressed when stdout is not a TTY
- [ ] `--output json` emits a stable, versioned schema
- [ ] Table output has no borders — one line per entry
- [ ] `--quiet` suppresses all non-error output
- [ ] Verbosity is controllable (`-v` / `--verbose` for more detail)

### Error Messages
- [ ] Every error names what failed, why, and the next step
- [ ] User input is quoted back in error text
- [ ] Exit codes are documented: 0 = success, 1 = failure, 2 = misuse, 130 = SIGINT
- [ ] Errors printed to stderr, not stdout
- [ ] Typos in flags produce a "Did you mean?" suggestion

### Interactive Behavior
- [ ] TTY detected before enabling prompts, color, animations
- [ ] Every prompt has a `--flag` equivalent for non-interactive use
- [ ] `--yes` / `-y` skips all confirmation dialogs
- [ ] Defaults shown in brackets: `[y/N]`, `[default: us-east-1]`
- [ ] Ctrl-C at any prompt exits cleanly with exit code 130

### Progress & Feedback
- [ ] No silent gaps over 1 second without a spinner or progress indicator
- [ ] Progress indicators written to stderr, not stdout
- [ ] Spinners/bars cleared on completion; terminal state fully restored
- [ ] Long operations show elapsed time on completion
- [ ] Streaming operations print lines as they arrive — no buffering

### Help & Discovery
- [ ] `--help` works on every command and every subcommand
- [ ] Help includes: description, usage, args, flags, and ≥2 examples with real values
- [ ] `--version` outputs `name X.Y.Z` on one line
- [ ] Shell completion scripts provided for bash, zsh, and fish
- [ ] Error messages reference `--help` or relevant docs URL

### Configuration
- [ ] Precedence: CLI flag > env var > local config > user config > system default
- [ ] Config stored in `$XDG_CONFIG_HOME/app/` (default `~/.config/app/`)
- [ ] Every environment variable documented in help text
- [ ] Tool works without any config file using sensible defaults
- [ ] Secrets never stored in config files

### TUI (if applicable)
- [ ] Every action reachable by keyboard; mouse is additive, not required
- [ ] `q` / `Ctrl-C` / `Esc` always exits or goes back
- [ ] Key bindings visible in footer or `?` help overlay
- [ ] Layout adapts to terminal dimensions on resize
- [ ] Color has fallback; tested with `NO_COLOR=1` and `TERM=dumb`
- [ ] Alternate screen used; terminal fully restored on exit

### Scripting & Composability
- [ ] Reads from stdin when no file argument given
- [ ] Idempotent — running twice does not double-apply or error
- [ ] `--dry-run` available on all mutating commands
- [ ] `--` separator supported to end flag parsing
- [ ] `--json` output schema is stable across patch/minor versions

---

## Sources

- **clig.dev** — [Command Line Interface Guidelines](https://clig.dev/) — comprehensive community-maintained guide (Aanand Prasad, Ben Firshman, Carl Tashian, Eva Parish)
- **Jeff D. (Medium)** — [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46) — Heroku / oclif team principles
- **GNU Project** — [Command-Line Interfaces (GNU Coding Standards)](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html)
- **Thoughtworks** — [Elevate developer experiences with CLI design guidelines](https://www.thoughtworks.com/insights/blog/engineering-effectiveness/elevate-developer-experiences-cli-design-guidelines)
- **Atlassian Developer Blog** — [10 Design Principles for Delightful CLIs](https://blog.developer.atlassian.com/10-design-principles-for-delightful-clis/)
- **Lucas Costa** — [UX patterns for CLI tools](https://lucasfcosta.com/2022/06/01/ux-patterns-cli-tools.html)
- **charmbracelet/bubbletea** — [GitHub](https://github.com/charmbracelet/bubbletea) — Go TUI framework (Elm architecture)
- **Inngest Blog** — [Rapidly building interactive CLIs in Go with Bubbletea](https://www.inngest.com/blog/interactive-clis-with-bubbletea)
- **Freedesktop.org** — [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir/latest/)
- **XDG Base Directory Specification** — [xdgbasedirectoryspecification.com](https://xdgbasedirectoryspecification.com/) — adoption advocacy and CLI conventions
- **Google Cloud** — [gcloud CLI stdout/stderr conventions](https://docs.cloud.google.com/sdk/gcloud)
- **Google Developer Documentation** — [Document command-line syntax](https://developers.google.com/style/code-syntax)
