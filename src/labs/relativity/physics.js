// Special relativity, and clock rates in Earth's gravity.
// Every function is checked in tests/relativity.test.js.
// "beta" is speed divided by the speed of light, 0 <= beta < 1.
import { C, EARTH_RADIUS, GM_EARTH, MUON_LIFETIME, SOLAR_DAY } from "../shell/constants.js";

export const gamma = (beta) => 1 / Math.sqrt(1 - beta * beta);
export const dilatedTime = (properTime, beta) => gamma(beta) * properTime;
export const contractedLength = (restLength, beta) => restLength / gamma(beta);

export const restEnergy = (mass) => mass * C * C;
// (gamma - 1) m c^2, written so that it stays accurate at low speeds.
export function kineticEnergy(mass, beta) {
  const g = gamma(beta);
  return ((beta * beta * g * g) / (g + 1)) * mass * C * C;
}
export const newtonianEnergy = (mass, beta) => 0.5 * mass * (beta * C) ** 2;
export const momentum = (mass, beta) => gamma(beta) * mass * beta * C;

// Average distance a muon travels before decaying.
export const muonRange = (beta) => beta * C * dilatedTime(MUON_LIFETIME, beta);

// ---------- a clock in a circular orbit, compared with one on the ground ----------

export const orbitRadius = (altitude) => EARTH_RADIUS + altitude; // m
export const orbitSpeed = (altitude) => Math.sqrt(GM_EARTH / orbitRadius(altitude)); // m/s
export const orbitPeriod = (altitude) => 2 * Math.PI * Math.sqrt(orbitRadius(altitude) ** 3 / GM_EARTH); // s

// Seconds gained per day because gravity is weaker higher up (weak field).
export const gravityGainPerDay = (altitude) =>
  (GM_EARTH / (C * C)) * (1 / EARTH_RADIUS - 1 / orbitRadius(altitude)) * SOLAR_DAY;
// Seconds lost per day because of orbital speed.
export const speedLossPerDay = (altitude) => ((orbitSpeed(altitude) ** 2) / (2 * C * C)) * SOLAR_DAY;
export const netGainPerDay = (altitude) => gravityGainPerDay(altitude) - speedLossPerDay(altitude);
