# Form & Input Design

Concrete patterns, anti-patterns, and rules for designing forms that users can complete quickly and correctly.

---

## Form Layout & Structure

### Single Column vs. Multi-Column

| Layout | Use When | Avoid When |
|--------|----------|------------|
| **Single column** | Always the default — creates a clear top-to-bottom path that matches natural reading flow | Never override this without a strong reason |
| **Multi-column** | Short, logically paired fields (City / State / Zip) | General mixed-length forms — multi-column forms cause higher abandonment and eye-tracking confusion |
| **Grouped sections** | Long forms with distinct logical clusters | Fields have no conceptual relationship |

- Single-column layouts reduce completion time and error rates by keeping users' attention on one decision at a time. (Wroblewski, *Web Form Design*, 2008)
- Eye-tracking studies show users skip fields in multi-column layouts when columns appear to end a row. (Nielsen Norman Group)
- Group related fields using white space — proximity signals relationship without explicit dividers. (NN/G, *Group Form Elements Effectively Using White Space*)

### Progressive Disclosure

- Show only what is needed at each step — defer conditional fields until the triggering answer is given
- Multi-step forms: aim for 3–5 fields per step; label steps with a progress indicator (e.g., "Step 2 of 4")
- Avoid accordion-style forms where sections collapse — users miss fields and submit incomplete data
- Use single-question-per-page for high-stakes flows (checkout, onboarding) — GOV.UK Design System pattern

### Form Length Tradeoffs

- Every field has a cost: each additional input lowers completion probability
- Apply the EAS framework: **Eliminate** fields with no downstream use, **Adjust** to less burdensome input types, **Sequence** fields to build momentum before reaching harder ones (NN/G, *EAS Framework*)
- Mark optional fields, not required — assume most fields are required and call out the exceptions. (Wroblewski)

---

## Input Types & Selection

### Choosing the Right Control

| Input Type | Use When | Avoid When |
|------------|----------|------------|
| **Text field** | Open-ended or unpredictable values | Choosing from a known finite set |
| **Dropdown / Select** | 5–15 mutually exclusive options; space-constrained | < 5 options (use radio instead); > 15 options (use autocomplete search) |
| **Radio buttons** | 2–5 mutually exclusive options; all options should be visible at once | Many options — overwhelms the page |
| **Checkboxes** | Multiple independent options can be selected simultaneously | Mutually exclusive choices (radio is correct) |
| **Toggle** | Immediately applied binary settings (on/off); never for form submission | Choices that require a confirm/save action |
| **Autocomplete** | Large option sets, domain-specific terms, location/address lookup | Short lists where all options should be scanned |

- When choosing between input types, prefer whatever requires less typing — offer choices instead of requiring text entry whenever the option set is predictable. (Apple HIG, *Entering Data*)
- `<input type="number">` is inappropriate for values users don't increment (phone, postal code, card numbers) — use `inputmode="numeric"` with `type="text"` instead. (GOV.UK Design System, *Why we changed the input type for numbers*)

### Input Masking & Autocomplete

- Use input masks for structured formats (phone, credit card, date) — they reduce errors and communicate expected format without a separate instruction
- Always include `autocomplete` attributes (`name`, `email`, `tel`, `street-address`, `cc-number`, etc.) — browsers and password managers depend on them
- Never disable browser autocomplete (`autocomplete="off"`) unless there is a security justification (e.g., OTP field)
- `inputmode` attribute controls the on-screen keyboard independently of input type — use `inputmode="decimal"` for currency, `inputmode="numeric"` for PINs

---

## Labels & Placeholders

### Label Placement

| Alignment | Pros | Cons |
|-----------|------|------|
| **Top-aligned** (label above field) | Fastest eye movement (single downward scan), works well on mobile, fewer fixations required | Uses more vertical space |
| **Left-aligned** (label left of field) | Good for unfamiliar data or when users need to scan what's being asked | Slower completion time; horizontal eye movement; fixed-width labels cause issues at different lengths |
| **Right-aligned** (label right of field) | Strong visual association between label and field | Poor scannability — user cannot read labels independently |
| **Placeholder-only** (label inside field) | Saves vertical space | Disappears on input; fails accessibility; never use as the sole label |

- Top-aligned labels reduce eye-tracking fixations and completion time for most forms. Wroblewski's original eye-tracking research showed top-aligned labels halved the number of eye fixations required vs. left-aligned.
- Left-aligned labels are better when data is unfamiliar and users need to read each label carefully before deciding what to enter. (Wroblewski, *Web Form Design*, 2008)

### Placeholder Text Rules

- **Never use placeholder text as a label substitute** — it disappears on input, strains short-term memory, and fails screen reader expectations. (NN/G; Smashing Magazine)
- Use placeholders only for format hints (e.g., `MM/DD/YYYY`) when the label alone is insufficient — not to repeat the label
- Placeholder text contrast is typically insufficient by default (#767676 minimum for WCAG AA) — check contrast ratios
- Disappearing placeholder text forces users to recall format requirements mid-entry, increasing errors in complex forms. (Smashing Magazine)

### Required Field Indicators

- Mark **optional** fields (not required ones) — it is less cluttered and reinforces that required is the default. (Wroblewski)
- When asterisk (`*`) notation is used, include a key at the top of the form: "* Required"
- Material Design 3: use `*` for required fields, "(optional)" in parentheses for optional fields (M3 Text Fields Guidelines)
- Apple HIG: enable the continue/submit button only after required fields have values — the state itself communicates completion requirement

---

## Validation & Error Handling

### When to Validate

| Strategy | When to Use | Risk |
|----------|-------------|------|
| **On submit** | Default for all forms — validate after user intent is clear | Users may have to scroll back to find errors |
| **On blur (after leaving field)** | Re-validate a previously errored field once corrected | Never fire on blur for empty untouched fields — premature scolding pattern |
| **Inline/live** | Only after user has completed the field; "reward early, punish late" | Interrupts flow if triggered too aggressively |
| **Proactive constraints** | Disable disallowed characters as user types | Can confuse users if they can't tell why input is blocked |

- The **reward early, punish late** pattern: if a field is currently invalid and the user edits it, validate immediately and clear the error as soon as it's fixed. If a field is currently valid and the user edits it, wait until they move on before flagging any new error. (Smashing Magazine, *A Complete Guide to Live Validation UX*)
- GOV.UK Design System: validate on submit only; never validate as the user types or on blur. Their research shows real-time validation increases anxiety without improving accuracy.
- Never show an error the moment a user clicks into an empty field — this pattern has nearly 100% abandonment on that field. (NN/G)
- Apple HIG: dynamically validate field values and provide feedback as soon as a problem is detected, but only after the user has indicated intent to proceed.

### Error Message Placement & Content

- Place error messages **immediately adjacent to the field** — never in a modal, tooltip-only, or at the top of a long form without also marking the field. (NN/G)
- For form-level errors on submit: show an **error summary** at the top of the form AND mark each individual field. Link from the summary to each field. (GOV.UK Design System, *Error Summary*)
- Error message copy rules:
  - State what went wrong: "Enter a valid email address"
  - Tell the user how to fix it: "Your password must be at least 8 characters"
  - Never blame the user: "Invalid input" is not an error message
- Use **positive validation** (green checkmark/success state) for fields where correct completion is non-obvious (password strength, username availability)

---

## Mobile & Touch Considerations

### Tap Targets

- Minimum tap target: **44×44pt** (Apple HIG) / **48×48dp** (Material Design 3)
- Minimum spacing between targets: 8px to prevent mis-taps
- Full-width inputs on mobile — narrow fields create small tap targets and overflow issues
- Place primary CTAs in the **bottom third** of the screen (thumb zone) for one-handed ease. (Smashing Magazine, *Best Practices for Mobile Form Design*)

### Keyboard Types

| Field Type | HTML Attribute | Result |
|------------|---------------|--------|
| Email | `type="email"` | Shows `@` and `.` prominently |
| Phone | `type="tel"` | Numeric dialpad |
| Number (PIN, quantity) | `type="text" inputmode="numeric"` | Numeric keyboard, no spinner arrows |
| Decimal (price) | `type="text" inputmode="decimal"` | Numeric with decimal point |
| URL | `type="url"` | Shows `/`, `.`, and `.com` |
| Search | `type="search"` | Shows "Search" return key |

- Always pair `inputmode` with the appropriate keyboard — wrong keyboards are among the top mobile form frustrations. (Smashing Magazine, 2018)

### Autofill & Autocorrect

- Include `autocomplete` attributes on all fields — required for password managers and browser autofill
- Set `autocorrect="off"` and `autocapitalize="off"` on email, username, and code fields
- Use `autocapitalize="words"` on name fields
- For address forms, consider autocomplete APIs (Google Places, etc.) — address entry is the highest-friction form step on mobile

---

## Accessibility

### Labeling

- Every form control **must** have an accessible name — use `<label for="...">` as the primary method. Never rely solely on placeholder text or `aria-label` when a visible label is practical. (W3C WAI, *Labeling Controls*)
- `aria-label` is appropriate when a visible label is genuinely not present (icon-only buttons, search fields with adjacent search button)
- `aria-labelledby` links a control to any existing visible text, useful for compound headings that serve as group labels
- `aria-describedby` links helper text or format hints to an input — used in addition to the label, not instead of it

### Error State Accessibility

- Associate error messages with their field using `aria-describedby` — screen readers then announce the error when the field is focused
- Use `aria-invalid="true"` on fields with errors — announced as "invalid" by screen readers
- Never use color alone to communicate error state — add an icon, text, or border change. (WCAG 1.4.1, Use of Color)
- On submit with errors, move focus to the error summary or first errored field — sighted and non-sighted users both need to be directed. (W3C WAI)

### Focus Management

- Focus must always be visible — never `outline: none` without a replacement focus style
- Focus order must match visual reading order — avoid CSS re-ordering that breaks tab sequence
- After a dialog or inline panel opens, move focus to the first element inside it; return focus to the trigger when it closes
- WCAG 2.4.3 Focus Order: interactive elements must be navigable in a sequence that preserves meaning

### Screen Reader Considerations

- Group related fields with `<fieldset>` and `<legend>` — screen readers announce the legend before each field in the group (critical for radio/checkbox groups)
- For multi-field inputs (date: day/month/year), ensure each sub-field has its own label or `aria-label`
- Live validation announcements: use `aria-live="polite"` to announce error messages without interrupting the user mid-typing

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Placeholder-only labels** | Disappear on input; screen readers may skip them; low contrast | Always use a persistent visible label above the field |
| **Validate on blur for empty fields** | Scolds user before they've entered anything; high abandonment | Only validate after the field has had a value and been left |
| **Unclear required fields** | Users submit incomplete forms or over-fill optional fields | Mark optional fields; assume required by default |
| **Generic error messages** | "Invalid input" tells the user nothing | Write prescriptive messages: what went wrong + how to fix |
| **Errors only at top of form** | Users on long forms don't associate top errors with mid-page fields | Summarize at top AND mark each field inline |
| **Multi-column layout for unrelated fields** | Eye skips fields; no clear path; higher abandonment | Single column as default |
| **Disabled submit button until valid** | Users have no feedback on why it's disabled; near-100% abandonment rate | Show inline errors on submit attempt instead |
| **Using `<input type="number">` for non-incrementable values** | Spinner arrows + scroll hijacking on phone/card numbers | Use `type="text" inputmode="numeric"` |
| **Autofill disabled** | Breaks password managers; increases friction for returning users | Remove `autocomplete="off"` unless genuinely required |
| **Dropdowns for < 5 options** | Extra click to open; harder to scan; adds interaction overhead | Use radio buttons — all options visible at once |
| **Toggle for uncommitted choices** | Toggles apply state immediately; confuses form context | Use radio/checkbox for form fields; toggle only for live settings |
| **No positive validation** | Users unsure if a complex field (password, username) is actually valid | Add success state after fields with non-obvious validity |
| **Long single-page form on mobile** | High cognitive load; scroll fatigue; no clear progress | Break into steps with a visible progress indicator |

---

## Design Checklist

### Layout & Structure
- [ ] Single-column layout used by default; multi-column only for paired fields (City/State/Zip)
- [ ] Related fields grouped with whitespace or fieldset/legend
- [ ] Long forms split into logical steps with progress indicator
- [ ] Conditional fields revealed progressively — not shown until needed
- [ ] Optional fields marked; required fields unmarked (or `*` used with a key)

### Input Types
- [ ] Appropriate control selected for each data type (radio vs. dropdown vs. text)
- [ ] `<input type="number">` replaced with `type="text" inputmode="numeric"` for non-incrementable values
- [ ] `autocomplete` attributes present on all relevant fields
- [ ] Input masks applied for structured formats (phone, card, date)
- [ ] `autocorrect` and `autocapitalize` set correctly per field type

### Labels & Placeholders
- [ ] Every field has a persistent visible label (top-aligned by default)
- [ ] Placeholder text is not the sole label for any field
- [ ] Placeholder text, where used, shows format hints not label repetition
- [ ] Placeholder contrast meets WCAG AA minimum

### Validation & Errors
- [ ] Validation fires on submit, not on blur for untouched fields
- [ ] "Reward early, punish late" pattern applied for re-validation
- [ ] Error messages placed adjacent to their field
- [ ] Error summary at top of form links to each errored field
- [ ] Error messages explain what went wrong and how to fix it
- [ ] Positive validation shown for non-obvious fields (password strength, username)
- [ ] Submit button is never permanently disabled — show errors on attempt

### Mobile & Touch
- [ ] Tap targets ≥ 44pt / 48dp
- [ ] At least 8px spacing between adjacent tap targets
- [ ] Correct `inputmode` / `type` for each field to trigger appropriate keyboard
- [ ] Primary CTA placed in thumb-reachable zone (bottom third of screen)
- [ ] `autocorrect="off"` and `autocapitalize="off"` set on email/username fields
- [ ] Full-width inputs on mobile viewports

### Accessibility
- [ ] Every control has a `<label>` linked via `for` + `id`
- [ ] Radio/checkbox groups wrapped in `<fieldset>` / `<legend>`
- [ ] Error messages linked to fields via `aria-describedby`
- [ ] `aria-invalid="true"` set on fields with errors
- [ ] Error state indicated by more than color alone (icon, text, or border)
- [ ] Focus visible at all times — no bare `outline: none`
- [ ] Focus order matches visual reading order
- [ ] On submit with errors, focus moves to error summary or first errored field
- [ ] Screen reader tested with VoiceOver (iOS/macOS) and NVDA/JAWS (Windows)

---

## Sources

- **Nielsen Norman Group** — [Website Forms Usability: Top 10 Recommendations](https://www.nngroup.com/articles/web-form-design/); [Group Form Elements Effectively Using White Space](https://www.nngroup.com/articles/form-design-white-space/); [Less Effort, More Completion: The EAS Framework](https://www.nngroup.com/articles/eas-framework-simplify-forms/)
- **Luke Wroblewski** — *Web Form Design: Filling in the Blanks* (Rosenfeld Media, 2008); [Best Practices for Form Design (PDF)](https://static.lukew.com/webforms_lukew.pdf)
- **GOV.UK Design System** — [Error Message Component](https://design-system.service.gov.uk/components/error-message/); [Error Summary Component](https://design-system.service.gov.uk/components/error-summary/); [Recover from Validation Errors](https://design-system.service.gov.uk/patterns/validation/); [Why we changed the input type for numbers](https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/)
- **Material Design 3** — [Text Fields Guidelines](https://m3.material.io/components/text-fields/guidelines)
- **Apple** — [Human Interface Guidelines: Entering Data](https://developer.apple.com/design/human-interface-guidelines/entering-data); [Human Interface Guidelines: Text Fields](https://developer.apple.com/design/human-interface-guidelines/text-fields)
- **Smashing Magazine** — [Best Practices for Mobile Form Design](https://www.smashingmagazine.com/2018/08/best-practices-for-mobile-form-design/); [A Complete Guide to Live Validation UX](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/); [Designing Better Error Messages UX](https://www.smashingmagazine.com/2022/08/error-messages-ux-design/)
- **W3C WAI** — [Labeling Controls (Forms Tutorial)](https://www.w3.org/WAI/tutorials/forms/labels/); [ARIA6: Using aria-label](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA6)
