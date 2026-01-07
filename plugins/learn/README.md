# learn

Verify deep understanding of code you just wrote through interactive retrieval-based learning sessions.

## Command: `/understand`

Runs `git diff`, selects a meaningful code block, then quizzes you on it using 3-5 learning methods. Progress tracked with visual indicator (`[■■■□□] 3/5`).

## Learning Methods

### Quiz
Multiple choice via `AskUserQuestion`. Tests behavior prediction and edge case awareness.
```
What will this return given input X?
A) null
B) undefined
C) throws TypeError
D) []
```
One correct answer, 2-3 plausible-but-wrong options.

### Explain
Open-ended questions force articulation:
- "Walk me through what this function does"
- "Why did you choose this approach over X?"

No answer recognition—you must produce the explanation from scratch.

### Predict
Guess output before running code:
1. "What do you expect this to output?"
2. Run the code
3. Explore gaps between prediction and reality

### Trace
Step-by-step execution tracking:
- "After line 5, what is `result`?"
- "How many loop iterations occur with input X?"

Uses `AskUserQuestion` for checkpoint verification.

### Debug
Hypothesis formation for bugs/edge cases:
- "Where would you start investigating?"
- "What's your first hypothesis about why this fails?"

Open-ended to develop debugging intuition.

## Session Structure

1. **Code selection**: Analyzes `git diff` and picks the most complex/meaningful block (function, class, logic flow)
2. **Session plan**: Announces 3-5 phases based on code complexity
3. **Interactive loop**: One question per phase, waits for response, follows up if needed
4. **Completion**: Summary of demonstrated understanding + areas to watch

## Progress Tracking

Each question shows:
```
───────────────────────────────────
 📚 UNDERSTAND · Quiz
 [■■■□□] 3/5
───────────────────────────────────
```
- `■` = completed phase
- `□` = remaining phase
- Fraction = current/total

## Method Selection

- **New function**: Quiz → Explain → Quiz
- **Before running tests**: Predict → Explain
- **Complex logic**: Trace → Quiz
- **Bug present**: Debug → Explain → Quiz

Variety kept high to maintain engagement.

## Philosophy

- **Retrieval > review**: Producing answers strengthens memory more than re-reading
- **Struggle is productive**: Discomfort before understanding is where learning happens
- **Why > what**: Understanding means explaining design decisions, not just behavior
- **Wrong answers are data**: Mistakes reveal mental model gaps—follow up with "What made you think that?"

## Typical Session

```
# Phase 1: Quiz
───────────────────────────────────
 📚 UNDERSTAND · Quiz
 [■□□□] 1/4
───────────────────────────────────

What happens if `items` is an empty array?
A) Returns []
B) Returns null
C) Throws error
D) Returns undefined

[User answers, feedback given]

# Phase 2: Explain
───────────────────────────────────
 📚 UNDERSTAND · Explain
 [■■□□] 2/4
───────────────────────────────────

Why did you use `reduce` here instead of `map`?

[User explains, probing questions if needed]

# Phase 3: Predict
───────────────────────────────────
 📚 UNDERSTAND · Predict
 [■■■□] 3/4
───────────────────────────────────

What do you expect this to output with input `[1, 2, 2, 3]`?

[Run code, explore differences]

# Phase 4: Trace
───────────────────────────────────
 📚 UNDERSTAND · Trace
 [■■■■] 4/4
───────────────────────────────────

After the second loop iteration, what is `accumulator`?

[Final verification, session complete]
```

At completion, summary shows strengths and areas to watch. Suggests rewinding chat if returning to development.
