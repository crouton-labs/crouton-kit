---
name: output-variety
description: Techniques for getting varied, non-repetitive outputs from repeated LLM calls. Use when building systems that call LLMs in loops, generating personality lines, commentary, names, or any repeated creative text where outputs feel samey or cliche.
---

# Output Variety in Repeated LLM Calls

When you call an LLM repeatedly with structurally similar prompts, outputs converge. The model finds an attractor — a comfortable pattern of phrasing, structure, and word choice — and stays there. This is especially pronounced with smaller models (Haiku, Sonnet) and short outputs (1-2 sentences).

This skill covers practical techniques to break that convergence, ranked by impact. All techniques operate at the prompt level — no fine-tuning or custom sampling required.

For implementation patterns and examples, see [reference.md](reference.md).

## Techniques (Ranked by Impact)

### 1. Inject Recent Outputs as Negative Examples

**Highest impact. Zero cost. Do this first.**

Show the model its last N outputs with an explicit instruction not to repeat them. This is the single strongest lever for small models because it directly removes recent patterns from the output distribution.

```xml
<previous_outputs>
Do NOT repeat, rephrase, or echo the structure of any of these:
- "The boulder doesn't care about your deadline."
- "Three agents down. I've seen worse."
- "Past midnight and still pushing. Typical."
</previous_outputs>
```

**How many to show:** 5-10 recent outputs hits the sweet spot. Fewer than 5 allows the model to find gaps. More than 15 wastes context and can cause the model to over-focus on avoidance rather than generation.

**Storage:** Keep a ring buffer of the last 20-30 outputs in your application state. Inject the most recent 10 into each prompt.

### 2. Rotate Structural Constraints

**High impact. Forces variety in sentence shape, not just word choice.**

Maintain a pool of micro-constraints that change the *structure* of the output. Randomly select one per call.

```
Structural constraint for this call: Start with a verb.
```

```
Structural constraint for this call: Use exactly one question.
```

```
Structural constraint for this call: Reference a physical sensation.
```

Small models are highly sensitive to micro-constraints — a single sentence addition changes the output distribution more than any sampling parameter. This works because it forces the model to approach the same content from different angles.

**Pool size:** 12-20 constraints. Fewer risks noticeable cycling; more risks contradictions with other prompt instructions.

**Constraint design:** Target sentence structure, opening words, rhetorical devices, and sensory registers — not content. "Start with a number" is good. "Talk about the weather" is too content-specific and fights the actual task.

### 3. Rotate Few-Shot Examples

**High impact. Changes what the model anchors on.**

Instead of static examples in the prompt, maintain a larger pool and randomly sample a subset per call.

The model's output distribution shifts dramatically based on which examples it sees. This is well-documented in few-shot prompting research — example selection is one of the strongest levers on output distribution, especially for small models.

**Pool size:** 15-25 examples. Sample 3-5 per call. Ensure the pool covers diverse sentence structures, tones, and approaches — not just diverse topics.

### 4. Inject Random Seed Elements

**Moderate impact. Shifts the attention distribution at prefill.**

Add a random micro-scenario or ambient detail that the model can optionally riff on:

```
Ambient thought (use or ignore): The scroll buffer has thousands of lines nobody reads.
```

This works by shifting which attention heads activate during prefill. Even if the model ignores the seed entirely, its presence changes the probability landscape for the actual output.

**Pool size:** 15-30 seeds. They should be concrete and sensory, not abstract. "The terminal cursor is blinking" beats "creativity is important."

### 5. Expand Explicit Phrase Bans

**Moderate impact. Easy to maintain.**

LLMs (especially smaller ones) have strong attractors toward certain phrases. Track which phrases appear most often in your generated outputs and ban them explicitly.

```
Banned words/phrases: "testament", "journey", "embrace", "landscape",
"navigate", "delve", "tapestry", "realm", "crucible"
```

Explicit phrase banning is more effective than general "be creative" instructions. The model responds better to "don't say X" than "say something original" because the former is a concrete constraint and the latter is a vague aspiration.

**Maintenance:** Review generated outputs periodically. When a phrase appears 3+ times in your last 20 outputs, add it to the ban list.

### 6. Post-Generation Similarity Filter

**Safety net. Catches what the prompt-level techniques miss.**

After generation, compare the output against the last N outputs using a simple similarity metric (Jaccard on word sets, or even substring matching). If similarity exceeds a threshold, regenerate with the failed output added to the negative examples.

This costs an extra API call occasionally but guarantees variety. Use it as a backstop, not a primary mechanism — if you're regenerating frequently, your prompt-level techniques need tuning.

## When to Apply This

These techniques matter when:
- The same prompt template is called 10+ times per day
- Outputs are short (under 200 tokens) — long-form generation has more internal variance
- Users see multiple outputs in sequence (status bars, notifications, commentary)
- The model is small (Haiku, Sonnet) — Opus has more internal diversity

They matter less when:
- Each call has substantially different input context
- Outputs are long-form (500+ tokens)
- Users rarely see more than one output per session
