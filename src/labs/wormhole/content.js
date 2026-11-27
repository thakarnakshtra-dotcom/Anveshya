// All the words of the Wormhole lab. Yours to edit.
// math() = "Mathematical result", analogy() = "Educational analogy".
import { analogy, math } from "../shell/text.js";

const plain = analogy(
  "A wormhole is an imagined tunnel joining two places in spacetime. The equations of general relativity can describe one, but none has ever been observed."
);

const variables = [
  math("Throat radius, the smallest circle.", "r_0"),
  math("Distance measured along the tunnel: positive on side A, negative on side B.", "l"),
  math("Radius of the circle at that place: its circumference divided by 2π.", "r"),
];

const model = math("The Ellis, or Morris–Thorne, wormhole: perfectly round, unchanging in time, and with no gravitational pull.");
const exotic = math("In general relativity, holding such a throat open needs matter with negative energy density. No known way provides it in the amount required.");

export default {
  welcomeTitle: "Welcome to the Wormhole Lab",
  welcomeText:
    "A wormhole has never been observed. Here you can study one that exists in the equations: its shape, what light would do on a trip through it, and what it would take to hold it open.",
  examples: ["explore:throat", "tour:start", "build:wide"],

  experiments: {
    explore: {
      name: "Explore",
      summary: "Move a ring along the tunnel and inspect the mouths and the throat.",
      presets: [
        { id: "a", name: "Mouth A", description: "Far out on the first side.", values: { l: 3.5 } },
        { id: "throat", name: "Throat", description: "The narrowest place.", values: { l: 0 } },
        { id: "b", name: "Mouth B", description: "Far out on the other side.", values: { l: -3.5 } },
      ],
      learn: {
        plain: [plain],
        see: [analogy("An embedding diagram: two flared sides joined at a narrow throat. The bright ring marks the place you chose. Each circle on the surface stands for a whole sphere in the real three-dimensional space.")],
        equations: [
          math("Size of the circle at distance l from the middle.", "r(l) = \\sqrt{l^2 + r_0^2}"),
          math("Height of the drawn surface.", "z(l) = r_0\\, \\operatorname{arsinh}\\!\\left(\\dfrac{l}{r_0}\\right)"),
          math("Area of the sphere at that place.", "A(l) = 4\\pi\\,(l^2 + r_0^2)"),
        ],
        variables,
        assumptions: [model, math("The diagram shows a flat slice through the equator, at one moment of time.")],
        meaning: [math("The circle is smallest at the throat and grows on both sides. Far from the middle, r is close to the size of l.")],
        limits: [exotic, analogy("The direction the surface bends into is only a drawing aid.")],
        try: ["Move from mouth A to mouth B and watch the area fall and rise again."],
        ask: ["What is r when l is zero, and why is that the smallest value?"],
      },
    },

    tour: {
      name: "Traversal tour",
      summary: "Travel from one side to the other and see what light would show you. Drag to look around.",
      presets: [
        { id: "start", name: "Start the trip", description: "Set off from side A.", values: { l: 8, speed: 1 } },
        { id: "throat", name: "At the throat", description: "Half the view shows each side.", values: { l: 0, speed: 0 } },
        { id: "far", name: "Arrived", description: "Look from side B.", values: { l: -6, speed: 0 } },
      ],
      learn: {
        plain: [analogy("As you approach, the other side appears as a round window that grows until it surrounds you. Looking back after crossing, your starting side shrinks into a window behind you.")],
        see: [
          analogy("Two invented skies: side A has cool white stars, side B warm rose stars and glowing clouds. Every dot on screen is placed by following a ray of light through the wormhole."),
        ],
        equations: [
          math("A light ray in this wormhole, with b fixed along the ray.", "\\dfrac{d^2 l}{d\\lambda^2} = \\dfrac{b^2\\, l}{(l^2 + r_0^2)^2},\\qquad \\dfrac{d\\varphi}{d\\lambda} = \\dfrac{b}{l^2 + r_0^2}"),
          math("A ray crosses to the other side when its impact parameter is smaller than the throat.", "|b| < r_0"),
          math("Angular radius of the window onto side B, seen from side A.", "\\alpha = \\arcsin\\dfrac{r_0}{\\sqrt{l^2 + r_0^2}}"),
        ],
        variables: [
          ...variables,
          math("Impact parameter of the ray.", "b"),
          math("Position along the ray.", "\\lambda"),
        ],
        assumptions: [model, math("The traveller is small, moves slowly and does not disturb the wormhole. Effects of the traveller's speed on the view are left out.")],
        meaning: [math("At the throat the window covers exactly half of the sky: one side ahead of you, the other behind.")],
        limits: [exotic, analogy("The stars and clouds are made up. Only the way the light bends is calculated.")],
        try: ["Pause at the throat and drag to look all the way round."],
        ask: ["Why does the window onto the other side look ringed with stretched stars?"],
      },
    },

    build: {
      name: "Build your own",
      summary: "Choose the throat radius and see the shape and what it would demand.",
      presets: [
        { id: "narrow", name: "Narrow", description: "A throat 0.25 m in radius.", values: { r0: 0.25 } },
        { id: "medium", name: "Medium", description: "A throat 0.8 m in radius.", values: { r0: 0.8 } },
        { id: "wide", name: "Wide", description: "A throat 1.8 m in radius.", values: { r0: 1.8 } },
      ],
      learn: {
        plain: [analogy("One number, the throat radius, sets the whole shape. A narrower throat needs an even more extreme material to hold it open.")],
        see: [analogy("The surface for your throat radius, with a faint ring showing where a 1 m throat would be.")],
        equations: [
          math("Shape of the tunnel.", "r(l) = \\sqrt{l^2 + r_0^2}"),
          math("Energy density at distance l, from Einstein's equations.", "\\rho c^2 = -\\dfrac{c^4}{8\\pi G}\\,\\dfrac{r_0^2}{(l^2 + r_0^2)^2}"),
          math("At the throat itself.", "\\rho c^2 = -\\dfrac{c^4}{8\\pi G\\, r_0^2}"),
        ],
        variables: [...variables, math("Energy density measured by someone at rest there.", "\\rho c^2"), math("Newton's constant and the speed of light.", "G,\\; c")],
        assumptions: [model],
        meaning: [math("The energy density is negative everywhere, and its size at the throat grows as 1 / r0², so small throats are the most demanding.")],
        limits: [exotic, analogy("This says what the shape would need, not that such material exists or that the tunnel would be stable.")],
        try: ["Halve the throat radius and compare the energy density at the throat."],
        ask: ["Why is a negative energy density such a problem?"],
      },
    },
  },
};
