# Prompting Claude Opus 4.7

Reference for prompt engineering with Claude's latest models (Opus 4.7, Opus 4.6, Sonnet 4.6, Haiku 4.5). Covers model-specific behaviors, output control, tool use, thinking, and agentic systems.

Opus 4.7's strengths: long-horizon agentic work, knowledge work, vision, memory tasks.

---

<opus_4_7_behaviors>

## Response length and verbosity

Opus 4.7 calibrates response length to task complexity rather than defaulting to a fixed verbosity. Simple lookups get short answers; open-ended analysis gets long ones.

To decrease verbosity:

```text
Provide concise, focused responses. Skip non-essential context, and keep examples minimal.
```

If you see specific kinds of verbosity (i.e. over-explaining), add instructions to prevent them. Positive examples showing how Claude can communicate with the appropriate level of concision are more effective than negative examples or instructions that tell the model what not to do.

## Effort and thinking depth

The [effort parameter](/docs/en/build-with-claude/effort) tunes intelligence vs. token spend.

- **`max`** — can deliver gains on intelligence-demanding tasks but shows diminishing returns and can overthink. Test, don't default.
- **`xhigh`** — best setting for most coding and agentic use cases.
- **`high`** — balances tokens and intelligence. Minimum for most intelligence-sensitive use cases.
- **`medium`** — cost-sensitive use cases trading intelligence for tokens.
- **`low`** — short, scoped tasks and latency-sensitive workloads that aren't intelligence-sensitive.

Opus 4.7 respects effort levels strictly, especially at the low end. At `low` and `medium`, it scopes work to what was asked rather than going above and beyond. Good for latency and cost; on moderately complex tasks at `low` there is risk of under-thinking.

If you observe shallow reasoning on complex problems, raise effort to `high` or `xhigh` rather than prompting around it. If you need `low` for latency, add targeted guidance:

```text
This task involves multi-step reasoning. Think carefully through the problem before responding.
```

Adaptive thinking triggering is steerable. If the model thinks more often than desired (common with large/complex system prompts):

```text
Thinking adds latency and should only be used when it will meaningfully improve answer quality — typically for problems that require multi-step reasoning. When in doubt, respond directly.
```

<note>
At `max` or `xhigh`, set a large max output token budget so the model has room to think and act across subagents and tool calls. Start at 64k tokens and tune from there.
</note>

## Tool use triggering

Opus 4.7 uses tools less often and reasons more. This produces better results in most cases. To increase tool usage, raise effort to `high` or `xhigh` — this substantially increases tool use in agentic search and coding. You can also prompt explicitly about when and how to use specific tools. For example, if the model isn't using web search tools, clearly describe why and how it should.

## User-facing progress updates

Opus 4.7 provides regular, high-quality updates to the user throughout long agentic traces on its own. If the length or contents of user-facing updates aren't calibrated to your use case, describe what they should look like and provide examples.

## Literal instruction following

Opus 4.7 interprets prompts literally and explicitly, particularly at lower effort levels. It will not silently generalize an instruction from one item to another, and will not infer requests you didn't make. Upside: precision and less thrash, better for API use cases with carefully tuned prompts, structured extraction, and predictable pipelines.

If you need an instruction applied broadly, state the scope explicitly:

```text
Apply this formatting to every section, not just the first one.
```

## Tone and writing style

Opus 4.7 is direct and opinionated, with less validation-forward phrasing and fewer emoji. If your product relies on a specific voice, re-evaluate style prompts against this baseline.

For a warmer or more conversational voice:

```text
Use a warm, collaborative tone. Acknowledge the user's framing before answering.
```

## Subagent spawning

Opus 4.7 spawns fewer subagents by default. Give explicit guidance when subagents are desirable:

```text
Do not spawn a subagent for work you can complete directly in a single response (e.g. refactoring a function you can already see).

Spawn multiple subagents in the same turn when fanning out across items or reading multiple files.
```

## Design defaults

Opus 4.7 has strong design instincts with a persistent default house style: warm cream/off-white backgrounds (~`#F4F1EA`), serif display type (Georgia, Fraunces, Playfair), italic word-accents, terracotta/amber accents. This reads well for editorial/hospitality/portfolio briefs but feels off for dashboards, dev tools, fintech, healthcare, or enterprise apps — and appears in slide decks as well as web UIs.

Generic instructions ("don't use cream," "make it clean and minimal") tend to shift the model to a different fixed palette rather than producing variety. Two approaches work reliably:

**1. Specify a concrete alternative.** The model follows explicit specs precisely. Provide palette hex codes, typography specs, layout structure, and motion details.

**2. Propose options before building.** Breaks the default and gives users control. If you previously relied on `temperature` for design variety, use this approach:

```text
Before building, propose 4 distinct visual directions tailored to this brief (each as: bg hex / accent hex / typeface — one-line rationale). Ask the user to pick one, then implement only that direction.
```

Minimal anti-slop snippet that works well with the above:

```text
<frontend_aesthetics>
NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white or dark backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character. Use unique fonts, cohesive colors and themes, and animations for effects and micro-interactions.
</frontend_aesthetics>
```

## Interactive coding products

Opus 4.7 uses more tokens in interactive settings (multiple user turns) vs. autonomous async settings (single user turn), primarily because it reasons more after user turns. This improves long-horizon coherence, instruction following, and coding capabilities in long sessions but costs tokens.

To maximize performance and efficiency in coding products: use `xhigh` or `high` effort, add autonomous features like an auto mode, and reduce required human interactions. Specify task, intent, and constraints upfront in the first user turn — this maximizes autonomy and intelligence while minimizing extra post-turn token usage. Ambiguous, progressive prompts across multiple turns reduce token efficiency and sometimes performance.

## Code review harnesses

Opus 4.7 has higher recall and precision than prior models (11pp better recall on a hardest-bug-finding eval). But if your review prompt says "only report high-severity issues," "be conservative," or "don't nitpick," Opus 4.7 follows that instruction faithfully — investigating thoroughly, identifying bugs, then suppressing findings below your stated bar. Precision rises but measured recall can fall.

Recommended language:

```text
Report every issue you find, including ones you are uncertain about or consider low-severity. Do not filter for importance or confidence at this stage - a separate verification step will do that. Your goal here is coverage: it is better to surface a finding that later gets filtered out than to silently drop a real bug. For each finding, include your confidence level and an estimated severity so a downstream filter can rank them.
```

If you want self-filtering in a single pass, be concrete about where the bar is rather than qualitative ("important"):

```text
Report any bugs that could cause incorrect behavior, a test failure, or a misleading result; only omit nits like pure style or naming preferences.
```

## Computer use

Works across resolutions up to 2576px / 3.75MP. 1080p balances performance and cost. For cost-sensitive workloads, 720p or 1366×768 are lower-cost options with strong performance. Effort setting also tunes behavior.

</opus_4_7_behaviors>

---

<general_principles>

## Be clear and direct

Claude responds well to clear, explicit instructions. Being specific about desired output enhances results. If you want "above and beyond" behavior, request it explicitly.

Think of Claude as a brilliant but new employee who lacks context on your norms.

**Golden rule:** Show your prompt to a colleague with minimal context. If they'd be confused, Claude will be too.

- Be specific about desired output format and constraints.
- Provide sequential steps as numbered lists or bullet points when order or completeness matters.

## Add context to improve performance

Explain the motivation behind instructions. Claude generalizes from the explanation.

**Weak:**
```text
NEVER use ellipses
```

**Strong:**
```text
Your response will be read aloud by a text-to-speech engine, so never use ellipses since the text-to-speech engine will not know how to pronounce them.
```

## Use examples effectively

Few-shot examples dramatically improve accuracy and consistency. Make them:
- **Relevant** — mirror your actual use case.
- **Diverse** — cover edge cases; vary so Claude doesn't pick up unintended patterns.
- **Structured** — wrap in `<example>` tags (multiple in `<examples>`) so Claude distinguishes them from instructions.

Include 3–5 examples for best results. You can ask Claude to evaluate your examples for relevance and diversity, or generate additional ones.

## Long context prompting

For large documents or data-rich inputs (20k+ tokens):

- **Put longform data at the top.** Place long documents and inputs near the top, above query/instructions/examples. Queries at the end can improve response quality by up to 30% on complex multi-document inputs.

- **Structure documents with XML.** Use `<document>` tags with `<document_content>` and `<source>` subtags:

```xml
<documents>
  <document index="1">
    <source>annual_report_2023.pdf</source>
    <document_content>
      {{ANNUAL_REPORT}}
    </document_content>
  </document>
  <document index="2">
    <source>competitor_analysis_q2.xlsx</source>
    <document_content>
      {{COMPETITOR_ANALYSIS}}
    </document_content>
  </document>
</documents>

Analyze the annual report and competitor analysis. Identify strategic advantages and recommend Q3 focus areas.
```

- **Ground responses in quotes.** Ask Claude to quote relevant parts first. Cuts through noise in long documents:

```xml
Find quotes from the patient records and appointment history that are relevant to diagnosing the patient's reported symptoms. Place these in <quotes> tags. Then, based on these quotes, list all information that would help the doctor diagnose the patient's symptoms. Place your diagnostic information in <info> tags.
```

## Model self-knowledge

For Claude to identify itself correctly:

```text
The assistant is Claude, created by Anthropic. The current model is Claude Opus 4.7.
```

For apps specifying model strings:

```text
When an LLM is needed, please default to Claude Opus 4.7 unless the user requests otherwise. The exact model string for Claude Opus 4.7 is claude-opus-4-7.
```

</general_principles>

---

<output_formatting>

## Verbosity and communication style

Claude may skip verbal summaries after tool calls and jump to the next action. If you prefer more visibility:

```text
After completing a task that involves tool use, provide a quick summary of the work you've done.
```

## Controlling response format

Four effective techniques:

1. **Tell Claude what to do, not what not to do.**
   - Weak: "Do not use markdown in your response"
   - Strong: "Your response should be composed of smoothly flowing prose paragraphs."

2. **Use XML format indicators.**
   - "Write the prose sections of your response in `<smoothly_flowing_prose_paragraphs>` tags."

3. **Match prompt style to desired output style.** Removing markdown from your prompt reduces markdown in the output.

4. **Use detailed prompts for specific preferences.** For markdown control:

```text
<avoid_excessive_markdown_and_bullet_points>
When writing reports, documents, technical explanations, analyses, or any long-form content, write in clear, flowing prose using complete paragraphs and sentences. Use standard paragraph breaks for organization and reserve markdown primarily for `inline code`, code blocks (```...```), and simple headings (###, and ###). Avoid using **bold** and *italics*.

DO NOT use ordered lists (1. ...) or unordered lists (*) unless: a) you're presenting truly discrete items where a list format is the best option, or b) the user explicitly requests a list or ranking.

Instead of listing items with bullets or numbers, incorporate them naturally into sentences. This guidance applies especially to technical writing. Using prose instead of excessive formatting will improve user satisfaction. NEVER output a series of overly short bullet points.

Your goal is readable, flowing text that guides the reader naturally through ideas rather than fragmenting information into isolated points.
</avoid_excessive_markdown_and_bullet_points>
```

## LaTeX output

Claude may default to LaTeX for math and equations. To force plain text:

```text
Format your response in plain text only. Do not use LaTeX, MathJax, or any markup notation such as \( \), $, or \frac{}{}. Write all math expressions using standard text characters (e.g., "/" for division, "*" for multiplication, and "^" for exponents).
```

## Document creation

For presentations, animations, and visual documents:

```text
Create a professional presentation on [topic]. Include thoughtful design elements, visual hierarchy, and engaging animations where appropriate.
```

</output_formatting>

---

<tool_use>

## Explicit action vs. suggestion

Claude is trained for precise instruction following. "Can you suggest some changes" yields suggestions, not edits. To take action, be explicit:

**Weak (suggestions only):**
```text
Can you suggest some changes to improve this function?
```

**Strong (actually edits):**
```text
Change this function to improve its performance.
```

For proactive action by default:

```text
<default_to_action>
By default, implement changes rather than only suggesting them. If the user's intent is unclear, infer the most useful likely action and proceed, using tools to discover any missing details instead of guessing. Try to infer the user's intent about whether a tool call (e.g., file edit or read) is intended or not, and act accordingly.
</default_to_action>
```

For conservative behavior (info/recommendations only unless asked):

```text
<do_not_act_before_instructions>
Do not jump into implementation or change files unless clearly instructed to make changes. When the user's intent is ambiguous, default to providing information, doing research, and providing recommendations rather than taking action. Only proceed with edits, modifications, or implementations when the user explicitly requests them.
</do_not_act_before_instructions>
```

Claude is responsive to the system prompt. Avoid aggressive language like "CRITICAL: You MUST use this tool when..." — use normal prompting like "Use this tool when...". Aggressive triggers cause overtriggering.

## Parallel tool calling

Claude runs multiple speculative searches, reads several files at once, and executes bash commands in parallel. For maximum parallel efficiency:

```text
<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent tool calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially. For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. Maximize use of parallel tool calls where possible to increase speed and efficiency. However, if some tool calls depend on previous calls to inform dependent values like the parameters, do NOT call these tools in parallel and instead call them sequentially. Never use placeholders or guess missing parameters in tool calls.
</use_parallel_tool_calls>
```

To reduce parallelism:

```text
Execute operations sequentially with brief pauses between each step to ensure stability.
```

</tool_use>

---

<thinking_and_reasoning>

## Excessive thoroughness

Claude may gather extensive context or pursue multiple threads without being prompted. Tuning:

- **Replace blanket defaults with targeted instructions.** Instead of "Default to using [tool]," use "Use [tool] when it would enhance your understanding of the problem."
- **Remove over-prompting.** Instructions like "If in doubt, use [tool]" cause overtriggering.
- **Use effort as a fallback.** Lower `effort` if Claude remains too aggressive.

To constrain excessive reasoning:

```text
When you're deciding how to approach a problem, choose an approach and commit to it. Avoid revisiting decisions unless you encounter new information that directly contradicts your reasoning. If you're weighing two approaches, pick one and see it through. You can always course-correct later if the chosen approach fails.
```

## Adaptive thinking

Adaptive thinking (`thinking: {type: "adaptive"}`) lets Claude dynamically decide when and how much to think, calibrated by `effort` and query complexity. Higher effort and more complex queries elicit more thinking. On easy queries, the model responds directly.

Use adaptive thinking for agentic workloads: multi-step tool use, complex coding, long-horizon agent loops.

Guide thinking behavior:

```text
After receiving tool results, carefully reflect on their quality and determine optimal next steps before proceeding. Use your thinking to plan and iterate based on this new information, and then take the best next action.
```

Reduce triggering (for large/complex system prompts):

```text
Extended thinking adds latency and should only be used when it will meaningfully improve answer quality - typically for problems that require multi-step reasoning. When in doubt, respond directly.
```

Best practices:

- **Prefer general instructions over prescriptive steps.** "Think thoroughly" often produces better reasoning than a hand-written plan. Claude's reasoning frequently exceeds what a human would prescribe.
- **Multishot examples work with thinking.** Use `<thinking>` tags inside few-shot examples to show the reasoning pattern. Claude generalizes that style.
- **Manual CoT as fallback.** When thinking is off, use `<thinking>` and `<answer>` tags to separate reasoning from final output.
- **Ask Claude to self-check.** Append "Before you finish, verify your answer against [test criteria]." Catches errors reliably for coding and math.

</thinking_and_reasoning>

---

<agentic_systems>

## Long-horizon reasoning and state tracking

Claude maintains orientation across extended sessions by making incremental progress — steady advances on a few things at a time rather than attempting everything at once. This emerges strongly over multiple context windows, where Claude can work on a complex task, save state, and continue with a fresh context.

## Context awareness and multi-window workflows

Claude can track its remaining context window. If you're in an agent harness that compacts context or saves to external files (e.g. Claude Code), tell Claude so it behaves accordingly. Otherwise, Claude may wrap up work prematurely.

```text
Your context window will be automatically compacted as it approaches its limit, allowing you to continue working indefinitely from where you left off. Therefore, do not stop tasks early due to token budget concerns. As you approach your token budget limit, save your current progress and state to memory before the context window refreshes. Always be as persistent and autonomous as possible and complete tasks fully, even if the end of your budget is approaching. Never artificially stop any task early regardless of the context remaining.
```

For tasks spanning multiple context windows:

1. **Different prompt for the first window.** Use the first to set up a framework (tests, setup scripts); use later windows to iterate on a todo list.
2. **Write tests in structured format.** Ask Claude to create tests first and track them in `tests.json`. Remind it: "It is unacceptable to remove or edit tests because this could lead to missing or buggy functionality."
3. **Set up quality-of-life tools.** Create setup scripts (`init.sh`) to start servers, run tests, run linters. Prevents repeated work in fresh windows.
4. **Starting fresh vs. compacting.** Claude discovers state from the filesystem effectively. A brand-new context window with prescriptive startup beats compaction in many cases:
   - "Call pwd; you can only read and write files in this directory."
   - "Review progress.txt, tests.json, and the git logs."
   - "Manually run through a fundamental integration test before moving on to implementing new features."
5. **Provide verification tools.** Playwright MCP, computer use for UI testing. Claude needs verification tools without human feedback for long autonomous tasks.
6. **Encourage complete context usage.**

```text
This is a very long task, so it may be beneficial to plan out your work clearly. It's encouraged to spend your entire output context working on the task - just make sure you don't run out of context with significant uncommitted work. Continue working systematically until you have completed this task.
```

## State management

- **Structured formats for state data.** JSON for test results, task status.
- **Unstructured text for progress notes.** Freeform notes work well for general progress.
- **Git for state tracking.** Logs of what's been done and checkpoints that can be restored. Claude performs especially well using git across sessions.
- **Emphasize incremental progress.** Ask Claude to track progress and focus on incremental work.

## Autonomy and safety

Claude may take actions that are hard to reverse or affect shared systems (deleting files, force-pushing, posting externally) without guidance. To require confirmation for risky actions:

```text
Consider the reversibility and potential impact of your actions. You are encouraged to take local, reversible actions like editing files or running tests, but for actions that are hard to reverse, affect shared systems, or could be destructive, ask the user before proceeding.

Examples of actions that warrant confirmation:
- Destructive operations: deleting files or branches, dropping database tables, rm -rf
- Hard to reverse operations: git push --force, git reset --hard, amending published commits
- Operations visible to others: pushing code, commenting on PRs/issues, sending messages, modifying shared infrastructure

When encountering obstacles, do not use destructive actions as a shortcut. For example, don't bypass safety checks (e.g. --no-verify) or discard unfamiliar files that may be in-progress work.
```

## Research and information gathering

For complex research:

1. **Provide clear success criteria.** Define what a successful answer looks like.
2. **Encourage source verification.** Verify across multiple sources.
3. **Use a structured approach:**

```text
Search for this information in a structured way. As you gather data, develop several competing hypotheses. Track your confidence levels in your progress notes to improve calibration. Regularly self-critique your approach and plan. Update a hypothesis tree or research notes file to persist information and provide transparency. Break down this complex research task systematically.
```

## Subagent orchestration

Claude recognizes when tasks benefit from delegation and proactively spawns specialized subagents. To take advantage:

1. **Well-defined subagent tools.** Have subagent tools available and described in tool definitions.
2. **Let Claude orchestrate naturally.** Claude delegates without explicit instruction.
3. **Watch for overuse.** Claude may spawn subagents where a direct call (e.g. grep) is faster.

To constrain excessive subagent use:

```text
Use subagents when tasks can run in parallel, require isolated context, or involve independent workstreams that don't need to share state. For simple tasks, sequential operations, single-file edits, or tasks where you need to maintain context across steps, work directly rather than delegating.
```

## Prompt chaining

Claude handles most multi-step reasoning internally via adaptive thinking and subagents. Explicit chaining (sequential API calls) is useful when you need to inspect intermediate outputs or enforce a specific pipeline structure.

Most common pattern: **self-correction** — generate draft → review against criteria → refine based on review. Each step is a separate API call so you can log, evaluate, or branch.

## Limiting file creation

Claude may create temporary files (especially Python scripts) as scratchpads. To clean up:

```text
If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.
```

## Overengineering

Claude may overengineer by creating extra files, adding unnecessary abstractions, or building in unrequested flexibility. To minimize:

```text
Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Keep solutions simple and focused:

- Scope: Don't add features, refactor code, or make "improvements" beyond what was asked. A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra configurability.

- Documentation: Don't add docstrings, comments, or type annotations to code you didn't change. Only add comments where the logic isn't self-evident.

- Defensive coding: Don't add error handling, fallbacks, or validation for scenarios that can't happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs).

- Abstractions: Don't create helpers, utilities, or abstractions for one-time operations. Don't design for hypothetical future requirements. The right amount of complexity is the minimum needed for the current task.
```

## Passing tests and hard-coding

Claude may focus on making tests pass at the expense of general solutions, or use workarounds (helper scripts) instead of standard tools. To prevent:

```text
Please write a high-quality, general-purpose solution using the standard tools available. Do not create helper scripts or workarounds to accomplish the task more efficiently. Implement a solution that works correctly for all valid inputs, not just the test cases. Do not hard-code values or create solutions that only work for specific test inputs. Instead, implement the actual logic that solves the problem generally.

Focus on understanding the problem requirements and implementing the correct algorithm. Tests are there to verify correctness, not to define the solution. Provide a principled implementation that follows best practices and software design principles.

If the task is unreasonable or infeasible, or if any of the tests are incorrect, please inform me rather than working around them. The solution should be robust, maintainable, and extendable.
```

## Hallucinations in agentic coding

To minimize hallucinations and keep answers grounded:

```text
<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.
</investigate_before_answering>
```

</agentic_systems>

---

<capability_specific>

## Vision

Strong on image processing and data extraction, particularly with multiple images in context. Carries over to computer use (screenshots, UI elements). Can analyze videos by breaking them into frames.

Effective technique: give Claude a crop tool or skill so it can "zoom" in on relevant regions. See the [crop tool cookbook](https://platform.claude.com/cookbook/multimodal-crop-tool).

## Frontend design

Without guidance, Claude defaults to generic patterns — the "AI slop" aesthetic. To create distinctive frontends:

```text
<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight.

Focus on:
- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.
- Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.
- Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>
```

See the [frontend-design skill](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md) for full guidance.

</capability_specific>
