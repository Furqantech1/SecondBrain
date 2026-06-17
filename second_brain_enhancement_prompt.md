# Second Brain — Complete Front-End Rebuild Prompt
**Version:** 1.0 — Master Specification  
**Status:** Ready to copy-paste into a coding AI

---

## ROLE & PERSONA

You are a world-class front-end engineer with 12+ years of experience shipping production SaaS products at companies like Linear, Vercel, and Stripe. You write **zero boilerplate**, zero placeholder comments, and zero lazy fallback styling. Every class, every spring constant, and every layout decision you make is deliberate, measurable, and defensible.

You are rebuilding the **Second Brain** React application. The existing codebase uses a clichéd "Deep Space" cyberpunk aesthetic (dark canvas `#050510`, neon cyan/purple glows, glassmorphism panels, floating blob orbs, gradient text). Your job is to surgically strip that aesthetic and replace it with a formal, structural, premium SaaS design language.

You will produce **complete, working JSX files** — no truncation, no `// ... rest of component`, no `TODO` comments.

---

## ANTI-HALLUCINATION & HARD CONSTRAINTS

Before writing a single line of code, internalize these absolute bans. Violating any one of them makes the entire output invalid:

### ❌ BANNED — Visual & CSS
- No neon glows, box shadows with color tints, or `text-shadow`
- No `rgba(0, 224, 255, ...)`, `rgba(123, 97, 255, ...)`, or any Electric Azure / Deep Purple values
- No `backdrop-filter: blur()` glassmorphism panels
- No floating animated background orbs, mesh gradients, or grid overlays as decorative elements
- No emoji in UI (`🧠`, `✨`, `🚀` etc. — entirely absent from component output)
- No gradient text (`bg-clip-text`, `text-transparent`, `bg-gradient-to-r`)
- No `rounded-2xl` or larger on structural containers — border-radius is architectural, not decorative
- No drop shadows used decoratively (`shadow-lg`, `shadow-2xl` on cards)
- No purple, cyan, or teal as primary brand colors

### ❌ BANNED — Code Quality
- No placeholder comments (`// Add logic here`, `{/* TODO */}`)
- No truncated components (`// ... rest of the component`)
- No `console.log` left in code
- No inline `style={{}}` except for Framer Motion dynamic values (e.g. `layoutId`)
- No `any` TypeScript type (if using TS); no prop type omissions
- No `useEffect` without a dependency array

### ❌ BANNED — Animations
- No floating/bobbing idle loops (the `float` keyframe)
- No `bounce-slow` or `pulse-ring` decorative keyframes
- No easing functions that produce elastic or overshoot behavior on UI chrome
- No animation durations above `0.45s` for micro-interactions
- No stagger delays above `80ms` per child item

---

## THE DESIGN LANGUAGE — MANDATORY SPECIFICATION

### Color System
Implement this palette as CSS custom properties in `index.css`. Do not use arbitrary Tailwind values.

```css
:root {
  /* Surfaces */
  --surface-base:     #0D0D0F;   /* page background */
  --surface-raised:   #131316;   /* cards, panels */
  --surface-overlay:  #1A1A1E;   /* hover states, selected rows */
  --surface-sunken:   #0A0A0C;   /* input backgrounds */

  /* Borders */
  --border-subtle:    rgba(255,255,255,0.06);   /* structural dividers */
  --border-default:   rgba(255,255,255,0.10);   /* interactive element outlines */
  --border-emphasis:  rgba(255,255,255,0.18);   /* focused / hovered borders */

  /* Text */
  --text-primary:     #F0EEE8;   /* headings, primary labels */
  --text-secondary:   #8A8882;   /* subtitles, meta, secondary labels */
  --text-tertiary:    #545250;   /* disabled states, placeholders */

  /* Accent — used ONLY for primary CTA and live status indicators */
  --accent:           #C8F135;   /* sharp yellow-green — single functional accent */
  --accent-hover:     #D9FF50;
  --accent-text:      #0D0D0F;   /* text on accent backgrounds */

  /* Semantic */
  --status-active:    #22C55E;
  --status-pending:   #EAB308;
  --status-error:     #EF4444;
  --status-idle:      #545250;
}
```

### Typography Rules
- **Font stack:** `'Geist Sans', 'Inter', system-ui, sans-serif` — load Geist Sans from `https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/style.css`
- **Scale (strict — no deviations):**
  - Display: `48px / 52px`, weight `600`, tracking `-0.03em`
  - H1: `32px / 38px`, weight `600`, tracking `-0.025em`
  - H2: `22px / 28px`, weight `500`, tracking `-0.015em`
  - H3: `15px / 22px`, weight `500`, tracking `-0.01em`
  - Body: `14px / 22px`, weight `400`, tracking `0`
  - Label/Meta: `12px / 16px`, weight `500`, tracking `0.02em`, uppercase
  - Mono: `13px / 20px`, `'Geist Mono', monospace`
- **Line-length cap:** `68ch` on all body copy blocks

### Layout Grid
- Page gutter: `64px` horizontal on desktop, `24px` on mobile
- Column grid: 12 columns, `24px` gap
- Structural dividers are `1px solid var(--border-subtle)` — never shadows, never spacing alone
- All container borders use `border: 1px solid var(--border-default)` — not `ring-*`, not `outline`
- `border-radius` values: `4px` (inputs, badges), `6px` (buttons, small cards), `8px` (panels, drawers) — nothing larger

---

## FRAMER MOTION — PHYSICS SPECIFICATION

Define these as named variants in a shared `src/lib/motion.js` file. Import them into every animated component — never write inline `animate` props for repeated patterns.

```js
// src/lib/motion.js

export const SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.6,
};

export const SPRING_SMOOTH = {
  type: 'spring',
  stiffness: 220,
  damping: 26,
  mass: 0.8,
};

export const SPRING_PANEL = {
  type: 'spring',
  stiffness: 140,
  damping: 22,
  mass: 0.9,
};

export const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { ...SPRING_SMOOTH } },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const stagger = (delayChildren = 0.05, staggerChildren = 0.06) => ({
  hidden:  {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const slideFromRight = {
  hidden:  { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0,  transition: { ...SPRING_PANEL } },
  exit:    { opacity: 0, x: 24, transition: { duration: 0.18, ease: 'easeIn' } },
};

export const collapseWidth = (collapsedWidth = 48, expandedWidth = 240) => ({
  collapsed: { width: collapsedWidth, transition: SPRING_PANEL },
  expanded:  { width: expandedWidth,  transition: SPRING_PANEL },
});
```

**Mandatory animation rules:**
- Use `layoutId` on any element that moves between DOM positions (e.g., active nav indicator, selected row highlight)
- Use `AnimatePresence` with `mode="wait"` for page-level transitions and `mode="sync"` for list mutations
- Every list of items (table rows, nav items, document cards) must use `stagger()` on mount
- `whileHover` and `whileTap` must use `SPRING_SNAPPY` — never `{ duration: 0.2 }` tween for interactive states

---

## EXECUTION PLAN — FOLLOW THIS ORDER EXACTLY

Before writing any code, output a planning block for each file:

```
PLAN: [filename]
- Layout tree: [describe the component hierarchy in 2–3 lines]
- State: [list useState/useContext dependencies]
- Motion: [which variants and layoutIds are used]
- Key constraints: [any edge cases or spec-specific requirements]
```

Then write the complete component. Do not skip the planning block.

---

## FILE 1 — `LandingPage.jsx`

### Architecture
A full-viewport, section-scroll page structured as a strict vertical stack of full-width sections, divided by `1px` horizontal rules. **Zero floating elements. Zero cards with drop shadows.**

### Section Specifications

#### Navigation (sticky, `h-14`)
- `border-bottom: 1px solid var(--border-subtle)` — no background blur, just `background: var(--surface-base)` at `opacity: 0.96`
- Left: wordmark `SECOND BRAIN` in mono font, `13px`, weight `500`, tracking `0.12em`, `var(--text-primary)` — no logo SVG, no icon
- Center: nav links in label scale — `WHY`, `HOW IT WORKS`, `PRICING`, `DOCS` — `var(--text-secondary)` default, `var(--text-primary)` on hover. Transition: `color 120ms ease`
- Right: Ghost button (border `var(--border-default)`, text `var(--text-secondary)`) labeled `SIGN IN` + Primary CTA button (background `var(--accent)`, text `var(--accent-text)`, no border-radius above `6px`) labeled `START FREE`

#### Hero Section
- Full viewport height (`min-h-screen`), centered content column, max-width `780px`
- Headline: display scale, `var(--text-primary)`, two lines max, e.g. `"Your documents.` / `Precisely recalled."`
- Sub-headline: body scale, `var(--text-secondary)`, max `52ch`, one `var(--accent)` word as `color: var(--accent)` inline span — no gradient
- CTA row: Primary button (`START FOR FREE —`) + Ghost button (`SEE HOW IT WORKS`)
- Trust line: `var(--text-tertiary)`, label scale: e.g. `"USED BY 1,200+ RESEARCHERS & ENGINEERS"`
- **Interactive data-flow diagram** (below fold line, full-width): An SVG/CSS illustration showing the pipeline: `PDF UPLOAD → CHUNK → EMBED → PINECONE INDEX → QUERY → GEMINI → RESPONSE`. Each node is a mono-font label in a `1px border` rect (`6px` radius, `var(--surface-raised)` background). Connecting lines are `1px dashed var(--border-default)`. The currently "active" node (animated via `useEffect` cycling every 1.8s) gets `border-color: var(--accent)` and its label gets `color: var(--accent)`. No glow. No pulse ring. Use Framer Motion `animate` prop on `border-color` and `color` with a `0.2s ease` transition.

#### Bento Grid Matrix (Features)
- 12-column grid, `24px` gap, max-width `1080px`, centered
- Each bento cell: `background: var(--surface-raised)`, `border: 1px solid var(--border-default)`, `border-radius: 8px`, `padding: 32px`
- On hover: `border-color: var(--border-emphasis)`, transition `180ms ease` — **no scale transform, no shadow**
- Cell layout: Label (meta scale, `var(--text-tertiary)`) → Title (H3) → Description (body, `var(--text-secondary)`) → Optional mono-font code/stat block
- 6 cells total, spanning:
  - Cell 1: span 7 cols — "Instant recall" — shows a mock query/response in a terminal-style mono block
  - Cell 2: span 5 cols — "Source citations" — shows 2 stacked citation rows with filename + relevance score bar
  - Cell 3: span 4 cols — "Multi-document" — shows a count stack `23 docs / 184k vectors`
  - Cell 4: span 4 cols — "30-day JWT sessions" — shows a mock token expiry timeline
  - Cell 5: span 4 cols — "Vector isolation" — shows a diagram of two user namespaces separated by a `1px` divider
  - Cell 6: span 12 cols — "Processing pipeline" — shows a horizontal step track (same nodes as hero diagram)

#### Social Proof Bar
- Full-width, `border-top` and `border-bottom` `1px solid var(--border-subtle)`, `height: 64px`
- Horizontal list of company name strings in mono font, `var(--text-tertiary)`, separated by `·`
- No logos, no carousel, no animation

#### FAQ Section
- Two-column: left col (4 cols) = sticky section label in meta scale; right col (8 cols) = accordion items
- Each accordion item: `border-top: 1px solid var(--border-subtle)`, question in H3, answer in body
- Expand/collapse: Framer Motion `AnimatePresence` on the answer block, `SPRING_SMOOTH` transition, chevron rotates `0° → 180°` using `animate={{ rotate }}` with `SPRING_SNAPPY`

#### Footer
- Full-width, `border-top: 1px solid var(--border-subtle)`, `padding: 48px 64px`
- Two rows: top = 4-col link groups + wordmark; bottom = copyright in meta scale, `var(--text-tertiary)`

---

## FILE 2 — `Dashboard.jsx` (Document Management Hub)

### Architecture
A full-height desktop application frame with **three columns** and **zero page scroll** — the viewport is fixed and content scrolls within panels.

```
┌──────────┬──────────────────────────────────┬───────────────────┐
│ NAV TREE │         DOCUMENT TABLE            │  INSPECTOR PANEL  │
│ 240px    │         flex-1                    │  320px (slide-in) │
│ collapse │                                   │                   │
└──────────┴──────────────────────────────────┴───────────────────┘
```

### Column 1 — Collapsible Navigation Tree (`240px → 48px`)
- Toggle button at top-right of sidebar: chevron icon, `16px`, `var(--text-tertiary)`
- Collapsed state: show only icons (use Lucide React: `FileText`, `Upload`, `User`, `Settings`) centered in `48px` column, `border-right: 1px solid var(--border-subtle)`
- Expanded state: icon + label. Label uses body scale, `var(--text-secondary)`. Active item: `background: var(--surface-overlay)`, `border-radius: 4px`, label `var(--text-primary)`, uses `layoutId="nav-active-bg"` for Framer Motion shared layout
- Section groups: `WORKSPACE` and `ACCOUNT` labels in meta scale with `margin-top: 24px`
- Navigation items: `Documents`, `Upload`, `Conversation History`, `Profile`, `Settings`
- Bottom: user avatar (initials circle, `32px`, `background: var(--surface-overlay)`, `border: 1px solid var(--border-default)`) + username + logout icon
- Width animation: `collapseWidth(48, 240)` variant from `motion.js`

### Column 2 — Document Table (flex-1)
- Header bar (`h-12`, `border-bottom: 1px solid var(--border-subtle)`):
  - Left: section title `DOCUMENTS` in meta scale + document count badge (mono, `var(--text-tertiary)`, `border: 1px solid var(--border-subtle)`, `border-radius: 4px`, `padding: 1px 6px`)
  - Right: Search input (mono font, `height: 32px`, `background: var(--surface-sunken)`, `border: 1px solid var(--border-subtle)`, focus: `border-color: var(--border-emphasis)`) + `UPLOAD` ghost button
- Table (virtualized for performance; use a simple `overflow-y: auto` scroll container, not a library):
  - Column headers: meta scale, `var(--text-tertiary)`, `border-bottom: 1px solid var(--border-subtle)`, `height: 36px`, sticky
  - Columns: `[ ]` checkbox | `FILENAME` (body, truncate at 36ch) | `TYPE` (badge) | `SIZE` | `VECTORS` (mono, `var(--status-active)` if indexed) | `INDEXED` (relative timestamp) | `STATUS` (pill badge) | `···` (action menu trigger)
  - Row height: `44px`, `border-bottom: 1px solid var(--border-subtle)`
  - Row hover: `background: var(--surface-overlay)`, transition `100ms ease`
  - Selected row: `background: var(--surface-overlay)`, `border-left: 2px solid var(--accent)`, uses `layoutId="selected-row"` — clicking a row opens the Inspector Panel
  - Status badges: `INDEXED` = green text + green `1px` border, `PROCESSING` = amber, `ERROR` = red, `QUEUED` = tertiary — `border-radius: 4px`, `padding: 2px 8px`, `font-size: 11px`, `font-weight: 500`, uppercase
  - Empty state: centered column, `var(--text-tertiary)`, `"No documents yet — upload a PDF to begin"`, + Upload CTA ghost button
  - Row entry animation: `stagger()` variant, each row uses `fadeUp`
- Footer bar (`h-10`, `border-top: 1px solid var(--border-subtle)`):
  - `var(--text-tertiary)`, meta scale: `"X documents · Y vectors indexed · Z MB stored"`

### Column 3 — Inspector Panel (`320px`, slides in/out)
- Shown when a table row is selected; hidden otherwise
- `border-left: 1px solid var(--border-subtle)`, `background: var(--surface-raised)`
- Entry animation: `slideFromRight` variant from `motion.js`, `AnimatePresence mode="wait"`
- Header: filename (H3, truncated), ✕ close button (`var(--text-tertiary)`)
- Content sections (each divided by `1px` rule):
  1. **Metadata grid** (2-col): SIZE, TYPE, UPLOADED, VECTORS, CHUNKS, STATUS — label in meta scale, value in body mono
  2. **AI Summary** (appears after 1.8s simulated load): label `DOCUMENT SUMMARY`, body text paragraph — show skeleton loader (`background: var(--surface-overlay)`, animated shimmer via `@keyframes shimmer`) while "loading"
  3. **Quick utilities**: three ghost buttons — `QUERY THIS DOCUMENT`, `COPY VECTOR ID`, `DELETE` (this one: `color: var(--status-error)`, `border-color: var(--status-error)` at `40% opacity` on hover)
  4. **Recent queries** (last 3 questions asked against this doc): each as a row with a `>` prefix in `var(--accent)`, clickable to re-run
- All sections fade in sequentially using `stagger(0.1, 0.08)`

---

## FILE 3 — `FileUpload.jsx`

### Dropzone States

**Default (idle):**
- `border: 1px dashed var(--border-default)`, `border-radius: 8px`, `padding: 40px 32px`
- Center column: upload icon (Lucide `Upload`, `20px`, `var(--text-tertiary)`) → `"Drop a PDF here"` (body, `var(--text-tertiary)`) → `"or click to browse"` (body, `var(--text-tertiary)`)
- No glow. No icon animation.

**Drag-active:**
- `border-color: var(--accent)`, `border-style: solid`
- `background: rgba(200, 241, 53, 0.04)` — the accent at 4% opacity, nothing more
- Text changes to `"Release to upload"` in `var(--text-primary)`
- Transition: `border-color 100ms ease, background 100ms ease`

**Processing (after drop):**
- Dropzone collapses to a compact progress track row (`height: 52px`, `border: 1px solid var(--border-default)`, `border-radius: 6px`, `padding: 0 16px`)
- Left: file icon (Lucide `FileText`, `16px`) + filename (body, truncated 32ch) + filesize (meta, `var(--text-tertiary)`)
- Right: status label (meta scale) cycling through `READING PDF` → `CHUNKING` → `EMBEDDING` → `INDEXING` — each stage transition uses `AnimatePresence mode="wait"` with a `12px` upward exit/entry `fadeUp` over `150ms`
- Below label: a `2px` height progress bar, `background: var(--border-subtle)`, inner fill `background: var(--accent)`, width animated with Framer Motion `animate={{ width: '${percent}%' }}` using `SPRING_SMOOTH`
- **No percentage number. No spinning indicator. No bouncing.**

**Success:**
- Row becomes: checkmark icon (Lucide `Check`, `16px`, `var(--status-active)`) + `"Indexed — 42 chunks stored"` (body, `var(--text-primary)`) + `QUERY NOW →` ghost button
- Entry: `fadeIn` variant, `150ms`

**Error:**
- Row becomes: alert icon (Lucide `AlertTriangle`, `16px`, `var(--status-error)`) + error message (body, `var(--text-primary)`) + `TRY AGAIN` ghost button

---

## FILE 4 — `ChatInterface.jsx` (Upgraded)

### Layout
- Full-height flex column within the parent container
- Header (`h-12`, `border-bottom: 1px solid var(--border-subtle)`):
  - Active document chip: `[FileText icon] filename.pdf ✕` — `background: var(--surface-overlay)`, `border: 1px solid var(--border-default)`, `border-radius: 4px`, `height: 26px`, `padding: 0 8px`, body scale. When no document: `"All documents"` in `var(--text-tertiary)` italics
  - Right: `CLEAR` ghost button (label scale, `var(--text-tertiary)`)
- Messages container: `overflow-y: auto`, custom scrollbar (`width: 4px`, `background: var(--border-subtle)`, thumb `var(--border-emphasis)`, `border-radius: 2px`)
- Bottom input bar (`border-top: 1px solid var(--border-subtle)`, `padding: 12px 16px`):
  - Textarea: `background: var(--surface-sunken)`, `border: 1px solid var(--border-subtle)`, focus `border-color: var(--border-emphasis)`, `border-radius: 6px`, `min-height: 44px`, auto-expands to `max-height: 140px`, mono font `13px`
  - Send button: `background: var(--accent)`, `color: var(--accent-text)`, `border-radius: 4px`, `height: 32px`, `width: 32px`, icon only (Lucide `ArrowUp`, `16px`) — `whileHover: { scale: 1.05 }`, `whileTap: { scale: 0.94 }`, spring: `SPRING_SNAPPY`

### Message Bubbles
- No bubble backgrounds — messages are rendered as plain text blocks with `padding: 16px 0` and `border-bottom: 1px solid var(--border-subtle)`
- User messages: right-aligned, `var(--text-primary)`, body scale, preceded by `YOU` label in meta scale
- AI messages: left-aligned, `var(--text-primary)`, body scale, preceded by `SECOND BRAIN` label in meta scale + `var(--accent)` accent dot (4px circle)
- Skeleton state (while AI is responding): two lines of `background: var(--surface-overlay)`, heights `14px` and `14px`, widths `80%` and `55%`, animated with `@keyframes shimmer`
- **No typing dots. No bubble tails. No user avatar circles.**
- Source citations: below AI message, horizontal row of chips: `[filename] — chunk X` — `background: var(--surface-raised)`, `border: 1px solid var(--border-subtle)`, `border-radius: 4px`, `font-size: 12px`, `font-family: mono`, `color: var(--text-tertiary)`. Hover: `border-color: var(--border-emphasis)`, `color: var(--text-secondary)`

---

## TAILWIND CONFIG — `tailwind.config.js`

Extend the default config to wire in the CSS variables:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: {
          base:    'var(--surface-base)',
          raised:  'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
          sunken:  'var(--surface-sunken)',
        },
        border: {
          subtle:   'var(--border-subtle)',
          default:  'var(--border-default)',
          emphasis: 'var(--border-emphasis)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          text:    'var(--accent-text)',
        },
        status: {
          active:  'var(--status-active)',
          pending: 'var(--status-pending)',
          error:   'var(--status-error)',
          idle:    'var(--status-idle)',
        },
      },
      borderWidth: { DEFAULT: '1px' },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
      },
    },
  },
  plugins: [],
};
```

---

## DELIVERY REQUIREMENTS

Produce the files in this exact order:

1. `src/lib/motion.js` — complete
2. `src/index.css` — complete (CSS custom properties + shimmer keyframe + scrollbar styles + Geist font import)
3. `tailwind.config.js` — complete
4. `src/pages/LandingPage.jsx` — complete, plan block first
5. `src/pages/Dashboard.jsx` — complete, plan block first
6. `src/components/FileUpload.jsx` — complete, plan block first
7. `src/components/ChatInterface.jsx` — complete, plan block first

For each file:
- Begin with `// PLAN: [filename]` block
- Then the complete file
- End with `// END: [filename]`

Do not produce any file in a truncated or summarized form. If a component is long, write it in full. If you cannot fit a complete file in one response, say `[CONTINUED]` and await a `CONTINUE` prompt before proceeding — do not abbreviate.

---

*End of prompt. Begin with FILE 1: `src/lib/motion.js`.*
