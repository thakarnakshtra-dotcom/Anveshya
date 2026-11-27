// All the words of the Black Hole lab. Yours to edit.
// math() = "Mathematical result", analogy() = "Educational analogy".
// The second argument, when given, is an equation in LaTeX.
import { analogy, math } from "../shell/text.js";

const plain = analogy(
  "A black hole is a region of space where gravity is so strong that nothing, not even light, can get out once it has crossed a boundary called the event horizon."
);

const sizeVariables = [
  math("Newton's gravitational constant.", "G"),
  math("Mass of the black hole.", "M"),
  math("Speed of light in empty space.", "c"),
  math("Radius of the event horizon, called the Schwarzschild radius.", "r_s"),
];

const noSpin = math(
  "No spin, no electric charge and nothing else nearby: the Schwarzschild solution of general relativity."
);
const spinLimit = math("Real black holes are expected to spin, which changes these distances.");

export default {
  welcomeTitle: "Welcome to the Black Hole Lab",
  welcomeText:
    "Five experiments about a black hole that does not spin: its sizes, the shape of space around it, bending light, slowed time and orbits. The numbers come from general relativity; the pictures say what they simplify.",
  examples: ["anatomy:sagittarius", "lensing:ring", "orbits:whirl"],

  experiments: {
    anatomy: {
      name: "Anatomy",
      summary: "Choose a mass and see how big the event horizon, photon sphere and innermost stable orbit become.",
      presets: [
        { id: "ten", name: "10 Suns", description: "A black hole left behind by a massive star.", values: { mass: 1 } },
        { id: "sagittarius", name: "Sagittarius A*", description: "About 4.3 million Suns, at the centre of our galaxy.", values: { mass: Math.log10(4.3e6) } },
        { id: "m87", name: "M87*", description: "About 6.5 billion Suns, imaged by the Event Horizon Telescope.", values: { mass: Math.log10(6.5e9) } },
      ],
      learn: {
        plain: [plain],
        see: [
          analogy("A black sphere marks the event horizon. The rose wire sphere is the photon sphere and the bright ring is the innermost stable circular orbit. A glowing dot of light circles on the first and a rose dot of matter on the second."),
        ],
        equations: [
          math("Event horizon radius.", "r_s = \\dfrac{2GM}{c^2}"),
          math("Photon sphere: light can circle here, on an unstable orbit.", "r_{\\text{photon}} = 1.5\\, r_s"),
          math("Innermost stable circular orbit (ISCO) for a body with mass.", "r_{\\text{ISCO}} = 3\\, r_s"),
          math("Impact parameter below which incoming light is captured.", "b_{\\text{crit}} = \\tfrac{3\\sqrt{3}}{2}\\, r_s \\approx 2.60\\, r_s"),
        ],
        variables: sizeVariables,
        assumptions: [noSpin, math("Radius here means circumference divided by 2π.")],
        meaning: [
          math("All of these distances grow in step with the mass: ten times the mass gives ten times the radius."),
          math("Inside the ISCO there is no stable circular orbit, so matter there spirals or falls in."),
        ],
        limits: [spinLimit, analogy("The horizon is not a solid surface. The black ball only marks where it is.")],
        try: ["Switch from 10 Suns to M87* and compare the horizon with the Earth's distance from the Sun."],
        ask: ["How much would the Sun have to shrink to become a black hole?"],
      },
    },

    curvature: {
      name: "Curvature",
      summary: "The shape of space around the black hole, drawn as a curved surface.",
      presets: [
        { id: "near", name: "Near the horizon", description: "Put the marker just outside the horizon.", values: { probe: 1.1 } },
        { id: "wide", name: "Wide view", description: "Show space out to 12 horizon radii.", values: { extent: 12, probe: 6 } },
      ],
      learn: {
        plain: [
          analogy("Near a black hole, distances do not add up as they would in flat space. This surface is built so that distances measured along it match distances in the space around the hole."),
        ],
        see: [
          analogy("A funnel shaped surface. Each circle is a circle around the black hole; the highlighted one is your marker. The bottom edge is the horizon."),
        ],
        equations: [
          math("Flamm's paraboloid: height of the surface at radius r.", "z(r) = 2\\sqrt{r_s\\,(r - r_s)}"),
          math("Distance along a radial line is longer than the difference in radius.", "ds = \\dfrac{dr}{\\sqrt{1 - r_s/r}}"),
          math("Length from the horizon out to radius r.", "s(r) = \\sqrt{r(r-r_s)} + r_s \\ln\\!\\left(\\sqrt{\\tfrac{r}{r_s}} + \\sqrt{\\tfrac{r}{r_s}-1}\\right)"),
        ],
        variables: [
          math("Radius: circumference of the circle divided by 2π.", "r"),
          math("Height of the drawn surface. It is not a direction in real space.", "z"),
          math("Schwarzschild radius.", "r_s"),
        ],
        assumptions: [noSpin, math("The surface shows a flat slice through the equator, at one moment of time.")],
        meaning: [
          math("The surface is steepest at the horizon and flattens far away, where space is nearly ordinary."),
          math("Two circles close to the horizon are farther apart than their circumferences suggest."),
        ],
        limits: [
          analogy("Nothing rolls down this funnel. It shows the shape of space only, not why things fall; the slowing of time matters most for that."),
          analogy("The extra direction the surface bends into is only a drawing aid."),
        ],
        try: ["Move the marker towards the horizon and watch the measured length compared with the radius difference."],
        ask: ["Why is the surface almost flat far from the black hole?"],
      },
    },

    lensing: {
      name: "Lensing",
      summary: "Follow light rays past the black hole, or see how it turns a distant source into rings and arcs.",
      presets: [
        { id: "graze", name: "Near miss", description: "A ray just outside capture winds partly around the hole.", values: { view: "paths", b: 2.65 } },
        { id: "capture", name: "Captured ray", description: "A ray aimed inside the critical distance.", values: { view: "paths", b: 2.4 } },
        { id: "ring", name: "Einstein ring", description: "Source exactly behind the lens.", values: { view: "ring", offset: 0 } },
        { id: "arcs", name: "Two arcs", description: "Source slightly to one side.", values: { view: "ring", offset: 0.5 } },
      ],
      learn: {
        plain: [analogy("Gravity bends the path of light. A massive object between us and a distant source can make the source appear in two places, stretched into arcs, or as a ring.")],
        see: [
          analogy("Light paths: rays arriving from the right bend around the black disc. The bright one is the ray you control."),
          analogy("Einstein ring: the view an observer sees. The dashed outline is where the source really is; the solid shapes are its images."),
        ],
        equations: [
          math("Path of a light ray, with u = 1/r.", "\\dfrac{d^2u}{d\\varphi^2} + u = \\tfrac{3}{2}\\, r_s u^2"),
          math("Bending angle for a ray passing far from the hole.", "\\alpha \\approx \\dfrac{4GM}{c^2 b} = \\dfrac{2 r_s}{b}"),
          math("Angular radius of the Einstein ring.", "\\theta_E = \\sqrt{\\dfrac{4GM}{c^2}\\,\\dfrac{D_{LS}}{D_L D_S}}"),
          math("Positions of the two images of a point source.", "\\theta_\\pm = \\tfrac{1}{2}\\left(\\beta \\pm \\sqrt{\\beta^2 + 4\\theta_E^2}\\right)"),
          math("Total brightening of a point source, with u = β/θ_E.", "A = \\dfrac{u^2+2}{u\\sqrt{u^2+4}}"),
        ],
        variables: [
          math("Impact parameter: how far the ray would miss the centre if it went straight.", "b"),
          math("Angle between the lens and the true source position.", "\\beta"),
          math("Distances to the lens, to the source, and between them.", "D_L,\\; D_S,\\; D_{LS}"),
        ],
        assumptions: [
          noSpin,
          math("The ring view treats the lens as a point, the bending as small and distances as ordinary straight-line distances."),
        ],
        meaning: [
          math("Light with b below about 2.60 horizon radii is captured; just above that value it can wind around the hole before leaving."),
          math("A ring appears only when source, lens and observer are lined up."),
        ],
        limits: [
          math("The ring formulas are not valid for light passing close to the horizon."),
          analogy("The ring view is magnified enormously: for a star-sized lens in our galaxy the ring is far too small to see by eye."),
        ],
        try: ["In the ring view, move the source offset from 0 outwards and watch the ring break into two arcs."],
        ask: ["Why does one image always stay outside the ring and the other inside it?"],
      },
    },

    time: {
      name: "Time",
      summary: "Compare a clock held near the black hole with one far away, and watch light stretch as it climbs out.",
      presets: [
        { id: "close", name: "Just outside", description: "At 1.05 horizon radii.", values: { r: 1.05 } },
        { id: "isco", name: "At the ISCO", description: "A clock held still at 3 horizon radii.", values: { r: 3 } },
        { id: "far", name: "Farther out", description: "At 10 horizon radii.", values: { r: 10 } },
      ],
      learn: {
        plain: [analogy("Time passes more slowly deeper in gravity. Someone far away sees a clock near a black hole running slow, and light coming from there arrives stretched to longer, redder wavelengths.")],
        see: [analogy("Two clock faces: the far one runs at the normal rate, the near one slower. The wave climbing away from the near clock grows longer as it goes.")],
        equations: [
          math("Rate of a clock held still at radius r, compared with a far clock.", "\\dfrac{d\\tau}{dt} = \\sqrt{1 - \\dfrac{r_s}{r}}"),
          math("Redshift of light sent from r to far away.", "1 + z = \\dfrac{\\lambda_{\\text{far}}}{\\lambda_{\\text{sent}}} = \\dfrac{1}{\\sqrt{1 - r_s/r}}"),
        ],
        variables: [
          math("Time on the clock near the hole.", "\\tau"),
          math("Time on the far clock.", "t"),
          math("Wavelength of the light.", "\\lambda"),
          math("Redshift.", "z"),
        ],
        assumptions: [noSpin, math("The near clock is held at a fixed radius, for example by a rocket. A clock in orbit also slows because of its speed.")],
        meaning: [math("As r approaches the horizon radius, the near clock appears to the far observer to stop, and the redshift grows without limit.")],
        limits: [
          analogy("The person next to the near clock notices nothing odd about their own time."),
          analogy("The wave and its colour are drawn for visibility; the real wave is far too short to draw."),
        ],
        try: ["Slide the radius towards 1 and watch how quickly the factor falls."],
        ask: ["If one hour passes far away, how much passes at twice the horizon radius?"],
      },
    },

    orbits: {
      name: "Orbits",
      summary: "Set a particle's energy and angular momentum and see which kind of orbit it follows.",
      presets: [
        { id: "circle", name: "Circle", description: "The lowest energy for this angular momentum.", values: { L: 4.2, E: 0.9666 } },
        { id: "ellipse", name: "Turning ellipse", description: "The long axis swings round each lap.", values: { L: 4, E: 0.973 } },
        { id: "whirl", name: "Zoom and whirl", description: "Swings in, circles close to the hole, flies out.", values: { L: 3.8, E: 0.9759 } },
        { id: "plunge", name: "Plunge", description: "Too little angular momentum to stay out.", values: { L: 3.2, E: 0.96 } },
        { id: "flyby", name: "Fly-by", description: "Comes from far away, bends, leaves.", values: { L: 4.5, E: 1.03 } },
      ],
      learn: {
        plain: [analogy("A body near a black hole can circle it, trace an ellipse whose axis slowly turns, fall in, or swing past. Its energy and angular momentum decide which.")],
        see: [analogy("The black disc is the hole, the dashed circle is the innermost stable circular orbit, and the moving dot follows the computed path. In Outputs, the curve is the effective potential and the flat line is the energy.")],
        equations: [
          math("Radial motion, in units where G = c = 1.", "\\left(\\dfrac{dr}{d\\tau}\\right)^2 = E^2 - \\left(1 - \\dfrac{2M}{r}\\right)\\left(1 + \\dfrac{L^2}{r^2}\\right)"),
          math("Shape of the path, with u = 1/r.", "\\dfrac{d^2u}{d\\varphi^2} + u = \\dfrac{M}{L^2} + 3Mu^2"),
          math("Turn of the ellipse per lap when the field is weak.", "\\Delta\\varphi \\approx \\dfrac{6\\pi GM}{c^2 a (1-e^2)}"),
        ],
        variables: [
          math("Energy of the body divided by its rest energy.", "E"),
          math("Angular momentum per unit mass, in units of GM/c.", "L"),
          math("The body's own time.", "\\tau"),
          math("Size and flatness of the ellipse.", "a,\\; e"),
        ],
        assumptions: [noSpin, math("The body is much lighter than the black hole and feels only its gravity.")],
        meaning: [
          math("Stable orbits need L of at least about 3.46 GM/c, and none lies inside 3 horizon radii."),
          math("The turning of orbits is a real effect: it adds 43 arcseconds per century to Mercury's orbit."),
        ],
        limits: [
          math("Gravitational waves, which slowly shrink real orbits, are ignored."),
          analogy("The dot moves at the pace of its own clock, sped up so you can watch it."),
        ],
        try: ["Start from Zoom and whirl, then raise the energy by tiny steps until the body is captured."],
        ask: ["Why can Newton's gravity not produce the zoom and whirl orbit?"],
      },
    },
  },
};
