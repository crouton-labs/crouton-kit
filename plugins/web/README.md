# web

Web development tools for production-grade frontend work with distinctive design quality.

## Commands

### `/web/frontend/design-website`
Interactive workflow that produces a comprehensive HTML design document containing your complete design system and component library.

**Process:**
1. **Requirements** - Describe your product
2. **Design Exploration** - Single multi-question round covering:
   - Overall design language & vibe (7 options: novel + standard)
   - Content hierarchy & layout philosophy (7 approaches)
   - Color psychology & emotion (7 palettes with hex codes)
   - Typography & text personality (7 systems)
3. **Clarifications** - Brand requirements, accessibility needs, browser support, performance, specific components
4. **Spec Review** - Markdown design specification covering philosophy, color system, typography, spacing, layout, components, interactions, animations, accessibility
5. **HTML Generation** - Single self-contained `design-document.html` file

**Output document contains:**
- Design system overview (colors, typography scale, spacing, borders, shadows)
- Core components with live examples (buttons, forms, cards, navigation, alerts, modals, tables, lists, badges, loading/empty states)
- All interactive states (hover/active/focus/disabled)
- Responsive behavior (mobile-first)
- CSS custom properties for theming
- Vanilla JS for interactivity
- Organized sections with ToC comment for LLM navigation

**Technical details:**
- Embedded CSS in `<style>` tag
- No external dependencies
- Grid/Flexbox responsive layouts
- Production-ready reference for developers

### `/web/frontend/role-ui-ux`
Enter UI/UX designer mode for wireframing and exploration WITHOUT code generation.

**Constraints:**
- Collaboration only, no execution
- ASCII wireframes for layout proposals
- Presents 2-3 options per design decision
- Stays in discovery mode until requirements are clear
- Asks about problem, users, constraints before proposing

**Use when:** You need to explore design direction before implementation.

## Skills

### `frontend` (`web:frontend`)
Production-grade frontend code generation with distinctive aesthetics.

**Applied to:** Component, page, or application requests requiring working code.

**Design approach:**
- Commits to BOLD aesthetic direction (brutally minimal, maximalist chaos, retro-futuristic, organic, luxury, playful, editorial, brutalist, art deco, soft/pastel, industrial, etc.)
- Focuses on typography (distinctive fonts, not generic system fonts), color (CSS variables, dominant colors with sharp accents), motion (CSS animations, staggered reveals, scroll-triggered effects), spatial composition (asymmetry, overlap, diagonal flow, grid-breaking), backgrounds (gradient meshes, noise textures, geometric patterns, layered transparencies)
- Avoids: Inter/Roboto/Arial, purple gradients on white, predictable layouts, cookie-cutter patterns
- Varies between light/dark themes, different fonts, different aesthetics across generations

**Implementation:**
- Production-grade functional code (HTML/CSS/JS, React, Vue, etc.)
- Complexity matches aesthetic vision (maximalist → elaborate animations; minimalist → precision spacing)
- No external dependencies unless required
- Accessible and responsive

**When triggered:** User asks to build web components, pages, or applications.
