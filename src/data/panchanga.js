// 30 tithis (lunar days) + the 12 sidereal (Vedic) zodiac signs, for the
// Panchanga wheel. Cross-checked before writing — see notes below and
// PANCHANGA_SOURCES for what was actually verified vs. deliberately left
// out.

// Names: the 15 tithi names of one paksha (fortnight), reused for both
// Shukla (waxing) and Krishna (waning) — this list itself is uncontested
// across every source checked. The 15th tithi is named Purnima (full
// moon) in Shukla Paksha and Amavasya (new moon) in Krishna Paksha.
const TITHI_BASE_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
];

// The 5-fold "nature" classification (Nanda/Bhadra/Jaya/Rikta/Purna) is a
// standard, self-consistent cycle: position 1,6,11 in each paksha is
// always Nanda, 2/7/12 Bhadra, 3/8/13 Jaya, 4/9/14 Rikta, 5/10/15 Purna —
// verified against a full 15-tithi table (clickastro.com) where every
// single entry matched this cycle exactly. The short meaning below is
// just the literal Sanskrit sense of each word (joy / auspicious /
// victory / empty / full), which is why it's stated as fact rather than
// hedged — it isn't a disputed astrological claim, it's a translation.
const NATURE_CYCLE = [
  { name: "Nanda", meaning: "joyful — favorable for celebration and new pleasures" },
  { name: "Bhadra", meaning: "auspicious — favorable for beginnings, learning, travel" },
  { name: "Jaya", meaning: "victorious — favorable for bold or competitive action" },
  { name: "Rikta", meaning: "empty — traditionally avoided for major new beginnings" },
  { name: "Purna", meaning: "full — favorable for completion and fullness rites" },
];

// Deliberately NOT included: a per-tithi ruling deity. Several
// independent sources were checked (a multi-site search aggregate vs.
// clickastro.com directly) and they gave genuinely different deity
// lists for the same tithi numbers (e.g. tithi 2 as "Brahma" in one,
// "Vidhatha" in another; tithi 6 as "Kartikeya" vs "Karthikeya/Agni").
// Rather than pick one list and present it as settled, this is left out
// — the same standard this project already holds ancient-astronomy
// content to (see data/ancientAstronomy.js).
export const TITHIS = Array.from({ length: 30 }, (_, i) => {
  const paksha = i < 15 ? "Shukla" : "Krishna";
  const posInPaksha = i % 15; // 0-14
  const nature = NATURE_CYCLE[posInPaksha % 5];
  const name =
    posInPaksha === 14 ? (paksha === "Shukla" ? "Purnima" : "Amavasya") : TITHI_BASE_NAMES[posInPaksha];
  return {
    id: i + 1,
    tithiNumber: posInPaksha + 1, // 1-15 within its paksha
    name,
    paksha, // "Shukla" (waxing) | "Krishna" (waning)
    nature: nature.name,
    natureMeaning: nature.meaning,
    degreeStart: i * 12,
    degreeEnd: (i + 1) * 12, // each tithi = 12° of Sun-Moon elongation, always
  };
});

export const TITHI_SEGMENT_DEGREES = 12;

// The 12 signs of the *sidereal* (Vedic) zodiac, in order starting from
// 0° — Ashwini nakshatra's start point is, by definition, sidereal 0°
// Aries, so nakshatra degree ranges and rashi (sign) boundaries line up
// exactly without needing a separate lookup table.
export const RASHIS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const RASHI_SEGMENT_DEGREES = 30;

// Lahiri ayanamsa (the offset between the sidereal and tropical
// zodiacs), used to convert the Moon's real ecliptic longitude into a
// sidereal nakshatra position. Value at J2000.0 and the annual
// precession rate both checked against multiple independent sources
// (jagannathhora.com's own published reference table, and Newcomb's
// precession constant as cited by several ayanamsa references) —
// they agree to within about 1 arcsecond, well below what matters for
// placing the Moon within a 13.33°-wide nakshatra.
export const AYANAMSA_J2000_DEG = 23 + 51 / 60 + 10 / 3600; // 23°51'10"
export const AYANAMSA_RATE_DEG_PER_YEAR = 50.2388475 / 3600; // Newcomb precession rate

export const PANCHANGA_SOURCES = [
  "Tithi names & 12°-per-tithi definition — jyotishtek.com, astrosight.ai (consistent across sources checked)",
  "Nanda/Bhadra/Jaya/Rikta/Purna 5-fold classification — clickastro.com/blog/tithi-list (self-consistent full 15-tithi table)",
  "Lahiri ayanamsa (value + precession rate) — jagannathhora.com/lahiri-ayanamsa-value, cross-checked against Newcomb's precession constant",
  "Sun/Moon positions for the live calculation below — the astronomy-engine library (Don Cross), an independent open-source implementation verified against a real published Panchang for 2026-08-31 (see components/PanchangaWheel.jsx)",
];
