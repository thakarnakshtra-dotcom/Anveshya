// Additional multi-agency imagery for Learn's "Mission Imagery Gallery" —
// deliberately distinct from ../data/missions.js so the two grids don't
// repeat the same cards. Each query was tested directly against NASA's
// Images API (https://images-api.nasa.gov) and confirmed to return real,
// relevant, non-empty results before being added here. Several agency-
// specific queries (e.g. Aditya-L1, Hera, Zhurong by name, Gaia) returned
// zero results and were left out rather than padded with irrelevant
// matches — NASA's library simply doesn't index everything every agency
// flies.
export const mediaGallery = [
  { name: "NISAR", query: "NISAR satellite", agency: "ISRO" },
  { name: "JUICE", query: "JUICE Jupiter Icy Moons", agency: "ESA" },
  { name: "DART / Hera Target", query: "DART Dimorphos asteroid", agency: "NASA" },
  { name: "ISS Cupola", query: "International Space Station Cupola", agency: "NASA" },
  { name: "Chandrayaan", query: "Chandrayaan India Moon", agency: "ISRO" },
];
