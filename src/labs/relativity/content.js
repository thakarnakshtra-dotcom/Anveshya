// All the words of the Relativity lab. Yours to edit.
// math() = "Mathematical result", analogy() = "Educational analogy".
import { analogy, math } from "../shell/text.js";

const speedVariables = [
  math("Speed of the moving object relative to the observer.", "v"),
  math("Speed of light in empty space.", "c"),
  math("The Lorentz factor.", "\\gamma = \\dfrac{1}{\\sqrt{1 - v^2/c^2}}"),
];
const steady = math("Special relativity: steady speed in a straight line, with gravity ignored.");

export default {
  welcomeTitle: "Welcome to the Relativity Lab",
  welcomeText:
    "Four experiments from Einstein's theory: moving clocks, shrinking lengths, energy and mass, and clocks in orbit around the Earth.",
  examples: ["light-clock:fast", "energy:fast", "gravity-time:gps"],

  experiments: {
    "light-clock": {
      name: "Light clock",
      summary: "A clock that ticks each time light bounces between two mirrors. Set it moving.",
      presets: [
        { id: "rest", name: "At rest", description: "Both clocks tick together.", values: { beta: 0 } },
        { id: "half", name: "0.6 c", description: "The moving clock takes 1.25 times as long per tick.", values: { beta: 0.6 } },
        { id: "fast", name: "0.9 c", description: "The longer light path is easy to see.", values: { beta: 0.9 } },
      ],
      learn: {
        plain: [analogy("Light travels at the same speed for everyone. In a moving clock it has farther to go between the mirrors, so you see that clock tick more slowly.")],
        see: [analogy("The left clock is at rest. The right one moves, and its pulse of light traces a zigzag. Both pulses move at the same speed on screen.")],
        equations: [
          math("Time between ticks as measured by you.", "\\Delta t = \\gamma\\, \\Delta\\tau"),
          math("From the triangle made by the light path.", "(c\\,\\Delta t)^2 = (c\\,\\Delta\\tau)^2 + (v\\,\\Delta t)^2"),
        ],
        variables: [math("Time between ticks recorded by the moving clock.", "\\Delta\\tau"), math("Time between those ticks measured by you.", "\\Delta t"), ...speedVariables],
        assumptions: [steady, math("The mirrors are arranged across the direction of motion.")],
        meaning: [math("Time dilation applies to every process, not only light clocks: unstable particles moving fast live longer as measured in the laboratory.")],
        limits: [analogy("The speed of light on screen is slowed enormously."), math("Each observer measures the other's clock running slow; comparing clocks side by side again needs one of them to turn round.")],
        try: ["Set 0.6 c and count how many ticks each clock makes."],
        ask: ["Why would the zigzag be impossible to explain if light could move faster in the moving clock?"],
      },
    },

    length: {
      name: "Length contraction",
      summary: "See how the measured length of a moving ship shrinks along its motion.",
      presets: [
        { id: "rest", name: "At rest", description: "Full length.", values: { beta: 0 } },
        { id: "mid", name: "0.8 c", description: "Measured at 60% of its length.", values: { beta: 0.8 } },
        { id: "fast", name: "0.99 c", description: "About one seventh of its length.", values: { beta: 0.99 } },
      ],
      learn: {
        plain: [analogy("If you measure a fast moving object, noting where its two ends are at the same moment of your time, you find it shorter along its direction of travel.")],
        see: [analogy("The faint ship shows the length at rest. The bright ship below is moving; only its length along the motion changes.")],
        equations: [math("Measured length of a moving object.", "L = \\dfrac{L_0}{\\gamma}")],
        variables: [math("Length measured at rest with the object.", "L_0"), math("Length you measure while it moves.", "L"), ...speedVariables],
        assumptions: [steady],
        meaning: [math("The width and height across the motion are unchanged. Nothing is squeezed as felt by those on board.")],
        limits: [analogy("This shows measured positions, not a photograph. A camera would record a different, apparently rotated shape, because light from each part takes a different time to arrive.")],
        try: ["Raise the speed slowly. Notice how little happens below half the speed of light."],
        ask: ["For the people on board, which of the two of you is shortened?"],
      },
    },

    energy: {
      name: "Energy and mass",
      summary: "Compare rest energy with the energy of motion, in relativity and in Newton's physics.",
      presets: [
        { id: "gram", name: "One gram", description: "At rest.", values: { mass: -3, beta: 0 } },
        { id: "slow", name: "0.1 c", description: "Newton is still close.", values: { mass: 0, beta: 0.1 } },
        { id: "fast", name: "0.95 c", description: "Energy of motion exceeds rest energy.", values: { mass: 0, beta: 0.95 } },
      ],
      learn: {
        plain: [analogy("Mass is itself a store of energy. Speeding something up costs more and more energy as it nears the speed of light.")],
        see: [analogy("Three columns: rest energy, the energy of motion in relativity, and what Newton's formula would give.")],
        equations: [
          math("Rest energy.", "E_0 = mc^2"),
          math("Total energy and energy of motion.", "E = \\gamma mc^2, \\qquad K = (\\gamma - 1)\\, mc^2"),
          math("Newton's formula, good at low speeds.", "K_{\\text{Newton}} = \\tfrac{1}{2} m v^2"),
          math("Energy, momentum and mass together.", "E^2 = (pc)^2 + (mc^2)^2"),
        ],
        variables: [math("Mass of the body.", "m"), math("Momentum.", "p"), ...speedVariables],
        assumptions: [math("A single body moving freely, with no gravity.")],
        meaning: [math("Reaching the speed of light would need unlimited energy, so a body with mass cannot reach it.")],
        limits: [analogy("Rest energy is not all available to use: ordinary reactions release only a tiny part of it.")],
        try: ["Compare the two energy of motion columns at 0.1 c and at 0.9 c."],
        ask: ["How many times the rest energy is the energy of motion at 0.99 c?"],
      },
    },

    "gravity-time": {
      name: "Gravity and time",
      summary: "How fast a clock in orbit runs compared with a clock on the ground.",
      presets: [
        { id: "iss", name: "Space Station", description: "About 420 km up.", values: { altitude: 420 } },
        { id: "balance", name: "Balance point", description: "The two effects cancel.", values: { altitude: 3186 } },
        { id: "gps", name: "GPS satellite", description: "About 20,200 km up.", values: { altitude: 20200 } },
        { id: "geo", name: "Geostationary", description: "35,786 km up.", values: { altitude: 35786 } },
      ],
      learn: {
        plain: [analogy("Higher up, gravity is weaker and a clock runs faster. Moving fast in orbit makes it run slower. Which effect wins depends on the height.")],
        see: [analogy("The Earth and a satellite, with the orbit drawn to scale. In Outputs, the curve shows the net effect at every height.")],
        equations: [
          math("Gain from weaker gravity, as a fraction of time.", "\\dfrac{\\Delta t_g}{t} \\approx \\dfrac{GM}{c^2}\\left(\\dfrac{1}{R} - \\dfrac{1}{r}\\right)"),
          math("Loss from orbital speed.", "\\dfrac{\\Delta t_v}{t} \\approx \\dfrac{v^2}{2c^2}, \\qquad v^2 = \\dfrac{GM}{r}"),
        ],
        variables: [math("Mass of the Earth and Newton's constant.", "M,\\; G"), math("Radius of the Earth.", "R"), math("Radius of the orbit.", "r"), math("Orbital speed.", "v")],
        assumptions: [math("A round Earth, a circular orbit, weak gravity, and a ground clock whose own small motion from the Earth's spin is ignored.")],
        meaning: [
          math("A GPS satellite clock gains about 38 microseconds a day. Without a correction, positions would drift by kilometres each day."),
          math("On the Space Station the speed effect wins and clocks fall behind ground clocks."),
        ],
        limits: [analogy("The satellite's motion on screen is speeded up."), math("Real satellite orbits are slightly oval and the Earth is slightly flattened, which adds small corrections.")],
        try: ["Find the height where the net effect changes sign."],
        ask: ["Why does the speed effect get weaker the higher the orbit is?"],
      },
    },
  },
};
