import assert from "node:assert/strict";
import { test } from "node:test";
import { AU, C, EARTH_RADIUS, GM_EARTH, GM_SUN, PARSEC, SOLAR_DAY, SUN_RADIUS } from "../src/labs/shell/constants.js";
import * as bh from "../src/labs/black-hole/physics.js";
import { close, within } from "./helpers.js";

const arcseconds = (radians) => (radians * 180 * 3600) / Math.PI;

test("10 solar masses: rs 29.5 km, photon sphere 44.3 km, ISCO 88.6 km", (t) => {
  const rs = bh.schwarzschildRadius(10);
  const photon = bh.photonSphereRadius(rs);
  const isco = bh.iscoRadius(rs);
  t.diagnostic(`rs = ${(rs / 1000).toFixed(2)} km`);
  t.diagnostic(`photon sphere = ${(photon / 1000).toFixed(2)} km`);
  t.diagnostic(`ISCO = ${(isco / 1000).toFixed(2)} km`);
  close(rs / 1000, 29.5, 0.05, "rs");
  close(photon / 1000, 44.3, 0.05, "photon sphere");
  close(isco / 1000, 88.6, 0.05, "ISCO");
});

test("the Sun's horizon radius is 2.95 km and the Earth's 8.87 mm", () => {
  close(bh.schwarzschildRadius(1) / 1000, 2.953, 0.001);
  close(bh.schwarzschildRadius(GM_EARTH / GM_SUN) * 1000, 8.87, 0.005);
});

test("capture impact parameter is 2.598 rs and matches the photon orbit speed", () => {
  close(bh.criticalImpact(1), 2.598076, 1e-6);
  close(bh.orbitAngularSpeed(1.5, 1), 1 / bh.criticalImpact(1), 1e-12);
});

test("Flamm's paraboloid reproduces the radial stretch 1 / (1 - rs/r)", () => {
  close(bh.flammHeight(2, 1), 2, 1e-12);
  for (const r of [1.2, 2, 5, 20]) {
    const h = 1e-6;
    const slope = (bh.flammHeight(r + h, 1) - bh.flammHeight(r - h, 1)) / (2 * h);
    within(1 + slope * slope, 1 / (1 - 1 / r), 1e-6, `r=${r}`);
  }
});

test("proper radial distance matches a numerical integral", () => {
  close(bh.properDistance(2, 1), Math.SQRT2 + Math.log(Math.SQRT2 + 1), 1e-12);
  close(bh.properDistance(1, 1), 0, 1e-12);
  for (const r of [1.1, 3, 12]) {
    // With r = rs + q^2 the integrand becomes 2 sqrt(rs + q^2), which is smooth.
    const top = Math.sqrt(r - 1);
    const n = 20000;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += 2 * Math.sqrt(1 + (((i + 0.5) / n) * top) ** 2) * (top / n);
    within(bh.properDistance(r, 1), sum, 1e-8, `r=${r}`);
  }
});

test("time factor and redshift at twice the horizon radius", () => {
  close(bh.timeFactor(2, 1), Math.SQRT1_2, 1e-12);
  close(bh.redshift(2, 1), Math.SQRT2 - 1, 1e-12);
  close(bh.receivedWavelength(500, 2, 1), 500 * Math.SQRT2, 1e-9);
  close(bh.timeFactor(1, 1), 0, 1e-12);
});

test("light grazing the Sun bends by 1.75 arcseconds", () => {
  close(arcseconds(bh.weakDeflection(SUN_RADIUS, bh.schwarzschildRadius(1))), 1.751, 0.002);
});

test("computed light paths: capture limit and weak-field bending", (t) => {
  assert.equal(bh.lightPath(2.59).captured, true);
  assert.equal(bh.lightPath(2.61).escaped, true);
  const b = 100;
  const path = bh.lightPath(b, { start: 20000, step: 0.001 });
  const m = 0.5 / b; // M / b with rs = 1
  // Known weak-field series of the exact Schwarzschild bending, to fourth order.
  const series = 4 * m + ((15 * Math.PI) / 4) * m ** 2 + (128 / 3) * m ** 3 + ((3465 * Math.PI) / 64) * m ** 4;
  t.diagnostic(`bending at b = 100 rs: computed ${path.deflection.toFixed(10)}, series ${series.toFixed(10)}`);
  close(path.deflection, series, 5e-9, "deflection");
});

test("Einstein ring of a Sun-like lens halfway to the galactic centre is about 1 mas", () => {
  const kpc = 1000 * PARSEC;
  const theta = bh.einsteinAngle(bh.schwarzschildRadius(1), 4 * kpc, 8 * kpc);
  close(arcseconds(theta) * 1000, 1.009, 0.002);
});

test("point lens image positions satisfy the lens equation", () => {
  for (const beta of [0, 0.3, 1, 2.4]) {
    const images = bh.lensImages(beta, 1);
    for (const theta of images) close(theta - 1 / theta, beta, 1e-12);
    close(images[0] * images[1], -1, 1e-12);
  }
  close(bh.magnification(1), 3 / Math.sqrt(5), 1e-12);
});

test("weak-field precession gives Mercury 43 arcseconds per century", (t) => {
  const perOrbit = bh.weakPrecession(GM_SUN, 0.387098 * AU, 0.20563);
  const perCentury = arcseconds(perOrbit) * ((36525 * SOLAR_DAY) / (87.969 * SOLAR_DAY));
  t.diagnostic(`Mercury: ${perCentury.toFixed(2)} arcseconds per century`);
  close(perCentury, 42.98, 0.05);
});

test("effective potential: ISCO and marginally bound orbit", () => {
  const isco = bh.circularRadii(Math.sqrt(12));
  close(isco.stable, 6, 1e-6);
  close(Math.sqrt(bh.potentialSquared(6, Math.sqrt(12))), Math.sqrt(8 / 9), 1e-12);
  close(bh.circularRadii(4).unstable, 4, 1e-12);
  close(bh.potentialSquared(4, 4), 1, 1e-12);
  assert.equal(bh.circularRadii(3.4), null);
});

test("integrated orbits give the expected kinds of path", () => {
  const isco = bh.orbit(Math.sqrt(8 / 9), Math.sqrt(12));
  assert.equal(isco.type, "circular");
  close(isco.closest, 6, 1e-5);
  close(isco.farthest, 6, 1e-5);
  assert.equal(bh.orbit(0.9666, 4.2).type, "circular");
  assert.equal(bh.orbit(0.973, 4).type, "bound");
  assert.equal(bh.orbit(0.96, 3.2).type, "plunge");
  assert.equal(bh.orbit(1.03, 4.5).type, "flyby");
  assert.equal(bh.orbit(1.1, 3.8).type, "plunge");
  const whirl = bh.orbit(0.9759, 3.8);
  assert.equal(whirl.type, "bound");
  assert.ok(whirl.precession > 2 * Math.PI, "zoom-whirl turns more than a full circle per lap");
});

test("integrated precession agrees with the weak-field formula far from the hole", () => {
  // Energy and angular momentum for turning points at 600 and 300 (G = c = M = 1).
  const [far, near] = [600, 300];
  const L2 = (2 / far - 2 / near) / ((1 - 2 / far) / far ** 2 - (1 - 2 / near) / near ** 2);
  const E = Math.sqrt((1 - 2 / far) * (1 + L2 / far ** 2));
  const result = bh.orbit(E, Math.sqrt(L2), { step: 0.002 });
  close(result.closest, near, 0.5);
  const p = (2 * far * near) / (far + near);
  within(result.precession, (6 * Math.PI) / p, 0.02, "precession");
});

test("constants used are physical", () => {
  assert.equal(C, 299792458);
  assert.ok(EARTH_RADIUS > 6.3e6);
});
