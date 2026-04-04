# Performance as UX

Speed is a design decision. Every millisecond of latency, every layout shift, every blank screen is a UX failure — not an engineering footnote.

---

## Response Time Thresholds

Jakob Nielsen's three limits, first published in *Usability Engineering* (1993) and validated against Miller (1968), reflect human cognitive constraints — not hardware. They have not changed in 60 years.

| Threshold | User Perception | Required Feedback |
|-----------|----------------|-------------------|
| **≤ 0.1s** | Instantaneous — system reacts to the user | None beyond the result itself |
| **≤ 1.0s** | Flow uninterrupted — delay is noticeable but tolerable | Cursor/state change is enough; no progress bar required |
| **≤ 10s** | Attention held — user stays in the dialogue | Progress indicator mandatory; time estimate recommended |
| **> 10s** | Attention lost — user switches tasks | Progress bar with estimate + ability to cancel |

Source: Nielsen Norman Group — [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)

**Additional thresholds from MDN / web.dev:**
- **> 50ms** — users begin perceiving interaction lag
- **> 100ms** — animations feel disconnected from input
- **> 16.67ms per frame** — visible stutter at 60fps targets

---

## Core Web Vitals as UX Metrics

Google's Core Web Vitals are not just SEO signals — they are direct measures of user experience. All three are assessed at the **75th percentile** of real page loads across mobile and desktop.

| Metric | Measures | Good | Needs Improvement | Poor |
|--------|---------|------|------------------|------|
| **LCP** — Largest Contentful Paint | Loading performance: time until the largest visible content renders | ≤ 2.5s | 2.5s – 4.0s | > 4.0s |
| **INP** — Interaction to Next Paint | Overall responsiveness: full input delay across all interactions (replaced FID, March 2024) | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** — Cumulative Layout Shift | Visual stability: unexpected layout shifts (score = impact fraction × distance fraction) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

Source: [web.dev/vitals](https://web.dev/articles/vitals), [LCP](https://web.dev/articles/lcp), [INP](https://web.dev/articles/inp), [CLS](https://web.dev/articles/cls)

**What causes each metric to fail, and how to fix it:**

**LCP failures:**
- Render-blocking CSS/JS delaying paint — defer non-critical scripts, inline critical CSS
- Large unoptimized hero images — use WebP/AVIF, `srcset`, `fetchpriority="high"` on the LCP element
- Slow server response (TTFB) — CDN, caching, SSR/SSG

**INP failures:**
- Long JavaScript tasks blocking the main thread — break up tasks with `scheduler.yield()` or `setTimeout`
- Heavy event handlers on frequent interactions — debounce, delegate, move work off main thread
- Third-party scripts — audit, defer, or eliminate

**CLS failures:**
- Images/ads without explicit `width`/`height` attributes — always size containers before content arrives
- Web fonts causing FOUT/FOIT — `font-display: swap` + preload the font
- Dynamically injected content above existing content — insert below the fold or reserve space

---

## Perceived Performance

Perceived performance is more important than actual performance. A 3-second load that feels fast beats a 2-second load that feels slow.

**Core rules (MDN Web Docs):**
- Provide a quick response and regular status updates rather than waiting for full completion
- Download what the user *sees first*; lazy-load everything else
- Prevent layout reflow — reserve space for slow assets so content doesn't jump after page load
- Time passes faster for engaged users — any visual feedback reduces subjective wait

**Key techniques:**

- **Content-first rendering** — render the shell and above-the-fold content immediately; defer below-the-fold content. FCP (First Contentful Paint) is the earliest signal users read as "alive."
- **Progressive image loading** — load a tiny placeholder LQIP (Low Quality Image Placeholder), then swap in the full image. Users perceive structured content as faster than a blank space.
- **Preconnect / preload hints** — `<link rel="preconnect">` eliminates DNS + TLS overhead for third-party origins; `<link rel="preload">` fetches LCP images before the parser discovers them.
- **200ms keydown trick** — fire autocomplete/typeahead requests on `keydown` rather than `keyup` to save ~200ms of perceived latency per keystroke.

Source: [MDN — Perceived Performance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Perceived_performance), [Smashing Magazine — Progressive Image Loading](https://www.smashingmagazine.com/2018/02/progressive-image-loading-user-perceived-performance/)

---

## Loading State Design

Choosing the wrong loading indicator wastes attention or creates anxiety. Match the indicator type to duration and context.

| Indicator | When to Use | Duration Range | Notes |
|-----------|------------|----------------|-------|
| **Nothing** | Sub-threshold operations | < 300ms | Flashing an indicator at this speed causes more confusion than it resolves (Material Design) |
| **Cursor / state change** | Simple feedback that work started | < 1s | Button disabled state, cursor: wait |
| **Spinner (indeterminate)** | Component-level load, unknown duration | 1s – 10s | Use for isolated module loads; do NOT use for full-page loads in this range |
| **Skeleton screen** | Full-page load with known layout | 2s – 10s | Builds mental model of page structure; reduces passive-wait perception |
| **Progress bar (determinate)** | Known duration or step count | Any duration where progress is quantifiable | Mandatory over 10s; time estimate preferred |
| **Shimmer / pulse** | In-line loading within existing UI | 1s – 5s | Lighter than full skeleton; good for list rows, cards |

Source: [NNG — Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/), [NNG — Progress Indicators](https://www.nngroup.com/articles/progress-indicators/), [Material Design 3 — Progress Indicators](https://m3.material.io/components/progress-indicators/guidelines), [Apple HIG — Loading](https://developer.apple.com/design/human-interface-guidelines/loading)

**Rules:**
- **Never use a skeleton screen for < 1s loads** — the flash is more disorienting than no indicator
- **Never use a spinner for full-page loads** — users have no reference for when it will end
- **Always show progress indicators immediately** when a long operation starts — do not wait to see if it's "fast enough" (Apple HIG)
- **Always provide a cancel mechanism** for operations over 10 seconds (Nielsen)

---

## Optimistic UI

Assume success. Network requests fail on only 1–3% of user-initiated operations. Design for the 97–99%, handle the rest gracefully.

**The three-step pattern:**
1. **Predict** — update the UI instantly on user action (< 100ms, below conscious perception threshold)
2. **Confirm** — send the request asynchronously; sync server state on response
3. **Rollback** — if the server rejects, revert within the 1-second attention window and explain why

**Canonical examples:**
- Twitter/X like button — color changes immediately on click; count syncs on server response
- Facebook reactions — UI updates before server confirmation, rollback only on failure
- Email send — message moves to Sent immediately; error snackbar appears if sending fails

**Rollback design rules:**
- Rollback must happen within 1 second to avoid breaking user flow (Nielsen 1s threshold)
- Rollback should explain the failure in plain language — not "Request failed (403)"
- For destructive operations (delete, send payment), optimistic UI is inappropriate — confirm first
- Conflict resolution (two users editing the same record): surface the conflict explicitly rather than silently overwriting

Source: [Smashing Magazine — True Lies of Optimistic User Interfaces](https://www.smashingmagazine.com/2016/11/true-lies-of-optimistic-user-interfaces/)

---

## Progressive Loading

**Lazy loading:**
- Images below the fold: use `loading="lazy"` attribute natively or IntersectionObserver for fine control
- JavaScript modules: dynamic `import()` for routes and features not needed on first paint
- Rule: never lazy-load the LCP element — it must load with the highest priority

**Infinite scroll vs. pagination:**

| | Infinite Scroll | Pagination |
|---|---|---|
| Best for | Browsing / discovery (social feeds, image galleries) | Goal-directed navigation (search results, catalogs) |
| Accessibility | Difficult — keyboard/screen reader users lose positional context | Native, reliable |
| Shareable state | Breaks — no URL for "page 5" | Works — each page is a URL |
| Performance | Risk of DOM bloat → layout/scroll jank | Bounded DOM size per page |
| Pattern fix | Virtual scrolling (only render visible rows) | Preload next page on approach |

**Above-the-fold prioritization:**
- Critical CSS inlined in `<head>` — eliminates render-blocking stylesheet fetch
- LCP image given `fetchpriority="high"` — moved to top of browser's resource queue
- Non-critical JS deferred or async — never block HTML parsing

**Image loading strategies:**
- Use `srcset` + `sizes` for responsive images — serve the smallest useful size
- LQIP (Low Quality Image Placeholder) → full image swap on load
- `aspect-ratio` CSS on image containers — prevents CLS before image dimensions are known

Source: [MDN — Perceived Performance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Perceived_performance), [web.dev — LCP](https://web.dev/articles/lcp)

---

## Offline & Degraded States

**Service worker patterns:**
- **Cache-first:** serve from cache, update in background (best for static assets, app shell)
- **Network-first:** try network, fall back to cache on failure (best for frequently-changing data)
- **Stale-while-revalidate:** serve cache immediately, fetch update for next load (balances freshness and speed)

**Offline-first design:**
- Assume the network is unreliable — design the interaction before thinking about the network
- Queue write operations locally; sync when connectivity returns (e.g., drafts, form submissions)
- Show explicit offline state — never silently fail. "You're offline. Changes will sync when you reconnect." is better than a generic error
- Use `navigator.onLine` + Network Information API (`connection.effectiveType`) to adapt UI to connection quality

**Connection quality adaptation:**
- On `connection.effectiveType === '2g'` or `saveData === true`: serve low-res images, disable autoplay video, reduce animation
- Progressive enhancement: base experience works without JS; enhanced layers add on top

**Degraded state patterns:**
- Partial outage: show which features are unavailable, not a global error page
- Slow network: show a "this is taking longer than expected" message after the 1-second threshold, not the 10-second threshold — users notice at 1s, lose attention at 10s

---

## Animation & Transitions

**Performance budget:**
- 60fps target = **16.67ms per frame** for all scripting, style, layout, paint, and composite
- 90fps (high-refresh screens) = **11.1ms per frame**
- Any animation that triggers layout or paint will blow the budget on mid-range hardware

**The compositor-only rule:**
Only two CSS properties animate without triggering layout or paint: `transform` and `opacity`. Everything else is risky.

| Property | Pipeline Stage Triggered | Performance Impact |
|----------|--------------------------|-------------------|
| `transform`, `opacity` | Composite only | Safe — runs on GPU compositor thread |
| `color`, `background-color`, `box-shadow` | Paint | Moderate — no layout, but paint is expensive at scale |
| `width`, `height`, `top`, `left`, `margin`, `padding` | Layout + Paint + Composite | Expensive — forces geometry recalculation |

**`will-change` rules:**
- Apply when animation is likely within ~200ms (e.g., on `:hover` parent for interactive cards)
- **Do not apply globally** — every promoted layer consumes GPU memory; overuse degrades overall performance
- Remove after animation completes if applied dynamically

**Layout thrashing:**
- Caused by alternating DOM reads and writes in a loop — the browser must flush pending styles before each read, multiplying layout cost
- Fix: batch all reads first, then all writes. Libraries like FastDOM enforce this.
- Red alert threshold: > 28ms in layout per frame (web.dev)

**Motion accessibility:**
- Respect `prefers-reduced-motion` — wrap non-essential animations in `@media (prefers-reduced-motion: no-preference)`
- Essential transitions (loading spinners, progress indicators) are exempt; decorative motion is not

Source: [web.dev — Animations and Performance](https://web.dev/articles/animations-and-performance), [web.dev — Avoid Layout Thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing), [MDN — Animation Performance and Frame Rate](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)

---

## Latency as a Design Constraint

From Ilya Grigorik's *High Performance Browser Networking*: the central insight for UX is that **latency, not bandwidth, is the binding constraint** on interactive web performance.

- Adding bandwidth above ~5 Mbps gives almost nothing for typical page loads
- Every sequential resource fetch costs at least one round-trip time (RTT)
- Mobile radio transitions (LTE RRC state machine waking from idle) add 100–2,500ms of hidden latency — a constant tax on mobile interactions
- **Design implication:** decouple UI feedback from network round-trips. Optimistic UI, local caching, and preconnect/preload hints buy more UX improvement than payload optimization alone

GOV.UK found users need **50% more concentration** to complete tasks on slow connections — elevating cognitive load and stress. Performance is an accessibility issue.

Source: [High Performance Browser Networking — hpbn.co](https://hpbn.co/), [GOV.UK — Why We Focus on Frontend Performance](https://technology.blog.gov.uk/2019/04/18/why-we-focus-on-frontend-performance/)

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| **Blank loading screen** | No status = no mental model. Users can't tell if the page is loading or broken | Use skeleton screen or progress indicator within 300ms |
| **Spinner for full-page load** | Indeterminate indicator with no reference point causes anxiety over 3–5s | Use skeleton screen (2–10s) or progress bar (known duration) |
| **Layout shift after load** | CLS > 0.1 causes users to mis-click on content that moved | Size all containers before content arrives; use `aspect-ratio` |
| **Blocking render with analytics/ads** | Third-party scripts delay LCP and INP — users experience slow page even if your code is fast | Defer/async all non-critical third-party scripts |
| **No feedback on slow operations** | Buttons that do nothing visible for > 1s lead to repeated clicks and duplicate requests | Disable the button and show a spinner immediately on click |
| **Optimistic delete without undo** | Instant removal is great UX; no recovery path for mis-clicks is not | Show a brief "Undo" snackbar (3–5s) after optimistic delete |
| **Infinite scroll on goal-directed interfaces** | Users searching for a specific result lose position; URL doesn't reflect state | Use pagination for search/catalog; reserve infinite scroll for browsing |
| **Lazy-loading the LCP element** | `loading="lazy"` on the hero image delays the most important metric | LCP elements must have `fetchpriority="high"`, never `loading="lazy"` |
| **`will-change` on everything** | Every promoted layer consumes GPU memory — can make performance *worse* | Apply `will-change` only to specific elements that will animate imminently |
| **Silent offline failure** | User submits a form, nothing happens, no error — they assume success | Detect connectivity; queue locally and show explicit "offline" state |
| **Animation on layout-triggering properties** | `width`, `height`, `margin` animations cause reflow on every frame | Animate `transform` and `opacity` exclusively |
| **No `prefers-reduced-motion` support** | Vestibular disorders, epilepsy — decorative motion is harmful for some users | Wrap non-essential animation in `@media (prefers-reduced-motion: no-preference)` |

---

## Design Checklist

### Response & Feedback
- [ ] Every user action receives visible feedback within 100ms
- [ ] Operations taking > 300ms show a loading indicator
- [ ] Operations taking > 1s show a progress indicator or skeleton screen
- [ ] Operations taking > 10s show a time estimate and a cancel option
- [ ] Buttons and inputs are disabled (not just visually) while their operation is in-flight

### Core Web Vitals
- [ ] LCP element identified and given `fetchpriority="high"`, never `loading="lazy"`
- [ ] LCP target ≤ 2.5s verified at 75th percentile on real devices
- [ ] INP target ≤ 200ms — no long JS tasks (> 50ms) on main thread during interactions
- [ ] CLS target ≤ 0.1 — all image and ad containers sized before content loads
- [ ] `width`/`height` or `aspect-ratio` on every `<img>` and `<video>` element

### Perceived Performance
- [ ] Critical CSS inlined in `<head>`; non-critical CSS deferred
- [ ] Non-critical JS deferred or async; no render-blocking scripts
- [ ] LCP image preloaded with `<link rel="preload">`
- [ ] Third-party origins connected with `<link rel="preconnect">`
- [ ] LQIP or `background-color` placeholder shown for hero images before load

### Loading States
- [ ] Skeleton screens used for full-page loads (2–10s range), not spinners
- [ ] Spinners used only for isolated component loads, not full-page context
- [ ] No loading indicator flashes for operations < 300ms
- [ ] Progress bars used when step count or duration is known

### Optimistic UI
- [ ] Optimistic updates applied to low-risk reversible operations (like, follow, draft save)
- [ ] Rollback triggered within 1 second of server failure
- [ ] Rollback shown with plain-language explanation, not raw error codes
- [ ] Optimistic UI NOT used for destructive or high-stakes operations (payment, delete)

### Progressive Loading
- [ ] Below-the-fold images use `loading="lazy"`
- [ ] Non-critical JS split into route-level chunks with dynamic `import()`
- [ ] Infinite scroll replaced with pagination on goal-directed interfaces
- [ ] Virtual scrolling used for lists > ~500 rows

### Offline & Degraded States
- [ ] Service worker strategy defined (cache-first for shell; network-first or SWR for data)
- [ ] Write operations queued locally and synced on reconnection
- [ ] Explicit "You're offline" state shown — never silent failure
- [ ] UI adapts to `connection.effectiveType === '2g'` or `saveData === true`

### Animation
- [ ] All animations use `transform` and/or `opacity` only — no layout-triggering properties
- [ ] `will-change` applied only to specific elements, only when animation is imminent
- [ ] No layout thrashing — DOM reads and writes batched separately
- [ ] All decorative animation wrapped in `@media (prefers-reduced-motion: no-preference)`

---

## Sources

- **Nielsen Norman Group** — [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/) (Jakob Nielsen, 1993)
- **Nielsen Norman Group** — [Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/)
- **Nielsen Norman Group** — [Progress Indicators](https://www.nngroup.com/articles/progress-indicators/)
- **Google / web.dev** — [Core Web Vitals](https://web.dev/articles/vitals); [LCP](https://web.dev/articles/lcp); [INP](https://web.dev/articles/inp); [CLS](https://web.dev/articles/cls)
- **Google / web.dev** — [Animations and Performance](https://web.dev/articles/animations-and-performance)
- **Google / web.dev** — [Avoid Large, Complex Layouts and Layout Thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
- **MDN Web Docs** — [Perceived Performance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Perceived_performance)
- **MDN Web Docs** — [Animation Performance and Frame Rate](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)
- **Smashing Magazine** — [True Lies of Optimistic User Interfaces](https://www.smashingmagazine.com/2016/11/true-lies-of-optimistic-user-interfaces/) (Denys Mishunov, 2016)
- **Smashing Magazine** — [Progressive Image Loading](https://www.smashingmagazine.com/2018/02/progressive-image-loading-user-perceived-performance/) (2018)
- **GOV.UK / GDS** — [Why We Focus on Frontend Performance](https://technology.blog.gov.uk/2019/04/18/why-we-focus-on-frontend-performance/) (2019)
- **Apple** — [Human Interface Guidelines: Loading](https://developer.apple.com/design/human-interface-guidelines/loading); [Progress Indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators)
- **Material Design 3** — [Progress Indicators](https://m3.material.io/components/progress-indicators/guidelines)
- **Ilya Grigorik** — *High Performance Browser Networking*, O'Reilly 2013. Free online: [hpbn.co](https://hpbn.co/)
