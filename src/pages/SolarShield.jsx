import React, { useState } from "react";

const audiences = [
  {
    kicker: "01",
    title: "Satellite Operators",
    body: "Track geomagnetic storm risk and solar flare activity that can disrupt orbits, communications, and onboard electronics.",
  },
  {
    kicker: "02",
    title: "Researchers & Scientists",
    body: "Access structured space-weather context alongside Anveshya's orbital data for research and teaching.",
  },
  {
    kicker: "03",
    title: "Agencies & Mission Planners",
    body: "Evaluate launch-window and mission-timeline risk from solar activity forecasts.",
  },
];

const capabilities = [
  {
    no: "01",
    title: "Solar Flares",
    body: "Classification and timing of X, M, and C-class flare events as they're detected.",
    icon: "M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  },
  {
    no: "02",
    title: "Geomagnetic Storms",
    body: "Kp-index tracking and storm-severity alerts for satellite and ground-system risk.",
    icon: "M12 3 5 5.6v5.9c0 4 2.9 7.6 7 9.5 4.1-1.9 7-5.5 7-9.5V5.6zM12 8.6v6.8M8.9 12h6.2",
  },
  {
    no: "03",
    title: "CME Tracking",
    body: "Coronal mass ejection trajectories and estimated Earth-arrival windows.",
    icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2.1 5-5 2.1 2.1-5z",
  },
  {
    no: "04",
    title: "Risk Scoring",
    body: "A single, plain-language risk score built from live solar and geomagnetic inputs.",
    icon: "M9 11.2 12 14l6.5-6.5M20 12a8 8 0 1 1-4.4-7.1",
  },
];

function encode(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&");
}

function NotifyForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "solarshield-waitlist", email }),
      });
      if (!res.ok) throw new Error(`Form submission failed (${res.status})`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return <p className="notify-status">Thanks &mdash; we'll be in touch when SolarShield opens up.</p>;
  }

  return (
    <form
      name="solarshield-waitlist"
      method="post"
      data-netlify="true"
      className="notify-form"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="solarshield-waitlist" />
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="notify-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "submitting"}
      />
      <button type="submit" className="site-launch notify-submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Notify Me"}
      </button>
      {status === "error" ? (
        <p className="notify-status notify-status-error">Something went wrong &mdash; please try again.</p>
      ) : null}
    </form>
  );
}

export default function SolarShield() {
  return (
    <main className="home">
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            SolarShield
          </div>
          <h1 className="page-heading">Space Weather Risk Intelligence</h1>
          <p className="page-lede">
            SolarShield turns solar activity and geomagnetic data into clear, actionable risk signals for the
            people who operate and study spacecraft &mdash; before a storm becomes a problem.
          </p>
        </div>
      </section>

      <section className="modules-section">
        <div className="section-grid">
          <div className="section-eyebrow">01 &mdash; Who It's For</div>
          <div className="hero-cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {audiences.map((a) => (
              <div key={a.kicker} className="hero-card">
                <div className="hero-card-kicker">{a.kicker}</div>
                <div className="hero-card-title">{a.title}</div>
                <div className="hero-card-body">{a.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">02 &mdash; What It Monitors</div>
          <div>
            <div className="modules-grid">
              {capabilities.map((c) => (
                <div key={c.no} className="module-card">
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
                      <path d={c.icon} />
                    </svg>
                    <span className="module-no">{c.no}</span>
                  </div>
                  <div className="module-title">{c.title}</div>
                  <div className="module-body">{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">03 &mdash; Status</div>
          <div>
            <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <div>
                <div className="metric-label">Development Stage</div>
                <div className="metric-value">Building</div>
                <div className="metric-note">Data pipeline & risk models underway</div>
              </div>
              <div>
                <div className="metric-label">Live Data</div>
                <div className="metric-value">Not Yet</div>
                <div className="metric-note">This page is the explainer, not the feed</div>
              </div>
            </div>
            <p className="metrics-caption">
              SolarShield doesn't have a live feed yet &mdash; this page describes what's being built. Leave your
              email below and we'll let you know the moment it opens up.
            </p>
          </div>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0, paddingBottom: 100 }}>
        <div className="section-grid">
          <div className="section-eyebrow">04 &mdash; Get Notified</div>
          <div>
            <h2 className="modules-heading">Be First When SolarShield Ships</h2>
            <NotifyForm />
          </div>
        </div>
      </section>
    </main>
  );
}
