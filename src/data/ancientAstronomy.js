// Ancient Indian astronomy vs. modern science. Every claim here is sourced
// to a named ancient text (Āryabhaṭīya, Sūrya Siddhānta) and cross-checked
// against secondary scholarly/reference sources (cited per topic) — no
// numbers or verses are invented. Where a claim is genuinely contested
// among historians (e.g. whether Aryabhata's model implies full
// heliocentrism, not just axial rotation), that's stated explicitly rather
// than smoothed over. Topics not yet researched to this standard are
// marked "coming-soon" rather than filled in with guesses.

export const ancientAstronomyTopics = [
  {
    id: "aryabhata-rotation",
    status: "full",
    kicker: "500 CE",
    title: "Aryabhata's Earth Rotation",
    knownBy: "Aryabhata (476–550 CE)",
    sanskrit: "अनुलोमगतिर्नौस्थः पश्यत्यचलं विलोमगं यद्वत् ।\nअचलानि भानि तद्वत् समपश्चिमगानि लङ्कायाम् ।।",
    transliteration:
      "anulomagatir nausthaḥ paśyaty acalaṃ vilomagaṃ yadvat, acalāni bhāni tadvat samapaścimagāni laṅkāyām",
    reference: "Āryabhaṭīya, Golāpāda, verse 9",
    translation:
      "Just as a man in a boat moving forward sees the stationary objects on the riverbank as if moving backward, so do the fixed stars appear to a person at Lanka (the equator) as moving uniformly westward.",
    context:
      "Writing around 499 CE, Aryabhata argued that the daily east-to-west sweep of the stars isn't the sky itself turning — it's an illusion caused by the Earth rotating west-to-east beneath a fixed sky, exactly like riverbank trees appear to slide backward past a moving boat. It's one of the earliest clear statements of relative motion applied to astronomy.",
    modernEquivalent:
      "Earth rotates on its own axis roughly once every 23 hours, 56 minutes, and 4 seconds (a sidereal day), and this rotation — not a moving sky — produces the daily rising and setting of stars.",
    modernFact:
      "In the Gītikāpāda, Aryabhata separately states that Earth completes 1,582,237,500 rotations in a mahāyuga (4.32 million years). Dividing that out gives a sidereal day of 23h 56m 4.1s — the modern value is 23h 56m 4.091s, a difference of under a hundredth of a second.",
    accuracyNote:
      "The rotation claim itself predates its general acceptance in European astronomy by roughly a thousand years. One honest caveat: Aryabhata proposed Earth's axial rotation — not necessarily a full heliocentric model with Earth orbiting the Sun. Whether his planetary-distance scheme implies elements of heliocentrism is a genuinely disputed question among historians of science, and this page doesn't claim it's settled.",
    sources: [
      "Āryabhaṭīya, Golāpāda v.9 and Gītikāpāda v.3–4",
      "W.E. Clark, The Āryabhaṭīya of Āryabhaṭa (English translation), University of Chicago Press, 1930",
    ],
  },
  {
    id: "navagraha",
    status: "full",
    kicker: "Antiquity",
    title: "Navagraha — the Nine Grahas",
    knownBy: "Classical Vedic & Siddhantic astronomy",
    sanskrit: "आदित्याय च सोमाय मङ्गलाय बुधाय च ।\nगुरु शुक्र शनिभ्यश्च राहवे केतवे नमः ।।",
    transliteration:
      "ādityāya ca somāya maṅgalāya budhāya ca, guru śukra śanibhyaśca rāhave ketave namaḥ",
    reference: "Navagraha Stotra (traditional salutation verse, recited across Hindu ritual practice)",
    translation:
      "“Salutations to Aditya (the Sun) and Soma (the Moon), to Mangala and to Budha, to Guru, Shukra, and Shani, and to Rahu and Ketu.”",
    context:
      "Classical Indian astronomy grouped nine “grahas” (seizers/influencers) that were tracked against the fixed stars: the two luminaries (Sun, Moon), the five planets visible to the naked eye, and two invisible points — Rahu and Ketu — used specifically to predict eclipses.",
    modernEquivalent:
      "Surya = Sun · Chandra = Moon · Mangala = Mars · Budha = Mercury · Guru/Brihaspati = Jupiter · Shukra = Venus · Shani = Saturn. Rahu and Ketu correspond to the Moon's ascending and descending nodes — the two points where the Moon's orbital plane crosses the plane of Earth's orbit around the Sun.",
    modernFact:
      "Rahu and Ketu were never claimed to be physical bodies — they're mathematical points. Modern orbital mechanics still tracks these same lunar nodes today, because a solar or lunar eclipse can only happen when a new or full Moon occurs close to one of them. That's the same underlying geometry ancient astronomers were modeling.",
    accuracyNote:
      "The five real planets map one-to-one onto their modern identities with no ambiguity. Treating Rahu/Ketu as eclipse-predicting node points (rather than physical grahas) reflects genuine, still-used celestial mechanics — not a coincidence dressed up after the fact.",
    sources: [
      "Navagraha Stotra (traditional salutation verse) and the Navagraha enumeration attested across Siddhantic and Puranic astronomy",
      "Lunar node (ascending/descending) definitions, modern celestial mechanics",
    ],
  },
  {
    id: "surya-siddhanta-distances",
    status: "full",
    kicker: "4th–10th century CE",
    title: "Sūrya Siddhānta's Distances",
    knownBy: "Sūrya Siddhānta (author unknown; a “living text” revised over centuries)",
    context:
      "The Sūrya Siddhānta is a Sanskrit astronomical treatise whose core dates somewhere between the 4th and 5th century CE by most scholarly estimates, though it was revised for centuries afterward — historians don't agree on a single date. It gives numerical sizes and distances for the Sun, Moon, and Earth in yojanas, an ancient unit of length whose exact modern equivalent is itself debated (commonly estimated at roughly 8–15 km).",
    comparisonTable: [
      { quantity: "Earth's diameter", ancient: "1,600 yojana", modern: "12,756 km", verdict: "Close, within the yojana range" },
      { quantity: "Moon's diameter", ancient: "480 yojana", modern: "3,475 km", verdict: "Close, within the yojana range" },
      { quantity: "Sun's diameter", ancient: "6,500 yojana", modern: "≈ 1,392,000 km", verdict: "Dramatically underestimated" },
      { quantity: "Earth–Moon distance", ancient: "51,600 yojana", modern: "≈ 384,400 km (average)", verdict: "Overestimated" },
      { quantity: "Length of the year", ancient: "365 days, 6h 12m 36.6s", modern: "365.256 days (sidereal year)", verdict: "Within ~3.5 minutes of the sidereal year" },
    ],
    accuracyNote:
      "The picture is genuinely mixed, and this page isn't rounding that off: Earth's and the Moon's sizes come out close to modern values, the year length is remarkably precise against the sidereal year, but the Sun's size is wildly underestimated and the Earth-Moon distance is overestimated. Ancient Indian astronomy was a real observational and computational tradition — not uniformly “more accurate than people think,” and not dismissible either.",
    sources: [
      "Sūrya Siddhānta (English translation by Ebenezer Burgess, 1860, reprinted by Motilal Banarsidass)",
      "Wikipedia, “Surya Siddhanta” (secondary summary used to cross-check the figures above)",
    ],
  },
  {
    id: "surya-siddhanta-orbits",
    status: "coming-soon",
    kicker: "Coming soon",
    title: "Sūrya Siddhānta & Orbital Mechanics",
  },
  {
    id: "nakshatra",
    status: "coming-soon",
    kicker: "Coming soon",
    title: "Nakshatra System",
  },
  {
    id: "tithi",
    status: "coming-soon",
    kicker: "Coming soon",
    title: "Tithi & Lunar Cycles",
  },
  {
    id: "saptarshi",
    status: "coming-soon",
    kicker: "Coming soon",
    title: "Saptarshi & the Big Dipper",
  },
];
