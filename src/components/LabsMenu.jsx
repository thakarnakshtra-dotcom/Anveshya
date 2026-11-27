import React from "react";
import { Link } from "react-router-dom";
import LabIcon from "../labs/icons.jsx";
import { labs } from "../labs/registry.js";
import AmbientBackground from "./AmbientBackground.jsx";
import BackgroundObjects from "./BackgroundObjects.jsx";
import ShootingStars from "./ShootingStars.jsx";

// Explore → Labs: choose one lab, which then opens full screen.
export default function LabsMenu({ onClose }) {
  return (
    <div className="explorer-menu labs-menu">
      <AmbientBackground variant="page" />
      <BackgroundObjects />
      <ShootingStars />
      <div className="explorer-menu-header">
        <span className="explorer-menu-eyebrow">Labs</span>
        <h1>Choose a lab</h1>
        <p>
          Labs are interactive physics pages where you can change values and watch what happens. Choose one; it opens
          full screen.
        </p>
        <button type="button" className="return-button" onClick={onClose}>
          &larr; Explore menu
        </button>
      </div>

      <div className="explorer-menu-grid">
        {labs.map((lab) => (
          <Link key={lab.slug} to={`/labs/${lab.slug}`} className="explorer-menu-card">
            <span className="explorer-menu-card-icon">
              <LabIcon slug={lab.slug} />
            </span>
            <span className="explorer-menu-card-title">{lab.title}</span>
            <span className="explorer-menu-card-tagline">{lab.category}</span>
            <span className="explorer-menu-card-description">{lab.description}</span>
            <span className="explorer-menu-card-cta">Open lab &rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
