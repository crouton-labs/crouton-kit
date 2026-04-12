---
name: structured-output
description: Get reliable typed JSON from LLMs using constrained decoding, JSON Schema, Zod, Pydantic, and Instructor. Use when implementing structured output, JSON schema validation, typed API responses, constrained generation, Zod schemas, Pydantic models, schema design for LLM extraction, streaming structured data, or debugging malformed JSON responses from models.
---

# Structured Output

Structured output isn't post-processing — the model never produces invalid JSON that gets fixed afterward. It's **grammar-guided token masking**: the JSON schema is compiled into a finite-state machine (or pushdown automaton for nested structures), and at each decode step, any token that would violate the grammar gets zeroed out of the logit distribution before sampling. The model only ever emits valid tokens.

This matters because it changes the failure mode. Without constrained decoding, you get malformed JSON that breaks parsers. With it, you get valid JSON that may still be semantically wrong. The enforcement is syntactic, not semantic. Defense-in-depth requires both.

For code examples and provider-specific patterns, see [reference.md](reference.md).

## How It Works (Briefly)

Willard & Louf (2023) — the Outlines paper — established the canonical mechanism:

1. Compile the JSON schema → FSM (or PDA for recursive/nested schemas)
2. Pre-build a token mask index: for each FSM state, which vocabulary tokens are valid?
3. At each decode step: look up current state → apply mask → zero invalid logits → sample

OpenAI added this in August 2024 (with model fine-tuning on top); Anthropic went GA in late 2025. Both cache compiled grammars — Anthropic for 24 hours, OpenAI persistently by schema hash. First use adds 100–300ms (Anthropic) to latency. Open-source stacks (vLLM, SGLang) use XGrammar, which achieves <40µs per token via offline pre-classification of context-independent vocabulary tokens.

## The Quality Problem

Constrained decoding has a cost. Tam et al. (2024) — "Let Me Speak Freely?" — showed JSON constraints dropped GPT-3.5 math accuracy from **76% → 49%**. The mechanism: forced key ordering means the model must generate answer tokens before reasoning tokens, which disrupts sequential reasoning.

The fix is schema design, not giving up on structured output.

## Schema Design: The #1 Lever

The PARSE paper (2025) found structural reorganization was the top optimization for extraction accuracy — more impactful than model choice or prompt engineering. A single ambiguous field name (`final_choice` alongside `potential_final_choices`) collapsed accuracy from **95% → 4.5%** in Instructor's experiments.

### The reasoning field trick

Put a `reasoning` or `thinking` field **first** in your schema. LLMs generate keys in order — reasoning before answer tokens restores chain-of-thought within structured output. Instructor showed this alone recovers accuracy from **33% → 92%** on GSM8K.

```json
{
  "type": "object",
  "properties": {
    "reasoning": { "type": "string", "description": "Step-by-step analysis before concluding" },
    "answer": { "type": "string" },
    "confidence": { "type": "string", "enum": ["high", "medium", "low"] }
  },
  "required": ["reasoning", "answer", "confidence"],
  "additionalProperties": false
}
```

### Rules that matter

- Flat over nested. PARSE found flattening was the most frequent successful optimization (55% of cases).
- Specific field descriptions: "Full legal name including first and last" beats "The name". Specific descriptions reduced errors by up to 64.7% (PARSE).
- String enums for constrained choices — reduces downstream cleaning by ~70% (PARSE).
- `minimum`/`maximum`/`pattern` — neither Anthropic nor OpenAI enforces these at the grammar level. Validate post-generation.
- Max 24 optional parameters (Anthropic hard limit). Each optional field roughly doubles grammar state space.
- Recursive schemas not supported on Anthropic.

These patterns apply directly to [tool-design](../tool-design/SKILL.md) — tool schemas are structured output schemas.

## The Production Loop

```
Type system (Zod/Pydantic)
  → JSON Schema
    → LLM with constrained decoding
      → Validate (syntactic: already guaranteed; semantic: your validators)
        → Retry with error feedback on failure
```

Libraries doing this loop:
- **Python**: Instructor wraps OpenAI/Anthropic/Groq/etc, feeds validation errors back into the conversation, retries up to `max_retries`.
- **TypeScript/OpenAI**: `zodResponseFormat` + `beta.chat.completions.parse()` — returns `.parsed` typed directly.
- **TypeScript/Anthropic**: `zodOutputFormat` helper from `@anthropic-ai/sdk/helpers/zod`.
- **TypeScript/any provider**: Vercel AI SDK `generateObject` / `streamObject` with a Zod schema.

Zod v4 has native `z.toJSONSchema()` for converting schemas to JSON Schema format.

## Provider Comparison

| | Anthropic | OpenAI |
|---|---|---|
| API param | `output_config.format` | `response_format.json_schema` |
| Recursive schemas | **No** | Yes (~5 levels) |
| Numerical constraints | **No** (use descriptions) | Advisory only |
| Optional field limit | 24 per request | No stated limit |
| Union limit | 16 union params | No stated limit |
| Compilation cache | 24 hours | Persistent by hash |
| First-use latency | 100–300ms | Up to 1min (complex) |

## Streaming Structured Output

JSON is only valid when complete, but UIs need progressive updates. Partial JSON parsers — `partial-json` (npm), `@streamparser/json` — emit whatever is structurally coherent mid-stream.

**Performance trap**: naive reparse-from-zero on each chunk is O(n²) and breaks past ~7.6KB. Use stateful incremental parsers for O(n) throughput.

Full schema validation cannot run until the stream completes — incomplete data may yet conform. `zod-stream` provides path-level completeness tracking so you know which fields are settled.

Vercel AI SDK's `streamObject` returns a `partialObjectStream` that emits typed partial objects field-by-field. Its `elementStream` emits only fully completed array elements.

**Key failure stat:** A single ambiguous field name (`final_choice` alongside `potential_final_choices`) collapsed accuracy from 95% → 4.5% in Instructor's experiments. Audit field names as a unit.

For a full failure mode catalog with mitigations, see [reference.md](reference.md).

## Sources

- [Willard & Louf (2023) — Efficient Guided Generation (Outlines)](https://arxiv.org/abs/2307.09702)
- [Tam et al. (2024) — Let Me Speak Freely?](https://arxiv.org/abs/2408.02442)
- [PARSE (2025) — Schema Optimization for Entity Extraction](https://arxiv.org/html/2510.08623v1)
- [XGrammar (2024) — 100x speedup via context-independent token classification](https://arxiv.org/abs/2411.15100)
- [Instructor blog — Bad Schemas Could Break Your LLM Structured Outputs](https://python.useinstructor.com/blog/2024/09/26/bad-schemas-could-break-your-llm-structured-outputs/)
- [Anthropic Structured Outputs docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [OpenAI Structured Outputs blog](https://openai.com/index/introducing-structured-outputs-in-the-api/)
