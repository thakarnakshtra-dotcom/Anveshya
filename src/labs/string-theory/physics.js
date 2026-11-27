// Mathematics behind the String Theory lab.
// Every function is checked in tests/string-theory.test.js.
import { HBAR_C_EV_M } from "../shell/constants.js";

// ---------- cubes in many dimensions ----------

// Corners (coordinates -1 or 1) and edges of an n-dimensional cube.
export function hypercube(n) {
  const vertices = Array.from({ length: 2 ** n }, (_, i) => Array.from({ length: n }, (_, k) => ((i >> k) & 1 ? 1 : -1)));
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let k = 0; k < n; k++) {
      if (!((i >> k) & 1)) edges.push([i, i | (1 << k)]);
    }
  }
  return { vertices, edges };
}

export const choose = (n, k) => {
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return Math.round(result);
};
// Number of m-dimensional faces of an n-cube.
export const faceCount = (n, m) => 2 ** (n - m) * choose(n, m);

// Turns a point in the plane of axes i and j.
export function rotate(point, i, j, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const a = point[i];
  const b = point[j];
  point[i] = c * a - s * b;
  point[j] = s * a + c * b;
  return point;
}

// Perspective projection down to three dimensions, one dimension at a time.
export function projectTo3D(point, distance) {
  const p = point.slice();
  while (p.length > 3) {
    const depth = p.pop();
    const scale = distance / (distance - depth);
    for (let i = 0; i < p.length; i++) p[i] *= scale;
  }
  return p;
}

// ---------- a cross-section of the Calabi-Yau equation z1^n + z2^n = 1 ----------

const power = ([re, im], p) => {
  const size = Math.hypot(re, im) ** p;
  const angle = Math.atan2(im, re) * p;
  return [size * Math.cos(angle), size * Math.sin(angle)];
};
const times = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const phase = (angle) => [Math.cos(angle), Math.sin(angle)];

// Hanson's parametrisation. Patch (k1, k2), 0 <= x <= pi/2, any real y:
//   z1 = e^(2 pi i k1 / n) cos(x + iy)^(2/n),  z2 = e^(2 pi i k2 / n) sin(x + iy)^(2/n)
export function calabiPoint(n, k1, k2, x, y) {
  const cos = [Math.cos(x) * Math.cosh(y), -Math.sin(x) * Math.sinh(y)];
  const sin = [Math.sin(x) * Math.cosh(y), Math.cos(x) * Math.sinh(y)];
  return {
    z1: times(phase((2 * Math.PI * k1) / n), power(cos, 2 / n)),
    z2: times(phase((2 * Math.PI * k2) / n), power(sin, 2 / n)),
  };
}

// ---------- a vibrating string fixed at both ends ----------

export const waveSpeed = (tension, density) => Math.sqrt(tension / density); // m/s
export const harmonic = (n, length, tension, density) => (n / (2 * length)) * waveSpeed(tension, density); // Hz
export const wavelength = (n, length) => (2 * length) / n; // m

const NOTES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
// Nearest note in equal temperament with A4 = 440 Hz.
export function nearestNote(frequency) {
  const semitone = Math.round(12 * Math.log2(frequency / 440)) + 69;
  return `${NOTES[((semitone % 12) + 12) % 12]}${Math.floor(semitone / 12) - 1}`;
}

// ---------- a curled-up dimension ----------

// Energy (eV) of the n-th wave around a circle of radius R, for a field with no
// other mass: E = n * hbar c / R.
export const kaluzaKleinEnergy = (radius, n = 1) => (n * HBAR_C_EV_M) / radius;
