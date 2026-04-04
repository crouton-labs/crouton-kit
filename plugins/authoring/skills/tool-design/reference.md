# Tool Design Reference

Implementation patterns and research citations for [SKILL.md](SKILL.md).

---

## Tool Definition Formats

### MCP Format (Model Context Protocol, Nov 2025 spec)

```json
{
  "name": "get_weather",
  "title": "Weather Information Provider",
  "description": "Get current weather conditions for a city or zip code. Use when the user asks about current weather or temperature. Does NOT provide forecasts — use get_forecast for multi-day outlooks.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City name or US zip code, e.g. 'San Francisco' or '94105'"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature unit. Defaults to celsius."
      }
    },
    "required": ["location"]
  },
  "annotations": {
    "readOnlyHint": true,
    "destructiveHint": false,
    "idempotentHint": true,
    "openWorldHint": true
  }
}
```

**MCP annotations** — behavioral hints for client UI decisions (confirmation prompts):
- `readOnlyHint` — tool does not modify its environment (default: false)
- `destructiveHint` — modifications are irreversible (default: true)
- `idempotentHint` — safe to retry with same args (default: false)
- `openWorldHint` — interacts with external systems (default: true)

### Anthropic API Format

```python
tool = {
    "name": "get_weather",
    "description": "Get current weather conditions...",  # same description principles
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {"type": "string", "description": "City name or zip code"},
            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
        },
        "required": ["location"]
    },
    "input_examples": [
        {"location": "San Francisco", "unit": "celsius"},
        {"location": "94105"}
    ]
}
```

`input_examples` is a beta feature (Nov 2025). Improved complex parameter accuracy from **72% to 90%** in Anthropic's internal testing. Token cost: ~20–50 tokens for simple examples. Not compatible with `defer_loading` (tool search).

### OpenAI Format (strict mode)

```json
{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "Get current weather conditions...",
    "strict": true,
    "parameters": {
      "type": "object",
      "properties": {
        "location": {"type": "string", "description": "City name or zip code"},
        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
      },
      "required": ["location", "unit"],
      "additionalProperties": false
    }
  }
}
```

OpenAI strict mode: all fields must be in `required`, use `"type": ["string", "null"]` for optional fields, `additionalProperties: false` on all objects. Guarantees schema compliance.

---

## Description Patterns: Before / After

### Too Vague → Specific

```
# Before — model can't determine scope
"Gets information about a user."

# After — explicit what/when/not
"Fetch a user's profile, preferences, and account status by user ID.
Use when you need to verify account state before taking an action,
or when the user asks about their own settings. Does NOT return
authentication credentials or payment information."
```

### Ambiguous Tool Set → Explicit Disambiguation

When you have overlapping tools, each description should explain the distinction:

```
# search_documents
"Search the current repository's indexed documents for matching content.
Only searches files in the local index — does NOT search the web.
Use when the user asks about internal docs, READMEs, or project files.
For web searches, use web_search instead."

# web_search
"Search the public web for current information, news, and external resources.
Use when the user asks about topics not covered in local project files,
or when results need to be current (post-training). For internal docs,
use search_documents instead."
```

### Buried Constraints → Front-Loaded

```
# Before — critical constraint buried at the end
"This tool searches log files using ripgrep syntax. It can be used to
find patterns in application logs stored in /var/log. Note that the
pattern must be a valid regex — backslashes need to be double-escaped."

# After — constraint first (+6% accuracy, per OpenAI's function calling guide)
"Search application logs using regex (backslashes must be double-escaped,
e.g. '\\\\.' to match a literal dot). Returns matching lines with file
path and line number. Use for log investigation in /var/log. Does NOT
search non-log files — use search_code for source files."
```

---

## Parameter Schema Patterns

### Enums for Closed Domains

```json
{
  "status": {
    "type": "string",
    "enum": ["active", "inactive", "suspended", "pending"],
    "description": "Account status filter. Use 'pending' for accounts awaiting email verification."
  }
}
```

Without an enum, the model may pass `"enabled"`, `"on"`, or `"active_user"` — valid JSON that silently breaks the filter.

### Flat vs Nested (Prefer Flat)

```json
// Fragmented — no clear relationship
"start_date": "...",
"end_date": "...",
"timezone": "..."

// Grouped — appropriate when always used together
"date_range": {
  "type": "object",
  "properties": {
    "start": { "type": "string", "description": "ISO 8601, e.g. '2024-01-15'" },
    "end": { "type": "string", "description": "ISO 8601. Defaults to today." },
    "timezone": { "type": "string", "description": "IANA name, e.g. 'America/New_York'. Defaults to UTC." }
  },
  "required": ["start"]
}
```

Rule: nest only when the grouped parameters are always used together and form a coherent semantic unit. A 4-level nested object is a tool redesign problem.

### Optional Parameter Descriptions

Don't just describe what optional params do — describe when to deviate from the default:

```json
"max_results": {
  "type": "integer",
  "description": "Maximum results to return. Defaults to 10. Use higher values (up to 100) only when the user explicitly asked for a comprehensive list.",
  "default": 10
}
```

### Negative Constraints in Parameter Descriptions

Prevent the model from stuffing unrelated data into text fields:

```json
"query": {
  "type": "string",
  "description": "Natural language search query. Do NOT include date ranges or file type filters here — use the 'date_range' and 'file_types' parameters instead. Supports boolean operators: AND, OR, NOT."
}
```

---

## Error Design Patterns

### Actionable vs Opaque

```
# Opaque — model has nothing to work with, retries same broken call
"Error: validation failed"

# Actionable — model knows field, received value, expected values
"Invalid value for 'status': received 'enabled', valid values are:
active, inactive, suspended, pending"

# Actionable with path — nested field clearly identified
"Missing required field 'date_range.start' — provide a start date
in ISO 8601 format, e.g. '2024-01-15'"
```

### Structured Error for Tool Use Context

```json
{
  "error": true,
  "code": "INVALID_PARAMETER",
  "parameter": "status",
  "received": "enabled",
  "valid_values": ["active", "inactive", "suspended", "pending"],
  "message": "Invalid value for 'status' parameter",
  "suggestion": "Use 'active' for accounts in normal standing"
}
```

The model can parse this and extract exactly what to fix. The `suggestion` field closes the loop for non-obvious corrections.

### Permission Errors

```
# Bad — model doesn't know what to do next
"Error: insufficient permissions"

# Good — model knows the required action
"Error: 'files:write' scope required, current session has 'files:read' only.
Request a new access token with expanded scope before retrying."
```

### MCP Error Distinction

MCP spec defines two categories:
- **Tool execution errors** (`isError: true` in tool result) — actionable, SHOULD be shown to the model for self-correction
- **Protocol errors** (JSON-RPC error codes) — structural issues, harder to recover from

Return failures as tool execution errors in the result body, not as protocol-level failures. The model can reason about tool results; it can't recover from protocol errors.

---

## Benchmark Data

### API-Bank Error Distribution (Li et al., EMNLP 2023)

73 tools, 753 API calls evaluated across weaker models:

| Error Type | Frequency | Root Cause |
|---|---|---|
| **No API Call** | **36.8%** | Ambiguous description — model decides tool doesn't apply |
| False Format | 23.7% | Syntactic schema errors — fixable with strict mode |
| API Hallucination | 15.9% | Model invents non-existent tools/parameters |
| Invalid Parameters | 8.0% | Semantic parameter errors |
| Missing Parameters | 1.2% | Required fields not provided |

**The takeaway**: The biggest failure mode is the model deciding *not to call any tool* (36.8%). This is a description problem, not a schema problem. Descriptions that fail to clearly communicate "when to use this" leave the model to err on the side of not calling.

### Tool Count vs Accuracy

- BFCL v4 benchmark average: **3 tool choices per test** — most benchmarks massively underrepresent real-world tool counts
- OpenAI considers <100 tools and <20 args per tool "in-distribution" for gpt-5.2
- A 2025 study found accuracy degrades **85–91%** as catalog size approaches 128K tokens
- Mitigation at scale: deferred loading (Anthropic), tool search tool, routing layers

### Natural Language Tools (2025, arXiv:2510.14453)

Replacing JSON tool calling with natural language outputs improved accuracy by **18.4 percentage points** and reduced output variance by **70%** across 10 models. Structured JSON schemas impose a cognitive tax — models must simultaneously reason about the task *and* satisfy format constraints. Consider whether strict structure is worth the accuracy cost for your use case.

### BFCL v4 (Patil et al., ICML 2025)

Top models ace one-shot selection but "still stumble when they must remember context, manage long conversations, or decide when not to act." Multi-turn tool use and the "when not to call" decision are the active failure frontiers.

---

## Tool Count Mitigation Strategies

When you can't reduce tool count:

**Deferred loading** (Anthropic): Tools registered but not loaded into context by default. A "tool search" tool lets the model retrieve relevant tool definitions on demand. Accuracy at 128K token catalogs is otherwise unusable.

```python
# Mark tool as deferred — not injected into context initially
tool = {
    "name": "specialized_reporting_tool",
    "defer_loading": True,
    # ...
}
```

**Namespacing**: Prefix with service name when tools span multiple systems. `github_list_prs`, `slack_send_message`, `asana_search_tasks`. Essential at scale — both for human readability and model routing disambiguation.

**Semantic grouping**: Keep related tools adjacent in the tool list. Models attend somewhat sequentially — clustering tools by domain reduces cross-domain confusion.

---

## Sources

- [Anthropic: Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents) — tool consolidation, naming, error design, evaluation methodology
- [Anthropic: Implement Tool Use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use) — `input_examples`, strict mode, parameter best practices
- [Anthropic: Advanced Tool Use](https://www.anthropic.com/engineering/advanced-tool-use) — `defer_loading`, tool search, allowed_callers
- [OpenAI: Function Calling Guide](https://platform.openai.com/docs/guides/function-calling) — strict mode, parallel calling, schema patterns
- [MCP Specification (Nov 2025)](https://modelcontextprotocol.io/specification/2025-11-25) — tool schema, annotations, error handling, structured outputs
- API-Bank (Li et al., 2023): [arXiv:2304.08244](https://arxiv.org/abs/2304.08244) (EMNLP 2023)
- BFCL (Patil et al., 2025): [OpenReview](https://openreview.net/forum?id=2GmDdhBdDk) (ICML 2025)
- Natural Language Tools (2025): [arXiv:2510.14453](https://arxiv.org/abs/2510.14453)
- ToolACE (2025): [arXiv:2409.00920](https://arxiv.org/abs/2409.00920) (ICLR 2025)
- Gorilla/APIBench (Patil et al., 2023): [arXiv:2305.15334](https://arxiv.org/abs/2305.15334)
