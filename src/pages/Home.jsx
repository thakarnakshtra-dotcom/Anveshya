import React from "react";
import { Link } from "react-router-dom";

const heroCards = [
  { kicker: "01", title: "Real Orbital Mechanics", body: "Accurate relative speeds, distances, and scale across all eight planets." },
  { kicker: "02", title: "NASA Imagery", body: "Real planetary textures sourced from NASA and JPL mission data." },
  { kicker: "03", title: "Live Space Weather", body: "Space-weather intelligence built for researchers and satellite operators." },
];

const modules = [
  {
    no: "01",
    title: "Explore",
    to: "/explorer",
    body: "Fly through a real-time 3D solar system with accurate orbital mechanics and true NASA textures.",
    icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2.1 5-5 2.1 2.1-5z",
  },
  {
    no: "02",
    title: "Learn",
    to: "/learn",
    body: "Written lessons on orbital mechanics, solar activity, and how to read the Explorer.",
    icon: "M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z",
  },
  {
    no: "03",
    title: "SolarShield",
    to: "/solarshield",
    body: "Space-weather risk intelligence for satellite operators and researchers, in active development.",
    icon: "M12 3 5 5.6v5.9c0 4 2.9 7.6 7 9.5 4.1-1.9 7-5.5 7-9.5V5.6zM12 8.6v6.8M8.9 12h6.2",
  },
  {
    no: "04",
    title: "About",
    to: "/about",
    body: "The story behind Anveshya — solo-built, India-based, open about what's real and what's still being built.",
    icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 10.6V16M12 7.6h.01",
  },
];

const metrics = [
  { label: "Planets Modeled", value: "8", note: "Mercury through Neptune" },
  { label: "Moons Rendered", value: "18", note: "Real names, real facts" },
  { label: "Scale Modes", value: "2", note: "Visual & true-to-scale" },
  { label: "Status", value: "Building", note: "SolarShield in development" },
];

export default function Home({ introActive = false }) {
  const veilAnim = introActive ? "an-veil 3.6s ease forwards" : "none";
  const chromeAnim = introActive ? "an-chrome 4.1s ease forwards" : "none";

  return (
    <main className="home">
      {/* ---- ambient background layers ---- */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: "radial-gradient(1500px 900px at 50% 42%, rgba(255,255,255,.05), transparent 68%), #000000",
        }}
      />
      <div
        style={{
          position: "fixed",
          left: "6%",
          top: "16%",
          width: "min(520px,45vw)",
          height: 190,
          pointerEvents: "none",
          zIndex: 0,
          transform: "rotate(-22deg)",
          filter: "blur(16px)",
          opacity: 0.5,
          background: "radial-gradient(closest-side, rgba(226,231,244,.22), rgba(150,164,196,.08) 46%, transparent 74%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          right: "9%",
          top: "62%",
          width: "min(300px,28vw)",
          height: 110,
          pointerEvents: "none",
          zIndex: 0,
          transform: "rotate(14deg)",
          filter: "blur(13px)",
          opacity: 0.35,
          background: "radial-gradient(closest-side, rgba(214,222,238,.18), transparent 72%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          right: "6%",
          top: "70%",
          width: 84,
          height: 84,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.6,
          background: "radial-gradient(circle at 34% 30%, #b9c0cd 0%, #7d8595 30%, #3a4050 62%, #090b10 88%)",
          boxShadow: "inset -14px -10px 26px rgba(0,0,0,.85), 0 0 26px rgba(180,196,230,.1)",
        }}
      />
      <div
        style={{
          position: "fixed",
          left: "11%",
          top: "26%",
          width: 34,
          height: 34,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.45,
          background: "radial-gradient(circle at 38% 34%, #a8b0be 0%, #565d6b 45%, #080a0e 85%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: "-20%",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.95,
          animation: "an-drift 120s linear infinite alternate",
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 20px 30px, rgba(255,255,255,.95), transparent 60%), radial-gradient(1.1px 1.1px at 130px 90px, rgba(226,236,255,.75), transparent 60%), radial-gradient(1.9px 1.9px at 300px 220px, rgba(255,255,255,.6), transparent 60%), radial-gradient(1px 1px at 420px 60px, rgba(255,255,255,.55), transparent 60%), radial-gradient(1.2px 1.2px at 90px 400px, rgba(255,255,255,.5), transparent 60%), radial-gradient(1px 1px at 520px 330px, rgba(214,228,255,.45), transparent 60%)",
          backgroundSize: "340px 300px, 250px 230px, 520px 460px, 470px 380px, 300px 520px, 610px 480px",
        }}
      />

      <div className="intro-veil" style={{ animation: veilAnim }} />

      {/* ---- hero ---- */}
      <section className="home-hero">
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            transform: "translate(-50%,-50%)",
            width: "min(1180px,100vw,152vh)",
            aspectRatio: "2/1",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "62%",
              height: "120%",
              background: "radial-gradient(closest-side, rgba(255,255,255,.13), rgba(190,205,235,.05) 48%, transparent 74%)",
              filter: "blur(14px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: "inset(0 0 50.2% 0)",
              WebkitMask: "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
              mask: "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "92%",
                aspectRatio: "1",
                transform: "translate(-50%,-50%) perspective(1700px) rotateX(85.6deg)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  animation: "an-spin 34s linear infinite",
                  background:
                    "conic-gradient(from 0deg, rgba(255,255,255,.10), rgba(255,255,255,1) 9%, rgba(232,236,244,.62) 18%, rgba(255,255,255,.96) 29%, rgba(206,212,224,.5) 38%, rgba(255,255,255,1) 49%, rgba(222,228,240,.55) 60%, rgba(255,255,255,.92) 71%, rgba(198,206,220,.45) 80%, rgba(255,255,255,1) 90%, rgba(255,255,255,.10))",
                  WebkitMask:
                    "radial-gradient(closest-side, transparent 40%, rgba(0,0,0,.3) 45%, #000 50%, #000 84%, rgba(0,0,0,.35) 93%, transparent 100%)",
                  mask: "radial-gradient(closest-side, transparent 27%, rgba(0,0,0,.25) 30%, #000 34%, #000 82%, rgba(0,0,0,.4) 92%, transparent 100%)",
                  filter: "blur(.7px) contrast(1.32) saturate(0)",
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "20%",
              aspectRatio: "1",
              borderRadius: "50%",
              background: "#000",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,.55), 0 0 0 2.6px rgba(255,255,255,.96), 0 0 22px 5px rgba(255,255,255,.4), 0 0 70px 16px rgba(210,224,255,.22)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "26%",
              aspectRatio: "1",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,.26)",
              filter: "blur(1.4px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "45%",
              aspectRatio: "1.95",
              border: "3px solid rgba(255,255,255,.98)",
              borderRadius: "50%",
              clipPath: "inset(0 0 62% 0)",
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "56%",
              aspectRatio: "2.5",
              border: "1.8px solid rgba(244,247,255,.85)",
              borderRadius: "50%",
              clipPath: "inset(0 0 64% 0)",
              filter: "blur(1.6px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "68%",
              aspectRatio: "3",
              border: "1.2px solid rgba(226,233,248,.55)",
              borderRadius: "50%",
              clipPath: "inset(0 0 66% 0)",
              filter: "blur(2.2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "43%",
              aspectRatio: "2",
              border: "2.2px solid rgba(255,255,255,.92)",
              borderRadius: "50%",
              clipPath: "inset(66% 0 0 0)",
              filter: "blur(1.2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "54%",
              aspectRatio: "2.6",
              border: "1.2px solid rgba(230,237,250,.6)",
              borderRadius: "50%",
              clipPath: "inset(68% 0 0 0)",
              filter: "blur(2px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: "inset(50.2% 0 0 0)",
              WebkitMask: "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
              mask: "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "92%",
                aspectRatio: "1",
                transform: "translate(-50%,-50%) perspective(1700px) rotateX(85.6deg)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  animation: "an-spin 34s linear infinite",
                  background:
                    "conic-gradient(from 0deg, rgba(255,255,255,.10), rgba(255,255,255,1) 9%, rgba(232,236,244,.62) 18%, rgba(255,255,255,.96) 29%, rgba(206,212,224,.5) 38%, rgba(255,255,255,1) 49%, rgba(222,228,240,.55) 60%, rgba(255,255,255,.92) 71%, rgba(198,206,220,.45) 80%, rgba(255,255,255,1) 90%, rgba(255,255,255,.10))",
                  WebkitMask:
                    "radial-gradient(closest-side, transparent 40%, rgba(0,0,0,.3) 45%, #000 50%, #000 84%, rgba(0,0,0,.35) 93%, transparent 100%)",
                  mask: "radial-gradient(closest-side, transparent 27%, rgba(0,0,0,.25) 30%, #000 34%, #000 82%, rgba(0,0,0,.4) 92%, transparent 100%)",
                  filter: "blur(.7px) contrast(1.32) saturate(0)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="hero-grid" style={{ animation: chromeAnim }}>
          <div>
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-rule" />
              An Independent Space Platform
            </div>
            <h1 className="hero-headline">
              Explore the Universe
              <br />
              <span className="hero-headline-muted">one orbit at a time</span>
            </h1>
            <p className="hero-sub">
              Anveshya turns real orbital mechanics and NASA imagery into an interactive solar system you can fly
              through.
            </p>
          </div>

          <div className="hero-cards">
            {heroCards.map((card) => (
              <div key={card.kicker} className="hero-card">
                <div className="hero-card-kicker">{card.kicker}</div>
                <div className="hero-card-title">{card.title}</div>
                <div className="hero-card-body">{card.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- modules ---- */}
      <section className="modules-section">
        <div className="section-grid">
          <div className="section-eyebrow">01 &mdash; Modules</div>
          <div>
            <h2 className="modules-heading">Everything Anveshya Offers</h2>
            <div className="modules-grid">
              {modules.map((mod) => (
                <Link key={mod.no} to={mod.to} className="module-card">
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
                      <path d={mod.icon} />
                    </svg>
                    <span className="module-no">{mod.no}</span>
                  </div>
                  <div className="module-title">{mod.title}</div>
                  <div className="module-body">{mod.body}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- live data ---- */}
      <section className="metrics-section">
        <div className="section-grid">
          <div className="section-eyebrow">02 &mdash; Live data</div>
          <div>
            <div className="metrics-grid">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="metric-label">{m.label}</div>
                  <div className="metric-value">{m.value}</div>
                  <div className="metric-note">{m.note}</div>
                </div>
              ))}
            </div>
            <p className="metrics-caption">
              Every number above reflects what's actually built in Anveshya today &mdash; no placeholder data.
              SolarShield's live space-weather feed is the next major addition.
            </p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>Anveshya &mdash; Explore the Universe</span>
        <span>Built in India &middot; Open to the world</span>
      </footer>
    </main>
  );
}
