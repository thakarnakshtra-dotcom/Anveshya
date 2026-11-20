// The live Anveshya website, shown inside the app's Explore / Learn / News
// tabs so every page, section and 3D scene is exactly what anveshya.space has.
import { ANALLOP_BASE64 } from "./anallopFont";
import { ENGINE_JS } from "./themeEngine";

export const SITE_URL = "https://anveshya.space";

// The app already has its own top bar and bottom navbar, so the website's
// header, slide-out menu, footer and desktop-only extras are hidden, and the
// space the fixed header used to reserve is pulled back up.
export const APP_CSS = `
  .site-header, .nav-mobile-menu, .nav-mobile-backdrop, .footer,
  .custom-cursor-layer, .feedback-modal-overlay { display: none !important; }
  html, body { -webkit-tap-highlight-color: transparent; }
  /* The site sets overflow-x:hidden on html AND body, which turns body into
     its own scroll box — the page then always reports "at top", and Android's
     WebView swallows downward swipes. clip hides sideways overflow the same
     way without creating a scroll box, so the document scrolls normally. */
  html { overflow-x: hidden !important; }
  body, #root { overflow-x: clip !important; overflow-y: visible !important; }
  body { cursor: auto !important; }
  /* The site's header is hidden in the app, so the 3D sections' title bar
     (eyebrow, hint, Return / Menu) no longer needs to sit 82-96px down;
     lift it so it doesn't overlap the 3D scene. */
  .topbar, .panch-topbar, .andro-topbar, .sapt-topbar, .stf-topbar { top: 14px !important; }
`;

// Runs before the website's own scripts: skip the site's intro animation and
// its auto feedback popup (the app has its own splash), add APP_CSS, then
// start the theme engine that restyles the site to match the app.
export function buildBeforeLoadJs(theme) {
  return `
  (function () {
    try {
      sessionStorage.setItem("anveshya-intro-seen", "1");
      sessionStorage.setItem("anveshya-feedback-shown", "true");
    } catch (e) {}
    window.__ANV_THEME = ${JSON.stringify(theme === "light" ? "light" : "dark")};
    window.__ANV_ANALLOP = ${JSON.stringify(ANALLOP_BASE64)};
    var css = ${JSON.stringify(APP_CSS)};
    function add() {
      if (document.getElementById("anveshya-app-css")) return;
      var s = document.createElement("style");
      s.id = "anveshya-app-css";
      s.textContent = css;
      (document.head || document.documentElement).appendChild(s);
    }
    add();
    document.addEventListener("DOMContentLoaded", add);
  })();
  ${ENGINE_JS}
  true;
`;
}

// Called when the app's light/dark mode changes while a page is open.
export function themeSwitchJs(theme) {
  return `window.__anvSetTheme && window.__anvSetTheme(${JSON.stringify(theme === "light" ? "light" : "dark")}); true;`;
}

// What each app tab shows. Every website route has a home in the app.
export const SECTIONS = {
  Explore: [
    { key: "explorer", label: "Solar System", path: "/explorer", interactive3d: true },
    { key: "solarshield", label: "Solar Shield", path: "/solarshield" },
  ],
  Learn: [
    { key: "learn", label: "Learn", path: "/learn" },
    { key: "sounds", label: "Sounds of Space", path: "/learn/sounds" },
  ],
  News: [{ key: "news", label: "News & Events", path: "/news" }],
};
