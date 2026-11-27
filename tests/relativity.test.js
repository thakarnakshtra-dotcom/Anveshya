import { test } from "node:test";
import { C, TNT_KILOTON } from "../src/labs/shell/constants.js";
import * as rel from "../src/labs/relativity/physics.js";
import { close, within } from "./helpers.js";

test("Lorentz factor at 0.6c and 0.8c", () => {
  close(rel.gamma(0), 1, 1e-15);
  close(rel.gamma(0.6), 1.25, 1e-12);
  close(rel.gamma(0.8), 5 / 3, 1e-12);
});

test("time dilation and length contraction", () => {
  close(rel.dilatedTime(8, 0.6), 10, 1e-12);
  close(rel.contractedLength(100, 0.8), 60, 1e-10);
});

test("muons at 0.99c travel about 4.6 km before decaying", () => {
  close(rel.muonRange(0.99), 4622, 3);
});

test("rest energy of one gram is 8.99e13 J, about 21.5 kilotons of TNT", () => {
  within(rel.restEnergy(0.001), 8.987551787e13, 1e-9);
  close(rel.restEnergy(0.001) / TNT_KILOTON, 21.48, 0.01);
});

test("kinetic energy: exact value, Newtonian limit and energy-momentum relation", () => {
  within(rel.kineticEnergy(1, 0.6), 0.25 * C * C, 1e-12);
  within(rel.newtonianEnergy(1, 0.6), 0.18 * C * C, 1e-12);
  within(rel.kineticEnergy(1, 0.001), rel.newtonianEnergy(1, 0.001), 1e-5);
  for (const beta of [0.1, 0.9, 0.99]) {
    const total = rel.restEnergy(2) + rel.kineticEnergy(2, beta);
    within(total ** 2, (rel.momentum(2, beta) * C) ** 2 + rel.restEnergy(2) ** 2, 1e-10);
  }
});

test("GPS clocks: +45.7 gravity, -7.2 speed, +38.5 microseconds per day", (t) => {
  const h = 20200e3;
  const gain = rel.gravityGainPerDay(h) * 1e6;
  const loss = rel.speedLossPerDay(h) * 1e6;
  t.diagnostic(`gravity +${gain.toFixed(2)}, speed -${loss.toFixed(2)}, net ${(gain - loss).toFixed(2)} µs/day`);
  close(gain, 45.7, 0.2);
  close(loss, 7.2, 0.1);
  close(rel.netGainPerDay(h) * 1e6, 38.5, 0.2);
});

test("Space Station clocks run slow, and the effects cancel half an Earth radius up", () => {
  close(rel.netGainPerDay(420e3) * 1e6, -24.6, 0.2);
  close(rel.netGainPerDay(6371000 / 2) * 1e6, 0, 1e-9);
});

test("orbit speed and period: GPS about 3.87 km/s, geostationary one sidereal day", () => {
  close(rel.orbitSpeed(20200e3) / 1000, 3.87, 0.01);
  close(rel.orbitPeriod(35786e3), 86164, 30);
});
