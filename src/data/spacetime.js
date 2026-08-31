// Spacetime Fabric Explorer — checked against real GR before publishing
// rather than trusting the request's numbers/formulas as given. Two
// real problems found and fixed:
//
// - The "geodesic equation" given, ∇²x^μ = 0, isn't the geodesic
//   equation at all — that notation reads as a Laplace/harmonic
//   equation, not general relativity's actual equation of motion for a
//   free-falling object. The real geodesic equation is
//   d²x^μ/dλ² + Γ^μ_να (dx^ν/dλ)(dx^α/dλ) = 0, where Γ (the Christoffel
//   symbols) encode how the metric — spacetime's curvature — varies
//   from point to point. Corrected below, and simplified in the UI to
//   "curved-path motion with no external force," which is the accurate
//   plain-English version, rather than presenting a wrong formula.
// - The black hole mass (1,000,000 Earth masses ≈ 3 solar masses) sits
//   inside the observed neutron-star/black-hole "mass gap": the
//   heaviest confirmed neutron stars run up to ~2.5 solar masses, and
//   essentially no confirmed black hole is lighter than ~5 solar
//   masses. A 3-solar-mass example undersells what "stellar black
//   hole" actually means. Bumped to a comfortably typical ~10 solar
//   masses. The neutron star figure (600,000 Earth masses ≈ 1.8 solar
//   masses) checked out fine as-is — real neutron stars run
//   ~1.1–2.5 solar masses.
//
// The object *sizes* below are NOT to real physical scale and are
// labeled as such in the UI — a real neutron star (~20 km across) or
// stellar black hole's event horizon (~30-90 km) is thousands of times
// smaller than Earth, not larger. Rendering them at real relative size
// would make them invisible dots; sized here for visibility instead,
// same convention as NASA's own solar-system diagrams ("not to scale").
export const EARTH_MASS_KG = 5.972e24;
export const SOLAR_MASS_IN_EARTH_MASSES = 333000; // Sun ≈ 332,946 Earth masses

// Real Schwarzschild radii (r_s = 2GM/c²), computed from each object's
// own massEarth above — not copied from anywhere, since an earlier
// draft's radii turned out to be inconsistent with its own stated
// masses (recomputing them independently is exactly what caught that).
// Used by "Real Physics" mode below.
function schwarzschildRadiusKm(massEarth) {
  const G = 6.674e-11;
  const c = 2.998e8;
  const massKg = massEarth * EARTH_MASS_KG;
  return (2 * G * massKg) / (c * c) / 1000;
}

export const MASS_OBJECTS = [
  {
    id: "earth",
    name: "Earth",
    massEarth: 1,
    massLabel: "1 Earth mass",
    color: "#4a90e2",
    size: 0.5,
    description: "A gentle dimple — the curvature you feel every day as ordinary gravity.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    massEarth: 318,
    massLabel: "318 Earth masses",
    color: "#f5a623",
    size: 1.1,
    description: "Noticeably deeper — enough to hold dozens of moons in orbit.",
  },
  {
    id: "sun",
    name: "The Sun",
    massEarth: SOLAR_MASS_IN_EARTH_MASSES,
    massLabel: "~333,000 Earth masses (1 solar mass)",
    color: "#f8e71c",
    size: 2.2,
    description: "A deep, wide well — this is the curvature that holds the whole solar system in orbit.",
  },
  {
    id: "neutronstar",
    name: "Neutron Star",
    massEarth: 1.8 * SOLAR_MASS_IN_EARTH_MASSES,
    massLabel: "~1.8 solar masses, packed into a ~20-24 km sphere",
    color: "#c9a6ff",
    size: 0.9,
    description: "Comparable mass to the Sun, but city-sized — real neutron stars are far smaller than shown here (see the scale note).",
  },
  {
    id: "blackhole",
    name: "Black Hole (Stellar)",
    massEarth: 10 * SOLAR_MASS_IN_EARTH_MASSES,
    massLabel: "~10 solar masses",
    color: "#ffffff",
    size: 0.7,
    description: "Curvature so extreme that within the event horizon, nothing — not even light — can climb back out.",
  },
].map((obj) => ({ ...obj, schwarzschildRadiusKm: schwarzschildRadiusKm(obj.massEarth) }));

// Real Physics mode's unit conversion, disclosed rather than hidden:
// 1 scene unit ≈ this many real kilometers. Chosen so the black hole's
// real ~29.5 km Schwarzschild radius reads as a real, visible feature
// (~1 scene unit) — at that same scale, Earth's real 8.9 mm radius is
// roughly 3 million times smaller than one grid cell, which is the
// entire point of the mode: real everyday gravity's curvature is not
// remotely visible at any scale where a black hole's curvature is.
export const KM_PER_SCENE_UNIT = 30;

// Presets reuse MASS_OBJECTS by id; positions are world units in the
// scene, not real astronomical distances (same "stylized, not to
// scale" honesty as the sizes above).
export const PRESETS = [
  { name: "Single Earth", objects: [{ id: "earth", x: 0, z: 0 }] },
  { name: "Sun & Earth", objects: [{ id: "sun", x: 0, z: 0 }, { id: "earth", x: 9, z: 0 }] },
  { name: "Jupiter & Sun", objects: [{ id: "sun", x: -6, z: 0 }, { id: "jupiter", x: 6, z: 0 }] },
  { name: "Neutron Star", objects: [{ id: "neutronstar", x: 0, z: 0 }] },
  { name: "Black Hole", objects: [{ id: "blackhole", x: 0, z: 0 }] },
];

export const PHENOMENA = [
  {
    id: "timeDilation",
    title: "Time Dilation",
    description: "Clocks run slower the deeper they sit in a gravitational well.",
    formula: "t′ = t · √(1 − 2GM/rc²)",
    example:
      "GPS satellites' clocks run measurably faster than clocks on Earth's surface (weaker gravity up there) — the correction is applied in software, or the whole system would drift by kilometers per day.",
    realWorld:
      "GPS satellites orbit at ~20,200 km altitude. Weaker gravity up there speeds their clocks up by ~45.7 microseconds/day (general relativity); their ~14,000 km/h orbital speed slows them by ~7.2 microseconds/day (special relativity, a separate effect). The two don't cancel — the net drift is ~38 microseconds/day, which would compound into roughly 10 km of position error per day if it weren't corrected for in the satellites' broadcast signal.",
  },
  {
    id: "lensing",
    title: "Gravitational Lensing",
    description: "Light doesn't curve because gravity pulls on it — it follows the straightest possible path through curved spacetime itself, which looks like bending from the outside.",
    formula: "Deflection angle ≈ 4GM/(rc²)",
    example:
      "This exact formula's prediction — starlight grazing the Sun deflecting by about 1.75 arcseconds — was confirmed during the 1919 solar eclipse, the observation that made Einstein famous almost overnight.",
    realWorld:
      "During a total solar eclipse, the Moon blocks the Sun's glare enough to photograph stars that appear very close to it in the sky. Arthur Eddington's 1919 expedition compared those positions to the same stars' normal positions (photographed months earlier, Sun elsewhere in the sky) and found them shifted by very close to the predicted 1.75 arcseconds — not the different value Newtonian gravity alone would predict.",
  },
  {
    id: "eventHorizon",
    title: "Event Horizon",
    description: "The boundary around a black hole beyond which nothing, not even light, has an escape path back out.",
    formula: "r_s = 2GM/c²  (Schwarzschild radius)",
    example:
      "For the Sun's actual mass, this works out to about 3 km — the Sun isn't a black hole, but if it were somehow compressed inside that radius, it would become one.",
    realWorld:
      "Real Schwarzschild radii, computed from this page's own object masses: Earth ≈ 8.9 mm, Jupiter ≈ 2.8 m, the Sun ≈ 2.95 km, a ~1.8-solar-mass neutron star ≈ 5.3 km, a 10-solar-mass black hole ≈ 29.5 km. None of these objects except the black hole are actually smaller than their own Schwarzschild radius — which is exactly why only the black hole is one.",
  },
  {
    id: "geodesics",
    title: "Geodesics",
    description: "The paths free-falling objects follow through curved spacetime — the closest thing to \"a straight line\" that curved geometry allows.",
    formula: "d²xᵘ/dλ² + Γᵘ_να (dxᵛ/dλ)(dxᵃ/dλ) = 0",
    example:
      "A planet's elliptical orbit isn't a force bending its path — in this view, it's the planet moving in as straight a line as the Sun's curved spacetime allows.",
    realWorld:
      "Mercury's orbit doesn't quite close on itself — its closest point to the Sun (perihelion) slowly rotates, by about 43 arcseconds per century more than Newtonian gravity (accounting for the other planets' pull) could explain. Solving the geodesic equation in the Sun's curved spacetime predicts exactly that leftover 43 arcseconds — one of general relativity's first real confirmations, years before the 1919 eclipse.",
  },
];

// "Learn" section — the same content pitched at three levels, each
// checked against a real source rather than trusted as given. Two real
// corrections made along the way: the Einstein field equation as
// originally drafted (Gμν = 8πTμν) omitted the G/c⁴ coupling constant
// entirely, which is only valid in "geometrized units" (G=c=1) — stated
// here as the general form, with that simplification named explicitly
// rather than silently presented as if it were the whole story. And the
// Hafele-Keating result was drafted as "clocks ran slower," true only
// for the eastward flight (-59ns) — the westward flight's clocks
// actually ran faster (+273ns), which is the more interesting result
// since it's the one where gravity's time-speeding effect (weaker at
// altitude) outweighs velocity's time-slowing effect.
export const EXPLAINABLE_SECTIONS = [
  {
    id: "whatIsSpacetime",
    title: "What is spacetime?",
    level: "Beginner",
    paragraphs: [
      "Before Einstein, space (three dimensions you move through) and time (one dimension you move forward through, whether you like it or not) were treated as completely separate things.",
      "Einstein's general relativity unifies them into one four-dimensional fabric: spacetime. And that fabric isn't rigid — it bends.",
      "The classic analogy: picture a stretched rubber sheet. Set a bowling ball on it, and the sheet dips around it. Roll a marble nearby, and it curves toward the bowling ball — not because the ball is reaching out and pulling it, but because the marble is just following the curve of the sheet it's rolling on.",
      "That's the core idea of general relativity: gravity isn't a force reaching out across space. It's the shape of spacetime itself, and everything — planets, light, you — simply follows the straightest path that shape allows.",
    ],
  },
  {
    id: "whyMassCurves",
    title: "Why does mass curve spacetime?",
    level: "Intermediate",
    paragraphs: [
      "Mass and energy are two forms of the same thing (E = mc²) — and Einstein's field equations say that whatever mass-energy is present tells spacetime exactly how to curve.",
      "In its general form: Gμν = (8πG/c⁴) · Tμν. The left side (Gμν) describes spacetime's curvature at a point; the right side (Tμν) describes the mass and energy present there. G and c⁴ are just unit-conversion constants — in the convenient \"geometrized units\" physicists often use for this equation (setting G = c = 1), it simplifies to the more commonly quoted Gμν = 8πTμν.",
      "More mass in a smaller volume means more curvature, and it falls off with distance. A kilogram of anything curves spacetime by an amount no instrument could ever measure. Earth's whole mass (~6×10²⁴ kg) curves it just enough to be what you feel as ordinary gravity. The Sun's mass (~2×10³⁰ kg) curves it enough to hold every planet in orbit. Compress a few solar masses into a city-sized sphere — a neutron star, or further still, a black hole — and the curvature becomes extreme.",
    ],
  },
  {
    id: "twoModes",
    title: "Why this page has two physics modes",
    level: "Intermediate",
    paragraphs: [
      "Educational mode (the default) exaggerates curvature so every object visibly dents the grid — useful for building intuition, but not a quantitatively accurate picture.",
      "Real Physics mode instead uses each object's actual Schwarzschild radius — computed from its real mass, not a stylized number — to shape the grid the same way physicists actually draw it (an embedding diagram). At real scale, Earth's curvature is so far below the Sun's or a black hole's that it reads as flat. That's not a bug in the visualization — it's the actual, humbling scale of everyday gravity next to the objects that dominate a galaxy.",
      "Switch between the two on the same object to see both things at once: the principle (educational mode) and the real, wildly uneven scale of it (real physics mode).",
    ],
  },
  {
    id: "provenPredictions",
    title: "How we know this is actually true",
    level: "Intermediate",
    paragraphs: [
      "General relativity isn't just an elegant idea — it's made specific, testable predictions that turned out to be correct, several of them decades before we had the technology to fully exploit them.",
      "1919: Arthur Eddington's solar eclipse expedition measured starlight bending by the Sun by very close to Einstein's predicted 1.75 arcseconds — the moment that made him a household name.",
      "1971: the Hafele-Keating experiment flew atomic clocks around the world on commercial flights, once eastward and once westward, and compared them to a stationary reference clock. Two competing effects were in play — the flight's speed slows a clock down, while its cruising altitude (weaker gravity) speeds it up. Eastward, the plane's ground speed added to Earth's own rotation, so the speed effect dominated and that clock lost about 59 nanoseconds. Westward, it worked the other way, and the altitude effect dominated — that clock gained about 273 nanoseconds. Both results matched theory.",
      "1980s–today: GPS satellites need exactly this same math running continuously, or the whole system would be useless within a day (see the Time Dilation phenomenon card above for the real numbers).",
      "2015: LIGO directly detected gravitational waves — ripples in spacetime itself — from two black holes merging over a billion light-years away, exactly a century after Einstein predicted they should exist. The 2017 Nobel Prize in Physics went to the discovery.",
      "2019: the Event Horizon Telescope produced the first actual image of a black hole's shadow (M87*) — its size matched general relativity's prediction from the galaxy's independently-measured mass.",
    ],
  },
];

export const KEY_FACTS = [
  "Einstein's reframing: gravity isn't a force pulling objects together — it's the geometry of spacetime itself, curved by mass and energy.",
  "Anything with mass or energy curves the spacetime around it, however slightly.",
  "Light has no mass, but it still follows spacetime's curves — which is why gravity can bend starlight.",
  "Time runs measurably slower in stronger gravity — a real, verified effect, not just theory.",
  "GPS wouldn't work without correcting for exactly this: satellite clocks run fast (weaker gravity) enough to matter within a single day.",
  "At a black hole's central singularity, general relativity's equations predict infinite curvature — a signal that the theory itself breaks down there, where a real theory of quantum gravity would need to take over.",
  "Einstein predicted starlight bending around the Sun in 1915; Arthur Eddington's team measured it during the 1919 solar eclipse, and the result matched — the observation that turned general relativity from theory into confirmed physics.",
  "A black hole with Earth's actual mass would have a Schwarzschild radius smaller than a marble — Earth itself, of course, is nowhere near compressed enough to be one.",
  "Gravitational waves — real ripples in spacetime itself, from two black holes spiraling together — were directly detected for the first time in 2015, a century after Einstein predicted they should exist.",
];

export const SPACETIME_SOURCES = [
  "Time dilation, lensing deflection, geodesic, and Schwarzschild radius formulas — standard general relativity (Schwarzschild metric), cross-checked against multiple physics references",
  "Neutron star mass range (~1.1–2.5 solar masses) and stellar black hole minimum (~5 solar masses) — Science.org and UBC News coverage of the observed \"mass gap\" between the two",
  "1919 eclipse deflection measurement (~1.75 arcseconds, matching GR's prediction) — standard history-of-physics account of the Eddington expedition",
  "GPS relativistic correction (45.7μs/day GR gain, 7.2μs/day SR loss, ~38μs/day net, ~10 km/day uncorrected error) — Ohio State \"Real-World Relativity\" and GPS World coverage",
  "Hafele-Keating 1971 results (eastward −59ns, westward +273ns) — Science (1972) via USNO's 50th-anniversary summary",
  "Mercury perihelion precession (~43 arcsec/century unexplained by Newtonian gravity, matched by GR) — standard history-of-physics account",
  "Einstein field equations, general form with G/c⁴ — standard GR references (geometrized-units simplification noted explicitly, not presented as the general form)",
];
