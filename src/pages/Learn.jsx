import React from "react";
import { Link } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground.jsx";
import MissionCard from "../components/MissionCard.jsx";
import { missions } from "../data/missions.js";

export default function Learn() {
  return (
    <main className="home">
      <AmbientBackground variant="page" />
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            Learn
          </div>
          <h1 className="page-heading">Astronomy, Explained Simply</h1>
          <p className="page-lede">
            Written lessons on orbital mechanics, solar activity, and how to read the Explorer are still being
            written. In the meantime, walk through a real planet page &mdash;{" "}
            <Link to="/learn/earth">see the Earth preview</Link>.
          </p>
        </div>
      </section>

      <section className="modules-section">
        <div className="section-grid">
          <div className="section-eyebrow">03 &mdash; Historic Missions</div>
          <div>
            <h2 className="modules-heading">Real Imagery, From Five Space Agencies</h2>
            <p className="page-lede" style={{ margin: "0 0 34px" }}>
              Fetched live from NASA's public Image and Video Library &mdash; no stored copies, no fabricated
              credits. Each card's badge shows which agency owns the mission; the credit line shows who actually
              took the photo, which isn't always the same agency.
            </p>
            <div className="missions-grid">
              {missions.map((m) => (
                <MissionCard key={m.name} name={m.name} query={m.query} agency={m.agency} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">04 &mdash; Sounds of Space</div>
          <div>
            <h2 className="modules-heading">Real Audio From Real Missions</h2>
            <p className="page-lede" style={{ margin: "0 0 26px" }}>
              Rover microphones, black-hole data turned into music, and the actual recordings of "one small step"
              and "Houston, we've had a problem."
            </p>
            <Link to="/learn/sounds" className="module-card" style={{ maxWidth: 420 }}>
              <div className="module-card-top">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9DB9F2"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
                <span className="module-no">14 tracks</span>
              </div>
              <div className="module-title">Sounds and Voices of Space</div>
              <div className="module-body">
                Rover audio, NASA sonifications of nebulae and black holes, and historic mission recordings.
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
