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

// The mobile menu links were NavLink (a real <a href>) through several
// previous passes, each time verified working via this session's own
// automated testing yet still reported broken on a real phone. The
// remaining, untested-until-now suspect: this stylesheet sets
// `-webkit-user-select: none` globally on every `a` (see styles.css,
// originally added to stop stray text-selection highlighting on tap) —
// there's a real, documented history of WebKit/iOS Safari not reliably
// delivering click events on anchors with that property set, especially
// on nested icon+label children like these. Automated Chromium-based
// testing in this environment can't reproduce a WebKit-only bug, so
// rather than keep re-verifying a theory this tooling structurally can't
// disprove, the mobile menu items are now plain <button> elements —
// buttons have no such history, no href to fight over, and no need for
// preventDefault at all, which removes the entire suspect class of bug
// regardless of whether the diagnosis above is exactly right.
const DEBUG_NAV = true;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isItemActive = (item) =>
    item.end ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

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

  const handleMenuItemClick = (path) => {
    if (DEBUG_NAV) console.log("[nav] menu item clicked:", path);
    setOpen(false);
    navigate(path);
    window.scrollTo(0, 0);
  };

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
          <button
            key={item.to}
            type="button"
            className={isItemActive(item) ? "nav-mobile-link active" : "nav-mobile-link"}
            tabIndex={open ? 0 : -1}
            onClick={() => handleMenuItemClick(item.to)}
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
          </button>
        ))}
        <button
          type="button"
          className="nav-mobile-launch"
          tabIndex={open ? 0 : -1}
          onClick={() => handleMenuItemClick("/explorer")}
        >
          Launch Explorer &rarr;
        </button>
      </nav>
    </header>
  );
}
