---
name: termrender
description: Rich terminal rendering of directive-flavored markdown. Panels, trees, columns, callouts, mermaid diagrams, and syntax-highlighted code — rendered as ANSI output or displayed in a tmux side pane. Use when producing visual output, diagrams, or structured terminal displays.
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

Directives open with 3+ colons (`:::name{attrs}`, `::::name{attrs}`, etc.) and close with a matching colon count. `:::divider` is self-closing. For nesting, use more colons on outer directives so closers are unambiguous:

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

### Backtick Fence Directives

Directives can also use backtick fence syntax (MyST standard):

````
```{panel}
:title: Hello
Content here.
```
````

Option lines (`:key: value`) set attrs — they go between the opening fence and the body. Inline attrs (`{title="Hello"}`) take precedence over option lines.

### Option Lines

Both colon and backtick directives support option lines at the top of the body:

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

### Mermaid — ASCII diagrams
````
```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
```
````

## Mermaid Best Practices

Mermaid diagrams render as ASCII box art — every node becomes a bordered rectangle. Diagrams that look clean in a browser can be unreadable in a terminal. Follow these rules:

**Fewer nodes, more text.** Each node should carry enough context to be useful on its own. Don't split a concept across multiple tiny nodes — combine them into one descriptive node. 3–6 nodes is ideal; 8+ usually produces output wider than the terminal.

**Keep labels short but descriptive.** Node labels render inside bordered boxes. Long labels make wide boxes that eat horizontal space. Aim for 2–5 words per node. Use `<br/>` for multi-line labels when a node needs more context.

**Prefer `graph TD` over `graph LR`.** Top-down layouts grow vertically (cheap in a terminal) instead of horizontally (expensive). LR graphs with 4+ nodes in a chain will overflow most terminals.

**Limit branching.** A node with 4+ children at the same depth creates 4+ side-by-side boxes. If a node has many children, consider grouping related children into a single summary node, or splitting into separate diagrams.

**Use panels for detail, mermaid for flow.** Don't cram implementation details into node labels. Show the high-level flow in mermaid, then use `:::panel` or `:::columns` below to expand on each step.

**Bad** — too many small nodes, spreads wide:
````
```mermaid
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
```
````

**Good** — fewer nodes, each tells a story:
````
```mermaid
graph TD
    A[Worker boots and<br/>initializes all services] --> B{Feature flag<br/>TAPLINE_ENABLED?}
    B -->|disabled| C[Worker enters idle state,<br/>no pipeline activity]
    B -->|enabled| D[Validates auth token,<br/>fetches whitelist config,<br/>starts capture pipeline]
    D --> E[Pipeline running:<br/>processes CDP events,<br/>uploads captures hourly,<br/>refreshes config]
```
````

## Standard Markdown

All GFM markdown works inside directives: headings, **bold**, *italic*, `code`, bullet/numbered lists, fenced code blocks, and GFM tables.

## Colors

Available for `panel` and `tree` color attrs:
`red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`

## Rendering to tmux

`--tmux` opens a tmux split pane with rendered output — the diagram stays visible alongside the conversation. This is the preferred display method when the user is in tmux, because inline rendering gets buried by subsequent output.

Write to a temp file first, then render. Validate with `--check` if the document uses complex nesting.

## Complete Example

A well-structured termrender document combines multiple directives to tell a visual story:

```
# API Request Flow

:::panel{title="Client — src/client.ts:42" color="green"}
Sends authenticated requests via `fetchWithAuth()`.
Attaches JWT from session store.
:::

```mermaid
graph TD
    A[Client sends POST /api/data] --> B{Auth middleware<br/>validates JWT}
    B -->|valid| C[Handler: parse, validate, write]
    B -->|invalid| D[401 rejected]
```

::::columns
:::col{width="50%"}
:::panel{title="Auth Middleware — src/middleware/auth.ts" color="blue"}
- Validates JWT signature
- Checks token expiry
- Attaches `req.user`
:::
:::
:::col{width="50%"}
:::panel{title="Data Handler — src/handlers/data.ts" color="blue"}
- Parses request body
- Validates with Zod schema
- Writes to Postgres
:::
:::
::::

:::callout{type="info"}
Auth middleware rejects before handler runs — no partial execution on invalid tokens.
:::

:::panel{title="Tech Stack" color="gray"}
| Layer | Technology |
|-------|-----------|
| Runtime | Node 20 + Express |
| Auth | JWT (RS256) |
| Validation | Zod |
| Database | PostgreSQL 16 |
:::
```
