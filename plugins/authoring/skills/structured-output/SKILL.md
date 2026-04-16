---
name: structured-output
description: Get reliable typed JSON from LLMs using constrained decoding, JSON Schema, Zod, Pydantic, and Instructor. Use when implementing structured output, JSON schema validation, typed API responses, constrained generation, Zod schemas, Pydantic models, schema design for LLM extraction, streaming structured data, or debugging malformed JSON responses from models.
---

# Structured Output

Structured output guarantees valid typed JSON from LLMs — the model can only emit tokens that conform to your schema. The question isn't how it works but when you need it.

**Use when:** data extraction, API responses, agent tool outputs, any downstream code that parses the response.

**Don't use when:** prose, creative writing, chat, or when the quality cost outweighs the reliability gain.

For code examples and provider-specific patterns, see [reference.md](reference.md).

## The Quality Problem

Constrained decoding has a cost. Tam et al. (2024) showed JSON constraints dropped math accuracy by 26–32 percentage points across tested models. The mechanism: forced key ordering means the model must generate answer tokens before reasoning tokens, disrupting sequential reasoning.

The fix is schema design, not giving up on structured output. Enforcement is syntactic, not semantic — valid JSON can still be semantically wrong.

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

---

For mechanism details, provider comparison, streaming patterns, and failure modes, see [reference.md](reference.md).
