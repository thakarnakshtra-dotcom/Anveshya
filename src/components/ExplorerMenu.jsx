import React from "react";

// Explorer's landing screen — a menu of three peer experiences, rather
// than dropping straight into the Solar System with Panchanga/Andromeda
// tucked into its topbar as secondary buttons. All three routes below
// (?section=solar-system / nakshatras / andromeda) already existed;
// this only adds a front door that treats them as equal choices instead
// of implying the Solar System is the "main" one and the other two are
// afterthoughts.

const CARDS = [
  {
    section: "solar-system",
    title: "Solar System",
    tagline: "Real orbital mechanics",
    description: "Fly through an interactive 3D model of the Sun and eight planets, in visual or true scale.",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="12" cy="12" r="3.1" />
        <ellipse cx="12" cy="12" rx="10" ry="4.4" />
        <ellipse cx="12" cy="12" rx="6.2" ry="2.7" transform="rotate(28 12 12)" />
        <circle cx="21.4" cy="12" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    section: "nakshatras",
    title: "Panchanga Wheel",
    tagline: "27 nakshatras · 30 tithis",
    description: "An interactive Vedic sky wheel with the Moon's real position, computed live.",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="12" cy="12" r="9.2" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="12"
            y1="12"
            x2={12 + Math.cos((deg * Math.PI) / 180) * 8.6}
            y2={12 + Math.sin((deg * Math.PI) / 180) * 8.6}
          />
        ))}
      </svg>
    ),
  },
  {
    section: "andromeda",
    title: "Andromeda Galaxy",
    tagline: "M31 · 2.5 million ly away",
    description: "A procedural spiral galaxy — bulge, arms, and halo — with a real Hubble photo for reference.",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M12 12c0-3.9 3.1-7 7-7 2.8 0 5 2.2 5 5 0 2.2-1.8 4-4 4-1.7 0-3-1.3-3-3 0-1.2 1-2.2 2.2-2.2" />
        <path d="M12 12c0 3.9-3.1 7-7 7-2.8 0-5-2.2-5-5 0-2.2 1.8-4 4-4 1.7 0 3 1.3 3 3 0 1.2-1 2.2-2.2 2.2" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function ExplorerMenu({ onSelect }) {
  return (
    <div className="explorer-menu">
      <div className="explorer-menu-header">
        <span className="explorer-menu-eyebrow">Explore</span>
        <h1>Where do you want to go?</h1>
      </div>

      <div className="explorer-menu-grid">
        {CARDS.map((card) => (
          <button
            key={card.section}
            type="button"
            className="explorer-menu-card"
            onClick={() => onSelect(card.section)}
          >
            <span className="explorer-menu-card-icon">{card.icon}</span>
            <span className="explorer-menu-card-title">{card.title}</span>
            <span className="explorer-menu-card-tagline">{card.tagline}</span>
            <span className="explorer-menu-card-description">{card.description}</span>
            <span className="explorer-menu-card-cta">Launch &rarr;</span>
          </button>
        ))}
      </div>
    </div>
  );
}
