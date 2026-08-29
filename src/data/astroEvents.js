// Static astronomical event data — eclipses, meteor showers, and planetary
// conjunctions are predictable years in advance, so these are real,
// researched dates (not fabricated), not a live feed. There is no free
// public JSON API for any of these three event types; NASA's own eclipse
// tables, the American Meteor Society's shower calendar, and in-the-sky.org's
// conjunction calendar were used directly to source the dates below.
// Cross-check against those sources if this list ever needs extending
// past the dates covered here.

// All four of 2026's eclipses (NASA: eclipse.gsfc.nasa.gov/OH/OH2026.html)
// already occurred before this pass was written (Feb 17, Mar 3, Aug 12,
// Aug 28) — none fall in the next-3-months window. Rather than omit the
// event type, the next real eclipse is shown so the section isn't just
// silently empty.
export const eclipses = [
  { date: "2026-02-17", type: "Annular Solar", visibility: "Antarctica region", note: "Already occurred this year." },
  { date: "2026-03-03", type: "Total Lunar", visibility: "Pacific / Americas", note: "Already occurred this year." },
  { date: "2026-08-12", type: "Total Solar", visibility: "Greenland, Iceland, Spain", note: "Already occurred this year." },
  { date: "2026-08-28", type: "Partial Lunar", visibility: "Americas, Africa", note: "Already occurred this year." },
];

export const nextEclipse = {
  date: "2027-02-06",
  type: "Annular Solar",
  visibility: "South America",
};

// American Meteor Society calendar, 2026.
export const meteorShowers = [
  { name: "Orionids", peakDate: "2026-10-21", peakDateLabel: "Oct 21–22, 2026", zhr: 20, note: "Debris from Halley's Comet; best viewing after midnight." },
  { name: "Southern Taurids", peakDate: "2026-11-04", peakDateLabel: "Nov 4–5, 2026", zhr: 5, note: "Slow, often bright meteors; broad, weak peak." },
  { name: "Northern Taurids", peakDate: "2026-11-11", peakDateLabel: "Nov 11–12, 2026", zhr: 5, note: "Overlaps the Southern Taurids; known for occasional fireballs." },
  { name: "Leonids", peakDate: "2026-11-16", peakDateLabel: "Nov 16–17, 2026", zhr: 15, note: "Fast meteors from Comet Tempel-Tuttle." },
];

// in-the-sky.org's 2026 conjunction calendar, non-lunar events only
// (Moon-planet conjunctions happen monthly and aren't especially rare).
export const conjunctions = [
  { objects: "Venus & Mercury", date: "2026-10-05", separation: "5°26′", note: "Low in the evening or morning twilight, depending on elongation." },
  { objects: "Mars & the Beehive Cluster (M44)", date: "2026-10-11", separation: "close approach", note: "Attractive through binoculars as Mars passes the star cluster in Cancer." },
  { objects: "Jupiter & Mars", date: "2026-11-15", separation: "1°14′", note: "Closest planet-to-planet approach in this window, visible before dawn." },
];
