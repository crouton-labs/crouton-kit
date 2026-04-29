---
name: humanloop
description: Pause agent execution to have the human validate decisions, choose between options, or answer freetext — via the `hl` CLI, which blocks on an interactive TUI and returns answers as JSON. Use for material design decisions, approval gates, and picks between meaningful alternatives. Not for trivial yes/no confirmations the agent should decide itself.
allowed-tools: Bash(hl:*), Write, Read
---

# humanloop — Human-in-the-Loop Decision Skill

Use the `hl` CLI to ask the human a structured set of questions and block until they answer. The CLI opens a TUI (auto-splits a tmux pane when `$TMUX` is set), persists progress, and returns a JSON document with typed answers.

## When to use this

Use `hl` when the next step materially depends on a human judgment you cannot make alone:

- **Design decisions** with real tradeoffs (Postgres vs SQLite, library choice, data model).
- **Approval gates** before an irreversible or expensive action (schema migration, mass refactor, deploy).
- **Picks between alternatives** where the agent has 2+ reasonable options and no strong reason to prefer one.
- **Open questions** about constraints the agent does not know (deadlines, stakeholders, compliance).

## When NOT to use this

- Trivial yes/no the agent should answer itself (e.g. "should I write tests?" — yes).
- Questions with obvious correct answers given the code and context.
- Routine confirmations (Claude Code already prompts for destructive tool calls).
- Single freetext questions where a chat reply is lower friction.

If all you need is one freetext answer, just ask inline. Reach for `hl` when there are 2+ structured questions, or a single question that benefits from the TUI's visual context.

## Workflow

1. Write a decisions JSON file matching `hl schema`.
2. Run `hl create <file>`. This **blocks** on the interactive TUI and prints a JSON DecisionsOutput to stdout on success.
3. Parse the output. Match answers to questions by `id` — **never by index**, since the human can skip questions.
4. Act on the answers.

## Question types

| Type | Required fields | Answer shape |
|------|-----------------|--------------|
| `validation` | `id`, `type`, `statement`, `rationale` | `{ id, type: "validation", approved: boolean, comment?: string }` |
| `choice` | `id`, `type`, `question`, `rationale`, `options` (≥2) | `{ id, type: "choice", selected: string, isCustom: boolean, comment?: string }` |
| `freetext` | `id`, `type`, `question`, `rationale` | `{ id, type: "freetext", response: string }` |

`statement` (validation) is a proposition to approve or reject; `question` (choice/freetext) is an interrogative. `rationale` is required on every question — it explains *why* the decision matters and is shown to the human in the TUI.

For `choice`, the human may select a listed option (`isCustom: false`) or type their own (`isCustom: true`). The `selected` string holds the chosen text either way.

## Input example

```json
{
  "title": "Architecture decisions for the capture pipeline",
  "questions": [
    {
      "id": "db",
      "type": "validation",
      "statement": "We'll use Postgres over SQLite for the capture store",
      "rationale": "Need concurrent writes from multiple services; SQLite locks the file"
    },
    {
      "id": "migrate",
      "type": "choice",
      "question": "Which migration tool?",
      "rationale": "Need repeatable schema changes across environments",
      "options": ["Prisma", "Drizzle", "raw SQL with shmig"]
    },
    {
      "id": "retry",
      "type": "freetext",
      "question": "What should the retry policy be on publish failures?",
      "rationale": "Affects the reliability budget and downstream backpressure"
    }
  ]
}
```

## Output shape

```json
{
  "answers": [
    { "id": "db", "type": "validation", "approved": true, "comment": "Yes, ACID + concurrent writes" },
    { "id": "migrate", "type": "choice", "selected": "Drizzle", "isCustom": false },
    { "id": "retry", "type": "freetext", "response": "Exponential backoff capped at 5 attempts, then DLQ" }
  ],
  "completedAt": "2026-04-20T15:23:00.000Z"
}
```

The human **can skip questions**. `answers` may be shorter than `questions`. Always look up by `id`.

## Invocation

```
hl create decisions.json                     # block, print JSON to stdout
hl create decisions.json --output ans.json   # write JSON to file instead
hl create decisions.json --no-visuals        # skip haiku-generated visual context (faster)
hl create decisions.json --no-tmux           # force TUI in current pane inside tmux
hl schema                                    # print the input JSON schema
```

A typical end-to-end flow:

```bash
# 1. Write the decisions file
cat > /tmp/d.json <<'EOF'
{"questions":[{"id":"x","type":"validation",
 "statement":"Postgres over SQLite","rationale":"concurrent writes"}]}
EOF

# 2. Block on the TUI, capture JSON
hl create /tmp/d.json > /tmp/answers.json

# 3. Look up the answer by id
jq '.answers[] | select(.id=="x")' /tmp/answers.json
```

## Key behaviors

- **tmux auto-split.** When `$TMUX` is set, the TUI opens in a new pane to the right. The caller keeps focus. Disable with `--no-tmux`.
- **Progress persistence.** Answers are atomically written to `<file>.progress.json` after every keystroke. If the process is killed, the next `hl create <file>` resumes from where the human left off. The progress file is deleted on full completion; partial files are preserved.
- **Visual context.** With a session id (auto-detected from the most recent Claude Code session in cwd, or pass `--session-id`), Haiku generates a short ANSI context block per question grounded in the conversation history. Disable with `--no-visuals`.

## Exit codes

- `0` — success; JSON emitted to stdout or the file passed to `--output`.
- `1` — error on stderr. Common causes: missing file, invalid JSON, empty `questions` array, no TTY.

If the caller captures stdin and the TUI cannot attach, run inside tmux so `hl` can auto-dispatch to a new pane.

## Authoring tips

- **Minimize questions.** Every question costs the human's attention. Ask only what materially changes the next step.
- **Lead with rationale that a human can act on.** "Need concurrent writes from multiple services" is useful; "architecture decision" is not.
- **Make statements falsifiable.** A validation statement should be a concrete claim, not a vague goal. "We'll use Postgres" ✓. "We should pick a good database" ✗.
- **Give real options.** For choices, the options should be genuine alternatives, not one real answer and filler.
- **Keep ids short and meaningful.** They show up in code reading the answers back.
