import { fonts, palettes, radius, shadows, spacing } from "../../design-reference/tokens.js";

const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// CSS custom properties (--anv-*) for one theme, usable as a React style prop.
export function themeVars(mode = "dark") {
  const vars = {};
  Object.entries(palettes[mode] || palettes.dark).forEach(([key, value]) => {
    vars[`--anv-${kebab(key)}`] = value;
  });
  Object.entries(radius).forEach(([key, value]) => {
    vars[`--anv-radius-${key}`] = `${value}px`;
  });
  Object.entries(spacing).forEach(([key, value]) => {
    vars[`--anv-space-${key}`] = `${value}px`;
  });
  Object.entries(shadows).forEach(([key, value]) => {
    vars[`--anv-shadow-${key}`] = value;
  });
  vars["--anv-font-title"] = fonts.title;
  vars["--anv-font-body"] = fonts.body;
  return vars;
}
