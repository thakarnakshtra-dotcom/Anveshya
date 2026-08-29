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
            <h2 className="modules-heading">Real Imagery, Straight From NASA</h2>
            <p className="page-lede" style={{ margin: "0 0 34px" }}>
              Fetched live from NASA's public Image and Video Library &mdash; no stored copies, no fabricated
              credits.
            </p>
            <div className="missions-grid">
              {missions.map((m) => (
                <MissionCard key={m.name} name={m.name} query={m.query} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
