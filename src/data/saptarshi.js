// Saptarshi (the Big Dipper, Ursa Major's brightest 7 stars) — checked
// star-by-star against real astronomical references before publishing,
// not taken from the request as given. Several things in that request
// turned out to be wrong, not just imprecise:
//
// - The sage-to-star mapping was scrambled. The verified mapping (from
//   a source that independently cross-references Bayer designations to
//   sage names) is: Dubhe=Kashyapa, Merak=Pulaha, Phecda=Pulastya,
//   Megrez=Atri, Alioth=Angiras, Mizar=Vasishtha, Alkaid=Marichi. The
//   request had Vasishtha on Alkaid and Angirasa on Dubhe, among other
//   swaps — every single pairing was off by at least one star.
// - Arundhati was listed as one of the seven sage-stars (assigned to
//   the star Alkaid). She isn't one of the seven — Arundhati is the
//   Indian name for Alcor, the faint naked-eye companion to Mizar
//   (Vasishtha's star), not a star of her own among the seven. This is
//   a well-attested, separate pairing (Mizar+Alcor's naked-eye
//   double has been used as a literal eyesight test since antiquity),
//   kept here as a companion note on Mizar rather than swapped in for
//   one of the seven.
// - Two of the seven distances were wrong, not rounded: the request
//   gave Mizar and Megrez both as "59 light-years" — the real values
//   are roughly 83 and 80 ly respectively. (The other five distances in
//   the request were essentially correct.)
// - The request's own "fact" field called Alkaid "the brightest star in
//   Ursa Major" — contradicted by its own magnitude figures: Alioth's
//   magnitude (1.76) is lower (brighter) than Alkaid's (1.86). Alioth
//   is the actual brightest star in Ursa Major.
// - "Megrez recently dimmed mysteriously" is a real, if disputed,
//   observational curiosity — ancient skywatchers reportedly rated it
//   on par with the other Dipper stars, though whether that reflects a
//   real magnitude-scale dimming or ancient observational imprecision
//   is genuinely unresolved. Kept, but labeled as disputed rather than
//   presented as a settled anomaly.
export const SAPTARSHI_STARS = [
  {
    id: "dubhe",
    bayer: "Alpha (α) Ursae Majoris",
    englishName: "Dubhe",
    sanskritName: "Kashyapa",
    magnitude: 1.79,
    distanceLightYears: 123,
    color: "#ffb46b",
    colorLabel: "Orange giant",
    spectralType: "K0 III",
    part: "Bowl — outer top corner",
    fact: "The second-brightest star in Ursa Major, an evolved orange giant far along in its life compared to the Sun.",
    mythology: "Kashyapa — one of the most revered of the Vedic sages, often described as a progenitor figure in Puranic genealogies.",
  },
  {
    id: "merak",
    bayer: "Beta (β) Ursae Majoris",
    englishName: "Merak",
    sanskritName: "Pulaha",
    magnitude: 2.37,
    distanceLightYears: 79.7,
    color: "#eaf2ff",
    colorLabel: "White",
    spectralType: "A1 V",
    part: "Bowl — outer bottom corner",
    fact: "Merak and Dubhe are the \"Pointer Stars\" — a line drawn through them and extended about five times their own separation lands close to Polaris.",
    mythology: "Pulaha — a Vedic sage associated with penance and cosmic order in the Puranic tradition.",
  },
  {
    id: "phecda",
    bayer: "Gamma (γ) Ursae Majoris",
    englishName: "Phecda (Phad)",
    sanskritName: "Pulastya",
    magnitude: 2.44,
    distanceLightYears: 84,
    color: "#eaf2ff",
    colorLabel: "White",
    spectralType: "A0 V",
    part: "Bowl — inner bottom corner",
    fact: "One of the five Dipper stars that share a common motion through space as part of the Ursa Major Moving Group.",
    mythology: "Pulastya — traditionally credited as an ancestor figure in Puranic lineages, associated with the transmission of sacred knowledge.",
  },
  {
    id: "megrez",
    bayer: "Delta (δ) Ursae Majoris",
    englishName: "Megrez",
    sanskritName: "Atri",
    magnitude: 3.31,
    distanceLightYears: 80.5,
    color: "#eaf2ff",
    colorLabel: "White",
    spectralType: "A3 V",
    part: "Bowl — inner top corner, where the handle attaches",
    fact: "The faintest of the seven by a wide margin. Some ancient skywatchers reportedly described it as comparable in brightness to the other six — whether that reflects real long-term dimming or just ancient observational imprecision is genuinely disputed, not settled.",
    mythology: "Atri — one of the most prominent Saptarshi across Vedic literature, associated with vision and insight.",
  },
  {
    id: "alioth",
    bayer: "Epsilon (ε) Ursae Majoris",
    englishName: "Alioth",
    sanskritName: "Angiras",
    magnitude: 1.76,
    distanceLightYears: 82.6,
    color: "#cfe0ff",
    colorLabel: "Blue-white",
    spectralType: "A0p",
    part: "Handle — closest to the bowl",
    fact: "The actual brightest star in Ursa Major (lower magnitude number = brighter) — not Alkaid, despite that being a common assumption. A chemically peculiar \"Ap\" star, and a member of the Ursa Major Moving Group.",
    mythology: "Angiras — a major Vedic sage-figure, credited in tradition as an early source of hymns and sacred fire ritual knowledge.",
  },
  {
    id: "mizar",
    bayer: "Zeta (ζ) Ursae Majoris",
    englishName: "Mizar",
    sanskritName: "Vasishtha",
    magnitude: 2.23,
    distanceLightYears: 82.9,
    color: "#eaf2ff",
    colorLabel: "White",
    spectralType: "A1 V",
    part: "Handle — middle",
    fact: "A multi-star system in its own right (at least four stars, possibly six counting its companion). Its naked-eye companion, Alcor, is a separate star traditionally paired with it — see below.",
    mythology: "Vasishtha — one of the most eminent of the Saptarshi, traditionally paired with his wife Arundhati (see the Alcor companion note).",
  },
  {
    id: "alkaid",
    bayer: "Eta (η) Ursae Majoris",
    englishName: "Alkaid (Benetnash)",
    sanskritName: "Marichi",
    magnitude: 1.86,
    distanceLightYears: 103.9,
    color: "#cfe0ff",
    colorLabel: "Blue-white",
    spectralType: "B3 V",
    part: "Handle — tip",
    fact: "Along with Dubhe, one of the two Dipper stars that do NOT belong to the Ursa Major Moving Group — it drifts through space independently of the other five, which is exactly why the Dipper's familiar shape is temporary (see the note on proper motion below).",
    mythology: "Marichi — in Puranic tradition, often named among the mind-born sons of Brahma and an ancestor figure in cosmogonic genealogies.",
  },
];

// The classic dipper/pot outline: a closed 4-star bowl (Dubhe-Merak-
// Phecda-Megrez-Dubhe) with a 3-star handle bent off the Megrez corner
// (Megrez-Alioth-Mizar-Alkaid) — 7 line segments total. Listed by star
// id rather than array index so the shape can't silently break if the
// stars array above is ever reordered.
export const SAPTARSHI_CONNECTIONS = [
  ["dubhe", "merak"],
  ["merak", "phecda"],
  ["phecda", "megrez"],
  ["megrez", "dubhe"],
  ["megrez", "alioth"],
  ["alioth", "mizar"],
  ["mizar", "alkaid"],
];

// Alcor — the naked-eye companion to Mizar, not one of the seven main
// stars. Real double star, real Indian-astronomy identification, real
// eyesight-test tradition (all independently verified, not assumed).
export const ARUNDHATI_STAR = {
  id: "arundhati",
  englishName: "Alcor",
  sanskritName: "Arundhati",
  companionOf: "mizar",
  magnitude: 3.99,
  fact: "Mizar and Alcor form a naked-eye double star, used since antiquity as an informal eyesight test — resolving them without aid was considered a sign of sharp vision. Alcor was itself found to be a binary star in 2009, making the Mizar–Alcor system six stars in total.",
  mythology: "Arundhati, wife of Vasishtha — invoked in Hindu wedding ceremonies as a symbol of marital devotion and fidelity.",
};

// Polaris is not part of Ursa Major — it's Ursa Minor's brightest star,
// included here purely as the navigational reference point the Pointer
// Stars (Dubhe/Merak) are traditionally used to find.
export const POLARIS = {
  englishName: "Polaris (the North Star)",
  designation: "Alpha (α) Ursae Minoris",
  distanceLightYearsLabel: "~430–450 light-years (estimates vary by method)",
  fact: "A Cepheid variable star — the nearest one to Earth of its kind. Currently the North Star only because Earth's rotational axis happens to point near it right now.",
};

export const SAPTARSHI_NOTES = {
  overview:
    "Saptarshi (\"the Seven Sages\") is the Indian name for the Big Dipper — the seven brightest stars of the constellation Ursa Major, forming the familiar bowl-and-handle shape. In Hindu tradition these seven stars are personified as revered sages (rishis), though which seven names belong to the broader \"Saptarshi\" concept varies across different Vedic and Puranic texts — the mapping used here is the one most commonly cross-referenced to these specific seven stars.",
  circumpolar:
    "From most of the Northern Hemisphere, the Big Dipper is circumpolar — it never dips below the horizon, circling Polaris once every 24 hours as Earth rotates.",
  pointerStars:
    "Draw a line through Merak and Dubhe (the bowl's outer two stars) and extend it roughly five times their own separation, and it lands close to Polaris — a navigation trick used for millennia before magnetic compasses.",
  shapeIsTemporary:
    "The Dipper's familiar shape isn't permanent. Five of its seven stars (Merak, Phecda, Megrez, Alioth, Mizar) share a common motion through space as the Ursa Major Moving Group, while the two end stars — Dubhe and Alkaid — drift independently. Over tens of thousands of years this pulls the shape out of recognition; some estimates put the Dipper losing its familiar outline within roughly 50,000–100,000 years. This is a separate effect from precession (below) — it's these stars physically moving relative to each other, not Earth's axis wobbling.",
  precession:
    "Separately, Polaris itself won't remain the North Star forever: Earth's axis slowly wobbles in a roughly 26,000-year cycle (precession), tracing a circle across the sky. Polaris is only a good pole star for a relatively short window of that cycle — for comparison, Thuban (in Draco) was the pole star around 3000 BCE, not Polaris.",
};

export const SAPTARSHI_SOURCES = [
  "Star magnitudes & distances — cross-checked across star-facts.com and nineplanets.org per-star pages",
  "Sage-to-star mapping (Dubhe=Kashyapa … Alkaid=Marichi) — starscapes.zone, \"Who Are the 7 Saptarishi Sages? Mythology Meets Astronomy\"",
  "Mizar/Alcor = Vasishtha/Arundhati, naked-eye eyesight test, Alcor's 2009 binary discovery — Wikipedia, \"Mizar and Alcor\"",
  "Ursa Major Moving Group membership (5 of 7 stars, Dubhe & Alkaid excluded) — astronomy.com, \"Ursa Major Moving Group\"",
  "Long-term shape change from proper motion — phys.org, \"The Big Dipper in the year 92,000\" (a software-modeled illustration, not a precise prediction)",
  "Megrez's disputed historical dimming — British Astronomical Association forum thread, \"Whatever happened to Megrez?\"",
  "Polaris distance & Cepheid status — star-facts.com and universeguide.com Polaris pages (distance estimates range ~432–447 ly across sources)",
];
