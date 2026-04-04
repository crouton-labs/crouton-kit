---
name: context-management
description: Token budgeting, placement effects, RAG patterns, prompt caching, compression, and multi-turn context strategies for LLM applications. Use when dealing with context windows, token budgets, retrieval-augmented generation, long context, context overflow, caching costs, observation masking, or compressing LLM inputs.
---

# Context Management

Context is a finite budget. How you allocate it — and where you place things within it — determines quality as much as what you put in. More context isn't always better. This skill covers the mechanics of transformer attention, the tradeoffs in retrieval and compression, and the patterns that hold up in production.

For implementation patterns and code examples, see [reference.md](reference.md).

## The Attention Economics Model

LLMs don't read context uniformly. Liu et al. (Stanford/Berkeley, 2024) established the U-shaped recall curve: content at the beginning and end of context is processed effectively; middle content suffers 20–30% accuracy drops. In their tests, models performed *better with no documents at all* than with documents where the answer was buried in the center.

This isn't a model-specific quirk. It's a structural property of transformer attention, confirmed across every architecture tested. **You cannot prompt your way out of it.**

The U-curve also isn't static — it shifts with how full the context window is:

- **Below 50% fill:** Primacy dominates. Put critical content first.
- **Above 50% fill:** Primacy inverts. First-position accuracy drops below middle. Put critical content last.
- The transition is sharp around the 50% threshold (arXiv 2508.07479).

Practical consequence: if you're targeting 70% context utilization (which is the right range), your critical content belongs at the end, not the top.

## Token Budget Allocation

Optimal utilization is **60–80% of the context window**. Below 60% is over-provisioning. Above 80% risks mid-task overflow. Operating permanently at the edge degrades response quality (Factory.ai).

| Section | % of Window | Notes |
|---|---|---|
| System instructions | 10–15% | Bloating causes models to *ignore* instructions, not follow more |
| Tool definitions | 15–20% | 50 tools can consume 10,000+ tokens — often underestimated |
| Knowledge / RAG | 30–40% | Primary content. Push to 60% for factual QA, shrink history to 10% |
| Conversation history | 20–30% | Coding agents need more than chatbots |
| Output reserve | 10–15% | Pre-allocate this — running out causes truncated responses |

**The 100:1 rule:** Production input-to-output ratios are approximately 100:1 by token count. Context costs dominate. Optimization here has the highest ROI.

## Claimed vs. Effective Context Length

Advertised context length is not effective context length. The RULER benchmark (NVIDIA, 2024) tested 10 models across 4K–128K using 13 tasks beyond simple needle retrieval. Most models claiming 128K+ had practical limits at 50–65% of advertised for complex reasoning tasks. Simple needle-in-haystack tests produce near-perfect scores but dramatically overstate real capability.

Worse: even with *perfect retrieval* (the model can locate all relevant text), task performance degrades 14–85% as context grows (arXiv 2510.05381). Retrieval and reasoning degrade at different rates. More context helps retrieval and hurts reasoning.

**Benchmark your model at your actual working length before assuming it can handle it.**

## Retrieval: Precision Over Volume

The dominant RAG failure is not the model hallucinating from nothing — it's the retriever returning plausibly relevant but actually unhelpful chunks, which the model then synthesizes incorrectly.

Filtering irrelevant retrieved passages reduces hallucinations by up to 64% (FILCO). The pattern that works:

```
High-recall retrieval (50–100 candidates)
  → Cross-encoder rerank (10–25% additional precision)
  → Pass top 5–10 to LLM
```

Never pass raw top-k directly. Context stuffing hurts more than it helps.

**When RAG hurts:**
- **HyDE** (Hypothetical Document Embeddings): helps ambiguous/conceptual queries, but ARAGOG (2024) showed it causes -0.065 precision vs. naive RAG on factoid queries. Don't apply universally.
- **Query decomposition**: +288% on multi-hop QA (PopQA), but ARAGOG found it underperformed naive RAG on generic queries.
- **LLM-based reranking**: ARAGOG found it *hurt* performance (-0.0514 precision). Cross-encoder reranking is faster and better.

The highest-ROI advanced pattern is **iterative retrieval with a confidence gate**: if first retrieval yields low-similarity results, rewrite the query and retrieve again rather than passing low-quality context to the LLM.

## Compression: When It Helps and When It Destroys

LLMLingua-2 (Microsoft Research, ACL 2024) achieves 2x–5x compression with minimal quality loss and 3–6x faster inference. The original LLMLingua (EMNLP 2023) demonstrated up to 20x compression with ~1.5% accuracy loss on reasoning benchmarks. More surprising: CompLLM research found 2x compressed context *outperforming* uncompressed on long sequences — compression removes noise that dilutes attention.

**Extractive beats abstractive for fact retrieval.** Extractive reranker compression gave +7.89 F1 on 2WikiMultihopQA at 4.5x compression; abstractive compression at similar ratios *decreased* F1 by 4.69. If your task involves specific facts, function signatures, or numerical values — use extractive compression or don't compress at all.

**When compression hurts:**
- Governance-sensitive content where information loss is unacceptable
- Agent loops where over-aggressive compression forces re-fetching already-retrieved artifacts — creating more inference calls than the compression saved (Factory.ai)
- Situations where failure signals matter — summaries obscure the natural signals that should cause agents to stop

**Preserve breadcrumbs** even when compressing prose: file paths, function names, commit hashes, timestamps. Low token cost, high recovery value.

## Caching: 60–90% Cost Reduction for Free

Prompt caching has zero quality impact and significant cost impact. Cache-friendly design is the cheapest optimization available.

**Cache-friendly principle:** Static content first, dynamic content last. A timestamp or session ID at the top of a system prompt invalidates the cache on every request.

| | Anthropic | OpenAI |
|---|---|---|
| Control | Explicit breakpoints | Automatic |
| Read discount | 90% | 50% |
| Write premium | 25–100% | None |
| TTL | 5 min or 1 hour | 5–10 min |

Anthropic requires marking blocks with `"cache_control": {"type": "ephemeral"}`. OpenAI caches automatically for prompts 1,024+ tokens. Anthropic's explicit control is more powerful; OpenAI's is zero-config.

Production case studies: Thomson Reuters Labs (60% cost reduction), YUV.AI (70% cost reduction). See also [system-vs-user-prompt](../system-vs-user-prompt/SKILL.md) for how prompt slot placement affects cache hit rates.

Known Anthropic cache invalidation triggers: changing `tool_choice`, toggling web search/citations, modifying thinking parameters.

## Multi-Turn Management: Masking Beats Summarization

JetBrains Research (2025) compared observation masking vs. LLM summarization in agent tool-use loops. Observation masking was **52% cheaper with 2.6% higher solve rates**. Agents with summarized context ran 13–15% longer because summaries obscured natural failure signals that would otherwise have caused them to stop.

**Observation masking:** Replace older tool outputs with placeholders (`[observation truncated]`) while keeping action history and reasoning intact. Maintain a rolling window of ~10 turns.

**When to use what:**

| Approach | Cost Reduction | Quality Impact | Use For |
|---|---|---|---|
| Observation masking | 52% | +2.6% solve rate | Agent tool-use loops |
| LLM summarization | 50%+ | Agents run 13–15% longer | Selected high-value segments only |
| Sliding window | Variable | Abrupt early-context loss | Short-horizon chat |
| Compaction (summarize + restart) | High | Good if done carefully | Long coding sessions |

Anthropic's recommended escalation: (1) clear tool outputs after use, (2) structured note-taking outside context, (3) sub-agent delegation returning 1–2K token summaries.

## Tool Results: The Context Pollution Problem

Every token of raw tool output is carried forward to every subsequent call. A single `ls` on a large directory dumps thousands of lines. Prevention:

1. **Truncate at the call site** — use offset/limit parameters, cap output length
2. **Post-use clearing** — remove raw output once the model has extracted what it needs
3. **Sub-agent delegation** — send exploration tasks to sub-agents that return summaries
4. **Programmatic tool calling** — execute in code, return only results

## Common Mistakes

- **Trusting advertised context length.** Effective reasoning is 50–65% of claimed for complex tasks.
- **Putting critical content in the middle.** The U-curve is real. Beginning or end.
- **Applying HyDE to factoid queries.** It actively hurts. -0.065 precision vs. naive RAG.
- **Summarizing instead of masking tool outputs.** Summaries hide failure signals. Masking is cheaper and better.
- **Using abstractive compression on fact-retrieval tasks.** Extractive is +7.89 F1; abstractive is -4.69 F1.
- **Static content after dynamic content.** Anything that changes per-request at the top of a system prompt breaks caching.
- **Context stuffing.** More retrieved passages = more hallucination risk, not less.
- **Embedding model drift.** If the model at query time differs from index time, retrieval breaks silently.
