# UX for Onboarding & Empty States

Designing first-run experiences, progressive guidance, and empty UI states that reduce time-to-value and drive activation.

---

## Onboarding Models

Three primary models — choose based on what the product requires users to *do* before they can get value:

| Model | When to Use | Risk |
|-------|-------------|------|
| **Benefit-focused** | Value is obvious once stated; simple products | Feels like marketing, not help |
| **Function-focused** | Interface has novel or non-obvious patterns | Tips without context feel hollow |
| **Account setup / config** | Personalization unlocks meaningful value (e.g., feeds, recommendations) | Questionnaire fatigue before first value |
| **Progressive onboarding** | Complex products where users need to grow into features | Requires ongoing contextual trigger system |
| **Just-in-time guidance** | Users learn while doing; help appears when the relevant UI is encountered | Requires tight behavioral instrumentation |

**Rule:** For most apps, skip the onboarding screen entirely and put users directly into the interface. Onboarding is justified only when the app has unique interaction patterns users won't discover on their own, or when setup input meaningfully personalizes the experience. (NN/G, "Onboarding: Skip it When Possible")

**Progressive onboarding** is not a flow — it's a system. Features are introduced gradually as users reach relevant moments, not front-loaded in a wizard. The contextual trigger (user attempts to use a feature for the first time) is more effective than a calendar-based drip. (NN/G, "Onboarding Tutorials vs. Contextual Help")

---

## First-Run Experience

### Welcome Screens

- State *what the user will be able to do* — not what the product is. Focus on the user's outcome, not the app's features. (Samuel Hulick, *The Elements of User Onboarding*)
- One screen. One message. One primary action. Any secondary links should be low-visibility.
- Avoid splash screens, legal disclaimers, and marketing copy at launch — they delay getting to value. (Apple HIG, "Onboarding")

### Setup Wizards

- Use only when setup input has a direct, visible effect on the first experience (e.g., content preferences, team size, role).
- Each step must be actionable and its purpose visible. (NN/G, "Smart Device Onboarding: 5 Guidelines")
- Present steps as a visual wizard with progress indication — users need to know how much is left.
- Non-essential tasks (ratings, notification opt-in) must appear *after* the user has experienced value. (Apple HIG, "Onboarding for Games")

### Zero-to-Value Time

- Benchmark for SaaS: healthy time-to-value is 1–3 days; median across 547 SaaS products is ~1.5 days. (Userpilot, "Time to Value")
- Every step that doesn't directly unlock value is a step that can kill activation. Audit the path ruthlessly.
- Pre-fill content or demonstrate a realistic outcome immediately (e.g., Basecamp pre-populates a sample project). (UserOnboard.com, Hulick analysis)

### Permission Requests

- Never ask for permissions during onboarding before users understand the value. Trust hasn't been established yet. (Appcues, "Mobile Permission Priming")
- Ask at the moment the feature is first needed — contextual timing dramatically increases grant rates. (UX Planet, "Mobile UX Design: The Right Ways to Ask Users for Permissions")
- Use **permission priming**: show a custom screen explaining *why* the permission is needed and what benefit the user gets before triggering the OS dialog. If they accept the priming screen, show the real dialog. (UserOnboard, "Permission Priming")
- Never request permissions for features the user hasn't expressed intent to use.

---

## Empty States

### Types

| Type | Trigger | Primary Goal |
|------|---------|--------------|
| **First-use** | No data exists yet | Educate and prompt first action |
| **No-results** | Search or filter returned nothing | Help user recover; refine or reset |
| **Error / unavailable** | Data failed to load or feature is disabled | Explain why; give clear next step |
| **Post-completion** | User completed or cleared all items | Acknowledge success; suggest next action |
| **Feature education** | A section of the app hasn't been used yet | Introduce feature; lower barrier to first use |

### First-Use Empty States

- The most basic implementation: a non-interactive illustration + short tagline. (Material Design v1, "Empty States")
- Better: include a **primary CTA** that starts the user's first action. The empty state is a launching pad, not a placeholder.
- Best: **starter content** — pre-populate with realistic example data so users can see the product in action before they've created anything. (Material Design, "Onboarding — Starter Content"; NN/G, "Empty State Interface Design")
- Two-part rule: **two parts instruction, one part delight**. Personality is fine but never at the cost of clarity. (Material Design, "Communication Principles")

### Educational Empty States

- Explain *why* there's nothing here and *what to do first* — not just that nothing exists. (IBM Carbon Design System, "Empty States Pattern")
- Header: one clear sentence on why the space is empty. Body: what action creates content. CTA: direct, specific label.
- Inline documentation (expanded empty state) is appropriate when a feature is being encountered for the first time and benefits from more detail — not on subsequent visits. (Carbon Design System)

### No-Results States

- Surface constructive paths: check spelling, widen filters, browse popular items, or contact support.
- Never show a blank screen or generic "Nothing found." The absence of content is still an interaction. (NN/G, "Designing Empty States in Complex Applications")

---

## Progressive Disclosure

**Rule:** Surface the minimum interface required for the current task. Reveal complexity only as users demonstrate readiness or need. (NN/G, "Progressive Disclosure")

### Types

| Type | How It Works | Example |
|------|-------------|---------|
| **Sequential** | Step 1 → Step 2 → Step 3; next step unlocked on completion | Setup wizards, multi-step forms |
| **Conditional** | Advanced options revealed only when a condition is met | "Show advanced settings" toggle |
| **Contextual** | Info revealed based on what the user is currently doing | Tooltip appears when editing a form field |

### Implementation Patterns

- Accordions, tabs, and "show more" controls are the primary UI mechanisms. Use them to separate primary from secondary actions.
- Feature gating by experience level: don't expose power-user features in week 1. Route new users to simplified flows; unlock the full UI as usage matures.
- Contextual help (pull-based) outperforms tutorial tours (push-based) because it's triggered by user need, not product intent. (NN/G, "Onboarding Tutorials vs. Contextual Help")

---

## Tooltips & Guided Tours

### When They Work

- **Hotspots** on a new feature that isn't self-explaining, visible only on first encounter.
- **Coach marks** for non-obvious gestures or interactions (e.g., swipe-to-delete on mobile).
- **Step-by-step tours** for flows that require a specific sequence the user would never discover through exploration. Keep to 2–3 steps; show many short tours rather than one long one. (Smashing Magazine, "A Practical Guide to Product Tours in React Apps")

### When They Fail

- Tours that auto-play before the user has expressed intent to learn.
- Tooltip sequences covering every UI element — this is information overload, not guidance.
- Any tour where the only exit is completing all steps.
- Coach marks on features the user isn't ready to use yet (no contextual relevance).
- Guidance timed to app launch rather than the moment the feature is first reached.

### Rules

- Every tour must be **skippable at any step**. Users who skip are signaling intent — track that. (Smashing Magazine, 2023)
- Overlay tooltips that cover the UI they're describing are counterproductive. Position callouts beside the element.
- Tours are for *navigation*, not for *education*. If users need to read to understand a concept, use an empty state or contextual help — not a tooltip.

---

## Activation & Engagement

### Aha Moment

The "aha moment" is not a single event — it's a series of smaller value perceptions. Users may have different aha moments depending on their use case. Design for multiple paths to value, not one. (Samuel Hulick, UserOnboard.com)

Hulick's recommendation: allocate the majority of onboarding investment at the **activation phase** (the first session), because most drop-off happens before users ever form a habit.

### Activation Metrics

| Metric | What It Measures |
|--------|-----------------|
| **Time-to-value** | Minutes/hours from signup to first meaningful outcome |
| **Activation rate** | % of signups who reach a predefined activation event |
| **Checklist completion** | % who complete onboarding tasks; correlates with retention |
| **Feature adoption** | % of activated users who use a specific feature within N days |
| **Drop-off by step** | Where users exit the onboarding flow |

**Activation must be tied to a specific behavior** that signals real value — not just account creation or profile completion. (Appcues, "In-App Onboarding")

### Onboarding Checklists

- Checklists are effective when they guide users toward the activation point, not arbitrary setup tasks.
- Keep to **5–6 items maximum**. More items reduce completion probability. (Appcues, "Checklist Best Practices"; Userpilot, "User Onboarding Checklist")
- Always include a progress bar — visible progress is a motivational signal.
- Users who complete onboarding checklists are 3× more likely to convert to paying customers. (Userpilot case studies)
- Make individual tasks immediately actionable — each checklist item should link directly to the relevant flow.

---

## Returning User Experience

### Re-engagement

- Users who return after a gap need **context restoration**: show their last action, in-progress work, or a summary of what happened while they were away.
- Progress bars and mini-timelines reduce the cognitive cost of re-entry into complex workflows.
- Don't assume continuity — a returning user after 2 weeks may need lightweight re-orientation.

### "What's New" Patterns

- Surface new features in context — when the user reaches the relevant part of the UI — not as a modal on login.
- Modal "what's new" announcements block the task the user came to do. Use them only for changes that materially affect the user's existing workflow.
- A persistent but dismissible notification or badge on a changed feature is less disruptive than a full overlay.
- Track dismissal — don't show the same "new" badge after the user has interacted with the feature.

### Resuming Interrupted Workflows

- Restore state where possible: pre-fill form fields, return to the last active screen, surface drafts.
- Label in-progress items clearly ("Resume setup", "Continue where you left off") so users aren't hunting for what they started.
- For multi-session setup flows, show which steps are complete and which remain — treat re-entry like step 2 of a wizard, not step 1.

---

## Permission & Trust Building

### When to Ask

| Permission | Right Moment |
|------------|-------------|
| Push notifications | After user has experienced value; not at first launch |
| Location | When a location-dependent feature is first invoked |
| Camera / microphone | When the user initiates media capture |
| Contacts | When the user explicitly tries to invite someone |
| Account linking (OAuth) | When the feature requiring it is first needed |

### Progressive Trust

- Trust is built through small, repeated positive interactions. Front-loaded requests for high-permission access before value is established are adversarial to trust. (Appcues, "Mobile Permission Priming")
- Sequence: demonstrate value → establish rapport → ask for access.
- Use **permission priming screens** to explain the "why" before the OS dialog fires. A declined OS prompt is final; a declined priming screen is recoverable.

### Social Proof During Onboarding

- Customer counts, testimonials, and logos reduce the perceived risk of committing to setup. Use at points where the user must make a decision (e.g., "Connect your calendar" step).
- Match the testimonial to the user's role or use case — generic "users love us" copy has low persuasive value. (Userpilot, "User Trust")
- Social proof is most effective immediately *before* a high-friction step, not on the welcome screen.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Fix |
|-------------|-------------|-----|
| **Forced product tour on first launch** | Interrupts intent before any context is established | Offer tour as an opt-in, or replace with contextual guidance |
| **12+ step onboarding wizard** | Each additional step increases drop-off probability | Cut to the minimum required for activation; defer the rest |
| **Info dumping** | Cognitive overload before users care about features | Progressive disclosure; just-in-time delivery |
| **Skippable-but-critical steps** | Users skip, then hit a wall when the feature fails without setup | Make critical steps mandatory; make optional steps genuinely optional |
| **Permission requests at launch** | Zero trust has been established; high decline rate | Defer to first moment of feature use |
| **Generic empty states** | "No items found" provides nothing actionable | Always include a CTA; explain why and what to do |
| **Tour with no exit** | Forces completion; creates frustration and negative association | Every step must be skippable |
| **Asking for rating/review during onboarding** | Distracts from activation; users don't have enough experience to rate | Ask after first successful task completion or Nth session |
| **Treating activation as account creation** | Inflates metrics; doesn't correlate with retention | Define activation as the first meaningful outcome |
| **"What's new" modal on login** | Blocks the task the user logged in to do | Surface new features contextually, in the UI, when relevant |
| **Static empty states on repeat visits** | Becomes noise; users learn to ignore them | Vary content by visit count; hide on subsequent empty states |
| **One-size-fits-all onboarding** | Different user segments have different activation paths | Segment by role, use case, or intent and route accordingly |

---

## Design Checklist

### Onboarding Flow
- [ ] Onboarding is skippable — users can exit and return to it
- [ ] Only collects information that directly improves the first experience
- [ ] Wizard steps show progress (how many remain)
- [ ] Non-essential tasks (notifications, ratings) are deferred until after activation
- [ ] Permission requests are contextual — triggered by feature use, not launch
- [ ] Permission priming screens precede OS dialogs for high-stakes access
- [ ] Social proof is placed immediately before high-friction steps
- [ ] Welcome screen communicates user outcome, not product feature list

### First-Run & Time-to-Value
- [ ] User can reach meaningful value within the first session
- [ ] The aha moment has been identified and the path to it is obstacle-free
- [ ] Setup steps that don't unlock value have been removed
- [ ] Starter content or realistic sample data is pre-populated where possible
- [ ] Activation metric is defined as a specific behavior, not account creation

### Empty States
- [ ] Every empty state has a primary CTA
- [ ] First-use empty states explain why the space is empty and what to do first
- [ ] No-results states offer recovery paths (clear filters, check spelling, browse)
- [ ] Error states explain what happened and what the user can do
- [ ] Post-completion states acknowledge success and suggest a next action
- [ ] Empty state copy follows two-parts instruction, one-part delight rule
- [ ] Empty states change or disappear after the user has seen them multiple times

### Progressive Disclosure
- [ ] Primary actions are visible without scrolling or drilling into menus
- [ ] Advanced features are hidden behind "show more" or accessible via settings
- [ ] Contextual help is trigger-based (user behavior), not time-based
- [ ] New features are introduced in context, not via launch modals

### Guided Tours & Tooltips
- [ ] Tours are 2–3 steps; longer flows are broken into multiple short tours
- [ ] Every tour step is individually skippable
- [ ] Tooltips are positioned beside (not over) the element they describe
- [ ] Coach marks are only used for non-obvious gestures or novel patterns
- [ ] Guidance appears at the moment of first use, not at app launch

### Activation & Checklists
- [ ] Onboarding checklist has ≤6 items
- [ ] Each checklist item links directly to the relevant action
- [ ] Progress bar is visible on the checklist
- [ ] Activation event is instrumented and tracked
- [ ] Drop-off is measured per onboarding step

### Returning Users
- [ ] In-progress work is surfaced on re-entry
- [ ] New feature badges are shown contextually, not as launch modals
- [ ] Feature badges are dismissed once the user interacts with the feature
- [ ] Multi-session setup flows restore prior progress

---

## Sources

- **Nielsen Norman Group** — ["Mobile-App Onboarding: An Analysis"](https://www.nngroup.com/articles/mobile-app-onboarding/); ["Onboarding Tutorials vs. Contextual Help"](https://www.nngroup.com/articles/onboarding-tutorials/); ["Onboarding: Skip it When Possible"](https://www.nngroup.com/videos/onboarding-skip-it-when-possible/); ["Designing Empty States in Complex Applications"](https://www.nngroup.com/articles/empty-state-interface-design/); ["Progressive Disclosure"](https://www.nngroup.com/articles/progressive-disclosure/)
- **Apple** — [Human Interface Guidelines: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding); [Launching](https://developer.apple.com/design/human-interface-guidelines/launching); [Onboarding for Games](https://developer.apple.com/app-store/onboarding-for-games/)
- **Material Design** — [Empty States (M1)](https://m1.material.io/patterns/empty-states.html); [Onboarding](https://m1.material.io/growth-communications/onboarding.html); [Empty States (M2)](https://m2.material.io/guidelines/patterns/empty-states.html)
- **Samuel Hulick** — *The Elements of User Onboarding*; [UserOnboard.com — Onboarding UX Patterns](https://www.useronboard.com/onboarding-ux-patterns/); [UserOnboard — Permission Priming](https://www.useronboard.com/onboarding-ux-patterns/permission-priming/)
- **Appcues** — ["Choosing the Right Onboarding UX Pattern"](https://www.appcues.com/blog/choosing-the-right-onboarding-ux-pattern); ["Mobile Permission Priming"](https://www.appcues.com/blog/mobile-permission-priming); ["Checklist Best Practices"](https://docs.appcues.com/checklist-best-practices); ["In-App Onboarding"](https://www.appcues.com/blog/in-app-onboarding)
- **Userpilot** — ["Reduce Time to Value"](https://userpilot.com/blog/reduce-time-to-value-saas/); ["User Onboarding"](https://userpilot.com/blog/user-onboarding/); ["User Onboarding Checklist"](https://userpilot.com/blog/user-onboarding-checklist-tips/); ["User Trust"](https://userpilot.com/blog/user-trust/)
- **Smashing Magazine** — ["How to Design an Effective User Onboarding Flow"](https://www.smashingmagazine.com/2023/04/design-effective-user-onboarding-flow/); ["A Practical Guide to Product Tours in React Apps"](https://www.smashingmagazine.com/2020/08/guide-product-tours-react-apps/)
- **IBM Carbon Design System** — ["Empty States Pattern"](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- **Interaction Design Foundation** — ["Progressive Disclosure"](https://ixdf.org/literature/topics/progressive-disclosure)
- **UX Planet** — ["Mobile UX Design: The Right Ways to Ask Users for Permissions"](https://uxplanet.org/mobile-ux-design-the-right-ways-to-ask-users-for-permissions-6cdd9ab25c27)
