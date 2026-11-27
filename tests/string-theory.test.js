import assert from "node:assert/strict";
import { test } from "node:test";
import { PLANCK_LENGTH } from "../src/labs/shell/constants.js";
import * as st from "../src/labs/string-theory/physics.js";
import { close, within } from "./helpers.js";

test("hypercubes have the right corners, edges and faces", () => {
  for (const [n, corners, edges] of [
    [3, 8, 12],
    [4, 16, 32],
    [9, 512, 2304],
  ]) {
    const cube = st.hypercube(n);
    assert.equal(cube.vertices.length, corners);
    assert.equal(cube.edges.length, edges);
    assert.equal(st.faceCount(n, 1), edges);
    for (const [a, b] of cube.edges) {
      const differing = cube.vertices[a].filter((v, i) => v !== cube.vertices[b][i]).length;
      assert.equal(differing, 1);
    }
  }
  assert.equal(st.faceCount(4, 2), 24);
  assert.equal(st.faceCount(4, 3), 8);
});

test("rotation keeps distances; projection leaves the zero layer alone", () => {
  const p = st.rotate([1, 2, 3, 4, 5], 1, 4, 0.7);
  close(Math.hypot(...p), Math.sqrt(55), 1e-12);
  assert.deepEqual(st.projectTo3D([1, 2, 3, 0, 0], 2.6), [1, 2, 3]);
  assert.deepEqual(st.projectTo3D([1, 1, 1, 1], 3), [1.5, 1.5, 1.5]);
});

test("every drawn Calabi-Yau slice point satisfies z1^n + z2^n = 1", () => {
  const raise = ([re, im], n) => {
    let result = [1, 0];
    for (let i = 0; i < n; i++) result = [result[0] * re - result[1] * im, result[0] * im + result[1] * re];
    return result;
  };
  for (let n = 2; n <= 7; n++) {
    for (let k1 = 0; k1 < n; k1++) {
      for (let k2 = 0; k2 < n; k2++) {
        for (const [x, y] of [[0, -1], [0.3, 0.8], [1.2, -0.4], [Math.PI / 2, 1]]) {
          const { z1, z2 } = st.calabiPoint(n, k1, k2, x, y);
          const a = raise(z1, n);
          const b = raise(z2, n);
          close(a[0] + b[0], 1, 1e-9, `n=${n} real`);
          close(a[1] + b[1], 0, 1e-9, `n=${n} imaginary`);
        }
      }
    }
  }
});

test("string harmonics f_n = n / (2L) sqrt(T / mu)", () => {
  close(st.waveSpeed(100, 0.01), 100, 1e-12);
  close(st.harmonic(1, 0.5, 100, 0.01), 100, 1e-12);
  close(st.harmonic(3, 0.5, 100, 0.01), 300, 1e-12);
  close(st.wavelength(4, 1), 0.5, 1e-12);
  // The guitar preset sounds the high E.
  const e = st.harmonic(1, 0.648, 73.1, 0.0004);
  close(e, 329.6, 0.4);
  assert.equal(st.nearestNote(e), "E4");
  assert.equal(st.nearestNote(440), "A4");
  assert.equal(st.nearestNote(261.63), "C4");
});

test("Kaluza-Klein energy: 197 GeV at 1e-18 m, the Planck energy at the Planck length", () => {
  within(st.kaluzaKleinEnergy(1e-18), 197.327e9, 1e-5);
  within(st.kaluzaKleinEnergy(1e-18, 2), 394.654e9, 1e-5);
  within(st.kaluzaKleinEnergy(PLANCK_LENGTH), 1.2209e28, 1e-3);
});
