# Phase Notes

## Update — Major restructure pass (2026-08-30)

The Phase 3 lock below (Home/About/News locked) was **explicitly overridden
by direct request** this pass: the black-hole intro was simplified back
down, and About was fully rewritten with real founder content. Treat the
Phase 3 lock as historical context, not current status — **nothing is
locked right now** unless a future note says so explicitly.

## Priority sequencing for upcoming phases

- **Phase 4 (next)** — Build out SolarShield fully: live Kp-index data,
  a real risk score, and a visual representation of space-weather
  intelligence. It currently is a value-prop/explainer page only, no live
  data.
- **Phase 5** — Finish the Learn page's modular tab rebuild: confirm every
  agency's data fetches correctly, and that video/audio embeds all play
  without errors.
- **Phase 6** — Polish Explorer: finalize the expanded planet info view,
  smooth its transitions, and test every planet/moon selection path.

## Phase 3 checkpoint — Landing page content locked (2026-08-29, superseded above)

As of Phase 3, the following pages and top-level design decisions were
marked final and locked. **This is no longer in effect** — see the update
above.

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
nothing to "lock" there.
