import React from "react";
import { NavLink } from "react-router-dom";

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

export default function Navbar() {
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
      </div>
    </header>
  );
}
