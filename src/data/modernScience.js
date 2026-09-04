// Modern Space Science topics for Learn. Same standard as
// data/ancientAstronomy.js: every claim sourced, nothing invented.
//
// Only General Relativity is written up in full this pass — its content
// is adapted from data/spacetime.js's own already-verified material (the
// Spacetime Fabric Explorer's "Learn" section and phenomena cards, built
// and fact-checked in an earlier session), not re-derived from scratch,
// so it carries the same sourcing rather than a second, independent pass
// at the same physics. The other four theories are marked coming-soon
// rather than filled in with an under-researched rush job two days
// before launch — same honesty this file's sibling already applies to
// its own coming-soon topics (Sūrya Siddhānta & Orbital Mechanics,
// Saptarshi).

export const modernScienceTopics = [
  {
    id: "general-relativity",
    status: "full",
    kicker: "1915",
    title: "General Relativity",
    knownBy: "Albert Einstein",
    whatIsIt:
      "Before Einstein, space and time were treated as separate, fixed backdrops that things simply moved through. General relativity unifies them into one four-dimensional fabric — spacetime — and says that fabric isn't rigid: mass and energy bend it, the way a bowling ball dips a stretched rubber sheet. Gravity, in this view, isn't a force reaching out across space. It's the shape of spacetime itself, and everything — planets, light, you — simply follows the straightest path that shape allows.",
    whyItMatters:
      "It's the working theory of gravity for anything large or dense enough for Newton's older version to fall measurably short: GPS satellites, black holes, the expansion of the universe, and the orbits of planets close to the Sun all need it to get the numbers right.",
    formula: "Gμν = (8πG/c⁴) · Tμν",
    formulaNote:
      "The Einstein field equations. Gμν (left) describes spacetime's curvature at a point; Tμν (right) describes the mass and energy present there — G and c⁴ are just unit-conversion constants. In the \"geometrized units\" physicists often use for this equation (setting G = c = 1), it simplifies to the more commonly quoted Gμν = 8πTμν — a simplification, not a different equation.",
    keyFacts: [
      "Time runs measurably slower in stronger gravity — a real, verified effect, not just theory.",
      "GPS satellites' clocks run about 38 microseconds/day faster than clocks on Earth's surface (net of two competing relativistic effects) — without correcting for it, GPS positions would drift by roughly 10 km/day.",
      "Mercury's orbit doesn't quite close on itself — its closest point to the Sun rotates by about 43 arcseconds/century more than Newtonian gravity alone predicts. General relativity's equations predict that exact leftover.",
      "At a black hole's central singularity, the equations predict infinite curvature — a sign the theory itself breaks down there, where a real theory of quantum gravity would need to take over.",
    ],
    provenPredictions: [
      "1919: Arthur Eddington's solar eclipse expedition measured starlight bending around the Sun by very close to Einstein's predicted 1.75 arcseconds — the observation that made him a household name almost overnight.",
      "1971: the Hafele-Keating experiment flew atomic clocks around the world on commercial flights, once eastward and once westward, against a stationary reference clock. Two competing relativistic effects were in play — the flight's speed slows a clock, its cruising altitude (weaker gravity) speeds it up. Eastward, the speed effect dominated and that clock lost about 59 nanoseconds; westward, the altitude effect dominated and that clock gained about 273 nanoseconds. Both results matched theory.",
      "2015: LIGO directly detected gravitational waves — ripples in spacetime itself — from two black holes merging over a billion light-years away, exactly a century after Einstein predicted they should exist. The 2017 Nobel Prize in Physics went to the discovery.",
      "2019: the Event Horizon Telescope produced the first actual image of a black hole's shadow (M87*) — its size matched general relativity's prediction from the galaxy's independently-measured mass.",
    ],
    seeMore: { label: "See real vs. educational curvature live in the Spacetime Fabric Explorer", to: "/explorer?section=spacetime" },
    sources: [
      "Time dilation, lensing deflection, and Schwarzschild radius formulas — standard general relativity (Schwarzschild metric), cross-checked against multiple physics references",
      "GPS relativistic correction (45.7μs/day GR gain, 7.2μs/day SR loss, ~38μs/day net, ~10 km/day uncorrected error) — Ohio State \"Real-World Relativity\" and GPS World coverage",
      "Hafele-Keating 1971 results (eastward −59ns, westward +273ns) — Science (1972) via USNO's 50th-anniversary summary",
      "Mercury perihelion precession (~43 arcsec/century unexplained by Newtonian gravity, matched by GR) — standard history-of-physics account",
      "1919 eclipse deflection measurement (~1.75 arcseconds) — standard history-of-physics account of the Eddington expedition",
      "LIGO 2015 detection and 2017 Nobel Prize; Event Horizon Telescope 2019 M87* image — public record",
    ],
  },
  {
    id: "black-holes",
    status: "full",
    kicker: "1916 (predicted) – present",
    title: "Black Holes & Event Horizons",
    knownBy: "Karl Schwarzschild (1916 solution); Stephen Hawking (Hawking radiation, 1974); the Event Horizon Telescope collaboration (2019, 2022 images)",
    whatIsIt:
      "A black hole forms when enough mass collapses into a small enough region that not even light can escape it — the endpoint of a massive star's core collapsing past the point where any known force can hold it up. The event horizon is the boundary of that region: not a physical surface, but the point where spacetime itself is curved so sharply that every future-pointing path, including light's, leads inward. Cross it, and there is no path back out, in either direction.",
    whyItMatters:
      "Black holes are the most extreme environment general relativity actually describes and the best real testing ground for it — strong enough gravity that Newtonian physics gives obviously wrong answers, and (at their very center) a genuine breakdown of general relativity itself, which is exactly why they're where physicists look for clues about how gravity and quantum mechanics might fit together.",
    formula: "r_s = 2GM/c²",
    formulaNote:
      "The Schwarzschild radius — the same formula already used elsewhere on this site's Spacetime Fabric Explorer. For a given mass M, it's the radius at which that mass's event horizon would sit. It isn't about \"escape velocity exceeding light speed\" (a common but technically loose way to put it, borrowed from Newtonian physics) — the real reason is that inside r_s, spacetime's curvature is severe enough that every direction that used to point \"outward\" now points further in.",
    keyFacts: [
      "Real Schwarzschild radii, computed from real mass: Earth ≈ 8.9 mm, the Sun ≈ 2.95 km, a 10-solar-mass stellar black hole ≈ 29.5 km. None of the first two are remotely close to actually being compressed that small — only an actual black hole is smaller than its own Schwarzschild radius.",
      "At the singularity predicted at a black hole's center, general relativity's equations give infinite curvature — the theory's own signal that it breaks down there, not a literal claim that infinite density is physically real. A working theory of quantum gravity would need to describe what actually happens.",
      "Hawking radiation — black holes very slowly losing mass via quantum effects near the event horizon — is a real, widely-accepted theoretical prediction (Stephen Hawking, 1974), but it's never been directly observed: for a stellar-mass black hole, it's predicted to be far too faint to detect with any existing instrument.",
      "The black hole information paradox — what happens to the information carried by everything that ever fell in, once the black hole eventually evaporates — is a genuinely open, actively debated problem in theoretical physics, not a settled one.",
    ],
    provenPredictions: [
      "2015: LIGO's first direct detection of gravitational waves came from two black holes merging — the clearest confirmation that binary black holes, and black holes generally, are real physical objects and not just a mathematical curiosity.",
      "2019: the Event Horizon Telescope released the first-ever direct image of a black hole's shadow — M87*, the supermassive black hole at the center of the galaxy Messier 87 — matching general relativity's predicted size for its independently-measured mass.",
      "2022: the same collaboration released a second image, this time of Sagittarius A* — the supermassive black hole at the center of our own galaxy, the Milky Way — confirming the same result far closer to home.",
    ],
    seeMore: { label: "See a black hole's real event horizon live in the Spacetime Fabric Explorer", to: "/explorer?section=spacetime" },
    sources: [
      "Schwarzschild radius formula and computed values — same source as this site's General Relativity entry and Spacetime Fabric Explorer (data/spacetime.js)",
      "Hawking radiation — S. Hawking, \"Black hole explosions?\", Nature, 1974",
      "LIGO 2015 first detection (GW150914) — public record, LIGO Scientific Collaboration",
      "Event Horizon Telescope M87* image, 2019, and Sagittarius A* image, 2022 — Event Horizon Telescope Collaboration public announcements",
      "Black hole information paradox as an open problem — standard modern-physics reference summaries",
    ],
  },
  { id: "quantum-mechanics", status: "coming-soon", kicker: "Coming soon", title: "Quantum Mechanics" },
  { id: "dark-matter-energy", status: "coming-soon", kicker: "Coming soon", title: "Dark Matter & Dark Energy" },
  { id: "cosmic-inflation", status: "coming-soon", kicker: "Coming soon", title: "Cosmic Inflation" },
  { id: "exoplanet-atmospheres", status: "coming-soon", kicker: "Coming soon", title: "Exoplanet Atmospheres" },
];
