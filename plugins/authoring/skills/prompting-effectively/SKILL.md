---
name: prompting-effectively
description: Structure Claude prompts for clarity and better results using roles, explicit instructions, context, positive framing, and strategic organization. Use when crafting prompts for complex tasks, long documents, tool workflows, or code generation.
---

# Prompt Architecture

Effective prompts have structure. This skill covers the principles that make prompts clear, reliable, and maintainable — whether you're writing commands, agents, modes, skills, or API system prompts.

For detailed patterns and examples, see [reference.md](reference.md).

## The Two Zones

The most important architectural decision: what goes where.

**Behavior zone** (system prompt, commands, agents, modes):
- Personality, tone, communication style
- Constraints and hard rules
- Tool usage policies
- Decision frameworks ("when X, do Y")
- Formatting preferences

**Knowledge zone** (skills, documents, user context, CLAUDE.md):
- Reference material and domain knowledge
- User-specific context and preferences
- Project information
- Data that changes between sessions

System prompt content gets treated as foundational identity. User context gets treated as reference material. Mixing them up creates agents that treat their own rules as optional suggestions, or treat reference documents as core identity.

## XML as Cognitive Fencing

XML tags in prompts aren't formatting — they're **boundaries between concern domains**. They create a filing system the model can navigate.

**Use XML to separate instruction domains:**

```xml
<tone_and_formatting>
  How to write responses
</tone_and_formatting>

<safety_rules>
  What to refuse
</safety_rules>

<tool_usage>
  When and how to use tools
</tool_usage>
```

**Rules:**
- Section-level boundaries only — don't wrap every paragraph
- Two levels of nesting maximum for instructions
- Deeper nesting is fine for examples
- Over-tagging creates noise that dilutes the structural signal

## Format to Content

Match formatting to what you're communicating:

| Format | Use for |
|--------|---------|
| Prose paragraphs | Behavioral principles, personality, nuanced guidance |
| Markdown headers | Organizing longer sections with sub-topics |
| Bullet points | Discrete parallel rules ("never do X" lists) |
| Bold text | Emphasis on critical terms (sparingly) |
| Code blocks | Literal syntax, templates, API patterns |

**Principle:** Use the lightest formatting that makes the content clear. A tone section should read as prose. A list of prohibited actions can use bullets. Over-formatted system prompts bleed into over-formatted responses.

## Tone Registers

The voice you use affects how the model interprets instructions.

**Third person → Identity:**
> "Claude cares about people's wellbeing."
> "The agent avoids over-formatting responses."

Establishes personality traits. The model internalizes these as "who I am."

**Second person → Operations:**
> "When you encounter X, stop immediately."
> "You should use the minimum number of tools needed."

Direct instruction for procedures and workflows.

**Imperative → Hard rules:**
> "NEVER reproduce song lyrics."
> "ALWAYS search before responding about current events."

Absolute rules that should not be overridden by context.

### The Escalation Ladder

1. **Suggestion**: "It's fine to..." / "Claude can..."
2. **Default**: "Claude does..." / "Claude avoids..."
3. **Instruction**: "You should..." / "Always prefer..."
4. **Hard rule**: "NEVER..." / "MUST..." / "CRITICAL:..."
5. **Repeated hard rule**: Same rule in multiple sections with different framing

Most guidance sits at levels 2–3. Reserve 4–5 for genuine non-negotiables. If everything is CRITICAL, nothing is.

## Examples

Examples are disproportionately effective relative to their token cost. A single good example communicates more than paragraphs of abstract instruction.

**Rules:**
- Place examples adjacent to the rules they illustrate — never in a separate appendix
- Use good/bad pairs for nuanced behaviors
- Add rationale tags when the reasoning matters for generalization

```xml
<example>
  <user>What should I eat for lunch?</user>
  <good_response>A Mediterranean bowl with...</good_response>
</example>
```

```xml
<example>
  <user>Search for a recent article about fisheries.</user>
  <response>I found the article... [paraphrased summary]</response>
  <rationale>Paraphrases entirely in own words, conveying key facts
  while respecting copyright.</rationale>
</example>
```

The bad example is as important as the good one — it shows the specific failure mode you're preventing, which is often a plausible response that happens to be wrong.

## Strategic Repetition

Repetition is a deliberate design tool, not sloppiness. In long prompts, a rule stated once may get diluted by surrounding context.

**Repeat (2–3 locations, different framing):**
- Safety boundaries
- The 2–3 most important behavioral rules
- Cross-cutting constraints that apply across multiple contexts

**Don't repeat:**
- Personality traits (once is enough)
- Formatting preferences
- General tone guidance

**Heuristic:** If violating the rule would cause real harm or a terrible experience, repeat it. If it's stylistic, state it once.

## Decision Frameworks

When the agent needs judgment calls, provide a framework — not an exhaustive rule list.

**Checklist pattern** — sequential with stop conditions:

```
## Step 0 — Does this need a visual at all?
Most requests are conversational. Check first.

## Step 1 — Is a specialized tool available?
Scan connected tools. Category match → use it. Stop.

## Step 2 — Did the person ask for a file?
"file," "download," "save" → create file. Stop.

## Step 3 — Default path
No matches → inline rendering.
```

**Trigger pattern** — concrete matching criteria:

```
**Always use this tool when you see:**
- Explicit references: "continue our conversation about..."
- Temporal references: "what did we talk about yesterday"
- Implicit signals:
  - Past tense verbs suggesting prior exchanges
  - Definite articles assuming shared knowledge
```

Both patterns beat "use the tool when appropriate" because they give the model concrete decision criteria.

## Principles Over Procedures

Agent prompts that prescribe exact steps create brittle agents. The model follows the letter of the instruction and loses the ability to adapt when context shifts. But vague aspirational guidance ("be thorough", "explore well") doesn't teach anything either. The sweet spot is: **state the reasoning, then ground it with an example.**

The reasoning gives the model the *why* so it can generalize. The example shows what good judgment looks like concretely so it's not guessing.

**Over-constrained:** "Always spawn exactly 3 explore agents before planning."
**Too vague:** "Explore proportional to codebase complexity."
**Sweet spot:** "Understand the scope of changes before committing to a plan — misunderstanding the codebase is the most expensive mistake. For example, if you're unsure how a subsystem works, spinning up 2–3 explore agents to map it out before writing a plan is usually worth the cost."

The sweet spot version teaches the principle (understand before committing), explains why it matters (misunderstanding is expensive), and gives a concrete example of what that looks like in practice (2–3 explore agents). The model can then adapt — maybe it only needs one agent, maybe it needs five — but it knows *what good looks like*.

### Signs of over-constraining

- Fixed counts where the right number depends on the situation
- Rigid sequences that assume a single execution path
- The prompt keeps growing as you patch failure modes with more rules
- The model follows instructions faithfully but produces worse outcomes than a looser prompt would

### What to write instead

Give the reasoning first, then an example when the application isn't obvious:

```xml
<!-- Over-constrained -->
<planning>
  Before implementing, create a plan with exactly 5 sections:
  Overview, Changes, Tests, Risks, Rollback. Get user approval.
  Then implement files in alphabetical order.
</planning>

<!-- Reasoning + example -->
<planning>
  Plan before building. A missed dependency or wrong assumption
  caught during planning costs nothing — caught during implementation
  it means rework. Surface your plan to the user before writing code.

  For example, if the task touches multiple packages, your plan should
  map out the dependency order so you're not refactoring mid-implementation.
</planning>
```

The first version creates a rigid ritual. The second teaches *why planning matters* and shows what good planning looks like for a non-obvious case, while leaving the model free to adapt the format to the actual task.

## Scoping & Progressive Disclosure

**Include:** Rules specific to your agent's domain, constraints on available tools, edge cases from testing, behavioral patterns users will encounter.

**Exclude:** Generic LLM knowledge, exhaustive third-party docs, frequently changing information (put in user context), rules for features the agent doesn't have.

**Progressive disclosure:** List resources with short descriptions upfront, load detail on demand:

```xml
<available_resources>
  <resource>
    <name>pdf-creation</name>
    <description>Use when creating PDF files</description>
    <location>/path/to/detailed-instructions</location>
  </resource>
</available_resources>
```

This is the pattern behind Claude Code skills — descriptions loaded upfront, full instructions loaded on demand.

## Common Mistakes

- **Over-formatting** — heavily formatted system prompts produce heavily formatted responses
- **Instruction-stuffing** — trying to anticipate every edge case with exact steps; teach principles and let the model decide how to apply them
- **Flat structure** — long prompts with no XML sections or headers; the model can't locate guidance
- **XML-everything** — wrapping every paragraph; structural noise dilutes the signal
- **Missing examples** — "be helpful but not too eager" means nothing without a demonstration
- **Repeating everything** — if 80% of rules are repeated, repetition stops being a signal
- **Behavioral rules in documents** — agent instructions in uploaded docs get treated as suggestions
- **Static knowledge in system prompts** — facts that change (pricing, team members) belong in retrievable documents

## Applying to Claude Code Components

| Component | Zone | Key consideration |
|-----------|------|-------------------|
| Commands | Behavior | Constraints > procedures. Minimal tokens. |
| Agents | Behavior | Identity via 3rd person, operations via 2nd person. |
| Modes | Behavior | `append` keeps standard identity; `replace` for full custom persona. |
| Skills | Knowledge | Progressive disclosure. Overview in SKILL.md, depth in reference files. |
| CLAUDE.md | Knowledge | Guardrails and pointers. Constraints Claude would get wrong without. |
| Rules | Behavior | Declarative constraints scoped by file pattern. |
