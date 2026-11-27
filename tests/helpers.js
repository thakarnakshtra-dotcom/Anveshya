import assert from "node:assert/strict";

// Passes when "actual" is within "tolerance" (absolute) of "expected".
export function close(actual, expected, tolerance, label = "") {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label} expected ${expected} ± ${tolerance}, got ${actual}`
  );
}

// Passes when "actual" is within a fraction of "expected".
export const within = (actual, expected, fraction, label) =>
  close(actual, expected, Math.abs(expected) * fraction, label);
