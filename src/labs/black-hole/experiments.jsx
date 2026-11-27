import React from "react";
import Chart from "../shell/Chart.jsx";
import { AU, C, EARTH_RADIUS, PARSEC, SUN_RADIUS } from "../shell/constants.js";
import { degrees, length, num, solarMasses, time } from "../shell/format.js";
import * as physics from "./physics.js";
import { AnatomyScene, CurvatureScene, LensingScene, OrbitScene, TimeScene } from "./scenes.jsx";

const radiusOf = (exponent) => physics.schwarzschildRadius(10 ** exponent);
const radii = (value) => `${num(value)} × horizon radius`;
const massParam = (extra = {}) => ({
  id: "mass",
  label: "Mass",
  type: "range",
  min: 0.5,
  max: 10,
  step: 0.01,
  default: 1,
  format: (v) => solarMasses(10 ** v),
  ...extra,
});
const speedParam = { id: "speed", label: "Motion speed", type: "range", min: 0, max: 3, step: 0.1, default: 1, format: (v) => `${v.toFixed(1)}×` };

function compareSize(rs) {
  if (rs < EARTH_RADIUS) return `${num(rs / EARTH_RADIUS)} × Earth's radius`;
  if (rs < AU / 2) return `${num(rs / SUN_RADIUS)} × Sun's radius`;
  return `${num(rs / AU)} × Earth–Sun distance`;
}

const band = (nm) => (nm > 750 ? "infrared" : nm < 380 ? "ultraviolet" : "visible");
const milliarcseconds = (radians) => (radians * 180 * 3600 * 1000) / Math.PI;

const ORBIT_NAMES = { circular: "Circle", bound: "Bound orbit", plunge: "Falls in", flyby: "Flies past" };

function PotentialChart({ values }) {
  const points = [];
  for (let r = 2.05; r <= 40; r += 0.2) points.push([r / 2, Math.sqrt(physics.potentialSquared(r, values.L))]);
  // Frame the part of the curve where the energy line meets it.
  const circle = physics.circularRadii(values.L);
  const floor = circle ? Math.sqrt(physics.potentialSquared(circle.stable, values.L)) : 0.95;
  const peak = circle ? Math.sqrt(physics.potentialSquared(circle.unstable, values.L)) : 1;
  const low = Math.min(floor, values.E) - 0.012;
  const high = Math.max(Math.min(peak, 1.12), values.E, 1) + 0.012;
  return (
    <Chart
      title="Effective potential and energy"
      lines={[
        { label: "Effective potential", points },
        { label: "Energy", dashed: true, points: [[1, values.E], [20, values.E]] },
      ]}
      xDomain={[1, 20]}
      yDomain={[low, high]}
      xLabel="radius (horizon radii)"
      yLabel="energy"
      format={(v) => num(v)}
    />
  );
}

export default [
  {
    id: "anatomy",
    params: [massParam(), speedParam],
    Scene: AnatomyScene,
    camera: { radius: 2.9, tilt: 0.38 },
    legend: [
      { color: "dark", label: "Event horizon" },
      { color: "accent", label: "Photon sphere, 1.5 × horizon" },
      { color: "line", label: "Innermost stable orbit, 3 × horizon" },
    ],
    caption: (v) => `Horizon radius: ${length(radiusOf(v.mass))}`,
    note: "Sizes are in true proportion to each other. The motion is slowed down.",
    outputs: (v) => {
      const rs = radiusOf(v.mass);
      return [
        { label: "Mass", value: solarMasses(10 ** v.mass) },
        { label: "Event horizon radius", value: length(rs) },
        { label: "Photon sphere radius", value: length(physics.photonSphereRadius(rs)) },
        { label: "Innermost stable orbit radius", value: length(physics.iscoRadius(rs)) },
        { label: "Light is captured if aimed within", value: length(physics.criticalImpact(rs)) },
        { label: "Horizon compared", value: compareSize(rs) },
        { label: "Light travels one horizon radius in", value: time(rs / C) },
      ];
    },
  },
  {
    id: "curvature",
    params: [
      { id: "probe", label: "Marker radius", type: "range", min: 1, max: 12, step: 0.05, default: 2.5, format: radii },
      { id: "extent", label: "Show space out to", type: "range", min: 4, max: 12, step: 0.5, default: 8, format: radii },
      massParam({ label: "Mass (sets the distances in km)" }),
    ],
    Scene: CurvatureScene,
    camera: { radius: 3, tilt: 0.5 },
    legend: [
      { color: "line", label: "Marker circle and horizon" },
      { color: "accent", label: "Space far from the hole" },
    ],
    note: "The surface shows true radial distances. Its depth is not a direction in real space.",
    outputs: (v) => {
      const rs = radiusOf(v.mass);
      const r = Math.min(v.probe, v.extent) * rs;
      const along = physics.properDistance(r, rs);
      return [
        { label: "Marker radius", value: length(r) },
        { label: "Circumference of the marker circle", value: length(2 * Math.PI * r) },
        { label: "Surface height above the horizon", value: length(physics.flammHeight(r, rs)) },
        { label: "Radius minus horizon radius", value: length(r - rs) },
        { label: "Measured length from horizon to marker", value: length(along) },
        { label: "Measured length ÷ radius difference", value: r > rs ? num(along / (r - rs)) : "—" },
      ];
    },
  },
  {
    id: "lensing",
    params: [
      {
        id: "view",
        label: "View",
        type: "choice",
        default: "paths",
        options: [
          { value: "paths", label: "Light paths" },
          { value: "ring", label: "Einstein ring" },
        ],
      },
      { id: "b", label: "Ray's miss distance, b", type: "range", min: 1, max: 7, step: 0.01, default: 3.2, format: radii, when: (v) => v.view === "paths" },
      { ...speedParam, when: (v) => v.view === "paths" },
      { id: "offset", label: "Source offset", type: "range", min: 0, max: 2.5, step: 0.01, default: 0.4, format: (v) => `${num(v)} × ring radius`, when: (v) => v.view === "ring" },
      { id: "size", label: "Source size", type: "range", min: 0.04, max: 0.5, step: 0.01, default: 0.15, format: (v) => `${num(v)} × ring radius`, when: (v) => v.view === "ring" },
      massParam({ id: "mass", label: "Lens mass", min: -1, default: 0, when: (v) => v.view === "ring" }),
      { id: "distance", label: "Distance to lens (source at 8 kpc)", type: "range", min: 0.5, max: 7.5, step: 0.1, default: 4, format: (v) => `${v.toFixed(1)} kpc`, when: (v) => v.view === "ring" },
    ],
    Scene: LensingScene,
    stars: false,
    camera: (v) => ({ radius: v.view === "ring" ? 2.5 : 3.3, tilt: 0 }),
    legend: (v) =>
      v.view === "ring"
        ? [
            { color: "line", label: "Images the observer sees" },
            { color: "dashed", label: "Einstein ring and true source" },
          ]
        : [
            { color: "line", label: "Your ray" },
            { color: "accent", label: "Other rays and photon sphere (dashed)" },
          ],
    note: "Paths are computed from the equations. Light is slowed for the eye.",
    outputs: (v) => {
      const rs = radiusOf(v.mass);
      if (v.view === "ring") {
        const kpc = 1000 * PARSEC;
        const thetaE = physics.einsteinAngle(rs, v.distance * kpc, 8 * kpc);
        const [outer, inner] = physics.lensImages(v.offset * thetaE, thetaE);
        return [
          { label: "Einstein ring angular radius", value: `${num(milliarcseconds(thetaE))} milliarcseconds` },
          { label: "Ring radius at the lens", value: length(thetaE * v.distance * kpc) },
          { label: "Outer image position", value: `${num(milliarcseconds(outer))} mas` },
          { label: "Inner image position", value: `${num(milliarcseconds(inner))} mas` },
          { label: "Brightening of a point source", value: v.offset > 0 ? `${num(physics.magnification(v.offset))} ×` : "Very large (perfect alignment)" },
        ];
      }
      const path = physics.lightPath(v.b);
      return [
        { label: "Miss distance b", value: radii(v.b) },
        { label: "What happens", value: path.captured ? "Captured by the black hole" : path.escaped ? "Bends and escapes" : "Circles the hole" },
        { label: "Bending angle (computed)", value: path.escaped ? degrees(path.deflection) : "—" },
        { label: "Far-field estimate 2rs/b", value: degrees(physics.weakDeflection(v.b, 1)) },
        { label: "Capture limit", value: radii(physics.criticalImpact(1)) },
      ];
    },
  },
  {
    id: "time",
    params: [
      { id: "r", label: "Radius of the near clock", type: "range", min: 1.01, max: 10, step: 0.01, default: 2, format: radii },
      { id: "wavelength", label: "Light sent at", type: "range", min: 380, max: 700, step: 5, default: 500, format: (v) => `${v} nm` },
      massParam({ label: "Mass (sets the distance in km)" }),
      speedParam,
    ],
    Scene: TimeScene,
    camera: { across: 3, up: 1.7, tilt: 0 },
    legend: [
      { color: "accent", label: "Clock near the black hole" },
      { color: "line", label: "Clock far away" },
    ],
    caption: (v) => `The near clock runs at ${num(100 * physics.timeFactor(v.r, 1))}% of the far clock's rate`,
    note: "Distances and the wave are not to scale. Colors are approximate.",
    outputs: (v) => {
      const factor = physics.timeFactor(v.r, 1);
      const received = physics.receivedWavelength(v.wavelength, v.r, 1);
      return [
        { label: "Near clock distance from centre", value: length(v.r * radiusOf(v.mass)) },
        { label: "Time factor", value: num(factor, 4) },
        { label: "While 1 hour passes far away, near clock records", value: time(3600 * factor) },
        { label: "Redshift z", value: num(physics.redshift(v.r, 1), 4) },
        { label: "Light arrives far away at", value: `${num(received, 4)} nm (${band(received)})` },
      ];
    },
  },
  {
    id: "orbits",
    params: [
      { id: "L", label: "Angular momentum L", type: "range", min: 2.5, max: 6, step: 0.01, default: 4, format: (v) => `${v.toFixed(2)} GM/c` },
      { id: "E", label: "Energy E", type: "range", min: 0.94, max: 1.08, step: 0.0001, default: 0.973, format: (v) => `${v.toFixed(4)} mc²` },
      speedParam,
    ],
    Scene: OrbitScene,
    camera: { radius: 3.1, tilt: 1.05 },
    Chart: PotentialChart,
    legend: [
      { color: "line", label: "Path of the body" },
      { color: "dashed", label: "Innermost stable circular orbit" },
    ],
    caption: (v) => {
      const result = physics.orbit(v.E, v.L);
      return result.tooLow ? "Energy is too low for an orbit here: showing the circle" : ORBIT_NAMES[result.type];
    },
    note: "The path is computed from general relativity, drawn to scale.",
    outputs: (v) => {
      const result = physics.orbit(v.E, v.L);
      const circle = physics.circularRadii(v.L);
      return [
        { label: "Kind of path", value: ORBIT_NAMES[result.type] },
        { label: "Closest distance", value: radii(result.closest / 2) },
        { label: "Farthest distance", value: result.type === "flyby" ? "Leaves for good" : radii(result.farthest / 2) },
        { label: "Turn of the orbit per lap", value: result.precession === null ? "—" : degrees(result.precession) },
        { label: "Lowest energy for an orbit at this L", value: circle ? `${Math.sqrt(physics.potentialSquared(circle.stable, v.L)).toFixed(4)} mc²` : "No stable orbit" },
      ];
    },
  },
];
