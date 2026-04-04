# Error & Edge State Design

Patterns, anti-patterns, and practical rules for designing error messages, empty states, loading failures, and edge cases in web and mobile interfaces.

---

## Error Message Anatomy

A well-formed error message has three parts: **what happened**, **why it happened**, and **how to fix it**. Every part must earn its place.

**Writing rules:**
- Use plain language — no stack traces, no HTTP codes surfaced raw, no system jargon
- Be specific: "Your session expired after 30 minutes of inactivity" > "Authentication error"
- Avoid blame: "The file is too large" > "You uploaded a file that was too large"
- Avoid apologizing excessively — one "sorry" maximum, only for genuine system failures
- Offer a next action in the message itself: a button, a link, a concrete instruction
- Match tone to severity — a typo in a form field doesn't warrant the same gravity as data loss

**Three-part structure (NN/G golden formula):**

| Part | Purpose | Example |
|------|---------|---------|
| **Title** | Identify the problem clearly | "Couldn't save your changes" |
| **Description** | Explain cause without jargon | "Your connection dropped while saving. Your draft is still here." |
| **Action** | Tell user exactly what to do | [Try again] [Keep editing] |

Source: Nielsen Norman Group — [Error-Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)

**Tone calibration:**
- System failure (server down): apologetic, reassuring — "We're having trouble on our end"
- User slip (wrong format): instructive, not judgmental — "Use the format MM/DD/YYYY"
- Permission error: honest about the constraint — "You need edit access to do this. Ask the owner."
- Destructive action: serious, not alarming — no exclamation marks

Source: Nielsen Norman Group — [Hostile Patterns in Error Messages](https://www.nngroup.com/articles/hostile-error-messages/)

---

## Error Prevention

The best error message is the one that never appears. Nielsen's Heuristic #5: error prevention over error recovery.

**Constraints:** Block invalid input at the field level before submission. Phone number fields reject letters; date pickers disable past dates for future-only contexts; dropdowns replace free text where options are finite. Source: [NN/G — Preventing User Errors: Avoiding Unconscious Slips](https://www.nngroup.com/articles/slips/)

**Smart defaults:** Pre-fill known values — country from IP, timezone from browser, billing address from last order. Reduces surface area for error. Source: [LogRocket — UX Error Prevention Examples](https://blog.logrocket.com/ux-design/ux-error-prevention-examples/)

**Input masking:** Format as user types — `(555) 555-5555` for phones, `MM/DD/YYYY` placeholder text with auto-advance between segments. Eliminates format guessing.

**Undo over confirm:** Prefer reversible actions with an undo window over blocking confirmation dialogs. Gmail's "Undo Send" is the canonical example — no interruption, recoverable. Reserve confirmation dialogs for irreversible, high-stakes operations only. Source: [UX Tools — How Designers Can Prevent User Errors](https://www.uxtools.co/blog/how-designers-can-prevent-user-errors)

**Confirmation dialogs:** Use only when the action cannot be undone and the cost of error is high (permanent deletion, sending to 10,000 people, irreversible payment). Never use for low-stakes actions — dialog fatigue causes users to click through without reading. Source: Apple HIG — [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)

**Real-time validation:** Show constraints proactively (character limits, password requirements) before the user submits. Avoid inline errors that fire before the user has finished typing — validate on blur, not on keydown.

---

## Error Presentation — When to Use What

| Component | Use When | Avoid When |
|-----------|----------|------------|
| **Inline field error** | Form field has a specific, fixable problem | The error is global or unrelated to a single field |
| **Error summary (top of page)** | Multiple form fields failed validation; keyboard focus needed | Only one field failed |
| **Toast / snackbar** | Transient, low-stakes confirmation or non-critical warning | The error requires user action or contains important information — auto-dismiss loses it |
| **Banner (persistent)** | System-wide degradation, maintenance window, connectivity loss | Temporary per-action feedback |
| **Modal / dialog** | Destructive action confirmation, blocking error that requires decision | Routine validation errors, anything that can be shown inline |
| **Full error page** | Route-level failure (404, 403, 500), session expired | Recoverable in-page errors |

Source: Material Design — [Errors](https://m1.material.io/patterns/errors.html); Material Design 3 — [Snackbar Guidelines](https://m3.material.io/components/snackbar/guidelines)

**Snackbar rule (Material Design):** Snackbars are transient and not appropriate for errors that require action. Use them for confirmations ("Saved", "Deleted") but never for error states that the user must resolve.

---

## Form Validation Errors

**On submit vs real-time:**
- Validate on submit first — let users complete their thought before correcting them
- After first failed submission, switch to real-time validation per field (validate on blur, re-validate on change)
- Never validate on keydown — it creates anxiety and fires on incomplete input

**Field-level errors:**
- Place error message between the label and the input, not below the input (GOV.UK pattern) — screen readers and sighted users encounter label → error → field in reading order
- Use red border + icon + text — never color alone (color-blind users)
- Wording: "Enter your date of birth" not "Date of birth is required"

**Form-level error summary (GOV.UK pattern):**
- When multiple fields fail, display an error summary at the top of the page
- Move keyboard focus to the summary on page load
- List every error as an anchor link — clicking it focuses the relevant field
- Exact same wording in the summary and next to the field — no paraphrasing

Source: GOV.UK Design System — [Error Summary](https://design-system.service.gov.uk/components/error-summary/); [Validation Pattern](https://design-system.service.gov.uk/patterns/validation/); [Error Message](https://design-system.service.gov.uk/components/error-message/)

**Anti-patterns:**
- Clearing the form on validation failure (never)
- Showing only the first error and hiding others
- Errors that disappear when the user starts typing (they lose context of what was wrong)

---

## Empty & Zero States

Empty states are not neutral. A blank container damages discoverability and reduces user confidence. Each type of empty state needs different treatment. Source: NN/G — [Designing Empty States in Complex Applications](https://www.nngroup.com/articles/empty-state-interface-design/)

| State | User's mental model | What to show |
|-------|---------------------|--------------|
| **No data yet** (fresh account) | "Is this broken?" | Illustration + explanation of what will appear + call to action to create first item |
| **No results** (search/filter) | "Nothing matched" | What was searched, why nothing matched, suggestions to broaden (remove filter, check spelling) |
| **No permission** | "Why can't I see this?" | Explain the permission gap honestly. Who can grant access. Don't pretend content doesn't exist. |
| **No connection** | "Is the app broken?" | Offline indicator, what is available offline (cached), retry button |
| **User cleared everything** | "Good, it worked" | Simple confirmation that the list is empty, easy path back |

**Rules:**
- Never show a spinner indefinitely where a genuine empty state applies
- No results ≠ error — don't style them the same (red, warning icon)
- Always provide a next action — even "No results" should offer "Clear filters" or "Try a broader search"

Source: IBM Carbon Design System — [Empty States Pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/)

---

## Loading Failures

**Skeleton screens > spinners:** Show a content-shaped skeleton so users understand what will load. This reduces perceived wait time and prevents layout shift on content arrival.

**Timeout handling:**
- Define a timeout threshold (commonly 10–30s for API calls)
- After timeout: show an error with a retry — do not leave the spinner running
- Preserve user context on retry — don't reset form state or scroll position

**Partial load:** When some content loads and some fails (e.g., dashboard with multiple widgets), show what loaded and isolate the failure to the failed component. Don't blank the whole page for a partial failure.

**Retry patterns:**
- Offer a single prominent "Try again" button — don't auto-retry silently without user awareness
- Exponential backoff for auto-retry (if used) to avoid hammering a degraded service
- After repeated failures, escalate: offer an alternative action (contact support, download cached version)

**Cached fallbacks:** Show stale data clearly labeled as such ("Last updated 3 hours ago — reconnecting…") rather than an error. A stale view is more useful than a blank one for read-heavy content.

Source: [Resilience Design Patterns — Retry, Fallback, Timeout](https://www.codecentric.de/en/knowledge-hub/blog/resilience-design-patterns-retry-fallback-timeout-circuit-breaker)

---

## Edge States

These are the cases that break layouts and expose untested assumptions.

**Too much data:**
- Long strings: truncate with ellipsis, provide tooltip or expandable view for full value — never let text overflow or break containers
- Large tables/lists: pagination or infinite scroll, never dump thousands of rows in the DOM
- File uploads: define and enforce max size before upload starts, not after

**Too little data:**
- Single-item lists: don't show "1 of 1" pagination; hide pagination controls when unnecessary
- One-character names: test with "O", "李", "X Æ A-12" — layouts built only for "John Smith" will break

**Special characters and internationalization:**
- Names: allow apostrophes, hyphens, diacritics — "O'Brien", "García", "Müller"
- RTL text: Arabic and Hebrew require mirrored layouts — don't treat left-to-right as universal
- Emoji in user-generated content: test rendering in every surface (notifications, page titles, alt text)

**Concurrent edits:**
- Detect and surface conflicts — "Someone else edited this while you were working. Here's what changed."
- Optimistic UI (local update before server confirms): always handle rollback on failure with clear messaging

**Stale data:**
- Show data freshness for time-sensitive content (stock prices, inventory, live feeds)
- Auto-refresh with visible indicator, or offer manual refresh
- Don't silently re-fetch and reorder content while a user is mid-action

Source: [Smashing Magazine — Designing Better Error Messages UX](https://www.smashingmagazine.com/2022/08/error-messages-ux-design/)

---

## 404 & Error Pages

A 404 page is still a page — it should do useful work.

**Required elements:**
- Clear statement of what happened ("We can't find that page")
- Search bar — the most useful single element on a 404 page
- Links to common destinations (home, popular sections)
- No dead ends — every error page must provide an exit path

**Humor:** Optional and brand-dependent. Only use if your brand voice supports it, the joke requires no interpretation, and the useful elements remain prominent. A funny 404 that buries the search bar is worse than a plain one. Source: [UXPin — 404 Page Best Practices](https://www.uxpin.com/studio/blog/404-page-best-practices/)

**Other HTTP error pages:**
- 403 Forbidden: explain why access is blocked (login required? wrong account?) — don't just say "forbidden"
- 500 Internal Server Error: apologize, indicate it's on your end (not user error), provide a status page link if available
- 503 Service Unavailable: include expected recovery time if known

**Never:** Stack traces, raw error codes, or "contact your administrator" without contact information.

---

## Destructive Action Safeguards

**Confirmation dialog rules (Apple HIG):**
- Destructive action button is styled as destructive (red/outlined) and is NOT the default focused button
- Cancel is always present and is the default
- Button labels describe the action: "Delete Project" not "OK"
- For actions the user explicitly initiated (Empty Trash), a less alarming style is acceptable — the user already chose this

Source: Apple HIG — [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts); [Action Sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets)

**Soft delete:** Move to trash/archive instead of permanent deletion. Provide a recovery window (30 days is common). Make restoration easy. Only permanent-delete after the window.

**Undo window:** Show a persistent snackbar/banner with an Undo action for a fixed window (5–30 seconds). Gmail's undo-send model. No modal, no interruption — just a clear escape hatch.

**Type-to-confirm:** For catastrophic actions (delete account, wipe database, archive all records), require users to type a specific phrase (the project name, "delete", "I understand"). This creates a speed bump that confirms intent. GitHub uses this pattern for repository deletion.

**Pattern summary:**

| Risk level | Safeguard |
|------------|-----------|
| Low (delete a comment) | Undo window |
| Medium (archive a project) | Soft delete + recovery period |
| High (permanent delete, send to all) | Confirmation dialog with descriptive button |
| Critical (account deletion, data wipe) | Type-to-confirm |

---

## Accessibility of Errors

**ARIA live regions:** Dynamically injected error messages are invisible to screen readers unless wrapped in a live region. Use `aria-live="polite"` for non-critical notifications, `aria-live="assertive"` (or `role="alert"`) for errors requiring immediate attention. Source: [MDN — ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions); [W3C WCAG Technique ARIA19](https://www.w3.org/TR/WCAG20-TECHS/ARIA19.html)

**`aria-invalid`:** Set `aria-invalid="true"` on fields with errors. Screen readers announce this state alongside the field label. Clear it when the error is resolved.

**`aria-describedby`:** Link the error message element to its input: `aria-describedby="email-error"`. The error text is then read as part of the field's description when focused.

**Focus management:**
- On form submission failure: move focus to the error summary at the top of the page
- On modal error dialogs: trap focus within the dialog, return focus to trigger on close
- Never move focus mid-typing — only on explicit submission attempts

**Color independence:** Never use color as the sole error indicator. Always pair with an icon (⚠, ✕) and text. Red borders alone fail WCAG 1.4.1. Source: [Home Office — Error Messages Accessibility](https://design.homeoffice.gov.uk/accessibility/interactivity/error-messages)

**Screen reader announcements:**
- Error summaries should be in a `<section>` or `<div>` with `role="alert"` or wrapped in a live region so the list is announced on injection
- Don't rely on visual order alone — DOM order must match logical reading order
- Avoid announcing "Error" repeatedly — combine label + error: "Email address — Enter a valid email address"

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Fix |
|-------------|--------------|-----|
| **"Something went wrong"** | No information, no action, no trust | State what failed and offer a recovery path |
| **Auto-dismissing error toasts** | User misses errors requiring action | Persist errors until user dismisses; only auto-dismiss confirmations |
| **Error message without an action** | User knows there's a problem but not what to do | Every error includes a next step — retry, contact support, go back |
| **Silent failures** | User thinks action succeeded; data is lost | Always confirm or explicitly fail — never pretend an operation worked |
| **Clearing form on error** | Forces user to re-enter all data | Preserve all valid inputs; only clear the field that failed if necessary |
| **Vague field-level error** | "Invalid input" tells the user nothing | Say what's invalid and what format is expected |
| **Modal for every error** | Disrupts flow for low-severity issues | Reserve modals for destructive confirmations; use inline for field errors |
| **Blame language** | "You entered an invalid email" reads as accusatory | "The email address isn't in the right format" — put the problem on the input, not the user |
| **Technical jargon / error codes alone** | "Error 403" means nothing to users | Translate to plain language; codes can appear as secondary detail |
| **Errors that appear but don't disappear** | Resolved errors that remain confuse state | Remove error state when the condition is resolved |
| **No offline state indication** | User retries indefinitely not knowing why | Detect connectivity, show offline banner, indicate what's available |
| **Confirmation dialogs on low-risk actions** | Dialog fatigue causes users to stop reading | Use undo patterns for reversible actions; modals only for irreversible |

Source: [Smashing Magazine — Designing Better Error Messages UX](https://www.smashingmagazine.com/2022/08/error-messages-ux-design/); [Pencil & Paper — Error Message UX](https://www.pencilandpaper.io/articles/ux-pattern-analysis-error-feedback)

---

## Design Checklist

### Error Message Quality
- [ ] Every error message states what happened, why, and what to do next
- [ ] No error message uses technical jargon, raw codes, or stack traces as the primary content
- [ ] Tone matches severity — no exclamation marks on validation errors, no casual tone on data loss
- [ ] Error messages never blame the user
- [ ] Destructive action buttons are labeled with the action ("Delete File"), not generic ("OK")

### Error Prevention
- [ ] Input constraints prevent the most common invalid inputs at the field level
- [ ] Destructive actions have appropriate safeguards (undo, soft delete, or confirmation dialog)
- [ ] Confirmation dialogs are reserved for irreversible, high-stakes operations only
- [ ] Smart defaults reduce manual input and opportunity for error
- [ ] Forms validate on blur (not on keydown) during initial entry; switch to real-time after first submission failure

### Form Validation
- [ ] Error summary appears at page top on submission failure, with keyboard focus moved to it
- [ ] Each error in the summary is an anchor link to the corresponding field
- [ ] Error messages appear between the label and the input field
- [ ] Error wording is identical in the summary and next to the field
- [ ] Forms preserve all valid input on submission failure

### Error Presentation
- [ ] Inline errors are used for field-specific validation problems
- [ ] Toast/snackbar is not used for errors that require user action
- [ ] Banners are used for persistent system-wide degradation
- [ ] Modals are reserved for blocking decisions and irreversible action confirmations
- [ ] Error pages provide search, navigation, and a clear next action

### Empty & Zero States
- [ ] Every empty state has a message explaining what will appear here
- [ ] Every empty state provides a clear path to the first action
- [ ] "No results" and "error" states are visually and linguistically distinct
- [ ] No permission states explain who can grant access
- [ ] Offline states indicate what is available without connectivity

### Loading Failures
- [ ] Timeouts are defined and handled — no infinite spinners
- [ ] Partial failures show what loaded and isolate the failed section
- [ ] Retry is a single, obvious action that preserves user context
- [ ] Stale cached data is labeled with its age

### Edge States
- [ ] UI tested with: single-character names, very long strings, emoji, RTL text, special characters
- [ ] Layouts tested at 0, 1, 2, and 1000+ items
- [ ] Concurrent edit scenarios surface a conflict, not silent overwrite
- [ ] Time-sensitive data shows freshness and refresh mechanism

### Accessibility
- [ ] Error messages injected dynamically are in an ARIA live region
- [ ] Fields with errors have `aria-invalid="true"` and `aria-describedby` pointing to the error message
- [ ] Focus moves to error summary on failed form submission
- [ ] Color is never the sole indicator of error state (also uses icon + text)
- [ ] Error dialogs trap focus and return it on close
- [ ] DOM reading order matches visual reading order for errors

---

## Sources

- **Nielsen Norman Group** — [Error-Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- **Nielsen Norman Group** — [Hostile Patterns in Error Messages](https://www.nngroup.com/articles/hostile-error-messages/)
- **Nielsen Norman Group** — [Preventing User Errors: Avoiding Unconscious Slips](https://www.nngroup.com/articles/slips/)
- **Nielsen Norman Group** — [Designing Empty States in Complex Applications: 3 Guidelines](https://www.nngroup.com/articles/empty-state-interface-design/)
- **GOV.UK Design System** — [Error Message Component](https://design-system.service.gov.uk/components/error-message/)
- **GOV.UK Design System** — [Error Summary Component](https://design-system.service.gov.uk/components/error-summary/)
- **GOV.UK Design System** — [Recover from Validation Errors Pattern](https://design-system.service.gov.uk/patterns/validation/)
- **Material Design 1** — [Errors Pattern](https://m1.material.io/patterns/errors.html)
- **Material Design 3** — [Snackbar Guidelines](https://m3.material.io/components/snackbar/guidelines)
- **Apple Human Interface Guidelines** — [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
- **Apple Human Interface Guidelines** — [Action Sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets)
- **Smashing Magazine** (2022) — [Designing Better Error Messages UX](https://www.smashingmagazine.com/2022/08/error-messages-ux-design/)
- **Pencil & Paper** — [Error Message UX, Handling & Feedback](https://www.pencilandpaper.io/articles/ux-pattern-analysis-error-feedback)
- **MDN Web Docs** — [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- **W3C WCAG** — [ARIA19: Using role=alert or Live Regions to Identify Errors](https://www.w3.org/TR/WCAG20-TECHS/ARIA19.html)
- **Home Office UCD Manual** — [Accessibility: Error Messages](https://design.homeoffice.gov.uk/accessibility/interactivity/error-messages)
- **IBM Carbon Design System** — [Empty States Pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- **UXPin** — [404 Page Best Practices](https://www.uxpin.com/studio/blog/404-page-best-practices/)
- **LogRocket Blog** — [UX Error Prevention Examples](https://blog.logrocket.com/ux-design/ux-error-prevention-examples/)
- **UX Tools** — [How Designers Can Prevent User Errors](https://www.uxtools.co/blog/how-designers-can-prevent-user-errors)
- **codecentric** — [Resilience Design Patterns: Retry, Fallback, Timeout](https://www.codecentric.de/en/knowledge-hub/blog/resilience-design-patterns-retry-fallback-timeout-circuit-breaker)
