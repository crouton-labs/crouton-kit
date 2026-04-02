---
name: frontend-mockup
description: Build interactive HTML mockups that match the project's actual theme for UX exploration and design review. Use when the user wants to visualize a UI concept, compare design options, or prototype a feature before implementing it in the real codebase.
---

# Frontend Mockup

Build self-contained HTML design review documents. One `.html` file, no dependencies, opens in a browser. The output is for **thinking through design** — comparing options, evaluating states, making decisions — before any real code is written.

## Before You Start

### Read the Real Theme

Extract actual CSS variables from the project's theme file (`globals.css`, `tailwind.config.*`, etc.). Map them into the mockup's `:root` block. Don't guess colors, don't use generic grays when the project has a real palette. Include brand/accent colors — even if used sparingly, they make the mockup feel like the real product.

### Understand the Context

Read 2-3 real components to absorb the project's visual personality — density, font scale, interaction patterns, border radius, depth strategy. The mockup should feel like it belongs to this project.

---

## Document Structure

The mockup is a scrollable design review document. It has its own chrome (navigation, section headers, callouts) that is visually distinct from the UI being mocked inside it.

### Sticky Navigation

A fixed nav bar at the top with anchor links to every section. Dark or inverted background to separate document chrome from content. Section names in the nav should describe the option or state, not just "Section 1."

```
[Option A: Slide Panel] [Option B: Drawer] [Option C: Inline] [Compare]
```

The reviewer can jump to any option in one click without scrolling. Highlight the current section on scroll via a small JS `IntersectionObserver` or scroll listener.

### Sections as Cards

Each section wraps in a rounded card on a tinted page background (`body` at off-white, sections at white). This creates natural separation without heavy dividers. Alternate section backgrounds between `#fff` and `#fafafa` for additional rhythm when sections are long.

### Three-Level Section Headers

Every section opens with:

1. **Tag** — Small-caps, 0.625rem, 600 weight, 0.08–0.1em letter spacing, colored by category (teal for recommended, amber for trade-off, red for problem). This is the chapter marker.
2. **Title** — 1.25rem, 600 weight, tight tracking. The actionable name.
3. **Description** — 0.8125rem, 400 weight, muted color, max-width ~42rem. One or two sentences stating what this section shows and the design tradeoff — not a feature explanation. Answer "why would I pick this?"

The prose appears above the mockup frame, so the reviewer is primed with intent before evaluating the visual.

---

## Mockup Frames

Each design option or state is rendered as a **full-fidelity app frame** — not a component in isolation. Include enough surrounding UI (navigation, header, content area) that the feature being designed is seen in context.

### App Shell Realism

- Render at realistic proportions inside a bordered, shadowed, rounded container
- Use real-looking content — plausible names, messages, timestamps. Never "Lorem ipsum" or "Item 1"
- Add macOS traffic-light dots (`.mock-titlebar`) on the frame to signal "this is an app window" — eliminates any "is this the mockup or the document?" confusion

### Show Every Meaningful State

Don't just show the happy path. Render:
- **Idle/empty** — what it looks like when the feature is inactive (zero noise)
- **Active** — the primary visible state
- **Edge cases** — urgency levels, error states, disabled items, overflow
- **Interaction states** — hover, selected, expanded (render these statically in parallel, not behind a click)

Label each state with a small-caps state label inside the mockup section ("State 1 — At Rest", "State 2 — Expanded"). The label answers "what triggered this view?" in one line.

### Disabled and Inactive States

Use `opacity: 0.45–0.5` as the single signal for paused/disabled items. Don't hide them — the reviewer needs to see how inactive items coexist with active ones. One CSS rule communicates the semantic without markup clutter.

---

## Comparison Patterns

### Option Columns

When comparing 2-4 options, place them in a horizontal grid at equal width. Hold content constant across options — same data, same names, same numbers — so the only variable is the design treatment. Comparison is spatially guaranteed, not left to chance.

Give each option a **color-coded tag** (blue for A, pink for B, green for C). The color becomes a mnemonic — reviewers can say "the blue one" without remembering names.

### Before/After

When showing a redesign, put the current state and the proposed state side-by-side in a two-column grid with a 1px border divider. The 1px divider is visually neutral — contrast comes from content, not chrome.

### Comparison Tables

For systematic evaluation, include a table at the end with rows for each criterion and columns for each option. Use semantic coloring: green text for strengths, red for weaknesses, muted for neutral. Keep cells to one phrase — the table is for scanning, not reading.

### Flow Diagrams

For multi-step journeys, use a horizontal row of numbered cards connected by arrows. Each card has: a numbered circle, a tag showing effort level, a title, and a 1-2 line description. The whole flow is glanceable in one row.

---

## Annotation Patterns

### Semantic Callout Boxes

Color-coded boxes with a small-caps label and body text:
- **Green/teal** — "Why this works" or "What already exists"
- **Red** — "Problem" or "Current failure"
- **Amber** — Trade-off or caveat
- **Blue** — Implementation notes or technical context

These let reviewers scan for problems vs. positives without reading every word.

### Inline Annotations

When annotating a specific part of a mockup, place prose flush to the right of the mock at a fixed width (~320px). The reviewer never has to switch between the UI and the rationale — they're adjacent.

### Removed-Item Documentation

When a design decision removes something, list it explicitly: what was cut and why (a one-line CSS comment like `/* REMOVED: confusing, nobody knows what the bars mean */` works too). This preempts "why didn't you include X?" and shows the decision was deliberate.

---

## Visual Polish

### Units

Use `rem` throughout — no `px` for sizing, padding, margins, gaps, or font sizes. This matches Tailwind conventions.

### Typography

- **Document chrome** uses a clear hierarchy: tag (0.625rem/600) → title (1.25rem/600) → body (0.8125rem/400). The font weight range is deliberate — only tags and titles are semibold, everything else is regular weight. When everything is bold, nothing stands out.
- **Inside mockup frames**, use the project's actual type scale.
- Use **monospace** for data values, KPIs, code snippets, and system-generated text. This separates "data being designed" from surrounding chrome.

### Spacing

- **Between sections**: generous (2–2.5rem padding inside section cards, 0.875rem margin between cards)
- **Inside mockup frames**: match the project's actual density (tight padding, small gaps — production density, not marketing density)
- Pick a base unit and use consistent multiples. Random spacing signals no system.

### Color

- Page background slightly tinted (off-white) so white mockup frames lift off the surface without needing heavy borders
- CSS variables for all colors — the mockup is themeable by editing one `:root` block
- Muted neutral palette for document chrome (`--muted`, `--muted-fg`, `--border`) so it never competes with the UI being reviewed
- Brand/accent colors from the project used inside mockup frames

### Borders and Depth

- Section cards: `1px solid` subtle border + light `box-shadow` (`0 1px 3px rgba(0,0,0,0.04)`)
- Mockup frames inside sections: slightly stronger border + shadow to distinguish them from the section card
- Left-border accents (3px colored left border) for callout emphasis and status indicators — borrows from blockquote conventions, already carries "notice this" meaning

### Scrollbar

Style thin scrollbars (`0.3125rem` width, transparent track, border-colored thumb) so they don't disrupt the layout.

---

## Source Code Hygiene

- **CSS variable block** at the top of `<style>` — all colors, spacing, fonts as named variables
- **Box-drawing section dividers** in CSS comments (`/* ═══ OPTION A ═══ */`) so the source file is skimmable
- **HTML block comments** before each major section (`<!-- ═══ SECTION 2 ═══ -->`)
- Short, consistent class names — these are throwaway files, not production code

---

## After Writing

Always `open` the HTML file so the user sees it immediately.

---

## Anti-Patterns

- **Isolated components on white** — a feature floating outside app context tells you nothing about how it fits
- **Wrong theme** — using generic colors when the project has a distinctive palette
- **Flat typography** — same size and weight everywhere means the eye has no entry point
- **Generic content** — "User 1", "Item A" makes the mockup feel fake and hides edge cases
- **Missing states** — only showing the happy path
- **Too many competing signals** — dots + badges + strips + tags on the same element = noise
- **Description that explains the feature** — the description should state the design tradeoff, not what the feature does. "Maximum density, sacrifices discoverability" > "This shows workers in a list"
