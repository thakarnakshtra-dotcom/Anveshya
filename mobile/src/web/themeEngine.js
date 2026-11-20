// Runs inside the anveshya.space WebView and restyles the website to look like
// the app (palette, cards, maroon accent, Poppins Light body / Anallop titles)
// without touching its content or features.
//
// The site has no CSS variables — ~5,500 lines of hard-coded colours — so a
// stylesheet override can't reliably cover it. Instead this reads each
// element's *computed* colours/fonts and maps them onto the app palette with
// inline !important styles, re-applies when React adds or re-classes nodes,
// and fully re-applies when the app switches light/dark.
//
// Written as a plain string (String.raw keeps regex backslashes) because
// Hermes release builds don't keep function source, so fn.toString() can't
// be used to ship code into the page. Do not use template literals or "${"
// inside the engine body.

export const ENGINE_JS = String.raw`
(function () {
  // Tells the app the page is fully restyled, so it can lift its loading cover.
  function notifyReady() {
    try { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage("anv-ready"); } catch (e) {}
  }
  // Injected more than once per load on purpose (start + end of load, as a
  // safety net on Android); only the first run sets up, later runs just
  // confirm readiness.
  if (window.__anvEngine) { if (window.__anvIsReady) notifyReady(); return; }
  window.__anvEngine = true;

  var PAL = {
    dark:  { panel: "rgba(48,48,46,0.94)", grip: "rgba(236,234,227,0.35)", bg: "#000000", card: "#30302E", card2: "#3A3A37", text: "#ECEAE3", muted: "#A9A79F", hair: "rgba(236,234,227,0.12)", accent: "#C04A5A", accentBg: "#9E2A38", onAccent: "#FFFFFF", input: "#262624" },
    light: { panel: "rgba(255,255,255,0.95)", grip: "rgba(31,30,29,0.25)", bg: "#FAF9F5", card: "#FFFFFF", card2: "#F3F1EA", text: "#1F1E1D", muted: "#5E5D59", hair: "rgba(31,30,29,0.12)", accent: "#7D1A27", accentBg: "#7D1A27", onAccent: "#FFFFFF", input: "#F3F1EA" }
  };
  var theme = window.__ANV_THEME === "light" ? "light" : "dark";
  var P = PAL[theme];
  var SKIP_TAGS = { CANVAS: 1, IMG: 1, VIDEO: 1, IFRAME: 1, PICTURE: 1, SOURCE: 1, SCRIPT: 1, STYLE: 1, LINK: 1, META: 1, BR: 1, HEAD: 1, TITLE: 1, NOSCRIPT: 1 };
  var SVG_SHAPES = { path: 1, circle: 1, rect: 1, line: 1, polyline: 1, polygon: 1, ellipse: 1, text: 1, tspan: 1, g: 1 };
  var touched = [];
  var applying = false;
  var onAccentSet = new WeakSet(); // elements painted maroon -> their text goes white

  // ---------- colour helpers ----------
  function parse(c) {
    if (!c) return null;
    var m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function info(c) {
    var r = c.r / 255, g = c.g / 255, b = c.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2;
    var d = max - min;
    var s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return { l: l, s: s, d: d, a: c.a };
  }
  function isAccent(i) { return i.s > 0.35 && i.d > 0.16 && i.l > 0.18 && i.l < 0.93; }
  function withAlpha(hex, a) {
    if (a >= 0.99) return hex;
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }

  // ---------- per-element bookkeeping (so styles can be undone/re-applied) ----------
  function setP(el, prop, val) {
    if (!el.__anvOrig) { el.__anvOrig = {}; touched.push(el); }
    if (!(prop in el.__anvOrig)) el.__anvOrig[prop] = [el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)];
    el.style.setProperty(prop, val, "important");
  }
  function restore(el) {
    var o = el.__anvOrig;
    if (!o) return;
    for (var k in o) {
      if (o[k][0]) el.style.setProperty(k, o[k][0], o[k][1]);
      else el.style.removeProperty(k);
    }
    el.__anvOrig = null;
  }

  // ---------- what to hide ----------
  function shouldHide(el, cs) {
    var cls = typeof el.className === "string" ? el.className : "";
    if (/(^|\s)(background-objects|custom-cursor-layer|site-header|nav-mobile-menu|nav-mobile-backdrop|footer)(\s|$)/.test(cls)) return true;
    // decorative fixed layers (ambient glow, blurred moons, ring badge) — keep only the shooting-star layer
    if (cs.position === "fixed" && cs.pointerEvents === "none") {
      if (el.querySelector(".shooting-star")) return false;
      if (el.style.zIndex === "1" && el.style.overflow === "hidden") return false; // ShootingStars container
      if ((el.textContent || "").trim()) return false; // never hide anything with words (e.g. 3D labels)
      if (el.querySelector("canvas")) return el.getBoundingClientRect().width < 90; // ring badge yes, 3D scene no
      return true;
    }
    // News "Stay In The Loop" email-alerts block
    if (el.tagName === "SECTION") {
      var eb = el.querySelector(".section-eyebrow");
      if (eb && /stay in the loop/i.test(eb.textContent || "")) return true;
    }
    return false;
  }
  function isStarLayer(el) {
    return el.style && el.style.zIndex === "1" && el.style.overflow === "hidden" && el.style.position === "fixed";
  }

  // ---------- read phase ----------
  function read(el) {
    var cs = getComputedStyle(el);
    var r = {
      el: el,
      hide: shouldHide(el, cs),
      color: parse(cs.color),
      bg: parse(cs.backgroundColor),
      bgImg: cs.backgroundImage,
      borders: [parse(cs.borderTopColor), parse(cs.borderRightColor), parse(cs.borderBottomColor), parse(cs.borderLeftColor)],
      bw: [parseFloat(cs.borderTopWidth), parseFloat(cs.borderRightWidth), parseFloat(cs.borderBottomWidth), parseFloat(cs.borderLeftWidth)],
      radius: parseFloat(cs.borderTopLeftRadius) || 0,
      pos: cs.position,
      fontSize: parseFloat(cs.fontSize) || 14,
      fontFamily: cs.fontFamily || "",
      fontWeight: parseInt(cs.fontWeight, 10) || 400,
      shadow: cs.boxShadow !== "none",
      tshadow: cs.textShadow !== "none",
      backdrop: cs.backdropFilter && cs.backdropFilter !== "none",
      fill: null, stroke: null,
      wide: false,
      isSvg: el instanceof SVGElement
    };
    if (r.isSvg && SVG_SHAPES[el.tagName]) { r.fill = parse(cs.fill); r.stroke = parse(cs.stroke); }
    if (!r.isSvg && ((r.bg && r.bg.a > 0) || (r.bgImg && r.bgImg !== "none"))) {
      var rect = el.getBoundingClientRect();
      r.w = rect.width;
      r.h = rect.height;
      r.wide = rect.width >= window.innerWidth * 0.9;
    }
    return r;
  }

  // ---------- write phase ----------
  function mapText(c) {
    var i = info(c);
    if (isAccent(i)) return withAlpha(P.accent, c.a);
    if (i.l < 0.3) return null; // dark text: decided by its background (handled in apply)
    return withAlpha(i.l > 0.78 ? P.text : P.muted, c.a);
  }
  // 3D views are "space": they stay in the dark palette in both themes.
  var SPACE_SEL = ".stf-stage,.sapt-stage,.andro-stage,.panch-stage,.solar-system";
  function apply(r) {
    var P0 = P;
    if (theme === "light" && r.el.closest && r.el.closest(SPACE_SEL)) P = PAL.dark;
    try { applyInner(r); } finally { P = P0; }
  }
  function applyInner(r) {
    var el = r.el;
    if (r.hide) { setP(el, "display", "none"); return; }
    if (isStarLayer(el)) { setP(el, "z-index", "-1"); if (theme === "light") setP(el, "filter", "invert(1) brightness(0.6)"); return; }
    var tag = el.tagName;
    var lightBg = false;
    if (el.matches && el.matches(SPACE_SEL)) setP(el, "background-color", "#000000");
    // selected tabs / toggles look like the app's: solid maroon, white text
    var selected = !r.isSvg && (el.classList.contains("active") || el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-pressed") === "true") &&
      (tag === "BUTTON" || tag === "A" || el.getAttribute("role") === "tab");
    if (selected) {
      onAccentSet.add(el);
      setP(el, "background-color", P.accentBg);
      setP(el, "background-image", "none");
      setP(el, "color", P.onAccent);
      setP(el, "border-color", P.accentBg);
      setP(el, "box-shadow", "none");
      setP(el, "font-family", "'Poppins', system-ui, sans-serif");
      setP(el, "font-weight", "400");
      return;
    }

    // backgrounds
    // Only small things (badges, chips, buttons, bar fills) become solid
    // maroon; anything card-sized becomes a normal app card.
    var role = el.getAttribute("role");
    var interactive = tag === "BUTTON" || tag === "A" || role === "button" || role === "tab";
    var small = (r.w || 0) < window.innerWidth * 0.5 && (r.h || 0) < 90;
    // floating overlays (3D info panels etc.) — never see-through
    var overlay = (r.pos === "absolute" || r.pos === "fixed") && (r.w || 0) > 160 && (r.h || 0) > 60 &&
      (r.h || 0) < window.innerHeight * 0.8; // full-screen stages are backgrounds, not panels
    // the site's info panels (.info-panel, .stf-panel, ...) are panels even when not positioned themselves
    if (!overlay && typeof el.className === "string" && /(^|\s)[a-z]+(-[a-z]+)*-?panel(\s|$)/.test(el.className) && (r.w || 0) > 160) overlay = true;
    if (r.bg && r.bg.a > 0.02) {
      var bi = info(r.bg);
      if (isAccent(bi)) {
        if (small) { setP(el, "background-color", P.accentBg); lightBg = true; }
        else setP(el, "background-color", P.card);
      } else if (bi.l > 0.75 && r.bg.a > 0.6) {
        if (interactive || small) { setP(el, "background-color", P.accentBg); lightBg = true; } // white pills/buttons -> maroon
        else setP(el, "background-color", P.card);
      }
      else if (bi.l < 0.2 && r.bg.a > 0.5) setP(el, "background-color", overlay ? P.panel : r.wide ? "transparent" : P.card);
      else setP(el, "background-color", r.bg.a >= 0.12 ? P.card2 : P.card);
    }
    if (lightBg) onAccentSet.add(el);
    else {
      // text inside a maroon badge (e.g. a <span> in a chip) must stay readable
      var pe = el.parentElement;
      for (var up = 0; pe && up < 3; up++, pe = pe.parentElement) if (onAccentSet.has(pe)) { lightBg = true; break; }
    }
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") setP(el, "background-color", P.input);

    // gradients → flat app surfaces (keep real images)
    if (r.bgImg && r.bgImg !== "none" && r.bgImg.indexOf("url(") === -1) {
      setP(el, "background-image", "none");
      if ((!r.bg || r.bg.a <= 0.02) && (r.radius > 0 || r.bw[0] > 0)) {
        if (overlay) setP(el, "background-color", P.panel);
        else if (!r.wide) setP(el, "background-color", P.card);
      }
    }

    // text
    if (r.color && r.color.a > 0) {
      var t = mapText(r.color);
      if (t) setP(el, "color", t);
      else setP(el, "color", lightBg ? P.onAccent : P.text);
      if (lightBg) setP(el, "color", P.onAccent);
    }

    // borders
    var sides = ["top", "right", "bottom", "left"];
    for (var s = 0; s < 4; s++) {
      var b = r.borders[s];
      if (r.bw[s] > 0 && b && b.a > 0) setP(el, "border-" + sides[s] + "-color", isAccent(info(b)) ? P.accent : P.hair);
    }

    if (r.shadow) setP(el, "box-shadow", "none");
    if (r.tshadow) setP(el, "text-shadow", "none");
    if (overlay && (r.backdrop || (r.bgImg && r.bgImg !== "none"))) { setP(el, "backdrop-filter", "blur(14px)"); setP(el, "-webkit-backdrop-filter", "blur(14px)"); }
    else if (r.backdrop) setP(el, "backdrop-filter", "none");

    // fonts: titles in Anallop, everything else Poppins Light (never bold)
    if (!r.isSvg && r.fontFamily.indexOf("Devanagari") === -1) {
      var heading = /^H[1-3]$/.test(tag) || r.fontSize >= 22;
      setP(el, "font-family", heading ? "'AnvAnallop', 'Poppins', system-ui, sans-serif" : "'Poppins', system-ui, sans-serif");
      setP(el, "font-weight", heading ? "400" : (r.fontWeight >= 500 ? "400" : "300"));
      if (heading) setP(el, "letter-spacing", "0.01em");
    }

    // svg icons/diagrams: light strokes/fills follow the text colour, accents go maroon
    if (r.isSvg) {
      if (r.fill && r.fill.a > 0) { var fi = info(r.fill); if (isAccent(fi)) setP(el, "fill", P.accent); else if (fi.l > 0.6) setP(el, "fill", withAlpha(P.text, r.fill.a)); }
      if (r.stroke && r.stroke.a > 0) { var si = info(r.stroke); if (isAccent(si)) setP(el, "stroke", P.accent); else if (si.l > 0.6) setP(el, "stroke", withAlpha(P.text, r.stroke.a)); }
    }
  }

  function collect(root, out) {
    if (!root || root.nodeType !== 1) return;
    if (SKIP_TAGS[root.tagName] || root.id === "anv-stars" || (root.classList && (root.classList.contains("shooting-star") || root.classList.contains("anv-star")))) return;
    out.push(root);
    var kids = root.children;
    for (var i = 0; i < kids.length; i++) collect(kids[i], out);
  }

  function processRoots(roots) {
    applying = true;
    // The site fades colours over ~0.16s. Reading a colour mid-fade (e.g. a
    // light-mode white card while switching back to dark) mis-maps it, so
    // transitions are switched off while we restyle.
    var docEl = document.documentElement;
    docEl.classList.add("anv-notrans");
    var els = [];
    for (var i = 0; i < roots.length; i++) collect(roots[i], els);
    for (var j = 0; j < els.length; j++) restore(els[j]);
    var reads = [];
    for (var k = 0; k < els.length; k++) reads.push(read(els[k]));
    for (var m = 0; m < reads.length; m++) apply(reads[m]);
    void docEl.offsetHeight;
    setTimeout(function () { docEl.classList.remove("anv-notrans"); }, 60);
    applying = false;
  }


  // Layout fixes for the site's phone layout inside the app (theme-agnostic
  // except the grabber colour, substituted for GRIP).
  var LAYOUT_CSS =
    /* 3D info panels -> clean bottom sheets above the 3D labels */
    ".stf-panel,.panch-panel,.andro-panel,.sapt-panel{top:auto!important;left:10px!important;right:10px!important;bottom:10px!important;width:auto!important;max-height:44vh!important;border-radius:22px!important;padding:2px 18px 18px!important;z-index:2147483000!important;overscroll-behavior:contain;box-shadow:0 -6px 30px rgba(0,0,0,0.25)!important;}" +
    ".stf-panel.panel-collapsed,.panch-panel.panel-collapsed,.andro-panel.panel-collapsed,.sapt-panel.panel-collapsed{max-height:62px!important;}" +
    ".panel-collapse-toggle{display:block!important;margin:0 0 12px!important;padding:10px 0 10px!important;letter-spacing:0.12em!important;font-size:10px!important;}" +
    ".panel-collapse-toggle::before{content:'';display:block;width:40px;height:4px;border-radius:2px;background:GRIP;margin:0 auto 9px;}" +
    ".info-panel-stage{top:auto!important;left:10px!important;right:10px!important;bottom:10px!important;align-items:flex-end!important;justify-content:center!important;z-index:2147483000!important;}" +
    ".info-panel{width:100%!important;max-height:46vh!important;border-radius:22px!important;padding:18px!important;}" +
    /* 3D title bars: one tidy left-aligned column */
    ".panch-topbar,.andro-topbar,.sapt-topbar,.stf-topbar{left:16px!important;right:16px!important;flex-direction:column!important;align-items:flex-start!important;gap:10px!important;}" +
    ".panch-topbar>*,.andro-topbar>*,.sapt-topbar>*,.stf-topbar>*{margin-left:0!important;}" +
    ".stf-mode-badge-wrap{flex-direction:row!important;align-items:center!important;gap:10px!important;}" +
    /* Solar System: menu button + one-row scale switch */
    ".topbar{left:12px!important;right:12px!important;transform:none!important;max-width:none!important;display:flex!important;flex-wrap:wrap!important;gap:8px!important;align-items:center!important;}" +
    ".topbar-controls{display:flex!important;align-items:center!important;gap:8px!important;width:100%!important;}" +
    ".scale-toggle{display:flex!important;grid-template-columns:none!important;flex:1 1 auto!important;min-width:0!important;padding:3px!important;gap:2px!important;}" +
    ".scale-toggle button{flex:1 1 0!important;min-width:0!important;min-height:34px!important;padding:0 6px!important;font-size:12px!important;letter-spacing:0!important;}" +
    /* pill toggles: always one row; 2-option toggles split evenly, longer ones scroll */
    ".section-toggle{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;max-width:100%!important;scrollbar-width:none;gap:3px!important;padding:4px!important;border-radius:999px!important;}" +
    ".section-toggle::-webkit-scrollbar{display:none;}" +
    ".section-toggle>button{flex:0 0 auto!important;white-space:nowrap!important;min-height:36px!important;padding:7px 14px!important;font-size:13px!important;letter-spacing:0.01em!important;border-radius:999px!important;}" +
    ".section-toggle:not(:has(>button:nth-child(3)))>button{flex:1 1 0!important;white-space:normal!important;line-height:1.2!important;text-align:center!important;padding:7px 10px!important;}" +
    ".astro-filter{flex-wrap:nowrap!important;}" +
    ".section-toggle:has(>button:nth-child(3)){-webkit-mask-image:linear-gradient(90deg,#000 82%,transparent);mask-image:linear-gradient(90deg,#000 82%,transparent);padding-right:28px!important;}";

  // ---------- page-level CSS (fonts, page bg, placeholders) ----------
  function baseCss() {
    return "@font-face{font-family:'AnvAnallop';src:url(data:font/ttf;base64," + (window.__ANV_ANALLOP || "") + ") format('truetype');unicode-range:U+0000-002F,U+003A-FFFF;}" +
      "html{background:" + P.bg + "!important;color:" + P.text + "!important;}" +
      "body,#root{background:transparent!important;color:" + P.text + "!important;}" +
      "::placeholder{color:" + P.muted + "!important;opacity:1!important;}" +
      "::selection{background:" + P.accentBg + ";color:#fff;}" +
      "a{color:inherit;}" +
      "html.anv-notrans *,html.anv-notrans *::before,html.anv-notrans *::after{transition:none!important;}" +
      ".anv-star{position:absolute;height:2px;border-radius:999px;background:linear-gradient(90deg," + (theme === "light" ? "rgba(31,30,29,0.75),rgba(31,30,29,0)" : "rgba(240,232,214,0.95),rgba(240,232,214,0)") + ");transform:rotate(35deg);opacity:0;animation-name:anv-fly;animation-timing-function:ease-in;animation-fill-mode:forwards;}" +
      LAYOUT_CSS.split("GRIP").join(P.grip) +
      "@keyframes anv-fly{0%{opacity:0;transform:rotate(35deg) translateX(0);}15%{opacity:0.9;}75%{opacity:0.7;}100%{opacity:0;transform:rotate(35deg) translateX(280px);}}";
  }
  function ensureStyle() {
    var s = document.getElementById("anv-theme-css");
    if (!s) {
      s = document.createElement("style");
      s.id = "anv-theme-css";
      (document.head || document.documentElement).appendChild(s);
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;1,300&display=swap";
      (document.head || document.documentElement).appendChild(l);
    }
    s.textContent = baseCss();
  }

  // ---------- keep up with React ----------
  var pending = [];
  var scheduled = false;
  function schedule(node) {
    pending.push(node);
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      var roots = pending.filter(function (n) { return n.isConnected; });
      pending = [];
      if (roots.length) processRoots(roots);
    });
  }
  // More shooting stars than the site's own (one every 2-3s): a star every
  // 0.5-1.2s across the whole screen. Runs regardless of Reduce motion.
  var starLayer = null;
  function spawnStar() {
    setTimeout(spawnStar, 500 + Math.random() * 700);
    if (document.hidden || !document.body) return;
    if (!starLayer || !starLayer.isConnected) {
      starLayer = document.createElement("div");
      starLayer.id = "anv-stars";
      starLayer.setAttribute("aria-hidden", "true");
      starLayer.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;";
      document.body.appendChild(starLayer);
    }
    var st = document.createElement("span");
    st.className = "anv-star";
    var dur = 1.3 + Math.random() * 0.9;
    st.style.cssText = "top:" + (Math.random() * 85) + "vh;left:" + (-10 + Math.random() * 90) + "vw;width:" + (50 + Math.random() * 60) + "px;animation-duration:" + dur + "s;";
    starLayer.appendChild(st);
    setTimeout(function () { st.remove(); }, dur * 1000 + 100);
  }

  function start() {
    ensureStyle();
    spawnStar();
    processRoots([document.body]);
    // let React's first render land and get restyled before revealing the page
    setTimeout(function () { processRoots([document.body]); window.__anvIsReady = true; notifyReady(); }, 120);
    new MutationObserver(function (muts) {
      if (applying) return;
      for (var i = 0; i < muts.length; i++) {
        var mu = muts[i];
        if (mu.type === "childList") {
          if (mu.target.id === "anv-stars") continue;
          for (var j = 0; j < mu.addedNodes.length; j++) if (mu.addedNodes[j].nodeType === 1) schedule(mu.addedNodes[j]);
        } else if (mu.type === "attributes") {
          schedule(mu.target);
        }
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-selected", "aria-pressed"] });
    // fonts arriving changes nothing colour-wise; images loading can reveal lazily styled nodes
    window.addEventListener("load", function () { processRoots([document.body]); });
  }

  window.__anvSetTheme = function (t) {
    theme = t === "light" ? "light" : "dark";
    P = PAL[theme];
    document.documentElement.classList.add("anv-notrans");
    for (var i = 0; i < touched.length; i++) restore(touched[i]);
    touched = [];
    onAccentSet = new WeakSet();
    ensureStyle();
    processRoots([document.body]);
  };

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
true;
`;
