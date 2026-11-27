// All the words of the String Theory lab. Yours to edit.
// math() = "Mathematical result", analogy() = "Educational analogy".
import { analogy, math } from "../shell/text.js";

const plain = analogy(
  "String theory proposes that the smallest building blocks of nature are tiny vibrating strings, and that space has more dimensions than the three we notice. No experiment has confirmed it."
);

export default {
  welcomeTitle: "Welcome to the String Theory Lab",
  welcomeText:
    "Four experiments around ideas used in string theory. The mathematics shown is real; whether nature uses it this way is not known.",
  examples: ["dimensions:four", "calabi-yau:quintic", "harmonics:guitar"],

  experiments: {
    dimensions: {
      name: "Higher dimensions",
      summary: "Turn a cube that has 4 to 9 dimensions and look at its shadow in three.",
      presets: [
        { id: "four", name: "Tesseract", description: "The four-dimensional cube.", values: { n: 4 } },
        { id: "six", name: "Six", description: "As many as the hidden ones in superstring theory.", values: { n: 6 } },
        { id: "nine", name: "Nine", description: "All the space dimensions of superstring theory.", values: { n: 9 } },
      ],
      learn: {
        plain: [plain, analogy("We cannot picture four or more dimensions of space, but we can calculate with them and draw their shadows, as a drawing of a cube is a shadow on paper.")],
        see: [analogy("Lines and corners of a many-dimensional cube, rotating and projected down to three dimensions. Parts that are nearer in a hidden direction look bigger.")],
        equations: [
          math("Number of corners and edges of an n-dimensional cube.", "V = 2^n, \\qquad E = n\\, 2^{\\,n-1}"),
          math("Number of m-dimensional faces.", "F_m = 2^{\\,n-m} \\binom{n}{m}"),
          math("Perspective projection removing one dimension.", "x_i' = \\dfrac{d}{d - x_n}\\, x_i"),
        ],
        variables: [math("Number of dimensions.", "n"), math("Viewing distance used for the projection.", "d")],
        assumptions: [math("Ordinary flat (Euclidean) space with n directions at right angles.")],
        meaning: [analogy("Superstring theories are consistent in ten dimensions of spacetime: nine of space and one of time. The extra ones must be hidden, for example by being curled up very small.")],
        limits: [analogy("The hidden dimensions proposed in string theory are not big flat cubes. This experiment only builds a feeling for counting dimensions.")],
        try: ["Switch off the hidden-direction turning and compare how the shape moves."],
        ask: ["How many corners does the cube gain each time you add a dimension?"],
      },
    },

    "calabi-yau": {
      name: "Calabi–Yau",
      summary: "A two-dimensional slice of the equation behind a Calabi–Yau shape, drawn in three dimensions.",
      presets: [
        { id: "quintic", name: "Quintic", description: "n = 5, the best known picture.", values: { n: 5, angle: 45 } },
        { id: "cubic", name: "Cubic", description: "n = 3, simpler to follow.", values: { n: 3, angle: 45 } },
        { id: "seven", name: "Seven", description: "n = 7, many sheets.", values: { n: 7, angle: 30 } },
      ],
      learn: {
        plain: [analogy("In many versions of string theory the six hidden dimensions form a special kind of shape called a Calabi–Yau space. Its full form cannot be drawn, so this is a slice of it.")],
        see: [analogy("Interlocking sheets, n × n of them, coloured in two tones. They are the solutions of one equation in two complex numbers, projected into three dimensions.")],
        equations: [
          math("The quintic Calabi–Yau space: five complex coordinates, up to a common factor.", "z_0^5 + z_1^5 + z_2^5 + z_3^5 + z_4^5 = 0"),
          math("The slice that is drawn.", "z_1^{\\,n} + z_2^{\\,n} = 1"),
          math("How the sheets are traced out.", "z_1 = e^{2\\pi i k_1/n}\\cos(x+iy)^{2/n}, \\quad z_2 = e^{2\\pi i k_2/n}\\sin(x+iy)^{2/n}"),
          math("Projection into three dimensions.", "(\\operatorname{Re} z_1,\\; \\operatorname{Re} z_2,\\; \\cos\\theta\\, \\operatorname{Im} z_1 + \\sin\\theta\\, \\operatorname{Im} z_2)"),
        ],
        variables: [math("Complex numbers.", "z_1,\\; z_2"), math("Sheet labels, from 0 to n − 1.", "k_1,\\; k_2"), math("Projection angle.", "\\theta")],
        assumptions: [math("Only a slice is shown: other coordinates are held fixed, and the surface is cut off at a finite size.")],
        meaning: [analogy("In string theory the shape of the hidden space would decide which particles and forces appear in our world.")],
        limits: [
          analogy("This is a shadow of a slice, not the six-dimensional space itself. Places where sheets seem to cross are caused by the projection."),
          analogy("Which Calabi–Yau shape, if any, describes nature is unknown."),
        ],
        try: ["Change the projection angle and watch apparent crossings move."],
        ask: ["Why are there n × n sheets?"],
      },
    },

    harmonics: {
      name: "String harmonics",
      summary: "The patterns an ordinary stretched string can hold, and their frequencies.",
      presets: [
        { id: "guitar", name: "Guitar high E", description: "A 64.8 cm string tuned near 330 Hz.", values: { n: 1, length: 0.648, tension: 73.1, density: 0.4 } },
        { id: "third", name: "Third harmonic", description: "Three loops, three times the frequency.", values: { n: 3 } },
        { id: "loose", name: "Loose heavy string", description: "A low note.", values: { n: 1, tension: 30, density: 5 } },
      ],
      learn: {
        plain: [analogy("A guitar string can only vibrate in patterns that fit between its fixed ends. String theory borrows the idea: different vibrations of one string would appear as different particles.")],
        see: [analogy("A string standing in the pattern you chose. The dots mark points that stay still.")],
        equations: [
          math("Frequencies of a string fixed at both ends.", "f_n = \\dfrac{n}{2L}\\sqrt{\\dfrac{T}{\\mu}}"),
          math("Shape of the standing wave.", "y(x,t) = A\\,\\sin\\!\\left(\\dfrac{n\\pi x}{L}\\right)\\cos(2\\pi f_n t)"),
          math("Speed of waves on the string, and the wavelength.", "v = \\sqrt{T/\\mu}, \\qquad \\lambda_n = \\dfrac{2L}{n}"),
        ],
        variables: [
          math("A whole number: 1, 2, 3 and so on.", "n"),
          math("Length of the string.", "L"),
          math("Tension.", "T"),
          math("Mass per unit length.", "\\mu"),
        ],
        assumptions: [math("A perfectly flexible string, small vibrations, both ends held still, no friction.")],
        meaning: [math("Only whole-number patterns fit, so the frequencies come in equal steps.")],
        limits: [
          analogy("This is a classical string, not the quantum, relativistic strings of string theory."),
          analogy("The vibration is drawn much slower than it really is."),
        ],
        try: ["Double the tension and see by how much the frequency rises."],
        ask: ["What must you do to the length to raise the note by one octave?"],
      },
    },

    compact: {
      name: "Compact dimension",
      summary: "Zoom in on a line to find a tiny curled-up dimension, and see what energy would reveal it.",
      presets: [
        { id: "far", name: "From far away", description: "It looks like a line.", values: { zoom: 0 } },
        { id: "near", name: "Close up", description: "The line is really a tube.", values: { zoom: 1 } },
        { id: "planck", name: "Planck size", description: "A radius equal to the Planck length.", values: { zoom: 1, radius: -34.79 } },
      ],
      learn: {
        plain: [analogy("A hosepipe seen from far away looks like a line. Up close it has a second direction that goes round. Hidden dimensions could be like that, only unimaginably small.")],
        see: [analogy("A tube whose thickness grows as you zoom. Dots move both along it and around it.")],
        equations: [
          math("Only whole numbers of waves fit around the circle, so momentum comes in steps.", "p = \\dfrac{n\\hbar}{R}"),
          math("Energy of those states for a field with no other mass.", "E_n = \\dfrac{n\\,\\hbar c}{R}"),
        ],
        variables: [math("Radius of the curled-up dimension.", "R"), math("Number of waves around the circle.", "n"), math("Reduced Planck constant and speed of light.", "\\hbar,\\; c")],
        assumptions: [math("One extra dimension in the shape of a circle (the Kaluza–Klein idea), with everything else flat.")],
        meaning: [math("The smaller the circle, the more energy is needed to notice it. No such states have been seen in experiments.")],
        limits: [analogy("The picture is not to scale: any such dimension would be far smaller than an atomic nucleus."), analogy("String theory allows more complicated hidden shapes than a circle.")],
        try: ["Shrink the radius and compare the first energy with the energy of the Large Hadron Collider."],
        ask: ["Why can a very small dimension go unnoticed?"],
      },
    },
  },
};
