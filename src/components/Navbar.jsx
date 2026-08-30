import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

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

// Mobile Safari (and some Android browsers) have a real, documented history
// of unreliable onClick on touch — the safest fix is to explicitly own
// both input paths through one handler rather than hope the browser's
// touch-to-click synthesis behaves. Calling preventDefault() inside
// onTouchEnd suppresses the compatibility click event the browser would
// otherwise fire ~afterward, so exactly one of {onTouchEnd, onClick} ever
// actually runs per tap — never both, so this can't double-navigate or
// (worse, for the hamburger) double-toggle back to where it started.
const DEBUG_NAV = true;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleToggleHamburger = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((o) => {
      if (DEBUG_NAV) console.log("[nav] hamburger toggled ->", !o ? "open" : "closed");
      return !o;
    });
  };

  const handleNavClick = (e, path) => {
    e.preventDefault();
    e.stopPropagation();
    if (DEBUG_NAV) console.log("[nav] menu item tapped, navigating to:", path);
    setOpen(false);
    // navigate() after the close-menu state update has had a tick to
    // apply, rather than in the same synchronous handler. Repeated
    // automated testing (real TouchEvent dispatch, both localhost and two
    // separate production deploys) never reproduced a failure here, but
    // this costs nothing and removes any chance of the route change and
    // the menu-close re-render fighting over the same tick on a real
    // device this couldn't reproduce.
    setTimeout(() => {
      navigate(path);
      if (DEBUG_NAV) console.log("[nav] navigate() called for:", path);
    }, 100);
  };

  const handleBackdropClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
  };

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
          onTouchEnd={handleToggleHamburger}
        >
          <span className={open ? "nav-hamburger-line open" : "nav-hamburger-line"} />
          <span className={open ? "nav-hamburger-line open" : "nav-hamburger-line"} />
          <span className={open ? "nav-hamburger-line open" : "nav-hamburger-line"} />
        </button>
      </div>

      <div
        className={open ? "nav-mobile-backdrop open" : "nav-mobile-backdrop"}
        onClick={handleBackdropClose}
        onTouchEnd={handleBackdropClose}
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
            onClick={(e) => handleNavClick(e, item.to)}
            onTouchEnd={(e) => handleNavClick(e, item.to)}
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
          onClick={(e) => handleNavClick(e, "/explorer")}
          onTouchEnd={(e) => handleNavClick(e, "/explorer")}
        >
          Launch Explorer &rarr;
        </NavLink>
      </nav>
    </header>
  );
}
