// Turning numbers into readable text.
import { AU, LIGHT_YEAR } from "./constants.js";

const SUPERSCRIPT = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };

export function num(value, digits = 3) {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const size = Math.abs(value);
  if (size >= 1e7 || size < 1e-3) {
    let exponent = Math.floor(Math.log10(size));
    let mantissa = value / 10 ** exponent;
    if (Math.abs(Number(mantissa.toFixed(digits - 1))) >= 10) {
      mantissa /= 10;
      exponent += 1;
    }
    const power = [...String(exponent)].map((ch) => SUPERSCRIPT[ch]).join("");
    return `${mantissa.toFixed(digits - 1)} × 10${power}`;
  }
  return Number(value.toPrecision(digits)).toLocaleString("en-US", { maximumFractionDigits: 12 });
}

// A length in metres, in whichever unit reads best.
export function length(metres, digits = 3) {
  const size = Math.abs(metres);
  if (size === 0) return "0 m";
  if (size >= LIGHT_YEAR / 10) return `${num(metres / LIGHT_YEAR, digits)} light-years`;
  if (size >= AU / 2) return `${num(metres / AU, digits)} AU`;
  if (size >= 1000) return `${num(metres / 1000, digits)} km`;
  if (size >= 1) return `${num(metres, digits)} m`;
  if (size >= 0.001) return `${num(metres * 1000, digits)} mm`;
  return `${num(metres, digits)} m`;
}

export function time(seconds, digits = 3) {
  const size = Math.abs(seconds);
  if (size === 0) return "0 s";
  if (size >= 3600) return `${num(seconds / 3600, digits)} hours`;
  if (size >= 60) return `${num(seconds / 60, digits)} minutes`;
  if (size >= 1) return `${num(seconds, digits)} s`;
  if (size >= 1e-3) return `${num(seconds * 1e3, digits)} ms`;
  if (size >= 1e-6) return `${num(seconds * 1e6, digits)} µs`;
  return `${num(seconds, digits)} s`;
}

export const solarMasses = (value) => {
  if (value >= 1e9) return `${num(value / 1e9)} billion Suns`;
  if (value >= 1e6) return `${num(value / 1e6)} million Suns`;
  return `${num(value)} Suns`;
};

export const degrees = (radians, digits = 3) => `${num((radians * 180) / Math.PI, digits)}°`;
