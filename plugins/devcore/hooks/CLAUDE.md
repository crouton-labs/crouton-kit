# CLAUDE.md

## Hook overview

Four hooks wired across three events. Two concern code quality enforcement; two implement a coordinated debug-visualization flow.

## code-quality-checker.py (PostToolUse)

Runs after every Write/Edit/MultiEdit. Has **two severity tiers**:

| Check | Output | Effect |
|---|---|---|
| Outdated model names (gpt-4o, claude-3-*, etc.) | `decision: block` + `reason` | Claude-directed; tells Claude to update the model string |
| Legacy/compat patterns (`\blegacy\b`, `backward.*compat`, etc.), TypeScript `any` types, fallback `\|\|`/`??` defaults | `hookSpecificOutput.additionalContext` | Warning only — Claude sees it but isn't forced to retry |

`PostToolUse` cannot prevent a write from landing on disk; `decision: block` here is feedback that causes Claude to self-correct on its next turn, not a pre-write gate.

**Self-exclusion**: the script checks `"code-quality-checker.py" in file_path` and exits early — necessary because the file itself contains the regex patterns it scans for.

**MultiEdit**: all `new_string` values are concatenated before checking, so per-edit line numbers are lost. Only one block decision is emitted even if multiple edits trigger different rules.

## backwards-compat-warning.py (Stop)

Reads `transcript_path` directly to inspect the last assistant message text — Stop hook input does not include assistant message content, so transcript parsing is required. Catches Claude's natural-language explanations (e.g., "to maintain backwards compatibility…"), not code content. Outputs `systemMessage` (shown to user only, not re-injected into Claude's context) so it's a user alert, not a Claude correction.

**Two-layer enforcement**: `code-quality-checker.py` warns on compat patterns in *file content*; `backwards-compat-warning.py` flags the same patterns in *Claude's reasoning* at Stop. They're independent — both can fire on the same turn.

## viz-mark-debug.sh + viz-stop-debug.sh (UserPromptSubmit → Stop)

Two-phase coordination via a tmp marker file: `viz-mark-debug.sh` creates `/tmp/render-viz-debug-{session_id}` when the user submits `/devcore:debug`; `viz-stop-debug.sh` checks for that marker at Stop, deletes it, and fires `render-viz` detached.

Non-obvious constraints:
- **`stop_hook_active` guard** in viz-stop-debug.sh: skips execution when `stop_hook_active == True`. Without this, a blocking Stop hook (like backwards-compat-warning) causes a recursive Stop loop — each block re-triggers Stop.
- `render-viz` is optional: `viz-stop-debug.sh` no-ops silently if the binary isn't on `PATH`.
- `render-viz` runs fully detached (`nohup ... disown`) so it doesn't hold the Stop hook open.
- Marker is session-scoped; parallel sessions don't interfere.
