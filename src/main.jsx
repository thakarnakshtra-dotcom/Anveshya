import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./theme/fonts.css";
import "./styles.css";
import { themeVars } from "./theme/themeVars.js";

// The app's colors, radii and fonts, available to every stylesheet.
Object.entries(themeVars("dark")).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
