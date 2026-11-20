// Cosmic Parivar palette. Accent is maroon (no bright red); story/profile
// rings are white in dark mode and grey in light mode.
export const palettes = {
  // Pure black page background; cards, sheets and bars stay charcoal grey.
  dark: {
    mode: "dark",
    background: "#000000",
    header: "#262624", // grey top bar
    primary: "#9E2A38", // maroon, lifted slightly so it reads on charcoal
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
    navBorder: "rgba(236,234,227,0.35)", // thin off-white line
    overlay: "rgba(0,0,0,0.5)",
    bubbleMine: "#7D2230",
    bubbleTheirs: "#3A3A37",
  },
  // Warm off-white page background; cards, sheets and bars are white.
  light: {
    mode: "light",
    background: "#FAF9F5",
    header: "#ECEAE3", // grey top bar
    primary: "#7D1A27", // maroon
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
    navBorder: "#E2DFD5", // off-white line (a touch darker so it shows on white)
    overlay: "rgba(0,0,0,0.3)",
    bubbleMine: "#7D1A27",
    bubbleTheirs: "#E8E6DC",
  },
};

// Body text is thin (Poppins Light); Anallop is kept for titles/headings only.
export const fonts = {
  body: "Poppins-Light",
  bodyItalic: "Poppins-LightItalic",
  medium: "Poppins-Regular", // names, labels — still not bold
  title: "Anallop",
  titleItalic: "Anallop-Italic",
  // legacy aliases
  regular: "Anallop",
  italic: "Anallop-Italic",
};

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };
