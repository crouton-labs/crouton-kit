# Data Visualization UX

Designing charts, dashboards, and interactive data displays that communicate clearly, scale to context, and respect user cognition.

---

## Chart Type Selection

Choose chart type based on the **relationship** you're communicating, not aesthetics.

| Relationship | Chart Type | Notes |
|---|---|---|
| **Comparison (categorical)** | Bar / Column | Default choice; position on common scale is most accurately perceived (Cleveland & McGill 1984) |
| **Trend over time** | Line | Implies continuity — only use if the metric is continuous (not discrete categories) |
| **Part-to-whole** | Stacked bar, treemap | Pie only works with 2–3 slices and when rough proportion is sufficient |
| **Correlation / distribution** | Scatter plot | Requires two quantitative axes; add trend line only when supported by data |
| **Distribution shape** | Histogram, violin, box plot | Reveals spread, skew, outliers — not just averages |
| **Flow / magnitude change** | Area chart | Use sparingly; area encoding less precise than length (Cleveland & McGill) |
| **Precise lookup** | Table | When users need exact values, not patterns; combine with conditional formatting for scanning |
| **Geographic** | Choropleth, dot map | Choropleth distorts by land area — prefer dot maps for count data |

**Decision rule (NNGroup):** Define your goal first — what question is the viewer answering? Pick the chart type that answers it in the fewest cognitive steps.

**Small multiples (Tufte):** Repeat the same chart across a dimension (time, region, category) rather than layering everything into one complex chart. Enables comparison with low cognitive overhead.

---

## Visual Encoding Principles

Cleveland & McGill (1984) ranked encoding channels from most to least accurately perceived:

| Rank | Encoding | Example Use |
|---|---|---|
| 1 | **Position on common scale** | Bar charts, dot plots |
| 2 | **Position on non-aligned scale** | Multiple axes, small multiples |
| 3 | **Length** | Bar length, lollipop charts |
| 4 | **Direction / Angle** | Slope charts, compass — less accurate than length |
| 5 | **Area** | Bubble charts, treemaps — use only for rough magnitude |
| 6 | **Volume / Curvature** | 3D charts — avoid; highest error rate |
| 7 | **Shading / Color saturation** | Sequential encoding of quantity |
| 8 | **Color hue** | Categorical distinction only — not for quantitative ranges |

**Tufte's data-ink ratio:** Maximize the proportion of ink devoted to data. Erase non-data ink (gridlines, borders, tick marks, background fills) unless it aids comprehension. *The Visual Display of Quantitative Information*, 1983.

**Preattentive attributes (NNGroup):** Color, size, orientation, and shape are processed before conscious attention engages. Use sparingly — one preattentive channel per chart for focal attention, not decoration.

---

## Color in Data Visualization

### Palette Types

| Type | When to Use | Example |
|---|---|---|
| **Sequential** | Ordered quantity from low to high (one variable) | Blues, YlOrRd — all ColorBrewer sequential palettes are colorblind-safe |
| **Diverging** | Values above and below a meaningful midpoint (e.g., positive/negative, above/below average) | BrBG, PuOr — avoid RdGy and RdYlGn |
| **Categorical** | Unordered discrete groups | Set2, Dark2 — safe for up to 3–4 categories |

### Rules

- **Max 5–7 categorical colors.** Beyond 7, viewers cannot reliably distinguish hues. If you need more, use small multiples instead. (Few, *Show Me the Numbers*, 2004)
- **Never use rainbow/spectral palettes** for sequential data — they imply non-existent category boundaries and are not perceptually uniform.
- **Red/green is the most common colorblind conflict** (deuteranopia, ~8% of men). Use blue/orange or blue/red as diverging defaults.
- **Semantic color** carries meaning — red = bad/danger, green = good/safe — but only apply when the semantic matches your data. Mismatched semantics actively mislead.
- **Color is not sufficient alone** — WCAG 1.4.1 requires a non-color means of conveying the same information (pattern, shape, label, or position).
- **Contrast ratio** — text on colored backgrounds must meet WCAG AA (4.5:1 for body text, 3:1 for large text).

---

## Labels, Legends & Annotations

### Direct Labels vs. Legends

**Prefer direct labels when possible.** Direct labeling:
- Eliminates eye travel between chart and legend (reduces cognitive load)
- Removes the color identification task — better for color-vision deficiency
- Works best with ≤5 series that don't heavily overlap

**Use a legend when:**
- Series overlap frequently makes inline labeling ambiguous
- Chart is small and labels would crowd the data area
- A shared legend serves multiple small-multiple charts

**Pattern:** Place the legend where eye movement is natural — typically top-right or immediately below the chart title, not at the bottom after all data.

### Annotation Patterns

- **Event annotations** — vertical markers on time-series for releases, incidents, campaigns. Always label the event, not just the line.
- **Callout annotations** — highlight a single outlier or insight. Use sparingly; if everything is annotated, nothing is emphasized.
- **Trend / average lines** — add reference context without requiring users to estimate it mentally.
- **Data density guideline:** Surface the key insight in the chart title or subtitle ("Revenue up 23% YoY") so users who don't read axes still understand the finding. (Datawrapper Blog)

---

## Interaction Patterns

| Pattern | Description | Use When |
|---|---|---|
| **Tooltip on hover** | Reveal precise values on pointer contact | Exact values clutter the static view but are needed on demand |
| **Brushing / selection** | Click-drag to select a region; highlights selection across linked views | Exploratory analysis, time-window selection |
| **Linked views** | Selection in one chart filters or highlights all others | Dashboards with multiple related dimensions |
| **Zoom & pan** | Navigate dense or time-series data at multiple scales | Large datasets where macro + micro views both matter |
| **Filter controls** | Dropdowns, toggles, sliders to constrain visible data | Known user need to compare subsets |
| **Drill-down** | Click a summary to see its breakdown | Hierarchical data (region → city → store) |
| **Detail on demand** | Overview visible by default; details accessible via interaction | Complex data where full detail creates overload |

**Shneiderman's mantra** (1996): *Overview first, zoom and filter, then details on demand.* This is the foundational sequence for interactive visualization design.

**Tooltip design rules:**
- Show the full data label, not just the value
- Include units
- Appear near the cursor, not at a fixed corner
- Do not obscure the data the user is hovering
- Keyboard-accessible via focus (WCAG 2.5.3)

---

## Responsive & Mobile Data Visualization

Mobile users are in **monitoring mode** — checking status, not exploring. Do not replicate the desktop view at smaller size.

**Adaptation strategies:**

- **Reduce data density aggressively.** A desktop dashboard might show 15–20 data points; a mobile screen comfortably shows 3–5. One screen = one question. (boundev.com, 2025)
- **Simplify chart types.** Scatter plots and multi-series charts degrade on small screens — prefer single-series bar or line charts, KPI tiles, and sparklines.
- **Reorient layouts.** Horizontal bar charts with long labels work better than vertical; rotate if labels clip.
- **Touch targets ≥ 44px** (Apple HIG; Material Design). Place interactive controls in the bottom 40% of the screen — natural thumb zone.
- **Use relative units** (%, vw) not fixed pixels for chart containers. SVG scales without quality loss; canvas-based charts need explicit resize logic.
- **Prioritize data, not chrome.** On mobile, remove axis titles, reduce tick marks, and use shorter number formats (1.2M not 1,200,000).
- **Progressive disclosure** — show summary KPI first; tap to expand the full chart. Do not force all detail onto the initial screen.
- **Avoid hover-only interactions** — touchscreens have no hover state. Tooltips must be tap-triggered with a dismiss mechanism.

---

## Accessibility

Charts must be accessible under **WCAG 2.2 AA** (mandatory for UK public sector since 2020; best practice universally).

### Alt Text

- Every chart image needs `alt` text describing the key insight, not just the chart type. "Bar chart showing sales by region" is insufficient. "Bar chart: APAC leads with £4.2M, followed by EMEA at £3.1M" is correct.
- For complex charts, provide a long description (`aria-describedby`) or a summary paragraph adjacent to the chart.
- Interactive SVG charts should use `role="img"` with `aria-label` on the root element.

### Screen Readers

- Provide the underlying data as an HTML `<table>` (visually hidden or collapsible) as an alternative to the visual chart. Screen readers navigate tables natively.
- Use ARIA live regions to announce filter changes or updated data.
- Avoid SVG-only charts without text alternatives — most screen readers do not interpret SVG geometry.

### Keyboard Navigation

- All interactive elements (tooltips, filters, drill-down controls) must be reachable and operable with keyboard alone (WCAG 2.1.1).
- Implement logical tab order — controls before chart, then data points navigable with arrow keys.
- Focus indicators must be visible (WCAG 2.4.11, AA in WCAG 2.2).

### High Contrast

- Support `prefers-contrast: more` media query — avoid relying solely on color saturation differences in high-contrast mode.
- Use patterns or textures as supplementary encoding in addition to color (satisfies WCAG 1.4.1).
- Test with Windows High Contrast Mode and macOS Increased Contrast.

*Source: Government Analysis Function (UK), A11Y Collective, TPGI accessible data visualization guide.*

---

## Dashboard Layout

### Information Hierarchy

Dashboards communicate through spatial arrangement. Users scan in F-pattern or Z-pattern. Place the most critical KPIs top-left; supporting detail progresses toward bottom-right. (Few, *Information Dashboard Design*, 2006)

**Layout principles:**

- **Overview first** — summary KPIs and health indicators visible without scrolling
- **Group related metrics** — visual proximity signals conceptual relationship; use whitespace not borders as primary separator
- **Limit to one screen** — scrolling breaks the "at a glance" promise of a dashboard; if it scrolls, it may be a report
- **Consistent grid** — align all charts to a shared baseline grid to reduce visual noise from misaligned edges
- **Visual hierarchy via size** — the most important chart should be largest; secondary charts proportionally smaller

### Cognitive Load Management

- **No more than 5±2 distinct groups** of information on a single view (Miller's Law applied to dashboards)
- **Avoid overloading color** — if every chart uses a different palette, the dashboard feels chaotic; standardize a palette across the dashboard
- **Pre-attentive alerts** — use color (red/amber/green) only for status states, not decoration; viewers will assume status meaning even if unintended
- **Clear titles** — every chart title should state the insight or metric name, not just the chart type. "Monthly Active Users" is a label; "MAU grew 14% MoM" is a title.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| **3D charts** | Depth distorts perceived values; foreground bars appear larger; no data is added | Remove the third dimension entirely |
| **Pie charts with >5 slices** | Humans cannot accurately compare angles; small slices become illegible | Use a horizontal bar chart sorted by value |
| **Dual Y-axes** | Two independent scales allow arbitrary visual correlation; one axis can be scaled to imply causation | Use two separate charts or index both series to 100 |
| **Truncated Y-axis** | Non-zero baseline exaggerates differences; a 0.1% change looks like 100% | Start bar chart axes at zero; use explicit annotation if zoom is needed |
| **Rainbow / spectral palette for sequential data** | Non-uniform perceived brightness; implies category boundaries that don't exist | Use a perceptually uniform sequential palette (Blues, Viridis) |
| **Chartjunk** | Decorative gridlines, shadows, gradients, 3D effects consume ink without communicating data | Erase non-data ink; maximize data-ink ratio (Tufte 1983) |
| **Overloaded single chart** | Cramming 10 series into one line chart makes all lines indistinguishable | Use small multiples |
| **Unlabeled axes** | Forces users to guess units or scale | Always label axes with name and unit |
| **Color as the only differentiator** | Fails for 8% of men with color vision deficiency; fails in print | Add direct labels, patterns, or shapes as secondary encoding |
| **Animation without purpose** | Animated transitions that don't show state change add latency without insight | Only animate to show temporal change or dataset transition |
| **Missing zero baseline on area chart** | Area encoding implies magnitude from zero; a non-zero baseline distorts the encoded area | Start area charts at zero or use a line chart instead |
| **Sorting data alphabetically** | Alphabetical order obscures magnitude relationships | Sort by value unless the order has inherent meaning (e.g., time, rank) |

---

## Design Checklist

### Chart Selection
- [ ] Chart type matches the relationship being communicated (comparison, trend, distribution, correlation, part-to-whole)
- [ ] Pie charts have ≤5 slices; replaced with bar chart if more categories exist
- [ ] Small multiples used instead of multi-series overload when series count > 5
- [ ] Tables used when precise lookup is required, not just pattern recognition

### Visual Encoding
- [ ] Position or length used as the primary encoding channel (not area or angle)
- [ ] 3D effects absent from all charts
- [ ] Data-ink ratio maximized — decorative gridlines, borders, and fills removed
- [ ] Visual hierarchy established through size, not decoration

### Color
- [ ] Palette type matches data type (sequential / diverging / categorical)
- [ ] ≤7 categorical colors in any single chart
- [ ] Red-green combination avoided as primary differentiator
- [ ] Color is not the only means of encoding — shape, pattern, or label supplements it (WCAG 1.4.1)
- [ ] All text on colored backgrounds meets WCAG AA contrast ratio (4.5:1)
- [ ] Palette tested with colorblind simulation tool (e.g., Coblis, Viz Palette)

### Labels & Annotations
- [ ] Direct labels used in preference to a legend where practical
- [ ] Legend placed in natural eye-flow position (top-right or below title), not bottom
- [ ] Chart title states the insight or metric, not just the chart type
- [ ] Axes labeled with name and unit
- [ ] Y-axis starts at zero for bar and area charts

### Interaction
- [ ] Tooltips show full label, value, and unit
- [ ] Tooltips accessible via keyboard focus, not hover only
- [ ] Overview-first: summary visible without any interaction
- [ ] Filters and drill-down controls clearly afforded and labeled
- [ ] Linked views update synchronously on selection

### Responsive & Mobile
- [ ] Mobile view shows ≤5 data points per screen
- [ ] Touch targets ≥ 44px
- [ ] Hover-only interactions replaced with tap interactions on mobile
- [ ] Charts use relative units (% / vw) for container sizing
- [ ] Long labels tested on smallest breakpoint — no clipping or overlap

### Accessibility
- [ ] Every chart has descriptive alt text stating the key finding
- [ ] Complex charts have adjacent summary text or a data table alternative
- [ ] Interactive elements keyboard-navigable (Tab, arrow keys)
- [ ] Focus indicators visible on all interactive elements
- [ ] High-contrast mode tested (Windows HCM / macOS Increased Contrast)
- [ ] ARIA roles and labels applied to SVG charts

### Dashboard Layout
- [ ] Most critical KPIs visible above the fold without scrolling
- [ ] Related metrics visually grouped with whitespace (not borders)
- [ ] Consistent color palette across all charts on the dashboard
- [ ] Status colors (red/amber/green) used only for state, not decoration
- [ ] Cognitive grouping ≤7 distinct information clusters per view

---

## Sources

- **Edward Tufte** — *The Visual Display of Quantitative Information* (1983); *Envisioning Information* (1990) — data-ink ratio, chartjunk, small multiples
- **Cleveland, W.S. & McGill, R.** — "Graphical Perception: Theory, Experimentation, and Application to the Development of Graphical Methods," *Journal of the American Statistical Association*, 1984
- **Nielsen Norman Group** — [Choosing Chart Types: Consider Context](https://www.nngroup.com/articles/choosing-chart-types/); [Dashboards: Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/)
- **Stephen Few** — *Information Dashboard Design: The Effective Visual Communication of Data* (2006, O'Reilly); *Show Me the Numbers* (2004) — [Perceptual Edge library](https://www.perceptualedge.com/library.php)
- **Shneiderman, B.** — "The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations," *IEEE Symposium on Visual Languages*, 1996 — overview-first mantra
- **ColorBrewer** — [colorbrewer2.org](https://colorbrewer2.org/) — sequential, diverging, and categorical palettes with colorblind-safety ratings
- **Government Analysis Function (UK)** — [Data visualisation: charts](https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/) — accessibility requirements for public sector
- **ONS Service Manual** — [Data visualisation principles](https://service-manual.ons.gov.uk/data-visualisation/guidance/principles)
- **The A11Y Collective** — [The Ultimate Checklist for Accessible Data Visualisations](https://www.a11y-collective.com/blog/accessible-charts/)
- **TPGI** — [Making data visualizations accessible](https://www.tpgi.com/making-data-visualizations-accessible/)
- **Datawrapper Blog** — [What to consider when using text in data visualizations](https://www.datawrapper.de/blog/text-in-data-visualizations)
- **xdgov Data Design Standards** — [Labels](https://xdgov.github.io/data-design-standards/components/labels); [Legends](https://xdgov.github.io/data-design-standards/components/legends)
- **data-to-viz.com** — [The issue with 3D in data visualization](https://www.data-to-viz.com/caveat/3d.html)
- **boundev.com** — [Mobile Data Visualization: Chart Design Best Practices](https://www.boundev.com/blog/mobile-data-visualization-design-guide) (2025)
- **WCAG 2.2** — Success Criteria 1.1.1 (Non-text content), 1.4.1 (Use of Color), 1.4.3 (Contrast), 2.1.1 (Keyboard), 2.4.11 (Focus Appearance)
