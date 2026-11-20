// Static index of app content for the app-wide search. Explore/Learn/News
// entries deep-link into those tabs (a page + path, or text to find on it).

export const EXPLORE_ITEMS = [
  { id: "x-solar", title: "Solar System", sub: "Interactive 3D model of the Sun and eight planets", icon: "planet-outline", page: "explorer", path: "/explorer?section=solar-system", keywords: "planets sun orbit mercury venus earth mars jupiter saturn uranus neptune moon iss 3d" },
  { id: "x-panch", title: "Panchanga Wheel", sub: "Vedic sky wheel — nakshatras, tithis, rashis", icon: "sunny-outline", page: "explorer", path: "/explorer?section=nakshatras", keywords: "panchanga nakshatra tithi rashi vedic moon calendar" },
  { id: "x-andro", title: "Andromeda Galaxy", sub: "M31 — our nearest large galaxy", icon: "sparkles-outline", page: "explorer", path: "/explorer?section=andromeda", keywords: "andromeda m31 galaxy milky way collision" },
  { id: "x-sapt", title: "Saptarshi", sub: "The Big Dipper and the seven sages", icon: "star-outline", page: "explorer", path: "/explorer?section=saptarshi", keywords: "saptarshi big dipper ursa major stars arundhati polaris" },
  { id: "x-stf", title: "Spacetime Fabric", sub: "General relativity — how mass curves spacetime", icon: "grid-outline", page: "explorer", path: "/explorer?section=spacetime", keywords: "spacetime general relativity gravity black hole einstein curvature" },
  { id: "x-shield", title: "Solar Shield", sub: "Live space-weather risk from NOAA", icon: "shield-half-outline", page: "solarshield", keywords: "solar shield space weather kp index storm geomagnetic satellite noaa leo meo geo" },
];

export const LEARN_ITEMS = [
  "Aryabhata's Earth Rotation",
  "Navagraha — the Nine Grahas",
  "Sūrya Siddhānta's Distances",
  "Panchanga — the Five Limbs of Time",
  "Tithi — the Lunar Day",
  "Nakshatra — the 27 Lunar Mansions",
  "Rashi — the 12 Zodiac Signs",
  "Saptarshi & the Big Dipper",
  "General Relativity",
  "Black Holes & Event Horizons",
  "Quantum Mechanics",
  "Dark Matter & Dark Energy",
  "Missions & Media",
].map((t, i) => ({ id: `l-${i}`, title: t, sub: "Learn", icon: "book-outline", page: "learn", find: t.split(" — ")[0].split(" & ")[0] }))
  .concat([{ id: "l-sounds", title: "Sounds of Space", sub: "Real recordings from rovers, landers and probes", icon: "musical-notes-outline", page: "sounds" }]);

export const NEWS_ITEMS = [
  { id: "n-latest", title: "Latest space news", sub: "NASA, ISRO and ESA updates", icon: "newspaper-outline", find: "Latest News" },
  { id: "n-launch", title: "Upcoming launches", sub: "Rocket launches from every agency", icon: "rocket-outline", find: "Launches" },
  { id: "n-eclipse", title: "Eclipses", sub: "Next solar and lunar eclipses", icon: "moon-outline", find: "Eclipse" },
  { id: "n-meteor", title: "Meteor showers", sub: "Peak dates and rates", icon: "sparkles-outline", find: "Meteor" },
  { id: "n-iss", title: "ISS right now", sub: "Live position of the space station", icon: "radio-outline", find: "ISS" },
  { id: "n-conj", title: "Planetary conjunctions", sub: "Planets meeting in the sky", icon: "planet-outline", find: "Conjunction" },
].map((n) => ({ ...n, page: "news" }));

export const APP_ITEMS = [
  { id: "a-settings", title: "Settings", sub: "Account and app settings", icon: "settings-outline", route: "Account" },
  { id: "a-private", title: "Private account", sub: "Settings · Account", icon: "lock-closed-outline", route: "Account" },
  { id: "a-saved", title: "Saved", sub: "Posts and reels you bookmarked", icon: "bookmark-outline", route: "Profile", params: { tab: "saved" } },
  { id: "a-activity", title: "Your activity", sub: "Likes, comments, watch history", icon: "time-outline", route: "SettingsPage", params: { page: "activity", title: "Your activity" } },
  { id: "a-notif", title: "Notifications", sub: "Settings · App", icon: "notifications-outline", route: "SettingsPage", params: { page: "notifications", title: "Notifications" } },
  { id: "a-help", title: "Help & FAQ", sub: "Answers about Anveshya", icon: "help-buoy-outline", route: "SettingsPage", params: { page: "help", title: "Help & FAQ" } },
  { id: "a-reels", title: "Reels", sub: "Watch reels full screen", icon: "film-outline", route: "Reels", params: { index: 0 } },
  { id: "a-newchat", title: "New chat", sub: "Message a friend or create a group", icon: "create-outline", route: "NewChat" },
];
