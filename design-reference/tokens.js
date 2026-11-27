// Anveshya app design tokens, for the website and the labs.
// See README.md for which values are copied from the app and which are derived.

// COPIED from mobile/src/theme/colors.js
export const palettes = {
  dark: {
    background: "#000000",
    header: "#262624",
    primary: "#9E2A38",
    secondary: "#ECEAE3",
    text: "#ECEAE3",
    textMuted: "#A9A79F",
    inactive: "#75736C",
    card: "#30302E",
    cardAlt: "#2B2B29",
    border: "#4A4945",
    ring: "#F5F4EF",
    hairline: "rgba(236,234,227,0.10)",
    navGlass: "rgba(38,38,36,0.88)",
    navBorder: "rgba(236,234,227,0.35)",
    overlay: "rgba(0,0,0,0.5)",
    // DERIVED: maroon lightened so small text stays readable on cards.
    // (The app uses #C04A5A, which is only about 2.8:1 on a card.)
    accentText: "#DE808C",
    // COPIED from mobile/src/web/themeEngine.js
    cardRaised: "#3A3A37",
    primaryHover: "#B23342", // DERIVED: lighter maroon for hover
  },
  light: {
    background: "#FAF9F5",
    header: "#ECEAE3",
    primary: "#7D1A27",
    secondary: "#1F1E1D",
    text: "#1F1E1D",
    textMuted: "#5E5D59",
    inactive: "#8A8880",
    card: "#FFFFFF",
    cardAlt: "#F3F1EA",
    border: "#CFCDC4",
    ring: "#9A988F",
    hairline: "rgba(31,30,29,0.10)",
    navGlass: "rgba(255,255,255,0.94)",
    navBorder: "#E2DFD5",
    overlay: "rgba(0,0,0,0.3)",
    accentText: "#7D1A27",
    cardRaised: "#F3F1EA",
    primaryHover: "#96232F", // DERIVED
  },
};

// COPIED from mobile/src/theme/colors.js
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };

// DERIVED from the paddings, margins and gaps used most in the app screens.
export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 40 };

// DERIVED from the app's inline shadows:
// card  = components/TopBar.js, float = stargazing/PassAlert.js
export const shadows = {
  card: "0 4px 12px rgba(0,0,0,0.25)",
  float: "0 6px 14px rgba(0,0,0,0.4)",
};

// Family names are defined in src/theme/fonts.css.
export const fonts = {
  title: "'Anveshya Title', 'Anveshya Body', system-ui, sans-serif",
  body: "'Anveshya Body', system-ui, sans-serif",
};
