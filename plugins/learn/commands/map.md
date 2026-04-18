---
description: Map out code structure, flows, or architecture at any granularity
argument-hint: <topic> [--detail | --overview]
allowed-tools: Bash(termrender:*), Read, Grep, Glob, Agent
---

Map out and visualize:

$ARGUMENTS

## Environment

Tmux: !`[ -n "$TMUX" ] && echo "active — render with termrender --tmux" || echo "inactive — render inline"`

## termrender reference

```!
termrender -h
```

## Granularity

Infer from topic breadth, or respect explicit flags (`--overview`/`--o`, `--detail`/`--d`):

| Level | When | Boxes contain | Arrows show |
|-------|------|---------------|-------------|
| **overview** | "this repo", "the auth system", broad scope | File paths, key exports | Dependencies, data direction |
| **component** | "how services interact", specific subsystem | Signatures, key logic lines | Data types, actions |
| **detail** | "how a login request flows", specific path | Real code snippets with file:line | Data transformations, conditions, branches |

## Investigation strategy

- **Overview**: launch 2-4 parallel Explore agents targeting different areas, then synthesize
- **Component/detail**: read files directly — no agents unless scope turns out wider than expected

## Output

Produce **termrender directive markdown**. Write to `/tmp/map-output.md`, then render via `termrender` (use `--tmux` when tmux is active).

### Directive selection

- `:::panel` for component boxes — title includes name + file path (line number at detail level)
- `:::tree` for hierarchies and dependency trees
- `:::columns` + `:::col` for side-by-side comparisons
- `:::callout{type="info"}` for architectural notes or gotchas
- ` ```mermaid ` for data flows and labeled relationships (3-6 nodes, prefer `graph TD`)
- GFM tables inside `:::panel` for tech stack summaries (overview level)
- `:::code{lang="..."}` for real code snippets (detail level)

### Color conventions

| Color | Meaning |
|-------|---------|
| `blue` | Core components |
| `cyan` | Data flow / trees |
| `green` | Entry points, public API |
| `yellow` | Configuration, environment |
| `magenta` | External dependencies |
| `gray` | Internal utilities |

Do not narrate the investigation. The rendered diagram is the deliverable.
