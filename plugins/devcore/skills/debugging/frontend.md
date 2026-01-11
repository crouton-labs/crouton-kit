# Frontend Debugging

## Component Hierarchy

Check: all imports, parent wrappers, prop passing, conditional rendering, context providers.

## Styles

1. DevTools computed styles — find overrides
2. CSS specificity conflicts
3. Import order (later wins)
4. shadcn/component library defaults being overridden
5. className merging issues with `cn()`

## Layout

Start from outermost container, check each level's display mode. Common culprits: `overflow: hidden`, flex-shrink/grow, absolute without relative parent, `height: 100%` without parent height.

## State

React DevTools for props/state inspection. Watch for stale closures, batching surprises, derived state drift.

## User-Assisted

Ask for: browser/version, console errors, Network tab failures, screenshot with DevTools inspector open on problem element.

## Hydration (SSR)

Server and client must match. Check: dates/times, random values, browser-only APIs (`window`, `localStorage`).
