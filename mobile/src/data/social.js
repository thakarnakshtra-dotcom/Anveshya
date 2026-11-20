// Sample community data for Phase 1. These are placeholder accounts used to
// show the feed and chat UI — no backend yet, nothing here is a real user.

export const people = {
  anveshya: { id: "anveshya", name: "Anveshya", username: "anveshya", verified: true, color: "#8C3A35" },
  tara: {
    id: "tara",
    name: "Tara Nair",
    username: "tara.observes",
    verified: true,
    color: "#5E4B8A",
    bio: "Amateur astronomer · sketching the night sky from Kerala 🌙",
    links: { website: "https://anveshya.space", instagram: "tara.observes", linkedin: "", x: "tara_observes" },
  },
  arjun: { id: "arjun", name: "Arjun Mehta", username: "arjun_orbits", verified: false, color: "#3D5F86" },
  meera: { id: "meera", name: "Meera Iyer", username: "meera.nebula", verified: true, color: "#8A5A3A" },
  kabir: { id: "kabir", name: "Kabir Rao", username: "kabir.launches", verified: false, color: "#3E7068" },
  zoya: { id: "zoya", name: "Zoya Khan", username: "zoya.skies", verified: false, color: "#844A63", private: true, bio: "Skies over Bangalore, when the clouds allow." },
  dev: { id: "dev", name: "Dev Sharma", username: "dev_cosmos", verified: false, color: "#6B5A4E" },
};

const T = {
  jupiter: require("../../assets/textures/2k_jupiter.jpg"),
  mars: require("../../assets/textures/2k_mars.jpg"),
  earth: require("../../assets/textures/2k_earth_daymap.jpg"),
  saturn: require("../../assets/textures/2k_saturn.jpg"),
  sun: require("../../assets/textures/2k_sun.jpg"),
  neptune: require("../../assets/textures/2k_neptune.jpg"),
  venus: require("../../assets/textures/2k_venus_atmosphere.jpg"),
  clouds: require("../../assets/textures/2k_earth_clouds.jpg"),
};

export const stories = [
  { id: "s0", user: people.anveshya, image: T.sun, caption: "Solar activity today" },
  { id: "s1", user: people.tara, image: T.jupiter, caption: "Jupiter tonight!" },
  { id: "s2", user: people.meera, image: T.neptune, caption: "Ice giant facts" },
  { id: "s3", user: people.arjun, image: T.mars, caption: "Mars opposition prep" },
  { id: "s4", user: people.kabir, image: T.earth, caption: "Launch day vibes" },
  { id: "s5", user: people.zoya, image: T.venus, caption: "Venus at dusk" },
  { id: "s6", user: people.dev, image: T.saturn, caption: "Rings!" },
];

export const reels = [
  { id: "r1", user: people.anveshya, image: T.sun, title: "How the Sun makes light", duration: "0:48", views: "12.4K" },
  { id: "r2", user: people.kabir, image: T.earth, title: "Watching a launch from the coast", duration: "1:12", views: "8.1K" },
  { id: "r3", user: people.meera, image: T.saturn, title: "Why Saturn's rings are thin", duration: "0:35", views: "21K" },
  { id: "r4", user: people.tara, image: T.clouds, title: "Cloud patterns from orbit", duration: "0:57", views: "5.6K" },
];

const now = Date.now();
const mins = (m) => new Date(now - m * 60000);

export const initialPosts = [
  {
    id: "p1",
    user: people.anveshya,
    text: "Jupiter and Mars are in a close pairing before dawn this week — about 1° apart. Look east roughly an hour before sunrise. No telescope needed!",
    image: T.jupiter,
    time: mins(25),
    likes: 342,
    comments: [
      { id: "c1", user: people.zoya, text: "Setting my alarm 🌌" },
      { id: "c2", user: people.arjun, text: "Binoculars will show Jupiter's moons too." },
    ],
  },
  {
    id: "p2",
    user: people.tara,
    text: "Tried sketching the Leonids last night. Caught 9 meteors in an hour from a dark site outside the city.",
    image: null,
    time: mins(140),
    likes: 87,
    comments: [{ id: "c3", user: people.meera, text: "9 is great for the Leonids this year!" }],
  },
  {
    id: "p3",
    user: people.meera,
    text: "Mars' surface map — that long scar across the middle is Valles Marineris, a canyon system ~4,000 km long.",
    image: T.mars,
    time: mins(60 * 7),
    likes: 501,
    comments: [],
  },
  {
    id: "p4",
    user: people.kabir,
    text: "Reminder: the Anveshya News tab now lists upcoming launches with ISRO missions surfaced first.",
    image: null,
    time: mins(60 * 26),
    likes: 64,
    comments: [],
  },
];

export const myPosts = [
  { id: "m1", image: T.saturn },
  { id: "m2", image: T.earth },
  { id: "m3", image: T.neptune },
  { id: "m4", image: T.sun },
  { id: "m5", image: T.mars },
  { id: "m6", image: T.venus },
];

export const friends = [people.tara, people.arjun, people.meera, people.kabir, people.zoya, people.dev];
export const online = new Set(["tara", "meera", "zoya"]);

export const initialConversations = [
  {
    id: "dm-tara",
    type: "dm",
    members: [people.tara],
    unread: 2,
    messages: [
      { id: "1", from: "tara", text: "Did you see the Jupiter–Mars pairing?", time: mins(50) },
      { id: "2", from: "me", text: "Not yet, going out tomorrow morning", time: mins(48) },
      { id: "3", from: "tara", text: "Take binoculars!", time: mins(12) },
      { id: "4", from: "tara", text: "You'll see the Galilean moons 🔭", time: mins(11) },
    ],
  },
  {
    id: "dm-arjun",
    type: "dm",
    members: [people.arjun],
    unread: 0,
    messages: [
      { id: "1", from: "arjun", text: "Sending you that Mars map later", time: mins(300) },
      { id: "2", from: "me", text: "Thanks!", time: mins(290) },
    ],
  },
  {
    id: "grp-skywatch",
    type: "group",
    name: "Skywatchers India",
    members: [people.tara, people.meera, people.zoya, people.dev],
    unread: 5,
    messages: [
      { id: "1", from: "meera", text: "Clear skies forecast in Pune this weekend", time: mins(90) },
      { id: "2", from: "zoya", text: "Bangalore is cloudy as usual 😅", time: mins(70) },
      { id: "3", from: "dev", text: "Anyone driving out to a dark site?", time: mins(20) },
    ],
  },
  {
    id: "grp-launch",
    type: "group",
    name: "Launch Watch",
    members: [people.kabir, people.arjun],
    unread: 0,
    messages: [{ id: "1", from: "kabir", text: "Next PSLV window looks promising", time: mins(600) }],
  },
];

export const discussions = [
  { id: "d1", title: "Best budget telescope for beginners?", author: people.dev, replies: 42, tag: "Gear" },
  { id: "d2", title: "Aryabhata's sidereal day — how was it so accurate?", author: people.meera, replies: 18, tag: "Ancient" },
  { id: "d3", title: "Light pollution maps for South India", author: people.zoya, replies: 27, tag: "Observing" },
  { id: "d4", title: "Explain gravitational waves like I'm 12", author: people.arjun, replies: 35, tag: "Modern" },
];

export const notifications = [
  { id: "n1", icon: "heart", text: "Tara Nair liked your photo", time: mins(8) },
  { id: "n2", icon: "person-add", text: "Dev Sharma started following you", time: mins(45) },
  { id: "n3", icon: "chatbubble", text: "Meera Iyer replied in Skywatchers India", time: mins(90) },
];

export function timeAgo(date) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
