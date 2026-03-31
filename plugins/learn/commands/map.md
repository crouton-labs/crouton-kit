---
description: Map out code structure, flows, or architecture at any granularity
argument-hint: <topic> [--detail | --overview]
disable-model-invocation: true
---

Map out and visualize:

$ARGUMENTS

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

## Output format

Single unified box diagram using `┌─┐└─┘│─▼▶┬┴├┤` characters.

- Every box gets a header: name + file path (and line number at detail level)
- Every arrow gets a label
- Detail level: show conditional/error branches as splits
- Overview level: append a tech stack table

Do not narrate the investigation. Diagram is the deliverable.
