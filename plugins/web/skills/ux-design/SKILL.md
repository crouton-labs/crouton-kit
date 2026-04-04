---
name: ux-design
description: UX design principles, heuristics, and evaluation frameworks. Use when reviewing interface usability, planning user flows, evaluating designs against heuristics, or applying UX methodology to any product — web, mobile, CLI, or AI.
---

# UX Design Principles

Reference for evaluating and designing user experiences. Start here for frameworks and heuristics; see reference files for domain-specific application.

## References

- [Human-in-the-Loop AI Chat Systems](references/hitl-ai-chat.md) — Applying UX principles to AI interfaces, trust calibration, autonomy design, supervision patterns
- [Form & Input Design](references/form-input-design.md) — Layout, input types, labels, validation, mobile touch, and accessibility for web forms
- [Data Visualization UX](references/data-visualization.md) — Chart selection, visual encoding, color, labels, interaction, responsive charts, dashboard layout
- [Performance as UX](references/performance-ux.md) — Response time thresholds, Core Web Vitals, perceived performance, loading states, optimistic UI, animation
- [CLI & Terminal UX](references/cli-terminal-ux.md) — Command structure, output design, error messages, TUI patterns, scripting, composability
- [UX for Onboarding & Empty States](references/onboarding-empty-states.md) — First-run experience, progressive disclosure, empty states, activation, returning users
- [Error & Edge State Design](references/error-edge-states.md) — Error messages, prevention, form validation, loading failures, edge cases, destructive safeguards

---

## Nielsen's 10 Usability Heuristics

The most widely cited UX evaluation framework. Use for heuristic evaluation of any interface.

| # | Heuristic | What to Check |
|---|-----------|---------------|
| 1 | **Visibility of system status** | Does the system keep users informed through timely, appropriate feedback? |
| 2 | **Match between system and real world** | Does it use familiar language, concepts, and conventions? Information appears in natural order? |
| 3 | **User control and freedom** | Can users undo, redo, and escape unwanted states easily? Clear "emergency exits"? |
| 4 | **Consistency and standards** | Do same words/actions/situations mean the same thing everywhere? Follows platform conventions? |
| 5 | **Error prevention** | Does design prevent problems before they occur? Confirmation for risky actions? |
| 6 | **Recognition over recall** | Are options, actions, and information visible or easily retrievable? Minimal memory load? |
| 7 | **Flexibility and efficiency** | Accelerators for experts? Shortcuts? Customizable frequent actions? |
| 8 | **Aesthetic and minimalist design** | Only relevant information shown? No visual noise competing with essential content? |
| 9 | **Help users recognize, diagnose, and recover from errors** | Error messages in plain language? Specific? Suggest solutions? |
| 10 | **Help and documentation** | Searchable, task-focused, concise help available when needed? |

Source: Nielsen Norman Group (1994, updated 2024).

---

## Don Norman's Design Principles

Six concepts from *The Design of Everyday Things*. These apply to physical and digital products alike.

- **Affordances** — What actions does the object/interface make possible? A button affords pressing. A text field affords typing. What does your interface afford that users don't realize?
- **Signifiers** — Cues that indicate where and how to act. Affordances exist whether visible or not; signifiers make them discoverable. Underlines on links. Hover cursors. Placeholder text.
- **Constraints** — Limitations that guide correct use. Grayed-out buttons prevent invalid actions. Type restrictions on inputs prevent bad data. Good constraints make errors impossible rather than recoverable.
- **Mappings** — Spatial/logical correspondence between controls and outcomes. A slider that moves left-to-right to adjust a value from low-to-high. Navigation that mirrors information architecture.
- **Feedback** — Immediate, clear communication of action results. Every action should produce a visible, audible, or tactile response. The gap between action and feedback is where uncertainty lives.
- **Conceptual models** — The user's internal understanding of how the system works. Design must align with (or carefully reshape) mental models. When the system model and user model diverge, confusion follows.

---

## Shneiderman's 8 Golden Rules

Complements Nielsen — more prescriptive about interaction design.

1. **Strive for consistency** — Consistent sequences for similar situations. Same terminology, consistent layout.
2. **Seek universal usability** — Accommodate novice to expert. Abbreviations, hidden commands, faster pacing for frequent users.
3. **Offer informative feedback** — Every action gets a response. Frequent/minor actions: modest. Infrequent/major actions: substantial.
4. **Design dialogs to yield closure** — Sequences of actions have beginning, middle, end. Give completion feedback.
5. **Prevent errors** — Design so users cannot make serious errors. Gray out invalid options. Offer confirmation.
6. **Permit easy reversal of actions** — Encourage exploration by making undo cheap. Reduces anxiety.
7. **Keep users in control** — Users are initiators, not responders. Avoid surprises, tedious data entry, difficulty getting needed info.
8. **Reduce short-term memory load** — Humans hold ~4 chunks in working memory. Keep displays simple, consolidate multi-page displays, allow sufficient training time.

---

## Gestalt Principles of Visual Perception

How humans group and interpret visual elements. Essential for layout decisions.

- **Proximity** — Elements close together are perceived as related. Spacing is the primary grouping mechanism.
- **Similarity** — Elements that look alike (color, shape, size) are perceived as related. Consistent styling signals shared function.
- **Continuity** — The eye follows smooth paths. Aligned elements feel connected even with gaps.
- **Closure** — The mind completes incomplete shapes. You don't need borders on all sides to define a region.
- **Figure-ground** — Users distinguish foreground (focus) from background (context). Elevation, contrast, and blur control this.
- **Common region** — Elements within a shared boundary are grouped. Cards, panels, and containers leverage this.

---

## Fitts's Law & Interaction Cost

**Fitts's Law:** Time to reach a target = f(distance / target size). Larger targets closer to the cursor are faster to hit.

**Implications:**
- Important actions should be large and near the user's current focus
- Edge/corner positions are effectively infinite size (cursor stops at screen edge)
- Contextual menus (right-click, long-press) reduce distance to zero
- Tiny click targets (icon-only buttons, cramped nav items) violate this directly

**Interaction cost** is the total mental and physical effort to complete a task. Every click, scroll, page load, decision, and moment of confusion adds cost. Reduce steps, reduce decisions, reduce context switches.

---

## Hick's Law

Decision time increases logarithmically with the number of choices.

**Implications:**
- Don't present all options at once — progressive disclosure
- Group and categorize to reduce perceived choices
- Defaults and recommendations reduce decision burden
- Search/filter for large option sets
- Fewer primary actions per screen

---

## Information Architecture Principles

How to organize and label content so users find what they need.

- **Progressive disclosure** — Show only what's needed now. Reveal complexity on demand.
- **Recognition over recall** — Labels, icons, and previews help users identify without remembering.
- **Appropriate mental models** — Navigation structure should match how users think about the domain, not how the system is built.
- **Front doors** — Users arrive from anywhere (search, links, bookmarks). Every page should orient the user.
- **Hierarchy** — Most important content/actions get the most visual prominence. Hierarchy of size, color, position, contrast.

---

## Evaluation Methods

### Heuristic Evaluation
Walk through the interface and evaluate against each heuristic. Note severity (cosmetic → catastrophic). 3-5 evaluators catch ~75% of issues.

### Cognitive Walkthrough
Simulate a user's thought process step-by-step through a task. At each step: Will the user know what to do? Will they notice the correct action? Will they understand the feedback?

### The Five "Why" Usability Questions
For any screen or interaction:
1. What can the user do here?
2. How will they know what to do?
3. What feedback will they get?
4. How do they recover from mistakes?
5. What's the fastest path to their goal?

---

## Anti-Patterns

- **Mystery meat navigation** — Icons/labels that don't communicate function
- **Modal abuse** — Blocking the user's flow for non-critical information
- **Infinite scrolling without landmarks** — No sense of position or progress
- **Confirmation fatigue** — Asking "are you sure?" so often users stop reading
- **Feature soup** — Exposing every capability at once without hierarchy
- **Clever over clear** — Creative labels/icons that sacrifice understandability
- **Inconsistent patterns** — Same action works differently in different places
- **Silent failure** — Something went wrong but nothing tells the user
