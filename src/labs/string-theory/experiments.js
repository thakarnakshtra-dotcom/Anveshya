import { PLANCK_LENGTH } from "../shell/constants.js";
import { length, num } from "../shell/format.js";
import * as physics from "./physics.js";
import { CalabiScene, CompactScene, DimensionScene, HarmonicScene } from "./scenes.jsx";

const motionParam = { id: "speed", label: "Motion speed", type: "range", min: 0, max: 3, step: 0.1, default: 1, format: (v) => `${v.toFixed(1)}×` };
const LHC_ENERGY = 13.6e12; // proton collision energy, eV

function electronVolts(value) {
  if (value >= 1e12) return `${num(value / 1e12)} TeV`;
  if (value >= 1e9) return `${num(value / 1e9)} GeV`;
  return `${num(value)} eV`;
}

export default [
  {
    id: "dimensions",
    params: [
      { id: "n", label: "Dimensions", type: "range", min: 4, max: 9, step: 1, default: 4, format: (v) => `${v}` },
      { id: "hidden", label: "Turn through the extra directions", type: "toggle", default: true },
      motionParam,
    ],
    Scene: DimensionScene,
    camera: { radius: 2.6, tilt: 0.1 },
    caption: (v) => `A ${v.n}-dimensional cube`,
    note: "A projection into three dimensions; the shape is rescaled to fit.",
    outputs: (v) => [
      { label: "Dimensions", value: `${v.n}` },
      { label: "Corners", value: num(physics.faceCount(v.n, 0), 6) },
      { label: "Edges", value: num(physics.faceCount(v.n, 1), 6) },
      { label: "Square faces", value: num(physics.faceCount(v.n, 2), 6) },
      { label: "Cubes inside it", value: num(physics.faceCount(v.n, 3), 6) },
    ],
  },
  {
    id: "calabi-yau",
    params: [
      { id: "n", label: "Power n", type: "range", min: 2, max: 7, step: 1, default: 5, format: (v) => `${v}` },
      { id: "angle", label: "Projection angle", type: "range", min: 0, max: 180, step: 1, default: 45, format: (v) => `${v}°` },
      motionParam,
    ],
    Scene: CalabiScene,
    camera: { radius: 3, tilt: 0.12 },
    stars: false,
    caption: (v) => `Slice z₁ to the power ${v.n} plus z₂ to the power ${v.n} equals 1`,
    note: "A projected slice, not the full six-dimensional space.",
    outputs: (v) => [
      { label: "Power n", value: `${v.n}` },
      { label: "Sheets drawn", value: `${v.n * v.n}` },
      { label: "Projection angle", value: `${v.angle}°` },
      { label: "Special case", value: v.n === 5 ? "The quintic slice" : "A related surface" },
    ],
  },
  {
    id: "harmonics",
    params: [
      { id: "n", label: "Harmonic n", type: "range", min: 1, max: 8, step: 1, default: 1, format: (v) => `${v}` },
      { id: "length", label: "Length", type: "range", min: 0.2, max: 1.5, step: 0.001, default: 0.65, format: (v) => `${v.toFixed(3)} m` },
      { id: "tension", label: "Tension", type: "range", min: 20, max: 150, step: 0.1, default: 70, format: (v) => `${v.toFixed(1)} N` },
      { id: "density", label: "Mass per length", type: "range", min: 0.3, max: 8, step: 0.1, default: 0.4, format: (v) => `${v.toFixed(1)} g/m` },
      motionParam,
    ],
    Scene: HarmonicScene,
    camera: { across: 2.7, up: 1.7, tilt: 0 },
    stars: false,
    legend: [
      { color: "line", label: "The string" },
      { color: "accent", label: "Still points and range of swing" },
    ],
    caption: (v) => `${num(physics.harmonic(v.n, v.length, v.tension, v.density / 1000), 4)} Hz`,
    note: "The swing is enlarged and drawn far slower than the real vibration.",
    outputs: (v) => {
      const mu = v.density / 1000; // kg/m
      const f = physics.harmonic(v.n, v.length, v.tension, mu);
      return [
        { label: "Wave speed", value: `${num(physics.waveSpeed(v.tension, mu), 4)} m/s` },
        { label: "Frequency", value: `${num(f, 4)} Hz` },
        { label: "Nearest musical note", value: physics.nearestNote(f) },
        { label: "Lowest frequency (n = 1)", value: `${num(physics.harmonic(1, v.length, v.tension, mu), 4)} Hz` },
        { label: "Wavelength", value: length(physics.wavelength(v.n, v.length), 4) },
        { label: "Still points, counting the ends", value: `${v.n + 1}` },
      ];
    },
  },
  {
    id: "compact",
    params: [
      { id: "zoom", label: "Zoom", type: "range", min: 0, max: 1, step: 0.01, default: 0, format: (v) => `${Math.round(v * 100)}%` },
      { id: "radius", label: "Radius of the hidden circle", type: "range", min: -35, max: -18, step: 0.01, default: -19, format: (v) => `${num(10 ** v)} m` },
      motionParam,
    ],
    Scene: CompactScene,
    camera: { across: 3.1, up: 1.9, tilt: 0.2 },
    caption: (v) => (v.zoom < 0.25 ? "It looks like a line" : "Up close, there is a second direction"),
    note: "Not to scale: the zoom only changes the drawing.",
    outputs: (v) => {
      const radius = 10 ** v.radius;
      const energy = physics.kaluzaKleinEnergy(radius);
      return [
        { label: "Radius", value: `${num(radius)} m` },
        { label: "Compared with the Planck length", value: `${num(radius / PLANCK_LENGTH)} ×` },
        { label: "First hidden-dimension energy", value: electronVolts(energy) },
        { label: "Second", value: electronVolts(physics.kaluzaKleinEnergy(radius, 2)) },
        { label: "First energy ÷ LHC collision energy (13.6 TeV)", value: `${num(energy / LHC_ENERGY)} ×` },
      ];
    },
  },
];
