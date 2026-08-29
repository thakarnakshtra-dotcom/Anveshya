# Phase Notes

## Phase 3 checkpoint — Landing page content locked (2026-08-29)

As of Phase 3, the following pages and top-level design decisions are
**confirmed final and locked**. Phase 4 and beyond should not edit these
without an explicit new request:

- **Home** (`src/pages/Home.jsx`) — hero, "By The Numbers" stats,
  Modules grid, footer, and the black-hole hero visual (including its
  depth-layer half-ring).
- **About** (`src/pages/About.jsx`)
- **News** (`src/pages/News.jsx`) — Latest Updates / Upcoming Events tabs.
- **Top-level design system** — palette, Archivo/JetBrains Mono typography,
  Navbar structure, and the shared `AmbientBackground` component's
  positioning on Home.

**Contact does not exist as a page or route yet.** It was named in the
original sitemap but was never built in any prior phase — there is
nothing to "lock" there. If Phase 4 needs it, that's new work, not an
edit to locked content.

Explorer (`src/pages/Explorer.jsx`) and the Learn section
(`src/pages/Learn.jsx`, `src/pages/PlanetDetail.jsx`,
`src/pages/SoundsOfSpace.jsx`) are **not** covered by this lock — they're
still active development areas per the ongoing phase work.
