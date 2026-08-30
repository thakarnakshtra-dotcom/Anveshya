import React from "react";
import AmbientBackground from "../components/AmbientBackground.jsx";

const projects = [
  {
    kicker: "01",
    title: "Anveshya",
    body: "This platform — a 3D solar system explorer with real orbital mechanics, real NASA/USGS textures, and a growing library of verified missions, audio, and imagery from space agencies around the world.",
  },
  {
    kicker: "02",
    title: "SolarShield",
    body: "Space-weather risk intelligence for satellite operators and researchers — turning solar activity and geomagnetic data into a plain-language risk signal. In active development.",
  },
];

export default function About() {
  return (
    <main className="home">
      <AmbientBackground variant="page" />
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            About
          </div>
          <h1 className="page-heading">I'm Nakshtra Thakar. This Is Anveshya.</h1>
          <p className="page-lede">
            A self-taught developer and learner in Surat, Gujarat, building the space platform I always wanted to
            exist &mdash; accurate, honest, and free to explore.
          </p>
        </div>
      </section>

      <section className="modules-section">
        <div className="section-grid">
          <div className="section-eyebrow">01 &mdash; Why This Exists</div>
          <p className="page-lede" style={{ maxWidth: "70ch" }}>
            I've been fascinated by space since I was a kid, and I got tired of two extremes: content dumbed down
            past the point of being useful, or locked behind jargon built for researchers only. Anveshya is my
            attempt to sit in between &mdash; real orbital mechanics, real NASA imagery, and real space-weather
            science, built by one person, in the open, so a curious student and a working researcher can both get
            something out of it.
          </p>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">02 &mdash; What I'm Building</div>
          <div className="hero-cards" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {projects.map((p) => (
              <div key={p.kicker} className="hero-card">
                <div className="hero-card-kicker">{p.kicker}</div>
                <div className="hero-card-title">{p.title}</div>
                <div className="hero-card-body">{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">03 &mdash; The Vision</div>
          <p className="page-lede" style={{ maxWidth: "70ch" }}>
            India doesn't have a comprehensive, homegrown space exploration and education platform yet. I want
            Anveshya to become that &mdash; and eventually, a place that helps support India's growing private
            space ecosystem, not just explain it. That's a multi-year goal, not a launch-day promise, but it's the
            direction everything here is built toward.
          </p>
        </div>
      </section>

      <section className="metrics-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">04 &mdash; The Basics</div>
          <div>
            <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div>
                <div className="metric-label">Builder</div>
                <div className="metric-value">Nakshtra</div>
                <div className="metric-note">Solo, no team yet</div>
              </div>
              <div>
                <div className="metric-label">Based In</div>
                <div className="metric-value">Surat</div>
                <div className="metric-note">Gujarat, India</div>
              </div>
              <div>
                <div className="metric-label">Status</div>
                <div className="metric-value">Version 1</div>
                <div className="metric-note">Anveshya + SolarShield, actively shipping</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
