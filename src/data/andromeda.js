// Andromeda Galaxy (M31) facts. Re-checked for this pass (distance,
// mass, discovery, naked-eye claim) rather than trusting the request's
// numbers as given — see notes below for what changed and why.
//
// The galaxy in the 3D scene is now generated procedurally (spiral-arm
// point cloud), not a photo mapped onto a plane — which means there's
// no longer a real photograph "of" what's on screen to misrepresent,
// but it also means the 3D view is a stylized approximation, not an
// accurate reconstruction of M31's real structure. That's exactly why
// a real photograph belongs in the info panel: see panelImage below.
export const ANDROMEDA_DATA = {
  name: "Andromeda Galaxy",
  designation: "Messier 31 (M31)",
  // 2.537 million ly (±37,000 ly) is the modern Gaia/Hubble-refined
  // figure cited as current consensus as of 2024 — more precise than
  // this project's earlier "~2.5 million," which was a safe rounding
  // rather than wrong, but this is the better number to show now that
  // it's been checked.
  distanceLightYears: 2.537e6,
  distanceLabel: "~2.537 million light-years (±37,000 ly)",
  diameterLightYears: 220000,
  diameterLabel: "~220,000 light-years (estimates range ~200,000–260,000)",
  stars: "~1 trillion",
  milkyWayStars: "~100–400 billion",
  // Total mass is genuinely, substantially disputed — recent published
  // estimates range from about 450 billion solar masses (a 2025
  // dynamical-modeling result, revised down because M31 suffered a
  // major collision ~2.5 billion years ago) up to roughly 2 trillion
  // (a machine-learning cosmological estimate), with other methods
  // landing around 800 billion. Shown as a range with the dispute
  // named explicitly, rather than picking one number and implying it's
  // settled — the same standard this project holds other contested
  // figures to elsewhere.
  massSolarLabel: "~450 billion – 2 trillion solar masses",
  massDisputeNote:
    "That's an unusually wide range even for astronomy — recent estimates disagree substantially, partly because a major collision M31 suffered ~2.5 billion years ago complicates dynamical mass measurements.",
  blackHoleMassSolar: "~140 million",
  type: "Spiral galaxy (Sb)",
  closingSpeed: "~110 km/s toward the Milky Way",
  collisionTime: "~4–4.5 billion years from now",
  collisionResultName: "“Milkomeda” — an informal name used in popular science for the merged galaxy",
  discoveryLabel: "c. 964 CE",
  discoveryNote:
    "Persian astronomer 'Abd al-Rahman al-Sufi described it as a “little cloud” in his Book of Fixed Stars — the first known written record of a galaxy beyond the Milky Way.",
  nakedEyeNote:
    "The most easily seen spiral galaxy with the naked eye — Triangulum (M33) is technically visible too, but only under exceptionally dark skies.",
  // A real Hubble mosaic (the PHAT team's 2015 high-resolution
  // panorama), not the GALEX ultraviolet composite this project used
  // previously — that one was a genuine, correctly-credited NASA image,
  // but calling it "Hubble" would have been wrong. This one is
  // confirmed Hubble: credit line pulled directly from the file's own
  // Wikimedia Commons page. Used only as a plain <img> in the info
  // panel now (the 3D scene no longer textures anything), so the
  // earlier CORS-for-WebGL problem doesn't apply here.
  panelImageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Andromeda_Galaxy_M31_-_Heic1502a_10k.jpg/1280px-Andromeda_Galaxy_M31_-_Heic1502a_10k.jpg",
  panelImageCredit: "NASA, ESA, J. Dalcanton, B.F. Williams, L.C. Johnson (PHAT team) — Hubble Space Telescope, 2015",
};

export const MILKY_WAY_DIAMETER_LIGHT_YEARS = 100000; // traditional, commonly-cited figure; some recent estimates run larger

export const ANDROMEDA_SOURCES = [
  "NASA Science — “Crash of the Titans: Andromeda Galaxy and the Milky Way Collision”",
  "earthsky.org — “The Andromeda Galaxy: All you need to know”",
  "Distance (2.537M ly): current Gaia/Hubble-refined consensus figure, cross-checked across multiple 2024 summaries",
  "Total mass range: Observatoire de Paris (450B, 2025 dynamical modeling) and a separate ML/ΛCDM estimate (~2.01 trillion) — the two ends of a genuinely disputed figure",
  "Black hole mass: (1.4 ± 0.5) × 10⁸ solar masses, cross-checked via recent (2025) X-ray observation summaries",
  "Discovery: Wikipedia, \"Abd al-Rahman al-Sufi\" and \"The Book of Fixed Stars\"",
  "Milky Way star count: ESA / NASA Blueshift, commonly-cited 100–400 billion range",
];

export const ANDROMEDA_LEARN_MORE_URL =
  "https://science.nasa.gov/asset/hubble/crash-of-the-titans-andromeda-galaxy-and-the-milky-way-collision/";

// Simplified, clearly-labeled *illustrative* timeline, not a physics
// simulation — real merger simulations exist (NASA's own SVS #11011,
// among others) but reproducing one isn't in scope here. Years are the
// commonly-cited milestones from the sources above.
export const COLLISION_TIMELINE = [
  { yearsFromNow: 0, label: "Today", note: "Andromeda is approaching at ~110 km/s, still 2.5 million light-years away." },
  { yearsFromNow: 2e9, label: "~2 billion years", note: "Andromeda looms larger in the night sky as the gap closes." },
  { yearsFromNow: 4e9, label: "~4 billion years", note: "First close pass — tidal forces begin distorting both galaxies' spiral arms." },
  { yearsFromNow: 4.5e9, label: "~4.5 billion years", note: "The galaxies interpenetrate. Stars themselves are so far apart that direct collisions are rare." },
  { yearsFromNow: 6e9, label: "~6 billion years", note: "The two settle into a single merged galaxy — informally “Milkomeda.”" },
];
