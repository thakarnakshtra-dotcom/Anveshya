// Andromeda Galaxy (M31) facts, checked against NASA/earthsky.org/Britannica
// and a dedicated black-hole-mass search rather than taken from the
// request as given — two of the four supplied image URLs turned out to
// be non-image search/webpage links (same problem as the nakshatra
// wheel's imageUrl fields), and the primary "Hubble" image URL 404'd
// outright. The real image below was found via Wikimedia's own stable
// Special:FilePath redirect and visually confirmed (a real M31 mosaic,
// companion galaxy visible in frame) before use.
//
// Deliberately left off "total mass" — unlike distance, star count, or
// black hole mass, total mass estimates (which depend heavily on how
// much dark matter halo is included) vary widely by study and are a
// genuinely live area of research; recent work has even questioned
// whether Andromeda is really more massive than the Milky Way. Rather
// than pick one number and imply it's settled, this leaves it out.
export const ANDROMEDA_DATA = {
  name: "Andromeda Galaxy",
  designation: "Messier 31 (M31)",
  distanceLightYears: 2.5e6,
  distanceLabel: "~2.5 million light-years",
  diameterLightYears: 220000,
  diameterLabel: "~220,000 light-years (estimates range ~200,000–260,000)",
  stars: "~1 trillion",
  blackHoleMassSolar: "~140 million",
  type: "Spiral galaxy (Sb)",
  closingSpeed: "~110 km/s toward the Milky Way",
  collisionTime: "~4–4.5 billion years from now",
  collisionResultName: "“Milkomeda” — an informal name used in popular science for the merged galaxy",
  // Direct upload.wikimedia.org URL, not the commons.wikimedia.org
  // Special:FilePath redirect — the redirect works fine for a normal
  // browser request (that's how this exact file was found and visually
  // verified), but doesn't carry CORS headers through the hop, so a
  // WebGL texture load from it fails outright. The actual media host
  // (upload.wikimedia.org) does support CORS for direct requests.
  imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Andromeda_galaxy_2.jpg/1920px-Andromeda_galaxy_2.jpg",
  imageCredit: "NASA/JPL-Caltech, via Wikimedia Commons — “The Galaxy Next Door” composite",
};

export const MILKY_WAY_DIAMETER_LIGHT_YEARS = 100000; // traditional, commonly-cited figure; some recent estimates run larger

export const ANDROMEDA_SOURCES = [
  "NASA Science — “Crash of the Titans: Andromeda Galaxy and the Milky Way Collision”",
  "earthsky.org — “The Andromeda Galaxy: All you need to know”",
  "Black hole mass: (1.4 ± 0.5) × 10⁸ solar masses, cross-checked via recent (2025) X-ray observation summaries",
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
