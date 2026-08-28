import React from "react";

const beliefs = [
  {
    kicker: "01",
    title: "Real Data Only",
    body: "No fabricated numbers or placeholder stats — if something isn't live yet, the page says so.",
  },
  {
    kicker: "02",
    title: "Built in the Open",
    body: "SolarShield, Learn, and every other module ship as real, working pieces — not marketing mockups.",
  },
  {
    kicker: "03",
    title: "Open to Everyone",
    body: "Free to explore, whether you're a student, a researcher, or just curious about the sky.",
  },
];

export default function About() {
  return (
    <main className="home">
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            About
          </div>
          <h1 className="page-heading">Built By One Person, In The Open</h1>
          <p className="page-lede">
            Anveshya is a solo project &mdash; designed, built, and maintained by a BCA student in India who wanted
            a space platform that treats accuracy as a feature, not an afterthought.
          </p>
        </div>
      </section>

      <section className="modules-section">
        <div className="section-grid">
          <div className="section-eyebrow">01 &mdash; Why This Exists</div>
          <p className="page-lede" style={{ maxWidth: "70ch" }}>
            Most space content online is either dumbed down past the point of being useful, or locked behind jargon
            built for researchers only. Anveshya tries to sit in between: real orbital mechanics, real NASA imagery,
            and real space-weather science, presented so a curious student and a working researcher can both get
            something out of it.
          </p>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">02 &mdash; What Anveshya Believes</div>
          <div className="hero-cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {beliefs.map((b) => (
              <div key={b.kicker} className="hero-card">
                <div className="hero-card-kicker">{b.kicker}</div>
                <div className="hero-card-title">{b.title}</div>
                <div className="hero-card-body">{b.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="metrics-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">03 &mdash; The Basics</div>
          <div>
            <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div>
                <div className="metric-label">Builder</div>
                <div className="metric-value">Solo</div>
                <div className="metric-note">India-based</div>
              </div>
              <div>
                <div className="metric-label">Started</div>
                <div className="metric-value">2026</div>
                <div className="metric-note">Still early days</div>
              </div>
              <div>
                <div className="metric-label">Status</div>
                <div className="metric-value">Building</div>
                <div className="metric-note">Actively shipping modules</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
