---
name: interface-design
description: This skill is for interface design — dashboards, admin panels, apps, tools, and interactive products. NOT for marketing design (landing pages, marketing sites, campaigns).
---

# Interface Design

Build interface design with craft and consistency.

## Scope

**Use for:** Dashboards, admin panels, SaaS apps, tools, settings pages, data interfaces.

**Not for:** Landing pages, marketing sites, campaigns. Redirect those to `/frontend-design`.

---

# The Problem

You will generate generic output. Your training has seen thousands of dashboards. The patterns are strong.

You can follow the entire process below — explore the domain, name a signature, state your intent — and still produce a template. Warm colors on cold structures. Friendly fonts on generic layouts. "Kitchen feel" that looks like every other app.

This happens because intent lives in prose, but code generation pulls from patterns. The gap between them is where defaults win.

The process below helps. But process alone doesn't guarantee craft. You have to catch yourself.

---

# Where Defaults Hide

Defaults don't announce themselves. They disguise themselves as infrastructure — the parts that feel like they just need to work, not be designed.

**Typography feels like a container.** Pick something readable, move on. But typography isn't holding your design — it IS your design. The weight of a headline, the personality of a label, the texture of a paragraph. These shape how the product feels before anyone reads a word. A bakery management tool and a trading terminal might both need "clean, readable type" — but the type that's warm and handmade is not the type that's cold and precise. If you're reaching for your usual font, you're not designing.

**Navigation feels like scaffolding.** Build the sidebar, add the links, get to the real work. But navigation isn't around your product — it IS your product. Where you are, where you can go, what matters most. A page floating in space is a component demo, not software. The navigation teaches people how to think about the space they're in.

**Data feels like presentation.** You have numbers, show numbers. But a number on screen is not design. The question is: what does this number mean to the person looking at it? What will they do with it? A progress ring and a stacked label both show "3 of 10" — one tells a story, one fills space. If you're reaching for number-on-label, you're not designing.

**Token names feel like implementation detail.** But your CSS variables are design decisions. `--ink` and `--parchment` evoke a world. `--gray-700` and `--surface-2` evoke a template. Someone reading only your tokens should be able to guess what product this is.

The trap is thinking some decisions are creative and others are structural. There are no structural decisions. Everything is design. The moment you stop asking "why this?" is the moment defaults take over.

---

# Intent First

Before touching code, answer these. Not in your head — out loud, to yourself or the user.

**Who is this human?**
Not "users." The actual person. Where are they when they open this? What's on their mind? What did they do 5 minutes ago, what will they do 5 minutes after? A teacher at 7am with coffee is not a developer debugging at midnight is not a founder between investor meetings. Their world shapes the interface.

**What must they accomplish?**
Not "use the dashboard." The verb. Grade these submissions. Find the broken deployment. Approve the payment. The answer determines what leads, what follows, what hides.

**Would they understand what you're showing them?**
Every piece of data on screen is a design choice. A cron expression (`0 9 * * 1-5`) means nothing to a salesperson — "Daily weekdays at 9 AM" does. A 5-column table crammed into a narrow sidebar is developer convenience, not user design — stacked cards with the essential info might serve better. Translate data into the user's language. If displaying timestamps, consider "2h ago" vs "2024-03-17T14:23:00Z." If showing status, consider "Completed in 1m 4s" vs a raw enum. The rule: if you'd have to explain a value to the user in person, you should be explaining it in the interface.

**What should this feel like?**
Say it in words that mean something. "Clean and modern" means nothing — every AI says that. Warm like a notebook? Cold like a terminal? Dense like a trading floor? Calm like a reading app? The answer shapes color, type, spacing, density — everything.

If you cannot answer these with specifics, stop. Ask the user. Do not guess. Do not default.

## Every Choice Must Be A Choice

For every decision, you must be able to explain WHY.

- Why this layout and not another?
- Why this color temperature?
- Why this typeface?
- Why this spacing scale?
- Why this information hierarchy?

If your answer is "it's common" or "it's clean" or "it works" — you haven't chosen. You've defaulted. Defaults are invisible. Invisible choices compound into generic output.

**The test:** If you swapped your choices for the most common alternatives and the design didn't feel meaningfully different, you never made real choices.

## Sameness Is Failure

If another AI, given a similar prompt, would produce substantially the same output — you have failed.

This is not about being different for its own sake. It's about the interface emerging from the specific problem, the specific user, the specific context. When you design from intent, sameness becomes impossible because no two intents are identical.

When you design from defaults, everything looks the same because defaults are shared.

**Sameness within a page is just as deadly.** Five sections, each with an identical small gray heading and a white card with the same gray border — that's not consistency, it's monotony. Consistency means the system is coherent. Monotony means you applied the same treatment everywhere without considering what each section needs. A configuration section and a monitoring section serve different purposes — they can share a type scale and spacing system while still feeling different through background zones, density, or visual weight.

## Intent Must Be Systemic

Saying "warm" and using cold colors is not following through. Intent is not a label — it's a constraint that shapes every decision.

If the intent is warm: surfaces, text, borders, accents, semantic colors, typography — all warm. If the intent is dense: spacing, type size, information architecture — all dense. If the intent is calm: motion, contrast, color saturation — all calm.

Check your output against your stated intent. Does every token reinforce it? Or did you state an intent and then default anyway?

---

# Product Domain Exploration

This is where defaults get caught — or don't.

Generic output: Task type → Visual template → Theme
Crafted output: Task type → Product domain → Signature → Structure + Expression

The difference: time in the product's world before any visual or structural thinking.

## Required Outputs

**Do not propose any direction until you produce all four:**

**Domain:** Concepts, metaphors, vocabulary from this product's world. Not features — territory. Minimum 5.

**Color world:** What colors exist naturally in this product's domain? Not "warm" or "cool" — go to the actual world. If this product were a physical space, what would you see? What colors belong there that don't belong elsewhere? List 5+.

**Signature:** One element — visual, structural, or interaction — that could only exist for THIS product. If you can't name one, keep exploring.

**Defaults:** 3 obvious choices for this interface type — visual AND structural. You can't avoid patterns you haven't named.

## Proposal Requirements

Your direction must explicitly reference:
- Domain concepts you explored
- Colors from your color world exploration
- Your signature element
- What replaces each default

**The test:** Read your proposal. Remove the product name. Could someone identify what this is for? If not, it's generic. Explore deeper.

---

# The Mandate

**Before showing the user, look at what you made.**

Ask yourself: "If they said this lacks craft, what would they mean?"

That thing you just thought of — fix it first.

Your first output is probably generic. That's normal. The work is catching it before the user has to.

## The Checks

Run these against your output before presenting:

- **The swap test:** If you swapped the typeface for your usual one, would anyone notice? If you swapped the layout for a standard dashboard template, would it feel different? The places where swapping wouldn't matter are the places you defaulted.

- **The squint test:** Blur your eyes. Can you still perceive hierarchy? Is anything jumping out harshly? Craft whispers.

- **The signature test:** Can you point to five specific elements where your signature appears? Not "the overall feel" — actual components. A signature you can't locate doesn't exist.

- **The token test:** Read your CSS variables out loud. Do they sound like they belong to this product's world, or could they belong to any project?

If any check fails, iterate before showing.

---

# Craft Foundations

## Subtle Layering

This is the backbone of craft. Regardless of direction, product type, or visual style — this principle applies to everything.

**Surfaces must be barely different but still distinguishable.** Study Vercel, Supabase, Linear. Their elevation changes are so subtle you almost can't see them — but you feel the hierarchy. Not dramatic jumps. Not obviously different colors. Whisper-quiet shifts.

**Borders must be light but not invisible.** The border should disappear when you're not looking for it, but be findable when you need to understand structure. If borders are the first thing you notice, they're too strong. If you can't tell where regions begin and end, they're too weak.

**Visual zones group related content.** Not every section needs a card. When multiple sections share a purpose — monitoring data, configuration panels, metadata — a shared background tint groups them without adding borders or boxes. A right column with `bg-muted/60` and rounded corners tells users "these things go together" without any explicit container. This is different from card elevation — zones are spatial, cards are individual. Zones say "this region," cards say "this object." Use both, but know which you're reaching for.

**The squint test:** Blur your eyes at the interface. You should still perceive hierarchy — what's above what, where sections divide. But nothing should jump out. No harsh lines. No jarring color shifts. Just quiet structure.

This separates professional interfaces from amateur ones. Get this wrong and nothing else matters.

## Infinite Expression

Every pattern has infinite expressions. **No interface should look the same.**

A metric display could be a hero number, inline stat, sparkline, gauge, progress bar, comparison delta, trend badge, or something new. A dashboard could emphasize density, whitespace, hierarchy, or flow in completely different ways. Even sidebar + cards has infinite variations in proportion, spacing, and emphasis.

**Before building, ask:**
- What's the ONE thing users do most here?
- What products solve similar problems brilliantly? Study them.
- Why would this interface feel designed for its purpose, not templated?

**NEVER produce identical output.** Same sidebar width, same card grid, same metric boxes with icon-left-number-big-label-small every time — this signals AI-generated immediately. It's forgettable.

The architecture and components should emerge from the task and data, executed in a way that feels fresh. Linear's cards don't look like Notion's. Vercel's metrics don't look like Stripe's. Same concepts, infinite expressions.

## Color Lives Somewhere

Every product exists in a world. That world has colors.

Before you reach for a palette, spend time in the product's world. What would you see if you walked into the physical version of this space? What materials? What light? What objects?

Your palette should feel like it came FROM somewhere — not like it was applied TO something.

**Beyond Warm and Cold:** Temperature is one axis. Is this quiet or loud? Dense or spacious? Serious or playful? Geometric or organic? A trading terminal and a meditation app are both "focused" — completely different kinds of focus. Find the specific quality, not the generic label.

**Color Carries Meaning:** Gray builds structure. Color communicates — status, action, emphasis, identity. Unmotivated color is noise. One accent color, used with intention, beats five colors used without thought.

**Defined But Unused Is Worse Than Undefined.** The most common failure isn't picking bad colors — it's defining good ones and never using them. You'll set up brand tokens, accent palettes, semantic colors in your theme, and then build every surface with `border-gray-200` and `bg-gray-50`. The tokens sit in your CSS like furniture in a showroom nobody visits. This happens because gray feels safe — it's "clean," it "doesn't distract." But an interface built entirely in zero-saturation neutrals isn't clean. It's empty. If the theme defines a brand teal, that teal should appear somewhere users can see it — a status accent, a hover tint, a section border. Not everywhere. But somewhere. The test: delete your brand tokens. Does anything on the page change? If not, you never used them.

---

# Monitoring & Configuration Interfaces

Patterns for dashboards, admin panels, and tools where users oversee automated processes, configure rules, or inspect system behavior.

## Status Panels

Status is the first thing users check. Design for instant comprehension:

- **State indicators** — Idle, running, paused, errored. Hardware buttons (Dieter Rams) are a strong reference for on/off controls that feel solid and intentional
- **Destructive action protection** — Pair power/pause/stop controls with either blocking confirmation ("Are you sure?") or undo patterns. Pick one per product and be consistent
- **Liveness signals** — Last-run timestamp, heartbeat indicator, or activity sparkline. Static status labels without temporal context ("Running") don't answer "is it actually working right now?"

## Activity Logs & Trace Visualization

Users debug chronologically. Design for progressive disclosure from overview to individual step:

- **Timeline as primary structure** — reverse-chronological, each entry showing trigger, outcome, duration. Datadog and Zapier traces are strong references
- **Expandable task detail** — click a mission/run to see its constituent tasks with input/output at each node. The trace view is a debugging tool — optimize for scanning, not aesthetics
- **Differentiate task types visually** — triggers, reasoning steps, tool calls, human-in-the-loop handoffs, errors. Icon + color coding, not just labels
- **Header KPIs per run** — success/failure badge, duration, task count, cost. Users need to triage before they inspect

## Rule Builder & Trigger Configuration

Three structural patterns for letting users define automation rules, in ascending complexity:

1. **Natural language** — A text field where users describe conditions in prose ("When marketing spend exceeds 90% of budget, alert finance"). Easy to start, hard to validate. Design warnings for when mandatory parameters are missing from the prose
2. **Linear flow** — IFTTT-style sequential blocks: source → condition → action. Each node is a discrete configuration step. Users can start from scratch or from a template. Easy to understand because it's sequential
3. **2D map** — n8n-style canvas with branches and dependencies. Required when workflows have parallel paths or conditional branching. Highest power, highest learning curve

Regardless of pattern, triggers decompose into **key** (what you're watching), **operator** (`<`, `>`, `=`, `!=`, `contains`), and **value** (threshold). Support `AND` / `OR` combinators and throttling controls for frequency/cost management.

### Confidence Before Activation

- **Backtesting** — Simulate rules against historical data: "This rule would have fired 23 times last week." Borrowed from quantitative trading. Essential for any configurable automation
- **Save-as-draft** — Complex conditions take multiple sessions to perfect. Support drafts, versioning, rollback, and enable/disable toggles independently from save state

## Integration Catalogs

When users browse and connect data sources or tools:

- **Catalog pattern** — Categorized grid/list of available integrations. For large catalogs, add category pages, filters, and search. App Store is a strong reference
- **Dedicated integration pages** — Name, category, status (connected/error/disabled), description of capabilities. Not just a toggle
- **Setup guidance** — Step-by-step with anonymized examples. If code snippets are necessary, easy copy-paste. Stripe's documentation is the benchmark
- **Connected sources list** — Once configured, users need a single view of all active integrations with status

---

# Design Principles

## Spacing
Pick a base unit and stick to multiples. Consistency matters more than the specific number. Random values signal no system.

## Padding
Keep it symmetrical. If one side is 16px, others should match unless there's a clear reason.

## Depth
Choose ONE approach and commit:
- **Borders-only** — Clean, technical. For dense tools.
- **Subtle shadows** — Soft lift. For approachable products.
- **Layered shadows** — Premium, dimensional. For cards that need presence.

Don't mix approaches.

## Border Radius
Sharper feels technical. Rounder feels friendly. Pick a scale and apply consistently.

## Typography
Headlines need weight and tight tracking. Body needs readability. Data needs monospace. Build a hierarchy.

**Weight creates hierarchy — if you choose it.** Most AI output clusters weights in the middle where nothing stands out. Decide how much contrast your hierarchy needs and commit. The spread between your heaviest and lightest text is a design decision, not a detail.

**Capitalization is a choice, not a default.** Uppercase, small-caps, sentence case — each changes how text feels and how hierarchy reads. Have an opinion. The wrong choice is not having one.

## Color & Surfaces
Build from primitives: foreground (text hierarchy), background (surface elevation), border (separation hierarchy), brand, and semantic (destructive, warning, success). Every color should trace back to these. No random hex values — everything maps to the system.

## Animation
Fast micro-interactions (~150ms), smooth easing. No bouncy/spring effects.

## States
Every interactive element needs states: default, hover, active, focus, disabled. Data needs states too: loading, empty, error. Missing states feel broken.

## Controls
Native `<select>` and `<input type="date">` can't be styled. Build custom components.

---

# Avoid

- **Harsh borders** — if borders are the first thing you see, they're too strong
- **Dramatic surface jumps** — elevation changes should be whisper-quiet
- **Inconsistent spacing** — the clearest sign of no system
- **Mixed depth strategies** — pick one approach and commit
- **Missing interaction states** — hover, focus, disabled, loading, error
- **Dramatic drop shadows** — shadows should be subtle, not attention-grabbing
- **Large radius on small elements**
- **Pure white cards on colored backgrounds**
- **Thick decorative borders**
- **Gradients and color for decoration** — color should mean something
- **Multiple accent colors** — dilutes focus