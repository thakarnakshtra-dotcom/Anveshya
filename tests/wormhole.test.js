import assert from "node:assert/strict";
import { test } from "node:test";
import * as wh from "../src/labs/wormhole/physics.js";
import { close, within } from "./helpers.js";

test("throat shape r = sqrt(l^2 + r0^2)", () => {
  close(wh.radius(0, 1.7), 1.7, 1e-12);
  close(wh.radius(3, 4), 5, 1e-12);
  close(wh.radius(-3, 4), 5, 1e-12);
  close(wh.circumference(0, 1), 2 * Math.PI, 1e-12);
  close(wh.area(0, 2), 16 * Math.PI, 1e-12);
});

test("the embedding surface keeps distances: (dr/dl)^2 + (dz/dl)^2 = 1", () => {
  const h = 1e-6;
  for (const l of [-5, -0.4, 0, 1, 8]) {
    const dr = (wh.radius(l + h, 1.3) - wh.radius(l - h, 1.3)) / (2 * h);
    const dz = (wh.height(l + h, 1.3) - wh.height(l - h, 1.3)) / (2 * h);
    close(dr * dr + dz * dz, 1, 1e-8, `l=${l}`);
  }
});

test("energy density needed at the throat is negative and falls as 1 / r0^2", (t) => {
  const one = wh.energyDensity(0, 1);
  t.diagnostic(`r0 = 1 m: ${one.toExponential(4)} J/m^3`);
  within(one, -4.8155e42, 1e-4);
  within(wh.energyDensity(0, 2), one / 4, 1e-12);
  assert.ok(wh.energyDensity(5, 1) < 0);
});

test("elliptic integral K matches known values", () => {
  close(wh.ellipticK(0), Math.PI / 2, 1e-12);
  close(wh.ellipticK(0.5), 1.685750354812596, 1e-12);
  close(wh.ellipticK(Math.SQRT1_2), 1.854074677301372, 1e-12);
});

test("integrated light rays match the exact bending, through and back", () => {
  for (const b of [0.3, 0.9, 1.5, 3, 20]) {
    const ray = wh.traceRay(b, 1, { start: 2000, stepSize: 0.002 });
    assert.equal(ray.crossed, wh.passesThrough(b, 1), `b=${b}`);
    close(ray.swept, wh.sweptAngle(b, 1), 1e-7, `b=${b}`);
  }
});

test("weak bending far from the throat is pi r0^2 / (4 b^2)", () => {
  within(wh.sweptAngle(100, 1) - Math.PI, Math.PI / 40000, 1e-3);
});

test("the window onto the other side covers half the sky at the throat", () => {
  close(wh.throatAngle(0, 1), Math.PI / 2, 1e-12);
  close(wh.throatAngle(Math.sqrt(3), 1), Math.PI / 6, 1e-12);
  within(wh.throatAngle(1000, 1), 0.001, 1e-5);
});
