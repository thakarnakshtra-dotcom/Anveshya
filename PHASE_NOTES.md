# Phase Notes

## Phase 4 checkpoint — SolarShield live dashboard LOCKED (2026-08-30)

SolarShield (`src/pages/SolarShield.jsx`) was rebuilt from a value-prop
placeholder into a live dashboard backed by a real Netlify Function
(`netlify/functions/solarshield.js`) that aggregates four NOAA SWPC feeds
(real-time magnetometer, real-time solar wind, planetary K-index, alerts)
into one risk-scored JSON payload, cached 15 minutes per warm function
container. **This page is locked per explicit instruction — no changes
until v2** without a new direct request to touch it.

One field, `ml_storm_probability`, is a transparent heuristic (base rate +
Kp + southward-Bz bonus + high-speed-wind bonus) computed from the same
real inputs — there is no free public trained ML storm model to call, so
it is labeled "Storm Likelihood (Heuristic)" on the page, not presented as
an ML forecast. Everything else traces directly to a live NOAA reading.

`vite.config.js` gained a dev-only middleware so `npm run dev` serves
`/.netlify/functions/solarshield` in-process (no Netlify CLI needed
locally); production uses Netlify's own function runtime via
`netlify.toml`.

## Phase 5 checkpoint — Learn modular rebuild complete (2026-08-30)

Completed in the prior restructure pass: Learn now has four pill tabs
(Images & Videos, Audio, Missions, Organizations) matching Explorer's
scale-toggle design system. All agency data fetches and video/audio embeds
were verified working, both locally and on the deployed Netlify site.

## Phase 6 — Explorer polish (not yet started)

Still open: finalize the expanded planet info view's transitions, and a
further pass testing every planet/moon selection path. The expanded view
itself (image, quick stats, Physical Data/Atmosphere/Exploration/
Discovery/Moons sections, Know More link) was built and verified in the
prior restructure pass — this phase is about polish, not the base feature.

## Prior update — Major restructure pass (2026-08-30)

The Phase 3 lock below (Home/About/News locked) was **explicitly overridden
by direct request** in that pass: the black-hole intro was simplified back
down, and About was fully rewritten with real founder content. Treat the
Phase 3 lock as historical context, not current status.

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
