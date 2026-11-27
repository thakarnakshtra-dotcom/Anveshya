// src/data/satellites.js
// Curated man-made objects. Add more entries here later (Hubble, Tiangong, etc.)
// — no other code changes needed, ManMadeObjects.jsx maps over this array.

export const EARTH_RADIUS_KM = 6371;

export const satellites = [
  {
    name: "International Space Station",
    shortName: "ISS",
    noradId: 25544,
    category: "Space Station",
    operator: "NASA / Roscosmos / ESA / JAXA / CSA",
    launchDate: "November 20, 1998",
    mission:
      "A continuously crewed research laboratory orbiting Earth, used for microgravity experiments in biology, physics, astronomy, and materials science. The largest human-made structure ever placed in orbit.",
    orbitType: "Low Earth Orbit (LEO)",
    altitudeKm: 408,
    orbitalPeriodMin: 92.68,
    inclinationDeg: 51.6,
    speedKmS: 7.66,
    color: "#d9dee8",
  },
];
