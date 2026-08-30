// 27 nakshatras. Ruling deity and ruling planet verified against
// Wikipedia's "Nakshatra" article (the planet sequence also matches the
// standard Vimshottari Dasha cycle: Ketu, Venus, Sun, Moon, Mars, Rahu,
// Jupiter, Saturn, Mercury, repeating three times across 27 nakshatras).
// Symbol is the standard traditional icon for each. Theme is a short,
// modest interpretive phrase, not a factual claim.
//
// Deliberately excluded after checking them against real sources:
//   - `star` is only set for the handful of correlations that are
//     genuinely uncontested across sources (matching the same standard
//     already held to in data/ancientAstronomy.js's nakshatra topic) —
//     most nakshatras don't have one dedicated, photographable star.
//   - No per-item image URLs. Most of the 27 don't have a real NASA/
//     Wikimedia photo of "their" star, and a request for this feature
//     included a batch of image URLs that were actually NASA *search
//     result page* links, not image files — would have rendered as
//     broken images everywhere.
//   - No RA/Dec coordinates, "best viewing month," or per-nakshatra
//     element. RA/Dec and viewing month would need real astronomical
//     calculation this pass didn't do; a fixed "element" per nakshatra
//     turns out to misrepresent the real system, which assigns element
//     per *pada* (quarter) — Fire/Earth/Air/Water cycling within every
//     single nakshatra, not one element for the whole thing. A supplied
//     "lunarDay" (Krishna/Shukla Paksha) per nakshatra was excluded for
//     the same reason: nakshatra and lunar phase are independent cycles
//     that drift relative to each other month to month, so a nakshatra
//     isn't tied to one fixed phase.
export const nakshatras = [
  { id: 1, name: "Ashwini", deity: "Ashwini Kumaras — the twin horse-headed gods of healing", planet: "Ketu", symbol: "Horse's head", theme: "New beginnings, speed, healing", star: null },
  { id: 2, name: "Bharani", deity: "Yama, god of death and dharma", planet: "Venus", symbol: "Yoni", theme: "Transformation, the bearing of new life", star: null },
  { id: 3, name: "Krittika", deity: "Agni, god of fire", planet: "Sun", symbol: "Flame / knife", theme: "Purification, sharp clarity", star: "The Pleiades" },
  { id: 4, name: "Rohini", deity: "Brahma, the creator", planet: "Moon", symbol: "Ox cart", theme: "Growth, fertility, creativity", star: "Aldebaran" },
  { id: 5, name: "Mrigashira", deity: "Soma, the Moon god", planet: "Mars", symbol: "Deer's head", theme: "Searching, curiosity, gentle pursuit", star: null },
  { id: 6, name: "Ardra", deity: "Rudra, a fierce form of Shiva", planet: "Rahu", symbol: "Teardrop", theme: "Storms, intensity, breakthrough", star: null },
  { id: 7, name: "Punarvasu", deity: "Aditi, mother of the gods", planet: "Jupiter", symbol: "Bow and quiver", theme: "Renewal, return, restoration", star: null },
  { id: 8, name: "Pushya", deity: "Brihaspati, guru of the gods", planet: "Saturn", symbol: "Cow's udder / lotus", theme: "Nourishment, auspicious timing", star: null },
  { id: 9, name: "Ashlesha", deity: "The Nagas, serpent deities", planet: "Mercury", symbol: "Coiled serpent", theme: "Hidden wisdom, embrace", star: null },
  { id: 10, name: "Magha", deity: "The Pitrs, ancestral spirits", planet: "Ketu", symbol: "Royal throne", theme: "Lineage, ancestry, authority", star: null },
  { id: 11, name: "Purva Phalguni", deity: "Bhaga, god of prosperity and marital bliss", planet: "Venus", symbol: "Hammock / front legs of a bed", theme: "Comfort, pleasure, creativity", star: null },
  { id: 12, name: "Uttara Phalguni", deity: "Aryaman, god of contracts and unions", planet: "Sun", symbol: "Back legs of a bed", theme: "Partnership, patronage, stability", star: null },
  { id: 13, name: "Hasta", deity: "Savitar, solar deity of the rising sun", planet: "Moon", symbol: "Open palm", theme: "Skill, dexterity, craftsmanship", star: null },
  { id: 14, name: "Chitra", deity: "Vishvakarma, the celestial architect", planet: "Mars", symbol: "Bright jewel", theme: "Brilliance, design, beauty made real", star: "Spica" },
  { id: 15, name: "Swati", deity: "Vayu, god of wind", planet: "Rahu", symbol: "Young shoot in the wind", theme: "Independence, adaptability", star: "Arcturus" },
  { id: 16, name: "Vishakha", deity: "Indra and Agni", planet: "Jupiter", symbol: "Triumphal archway", theme: "Determined effort toward a goal", star: null },
  { id: 17, name: "Anuradha", deity: "Mitra, god of friendship and partnership", planet: "Saturn", symbol: "Lotus", theme: "Devotion, cooperation, loyalty", star: null },
  { id: 18, name: "Jyeshtha", deity: "Indra, king of the gods", planet: "Mercury", symbol: "Circular amulet / umbrella", theme: "Seniority, protection, responsibility", star: null },
  { id: 19, name: "Mula", deity: "Nirriti, goddess of destruction and dissolution", planet: "Ketu", symbol: "Bundle of roots", theme: "Getting to the root of things", star: null },
  { id: 20, name: "Purva Ashadha", deity: "Apah, the water deities", planet: "Venus", symbol: "Fan / winnowing basket", theme: "Early, unshakeable resolve", star: null },
  { id: 21, name: "Uttara Ashadha", deity: "Vishvadevas, the universal gods", planet: "Sun", symbol: "Elephant tusk", theme: "Lasting, hard-won victory", star: null },
  { id: 22, name: "Shravana", deity: "Vishnu, the preserver", planet: "Moon", symbol: "Ear / three footprints", theme: "Listening, learning, transmission", star: "Vega" },
  { id: 23, name: "Dhanishtha", deity: "The Vasus, gods of material abundance", planet: "Mars", symbol: "Drum", theme: "Rhythm, wealth, renown", star: null },
  { id: 24, name: "Shatabhisha", deity: "Varuna, god of cosmic waters", planet: "Rahu", symbol: "Empty circle", theme: "Healing, solitude, hidden work", star: null },
  { id: 25, name: "Purva Bhadrapada", deity: "Aja Ekapada, a one-footed form of Shiva/Agni", planet: "Jupiter", symbol: "Sword / two-faced figure", theme: "Intensity, spiritual fire", star: null },
  { id: 26, name: "Uttara Bhadrapada", deity: "Ahirbudhnya, serpent of the deep", planet: "Saturn", symbol: "Twin serpents / back of a funeral cot", theme: "Depth, quiet inner strength", star: null },
  { id: 27, name: "Revati", deity: "Pushan, nourisher and protector of travelers", planet: "Mercury", symbol: "Fish", theme: "Safe passage, completion, nourishment", star: null },
];

export const NAKSHATRA_SEGMENT_DEGREES = 360 / nakshatras.length;

export const NAKSHATRA_SOURCES = [
  "Wikipedia, \"Nakshatra\" — ruling deity and ruling planet for all 27",
  "data/ancientAstronomy.js (this project) — star correlations, held to the same accuracy standard",
];
