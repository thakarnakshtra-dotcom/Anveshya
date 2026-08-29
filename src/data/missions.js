// Search terms tuned to surface the canonical, recognizable image for each
// mission from NASA's public Images API (https://images-api.nasa.gov).
//
// `agency` is the mission's OWNING space agency (shown as a badge). This is
// intentionally separate from the photo credit shown on each card, which
// reflects who actually captured/provided that specific image — NASA's
// library documents plenty of missions it doesn't own (ESA's ExoMars and
// Rosetta, ISRO's Mars Orbiter Mission, CNSA's Zhurong rover, JAXA's
// Hayabusa2), and the credit line stays accurate to the real photographer
// even when the badge says otherwise.
//
// Real, verified coverage only: ISRO's own Chandrayaan-3 and CNSA's
// Chang'e-6 have zero results in NASA's library (tested directly), so
// they're represented by other real missions from the same agency instead
// of being forced in with fabricated content.
export const missions = [
  { name: "Apollo 11", query: "Apollo 11", agency: "NASA" },
  { name: "Voyager 1", query: "Pale Blue Dot", agency: "NASA" },
  { name: "Hubble Space Telescope", query: "Hubble Deep Field", agency: "NASA" },
  { name: "James Webb Space Telescope", query: "James Webb Space Telescope first images", agency: "NASA" },
  { name: "Mangalyaan (Mars Orbiter Mission)", query: "Mars Orbiter Mission India", agency: "ISRO" },
  { name: "ExoMars", query: "ExoMars", agency: "ESA" },
  { name: "Rosetta", query: "Rosetta comet ESA", agency: "ESA" },
  { name: "Zhurong Rover", query: "Zhurong Mars Rover", agency: "CNSA" },
  { name: "Hayabusa2", query: "Hayabusa2", agency: "JAXA" },
];
