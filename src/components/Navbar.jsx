import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/", end: true, icon: "M4 11.2 12 4.5l8 6.7V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" },
  { label: "Explore", to: "/explorer", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2.1 5-5 2.1 2.1-5z" },
  {
    label: "Learn",
    to: "/learn",
    icon: "M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z",
  },
  {
    label: "SolarShield",
    to: "/solarshield",
    icon: "M12 3 5 5.6v5.9c0 4 2.9 7.6 7 9.5 4.1-1.9 7-5.5 7-9.5V5.6zM12 8.6v6.8M8.9 12h6.2",
  },
  {
    label: "News",
    to: "/news",
    icon: "M4 4h13a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3zM8 9h8M8 13h8M8 17h4",
  },
  { label: "About", to: "/about", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 10.6V16M12 7.6h.01" },
];

// This file previously hand-rolled its own onTouchEnd + preventDefault +
// manual navigate() for every mobile menu link, on the theory that mobile
// browsers need extra help beyond a plain onClick. After repeated reports
// that taps still didn't navigate on a real phone, and repeated automated
// testing (real TouchEvent dispatch, three separate deploys) that could
// never reproduce it, the more likely explanation is that the custom
// handling was itself the problem — e.g. a passive touchend listener
// silently no-op'ing preventDefault() lets the browser's own compatibility
// click through afterward, and now two separate code paths (mine + the
// browser's default anchor navigation racing NavLink's own click handler)
// are both trying to navigate. NavLink already does the right thing with
// a plain onClick — preventDefault + history navigation — on every browser
// this app needs to support (confirmed by width=device-width in
// index.html, which removes the old 300ms tap-delay browsers used to need
// workarounds for). Closing the menu just piggybacks on the existing
// route-change effect below rather than needing its own handler at all.
const DEBUG_NAV = true;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route actually changes (not on
  // every render) so navigating never leaves it stuck open.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock page scroll behind the slide-out menu while it's open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const handleToggleHamburger = () => {
    setOpen((o) => {
      if (DEBUG_NAV) console.log("[nav] hamburger toggled ->", !o ? "open" : "closed");
      return !o;
    });
  };

  // Just close the menu — NavLink's own onClick already does
  // preventDefault + history navigation correctly on its own. The route
  // actually changing is what the useEffect above is watching for, so
  // there's nothing left for this handler to do beyond that.
  const handleNavClick = () => setOpen(false);

  const handleBackdropClose = () => setOpen(false);

  return (
    <header className="site-header">
      <NavLink to="/" end className="site-logo" aria-label="Anveshya home">
        <span className="site-logo-badge">
          <span className="badge-ring" />
          <span className="badge-shine" />
          <span className="badge-arc" />
        </span>
        <span className="site-logo-text">Anveshya</span>
      </NavLink>

      <nav className="site-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) => (isActive ? "site-nav-link active" : "site-nav-link")}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="site-nav-icon"
            >
              <path d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="site-header-actions">
        <NavLink to="/explorer" className="site-launch">
          Launch
        </NavLink>
        <button
          type="button"
          className="nav-hamburger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
          onClick={handleToggleHamburger}
        >
          <span className={open ? "nav-hamburger-line open" : "nav-hamburger-line"} />
          <span className={open ? "nav-hamburger-line open" : "nav-hamburger-line"} />
          <span className={open ? "nav-hamburger-line open" : "nav-hamburger-line"} />
        </button>
      </div>

      <div
        className={open ? "nav-mobile-backdrop open" : "nav-mobile-backdrop"}
        onClick={handleBackdropClose}
        aria-hidden="true"
      />

      <nav
        id="mobile-nav-menu"
        className={open ? "nav-mobile-menu open" : "nav-mobile-menu"}
        aria-hidden={!open}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? "nav-mobile-link active" : "nav-mobile-link")}
            tabIndex={open ? 0 : -1}
            onClick={handleNavClick}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/explorer"
          className="nav-mobile-launch"
          tabIndex={open ? 0 : -1}
          onClick={handleNavClick}
        >
          Launch Explorer &rarr;
        </NavLink>
      </nav>
    </header>
  );
}
