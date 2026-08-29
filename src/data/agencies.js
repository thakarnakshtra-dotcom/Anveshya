// Static founding/headquarters/history facts — well-established public
// record, not sourced from any live API. Historic mission cards are pulled
// from ../data/missions.js (filtered by agency) rather than duplicated here.
//
// `logo`: a stable Wikimedia Commons SVG URL, verified live (HTTP 200,
// image/svg+xml) before being added. CNSA has no dedicated logo file on
// Commons as of this pass — verified via Commons search, not just assumed
// missing — so it has no `logo` and the UI falls back to a text mark.
//
// `currentMissions`: active/recent missions with real dates, researched
// directly (not from a stored dataset) for this pass. Status can drift as
// missions progress — these are correct as of when this was written.
//
// `videos`: official YouTube uploads only. Every id was checked via
// YouTube's oEmbed endpoint and its `author_name` matched against the
// agency's actual channel before inclusion. CNSA has no official
// English-language YouTube channel (verified: no matching channel found),
// so it has an empty `videos` array and a `noVideoNote` explaining why,
// with a link to CNSA's own English-language site instead.
export const agencies = [
  {
    code: "NASA",
    name: "NASA",
    fullName: "National Aeronautics and Space Administration",
    founded: "1958",
    headquarters: "Washington, D.C., United States",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg",
    history:
      "Created by the National Aeronautics and Space Act of 1958 in response to the Soviet Union's Sputnik launch, absorbing the earlier National Advisory Committee for Aeronautics (NACA). Ran the Mercury, Gemini, and Apollo programs, landed twelve astronauts on the Moon, and now operates the ISS partnership, the Artemis program, and most of NASA's uncrewed planetary science missions.",
    currentMissions: [
      { name: "Artemis II", date: "Apr 2026", status: "Crewed lunar flyby completed; laid groundwork for Artemis III" },
      { name: "Europa Clipper", date: "Launched Oct 2024", status: "En route to Jupiter; arrival and science phase begin ~2030" },
      { name: "Perseverance Rover", date: "Since Feb 2021", status: "Active on Mars; 26 sample tubes collected for future return" },
      { name: "James Webb Space Telescope", date: "Since 2022", status: "Active, ongoing science operations" },
      { name: "Voyager 1 & 2", date: "Since 1977", status: "Still operating in interstellar space, nearly 5 decades on" },
    ],
    videos: [
      { title: "Live Video from the International Space Station", videoId: "M3HKLzjvKPc", credit: "NASA" },
      { title: "Live High-Definition Views from the ISS", videoId: "awQzjn72bI0", credit: "NASA" },
      { title: "Highlights: First Images from the James Webb Space Telescope", videoId: "1C_zuHf6lP4", credit: "NASA" },
      { title: "Perseverance Rover's Descent and Touchdown on Mars", videoId: "4czjS9h4Fpg", credit: "NASA" },
      { title: "Perseverance Rover's First 360° View of Mars", videoId: "wE-aQO9XD1g", credit: "NASA / JPL" },
    ],
  },
  {
    code: "ISRO",
    name: "ISRO",
    fullName: "Indian Space Research Organisation",
    founded: "1969",
    headquarters: "Bengaluru, India",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Indian_Space_Research_Organisation_Logo.svg",
    history:
      "Formed in 1969, succeeding the Indian National Committee for Space Research (established 1962 under Vikram Sarabhai). Operates under India's Department of Space. Built India's own satellite-launch capability from scratch, reached Mars orbit on its first attempt with Mangalyaan (2014), and made India the fourth country to soft-land on the Moon with Chandrayaan-3 (2023) — and the first to land near the lunar south pole.",
    currentMissions: [
      { name: "Aditya-L1", date: "Since Sep 2023", status: "Active solar observatory at the Sun-Earth L1 point" },
      { name: "NISAR", date: "Since 2025", status: "NASA-ISRO joint radar satellite, fully operational Earth-imaging" },
      { name: "Gaganyaan-1", date: "Targeted H2 2026", status: "Uncrewed test flight ahead of India's first crewed spaceflight" },
      { name: "Chandrayaan-3", date: "Landed Aug 2023", status: "First landing near the lunar south pole; mission complete" },
    ],
    videos: [
      { title: "Chandrayaan-3 Mission Soft-landing — Live Telecast", videoId: "DLA_64yz8Ss", credit: "ISRO" },
      { title: "Milestone Wins — POEM-4, SpaDeX, NISAR", videoId: "pKhJej1vC4I", credit: "ISRO" },
      { title: "PSLV-C62 / EOS-N1 Mission — Live Launch Coverage", videoId: "GgYh2Vv87ik", credit: "ISRO" },
      { title: "National Space Day 2026", videoId: "mOm126iZG9A", credit: "ISRO" },
    ],
  },
  {
    code: "ESA",
    name: "ESA",
    fullName: "European Space Agency",
    founded: "1975",
    headquarters: "Paris, France",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/ESA_logo_simple.svg",
    history:
      "Formed in 1975 by the merger of the European Space Research Organisation (ESRO) and the European Launcher Development Organisation (ELDO). An intergovernmental organization of 22 member states, independent of the EU. Built the Ariane launcher family, flew the Rosetta comet-lander mission, and partners with NASA on missions including the James Webb Space Telescope and ExoMars.",
    currentMissions: [
      { name: "JUICE (Jupiter Icy Moons Explorer)", date: "Launched Apr 2023", status: "En route to Jupiter via Earth/Venus flybys; arrival 2031" },
      { name: "Hera", date: "Launched Oct 2024", status: "Approaching Didymos asteroid system; arrival Nov 2026" },
      { name: "ExoMars Rosalind Franklin", date: "Now targeting Oct 2028", status: "Rover in development after relaunch replanning" },
      { name: "Gaia", date: "Since 2013", status: "Active astrometry mission, mapping over a billion stars" },
    ],
    videos: [
      { title: "ESA's Hera Mission Launch (Official Broadcast)", videoId: "O13Sp00Ltlw", credit: "ESA" },
      { title: "ESA's Hera Mission Launch Highlight", videoId: "ljPZKwAN1IY", credit: "ESA" },
      { title: "Ariane 6 Launch with MTG-I2 — Highlights", videoId: "nyjXK6iuLO4", credit: "ESA" },
    ],
  },
  {
    code: "CNSA",
    name: "CNSA",
    fullName: "China National Space Administration",
    founded: "1993",
    headquarters: "Beijing, China",
    history:
      "Established in 1993 to oversee China's civilian space program. Runs the Long March rocket family, the Chang'e lunar program (including far-side and sample-return landings), the Tianwen Mars program (Zhurong rover, 2021), and the Tiangong space station, completed in 2022.",
    currentMissions: [
      { name: "Tianwen-2", date: "Launched May 2025", status: "En route to asteroid Kamo'oalewa; sample return targeted 2027" },
      { name: "Tiangong Space Station", date: "Operational since 2022", status: "Crewed, with Shenzhou rotations roughly every 6 months" },
      { name: "Chang'e-6", date: "Completed Jun 2024", status: "First-ever sample return from the Moon's far side" },
      { name: "Tianwen-3", date: "Planned 2028", status: "Mars sample-return mission, in development" },
    ],
    videos: [],
    noVideoNote:
      "CNSA has no official English-language YouTube channel (verified — none found). See CNSA's own English-language site for mission updates instead.",
    noVideoLink: "https://www.cnsa.gov.cn/english/",
  },
  {
    code: "JAXA",
    name: "JAXA",
    fullName: "Japan Aerospace Exploration Agency",
    founded: "2003",
    headquarters: "Chōfu, Tokyo, Japan",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/85/Jaxa_logo.svg",
    history:
      "Formed in 2003 by merging three earlier organizations: the Institute of Space and Astronautical Science (ISAS), the National Space Development Agency (NASDA), and the National Aerospace Laboratory (NAL). Known for the Hayabusa and Hayabusa2 asteroid sample-return missions, the H-II rocket family, and its contributions to the ISS, including the Kibo module.",
    currentMissions: [
      { name: "Hayabusa2 (extended mission)", date: "Ongoing", status: "Flew past asteroid Torifune in 2026; next target 1998 KY26 in 2031" },
      { name: "XRISM", date: "Since Mar 2024", status: "Active X-ray telescope, joint mission with NASA" },
      { name: "SLIM", date: "Jan 2024 – Aug 2024", status: "Concluded — one of the most precise Moon landings ever achieved" },
    ],
    videos: [
      { title: "Small Satellites Deployed from Kibo (J-SSOD #32, 1st set)", videoId: "LvvUfWakkIg", credit: "JAXA" },
      { title: "Small Satellites Deployed from Kibo (J-SSOD #32, 2nd set)", videoId: "W6v9XU62GGs", credit: "JAXA" },
      { title: "Crew-11 Astronaut Kimiya Yui — Launch Livestream (Aug 2025)", videoId: "1gajA4b1HL4", credit: "JAXA" },
    ],
  },
];
