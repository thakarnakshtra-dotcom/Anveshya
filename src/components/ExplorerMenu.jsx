import React from "react";
import AmbientBackground from "./AmbientBackground.jsx";
import ShootingStars from "./ShootingStars.jsx";
import BackgroundObjects from "./BackgroundObjects.jsx";

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
  {
    section: "spacetime",
    title: "Spacetime Fabric",
    tagline: "General relativity · gravity",
    description: "How mass curves spacetime, bends light, and slows time — interactive, with the real formulas behind it.",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M2 8c3 0 4 1.5 6 1.5S11 8 12 8s3 1.5 5 1.5S20 8 22 8" />
        <path d="M2 12.5c3 0 4 1.5 6 1.5s3-1.5 4-1.5 3 1.5 5 1.5 3-1.5 5-1.5" />
        <path d="M2 17c3 0 4 1.5 6 1.5s3-1.5 4-1.5 3 1.5 5 1.5 3-1.5 5-1.5" />
        <circle cx="12" cy="12.5" r="3.4" fill="currentColor" stroke="none" opacity="0.85" />
      </svg>
    ),
  },
  {
    section: "saptarshi",
    title: "Saptarshi",
    tagline: "The Big Dipper · 7 sages",
    description: "The seven brightest stars of Ursa Major, connected and identified — with the real Pointer Stars to Polaris.",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M4 15.5 8 12l3 2 3.5-3.5L18 12l2-5.5" />
        <circle cx="4" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="8" cy="12" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="11" cy="14" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="18" cy="12" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="20" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function ExplorerMenu({ onSelect }) {
  return (
    <div className="explorer-menu">
      {/* This is the one part of Explorer that's a flat page like Learn/
          About/News, not a 3D scene — App.jsx blanket-excludes these
          decorations (and the custom cursor, footer) from every
          /explorer route because the other three views already have
          their own 3D starfield/canvas, where a second decorative
          layer underneath would be wasted paint. That exclusion doesn't
          apply here, so this menu renders its own copies directly
          rather than complicating App.jsx's route-level flags with
          this one sub-state. */}
      <AmbientBackground variant="page" />
      <BackgroundObjects />
      <ShootingStars />
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
