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
    massLabel: "~1.8 solar masses, packed into a ~20 km sphere",
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
];

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
    example: "GPS satellites' clocks run measurably faster than clocks on Earth's surface (weaker gravity up there) — the correction is applied in software, or the whole system would drift by kilometers per day.",
  },
  {
    id: "lensing",
    title: "Gravitational Lensing",
    description: "Light doesn't curve because gravity pulls on it — it follows the straightest possible path through curved spacetime itself, which looks like bending from the outside.",
    formula: "Deflection angle ≈ 4GM/(rc²)",
    example: "This exact formula's prediction — starlight grazing the Sun deflecting by about 1.75 arcseconds — was confirmed during the 1919 solar eclipse, the observation that made Einstein famous almost overnight.",
  },
  {
    id: "eventHorizon",
    title: "Event Horizon",
    description: "The boundary around a black hole beyond which nothing, not even light, has an escape path back out.",
    formula: "r_s = 2GM/c²  (Schwarzschild radius)",
    example: "For the Sun's actual mass, this works out to about 3 km — the Sun isn't a black hole, but if it were somehow compressed inside that radius, it would become one.",
  },
  {
    id: "geodesics",
    title: "Geodesics",
    description: "The paths free-falling objects follow through curved spacetime — the closest thing to \"a straight line\" that curved geometry allows.",
    formula: "d²xᵘ/dλ² + Γᵘ_να (dxᵛ/dλ)(dxᵃ/dλ) = 0",
    example: "A planet's elliptical orbit isn't a force bending its path — in this view, it's the planet moving in as straight a line as the Sun's curved spacetime allows.",
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
];

export const SPACETIME_SOURCES = [
  "Time dilation, lensing deflection, and Schwarzschild radius formulas — standard general relativity (Schwarzschild metric), cross-checked against multiple physics references",
  "Neutron star mass range (~1.1–2.5 solar masses) and stellar black hole minimum (~5 solar masses) — Science.org and UBC News coverage of the observed \"mass gap\" between the two",
  "1919 eclipse deflection measurement (~1.75 arcseconds, matching GR's prediction) — standard history-of-physics account of the Eddington expedition",
  "GPS relativistic correction (general-relativistic effect dominates over special-relativistic) — standard geodesy/GPS references",
];
