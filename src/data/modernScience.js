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
  { id: "quantum-mechanics", status: "coming-soon", kicker: "Coming soon", title: "Quantum Mechanics" },
  { id: "dark-matter-energy", status: "coming-soon", kicker: "Coming soon", title: "Dark Matter & Dark Energy" },
  { id: "cosmic-inflation", status: "coming-soon", kicker: "Coming soon", title: "Cosmic Inflation" },
  { id: "exoplanet-atmospheres", status: "coming-soon", kicker: "Coming soon", title: "Exoplanet Atmospheres" },
];
