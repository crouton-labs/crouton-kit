# Output Variety Reference

Implementation patterns and examples for the techniques described in [SKILL.md](SKILL.md).

---

## Ring Buffer Pattern

Store recent outputs in a capped array. Push new entries, slice to cap on write.

```typescript
const MAX_HISTORY = 30;

interface OutputEntry {
  text: string;
  event: string;
  timestamp: string;
}

function recordOutput(history: OutputEntry[], text: string, event: string): void {
  history.push({ text, event, timestamp: new Date().toISOString() });
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
}
```

**Inject the most recent 10 into the prompt:**

```typescript
function buildHistoryBlock(history: OutputEntry[]): string {
  if (history.length === 0) return '';
  const recent = history.slice(-10);
  const lines = recent.map(h => `- "${h.text}"`).join('\n');
  return `<previous_outputs>
Do NOT repeat, rephrase, or echo the phrasing or structure of any of these:
${lines}
</previous_outputs>`;
}
```

**Why 10 and not all 30?** Showing too many negative examples causes the model to over-attend to avoidance, producing stilted or overly cautious output. 10 is enough to block recent patterns while leaving creative space open. The full 30 are stored for analysis and potential similarity filtering.

---

## Voice Constraint Pool

Design constraints that target structure, not content. Each should be achievable regardless of the actual subject matter.

```typescript
const VOICE_CONSTRAINTS = [
  'Start with a verb.',
  'Use a question.',
  'Reference a physical sensation (cold, weight, friction, gravity).',
  'Make an observation about time.',
  'Use a comparison to something outside the current domain.',
  'Start with a number or measurement.',
  'Comment on the absurdity of one specific detail.',
  'Use a single dry understatement.',
  'Make a prediction.',
  'Reference a sound.',
  'End with a trailing thought.',
  'Use exactly one sentence.',
  'Start with a conditional ("If...", "When...").',
  'Reference what you were doing before this moment.',
  'Describe something you can see from where you are.',
  'State something obvious as if it were a revelation.',
];

function pickConstraint(): string {
  return VOICE_CONSTRAINTS[Math.floor(Math.random() * VOICE_CONSTRAINTS.length)];
}
```

**Injection point:** Place inside a `<variety>` block near the voice/style section of the prompt, not buried at the end. The model needs to encounter it while voice instructions are salient.

```xml
<variety>
Structural constraint for this call: ${pickConstraint()}
</variety>
```

### Designing Good Constraints

**Good constraints** change sentence shape:
- "Start with a verb" — forces active voice, non-standard opening
- "Use exactly one question" — changes rhetorical structure
- "Reference a physical sensation" — shifts from abstract to concrete

**Bad constraints** fight the task:
- "Talk about the weather" — injects irrelevant content
- "Be funny" — vague, model-dependent
- "Use three paragraphs" — contradicts a short-output requirement

---

## Example Pool Rotation

Maintain a master list of 15-25 examples. Sample 3-5 per call.

```typescript
interface Example {
  event: string;
  mood: string;
  context: string;
  output: string;
}

const EXAMPLE_POOL: Example[] = [
  // ... 20 diverse examples ...
];

function sampleExamples(count: number): Example[] {
  const shuffled = [...EXAMPLE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

### Writing a Good Example Pool

Each example should demonstrate a *different approach* to the same kind of task:

- **Vary opening words:** Don't let 5 examples all start with the subject noun
- **Vary sentence count:** Mix single-sentence and two-sentence examples
- **Vary rhetorical devices:** Some use questions, some use comparisons, some are bare observations
- **Vary tone within the character's range:** The same character can be wry, warm, blunt, or philosophical depending on context

**Test for diversity:** Read all examples in sequence. If they feel like variations on a template, rewrite the ones that blend together.

---

## Seed Thought Injection

Seeds are ambient details the model can optionally incorporate. They shift attention patterns even when ignored.

```typescript
const SEED_THOUGHTS = [
  'The terminal cursor is blinking.',
  'There\'s a coffee cup nearby, probably cold.',
  'The git history goes back further than you remember.',
  'Somewhere a CI pipeline is also running.',
  'Every session starts the same way.',
  'The filesystem is full of files nobody opens.',
];

function pickSeed(): string {
  return SEED_THOUGHTS[Math.floor(Math.random() * SEED_THOUGHTS.length)];
}
```

**Injection:** Frame as optional to avoid forcing irrelevant content:

```
Ambient thought to riff on (use or ignore): ${pickSeed()}
```

### Writing Good Seeds

- **Concrete and sensory** — "The fan is spinning" not "creativity flows"
- **Environmentally plausible** — grounded in the context the character inhabits
- **Not directive** — seeds suggest, they don't instruct
- **Short** — one sentence. Seeds that are too long become a second task.

---

## Combining Techniques in a Prompt

The techniques layer together. Here's the recommended structure:

```xml
<role>
  Character identity (static across calls)
</role>

<context>
  What this output is for, length constraints (static)
</context>

<voice>
  Tone, style, banned words (static)
</voice>

<variety>
  CRITICAL: Output must differ from previous commentary.
  Do not reuse sentence structures, opening words, or metaphors.

  Structural constraint for this call: ${pickConstraint()}

  Ambient thought (use or ignore): ${pickSeed()}
</variety>

${buildHistoryBlock(history)}

<examples>
  ${sampleExamples(4).map(formatExample).join('\n')}
</examples>

<state>
  Current context variables (dynamic per call)
</state>

Task instruction and output format.
```

**Key ordering decisions:**
- `<variety>` before `<previous_outputs>` — the model encounters the creativity instruction before seeing what to avoid, priming generative rather than avoidant thinking
- `<examples>` after variety/history — examples are the last "voice calibration" before the actual task
- Dynamic state last — closest to the generation point

---

## Similarity Filter (Backstop)

For critical applications where repetition is unacceptable:

```typescript
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

async function generateWithDedupe(
  generate: () => Promise<string | null>,
  history: string[],
  threshold = 0.6,
  maxRetries = 2,
): Promise<string | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await generate();
    if (!result) return null;

    const tooSimilar = history.some(h => jaccardSimilarity(result, h) > threshold);
    if (!tooSimilar) return result;
    // On retry, the negative examples list should include the rejected output
  }
  return null; // All retries exhausted — return nothing rather than repeat
}
```

**Threshold guidance:** 0.6 Jaccard is a reasonable starting point for short sentences. Lower it (0.4-0.5) for stricter variety; raise it (0.7) if you're getting too many rejections.

---

## Monitoring and Tuning

### Tracking Repetition

Periodically review your output history for patterns:

- **Opening word frequency:** If >30% of outputs start with the same word, add it to constraints or bans
- **Phrase clustering:** If the same 3-word phrase appears in >20% of outputs, ban it
- **Structural repetition:** If outputs follow the same "statement. observation." pattern, add more structural constraints

### When Techniques Interact Badly

- **Too many negative examples + strict constraint** → model freezes, produces generic filler. Fix: reduce negative examples to 5, or soften the constraint to "try to..."
- **Seed thought + content-specific constraint** → model tries to satisfy both and produces incoherent output. Fix: ensure seeds and constraints target different dimensions (seed = content flavor, constraint = structure)
- **Large ban list + small output** → model runs out of "allowed" vocabulary. Fix: cap ban list at 15-20 terms, focusing on the most egregious repeat offenders
