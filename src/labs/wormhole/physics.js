// The Ellis (Morris-Thorne, no gravity pull) wormhole with throat radius r0.
// Every function is checked in tests/wormhole.test.js.
import { C, G } from "../shell/constants.js";

// l is the distance along the tunnel: positive on side A, negative on side B.
export const radius = (l, r0) => Math.sqrt(l * l + r0 * r0);
// Height of the embedding surface (a catenoid).
export const height = (l, r0) => r0 * Math.asinh(l / r0);
export const circumference = (l, r0) => 2 * Math.PI * radius(l, r0);
export const area = (l, r0) => 4 * Math.PI * (l * l + r0 * r0);

// Energy density needed to hold the shape open, J/m^3. It is negative.
export const energyDensity = (l, r0) => -((C ** 4) / (8 * Math.PI * G)) * ((r0 * r0) / radius(l, r0) ** 4);

// Complete elliptic integral of the first kind, K(k), by the
// arithmetic-geometric mean.
export function ellipticK(k) {
  let a = 1;
  let b = Math.sqrt(1 - k * k);
  for (let i = 0; i < 40 && Math.abs(a - b) > 1e-15 * a; i++) {
    [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  }
  return Math.PI / (2 * a);
}

// Total angle a light ray with impact parameter b sweeps, from far away to far
// away. A ray with b < r0 goes through; one with b > r0 turns back.
export const sweptAngle = (b, r0) => (b > r0 ? 2 * ellipticK(r0 / b) : 2 * (b / r0) * ellipticK(b / r0));
export const passesThrough = (b, r0) => Math.abs(b) < r0;

// Angular radius of the throat as seen by someone at l looking towards it:
// rays inside this cone cross to the other side.
export const throatAngle = (l, r0) => Math.asin(r0 / radius(l, r0));

// Integrates a light ray starting at l = start and heading towards the throat.
// Uses the same equations as the Traversal picture:
//   dl/ds = p,  dp/ds = b^2 l / r^4,  dphi/ds = b / r^2
export function traceRay(b, r0, { start = 200, stepSize = 0.01 } = {}) {
  const derivative = ([l, p]) => {
    const r2 = l * l + r0 * r0;
    return [p, (b * b * l) / (r2 * r2), b / r2];
  };
  let y = [start, -Math.sqrt(1 - (b * b) / (start * start + r0 * r0)), 0];
  for (let i = 0; i < 2e6; i++) {
    const h = stepSize * radius(y[0], r0);
    const k1 = derivative(y);
    const k2 = derivative(y.map((v, j) => v + (k1[j] * h) / 2));
    const k3 = derivative(y.map((v, j) => v + (k2[j] * h) / 2));
    const k4 = derivative(y.map((v, j) => v + k3[j] * h));
    y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    if (Math.abs(y[0]) > start) break;
  }
  const [l, , phi] = y;
  // Add the straight stretches beyond the two ends.
  const swept = phi + Math.asin(b / radius(start, r0)) + Math.asin(b / radius(l, r0));
  return { crossed: l < 0, swept };
}
