import React from "react";
import Chart from "../shell/Chart.jsx";
import { C, MUON_LIFETIME, TNT_KILOTON } from "../shell/constants.js";
import { length, num, time } from "../shell/format.js";
import * as physics from "./physics.js";
import { EnergyScene, GravityTimeScene, LengthScene, LightClockScene } from "./scenes.jsx";

const speedOfLight = (v) => `${v.toFixed(3)} c`;
const betaParam = (fallback) => ({ id: "beta", label: "Speed", type: "range", min: 0, max: 0.995, step: 0.005, default: fallback, format: speedOfLight });
const motionParam = { id: "speed", label: "Motion speed", type: "range", min: 0, max: 3, step: 0.1, default: 1, format: (v) => `${v.toFixed(1)}×` };

const massText = (kg) => (kg < 1 ? `${num(kg * 1000)} g` : `${num(kg)} kg`);
const joules = (value) => `${num(value)} J`;
const microseconds = (seconds) => `${seconds >= 0 ? "+" : "−"}${num(Math.abs(seconds) * 1e6)} µs per day`;

function EnergyChart({ values }) {
  const betas = Array.from({ length: 100 }, (_, i) => (i / 99) * 0.99);
  return (
    <Chart
      title="Energy of motion, in units of rest energy"
      lines={[
        { label: "Relativity", points: betas.map((b) => [b, physics.gamma(b) - 1]) },
        { label: "Newton", dashed: true, points: betas.map((b) => [b, 0.5 * b * b]) },
      ]}
      marks={[[values.beta, physics.gamma(values.beta) - 1]]}
      xDomain={[0, 1]}
      yDomain={[0, 4]}
      xLabel="speed ÷ c"
      yLabel="K ÷ mc²"
      format={(v) => num(v)}
    />
  );
}

function ClockChart({ values }) {
  const heights = Array.from({ length: 121 }, (_, i) => 200 + (i / 120) * 39800);
  const line = (f) => heights.map((h) => [h / 1000, f(h * 1000) * 1e6]);
  return (
    <Chart
      title="Effect per day, by height"
      lines={[
        { label: "Net", points: line(physics.netGainPerDay) },
        { label: "Gravity gain", dashed: true, points: line(physics.gravityGainPerDay) },
        { label: "Speed loss", dashed: true, points: line(physics.speedLossPerDay) },
      ]}
      marks={[[values.altitude / 1000, physics.netGainPerDay(values.altitude * 1000) * 1e6]]}
      xDomain={[0, 40]}
      yDomain={[-30, 60]}
      xLabel="height (thousand km)"
      yLabel="µs per day"
      format={(v) => num(v)}
    />
  );
}

export default [
  {
    id: "light-clock",
    params: [betaParam(0.6), motionParam],
    Scene: LightClockScene,
    camera: { across: 3.2, up: 1.9, tilt: 0 },
    stars: false,
    legend: [
      { color: "line", label: "Clock at rest" },
      { color: "accent", label: "Moving clock and its light path" },
    ],
    caption: (v) => `The moving clock takes ${num(physics.gamma(v.beta))} times as long per tick`,
    note: "Mirrors and motion are not to scale; light is enormously slowed.",
    outputs: (v) => [
      { label: "Speed", value: speedOfLight(v.beta) },
      { label: "Lorentz factor γ", value: num(physics.gamma(v.beta), 4) },
      { label: "While your clock records 10 s, the moving one records", value: time(10 / physics.gamma(v.beta), 4) },
      { label: "A muon at this speed lasts on average", value: time(physics.dilatedTime(MUON_LIFETIME, v.beta), 4) },
      { label: "and travels", value: length(physics.muonRange(v.beta), 4) },
    ],
  },
  {
    id: "length",
    params: [betaParam(0.8), motionParam],
    Scene: LengthScene,
    camera: { across: 3.3, up: 1.9, tilt: 0.12 },
    stars: false,
    legend: [
      { color: "accent", label: "Length at rest" },
      { color: "line", label: "Length measured while moving" },
    ],
    caption: (v) => `Measured length: ${num(100 / physics.gamma(v.beta))}% of the length at rest`,
    note: "Measured positions, not what a camera would photograph.",
    outputs: (v) => [
      { label: "Speed", value: speedOfLight(v.beta) },
      { label: "Lorentz factor γ", value: num(physics.gamma(v.beta), 4) },
      { label: "A 100 m ship is measured as", value: length(physics.contractedLength(100, v.beta), 4) },
      { label: "Shorter by", value: length(100 - physics.contractedLength(100, v.beta), 4) },
    ],
  },
  {
    id: "energy",
    params: [
      { id: "mass", label: "Mass", type: "range", min: -3, max: 3, step: 0.01, default: 0, format: (v) => massText(10 ** v) },
      betaParam(0.6),
    ],
    Scene: EnergyScene,
    camera: { across: 2.6, up: 2.2, tilt: 0.22, turn: 0.35 },
    stars: false,
    Chart: EnergyChart,
    legend: [
      { color: "line", label: "Left: rest energy" },
      { color: "accent", label: "Middle: energy of motion" },
      { color: "dashed", label: "Right: Newton's formula" },
    ],
    note: "Column heights are in proportion to one another.",
    outputs: (v) => {
      const m = 10 ** v.mass;
      const kinetic = physics.kineticEnergy(m, v.beta);
      return [
        { label: "Mass", value: massText(m) },
        { label: "Rest energy mc²", value: joules(physics.restEnergy(m)) },
        { label: "Rest energy as TNT", value: `${num(physics.restEnergy(m) / TNT_KILOTON)} kilotons` },
        { label: "Energy of motion", value: joules(kinetic) },
        { label: "Newton's formula gives", value: joules(physics.newtonianEnergy(m, v.beta)) },
        { label: "Total energy", value: joules(physics.restEnergy(m) + kinetic) },
        { label: "Momentum", value: `${num(physics.momentum(m, v.beta))} kg m/s` },
      ];
    },
  },
  {
    id: "gravity-time",
    params: [
      { id: "altitude", label: "Height of the orbit", type: "range", min: 200, max: 40000, step: 1, default: 20200, format: (v) => `${v.toLocaleString("en-US")} km` },
      motionParam,
    ],
    Scene: GravityTimeScene,
    camera: { radius: 3, tilt: 0.55 },
    Chart: ClockChart,
    legend: [{ color: "accent", label: "Orbit, to scale with the Earth" }],
    caption: (v) =>
      physics.netGainPerDay(v.altitude * 1000) >= 0 ? "The orbiting clock runs fast" : "The orbiting clock runs slow",
    note: "The orbit is to scale; the satellite is enlarged and its motion speeded up.",
    outputs: (v) => {
      const h = v.altitude * 1000;
      return [
        { label: "Orbital speed", value: `${num(physics.orbitSpeed(h) / 1000)} km/s` },
        { label: "One lap takes", value: time(physics.orbitPeriod(h), 4) },
        { label: "Gain from weaker gravity", value: microseconds(physics.gravityGainPerDay(h)) },
        { label: "Loss from speed", value: microseconds(-physics.speedLossPerDay(h)) },
        { label: "Net effect", value: microseconds(physics.netGainPerDay(h)) },
        { label: "Distance light covers in that time", value: length(Math.abs(physics.netGainPerDay(h)) * C) },
      ];
    },
  },
];
