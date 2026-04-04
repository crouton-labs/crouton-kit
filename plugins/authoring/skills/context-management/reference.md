# Context Management Reference

Implementation patterns, code examples, and citations. This supplements the overview in [SKILL.md](SKILL.md).

---

## Token Budget Allocation

### Standard Split

```
System instructions:    10–15%   (~2,000–3,000 tokens in a 200K window)
Tool definitions:       15–20%   (50 tools can consume 10K+ tokens)
RAG / knowledge:        30–40%   (primary content; push to 60% for factual QA)
Conversation history:   20–30%   (coding agents need more than chatbots)
Output reserve:         10–15%   (pre-allocate this — truncated responses are worse)
```

Optimal utilization: **60–80%** of window. Perpetual edge-of-limit operation degrades response quality (Factory.ai).

### Dynamic Token Counting (Anthropic)

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const MAX_WINDOW = 200_000;
const OUTPUT_RESERVE = 20_000;

async function buildWithBudget(
  system: string,
  messages: Anthropic.MessageParam[],
  ragChunks: string[],
): Promise<Anthropic.MessageParam[]> {
  const base = await client.messages.countTokens({ model: "claude-opus-4-5", system, messages });
  let available = MAX_WINDOW - OUTPUT_RESERVE - base.input_tokens;

  const included: string[] = [];
  for (const chunk of ragChunks) {
    const est = chunk.length / 4; // rough character-to-token estimate
    if (available - est < 0) break;
    included.push(chunk);
    available -= est;
  }

  return [{ role: "user", content: included.join("\n\n") }, ...messages];
}
```

---

## Prompt Caching

### Anthropic — Explicit Cache Breakpoints

Static content first, dynamic content last. Mark the last static block.

```typescript
const response = await client.messages.create({
  model: "claude-opus-4-5",
  max_tokens: 4096,
  system: [
    { type: "text", text: systemInstructions },
    {
      type: "text",
      text: toolSchemas,
      cache_control: { type: "ephemeral" },  // cache boundary — everything above is cached
    },
  ],
  messages: [{
    role: "user",
    content: [
      {
        type: "text",
        text: referenceDocuments,
        cache_control: { type: "ephemeral" },  // second cache boundary
      },
      { type: "text", text: userQuery },  // dynamic, changes every request
    ],
  }],
});
```

**Anti-pattern:** Dynamic content at the top invalidates the cache on every call.

```typescript
// BAD — timestamp invalidates cache every request
const system = `Current time: ${new Date().toISOString()}\n\n${staticInstructions}`;

// GOOD — dynamic content appended after cache boundary
const system = [
  { type: "text", text: staticInstructions, cache_control: { type: "ephemeral" } },
  { type: "text", text: `Current time: ${new Date().toISOString()}` },
];
```

Constraints: up to 4 breakpoints, minimum 1,024–4,096 token threshold (varies by model). Known invalidation triggers: changing `tool_choice`, toggling web search/citations, modifying `thinking` parameters.

**OpenAI:** Automatic prefix caching for prompts 1,024+ tokens, zero config, 50% read discount (vs. Anthropic's 90%).

---

## RAG: Retrieval Pipeline

```python
from sentence_transformers import CrossEncoder

def retrieve_and_rerank(
    query: str,
    vector_store,
    bm25_index,
    cross_encoder: CrossEncoder,
    top_k_retrieval: int = 100,
    top_k_final: int = 10,
) -> list[str]:
    # Stage 1: high-recall dual retrieval
    dense = vector_store.search(query, k=top_k_retrieval // 2)
    sparse = bm25_index.search(query, k=top_k_retrieval // 2)

    # Stage 2: Reciprocal Rank Fusion — k=60 requires no tuning
    fused = reciprocal_rank_fusion(dense, sparse, k=60)

    # Stage 3: cross-encoder rerank — 10–25% additional precision
    scores = cross_encoder.predict([(query, doc.text) for doc in fused])
    reranked = sorted(zip(fused, scores), key=lambda x: x[1], reverse=True)

    return [doc.text for doc, _ in reranked[:top_k_final]]
```

**Chunking strategy by document type (NVIDIA benchmark across 5 financial datasets):**

| Strategy | Best For | Range | Notes |
|---|---|---|---|
| Page-level | Reports, financial docs | Native | Highest accuracy + lowest variance |
| Token-based | General text | 512–1,024 | Right default. 128-token chunks worst performers |
| Semantic/adaptive | Clinical, legal | Variable | 87% vs. 50% accuracy in clinical study (Cohen's d = 1.03) |
| Parent-child | Structured docs | Child: 100–500 | Child drives retrieval, parent provides context |
| Sentence window | Dense documents | Sentence → expand | +0.1021 mean precision vs. naive (ARAGOG, p < 0.001) |

**Patterns to avoid:**
- **HyDE:** ARAGOG found -0.0648 precision vs. naive RAG on factoid queries (p < 0.001). Only use for ambiguous/conceptual queries.
- **LLM-based reranking:** -0.0514 precision in ARAGOG. Use cross-encoders (ms-marco-MiniLM — free, fast).
- **Query decomposition on simple queries:** +288% on multi-hop QA (PopQA), but underperforms naive RAG on generic queries.

---

## Compression

### LLMLingua

```python
from llmlingua import PromptCompressor

compressor = PromptCompressor(
    model_name="microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank",
    use_llmlingua2=True,  # 3x–6x faster, better out-of-domain generalization (ACL 2024)
)

compressed = compressor.compress_prompt(
    context,
    rate=0.5,   # 2x compression — sweet spot
    # rate=0.05 # 20x — original LLMLingua (EMNLP 2023); LLMLingua-2 sweet spot is 2x–5x
    force_tokens=["\n", ".", "?"],
)
```

**Critical:** Extractive compression +7.89 F1 on 2WikiMultihopQA at 4.5x compression. Abstractive at same ratio: -4.69 F1. For fact-retrieval tasks, extractive only. CompLLM found 2x compressed context outperforming uncompressed on long sequences — compression removes attention-diluting noise.

---

## Multi-Turn Management

### Observation Masking (Preferred for Agent Loops)

JetBrains Research (2025): 52% cheaper, 2.6% higher solve rate vs. LLM summarization. Summaries obscure failure signals, causing agents to run 13–15% longer.

```typescript
interface Turn {
  role: "user" | "assistant";
  content: string;
  isToolOutput?: boolean;
  toolName?: string;
}

function maskOldObservations(history: Turn[], windowSize = 10): Turn[] {
  const recent = history.slice(-windowSize);
  const older = history.slice(0, -windowSize);

  return [
    ...older.map(turn =>
      turn.isToolOutput
        ? { ...turn, content: `[${turn.toolName ?? "tool"} output truncated — ${turn.content.length} chars]` }
        : turn  // preserve reasoning and actions intact
    ),
    ...recent,
  ];
}
```

### Factory.ai Two-Threshold Compaction

```typescript
interface CompactionConfig {
  tMax: number;      // trigger threshold — e.g., 0.85 * maxTokens
  tRetained: number; // post-compression target — e.g., 0.50 * maxTokens
}

async function maybeCompact(
  state: { turns: Turn[]; anchoredSummary: string; breadcrumbs: string[] },
  tokenCount: number,
  config: CompactionConfig,
  llm: LLM,
) {
  if (tokenCount < config.tMax) return state;

  const toTruncate = state.turns.slice(0, turnsAboveBudget(state.turns, config.tRetained));

  // Anchored summary: updated incrementally, not recomputed from scratch
  const newSummary = await llm.summarize(
    `${state.anchoredSummary}\n\nNew:\n${toTruncate.map(t => t.content).join("\n")}`
  );

  return {
    turns: state.turns.slice(toTruncate.length),
    anchoredSummary: newSummary,
    breadcrumbs: state.breadcrumbs,  // file paths, function names, commit hashes — never discard
  };
}
```

**Preserve:** session intent, artifact trails, unresolved bugs, architectural decisions.
**Discard:** redundant tool outputs, duplicate messages, superseded reasoning.

**Anthropic's three-level escalation** (from their context engineering guide):
1. Clear tool outputs after use — "the safest lightest touch"
2. Structured note-taking outside the context window
3. Sub-agent delegation returning 1–2K token summaries

---

## Citations

| Source | Key Finding |
|---|---|
| Liu et al. (Stanford/Berkeley), [Lost in the Middle](https://aclanthology.org/2024.tacl-1.9/), *TACL* 2024 | U-shaped recall; middle content 20–30% worse than boundaries |
| Hsieh et al. (NVIDIA), [RULER](https://arxiv.org/abs/2404.06654), COLM 2024 | Effective context = 50–65% of claimed for complex tasks |
| arXiv [2510.05381](https://arxiv.org/html/2510.05381v1) (2025) | Perfect retrieval still degrades task performance 14–85% |
| arXiv [2508.07479](https://arxiv.org/html/2508.07479) (2025) | Primacy/recency inversion at 50% fill rate threshold |
| Eibich et al., [ARAGOG](https://arxiv.org/html/2404.01037), 2024 | HyDE -0.065 precision on factoid; LLM reranking hurts |
| Microsoft Research, [LLMLingua](https://arxiv.org/abs/2310.05736), EMNLP 2023 | Up to 20x compression with ~1.5% accuracy loss |
| Microsoft Research, [LLMLingua-2](https://arxiv.org/abs/2403.12968), ACL 2024 | 2x–5x compression, 3–6x faster, better OOD generalization |
| JetBrains Research, [Cutting Through the Noise](https://blog.jetbrains.com/research/2025/12/efficient-context-management/), 2025 | Observation masking: 52% cheaper, +2.6% solve rate |
| Factory.ai, [Compressing Context](https://factory.ai/news/compressing-context) | Two-threshold compaction; breadcrumb preservation |
| NVIDIA, [Best Chunking Strategy](https://developer.nvidia.com/blog/finding-the-best-chunking-strategy-for-accurate-ai-responses/), 2024 | Page-level: highest accuracy + lowest variance |
| Anthropic, [Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | Three-level compaction escalation |
| Anthropic, [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) | Cache control API; invalidation triggers; TTL options |
