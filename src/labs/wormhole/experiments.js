import { degrees, length, num } from "../shell/format.js";
import * as physics from "./physics.js";
import { BuildScene, ExploreScene, TourScene } from "./scenes.jsx";

const throats = (v) => `${v.toFixed(2)} × throat radius`;

const place = (l) => {
  if (l > 1.5) return "On side A, approaching";
  if (l < -1.5) return "On side B";
  return "Passing the throat";
};

export default [
  {
    id: "explore",
    params: [
      { id: "l", label: "Position along the tunnel, l", type: "range", min: -4, max: 4, step: 0.05, default: 2, format: throats },
      { id: "speed", label: "Motion speed", type: "range", min: 0, max: 3, step: 0.1, default: 1, format: (v) => `${v.toFixed(1)}×` },
    ],
    Scene: ExploreScene,
    camera: { radius: 3.2, tilt: 0.42 },
    legend: [
      { color: "line", label: "Your ring" },
      { color: "accent", label: "Throat, and the two mouths" },
    ],
    caption: (v) => (v.l > 0.2 ? "Side A" : v.l < -0.2 ? "Side B" : "The throat"),
    note: "An embedding diagram of the equations. No wormhole has ever been observed.",
    outputs: (v) => [
      { label: "Position l", value: throats(v.l) },
      { label: "Circle radius r", value: throats(physics.radius(v.l, 1)) },
      { label: "Circumference", value: throats(physics.circumference(v.l, 1)) },
      { label: "Sphere area", value: `${num(physics.area(v.l, 1))} × throat radius²` },
      { label: "Surface height", value: throats(physics.height(v.l, 1)) },
    ],
  },
  {
    id: "tour",
    params: [
      { id: "l", label: "Position along the trip, l", type: "range", min: -8, max: 8, step: 0.01, default: 8, format: throats },
      { id: "speed", label: "Travel speed", type: "range", min: 0, max: 3, step: 0.1, default: 1, format: (v) => `${v.toFixed(1)}×` },
    ],
    // Travel from side A to side B, then start again.
    advance: (values, seconds) => {
      if (!values.speed) return values;
      const l = values.l - seconds * values.speed * 1.1;
      return { ...values, l: l < -8 ? 8 : l };
    },
    Scene: TourScene,
    view: "look",
    stars: false,
    dpr: 1,
    caption: (v) => place(v.l),
    note: "Drag to look around. Light bending is calculated; the two skies are invented.",
    outputs: (v) => {
      const angle = physics.throatAngle(v.l, 1);
      return [
        { label: "Where you are", value: place(v.l) },
        { label: "Position l", value: throats(v.l) },
        { label: "Circle radius here", value: throats(physics.radius(v.l, 1)) },
        v.l >= 0
          ? { label: "Window onto side B: angular radius ahead", value: degrees(angle) }
          : { label: "Window back to side A: angular radius behind", value: degrees(angle) },
      ];
    },
  },
  {
    id: "build",
    params: [{ id: "r0", label: "Throat radius", type: "range", min: 0.2, max: 2, step: 0.05, default: 1, format: (v) => `${v.toFixed(2)} m` }],
    Scene: BuildScene,
    camera: { radius: 3.1, tilt: 0.42 },
    legend: [
      { color: "line", label: "Your throat" },
      { color: "dashed", label: "A 1 m throat, for comparison" },
    ],
    caption: (v) => `Throat radius ${v.r0.toFixed(2)} m`,
    note: "The shape is computed from r0. Such a tunnel has never been observed.",
    outputs: (v) => {
      const density = physics.energyDensity(0, v.r0);
      return [
        { label: "Throat circumference", value: length(physics.circumference(0, v.r0)) },
        { label: "Throat area", value: `${num(physics.area(0, v.r0))} m²` },
        { label: "Radius 3 m along the tunnel", value: length(physics.radius(3, v.r0)) },
        { label: "Energy density at the throat", value: `${num(density)} J/m³` },
        { label: "Same, as mass density", value: `${num(density / 299792458 ** 2)} kg/m³` },
      ];
    },
  },
];
