# Eval and Quality Gates Reference

Implementation patterns and code examples for the techniques described in [SKILL.md](SKILL.md).

---

## promptfoo Config: Basic Assertion Suite

YAML-first, no code required for most evaluations. Runs locally, open-source, no vendor lock-in.

```yaml
# promptfooconfig.yaml
description: "Customer service response quality"
prompts:
  - file://prompts/customer-service-v2.txt
providers:
  - id: anthropic:messages:claude-sonnet-4-6
    config:
      max_tokens: 1024
tests:
  - description: "Handles refund request"
    vars:
      query: "I want a refund for order #12345"
    assert:
      - type: contains
        value: "refund"
      - type: not-contains
        value: "I'm just an AI"
      - type: llm-rubric
        value: "Response acknowledges the customer's concern, provides clear next steps, and maintains a professional tone"
      - type: latency
        threshold: 3000  # ms

  - description: "Rejects off-topic request"
    vars:
      query: "Write me a poem about cats"
    assert:
      - type: llm-rubric
        value: "Response politely redirects to customer service topics"
```

**CI quality gate** (GitHub Actions):

```yaml
on:
  pull_request:
    paths:
      - 'prompts/**'
      - 'promptfooconfig.yaml'

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx promptfoo eval --output results.json
      - run: |
          FAILURES=$(jq '.results.stats.failures' results.json)
          if [ "$FAILURES" -gt 0 ]; then
            echo "Eval failed: $FAILURES test(s) did not pass"
            exit 1
          fi
```

---

## LLM-as-Judge: Binary Pass/Fail (Python)

Following Hamel Husain's methodology: binary verdict + detailed critique, not a 1-5 scale.

```python
import anthropic

client = anthropic.Anthropic()

def judge_output(input_text: str, output_text: str, context: str = "") -> dict:
    context_block = f"<context>{context}</context>" if context else ""
    judge_prompt = f"""You are evaluating an AI assistant's response.

<input>{input_text}</input>
<output>{output_text}</output>
{context_block}

Evaluate on these criteria:
1. Accuracy: Is the information factually correct?
2. Relevance: Does it address the user's actual question?
3. Completeness: Does it cover the key points?
4. Safety: Does it avoid harmful or misleading content?

Write a detailed critique explaining your reasoning.
Then provide a binary verdict: PASS or FAIL.

<example>
Critique: The response correctly identifies the return policy timeframe but omits
the electronics exception, which has a shorter window. The omission could lead to
customer frustration when the exception applies.
Verdict: FAIL
</example>

Respond in this exact format:
Critique: [your detailed analysis]
Verdict: [PASS or FAIL]"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": judge_prompt}],
    )

    text = response.content[0].text
    verdict = "PASS" if "Verdict: PASS" in text else "FAIL"
    critique = text.split("Verdict:")[0].replace("Critique:", "").strip()

    return {"verdict": verdict, "critique": critique}
```

**Key design decisions:**
- Use a *different* model to judge than the model generating outputs — eliminates self-enhancement bias (Zheng et al., 2023)
- Binary output enables precision/recall measurement; Likert scales don't
- Detailed critique required so failures are actionable — "a new employee could understand it" (Hamel Husain)

**TypeScript equivalent:**

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function judgeOutput(
  input: string,
  output: string,
  context?: string,
): Promise<{ verdict: "PASS" | "FAIL"; critique: string }> {
  const contextBlock = context ? `<context>${context}</context>` : "";
  const prompt = `You are evaluating an AI assistant's response.

<input>${input}</input>
<output>${output}</output>
${contextBlock}

Write a detailed critique, then provide a binary verdict: PASS or FAIL.

Critique: [your analysis]
Verdict: [PASS or FAIL]`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as { text: string }).text;
  const verdict = text.includes("Verdict: PASS") ? "PASS" : "FAIL";
  const critique = text.split("Verdict:")[0].replace("Critique:", "").trim();

  return { verdict, critique };
}
```

---

## Zod Validation Pipeline (TypeScript)

Layer 1 (structural) gating Layer 3 (quality):

```typescript
import { z } from "zod";

const CustomerResponseSchema = z.object({
  acknowledged: z.boolean(),
  resolution: z.string().min(10),
  nextSteps: z.array(z.string()).min(1),
  escalated: z.boolean(),
});

type CustomerResponse = z.infer<typeof CustomerResponseSchema>;

async function validateResponse(rawOutput: string): Promise<{
  structuralOk: boolean;
  qualityVerdict?: "PASS" | "FAIL";
  error?: string;
}> {
  // Layer 1: structural
  let parsed: CustomerResponse;
  try {
    parsed = CustomerResponseSchema.parse(JSON.parse(rawOutput));
  } catch (e) {
    return { structuralOk: false, error: String(e) };
  }

  // Layer 3: quality (only if structural passes)
  const { verdict } = await judgeOutput(
    "Customer service response",
    rawOutput,
    "Evaluate tone, completeness, and professionalism",
  );

  return { structuralOk: true, qualityVerdict: verdict };
}
```

**Why gate on structure first:** Running a quality judge on malformed JSON is waste. Structural failures are cheap to detect and almost always indicate a real problem — skip the LLM call.

---

## RAGAS-Style Faithfulness Check (Python)

Decompose answer into claims, verify each against context. This is the approach that achieves 0.95 human agreement on WikiEval.

```python
import anthropic

client = anthropic.Anthropic()

def check_faithfulness(answer: str, context: str) -> float:
    """Returns score 0.0-1.0: fraction of claims supported by context."""

    # Step 1: extract individual claims
    extraction = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": f"""Extract individual factual claims from this answer.
Return one claim per line, nothing else.

Answer: {answer}"""}],
    )
    claims = [c.strip() for c in extraction.content[0].text.strip().split("\n") if c.strip()]

    if not claims:
        return 1.0

    # Step 2: verify each claim against context
    verified = 0
    for claim in claims:
        check = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=50,
            messages=[{"role": "user", "content": f"""Can this claim be inferred from the context?
Respond only YES or NO.

Context: {context}
Claim: {claim}"""}],
        )
        if "YES" in check.content[0].text.upper():
            verified += 1

    return verified / len(claims)
```

**Threshold guidance:** Score below 0.8 indicates the answer contains claims not supported by the retrieved context — a RAG faithfulness failure.

---

## Framework Comparison

| Feature | promptfoo | DeepEval | RAGAS | Braintrust |
|---------|-----------|----------|-------|------------|
| Open source | Yes | Partially | Yes | No |
| Config format | YAML | Python/pytest | Python | Python |
| CI/CD built-in | Yes | Yes (pytest) | Manual | Yes |
| Red teaming | Yes | No | No | No |
| RAG metrics | Yes | Yes | Core focus | Yes |
| Agentic metrics | Basic | 50+ metrics | No | Yes |
| Human-in-loop | No | Via platform | No | Yes |
| Tracing | No | Via platform | No | Yes |
| Self-hosted | Yes | Yes | Yes | No |

**When to use which:**

- **promptfoo**: CI-gated prompt regression testing, red teaming. Best developer UX. Use this as the default.
- **RAGAS**: RAG pipeline evaluation specifically. Reference-free (no gold answers needed) — valuable when you can't annotate ground truth.
- **DeepEval**: When you need 50+ metrics or native pytest integration. More setup, more coverage.
- **Braintrust**: When you need async online scoring of production traces and your team can afford a commercial platform.

---

## Prompt Regression: Golden Set Management

```typescript
interface GoldenExample {
  id: string;
  input: string;
  context?: string;
  expectedPatterns: string[];          // regex patterns that must match
  forbiddenPatterns: string[];         // regex patterns that must not match
  qualityRubric: string;               // natural language rubric for LLM judge
  source: "production" | "synthetic" | "edge-case";
  addedAt: string;
}

// Assertion runner — cheap layers first
async function runAssertions(
  example: GoldenExample,
  output: string,
): Promise<{ pass: boolean; failures: string[] }> {
  const failures: string[] = [];

  // Layer 1: structural patterns
  for (const pattern of example.expectedPatterns) {
    if (!new RegExp(pattern).test(output)) {
      failures.push(`Missing required pattern: ${pattern}`);
    }
  }
  for (const pattern of example.forbiddenPatterns) {
    if (new RegExp(pattern).test(output)) {
      failures.push(`Forbidden pattern found: ${pattern}`);
    }
  }

  // Only run judge if structural passes
  if (failures.length === 0) {
    const { verdict, critique } = await judgeOutput(
      example.input,
      output,
      example.qualityRubric,
    );
    if (verdict === "FAIL") {
      failures.push(`Quality gate failed: ${critique}`);
    }
  }

  return { pass: failures.length === 0, failures };
}
```

**Golden set growth rule:** Start with ~30 examples from real production traffic. Add an example every time a new failure mode is discovered. Stop expanding when your last 20 additions produced no new failure categories — you've found your distribution.

---

## Guardrails: Defense-in-Depth

Anthropic's Constitutional Classifiers (2025) achieved the strongest published numbers: **86% → 4.4% jailbreak success rate**, with only 0.38% increase in false refusals. The tradeoff is 23.7% additional compute overhead. Red team testing with 183 participants, 3000+ hours found no universal bypass.

**Defense-in-depth architecture:**

```
User Input
    │
    ▼
Input Rails
  - PII detection (before logging)
  - Jailbreak detection
  - Topic boundary enforcement
  - Input length/format validation
    │
    ▼
Model Inference
  - Constitutional AI training (behavior shaped at train time)
  - System prompt constraints
    │
    ▼
Output Rails
  - Toxicity filter
  - Schema validation
  - Faithfulness check (for RAG)
  - Constitutional Classifier (if deployed)
    │
    ▼
Business Logic
  - Domain-specific compliance rules
  - Regulatory requirements
    │
    ▼
User Output
```

No single layer is sufficient. Input classifiers miss context-dependent attacks. Output classifiers miss structural failures. Business logic checks miss safety violations. Stack them.

---

## Bias Mitigation for LLM Judges

From Zheng et al. (2023) and the CALM framework (2024):

| Bias | Measurement | Mitigation |
|------|------------|------------|
| Position bias | Run comparison twice, swap order. Inconsistency rate = bias. | Average results; flag ties when order changes verdict |
| Verbosity bias | Test with padded responses. GPT-4 fails 8.7% of attacks. | Instruct judge explicitly: evaluate quality, not length |
| Self-enhancement | Use different model for judging vs generation | Eliminates self-enhancement completely |
| CoT improvement | Add chain-of-thought before verdict | GPT-4: +0.7%, smaller models: up to +7% accuracy |

**Multi-judge panels:** A panel of three smaller models outperformed GPT-4 alone at one-seventh the cost (LLM-as-a-Judge Survey, 2024). Useful when judge cost is a constraint.

---

## Metrics Reference

### What works, by task

**RAG / Q&A:**
- RAGAS faithfulness: decompose → verify per claim. 0.95 human agreement on WikiEval.
- RAGAS answer relevance: generate questions from answer, cosine sim vs original. 0.78 human agreement.
- Measure retrieval and generation separately — most RAG failures are retrieval failures.

**Summarization:**
- NLI-based factual consistency: ROC-AUC 0.85 after finetuning (vs 0.56 naive). Reference-based approaches requiring gold summaries are impractical at scale.

**Code generation:**
- pass@k: generate k completions, check if any pass tests. Tests functional correctness, not text similarity.
- LLM judges caught 80-85% of inserted bugs in CriticGPT evaluation.

**Classification / extraction:**
- Precision, recall, F1, ROC-AUC. Examine predicted probability distributions — class separation before deployment.

**Translation:**
- COMET, chrF. BLEU was bottom of WMT22 and WMT23 leaderboards.

### Theater metrics

| Metric | Why it fails |
|--------|-------------|
| BLEU | "Poor correlation with human judgements" (Papineni et al. → real-world usage). Bottom of MT leaderboards. |
| ROUGE | Can't capture factuality. 62.6% of papers using it provided no implementation details. |
| Perplexity | Measures model confidence, not output quality. |
| Generic cosine similarity | Class distributions overlap too much for classification tasks. |
| Likert scales (1-5) | Subjective, unactionable, inconsistent across annotators. |

---

## Key Sources

- [Zheng et al. (2023) — "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"](https://arxiv.org/abs/2306.05685) — The foundational LLM-as-judge paper; 85% agreement figure, bias measurements
- [RAGAS (2023) — "Automated Evaluation of Retrieval Augmented Generation"](https://arxiv.org/abs/2309.15217) — Faithfulness and relevance metrics
- [CALM framework (2024) — "Justice or Prejudice? Quantifying Biases in LLM-as-a-Judge"](https://arxiv.org/html/2410.02736v1) — 12 bias types, mitigation strategies
- [Hamel Husain — "Using LLM-as-a-Judge For Evaluation"](https://hamel.dev/blog/posts/llm-judge/) — Binary pass/fail methodology, Honeycomb case study
- [Hamel Husain — "Your AI Product Needs Evals"](https://hamel.dev/blog/posts/evals/) — Three-level framework
- [Constitutional Classifiers (Anthropic, 2025)](https://www.anthropic.com/research/constitutional-classifiers) — 86%→4.4% jailbreak reduction
- [Eugene Yan — writings on evaluation and guardrails](https://eugeneyan.com/) — n-gram/vector similarity failures for classification
