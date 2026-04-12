---
name: tool-design
description: Design tool interfaces for LLM agents — descriptions, parameter schemas, error messages, granularity, and composition. Use when creating function calling tools, building MCP servers, designing agent tool interfaces, writing tool descriptions, or debugging why a model calls the wrong tool, hallucinates parameters, or fails to call a tool at all.
---

# Tool Design for LLM Agents

Tools are not APIs with documentation bolted on. They're prompt engineering. When a tool is registered, its name, description, and schema get injected into the system prompt as structured text. The model reads them as context, not metadata. A poorly written description doesn't cause the model to "misunderstand" the tool — it causes the model to have genuinely wrong beliefs about when and how to use it.

The consequences are predictable. According to API-Bank (Li et al., 2023, EMNLP), the most common failure mode isn't calling the wrong tool — it's **not calling a tool at all** (36.8% of errors). Models encounter a tool with an ambiguous description and decide the tool doesn't apply. Description quality is the highest-leverage variable in tool design.

For implementation examples, schema patterns, and benchmark citations, see [reference.md](reference.md).

## Descriptions Are the Interface

The model reads descriptions to answer two questions in sequence: "Does this tool match what I need?" (selection) and "How do I call it correctly?" (construction). Both fail with inadequate descriptions.

**Write for the selection step first.** The model pattern-matches your description against the user's intent. Vague descriptions create ambiguity — the model can't tell whether to use your tool or a similar one, and often decides to use neither.

A description must answer:

1. **What it does** — the core action in one concrete sentence
2. **When to use it** — explicit trigger conditions, not vague applicability
3. **What it doesn't do** — explicit exclusions prevent generalization errors

```
# Bad
"Gets information about a user."

# Good
"Fetch a user's profile, preferences, and account status by user ID.
Use when you need to verify account state before taking an action,
or when the user asks about their own settings. Does NOT return
authentication credentials or payment information."
```

The bad description leaves the model guessing about scope. The good one eliminates ambiguity on both ends: when to reach for it, and when not to.

**Front-load critical constraints.** OpenAI's function calling guide found that placing key constraints in the first sentence of a tool description improved accuracy by 6% vs burying them after context. The model attends more strongly to early content.

**Name the tool's negative space.** If you have `search_documents` and `search_web`, each description should explain why you'd use one over the other. Overlap between descriptions is the primary cause of wrong-tool selection.

**Aim for 3-4 sentences minimum** for any non-trivial tool. Include what the tool does NOT return. Anthropic's guidance: "Describe your tool to a new hire on your team" — make implicit context explicit.

## Parameter Design

Parameters are the model's interface to the tool's internals. Every naming and typing decision affects whether the model fills them correctly.

**Use semantic names.** `user_id` not `user`. `departure_date` not `date`. `timeout_seconds` not `tmo`. The model infers meaning from names — terse or abbreviated names increase hallucination risk. Anthropic found that resolving UUIDs to human-readable names "significantly improves Claude's precision in retrieval tasks."

**Prefer enums over free-text for closed domains.** When valid values are bounded, enums eliminate hallucination for that parameter. `"unit": { "enum": ["celsius", "fahrenheit"] }` prevents the model from passing `"c"`, `"C"`, or `"degrees_c"`.

**Keep schemas flat.** OpenAI's function calling guide: "Deeply nested parameters encourage the model to omit fields or misuse arguments." Nest only when the data is genuinely hierarchical. A flat schema with 4 parameters is easier to call correctly than a nested schema with 2.

**Document optional parameters with deviation guidance.** Don't just describe what they do — describe *when to deviate from the default*. "Defaults to 10. Use higher values only when the user explicitly asks for comprehensive results." This prevents unnecessary parameter stuffing.

**Use `input_examples` for complex parameters.** Anthropic's `input_examples` feature improved complex parameter handling from 72% to 90% accuracy. Especially useful for parameters with non-obvious correlation (e.g., different escalation fields that are appropriate for critical bugs but not feature requests).

**Enable strict mode.** Both Anthropic and OpenAI offer `strict: true` for tool schemas — guarantees calls match the schema exactly, eliminating format-related failures (API-Bank: 23.7% of errors). Always enable when available. See [structured-output](../structured-output/SKILL.md) for schema design principles.

## Error Messages That Enable Recovery

Errors are feedback the model uses to correct its next call. An opaque error produces one outcome: the model retries the same call, potentially looping indefinitely. A clear error enables self-correction.

Design errors to answer: What was wrong? What was received? What was expected?

```
# Useless — model has nothing to work with
"Error: validation failed"

# Recoverable — model knows exactly what to fix
"Invalid value for 'status': received 'enabled', valid values are:
active, inactive, suspended, pending"

# Recoverable with path
"Missing required field 'date_range.start' — provide a start date
in ISO 8601 format, e.g. '2024-01-15'"
```

**Never swallow failures silently.** A tool that catches exceptions and returns `{ "success": false }` looks identical to a tool that correctly found nothing. The model will report "no results" when the problem was a fixable bad query.

**MCP distinguishes two error categories** (see reference.md): tool execution errors (actionable, show to the model) vs protocol errors (structural, less recoverable). Design your tool to return execution errors in the result, not as protocol-level failures.

**Prevent infinite loops.** The "infinite loop" failure mode — model retrying the exact same broken call — is a production concern. Include retry guidance in tool descriptions and recovery suggestions in errors: "Use narrower filters to reduce result set" rather than leaving the model to improvise.

## Granularity

The central question: one tool that does many things, or many tools that do one thing each?

**Default to focused tools.** A tool that does one thing has a description that can be written in one sentence, parameters that are all obviously relevant, and errors that point to exactly what went wrong.

**Consolidate when operations always travel together.** Anthropic identifies two valid consolidation patterns:

1. **CRUD consolidation** — group related CRUD operations under one tool with an `action` parameter (`action: "create" | "read" | "update" | "delete"`). Reduces tool count and simplifies selection for operations on the same entity.

2. **Workflow consolidation** — merge multi-step workflows into single composite tools that execute multiple operations internally (e.g., `schedule_meeting` that handles availability lookup + calendar creation internally). Reduces orchestration burden and eliminates intermediate context waste.

**When to split:** description requires "and" or "/", parameters are only relevant for some operations, different operations return incompatible schemas, or the tool name can't clearly describe all operations.

**The action-parameter trap.** Combining unrelated operations under one tool name with an `action` parameter creates overly complex schemas where different actions need different parameters. The description can never be precise. Split it unless the operations truly share all parameters.

## Tool Count and Accuracy

Each additional tool in the context window is a decision the model must make about whether to use it. Tool count is directly correlated with selection error.

- **<10 tools**: Reliable selection across models
- **10–100 tools**: Performance depends heavily on description quality (OpenAI considers this in-distribution for gpt-5.2)
- **100+ tools**: Requires mitigation — tool search, deferred loading, routing layers
- **At scale**: A 2025 study found accuracy degrades 85–91% as catalog size approaches 128K tokens

For large tool sets, use Anthropic's deferred loading (`defer_loading`) — tools not loaded into context initially, retrieved by a search tool when needed. This is incompatible with `input_examples`.

**The quality/quantity tradeoff is real.** Anthropic's official guidance: "More tools don't always lead to better outcomes." Ten well-described tools outperform fifty vague ones.

## Composition

When tools are designed to chain together, make the relationship explicit in descriptions:

- **Pagination**: "If `next_cursor` is present in the response, pass it to `cursor` on the next call."
- **Prerequisites**: "Requires a `session_id` from `authenticate`. Call that first if you don't have one."
- **Output-as-input**: "Returns an array of `record_id` strings. Pass individual IDs to `get_record` for full details."

Keep identifier types consistent across your tool suite. If `search_users` returns `user_id`, then `send_message` should accept `user_id` — not `userId` or `uid`. Schema inconsistency forces the model to notice and correct mismatches silently, which it often won't.

Design tool outputs to be minimally sufficient. A tool that returns 50 fields when 3 are relevant fills the context window with noise. Return what the model needs to continue. Provide separate detail-retrieval tools if needed.

