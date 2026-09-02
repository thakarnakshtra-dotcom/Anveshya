// Space Weather Learn content. Same standard as data/ancientAstronomy.js:
// every number here is a real, checkable value from NOAA's Space Weather
// Prediction Center or NASA, not a rounded-off approximation dressed up
// to sound precise. Where a widely-repeated figure turned out to be
// genuinely uncertain on inspection (the November 2003 flare's true
// class — see historicalEvents below), that uncertainty is stated
// directly rather than picking one number and presenting it as settled.
//
// Kept internally consistent with what SolarShield's own live function
// (netlify/functions/solarshield.js) already computes: the same Kp
// quiet/unsettled/active/storm band edges (≤2 / ≤4 / ≤6 / >6) are used
// here, not a second, different educational breakdown that would
// contradict the live dashboard right next to it.

export const KP_LEVELS = [
  { kp: 0, band: "Quiet", gScale: null, note: "No geomagnetic disturbance. Aurora confined to the polar auroral ovals." },
  { kp: 1, band: "Quiet", gScale: null, note: "Still quiet. Normal background geomagnetic field." },
  { kp: 2, band: "Quiet", gScale: null, note: "Slightly unsettled but within normal daily variation." },
  { kp: 3, band: "Unsettled", gScale: null, note: "Unsettled field. HF radio may show minor, brief degradation at high latitudes." },
  { kp: 4, band: "Active", gScale: null, note: "Active field. Aurora may become visible from the northern-tier US / southern Canada on a clear night." },
  { kp: 5, band: "Storm", gScale: "G1 — Minor", note: "Weak power-grid fluctuations possible. Aurora visible as low as ~50° geomagnetic latitude (e.g. Michigan, Maine)." },
  { kp: 6, band: "Storm", gScale: "G2 — Moderate", note: "High-latitude power systems may see voltage alarms. Aurora visible to ~55–50° geomagnetic latitude." },
  { kp: 7, band: "Storm", gScale: "G3 — Strong", note: "Voltage corrections needed on some grids; HF radio intermittently degraded. Aurora reported as low as ~45° (parts of the northern US)." },
  { kp: 8, band: "Storm", gScale: "G4 — Severe", note: "Widespread voltage-control problems possible; some grid systems may experience protective-relay trips. Aurora visible to ~40°." },
  { kp: 9, band: "Storm", gScale: "G5 — Extreme", note: "Possible widespread voltage control problems and transformer damage; HF radio blackout on most of the sunlit Earth. Aurora historically reported as low as ~40° geomagnetic latitude or lower." },
];

// GOES X-ray flare classes — the real, standard NOAA classification,
// based on peak soft X-ray flux (1–8 Å band) in watts per square metre.
// Each letter covers one decade; the number after it (1–9, uncapped for
// X) is linear within that decade — an M5 flare is 5×10⁻⁵ W/m², an X2 is
// 2×10⁻⁴ W/m².
export const FLARE_CLASSES = [
  { cls: "A", fluxRange: "< 10⁻⁷ W/m²", effect: "No measurable effect on Earth. Background level even during a quiet Sun." },
  { cls: "B", fluxRange: "10⁻⁷ – 10⁻⁶ W/m²", effect: "No measurable effect on Earth." },
  { cls: "C", fluxRange: "10⁻⁶ – 10⁻⁵ W/m²", effect: "Few noticeable effects on Earth. Common — several a day even at moderate solar activity." },
  { cls: "M", fluxRange: "10⁻⁵ – 10⁻⁴ W/m²", effect: "Brief radio blackouts at the poles; minor radiation storm risk begins here (NOAA R1–R2 scale)." },
  { cls: "X", fluxRange: "≥ 10⁻⁴ W/m²", effect: "Wide-area radio blackouts and radiation storms possible. Uncapped: X10, X20+ events are real and recorded." },
];

export const NOAA_SCALES = [
  {
    id: "G",
    name: "Geomagnetic Storm Scale (G1–G5)",
    driver: "Driven by the planetary Kp index — G1=Kp5 through G5=Kp9, the same mapping used above.",
    summary: "Measures disturbance to Earth's own magnetic field, mainly from CME impacts. What SolarShield's risk score is built from.",
  },
  {
    id: "S",
    name: "Solar Radiation Storm Scale (S1–S5)",
    driver: "Driven by the flux of >10 MeV protons (particles/cm²·s·sr) measured by GOES, from S1 (10) to S5 (100,000).",
    summary: "Measures the risk from energetic solar protons — the main hazard to astronauts, polar-route airline crews, and satellite electronics, independent of the geomagnetic (G) scale.",
  },
  {
    id: "R",
    name: "Radio Blackout Scale (R1–R5)",
    driver: "Driven directly by X-ray flare class: R1–R2 ≈ M-class flares, R3 ≈ X1–X9, R4 ≈ X10–X19, R5 ≈ X20+.",
    summary: "Measures HF radio and low-frequency navigation disruption on the sunlit side of Earth, caused by the flare's X-rays ionizing the upper atmosphere within minutes — the fastest-arriving of the three effects, since it travels at light speed.",
  },
];

export const spaceWeatherTopics = [
  {
    id: "solar-cycle",
    kicker: "~11-year cycle",
    title: "The Solar Cycle",
    body: [
      "The Sun's magnetic activity — sunspots, flares, CMEs — rises and falls on a cycle that averages about 11 years, first tracked systematically from sunspot counts since the 1750s (numbered Solar Cycle 1 onward). The current cycle, Solar Cycle 25, began around December 2019.",
      "In October 2024, the NOAA/NASA-convened Solar Cycle Prediction Panel formally announced that Solar Cycle 25's maximum phase was underway, centered around mid-to-late 2024 — arriving somewhat stronger than the panel's original 2019 prediction, though still a moderate cycle by the standard of the last century's strongest ones (Cycle 19, peaking 1957–58, remains the strongest instrumentally observed).",
      "Activity declines for several years after maximum toward the next solar minimum, expected around the early 2030s — meaning flares and CMEs stay meaningfully more frequent than solar-minimum baseline for a while yet, not a switch that flips off.",
    ],
    sources: [
      "NOAA/NASA Solar Cycle 25 Prediction Panel, updated announcement, October 2024",
      "NOAA Space Weather Prediction Center, solar cycle progression data",
    ],
  },
  {
    id: "flares",
    kicker: "GOES X-ray classification",
    title: "Solar Flares",
    body: [
      "A solar flare is a sudden burst of electromagnetic radiation from the Sun's atmosphere, released when magnetic energy built up in sunspot regions is suddenly reconnected and discharged. NOAA's GOES satellites classify flares by their peak X-ray brightness in the 1–8 Ångström band — the table below is the complete, real scale, not a simplified version of it.",
      "Because flare radiation travels at the speed of light, its effects (radio blackouts, via the R-scale) arrive at Earth in about 8 minutes — the fastest of the three space-weather hazards on this page, ahead of energetic particles (tens of minutes to hours) and the CME's bulk plasma (typically 1–3 days).",
    ],
    table: FLARE_CLASSES,
    tableColumns: [
      { key: "cls", label: "Class" },
      { key: "fluxRange", label: "Peak X-ray flux" },
      { key: "effect", label: "Typical effect" },
    ],
    sources: ["NOAA Space Weather Prediction Center, \"Solar Flares (Radio Blackouts)\" scale reference"],
  },
  {
    id: "cme",
    kicker: "200–3,000 km/s",
    title: "Coronal Mass Ejections (CMEs)",
    body: [
      "A CME is a genuinely different event from a flare, though the two often happen together: it's a massive eruption of billions of tonnes of magnetized plasma from the Sun's corona, rather than a burst of radiation. Observed CME speeds range roughly from 250 km/s (slow, common) up to around 3,000 km/s for the fastest recorded events.",
      "Earth sits about 150 million km (1 AU) from the Sun. At a representative 500 km/s, simple distance ÷ speed gives roughly 83 hours — about 3.5 days — which matches NOAA's own commonly stated 1–3 day typical arrival window (faster CMEs arrive sooner; real CMEs also decelerate somewhat en route from drag against the ambient solar wind, so this is an estimate, not an exact prediction).",
      "CMEs are tracked in transit by coronagraphs aboard SOHO and STEREO, which block out the Sun's direct disk to image the much fainter corona around it — this is how NOAA issues CME arrival-time forecasts before a storm reaches Earth, rather than only detecting it on arrival.",
    ],
    sources: [
      "NOAA SWPC, \"Coronal Mass Ejections\" overview and typical speed range",
      "NASA, SOHO/STEREO coronagraph mission overviews",
    ],
  },
  {
    id: "kp-index",
    kicker: "The most important number on this page",
    title: "The Kp Index & NOAA's G/S/R Scales",
    body: [
      "The planetary K-index (Kp) is a 0–9 scale measuring disturbance in Earth's magnetic field, derived from ground magnetometer stations worldwide and published by NOAA every 3 hours — it's a quasi-logarithmic scale, not linear, so each step up represents a substantially larger disturbance than the last. This is the exact number SolarShield's live dashboard reads and color-codes in real time.",
      "Kp maps directly onto NOAA's official Geomagnetic Storm Scale from G1 (Kp5) through G5 (Kp9) — click through the levels below for what each one actually means, including how far south aurora typically becomes visible.",
      "Kp/G is only one of NOAA's three space-weather scales. The other two — S (solar radiation storms) and R (radio blackouts) — are driven by different physical causes (energetic protons, and X-ray flares, respectively) and can spike independently of the Kp/G number, which is why SolarShield tracks magnetometer and flare data as separate readings rather than reducing everything to one figure.",
    ],
    interactive: "kp",
    scales: NOAA_SCALES,
    sources: [
      "NOAA SWPC, planetary K-index definition and G-scale mapping",
      "NOAA SWPC, S-scale and R-scale reference tables",
    ],
  },
  {
    id: "history",
    kicker: "1859 – 2012",
    title: "Historical Events",
    body: [
      "The Carrington Event (1–2 September 1859) is the strongest geomagnetic storm on record: telegraph systems across Europe and North America failed or sparked, some operators reportedly disconnecting batteries and running lines on induced current alone, and aurora were reported as far south as Cuba, Hawaii, and Colombia. The Kp index didn't exist yet — it was introduced by Julius Bartels in 1949 — so any \"Kp9\" figure attached to Carrington today is a retroactive estimate from historical magnetometer records, not a measurement made at the time, and some researchers argue the true intensity likely exceeded anything the modern scale has recorded since.",
      "The Halloween Storms (October–November 2003) were a cluster of major flares and CMEs, including one X-class flare on 4 November 2003 so intense it saturated the GOES X-ray sensor mid-measurement — NOAA's real-time reading cut off around X17-X20, and later reconstructions from other instruments have estimated anywhere from X28 up to roughly X45. That range is stated honestly here rather than repeating one figure as if it were settled; it genuinely isn't. The storms caused a power outage in Malmö, Sweden, degraded or lost several satellites, and forced airlines to reroute polar flights.",
      "On 23 July 2012, a CME estimated around 2,000–3,000 km/s — comparable in scale to reconstructions of the Carrington event — crossed Earth's orbital path but missed Earth, because the eruption site had rotated away from facing us roughly a week to nine days earlier. It was observed directly by NASA's STEREO-A spacecraft, which happened to be in its path. A 2014 study (Baker et al.) argued that had it occurred nine days earlier, the impact could have rivaled or exceeded Carrington-level effects on modern power and satellite infrastructure.",
    ],
    sources: [
      "NOAA/NASA historical event summaries, Carrington Event (1859)",
      "NOAA SWPC and NASA, Halloween Storms (October–November 2003), including GOES sensor-saturation note",
      "NASA Science, \"Near Miss: The Solar Superstorm of July 2012\"; Baker et al., Space Weather (2013/2014)",
    ],
  },
];
