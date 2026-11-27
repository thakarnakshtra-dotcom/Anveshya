// The list of labs. "load" fetches a lab's code only when it is opened;
// "loadContent" fetches just its words, for the lesson pages on Learn.
// All text here is yours to edit.
export const labs = [
  {
    slug: "black-hole",
    title: "Black Hole and Spacetime",
    category: "Gravity",
    description:
      "The event horizon, bending light, slowed clocks and orbits around a black hole that does not spin.",
    load: () => import("./black-hole/index.js"),
    loadContent: () => import("./black-hole/content.js"),
  },
  {
    slug: "wormhole",
    title: "Wormhole",
    category: "Theoretical geometry",
    description:
      "A hypothetical tunnel through spacetime. It can be written in the equations, but none has ever been observed.",
    load: () => import("./wormhole/index.js"),
    loadContent: () => import("./wormhole/content.js"),
  },
  {
    slug: "relativity",
    title: "Theory of Relativity",
    category: "Space, time and gravity",
    description: "How moving clocks, lengths, energy and gravity behave in Einstein's theory.",
    load: () => import("./relativity/index.js"),
    loadContent: () => import("./relativity/content.js"),
  },
  {
    slug: "string-theory",
    title: "String Theory",
    category: "Theoretical physics",
    description: "Vibrating strings, extra dimensions and their shapes: ideas that experiments have not yet confirmed.",
    load: () => import("./string-theory/index.js"),
    loadContent: () => import("./string-theory/content.js"),
  },
];

export const findLab = (slug) => labs.find((lab) => lab.slug === slug);
