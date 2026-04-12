---
name: eval-and-quality-gates
description: Evaluation strategies and quality gates for LLM systems. LLM-as-judge implementation, prompt regression testing, structural and semantic validation pipelines, production monitoring, guardrails, and metrics that actually work. Use when building evals, setting up CI quality gates, testing prompts, measuring output quality, detecting regressions, or adding safety guardrails to AI applications.
---

# Evaluation and Quality Gates

LLM outputs are probabilistic. The same prompt produces different outputs across runs. Traditional test assertions — exact equality, deterministic return values — break almost immediately. This creates a gap most teams fill with the wrong things: vanity metrics, under-specified judges, and evaluation frameworks bought before the basics work.

This skill covers what actually works, ranked by when to use it, and what to skip.

For implementation patterns and code, see [reference.md](reference.md).

## The Three-Layer Hierarchy

Build validation from cheap and deterministic to expensive and probabilistic. Each layer catches different failures.

**Layer 1 — Structural (deterministic, fast, no LLM calls):**
Schema validation, regex, length bounds, required fields, JSON syntax, SQL syntax. These should run in milliseconds and have zero false positives. If an output fails structural validation, don't bother with semantic or quality checks.

**Layer 2 — Semantic (model-assisted, moderate cost):**
NLI-based entailment for faithfulness, embedding cosine similarity, fuzzy matching. This layer checks whether outputs *mean* the right thing, not just whether they look right.

**Layer 3 — Quality (LLM-graded, highest cost):**
LLM-as-judge with rubrics for subjective dimensions: tone, completeness, helpfulness. Run this last, on outputs that pass layers 1 and 2.

The ordering matters. Most production failures are structural or semantic. Running a quality judge on outputs with broken JSON is waste.

## LLM-as-Judge

The method works. GPT-4 achieves **over 80% agreement with human experts** on MT-Bench (Zheng et al., 2023, NeurIPS), exceeding human-human agreement of 81%. But the headline number hides important caveats.

**Biases to account for:**

- **Position bias**: Claude-v1 was biased toward the first position 75% of the time; GPT-4 is better but still shows ~30% bias. Mitigate by running each pairwise comparison twice with swapped order.
- **Verbosity bias**: 91% of judges fail verbosity attacks (longer = rated better). GPT-4 fails at 8.7%, still not zero. Explicitly instruct the judge to evaluate quality, not length.
- **Self-enhancement bias**: Claude-v1 rated its own outputs 25% higher than competitors'. Use a *different* model as judge than the model generating outputs — this eliminates self-enhancement bias completely.

**When LLM-as-judge works:**
- STEM and humanities tasks: 70-76% win rate in pairwise comparisons
- Factuality checking on clear domains: 84-85% accuracy
- Binary pass/fail with rubrics: >90% human agreement achievable (Hamel Husain's Honeycomb case study, 3 iterations)

**When it doesn't:**
- Creative writing: LLMs pass creativity tests 3-10x less often than human writers
- Hallucination detection: best models achieve only 58.5% accuracy on HaluEval
- Fine-grained relevance ("highly relevant" vs "perfectly relevant"): 30-50% accuracy
- Complex reasoning tasks: requires 70B+ parameter models; smaller models are brittle

**Implementation rule**: Use binary pass/fail, not Likert scales. Multi-point scales (1-5) produce noisy, unactionable data — annotators and judges don't agree on what "3" means. Binary forces clarity and enables precision/recall measurement. Hamel Husain: "people don't know what to do with a 3 or 4."

## Prompt Regression Testing

Treat prompts as versioned assets. A prompt change is a code change — it should go through CI, run against a golden test set, and fail the build if quality drops.

**The four-component pipeline:**

1. **Version control**: Store prompts in dedicated files, not embedded strings. Track in git.
2. **Golden set**: Start with ~30 real production examples covering happy paths, edge cases, and known failures. Expand until no new failure modes emerge. Production traces are the best source.
3. **Assertion suite**: Layer from cheap to expensive (structural → content → semantic → quality). Not every test needs an LLM judge.
4. **CI gate**: Run on every PR that touches prompts or system prompt logic. Fail on regressions.

The most common anti-pattern: jumping to LLM-based evaluation before building basic assertions. String matching and schema validation catch 60-70% of real failures and cost nothing.

## Metrics That Are Theater

These metrics appear in papers and dashboards but don't correlate with what matters:

- **BLEU**: "Poor correlation with human judgements" — used in 95+ papers despite this evidence. Bottom of WMT22/WMT23 leaderboards for translation.
- **ROUGE**: Can't capture factuality or faithfulness. 62.6% of papers using it provided no implementation details.
- **Perplexity as quality proxy**: Measures model confidence, not output quality. Low perplexity ≠ good output.
- **Generic vector/n-gram similarity**: For classification tasks, positive and negative instance distributions overlap too much to be useful (Eugene Yan).
- **Likert scales (1-5)**: Subjective, inconsistent across raters, actionable on neither 3 nor 4.

If someone asks for "BLEU scores" on general text quality, push back.

## Metrics That Actually Work

Match the metric to the task:

| Task | Use | Don't Use |
|------|-----|-----------|
| RAG / Q&A | RAGAS faithfulness (0.95 human agreement), answer relevance | BLEU, ROUGE |
| Summarization | NLI-based factual consistency (ROC-AUC 0.85) | ROUGE, BERTScore |
| Code generation | pass@k (execution-based), test suite pass rate | BLEU |
| Classification | Precision, recall, F1, ROC-AUC | Vector similarity |
| Translation | COMET, chrF | BLEU |
| Creative writing | Human evaluation | Any automated metric |
| General quality | Binary pass/fail + critique | Likert scales |

## Production Monitoring

Static test suites catch regressions only if you run them. In production, you need continuous monitoring on real traffic.

**Alerting thresholds** (from research):
- Pass rate drops >5% below baseline over 24h: investigate
- Latency >2x p99 baseline: check provider status
- Toxicity rate increases at all: immediate investigation

**Key insight**: Don't alert on individual sample failures. Alert on statistically significant drops in aggregate metrics.

## Guardrails

Constitutional Classifiers (Anthropic, 2025) reduced jailbreak success from **86% to 4.4%** with only 0.38% increase in false refusals on legitimate queries. Runtime guardrails work at this scale when built on synthetically generated training data aligned to a constitution.

Defense in depth: input validation (PII detection, jailbreak detection, topic bounds) → model inference (Constitutional AI training) → output validation (toxicity, schema) → business logic checks. No single layer is sufficient.

For implementation patterns, framework comparisons, and code examples, see [reference.md](reference.md).
