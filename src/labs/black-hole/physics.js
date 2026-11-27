// Physics of a black hole with no spin and no charge (Schwarzschild).
// Every function is checked in tests/black-hole.test.js.
import { C, GM_SUN } from "../shell/constants.js";

// ---------- sizes ----------

export const schwarzschildRadius = (solarMasses) => (2 * GM_SUN * solarMasses) / (C * C); // m
export const photonSphereRadius = (rs) => 1.5 * rs;
export const iscoRadius = (rs) => 3 * rs;
export const criticalImpact = (rs) => ((3 * Math.sqrt(3)) / 2) * rs;
// Angular speed, seen from far away, of a circular orbit (c = 1).
export const orbitAngularSpeed = (r, rs) => Math.sqrt(rs / (2 * r ** 3));

// ---------- curvature: Flamm's paraboloid ----------

export const flammHeight = (r, rs) => 2 * Math.sqrt(rs * (r - rs));
// Length measured along a radial line from the horizon out to r.
export function properDistance(r, rs) {
  const q = r / rs;
  return rs * (Math.sqrt(q * (q - 1)) + Math.log(Math.sqrt(q) + Math.sqrt(q - 1)));
}

// ---------- time ----------

// Rate of a clock held still at r, compared with a clock very far away.
export const timeFactor = (r, rs) => Math.sqrt(1 - rs / r);
export const redshift = (r, rs) => 1 / timeFactor(r, rs) - 1;
export const receivedWavelength = (emitted, r, rs) => emitted / timeFactor(r, rs);

// ---------- light ----------

export const weakDeflection = (b, rs) => (2 * rs) / b; // radians, for b much larger than rs

// One classical fourth-order Runge-Kutta step for y' = f(y), y an array.
function rk4(y, h, f) {
  const add = (a, b, k) => a.map((v, i) => v + b[i] * k);
  const k1 = f(y);
  const k2 = f(add(y, k1, h / 2));
  const k3 = f(add(y, k2, h / 2));
  const k4 = f(add(y, k3, h));
  return y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

// Path of a light ray in units of rs. It starts at distance "start", moving
// inward, with impact parameter b, and obeys u'' = -u + 1.5 u^2 with u = 1/r.
export function lightPath(b, { start = 12, step = 0.004, maxPhi = 8 * Math.PI } = {}) {
  let u = 1 / start;
  let phi = Math.asin(Math.min(1, b / start));
  let y = [u, Math.sqrt(Math.max(0, 1 / (b * b) - u * u + u * u * u))];
  const points = [[start * Math.cos(phi), start * Math.sin(phi)]];
  let captured = false;
  let escaped = false;

  while (phi < maxPhi) {
    y = rk4(y, step, ([v, dv]) => [dv, -v + 1.5 * v * v]);
    phi += step;
    u = y[0];
    if (u >= 1) {
      captured = true;
      points.push([Math.cos(phi), Math.sin(phi)]);
      break;
    }
    if (y[1] < 0 && u <= 1 / start) {
      escaped = true;
      points.push([Math.cos(phi) / u, Math.sin(phi) / u]);
      break;
    }
    points.push([Math.cos(phi) / u, Math.sin(phi) / u]);
  }

  // Total bending, adding the straight stretch beyond the final point.
  const deflection = escaped ? phi + Math.asin(Math.min(1, b * u)) - Math.PI : null;
  return { points, captured, escaped, deflection };
}

// ---------- gravitational lensing by a point mass ----------

// Angular radius of the Einstein ring, in radians. Distances in the same unit
// as rs; straight-line (not cosmological) distances.
export const einsteinAngle = (rs, toLens, toSource) =>
  Math.sqrt((2 * rs * (toSource - toLens)) / (toLens * toSource));

// The two image positions for a source at angle beta from the lens.
export function lensImages(beta, thetaE) {
  const root = Math.sqrt(beta * beta + 4 * thetaE * thetaE);
  return [(beta + root) / 2, (beta - root) / 2];
}

// Total brightening of a point source, u = beta / thetaE.
export const magnification = (u) => (u * u + 2) / (u * Math.sqrt(u * u + 4));

// ---------- orbits of a body with mass, units G = c = M = 1 (rs = 2) ----------

export const potentialSquared = (r, L) => (1 - 2 / r) * (1 + (L * L) / (r * r));

// Radii of the two possible circular orbits for angular momentum L.
export function circularRadii(L) {
  if (L * L < 12 - 1e-9) return null; // below this there is no circular orbit
  const root = L * Math.sqrt(Math.max(0, L * L - 12));
  return { unstable: (L * L - root) / 2, stable: (L * L + root) / 2 };
}

// Perihelion advance per orbit for a weak field, radians (SI units in).
export const weakPrecession = (GM, a, e) => (6 * Math.PI * GM) / (C * C * a * (1 - e * e));

// Farthest point of an orbit with E < 1 that starts outside the horizon.
function outerTurningPoint(E, L) {
  const allowed = (r) => E * E - potentialSquared(r, L) >= 0;
  let high = Math.max(4000, 4 / (1 - E * E));
  let low = high;
  while (low > 2.0001 && !allowed(low)) {
    high = low;
    low = Math.max(2.0001, low * 0.997);
  }
  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    if (allowed(mid)) low = mid;
    else high = mid;
  }
  return low;
}

// Integrates an orbit. E is energy per rest energy, L angular momentum in
// GM/c per unit mass. Returns points as [r, angle, proper time].
export function orbit(E, L, { maxPhi = 12 * Math.PI, step = 0.003, far = 60 } = {}) {
  const circular = circularRadii(L);
  let tooLow = false;
  let isCircular = false;
  let r0;

  const lowest = circular ? Math.sqrt(potentialSquared(circular.stable, L)) : null;
  if (circular && E < 1 && E <= lowest + 3e-5) {
    // At (or below) the lowest energy for an orbit: show the circular orbit.
    isCircular = true;
    tooLow = E < lowest - 2e-4;
    r0 = circular.stable;
  } else if (E >= 1) {
    r0 = Math.max(far, circular ? 2 * circular.stable : 0);
  } else {
    r0 = outerTurningPoint(E, L);
  }

  const f = (u) => (E * E - 1) / (L * L) + (2 * u) / (L * L) - u * u + 2 * u * u * u;
  let y = [1 / r0, isCircular ? 0 : Math.sqrt(Math.max(0, f(1 / r0))), 0]; // u, du/dphi, tau
  let phi = 0;
  const points = [[r0, 0, 0]];
  const apocentres = [];
  let captured = false;
  let escaped = false;
  let closest = r0;
  let farthest = r0;
  const escapeU = 1 / (r0 * 1.0001);

  while (phi < maxPhi) {
    const previous = y;
    y = isCircular
      ? [y[0], 0, y[2] + (step * 1) / (y[0] * y[0] * L)]
      : rk4(y, step, ([u, du]) => [du, 1 / (L * L) - u + 3 * u * u, 1 / (u * u * L)]);
    phi += step;
    const [u, du, tau] = y;
    if (u >= 0.5) {
      captured = true;
      points.push([2, phi, tau]);
      closest = 2;
      break;
    }
    if (u <= 0 || (E >= 1 && du < 0 && u <= escapeU)) {
      escaped = true;
      break;
    }
    // du turning from negative to positive marks a farthest point.
    if (!isCircular && previous[1] < 0 && du >= 0) {
      apocentres.push(phi - step + (step * -previous[1]) / (du - previous[1]));
    }
    const r = 1 / u;
    closest = Math.min(closest, r);
    farthest = Math.max(farthest, r);
    points.push([r, phi, tau]);
  }

  let type = "bound";
  if (isCircular) type = "circular";
  else if (captured) type = "plunge";
  else if (escaped) type = "flyby";

  const precession = type === "bound" && apocentres.length ? apocentres[0] - 2 * Math.PI : null;
  return { type, tooLow, points, closest, farthest, precession, energy: isCircular ? lowest : E };
}
