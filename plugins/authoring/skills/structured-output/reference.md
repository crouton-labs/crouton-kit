# Structured Output Reference

Implementation patterns, provider details, and failure modes for [SKILL.md](SKILL.md).

---

## TypeScript: Zod + Anthropic SDK

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const ExtractionSchema = z.object({
  reasoning: z.string().describe("Step-by-step analysis before concluding"),
  entities: z.array(z.object({
    name: z.string().describe("Full entity name as it appears in text"),
    type: z.enum(["person", "organization", "location"]),
    relevance: z.enum(["primary", "secondary"]),
  })),
  summary: z.string().describe("One-sentence summary of the document's main claim"),
});

const client = new Anthropic();
const response = await client.messages.create({
  model: "claude-opus-4-5",
  max_tokens: 2048,
  messages: [{ role: "user", content: documentText }],
  ...zodOutputFormat(ExtractionSchema, { name: "extraction" }),
});

// response.content[0].text is guaranteed valid JSON matching ExtractionSchema
const result = ExtractionSchema.parse(JSON.parse(response.content[0].text));
```

**Zod v4 native JSON Schema conversion** (no external packages):
```typescript
import { z } from "zod/v4";
const schema = z.object({
  reasoning: z.string().meta({ description: "Analysis before answer" }),
  answer: z.number().int(),
});
const jsonSchema = z.toJSONSchema(schema);
// { type: "object", properties: {...}, required: [...], additionalProperties: false }
```

---

## TypeScript: Zod + OpenAI SDK

```typescript
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// OpenAI Zod constraints: no .optional() — use z.union([z.string(), z.null()])
// No z.record(), max 5 nesting levels, max 100 properties per object
const ClassificationSchema = z.object({
  reasoning: z.string().describe("Chain-of-thought before final classification"),
  category: z.enum(["bug", "feature", "question", "documentation"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  assignee: z.union([z.string().describe("GitHub username"), z.null()]),
});

const client = new OpenAI();
const completion = await client.beta.chat.completions.parse({
  model: "gpt-5.2",
  messages: [{ role: "user", content: issueText }],
  response_format: zodResponseFormat(ClassificationSchema, "classification"),
});

const result = completion.choices[0].message.parsed; // fully typed, no parse step needed
```

---

## Python: Pydantic + Instructor

Instructor wraps any provider and feeds validation errors back into the conversation as a retry.

```python
import instructor
from pydantic import BaseModel, field_validator
from anthropic import Anthropic
from typing import Literal

class ContractClause(BaseModel):
    reasoning: str  # first field — chain-of-thought before extraction
    clause_type: Literal["liability", "termination", "payment", "IP", "other"]
    obligation_party: str = Field(description="Which party bears this obligation")
    effective_date: str = Field(description="ISO 8601 date or 'upon signing'")
    risk_level: Literal["high", "medium", "low"]

    @field_validator("effective_date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        if v != "upon signing" and not re.match(r"\d{4}-\d{2}-\d{2}", v):
            raise ValueError("Must be ISO 8601 (YYYY-MM-DD) or 'upon signing'")
        return v

client = instructor.from_anthropic(Anthropic())
clause = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    max_retries=3,  # failed validators → error appended to conversation → retry
    response_model=ContractClause,
    messages=[{"role": "user", "content": clause_text}],
)
# clause is a typed ContractClause — validation already passed
```

**Runtime context grounding** (verify citations against source):
```python
def verify_citation(value: str, context: dict) -> str:
    if value not in context["source_text"]:
        raise ValueError(f"Citation '{value}' not found in source document")
    return value

class CitedClaim(BaseModel):
    claim: str
    direct_quote: Annotated[str, AfterValidator(verify_citation)]

# Pass source_text at call time
client.chat.completions.create(
    ...,
    response_model=CitedClaim,
    context={"source_text": original_document},
)
```

---

## TypeScript: Vercel AI SDK

```typescript
import { generateObject, streamObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const ReportSchema = z.object({
  reasoning: z.string(),
  title: z.string().describe("Descriptive title under 80 characters"),
  sections: z.array(z.object({
    heading: z.string(),
    content: z.string(),
    citations: z.array(z.string()),
  })),
  confidence: z.enum(["high", "medium", "low"]),
});

// Non-streaming
const { object } = await generateObject({
  model: anthropic("claude-opus-4-5"),
  schema: ReportSchema,
  prompt: researchQuery,
});

// Streaming — partial objects emitted as fields complete
const { partialObjectStream } = await streamObject({
  model: anthropic("claude-opus-4-5"),
  schema: ReportSchema,
  prompt: researchQuery,
});

for await (const partial of partialObjectStream) {
  // partial.title appears early; partial.sections grows element by element
  renderUI(partial);
}

// For arrays: elementStream emits only fully completed elements (no layout shift)
const { elementStream } = await streamObject({
  model: anthropic("claude-opus-4-5"),
  output: "array",
  schema: z.object({ item: z.string(), score: z.number() }),
  prompt: "...",
});
for await (const element of elementStream) {
  appendToList(element); // complete, validated element
}
```

---

## Schema Design: Good vs Bad

### Field naming

```json
// BAD — ambiguous siblings cause 95% → 4.5% accuracy collapse (Instructor)
{
  "potential_final_choices": ["option A", "option B"],
  "final_choice": "option A"
}

// GOOD — unambiguous, no overlap in semantics
{
  "candidates": ["option A", "option B"],
  "selected": "option A"
}
```

### Flat vs nested

```json
// BAD — nested adds grammar states, increases model confusion
{
  "contact": {
    "address": {
      "street": "...",
      "city": "...",
      "country": "..."
    },
    "phone": "..."
  }
}

// GOOD — flat, PARSE found this was the most frequent successful optimization (55%)
{
  "street_address": "...",
  "city": "...",
  "country": "...",
  "phone": "..."
}
```

### Reasoning field position

```json
// BAD — answer before reasoning disrupts sequential chain-of-thought
{
  "verdict": "liable",
  "reasoning": "..."
}

// GOOD — reasoning first; recovers 33% → 92% on math benchmarks (Instructor/GSM8K)
{
  "reasoning": "...",
  "verdict": "liable"
}
```

### Optional fields

```json
// BAD — .optional() doesn't work in OpenAI strict mode; unclear semantics
{
  "nickname": { "type": "string" }
}

// GOOD — explicit null union, semantics are clear, required array complete
{
  "nickname": { "type": ["string", "null"], "description": "Preferred name, or null if not provided" }
}
```

---

## Provider Comparison

| Feature | Anthropic (Claude) | OpenAI (gpt-5.2+) | Open-source (vLLM/SGLang) |
|---|---|---|---|
| **Mechanism** | Grammar-compiled constrained decoding | CFG constrained decoding + fine-tuning | XGrammar, LLGuidance, or Outlines backend |
| **API parameter** | `output_config.format.type: "json_schema"` | `response_format.type: "json_schema"` | Provider-dependent |
| **Guaranteed conformance** | Yes | Yes | Yes |
| **Streaming** | Yes (accumulate then parse) | Yes (partial JSON stream) | Yes |
| **Recursive schemas** | **No** | Yes (~5 levels max) | Yes (grammar-level) |
| **Regex / pattern** | Simple patterns only | Not enforced | Yes |
| **Numerical constraints** | **Not enforced** — put in descriptions | Advisory only | Yes |
| **String constraints** | **Not enforced** | **Not enforced** | Yes |
| **Array minItems** | 0 or 1 only | Not enforced | Yes |
| **Optional field limit** | 24 per request | No stated limit | No limit |
| **Union-typed field limit** | 16 per request | No stated limit | No limit |
| **Max strict tools** | 20 per request | No stated limit | N/A |
| **Compilation cache** | 24 hours | Persistent by schema hash | N/A (local) |
| **First-use latency** | 100–300ms | Up to 1min for complex schemas | Depends on backend |
| **SDK helpers** | `zodOutputFormat` | `zodResponseFormat`, `beta.chat.completions.parse` | N/A |

**XGrammar** (CMU, 2024) is the current open-source performance leader: pre-classifies vocabulary into context-independent tokens (checked offline once) and context-dependent tokens (checked at runtime), achieving <40µs per decode step — 100x over prior work. Integrated into vLLM, TGI, and MLC-LLM.

---

## Streaming: Partial JSON Parsing

```typescript
import { parse, Allow } from "partial-json";

// Allow.STR | Allow.OBJ — strings and objects may be incomplete
// Allow.ARR — arrays may be incomplete
// Allow.ALL — everything may be incomplete
const partial = parse('{"name": "Jo', Allow.STR | Allow.OBJ);
// → { name: "Jo" }

// WRONG — O(n²): reparsing from zero on each chunk breaks past ~7.6KB
let accumulated = "";
for await (const chunk of stream) {
  accumulated += chunk;
  const partial = parse(accumulated, Allow.ALL); // re-scans entire string each time
  render(partial);
}

// RIGHT — stateful incremental parser, O(n)
import { StreamingJsonParser } from "@streamparser/json";
const parser = new StreamingJsonParser({ emitPartialTokens: true });
parser.onValue = ({ value, key, parent }) => renderField(key, value);
for await (const chunk of stream) {
  parser.write(chunk); // only scans new bytes
}
```

**Mid-stream validation** with `zod-stream`:
```typescript
import { ZodStream } from "zod-stream";

const zodStream = new ZodStream();
const extractionStream = await zodStream.create({
  completionPromise: streamResponse,
  response_model: { schema: ReportSchema, name: "report" },
});

for await (const partial of extractionStream) {
  // partial.$zodstream.completedPaths tells you which fields are settled
  if (partial.$zodstream.completedPaths.includes("title")) {
    renderTitle(partial.title); // safe to use — field is complete
  }
}
```

---

## Failure Mode Catalog

### 1. Silent semantic failures (most dangerous)

**Symptom**: schema validates, downstream logic silently corrupts.
**Cause**: model fills required field with `""`, `0`, `null`, or placeholder text when it lacks information.
**Fix**: semantic validators that reject empty values.

```python
@field_validator("obligation_party")
@classmethod
def not_empty(cls, v: str) -> str:
    if not v.strip():
        raise ValueError("obligation_party cannot be empty — extract from text or raise")
    return v
```

```typescript
z.string().min(1, "Field cannot be empty — must be extracted from input")
z.string().refine(s => s !== "unknown" && s !== "N/A", "Must be a specific value")
```

### 2. Truncation mid-JSON

**Symptom**: valid tokens, incomplete object, stream ends unexpectedly.
**Cause**: `max_tokens` hit before generation completed.
**Fix**: set `max_tokens` generously (2-3x your expected output). FSM-based frameworks (vLLM + XGrammar) can resume from a saved FSM state; in hosted APIs, retry is the only option.

### 3. Reasoning degradation

**Symptom**: accuracy drops on multi-step tasks compared to unstructured prompting.
**Cause**: key ordering in schema forces model to generate conclusions before reasoning, breaking sequential chain-of-thought. Schall & de Melo (RANLP 2025) showed this causes semantic drift from accumulated low-probability token selection.
**Fix (ranked)**:
1. `reasoning` field first in schema — recovers most quality loss at zero cost
2. Two-pass: generate free text, then convert to JSON (2x inference cost, near-baseline accuracy)
3. Use a larger model — Opus has more internal diversity than Sonnet/Haiku

### 4. Constraint budget exceeded (Anthropic)

**Symptom**: API error on schema submission, not on generation.
**Cause**: >24 optional parameters or >16 union-typed parameters. Each optional field roughly doubles grammar state space; each union creates exponential compilation cost.
**Fix**: flatten the schema (combine related optional fields into a single nullable description string), reduce union depth.

### 5. Infinite token loop

**Symptom**: generation runs to max_tokens without closing the JSON object.
**Cause**: model enters a valid but non-terminating pattern ("technically valid output forever" per OpenAI's structured output launch post).
**Fix**: `strict: false` as fallback with post-generation parse + retry; token budget monitoring.

### 6. Schema compilation failures on first use

**Symptom**: 400 error with schema validation message.
**Common causes**:
- `.optional()` in Zod (not supported by OpenAI strict mode — use `z.union([..., z.null()])`)
- Recursive schema on Anthropic
- `z.record()` with OpenAI
- More than 5 nesting levels (OpenAI)
- Numerical `minimum`/`maximum` on Anthropic (silently ignored but may cause schema rejection in strict validation)

---

## Key Numbers

| Metric | Value | Source |
|---|---|---|
| Accuracy drop from JSON constraints | 26–32 percentage points on math tasks | Tam et al. 2024 |
| Accuracy recovery from reasoning-first | 33% → 92% on GSM8K | Instructor blog 2024 |
| Field naming collapse | 95% → 4.5% from ambiguous siblings | Instructor blog 2024 |
| Description-driven error reduction | Up to 64.7% | PARSE 2025 |
| Flattening as top optimization | 55% of successful schema improvements | PARSE 2025 |
| Enum cleaning improvement | ~70% reduction in downstream cleaning | PARSE 2025 |
| XGrammar decode overhead | <40µs per token | XGrammar 2024 |
| Anthropic first-use latency | 100–300ms | Anthropic docs |
| Partial JSON O(n²) breakpoint | ~7.6KB accumulated response | Aha! Engineering |

---

## Sources

- [Willard & Louf (2023) — Efficient Guided Generation for LLMs (Outlines)](https://arxiv.org/abs/2307.09702)
- [Tam et al. (2024) — Let Me Speak Freely?](https://arxiv.org/abs/2408.02442)
- [Schall & de Melo (RANLP 2025) — The Hidden Cost of Structure](https://acl-bg.org/proceedings/2025/RANLP%202025/pdf/2025.ranlp-1.124.pdf)
- [PARSE (2025) — LLM Driven Schema Optimization](https://arxiv.org/html/2510.08623v1)
- [XGrammar (Dong et al., CMU 2024)](https://arxiv.org/abs/2411.15100)
- [JSONSchemaBench (guidance-ai team, 2025)](https://arxiv.org/abs/2501.10868)
- [Instructor blog — Bad Schemas Could Break Your LLM Structured Outputs](https://python.useinstructor.com/blog/2024/09/26/bad-schemas-could-break-your-llm-structured-outputs/)
- [Aha! Engineering — Streaming AI Responses and the Incomplete JSON Problem](https://www.aha.io/engineering/articles/streaming-ai-responses-incomplete-json)
- [OpenAI Structured Outputs launch post](https://openai.com/index/introducing-structured-outputs-in-the-api/)
- [Anthropic Structured Outputs docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Vercel AI SDK — Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)
- [Zod v4 JSON Schema](https://zod.dev/json-schema)
