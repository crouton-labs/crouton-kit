---
name: termrender
description: Rich terminal rendering of directive-flavored markdown. Panels, trees, columns, callouts, mermaid diagrams, syntax-highlighted code, diffs, charts, KPI tiles, timelines, tasklists, and inline badges — rendered as ANSI output or displayed in a tmux side pane. Use when producing visual output, diagrams, or structured terminal displays.
allowed-tools: Bash(termrender:*), Read, Write
---

# termrender — Terminal Rendering Skill

Render directive-flavored markdown as rich ANSI terminal output using the `termrender` CLI.

## CLI Quick Reference

```
termrender <file>              Render a markdown file
termrender <file> --tmux       Render in a new tmux side pane
termrender -w 100 <file>       Render at specific column width
termrender --check <file>      Validate syntax without rendering
cat file.md | termrender       Render from stdin
```

## Directives

**Use `:::` (three colons), not `::`.** Two-colon lines are NOT directives — the parser treats them as plain text and they render verbatim. Every fence below opens with at least three colons and closes with the same count.

Directives open with 3+ colons (`:::name{attrs}`, `::::name{attrs}`, etc.) and close with a matching colon count. `:::divider`, `:::progress`, and `:::gauge` are self-closing at top level (no body, no closer needed); every other directive needs an explicit closer.

The available directives are exactly those documented below. Do **not** invent ones not on this list — `tile`, `tab`/`tabs`, `title`, `diagram`, and `table` (with attrs) are not real directives. For tiles use `:::stat`; for diagrams use `:::mermaid`; for tables use plain GFM `| col | col |` syntax with no fence; headings are `#`/`##` markdown.

**Backticks are for code only.** ` ``` ` fences always produce a code block — `` ```mermaid `` and `` ```{name} `` are NOT directives, they render as plain code blocks with `mermaid` or `{name}` as the language label. Every termrender directive uses `:::`.

### Nesting

**Rule:** outer fences must use strictly more colons than the inner fences they wrap. The parser pairs openers and closers by colon count — a closer with a different count is treated as body content and re-parsed recursively. This matches MyST, Pandoc fenced divs, and markdown-it-container conventions.

```
::::columns
:::col{width="50%"}
Left content.
:::
:::col{width="50%"}
Right content.
:::
::::
```

For 3 levels use `:::::` → `::::` → `:::`. The extra colons make it visually clear which closer matches which opener and let the parser fail fast on mismatches.

**Self-closing caveat:** `divider`, `progress`, and `gauge` are only self-closing at the *top level*. When nested inside another directive, they still need an explicit closer.

### Option Lines

Directives support option lines at the top of the body:

```
:::panel
:title: My Panel
:color: blue
Content here.
:::
```

### Panel — bordered box
```
:::panel{title="Title" color="blue"}
Content here.
:::
```

### Columns — side-by-side layout
```
::::columns
:::col{width="50%"}
Left content.
:::
:::col{width="50%"}
Right content.
:::
::::
```

### Tree — hierarchical view
```
:::tree{color="cyan"}
Root
  Branch A
    Leaf 1
    Leaf 2
  Branch B
:::
```
Indentation (2 spaces) defines nesting depth.

### Callout — status box with icon
```
:::callout{type="info"}
Important note here.
:::
```
Types: `info`, `warning`, `error`, `success`

### Quote
```
:::quote{author="Author Name"}
Quoted text here.
:::
```

### Code — syntax highlighted
```
:::code{lang="python"}
def hello():
    print("world")
:::
```

### Divider — horizontal rule (self-closing, no `:::`)
```
:::divider{label="Section Break"}
```

### Diff — colored unified diff
```
:::diff{title="auth.py"}
- old_token = jwt.encode(payload, key)
+ new_token = jwt.encode(payload, key, algorithm="HS256")
  return new_token
:::
```
Lines starting with `+` render green, `-` red, `@` (hunk headers) magenta. Other lines are dim. The `title` attr is optional and defaults to `diff`.

### Bar — multi-bar horizontal chart
```
:::bar{title="requests/sec" color="cyan"}
api-gateway: 12400
auth: 8200
cache: 5100
:::
```
Body is one `label: value` per line (also accepts `label | value unit`). Bar widths scale to the largest value; sub-cell precision uses Unicode eighths blocks. Optional `title` and `color` attrs.

### Progress — single-line progress bar (self-closing)
```
:::progress{value=70 max=100 label="Build"}
```
Color auto-selected by ratio (red < 50% < cyan < 99% < green) unless `color=` is set. Renders as one line.

### Gauge — three-line meter (self-closing)
```
:::gauge{value=88 max=100 label="Memory" unit="%"}
```
Three lines: label, full-width bar, numeric readout. Color auto-selected by load (green < 70% < yellow < 90% < red). Use for resource utilization where the threshold matters.

### Stat — KPI tile
```
:::stat{label="p99 latency" value="34ms" delta="-12%"}
:::
```
Bordered tile with label, large centered value, and trend arrow + delta. `delta` sign auto-picks ▲ (green) or ▼ (red); override with `trend="up|down|flat"`. Optional body becomes a caption below the delta. Compose multiple stats inside `:::columns` for dashboards.

### Timeline — vertical event timeline
```
:::timeline{title="Release history" color="cyan"}
- 2024-01: v1.0 launched
- 2024-06: v2.0 redesign
- 2025-03: v3.0 mobile
:::
```
Body is `- date: event` per line (`|` also works as the separator). Renders dates right-aligned with bullet markers and `│` connectors between entries.

### Tasklist — checkbox list
```
:::tasklist
- [x] write parser
- [x] write renderer
- [ ] write tests
- [!] in progress
:::
```
Renders ☑ / ☐ / ◐ checkboxes. The `:::tasklist` directive forces tasklist styling on the inner list and treats unmarked items as unchecked. Plain markdown lists with at least one `[x]`/`[ ]`/`[!]` marker are auto-promoted to tasklists — the directive is only needed when you want every item to render as an unchecked todo without writing `[ ]` on each line.

### Inline badges
```
Status: :badge[stable]{color=green} :badge[v3.2.0]{color=blue}
```
Inline pill rendered with colored fg + dim bg, usable inside any paragraph, list item, table cell, or stat caption. Colors: `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `gray`. Defaults to `blue`.

### Mermaid — ASCII diagrams
```
:::mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
:::
```
Body is standard mermaid source. `` ```mermaid `` is **not** supported — it will render as a plain code block.

## Mermaid Best Practices

Mermaid diagrams render as ASCII box art — every node becomes a bordered rectangle. Diagrams that look clean in a browser can be unreadable in a terminal. Follow these rules:

**Fewer nodes, more text.** Each node should carry enough context to be useful on its own. Don't split a concept across multiple tiny nodes — combine them into one descriptive node. 3–6 nodes is ideal; 8+ usually produces output wider than the terminal.

**Keep labels short but descriptive.** Node labels render inside bordered boxes. Long labels make wide boxes that eat horizontal space. Aim for 2–5 words per node. Use `<br/>` for multi-line labels when a node needs more context.

**Prefer `graph TD` over `graph LR`.** Top-down layouts grow vertically (cheap in a terminal) instead of horizontally (expensive). LR graphs with 4+ nodes in a chain will overflow most terminals.

**Limit branching.** A node with 4+ children at the same depth creates 4+ side-by-side boxes. If a node has many children, consider grouping related children into a single summary node, or splitting into separate diagrams.

**Use panels for detail, mermaid for flow.** Don't cram implementation details into node labels. Show the high-level flow in mermaid, then use `:::panel` or `:::columns` below to expand on each step.

**Bad** — too many small nodes, spreads wide:
```
:::mermaid
graph TD
    A[Boot] --> B[Init services]
    B --> C[Check flag]
    C -->|yes| D[Validate auth]
    D --> E[Fetch config]
    E --> F[Start pipeline]
    C -->|no| G[Idle]
    F --> H[Running]
    H --> I[Process events]
    H --> J[Upload data]
    H --> K[Refresh config]
:::
```

**Good** — fewer nodes, each tells a story:
```
:::mermaid
graph TD
    A[Worker boots and<br/>initializes all services] --> B{Feature flag<br/>TAPLINE_ENABLED?}
    B -->|disabled| C[Worker enters idle state,<br/>no pipeline activity]
    B -->|enabled| D[Validates auth token,<br/>fetches whitelist config,<br/>starts capture pipeline]
    D --> E[Pipeline running:<br/>processes CDP events,<br/>uploads captures hourly,<br/>refreshes config]
:::
```

## Standard Markdown

All GFM markdown works inside directives: headings, **bold**, *italic*, `code`, bullet/numbered lists, fenced code blocks, and GFM tables.

## Colors

Available for `panel`, `tree`, `bar`, `progress`, `gauge`, `timeline`, and `stat` color attrs:
`red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`

Inline badges support `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `gray`.

## Rendering to tmux

`--tmux` opens a tmux split pane with rendered output — the diagram stays visible alongside the conversation. This is the preferred display method when the user is in tmux, because inline rendering gets buried by subsequent output.

Write to a temp file first, then render. Validate with `--check` if the document uses complex nesting.

## Picking the right component

| Goal | Use |
|------|-----|
| Show code changes | `:::diff` |
| Compare quantities across categories | `:::bar` |
| Show task or build completion | `:::progress` |
| Show resource utilization vs threshold | `:::gauge` |
| Headline metric on a dashboard | `:::stat` (compose in `:::columns`) |
| Chronology / changelog / postmortem | `:::timeline` |
| Todo list, plan checkboxes | `:::tasklist` or plain `- [x]`/`- [ ]` |
| Inline status tag inside text | `:badge[...]{color=...}` |
| Bordered grouping with title | `:::panel` |
| Status note (info/warn/error/success) | `:::callout` |
| Side-by-side layout | `:::columns` + `:::col` |
| File / directory hierarchy | `:::tree` |
| Architecture or flow diagram | `:::mermaid` (3–6 nodes — see Mermaid Best Practices) |

## Complete Example

A well-structured termrender document combines multiple directives to tell a visual story:

```
# Deploy report :badge[v3.2.0]{color=blue} :badge[stable]{color=green}

::::columns
:::col{width="33%"}
:::stat{label="p99 latency" value="34ms" delta="-12%"}
:::
:::
:::col{width="33%"}
:::stat{label="error rate" value="0.02%" delta="+5%"}
:::
:::
:::col{width="33%"}
:::stat{label="throughput" value="12.4k" delta="+8%"}
:::
:::
::::

:::bar{title="requests/sec by service"}
api-gateway: 12400
auth: 8200
cache: 5100
:::

:::gauge{value=88 max=100 label="Memory" unit="%"}

:::diff{title="auth.py"}
- old_token = jwt.encode(payload, key)
+ new_token = jwt.encode(payload, key, algorithm="HS256")
  return new_token
:::

:::callout{type="success"}
6 of 7 services healthy. scheduler at 83% memory — GC tuning shipping next release.
:::

:::tasklist
- [x] migrate auth middleware
- [x] update integration tests
- [ ] update runbook
- [!] coordinate with mobile team
:::

:::timeline{title="Release history"}
- 2024-01: v1.0 launched
- 2024-06: v2.0 redesign
- 2025-03: v3.0 mobile
- 2026-04: v4.0 LLM SDK
:::
```
