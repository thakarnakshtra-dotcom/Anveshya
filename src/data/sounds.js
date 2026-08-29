// Every URL below was verified directly (HTTP 200, correct audio/video
// content-type) before being added here — no guessed or placeholder links.
// Sources: nasa.gov's own "Sounds from Beyond" and "Historical Sounds"
// pages, and the Chandra X-ray Center's sonification archive
// (chandra.si.edu/sound), which NASA co-produces.

export const roverAndLanderSounds = [
  {
    title: "First Audio Recording of Sounds on Mars",
    body: "Perseverance's SuperCam microphone captured the first-ever audio recorded on the Martian surface, including faint wind gusts.",
    credit: "Credit: NASA/JPL-Caltech",
    date: "February 19, 2021",
    type: "audio",
    src: "https://www.nasa.gov/wp-content/uploads/2024/05/scam-mic-sol001-run001.wav",
  },
  {
    title: "Perseverance Records a Martian Dust Devil",
    body: "A rare direct audio capture of a dust devil passing directly over the rover, including the whistling of wind gusts.",
    credit: "Credit: NASA/JPL-Caltech",
    date: "September 27, 2021",
    type: "audio",
    src: "https://www.nasa.gov/wp-content/uploads/2024/05/pia25657.wav",
  },
  {
    title: "Ingenuity Mars Helicopter in Flight",
    body: "Perseverance's microphone recorded the faint high-pitched hum of Ingenuity's rotors during a flight roughly 80 meters away — the first audio of a spacecraft flying on another planet.",
    credit: "Credit: NASA/JPL-Caltech",
    date: "April 30, 2021",
    type: "audio",
    src: "https://www.nasa.gov/wp-content/uploads/2024/05/jpl-20210506-listen-to-nasas-ingenuity-helicopter-as-it-flies-on-mars.wav",
  },
  {
    title: "Sounds of Perseverance Driving on Mars (Highlights)",
    body: "A filtered 90-second compilation of the rover's wheels crunching over Martian gravel and its motors whirring during a Sol 16 drive.",
    credit: "Credit: NASA/JPL-Caltech",
    date: "Sol 16, 2021",
    type: "audio",
    src: "https://www.nasa.gov/wp-content/uploads/2024/05/filtered-highlights-sol16roverdrivehighlights.wav",
  },
  {
    title: "A Marsquake, Magnitude 3.3",
    body: "InSight's seismometer recorded this marsquake — sonified so the ground's vibrations become audible tones.",
    credit: "Credit: NASA/JPL-Caltech",
    date: "July 25, 2019",
    type: "audio",
    src: "https://www.nasa.gov/wp-content/uploads/2015/01/Quake-Sol-235.wav",
  },
  {
    title: "Audio of Juno's Ganymede Flyby",
    body: "Radio emissions from Jupiter's magnetosphere, recorded during Juno's close flyby of the moon Ganymede and converted to the audio range.",
    credit: "Credit: NASA/JPL-Caltech/SwRI/PRL",
    date: "June 7, 2021",
    type: "audio",
    src: "https://www.nasa.gov/wp-content/uploads/2024/05/e2-wave-ganymede-flyby-compressed.wav",
  },
];

export const sonifications = [
  {
    title: "Crab Nebula Sonification",
    body: "X-ray data from the Chandra and NuSTAR telescopes scanned left to right across the Crab Nebula's supernova remnant; volume follows brightness, and a bell marks the pulsar at its center.",
    credit: "Credit: NASA/CXC/SAO/K.Arcand, SYSTEM Sounds (M. Russo, A. Santaguida)",
    type: "audio",
    src: "https://chandra.si.edu/sound/sounds/audio/crab_chandra_nustar.mp3",
  },
  {
    title: "Cosmic Cliffs (Carina Nebula)",
    body: "A near-infrared Webb Telescope image of the Cosmic Cliffs, mapped so brighter light plays louder and vertical position sets pitch — windy drones for gas, melodic notes for denser star-forming regions.",
    credit: "Credit: NASA, ESA, CSA, STScI; Sonification: SYSTEM Sounds",
    type: "video",
    src: "https://chandra.si.edu/sound/sounds/carina.mp4",
  },
  {
    title: "Southern Ring Nebula",
    body: "Two Webb Telescope infrared images layered into one sonification — near-infrared plays first as higher tones, then mid-infrared as lower tones, revealing the binary stars at the nebula's heart.",
    credit: "Credit: NASA, ESA, CSA, STScI; Sonification: SYSTEM Sounds",
    type: "video",
    src: "https://chandra.si.edu/sound/sounds/southern_ring_nircam_miri.mp4",
  },
  {
    title: "V404 Cygni — A Black Hole's Light Echoes",
    body: "X-ray light from a black hole binary 7,800 light-years away, scattering off surrounding dust as expanding rings — the brighter the ring, the louder and higher the sound.",
    credit: "Credit: NASA/CXC/SAO; Sonification: SYSTEM Sounds",
    type: "video",
    src: "https://chandra.si.edu/sound/sounds/v404cyg.mp4",
  },
  {
    title: "WASP-96 b — An Exoplanet's Atmosphere",
    body: "Webb's transmission spectrum of exoplanet WASP-96 b turned into music — pitch follows wavelength, volume follows brightness, and water-droplet sounds mark its water signature.",
    credit: "Credit: NASA, ESA, CSA, STScI; Sonification: SYSTEM Sounds",
    type: "video",
    src: "https://chandra.si.edu/sound/sounds/wasp96b_notes.mp4",
  },
];

export const historicalSounds = [
  {
    title: "\"That's One Small Step for (a) Man\"",
    body: "Neil Armstrong's words as he became the first human to set foot on the Moon.",
    credit: "Credit: NASA",
    date: "July 20, 1969",
    type: "audio",
    src: "https://www.nasa.gov/wp-content/uploads/2015/01/590331main_ringtone_smallStep.mp3",
  },
  {
    title: "\"Houston, We've Had a Problem\"",
    body: "Apollo 13 astronaut Jack Swigert's transmission to Mission Control after an oxygen tank ruptured en route to the Moon.",
    credit: "Credit: NASA",
    date: "April 13, 1970",
    type: "audio",
    src: "https://www.nasa.gov/wp-content/uploads/2015/01/574928main_houston_problem.mp3",
  },
  {
    title: "Space Shuttle Discovery Launch (STS-131)",
    body: "The roar of Space Shuttle Discovery's main engines and solid rocket boosters at liftoff.",
    credit: "Credit: NASA",
    date: "April 5, 2010",
    type: "audio",
    src: "https://www.nasa.gov/wp-content/uploads/2015/01/590189main_ringtone_131_launchNats.mp3",
  },
];
